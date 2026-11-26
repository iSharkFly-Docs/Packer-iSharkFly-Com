---
title: coalesce 函数参考
description: |-
  `coalesce` 函数从参数列表中返回第一个不为空或 `null` 的参数。了解如何在 Packer 模板中使用 `coalesce` 函数。
---

# `coalesce` 函数

`coalesce` 接受任意数量的参数，并返回第一个不是 null 或空字符串的参数。

## 示例

```shellsession
> coalesce("a", "b")
a
> coalesce("", "b")
b
> coalesce(1,2)
1
```

要对字符串列表执行 `coalesce` 操作，请使用 `...` 符号将列表展开为参数：

```shellsession
> coalesce(["", "b"]...)
b
```

## 相关函数

- [`coalescelist`](/docs/templates/hcl_templates/functions/collection/coalescelist) 对列表参数而非单个参数执行类似操作。
