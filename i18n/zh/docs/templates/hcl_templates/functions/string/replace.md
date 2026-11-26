---
title: replace 函数参考
description: |-
  `replace` 函数在字符串中搜索子字符串并将其每个匹配项替换为另一个字符串。
---

# `replace` 函数

`replace` 在给定字符串中搜索另一个给定的子字符串，并用给定的替换字符串替换每个匹配项。

```hcl
replace(string, substring, replacement)
```

如果 `substring` 以正斜杠开头和结尾，则被解释为正则表达式，使用与上述 [`regex`](/docs/templates/hcl_templates/functions/string/regex) 函数相同的模式语法。如果使用正则表达式 `substring`，`replacement` 字符串可以使用 `$n` 序列来引用捕获组，以在结果中合并。

## 示例

```shellsession
> replace("1 + 2 + 3", "+", "-")
1 - 2 - 3

> replace("hello world", "/w.*d/", "everybody")
hello everybody
```

## 相关函数

- [`regex_replace`](/docs/templates/hcl_templates/functions/string/regex_replace) 总是使用正则表达式而不是子字符串字面量进行搜索。
