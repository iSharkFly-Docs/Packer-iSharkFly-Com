---
title: file 函数参考
description: |-
  `file` 函数读取文件的内容并将其作为字符串返回。了解如何在 Packer 模板中使用 `file` 函数。
---

# `file` 函数

`file` 读取给定路径下文件的内容，并将其作为字符串返回。

```hcl
file(path)
```

Packer 语言中的字符串是 Unicode 字符序列，因此此函数将文件内容解释为 UTF-8 编码的文本，并返回结果 Unicode 字符。如果文件包含无效的 UTF-8 序列，则此函数将产生错误。

此函数只能用于在 Packer 运行开始时磁盘上已存在的文件。函数不参与依赖图，因此此函数不能用于在 Packer 操作期间动态生成的文件。

## 示例

```shellsession
> file("${path.folder}/hello.txt")
Hello World
```

## 相关函数

- [`fileexists`](/docs/templates/hcl_templates/functions/file/fileexists) 确定给定路径下是否存在文件。
