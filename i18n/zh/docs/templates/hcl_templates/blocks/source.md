---
description: |
  `source` 块定义可重用的构建器配置块。了解如何使用 `source` 块定义可重用的构建器。
title: source 块参考
---

# `source` 块

本文提供关于 `source` 块的参考信息。

## 描述

`source` 块定义可重用的构建器配置块。构建器通常用于自定义插件中。

## 示例

以下示例为名为 `foo` 的构建器类型 `happycloud` 定义了一个源：

```hcl
# sources.pkr.hcl
source "happycloud" "foo" {
    // ...
}
```

只有一个 `source.happycloud.foo` 顶级源块，但它可以被多次使用。

你可以通过从 [`build` 块](/docs/templates/hcl_templates/blocks/build/)引用 `source` 块来启动构建器：

```hcl
build {
  sources = [
    # 这里 Packer 在保存镜像时将使用默认的 ami_name。
    "source.happycloud.example",
    "source.happycloud.foo",
  ]
}
```

构建级别的 [`source` 块](/docs/templates/hcl_templates/blocks/build/source)允许设置特定的源字段。每个字段只能定义一次，目前不允许覆盖值。

```hcl
build {
  source "source.happycloud.example" {
    # 这里 Packer 将使用提供的 image_name 而不是默认值。
    # 注意字段不能被覆盖，换句话说，你不能
    # 在顶级源块和这里同时设置 'image_name' 字段
    image_name = "build_specific_field"
  }
}
```

## 源变量

使用以下语法从配置器和后处理器访问 `source` 的 `name` 和 `type`：

```
<build-name>.<source-type>.<source-name>
```

以下示例查询构建中使用的源名称：

```hcl
source "null" "first-example" {
  communicator = "none"
}

build {
  name = "roles"

  source "null.first-example" {
    name = "consul"
  }
  source "null.first-example" {
    name = "nomad"
  }
  source "null.first-example" {
    name = "vault"
  }
  sources = ["null.first-example"]

  provisioner "shell-local" {
    inline = ["echo ${source.name} and ${source.type}"]
  }
}
```

示例返回以下值：

- `roles.null.consul`：返回 `consul` 和 `null`
- `roles.null.nomad`：返回 `nomad` 和 `null`
- `roles.null.vault`：返回 `vault` 和 `null`
- `roles.null.first-example`：返回 `first-example` 和 `null`

## 相关内容

- 有关 Packer 构建器的信息，请参阅[构建器参考概述](/docs/builders/)。

- 有关社区维护的构建器的信息，请参阅[社区构建器参考](/docs/community-tools#community-builders)。

- 有关如何创建自己的构建器的说明，请参阅[创建自定义构建器](/docs/plugins/creation/custom-builders)。
