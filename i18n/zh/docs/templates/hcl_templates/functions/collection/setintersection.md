---
title: setintersection 函数参考
description: |-
  `setintersection` 函数从多个集合创建一个只包含所有输入集合共有元素的集合。了解如何在 Packer 模板中使用 `setintersection`。
---

# `setintersection` 函数

`setintersection` 函数接受多个集合，并生成一个只包含所有给定集合共有元素的单个集合。这个新集合称为_交集_。

```hcl
setintersection(sets...)
```

## 示例

```shellsession
> setintersection(["a", "b"], ["b", "c"], ["b", "d"])
[
  "b",
]
```

给定的参数被转换为集合，因此结果也是一个集合，给定元素的顺序不会被保留。

## 相关函数

- [`contains`](/docs/templates/hcl_templates/functions/collection/contains) 测试给定的列表或集合是否包含给定的元素值。
- [`setproduct`](/docs/templates/hcl_templates/functions/collection/setproduct) 计算多个集合的_笛卡尔积_。
- [`setunion`](/docs/templates/hcl_templates/functions/collection/setunion) 计算多个集合的_并集_。
