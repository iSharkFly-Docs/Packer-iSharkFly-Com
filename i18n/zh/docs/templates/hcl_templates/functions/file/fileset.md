---
title: fileset 函数参考
description: '`fileset` 函数根据模式枚举一组常规文件名。了解如何在 Packer 模板中使用 `fileset` 函数。'
---

# `fileset` 函数

`fileset` 根据给定的路径和模式枚举一组常规文件名。路径会自动从结果文件名集中删除，任何仍包含路径分隔符的结果始终返回正斜杠（`/`）作为路径分隔符，以实现跨系统兼容性。

```hcl
fileset(path, pattern)
```

支持的模式匹配：

- `*` - 匹配任意非分隔符字符序列
- `**` - 匹配任意字符序列，包括分隔符字符
- `?` - 匹配任意单个非分隔符字符
- `{alternative1,...}` - 如果其中一个逗号分隔的替代项匹配，则匹配字符序列
- `[CLASS]` - 匹配字符类中的任意单个非分隔符字符（见下文）
- `[^CLASS]` - 匹配字符类外的任意单个非分隔符字符（见下文）

字符类支持以下内容：

- `[abc]` - 匹配集合中的任意单个字符
- `[a-z]` - 匹配范围内的任意单个字符

函数在配置解析期间求值，而不是在应用时求值，因此此函数只能用于在 Packer 采取任何操作之前磁盘上已存在的文件。

## 示例

```shellsession
> tree pkr-consul
pkr-consul
├── build-linux.pkr.hcl
└── linux
    ├── files
    │   ├── hello.txt
    │   └── world.txt
    └── scripts
        ├── script-1-install.sh
        └── script-2-setup.sh

3 directories, 5 files

> fileset(".", "*") | packer console pkr-consul
[
  "build-linux.pkr.hcl",
]

> echo 'fileset(".", "linux/scripts/*")' | packer console pkr-consul
[
  "linux/scripts/script-1-install.sh",
  "linux/scripts/script-2-setup.sh",
]

> echo 'fileset("linux", "files/{hello,world}.txt")' | packer console pkr-consul
[
  "files/hello.txt",
  "files/world.txt",
]

> echo 'fileset("./linux/files", "*")' | packer console pkr-consul
[
  "hello.txt",
  "world.txt",
]

> echo 'fileset("./linux", "**")' | packer console pkr-consul
[
  "files/hello.txt",
  "files/world.txt",
  "scripts/script-1-install.sh",
  "scripts/script-2-setup.sh",
]
```

`fileset` 的一个常见用途是将 `shell` 配置器的 `scripts` 字段设置为要运行的匹配脚本列表。

```hcl
build {
  sources = [
    "source.amazon-ebs.linux",
  ]

  provisioner "shell" {
    scripts = fileset(".", "linux/scripts/*")
  }
```

具有 `scripts` 字段的配置器列表：

- [`shell`](/docs/provisioners/shell)
- [`powershell`](/docs/provisioners/powershell)
- [`shell-local`](/docs/provisioners/shell-local)
- [`windows-shell`](/docs/provisioners/windows-shell)
