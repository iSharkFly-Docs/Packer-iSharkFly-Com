---
title: flatten 函数参考
description: '`flatten` 函数从列表中消除嵌套列表。了解如何在 Packer 模板中使用 `flatten` 函数。'
---

# `flatten` 函数

`flatten` 接受一个列表，并将任何作为列表的元素替换为列表内容的扁平化序列。

## 示例

```shellsession
> flatten([["a", "b"], [], ["c"]])
["a", "b", "c"]
```

如果任何嵌套列表也包含直接嵌套的列表，这些列表也会被递归扁平化：

```shellsession
> flatten([[["a", "b"], []], ["c"]])
["a", "b", "c"]
```

间接嵌套的列表，如映射中的列表，_不会_被扁平化。

## 为 `for_each` 扁平化嵌套结构

[resource `for_each`](https://developer.hashicorp.com/terraform/docs/configuration/resources#for_each-multiple-resource-instances-defined-by-a-map-or-set-of-strings) 和 [`dynamic` 块](/docs/templates/hcl_templates/expressions#dynamic-blocks) 语言特性都需要一个集合值，每次重复对应一个元素。

有时你的输入数据结构不是天然适合用于 `for_each` 参数的形状，当将嵌套数据结构简化为扁平结构时，`flatten` 可以是一个有用的辅助函数。

例如，考虑一个声明如下变量的文件夹：

```hcl
variable "networks" {
  type = map(object({
    cidr_block = string
    subnets = map(object({
      cidr_block = string
    })
  })
}
```

以上是对自然形成树形结构的对象（如顶级网络及其子网）进行建模的合理方式。顶级网络的重复可以直接使用此变量，因为它已经是结果实例与映射元素一对一匹配的形式：

```hcl
resource "aws_vpc" "example" {
  for_each = var.networks

  cidr_block = each.value.cidr_block
}
```

但是，为了用单个 `resource` 块声明所有_子网_，我们必须首先扁平化结构，以生成一个集合，其中每个顶级元素代表一个子网：

```hcl
locals {
  # flatten 确保此本地值是一个扁平的对象列表，而不是对象列表的列表。
  network_subnets = flatten([
    for network_key, network in var.networks : [
      for subnet_key, subnet in network.subnets : {
        network_key = network_key
        subnet_key  = subnet_key
        network_id  = aws_vpc.example[network_key].id
        cidr_block  = subnet.cidr_block
      }
    ]
  ])
}

resource "aws_subnet" "example" {
  # local.network_subnets 是一个列表，所以我们现在必须将它投影到一个映射，
  # 其中每个键都是唯一的。我们将组合网络和子网键以生成每个实例的单个唯一键。
  for_each = {
    for subnet in local.network_subnets : "${subnet.network_key}.${subnet.subnet_key}" => subnet
  }

  vpc_id            = each.value.network_id
  availability_zone = each.value.subnet_key
  cidr_block        = each.value_cidr_block
}
```

以上结果是每个子网对象对应一个子网实例，同时保留子网与其所属网络之间的关联。

## 相关函数

- [`setproduct`](/docs/templates/hcl_templates/functions/collection/setproduct) 查找多个列表或值集合的所有组合，这在为 `for_each` 构造准备集合时也很有用。
