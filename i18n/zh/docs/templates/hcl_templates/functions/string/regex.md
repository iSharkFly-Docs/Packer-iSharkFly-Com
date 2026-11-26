---
title: regex 函数参考
description: |-
  `regex` 函数将正则表达式应用于字符串，返回匹配的子字符串。
---

# `regex` 函数

`regex` 将[正则表达式](https://en.wikipedia.org/wiki/Regular_expression)应用于字符串，返回匹配的子字符串。

```hcl
regex(pattern, string)
```

此函数使用的正则表达式语法是 [RE2](https://github.com/google/re2/wiki/Syntax) 语法的子集，支持以下特性：

| 序列              | 类型                 | 说明                                                                                                                      |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `.`               | 元字符               | 匹配任意单个字符                                                                                                          |
| `[xyz]`           | 元字符               | [字符类](https://en.wikipedia.org/wiki/Regular_expression#Character_classes) - 匹配方括号内的任意字符                    |
| `[^xyz]`          | 元字符               | 取反字符类 - 匹配方括号内 _未包含_ 的任意字符                                                                            |
| `[x-z]`           | 元字符               | 范围 - 匹配从 x 到 z 范围内的任意字符                                                                                     |
| `\d`              | 元字符               | Perl 字符类 - 十进制数字                                                                                                  |
| `\D`              | 元字符               | Perl 字符类 - 非数字                                                                                                      |
| `\s`              | 元字符               | Perl 字符类 - 空白字符                                                                                                    |
| `\S`              | 元字符               | Perl 字符类 - 非空白字符                                                                                                  |
| `\w`              | 元字符               | Perl 字符类 - 单词字符                                                                                                    |
| `\W`              | 元字符               | Perl 字符类 - 非单词字符                                                                                                  |
| `[[:alpha:]]`     | 元字符               | ASCII 字符类 - 字母                                                                                                       |
| `[[:^alpha:]]`    | 元字符               | 取反 ASCII 字符类 - 非字母                                                                                                |
| `x*`              | 重复                 | 零个或多个 `x`，贪婪                                                                                                      |
| `x*?`             | 重复                 | 零个或多个 `x`，非贪婪                                                                                                    |
| `x+`              | 重复                 | 一个或多个 `x`，贪婪                                                                                                      |
| `x+?`             | 重复                 | 一个或多个 `x`，非贪婪                                                                                                    |
| `x?`              | 重复                 | 零个或一个 `x`                                                                                                            |
| `x{n,m}`          | 重复                 | 至少 n 个或至多 m 个 `x`，贪婪                                                                                            |
| `x{n,m}?`         | 重复                 | 至少 n 个或至多 m 个 `x`，非贪婪                                                                                          |
| `x{n,}`           | 重复                 | n 个或更多 `x`，贪婪                                                                                                      |
| `x{n,}?`          | 重复                 | n 个或更多 `x`，非贪婪                                                                                                    |
| `x{n}`            | 重复                 | 恰好 n 个 `x`                                                                                                             |
| `(x)`             | 分组                 | [捕获组](https://en.wikipedia.org/wiki/Regular_expression#Subexpressions)                                                |
| `(?P<name>x)`     | 分组                 | [命名捕获组](https://en.wikipedia.org/wiki/Regular_expression#Subexpressions)                                            |
| `(?:x)`           | 分组                 | 非捕获组                                                                                                                  |
| <code>x\|y</code> | 分组                 | `x` 或 `y`，优先匹配 `x`                                                                                                  |
| `^`               | 锚点                 | 文本或行首                                                                                                                |
| `$`               | 锚点                 | 文本或行尾                                                                                                                |
| `\A`              | 锚点                 | 文本开头                                                                                                                  |
| `\z`              | 锚点                 | 文本结尾                                                                                                                  |
| `\b`              | 锚点                 | ASCII 单词边界                                                                                                            |
| `\B`              | 锚点                 | 非 ASCII 单词边界                                                                                                         |

RE2 支持其他一些特性尚未支持。但是，RE2 明确 _不_ 支持反向引用。

如果给定的模式无效，`regex` 将产生错误。请注意，模式语法是由 HCL 语言字符串字面量处理定义的，它还有自己的字符转义元序列。因此，例如，要在模式中匹配反斜杠，你必须在字符串中转义它，导致双反斜杠 `\\`。

如果模式不匹配，`regex` 也会产生错误。要测试给定模式是否与给定字符串匹配，请使用 [`can`](/docs/templates/hcl_templates/functions/conversion/can) 与 `regex` 一起，如下所示：

```hcl
can(regex("^ami-", var.ami_id))
```

## 示例

```shellsession
> regex("[a-z]+", "53453453.345345aaabbbccc23454")
aaabbbccc
> regex("(\\d\\d\\d\\d)-(\\d\\d)-(\\d\\d)", "2019-02-01")
[
  "2019",
  "02",
  "01",
]
> regex("^(?:(?P<scheme>[^:/?#]+):)?(?://(?P<authority>[^/?#]*))?", "https://packer.io/docs/")
{
  "authority" = "packer.io"
  "scheme" = "https"
}
> regex("[a-z]+", "53453453.34534523454")

Error: Error in function call

Call to function "regex" failed: pattern did not match any part of the given
string.
```

## 相关函数

- [`regexall`](/docs/templates/hcl_templates/functions/string/regexall) 搜索字符串中可能有多个给定模式的匹配项。
