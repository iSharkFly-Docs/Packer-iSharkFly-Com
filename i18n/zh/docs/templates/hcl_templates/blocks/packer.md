---
title: packer 块参考
description: |-
  `packer` 块配置 Packer 行为。了解如何在用 HCL 编写的 Packer 模板中配置 `packer`。
---

# `packer` 块

本文提供关于 `packer` 块的参考信息。

## 描述

`packer` 块配置 Packer 版本要求并指定初始化时要安装的插件。

## Packer 块语法

Packer 设置被收集到 `packer` 块中：

```hcl
packer {
  # ...
}
```

每个 `packer` 块可以包含与 Packer 行为相关的多个设置。在 `packer` 块内，只能使用常量值；参数不能引用命名对象（如资源、输入变量等），也不能使用任何 Packer 语言内置函数。

以下部分描述了 `packer` 块中支持的各种选项。

## 指定所需的 Packer 版本

`required_version` 设置接受[版本约束字符串](#版本约束)，该字符串指定可以与你的配置一起使用的 Packer 版本。

如果正在运行的 Packer 版本不符合指定的约束，Packer 将产生错误并退出，不采取任何进一步操作。

在协作环境中使用 Packer 版本约束来确保每个人都使用特定的 Packer 版本，或至少使用配置预期行为的最低 Packer 版本。

## 指定插件要求

::: info
**注意：** `required_plugins` 块仅在 Packer v1.7.0 及更高版本中可用。
:::

`required_plugins` 块指定当前模板所需的所有插件，将每个本地插件名称映射到源地址和版本约束。

```hcl
packer {
  required_plugins {
    happycloud = {
      version = ">= 2.7.0"
      source = "github.com/hashicorp/happycloud"
    }
  }
}
```

使用 `required_plugins` 块来编纂在模板上调用 `packer build` 所需的插件是确保跨不同平台或主机一致构建的好方法。

该块编纂了我们发现对确保可重现构建至关重要的两条信息：
1. **所需插件的源** 向用户指示插件从何处下载以及如果插件有问题应联系哪里。
2. **所需插件的版本** 向用户指示构建所需的确切或最低版本。这是固定可以在你的环境或团队中安装的已批准插件版本的好方法。

有关插件的更多信息，请参阅[插件](/docs/plugins/)。

### 定义插件源
使用以下格式在 `source` 字段中指定插件源代码的路径：

`<HOSTNAME>/[SUBFOLDER/]<NAMESPACE>/<TYPE>`

- `<Hostname>`：指定分发插件的位置或服务的主机名。对于作为 GitHub 发布版发布的插件，使用 `github.com`。任何其他主机名必须是提供所需插件源目录结构的 HTTPS 端点，例如内部镜像或制品仓库。有关更多信息，请参阅以下文档。
  - [托管你自己的插件源](/docs/plugins/install#host-your-own-plugin-source)
  - [`init` 命令](/docs/commands/init)
  - [`plugins install`](/docs/commands/plugins/install)
- `<Subfolder>`：子文件夹路径段是地址的可选部分，使你能够从自定义地址下载插件源。你可以指定最多包含 13 个路径段的源。
- `<Namespace>`：指定主机内的组织命名空间。这通常是发布插件的组织。
  类型：插件管理的平台或系统的简称。类型通常是插件的首选本地名称。

例如，如果名为 `myawesomecloud` 的插件属于主机 `github.com` 上的 `hashicorp` 命名空间，则 `source` 字段的值为 `github.com/hashicorp/myawesomecloud`。

`myawesomecloud` 来自的实际仓库必须始终具有名称格式 `github.com/hashicorp/packer-plugin-myawesomecloud`，但 `required_plugins` 块为简洁起见省略了冗余的 `packer-plugin-` 仓库前缀。

## 版本约束

在 Packer 允许你指定可接受版本范围的任何地方，它都期望一个特殊格式的字符串，称为版本约束。

### 版本约束语法

Packer 的版本约束语法与其他依赖管理系统（如 Bundler 和 NPM）使用的语法非常相似。

```hcl
required_version = ">= 1.2.0, < 2.0.0"
```

版本约束是包含一个或多个条件的[字符串字面量](/docs/templates/hcl_templates/expressions#string-literals)，条件之间用逗号分隔。

每个条件由一个操作符和一个版本号组成。

版本号应该是由句点分隔的一系列数字（如 `1.2.0`），可选地带有表示测试版的后缀。

以下操作符是有效的：

- `=`（或无操作符）：只允许一个确切的版本号。不能与其他条件组合。

- `!=`：排除一个确切的版本号。

- `>`、`>=`、`<`、`<=`：与指定版本进行比较，允许比较为真的版本。"大于"请求更新的版本，"小于"请求更旧的版本。

- `~>`：允许指定的版本，以及仅增加指定版本号 _最特定_ 段的更新版本。例如，`~> 0.9` 等同于 `>= 0.9, < 1.0`，`~> 0.8.4` 等同于 `>= 0.8.4, < 0.9`。这通常被称为悲观约束操作符。

### 版本约束行为

满足所有适用约束的版本号被认为是可接受的。

Packer 查询版本约束以确定它是否具有可接受的自身版本。

预发布版本是包含由破折号引入的后缀的版本号，如 `1.2.0-beta`。预发布版本只能通过 _精确_ 版本约束（`=` 操作符或无操作符）来选择。预发布版本不匹配不精确的操作符，如 `>=`、`~>` 等。
