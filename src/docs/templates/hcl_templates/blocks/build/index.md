---
description: |
  The source block defines what builders are started.
title: build - Blocks
---

# The `build` block

::: info
**Note:** This page is about HCL2 Packer templates. HCL2 templates
were first introduced as a beta feature into Packer version 1.5. As of v1.7,
HCL2 support is no longer in beta, and is the preferred way to write Packer
configuration. For the old-style stable configuration language see
[template docs](/docs/templates/legacy_json_templates/). As of v1.6.2, you can
convert your legacy JSON template into an HCL2 config file using the
[hcl2_upgrade command](/docs/commands/hcl2_upgrade).
:::

The `build` block defines what builders are started, how to `provision` them
and if necessary what to do with their artifacts using `post-process`.

To use builders in a `build` block you can either:

- Set the `sources` array of string with references to pre-defined sources.

- Define [build-level `source` blocks](/docs/templates/hcl_templates/blocks/build/source).
  This also allows you to set specific fields.

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

Define [top-level `source` blocks](/docs/templates/hcl_templates/blocks/source) to configure
your builders. The list of available builders can be found in the
[builders](/docs/builders/) section.

## Naming your builds

The optional `name` field of the `build` block can be used to set the name of a
build. Named builds will prefix the log lines in a `packer build` with the name
of the build block. For example:

```hcl
source "null" "first-example" {
    communicator = "none"
}

source "null" "second-example" {
    communicator = "none"
}

build {
    name = "a"

    sources = [
        "sources.null.first-example",
        "sources.null.second-example",
    ]
}


build {
    sources = ["sources.null.second-example"]
}
```

Will output:

```shellsession
> packer build ./folder
Build 'a.null.first-example' finished.
Build 'a.null.second-example' finished.
Build 'null.second-example' finished.

==> Builds finished. The artifacts of successful builds are:
--> a.null.first-example: Did not export anything. This is the null builder
--> a.null.second-example: Did not export anything. This is the null builder
--> null.second-example: Did not export anything. This is the null builder
```

### Running only specific builds

The `-only`/`-except` flags will match a source's `type.name` and run 'only'
matching **builders** (source) or all referenced builders 'except' the matching
ones, for example with the same config file:

```shellsession
> packer build -only "*.second" ./folder
Build 'null.second-example' finished.
Build 'a.null.second-example' finished.

==> Builds finished. The artifacts of successful builds are:
--> a.null.second-example: Did not export anything. This is the null builder
--> null.second-example: Did not export anything. This is the null builder
```

Here `'a.null.first-example'` was skipped.

::: info
Note: It is not yet possible to match a named `build` block to do this, but
this is soon going to be possible. So here "a.\*" will match nothing.
:::

## Related

- A list of [community
  builders](/community-tools#community-builders) is available.

- Create your own [custom builder](/docs/plugins/creation/custom-builders) !
