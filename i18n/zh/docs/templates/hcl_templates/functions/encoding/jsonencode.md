---
title: jsonencode 函数参考
description: '`jsonencode` 函数将给定值编码为 JSON 字符串。'
---

# `jsonencode` 函数

`jsonencode` 使用 JSON 语法将给定值编码为字符串。

JSON 编码定义在 [RFC 7159](https://tools.ietf.org/html/rfc7159) 中。

此函数按以下方式将 [Packer 语言值](/docs/templates/hcl_templates/expressions#types-and-values) 映射到 JSON 值：

| Packer 类型   | JSON 类型 |
| ------------- | --------- |
| `string`      | String    |
| `number`      | Number    |
| `bool`        | Bool      |
| `list(...)`   | Array     |
| `set(...)`    | Array     |
| `tuple(...)`  | Array     |
| `map(...)`    | Object    |
| `object(...)` | Object    |
| Null 值       | `null`    |

由于 JSON 格式不能完全表示所有 Packer 语言类型，将 `jsonencode` 的结果传递给 `jsondecode` 不会产生相同的值，但自动类型转换规则意味着这在实践中很少成为问题。

## 示例

```shellsession
> jsonencode({"hello"="world"})
{"hello":"world"}
```

## 相关函数

- [`jsondecode`](/docs/templates/hcl_templates/functions/encoding/jsondecode) 执行相反的操作，_解码_ JSON 字符串以获取其表示的值。
