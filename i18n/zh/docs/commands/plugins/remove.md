---
description: |
  `packer plugins remove` 命令删除已安装 Packer 插件的一个或多个版本。
title: packer plugin remove 命令参考
---

# `packer plugins remove` 命令参考

`packer plugins remove` 子命令删除已安装 Packer 插件的一个或多个版本。

该命令足够灵活，可以一次删除所有版本或一次只删除单个版本。
- 如果指定了插件的源地址但没有版本约束，则该插件的所有版本都将被删除。
- 如果指定了版本约束，则只会删除指定的版本。
- 如果指定了插件的直接路径，则只会删除指定的版本。

有关用法的详细信息，请参阅下面的示例。
```shellsession
To remove a plugin matching a version constraint for the current OS and architecture.

  packer plugins remove github.com/hashicorp/happycloud v1.2.3

To remove all versions of a plugin for the current OS and architecture omit the version constraint.

  packer plugins remove github.com/hashicorp/happycloud

To remove a single plugin binary from the Packer plugin directory specify the absolute path to an installed binary. This syntax does not allow for version matching.

  packer plugins remove ~/.config/plugins/github.com/hashicorp/happycloud/packer-plugin-happycloud_v1.0.0_x5.0_linux_amd64
```

## 删除所有已安装的插件

`plugins remove` 命令可以与 `plugins installed` 命令结合使用，通过将 `plugins installed` 的结果管道传输到 `plugins removed` 来删除所有 Packer 插件。

在安装了 xargs 的基于 Unix 的操作系统上，你可以使用以下命令删除所有插件版本：
```shellsession
~>  packer plugins installed | xargs -n1 packer plugins remove
~/.config/packer/plugins/github.com/hashicorp/amazon/packer-plugin-amazon_v1.3.2_x5.0_darwin_arm64
~/.config/packer/plugins/github.com/hashicorp/azure/packer-plugin-azure_v2.1.3_x5.0_darwin_arm64
```

## 相关命令

- [`packer init`](/docs/commands/init) 将安装所有必需的插件。
- [`packer plugins install`](/docs/commands/plugins/install) 将安装单个插件。
