---
title: slice 函数参考
description: '`slice` 函数从列表中提取连续的元素。了解如何在 Packer 模板中使用 `slice` 函数。'
---

# `slice` 函数

`slice` 从列表中提取一些连续的元素。

```hcl
slice(list, startindex, endindex)
```

`startindex` 是包含的，而 `endindex` 是不包含的。如果任一索引超出给定列表的有效索引范围，此函数将返回错误。

## 示例

```shellsession
> slice(["a", "b", "c", "d"], 1, 3)
[
  "b",
  "c",
]
```

## 相关函数

- [`substr`](/docs/templates/hcl_templates/functions/string/substr) 对字符串中的字符执行类似的功能，尽管它使用长度而不是结束索引。
