---
title: reverse 函数参考
description: '`reverse` 函数反转序列中的值。了解如何在 Packer 模板中使用 `reverse` 函数。'
---

# `reverse` 函数

`reverse` 接受一个序列，并生成一个相同长度的新序列，包含所有相同的元素，但顺序相反。

## 示例

```shellsession
> reverse([1, 2, 3])
[
  3,
  2,
  1,
]
```

## 相关函数

- [`strrev`](/docs/templates/hcl_templates/functions/string/strrev) 反转字符串。
