---
description: |
  The `hcp-sbom` Packer provisioner uploads a CycloneDX- or SPDX JSON-formatted software bill of materials record to HCP Packer. Learn how to use the `hcp-sbom` provisioner.
title: hcp-sbom provisioner reference
---

<Badge type="tip" text="Official" />

# `hcp-sbom` provisioner

The `hcp-sbom` provisioner uploads software bill of materials (SBOM) files from artifacts built by Packer to HCP Packer and associates them with individual artifact versions. You must format SBOM files you want to upload as JSON and follow either the [SPDX](https://spdx.github.io/spdx-spec/latest) or [CycloneDX](https://cyclonedx.org/) specification.

The provisioner supports the following operation methods:

1. **Manual SBOM Upload** (`source`): Upload a self-generated SBOM file from the remote host.
2. **Automatic SBOM Generation** (`auto_generate`): Packer uses its built-in scanning tool to generate an SBOM. Refer to [Automatic SBOM generation](#automatic-sbom-generation) for more information.

## Examples

The following example uploads an SBOM from the local `/tmp` directory and stores a copy at `./sbom/sbom_cyclonedx.json` on the local machine.

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "hcp-sbom" {
  source      = "/tmp/sbom_cyclonedx.json"
  destination = "./sbom/sbom_cyclonedx.json"
  sbom_name   = "sbom-cyclonedx"
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "hcp-sbom",
  "source": "/tmp/sbom_cyclonedx.json",
  "destination": "./sbom/sbom_cyclonedx.json",
  "sbom_name": "sbom-cyclonedx"
}
```

</TabItem>

</Tabs>

## Automatic SBOM generation

You can configure the provisioner to automatically download and run Packer on the remote host to generate an SBOM.

The following example runs Packer on the remote host to generate an SBOM, associate it with the HCP Packer artifact version, and store a copy at `./sbom/sbom_cyclonedx.json` on the local machine.

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "hcp-sbom" {
  auto_generate = true
  destination = "./sbom/sbom_cyclonedx.json"
  sbom_name     = "auto-generated-sbom"
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "hcp-sbom",
  "auto_generate": true,
  "destination": "./sbom/sbom_cyclonedx.json",
  "sbom_name": "auto-generated-sbom"
}
```

</TabItem>

</Tabs>

When you set `auto_generate` to `true`, Packer automatically detects the remote host's OS and architecture and downloads the appropriate Packer binary. Packer then generates an SBOM, downloads the SBOM, and uploads it to HCP Packer.

After Packer completes your build, it cleans up all temporary files it created to download the SBOM generation tool.

::: info
**Note:** Packer validates the operating system and architecture at runtime when it connects to the remote host. If the detected platform is not supported, the provisioner fails with an error message indicating the unsupported platform.
:::

### Elevated execution

You can customize the provisioner if your remote system requires different permissions to perform a scan and generate an SBOM.

::: info
**Note:** Running the SBOM generation tool with elevated privileges such as sudo or administrator access provides more complete scan results. Without elevated permissions, the tool may not be able to access all files and directories on the system, which can result in an incomplete SBOM.
:::

By default, Packer runs the following command to run the SBOM generation tool:

<Tabs :tabs="[{label:'Linux/Unix',value:'t0'},{label:'Windows',value:'t1'}]">

<TabItem value="t0">

```bash
chmod +x {{.Path}} && sudo {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}
```

</TabItem>

<TabItem value="t1">

```shell
{{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}
```

</TabItem>

</Tabs>

You can set the `execute_command` argument to override this default behavior. Packer provides template variables to fill in information at run time such as the path to the SBOM generation tool, arguments for the tool, and the path to scan. Refer to [Template variables in execute_command](#template-variables-in-execute_command) for a complete list of supported variables.

The following example overrides the default `execute_command` value to provide a password for the `sudo` command:

```hcl
provisioner "hcp-sbom" {
  auto_generate   = true
  execute_command = "chmod +x {{.Path}} && echo 'mypassword' | sudo -S {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}"
  destination     = "./sbom"
  sbom_name       = "sbom-sudo-password"
}
```

The following example removes `sudo` from the command in cases where you do not require elevated permissions:

```hcl
provisioner "hcp-sbom" {
  auto_generate   = true
  execute_command = "chmod +x {{.Path}} && {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}"
  destination     = "./sbom"
  sbom_name       = "sbom-no-sudo"
}
```

#### Windows with a custom user

For Windows hosts that require administrator privileges, you can set the `elevated_user` and `elevated_password` parameters to tell Packer to execute the SBOM generation as a specific user.

```hcl
provisioner "hcp-sbom" {
  auto_generate      = true
  elevated_user      = "Administrator"
  elevated_password  = "MySecurePassword123!"
  destination        = "./sbom"
  sbom_name          = "windows-elevated-sbom"
}
```

## Configuration reference

You can specify the following configuration options.

Required parameters:

Exactly one of the following is required:

- `source` (string) - The file path or URL to the SBOM file in the Packer artifact.
  This file must either be in the SPDX or CycloneDX format.
  Mutually exclusive with `auto_generate`.

- `auto_generate` (bool) - Enable automatic SBOM generation by running `packer sbom-generate` on
  the remote host. When enabled, the provisioner uploads the running Packer
  binary (which embeds the Syft SDK) to the remote VM and executes it there
  to generate an SBOM. Mutually exclusive with `source`.

<!-- End of code generated from the comments of the Config struct in provisioner/hcp-sbom/provisioner.go; -->

Optional parameters:

- `destination` (string) - The path on the local machine to store a copy of the SBOM file.
  You can specify an absolute or a path relative to the working directory
  when you execute the Packer build. If the file already exists on the
  local machine, Packer overwrites the file. If the destination is a
  directory, the directory must already exist.

- `sbom_name` (string) - The name of the SBOM file stored in HCP Packer.
  If omitted, HCP Packer uses the build fingerprint as the file name.
  This value must be between three and 36 characters from the following
  set: `[A-Za-z0-9_-]`. You must specify a unique name for each build in
  an artifact version.

- `scanner_args` ([]string) - Arguments to pass to `packer sbom-generate`. Default:
  `["-o", "cyclonedx-json"]`.

- `scanner_url` (string) - DEPRECATED: Custom scanner URL is no longer supported. The hcp-sbom
  provisioner now uses the Packer binary with embedded Syft SDK for
  automatic SBOM generation. This field is ignored and will be removed
  in a future major version. For custom SBOM tools, use manual generation
  with the `source` field instead of `auto_generate`.

- `scanner_checksum` (string) - DEPRECATED: Scanner checksum verification is no longer supported.
  This field is ignored and will be removed in a future major version.

- `scan_path` (string) - Path to scan on remote host. Defaults to `/` (root directory).

- `execute_command` (string) - The command template used to execute the scanner on the remote host.
  Available template variables:
  
  - `{{.Path}}` - Path to the scanner binary on the remote host
  - `{{.Args}}` - Scanner arguments (from `scanner_args`)
  - `{{.ScanPath}}` - Path to scan (from `scan_path`)
  - `{{.Output}}` - Output file path for the SBOM
  
  Default for Unix: `chmod +x {{.Path}} && sudo {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}`
  
  Default for Windows: `{{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}`
  
  Examples:
  
  Without sudo:
  
  ```hcl
  execute_command = "chmod +x {{.Path}} && {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}"
  ```
  
  With sudo password:
  
  ```hcl
  execute_command = "chmod +x {{.Path}} && echo 'password' | sudo -S {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}"
  ```

- `elevated_user` (string) - A username to use for elevated permissions when running Packer on
  Windows. This is only used for Windows hosts when elevated privileges
  are required. For Unix-like systems, use `execute_command` with sudo instead.

- `elevated_password` (string) - The password for the `elevated_user`. Required if `elevated_user` is
  specified. Only applicable for Windows hosts.

<!-- End of code generated from the comments of the Config struct in provisioner/hcp-sbom/provisioner.go; -->

## Operating system and architecture detection

When you enable `auto_generate`, the provisioner runs the following commands to automatically detect the remote host's operating system and architecture:

- **SSH communicators**: `uname -s -m`
- **WinRM communicators**: `echo %PROCESSOR_ARCHITECTURE%`

The provisioner uses this information to download and extract the correct build of Packer on the remote host and set platform-specific default execution commands.

## Complete example with manual SBOM generation

The follow example includes a `shell` provisioner to download, install, and run a custom scanner to generate an SBOM. Then, it sets the `source` argument of the `hcp-sbom` provisioner to the output file of the custom scanning tool.

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
packer {
  required_plugins {
    docker = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/docker"
    }
  }
}

source "docker" "ubuntu" {
  image  = "ubuntu:20.04"
  commit = true
}

build {
  sources = ["source.docker.ubuntu"]

  hcp_packer_registry {
    bucket_name = "test-bucket"
  }

  provisioner "shell" {
    inline = [
      "apt-get update -y",
      "apt-get install -y curl gpg",
      "bash -c \"$(curl -sSL https://install.mondoo.com/sh)\"",
      "cnquery sbom --output cyclonedx-json --output-target /tmp/sbom_cyclonedx.json",
    ]
  }

  provisioner "hcp-sbom" {
    source      = "/tmp/sbom_cyclonedx.json"
    destination = "./sbom"
    sbom_name   = "sbom-cyclonedx"
  }
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "builders": [
    {
      "type": "docker",
      "image": "ubuntu:20.04",
      "commit": true
    }
  ],
  "provisioners": [
    {
      "type": "shell",
      "inline": [
        "apt-get update -y",
        "apt-get install -y curl",
        "bash -c \"$(curl -sSL https://install.mondoo.com/sh)\"",
        "cnquery sbom --output cyclonedx-json --output-target /tmp/sbom_cyclonedx.json"
      ]
    },
    {
      "type": "hcp-sbom",
      "source": "/tmp/sbom_cyclonedx.json",
      "destination": "./sbom",
      "sbom_name": "sbom-cyclonedx"
    }
  ]
}
```

</TabItem>

</Tabs>

## Complete example with automatic SBOM generation

The following example uses Packer's built-in automatic scanner to generate and upload an SBOM for the artifact:

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
packer {
  required_plugins {
    docker = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/docker"
    }
  }
}

source "docker" "ubuntu" {
  image  = "ubuntu:20.04"
  commit = true
}

build {
  sources = ["source.docker.ubuntu"]

  hcp_packer_registry {
    bucket_name = "test-bucket"
  }

  provisioner "hcp-sbom" {
    auto_generate = true
    scan_path     = "/"
    destination   = "./sbom"
    sbom_name     = "auto-generated-sbom"
  }
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "builders": [
    {
      "type": "docker",
      "image": "ubuntu:20.04",
      "commit": true
    }
  ],
  "provisioners": [
    {
      "type": "hcp-sbom",
      "auto_generate": true,
      "scan_path": "/",
      "destination": "./sbom",
      "sbom_name": "auto-generated-sbom"
    }
  ]
}
```

</TabItem>

</Tabs>

## Template variables in execute_command

The `execute_command` configuration option supports the following template variables:

- `{{.Path}}` - Path to Packer on the remote host
- `{{.Args}}` - Tool arguments (from `scanner_args`)
- `{{.ScanPath}}` - Path to scan (from `scan_path`)
- `{{.Output}}` - Output file path for the SBOM

These variables let you customize how the provisioner executes the SBOM generation tool while maintaining flexibility across different environments and security requirements.
