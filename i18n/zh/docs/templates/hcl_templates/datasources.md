---
title: 数据源
description: >-
  `data` 块定义一个数据源，指示 Packer 查询在 Packer 外部定义的数据以在构建和源中使用。了解如何配置 `data` 块来定义数据源。
---

# 数据源参考

本文介绍如何在 HCL Packer 模板中使用 `data` 块配置数据源。`data` 块指示 Packer 获取或计算数据，以在 [`locals` 块](/docs/templates/hcl_templates/blocks/locals)和 [`source` 块](/docs/templates/hcl_templates/blocks/source)中使用，以便构建器可以使用在 Packer 外部定义的信息。

## 使用数据源

使用 data 块声明数据源，配置如下所示：

```hcl
data "amazon-ami" "example" {
    filters = {
        virtualization-type = "hvm"
        name = "ubuntu/images/*ubuntu-xenial-16.04-amd64-server-*"
        root-device-type = "ebs"
    }
    owners = ["099720109477"]
    most_recent = true
}
```

`data` 块请求 Packer 从给定的数据源（`"amazon-ami"`）读取并以给定的本地名称（`"example"`）导出结果。该名称用于从同一 Packer 配置中的其他位置引用此数据源。

data 块创建给定 _类型_（第一个块标签）和 _名称_（第二个块标签）的数据实例。类型和名称的组合在配置中必须是唯一的。

在块（`{ }`）内是数据实例的配置。配置取决于数据源类型，并为每个数据源记录。例如，`amazon-ami` 数据源的配置可以在 [plugins/datasources/amazon/ami](https://developer.hashicorp.com/packer/plugins/datasources/amazon/ami#configuration-reference) 找到。

数据源可以输出一个或多个属性，可以通过将其键名添加到数据源唯一标识符来使用，如 `data.<TYPE>.<NAME>.<ATTRIBUTE>`。

上面 `amazon-ami.example` 的输出可以按如下方式访问：

输出数据：

```
"data.amazon-ami.example" {
  id = "ami12345"
  name = "MyAMI"
  creation_date = "01/01/2021"
  owner = "123456789"
  owner_name = "Some Name"
  tags = {"tag1": "value"}
}
```

用法：

```hcl
// 在局部变量中
locals {
  source_ami_id = data.amazon-ami.example.id
  source_ami_name = data.amazon-ami.example.name
 }
```

```hcl
// 在源中
source "amazon-ebs" "basic-example" {
  source_ami = local.source_ami
  // ...
}
```

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


## 相关内容

- 可用数据源列表可以在[数据源](/docs/datasources/)部分找到。
- 创建你自己的[自定义数据源](/docs/plugins/creation/custom-datasources)！
