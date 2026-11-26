---
title: jsondecode 函数参考
description: |-
  `jsondecode` 函数将 JSON 字符串解码为其对应的 Packer 值。
---

# `jsondecode` 函数

`jsondecode` 将给定字符串解释为 JSON，返回解码该字符串结果的表示。

JSON 编码定义在 [RFC 7159](https://tools.ietf.org/html/rfc7159) 中。

此函数按以下方式将 JSON 值映射到 [Packer 语言值](/docs/templates/hcl_templates/expressions#types-and-values)：

| JSON 类型 | Packer 类型                                           |
| --------- | ---------------------------------------------------- |
| String    | `string`                                             |
| Number    | `number`                                             |
| Boolean   | `bool`                                               |
| Object    | `object(...)`，属性类型根据此表确定                   |
| Array     | `tuple(...)`，元素类型根据此表确定                    |
| Null      | Packer 语言的 `null` 值                              |

Packer 语言的自动类型转换规则意味着你通常不需要担心给定值产生的确切类型，可以直观地使用结果。

## 示例

```shellsession
> jsondecode("{\"hello\": \"world\"}")
{
  "hello" = "world"
}
> jsondecode("true")
true
```

## 相关函数

- [`jsonencode`](/docs/templates/hcl_templates/functions/encoding/jsonencode) 执行相反的操作，将值_编码_为 JSON。
