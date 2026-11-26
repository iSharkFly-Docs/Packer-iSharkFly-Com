---
title: values 函数参考
description: '`values` 函数返回给定映射中元素值的列表。了解如何在 Packer 模板中使用 `values` 函数。'
---

# `values` 函数

`values` 接受一个映射，并返回一个包含该映射中元素值的列表。

值按其对应_键_的字典顺序返回，因此值将以与从 [`keys`](/docs/templates/hcl_templates/functions/collection/keys) 返回的键相同的顺序返回。

## 示例

```shellsession
> values({a=3, c=2, d=1})
[
  3,
  2,
  1,
]
```

## 相关函数

- [`keys`](/docs/templates/hcl_templates/functions/collection/keys) 返回映射中_键_的列表。
