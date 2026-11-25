---
description: >
  `builders` 块包含创建机器和生成镜像的构建器。了解如何在 Packer 的 JSON 模板中配置 `builders` 块。
title: JSON 模板的 builders 参考
---

# JSON 模板的 `builders` 参考

本文提供关于 JSON 模板中 `builders` 块的参考信息。

::: info
**注意：** 本页面是关于旧式 JSON Packer 模板的。Packer 核心仍然支持 JSON 模板，但添加到 Packer 核心的新功能可能不会为 JSON 模板实现。我们建议你尽快过渡到 HCL 模板，以获得 Packer 的最佳体验。为了帮助你升级模板，我们编写了一个 [hcl2_upgrade 命令](/docs/commands/hcl2_upgrade)。
:::

## 简介

`builders` 块包含一个数组，包含 Packer 应该用来为模板生成机器镜像的所有构建器。

构建器为各种平台创建机器并从中生成镜像。例如，EC2、VMware、VirtualBox 等有不同的构建器。Packer 默认附带许多构建器，也可以扩展以添加新的构建器。

本文档页面将介绍如何在模板中配置构建器。但是，每个构建器可用的特定配置选项必须从该特定构建器的文档中参考。

在模板中，构建器定义部分如下所示：

```json
{
  "builders": [
    // ... 这里是一个或多个构建器定义
  ]
}
```

## 构建器定义

单个构建器定义正好映射到一个[构建](/docs/terminology#builds)。构建器定义是一个 JSON 对象，至少需要一个 `type` 键。`type` 是将用于为构建创建机器镜像的构建器的名称。

除了 `type` 之外，其他键配置构建器本身。例如，AWS 构建器需要 `access_key`、`secret_key` 和一些其他设置。这些直接放在构建器定义中。

下面显示了一个示例构建器定义，在这种情况下配置 AWS 构建器：

```json
{
  "type": "amazon-ebs",
  "access_key": "...",
  "secret_key": "..."
}
```

## 命名构建

Packer 中的每个构建都有一个名称。默认情况下，名称只是正在使用的构建器的名称。通常，这就足够了。名称仅作为输出中正在发生的事情的指示器。但是，如果你愿意，可以使用构建器定义中的 `name` 键指定自定义名称。

如果你定义了多个使用相同底层构建器的构建，这特别有用。在这种情况下，你必须为至少其中一个指定名称，因为名称必须是唯一的。

## 通信器

每个构建都与单个[通信器](/docs/templates/legacy_json_templates/communicator)关联。通信器用于建立连接以配置远程机器（如 AWS 实例或本地虚拟机）。

各种构建器的所有示例都显示了一些通信器（通常是 SSH），但通信器是高度可定制的，所以我们建议阅读[通信器文档](/docs/templates/legacy_json_templates/communicator)。
