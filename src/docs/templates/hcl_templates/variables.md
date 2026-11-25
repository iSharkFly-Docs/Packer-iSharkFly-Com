---
title: Input variables reference
description: |-
  Input variables are parameters for Packer modules.
  Learn how to use the input variable syntax for Packer templates written in HCL.
---

# Input Variables

This topic provides reference information about input variables in Packer templates. Refer to [Local Variables](/docs/templates/hcl_templates/locals) for information about using local variables in Packer. 

## Introduction

Input variables, sometimes referred to as variables or Packer variables, are the parameters for a Packer build. Input variables let you customize aspects of a build without altering the build's own source code. Some input variables have default values that you can override using command line options, environment variables, or variable definitions files. You cannot change the value of an input variable after the initial override.

Refer to [Input Variables and local variables](/guides/hcl/variables) for additional information.

## Declaring an Input Variable

Each input variable accepted by a build must be declared using a `variable`
block :

```hcl
variable "image_id" {
  type = string
}

variable "availability_zone_names" {
  type    = list(string)
  default = ["us-west-1a"]
}

variable "docker_ports" {
  type = list(object({
    internal = number
    external = number
    protocol = string
  }))
  default = [
    {
      internal = 8300
      external = 8300
      protocol = "tcp"
    }
  ]
}
```

Or a less precise variables block:

```hcl
variables {
   foo = "value"
   my_secret = "foo"
}
```

The label after the `variable` keyword or a label of a `variables` block is a
name for the variable, which must be unique among all variables in the same
build. This name is used to assign a value to the variable from outside and to
reference the variable's value from within the build.


## Arguments

Packer defines the following arguments for variable declarations:

* [`default`][inpage-default] - A default value which then makes the variable optional.
* [`type`][inpage-type] - This argument specifies what value types are accepted for the variable.
* [`description`][inpage-description] - This specifies the input variable's documentation.
* [`validation`][inpage-validation] - A block to define validation rules, usually in addition to type constraints.
* [`sensitive`][inpage-sensitive] -  This causes string-values from that variable to be obfuscated from Packer's output.



### Default values

[inpage-default]: #default-values

The variable declaration can also include a `default` argument. If present,
the variable is considered to be _optional_ and the default value will be used
if no value is set when running Packer. The `default`
argument requires a literal value and cannot reference other objects in the
configuration.


### Type Constraints
[inpage-type]: #type-constraints

