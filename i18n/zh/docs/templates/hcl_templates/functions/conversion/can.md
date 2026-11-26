---
title: can 函数参考
description: |-
  `can` 函数计算表达式并指示其是否成功。
---

# `can` 函数

`can` 计算给定的表达式并返回一个布尔值，指示该表达式是否产生了没有任何错误的结果。

这是一个特殊函数，能够捕获在计算其参数时产生的错误。对于大多数可以使用 `can` 的情况，最好使用 [`try`](/docs/templates/hcl_templates/functions/conversion/try)，因为它允许更简洁地定义失败表达式的回退值。

`can` 函数只能捕获和处理由访问直到运行时才知道的数据而产生的_动态_错误。它不会捕获与对于任何输入都可以证明无效的表达式相关的错误，例如格式错误的资源引用。

::: warning
**警告：** `can` 函数仅用于变量验证规则中的简单测试。虽然它在技术上可以接受任何类型的表达式并在配置中的其他地方使用，但我们建议不要在其他上下文中使用它。对于配置中其他地方的错误处理，建议使用 [`try`](/docs/templates/hcl_templates/functions/conversion/try)。
:::

## 示例

```shellsession
> local.foo
{
  "bar" = "baz"
}
> can(local.foo.bar)
true
> can(local.foo.boop)
false
```

`can` 函数_不会_捕获与在动态表达式计算之前就可以证明无效的构造相关的错误，例如格式错误的引用或对未声明的顶级对象的引用：

```shellsession
> can(local.nonexist)

Error: Reference to undeclared local value

A local value with the name "nonexist" has not been declared.
```

## 相关函数

- [`try`](/docs/templates/hcl_templates/functions/conversion/try)，尝试计算一系列表达式并返回第一个成功的表达式的结果。
