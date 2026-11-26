---
title: title 函数参考
description: >-
  `title` 函数将给定字符串中每个单词的第一个字母转换为大写。
---

# `title` 函数

`title` 将给定字符串中每个单词的第一个字母转换为大写。

## 示例

```shellsession
> title("hello world")
Hello World
```

此函数使用 Unicode 对字母和大小写的定义。

~> 此函数直接基于 [Unicode](https://unicode.org/glossary/#unicode)
关于字母和大小写的定义，并且不理解较新的 emoji 字符。可能会产生意外结果，因此仅适用于仅含字母（非 emoji）文本的用例。

## 相关函数

- [`upper`](/docs/templates/hcl_templates/functions/string/upper) 将字符串中的 _所有_ 字母转换为大写。
- [`lower`](/docs/templates/hcl_templates/functions/string/lower) 将字符串中的所有字母转换为_小写_。
