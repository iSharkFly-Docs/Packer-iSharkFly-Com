---
title: 数据源概述
description: |
  数据源包含你希望在 Packer 配置中使用的数据。在配置中定义数据源，以便 Packer 可以在构建期间使用外部数据。
---

# 数据源

数据源允许 Packer 获取要在模板中使用的数据，包括在 Packer 外部定义的信息。

请参阅 [`data`](/docs/templates/hcl_templates/datasources) 块文档，了解有关使用数据源的更多信息。该文档还包含每种数据源类型的详细信息。

数据源仅在 HCL2 模板中可用，需要 Packer `v1.7.0` 及更新版本。
