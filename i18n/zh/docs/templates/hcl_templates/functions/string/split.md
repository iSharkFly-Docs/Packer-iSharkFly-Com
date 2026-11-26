---
title: split 函数参考
description: |-
  `split` 函数使用分隔符将字符串生成为列表。
---

# `split` 函数

`split` 通过在给定分隔符的每次出现处拆分给定字符串来生成字符串列表。

```hcl
split(separator, string)
```

## 示例

```shellsession
> split(",", "foo,bar,baz")
[
  "foo",
  "bar",
  "baz",
]
> split(",", "foo")
[
  "foo",
]
> split(",", "")
[
  "",
]
```

## 相关函数

- [`join`](/docs/templates/hcl_templates/functions/string/join) 执行相反的操作：用给定的分隔符连接列表生成字符串。
