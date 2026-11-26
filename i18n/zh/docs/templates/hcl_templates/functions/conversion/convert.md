---
title: convert 函数参考
description: '`convert` 函数将值或表达式转换为给定类型。'
---

# `convert` 函数

`convert` 将值或表达式转换为给定类型。

在 HCL 中很少需要显式类型转换，因为它会在需要时自动转换类型。仅使用显式类型转换函数来规范化输出中返回的类型。

只有数字和包含数字十进制表示的字符串可以转换为数字。所有其他值都会产生错误。

只有布尔值和精确的字符串 "true" 和 "false" 可以转换为布尔值。所有其他值都会产生错误。

只有原始类型（string、number 和 bool）可以转换为字符串。所有其他值都会产生错误。

`convert(value, type_constraint)`

## 示例

```shellsession
> convert(3, string)
"3"
> convert("3", number)
3
> convert("false", bool)
false
> convert(false, string)
"false"
> convert(["a", "b", 3], list)
[
  "a",
  "b",
  "3",
]
> convert(["c", "b", "b"], set)
[
  "b",
  "c",
]
> convert({"a" = "foo", "b" = true}, map)
{
  "a" = "foo"
  "b" = "true"
}
```
