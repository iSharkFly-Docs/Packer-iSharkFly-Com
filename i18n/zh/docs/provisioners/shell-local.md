---
description: |
  `shell-local` Packer 配置器在运行 Packer 的机器上运行 shell 脚本。了解如何使用 `shell-local` 配置器在构建服务器、桌面或其他本地机器上运行 shell 脚本。
title: shell-local 配置器参考
---

<Badge type="tip" text="Official" />

# `shell-local` 配置器

`shell-local` 配置器在运行 Packer 的机器上运行 shell 脚本。使用此配置器在构建服务器、桌面或其他本地机器上运行 shell 脚本，而不是在你使用 Packer 配置的远程或客户机上运行。

[远程 shell](/docs/provisioners/shell) 配置器在远程机器上执行 shell 脚本。

## 基本示例

下面的示例是完全可用的。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
source "file" "example" {
    content = "example content"
}

build {
  source "source.file.example" {
    target = "./test_artifact.txt"
  }

  provisioner "shell-local" {
    inline = ["echo foo"]
  }
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "builders": [
    {
      "type": "file",
      "name": "example",
      "target": "./test_artifact.txt",
      "content": "example content"
    }
  ],
  "provisioners": [
    {
      "type": "shell-local",
      "inline": ["echo foo"]
    }
  ]
}
```

</TabItem>

</Tabs>

## 配置参考

下面列出了可用配置选项的参考。唯一必需的元素是 `command`。

以下之一是必需的：

- `command` (string) - 这是要执行的单个命令。它将被写入临时文件并使用下面的 `execute_command` 调用运行。如果你在 AWS、Azure、Google Compute 或 OpenStack 上构建 Windows VM，并希望访问 Packer 用于通过 WinRM 连接到实例的生成密码，你可以使用模板变量 `{{.WinRMPassword}}` 将其设置为环境变量。

- `inline` (array of strings) - 这是要执行的命令数组。命令通过换行符连接并转换为单个文件，因此它们都在同一上下文中执行。这允许你在一个命令中更改目录，并在下一个命令中使用该目录中的内容，依此类推。内联脚本是在运行 Packer 的机器上完成简单任务的最简单方法。

- `script` (string) - 要执行的脚本路径。此路径可以是绝对路径或相对路径。如果是相对路径，则相对于 Packer 执行时的工作目录。

- `scripts` (array of strings) - 要执行的脚本数组。脚本将按指定的顺序执行。每个脚本都是独立执行的，因此一个脚本中的变量等状态不会传递到下一个脚本。

可选参数：

- `env` (map of strings) - 在 execute_command 之前注入的键/值对映射。Packer 也会默认向环境中注入一些环境变量，这些在下面的部分中介绍。重复的 `env` 设置会覆盖 `environment_vars` 设置。

- `environment_vars` (array of strings) - 在 `execute_command` 之前注入的键/值对数组。格式应为 `key=value`。Packer 也会默认向环境中注入一些环境变量，这些在下面的部分中介绍。如果你在 AWS、Azure、Google Compute 或 OpenStack 上构建 Windows VM，并希望访问 Packer 用于通过 WinRM 连接到实例的生成密码，你可以使用模板变量 `{{.WinRMPassword}}` 将其设置为环境变量。例如：`"environment_vars": "WINRMPASS={{.WinRMPassword}}"`

- `env_var_format` (string) - 当我们解析你提供的 environment_vars 时，这给我们一个字符串模板来确保我们正确设置环境变量。在 Windows 主机上，默认格式是 `set %s=%s &&`，在 Unix 上是 `%s='%s'`。你可能不需要更改此格式，但你可以在下面看到需要更改的使用示例。

- `execute_command` (array of strings) - 用于执行脚本的命令。在 Unix 上默认为 `["/bin/sh", "-c", "{{.Vars}} {{.Script}}"]`，在 Windows 上默认为 `["cmd", "/c", "{{.Vars}}", "{{.Script}}"]`。这被视为[模板引擎](/docs/templates/legacy_json_templates/engine)。有两个可用的变量：`Script` 是要运行的脚本的路径，`Vars` 是 `environment_vars` 的列表（如果已配置）。

  如果你选择设置此选项，请确保数组中的第一个元素是你要使用的 shell 程序（例如"sh"），数组中的后一个元素必须是 `{{.Script}}`。

  此选项为你提供了很大的灵活性。你可以选择提供自己的 shell 程序，例如"/usr/local/bin/zsh"甚至"powershell.exe"。但是，能力越大，责任越大——这些命令不受官方支持，如果你使用与默认不同的 shell，环境变量等内容可能无法工作。

  为了向后兼容，你也可以使用 `{{.Command}}`，但它的解码方式与 `{{.Script}}` 相同。为了清晰起见，我们建议使用 `{{.Script}}`，因为即使你只设置了一个 `command` 来运行，Packer 也会将其写入临时文件，然后作为脚本运行。

  如果你在 AWS、Azure、Google Compute 或 OpenStack 上构建 Windows VM，并希望访问 Packer 用于通过 WinRM 连接到实例的生成密码，你可以使用模板变量 `{{.WinRMPassword}}` 将其设置为环境变量。

- `inline_shebang` (string) - 运行由 `inline` 指定的命令时使用的 [shebang](http://en.wikipedia.org/wiki/Shebang_%28Unix%29) 值。默认为 `/bin/sh -e`。如果你不使用 `inline`，则此配置无效。**重要：** 如果你自定义此值，请确保包含类似 `-e` 标志的内容，否则单个步骤的失败不会导致配置器失败。

- `only_on` (array of strings) - 这是 `shell-local` 将执行的[运行时操作系统](https://go.dev/doc/install/source#environment)数组。这允许你_仅_在特定操作系统上执行 `shell-local`。默认情况下，如果未设置 `only_on`，shell-local 将始终运行。

- `use_linux_pathing` (bool) - 这仅与 Windows 主机相关。如果你在启用了 Windows Subsystem for Linux 功能的 Windows 环境中运行 Packer，并且希望调用 bash 脚本而不是 Cmd 脚本，你需要将此标志设置为 true；它告诉 Packer 为你的脚本使用 Linux 子系统路径而不是 Windows 路径。（例如 /mnt/c/path/to/your/file 而不是 C:/path/to/your/file）。有关如何使用此功能的更多指导，请参阅下面的示例。如果你不在 Windows 主机上，或者你不打算使用 shell-local 配置器运行 bash 脚本，请忽略此选项。

- `valid_exit_codes` (list of ints) - 脚本的有效退出代码。默认为 `0`。

所有配置器通用的参数：

- `pause_before` (duration) - 在执行前休眠一段时间。

- `max_retries` (int) - 配置器在失败时重试的最大次数。默认为零 (0)。零表示错误不会重试。

- `only` (array of string) - 仅为列出的构建器按名称运行配置器。

- `override` (object) - 为特定构建器用不同的设置覆盖构建器，例如：

  在 HCL2 中：

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

  在 JSON 中：

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

- `timeout` (duration) - 如果配置器花费超过例如 `1h10m1s` 或 `10m` 完成，配置器将超时并失败。

## Execute Command

对于许多新用户来说，`execute_command` 令人困惑。然而，它提供了一个重要的功能：自定义命令的执行方式。最常见的用例是处理 **sudo 密码提示**。如果你使用非 POSIX shell，如 FreeBSD 上的 `tcsh`，你可能也需要自定义这个。

### Windows Linux 子系统

shell-local 配置器的设计理念是允许你在本地操作系统的原生 shell 中运行命令。对于 Windows，我们在默认值中假设这是 Cmd。但是，通过修改配置器配置中的 `execute_command` 和 `use_linux_pathing` 选项，可以从 shell-local 配置器运行作为 Windows Linux 子系统一部分的 bash 脚本。

下面的示例是一个完全可用的测试配置。

此功能的一个限制是"inline"和"command"选项对你不可用；请限制自己使用"script"或"scripts"选项。

请注意，WSL 是一个测试版功能，不保证此工具会按你期望的方式工作。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
source "null" "example" {
    communicator = "none"
}

build {
    sources = [
        "source.null.example"
    ]

    provisioner "shell-local"{
        environment_vars = ["PROVISIONERTEST=ProvisionerTest1"]
        execute_command = ["bash", "-c", "{{.Vars}} {{.Script}}"]
        use_linux_pathing = true
        scripts = ["C:/Users/me/scripts/example_bash.sh"]
    }
    provisioner "shell-local"{
        environment_vars = ["PROVISIONERTEST=ProvisionerTest2"]
        execute_command = ["bash", "-c", "{{.Vars}} {{.Script}}"]
        use_linux_pathing = true
        script = "C:/Users/me/scripts/example_bash.sh"
    }
}
```

