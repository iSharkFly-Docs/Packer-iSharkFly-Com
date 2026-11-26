---
title: zipmap 函数参考
description: |-
  `zipmap` 函数从键列表和相应的值列表构造一个映射。了解如何在 Packer 模板中使用 `zipmap` 函数。
---

# `zipmap` 函数

`zipmap` 从键列表和相应的值列表构造一个映射。

```hcl
zipmap(keyslist, valueslist)
```

`keyslist` 和 `valueslist` 必须具有相同的长度。`keyslist` 必须是字符串列表，而 `valueslist` 可以是任何类型的列表。

来自两个列表中具有相同索引的每对元素将用作结果映射中元素的键和值。如果相同的值在 `keyslist` 中出现多次，则结果映射中使用索引最高的值。

## 示例

```shellsession
> zipmap(["a", "b"], [1, 2])
{
  "a" = 1,
  "b" = 2,
}
```
