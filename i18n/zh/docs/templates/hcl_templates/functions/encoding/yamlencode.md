---
title: yamlencode 函数参考
description: '`yamlencode` 函数将给定值编码为 YAML 字符串。'
---

# `yamlencode` 函数

`yamlencode` 使用 [YAML 1.2](https://yaml.org/spec/1.2/spec) 块语法将给定值编码为字符串。

::: warning
**警告：** 此函数目前是**实验性的**，其确切的结果格式可能会在 Packer 的未来版本中根据反馈而改变。不要使用 `yamldecode` 为任何资源参数构造值，如果结果的更改会造成破坏。要获得值的一致字符串表示，请改用 [`jsonencode`](/docs/templates/hcl_templates/functions/encoding/jsonencode)；它的结果也是有效的 YAML，因为 YAML 是 JSON 的超集。
:::

<!--
    移除上述警告的条件是底层的 go-cty-yaml 文件夹发布稳定版本，
    并承诺保证特定输入的表示不会在没有主要版本更新的情况下改变。
    在撰写本文时，它没有做出这种承诺，
    以便对用户关于其输出格式的反馈做出响应，
    因为 YAML 是一种非常灵活的格式，
    其初始决策在为特定外部消费者生成 YAML 时可能被证明是次优的。
-->

此函数按以下方式将 [Packer 语言值](/docs/templates/hcl_templates/expressions#types-and-values) 映射到 YAML 标签：

| Packer 类型   | YAML 类型            |
| ------------- | -------------------- |
| `string`      | `!!str`              |
| `number`      | `!!float` 或 `!!int` |
| `bool`        | `!!bool`             |
| `list(...)`   | `!!seq`              |
| `set(...)`    | `!!seq`              |
| `tuple(...)`  | `!!seq`              |
| `map(...)`    | `!!map`              |
| `object(...)` | `!!map`              |
| Null 值       | `!!null`             |

`yamlencode` 对所有上述类型使用隐式语法，因此它不生成显式 YAML 标签。

因为 YAML 格式不能完全表示所有 Packer 语言类型，将 `yamlencode` 的结果传递给 `yamldecode` 不会产生相同的值，但 Packer 语言的自动类型转换规则意味着这在实践中很少成为问题。

## 示例

```shellsession
> yamlencode({"a":"b", "c":"d"})
"a": "b"
"c": "d"

> yamlencode({"foo":[1, 2, 3], "bar": "baz"})
"bar": "baz"
"foo":
- 1
- 2
- 3

> yamlencode({"foo":[1, {"a":"b","c":"d"}, 3], "bar": "baz"})
"bar": "baz"
"foo":
- 1
- "a": "b"
  "c": "d"
- 3
```

`yamlencode` 始终对映射和序列使用 YAML 的"块风格"，除非映射或序列为空。要生成流式 YAML，请改用 [`jsonencode`](/docs/templates/hcl_templates/functions/encoding/jsonencode)：YAML 流式风格是 JSON 语法的超集。

## 相关函数

- [`jsonencode`](/docs/templates/hcl_templates/functions/encoding/jsonencode) 是使用 JSON 而不是 YAML 的类似操作。
- [`yamldecode`](/docs/templates/hcl_templates/functions/encoding/yamldecode) 执行相反的操作，_解码_ YAML 字符串以获取其表示的值。
