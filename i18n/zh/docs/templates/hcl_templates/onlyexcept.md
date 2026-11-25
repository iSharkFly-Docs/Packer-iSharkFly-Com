---
title: only 和 except 关键字参考
description: >-
  `only` 和 `except` 关键字是 Packer 构建的过滤器。了解如何使用 `only` 和 `except` 来选择性地运行配置器和后处理器。
---

# `only` 和 `except` 关键字

`only` 和 `except` 关键字是让你在 Packer 构建中选择性地运行配置器和后处理器的过滤器。你可以在 Packer 模板中使用这些关键字，也可以作为 Packer CLI 上的标志使用。

## 命令行标志

- `-except=foo,bar,baz` - 运行除给定逗号分隔名称之外的所有构建和后处理器。在旧版 JSON 模板中，构建名称默认为其构建器的类型（例如 `docker` 或 `amazon-ebs` 或 `virtualbox-iso`），除非在配置中指定了特定的 `name` 属性。在 HCL2 模板中，"name" 是源块的 "name" 标签，除非构建内源定义添加了 "name" 配置选项。跳过的后处理器之后的任何后处理器都不会运行。因为后处理器可以嵌套在数组中，不同的后处理器链仍然可以运行。名称为空的后处理器将被忽略。

- `-only=foo,bar,baz` - 只运行具有给定逗号分隔名称的构建。在旧版 JSON 模板中，构建名称默认为其构建器的类型（例如 `docker` 或 `amazon-ebs` 或 `virtualbox-iso`），除非在配置中指定了特定的 `name` 属性。在 HCL2 模板中，"name" 是源块的 "name" 标签，除非构建内源定义添加了 "name" 配置选项。

## 模板

你可以添加 `only` 和 `except` 关键字来为特定源运行或跳过配置器和后处理器：

```hcl
source "amazon-ebs" "first-example" {
}

source "amazon-ebs" "second-example" {
}

source "amazon-ebs" "third-example" {
}

build {
  name = "my_build"
  sources = [
    "source.amazon-ebs.first-example",
  ]
  source "source.amazon-ebs.second-example" {
    // 设置 name 字段允许你仅为此构建部分重命名源。
    // 要匹配此构建器，你需要使用 second-example-local-name，而不是 second-example
    name = "second-example-local-name"
  }

  provisioner "shell-local" {
    only   = ["amazon-ebs.first-example"]
    inline = ["echo I will only run for the first example source"]
  }

  provisioner "shell-local" {
    except = ["amazon-ebs.second-example-local-name"]
    inline = ["echo I will never run for the second example source"]
  }
}

build {
  sources = [
    "source.amazon-ebs.third-example",
  ]
}

# 此文件将导致 Packer 创建三个名为以下的构建：
#  my_build.amazon-ebs.first-example
#  my_build.amazon-ebs.second-example
#  amazon-ebs.third-example
```

注意 CLI 参数可以与 glob 操作符一起使用，使用前面的配置：

- `packer build -only 'my_build.*' dir`：将只运行名为 `my_build` 的块中的构建。

- `packer build -only '*.amazon-ebs.*' dir`：将只运行类型为 `amazon-ebs` 的源的构建。

- `packer build -only '*.second-example-local-name' dir`：将只运行那个特定命名的构建。

::: info
注意：在 CLI 中，`only` 和 `except` 将匹配 **构建名称**（例如：`my_build.amazon-ebs.first-example`），但在配置器中它们将匹配 **源名称**（例如：`amazon-ebs.third-example`）。
:::
