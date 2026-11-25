---
description: >
  The locals block also called the local-variable block defines locals within
  your Packer configuration.
title: locals - Blocks
---

# The `locals` block

::: info
**Note:** This page is about HCL2 Packer templates. HCL2 templates
were first introduced as a beta feature into Packer version 1.5. As of v1.7,
HCL2 support is no longer in beta, and is the preferred way to write Packer
configuration. For the old-style stable configuration language see
[template docs](/docs/templates/legacy_json_templates/). As of v1.6.2, you can
convert your legacy JSON template into an HCL2 config file using the
[hcl2_upgrade command](/docs/commands/hcl2_upgrade).
:::

The `locals` block, also called the `local-variable` block, defines locals within
your Packer configuration.

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

# More on variables

- Read the [full locals](/docs/templates/hcl_templates/locals) description for a more
  thorough read.
- Read the [variables guide](/guides/hcl/variables) for more examples.
