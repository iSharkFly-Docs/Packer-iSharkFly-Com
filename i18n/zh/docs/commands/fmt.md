---
description: |
  `packer fmt` Packer 命令将 HCL2 配置文件格式化为规范的格式和样式，帮助你防止编码错误。
title: packer fmt 命令参考
---

# `packer fmt` 命令参考

`packer fmt` Packer 命令用于将 HCL2 配置文件格式化为规范的格式和样式。JSON 文件（.json）不会被修改。此命令应用 HCL 语言样式约定的子集，以及其他一些可读性方面的微调。

`packer fmt` 将显示需要格式化的配置文件的名称，并将任何格式化的更改写回原始配置文件。

示例用法：

检查配置文件是否需要格式化，但不写入更改。

```shellsession
$ packer fmt -check .
my-template.pkr.hcl

```

格式化配置文件，将更改写回原始文件。

```shellsession
$ packer fmt my-template.pkr.hcl
my-template.pkr.hcl

```

格式化多个配置文件，将更改写回各自的原始文件。

```shellsession
$ packer fmt my-template.pkr.hcl my-varfile.pkrvars.hcl
my-template.pkr.hcl
my-varfile.pkrvars.hcl

```

格式化配置文件，从 stdin 读取并写入 stdout。

```shellsession
$ packer fmt -

// 你可以使用管道将此功能与其他命令行选项结合
$ cat my-template.pkr.hcl | packer fmt -
```

## 选项

- `-check` - 检查输入是否已格式化。如果所有输入都已正确格式化，退出状态将为 0，否则为非零。

- `-diff` - 显示任何格式化更改的差异

- `-write=false` - 不将格式化更改写入源文件（使用 -check 时始终禁用）

- `-` - 从 stdin 读取格式化更改并将其写入 stdout。

- `-recursive` 还处理子目录中的文件。默认情况下，仅处理给定目录（或当前目录）。
