---
title: Data Sources
description: >-
  A `data` block defines a data source that instructs Packer to query data defined outside of Packer for use in builds and sources. Learn how to configure `data` blocks to define data sources.
---

# Data sources reference

This topic describes how to use the `data` block to configure data sources in your HCL Packer templates. The `data` block instructs Packer to fetch or compute data for use in [`locals` blocks](/docs/templates/hcl_templates/blocks/locals) and
[`source` blocks](/docs/templates/hcl_templates/blocks/source) so that builders can use of information defined outside of Packer.

## Using data sources

A data source is declared using a data block, and the configuration looks like the following:

```hcl
data "amazon-ami" "example" {
    filters = {
        virtualization-type = "hvm"
        name = "ubuntu/images/*ubuntu-xenial-16.04-amd64-server-*"
        root-device-type = "ebs"
    }
    owners = ["099720109477"]
    most_recent = true
}
```

A `data` block requests that Packer read from a given data source (`"amazon-ami"`) and export the result under the given
local name (`"example"`). The name is used to refer to this data source from elsewhere in the same Packer configuration.

The data block creates a data instance of the given _type_ (first block label) and _name_ (second block label).
The combination of the type and name must be unique within a configuration.

Within the block (the `{ }`) is the configuration for the data instance. The configuration is dependent on the data source type,
and is documented for each data source. For example the configuration of the `amazon-ami` data source can be found at [plugins/datasources/amazon/ami](https://developer.hashicorp.com/packer/plugins/datasources/amazon/ami#configuration-reference).

A data source can output one or more attributes, which can be used by adding their key name to the data source unique
identifier, like `data.<TYPE>.<NAME>.<ATTRIBUTE>`.

The output from the `amazon-ami.example` above can be accessed as follows:

Output data:

```
"data.amazon-ami.example" {
  id = "ami12345"
  name = "MyAMI"
  creation_date = "01/01/2021"
  owner = "123456789"
  owner_name = "Some Name"
  tags = {"tag1": "value"}
}
```

Usage:

```hcl
// in a local
locals {
  source_ami_id = data.amazon-ami.example.id
  source_ami_name = data.amazon-ami.example.name
 }
```

```hcl
// in a source
source "amazon-ebs" "basic-example" {
  source_ami = local.source_ami
  // ...
}
```

## Known limitations

At this present time the use of locals within data sources such as the example below is not supported. 

```hcl
locals {
  cloud_owners           = ["happycloud"]
  cloud_base_filter_name = "cloud-hvm-2.0.*-x86_64-gp2"
}

data "happycloud" "happycloud-linux2-east" {
  filters = {
    name = local.cloud_base_filter_name
  }
  most_recent = true
  owners = local.cloud_owners
}
```

Locals can reference data sources but data sources can not reference locals to avoid cyclic dependencies, where a local
may reference a data source that references the same local or some other locals variable. The preferred method, at this time,
for referencing user input data within a data source is to use the `variable` block. 

```hcl
variable "cloud_base_filter_name" {
  type     = string
  default  = "cloud-hvm-2.0.*-x86_64-gp2"
}

variable "cloud_owners" {
  type     = string
  default  = "happycloud"
}

data "happycloud" "happycloud-linux2-east" {
  filters = {
    name =  var.cloud_base_filter_name
  }
  most_recent = true
  owners = var.cloud_owners
}
```


## Related

- The list of available data sources can be found in the [data sources](/docs/datasources/)
  section.
- Create your own [custom data source](/docs/plugins/creation/custom-datasources) !
