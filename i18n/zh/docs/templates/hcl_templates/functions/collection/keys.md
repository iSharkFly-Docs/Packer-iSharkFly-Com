---
title: keys 函数参考
description: '`keys` 函数返回给定映射中的键列表。了解如何在 Packer 模板中使用 `keys` 函数。'
---

# `keys` 函数

`keys` 接受一个映射，并返回包含该映射中所有键的列表。

键按字典顺序返回，确保只要映射中的键不变，结果就是相同的。

## 示例

```shellsession
> keys({a=1, c=2, d=3})
[
  "a",
  "c",
  "d",
]
```

## 相关函数

- [`values`](/docs/templates/hcl_templates/functions/collection/values) 返回映射中所有_值_的列表。
