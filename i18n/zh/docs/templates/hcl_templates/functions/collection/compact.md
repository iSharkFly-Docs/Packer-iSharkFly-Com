---
title: compact 函数参考
description: '`compact` 函数从列表中移除空字符串元素。了解如何在 Packer 模板中使用 `compact` 函数。'
---

# `compact` 函数

`compact` 接受一个字符串列表，并返回一个移除了所有空字符串元素的新列表。

## 示例

```shellsession
> compact(["a", "", "b", "c"])
[
  "a",
  "b",
  "c",
]
```
