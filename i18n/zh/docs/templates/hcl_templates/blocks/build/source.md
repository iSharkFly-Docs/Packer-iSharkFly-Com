---
description: >
  嵌套在 `build` 块中的 `source` 块重用配置中其他地方定义的构建器。了解如何配置嵌套的 `source` 块。
title: source 块参考
---

# `source` 块

本文提供关于嵌套在 `build` 块中的 `source` 块的参考信息。

## 描述

将 `source` 块添加到 `build` 块中以重用配置中其他地方定义的构建器。Packer 填充顶级 `source` 块中尚未设置的源字段。

构建级别的源块通过将其内容与相应的顶级源块合并来实现，当源参数被定义两次时，`packer build` 命令会因遇到的歧义而失败。

例如，在下面的示例中，如果顶级 `lxd.arch` 源块也定义了 `output_image` 字段，或者如果任一构建级别的源块重新定义了图像字段，Packer 将出错。

```hcl
# file: builds.pkr.hcl
source "lxd" "arch" {
  image = "archlinux"
}

build {
  # 使用单数 `source` 块设置特定字段。
  # 注意字段不能被覆盖，换句话说，你不能
  # 在这里设置顶级源块中的 'image' 字段，同样
  # 'name' 和 'output_image' 字段也不能在顶级源块中设置。
  source "lxd.arch" {
    # 设置 name 字段允许仅为此构建部分重命名源。
    name = "nomad"
    output_image = "nomad"
  }

  provisioner "shell" {
    inline = [ "echo installing nomad" ]
  }
}

build {
  source "lxd.arch" {
    name = "consul"
    output_image = "consul"
  }

  provisioner "shell" {
    inline = [ "echo installing consul" ]
  }
}
```
