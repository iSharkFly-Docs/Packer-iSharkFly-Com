---
title: setproduct 函数参考
description: |-
  `setproduct` 函数查找给定集合中元素的所有可能组合。了解如何在 Packer 模板中使用 `setproduct` 函数。
---

# `setproduct` 函数

`setproduct` 函数通过计算[笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)来查找所有给定集合中元素的所有可能组合。

```hcl
setproduct(sets...)
```

此函数特别适用于查找多个集合成员的所有组合的穷举集，例如每应用程序每环境资源。

```shellsession
> setproduct(["development", "staging", "production"], ["app1", "app2"])
[
  [
    "development",
    "app1",
  ],
  [
    "development",
    "app2",
  ],
  [
    "staging",
    "app1",
  ],
  [
    "staging",
    "app2",
  ],
  [
    "production",
    "app1",
  ],
  [
    "production",
    "app2",
  ],
]
```

你必须向此函数传递至少两个参数。

虽然主要为集合定义，但此函数也可以与列表一起使用。如果所有给定的参数都是列表，则结果是一个列表，保留给定列表的顺序。否则结果是一个集合。在任何一种情况下，结果的元素类型都是与每个给定参数依次对应的值的列表。

## 示例

上面有此函数常见用法的示例。还有一些在手动编写时不太常见但可能在可重用文件夹情况下出现的其他情况。

如果任何参数为空，则结果始终为空，类似于任何数字乘以零得零：

```shellsession
> setproduct(["development", "staging", "production"], [])
[]
```

类似地，如果所有参数都只有一个元素，则结果只有一个元素，即每个参数的第一个元素：

```shellsession
> setproduct(["a"], ["b"])
[
  [
    "a",
    "b",
  ],
]
```

每个参数的所有元素必须具有一致的类型。如果不是，Packer 将尝试转换为最通用的类型，或者如果无法进行这种转换则产生错误。例如，混合字符串和数字会导致数字被转换为字符串，以便所有结果元素都具有一致的类型：

```shellsession
> setproduct(["staging", "production"], ["a", 2])
[
  [
    "staging",
    "a",
  ],
  [
    "staging",
    "2",
  ],
  [
    "production",
    "a",
  ],
  [
    "production",
    "2",
  ],
]
```

## 为 `for_each` 查找组合

[resource `for_each`](https://developer.hashicorp.com/terraform/docs/configuration/resources#for_each-multiple-resource-instances-defined-by-a-map-or-set-of-strings) 和 [`dynamic` 块](/docs/templates/hcl_templates/expressions#dynamic-blocks) 语言特性都需要一个集合值，每次重复对应一个元素。

有时你的输入数据来自不能直接用于 `for_each` 参数的单独值，当你想要查找多个不同集合中元素的所有唯一组合时，`setproduct` 可以是一个有用的辅助函数。

例如，考虑一个声明如下变量的文件夹：

```hcl
variable "networks" {
  type = map(object({
    base_cidr_block = string
  }))
}

variable "subnets" {
  type = map(object({
    number = number
  }))
}
```

如果目标是为每个定义的网络创建每个定义的子网，创建顶级网络可以直接使用 `var.networks`，因为它已经是结果实例与映射元素一对一匹配的形式：

```hcl
resource "aws_vpc" "example" {
  for_each = var.networks

  cidr_block = each.value.base_cidr_block
}
```

但是，为了用单个 `resource` 块声明所有_子网_，我们必须首先生成一个集合，其元素代表网络和子网的所有组合，以便每个元素本身代表一个子网：

```hcl
locals {
  # setproduct 与集合和列表一起工作，但我们的变量都是映射
  # 所以我们需要先转换它们。
  networks = [
    for key, network in var.networks : {
      key        = key
      cidr_block = network.cidr_block
    }
  ]
  subnets = [
    for key, subnet in var.subnets : {
      key    = key
      number = subnet.number
    }
  ]

  network_subnets = [
    # 在 pair 中，元素零是网络，元素一是子网，
    # 包含所有唯一组合。
    for pair in setproduct(local.networks, local.subnets) : {
      network_key = pair[0].key
      subnet_key  = pair[1].key
      network_id  = aws_vpc.example[pair[0].key].id

      # cidr_block 从相应的网络派生。有关此计算如何工作的更多信息，
      # 请参阅 cidrsubnet 函数。
      cidr_block = cidrsubnet(pair[0].cidr_block, 4, pair[1].number)
    }
  ]
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

以上结果是输入变量中每个网络和子网元素组合对应一个子网实例。

## 相关函数

- [`contains`](/docs/templates/hcl_templates/functions/collection/contains) 测试给定的列表或集合是否包含给定的元素值。
- [`flatten`](/docs/templates/hcl_templates/functions/collection/flatten) 对于将层次数据扁平化为单个列表很有用，适用于两种对象类型之间的关系被显式定义的情况。
- [`setintersection`](/docs/templates/hcl_templates/functions/collection/setintersection) 计算多个集合的_交集_。
- [`setunion`](/docs/templates/hcl_templates/functions/collection/setunion) 计算多个集合的_并集_。
