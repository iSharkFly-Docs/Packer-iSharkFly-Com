---
title: contains 函数参考
description: '`contains` 函数判断列表或集合是否包含给定的值。了解如何在 Packer 模板中使用 `contains` 函数。'
---

# `contains` 函数

`contains` 判断给定的列表或集合是否包含给定的单个值作为其元素之一。

```hcl
contains(list, value)
```

## 示例

```shellsession
> contains(["a", "b", "c"], "a")
true
> contains(["a", "b", "c"], "d")
false
```
