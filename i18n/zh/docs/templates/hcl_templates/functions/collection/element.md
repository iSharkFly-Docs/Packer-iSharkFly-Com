---
title: element 函数参考
description: '`element` 函数从列表中检索单个元素。了解如何在 Packer 模板中使用 `element` 函数。'
---

# `element` 函数

`element` 从列表中检索单个元素。

```hcl
element(list, index)
```

索引从零开始。如果对空列表使用此函数会产生错误。

在大多数情况下使用内置的索引语法 `list[index]`。仅在需要下面描述的特殊"环绕"行为时使用此函数。

## 示例

```shellsession
> element(["a", "b", "c"], 1)
b
```

如果给定的索引大于列表的长度，则索引会通过对列表长度取模来"环绕"：

```shellsession
> element(["a", "b", "c"], 3)
a
```

## 相关函数

- [`index`](/docs/templates/hcl_templates/functions/collection/index-fn) 查找特定元素值的索引。
- [`lookup`](/docs/templates/hcl_templates/functions/collection/lookup) 根据_键_从_映射_中检索值。
