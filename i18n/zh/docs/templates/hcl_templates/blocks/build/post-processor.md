---
description: |
  `post-processor` 块定义 `packer build` 命令后的后处理器行为。了解如何在 Packer 模板中配置 `post-processor` 块。
title: post-processor 块参考
---

# `post-processor` 块

本文提供关于 `post-processor` 块的参考信息。

## 描述

`post-processor` 块定义如何配置后处理器。

```hcl
# builds.pkr.hcl
build {
  # ... 构建镜像
  post-processor "checksum" { # 校验镜像
    checksum_types = [ "md5", "sha512" ] # 校验制品
    keep_input_artifact = true           # 保留制品
  }

  post-processor "amazon-import" { # 上传镜像到 amazon
  }
}
```

每个 `post-processor` 在每个定义的构建之后运行。后处理器从构建中获取 `Artifact`。后处理器是可选的，它们可用于上传制品、重新打包等。可用后处理器的列表可以在[后处理器](/docs/post-processors/)部分找到。

当 `post-processor` 在 [`post-processors` 块](/docs/templates/hcl_templates/blocks/build/post-processor)列表中定义时（即链式后处理器列表），它也可以从另一个后处理器获取 `Artifact`。

::: info
注意：后处理器接收的输入'制品'默认会自动删除。
:::

# 保留输入制品

要防止输入制品被删除，你可以将 `keep_input_artifact` 字段设置为 true，使 Packer 保留两个制品。例如，如果我们想校验制品并保留制品：

```hcl
# builds.pkr.hcl
build {
  # ...
  post-processor "checksum" {
    checksum_types = [ "md5", "sha512" ]
    keep_input_artifact = true
  }
}
```

# 在特定构建上运行

你可以使用 `only` 或 `except` 配置来仅在特定源上运行后处理器。这两个配置做你期望的事情：`only` 将只在指定的源上运行后处理器，`except` 将在除指定源之外的任何源上运行后处理器。

下面显示了使用 `only` 的示例，但 `except` 的用法实际上是相同的：

```hcl
# builds.pkr.hcl
build {
  # ...
  post-processor "checksum" {
    checksum_types = [ "md5", "sha512" ]
    keep_input_artifact = true
    only = ["amazon-ebs.example"]
  }
}
```

`only` 或 `except` 中的值是 _源名称_，而不是构建器类型。

如果你想在从命令行运行 `packer build` 时排除某些后处理器，你可以这样做：

`packer build --except=checksum mytemplate.pkr.hcl` 将不会运行 checksum 后处理器。此命令行排除通过引用后处理器 _名称_ 来工作。默认情况下，后处理器以其类型命名，如上面 `checksum` 示例所示。你可以通过向每个后处理器块添加 "name" 字段来使后处理器的名称唯一。

虽然 `-except` 标志可用于在命令行上过滤后处理器，但 `-only` 标志不适用于后处理器。如果你希望仅为给定的源构建运行后处理器，你必须使用 hcl 模板中的 `only=[source]` 语法，如上所述。


## 构建上下文变量

Packer 允许从后处理器访问连接信息和基本实例状态信息。这些信息存储在 `build` 变量中。查看[上下文变量](/docs/templates/hcl_templates/contextual-variables)文档以了解更多信息并查看一些使用它们的示例。

### 相关内容

- [`post-processors` 块](/docs/templates/hcl_templates/blocks/build/post-processors)允许定义一个或多个 `post-processor` 链，这些链将获取构建和配置步骤的输出。
