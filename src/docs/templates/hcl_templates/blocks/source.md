---
description: |
  The `source` block defines reusable builder configuration blocks. Learn how to define reusable builders using the `source` block.
title: source block reference
---

# `source` block

This topic providers reference information about the `source` block.

## Description

The `source` block defines reusable builder configuration blocks. Builders are commonly used in custom plugins.

## Example 

The following example defines a source for a builder type called `happycloud` with the name `foo`:

```hcl
# sources.pkr.hcl
source "happycloud" "foo" {
    // ...
}
```

There is only one `source.happycloud.foo` top-level source block, but it can be used more than once. 

You can start builders by referring to `source` blocks from a [`build`
block](/docs/templates/hcl_templates/blocks/build/) :

```hcl
build {
  sources = [
    # Here Packer will use a default ami_name when saving the image.
    "source.happycloud.example",
    "source.happycloud.foo",
  ]
}
```

The build-level [`source`
block](/docs/templates/hcl_templates/blocks/build/source) allows to set specific
source fields. Each field must be defined only once and it is currently not
allowed to override a value.

```hcl
build {
  source "source.happycloud.example" {
    # Here Packer will use the provided image_name instead of defaulting it.
    # Note that fields cannot be overwritten, in other words, you cannot
    # set the 'image_name' field in the top-level source block and here at the
    # same time
    image_name = "build_specific_field"
  }
}
```

## Source Variables

Use the following syntax to access the `name` and `type` of your `source` from provisioners and post-processors:

```
<build-name>.<source-type>.<source-name>
```

The following example queries source names used in the build:

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
```

The example returns the following values:

- `roles.null.consul`: Returns `consul` and `null`
- `roles.null.nomad`: Returns `nomad` and `null`
- `roles.null.vault`: Returns `vault` and `null`
- `roles.null.first-example`: Returns `first-example` and `null`

## Related

- Refer to the [builders reference overview](/docs/builders/) for information about Packer builders.

- Refer to the [community builders reference](/docs/community-tools#community-builders) for information about builders maintained by the community.

- Refer to [Create Custom Builders](/docs/plugins/creation/custom-builders) for instructions on how to create your own builders.
