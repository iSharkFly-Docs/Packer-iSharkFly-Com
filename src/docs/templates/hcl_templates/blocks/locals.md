---
description: >
  The `locals` and `local-variable` blocks declare local variables in
  your Packer configuration. Learn how to use these blocks to declare local variables in your template.
title: locals block reference
---

# `locals` block

This topic provides reference information about the `locals` block.

## Description

The `locals` and `local-variable` blocks declare local variables in
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

Refer to the following topics for additional information about using the `locals` and `local-variable` blocks:

- [Local Variables](/docs/templates/hcl_templates/locals)
- [Input Variables and local variables](/guides/hcl/variables)
