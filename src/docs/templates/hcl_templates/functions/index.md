---
title: Functions - Configuration Language
description: |-
  The HCL language has a number of built-in functions that can be called
  from within expressions to transform and combine values.
---

# Built-in Functions

::: info
**Note:** This page is about HCL2 Packer templates. HCL2 templates
were first introduced as a beta feature into Packer version 1.5. As of v1.7,
HCL2 support is no longer in beta, and is the preferred way to write Packer
configuration. For the old-style stable configuration language see
[template docs](/docs/templates/legacy_json_templates/). As of v1.6.2, you can
convert your legacy JSON template into an HCL2 config file using the
[hcl2_upgrade command](/docs/commands/hcl2_upgrade).
:::

The HCL language includes a number of built-in functions that you can
call from within expressions to transform and combine values. The general
syntax for function calls is a function name followed by comma-separated
arguments in parentheses:

```hcl
max(5, 12, 9)
```

For more details on syntax, see
[_Function Calls_](/docs/templates/hcl_templates/expressions#function-calls)
on the Expressions page.

The HCL language does not support user-defined functions, and so only
the functions built in to the language are available for use. The navigation
for this section includes a list of all of the available built-in functions.
