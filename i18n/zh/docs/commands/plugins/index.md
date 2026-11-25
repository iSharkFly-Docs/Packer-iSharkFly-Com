---
description: |
  `packer plugins` 命令组包含用于管理 Packer 插件的子命令。
title: packer plugins 命令参考
---

# `packer plugins` 命令参考

`plugins` 命令组包含用于安装、卸载和查看 Packer 插件的子命令。

```shellsession
$ packer plugins -h
Usage: packer plugins <subcommand> [options] [args]
  This command groups subcommands for interacting with Packer plugins.

Related but not under the "plugins" command :

- "packer init <path>" will install all plugins required by a config.

Subcommands:
    install      Install latest Packer plugin [matching version constraint]
    installed    List all installed Packer plugin binaries
    remove       Remove Packer plugins [matching a version]
    required     List plugins required by a config
```

## 相关命令

- [`packer init`](/docs/commands/init) 将安装所有必需的插件。