</TabItem>

<TabItem value="t1">

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
      "environment_vars": ["PROVISIONERTEST=ProvisionerTest1"],
      "execute_command": ["bash", "-c", "{{.Vars}} {{.Script}}"],
      "use_linux_pathing": true,
      "scripts": ["C:/Users/me/scripts/example_bash.sh"]
    },
    {
      "type": "shell-local",
      "environment_vars": ["PROVISIONERTEST=ProvisionerTest2"],
      "execute_command": ["bash", "-c", "{{.Vars}} {{.Script}}"],
      "use_linux_pathing": true,
      "script": "C:/Users/me/scripts/example_bash.sh"
    }
  ]
}
```

</TabItem>

</Tabs>

## 默认环境变量

除了能够使用 `environment_vars` 配置指定自定义环境变量外，配置器还会自动定义某些常用的环境变量：

- `PACKER_BUILD_NAME` 设置为 Packer 正在运行的构建名称。当 Packer 进行多个构建并且你想从通用配置脚本中稍微区分它们时，这最有用。

- `PACKER_BUILDER_TYPE` 是用于创建脚本正在运行的机器的构建器类型。如果你只想在使用某些构建器构建的系统上运行脚本的某些部分，这很有用。

- `PACKER_HTTP_ADDR` 如果使用提供 HTTP 服务器进行文件传输的构建器（如 `hyperv`、`parallels`、`qemu`、`virtualbox` 和 `vmware`），这将设置为地址。你可以在配置器中使用此地址通过 HTTP 下载大文件。如果你使用默认 file 配置器时遇到速度较慢的问题，这可能很有用。使用 `winrm` 通信器的 file 配置器可能会遇到这类困难。

## 安全编写脚本

无论你使用 `inline` 选项，还是直接传递 `script` 或 `scripts`，了解 `shell-local` 配置器如何工作以安全轻松地运行它是很重要的。这种理解将为你节省大量时间。

### 每个构建器运行一次

你传递的 `shell-local` 脚本每个构建器运行一次。这意味着如果你有一个 `amazon-ebs` 构建器和一个 `docker` 构建器，你的脚本将运行两次。如果你有 3 个构建器，它将运行 3 次，每个构建器一次。

### 始终有意退出

如果任何配置器失败，`packer build` 将停止，所有中间制品将被清理。

对于 shell 脚本，这意味着脚本**必须**以零代码退出。你_必须_在必要时格外小心地 `exit 0`。

## 使用示例：

### Windows 主机

在 Windows 上运行 .cmd 文件的示例：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell-local" {
  environment_vars = ["SHELLLOCALTEST=ShellTest1"]
  scripts          = ["./scripts/test_cmd.cmd"]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell-local",
  "environment_vars": ["SHELLLOCALTEST=ShellTest1"],
  "scripts": ["./scripts/test_cmd.cmd"]
}
```

