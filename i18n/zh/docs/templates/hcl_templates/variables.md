---
title: 输入变量参考
description: |-
  输入变量是 Packer 模块的参数。
  了解如何在用 HCL 编写的 Packer 模板中使用输入变量语法。
---

# 输入变量

本文提供关于 Packer 模板中输入变量的参考信息。有关在 Packer 中使用局部变量的信息，请参阅[局部变量](/docs/templates/hcl_templates/locals)。

## 简介

输入变量，有时称为变量或 Packer 变量，是 Packer 构建的参数。输入变量让你可以自定义构建的各个方面，而无需更改构建本身的源代码。某些输入变量有默认值，你可以使用命令行选项、环境变量或变量定义文件来覆盖。初始覆盖后，你无法更改输入变量的值。

有关更多信息，请参阅[输入变量和局部变量](/guides/hcl/variables)。

## 声明输入变量

构建接受的每个输入变量都必须使用 `variable` 块声明：

```hcl
variable "image_id" {
  type = string
}

variable "availability_zone_names" {
  type    = list(string)
  default = ["us-west-1a"]
}

variable "docker_ports" {
  type = list(object({
    internal = number
    external = number
    protocol = string
  }))
  default = [
    {
      internal = 8300
      external = 8300
      protocol = "tcp"
    }
  ]
}
```

或者使用不太精确的 variables 块：

```hcl
variables {
   foo = "value"
   my_secret = "foo"
}
```

`variable` 关键字后面的标签或 `variables` 块的标签是变量的名称，该名称在同一构建中的所有变量中必须是唯一的。此名称用于从外部为变量赋值以及从构建内部引用变量的值。


## 参数

Packer 为变量声明定义了以下参数：

* [`default`][inpage-default] - 一个默认值，使变量变为可选。
* [`type`][inpage-type] - 此参数指定变量接受什么值类型。
* [`description`][inpage-description] - 指定输入变量的文档。
* [`validation`][inpage-validation] - 一个定义验证规则的块，通常是类型约束的补充。
* [`sensitive`][inpage-sensitive] - 使该变量的字符串值在 Packer 输出中被混淆。



### 默认值

[inpage-default]: #default-values

变量声明还可以包含 `default` 参数。如果存在，该变量被认为是 _可选的_，如果在运行 Packer 时没有设置值，将使用默认值。`default` 参数需要一个字面量值，不能引用配置中的其他对象。


### 类型约束
[inpage-type]: #type-constraints

