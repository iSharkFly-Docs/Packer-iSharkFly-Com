---
title: lookup 函数参考
description: '`lookup` 函数使用映射键从映射中检索元素值。了解如何在 Packer 模板中使用 `lookup` 函数。'
---

# `lookup` 函数

`lookup` 根据给定的键从映射中检索单个元素的值。如果给定的键不存在，则返回给定的默认值。

```hcl
lookup(map, key, default)
```

## 示例

```shellsession
> lookup({a="ay", b="bee"}, "a", "what?")
ay
> lookup({a="ay", b="bee"}, "c", "what?")
what?
```

## 相关函数

- [`element`](/docs/templates/hcl_templates/functions/collection/element) 根据_索引_从_列表_中检索值。
