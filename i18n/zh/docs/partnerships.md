---
description: |
  Packer 集成计划帮助供应商将其产品与 Packer 集成。了解如何参与 Packer 集成计划。
title: Packer 集成计划
---

# Packer 集成计划

HashiCorp Packer 集成计划允许供应商将其产品与 Packer 集成。

通过 Packer 集成流程集成其解决方案的供应商可为其客户提供经过验证的无缝用户体验。Packer 集成计划目前仅支持使用 Go 编程语言进行编码。

此计划旨在成为一个基本自助的流程，提供信息来源的链接和指导、明确定义的步骤和检查点。

## Packer 集成类型

Packer 是一个社区工具，用于从单一源配置为多个平台创建相同的机器镜像。Packer 轻量级，可在所有主流操作系统上运行，并且性能出色，能够并行为多个平台创建机器镜像。Packer 不是用来替代 Chef 或 Puppet 等配置管理工具的。事实上，在构建镜像时，Packer 可以使用 Chef 或 Puppet 等工具在镜像上安装软件。

机器镜像是一个单一的静态单元，包含预配置的操作系统和已安装的软件，用于快速创建新的运行中的机器。每个平台的机器镜像格式都不同。例如，EC2 使用 AMI，VMware 使用 VMDK/VMX 文件，VirtualBox 使用 OVF 导出格式等。要了解更多关于 Packer 使用场景的信息，请点击（[使用场景 - 介绍 | Packer by HashiCorp](/docs/intro/use-cases)）

下图描述了主要的 Packer 集成类别和类型。



![Packer 生态系统集成图](/img/docs/packer-ecosystem-diagram.png)



合作伙伴可以集成的主要 Packer 类别包括：

