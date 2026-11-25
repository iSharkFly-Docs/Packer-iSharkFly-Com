---
description: >
  The variable block, also called the input-variable block, defines variables
  within your Packer configuration.
title: variable - Blocks
---

# The `variable` block

::: info
**Note:** This page is about HCL2 Packer templates. HCL2 templates
were first introduced as a beta feature into Packer version 1.5. As of v1.7,
HCL2 support is no longer in beta, and is the preferred way to write Packer
configuration. For the old-style stable configuration language see
[template docs](/docs/templates/legacy_json_templates/). As of v1.6.2, you can
convert your legacy JSON template into an HCL2 config file using the
[hcl2_upgrade command](/docs/commands/hcl2_upgrade).
:::

The `variable` block, also called the `input-variable` block, defines variables
within your Packer configuration. An input-variable cannot be used in another
input variable: we recommend using [locals](/docs/templates/hcl_templates/blocks/locals) for that instead.

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

## Default value

If a default value is set, the variable is optional. Otherwise, the variable
**must** be set.

## Assigning Values to build Variables

Once a variable is declared in your configuration, you can set it:

- Individually, with the `-var foo=bar` command line option.
- In variable definitions (`.pkrvars.hcl` and `.auto.pkrvars.hcl`) files,
  either specified on the command line or automatically loaded.
- As environment variables, for example: `PKR_VAR_foo=bar`

## Custom Validation Rules

In addition to Type Constraints, you can specify arbitrary custom validation
rules for a particular variable using one or more `validation` block nested
within the corresponding `variable` block:

```hcl
variable "image_id" {
  type        = string
  description = "The id of the machine image (AMI) to use for the server."

  validation {
    condition     = length(var.image_id) > 4 && substr(var.image_id, 0, 4) == "ami-"
    error_message = "The image_id value must be a valid AMI id, starting with \"ami-\"."
  }
}
```

The `condition` argument is an expression that must use the value of the
variable to return `true` if the value is valid or `false` if it is invalid.
The expression can refer only to the variable that the condition applies to,
and _must not_ produce errors.

If the failure of an expression is the basis of the validation decision, use
[the `can` function](/docs/templates/hcl_templates/functions/conversion/can) to detect such errors. For example:

```hcl
variable "image_id" {
  type        = string
  description = "The id of the machine image (AMI) to use for the server."

  validation {
    # regex(...) fails if it cannot find a match
    condition     = can(regex("^ami-", var.image_id))
    error_message = "The image_id value must be a valid AMI id, starting with \"ami-\"."
  }
}
```

If `condition` evaluates to `false`, an error message including the sentences
given in `error_message` will be produced. The error message string should be
at least one full sentence explaining the constraint that failed, using a
sentence structure similar to the above examples.

Validation also works with more complex cases:

```hcl
variable "image_metadata" {

  default = {
    key: "value",
    something: {
      foo: "bar",
    }
  }

  validation {
    condition     = length(var.image_metadata.key) > 4
    error_message = "The image_metadata.key field must be more than 4 runes."
  }

  validation {
    condition     = can(var.image_metadata.something.foo)
    error_message = "The image_metadata.something.foo field must exist."
  }

  validation {
    condition     = substr(var.image_metadata.something.foo, 0, 3) == "bar"
    error_message = "The image_metadata.something.foo field must start with \"bar\"."
  }

}
```

Example of a variable assignment from a file:

```hcl
# foo.pkrvars.hcl
foo = "value"
```

## A variable value must be known:

Take the following variable for example:

```hcl
variable "foo" {
  type = string
}
```

Here `foo` must have a known value but you can default it to `null` to make
this behavior optional :

|                               |          no default          | `default = null` | `default = "xy"` |
| :---------------------------: | :--------------------------: | :--------------: | :--------------: |
|          foo unused           | error, "foo needs to be set" |        -         |        -         |
|            var.foo            | error, "foo needs to be set" |      null¹       |        xy        |
| `PKR_VAR_foo=yz`<br />var.foo |              yz              |        yz        |        yz        |
|  `-var foo=yz`<br />var.foo   |              yz              |        yz        |        yz        |

1: Null is a valid value. Packer will only error when the receiving field needs
a value, example:

```hcl
variable "example" {
  type = string
  default = null
}

source "example" "foo" {
  arg = var.example
}
```

In the above case, as long as "arg" is optional for an "example" source, there is no error and arg won’t be set.

## A variable can be sensitive

When a variable is sensitive all string-values from that variable will be
obfuscated from Packer's output :

```hcl
# var-foo.pkr.hcl
variable "foo" {
    sensitive = true
    default   = {
        key = "SECR3TP4SSW0RD"
    }
}
```

```shellsession
$ packer inspect var-foo.pkr.hcl
Packer Inspect: HCL2 mode

> input-variables:
var.foo: "{\n  \"key\" = \"<sensitive>\"\n }"
...
```

# More on variables

- Read the [full variables](/docs/templates/hcl_templates/variables) description for a more
  thorough read.
- Read the [variables guide](/guides/hcl/variables) for more examples.
