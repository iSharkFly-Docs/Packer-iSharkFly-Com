---
title: max 函数参考
description: '`max` 函数从给定的一个或多个数字集合中返回最大的数字。'
---

# `max` 函数

`max` 接受一个或多个数字，并从集合中返回最大的数字。

## 示例

```shellsession
> max(12, 54, 3)
54
```

如果数字在列表或集合值中，使用 `...` 将集合展开为单独的参数：

```shellsession
> max([12, 54, 3]...)
54
```

## 相关函数

- [`min`](/docs/templates/hcl_templates/functions/numeric/min)，从集合中返回_最小_的数字。
