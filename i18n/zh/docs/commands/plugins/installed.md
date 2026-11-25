---
description: |
  `packer plugins installed` 命令列出已安装的 Packer 插件。
title: packer plugins installed 命令参考
---

# `packer plugins installed` 命令参考

`plugins installed` 子命令列出已安装的 Packer 插件。

```shellsession
$ packer plugins installed -h
Usage: packer plugins installed

  This command lists all installed plugin binaries that match with the current
  OS and architecture. Packer's API version will be ignored.
```

## 相关命令

- [`packer init`](/docs/commands/init) 将安装所有必需的插件。
