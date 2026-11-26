---
description: |
  `hcp-sbom` Packer 配置器将 CycloneDX 或 SPDX JSON 格式的软件物料清单记录上传到 HCP Packer。了解如何使用 `hcp-sbom` 配置器。
title: hcp-sbom 配置器参考
---

<Badge type="tip" text="Official" />

# `hcp-sbom` 配置器

`hcp-sbom` 配置器将 Packer 构建的制品中的软件物料清单 (SBOM) 文件上传到 HCP Packer，并将其与各个制品版本关联。你要上传的 SBOM 文件必须格式化为 JSON 并遵循 [SPDX](https://spdx.github.io/spdx-spec/latest) 或 [CycloneDX](https://cyclonedx.org/) 规范。

该配置器支持以下操作方法：

1. **手动 SBOM 上传** (`source`)：从远程主机上传自生成的 SBOM 文件。
2. **自动 SBOM 生成** (`auto_generate`)：Packer 使用其内置扫描工具生成 SBOM。有关更多信息，请参阅[自动 SBOM 生成](#自动-sbom-生成)。

## 示例

以下示例从本地 `/tmp` 目录上传 SBOM，并在本地机器上的 `./sbom/sbom_cyclonedx.json` 存储副本。

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

## 自动 SBOM 生成

你可以配置配置器自动下载并在远程主机上运行 Packer 以生成 SBOM。

以下示例在远程主机上运行 Packer 以生成 SBOM，将其与 HCP Packer 制品版本关联，并在本地机器上的 `./sbom/sbom_cyclonedx.json` 存储副本。

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

当你将 `auto_generate` 设置为 `true` 时，Packer 会自动检测远程主机的操作系统和架构，并下载适当的 Packer 二进制文件。然后 Packer 生成 SBOM，下载 SBOM，并将其上传到 HCP Packer。

Packer 完成构建后，它会清理为下载 SBOM 生成工具而创建的所有临时文件。

::: info
**注意：** Packer 在连接到远程主机时在运行时验证操作系统和架构。如果检测到的平台不受支持，配置器将失败并显示错误消息，指示不受支持的平台。
:::

### 提升执行权限

如果你的远程系统需要不同的权限来执行扫描和生成 SBOM，你可以自定义配置器。

::: info
**注意：** 使用提升的权限（如 sudo 或管理员访问权限）运行 SBOM 生成工具可提供更完整的扫描结果。如果没有提升的权限，工具可能无法访问系统上的所有文件和目录，这可能导致不完整的 SBOM。
:::

默认情况下，Packer 运行以下命令来运行 SBOM 生成工具：

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

你可以设置 `execute_command` 参数来覆盖此默认行为。Packer 提供模板变量以在运行时填充信息，例如 SBOM 生成工具的路径、工具的参数和要扫描的路径。有关支持的变量的完整列表，请参阅 [execute_command 中的模板变量](#execute_command-中的模板变量)。

以下示例覆盖默认的 `execute_command` 值以为 `sudo` 命令提供密码：

```hcl
provisioner "hcp-sbom" {
  auto_generate   = true
  execute_command = "chmod +x {{.Path}} && echo 'mypassword' | sudo -S {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}"
  destination     = "./sbom"
  sbom_name       = "sbom-sudo-password"
}
```

以下示例在不需要提升权限的情况下从命令中删除 `sudo`：

```hcl
provisioner "hcp-sbom" {
  auto_generate   = true
  execute_command = "chmod +x {{.Path}} && {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}"
  destination     = "./sbom"
  sbom_name       = "sbom-no-sudo"
}
```

#### 使用自定义用户的 Windows

对于需要管理员权限的 Windows 主机，你可以设置 `elevated_user` 和 `elevated_password` 参数，告诉 Packer 以特定用户身份执行 SBOM 生成。

```hcl
provisioner "hcp-sbom" {
  auto_generate      = true
  elevated_user      = "Administrator"
  elevated_password  = "MySecurePassword123!"
  destination        = "./sbom"
  sbom_name          = "windows-elevated-sbom"
}
```

## 配置参考

你可以指定以下配置选项。

必需参数：

以下之一是必需的：

- `source` (string) - Packer 制品中 SBOM 文件的文件路径或 URL。此文件必须是 SPDX 或 CycloneDX 格式。与 `auto_generate` 互斥。

- `auto_generate` (bool) - 通过在远程主机上运行 `packer sbom-generate` 启用自动 SBOM 生成。启用后，配置器将运行中的 Packer 二进制文件（其中嵌入了 Syft SDK）上传到远程 VM 并在那里执行以生成 SBOM。与 `source` 互斥。

<!-- End of code generated from the comments of the Config struct in provisioner/hcp-sbom/provisioner.go; -->

可选参数：

- `destination` (string) - 在本地机器上存储 SBOM 文件副本的路径。你可以指定绝对路径或相对于执行 Packer 构建时工作目录的路径。如果文件已存在于本地机器上，Packer 将覆盖该文件。如果目标是目录，则该目录必须已存在。

- `sbom_name` (string) - 存储在 HCP Packer 中的 SBOM 文件的名称。如果省略，HCP Packer 将使用构建指纹作为文件名。此值必须是以下字符集中的 3 到 36 个字符：`[A-Za-z0-9_-]`。你必须为制品版本中的每个构建指定唯一的名称。

- `scanner_args` ([]string) - 传递给 `packer sbom-generate` 的参数。默认值：`["-o", "cyclonedx-json"]`。

- `scanner_url` (string) - 已弃用：不再支持自定义扫描器 URL。hcp-sbom 配置器现在使用带有嵌入式 Syft SDK 的 Packer 二进制文件进行自动 SBOM 生成。此字段被忽略，将在未来的主要版本中删除。对于自定义 SBOM 工具，请使用 `source` 字段进行手动生成，而不是 `auto_generate`。

- `scanner_checksum` (string) - 已弃用：不再支持扫描器校验和验证。此字段被忽略，将在未来的主要版本中删除。

- `scan_path` (string) - 远程主机上要扫描的路径。默认为 `/`（根目录）。

- `execute_command` (string) - 用于在远程主机上执行扫描器的命令模板。可用的模板变量：
  
  - `{{.Path}}` - 远程主机上扫描器二进制文件的路径
  - `{{.Args}}` - 扫描器参数（来自 `scanner_args`）
  - `{{.ScanPath}}` - 要扫描的路径（来自 `scan_path`）
  - `{{.Output}}` - SBOM 的输出文件路径
  
  Unix 默认值：`chmod +x {{.Path}} && sudo {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}`
  
  Windows 默认值：`{{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}`
  
  示例：
  
  不使用 sudo：
  
  ```hcl
  execute_command = "chmod +x {{.Path}} && {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}"
  ```
  
  使用 sudo 密码：
  
  ```hcl
  execute_command = "chmod +x {{.Path}} && echo 'password' | sudo -S {{.Path}} sbom-generate {{.Args}} {{.ScanPath}} > {{.Output}}"
  ```

- `elevated_user` (string) - 在 Windows 上运行 Packer 时用于提升权限的用户名。这仅用于需要提升权限的 Windows 主机。对于类 Unix 系统，请改用带有 sudo 的 `execute_command`。

- `elevated_password` (string) - `elevated_user` 的密码。如果指定了 `elevated_user`，则必需。仅适用于 Windows 主机。

<!-- End of code generated from the comments of the Config struct in provisioner/hcp-sbom/provisioner.go; -->

## 操作系统和架构检测

当你启用 `auto_generate` 时，配置器运行以下命令来自动检测远程主机的操作系统和架构：

- **SSH 通信器**：`uname -s -m`
- **WinRM 通信器**：`echo %PROCESSOR_ARCHITECTURE%`

配置器使用此信息在远程主机上下载并解压正确构建的 Packer，并设置特定于平台的默认执行命令。

## 手动 SBOM 生成的完整示例

以下示例包括一个 `shell` 配置器来下载、安装和运行自定义扫描器以生成 SBOM。然后，它将 `hcp-sbom` 配置器的 `source` 参数设置为自定义扫描工具的输出文件。

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

## 自动 SBOM 生成的完整示例

以下示例使用 Packer 内置的自动扫描器为制品生成和上传 SBOM：

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

## execute_command 中的模板变量

`execute_command` 配置选项支持以下模板变量：

- `{{.Path}}` - 远程主机上 Packer 的路径
- `{{.Args}}` - 工具参数（来自 `scanner_args`）
- `{{.ScanPath}}` - 要扫描的路径（来自 `scan_path`）
- `{{.Output}}` - SBOM 的输出文件路径

这些变量让你可以自定义配置器如何执行 SBOM 生成工具，同时在不同环境和安全要求之间保持灵活性。
