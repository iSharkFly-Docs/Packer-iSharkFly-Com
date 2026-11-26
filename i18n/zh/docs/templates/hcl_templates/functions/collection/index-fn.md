---
title: index 函数参考
description: '`index` 函数在列表中查找给定值的元素索引。了解如何在 Packer 模板中使用 `index` 函数。'
---

# `index` 函数

`index` 在列表中查找给定值的元素索引。

```hcl
index(list, value)
```

返回的索引从零开始。如果给定的值不存在于列表中，此函数会产生错误。

## 示例

```shellsession
> index(["a", "b", "c"], "b")
1
```

## 相关函数

- [`element`](/docs/templates/hcl_templates/functions/collection/element) 根据索引从列表中检索特定元素。
