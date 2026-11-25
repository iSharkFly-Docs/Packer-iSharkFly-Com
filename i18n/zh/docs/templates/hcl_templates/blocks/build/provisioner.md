---
description: |
  `provisioner` 块定义如何配置配置器。了解如何在模板中配置 `provisioner` 块。
title: provisioner 块参考
---

# `provisioner` 块

本文提供关于 `provisioner` 块的参考信息。

## 描述

`provisioner` 块定义如何配置配置器。配置器使用内置和第三方软件在启动后安装和配置机器镜像。配置器为使用准备系统。

可用配置器的列表可以在[配置器](/docs/provisioners/)部分找到。

```hcl
# builds.pkr.hcl
build {
  # ...
  provisioner "shell" {
    inline = [
      "echo provisioning all the things",
      "echo the value of 'foo' is '${var.foo}'",
    ]
  }
}
```

## 在特定源上运行

你可以使用 `only` 或 `except` 配置来仅在特定源上运行配置器。这两个配置做你期望的事情：`only` 将只在指定的源上运行配置器，`except` 将在除指定源之外的任何源上运行配置器。

下面显示了使用 `only` 的示例，但 `except` 的用法实际上是相同的：

```hcl
# builds.pkr.hcl

source "amazon-ebs" "first-example" {
  #...
}

source "amazon-ebs" "second-example" {
  #...
}

build {
  sources = [
    "source.amazon-ebs.first-example",
    "source.amazon-ebs.second-example",
  ]
  provisioner "shell" {
    # 此配置器仅为 'first-example' 源运行。
    only = ["amazon-ebs.first-example"]

    inline = [
      "echo provisioning all the things",
      "echo the value of 'foo' is '${var.foo}'",
    ]
  }
  provisioner "shell" {
    # 这将与所有源一起运行。
    inline = [
        "echo Hi World!"
      ]
  }
}
```

`only` 和 `except` 中的源名称必须省略 `source.` 前缀。

`only` 或 `except` 中的值是 _源名称_，而不是构建器类型或构建名称。

::: info
注意：在 CLI 中，`only` 和 `except` 将匹配 **构建名称**（例如：`my_build.amazon-ebs.first-example`），但在配置器中它们将匹配 **源名称**（例如：`amazon-ebs.third-example`）。
:::

## 构建特定覆盖

虽然 Packer 的目标是生成相同的机器镜像，但有时需要一段时间机器是不同的，然后最终收敛到相同。在这些情况下，根据构建可能需要不同的配置器配置。这可以通过使用构建特定覆盖来完成。

这可能需要的一个示例是同时构建 EC2 AMI 和 VMware 机器。源 EC2 AMI 可能默认设置具有管理权限的用户，而 VMware 机器没有这些权限。在这种情况下，shell 脚本可能需要以不同方式执行。当然，目标是希望 shell 脚本使这两个镜像收敛到相同。但是，它们最初可能需要以不同方式运行。

此示例如下所示：

```hcl
source "null" "example1" {
  communicator = "none"
}

source "null" "example2" {
  communicator = "none"
}

source "null" "example3" {
  communicator = "none"
}

build {
  sources = ["source.null.example2", "source.null.example3"]

  source "source.null.example1" {
    // 给此源一个名称
    name = "renamed"
  }

  provisioner "shell-local" {
    inline = ["echo not overridden"]
    override = {
      example3 = {
        inline = ["echo overrides for example3"]
      }
      // 使用给定名称引用源
      renamed = {
        inline = ["echo overrides for renamed"]
      }
    }
  }
}
```

如你所见，使用了 `override` 键。此键的值是另一个 HCL 属性映射，其中键是[源定义](/docs/templates/hcl_templates/blocks/source)的名称。这反过来又是另一个 HCL 属性映射。这个 HCL 属性映射只是像正常一样包含配置器配置。此配置合并到默认配置器配置中。

## 错误时配置器

你可以选择创建一个称为 `error-cleanup-provisioner` 的单个专门配置器。除非正常配置运行失败，否则此配置器不会运行。如果正常配置运行确实失败，这个特殊的错误配置器将在 _实例关闭之前_ 运行。这允许你进行最后一刻的更改和清理行为，而 Packer 可能无法自行清理。

例如，用户可能使用此配置器来确保实例正确地从在构建运行期间连接到的任何服务取消订阅。

错误清理脚本的玩具用法示例：

```hcl
source "null" "example" {
  communicator = "none"
}

build {
  sources = ["source.null.example"]

  provisioner "shell-local" {
    inline = ["exit 2"]
  }

  error-cleanup-provisioner "shell-local" {
    inline = ["echo 'rubber ducky'> ducky.txt"]
  }
}
```

## 运行前暂停

对于某些配置器，有时需要在运行之前暂停一段时间。特别是，在配置器重启机器的情况下，你可能希望在启动下一个配置器之前等待一段时间。

Packer 模板中的每个配置器定义都可以采用特殊配置 `pause_before`，即在运行该配置器之前暂停的时间量。默认情况下，没有暂停。示例如下所示：

```hcl
# builds.pkr.hcl
build {
  # ...
  provisioner "shell" {
      inline = [
        "echo provisioning all the things",
        "echo the value of 'foo' is '${var.foo}'",
      ]
      pause_before = "10s"
  }
}
```

对于上述配置器，Packer 将在上传和执行 shell 脚本之前等待 10 秒。

## 错误时重试

对于某些配置器，有时需要在失败时重试。特别是，在配置器依赖于尚未完成的外部进程的情况下。

Packer 模板中的每个配置器定义都可以采用特殊配置 `max_retries`，即配置器错误时的最大重试次数。默认情况下，`max_retries` 为零，不会在错误时重试。示例如下所示：

```hcl
# builds.pkr.hcl
build {
  # ...
  provisioner "shell" {
      inline = [
        "echo provisioning all the things",
        "echo the value of 'foo' is '${var.foo}'",
      ]
      max_retries = 5
  }
}
```

对于上述配置器，Packer 将最多重试五次直到停止失败。如果五次重试后配置器仍然失败，则整个构建将失败。

## 错误后继续

Packer 模板中的每个配置器定义都可以将 `continue_on_error` 设置为 `true`，以在该配置器失败后继续构建。Packer 在耗尽 `max_retries` 后应用此设置。

```hcl
build {
  # ...
  provisioner "shell" {
    inline = ["exit 1"]

    continue_on_error = true
  }
}
```

仅当后续构建步骤可以在配置器失败后安全运行时才使用 `continue_on_error`。

## 超时

有时命令可能比预期花费更多的时间

Packer 模板中的每个配置器定义都可以采用特殊配置 `timeout`，即在认为配置器失败之前等待的时间量。默认情况下，没有超时。示例如下所示：

```hcl
# builds.pkr.hcl
build {
  # ...
  provisioner "shell" {
      inline = [
        "echo provisioning all the things",
        "echo the value of 'foo' is '${var.foo}'",
      ]
      timeout = "5m"
  }
}
```

对于上述配置器，如果脚本超过 5 分钟，Packer 将取消脚本。

超时在调试模式下无效。

## 构建上下文变量

Packer 允许从配置器访问连接信息和基本实例状态信息。这些信息存储在 `build` 变量中。查看[上下文变量](/docs/templates/hcl_templates/contextual-variables)文档以了解更多信息并查看一些使用它们的示例。
