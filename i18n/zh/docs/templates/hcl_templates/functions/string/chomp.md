---
title: chomp 函数参考
description: '`chomp` 函数移除字符串末尾的换行符。'
---

# `chomp` 函数

`chomp` 移除字符串末尾的换行符。

例如，如果字符串是从末尾有换行符的文件中读取的，这会很有用。

## 示例

```shellsession
> chomp("hello\n")
hello
> chomp("hello\r\n")
hello
> chomp("hello\n\n")
hello
```

## 相关函数

- [`trimspace`](/docs/templates/hcl_templates/functions/string/trimspace)，移除字符串开头和末尾的所有类型的空白字符。
