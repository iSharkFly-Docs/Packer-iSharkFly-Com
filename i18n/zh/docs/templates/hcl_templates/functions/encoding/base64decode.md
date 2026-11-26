---
title: base64decode 函数参考
description: '`base64decode` 函数解码 base64 编码的字符串。'
---

# `base64decode` 函数

`base64decode` 接受一个包含 Base64 字符序列的字符串并返回原始字符串。

Packer 使用 [RFC 4648 第 4 节](https://tools.ietf.org/html/rfc4648#section-4) 中定义的"标准"Base64 字母表。

Packer 语言中的字符串是 unicode 字符序列而不是字节，因此此函数也会将结果字节解释为 UTF-8。如果 Base64 解码后的字节_不是_有效的 UTF-8，此函数将产生错误。

虽然我们不建议在 Packer 语言中操作大型原始二进制数据，但 Base64 编码是表示任意字节序列的标准方式，因此接受或返回二进制数据的资源类型将自己使用 Base64，这在大多数情况下避免了直接编码或解码的需要。名称中包含"base64"的各种其他函数可以直接生成或操作 Base64 数据。

## 示例

```shellsession
> base64decode("SGVsbG8gV29ybGQ=")
Hello World
```

## 相关函数

- [`base64encode`](/docs/templates/hcl_templates/functions/encoding/base64encode) 执行相反的操作，将字符串的 UTF-8 字节编码为 Base64。
