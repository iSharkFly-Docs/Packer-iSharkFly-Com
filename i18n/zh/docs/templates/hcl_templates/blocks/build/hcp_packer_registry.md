---
description: >
  `hcp_packer_registry` 块指定 HCP Packer 注册表中新镜像或更新镜像的详细信息。了解如何配置 `hcp_packer_registry` 块。
title: hcp_packer_registry 块参考
---

# `hcp_packer_registry` 块

本文提供关于 `hcp_packer_registry` 块的参考信息。

## 描述

`hcp_packer_registry` 块配置 Packer 在 HCP Packer 注册表中创建或更新的镜像的详细信息。使用 `hcp_packer_registry` 块自定义 Packer 发送到 HCP Packer Registry 的元数据。

要开始使用 HCP Packer，请参阅 [HCP Packer 文档](https://developer.hashicorp.com/hcp/docs/packer)或尝试 [HCP Packer 入门教程](https://developer.hashicorp.com/packer/tutorials/hcp-get-started)。

## 用法

此块从 Packer 1.7.7 版本开始可用。

将 `hcp_packer_registry` 块添加到你的模板文件以启用 HCP Packer 模式。在 HCP Packer 模式下，如果设置了适当的 HCP 凭据（`HCP_CLIENT_ID` 和 `HCP_CLIENT_SECRET`），Packer 会将模板中所有构建的元数据推送到远程注册表。如果未设置 HCP 凭据，Packer 将使构建失败并立即退出，以避免定义的构建器（源块）和 HCP Packer 注册表之间的任何潜在制品漂移。

::: warning
**注意：** 如果你尝试引用已停用或已删除的注册表中的元数据，你将收到错误。管理员可以手动停用或删除注册表，HCP Packer 会自动停用有计费问题的注册表。如有问题，请联系 [HashiCorp 支持](https://www.ibm.com/mysupport)。
:::

```hcl
# file: builds.pkr.hcl
source "happycloud" "macos" {
  os = "macos_amd64"
}

build {
  sources = ["source.happycloud.macos"]
}
hcp_packer_registry {
  bucket_name = "ios-dev"

  description = <<EOT
关于正在发布到 HCP Packer Registry 的制品的镜像的一些不错的描述。=D
  EOT

  bucket_labels = {
    "team" = "ios-development",
    "os"   = "macos"
  }

  build_labels = {
    "xcode"   = "11.3.0"
    "version" = "Big Sur"
  }
}
```

- `bucket_name` (string) - 发布到 HCP Packer 注册表时的镜像名称。应始终相同，否则将创建新镜像。如果未设置，默认为 `build.name`。如果设置了 `HCP_PACKER_BUCKET_NAME`，将被覆盖。

- `bucket_labels` (map[string]string) - 标签映射。可以提供任何信息，如工具版本（例如 Go 1.17、Python 3.5 等）。存储桶标签将出现在镜像的主页面，并且每当更改并将新迭代推送到 HCP Packer 注册表时都会更新。

- `build_labels` (map[string]string) - 标签映射。可以提供任何信息，如工具版本（例如 Go 1.17、Python 3.5 等）。构建标签将出现在迭代的构建部分。构建标签特定于迭代，并且在推送到 HCP Packer 注册表时将添加到构建中。不允许对已完成的迭代更新构建标签。

- `description` (string) - 镜像描述。用于提供关于镜像的摘要。描述将出现在镜像的主页面，并且每当更改并将新构建推送到 HCP Packer 注册表时都会更新。应包含最多 255 个字符。如果未设置，默认为 `build.description`。

- `labels` (map[string]string) - 在 Packer 1.7.9 中已弃用。有关详细信息，请参阅 [`bucket_labels`](#bucket_labels)。
