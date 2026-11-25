---
title: Blocks - Configuration Language
description: The HCL language has a number of blocks that can be used to configure builds.
---

# Built-in Blocks

::: info
**Note:** This page is about HCL2 Packer templates. HCL2 templates
were first introduced as a beta feature into Packer version 1.5. As of v1.7,
HCL2 support is no longer in beta, and is the preferred way to write Packer
configuration. For the old-style stable configuration language see
[template docs](/docs/templates/legacy_json_templates/). As of v1.6.2, you can
convert your legacy JSON template into an HCL2 config file using the
[hcl2_upgrade command](/docs/commands/hcl2_upgrade).
:::

The Packer - HCL2 language includes a number of built-in blocks that you can
use to configure builds. A block is a container for configuration.

The most important blocks can be broken into a couple of major types:

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

Use the sidebar to navigate to detailed documentation for each of these blocks.

Other blocks, such as the "packer" block, provide information to the Packer core
about what version it is allowed to run. The "required_plugins" block helps the
Packer core

Blocks can be defined in multiple files and `packer build folder` will build
using solely the files from a directory named `folder`.

Packer does not support user-defined blocks and so only the blocks built in to
the language are available for use. The navigation for this section includes a
list of all of the available built-in HCL2 blocks.

## Config example:

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
source "amazon-ebs" "example-1" {
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
