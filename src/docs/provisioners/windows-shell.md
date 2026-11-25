---
description: |
  The `windows-shell` provisioner runs commands on Windows using the `cmd`
  shell. Learn how to use the `windows-shell` provisioner.
title: windows-shell provisioner reference
---

<Badge type="tip" text="Official" />

# `windows-shell` provisioner

The `windows-shell` Packer provisioner runs commands on a Windows machine using
`cmd`. The provisioner is designed to communicate with machines running WinRM.

## Basic Example

The example below is fully functional.

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "windows-shell" {
  inline = ["dir c:\\"]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "windows-shell",
  "inline": ["dir c:\\"]
}
```

</TabItem>

</Tabs>

## Configuration Reference

The reference of available configuration options is listed below. The only
required element is either "inline" or "script". Every other option is
optional.

Exactly _one_ of the following is required:

- `inline` (array of strings) - This is an array of commands to execute. The
  commands are concatenated by newlines and turned into a single file, so
  they are all executed within the same context. This allows you to change
  directories in one command and use something in the directory in the next
  and so on. Inline scripts are the easiest way to pull off simple tasks
  within the machine.

- `script` (string) - The path to a script to upload and execute in the
  machine. This path can be absolute or relative. If it is relative, it is
  relative to the working directory when Packer is executed.

- `scripts` (array of strings) - An array of scripts to execute. The scripts
  will be uploaded and executed in the order specified. Each script is
  executed in isolation, so state such as variables from one script won't
  carry on to the next.

Optional parameters:

- `binary` (boolean) - If true, specifies that the script(s) are binary
  files, and Packer should therefore not convert Windows line endings to Unix
  line endings (if there are any). By default this is false.

- `valid_exit_codes` (list of ints) - Valid exit codes for the script. By
  default this is just 0.

- `env` (map of strings) - A map of key/value pairs to inject prior to the
  execute_command. Packer injects some environmental variables by default into
  the environment, as well, which are covered in the section below. Duplicate
  `env` settings override `environment_vars` settings.

- `environment_vars` (array of strings) - An array of key/value pairs to
  inject prior to the execute_command. The format should be `key=value`.
  Packer injects some environmental variables by default into the
  environment, as well, which are covered in the section below.

- `execute_command` (string) - The command to use to execute the script. By
  default this is `{{ .Vars }}"{{ .Path }}"`. The value of this is treated as
  [template engine](/docs/templates/legacy_json_templates/engine). This is a
  [template engine](/docs/templates/legacy_json_templates/engine). Therefore, you may
  use user variables and template functions in this field. In addition, there
  are two available extra variables:

  - `Path` is the path to the script to run
  - `Vars` is the list of `environment_vars`, if configured.

- `remote_path` (string) - The path where the script will be uploaded to in
  the machine. This defaults to "c:/Windows/Temp/script.bat". This value must
  be a writable location and any parent directories must already exist.

- `start_retry_timeout` (string) - The amount of time to attempt to _start_
  the remote process. By default this is "5m" or 5 minutes. This setting
  exists in order to deal with times when SSH may restart, such as a system
  reboot. Set this to a higher value if reboots take a longer amount of time.

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

## Default Environmental Variables

In addition to being able to specify custom environmental variables using the
`environment_vars` configuration, the provisioner automatically defines certain
commonly useful environmental variables:

- `PACKER_BUILD_NAME` is set to the [name of the
  build](/docs/templates/legacy_json_templates/builders#named-builds) that Packer is running.
  This is most useful when Packer is making multiple builds and you want to
  distinguish them slightly from a common provisioning script.

- `PACKER_BUILDER_TYPE` is the type of the builder that was used to create
  the machine that the script is running on. This is useful if you want to
  run only certain parts of the script on systems built with certain
  builders.

- `PACKER_HTTP_ADDR` If using a builder that provides an HTTP server for file
  transfer (such as `hyperv`, `parallels`, `qemu`, `virtualbox`, and `vmware`), this
  will be set to the address. You can use this address in your provisioner to
  download large files over HTTP. This may be useful if you're experiencing
  slower speeds using the default file provisioner. A file provisioner using
  the `winrm` communicator may experience these types of difficulties.
