---
description: >
  Packer 和 Packer 文档使用一套具有特定含义的术语词汇。在本术语表中了解 Packer 术语。
title: Packer 术语
---

# Packer 术语

本页记录了我们在整个文档中使用的、在 Packer 中具有特定含义的术语。如果你之前没有使用过 Packer，这些术语可能不是立即能理解的。

- _制品（Artifacts）_ 是单次构建的结果，通常是一组 ID 或文件，代表一个机器镜像。每个构建器产生单个制品。例如，对于 Amazon EC2 构建器，制品是一组 AMI ID（每个区域一个）。对于 VMware 构建器，制品是包含创建的虚拟机的文件目录。

- _构建（Builds）_ 是最终为单个平台生成制品的单个任务。多个构建并行运行。在句子中的示例用法："Packer 构建生成了一个 AMI 来运行我们的 Web 应用程序。" 或者："Packer 现在正在为 VMware、AWS 和 VirtualBox 运行构建。"

- _构建器（Builders）_ 是 Packer 的组件，能够为单个平台创建机器镜像。构建器读取一些配置并使用它来运行和生成机器镜像。构建器作为构建的一部分被调用，以创建实际的结果制品。示例构建器包括 VirtualBox、VMware 和 Amazon EC2。

- _命令（Commands）_ 是 `packer` 程序的子命令，执行特定任务。一个示例命令是 "build"，通过 `packer build` 调用。Packer 自带一组命令来定义其命令行界面。

- _数据源（Data sources）_ 是 Packer 的组件，从 Packer 外部获取数据并使其可在模板中使用。数据源的示例包括 Amazon AMI 和 Amazon Secrets Manager。

- _后处理器（Post-processors）_ 是 Packer 的组件，获取构建器或另一个后处理器的结果并处理它以创建新的制品。后处理器的示例包括用于压缩制品的 compress、用于上传制品的 upload 等。

- _配置器（Provisioners）_ 是 Packer 的组件，在运行中的机器被转换为静态制品之前，在其上安装和配置软件。它们执行使制品包含有用软件的主要工作。示例配置器包括 shell 脚本、Chef、Puppet 等。

- _模板（Templates）_ 是通过配置各种 Packer 组件来定义一个或多个构建的文件。Packer 读取模板并使用其中的信息并行创建多个机器镜像。你可以用 HCL 或 JSON 文件格式编写模板。
