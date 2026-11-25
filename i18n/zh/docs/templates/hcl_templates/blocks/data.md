---
description: >
  `data` 块在 Packer 配置中定义数据源。了解如何配置 `data` 块。
title: data 块参考
---

# `data` 块

`data` 块在 Packer 配置中定义数据源。以下示例指示 Packer 查询 `amazon-ami` 数据源以获取要在模板中使用的信息。

```hcl
# datasource.pkr.hcl
data "amazon-ami" "basic-example" {
  // ...
}
```

有关在配置中使用 `data` 块的说明，请参阅[数据源](/docs/templates/hcl_templates/datasources)。
