---
title: base64gzip 函数参考
description: '`base64gzip` 函数使用 gzip 压缩给定字符串，然后将结果编码为 base64。'
---

# `base64gzip` 函数

`base64gzip` 使用 gzip 压缩字符串，然后将结果进行 Base64 编码。

Packer 使用 [RFC 4648 第 4 节](https://tools.ietf.org/html/rfc4648#section-4) 中定义的"标准"Base64 字母表。

Packer 语言中的字符串是 unicode 字符序列而不是字节，因此此函数会首先将字符串中的字符编码为 UTF-8，然后对结果应用 Base64 编码。

Packer 语言对所有字符串应用 Unicode 规范化，因此通过 `base64decode` 然后 `base64encode` 传递字符串可能不会产生完全相同的原始结果。

虽然我们不建议在 Packer 语言中操作大型原始二进制数据，但此函数可用于压缩在 Packer 语言中生成的合理大小的文本字符串。例如，此函数的结果可用于在 Amazon S3 中创建压缩对象作为 S3 网站的一部分。

## 相关函数

- [`base64decode`](/docs/templates/hcl_templates/functions/encoding/base64decode) 执行相反的操作，解码 Base64 数据并将其解释为 UTF-8 字符串。
