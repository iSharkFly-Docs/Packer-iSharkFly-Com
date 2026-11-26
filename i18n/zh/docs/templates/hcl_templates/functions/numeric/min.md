---
title: min 函数参考
description: '`min` 函数从一个或多个数字集合中返回最小的数字。'
---

# `min` 函数

`min` 接受一个或多个数字，并从集合中返回最小的数字。

## 示例

```shellsession
> min(12, 54, 3)
3
```

如果数字在列表或集合值中，使用 `...` 将集合展开为单独的参数：

```shellsession
> min([12, 54, 3]...)
3
```

## 相关函数

- [`max`](/docs/templates/hcl_templates/functions/numeric/max)，从集合中返回_最大_的数字。
