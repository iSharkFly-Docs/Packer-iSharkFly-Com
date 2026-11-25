---
description: >
  The breakpoint provisioner will pause until the user presses "enter" to resume

  the build. This is intended for debugging purposes, and allows you to halt at
  a

  particular part of the provisioning process.
title: breakpoint - Provisioners
---

# Breakpoint Provisioner

Type: `breakpoint`

The breakpoint provisioner will pause until the user presses "enter" to resume
the build. This is intended for debugging purposes, and allows you to halt at a
particular part of the provisioning process.

This is independent of the `-debug` flag, which will instead halt at every step
and between every provisioner.

## Basic Example

<Tabs groupId="template-format" :tabs="[{label:'JSON',value:'t0'},{label:'HCL2',value:'t1'}]">

<TabItem value="t0">

```json
{
  "builders": [
    {
      "type": "null",
      "communicator": "none"
    }
  ],
  "provisioners": [
    {
      "type": "shell-local",
      "inline": "echo hi"
    },
    {
      "type": "breakpoint",
      "disable": false,
      "note": "this is a breakpoint"
    },
    {
      "type": "shell-local",
      "inline": "echo hi 2"
    }
  ]
}
```

</TabItem>

<TabItem value="t1">

```hcl
source "null" "example" {
  communicator = "none"
}

build {
  sources = ["source.null.example"]

  provisioner "shell-local" {
    inline = ["echo hi"]
  }
  provisioner "breakpoint" {
    disable = false
    note    = "this is a breakpoint"
  }
  provisioner "shell-local" {
    inline = ["echo hi 2"]
  }
}
```

</TabItem>

</Tabs>

## Configuration Reference

### Optional

- `disable` (boolean) - If `true`, skip the breakpoint. Useful for when you
  have set multiple breakpoints and want to toggle them off or on. Default:
  `false`

- `note` (string) - a string to include explaining the purpose or location of
  the breakpoint. For example, you may find it useful to number your
  breakpoints or label them with information about where in the build they
  occur

Parameters common to all provisioners:

- `pause_before` (duration) - Sleep for duration before execution.

- `max_retries` (int) - Max times the provisioner will retry in case of failure. Defaults to zero (0). Zero means an error will not be retried.

- `only` (array of string) - Only run the provisioner for listed builder(s)
  by name.

- `override` (object) - Override the builder with different settings for a
  specific builder, eg :

  In HCL2:

  ```hcl
  source "null" "example1" {
    communicator = "none"
  }

  source "null" "example2" {
    communicator = "none"
  }

  build {
    sources = ["source.null.example1", "source.null.example2"]
    provisioner "shell-local" {
      inline = ["echo not overridden"]
      override = {
        example1 = {
          inline = ["echo yes overridden"]
        }
      }
    }
  }
  ```

  In JSON:

  ```json
  {
    "builders": [
      {
        "type": "null",
        "name": "example1",
        "communicator": "none"
      },
      {
        "type": "null",
        "name": "example2",
        "communicator": "none"
      }
    ],
    "provisioners": [
      {
        "type": "shell-local",
        "inline": ["echo not overridden"],
        "override": {
          "example1": {
            "inline": ["echo yes overridden"]
          }
        }
      }
    ]
  }
  ```

- `timeout` (duration) - If the provisioner takes more than for example
  `1h10m1s` or `10m` to finish, the provisioner will timeout and fail.

## Usage

Insert this provisioner wherever you want the build to pause. You'll see ui
output prompting you to press "enter" to continue the build when you are ready.

For example:

```shellsession
==> docker: Pausing at breakpoint provisioner with note "foo bar baz".
==> docker: Press enter to continue.
```

Once you press enter, the build will resume and run normally until it either
completes or errors.
