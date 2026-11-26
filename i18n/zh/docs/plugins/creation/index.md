---
description: |
  了解如何通过为构建器、配置器和后处理器创建自定义插件来扩展 Packer。
title: 创建自定义插件以扩展 Packer 概述
---

# 创建自定义插件以扩展 Packer

Packer 是可扩展的，支持让你创建和使用自定义构建器、配置器、后处理器和数据源的插件。本页面介绍如何开发 Packer 插件。在开始之前，我们建议先查阅 Packer 文档和[安装外部插件](/docs/plugins/install)的说明。

::: warning
**警告** 这是一个高级主题。在开始编写插件之前，你应该对 Packer 有深入的了解。
:::

## 语言要求

你必须使用 [Go](https://go.dev/) 编写 Packer 插件。


## 插件系统架构

Packer 插件只是一个 Go 二进制文件。Packer 不是将插件直接加载到正在运行的应用程序中，而是将每个插件作为 _独立的应用程序_ 运行。多个独立的 Packer 插件进程使用 packer-plugin SDK 中定义的 RPC 与核心进行通信。Packer 核心本身负责启动和清理插件进程。

## 插件开发基础

可以在 Packer 插件中创建和使用的组件包括构建器、配置器、后处理器和数据源。

每个组件都有对应的[接口](https://go.dev/doc/effective_go.html#interfaces_and_types)。

创建插件只需要做两件事：

1. 创建所需接口的实现，以及
2. 使用 [packer-plugin-sdk](https://github.com/hashicorp/packer-plugin-sdk) 中提供的服务器来提供服务。

核心和 SDK 在服务器内部处理所有通信细节。

你的插件必须使用 SDK 中的两个包来实现服务器和接口。我们鼓励你在插件实现中使用任何你想要的其他包。由于插件是独立的进程，不存在依赖冲突的风险。

- [`github.com/hashicorp/packer-plugin-sdk/packer`](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer) - 包含你必须为任何给定插件实现的所有接口。

- [`github.com/hashicorp/packer-plugin-sdk/plugin`](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/plugin) - 包含用于提供插件服务的代码。这处理所有进程间通信。

下面展示了提供组件服务的基本示例。

```go
// main.go

import (
  "github.com/hashicorp/packer-plugin-sdk/plugin"
)

// 假设这实现了 packer.Builder 接口
type ExampleBuilder struct{}

// 假设这实现了 packer.PostProcessor 接口
type FooPostProcessor struct{}

// 假设这实现了 packer.Provisioner 接口
type BarProvisioner struct{}

func main() {
	pps := plugin.NewSet()
	pps.RegisterBuilder("example", new(ExampleBuilder))
	pps.RegisterBuilder(plugin.DEFAULT_NAME, new(AnotherBuilder))
	pps.RegisterPostProcessor("foo", new(FooPostProcessor))
	pps.RegisterProvisioner("bar", new(BarProvisioner))
	err := pps.Run()
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}
```

这个 `plugin.NewSet` 调用处理了与 Packer 核心通信和通过 RPC 提供组件服务的所有细节。只要你注册的结构体实现了某个组件接口，Packer 现在就能够启动你的插件并使用它。

如果你用组件自己的名称注册它，组件名称将附加到插件名称以创建唯一的名称。如果你使用特殊的字符串常量 `plugin.DEFAULT_NAME` 注册组件，那么该组件将仅使用插件名称来引用。例如：

如果你的插件名为 `packer-plugin-my`，上面的集合定义将使以下组件可用：

- `my-example` 构建器
- `my` 构建器
- `my-foo` 后处理器
- `my-bar` 配置器

接下来，像构建任何其他 Go 应用程序一样构建你的插件。生成的二进制文件就是可以使用[标准安装程序](/docs/plugins/#installing-plugins)安装的插件。

本文档解释了如何实现每种类型的插件接口：构建器、数据源、配置器和后处理器。

::: warning
**锁定你的依赖！** 强烈建议使用 `go mod`，因为 Packer 代码库将继续改进，在稳定版本发布之前可能会破坏 API。通过锁定依赖，你的插件将继续与你锁定的 Packer 版本一起工作。
:::

## 日志记录和调试

插件可以使用标准 Go `log` 包进行日志记录。使用此包记录的任何内容都将自动出现在 Packer 日志文件中。当设置了 `PACKER_LOG` 环境变量时，Packer 日志在 stderr 上可见。

Packer 会在来自插件的任何日志前加上该插件的路径前缀，以便识别日志来源。下面展示了一些示例日志：

```txt
2013/06/10 21:44:43 Loading builder: custom
2013/06/10 21:44:43 packer-builder-custom: 2013/06/10 21:44:43 Plugin minimum port: 10000
2013/06/10 21:44:43 packer-builder-custom: 2013/06/10 21:44:43 Plugin maximum port: 25000
2013/06/10 21:44:43 packer-builder-custom: 2013/06/10 21:44:43 Plugin address: :10000
```

如你所见，来自自定义构建器插件的日志消息以 "packer-builder-custom" 为前缀。日志输出在调试问题时 _极其_ 有帮助，我们鼓励你根据需要尽可能详细地记录日志以使其有用。

### 创建 GitHub Release

`packer init` 不使用集中式注册表。相反，它要求你在 GitHub 仓库中发布你的插件，仓库名称为 `packer-plugin-*`，其中 \* 代表你的插件名称。你还需要创建一个包含特定资源的 GitHub release，以便 `packer init` 下载工作。我们提供了一个使用 [GitHub Actions](https://docs.github.com/en/free-pro-team@latest/actions) 的预定义发布工作流配置。我们强烈建议维护者使用此配置，以确保发布包含正确名称的正确资源，以便 Packer 利用 `packer init` 安装。

以下是使用 GitHub Actions 创建发布所需的内容：

1. 生成用于签署发布的 GPG 密钥（有关此步骤的帮助，请参阅 [GitHub 的详细说明](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-gpg-key)）
2. 将 [packer-plugin-scaffolding 仓库中的 GoReleaser 配置](https://github.com/hashicorp/packer-plugin-scaffolding/blob/main/.goreleaser.yml)复制到你仓库的根目录。
   ```sh
   curl -L -o .goreleaser.yml \
   https://raw.githubusercontent.com/hashicorp/packer-plugin-scaffolding/main/.goreleaser.yml
   ```
3. 将 [packer-plugin-scaffolding 仓库中的 GitHub Actions 工作流](https://github.com/hashicorp/packer-plugin-scaffolding/blob/main/.github/workflows/release.yml)复制到你仓库的 `.github/workflows/release.yml`。
   ```sh
   mkdir -p .github/workflows &&
   curl -L -o .github/workflows/release.yml \
   https://raw.githubusercontent.com/hashicorp/packer-plugin-scaffolding/main/.github/workflows/release.yml
   ```
4. 转到 GitHub 上的仓库页面并导航到 Settings > Secrets。添加以下密钥：
   - `GPG_PRIVATE_KEY` - 你的 ASCII 编码的 GPG 私钥。你可以使用 `gpg --armor --export-secret-keys [密钥 ID 或邮箱]` 导出。
   - `GPG_PASSPHRASE` - 你的 GPG 私钥密码。
5. 推送一个新的有效版本标签（例如 `v1.2.3`）以测试 GitHub Actions releaser 是否正常工作。标签必须是有效的[语义版本](https://semver.org/)，前面带有 `v`。一旦标签被推送，你刚配置的 GitHub Actions 将自动构建 Packer 可以使用 `packer init` 下载的发布二进制文件。有关如何使用 `packer init` 安装插件的更多详细信息，请参阅 [init 文档](/docs/commands/init)。

## 注册插件

::: warning
注意：将插件注册为集成需要文档与 [Scaffolding 示例布局](https://github.com/hashicorp/packer-plugin-scaffolding/tree/main/.web-docs)匹配。
:::

为了帮助发现 Packer 插件，插件维护者可以选择将其插件注册为 [Packer 集成](https://developer.hashicorp.com/packer/integrations)。

注册过程需要将[元数据配置](https://github.com/hashicorp/integration-template#metadata-configuration)添加到你的插件仓库，用于配置 Packer 集成管道，以及用于在 [Packer 集成](https://developer.hashicorp.com/packer/integrations)门户上呈现插件文档的特定目录结构。

你可以执行以下步骤将插件注册为集成：

1.  更新你的插件文档结构以匹配 [Scaffolding 示例布局](https://github.com/hashicorp/packer-plugin-scaffolding/tree/main/.web-docs)。
从此模板生成的新插件已经具有必要的结构。如果是这样，你可以跳到第 3 步。
1. 对于集成库，每个集成只支持一个顶级 README。插件现有文档中存在的任何顶级 index.mdx 文件都需要迁移到顶级 README。
1. 更新你的顶级集成 README，包括描述、插件安装步骤、可用组件部分，以及告知用户如何使用你的集成所需的任何其他部分。有关示例，请参阅 [Packer scaffolding 插件](https://github.com/hashicorp/packer-plugin-scaffolding/blob/main/docs/README.md)。
1. 更新集成中每个组件的顶级 README，以遵循 scaffolding 模板中定义的结构。
1. 将集成配置文件 [metadata.hcl](https://github.com/hashicorp/packer-plugin-scaffolding/blob/main/.web-docs/metadata.hcl) 添加到插件的 `.web-docs` 目录。
1. 向 Packer 团队提交集成请求问题 - [提交请求](https://github.com/hashicorp/packer/issues/new?labels=new-plugin-contribution&template=plugin_integration.md)。
提供所有请求的信息以帮助加快集成请求。

#### [示例] 向现有插件仓库添加集成文件

```shell
## 使用集成配置、工作流和脚本更新插件仓库
cd packer-plugin-name
mkdir -p .web-docs/scripts

# 下载 packer-plugin-scaffolding 仓库并复制文件
wget https://github.com/hashicorp/packer-plugin-scaffolding/archive/refs/heads/main.zip
unzip main.zip
cp packer-plugin-scaffolding-main/.web-docs/metadata.hcl .web-docs/
cp -r packer-plugin-scaffolding-main/.web-docs/scripts/ .web-docs/scripts/
cp packer-plugin-scaffolding-main/.github/workflows/notify-integration-release-via-* .github/workflows/

# 删除下载的 scaffolding 项目
rm main.zip
rm -rf packer-plugin-scaffolding-main

# 将以下命令添加到你的插件 GNUmakefile
generate: install-packer-sdc
    @go generate ./...
    @rm -rf .docs
    @packer-sdc renderdocs -src docs -partials docs-partials/ -dst .docs/
    @./.web-docs/scripts/compile-to-webdocs.sh "." ".docs" ".web-docs" "<orgname>"
    @rm -r ".docs"
```

通过提交集成请求，你正在请求 Packer 团队成员审查你的插件集成配置、插件文档，最后打开内部拉取请求以完成集成设置。

插件集成将作为 [Packer 集成](https://developer.hashicorp.com/packer/integrations)列出，其中包含如何安装和使用你的插件的详细信息。

插件集成一旦部署，可以由插件作者在新版本发布时手动或自动更新。对定义的文档结构或父仓库的更改应与 Packer 团队沟通，以确保集成管道正常工作。

## 插件开发技巧和常见问题

### 工作示例

以下是一些你可以查看的 Packer 插件的非详尽列表：

- [github.com/hashicorp/packer-plugin-docker](https://github.com/hashicorp/packer-plugin-docker)
- [github.com/exoscale/packer-plugin-exoscale](https://github.com/exoscale/packer-plugin-exoscale)
- [github.com/sylviamoss/packer-plugin-comment](https://github.com/sylviamoss/packer-plugin-comment)

查看它们的代码将为你提供很好的示例。

### 命名约定

标准做法是以 `packer-plugin-NAME` 的格式命名生成的插件应用程序。例如，如果你正在为 CustomCloud 构建一个新的构建器，标准做法是将生成的插件命名为 `packer-plugin-customcloud`。这种命名约定有助于用户识别插件的范围。

### 测试插件

要从本地源安装插件，你可以使用带有 `--path` 标志的 `packer plugins install` 命令：

```shellsession
$ packer plugins install --path <path-to-binary> <hostname>/<namespace>/<plugin-name>
```

例如，让我们从本地源二进制文件安装 happycloud 插件

```shellsession
$ packer plugins install --path packer-plugin-happycloud github.com/hashicorp/happycloud
```

这将从 `packer-plugin-happycloud` 二进制文件安装 happycloud 插件，以便 Packer 可以发现它。
如果你想在 HCL2 模板中使用它，你可以选择将其添加到 `required_plugins` 部分，如下所示：

```hcl
  required_plugins {
    happycloud = {
      source = "github.com/hashicorp/happycloud"
      version = ">=0.0.1"
  }
}
```

有关 Packer 如何发现和加载插件的更多信息，你可以参阅我们关于该主题的[文档](/docs/plugins/creation/plugin-load-spec)。

### 分发插件

我们建议你使用 GoReleaser 等工具为 Packer 支持的每个平台交叉编译你的插件，因为 Go 应用程序是特定于平台的。如果你从 [packer-plugin-scaffolding](https://github.com/hashicorp/packer-plugin-scaffolding) 仓库创建了你的插件，只需标记一个提交并将标签推送到 GitHub，就会使用 GoReleaser 正确构建和发布二进制文件。
