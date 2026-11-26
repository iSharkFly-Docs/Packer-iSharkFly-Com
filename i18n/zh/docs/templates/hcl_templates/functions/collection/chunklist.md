---
title: chunklist 函数参考
description: |-
  `chunklist` 函数将单个列表拆分为固定大小的块并返回列表的列表。了解如何在 Packer 模板中使用 `chunklist` 函数。
---

# `chunklist` 函数

`chunklist` 将单个列表拆分为固定大小的块，返回列表的列表。

```hcl
chunklist(list, chunk_size)
```

## 示例

```shellsession
> chunklist(["a", "b", "c", "d", "e"], 2)
[
  ["a", "b"],
  ["c", "d"],
  ["e"]
]
> chunklist(["a", "b", "c", "d", "e"], 1)
[
  ["a"],
  ["b"],
  ["c"],
  ["d"],
  ["e"]
]
```
