---
title: regex_replace 函数参考
description: |-
  `regex_replace` 函数在字符串中搜索模式并将每个匹配项替换为另一个字符串。
---

# `regex_replace` 函数

`regex_replace` 在字符串中搜索满足给定[正则表达式](https://en.wikipedia.org/wiki/Regular_expression)模式的子字符串，并用给定的替换字符串替换每个匹配项。

```hcl
regex_replace(string, pattern, replacement)
```

此函数使用 [`regex`](/docs/templates/hcl_templates/functions/string/regex) 函数的相同模式语法。

替换字符串可以包含捕获组替换，以将模式中的值放入结果中。

如果给定的模式无效，`regex_replace` 将产生错误。

## 示例

```shellsession
> regex_replace("hello world", "world", "everybody")
hello everybody
```

## 相关函数

- [`replace`](/docs/templates/hcl_templates/functions/string/replace) 用另一个字符串替换所有子字符串的匹配项。