The `type` argument in a `variable` block allows you to restrict the [type of
value](/docs/templates/hcl_templates/expressions#types-and-values) that will be accepted as the value
for a variable. If no type constraint is set then a value of any type is
accepted.

While type constraints are optional, we recommend specifying them; they serve
as easy reminders for users of the build, and allow Packer to return a helpful
error message if the wrong type is used.

Type constraints are created from a mixture of type keywords and type
constructors. The supported type keywords are:

- `string`
- `number`
- `bool`

The type constructors allow you to specify complex types such as collections:

- `list(<TYPE>)`
- `set(<TYPE>)`
- `map(<TYPE>)`
- `object({<ATTR NAME> = <TYPE>, ... })`
- `tuple([<TYPE>, ...])`

The keyword `any` may be used to indicate that any type is acceptable. For more
information on the meaning and behavior of these different types, as well as
detailed information about automatic conversion of complex types, see [Type
Constraints](https://developer.hashicorp.com/terraform/docs/configuration/types).

If both the `type` and `default` arguments are specified, the given default
value must be convertible to the specified type.

If only `default` is specified, the type of the default value will be used.

When the `type` and `default` are both _not_ specified and you try to set a
variable [from env vars](#environment-variables) or [from the command
line](#variables-on-the-command-line), the variable will always be interpreted
as a string.

### Input Variable Documentation

[inpage-description]: #input-variable-documentation

Because the input variables of a build are part of its user interface, you can
briefly describe the purpose of each variable using the optional `description`
argument:

```hcl
variable "image_id" {
  type        = string
  description = "The ID of the machine image (AMI) to use for the server."
}
```

The description should concisely explain the purpose of the variable and what
kind of value is expected. This description string might be included in
documentation about the build, and so it should be written from the perspective
of the user of the build rather than its maintainer. For commentary for build
maintainers, use comments.

### Custom Validation Rules

[inpage-validation]: #custom-validation-rules

In addition to Type Constraints, you can specify arbitrary custom validation
rules for a particular variable using one or more `validation` block nested
within the corresponding `variable` block:

```hcl
variable "image_id" {
  type        = string
  description = "The ID of the machine image (AMI) to use for the server."

  validation {
    condition     = length(var.image_id) > 4 && substr(var.image_id, 0, 4) == "ami-"
    error_message = "The image_id value must be a valid AMI ID, starting with \"ami-\"."
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
  description = "The ID of the machine image (AMI) to use for the server."

  validation {
    # regex(...) fails if it cannot find a match
    condition     = can(regex("^ami-", var.image_id))
    error_message = "The image_id value must be a valid AMI ID, starting with \"ami-\"."
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

### Suppressing Sensitive Variables

[inpage-sensitive]: #suppressing-sensitive-variables


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


## Using Input Variable Values

Within the build that declared a variable, its value can be accessed from
within [expressions](/docs/templates/hcl_templates/expressions) as `var.<NAME>`, where `<NAME>`
matches the label given in the declaration block:

```hcl
source "googlecompute" "debian"  {
    zone = var.gcp_zone
    tags = var.gcp_debian_tags
}
```

The value assigned to a variable can be accessed only from expressions within
the folder where it was declared.


## Assigning Values to input Variables

Once a variable is declared in your configuration, you can set it:

- Individually, with the `-var foo=bar` command line option.
- In variable definitions files, either specified on the command line with the `-var-files values.pkrvars.hcl` or automatically loaded (`*.auto.pkrvars.hcl`).
- As environment variables, for example: `PKR_VAR_foo=bar`

The following sections describe these options in more detail.

### Variables on the Command Line

To specify individual variables on the command line, use the `-var` option when
running the `packer build` command:

```shellsession
$ packer build -var="image_id=ami-abc123"
$ packer build -var='image_id_list=["ami-abc123","ami-def456"]'
$ packer build -var='image_id_map={"us-east-1":"ami-abc123","us-east-2":"ami-def456"}'
```

The `-var` option can be used any number of times in a single command.

If you plan to assign variables via the command line, we strongly recommend that
you at least set a default type instead of using empty blocks; this helps the
HCL parser understand what is being set. Otherwise, the interpreter will assume
that any variable set on the command line is a string.

### Standard Variable Definitions Files

To set lots of variables, it is more convenient to specify their values in a
_variable definitions file_ with a filename ending in either `.pkrvars.hcl` or
`.pkrvars.json` and then specify that file on the command line with
`-var-file`:

```shellsession
$ packer build -var-file="testing.pkrvars.hcl"
```

A variable definitions file uses the same basic syntax as Packer language
files, but consists only of variable name and its assigned values:

```hcl
image_id = "ami-abc123"
availability_zone_names = [
  "us-east-1a",
  "us-west-1c",
]
```

::: warning
**Important**: Unlike legacy JSON templates the input variables within a variable definitions file must be declared 
via a variables block within a standard HCL2 template file `*.pkr.hcl` before it can be assigned a value. 
Failure to do so will result in an unknown variable error during Packer's runtime.
:::

### Auto-loaded Variable Definitions Files

Packer also has the ability automatically load one or more variable definitions files if they
are present:

- Any files with names ending in `.auto.pkrvars.hcl` or `.auto.pkrvars.json`.

Files whose names end with `.json` are parsed as JSON objects instead of HCL,
with the root object properties corresponding to variable names:

```json
{
  "image_id": "ami-abc123",
  "availability_zone_names": ["us-west-1a", "us-west-1c"]
}
```

::: warning
**Important**: Unlike legacy JSON templates the input variables within a variable definitions file must be declared 
via a variables block within a standard HCL2 template file `*.pkr.hcl` before it can be assigned a value. 
Failure to do so will result in an unknown variable error during Packer's runtime.
:::


### Environment Variables

As a fallback for the other ways of defining variables, Packer searches the
environment of its own process for environment variables named `PKR_VAR_`
followed by the name of a declared variable.

This can be useful when running Packer in automation, or when running a
sequence of Packer commands in succession with the same variables. For example,
at a `bash` prompt on a Unix system:

```shellsession
$ export PKR_VAR_image_id=ami-abc123
$ packer build gcp/debian/
...
```

On operating systems where environment variable names are case-sensitive,
Packer matches the variable name exactly as given in configuration, and so the
required environment variable name will usually have a mix of upper and lower
case letters as in the above example.

### Complex-typed Values

When variable values are provided in a variable definitions file, Packer's
[usual syntax](/docs/templates/hcl_templates/expressions) can be used to assign
complex-typed values, like lists and maps.

Some special rules apply to the `-var` command line option and to environment
variables. For convenience, Packer defaults to interpreting `-var` and
environment variable values as literal strings, which do not need to be quoted:

```shellsession
$ export PKR_VAR_image_id=ami-abc123
```

However, if a build variable uses a [type constraint](#type-constraints) to
require a complex value (list, set, map, object, or tuple), Packer will instead
attempt to parse its value using the same syntax used within variable
definitions files, which requires careful attention to the string escaping
rules in your shell:

```shellsession
$ export PKR_VAR_availability_zone_names='["us-west-1b","us-west-1d"]'
```

For readability, and to avoid the need to worry about shell escaping, we
recommend always setting complex variable values via variable definitions
files.

### Variable Definition Precedence

The above mechanisms for setting variables can be used together in any
combination.

Packer loads variables in the following order, with later sources taking
precedence over earlier ones:

- Environment variables (lowest priority)
- Any `*.auto.pkrvars.hcl` or `*.auto.pkrvars.json` files, processed in lexical
  order of their filenames.
- Any `-var` and `-var-file` options on the command line, in the order they are
  provided. (highest priority)

If the same variable is assigned multiple values using different mechanisms,
Packer uses the _last_ value it finds, overriding any previous values. Note
that the same variable cannot be assigned multiple values within a single source.

::: warning
**Important:** Variables with map and object values behave the same way as
other variables: the last value found overrides the previous values.
:::

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

### Setting an unknown variable will not always fail:

|             Usage              |     packer validate     | any other packer command  |
| :----------------------------: | :---------------------: | :-----------------------: |
| `bar=yz` in .pkrvars.hcl file. | error, "bar undeclared" | warning, "bar undeclared" |
|   `var.bar` in .pkr.hcl file   | error, "bar undeclared" |  error, "bar undeclared"  |
|     `-var bar=yz` argument     | error, "bar undeclared" |  error, "bar undeclared"  |
|    `export PKR_VAR_bar=yz`     |            -            |             -             |

