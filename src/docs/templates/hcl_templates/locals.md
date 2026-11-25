---
title: Local variables
description: >-
  The `local` and `locals` blocks define local variables that assign a name to an expression. Learn how to configure local variables.
---

# Local variables

This topic provides reference information about the `local` and `locals` blocks, which define local variables that you can use in your Packer templates. To learn about input variables, refer to
[Input variables](/docs/templates/hcl_templates/variables).

## Introduction

Local variables assign a name to an expression, which you can use multiple
times within a folder. The expression is evaluated at run time, and can
reference input variables, other local variables, data sources, and HCL
functions. You cannot overwrite local variables.

Refer to [Input Variables and local variables](/guides/hcl/variables) for additional information about variables in Packer. 

## Examples

Local variables are defined in a `local` or `locals` block:

```hcl
# Using the local block allows you to mark locals as sensitive, which will
# filter their values from logs.
local "mylocal" {
  expression = "${var.secret_api_key}"
  sensitive  = true
}

# Using the locals block is more compact and efficient for declaring many locals
# Ids for multiple sets of EC2 instances, merged together
locals {
  instance_ids = "${concat(aws_instance.blue.*.id, aws_instance.green.*.id)}"
}

# A computed default name prefix
locals {
  default_name_prefix = "${var.project_name}-web"
  name_prefix         = "${var.name_prefix != "" ? var.name_prefix : local.default_name_prefix}"
}

# Local variables can be referenced using the "local." prefix.
source "virtualbox-iso" "example" {
  output = "${local.name_prefix}-files"
  # ...
}
```

Named local maps can be merged with local maps to implement common or default
values:

```hcl
# Define the common tags for all resources
locals {
  common_tags = {
    Component   = "awesome-app"
    Environment = "production"
  }
}

# Create a resource that blends the common tags with instance-specific tags.
source "amazon-ebs" "server" {
  source_ami    = "ami-123456"
  instance_type = "t2.micro"

  tags = "${merge(
    local.common_tags,
    {
      "Name" = "awesome-app-server",
      "Role" = "server"
    }
  )}"
  # ...
}
```

## Single `local` block

The `local` block defines exactly one local variable within a folder. The block
label is the name of the local, and the "expression" is the expression that
should be evaluated to create the local. Using this block, you can optionally
supply a "sensitive" boolean to mark the variable as sensitive and filter it
from logs.

```hcl
local "mylocal" {
  expression = "${var.secret_api_key}"
  sensitive  = true
}
```

This block is also very useful for defining complex locals. Packer might take some time to expand and evaluate `locals`
with complex expressions dependent on other locals. The `locals` block is read as a map.  Maps are not sorted, and therefore
the evaluation time is not deterministic.

To avoid that, singular `local` blocks should be used instead. These will be
evaluated in the order they are defined, and the evaluation order and time will always be the same.

## `locals` block

The `locals` block defines one or more local variables within a folder.

The names given for the items in the `locals` block must be unique throughout a
folder. The given value can be any expression that is valid within the current
folder.

The expression of a local value can refer to other locals, but reference cycles
are not allowed. That is, a local cannot refer to itself or to a variable that
refers (directly or indirectly) back to it.

It's recommended to group together logically-related local variables into a single
block, particularly if they depend on each other. This will help the reader
understand the relationships between variables. Conversely, prefer to define
_unrelated_ local variables in _separate_ blocks, and consider annotating each
block with a comment describing any context common to all of the enclosed
locals.

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


