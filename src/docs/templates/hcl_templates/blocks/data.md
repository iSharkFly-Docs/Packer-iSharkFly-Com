---
description: >
  The `data` block defines data sources within your Packer configuration. Learn how to configure `data` blocks. 
title: data block referenece
---

# `data` block

The `data` block defines data sources within your Packer configuration. The following example instructs Packer to query the `amazon-ami` data source for information to use in the template.

```hcl
# datasource.pkr.hcl
data "amazon-ami" "basic-example" {
  // ...
}
```

Refer to [Data Sources](/docs/templates/hcl_templates/datasources) for instructions about using the `data` block in your configuration. 
