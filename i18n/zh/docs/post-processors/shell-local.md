---
description: |
  `shell-local` 后处理器启动本地 shell，让你在 Packer 构建制品后自动执行构建后操作。
title: shell-local 后处理器参考
---

<Badge type="tip" text="Official" />

# `shell-local` 后处理器

`shell-local` 后处理器在后处理阶段在本地执行脚本。Shell local 提供了一种方便的方式来使用 packer 输出和变量自动执行某些任务。

## 基本示例

下面的示例是一个完全功能的独立构建。

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

  post-processor "shell-local" {
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
  "post-processors": [
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

下面列出了可用配置选项的参考。唯一必需的元素是 "inline" 或 "script"。其他所有选项都是可选的。

以下其中之一是_必需_的：

- `command`（string）- 这是要执行的单个命令。它将被写入临时文件并使用下面的 `execute_command` 调用运行。

- `inline`（字符串数组）- 这是要执行的命令数组。命令通过换行符连接并转换为单个文件，因此它们都在同一上下文中执行。这允许你在一个命令中更改目录，并在下一个命令中使用该目录中的内容，依此类推。内联脚本是在机器内完成简单任务的最简单方式。

- `script`（string）- 要执行的脚本路径。此路径可以是绝对路径或相对路径。如果是相对路径，则相对于执行 Packer 时的工作目录。

- `scripts`（字符串数组）- 要执行的脚本数组。脚本将按指定顺序执行。每个脚本独立执行，因此一个脚本中的变量等状态不会延续到下一个脚本。

可选参数：

- `env`（字符串映射）- 在 execute_command 之前注入的键/值对映射。Packer 默认也会向环境中注入一些环境变量，这在下面的部分中介绍。重复的 `env` 设置会覆盖 `environment_vars` 设置。

- `environment_vars`（字符串数组）- 在 `execute_command` 之前注入的键/值对数组。格式应为 `key=value`。Packer 默认也会向环境中注入一些环境变量，这在下面的部分中介绍。

- `env_var_format`（string）- 当我们解析你提供的 environment_vars 时，这给我们一个字符串模板来确保正确设置环境变量。在 Windows 主机上，默认格式为 `set %s=%s &&`，在 Unix 上为 `%s='%s'`。你可能不需要更改此格式，但你可以在下面看到需要它的使用示例。

- `execute_command`（字符串数组）- 用于执行脚本的命令。默认情况下，在 \*nix 系统上是：

  ```txt
  ["/bin/sh", "-c", "{{.Vars}} {{.Script}}"]
  ```

  在 Windows 上，`execute_command` 默认为：

  ```txt
  ["cmd", "/V", "/C", "{{.Vars}}", "call", "{{.Script}}"]
  ```

  这被视为[模板引擎](/docs/templates/legacy_json_templates/engine)。有几个可用的变量：`Script` 是要运行的脚本路径，`Vars` 是已配置的 `environment_vars` 列表。此外，你可以使用 [build](/docs/templates/legacy_json_templates/engine) 模板函数访问存储在生成数据中的任何变量。如果你选择设置此选项，请确保数组中的第一个元素是你想要使用的 shell 程序（例如，"sh" 或 "/usr/local/bin/zsh" 甚至 "powershell.exe"，尽管除 shell 命令语言的变体之外的任何内容都不受明确支持，可能会被 Packer 内部的假设破坏）。值得注意的是，如果你选择尝试使用 shell-local 来运行 Powershell 或其他 Windows 命令，环境变量将不会为你的环境正确设置。

  为了向后兼容，`execute_command` 将接受字符串而不是字符串数组。如果提供单个字符串或只有一个元素的字符串数组，Packer 将通过将你的 `execute_command` 追加到字符串数组 `["sh", "-c"]` 来复制过去的行为。例如，如果你设置 `"execute_command": "foo bar"`，Packer 运行的最终 `execute_command` 将是 \["sh", "-c", "foo bar"\]。如果你设置 `"execute_command": ["foo", "bar"]`，最终的 execute_command 将保持 `["foo", "bar"]`。

  同样，以上仅作为向后兼容性修复提供；我们强烈建议将 execute_command 设置为字符串数组。

- `inline_shebang`（string）- 运行由 `inline` 指定的命令时使用的 [shebang](http://en.wikipedia.org/wiki/Shebang_%28Unix%29) 值。默认情况下，这是 `/bin/sh -e`。如果你不使用 `inline`，则此配置无效。**重要提示：** 如果你自定义此设置，请确保包含类似 `-e` 标志的内容，否则单个步骤失败不会导致配置器失败。

- `keep_input_artifact`（boolean）- 与大多数其他后处理器不同，keep_input_artifact 选项对 shell-local 后处理器无效。Packer 将始终保留 shell-local 的输入制品，因为 shell-local 后处理器只是转发它收到的制品。如果你的 shell-local 后处理器生成了你希望替换输入制品的文件，你可以在 shell-local 处理器运行后使用 [artifice](/docs/post-processors/artifice) 后处理器覆盖输入制品。

- `only_on`（字符串数组）- 这是 `shell-local` 将执行的[运行时操作系统](https://go.dev/doc/install/source#environment)数组。这允许你_仅_在特定操作系统上执行 `shell-local`。默认情况下，如果未设置 `only_on`，shell-local 将始终运行。

- `use_linux_pathing`（bool）- 这仅与 Windows 主机相关。如果你在启用了 Windows Linux 子系统功能的 Windows 环境中运行 Packer，并且想要调用 bash 脚本而不是 Cmd 脚本，你需要将此标志设置为 true；它告诉 Packer 为你的脚本使用 Linux 子系统路径而不是 Windows 路径。（例如 /mnt/c/path/to/your/file 而不是 C:/path/to/your/file）。有关如何使用此功能的更多指导，请参阅下面的示例。如果你不在 Windows 主机上，或者你不打算使用 shell-local 后处理器来运行 bash 脚本，请忽略此选项。如果你将此标志设置为 true，你仍然需要在提供 `script` 时提供脚本的标准 Windows 路径。这是一个测试功能。

- `valid_exit_codes`（整数列表）- 脚本的有效退出代码。默认为 `0`。

## Execute Command

对于许多新用户来说，`execute_command` 令人困惑。然而，它提供了一个重要的功能：自定义命令的执行方式。最常见的用例是处理 **sudo 密码提示**。如果你使用非 POSIX shell（如 FreeBSD 上的 `tcsh`），你可能还需要自定义此设置。

### Windows Linux 子系统

shell-local 后处理器的设计理念是允许你在本地操作系统的原生 shell 中运行命令。对于 Windows，我们在默认值中假设这是 Cmd。但是，可以通过修改后处理器配置中的 `execute_command` 和 `use_linux_pathing` 选项，从 shell-local 后处理器运行 bash 脚本作为 Windows Linux 子系统的一部分。

下面的示例是一个完全功能的测试配置。

此产品的一个限制是 "inline" 和 "command" 选项对你不可用；请限制自己使用 "script" 或 "scripts" 选项。

请注意，此功能仍处于测试阶段，因为底层 WSL 也仍处于测试阶段。因此会有一些限制。例如，除非 Packer 和你想要运行的脚本都在 C 盘上，否则它可能无法工作。

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

    post-processor "shell-local"{
        environment_vars  = ["PROVISIONERTEST=ProvisionerTest1"]
        execute_command   = ["bash", "-c", "{{.Vars}} {{.Script}}"]
        use_linux_pathing = true
        scripts           = ["C:/Users/me/scripts/example_bash.sh"]
    }
    post-processor "shell-local"{
        environment_vars  = ["PROVISIONERTEST=ProvisionerTest2"]
        execute_command   = ["bash", "-c", "{{.Vars}} {{.Script}}"]
        use_linux_pathing = true
        script            = "C:/Users/me/scripts/example_bash.sh"
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
  "post-processors": [
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

除了能够使用 `environment_vars` 配置指定自定义环境变量外，配置器还自动定义了某些常用的环境变量：

- `PACKER_BUILD_NAME` 设置为 Packer 正在运行的[构建名称](/docs/templates/legacy_json_templates/builders#named-builds)。当 Packer 进行多个构建并且你想从通用配置脚本中稍微区分它们时，这最有用。

- `PACKER_BUILDER_TYPE` 是用于创建脚本运行所在机器的构建器类型。如果你只想在使用某些构建器构建的系统上运行脚本的某些部分，这很有用。

## 安全编写脚本

无论你使用 `inline` 选项，还是传递直接的 `script` 或 `scripts`，了解 shell-local 后处理器如何运行的一些事情对于安全轻松地运行它很重要。这种理解将为你节省大量时间。

### 每个构建器运行一次

你传递的 `shell-local` 脚本每个构建器运行一次。这意味着如果你有一个 `amazon-ebs` 构建器和一个 `docker` 构建器，你的脚本将运行两次。如果你有 3 个构建器，它将运行 3 次，每个构建器一次。

### 与构建制品交互

为了与构建制品交互，你可能想使用 [manifest 后处理器](/docs/post-processors/manifest)。这将在每个 `builder` 运行后将 `builder` 生成的文件列表写入 json 文件。

例如，如果你想将 file 构建器的文件打包成 tarball，你可以这样写：

<Tabs groupId="template-format" :tabs="[{label:'JSON',value:'t0'},{label:'HCL2',value:'t1'}]">

<TabItem value="t0">

```json
{
  "builders": [
    {
      "content": "Lorem ipsum dolor sit amet",
      "target": "dummy_artifact",
      "type": "file"
    }
  ],
  "post-processors": [
    [
      {
        "output": "manifest.json",
        "strip_path": true,
        "type": "manifest"
      },
      {
        "inline": [
          "jq \".builds[].files[].name\" manifest.json | xargs tar cfz artifacts.tgz"
        ],
        "type": "shell-local"
      }
    ]
  ]
}
```

</TabItem>

<TabItem value="t1">

```hcl
source "file" "example" {
    content = "Lorem ipsum dolor sit amet"
    target  = "dummy_artifact.txt"
}
build {
  sources = [
    "source.file.example"
  ]
  post-processor "manifest" {
    output     = "manifest.json"
    strip_path = true
  }

  post-processor "shell-local" {
    inline = [
        "jq \".builds[].files[].name\" manifest.json | xargs tar cfz artifacts.tgz"
    ]
  }
}
```

</TabItem>

</Tabs>

这使用 [jq](https://stedolan.github.io/jq/) 工具从清单文件中提取所有文件名并传递给 tar。

### 始终有意退出

如果任何后处理器失败，`packer build` 将停止，所有临时制品都会被清理。

对于 shell 脚本，这意味着脚本**必须**以零代码退出。你_必须_特别小心在必要时 `exit 0`。

## 使用示例：

### Windows 主机

在 Windows 上运行 .cmd 文件的示例：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
post-processor "shell-local" {
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

`test_cmd.cmd` 的内容：

    echo %SHELLLOCALTEST%

在 Windows 上运行内联命令的示例：所需自定义：tempfile_extension

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
post-processor "shell-local" {
  environment_vars   = ["SHELLLOCALTEST=ShellTest2"],
  tempfile_extension = ".cmd",
  inline             = ["echo %SHELLLOCALTEST%"]
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

在 Windows 上使用 WSL 运行 bash 命令的示例：所需自定义：`use_linux_pathing` 和 `execute_command`：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
post-processor "shell-local" {
  environment_vars  = ["SHELLLOCALTEST=ShellTest3"],
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

在 Windows 上运行 PowerShell 脚本的示例：
所需自定义：`env_var_format` 和 `execute_command`。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
post-processor "shell-local" {
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

在 Windows 上以 "inline" 方式运行 PowerShell 脚本的示例：所需自定义：`env_var_format`、`tempfile_extension` 和 `execute_command`

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
post-processor "shell-local" {
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
post-processor "shell-local" {
  environment_vars = ["PROVISIONERTEST=ProvisionerTest1"]
  scripts = ["./scripts/example_bash.sh"]
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

在 Unix 上运行 bash "inline" 的示例：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
post-processor "shell-local" {
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
post-processor "shell-local" {
  script           = "hello.py"
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
