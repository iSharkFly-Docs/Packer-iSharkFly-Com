---
title: trimsuffix 函数参考
description: |-
  `trimsuffix` 函数从给定字符串的末尾移除指定的后缀。如果字符串不以该后缀结尾，则原样返回。
---

# `trimsuffix` 函数

`trimsuffix` 从给定字符串的末尾移除指定的后缀。如果字符串不以该后缀结尾，则原样返回。

## 示例

```
> trimsuffix("helloworld", "world")
hello
> trimsuffix("helloworld", "cat")
helloworld
```

## 相关函数

- [`trim`](/docs/templates/hcl_templates/functions/string/trim) 从字符串的开头和末尾移除指定集合中的字符。
- [`trimprefix`](/docs/templates/hcl_templates/functions/string/trimprefix) 从字符串开头移除一个单词。
- [`trimspace`](/docs/templates/hcl_templates/functions/string/trimspace) 从字符串的开头和末尾移除所有类型的空白字符。
