---
description: |
  `hcp-packer-artifact` 数据源从 HCP Packer 注册表检索制品信息。使用此信息为 Packer 构建器提供源制品。
title: hcp-packer-artifact 数据源参考
---

<Badge type="tip" text="Official" /> <Badge type="tip" text="HCP Packer Ready" />

# `hcp-packer-artifact`

`hcp-packer-artifact` 数据源从 HCP Packer 注册表检索制品信息。使用检索到的信息为各种 Packer 构建器提供源制品。

要开始使用 HCP Packer，请参阅 [HCP Packer 文档](https://developer.hashicorp.com/hcp/docs/packer) 或尝试 [HCP Packer 入门教程](https://developer.hashicorp.com/packer/tutorials/hcp-get-started)。

::: warning
**注意：** 如果你尝试引用已停用或已删除的注册表中的元数据，你将收到错误。管理员可以手动停用或删除注册表，HCP Packer 会自动停用存在计费问题的注册表。如有问题，请联系 [HashiCorp 支持](https://www.ibm.com/mysupport)。
:::

## 已撤销的版本

如果 HCP Packer 版本被撤销，`hcp-packer-version` 数据源将失败，Packer 不会继续构建。从已撤销的制品构建新制品是不合规的。计划撤销的版本在撤销日期之前仍被视为有效。

## 基本示例

以下是一个完整功能的示例。它存储有关镜像制品的信息，然后可以解析并作为变量访问。

```hcl
data "hcp-packer-artifact" "example" {
  bucket_name         = "hardened-ubuntu-16-04"
  version_fingerprint = "${data.hcp-packer-version.hardened-source.fingerprint}"
  platform            = "aws"
  region              = "us-east-1"
}
```

## 完整示例

此数据源可与 hcp-packer-version 数据源结合使用，通过通道检索版本指纹。你向版本数据源提供版本指纹和通道名称，然后在制品数据源中使用版本源，然后在源块中使用制品数据源。

```hcl
# 检索有关 HCP Packer 版本的信息；"版本"可以理解为
# 单次 `packer build` 调用创建的所有元数据。
data "hcp-packer-version" "hardened-source" {
  bucket_name  = "hardened-ubuntu-16-04"
  channel_name = "dev"
}

# 检索有关 HCP Packer 制品的信息；制品可以理解为
# 单个"源"构建器创建的所有元数据（包括制品名称）；
# 这可能包括多个制品，因此我们提供区域来消歧。
data "hcp-packer-artifact" "example" {
  bucket_name         = "hardened-ubuntu-16-04"
  version_fingerprint = data.hcp-packer-version.hardened-source.fingerprint
  platform            = "aws"
  region              = "us-east-1"
}

# 此源使用先前 Packer 构建的输出。通过以这种方式使用
# HCP Packer 注册表，你可以轻松创建构建流水线，
# 其中单个基础制品可以在多个次级层中进行自定义。
source "amazon-ebs" "packer-secondary" {
  source_ami       = data.hcp-packer-artifact.example.external_identifier
  ...
}
```

## 配置参考

配置选项按以下两个类别组织：必需和可选。在每个类别中，可用选项按字母顺序排列并进行描述。

### 必需：

- `bucket_name`（string）- 制品所在桶的名称。

- `channel_name`（string）- 检索制品时使用的通道名称。必须设置 `channel_name` 或 `version_fingerprint`。如果使用同一版本的多个制品，你可能更倾向于先获取版本，然后在后续使用中引用它，因为每个设置了通道的 `hcp_packer_artifact` 都会生成一个可能计费的 HCP Packer 请求，但如果多个 `hcp_packer_artifact` 使用共享的 `hcp_packer_version`，则只会生成一个可能计费的请求。

- `version_fingerprint`（string）- 检索制品时使用的版本指纹。必须设置此项或 `channel_name`。与 `channel_name` 互斥。

- `platform`（string）- 制品所在平台的名称。例如，"aws"、"azure" 或 "gce"。

- `region`（string）- 制品所在区域的名称。例如 "us-east-1"。

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-artifact/data.go; -->

### 可选：

::: warning
**注意：** 此数据源仅返回根据给定选项过滤后找到的第一个制品的元数据，来自与指定版本关联的返回制品列表。因此，如果同一区域中存在多个制品，它只会选择其中一个。在这种情况下，你可以使用 `component_type` 选项按源构建名称（例如：`amazon-ebs.example`）过滤制品。
:::

- `component_type`（string）- 用于创建制品的特定 Packer 构建器。例如，"amazon-ebs.example"

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-artifact/data.go; -->

### 输出字段：

- `platform`（string）- 制品存在的平台名称。例如，"aws"、"azure" 或 "gce"。

- `component_type`（string）- 用于创建制品的特定 Packer 构建器或后处理器。

- `created_at`（string）- 制品创建的日期和时间。

- `build_id`（string）- 创建制品的构建 ID。这是一个 ULID，是一个类似于 UUID 的唯一标识符。它由 HCP Packer 注册表在首次创建构建时创建，并且对此构建是唯一的。

- `version_id`（string）- 版本 ID。这是一个 ULID，是一个类似于 UUID 的唯一标识符。它由 HCP Packer 注册表在首次创建版本时创建，并且对此版本是唯一的。

- `channel_id`（string）- 用于查询版本的通道 ID。如果直接使用 `version_fingerprint` 而不是通道，此值将为空。

- `packer_run_uuid`（string）- 与创建此制品的 Packer 运行关联的 UUID。

- `external_identifier`（string）- 构建给出的远程制品的标识符或 URL。例如，ami-12345。

- `region`（string）- `packer build` 给出的区域。例如 "ap-east-1"。对于本地管理的云，这可能映射到集群、服务器或数据存储。

- `labels`（map[string]string）- 与此构建关联的键:值元数据标签。

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/hcp-packer-artifact/data.go; -->
