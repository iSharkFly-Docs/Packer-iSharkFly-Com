---
title: lower 函数参考
description: >-
  `lower` 函数将给定字符串中的所有大写字母转换为小写。
---

# `lower` 函数

`lower` 将给定字符串中的所有大小写字母转换为小写。

## 示例

```shellsession
> lower("HELLO")
hello
> lower("АЛЛО!")
алло!
```

此函数使用 Unicode 对字母和大小写的定义。

## 相关函数

- [`upper`](/docs/templates/hcl_templates/functions/string/upper) 将字符串中的字母转换为_大写_。
- [`title`](/docs/templates/hcl_templates/functions/string/title) 将字符串中每个单词的第一个字母转换为大写。
