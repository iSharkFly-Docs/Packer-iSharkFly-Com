---
description: |
  你可以安装插件来扩展 Packer 功能。了解如何安装外部插件。
title: 安装插件
---

# 安装插件

::: info
从 2025 年 8 月 1 日开始，许多官方 HashiCorp 维护的 Packer 插件的来源正在从 GitHub releases 迁移到官方 HashiCorp 发布站点 [releases.hashicorp.com](https://releases.hashicorp.com)。有关更多信息，请参阅[安装 HashiCorp 维护的插件](#安装-hashicorp-维护的插件)。
:::

本文描述如何为 Packer 安装外部插件。有关插件的更多信息，请参阅 [Packer 插件概述](/docs/plugins/)。

## 概述

在 Packer 模板中指定一个或多个所需的插件并运行初始化命令。在初始化期间，Packer 查询源仓库以获取模板中指定的与主机操作系统版本约束匹配的插件。Packer 下载并安装模板中指定的插件和其他依赖项。

你可以指定 GitHub 或其他分发插件的主机上的远程项目，让 Packer 从那里安装插件。有关从远程源安装插件的更多信息，请参阅[要求](#要求)。

当你运行 Packer 模板时，Packer 首先检查目录中是否有与模板中指定的版本要求匹配的已安装插件。如果没有安装合适版本的插件，Packer 会打印错误。Packer 从 `source` 配置下载所需的版本。

### 手动安装方法

如果你无法在 HCL 模板文件中指定插件，可以手动安装插件。如果你的插件仍在开发中，可能需要使用手动插件安装方法。

使用 `packer plugins install` 命令手动安装插件。你指定本地或远程插件源，并包含二进制文件的路径以生成在 Packer 构建期间加载插件所需的 SHA256SUM 文件。有关从远程源安装插件的更多信息，请参阅[要求](#要求)。

请注意，当你使用模板构建制品时，Packer 会根据 Packer 模板中的 `required_plugins` 块检查插件安装目录。已手动安装的模板中指定的插件仍必须符合模板中设置的版本约束。


### 安装目录

默认情况下，Packer 将插件安装到 Unix 上的 `$HOME/.config/packer/plugins` 和 Windows 上的 `%APPDATA%\packer.d\plugins` 插件目录中，但你可以使用 `PACKER_PLUGIN_PATH` 环境变量指定不同的目录。

::: info
插件安装需要访问 `TMPDIR` 下的临时文件。如果系统的临时目录不可写或不可执行，请使用 TMPDIR 覆盖 Packer 使用的临时文件存储的位置。有关更多信息，请参阅 [Packer 配置参考](/docs/configure)。
:::

## 要求

要从 GitHub 安装插件，插件必须满足以下要求：

- 仓库必须命名为 `packer-plugin-<name>`。
- 项目必须具有以下格式的语义版本标签：`v<major>.<minor>.<patch>`。
- 链接到标签的发布版本必须可用，并带有指示发布中可用文件的 `shasums` 文件。

要从 `github.com` 以外的主机安装插件，主机必须使用[托管你自己的插件源](#托管你自己的插件源)中描述的目录结构通过 HTTPS 提供插件文件。

### GitHub API 令牌

GitHub 的公共 API 限制每小时来自单个 IP 地址的未经身份验证请求的数量。有关更多信息，请参阅 [GitHub 速率限制文档](https://docs.github.com/en/developers/apps/rate-limits-for-github-apps#normal-user-to-server-rate-limits)。

如果你预计会超过请求速率限制，可以使用 GitHub API 令牌来验证请求并超过速率限制。我们建议在从持续集成服务器运行 Packer 时设置 GitHub API 令牌，以避免潜在的速率限制错误。有关说明，请参阅[向 GitHub API 验证请求](#向-github-api-验证请求)。

## 安装插件

1. 在你的 Packer 模板文件中，将 `required_plugins` 块添加到 `packer` 块中。
1. 指定插件的名称及其 `version` 和 `source` 参数。设置正确的[版本约束字符串](/docs/templates/hcl_templates/blocks/packer#version-constraints)对于固定插件版本以实现构建可重现性很重要。有关更多信息，请参阅 [`packer` 块配置参考](/docs/templates/hcl_templates/blocks/packer)。

   以下示例配置 Packer 安装名为 `happycloud` 的插件。当模板初始化时，Packer 从 GitHub 下载 2.7.0 或更新版本的插件：

    ```hcl
    packer {
      required_plugins {
        happycloud = {
          version = ">= 2.7.0"
          source = "github.com/hashicorp/happycloud"
        }
      }
    }

    ```

1. 运行 `packer init` 命令。Packer 列出所有已安装的插件，然后安装与 `required_plugins` 块中指定的版本约束匹配的最新插件版本。有关更多信息，请参阅 [`init` 命令参考](/docs/commands/init)。

## 安装 HashiCorp 维护的插件

HashiCorp 现在通过 [HashiCorp 发布站点](https://releases.hashicorp.com/)提供以下官方 HashiCorp 维护的插件。

这些插件包括：

- [Amazon](https://developer.hashicorp.com/packer/integrations/hashicorp/amazon)
- [Ansible](https://developer.hashicorp.com/packer/integrations/hashicorp/ansible)
- [Azure](https://developer.hashicorp.com/packer/integrations/hashicorp/azure)
- [Docker](https://developer.hashicorp.com/packer/integrations/hashicorp/docker)
- [Google Cloud Platform](https://developer.hashicorp.com/packer/integrations/hashicorp/googlecompute)
- [QEMU](https://developer.hashicorp.com/packer/integrations/hashicorp/qemu)
- [Vagrant](https://developer.hashicorp.com/packer/integrations/hashicorp/vagrant)
- [VirtualBox](https://developer.hashicorp.com/packer/integrations/hashicorp/virtualbox)

从 Packer 1.14.0 开始，Packer 自动从新的发布源安装这些插件，你不需要对 Packer 模板进行任何更改。要继续自动接收这些插件的更新，你必须升级到 Packer 1.14.0 或更新版本。如果你无法升级 Packer 版本，仍然可以手动安装这些插件的新版本。有关更多信息，请参阅[使用 CLI 手动安装插件](#使用-cli-手动安装插件)。

## 托管你自己的插件源

你可以从你管理的基础设施安装插件，例如内部镜像或制品仓库。在插件的 `source` 地址中指定主机和路径，例如 `plugins.example.com/mirror/hashicorp/happycloud`。主机必须在源的路径下通过 HTTPS 提供以下目录结构：

```txt
packer-plugin-happycloud/index.json
packer-plugin-happycloud/<version>/packer-plugin-happycloud_<version>_SHA256SUMS
packer-plugin-happycloud/<version>/<SHA256SUMS 文件中列出的 zip 文件>
```

这与 [releases.hashicorp.com](https://releases.hashicorp.com) 提供的目录结构相同。Packer 获取 `index.json` 以发现可用版本，选择与模板约束匹配的版本，然后下载主机平台的插件 zip 并根据版本的 `SHA256SUMS` 文件验证它。

版本目录名称不包含 `v` 前缀。当版本目录中的 zip 文件名不包含插件协议版本时，例如 `packer-plugin-happycloud_1.0.0_linux_amd64.zip`，该目录还必须包含版本的 `packer-plugin-happycloud_1.0.0_manifest.json` 文件，如在 releases.hashicorp.com 上发布的那样。清单提供文件名省略的协议版本。

### 从 releases.hashicorp.com 镜像插件

从 releases.hashicorp.com 复制插件的目录树而不进行修改，例如使用 `wget --mirror` 或 `rsync`。所有验证制品，包括 `SHA256SUMS` 文件、其签名以及每个版本的 `manifest.json`，与 HashiCorp 发布的文件保持字节相同。

### 镜像作为 GitHub 发布资产发布的插件

对于你想提供的插件的每个版本，完成以下步骤：

1. 创建一个没有 `v` 前缀的版本目录，例如 `packer-plugin-happycloud/1.0.0/`。
1. 将 GitHub 发布中的 zip 文件复制到该目录中。
1. 将发布的 `SHA256SUMS` 文件复制到该目录中，从文件名中的版本中删除 `v` 前缀。例如，`packer-plugin-happycloud_v1.0.0_SHA256SUMS` 变为 `packer-plugin-happycloud_1.0.0_SHA256SUMS`。不要修改文件的内容。
1. 将版本添加到插件的 `index.json` 文件中。只需要版本键：

    ```json
    {
      "versions": {
        "1.0.0": {},
        "1.0.1": {}
      }
    }
    ```

GitHub 发布资产名称包含插件协议版本，因此这些版本不需要 `manifest.json` 文件。单个主机可以并排提供从 releases.hashicorp.com 镜像的内容和从 GitHub 发布镜像的内容，包括同一插件的不同版本。

### 限制

- 插件源始终通过 HTTPS 获取。不支持纯 HTTP。
- 主机的证书必须链接到操作系统信任存储中的证书颁发机构。一旦系统信任该 CA，内部 CA 颁发的证书不需要额外的 Packer 配置。
- 源地址中不支持带有端口号的主机名，例如 `plugins.example.com:8443`。
- Packer 不对插件源进行身份验证。

## 使用 CLI 手动安装插件

你可以使用 `packer plugins install` 命令手动安装插件二进制文件。使用 `--path` 标志指定本地源。然后 Packer 自动计算 SHA256SUM 文件并将文件安装到 Packer 插件目录中：

```shellsession
$ packer plugins install --path <path-to-downloaded-extracted-binary> <hostname>/<namespace>/<plugin-name>
```

以下示例从本地源二进制文件安装 `happycloud` 插件：

```shellsession
$ unzip packer-plugin-happycloud.zip
$ ls -l
-rwxr-xr-x [...] happycloud
$ packer plugins install --path happycloud github.com/hashicorp/happycloud
```

有关更多信息，请参阅 [`packer plugins install`](/docs/commands/plugins/install) 参考。

## 升级插件

要升级已安装的插件，使用 `--upgrade` 标志运行 `packer init`。Packer 检索模板配置中指定的已安装插件的最新版本。

以下示例根据当前目录中的模板升级插件：

```shellsession
$ packer init --upgrade .
```

有关更多信息，请参阅 [`packer init` 命令](/docs/commands/init)。

## 使用开发中的插件

如果开发二进制文件（例如手动构建的二进制文件）在指定的源可用，Packer 在构建中使用它，如果它是已安装的最高兼容版本，并且没有与其版本号相同的最终插件版本安装在旁边。

在以下示例中，需要 `1.1.0` 或更新版本：

```hcl
packer = {
    required_plugins = {
        amazon = {
            source = "github.com/hashicorp/amazon"
            version = ">= 1.1.0"
        }
    }

. . .

}
```

如果以下二进制文件可用，Packer 使用 Amazon 插件的 `-dev` 版本：

```shellsession
/Users/dev/.packer.d/plugins
└─ github.com
   └─ hashicorp
    	└── amazon
          ├── packer-plugin-amazon_v1.1.0_x5.0_darwin_arm64
          ├── packer-plugin-amazon_v1.1.0_x5.0_darwin_arm64_SHA256SUM
          ├── packer-plugin-amazon_v1.1.1-dev_x5.0_darwin_arm64
          └── packer-plugin-amazon_v1.1.1-dev_x5.0_darwin_arm64_SHA256SUM
```

当 1.1.1 的非开发版本可用时，该二进制文件优先于开发二进制文件：

```shellsession
/Users/dev/.packer.d/plugins
└─ github.com
   └─ hashicorp
    	└── amazon
          ├── packer-plugin-amazon_v1.1.1-dev_x5.0_darwin_arm64
          ├── packer-plugin-amazon_v1.1.1-dev_x5.0_darwin_arm64_SHA256SUM
          ├── packer-plugin-amazon_v1.1.1_x5.0_darwin_arm64
          └── packer-plugin-amazon_v1.1.1_x5.0_darwin_arm64_SHA256SUM
```

### Docker 插件示例

完成以下步骤以构建和安装 Docker 插件的自定义版本作为示例：

1. 克隆插件的 GitHub 仓库。

    ```shellsession
    $ git clone https://github.com/hashicorp/packer-plugin-docker.git
    ```

1. 切换到插件目录根目录并运行 `go build` 命令以将插件构建为开发二进制文件。

    ```shellsession
    $ cd packer-plugin-docker
    $ go build -ldflags="-X github.com/hashicorp/packer-plugin-docker/version.VersionPrerelease=dev" -o packer-plugin-docker-dev
    ```

1. 验证发布版本。

    ```shellsession
    $ ./packer-plugin-docker-dev describe
    {"version":"1.0.10-dev","sdk_version":"0.5.2","api_version":"x5.0","builders":["-packer-default-plugin-name-"],"post_processors":["import","push","save","tag"],"provisioners":[],"datasources":[]}
    ```

1. 使用 `packer plugins install` 命令安装开发二进制文件。

    ```shellsession
    packer plugins install --path packer-plugin-docker-dev github.com/hashicorp/docker
    Successfully installed plugin github.com/hashicorp/docker from $HOME/Development/packer-plugin-docker/packer-plugin-docker-dev to ~/github.com/hashicorp/docker/packer-plugin-docker_v1.0.10-dev_x5.0_darwin_arm64
    ```

1. 使用新安装的插件运行 `packer build`。

    ```shellsession
    $ packer build .
    ```

为方便起见，Packer 插件脚手架仓库中的 makefile 使用 `make dev` 构建和安装开发二进制文件。

有关更多信息，请参阅 [Packer 插件脚手架仓库](https://github.com/hashicorp/packer-plugin-scaffolding?tab=readme-ov-file#build-from-source)中的文档。

## 向 GitHub API 验证请求

你可以设置 `PACKER_GITHUB_API_TOKEN` 环境变量以发送比 GitHub API 施加的限制更多的每小时请求：

1. 转到你的个人[访问令牌页面](https://github.com/settings/tokens)以生成新令牌。
1. 将 `PACKER_GITHUB_API_TOKEN` 环境变量设置为你的令牌值：

    ```shellsession
    $ export PACKER_GITHUB_API_TOKEN=<token>
    ```
