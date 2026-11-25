---
description: |
  `packer plugins install` 命令手动下载和安装 Packer 插件，而无需更新和初始化构建模板。
title: packer plugins install 命令参考
---

# `packer plugins install` 命令参考

::: info
从 2025 年 8 月 1 日起，许多官方 HashiCorp 维护的 Packer 插件的源将从 GitHub releases 迁移到官方 HashiCorp 发布站点 [releases.hashicorp.com](https://releases.hashicorp.com)。有关更多信息，请参阅[安装 HashiCorp 维护的插件](/docs/plugins/install#install-hashicorp-maintained-plugins)。
:::

`packer plugins install` 命令下载并安装插件二进制文件的最新版本。有关安装插件的更多信息，请参阅[安装插件](/docs/plugins/install)。

## 描述

使用 `packer plugins install` 命令手动安装插件，而不是在模板中指定插件并初始化 Packer。有关在初始化期间安装 Packer 模板中指定的插件的信息，请参阅 [`packer init` 命令文档](/docs/commands/init)。

### 第三方插件验证

HashiCorp 仅验证来自 GitHub `hashicorp/*` 命名空间下的插件。我们建议你审查和验证任何要安装的第三方插件。

### 安装目录

默认情况下，Packer 在 Unix 上将插件安装到 `$HOME/.config/packer/plugins` 目录，在 Windows 上安装到 `%APPDATA%\packer.d\plugins` 目录，但你可以使用 `PACKER_PLUGIN_PATH` 环境变量指定不同的目录。
插件安装需要访问 `TMPDIR` 下的临时文件。如果系统的临时目录不可写或不可执行，请使用 TMPDIR 覆盖 Packer 使用的临时文件存储位置。
有关更多信息，请参阅 [Packer 配置参考](/docs/configure)。

## 用法

使用以下语法运行 `packer plugins install` 命令：

## 示例

指定版本号以安装插件的特定版本。以下示例从远程源安装 `my-plugin` 的 `1.0.1` 版本：

```shellsession
$ packer plugins install github.com/hashicorp/my-plugin 1.0.1
```

使用 `--path` 选项指定本地插件二进制文件。以下示例从本地二进制文件安装 `my-plugin`：

```shellsession
$ packer plugins install --path my-plugin github.com/hashicorp/my-plugin
```

## 参数

你可以传递以下参数：

- `<plugin-binary-source>`：插件二进制文件可用的远程源。插件必须托管在 GitHub 上或提供所需插件源目录结构的 HTTPS 端点上。对于本地来源的二进制文件，你还必须包含 `--path` 选项。有关安装插件的更多信息，请参阅[安装插件](/docs/plugins/install)。
- `<plugin version>`：要下载和安装的插件的特定版本。Packer 接受遵循 `<major>.<minor>.<patch>` 格式的语义版本号。如果省略，该命令将安装最新的插件版本。

## 选项

你可以使用以下选项：

`--path`：使用此选项指定本地插件二进制文件。你必须使用此选项从本地源安装插件。
`--force`：使用此选项强制 Packer 重新安装插件。
