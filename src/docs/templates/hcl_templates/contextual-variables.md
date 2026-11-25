---
title: Contextual Variables - HCL Configuration Language
description: >-
  Special variables provide connection information and basic instance state
  information.

  This page covers all existing special variables.
---

::: info
**Note:** This page is about HCL2 Packer templates. HCL2 templates
were first introduced as a beta feature into Packer version 1.5. As of v1.7,
HCL2 support is no longer in beta, and is the preferred way to write Packer
configuration. For the old-style stable configuration language see
[template docs](/docs/templates/legacy_json_templates/). As of v1.6.2, you can
convert your legacy JSON template into an HCL2 config file using the
[hcl2_upgrade command](/docs/commands/hcl2_upgrade).
:::

# Source Variables

It is possible to access the `name` and `type` of your `source` from
provisioners and post-processors:

```hcl
source "null" "first-example" {
  communicator = "none"
}

build {
  name = "roles"

  source "null.first-example" {
    name = "consul"
  }
  source "null.first-example" {
    name = "nomad"
  }
  source "null.first-example" {
    name = "vault"
  }
  sources = ["null.first-example"]

  provisioner "shell-local" {
    inline = ["echo ${source.name} and ${source.type}"]
  }
}

# This will echo something like:
#
# roles.null.consul: consul and null
# roles.null.nomad: nomad and null
# roles.null.vault: vault and null
# roles.null.first-example: first-example and null
```

# Build Variables

Build variables will allow you to access connection information and basic instance state information for a builder.
All special build variables are stored in the `build` variable:

```hcl
source "null" "first-example" {
  communicator = "none"
}

build {
  name = "my-build-name"
  sources = ["null.first-example"]

  provisioner "shell-local" {
    environment_vars = ["TESTVAR=${build.PackerRunUUID}"]
    inline = ["echo source.name is ${source.name}.",
              "echo build.name is ${build.name}.",
              "echo build.PackerRunUUID is $TESTVAR"]
  }
}
```

Here is the list of available build variables:

- **name** Represents the name of the build block being run. This is different
  than the name of the source block being run.

- **ID**: Represents the vm being provisioned. For example, in Amazon it is the instance id; in digitalocean,
  it is the droplet id; in Vmware, it is the vm name.

- **Host**, **Port**, **User** and **Password**: The host, port, user, and password that Packer uses to access the machine.
  Useful for using the shell local provisioner to run Ansible or Inspec against the provisioned instance.

- **ConnType**: Type of communicator being used. For example, for SSH communicator this will be "ssh".

- **PackerRunUUID**: Current build's unique id. Can be used to specify build artifacts.
  An example of that, is when multiple builds runs at the same time producing the same artifact.
  It's possible to differentiate these artifacts by naming them with the builds' unique ids.

- **PackerHTTPIP**, **PackerHTTPPort**, and **PackerHTTPAddr**: HTTP IP, port, and address of the file server Packer creates to serve items in the "http" dir to the vm. The HTTP address is displayed in the format `IP:PORT`.

- **SSHPublicKey** and **SSHPrivateKey**: The public and private key that Packer uses to connect to the instance.
  These are unique to the SSH communicator and are unset when using other communicators.
  **SSHPublicKey** and **SSHPrivateKey** can have escape sequences and special characters so their output should be single quoted to avoid surprises. For example:

  ```hcl
    provisioner "shell" {
        inline = ["echo '${build.SSHPrivateKey}' > /tmp/packer-session.pem"]
    }
  ```

For backwards compatibility, `WinRMPassword` is also available through this
engine, though it is no different than using the more general `Password`.

All build variables are valid to use with any of the [HCL2 functions](/docs/templates/hcl_templates/functions/).
Example of using [upper](/docs/templates/hcl_templates/functions/string/upper) to upper case the build ID:

```hcl
  post-processor "shell-local" {
      inline = ["echo ${upper(build.ID)}"]
  }
```

For builder-specific builder variables, please also refer to the builder docs:

- Amazon EC2: [chroot](https://www.packer.io/docs/builders/amazon/chroot#build-shared-information-variables),
  [EBS Volume](https://www.packer.io/docs/builders/amazon/ebsvolume#build-shared-information-variables),
  [EBS](https://www.packer.io/docs/builders/amazon/ebs#build-shared-information-variables),
  [EBS Surrogate](https://www.packer.io/docs/builders/amazon/ebssurrogate#build-shared-information-variables),
  [Instance](https://www.packer.io/docs/builders/amazon/instance#build-shared-information-variables).

The HCL2 Special Build Variables is in beta; please report any issues or requests on the Packer
issue tracker on GitHub.

# Packer Version

This variable is set to the Packer version currently running.

```hcl
source "null" "first-example" {
  communicator = "none"
}

build {
  sources = ["null.first-example"]

  provisioner "shell-local" {
    inline = ["echo packer_version is '${packer.version}'"]
  }
}
```

If you are running a development version of Packer, the version variable will
contain the released version number, dev flag, and current commit.

```shellsession
PACKER_LOG=0 packer build packer_version_demo.pkr.hcl
null.first-example: output will be in this color.

==> null.first-example: Running local shell script: /var/folders/8t/0yb5q0_x6mb2jldqq_vjn3lr0000gn/T/packer-shell083160352
    null.first-example: packer_version is 1.6.5-dev (a69392129+CHANGES)
```

If you are running a released version of Packer, the version variable will
contain the released version number only:

```shellsession
PACKER_LOG=0 packer build packer_version_demo.pkr.hcl
null.first-example: output will be in this color.

==> null.first-example: Running local shell script: /var/folders/8t/0yb5q0_x6mb2jldqq_vjn3lr0000gn/T/packer-shell718995312
    null.first-example: packer_version is 1.6.5
```

Make sure to wrap your variable in single quotes in order to escape the
string that is returned; if you are running a dev version of packer the
parenthesis may through off your shell escaping otherwise.
