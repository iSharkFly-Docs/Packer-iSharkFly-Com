---
title: try 函数参考
description: |-
  `try` 函数按顺序计算一系列表达式，并返回第一个不产生任何错误的表达式的结果。
---

# `try` 函数

`try` 依次计算其所有参数表达式，并返回第一个不产生任何错误的表达式的结果。

这是一个特殊函数，能够捕获在计算其参数时产生的错误，这在处理其形状在实现时不确定的复杂数据结构时特别有用。

例如，如果某些数据以 JSON 或 YAML 格式从外部系统检索然后解码，结果可能具有不保证设置的属性。我们可以使用 `try` 生成一个具有可预测类型的规范化数据结构，因此可以在配置的其他地方更方便地使用：

```hcl
locals {
  raw_value = yamldecode("${path.folder}/example.yaml")
  normalized_value = {
    name   = tostring(try(local.raw_value.name, null))
    groups = try(local.raw_value.groups, [])
  }
}
```

通过上述本地值表达式，文件夹中其他地方的配置可以引用 `local.normalized_value` 属性，而无需重复检查和处理否则会产生错误的缺失属性。

我们还可以使用 `try` 来处理值可能以两种不同形式提供的情况，允许我们规范化为最通用的形式：

```hcl
variable "example" {
  type = any
}

locals {
  example = try(
    [tostring(var.example)],
    tolist(var.example),
  )
}
```

上述允许 `var.example` 是列表或单个字符串。如果它是单个字符串，它将被规范化为包含该字符串的单元素列表，同样允许配置中其他地方的表达式假设 `local.example` 始终是列表。

第二个示例包含两个都可能失败的表达式。例如，如果 `var.example` 设置为 `{}`，则它既不能转换为字符串也不能转换为列表。如果 `try` 用尽所有给定的表达式而没有任何一个成功，它将返回一个描述它遇到的所有问题的错误。

我们强烈建议仅在其表达式执行规范化的特殊本地值中使用 `try`，以便错误处理限制在文件夹中的单个位置，配置的其余部分可以只使用对规范化结构的简单引用，从而对未来的维护者更具可读性。

`try` 函数只能捕获和处理由访问直到运行时才知道的数据而产生的_动态_错误。它不会捕获与对于任何输入都可以证明无效的表达式相关的错误，例如格式错误的资源引用。

::: warning
**警告：** `try` 函数仅用于简洁地测试对象属性的存在和类型。虽然它在技术上可以接受任何类型的表达式，但���们建议仅将其与简单的属性引用和类型转换函数一起使用，如上面的示例所示。过度使用 `try` 来抑制错误将导致配置难以理解和维护。
:::

## 示例

```shellsession
> local.foo
{
  "bar" = "baz"
}
> try(local.foo.bar, "fallback")
baz
> try(local.foo.boop, "fallback")
fallback
```

`try` 函数_不会_捕获与在动态表达式计算之前就可以证明无效的构造相关的错误，例如格式错误的引用或对未声明的顶级对象的引用：

```shellsession
> try(local.nonexist, "fallback")

Error: Reference to undeclared local value

A local value with the name "nonexist" has not been declared.
```

## 相关函数

- [`can`](/docs/templates/hcl_templates/functions/conversion/can)，尝试计算表达式并返回一个指示其是否成功的布尔值。
