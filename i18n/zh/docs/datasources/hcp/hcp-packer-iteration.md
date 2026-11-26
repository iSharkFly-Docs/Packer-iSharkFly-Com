---
description: |
  `hcp-packer-iteration` 数据源从 HCP Packer 注册表检索迭代信息。此数据源已弃用。请改用 `hcp-packer-version` 数据源。
title: hcp-packer-iteration 数据源参考
---

<Badge type="tip" text="Official" />

# `hcp-packer-iteration`

::: warning
**此数据源已弃用**。请改用 [`hcp-packer-version`](/docs/datasources/hcp/hcp-packer-version) 数据源。
:::

`HCP Packer Iteration` 数据源从 HCP Packer 注册表检索迭代信息。此信息可用于查询 HCP 以获取各种 Packer 构建器的源镜像。

要开始使用 HCP Packer，请参阅 [HCP Packer 文档](https://developer.hashicorp.com/hcp/docs/packer) 或尝试 [HCP Packer 入门教程](https://developer.hashicorp.com/packer/tutorials/hcp-get-started)。

::: warning
**注意：** 如果你尝试引用已停用或已删除的注册表中的元数据，你将收到错误。管理员可以手动停用或删除注册表，HCP Packer 会自动停用存在计费问题的注册表。如有问题，请联系 [HashiCorp 支持](https://www.ibm.com/mysupport)。
:::

## 已撤销的迭代

如果迭代被撤销，`hcp-packer-iteration` 数据源将失败，Packer 不会继续构建。从已撤销的镜像构建新镜像是不合规的。计划撤销的迭代在撤销日期之前仍被视为有效。

## 基本示例

以下是一个完整功能的示例。它存储有关镜像迭代的信息，然后可以作为变量访问。

```hcl
data "hcp-packer-iteration" "hardened-source" {
  bucket_name = "hardened-ubuntu-16-04"
  channel = "packer-test"
}
```

## 完整示例

此数据源可与 hcp-packer-image 数据源结合使用，通过通道检索镜像 ID。你向迭代数据源提供通道名称，然后在镜像数据源中使用迭代源，然后在源块中使用镜像数据源。

```hcl
# 检索有关 HCP Packer "迭代"的信息；"迭代"可以理解为
# 单次 `packer build` 调用创建的所有元数据。
data "hcp-packer-iteration" "hardened-source" {
  bucket_name = "hardened-ubuntu-16-04"
  channel = "packer-test"
}

# 检索有关 HCP Packer "镜像"的信息；镜像可以理解为
# 单个"源"构建器创建的所有元数据（包括制品名称）；
# 这可能包括多个镜像，因此我们提供云区域来消歧。
data "hcp-packer-image" "foo" {
  bucket_name = "hardened-ubuntu-16-04"
  iteration_id = data.hcp-packer-iteration.hardened-source.id
  cloud_provider = "aws"
  region = "us-east-1"
}

# 此源使用先前 Packer 构建的输出。通过以这种方式使用
# HCP Packer 注册表，你可以轻松创建构建流水线，
# 其中单个基础镜像可以在多个次级层中进行自定义。
source "amazon-ebs" "packer-secondary" {
  source_ami       = data.hcp-packer-image.foo.id
  ...
}
```

## 配置参考

配置选项按以下两个类别组织：必需和可选。在每个类别中，可用选项按字母顺序排列并进行描述。

### 必需：

- `bucket_name`（string）- 镜像所在桶的名称。

- `channel`（string）- 检索镜像时使用的通道名称。

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-iteration/data.go; -->

此数据源目前没有可选字段，但我们计划在未来添加过滤字段。

### 输出字段：

- `author_id`（string）- 创建迭代的人

- `bucket_name`（string）- 检索迭代的桶名称

- `complete`（bool）- 如果为 true，此迭代被视为"可以使用"，即使在列出迭代请求中 include_incomplete 标志为"false"也会返回。请注意，如果你使用通道检索迭代，这将始终为"true"；通道不能分配给不完整的迭代。

- `created_at`（string）- 迭代的创建日期。

- `fingerprint`（string）- 构建的指纹；这可以是 git sha 或其他由创建此迭代的 Packer 构建设置的唯一标识符。

- `id`（string）- 迭代 ID。这是一个 ULID，是一个类似于 UUID 的唯一标识符。它由 HCP Packer 注册表在首次创建迭代时创建，并且对此迭代是唯一的。

- `incremental_version`（int32）- 分配给迭代的版本号。此数字是整数，由 HCP Packer 注册表在迭代标记为"完成"后创建。如果新迭代标记为"完成"，HCP Packer 分配给它的版本将始终是之前最高迭代版本加一。

- `updated_at`（string）- 此迭代最后更新的日期。

- `channel_id`（string）- 用于查询镜像迭代的通道 ID。

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/hcp-packer-iteration/data.go; -->
