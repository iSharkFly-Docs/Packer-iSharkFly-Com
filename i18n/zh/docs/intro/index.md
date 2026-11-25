---
title: Packer 简介
description: Packer 是一个社区工具，用于从单一源配置为多个平台创建相同的机器镜像。了解 Packer 的优势以及如何开始使用。
---

# Packer 简介

本文介绍 Packer 的优势以及如何开始使用。

## 什么是 Packer？

Packer 是一个社区工具，用于从单一源配置为多个平台创建相同的机器镜像。Packer 轻量级，可在所有主流操作系统上运行，并且性能出色，能够并行为多个平台创建机器镜像。Packer 不是用来替代 Chef 或 Puppet 等配置管理工具的。事实上，在构建镜像时，Packer 可以使用 Chef 或 Puppet 等工具在镜像上安装软件。

_机器镜像_ 是一个单一的静态单元，包含预配置的操作系统和已安装的软件，用于快速创建新的运行中的机器。每个平台的机器镜像格式都不同。例如，EC2 使用 AMI，VMware 使用 VMDK 和 VMX 文件，VirtualBox 使用 OVF 导出格式。

## HCP Packer

有关使用 HCP Packer 存储构建制品元数据的信息，请参阅 [HCP Packer 文档](https://developer.hashicorp.com/hcp/docs/packer) 或[登录 HCP](https://portal.cloud.hashicorp.com/sign-in) 探索 HCP Packer 功能。
