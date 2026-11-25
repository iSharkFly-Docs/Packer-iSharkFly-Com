---
description: |
  了解 JSON 和 HCL2 模板之间的区别，以及将模板转换为 HCL 如何影响插件。
title: HCL2 和 JSON 模板之间的区别
---

# HCL2 和 JSON 模板之间的区别

本文档解释 JSON 到 HCL2 模板之间的区别，包括将 JSON 模板转换为 HCL2 如何影响构建器、配置器和后处理器的行为。

## 简介

Packer 使用 JSON 或 HCL2 模板来编排一个或多个制品的构建。

在[旧版 JSON 模板](/docs/templates/legacy_json_templates/)中，声明一系列构建器、配置器和后处理器来构建镜像。

在 [HCL2 模板](/docs/templates/hcl_templates/)中，你可以通过源指定构建器并将它们收集到 build 块中。

在将现有 JSON 模板转换为 HCL2 时，可以使用 `packer hcl2_upgrade` 命令。有关其用法的更多信息，请参阅 [hcl2_upgrade](/docs/commands/hcl2_upgrade) 页面。


## 构建器

构建器是专门用于某个平台的组件。它们的作用是为让你从配置模板构建最终镜像的步骤做好准备。

### JSON

在 JSON 中，`builders` 属性声明如何调用构建器来构建镜像。

```json
{
  "builders": [
    {
      "type": "null",
      "name": "test",
      "communicator": "none"
    }
  ]
}
```

### HCL2

在 HCL2 中，构建器通过 `source` 块声明。源本身是不够的，必须在 `build` 块中调用。
`build` 块作为所有步骤（即 `source`、`provisioners` 和 `post-processors`）的容器，用于从空白镜像到完成的镜像。

```hcl
source "null" "test" {
  communicator = "none"
}

build {
  sources = ["null.test"]
}
```

## 配置器

配置器是修改你正在构建的机器镜像状态的组件。它们可用于安装软件包、将数据写入远程文件系统或执行远程命令。它们可以在 JSON 或 HCL 模板中定义。

### JSON

在 JSON 模板中，配置器在模板的顶层声明为按顺序调用的组件数组，用于配置你正在构建的镜像。它们适用于模板中定义的所有构建器。

```json
{
  "builders": [
    {
      "type": "null",
      "name": "test",
      "communicator": "none"
    }
  ],
  "provisioners": [
    {
      "type": "shell-local",
      "inline": ["echo test"]
    }
  ]
}
```

### HCL2

在 HCL2 中，配置器在 `build` 块中声明，仅适用于作为此 build 块一部分调用的源。
这使你可以声明多个 build 块，每个都有自己的一组配置器，这将导致多个不同的构建并行执行。

```hcl
source "null" "test" {
  communicator = "none"
}

build {
  sources = ["null.test"]

  provisioner "shell-local" {
    inline = ["echo test"]
  }
}
```

## 后处理器

后处理器是在镜像生成后调用的组件。它们的作用是消费由构建器或另一个后处理器产生的制品，并从中构建新的制品。

### JSON

与配置器一样，在 JSON 模板中，后处理器在构建完成配置后按顺序调用，并在模板中的 "post-processors" 下声明。

```json
{
  "builders": [
    {
      "type": "null",
      "name": "test",
      "communicator": "none"
    }
  ],
  "provisioners": [
    {
      "type": "shell-local",
      "inline": ["echo test"]
    }
  ],
  "post-processors": [
    {
      "type": "manifest"
    }
  ]
}
```

### HCL2

在 HCL2 中，与配置器一样，它们也是 `build` 块的一部分，适用与配置器类似的规则。

```hcl
source "null" "test" {
  communicator = "none"
}

build {
  sources = ["null.test"]

  provisioner "shell-local" {
    inline = ["echo test"]
  }

  post-processor "manifest" {}
}
```
