---
title: parseint 函数参考
description: >-
  `parseint` 函数将给定字符串解析为整数的表示形式。
---

# `parseint` 函数

`parseint` 将给定字符串解析为指定进制的整数表示形式，并返回结果数字。进制必须在 2 到 62（包含）之间。

所有进制首先使用阿拉伯数字 0 到 9。11 到 36（包含）的进制使用不区分大小写的拉丁字母来表示更高的位值。37 及更高的进制使用小写拉丁字母，然后是大写拉丁字母。

如果给定的字符串包含任何非数字字符或对于给定进制来说太大的数字字符，`parseint` 将产生错误。

## 示例

```shellsession
> parseint("100", 10)
100

> parseint("FF", 16)
255

> parseint("-10", 16)
-16

> parseint("1011111011101111", 2)
48879

> parseint("aA", 62)
656

> parseint("12", 2)

Error: Invalid function argument

Invalid value for "number" parameter: cannot parse "12" as a base 2 integer.
```

## 相关函数

- [`format`](/docs/templates/hcl_templates/functions/string/format) 可以将数字和其他值格式化为字符串，可选地进行零填充、对齐等。
