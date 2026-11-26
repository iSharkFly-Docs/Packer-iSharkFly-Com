---
description: |
  本文提供关于安装和加载 Packer 插件的概述信息
title: 插件
---

# 插件安装概述

::: info
从 2025 年 8 月 1 日开始，许多官方 HashiCorp 维护的 Packer 插件的来源正在从 GitHub releases 迁移到官方 HashiCorp 发布站点 [releases.hashicorp.com](https://releases.hashicorp.com)。有关更多信息，请参阅[安装 HashiCorp 维护的插件](/docs/plugins/install#install-hashicorp-maintained-plugins)。
:::

本文提供关于安装和加载 Packer 插件的概述信息。插件是在每次构建期间执行附加任务的独立应用程序。

## 简介

Packer 二进制文件包含一组自动可用的内置组件。你还可以安装外部插件供 Packer 在整个构建过程中运行和通信。这些外部插件在不修改核心源代码的情况下扩展 Packer 功能。Packer 为构建中的每个组件启动一个插件进程。

## 工作流程

要在 Packer 中使用插件，你必须将插件代码及其 SHA256SUM 文件安装到 Packer 插件目录中。有关说明，请参阅[安装插件](/docs/plugins/install)。如果你无法使用已安装的插件，请参阅[插件加载 - 规范](/docs/plugins/creation/plugin-load-spec)以了解 Packer 如何发现和加载插件的详细信息。

## Packer 存储插件的位置

Packer 将初始化期间下载的外部插件存储到插件目录中。Unix 上的默认插件目录是 `$HOME/.config/packer/plugins`，Windows 上是 `%APPDATA%\packer.d\plugins`。有关更多信息，请参阅配置参考中的 [`PACKER_PLUGIN_PATH`](/docs/configure#packer_plugin_path)。

## 指南

有关插件安装过程的详细信息，请参阅以下插件文档：

### 安装插件

有关向 Packer 模板添加外部插件和安装二进制文件的说明，请参阅[安装插件](/docs/plugins/install)。

### 外部插件

请参阅 [Packer 集成](https://developer.hashicorp.com/packer/integrations)文档以了解 Packer 二进制文件中未包含的可用外部插件。


### 内置插件

- Packer 使用称为 _构建器_ 的插件来创建机器和镜像。有关更多信息，请参阅[构建器](/docs/builders/)。
- _数据源_ 插件获取要在模板中使用的数据。有关更多信息，请参阅[数据源](/docs/datasources/)。
- 称为 _配置器_ 的插件在启动后安装和配置机器镜像。有关更多信息，请参阅[配置器](/docs/provisioners/)。
- _后处理器_ 在配置后执行附加任务。有关更多信息，请参阅[后处理器](/docs/post-processors/)。


### 开发插件

请参阅[开发插件](/docs/plugins/creation/)以了解如何创建自定义外部插件。
