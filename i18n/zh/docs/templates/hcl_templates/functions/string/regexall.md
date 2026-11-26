---
title: regexall 函数参考
description: |-
  `regexall` 函数将正则表达式应用于字符串，返回所有匹配项的列表。
---

# `regexall` 函数

`regexall` 将[正则表达式](https://en.wikipedia.org/wiki/Regular_expression)应用于字符串并返回所有匹配项的列表。

```hcl
regexall(pattern, string)
```

`regexall` 是 [`regex`](/docs/templates/hcl_templates/functions/string/regex) 的变体，查找给定模式的 _所有_ 匹配项，而不仅仅是第一个。

模式以与 `regex` 相同的方式解释。如果模式不包含任何捕获组，结果是匹配字符串的列表。如果模式包含捕获组，结果是列表或映射的列表，如 `regex` 所述。

```shellsession
> regexall("[a-z]+", "1234abcd5678efgh9")
[
  "abcd",
  "efgh",
]

> length(regexall("[a-z]+", "1234abcd5678efgh9"))
2

> length(regexall("[a-z]+", "123456789")) > 0
false
```

如果给定的模式无效，`regexall` 将产生错误。

## 相关函数

- [`regex`](/docs/templates/hcl_templates/functions/string/regex) 只搜索单个匹配项。
