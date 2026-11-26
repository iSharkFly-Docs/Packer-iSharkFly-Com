---
description: |
  HCP Packer 数据源查询存储在 HCP Packer 注册表中的数据。当你的制品元数据集中在 HCP 中时，请使用这些数据源。
title: HCP Packer 注册表数据源概述
---

<Badge type="tip" text="Official" />

# HCP Packer 注册表数据源概述

HCP Packer 注册表连接制品工厂和制品部署，使开发和安全团队能够以集中的方式协同创建、管理和使用制品。

## 简介

HCP Packer 注册表存储有关制品的元数据，包括创建时间、制品在云中的位置以及与构建关联的 git 提交信息。你可以使用注册表跟踪 Packer 构建生成的制品信息，明确指定哪些制品适合测试和生产环境，并在 Packer 和 Terraform 配置中查询要使用的正确制品。

以下 Packer 数据源协同工作，从 HCP Packer 注册表确定和检索信息：

- [hcp-packer-version](/docs/datasources/hcp/hcp-packer-version)：检索 HCP Packer 注册表中 HCP Packer 版本的信息。
- [hcp-packer-artifact](/docs/datasources/hcp/hcp-packer-artifact)：检索在 HCP Packer 注册表中创建的特定制品的信息。

以下数据源类型自 v1.10.1 起已弃用：

- [hcp-packer-iteration](/docs/datasources/hcp/hcp-packer-iteration)：检索 HCP Packer 注册表中迭代的信息。此数据源类型已弃用。请改用 `hcp-packer-version`。
- [hcp-packer-image](/docs/datasources/hcp/hcp-packer-image)：检索在 HCP Packer 注册表中创建的特定镜像的信息。此数据源类型已弃用。请改用 `hcp-packer-artifact`。
