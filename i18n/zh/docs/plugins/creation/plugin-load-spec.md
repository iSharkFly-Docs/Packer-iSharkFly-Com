---
description: |
  Packer 需要插件才能从模板构建制品。
  本页面解释了 Packer 如何发现和加载插件。
title: 插件加载 - 规范
---

# Packer 插件加载

本文档旨在说明 Packer 如何在本地文件系统上发现插件。这不是针对 Packer 初学者的，而是作为技术参考用于好奇心和故障排除目的。

如果你是 Packer 新手，建议从[安装插件](/docs/plugins/install)页面开始了解插件安装的详细信息。

## 插件来源

来源在概念上是插件的分发点。它是指向该位置的 URL。它旨在记录从哪里获取插件二进制文件，以及让 Packer 从该来源远程安装插件（如果兼容）。
如果 Packer 无法从该来源远程安装，仍然可以使用 `packer plugins install --path <path-to-binary> <source>` 安装插件。

从 Packer 1.11.0 开始，来源是安装插件的必需项。
来源还将反映插件在本地文件系统上的安装位置，作为一系列目录。

示例：`github.com/hashicorp/hashicups` 将导致以下目录树 `$HOME/.config/packer/plugins/github.com/hashicorp/hashicups`。


在声明来源时需要遵循一些约定：

* 没有协议（例如 `https://`）
* 没有片段（例如 `#section`）
* 没有查询（例如 `?page=1`）
* URL 必须至少包含一个主机和 URL 的两个部分。
* 除了主机之外，URL 不能超过 15 个部分。
* `/` 是来源可以使用的唯一分隔符。
* 完整的来源 URL 需要与你安装插件的文件系统兼容。Packer 不检查 URL 中不支持的字符，但如果无法创建有效的目录树则会报错。

来源 URL 的最后一部分是插件的名称。
它必须始终是插件的原始名称，不带 `packer` 或 `packer-plugin` 前缀。

**注意**：如果你的插件在 GitHub 上，仓库名称必须看起来像 `packer-plugin-<name>` 以便 Packer 能够找到它。但是，在模板或 CLI 中指定的来源地址必须排除 `packer-plugin-`。

示例：`https://github.com/hashicorp/packer-plugin-hashicups` 在声明为来源时将变成 `github.com/hashicorp/hashicups`。

## 根插件目录

插件需要安装在根插件目录下。
默认情况下将是以下之一：

**UNIX**：

* `$HOME/.packer.d/plugins`：这是插件的旧式安装目录。如果 `~/.packer.d` 存在，它将优先于以下目录。
* `$HOME/.config/packer/plugins`：这取代 `~/.packer.d`，如果不存在现有配置目录，Packer 将在首次使用时自动创建此目录。

**WINDOWS**：

* `%APPDATA%/packer.d/plugins`：这是 Windows 系统的唯一默认值。

如果你想更改该行为，有两个替代方案：

* `PACKER_CONFIG_DIR`：此环境变量允许你自定义配置目录的位置。插件安装在此配置目录的 `plugin` 子目录中。
* `PACKER_PLUGIN_PATH`：此环境变量允许你自定义插件的安装位置。这指向一个根插件目录，在该目录下将强制执行正常的目录层次结构。

**注意**：`PACKER_PLUGIN_PATH` 优先于 `PACKER_CONFIG_DIR`，如果定义了它，`PACKER_CONFIG_DIR` 将被忽略用于插件安装和加载。

有关环境变量的完整列表，请参阅[配置 Packer](/docs/configure)。

## 插件安装目录

所有插件必须安装在根插件目录下。
在此目录下，插件安装在与来源 URL 匹配的一系列目录下。

示例：`github.com/hashicorp/hashicups` 将转换为如下层次结构：

```shellsession
<plugin-root-dir>
└── github.com
    └── hashicorp
        └── hashicups
```

插件安装在该示例的叶子目录中。
每个插件版本必须每个版本只有一个二进制文件，并配有一个匹配的 SHA256SUM 文件用于该版本。SHA256SUM 文件的内容是插件二进制文件内容的 sha256 校验和的原始十六进制摘要。

### 插件二进制命名约定

为了让 Packer 发现和加载插件二进制文件，它必须符合以下命名约定：

`packer-plugin-<name>_<version>_<api_version>_<os>_<arch>[.exe]`

