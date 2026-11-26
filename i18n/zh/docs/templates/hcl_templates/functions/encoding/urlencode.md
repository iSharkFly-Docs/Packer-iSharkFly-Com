---
title: urlencode 函数参考
description: '`urlencode` 函数对给定字符串应用 URL 编码。'
---

# `urlencode` 函数

`urlencode` 对给定字符串应用 URL 编码。

此函数识别给定字符串中当作为 URL 查询字符串参数包含时具有特殊含义的字符，并使用 [RFC 3986 "百分号编码"](https://tools.ietf.org/html/rfc3986#section-2.1) 对它们进行转义。

转义的确切字符集可能会随时间变化，但结果保证可以插入到查询字符串参数中，而不会无意中引入额外的分隔符。

如果给定字符串包含非 ASCII 字符，这些字符首先被编码为 UTF-8，然后对每个 UTF-8 字节分别应用百分号编码。

## 示例

```shellsession
> urlencode("Hello World")
Hello%20World
> urlencode("☃")
%E2%98%83
> "http://example.com/search?q=${urlencode("packer urlencode")}"
http://example.com/search?q=packer%20urlencode
```
