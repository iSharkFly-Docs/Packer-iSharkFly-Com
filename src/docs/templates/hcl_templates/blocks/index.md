---
title: Built-in blocks overview
description: A block is a container for configuration in a Packer template. Learn about the types of configration blocks built into HCL for Packer. 
---

# Built-in blocks overview

This topic provides an overview of the configuration blocks built into the Packer language that you can use to write Packer templates in HCL2.

## Introduction

A block is a container for configuration. You can use the following types of blocks in your Packer templates:

- `build` blocks contain configuration for a specific combination of builders,
  provisioners, and post-processors used to create a specific image artifact.
- `source` blocks contain configuration for builder plugins. Once defined,
  sources can be used and further configured by the "build" block.
- `provisioner` blocks contain configuration for provisioner plugins. These
  blocks are nested inside of a build block.
- `post-processor` and `post-processors` blocks contain configuration for
  post-processor plugins and post-processor plugin sequences. They are also
  nested within `build` blocks.
- `variable` blocks contain configuration for variables that can either be
  defaulted in configuration or set by the user at runtime.
- `locals` blocks contain configuration for variables that can be created using
  HCL functions or data sources, or composited from variables created in the
  variables blocks.

The documentation contains information for each block type.

Other blocks, such as the `packer` block, provide information to the Packer core
about what version it is allowed to run. The `required_plugins` block helps the
Packer core

Blocks can be defined in multiple files and `packer build folder` will build
using solely the files from a directory named `folder`.

Packer does not support user-defined blocks and so only the blocks built in to
the language are available for use. The documentation includes all of the available built-in HCL2 blocks.

## Configuration examples

```hcl
# variables.pkr.hcl
variable "foo" {
    type        = string
    default     = "the default value of the `foo` variable"
    description = "description of the `foo` variable"
    sensitive   = false
    # When a variable is sensitive all string-values from that variable will be
    # obfuscated from Packer's output.
}
```

- [Variable block documentation](/docs/templates/hcl_templates/blocks/variable).

```hcl
# locals.pkr.hcl
locals {
    # locals can be bare values like:
    wee = local.baz
    # locals can also be set with other variables :
    baz = "Foo is '${var.foo}' but not '${local.wee}'"
}

# Use the singular local block if you need to mark a local as sensitive
local "mylocal" {
  expression = "${var.secret_api_key}"
  sensitive  = true
}
```

- [Locals block documentation](/docs/templates/hcl_templates/blocks/locals).

```hcl
# sources.pkr.hcl
source "happycloud" "foo" {
    // ...
}
```

- [source block documentation](/docs/templates/hcl_templates/blocks/source).

```hcl
# build.pkr.hcl
build {
    # use the `name` field to name a build in the logs.
    # For example this present config will display
    # "buildname.amazon-ebs.example-1" and "buildname.amazon-ebs.example-2"
    name = "buildname"

    sources = [
        # use the optional plural `sources` list to simply use a `source`
        # without changing any field.
        "source.amazon-ebs.example-1",
    ]

    source "source.amazon-ebs.example-2" {
        # Use the singular `source` block set specific fields.
        # Note that fields cannot be overwritten, in other words, you cannot
        # set the 'output' field from the top-level source block and here.
        output = "different value"
        name = "differentname"
    }

    provisioner "shell" {
        scripts = fileset(".", "scripts/{install,secure}.sh")
    }

    post-processor "shell-local" {
        inline = ["echo Hello World from ${source.type}.${source.name}"]
    }
}
```

- [build block documentation](/docs/templates/hcl_templates/blocks/build/).

```hcl
# datasource.pkr.hcl
data "amazon-ami" "basic-example" {
  // ...
}
```

- [data block documentation](/docs/templates/hcl_templates/blocks/data).
