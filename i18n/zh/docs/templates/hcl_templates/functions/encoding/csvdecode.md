---
title: csvdecode 函数参考
description: '`csvdecode` 函数将 CSV 数据解码为映射列表。'
---

# `csvdecode` 函数

`csvdecode` 解码包含 CSV 格式数据的字符串，并生成表示该数据的映射列表。

CSV 是_逗号分隔值_，一种表格数据的编码格式。CSV 有很多变体，但此函数实现了 [RFC 4180](https://tools.ietf.org/html/rfc4180) 中定义的格式。

CSV 数据的第一行被解释为"标题"行：给定的值用作结果映射中的键。每个后续行成为结果列表中的单个映射，按索引将标题行的键与给定值匹配。文件中的所有行必须包含相同数量的字段，否则此函数将产生错误。

## 示例

```shellsession
> csvdecode("a,b,c\n1,2,3\n4,5,6")
[
  {
    "a" = "1"
    "b" = "2"
    "c" = "3"
  },
  {
    "a" = "4"
    "b" = "5"
    "c" = "6"
  }
]
```

## 与 `for_each` 元参数一起使用

你可以将 `csvdecode` 的结果与 [`for_each` 元参数](https://developer.hashicorp.com/terraform/docs/configuration/resources#for_each-multiple-resource-instances-defined-by-a-map-or-set-of-strings) 一起使用，来描述一组相似对象，这些对象的差异由给定 CSV 文件中的行描述。

CSV 文件中必须有一列可以作为每行的唯一 ID，然后我们可以将其用作 `for_each` 表达式中各个实例的跟踪键。例如：

```hcl
locals {
  # 我们在这里内联包含它以创建一个完整的示例，但在实践中
  # 这更可能使用 "file" 函数从文件加载。
  csv_data = <<-CSV
    local_id,instance_type,ami
    foo1,t2.micro,ami-54d2a63b
    foo2,t2.micro,ami-54d2a63b
    foo3,t2.micro,ami-54d2a63b
    bar1,m3.large,ami-54d2a63b
  CSV

  instances = csvdecode(local.csv_data)
}

resource "aws_instance" "example" {
  for_each = { for inst in local.instances : inst.local_id => inst }

  instance_type = each.value.instance_type
  ami           = each.value.ami
}
```

我们 `for_each` 参数中的 `for` 表达式使用 `local_id` 作为键将 `csvdecode` 生成的列表转换为映射，这告诉 Packer 使用 `local_id` 值来跟踪它创建的每个实例。Packer 将创建和管理以下实例地址：

- `aws_instance.example["foo1"]`
- `aws_instance.example["foo2"]`
- `aws_instance.example["foo3"]`
- `aws_instance.example["bar1"]`

如果你在后续计划中修改 CSV 中的一行，只要 `local_id` 值不变，Packer 将把它解释为对现有对象的更新。如果你从 CSV 中添加或删除行，Packer 将计划适当地创建或销毁关联的实例。

如果在你的 CSV 中没有合理的值可以用作唯一标识符，你可以改用 [`count` 元参数](https://developer.hashicorp.com/terraform/docs/configuration/resources#count-multiple-resource-instances-by-count) 为每个 CSV 行定义一个对象，每个对象由其在 `csvdecode` 返回的列表中的索引标识。但是，在这种情况下，如果将来对 CSV 的更新改变了列表中特定对象的位置，可能会造成破坏。我们建议使用带有唯一 ID 列的 `for_each`，使将来的更改行为更可预测。
