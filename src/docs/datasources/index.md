---
description: |
  The Amazon plugin is able to fetch data from AWS. To achieve this, the plugin comes with
  data sources to retrieve AMI and secrets information.
title: Amazon - Data Sources
---

# Amazon Data Sources

The Amazon plugin is able to fetch data from AWS. To achieve this, the plugin comes with data sources to retrieve AMI and secrets information.
Packer supports the following data sources at the moment:

- [amazon-ami](https://www.packer.io/docs/datasources/amazon/ami) - Filter and fetch an Amazon AMI to output all the AMI information.

- [amazon-secretsmanager](https://www.packer.io/docs/datasources/amazon/secretsmanager) - Retrieve information
about a Secrets Manager secret version, including its secret value.

## How to use this plugin

From Packer v1.7.0, copy and paste this code into your Packer configuration to install this plugin.
Then, run [`packer init`](/docs/commands/init).

```hcl
packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.1"
      source = "github.com/hashicorp/amazon"
    }
  }
}
```

