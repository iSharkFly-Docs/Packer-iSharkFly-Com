---
description: |
  The top-level source block defines reusable builder configuration blocks
title: source - Blocks
---

# The `source` block

::: info
**Note:** This page is about HCL2 Packer templates. HCL2 templates
were first introduced as a beta feature into Packer version 1.5. As of v1.7,
HCL2 support is no longer in beta, and is the preferred way to write Packer
configuration. For the old-style stable configuration language see
[template docs](/docs/templates/legacy_json_templates/). As of v1.6.2, you can
convert your legacy JSON template into an HCL2 config file using the
[hcl2_upgrade command](/docs/commands/hcl2_upgrade).
:::

The top-level `source` block defines reusable builder configuration blocks:

```hcl
# sources.pkr.hcl
source "amazon-ebs" "example-1" {
    // ...
}
```

You can start builders by refering to those source blocks from a [`build`
block](/docs/templates/hcl_templates/blocks/build/), for example :

```hcl
build {
  sources = [
    # Here Packer will use a default ami_name when saving the image.
    "source.amazon-ebs.example",
    "source.amazon-ebs.foo",
  ]
}
```

The build-level [`source` block](/docs/templates/hcl_templates/blocks/build/source) allows to
set specific source fields.

```hcl
build {
  source "source.amazon-ebs.example" {
    # Here Packer will use the provided ami_name instead of defaulting it.
    # Note that fields cannot be overwritten, in other words, you cannot
    # set the 'ami_name' field in the top-level source block.
    ami_name = "specific"
  }
}
```

# Source Variables

It is possible to access the `name` and `type` of your `source` from
provisioners and post-processors:

```hcl
source "null" "first-example" {
  communicator = "none"
}

build {
  name = "roles"

  source "null.first-example" {
    name = "consul"
  }
  source "null.first-example" {
    name = "nomad"
  }
  source "null.first-example" {
    name = "vault"
  }
  sources = ["null.first-example"]

  provisioner "shell-local" {
    inline = ["echo ${source.name} and ${source.type}"]
  }
}

# This will echo something like:
#
# roles.null.consul: consul and null
# roles.null.nomad: nomad and null
# roles.null.vault: vault and null
# roles.null.first-example: first-example and null
```

## Related

- The list of available builders can be found in the [builders](/docs/builders/)
  section.

- A list of [community
  builders](/community-tools#community-builders) is available.

- Create your own [custom builder](/docs/plugins/creation/custom-builders) !
