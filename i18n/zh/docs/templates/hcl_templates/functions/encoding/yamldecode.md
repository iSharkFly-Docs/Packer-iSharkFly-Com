---
title: yamldecode 函数参考
description: |-
  `yamldecode` 函数将 YAML 字符串解码为其对应的 Packer 值。
---

# `yamldecode` 函数

`yamldecode` 将字符串解析为 YAML 的子集，并生成其值的表示。

此函数支持 [YAML 1.2](https://yaml.org/spec/1.2/spec.html) 的子集，如下所述。

此函数按以下方式将 YAML 值映射到 [Packer 语言值](/docs/templates/hcl_templates/expressions#types-and-values)：

| YAML 类型     | Packer 类型                                                |
| ------------- | --------------------------------------------------------- |
| `!!str`       | `string`                                                  |
| `!!float`     | `number`                                                  |
| `!!int`       | `number`                                                  |
| `!!bool`      | `bool`                                                    |
| `!!map`       | `object(...)`，属性类型根据此表确定                        |
| `!!seq`       | `tuple(...)`，元素类型根据此表确定                         |
| `!!null`      | Packer 语言的 `null` 值                                   |
| `!!timestamp` | [RFC 3339](https://tools.ietf.org/html/rfc3339) 格式的 `string` |
| `!!binary`    | 包含 base64 编码表示的 `string`                           |

Packer 语言的自动类型转换规则意味着你通常不需要担心给定值产生的确切类型，可以直观地使用结果。

但请注意，上述映射是有歧义的——几种不同的源类型映射到同一目标类型——因此通过 `yamldecode` 然后 `yamlencode` 往返不能产生相同的结果。

YAML 是一种复杂的语言，它支持 Packer 语言的类型系统无法表示的许多可能性。因此，这个 YAML 解码器仅支持 YAML 1.2 的子集，限制包括以下内容：

- 虽然支持对早期锚点的别名引用，但不支持循环数据结构（对集合的引用出现在该集合内部）。如果 `yamldecode` 检测到这样的结构，它将返回错误。

- 只支持上表中显示的类型标签（或这些相同标签的等效替代表示）。任何其他标签都将导致错误。

- 只允许一个 YAML 文档。如果给定字符串中存在多个文档，此函数将返回错误。

## 示例

```shellsession
> yamldecode("{\"hello\": \"world\"}")
{
  "hello" = "world"
}

> yamldecode("true")
true

> yamldecode("{a: &foo [1, 2, 3], b: *foo}")
{
  "a" = [
    1,
    2,
    3,
  ]
  "b" = [
    1,
    2,
    3,
  ]
}

> yamldecode("{a: &foo [1, *foo, 3]}")

Error: Error in function call

Call to function "yamldecode" failed: cannot refer to anchor "foo" from inside
its own definition.

> yamldecode("{a: !not-supported foo}")

Error: Error in function call

Call to function "yamldecode" failed: unsupported tag "!not-supported".
```

## 相关函数

- [`jsondecode`](/docs/templates/hcl_templates/functions/encoding/jsondecode) 是使用 JSON 而不是 YAML 的类似操作。
- [`yamlencode`](/docs/templates/hcl_templates/functions/encoding/yamlencode) 执行相反的操作，将值_编码_为 YAML。
