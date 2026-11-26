---
title: trimprefix 函数参考
description: |-
  `trimprefix` 函数从给定字符串的开头移除指定的前缀。如果字符串不以该前缀开头，则原样返回。
---

# `trimprefix` 函数

`trimprefix` 从给定字符串的开头移除指定的前缀。如果字符串不以该前缀开头，则原样返回。

## 示例

```
> trimprefix("helloworld", "hello")
world
> trimprefix("helloworld", "cat")
helloworld
```

## 相关函数

- [`trim`](/docs/templates/hcl_templates/functions/string/trim) 从字符串的开头和末尾移除指定集合中的字符。
- [`trimsuffix`](/docs/templates/hcl_templates/functions/string/trimsuffix) 从字符串末尾移除一个单词。
- [`trimspace`](/docs/templates/hcl_templates/functions/string/trimspace) 从字符串的开头和末尾移除所有类型的空白字符。
