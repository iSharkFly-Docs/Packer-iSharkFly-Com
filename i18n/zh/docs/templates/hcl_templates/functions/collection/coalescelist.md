---
title: coalescelist 函数参考
description: |-
  `coalescelist` 函数返回参数列表中第一个非空的参数。了解如何在 Packer 模板中使用 `coalescelist` 函数。
---

# `coalescelist` 函数

`coalescelist` 接受任意数量的列表参数，并返回第一个不为空的列表。

## 示例

```shellsession
> coalescelist(["a", "b"], ["c", "d"])
[
  "a",
  "b",
]
> coalescelist([], ["c", "d"])
[
  "c",
  "d",
]
```

要对列表的列表执行 `coalescelist` 操作，请使用 `...` 符号将外部列表展开为参数：

```shellsession
> coalescelist([[], ["c", "d"]]...)
[
  "c",
  "d",
]
```

## 相关函数

- [`coalesce`](/docs/templates/hcl_templates/functions/collection/coalesce) 对字符串参数而非列表参数执行类似操作。
