---
description: |
  `hcp-packer-image` 数据源从 HCP Packer 注册表检索镜像信息。此数据源已弃用，请改用 `hcp-packer-artifact` 数据源。
title: hcp-packer-image 数据源参考
---

<Badge type="tip" text="Official" />

# `hcp-packer-image`

::: warning
**此数据源已弃用**。请改用 [`hcp-packer-artifact`](/docs/datasources/hcp/hcp-packer-artifact) 数据源。
:::

`hcp-packer-image` 数据源从 HCP Packer 注册表检索镜像信息。此信息可用于为各种 Packer 构建器提供源镜像。

要开始使用 HCP Packer，请参阅 [HCP Packer 文档](https://developer.hashicorp.com/hcp/docs/packer) 或尝试 [HCP Packer 入门教程](https://developer.hashicorp.com/packer/tutorials/hcp-get-started)。

::: warning
**注意：** 如果你尝试引用已停用或已删除的注册表中的元数据，你将收到错误。管理员可以手动停用或删除注册表，HCP Packer 会自动停用存在计费问题的注册表。如有问题，请联系 [HashiCorp 支持](https://www.ibm.com/mysupport)。
:::

## 已撤销的迭代

如果迭代被撤销，`hcp-packer-iteration` 数据源将失败，Packer 不会继续构建。从已撤销的镜像构建新镜像是不合规的。计划撤销的迭代在撤销日期之前仍被视为有效。

## 基本示例

以下是一个完整功能的示例。它存储有关镜像的信息，然后可以解析并作为变量访问。

```hcl
data "hcp-packer-image" "example" {
  bucket_name = "hardened-ubuntu-16-04"
  iteration_id = "${data.hcp-packer-iteration.hardened-source.id}"
  cloud_provider = "aws"
  region = "us-east-1"
}
```

## 完整示例

此数据源可与 hcp-packer-iteration 数据源结合使用，通过通道检索镜像 ID。你向迭代数据源提供通道名称，然后在镜像数据源中使用迭代源，然后在源块中使用镜像数据源。

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
  # ...
}
```

## 配置参考

配置选项按以下两个类别组织：必需和可选。在每个类别中，可用选项按字母顺序排列并进行描述。

### 必需：

- `bucket_name`（string）- 镜像所在桶的名称。

- `channel`（string）- 检索镜像时使用的通道名称。必须设置此项或 `iteration_id`。与 `iteration_id` 互斥。如果使用同一迭代的多个镜像，你可能更倾向于先获取迭代，然后在后续使用中引用它，因为每个设置了通道的 `hcp-packer-image` 都会生成一个可能计费的 HCP Packer 请求，但如果多个 `hcp-packer-image` 使用共享的 `hcp-packer-iteration`，则只会生成一个可能计费的请求。

- `iteration_id`（string）- 检索镜像时使用的迭代 ID。必须设置此项或 `channel`。与 `channel` 互斥。

- `cloud_provider`（string）- 镜像所在云提供商的名称。例如，"aws" 或 "gce"。

- `region`（string）- 镜像所在云区域的名称。例如 "us-east-1"。

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-image/data.go; -->

### 可选：

::: warning
**注意：** 此数据源仅返回根据给定选项过滤后找到的第一个镜像的元数据，来自与指定迭代关联的返回镜像列表。因此，如果同一区域中存在多个镜像，它只会选择其中一个。在这种情况下，你可以使用 `component_type` 选项按源构建名称（例如：`amazon-ebs.example`）过滤镜像。
:::

- `component_type`（string）- 用于创建镜像的特定 Packer 构建器。例如，"amazon-ebs.example"

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-image/data.go; -->

### 输出字段：

- `cloud_provider`（string）- 镜像存在的云提供商名称。例如，"aws"、"azure" 或 "gce"。

- `component_type`（string）- 用于创建镜像的特定 Packer 构建器或后处理器。

- `created_at`（string）- 镜像创建的日期和时间。

- `build_id`（string）- 创建镜像的构建 ID。这是一个 ULID，是一个类似于 UUID 的唯一标识符。它由 HCP Packer 注册表在首次创建构建时创建，并且对此构建是唯一的。

- `iteration_id`（string）- 迭代 ID。这是一个 ULID，是一个类似于 UUID 的唯一标识符。它由 HCP Packer 注册表在首次创建迭代时创建，并且对此迭代是唯一的。

- `channel_id`（string）- 用于查询镜像迭代的通道 ID。如果直接使用 `iteration_id` 而不是通道，此值将为空。

- `packer_run_uuid`（string）- 与创建此镜像的 Packer 运行关联的 UUID。

- `id`（string）- 构建给出的远程云镜像的 ID 或 URL。

- `region`（string）- `packer build` 给出的云区域。例如 "ap-east-1"。对于本地管理的云，这可能映射到集群、服务器或数据存储。

- `labels`（map[string]string）- 与此构建关联的键:值元数据标签。

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/hcp-packer-image/data.go; -->