</TabItem>

</Tabs>

"test_cmd.cmd" 的内容：

    echo %SHELLLOCALTEST%

在 Windows 上运行内联命令的示例：所需的自定义：tempfile_extension

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell-local" {
  environment_vars   = ["SHELLLOCALTEST=ShellTest2"]
  tempfile_extension = ".cmd"
  inline             = [echo "%SHELLLOCALTEST%"]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell-local",
  "environment_vars": ["SHELLLOCALTEST=ShellTest2"],
  "tempfile_extension": ".cmd",
  "inline": ["echo %SHELLLOCALTEST%"]
}
```

</TabItem>

</Tabs>

使用 WSL 在 Windows 上运行 bash 命令的示例：所需的自定义：use_linux_pathing 和 execute_command

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell-local" {
  environment_vars  = ["SHELLLOCALTEST=ShellTest3"]
  execute_command   = ["bash", "-c", "{{.Vars}} {{.Script}}"]
  use_linux_pathing = true
  script            = "./scripts/example_bash.sh"
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell-local",
  "environment_vars": ["SHELLLOCALTEST=ShellTest3"],
  "execute_command": ["bash", "-c", "{{.Vars}} {{.Script}}"],
  "use_linux_pathing": true,
  "script": "./scripts/example_bash.sh"
}
```

