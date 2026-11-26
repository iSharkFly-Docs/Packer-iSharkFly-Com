---
title: merge 函数参考
description: |-
  `merge` 函数通过合并多个映射中的键返回单个映射。了解如何在 Packer 模板中使用 `merge` 函数。
---

# `merge` 函数

`merge` 接受任意数量的映射，并返回一个包含所有映射中元素合并集的单个映射。

如果多个给定的映射定义了相同的键，则参数序列中较后的映射优先。

## 示例

```shellsession
> merge({"a"="b", "c"="d"}, {"e"="f", "c"="z"})
{
  "a" = "b"
  "c" = "z"
  "e" = "f"
}
```
