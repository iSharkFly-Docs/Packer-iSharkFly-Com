---
description: |
  Packer 使用通信器上传文件、执行脚本和在其创建的机器上执行操作。了解如何在 JSON 模板中配置通信器。
title: JSON 模板的通信器参考
---

# JSON 模板的通信器参考

本文描述如何在 JSON 格式编写的 Packer 模板中使用通信器。

::: info
**注意：** 本页面是关于旧式 JSON Packer 模板的。Packer 核心仍然支持 JSON 模板，但添加到 Packer 核心的新功能可能不会为 JSON 模板实现。我们建议你尽快过渡到 HCL 模板，以获得 Packer 的最佳体验。为了帮助你升级模板，我们编写了一个 [hcl2_upgrade 命令](/docs/commands/hcl2_upgrade)。
:::

## 描述

Packer 使用通信器上传文件、执行脚本和在创建的机器上执行其他操作。在 [`builder`](/docs/templates/legacy_json_templates/builders) 部分配置通信器。

所有通信器都有以下选项：

- `communicator` (string) - Packer 目前支持三种通信器：

  - `none` - 不会使用通信器。如果设置了这个，大多数配置器也无法使用。

  - `ssh` - 将建立到机器的 SSH 连接。这通常是默认值。

  - `winrm` - 将建立 WinRM 连接。

  此外，一些构建器有它们可以使用的自定义通信器。例如，Docker 构建器有一个使用 `docker exec` 和 `docker cp` 执行脚本和复制文件的 "docker" 通信器。

- `pause_before_connecting` (duration string | 例如: "1h5m2s") - 我们建议你在客户机的引导脚本的最后一步启用 SSH 或 WinRM，但有时你可能会遇到竞态条件，需要 Packer 在尝试连接到客户机之前等待。

  如果你遇到这种情况，可以使用模板选项 `pause_before_connecting`。默认情况下，没有暂停。例如，如果你将 `pause_before_connecting` 设置为 `10m`，Packer 将像正常一样检查是否可以连接。但是一旦连接尝试成功，它将断开连接，然后等待 10 分钟再连接到客户机并开始配置。

## 准备使用通信器

根据你的构建器，你的通信器可能没有"开箱即用"所需的一切。

如果你从云镜像构建（例如，在 Amazon 上构建），你的云提供商很可能已经在镜像上为你预配置了 SSH，这意味着你只需要在 Packer 模板中配置通信器。

但是，如果你从全新的未配置操作系统镜像构建，你几乎总是必须执行一些额外的工作来在客户机上配置 SSH。对于大多数操作系统发行版，这项工作将由引用一个文件的 [boot_command](https://developer.hashicorp.com/packer/plugins/builders/vmware/iso#boot-configuration) 执行，该文件为安装操作系统时通常会被问到的交互式问题提供答案。此文件的名称因操作系统而异；一些常见的例子是 Debian 需要的 "preseed" 文件、CentOS 需要的 "kickstart" 文件或 Windows 需要的 "answer file"（也称为 Autounattend.xml 文件）。为简单起见，我们在文档的其余部分将此文件称为 "preseed" 文件。

如果你不熟悉如何使用 preseed 文件自动引导镜像，请查看我们的镜像引导快速指南，或研究你特定客户操作系统的自动配置。了解如何自动初始化你的操作系统对于能够成功使用 Packer 至关重要。

## 通信器特定选项

有关如何使用每个通信器的更多详细信息，请访问[通信器](/docs/communicators/)页面。
