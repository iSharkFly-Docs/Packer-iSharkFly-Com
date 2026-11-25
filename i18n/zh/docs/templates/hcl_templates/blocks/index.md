---
title: 内置块概述
description: 块是 Packer 模板中配置的容器。了解为 Packer 内置到 HCL 中的配置块类型。
---

# 内置块概述

本文提供内置到 Packer 语言中的配置块的概述，你可以使用这些块用 HCL2 编写 Packer 模板。

## 简介

块是配置的容器。你可以在 Packer 模板中使用以下类型的块：

- `build` 块包含用于创建特定镜像制品的构建器、配置器和后处理器的特定组合的配置。
- `source` 块包含构建器插件的配置。一旦定义，源可以被 "build" 块使用和进一步配置。
- `provisioner` 块包含配置器插件的配置。这些块嵌套在 build 块内。
- `post-processor` 和 `post-processors` 块包含后处理器插件和后处理器插件序列的配置。它们也嵌套在 `build` 块内。
- `variable` 块包含变量的配置，这些变量可以在配置中默认或由用户在运行时设置。
- `locals` 块包含可以使用 HCL 函数或数据源创建的变量的配置，或从 variables 块中创建的变量组合而成。

文档包含每种块类型的信息。

其他块，如 `packer` 块，向 Packer 核心提供关于允许运行哪个版本的信息。`required_plugins` 块帮助 Packer 核心。

块可以在多个文件中定义，`packer build folder` 将仅使用名为 `folder` 的目录中的文件进行构建。

Packer 不支持用户定义的块，因此只有语言内置的块可供使用。文档包含所有可用的内置 HCL2 块。

## 配置示例

```hcl
# variables.pkr.hcl
variable "foo" {
    type        = string
    default     = "the default value of the `foo` variable"
    description = "description of the `foo` variable"
    sensitive   = false
    # 当变量是敏感的时，该变量的所有字符串值将从 Packer 的输出中混淆。
}
```

- [Variable 块文档](/docs/templates/hcl_templates/blocks/variable)。

```hcl
# locals.pkr.hcl
locals {
    # locals 可以是裸值，如：
    wee = local.baz
    # locals 也可以用其他变量设置：
    baz = "Foo is '${var.foo}' but not '${local.wee}'"
}

# 如果你需要将 local 标记为敏感，请使用单数 local 块
local "mylocal" {
  expression = "${var.secret_api_key}"
  sensitive  = true
}
```

- [Locals 块文档](/docs/templates/hcl_templates/blocks/locals)。

```hcl
# sources.pkr.hcl
source "happycloud" "foo" {
    // ...
}
```

- [source 块文档](/docs/templates/hcl_templates/blocks/source)。

```hcl
# build.pkr.hcl
build {
    # 使用 `name` 字段在日志中命名构建。
    # 例如此配置将显示
    # "buildname.amazon-ebs.example-1" 和 "buildname.amazon-ebs.example-2"
    name = "buildname"

    sources = [
        # 使用可选的复数 `sources` 列表来简单地使用 `source`
        # 而不更改任何字段。
        "source.amazon-ebs.example-1",
    ]

    source "source.amazon-ebs.example-2" {
        # 使用单数 `source` 块设置特定字段。
        # 注意字段不能被覆盖，换句话说，你不能
        # 在顶级源块和这里同时设置 'output' 字段。
        output = "different value"
        name = "differentname"
    }

    provisioner "shell" {
        scripts = fileset(".", "scripts/{install,secure}.sh")
    }

    post-processor "shell-local" {
        inline = ["echo Hello World from ${source.type}.${source.name}"]
    }
}
```

- [build 块文档](/docs/templates/hcl_templates/blocks/build/)。

```hcl
# datasource.pkr.hcl
data "amazon-ami" "basic-example" {
  // ...
}
```

- [data 块文档](/docs/templates/hcl_templates/blocks/data)。
