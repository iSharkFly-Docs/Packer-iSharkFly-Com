---
title: indent 函数参考
description: |-
  `indent` 函数向给定多行字符串的除第一行以外的所有行的开头添加空格。
---

# `indent` 函数

`indent` 向给定多行字符串的除第一行以外的所有行的开头添加指定数量的空格。

```hcl
indent(num_spaces, string)
```

## 示例

此函数对于将多行字符串插入到另一个字符串中已缩进的上下文非常有用：

```shellsession
> "  items: %{indent(2, "[\n  foo,\n  bar,\n]\n")}"
  items: [
    foo,
    bar,
  ]
```

字符串的第一行不缩进，这样如上所述，它可以放在已经开始该行的引导序列之后。
