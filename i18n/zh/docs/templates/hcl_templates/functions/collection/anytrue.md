---
title: anytrue 函数参考
description: |-
  `anytrue` 函数在集合中的任何元素是 `true` 或 `"true"` 时返回 `true`。了解如何在 Packer 模板中使用 `anytrue` 函数。
---

# `anytrue` 函数

`anytrue` 在给定集合中的任何元素是 `true` 或 `"true"` 时返回 `true`。如果集合为空，它返回 `false`。

```hcl
anytrue(list)
```

## 示例

```shell
> anytrue(["true"])
true
> anytrue([true])
true
> anytrue([true, false])
true
> anytrue([])
false
```
