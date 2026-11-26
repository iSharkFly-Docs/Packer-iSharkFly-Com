---
title: textdecodebase64 函数参考
description: '`textdecodebase64` 函数将 base64 编码的字符串转换为 UTF-8 字符串。'
---

# `textdecodebase64` 函数

将输入字符串从指定编码编码为 UTF-8。输入是 base64 编码的，以考虑 HCL 的字符串编码限制：它们必须是 UTF-8、NFC 规范化的。

Packer 使用 [RFC 4648 第 4 节](https://tools.ietf.org/html/rfc4648#section-4) 中定义的"标准"Base64 字母表。

`encoding_name` 参数必须包含 [IANA 字符编码注册表](https://www.iana.org/assignments/character-sets/character-sets.xhtml) 中记录的编码名称或别名之一。

## 示例

```shellsession
# 用法: textencodebase64(input_base64, encoding_name)
> textdecodebase64("SABlAGwAbABvACAAVwBvAHIAbABkAA==", "UTF-16LE")
Hello World
```

## 相关函数

- [`base64encode`](/docs/templates/hcl_templates/functions/encoding/base64encode) 执行相反的操作，将字符串的 UTF-8 字节编码为 Base64。
