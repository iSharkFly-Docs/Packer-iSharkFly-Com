---
title: range 函数参考
description: '`range` 函数生成数字序列。了解如何在 Packer 模板中使用 `range` 函数。'
---

# `range` 函数

`range` 使用起始值、限制值和步长值生成数字列表。

```hcl
range(max)
range(start, limit)
range(start, limit, step)
```

`start` 和 `step` 参数可以省略，在这种情况下 `start` 默认为零，`step` 默认为一或负一，取决于 `limit` 是大于还是小于 `start`。

结果列表是通过从给定的 `start` 值开始，并重复加上 `step` 直到结果等于或超过 `limit` 来创建的。

`limit` 的解释取决于 `step` 的方向：对于正步长，当下一个数字大于或等于 `limit` 时序列完成。对于负步长，当小于或等于时完成。

序列构建算法遵循以下伪代码：

```txt
let num = start
while num < limit: (或者，对于负步长，num >= limit)
  将 num 追加到序列
  num = num + step
返回序列
```

因为序列是在内存中作为物理列表创建的，Packer 对结果序列施加了 1024 个数字的人为限制，以避免无限制的内存使用，例如，如果意外地将非常大的值作为限制或非常小的值作为步长传递。如果上述算法要将第 1025 个数字追加到序列，函数会立即以错误退出。

我们建议尽可能迭代现有集合，而不是创建范围。但是，在与其他集合结合使用集合操作函数或 `for` 表达式时，创建小的数字序列有时会很有用。

## 示例

```shellsession
> range(3)
[
  0,
  1,
  2,
]

> range(1, 4)
[
  1,
  2,
  3,
]

> range(1, 8, 2)
[
  1,
  3,
  5,
  7,
]

> range(1, 4, 0.5)
[
  1,
  1.5,
  2,
  2.5,
  3,
  3.5,
]

> range(4, 1)
[
  4,
  3,
  2,
]

> range(10, 5, -2)
[
  10,
  8,
  6,
]
```

`range` 函数主要在与其他集合一起工作以生成一定数量的某物实例时有用。例如：

```hcl
variable "name_counts" {
  type    = map(number)
  default = {
    "foo" = 2
    "bar" = 4
  }
}

locals {
  expanded_names = {
    for name, count in var.name_counts : name => [
      for i in range(count) : format("%s%02d", name, i)
    ]
  }
}

output "expanded_names" {
  value = local.expanded_names
}

# 使用默认的 "name_counts" 运行时产生以下 expanded_names 值：
#
# {
#   "bar" = [
#     "bar00",
#     "bar01",
#     "bar02",
#     "bar03",
#   ]
#   "foo" = [
#     "foo00",
#     "foo01",
#   ]
# }
```