- **数据源**
  - 数据源允许用户从远程 API 检索值并将其作为变量存储在 Packer 配置模板中。一个例子是 [AWS secrets manager](https://developer.hashicorp.com/packer/plugins/datasources/amazon/secretsmanager) 数据源。
- **构建器**
  - 构建器管理虚拟机生命周期。它们管理启动虚拟机/实例、对该实例运行配置器、关闭实例以及从该实例保存制品镜像。你的构建器处理与创建输出镜像制品相关的所有设置和清理成本。
- **配置器**
  - 配置器针对由构建器启动的实例运行。它们通常提供与特定配置工具交互的接口，如 Ansible、Puppet 或 Chef。
- **后处理器**
  - 后处理器在镜像制品创建后对其进行管理。这可以是通用的，如对制品运行压缩工具，也可以是特定的，如将其上传到特定的云服务。

## 开发流程

Packer 集成开发流程分为六个步骤。通过遵循这些步骤，可以与 HashiCorp 一起开发 Packer 集成，以确保集成能够尽快在 Packer 中得到验证和支持。自助步骤的可视化表示如下所示。

![Packer 集成计划步骤](/img/docs/packer-integration-steps-diagram.png 'Packer 集成计划步骤')

各个 Packer 集成步骤包括：

1. 联系：供应商与 HashiCorp 之间的初次联系
1. 启用：帮助开发集成的信息和文章
1. 开发/测试：集成开发和测试流程
1. 审查：HashiCorp 代码审查和集成验证（迭代流程）
1. 发布：一旦 HashiCorp 技术合作伙伴协议执行完毕，经验证的集成将在 HashiCorp 网站上可用并列出
1. 支持：供应商对提供者的持续维护和支持

### 联系

首先通过简单的[网络表单](https://docs.google.com/forms/d/e/1FAIpQLSfgq3HJ9Rfsi7LgPLFln28ZrmarATGlD_6A47-Io-bPUftKUw/viewform)提供一些关于正在构建的集成的基本信息。

此信息被记录并由 HashiCorp 用于跟踪集成的各个阶段。这些信息还用于通知集成开发人员任何重叠的工作，可能来自社区，以便你可以更好地集中资源。

Packer 拥有活跃的社区和合作伙伴生态系统，可能已经开始从事类似的集成工作。我们会尽力连接相似的各方以避免重复工作。

### 启用

虽然不是强制性的，但 HashiCorp 鼓励供应商签署 MNDA（相互保密协议），以便在集成过程中进行开放对话和分享想法。

为了支持我们的自助模式，我们提供了资源、文档、示例和最佳实践的链接，指导你完成 Packer 集成开发和测试流程。

- [编写供应商扩展指南](/docs/plugins/creation/)
- [合作伙伴](https://github.com/exoscale/packer-plugin-exoscale)实现的示例开发
- [脚手架插件仓库](https://github.com/hashicorp/packer-plugin-scaffolding)帮助启动新的贡献：
- 为 Packer 贡献的[指南](https://github.com/hashicorp/packer/blob/main/.github/CONTRIBUTING.md)
- [Packer 开发者社区论坛](https://discuss.hashicorp.com/c/packer/23)
- [Packer 源代码](https://github.com/hashicorp/packer)

我们鼓励供应商密切遵循上述指导。采用相同的结构和编码模式有助于加快审查和发布周期。

### 开发和测试

Packer 要求所有代码级集成必须使用 [Go](https://go.dev/) 编程语言编写并包含 [MPL-2.0](https://en.wikipedia.org/wiki/Mozilla_Public_License) 开源许可证。编写插件所需的唯一知识是基本的命令行技能和 Go 编程语言知识。在使用 Go 编写时，HashiCorp 发现当供应商密切关注并遵循资源、采用相同的结构和编码模式时，集成开发过程简单明了，有助于加快审查和发布周期。请记住，所有集成的主要步骤都应包含验收测试和适当的文档。

数据源

- [自定义数据源文档](/docs/plugins/creation/custom-datasources)
- [示例数据源](https://github.com/hashicorp/packer-plugin-hashicups/tree/main/datasource)

构建器

- [自定义构建器文档](/docs/plugins/creation/custom-builders)
- [示例构建器](https://github.com/hashicorp/packer-plugin-hashicups/tree/main/builder/order)

配置器

- [自定义配置器文档](/docs/plugins/creation/custom-provisioners)
- [示例配置器](https://github.com/hashicorp/packer-plugin-hashicups/tree/main/provisioner/toppings)

后处理器

- [自定义后处理器文档](/docs/plugins/creation/custom-post-processors)
- [示例后处理器](https://github.com/hashicorp/packer-plugin-hashicups/tree/main/post-processor/receipt)

Packer-Plugin-SDK

- [Packer-plugin SDK](https://github.com/hashicorp/packer-plugin-sdk) 包含帮助插件开发人员解决常见需求的工具，如处理 SSH 连接或基本插件架构。

### 审查

在审查过程中，HashiCorp 将对新开发的集成提供反馈。这是一个重要的步骤，允许 HashiCorp 审查和验证你的 Packer 集成。请将集成代码和其他相关日志发送到 [hashicorp-tech-partners@wwpdl.vnet.ibm.com](mailto:hashicorp-tech-partners@wwpdl.vnet.ibm.com) 进行验证。

为了在 Packer 中记录你的插件，请针对 [Packer 项目](https://github.com/hashicorp/packer)提交 GitHub pull request (PR)。请参阅[注册插件文档](/docs/plugins/creation/#registering-plugin-documentation)了解如何向 Packer 注册你的远程插件文档。
审查过程可能需要一段时间才能完成，可能需要对代码进行一些迭代以解决 HashiCorp 团队识别的任何问题。

### 发布

在此阶段，预计集成已完全完成，必要的文档已编写，验收测试已全部通过，并且 HashiCorp 已审查了集成。一旦插件经过 HashiCorp 验证和接受，插件就可以托管在 GitHub 上，以便可以轻松[下载然后安装到 Packer 中](/docs/plugins/creation/#creating-a-github-release)。

集成发布后，将请求供应商签署 HashiCorp 技术合作伙伴协议，以便我们可以将其集成列在 HashiCorp 网站上。

### 支持

许多供应商将发布步骤视为旅程的终点，而在 HashiCorp，我们将其视为旅程的开始。构建集成只是使用户能够利用它来管理其基础设施的第一步。开发完成后，需要持续努力来支持已开发的集成、维护插件并及时解决任何问题。

供应商/合作伙伴的期望是创建一种机制来持续跟踪和解决所有问题。选择不支持其集成的供应商将不被视为经验证的集成，也不能在网站上列出。

## 检查清单

以下是在集成过程中应遵循的有序检查清单。这只是重申上面部分中已记录的步骤。



- 填写 Packer 集成[网络表单](https://docs.google.com/forms/d/e/1FAIpQLSfgq3HJ9Rfsi7LgPLFln28ZrmarATGlD_6A47-Io-bPUftKUw/viewform)
- 如有需要，执行 HashiCorp MNDA（相互保密协议）
- 开发和测试 Packer 集成以及验收测试和文档
- 发送电子邮件至 [hashicorp-tech-partners@wwpdl.vnet.ibm.com](mailto:hashicorp-tech-partners@wwpdl.vnet.ibm.com) 安排初步审查
- 处理审查反馈并完成开发流程
- 向 HashiCorp 提供底层基础设施的凭据用于测试目的
- 演示集成和/或将测试日志发送至 HashiCorp：[hashicorp-tech-partners@wwpdl.vnet.ibm.com](mailto:hashicorp-tech-partners@wwpdl.vnet.ibm.com)
- 执行 HashiCorp 合作伙伴协议文件，审查标志指南、合作伙伴列表等
- 计划继续支持集成，提供额外功能并响应客户问题。



## 联系我们

如有任何问题或反馈，请联系我们：hashicorp-tech-partners@wwpdl.vnet.ibm.com。
