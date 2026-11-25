---
description: |
  `build` 块包含 Packer 在构建过程中要遵循的指令。了解如何在 Packer 模板中配置 `build` 块。
title: build 块参考
---

# `build` 块

本文提供关于 `build` 块的参考信息。


## 描述

`build` 块指定 Packer 应运行哪些构建器、如何配置它们，以及 Packer 应对生成的制品执行哪些后处理操作。

要在 `build` 块中使用构建器，你可以：

- 设置 `sources` 字符串数组，引用预定义的源。

- 定义[构建级别的 `source` 块](/docs/templates/hcl_templates/blocks/build/source)。这也允许你设置特定字段。

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

定义[顶级 `source` 块](/docs/templates/hcl_templates/blocks/source)来配置你的构建器。可用构建器的列表可以在[构建器](/docs/builders/)部分找到。

## 命名你的构建

`build` 块的可选 `name` 字段可用于设置构建的名称。命名构建将在 `packer build` 的日志行中以构建块的名称作为前缀。例如：

```hcl
source "null" "first-example" {
    communicator = "none"
}

source "null" "second-example" {
    communicator = "none"
}

build {
    name = "a"

    sources = [
        "sources.null.first-example",
        "sources.null.second-example",
    ]
}


build {
    sources = ["sources.null.second-example"]
}
```

将输出：

```shellsession
> packer build ./folder
Build 'a.null.first-example' finished.
Build 'a.null.second-example' finished.
Build 'null.second-example' finished.

==> Builds finished. The artifacts of successful builds are:
--> a.null.first-example: Did not export anything. This is the null builder
--> a.null.second-example: Did not export anything. This is the null builder
--> null.second-example: Did not export anything. This is the null builder
```

### 仅运行特定构建

`-only`/`-except` 标志将匹配源的 `type.name` 并'仅'运行匹配的**构建器**（源）或运行所有引用的构建器'除了'匹配的构建器，例如使用相同的配置文件：

```shellsession
> packer build -only "*.second-example" ./folder
Build 'null.second-example' finished.
Build 'a.null.second-example' finished.

==> Builds finished. The artifacts of successful builds are:
--> a.null.second-example: Did not export anything. This is the null builder
--> null.second-example: Did not export anything. This is the null builder
```

这里 `'a.null.first-example'` 被跳过了。

::: info
注意：目前还不能匹配命名的 `build` 块来执行此操作，但这很快就会成为可能。所以这里 "a.\*" 不会匹配任何内容。
:::

## 相关内容

- 有关社区维护的构建器的信息，请参阅[社区构建器参考](/docs/community-tools#community-builders)。
- 有关如何创建自己的构建器的说明，请参阅[创建自定义构建器](/docs/plugins/creation/custom-builders)。
