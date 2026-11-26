---
title: concat 函数参考
description: '`concat` 函数将两个或多个列表合并为单个列表。了解如何在 Packer 模板中使用 `concat` 函数。'
---

# `concat` 函数

`concat` 接受两个或多个列表，并将它们合并为单个列表。

## 示例

```shellsession
> concat(["a", ""], ["b", "c"])
[
  "a",
  "",
  "b",
  "c",
]
```
