---
title: filebase64 - 函数 - 配置语言
description: |-
  filebase64 函数读取给定路径下文件的内容，并将其作为 base64 编码的字符串返回。
---

# `filebase64` 函数

`filebase64` 读取给定路径下文件的内容，并将其作为 base64 编码的字符串返回。

```hcl
filebase64(path)
```

结果是给定文件中原始字节的 Base64 表示。Packer 语言中的字符串是 Unicode 字符序列，因此 Base64 是表示无法解释为 Unicode 字符的原始二进制数据的标准方式。对二进制数据进行操作的资源类型将接受以 Base64 编码的这些数据，从而避免解码此函数结果的需要。

Packer 使用 [RFC 4648 第 4 节](https://tools.ietf.org/html/rfc4648#section-4)中定义的"标准"Base64 字母表。

此函数只能用于在 Packer 运行开始时磁盘上已作为静态文件存在的函数。语言函数不参与依赖图，因此此函数不能用于在 Packer 操作期间动态生成的文件。

## 示例

```
> filebase64("${path.module}/hello.txt")
SGVsbG8gV29ybGQ=
```

## 相关函数

* [`file`](/docs/templates/hcl_templates/functions/file/file) 也读取给定文件的内容，但将数据解释为 UTF-8 文本，并直接作为字符串返回结果，无需任何进一步编码。
* [`base64decode`](/docs/templates/hcl_templates/functions/encoding/base64decode) 可以解码表示 UTF-8 字节的 Base64 字符串，但实际上 `base64decode(filebase64(...))` 等同于更短的表达式 `file(...)`。
