---
title: JSON 语法参考
description: |-
  JSON 配置将 HCL Packer 模板表达为 JSON 兼容的语法。了解用于创建 HCL Packer 模板的 JSON 语法。
---

# JSON 语法参考

本文提供关于可用于将 HCL Packer 模板表达为 JSON 的 JSON 语法的参考信息。有关 HCL 语法的信息，请参阅 [HCL 语法参考](/docs/templates/hcl_templates/syntax)。

## 简介

Packer 支持用 JSON 编写的模板，这在以编程方式生成配置的部分内容时很有用。这是因为你可以使用现有的 JSON 库来准备生成的配置文件。

此语法不要与 1.5 版本之前的"旧版" Packer 模板混淆，那些模板完全是 JSON 格式并遵循不同的格式。

JSON 语法是根据原生语法定义的。原生语法中可以表达的所有内容也可以用 JSON 语法表达，但由于 JSON 语法的限制，某些结构在 JSON 中表示更加复杂。

Packer 期望以 `.pkr.hcl` 后缀命名的文件使用原生语法，以 `.pkr.json` 后缀命名的文件使用 JSON 语法。如果你省略后缀中的 `.pkr` 部分，Packer 将尝试将你的 json 文件作为旧版 Packer 模板读取。

底层 JSON 语法与原生语法一样，是根据称为 _HCL_ 的规范定义的。使用 Packer 不需要了解 HCL 语法或其 JSON 映射的所有细节，因此本页总结了原生语法和 JSON 语法之间最重要的区别。如果你有兴趣，可以在[其规范](https://github.com/hashicorp/hcl/blob/hcl2/hclsyntax/spec.md)中找到 HCL 的 JSON 语法的完整定义。

## JSON 文件结构

任何基于 JSON 的 Packer 配置的根部是一个 JSON 对象。此对象的属性对应于 Packer 语言的顶级块类型。例如：

```json
{
  "variables": {
    "example": "value"
  }
}
```

每个顶级对象属性必须匹配预期顶级块类型之一的名称。期望标签的块类型（如上面显示的 `variable`）由每个标签级别的一个嵌套对象值表示。`source` 块期望两个标签，因此需要两级嵌套：

```json
{
  "source": {
    "amazon-ebs": {
      "example": {
        "instance_type": "t2.micro",
        "ami_name": "ami-abc123"
      }
    }
  }
}
```

在表示标签的任何嵌套对象之后，最后一个嵌套对象表示块本身的主体。在上面的示例中，`source "amazon-ebs" "example"` 的 `instance_type` 和 `ami_name` 参数被指定。

综合起来，上面两个配置文件等同于原生语法中的以下块：

```hcl
variables {
  example = "value"
}

source "amazon-ebs" "example" {
  instance_type = "t2.micro"
  ami_name      = "ami-abc123"
}
```

在每个顶级块类型中，映射到 JSON 的规则略有不同（请参见下面的[块类型特定例外](#块类型特定例外)），但以下一般规则在大多数情况下适用：

- 表示块主体的 JSON 对象包含对应于参数名称或嵌套块类型名称的属性。

- 当属性对应于在原生语法中接受[任意表达式](/docs/templates/hcl_templates/expressions)的参数时，属性值按照下面[_表达式映射_](#表达式映射)中描述的方式映射到表达式。对于 _不_ 接受任意表达式的参数，属性值的解释取决于参数，如本页后面给出的[块类型特定例外](#块类型特定例外)中所述。

- 当属性名称对应于预期的嵌套块类型名称时，该值按照下面[_嵌套块映射_](#嵌套块映射)中描述的方式解释，除非在本页后面给出的[块类型特定例外](#块类型特定例外)中另有说明。

## 表达式映射

由于 JSON 语法无法表示所有 Packer 语言[表达式语法](/docs/templates/hcl_templates/expressions)，作为表达式解释的 JSON 值映射如下：

| JSON   | Packer 语言解释                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 布尔值 | 字面 `bool` 值。                                                                                                                      |
| 数字   | 字面 `number` 值。                                                                                                                    |
| 字符串 | 解析为[字符串模板](/docs/templates/hcl_templates/expressions#string-templates)然后按下面描述的方式求值。                                |
| 对象   | 每个属性值按此表映射，产生具有适当属性类型的 `object(...)` 值。                                                                        |
| 数组   | 每个元素按此表映射，产生具有适当元素类型的 `tuple(...)` 值。                                                                           |
| Null   | 字面 `null`。                                                                                                                         |

当在期望任意表达式的位置遇到 JSON 字符串时，其值首先被解析为[字符串模板](/docs/templates/hcl_templates/expressions#string-templates)，然后进行求值以产生最终结果。

如果给定的模板 _仅_ 由单个插值序列组成，则直接获取其表达式的结果，而不首先将其转换为字符串。这允许在 JSON 语法中使用非字符串表达式。

## 嵌套块映射

当 JSON 对象属性以嵌套块类型命名时，此属性的值表示该类型的一个或多个块。属性的值必须是 JSON 对象或 JSON 数组。

最简单的情况是当该类型不期望标签时仅表示给定类型的单个块，如 `source` 块中使用的 `tags` 嵌套块：

```json
{
  "source": {
    "amazon-ebs": {
      "example": {
        "tags": {
          "key": "value"
        }
      }
    }
  }
}
```

上面等同于以下原生语法配置：

```hcl
source "amazon-ebs" "example" {
  tags = {
    key = "value"
  }
}
```

当嵌套块类型需要一个或多个标签，或者可以给出相同类型的多个块时，映射会变得稍微复杂一些。例如，`build` 块中使用的 `provisioner` 嵌套块类型期望一个标签来指定要使用的配置器，并且配置器块的顺序对决定操作顺序很重要。

以下原生语法示例显示了一个具有多个不同类型配置器的 `build` 块：

```hcl
build {
  # (为简洁起见省略源配置)

  provisioner "shell-local" {
    inline = ["echo 'Hello World' >example.txt"]
  }
  provisioner "file" {
    source      = "example.txt"
    destination = "/tmp/example.txt"
  }
  provisioner "shell" {
    inline = [
      "sudo install-something -f /tmp/example.txt",
    ]
  }
}
```

为了保持这些块的顺序，你必须使用 JSON 数组作为表示此块类型的属性的直接值，如上面的 JSON 等价物所示：

```json
{
  "build": {
    "//": "(为简洁起见省略源配置)",

    "provisioner": [
      {
        "shell-local": {
          "inline": ["echo 'Hello World' >example.txt"]
        }
      },
      {
        "file": {
          "source": "example.txt",
          "destination": "/tmp/example.txt"
        }
      },
      {
        "shell": {
          "inline": ["sudo install-something -f /tmp/example.txt"]
        }
      }
    ]
  }
}
```

`provisioner` 数组的每个元素是一个具有单个属性的对象，其名称表示每个 `provisioner` 块的标签。对于期望多个标签的块类型，可以为每个附加级别使用这种交替数组和对象嵌套的模式。

如果嵌套块类型需要标签但顺序 _不_ 重要，你可以省略数组并仅提供单个对象，其属性名称对应于唯一的块标签。这是上述简单情况的简写，但交替数组和对象方法是最通用的。如果从原生语法系统地转换为 JSON，我们建议使用最通用的形式，以确保配置的含义完全保留。

### 注释属性

虽然我们不建议手动编辑 JSON 语法配置文件——这种格式主要用于程序化生成和消费——但在表示块主体的 JSON 对象中，使用特殊属性名称允许有限形式的 _注释_：

```json
{
  "source": {
    "amazon-ebs": {
      "example": {
        "//": "此实例运行备份的计划任务",

        "instance_type": "t2.micro",
        "ami_name": "ami-abc123"
      }
    }
  }
}
```

在表示块主体的任何对象中，名为 `"//"` 的属性完全被 Packer 忽略。此例外 _不_ 适用于被[解释为表达式](#表达式映射)的对象，在那里这将被解释为名为 `"//"` 的对象类型属性。

这个特殊属性名称也可以在基于 JSON 的配置文件的根部使用。这对于注明哪个程序创建了该文件很有用。

```json
{
  "//": "此文件由 generate-outputs.py 生成。请勿手动编辑！"
}
```

## 块类型特定例外

[inpage-block]: #块类型特定例外

特定块类型中的某些参数以特殊方式处理，因此它们到 JSON 语法的映射不遵循上述一般规则。以下子部分描述了适用于每种顶级块类型的特殊映射规则。

### `variable` 块

`variable` 块内的所有参数都有非标准的 JSON 映射：

- `type`：包含类型表达式的字符串，如 `"string"` 或 `"list(string)"`。
- `default`：可以转换为给定类型的字面 JSON 值。此值内的字符串按字面意思理解，_不_ 被解释为字符串模板。
- `description`：字面 JSON 字符串，_不_ 被解释为模板。

```json
{
  "variable": {
    "example": {
      "type": "string",
      "default": "hello"
    }
  }
}
```
