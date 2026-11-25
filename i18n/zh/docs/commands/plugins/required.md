---
description: |
  `packer plugins required` 命令列出 Packer 配置所需的所有插件以及满足要求的任何已安装二进制文件。
title: packer plugins required 命令参考
---

# `packer plugins required` 命令参考

`plugins required` 命令列出 Packer 配置所需的所有插件以及匹配约束的所有已安装二进制文件。第一个二进制文件是最新安装的版本，将是 Packer 在构建中选择的版本。

```shellsession
$ packer plugins required -h
Usage: packer plugins required <path>

  This command will list every Packer plugin required by a Packer config, in
  packer.required_plugins blocks. All binaries matching the required version
  constrain and the current OS and Architecture will be listed. The most recent
  version (and the first of the list) will be the one picked by Packer during a
  build.


  Ex: packer plugins required require.pkr.hcl
  Ex: packer plugins required path/to/folder/
```

## 相关命令

- [`packer init`](/docs/commands/init) 将安装所有必需的插件。
