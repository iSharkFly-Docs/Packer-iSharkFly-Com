---
description: |
  The Windows restart provisioner restarts a Windows machine and waits for it to
  come back up.
title: Windows Restart - Provisioners
---

# Windows Restart Provisioner

Type: `windows-restart`

The Windows restart provisioner initiates a reboot on a Windows machine and
waits for the machine to come back online.

The Windows provisioning process often requires multiple reboots, and this
provisioner helps to ease that process.

Packer expects the machine to be ready to continue provisioning after it
reboots. Packer detects that the reboot has completed by making an RPC call
through the Windows Remote Management (WinRM) service, not by ACPI functions,
so Windows must be completely booted in order to continue.

## Basic Example

The example below is fully functional.

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "windows-restart" {}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "windows-restart"
}
```

</TabItem>

</Tabs>

## Configuration Reference

The reference of available configuration options is listed below.

Optional parameters:

- `check_registry` (bool) - if `true`, checks for several registry keys that
  indicate that the system is going to reboot. This is useful if an
  installation kicks off a reboot and you want the provisioner to wait for
  that reboot to complete before reconnecting. Please note that this option
  is a beta feature, and we generally recommend that you finish installs that
  auto-reboot (like Windows Updates) during your _autounattend_ phase before
  the `winrm` provisioner connects.

- `registry_keys` (array of strings) - if `check-registry` is `true`,
  `windows-restart` will not reconnect until after all of the listed keys are
  no longer present in the registry.

```
  default:

      var DefaultRegistryKeys = []string{
        "HKLM:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Component Based Servicing\\RebootPending",
        "HKLM:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Component Based Servicing\\PackagesPending",
        "HKLM:Software\\Microsoft\\Windows\\CurrentVersion\\Component Based Servicing\\RebootInProgress",
      }
```

- `restart_command` (string) - The command to execute to initiate the
  restart. By default this is `shutdown /r /f /t 0 /c "packer restart"`.

- `restart_check_command` (string) - A command to execute to check if the
  restart succeeded. This will be done in a loop. Example usage:

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "windows-restart" {
  restart_check_command = "powershell -command \"& {Write-Output 'restarted.'}\""
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "windows-restart",
  "restart_check_command": "powershell -command \"& {Write-Output 'restarted.'}\""
}
```

</TabItem>

</Tabs>

- `restart_timeout` (string) - The timeout to wait for the restart. By
  default this is 5 minutes. Example value: `5m`. If you are installing
  updates or have a lot of startup services, you will probably need to
  increase this duration.

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
