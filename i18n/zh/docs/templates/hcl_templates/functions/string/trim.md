---
title: trim 函数参考
description: >-
  `trim` 函数从字符串的开头和末尾移除指定的字符。
---

# `trim` 函数

`trim` 从给定字符串的开头和末尾移除指定的字符集。

```hcl
trim(string, str_character_set)
```

在第二个参数中指定的字符被逐个移除
从给定字符串的开头和末尾，直到在每一侧遇到
第一个不匹配的字符。

## 示例

```shellsession
> trim("?!hello?!", "!?")
hello
> trim("foobar", "far")
oob
> trim("   hello! world.!  ", "! ")
hello! world.
```

## 相关函数

- [`trimprefix`](/docs/templates/hcl_templates/functions/string/trimprefix) 从字符串开头移除一个单词。
- [`trimsuffix`](/docs/templates/hcl_templates/functions/string/trimsuffix) 从字符串末尾移除一个单词。
- [`trimspace`](/docs/templates/hcl_templates/functions/string/trimspace) 从字符串的开头和末尾移除所有类型的空白字符。
