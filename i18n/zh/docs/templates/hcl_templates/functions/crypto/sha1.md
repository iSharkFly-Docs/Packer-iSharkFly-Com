---
title: sha1 函数参考
description: |-
  `sha1` 函数计算给定字符串的 SHA1 哈希值并用十六进制数字编码。了解如何在 Packer 模板中使用 `sha1` 函数。
---

# `sha1` 函数

`sha1` 计算给定字符串的 SHA1 哈希值并用十六进制数字编码。

给定的字符串首先编码为 UTF-8，然后按照 [RFC 3174](https://tools.ietf.org/html/rfc3174) 中定义的方式应用 SHA1 算法。原始哈希值在返回之前编码为小写十六进制数字。

针对此哈希函数已成功执行了碰撞攻击。在将此函数用于任何安全敏感的用途之前，请查阅相关文献以了解安全影响。

## 示例

```shellsession
> sha1("hello world")
2aae6c35c94fcfb415dbe95f408b9ce91ee846ed
```
