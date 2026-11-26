---
description: |
  Packer 可以将已完成构建的元数据发布到 HCP Packer 注册表。了解如何将 Packer 连接到 HCP Packer 注册表。
title: 连接到 HCP Packer 注册表概述
---

# 连接到 HCP Packer 注册表

本主题概述了如何将 JSON 和 HCL2 模板连接到 HCP Packer 注册表，并提供了 HCP Packer 环境变量的完整列表。有关配置详细信息和示例，请参阅 HCP Packer 文档中的 [Packer 模板配置](https://developer.hashicorp.com/hcp/docs/packer/store-image-metadata/packer-template-configuration) 页面。

# 简介

HCP Packer 注册表弥合了制品工厂和制品部署之间的差距，使开发和安全团队能够以集中的方式协同创建、管理和使用制品。

HCP Packer 注册表存储有关制品的元数据，包括创建时间、制品在外部平台上的位置，以及与构建关联的 git 提交（如果有）。你可以使用注册表跟踪 Packer 构建生成的制品信息，明确指定哪些制品适合测试和生产环境，并在 Packer 和 Terraform 配置中查询要使用的正确制品。

你可以将 HCP Packer 与 JSON 和 HCL2 模板一起使用。如果你使用 JSON 模板，我们建议从 [HCP Packer 环境变量](#hcp-packer-环境变量) 开始，然后在可能时迁移到 HCL。

## 要求

需要 Packer 1.9.1 或更新版本才能使用 `HCP_PROJECT_ID` 环境变量，该变量允许 Packer 连接到 HCP 中的特定项目。如果你使用 1.9.1 之前的 Packer 版本配置构建以发送多项目元数据，构建将失败。

## HCP Packer 环境变量

以下环境变量允许你配置 Packer 将制品元数据推送到活动注册表，而无需更改模板。你可以将环境变量与 JSON 和 HCL2 模板一起使用。有关完整说明和示例，请参阅 HCP Packer 文档中的[使用环境变量进行基本配置](https://developer.hashicorp.com/hcp/docs/packer/store-image-metadata/packer-template-configuration#basic-configuration-with-environment-variables)。

你必须设置身份验证环境变量才能连接到 HCP Packer，你可以直接设置客户端 ID 和密钥，或者（在 Packer 1.14.2 及更高版本上）使用 HCP 证书文件。

对于客户端 ID 和密钥，你需要设置以下环境变量：

- `HCP_CLIENT_ID` - Packer 可用于向 HCP Packer 注册表进行身份验证的 HashiCorp Cloud Platform 服务主体的 HCP 客户端 ID。

- `HCP_CLIENT_SECRET` - Packer 可用于向 HCP Packer 注册表进行身份验证的 HashiCorp Cloud Platform 服务主体的 HCP 客户端密钥。

对于基于证书的身份验证，只需在 `HCP_CRED_FILE` 环境变量中指定有效 HCP 证书文件的位置，或将其放在 HCP SDK 的默认位置 `~/.config/hcp/cred_file.json`。

有关 [Workload Identity Federation](https://developer.hashicorp.com/hcp/docs/hcp/iam/service-principal/workload-identity-federation) 和证书身份验证的更多信息，请参阅以下 HCP 文档。

- `HCP_PACKER_BUCKET_NAME` - 你希望 HCP Packer 存储与模板关联的构建制品元数据的 HCP Packer Bucket 名称。如果 bucket 不存在，HCP Packer 会自动创建它。如果你的 HCL2 模板包含 `hcp_packer_registry` 块，配置中指定的 bucket 名称将被此环境变量覆盖。

你可以设置这些额外的环境变量来控制元数据如何推送到注册表。

- `HCP_PACKER_BUILD_FINGERPRINT` - 分配给每个版本的唯一标识符。要重用与现有不完整版本关联的指纹，你必须设置此环境变量。有关使用详情，请参阅[版本指纹](#版本指纹)。

- `HCP_PACKER_REGISTRY` - 设置后，Packer 不会从其他已配置的模板将制品元数据推送到 HCP Packer。允许的值为 [0|OFF]。

- `HCP_ORGANIZATION_ID` - 链接到你的服务主体的 HCP 组织 ID。此环境变量不是必需的，仅用于与 HCP SDK 身份验证选项保持一致。其使用可能会在未来版本中更改。

- `HCP_PROJECT_ID` - 要使用的 HCP 项目 ID。如果你的服务主体有权访问多个项目，这很有用，因为默认情况下 Packer 会选择最先创建的项目作为目标。

::: info
**注意**：如果你使用项目级服务主体进行身份验证，则必须设置 HCP_PROJECT_ID 环境变量，否则 Packer 将尝试获取组织的项目列表，并由于项目级服务主体缺少权限而出错。这从 Packer 1.9.3 开始支持；旧版本的 Packer 不支持使用项目级服务主体。
:::

## HCP Packer 注册表块

使用基本配置时，Packer 只能从模板推断构建名称和构建指纹这些元数据。对于 HCL2 模板，我们建议将 `hcp_packer_registry` 块添加到你的模板中，以便你可以自定义 Packer 发送到注册表的元数据。

`hcp_packer_registry` 块仅适用于 HCL2 Packer 模板。JSON 没有 [`PACKER_CONFIG`](/docs/configure#packer-s-config-file) 等效项。

有关配置参数的完整列表，请参阅 [`hcp_packer_registry`](/docs/templates/hcl_templates/blocks/build/hcp_packer_registry)。有关如何自定义制品元数据的信息和示例，请参阅 HCP Packer 文档中的[自定义配置](https://developer.hashicorp.com/hcp/docs/packer/store-image-metadata/packer-template-configuration#custom-configuration)。

## 版本指纹

Packer 使用唯一指纹来跟踪与版本关联的构建完成情况。默认情况下，Packer 在每次调用 `packer build` 时会自动生成指纹，除非通过 `HCP_PACKER_BUILD_FINGERPRINT` 环境变量手动提供指纹。

在 1.9.0 之前的版本中，此指纹是根据存储模板的当前 HEAD 的 Git SHA 计算的。如果你使用非 Git 管理的模板运行构建，则必须在调用 `packer build` 之前设置 `HCP_PACKER_BUILD_FINGERPRINT` 环境变量。
从 Packer 1.9.0 开始，指纹生成完全不依赖 Git，Packer 现在为每次 `packer build` 调用生成唯一的字典序可排序标识符 (ULID) 作为指纹。

### 指纹和不完整版本

当你使用 Packer 构建模板时，总是有可能因为网络问题、配置失败或某些上游错误而不成功。发生这种情况时，Packer 会输出与不完整版本关联的生成指纹，以便你可以使用 `HCP_PACKER_BUILD_FINGERPRINT` 环境变量恢复构建该版本；版本可以在标记为完成之前恢复。此环境变量对于恢复不完整版本是必需的，否则 Packer 将为构建创建新版本。

有两种设置自己指纹的时机和方式：

* 你可以在第一次对此模板调用 `packer build` 之前设置它。这将要求指纹是唯一的，否则 Packer 将尝试继续具有相同指纹的版本。
* 你可以对模板调用 `packer build`，如果失败，你可以从命令输出中获取指纹并将其设置为后续运行，然后 Packer 将继续构建此版本。

第一种方式推荐用于 CI 环境，因为你可以使用 CI 的环境变量生成唯一的、确定性的指纹，然后在步骤因任何原因失败时重用它。这将允许你继续构建同一版本，而不是在每次调用时创建新版本。

第二种方式适合本地构建，因为你可以直接与构建环境交互，因此可以通过设置 Packer 在失败时提供的指纹来决定是否要继续构建版本。

请注意，在所有情况下，只有在版本尚未完成时才能继续版本。一旦版本完成，就无法修改，你必须创建新版本。
