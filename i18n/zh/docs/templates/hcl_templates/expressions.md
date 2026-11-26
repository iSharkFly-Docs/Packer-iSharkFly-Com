---
title: HCL 表达式参考
description: |-
  HCL 表达式提供对数据源导出的数据的访问，并将数据转换和组合成其他值。了解如何在 Packer 模板中使用 HCL 表达式。
---

# HCL 表达式参考

本文提供关于可在 Packer HCL 模板中使用的表达式的参考信息。

## 简介

_表达式_ 用于引用或计算配置中的值。最简单的表达式只是字面值，如 `"hello"` 或 `5`，但 HCL 也允许更复杂的表达式，如引用源导出的数据、算术运算、条件求值以及许多内置函数。

表达式可以在 HCL 中的许多地方使用，但某些上下文限制允许使用哪些表达式结构，例如要求特定类型的字面值或禁止某些表达式。每个语言特性的文档描述了它对表达式的任何限制。

本页的其余部分描述了 Packer 表达式语法的所有特性。

## 类型和值

表达式的结果是一个 _值_。所有值都有一个 _类型_，它决定了该值可以在哪里使用以及可以对其应用哪些转换。

HCL 对其值使用以下类型：

- `string`：表示某些文本的 Unicode 字符序列，如 `"hello"`。
- `number`：数值。`number` 类型可以表示整数（如 `15`）和小数值（如 `6.283185`）。
- `bool`：`true` 或 `false`。`bool` 值可用于条件逻辑。
- `list`（或 `tuple`）：值的序列，如 `["us-west-1a", "us-west-1c"]`。列表或元组中的元素由从零开始的连续整数标识。
- `map`（或 `object`）：由命名标签标识的一组值，如 `{name = "Mabel", age = 52}`。

字符串、数字和布尔值有时被称为 _原始类型_。列表/元组和映射/对象有时被称为 _复杂类型_、_结构类型_ 或 _集合类型_。

最后，有一个特殊值 _没有_ 类型：

- `null`：表示 _缺失_ 或 _省略_ 的值。如果你将源或模块的参数设置为 `null`，Packer 的行为就像你完全省略了它——如果参数有默认值则使用默认值，如果参数是必需的则引发错误。`null` 在条件表达式中最有用，因此你可以在条件不满足时动态省略参数。

### 高级类型详情

在大多数情况下，列表和元组的行为相同，映射和对象也是如此。每当区别不相关时，Packer 文档会交替使用每对术语（历史上偏好 "list" 和 "map"）。

但是，插件作者应该理解这些类似类型（以及相关的 `set` 类型）之间的区别，因为它们提供了不同的方式来限制输入变量和源参数的允许值。

### 类型转换

表达式最常用于设置参数的值。在这些情况下，参数有一个预期类型，给定的表达式必须产生该类型的值。

在可能的情况下，Packer 会自动将值从一种类型转换为另一种类型以产生预期类型。如果无法做到这一点，Packer 将产生类型不匹配错误，你必须使用更合适的表达式更新配置。

Packer 在需要时自动将数字和布尔值转换为字符串。它也会将字符串转换为数字或布尔值，只要字符串包含数字或布尔值的有效表示。

- `true` 转换为 `"true"`，反之亦然
- `false` 转换为 `"false"`，反之亦然
- `15` 转换为 `"15"`，反之亦然

## 字面表达式

_字面表达式_ 是直接表示特定常量值的表达式。Packer 对上述每种值类型都有字面表达式语法：