`variable` 块中的 `type` 参数允许你限制将被接受为变量值的[值类型](/docs/templates/hcl_templates/expressions#types-and-values)。如果没有设置类型约束，则接受任何类型的值。

虽然类型约束是可选的，但我们建议指定它们；它们为构建的用户提供简单的提醒，并允许 Packer 在使用错误类型时返回有用的错误消息。

类型约束由类型关键字和类型构造函数混合创建。支持的类型关键字是：

- `string`
- `number`
- `bool`

类型构造函数允许你指定复杂类型，如集合：

- `list(<TYPE>)`
- `set(<TYPE>)`
- `map(<TYPE>)`
- `object({<ATTR NAME> = <TYPE>, ... })`
- `tuple([<TYPE>, ...])`

关键字 `any` 可用于表示接受任何类型。有关这些不同类型的含义和行为的更多信息，以及复杂类型自动转换的详细信息，请参阅[类型约束](https://developer.hashicorp.com/terraform/docs/configuration/types)。

如果同时指定了 `type` 和 `default` 参数，给定的默认值必须可转换为指定的类型。

如果只指定了 `default`，将使用默认值的类型。

当 `type` 和 `default` 都 _未_ 指定，并且你尝试[从环境变量](#environment-variables)或[从命令行](#variables-on-the-command-line)设置变量时，变量将始终被解释为字符串。

### 输入变量文档

[inpage-description]: #input-variable-documentation

因为构建的输入变量是其用户界面的一部分，你可以使用可选的 `description` 参数简要描述每个变量的用途：

```hcl
variable "image_id" {
  type        = string
  description = "The ID of the machine image (AMI) to use for the server."
}
```

描述应该简洁地解释变量的用途以及预期的值类型。此描述字符串可能包含在关于构建的文档中，因此应该从构建用户的角度编写，而不是从维护者的角度。对于构建维护者的评论，请使用注释。

### 自定义验证规则

[inpage-validation]: #custom-validation-rules

除了类型约束之外，你还可以使用嵌套在相应 `variable` 块中的一个或多个 `validation` 块为特定变量指定任意自定义验证规则：

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

`condition` 参数是一个表达式，必须使用变量的值来返回 `true`（如果值有效）或 `false`（如果无效）。表达式只能引用条件适用的变量，并且 _不能_ 产生错误。

如果表达式的失败是验证决策的基础，请使用 [`can` 函数](/docs/templates/hcl_templates/functions/conversion/can)来检测此类错误。例如：

```hcl
variable "image_id" {
  type        = string
  description = "The ID of the machine image (AMI) to use for the server."

  validation {
    # regex(...) fails if it cannot find a match
    condition     = can(regex("^ami-", var.image_id))
    error_message = "The image_id value must be a valid AMI ID, starting with \"ami-\"."
  }
}
```

如果 `condition` 评估为 `false`，将产生包含 `error_message` 中给出的句子的错误消息。错误消息字符串应该是至少一个完整的句子，解释失败的约束，使用与上面示例类似的句子结构。

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

### 抑制敏感变量

[inpage-sensitive]: #suppressing-sensitive-variables


当变量是敏感的时，该变量的所有字符串值将在 Packer 输出中被混淆：

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


## 使用输入变量值

在声明变量的构建中，可以在[表达式](/docs/templates/hcl_templates/expressions)中以 `var.<NAME>` 的形式访问其值，其中 `<NAME>` 与声明块中给出的标签匹配：

```hcl
source "googlecompute" "debian"  {
    zone = var.gcp_zone
    tags = var.gcp_debian_tags
}
```

分配给变量的值只能从声明它的文件夹内的表达式访问。


## 为输入变量赋值

在配置中声明变量后，你可以通过以下方式设置它：

- 单独使用 `-var foo=bar` 命令行选项。
- 在变量定义文件中，可以在命令行上用 `-var-files values.pkrvars.hcl` 指定或自动加载（`*.auto.pkrvars.hcl`）。
- 作为环境变量，例如：`PKR_VAR_foo=bar`

以下部分更详细地描述这些选项。

### 命令行上的变量

要在命令行上指定单个变量，请在运行 `packer build` 命令时使用 `-var` 选项：

```shellsession
$ packer build -var="image_id=ami-abc123"
$ packer build -var='image_id_list=["ami-abc123","ami-def456"]'
$ packer build -var='image_id_map={"us-east-1":"ami-abc123","us-east-2":"ami-def456"}'
```

`-var` 选项可以在单个命令中使用任意多次。

如果你计划通过命令行分配变量，我们强烈建议你至少设置默认类型而不是使用空块；这有助于 HCL 解析器理解正在设置的内容。否则，解释器将假定在命令行上设置的任何变量都是字符串。

### 标准变量定义文件

要设置大量变量，更方便的是在文件名以 `.pkrvars.hcl` 或 `.pkrvars.json` 结尾的 _变量定义文件_ 中指定它们的值，然后在命令行上用 `-var-file` 指定该文件：

```shellsession
$ packer build -var-file="testing.pkrvars.hcl"
```

变量定义文件使用与 Packer 语言文件相同的基本语法，但只包含变量名称及其分配的值：

```hcl
image_id = "ami-abc123"
availability_zone_names = [
  "us-east-1a",
  "us-west-1c",
]
```

::: warning
**重要**：与旧版 JSON 模板不同，变量定义文件中的输入变量必须在标准 HCL2 模板文件 `*.pkr.hcl` 中通过 variables 块声明，然后才能赋值。否则将在 Packer 运行时导致未知变量错误。
:::

### 自动加载的变量定义文件

Packer 还可以在存在时自动加载一个或多个变量定义文件：

- 任何名称以 `.auto.pkrvars.hcl` 或 `.auto.pkrvars.json` 结尾的文件。

名称以 `.json` 结尾的文件被解析为 JSON 对象而不是 HCL，根对象属性对应于变量名：

```json
{
  "image_id": "ami-abc123",
  "availability_zone_names": ["us-west-1a", "us-west-1c"]
}
```

::: warning
**重要**：与旧版 JSON 模板不同，变量定义文件中的输入变量必须在标准 HCL2 模板文件 `*.pkr.hcl` 中通过 variables 块声明，然后才能赋值。否则将在 Packer 运行时导致未知变量错误。
:::


### 环境变量

作为定义变量的其他方式的回退，Packer 会在其自身进程的环境中搜索名为 `PKR_VAR_` 后跟声明变量名称的环境变量。

这在自动化环境中运行 Packer 时或连续运行一系列具有相同变量的 Packer 命令时很有用。例如，在 Unix 系统上的 `bash` 提示符下：

```shellsession
$ export PKR_VAR_image_id=ami-abc123
$ packer build gcp/debian/
...
```

在环境变量名称区分大小写的操作系统上，Packer 完全按照配置中给出的方式匹配变量名称，因此所需的环境变量名称通常会有大小写字母混合，如上面的示例。

### 复杂类型值

当在变量定义文件中提供变量值时，可以使用 Packer 的[常用语法](/docs/templates/hcl_templates/expressions)来分配复杂类型的值，如列表和映射。

一些特殊规则适用于 `-var` 命令行选项和环境变量。为方便起见，Packer 默认将 `-var` 和环境变量值解释为字面字符串，不需要引号：

```shellsession
$ export PKR_VAR_image_id=ami-abc123
```

但是，如果构建变量使用[类型约束](#type-constraints)要求复杂值（list、set、map、object 或 tuple），Packer 将尝试使用变量定义文件中使用的相同语法解析其值，这需要仔细注意 shell 中的字符串转义规则：

```shellsession
$ export PKR_VAR_availability_zone_names='["us-west-1b","us-west-1d"]'
```

为了可读性，并避免担心 shell 转义，我们建议始终通过变量定义文件设置复杂变量值。

### 变量定义优先级

上述设置变量的机制可以任意组合使用。

Packer 按以下顺序加载变量，后面的来源优先于前面的：

- 环境变量（最低优先级）
- 任何 `*.auto.pkrvars.hcl` 或 `*.auto.pkrvars.json` 文件，按文件名的词法顺序处理。
- 命令行上的任何 `-var` 和 `-var-file` 选项，按提供的顺序。（最高优先级）

如果使用不同机制多次为同一变量赋值，Packer 使用它找到的 _最后一个_ 值，覆盖任何先前的值。请注意，同一变量不能在单个来源中多次赋值。

::: warning
**重要：** 具有 map 和 object 值的变量与其他变量的行为相同：找到的最后一个值覆盖先前的值。
:::

## 变量值必须是已知的：

以以下变量为例：

```hcl
variable "foo" {
  type = string
}
```

这里 `foo` 必须有一个已知值，但你可以将其默认为 `null` 以使此行为变为可选：

|                               |          no default          | `default = null` | `default = "xy"` |
| :---------------------------: | :--------------------------: | :--------------: | :--------------: |
|          foo unused           | error, "foo needs to be set" |        -         |        -         |
|            var.foo            | error, "foo needs to be set" |      null¹       |        xy        |
| `PKR_VAR_foo=yz`<br />var.foo |              yz              |        yz        |        yz        |
|  `-var foo=yz`<br />var.foo   |              yz              |        yz        |        yz        |

1：Null 是有效值。只有当接收字段需要值时，Packer 才会报错，例如：

```hcl
variable "example" {
  type = string
  default = null
}

source "example" "foo" {
  arg = var.example
}
```

在上述情况下，只要 "arg" 对于 "example" 源是可选的，就不会有错误，arg 也不会被设置。

### 设置未知变量不会总是失败：

|             Usage              |     packer validate     | any other packer command  |
| :----------------------------: | :---------------------: | :-----------------------: |
| `bar=yz` in .pkrvars.hcl file. | error, "bar undeclared" | warning, "bar undeclared" |
|   `var.bar` in .pkr.hcl file   | error, "bar undeclared" |  error, "bar undeclared"  |
|     `-var bar=yz` argument     | error, "bar undeclared" |  error, "bar undeclared"  |
|    `export PKR_VAR_bar=yz`     |            -            |             -             |