</TabItem>

</Tabs>

`example_bash.sh` 的内容：

    #!/bin/bash
    echo $SHELLLOCALTEST

在 Windows 上运行 PowerShell 脚本的示例：所需的自定义：`env_var_format` 和 `execute_command`

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell-local" {
  environment_vars = ["SHELLLOCALTEST=ShellTest4"]
  execute_command  = ["powershell.exe", "{{.Vars}} {{.Script}}"]
  env_var_format   = "$env:%s=\"%s\"; "
  script           = "./scripts/example_ps.ps1"
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell-local",
  "environment_vars": ["SHELLLOCALTEST=ShellTest4"],
  "execute_command": ["powershell.exe", "{{.Vars}} {{.Script}}"],
  "env_var_format": "$env:%s=\"%s\"; ",
  "script": "./scripts/example_ps.ps1"
}
```

</TabItem>

</Tabs>

在 Windows 上以"内联"方式运行 PowerShell 脚本的示例：所需的自定义：`env_var_format`、`tempfile_extension` 和 `execute_command`

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell-local" {
  tempfile_extension = ".ps1"
  environment_vars   = ["SHELLLOCALTEST=ShellTest5"]
  execute_command    = ["powershell.exe", "{{.Vars}} {{.Script}}"]
  env_var_format     = "$env:%s=\"%s\"; "
  inline             = ["write-output $env:SHELLLOCALTEST"]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell-local",
  "tempfile_extension": ".ps1",
  "environment_vars": ["SHELLLOCALTEST=ShellTest5"],
  "execute_command": ["powershell.exe", "{{.Vars}} {{.Script}}"],
  "env_var_format": "$env:%s=\"%s\"; ",
  "inline": ["write-output $env:SHELLLOCALTEST"]
}
```

</TabItem>

</Tabs>

### Unix 主机

在 Unix 上运行 Shell 脚本的示例：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell-local" {
  environment_vars = ["PROVISIONERTEST=ProvisionerTest1"]
  scripts          = ["./scripts/example_bash.sh"]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell-local",
  "environment_vars": ["PROVISIONERTEST=ProvisionerTest1"],
  "scripts": ["./scripts/example_bash.sh"]
}
```

</TabItem>

</Tabs>

在 Unix 上"内联"运行 Shell 脚本的示例：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell-local" {
  environment_vars = ["PROVISIONERTEST=ProvisionerTest2"]
  inline           = ["echo hello", "echo $PROVISIONERTEST"]
}

```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell-local",
  "environment_vars": ["PROVISIONERTEST=ProvisionerTest2"],
  "inline": ["echo hello", "echo $PROVISIONERTEST"]
}
```

</TabItem>

</Tabs>

在 Unix 上运行 Python 脚本的示例：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell-local" {
  script = "hello.py"
  environment_vars = ["HELLO_USER=packeruser"]
  execute_command  = [
    "/bin/sh",
    "-c",
    "{{.Vars}} /usr/local/bin/python {{.Script}}"
  ]
}

```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell-local",
  "script": "hello.py",
  "environment_vars": ["HELLO_USER=packeruser"],
  "execute_command": [
    "/bin/sh",
    "-c",
    "{{.Vars}} /usr/local/bin/python {{.Script}}"
  ]
}
```

</TabItem>

</Tabs>

```txt
其中 "hello.py" 包含：

    import os

    print('Hello, %s!' % os.getenv("HELLO_USER"))
```
