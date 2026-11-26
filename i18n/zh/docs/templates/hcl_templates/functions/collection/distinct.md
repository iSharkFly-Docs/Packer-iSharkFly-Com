---
title: distinct 函数参考
description: '`distinct` 函数从列表中移除重复元素。了解如何在 Packer 模板中使用 `distinct` 函数。'
---

# `distinct` 函数

`distinct` 接受一个列表，并返回一个移除了所有重复元素的新列表。

每个值的第一次出现被保留，这些元素的相对顺序也被保留。

## 示例

```shellsession
> distinct(["a", "b", "a", "c", "d", "b"])
[
  "a",
  "b",
  "c",
  "d",
]
```
