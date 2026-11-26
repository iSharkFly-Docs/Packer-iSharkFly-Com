---
title: setunion 函数参考
description: |-
  `setunion` 函数创建一个包含多个给定集合中元素的集合。了解如何在 Packer 模板中使用 `setunion` 函数。
---

# `setunion` 函数

`setunion` 函数接受多个集合，并生成一个包含所有给定集合中元素的单个集合。换句话说，它计算集合的[并集](https://en.wikipedia.org/wiki/Union_(set_theory))。

```hcl
setunion(sets...)
```

## 示例

```shellsession
> setunion(["a", "b"], ["b", "c"], ["d"])
[
  "d",
  "b",
  "c",
  "a",
]
```

给定的参数被转换为集合，因此结果也是一个集合，给定元素的顺序不会被保留。

## 相关函数

- [`contains`](/docs/templates/hcl_templates/functions/collection/contains) 测试给定的列表或集合是否包含给定的元素值。
- [`setintersection`](/docs/templates/hcl_templates/functions/collection/setintersection) 计算多个集合的_交集_。
- [`setproduct`](/docs/templates/hcl_templates/functions/collection/setproduct) 计算多个集合的_笛卡尔积_。