sha256sum 文件必须遵循相同的约定，名称后面加上 `SHA256SUM` 后缀：

`packer-plugin-<name>_<version>_<api_version>_<os>_<arch>[.exe]_SHA256SUM`

至于名称的组成部分，约定如下：

* `name`：插件的原始名称，它应该与父目录的名称匹配。例如：`hashicups`。
* `version`：插件的语义版本。它必须遵循约定 `v<major>.<minor>.<patch>[-<prerelease>]`。元数据信息不能是版本字符串的一部分。
* `api_version`：插件编译时使用的插件 API 版本。通常看起来像 `x<api_major>.<api_minor>`。
* `os`：插件构建所针对的操作系统。例如：`darwin`（macOS）、`windows`、`linux` 等。
* `arch`：插件构建所针对的微架构。例如：`arm64`、`amd64`、`386` 等。

注意：`.exe` 后缀仅用于 Windows 插件。任何其他操作系统不能在插件名称中添加后缀，否则 Packer 将忽略它。

## 加载过程

运行 `packer build` 或 `packer validate` 时，Packer 将尝试发现和加载插件以在模板上执行命令。

这分为两个阶段：

1. 加载显式必需的插件。
2. 发现其余已安装的插件。

显式必需的插件是 HCL2 的特性。
它们通过 `required_plugins` 块声明。
这些允许你在该插件需求上指定确切的来源和版本约束。

以这种方式声明的每个插件将优先于第二阶段收集的内容。

第二阶段是乐观地尝试发现其余已安装的插件。
插件的名称将从二进制文件的名称推断，不带 `packer-plugin-` 部分。

例如：如果安装了 `github.com/hashicorp/hashicups` 插件，并且在此阶段被发现，则此插件组件的每次使用都将以 `hashicups` 开头命名。

发现插件时，Packer 将执行其 `describe` 命令。
`describe` 命令展示插件的功能，并提供有关其各自版本和 API 版本的信息。

通常，这是你在插件上调用 `describe` 时可以看到的内容：

```shellsession
> $HOME/.packer.d/plugins/github.com/hashicorp/hashicups/packer-plugin-hashicups_v1.0.2_x5.0_linux_amd64 describe
{"version":"1.0.2","sdk_version":"0.5.1","api_version":"x5.0","builders":["order"],"post_processors":["receipt"],"provisioners":["toppings"],"datasources":["coffees","ingredients"]}
```

**注意**：插件描述输出中的信息必须与插件名称中指定的版本匹配。

总结一下，这是 Packer 在决定是否应将插件列为候选之前执行的检查列表：

* `describe` 报告的版本必须与插件名称中的版本匹配：即如果 `describe` 报告 v1.0.2 而二进制文件命名为 `v1.0.1`，Packer 拒绝它。
* 版本必须是规范的（版本必须是其最简单的表达式）：即 v1.00.01 是非规范的，v1.0.1 才是。任何具有此版本不匹配的插件都将被拒绝。
* API 版本必须在插件报告的内容和名称之间匹配：即如果 `describe` 报告 x5.1 而二进制文件包含 `x5.0`，Packer 拒绝它。
* 如果这是非最终版本，版本可能包含预发布片段。但是它必须是 `-dev`，其他任何内容都会被拒绝。

当安装了多个插件时，Packer 总是选择与潜在约束匹配的最高版本的那个。

如果版本基数相同，最终发布版本优先于预发布版本：`v1.0.0 < v1.0.1-dev < v1.0.1`。

### 已知限制

虽然显式发现确保你始终获得你想要的内容，但自动发现可能导致一致性问题。

例如，如果一个插件使用不同的来源安装了两次，Packer 将发现两者，但在请求此插件的组件时最终执行的插件是未定义的行为。

示例：

```shellsession
<plugin-root-dir>
├── github.com
│    └── hashicorp
│       └── hashicups
│          └── packer-plugin-hashicups_v1.0.2_x5.0_linux_amd64
└── gitlab.com
     └── hashicorp
        └── hashicups
           └── packer-plugin-hashicups_v1.0.2_x5.0_linux_amd64
```

在这种情况下，存在歧义问题，因为两个插件都是 `hashicups`，它们定义了一系列可能重叠的组件。
因此，在没有 `required_plugins` 来解决这种歧义的情况下使用 `hashicups-coffees` 数据源意味着执行两个插件中的一个，但不能保证是哪一个。
