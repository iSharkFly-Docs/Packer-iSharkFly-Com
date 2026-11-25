---
description: |
    `packer init` 命令下载并安装 Packer 模板中指定的插件。
title: packer init 命令参考
---

# `packer init` 命令参考

::: info
从 2025 年 8 月 1 日起，许多官方 HashiCorp 维护的 Packer 插件的源将从 GitHub releases 迁移到官方 HashiCorp 发布站点 [releases.hashicorp.com](https://releases.hashicorp.com)。有关更多信息，请参阅[安装 HashiCorp 维护的插件](/docs/plugins/install#install-hashicorp-maintained-plugins)。
:::


`packer init` 命令根据 HCL 模板配置初始化 Packer。有关安装插件的更多信息，请参阅[安装插件](/docs/plugins/install)。

## 描述

使用 `packer init` 命令根据用 HCL 编写的 Packer 模板中的 `required_plugins` 块下载和安装插件。有关配置 `required_plugins` 块的更多信息，请参阅模板配置参考中的[指定插件要求](/docs/templates/hcl_templates/blocks/packer#specifying-plugin-requirements)。

不支持旧版 JSON 模板。你可以使用 [hcl2_upgrade](/docs/commands/hcl2_upgrade) 命令将 JSON 模板文件转换为 HCL。

我们建议在使用新模板或现有模板时，将 `packer init` 命令作为第一步运行。你可以多次运行该命令。后续运行可能会产生错误，但该命令永远不会删除已安装的插件。

### 第三方插件验证

我们建议你审查和验证任何要安装的第三方插件。

### 安装位置

默认情况下，Packer 在 Unix 上将插件安装到 `$HOME/.config/packer/plugins` 目录，在 Windows 上安装到 `%APPDATA%\packer.d\plugins` 目录，但你可以使用 `PACKER_PLUGIN_PATH` 环境变量指定不同的目录。有关更多信息，请参阅 [Packer 配置参考](/docs/configure)。

## 用法

使用以下语法运行 `packer init` 命令：

```shellsession
$ packer init <path-to-template>
```
该命令将处理任何以 `pkr.hcl` 结尾的模板文件。

在单个模板文件上运行命令时，模板必须包含所有依赖项。如果模板打算作为部分文件的捆绑包构建，该命令将失败。

对于变量定义，建议使用扩展名 `.pkrvars.hcl` 或 `.auto.pkrvars.hcl`。当你在目录中运行 `packer init` 时，这些变量定义文件将自动从处理中排除。

## 示例

以下示例从当前目录安装模板中指定的插件：

```shellsession
$ packer init .
```

以下示例从当前目录安装名为 `template.pkr.hcl` 的模板中指定的插件：
```shellsession
$ packer init template.pkr.hcl
```

以下示例安装 `builds/foo/` 目录中指定的插件：

```shellsession
$ packer init builds/foo/.
```

以下示例从 `builds/foo/template.pkr.hcl` 路径安装模板中指定的插件：

```shellsession
$ packer init builds/foo/template.pkr.hcl
```

## 参数

你可以传递以下参数：

- Packer 模板：指定 HCL2 模板的路径或包含至少一个有效 HCL2 模板及相关依赖项的目录。

## 选项

- `-upgrade`：使用此选项将已安装的插件升级到最新可用版本。Packer 根据模板中指定的版本约束升级到最新版本。
- `-force`：使用此选项强制 Packer 重新安装插件。
