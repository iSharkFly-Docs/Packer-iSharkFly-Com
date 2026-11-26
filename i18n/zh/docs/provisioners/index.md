---
description: |
  配置器使用内置和第三方软件在启动后安装和配置机器镜像。了解 Packer 配置器。
title: 配置器概述
---

# 配置器概述

配置器使用内置和第三方软件在启动后安装和配置机器镜像。配置器准备系统，因此你可能希望在以下用例中使用它们：

- 安装软件包
- 修补内核
- 创建用户
- 下载应用程序代码

Packer 包含以下配置器：

- [`breakpoint`](/docs/provisioners/breakpoint) - 暂停直到用户按 `Enter` 键以恢复构建。
- [`file`](/docs/provisioners/file) - 在构建期间将文件上传到机器镜像。
- [`hcp-sbom`](/docs/provisioners/hcp-sbom) - 上传 SBOM 并将其与 HCP Packer 注册表中的制品版本关联。
- [`shell`](/docs/provisioners/shell) - 在构建期间在机器镜像上运行 shell 脚本。
- [`shell-local`](/docs/provisioners/shell-local) - 在构建期间在运行 Packer 的主机上运行 shell 脚本。
- [`powershell`](/docs/provisioners/powershell) - 在构建期间在 Windows 机器镜像上运行 PowerShell 脚本。
- [`windows-shell`](/docs/provisioners/windows-shell) - 在构建期间在 Windows 机器镜像上使用 `cmd` 运行命令。
- [`windows-restart`](/docs/provisioners/windows-restart) - 在构建期间在 Windows 机器镜像上启动重启。

其他[社区支持](/docs/provisioners/community-supported)的配置器由社区的各个成员开发和维护。

请参阅 [`provisioner`](/docs/templates/hcl_templates/blocks/build/provisioner) 块文档，了解有关使用配置器的更多信息。
