---
description: |
  Packer 模板是决定 Packer 行为的配置文件。了解 Packer 模板配置语言。
title: Packer 模板参考概述
---

# Packer 模板参考概述

本文提供关于 Packer 模板的概述信息，模板是决定 Packer 行为的配置文件。

## 简介

Packer 模板包含一系列 Packer 要遵循的声明和命令。模板为 Packer 定义以下指令：

- 使用哪些插件，如构建器、配置器和后处理器
- 如何配置这些插件
- 按什么顺序运行它们

模板包含灵活的变量注入工具，以及帮助你自定义构建的内置函数。

## 模板语言

Packer 支持用 [HCL2](/docs/templates/hcl_templates/) 或 [JSON](/docs/templates/legacy_json_templates/) 编写的模板。从 v1.7.0 开始，HCL2 是 Packer 配置的官方格式。

HCL2 也是其他 HashiCorp 产品（如 Terraform）配置中使用的配置语言。HCL 比 JSON 模板格式更灵活、更模块化、更简洁。有关将 JSON 模板升级为 HCL 模板的教程，请参阅[将 Packer JSON 模板升级到 HCL2](https://developer.hashicorp.com/packer/tutorials/configuration-language/hcl2-upgrade)。
