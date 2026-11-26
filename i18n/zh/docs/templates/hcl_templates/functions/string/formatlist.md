---
title: formatlist 函数参考
description: |-
  `formatlist` 函数应用规范来格式化值并生成字符串列表。
---

# `formatlist` 函数

`formatlist` 根据规范字符串格式化一系列其他值并生成字符串列表。

```hcl
formatlist(spec, values...)
```

规范字符串使用[与 `format` 相同的语法](/docs/templates/hcl_templates/functions/string/format#specification-syntax)。

给定的值可以是列表和非列表参数的混合。任何给定的列表必须具有相同的长度，这决定了结果列表的长度。

列表参数按索引顺序一起迭代，而非列表参数在每次迭代中重复使用。格式字符串针对列表参数的每个元素计算一次。

## 示例

```shellsession
> formatlist("Hello, %s!", ["Valentina", "Ander", "Olivia", "Sam"])
[
  "Hello, Valentina!",
  "Hello, Ander!",
  "Hello, Olivia!",
  "Hello, Sam!",
]
> formatlist("%s, %s!", "Salutations", ["Valentina", "Ander", "Olivia", "Sam"])
[
  "Salutations, Valentina!",
  "Salutations, Ander!",
  "Salutations, Olivia!",
  "Salutations, Sam!",
]
```

## 相关函数

- [`format`](/docs/templates/hcl_templates/functions/string/format) 定义此函数使用的规范语法，并产生单个字符串作为结果。
