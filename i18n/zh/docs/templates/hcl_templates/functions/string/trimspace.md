---
title: trimspace 函数参考
description: >-
  `trimspace` 函数移除字符串开头和末尾的空格字符。
---

# `trimspace` 函数

`trimspace` 移除给定字符串开头和末尾的任何空格字符。

此函数遵循 Unicode 对"空格"的定义，包括常规空格、制表符和换行符。

## 示例

```shellsession
> trimspace("  hello\n\n")
hello
```

## 相关函数

- [`chomp`](/docs/templates/hcl_templates/functions/string/chomp) 只移除字符串末尾的换行符。
- [`trim`](/docs/templates/hcl_templates/functions/string/trim) 从字符串的开头和末尾移除指定集合中的字符。
- [`trimprefix`](/docs/templates/hcl_templates/functions/string/trimprefix) 从字符串开头移除一个单词。
- [`trimsuffix`](/docs/templates/hcl_templates/functions/string/trimsuffix) 从字符串末尾移除一个单词。