- 字符串通常由双引号括起的 Unicode 字符序列表示，`"like this"`。对于更复杂的字符串，还有 "heredoc" 语法。字符串字面量是 Packer 中最复杂的字面表达式类型，本页有额外的文档：
  - 有关转义序列和 heredoc 语法的信息，请参阅下面的[字符串字面量](#字符串字面量)。
  - 有关插值和模板指令的信息，请参阅下面的[字符串模板](#字符串模板)。
- 数字由带或不带小数点的未引用数字序列表示，如 `15` 或 `6.283185`。
- 布尔值由未引用的符号 `true` 和 `false` 表示。
- null 值由未引用的符号 `null` 表示。
- 列表/元组由一对包含逗号分隔值序列的方括号表示，如 `["a", 15, true]`。

  列表字面量可以分成多行以提高可读性，但值之间始终需要逗号。最后一个值后面的逗号是允许的，但不是必需的。列表中的值可以是任意表达式。

- 映射/对象由一对包含一系列 `<KEY> = <VALUE>` 对的花括号表示：

  ```hcl
  {
    name = "John"
    age  = 52
  }
  ```

  键/值对可以用逗号或换行符分隔。值可以是任意表达式。键是字符串；如果它们是有效的[标识符](/docs/templates/hcl_templates/syntax#identifiers)，可以不加引号，否则必须加引号。你可以通过用括号包装来使用非字面表达式作为键，如 `(var.business_unit_tag_name) = "SRE"`。

## 对命名值的引用

Packer 提供一个命名值。

以下命名值可用：

- `source.<SOURCE TYPE>.<NAME>` 是表示给定类型和名称的[源](/docs/templates/hcl_templates/blocks/source)的对象。

### 可用函数

有关可用函数的完整列表，请参阅[函数参考](/docs/templates/hcl_templates/functions/)。

## 条件表达式

条件表达式使用布尔表达式的值来选择两个值之一。这是在表达式内表达 `if-then-else` 逻辑的紧凑方式。

条件表达式的语法是：

```hcl
condition ? true_val : false_val
```

如果 `condition` 为 `true`，表达式返回 `true_val`。如果 `condition` 为 `false`，它返回 `false_val`。`true_val` 和 `false_val` 参数必须是兼容的类型。

### 示例

以下是一些如何使用条件表达式的示例。

1.  设置默认值

    你可以使用条件为可以自定义的变量提供默认值。

    ```hcl
    locals {
      # 如果 var.region 不为空，将 region 设置为 var.region 的值。
      # 否则，使用默认值。
      region = var.region != "" ? var.region : "us-east-1"
    }
    ```

2.  动态省略参数

    你可以使用 `null` 值从源中动态省略参数。这是一种常见模式，可以有效地"关闭"或阻止设置参数。

    ```hcl
    variable "use_http" {
      type        = bool
      description = "Whether to use HTTP for file transfer."
      default     = true
    }

    source "example" "foo" {
      # http_directory 参数仅在 var.use_http 为 true 时设置。
      # 如果为 false，http_directory 将不会被设置。
      http_directory = var.use_http ? "/path/to/files" : null
    }
    ```

    这也可以用于设置两个互斥参数之一：

    ```hcl
    source "builder" "example" {
      # 如果 var.use_http 为 true，http_content 被设置，cd_content 为 null。
      # 如果 var.use_http 为 false，http_content 为 null，cd_content 被设置。
      http_content = var.use_http ? local.http_files : null
      cd_content   = !var.use_http ? local.cd_files : null
    }
    ```

### 可读性和推荐实践

虽然功能强大，但如果不小心使用，条件表达式可能导致复杂或难以阅读的配置。

  * **优先考虑清晰性：** 当条件表达式变得非常长或涉及多个嵌套条件时，考虑将其分解。

  * **利用 `locals` 处理复杂性：** 对于更复杂的条件逻辑，在 `local` 变量中定义结果。这提高了使用 `local` 的主 `source` 或 `provisioner` 块中的可读性。

    **示例：**

    ```hcl
    locals {
      # 根据构建环境确定 kickstart 文件。
      kickstart_config_path = var.environment == "production" ?
                              "config/prod-ks.cfg" :
                              (var.environment == "staging" ?
                               "config/stage-ks.cfg" :
                               "config/dev-ks.cfg")
    }

    source "builder" "example" {
      # ...
      # 使用预先确定的 kickstart 路径。
      http_content = file(local.kickstart_config_path)
      # ...
    }
    ```

  * **使用 `null` 省略参数：** 如示例所示，使用 `null` 是防止设置参数或根据条件有效"关闭"设置的惯用方式。

## `for` 表达式

_`for` 表达式_ 通过转换另一个复杂类型值来创建复杂类型值。输入值中的每个元素可以对应结果中的一个或零个值，并且可以使用任意表达式将每个输入元素转换为输出元素。

例如，如果 `var.list` 是字符串列表，则以下表达式产生所有字母大写的字符串列表：

```hcl
[for s in var.list : upper(s)]
```

此 `for` 表达式迭代 `var.list` 的每个元素，然后对每个相应的元素设置 `s` 并求值表达式 `upper(s)`。然后它按相同顺序构建一个包含执行该表达式的所有结果的新元组值。

`for` 表达式周围的括号类型决定了它产生的结果类型。上面的示例使用 `[` 和 `]`，这产生一个元组。如果改用 `{` 和 `}`，结果是一个对象，并且必须提供两个由 `=>` 符号分隔的结果表达式：

```hcl
{for s in var.list : s => upper(s)}
```

此表达式产生一个对象，其属性是 `var.list` 中的原始元素，其对应的值是大写版本。

`for` 表达式还可以包含可选的 `if` 子句来过滤源集合中的元素，这可以产生比源元素更少的值：

```txt
[for s in var.list : upper(s) if s != ""]
```

源值也可以是对象或映射值，在这种情况下，可以提供两个临时变量名来分别访问键和值：

```txt
[for k, v in var.map : length(k) + length(v)]
```

最后，如果结果类型是对象（使用 `{` 和 `}` 分隔符），则值结果表达式后面可以跟 `...` 符号，以将具有共同键的结果分组在一起：

```txt
{for s in var.list : substr(s, 0, 1) => s... if s != ""}
```

## Splat 表达式

_splat 表达式_ 提供了一种更简洁的方式来表达否则可以用 `for` 表达式执行的常见操作。

如果 `var.list` 是所有对象都有 `id` 属性的对象列表，则可以使用以下 `for` 表达式生成 ID 列表：

```hcl
[for o in var.list : o.id]
```

这等同于以下 _splat 表达式_：

```hcl
var.list[*].id
```

特殊的 `[*]` 符号迭代左侧给定列表的所有元素，并从每个元素访问右侧给定的属性名。splat 表达式还可以通过将操作序列扩展到符号右侧来访问复杂类型列表的属性和索引：

```hcl
var.list[*].interfaces[0].name
```

上面的表达式等同于以下 `for` 表达式：

```hcl
[for o in var.list : o.interfaces[0].name]
```

Splat 表达式仅用于列表（因此不能用于[引用使用 `for_each` 创建的资源](https://developer.hashicorp.com/terraform/docs/configuration/resources#referring-to-instances)，它们表示为映射）。但是，如果 splat 表达式应用于 _不是_ 列表或元组的值，则该值在处理之前会自动包装在单元素列表中。

例如，`var.single_object[*].id` 等同于 `[var.single_object][*].id`，或实际上等同于 `[var.single_object.id]`。这种行为在大多数情况下并不有趣，但在引用可能设置或未设置 `count` 的资源时特别有用，因此可能产生或不产生元组值：

```hcl
aws_instance.example[*].id
```

无论 `aws_instance.example` 是否设置了 `count`，上面都将产生一个 ID 列表，避免在特定资源切换到和从设置 `count` 时需要修改配置中的各种其他表达式。

## `dynamic` 块

在顶级块构造（如 [source](/docs/templates/hcl_templates/blocks/source)）中，表达式通常只能在使用 `name = expression` 或 `key = expression` 形式为参数赋值时使用。这涵盖了许多用途，但某些源类型在其参数中包含可重复的 _嵌套块_，它们不接受表达式：

```hcl
source "amazon-ebs" "example" {
  name = "pkr-test-name" # 这里可以使用表达式

  tag {
    # 但 "tag" 块始终是字面块
  }
}
```

你可以使用特殊的 `dynamic` 块类型动态构造像 `tag` 这样的可重复嵌套块，它在顶级块构造中受支持，示例：

```hcl
locals {
  standard_tags = {
    Component   = "user-service"
    Environment = "production"
  }
}

source "amazon-ebs" "example" {
  # ...

  tag {
    key                 = "Name"
    value               = "example-asg-name"
  }

  dynamic "tag" {
    for_each = local.standard_tags

    content {
      key                 = tag.key
      value               = tag.value
    }
  }
}
```

`dynamic` 块的行为很像 `for` 表达式，但产生嵌套块而不是复杂类型值。它迭代给定的复杂值，并为该复杂值的每个元素生成一个嵌套块。

- dynamic 块的标签（上面示例中的 `"tag"`）指定要生成的嵌套块的类型。
- `for_each` 参数提供要迭代的复杂值。
- `iterator` 参数（可选）设置表示复杂值当前元素的临时变量的名称。如果省略，变量的名称默认为 `dynamic` 块的标签（上面示例中的 `"tag"`）。
- `labels` 参数（可选）是一个字符串列表，按顺序指定每个生成块要使用的块标签。你可以在此值中使用临时迭代器变量。
- 嵌套的 `content` 块定义每个生成块的主体。你可以在此块内使用临时迭代器变量。

由于 `for_each` 参数接受任何集合或结构值，你可以使用 `for` 表达式或 splat 表达式来转换现有集合。

迭代器对象（上面示例中的 `tag`）有两个属性：

- `key` 是当前元素的映射键或列表元素索引。如果 `for_each` 表达式产生 _set_ 值，则 `key` 与 `value` 相同，不应使用。
- `value` 是当前元素的值。

`dynamic` 块只能为属于正在配置的源类型、数据源或配置器的嵌套块生成参数。

`for_each` 值必须是每个所需嵌套块有一个元素的映射或集合。如果你需要根据嵌套数据结构或来自多个数据结构的元素组合来声明资源实例，可以使用表达式和函数派生合适的值。有关此类情况的一些常见示例，请参阅 [`flatten`](/docs/templates/hcl_templates/functions/collection/flatten) 和 [`setproduct`](/docs/templates/hcl_templates/functions/collection/setproduct) 函数。

### `dynamic` 块的最佳实践

过度使用 `dynamic` 块会使配置难以阅读和维护，因此我们建议只在需要隐藏细节以构建可重用代码的简洁用户界面���才使用它们。尽可能始终字面写出嵌套块。

## 字符串字面量

HCL 有两种不同的字符串字面量语法。最常见的是用引号字符（`"`）分隔字符串，如 `"hello"`。在带引号的字符串中，反斜杠字符用作转义序列，以下字符选择转义行为：

| 序列         | 替换                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| `\n`         | 换行                                                                           |
| `\r`         | 回车                                                                           |
| `\t`         | 制表符                                                                         |
| `\"`         | 字面引号（不终止字符串）                                                       |
| `\\`         | 字面反斜杠                                                                     |
| `\uNNNN`     | 基本多语言平面中的 Unicode 字符（NNNN 是四个十六进制数字）                     |
| `\UNNNNNNNN` | 补充平面中的 Unicode 字符（NNNNNNNN 是八个十六进制数字）                       |

字符串字面量的替代语法是所谓的 Here Documents 或 "heredoc" 样式，受 Unix shell 语言启发。这种样式允许通过在单独一行上使用自定义分隔符词来关闭字符串，从而更清楚地表达多行字符串：

```hcl
<<EOF
hello
world
EOF
```

行尾跟随任何标识符的 `<<` 标记引入序列。然后 Packer 处理后续行，直到找到完全由引导器中给出的标识符组成的一行。在上面的示例中，`EOF` 是选定的标识符。任何标识符都是允许的，但按照惯例，此标识符全部大写并以 `EO` 开头，表示"结束"。这里的 `EOF` 代表"文本结束"。

上面显示的 "heredoc" 形式要求后续行与左边距齐平，当表达式在缩进块内时这可能很尴尬：

```hcl
block {
  value = <<EOF
hello
world
EOF
}
```

为了改进这一点，Packer 还接受由 `<<-` 序列引入的 _缩进_ heredoc 字符串变体：

```hcl
block {
  value = <<-EOF
  hello
    world
  EOF
}
```

在这种情况下，Packer 分析序列中的行以找到前导空格最少的行，然后从所有行的开头修剪那么多空格，导致以下结果：

```txt
hello
  world
```

在 heredoc 字符串表达式中不解释反斜杠序列。相反，反斜杠字符被字面解释。

在带引号和 heredoc 字符串表达式中，Packer 支持以 `${` 和 `%{` 开头的模板序列。这些在下一节中有更详细的描述。要 _字面_ 包含这些序列而不开始模板序列，将前导字符加倍：`$${` 或 `%%{`。

## 字符串模板

在带引号和 heredoc 字符串表达式中，`${` 和 `%{` 序列开始 _模板序列_。模板让你直接将表达式嵌入字符串字面量中，从其他值动态构造字符串。

以下示例演示了如何使用模板序列将变量的值嵌入可用作脚本内容的字符串中：

```hcl
locals {
  packages = ["git", "curl", "vim"]

  install_packages = <<-EOF
    #!/bin/bash
    if [ ${length(local.packages)} -eq 0 ]; then
      echo "No packages to install."
      exit 1
    fi
    apt-get update
    %{ for package in local.packages ~}
    apt-get install -y ${package}
    %{ endfor ~}
  EOF
}

source "amazon-ebs" "example" {
  # ...
}

build {
  sources = ["source.amazon-ebs.example"]

  provisioner "shell" {
    inline = [local.install_packages]
  }
}
```

这可以使用 `packer console` 命令测试：

```shell
$ packer source.pkr.hcl

> local.install_packages

> #!/bin/bash
if [ 3 -eq 0 ]; then
  echo "No packages to install."
  exit 1
fi
apt-get update
    apt-get install -y git
    apt-get install -y curl
    apt-get install -y vim
```
