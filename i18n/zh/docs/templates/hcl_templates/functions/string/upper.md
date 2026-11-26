---
title: upper 函数参考
description: >-
  `upper` 函数将给定字符串中的所有小写字母转换为大写。
---

# `upper` 函数

`upper` 将给定字符串中的所有大小写字母转换为大写。

## 示例

```shellsession
> upper("hello")
HELLO
> upper("алло!")
АЛЛО!
```

此函数使用 Unicode 对字母和大小写的定义。

## 相关函数

- [`lower`](/docs/templates/hcl_templates/functions/string/lower) 将字符串中的字母转换为_小写_。
- [`title`](/docs/templates/hcl_templates/functions/string/title) 将字符串中每个单词的第一个字母转换为大写。
