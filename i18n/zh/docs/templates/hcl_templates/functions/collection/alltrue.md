---
title: alltrue 函数参考
description: |-
  `alltrue` 函数在集合中的所有元素都是 `true`、`"true"` 或集合为空时返回 `true`。了解如何在 Packer 模板中使用 `alltrue` 函数。
---

# `alltrue` 函数

`alltrue` 在给定集合中的所有元素都是 `true` 或 `"true"` 时返回 `true`。如果集合为空，它也返回 `true`。

```hcl
alltrue(list)
```

## 示例

```shell
> alltrue(["true", true])
true
> alltrue([true, false])
false
```
