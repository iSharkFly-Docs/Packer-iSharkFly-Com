---
description: >
  The data block defines data sources within your Packer configuration.
title: data - Blocks
---

# The `data` block

The `data` block defines data sources within your Packer configuration.

```hcl
# datasource.pkr.hcl
data "amazon-ami" "basic-example" {
  // ...
}
```

# More on data sources

- Read the [full Data Sources](/docs/templates/hcl_templates/datasources) description for a more
  thorough read.
