---
title: md5 函数参考
description: |-
  `md5` 函数计算给定字符串的 MD5 哈希值并用十六进制数字编码。了解如何在 Packer 模板中使用 `md5` 函数。
---

# `md5` 函数

`md5` 计算给定字符串的 MD5 哈希值并用十六进制数字编码。

给定的字符串首先编码为 UTF-8，然后按照 [RFC 1321](https://tools.ietf.org/html/rfc1321) 中定义的方式应用 MD5 算法。原始哈希值在返回之前编码为小写十六进制数字。

在将此函数用于任何安全敏感的用途之前，请参阅 [RFC 6151](https://tools.ietf.org/html/rfc6151) 了解适用于 MD5 算法的最新安全注意事项。

## 示例

```shellsession
> md5("hello world")
5eb63bbbe01eeed093cb22bb8f5acdc3
```
