---
title: base64encode 函数参考
description: '`base64encode` 函数将字符串编码为 base64 格式。'
---

# `base64encode` 函数

`base64encode` 对字符串应用 Base64 编码。

Packer 使用 [RFC 4648 第 4 节](https://tools.ietf.org/html/rfc4648#section-4) 中定义的"标准"Base64 字母表。

Packer 语言中的字符串是 unicode 字符序列而不是字节，因此此函数会首先将字符串中的字符编码为 UTF-8，然后对结果应用 Base64 编码。

Packer 语言对所有字符串应用 Unicode 规范化，因此通过 `base64decode` 然后 `base64encode` 传递字符串可能不会产生完全相同的原始结果。

虽然我们不建议在 Packer 语言中操作大型原始二进制数据，但 Base64 编码是表示任意字节序列的标准方式，因此接受或返回二进制数据的资源类型将自己使用 Base64，所以此函数主要用于允许将字符串数据轻松提供给期望 Base64 字节的资源类型。

## 示例

```shellsession
> base64encode("Hello World")
SGVsbG8gV29ybGQ=
```

## 相关函数

- [`base64decode`](/docs/templates/hcl_templates/functions/encoding/base64decode) 执行相反的操作，解码 Base64 数据并将其解释为 UTF-8 字符串。
