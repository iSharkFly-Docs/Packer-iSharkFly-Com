---
title: only and except keywords reference
description: >-
  The `only` and `except` keywords are filters for Packer builds. Learn how to use `only` and `except` to selectively run provisioners and post-processors.  
---

# `only` and `except` keywords

The `only` and `except` keywords are filters that let you selectively run provisioners and post-processors in your Packer build. You can use the keywords in your Packer templates and as flags on the Packer CLI.

## Command line flags

- `-except=foo,bar,baz` - Run all the builds and post-processors except those
  with the given comma-separated names. In legacy JSON templates, build names default to the
  types of their builders (e.g. `docker` or
  `amazon-ebs` or `virtualbox-iso`), unless a specific `name` attribute is
  specified within the configuration. In HCL2 templates, the "name" is the
  source block's "name" label, unless an in-build source definition adds the
  "name" configuration option. Any post-processor following
  a skipped post-processor will not run. Because post-processors can be nested
  in arrays a different post-processor chain can still run. A post-processor
  with an empty name will be ignored.

- `-only=foo,bar,baz` - Only run the builds with the given comma-separated
  names. In legacy JSON templates, build names default to the
  types of their builders (e.g. `docker` or
  `amazon-ebs` or `virtualbox-iso`), unless a specific `name` attribute is
  specified within the configuration. In HCL2 templates, the "name" is the
  source block's "name" label, unless an in-build source definition adds the
  "name" configuration option.

## Templates 

You can add the `only` and `except` keywords to run or skip provisioners and
post-processors for a specific source:

```hcl
source "amazon-ebs" "first-example" {
}

source "amazon-ebs" "second-example" {
}

source "amazon-ebs" "third-example" {
}

build {
  name = "my_build"
  sources = [
    "source.amazon-ebs.first-example",
  ]
  source "source.amazon-ebs.second-example" {
    // setting the name field allows you to rename the source only for this
    // build section. To match this builder, you need to use
    // second-example-local-name, not second-example
    name = "second-example-local-name"
  }

  provisioner "shell-local" {
    only   = ["amazon-ebs.first-example"]
    inline = ["echo I will only run for the first example source"]
  }

  provisioner "shell-local" {
    except = ["amazon-ebs.second-example-local-name"]
    inline = ["echo I will never run for the second example source"]
  }
}

build {
  sources = [
    "source.amazon-ebs.third-example",
  ]
}

# this file will result in Packer creating three builds named:
#  my_build.amazon-ebs.first-example
#  my_build.amazon-ebs.second-example
#  amazon-ebs.third-example
```

Note that CLI arguments can be used with a glob operator, using the previous
configuration:

- `packer build -only 'my_build.*' dir`: will only run the builds in blocks
  named `my_build`.

- `packer build -only '*.amazon-ebs.*' dir`: will only run the builds with a
  source of type `amazon-ebs`.

- `packer build -only '*.second-example-local-name' dir`: will only run that
  specifically named build.

::: info
Note: In the cli `only` and `except` will match against **build names** (for
example:`my_build.amazon-ebs.first-example`) but in a provisioner they will
match on the **source name** (for example:`amazon-ebs.third-example`).
:::
