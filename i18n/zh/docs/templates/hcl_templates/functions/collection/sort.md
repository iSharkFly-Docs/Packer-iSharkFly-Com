---
title: sort 函数参考
description: |-
  `sort` 函数从字符串列表返回一个新的按字典顺序排序的列表。了解如何在 Packer 模板中使用 `sort` 函数。
---

# `sort` 函数

`sort` 接受一个字符串列表，并返回一个按字典顺序排序的新列表。

排序是按 Unicode 码点进行的，较高的码点在结果中出现在较低的码点之后。

## 示例

```shellsession
> sort(["e", "d", "a", "x"])
[
  "a",
  "d",
  "e",
  "x",
]
```
