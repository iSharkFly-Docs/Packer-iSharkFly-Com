---
title: strrev 函数参考
description: >-
  `strrev` 函数反转字符串中字符的顺序。
---

# `strrev` 函数

`strrev` 反转给定字符串中的字符。

请注意，这些字符是 _Unicode 字素_，而不是 UTF-8 编码的字节。此函数正确处理多码点字素、变音符号和其他附加标记。

```shellsession
> strrev("hello")
olleh
> strrev("a]ä")
ä]a
```
