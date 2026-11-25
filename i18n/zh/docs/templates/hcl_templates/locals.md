---
title: 局部变量
description: >-
  `local` 和 `locals` 块定义将名称分配给表达式的局部变量。了解如何配置局部变量。
---

# 局部变量

本文提供关于 `local` 和 `locals` 块的参考信息，这些块定义可在 Packer 模板中使用的局部变量。要了解输入变量，请参阅[输入变量](/docs/templates/hcl_templates/variables)。

## 简介

局部变量将名称分配给表达式，你可以在文件夹中多次使用。表达式在运行时求值，可以引用输入变量、其他局部变量、数据源和 HCL 函数。你不能覆盖局部变量。

有关 Packer 中变量的更多信息，请参阅[输入变量和局部变量](/guides/hcl/variables)。

## 示例

局部变量在 `local` 或 `locals` 块中定义：

```hcl
# 使用 local 块允许你将局部变量标记为敏感，这将从日志中过滤其值。
local "mylocal" {
  expression = "${var.secret_api_key}"
  sensitive  = true
}

# 使用 locals 块对于声明多个局部变量更加紧凑和高效
# 多组 EC2 实例的 ID，合并在一起
locals {
  instance_ids = "${concat(aws_instance.blue.*.id, aws_instance.green.*.id)}"
}

# 计算的默认名称前缀
locals {
  default_name_prefix = "${var.project_name}-web"
  name_prefix         = "${var.name_prefix != "" ? var.name_prefix : local.default_name_prefix}"
}

# 局部变量可以使用 "local." 前缀引用。
source "virtualbox-iso" "example" {
  output = "${local.name_prefix}-files"
  # ...
}
```

命名的局部映射可以与局部映射合并以实现通用或默认值：

```hcl
# 为所有资源定义通用标签
locals {
  common_tags = {
    Component   = "awesome-app"
    Environment = "production"
  }
}

# 创建一个将通用标签与实例特定标签混合的资源。
source "amazon-ebs" "server" {
  source_ami    = "ami-123456"
  instance_type = "t2.micro"

  tags = "${merge(
    local.common_tags,
    {
      "Name" = "awesome-app-server",
      "Role" = "server"
    }
  )}"
  # ...
}
```

## 单个 `local` 块

`local` 块在文件夹中精确定义一个局部变量。块标签是局部变量的名称，"expression" 是应该求值以创建局部变量的表达式。使用此块，你可以选择性地提供 "sensitive" 布尔值来将变量标记为敏感并从日志中过滤它。

```hcl
local "mylocal" {
  expression = "${var.secret_api_key}"
  sensitive  = true
}
```

此块对于定义复杂的局部变量也非常有用。Packer 可能需要一些时间来展开和评估具有依赖于其他局部变量的复杂表达式的 `locals`。`locals` 块被读取为映射。映射没有排序，因此评估时间不是确定性的。

为避免这种情况，应该使用单个 `local` 块。这些将按照定义的顺序进行评估，评估顺序和时间将始终相同。

## `locals` 块

`locals` 块在文件夹中定义一个或多个局部变量。

`locals` 块中项目的名称在整个文件夹中必须是唯一的。给定的值可以是在当前文件夹中有效的任何表达式。

局部变量值的表达式可以引用其他局部变量，但不允许引用循环。也就是说，局部变量不能引用自身或引用（直接或间接）返回到它的变量。

建议将逻辑相关的局部变量分组到单个块中，特别是如果它们相互依赖。这将帮助读者理解变量之间的关系。相反，更倾向于在 _单独_ 的块中定义 _不相关_ 的局部变量，并考虑用描述所有封闭局部变量共同上下文的注释来注释每个块。

## 已知限制

目前不支持在数据源中使用局部变量，如下例所示。

```hcl
locals {
  cloud_owners           = ["happycloud"]
  cloud_base_filter_name = "cloud-hvm-2.0.*-x86_64-gp2"
}

data "happycloud" "happycloud-linux2-east" {
  filters = {
    name = local.cloud_base_filter_name
  }
  most_recent = true
  owners = local.cloud_owners
}
```

局部变量可以引用数据源，但数据源不能引用局部变量以避免循环依赖，其中局部变量可能引用一个引用相同局部变量或其他局部变量的数据源。目前，在数据源中引用用户输入数据的首选方法是使用 `variable` 块。

```hcl
variable "cloud_base_filter_name" {
  type     = string
  default  = "cloud-hvm-2.0.*-x86_64-gp2"
}

variable "cloud_owners" {
  type     = string
  default  = "happycloud"
}

data "happycloud" "happycloud-linux2-east" {
  filters = {
    name =  var.cloud_base_filter_name
  }
  most_recent = true
  owners = var.cloud_owners
}
```
