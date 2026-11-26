---
description: |
  社区支持的构建器由第三方开发和维护，而非 HashiCorp。可以与 Packer 一起使用它们来扩展 Packer 功能。
title: 社区支持的构建器
---

# 社区支持的构建器

以下构建器由 Packer 社区的各个成员开发和维护，而非由 HashiCorp 开发维护。有关如何使用社区构建器的更多信息，请参阅我们的[扩展 Packer](/docs/plugins/creation/) 文档。

- ARM 构建器

  - [packer-plugin-arm-image](https://github.com/solo-io/packer-plugin-arm-image)：允许你在现有系统镜像上进行扩展。
  - [packer-builder-arm](https://github.com/mkaczanowski/packer-builder-arm)：允许你使用各种选项（如自定义分区表）扩展或构建新镜像。

- [Exoscale 构建器](https://github.com/exoscale/packer-plugin-exoscale) - 基于计算实例快照创建 Exoscale 自定义模板。

- [Citrix XenServer/Citrix Hypervisor](https://github.com/xenserver/packer-builder-xenserver) - 用于从 ISO 镜像或现有模板创建 [Citrix XenServer/Citrix Hypervisor](https://xenserver.org/) 镜像的插件。

- [XCP-NG/Citrix XenServer/Citrix Hypervisor/更新的 Fork](https://github.com/ddelnano/packer-plugin-xenserver) - 用于从 ISO 镜像或现有模板创建 [XCP-NG/Citrix XenServer/Citrix Hypervisor](https://xcp-ng.org/) 镜像的插件。这是原始项目的 fork，由 XCP-NG 开发者推荐使用。
