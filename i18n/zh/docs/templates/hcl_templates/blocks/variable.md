---
description: >
  `variable` 和 `input-variable` 块在 Packer 配置中定义变量。了解如何使用这些块在模板中声明变量。
title: variable 块参考
---

# `variable` 块

本文提供关于 `variable` 块的参考信息。

## 描述

`variable` 和 `input-variable` 块在 Packer 配置中定义变量。你不能在另一个 `input-variable` 块中使用 `input-variable` 块。我们建议使用 [`locals`](/docs/templates/hcl_templates/blocks/locals) 来嵌套变量。

```hcl
# variables.pkr.hcl
variable "foo" {
    type        = string
    default     = "the default value of the `foo` variable"
    description = "description of the `foo` variable"
    sensitive   = false
    # 当变量是敏感的时，该变量的所有字符串值将从 Packer 的输出中混淆。
}
```

## 默认值

如果设置了默认值，则变量是可选的。否则，变量**必须**被设置。

## 为输入变量赋值

一旦在配置中声明了变量，你可以通过以下方式设置它：

- 单独使用 `-var foo=bar` 命令行选项。
- 在变量定义文件中，可以在命令行上用 `-var-files values.pkrvars.hcl` 指定或自动加载（`*.auto.pkrvars.hcl`）。
- 作为环境变量，例如：`PKR_VAR_foo=bar`

### 自定义验证规则

[inpage-validation]: #自定义验证规则

除了类型约束之外，你还可以使用嵌套在相应 `variable` 块内的一个或多个 `validation` 块为特定变量指定任意自定义验证规则：

```hcl
variable "image_id" {
  type        = string
  description = "The ID of the machine image (AMI) to use for the server."

  validation {
    condition     = length(var.image_id) > 4 && substr(var.image_id, 0, 4) == "ami-"
    error_message = "The image_id value must be a valid AMI ID, starting with \"ami-\"."
  }
}
```

`condition` 参数是一个表达式，必须使用变量的值，如果值有效则返回 `true`，如果无效则返回 `false`。表达式只能引用条件适用的变量，并且_不能_产生错误。

如果表达式的失败是验证决策的基础，请使用 [`can` 函数](/docs/templates/hcl_templates/functions/conversion/can)来检测此类错误。例如：

```hcl
variable "image_id" {
  type        = string
  description = "The ID of the machine image (AMI) to use for the server."

  validation {
    # regex(...) 如果找不到匹配项则失败
    condition     = can(regex("^ami-", var.image_id))
    error_message = "The image_id value must be a valid AMI ID, starting with \"ami-\"."
  }
}
```

如果 `condition` 评估为 `false`，将产生包含 `error_message` 中给出的句子的错误消息。错误消息字符串应该至少是一个完整的句子，解释失败的约束，使用与上述示例类似的句子结构。

验证也适用于更复杂的情况：

```hcl
variable "image_metadata" {

  default = {
    key: "value",
    something: {
      foo: "bar",
    }
  }

  validation {
    condition     = length(var.image_metadata.key) > 4
    error_message = "The image_metadata.key field must be more than 4 runes."
  }

  validation {
    condition     = can(var.image_metadata.something.foo)
    error_message = "The image_metadata.something.foo field must exist."
  }

  validation {
    condition     = substr(var.image_metadata.something.foo, 0, 3) == "bar"
    error_message = "The image_metadata.something.foo field must start with \"bar\"."
  }

}
```

从文件中分配变量的示例：

```hcl
# foo.pkrvars.hcl
foo = "value"
```

## 变量值必须是已知的：

以以下变量为例：

```hcl
variable "foo" {
  type = string
}
```

这里 `foo` 必须有一个已知的值，但你可以将其默认为 `null` 以使此行为成为可选的：

|                               |          无默认值            | `default = null` | `default = "xy"` |
| :---------------------------: | :--------------------------: | :--------------: | :--------------: |
|          foo 未使用           | 错误，"foo needs to be set"   |        -         |        -         |
|            var.foo            | 错误，"foo needs to be set"   |      null¹       |        xy        |
| `PKR_VAR_foo=yz`<br />var.foo |              yz              |        yz        |        yz        |
|  `-var foo=yz`<br />var.foo   |              yz              |        yz        |        yz        |

1：Null 是一个有效的值。Packer 只会在接收字段需要值时出错，例如：

```hcl
variable "example" {
  type = string
  default = null
}

source "example" "foo" {
  arg = var.example
}
```

在上述情况下，只要 "arg" 对于 "example" 源是可选的，就没有错误，arg 不会被设置。

### 抑制敏感变量

[inpage-sensitive]: #抑制敏感变量

当变量是敏感的时，该变量的所有字符串值将从 Packer 的输出中混淆：

```hcl
# var-foo.pkr.hcl
variable "foo" {
    sensitive = true
    default   = {
        key = "SECR3TP4SSW0RD"
    }
}
```

```shellsession
$ packer inspect var-foo.pkr.hcl
Packer Inspect: HCL2 mode

> input-variables:
var.foo: "{\n  \"key\" = \"<sensitive>\"\n }"
...
```

# 更多关于变量的内容

- 阅读[完整变量](/docs/templates/hcl_templates/variables)描述以获得更全面的了解。
- 阅读[变量指南](/guides/hcl/variables)以获得更多示例。
