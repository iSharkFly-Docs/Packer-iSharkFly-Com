---
description: |
  构建器为各种平台创建机器并从这些机器生成镜像。了解可以在 Packer 模板中使用的构建器类型。
title: 构建器概述
---

# 构建器概述

构建器为各种平台创建机器并从这些机器生成镜像。Packer 中的一些构建器执行辅助任务，例如运行配置器。

Packer 有以下类型的构建器：

- [插件](/plugins/)：你安装的插件有它们自己关联的构建器集合。例如，EC2、VMware 和 VirtualBox 使用它们各自独立的构建器集合。
- [`file`](/docs/builders/file)：`file` 构建器从文件创建制品。
- [`null`](/docs/builders/null)：`null` 构建器设置 SSH 连接并运行配置器。
- [自定义](/docs/plugins/creation/custom-builders)：你可以为新的或现有的平台编写新的构建器。
- [社区支持](/docs/builders/community-supported)：Packer 社区为多个额外平台开发和维护构建器。

请参阅 [`source`](/docs/templates/hcl_templates/blocks/source) 块文档，了解有关在 Packer 模板语言中配置构建器的更多信息。
