---
description: |
  `hcp-packer-version` 数据源从 HCP Packer 注册表检索 HCP Packer 版本的信息。使用此信息获取源的外部标识符。
title: hcp-packer-version 数据源参考
---

<Badge type="tip" text="Official" /> <Badge type="tip" text="HCP Packer Ready" />

# `hcp-packer-version`

`hcp-packer-version` 数据源从 HCP Packer 注册表检索 HCP Packer 版本的信息。你可以使用版本信息查询 HCP 以获取源的外部标识符，以便在各种 Packer 构建器中使用。

要开始使用 HCP Packer，请参阅 [HCP Packer 文档](https://developer.hashicorp.com/hcp/docs/packer) 或尝试 [HCP Packer 入门教程](https://developer.hashicorp.com/packer/tutorials/hcp-get-started)。

如果你尝试引用已停用或已删除的注册表中的元数据，Packer 会打印错误。管理员可以手动停用或删除注册表，HCP Packer 会自动停用存在计费问题的注册表。如有问题，请联系 [HashiCorp 支持](https://www.ibm.com/mysupport)。

## 已撤销的版本

如果 HCP Packer 版本被撤销，`hcp-packer-version` 数据源将失败，Packer 不会继续构建。从已撤销的制品构建新制品是不合规的。计划撤销的版本在撤销日期之前仍被视为有效。

## 基本示例

以下是一个完整功能的示例。它存储有关 HCP Packer 版本的信息，然后可以作为变量访问。

```hcl
data "hcp-packer-version" "hardened-source" {
  bucket_name  = "hardened-ubuntu-16-04"
  channel_name = "dev"
}
```

## 完整示例

此数据源可与 `hcp-packer-artifact` 数据源结合使用以检索制品标识符。你向版本数据源提供版本指纹和通道名称，然后在制品数据源中使用版本源，然后在源块中使用制品数据源。

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

- `bucket_name`（string）- HCP Packer 注册表中的桶名称。

- `channel_name`（string）- 给定桶中用于检索版本的通道名称。

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-version/data.go; -->

此数据源目前没有可选字段，但我们计划在未来添加过滤字段。

### 输出字段：

- `author_id`（string）- 创建此版本的作者名称。

- `bucket_name`（string）- 与此版本关联的桶名称。

- `status`（string）- 版本的当前状态。

- `created_at`（string）- 版本的创建日期。

- `fingerprint`（string）- 版本的指纹；这是由创建此版本的 Packer 构建设置的唯一标识符。

- `id`（string）- 版本 ID。这是一个 ULID，是一个类似于 UUID 的唯一标识符。它由 HCP Packer 注册表在首次创建版本时创建，并且对此版本是唯一的。

- `name`（string）- 版本名称由 HCP Packer 注册表在版本"完成"后创建。不完整或失败的版本目前默认名称为"v0"。

- `updated_at`（string）- 此版本最后更新的日期。

- `channel_id`（string）- 用于查询此版本的通道 ID。

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/hcp-packer-version/data.go; -->
