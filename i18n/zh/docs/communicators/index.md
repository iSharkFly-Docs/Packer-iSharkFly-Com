---
description: |
  通信器是 Packer 用于在其创建的机器上执行操作（如上传文件和执行脚本）的远程访问程序。
title: 通信器概述
---

# 通信器概述

通信器是 Packer 用于在正在创建的机器上上传文件、执行脚本等操作的机制。

通信器在[构建器](/docs/templates/legacy_json_templates/builders)部分中配置。Packer 目前支持三种通信器：

- `none`：Packer 不使用通信器，无法使用大多数配置器。
- [`ssh`](/docs/communicators/ssh)：Packer 建立到机器的 SSH 连接。这通常是默认值。
- [`winrm`](/docs/communicators/winrm)：Packer 建立 WinRM 连接。

除了上述通信器外，一些构建器有它们可以使用的自定义通信器。例如，Docker 构建器有一个使用 `docker exec` 和 `docker cp` 来执行脚本和复制文件的"docker"通信器。

有关如何使用每个通信器的更多详细信息，请点击上面的链接转到每个通信器的页面。
