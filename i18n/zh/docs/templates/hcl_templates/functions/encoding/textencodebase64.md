---
title: textencodebase64 函数参考
description: '`textencodebase64` 函数将 UTF-8 NFC 字符串转换为 base64 blob 以匹配目标编码。'
---

# `textencodebase64` 函数

将输入字符串编码为目标编码。输出是 base64 编码的，以考虑 HCL 的字符串编码限制：它们必须是 UTF-8、NFC 规范化的。

Packer 使用 [RFC 4648 第 4 节](https://tools.ietf.org/html/rfc4648#section-4) 中定义的标准 base64 字母表。

`encoding_name` 参数必须包含 [IANA 字符编码注册表](https://www.iana.org/assignments/character-sets/character-sets.xhtml) 中记录的编码名称或别名之一。

## 示例

```shellsession
# 用法: textencodebase64(input_string, encoding_name)
> textencodebase64("Hello World", "UTF-16LE")
SABlAGwAbABvACAAVwBvAHIAbABkAA==
```

## 相关函数

- [`base64encode`](/docs/templates/hcl_templates/functions/encoding/base64encode) 执行相反的操作，将字符串的 UTF-8 字节编码为 Base64。
