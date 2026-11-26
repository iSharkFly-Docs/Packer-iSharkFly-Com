---
title: env 函数参考
description: '`env` 函数为输入变量检索环境值。了解如何在 Packer 模板中使用 `env` 函数。'
---

# `env` 函数

`env` 函数获取输入变量内部的环境变量值。这是唯一可以从 `variable` 块调用的函数。你只能在默认输入中使用 `env` 函数。

```hcl
variable "aws_region" {
  default = env("AWS_DEFAULT_REGION")
}
```

在前面的示例中，`aws_region` 的值将是存储在 `AWS_DEFAULT_REGION` 环境变量中的值，除非 aws_region 也以[优先的方式](/docs/templates/hcl_templates/variables#variable-definition-precedence)设置。

::: info
**为什么我不能在其他地方使用环境变量？** 用户变量是可配置输入的单一来源。我们认为在配置中_任何地方_使用环境变量会让用户对模板的可能输入感到困惑。通过只允许在输入变量的默认值中使用环境变量，输入变量仍然是用户可以使用 `packer inspect` 轻松发现的模板的单一输入来源。
:::

当环境变量根本未设置时——甚至没有设置为空字符串——`env` 返回的值将是空字符串。仍然可以使用其他方式设置它，但你可以使用[自定义验证规则](/docs/templates/hcl_templates/variables#custom-validation-rules)在这种情况下报错以确保它已设置，例如：

```hcl
variable "aws_region" {
  default = env("AWS_DEFAULT_REGION")

  validation {
    condition     = length(var.aws_region) > 0
    error_message = <<EOF
The aws_region var is not set: make sure to at least set the AWS_DEFAULT_REGION env var.
To fix this you could also set the aws_region variable from the arguments, for example:
$ packer build -var=aws_region=us-something-1...
EOF
  }
}
```
