---
description: |
  `powershell` Packer 配置器在 Windows 机器上运行 PowerShell 脚本。
  了解如何将配置器与 WinRM 和 SSH 通信器一起使用。
title: powershell 配置器参考
---

<Badge type="tip" text="Official" />

# `powershell` 配置器

`powershell` Packer 配置器在 Windows 机器上运行 PowerShell 脚本。该配置器设计用于使用 WinRM 作为通信器的机器，但你也可以将配置器与 SSH 通信器一起使用。有关详细信息，请参阅[将 PowerShell 配置器与 SSH 通信器结合使用](#将-powershell-配置器与-ssh-通信器结合使用)。

使用正斜杠（`/`）分隔路径，特别是在配置中使用相对路径时。Windows 使用反斜杠（`\`）分隔路径，但当 Packer 从任何非 Windows 系统创建构建时，它只识别 `/` 作为路径分隔符。Packer 还将反斜杠视为纯文本，这可能导致错误。

## 基本示例

下面的示例是完全可用的。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "powershell" {
  inline = ["dir c:/"]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "powershell",
  "inline": ["dir c:/"]
}
```

</TabItem>

</Tabs>

## 配置参考

下面列出了可用配置选项的参考。唯一必需的元素是"inline"或"script"。其他所有选项都是可选的。

以下之一是必需的：

- `inline` (array of strings) - 这是要执行的命令数组。命令通过换行符连接并转换为单个文件，因此它们都在同一上下文中执行。这允许你在一个命令中更改目录，并在下一个命令中使用该目录中的内容，依此类推。内联脚本是在机器中完成简单任务的最简单方法。

- `script` (string) - 要上传并在机器中执行的脚本路径。此路径可以是绝对路径或相对路径。如果是相对路径，则相对于 Packer 执行时的工作目录。

- `scripts` (array of strings) - 要执行的脚本数组。脚本将按指定的顺序上传和执行。每个脚本都是独立执行的，因此一个脚本中的变量等状态不会传递到下一个脚本。

可选参数：

- `binary` (boolean) - 如果为 true，则指定脚本是二进制文件，因此 Packer 不应将 Windows 行尾转换为 Unix 行尾（如果有的话）。默认为 false。

- `valid_exit_codes` (list of ints) - 脚本的有效退出代码。默认只有 0。

- `debug_mode` - 如果设置，将设置 PowerShell 的 [PSDebug 模式](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/set-psdebug?view=powershell-7)以使脚本调试更容易。例如，将值设置为 1 会导致在执行命令中添加：

  ```powershell
  Set-PSDebug -Trace 1
  ```

- `elevated_execute_command` (string) - 用于执行提升脚本的命令。默认情况下如下：

  ```powershell
  powershell -executionpolicy bypass "& { if (Test-Path variable:global:ProgressPreference){$ProgressPreference='SilentlyContinue'};. {{.Vars}}; &'{{.Path}}'; exit $LastExitCode }"
  ```

  这是一个[模板引擎](/docs/templates/legacy_json_templates/engine)。因此，你可以在此字段中使用用户变量和模板函数。此外，你可以使用两个额外的变量：

  - `Path`：要运行的脚本的路径
  - `Vars`：包含 `environment_vars` 列表的临时文件位置（如果已配置）。

- `env` (map of strings) - 在 execute_command 之前注入的键/值对映射。Packer 也会默认向环境中注入一些环境变量，这些在下面的部分中介绍。重复的 `env` 设置会覆盖 `environment_vars` 设置。这不是启用 JSON 模板引擎的函数。HCL 插值正常工作。

- `environment_vars` (array of strings) - 在 execute_command 之前注入的键/值对数组。格式应为 `key=value`。Packer 也会默认向环境中注入一些环境变量，这些在下面的部分中介绍。

- `use_pwsh` (boolean) - 运行 `pwsh.exe` 而不是 `powershell.exe`。默认为 false。

  这是一个[模板引擎](/docs/templates/legacy_json_templates/engine)。因此，你可以在此字段中使用用户变量和模板函数。如果你在 AWS、Azure、Google Compute 或 OpenStack 上运行，并希望访问 Packer 用于通过 WinRM 连接到实例的自动生成的密码，你可以使用 `build` 模板引擎通过 `` {{ build `Password` }} `` 注入它。在 HCL 模板中，你可以通过访问 `build` 变量来做同样的事情。例如：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "powershell" {
  environment_vars = ["WINRMPASS=${build.Password}"]
  inline = ["Write-Host \"Automatically generated aws password is: $Env:WINRMPASS\""]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "powershell",
  "environment_vars": ["WINRMPASS={{ build `Password` }}"],
  "inline": ["Write-Host \"Automatically generated aws password is: $Env:WINRMPASS\""]
},
```

</TabItem>

</Tabs>

- `execute_command` (string) - 用于执行脚本的命令。默认情况下如下：

  ```powershell
  powershell -executionpolicy bypass "& { if (Test-Path variable:global:ProgressPreference){$ProgressPreference='SilentlyContinue'};. {{.Vars}}; &'{{.Path}}'; exit $LastExitCode }"
  ```

  这是一个[模板引擎](/docs/templates/legacy_json_templates/engine)。因此，你可以在此字段中使用用户变量和模板函数。此外，你可以使用两个额外的变量：

  - `Path`：要运行的脚本的路径
  - `Vars`：包含 `environment_vars` 列表的临时文件位置（如果已配置）。
    `Path` 和 `Vars` 的值都可以通过分别设置 `remote_path` 和 `remote_env_var_path` 的值来手动配置。

  如果你使用 SSH 通信器并更改了默认 shell，你可能需要修改 `execute_command` 以确保命令有效且正确转义；默认情况下假设你没有将默认 shell 从 cmd 更改。

- `elevated_user` 和 `elevated_password` (string) - 如果指定，PowerShell 脚本将使用给定的 Windows 用户以提升的权限运行。

  这是一个[模板引擎](/docs/templates/legacy_json_templates/engine)。因此，你可以在此字段中使用用户变量和模板函数。如果你在 AWS、Azure、Google Compute 或 OpenStack 上运行，并希望访问 Packer 用于通过 WinRM 连接到实例的自动生成的密码，你可以使用 `build` 模板引擎通过 `` {{ build `Password` }} `` 注入它。在 HCL 模板中，你可以通过访问 `build` 变量来做同样的事情。例如：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "powershell" {
    elevated_user = "Administrator"
    elevated_password = build.Password
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "powershell",
  "elevated_user": "Administrator",
  "elevated_password": "{{ build `Password` }}",
  ...
},
```

</TabItem>

</Tabs>

如果你指定一个空的 `elevated_password` 值，则 PowerShell 脚本将作为服务帐户运行。例如：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "powershell" {
  elevated_user = "SYSTEM"
  elevated_password = ""
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "powershell",
  "elevated_user": "SYSTEM",
  "elevated_password": "",
  ...
},
```

</TabItem>

</Tabs>

- `execution_policy` - 要在 Windows 上运行 ps 脚本，Packer 默认将其设置为"bypass"并包装要运行的命令。将其设置为"none"将阻止包装，允许在 Docker for Windows 上查看退出代码。可能的值为 `bypass`、`allsigned`、`default`、`remotesigned`、`restricted`、`undefined`、`unrestricted` 和 `none`。

- `remote_path` (string) - PowerShell 脚本将在目标构建机器中上传到的路径。默认为 `C:/Windows/Temp/script-UUID.ps1`，其中 UUID 被替换为唯一标识脚本的动态生成的字符串。

  此设置允许用户覆盖默认上传位置。该值必须是可写位置，并且任何父目录必须已存在。

- `remote_env_var_path` (string) - 远程环境中所需的环境变量在 PowerShell 脚本中上传，然后在执行主命令或脚本之前通过"点源"立即启用脚本。

  环境变量脚本将上传到的路径默认为 `C:/Windows/Temp/packer-ps-env-vars-UUID.ps1`，其中 UUID 被替换为唯一标识脚本的动态生成的字符串。

  此设置允许用户覆盖环境变量脚本上传到的位置。该值必须是可写位置，并且任何父目录必须已存在。

- `skip_clean` (bool) - 是否在执行配置器后清理脚本。默认为 false。当为 true 时，由非提升的 PowerShell 配置器创建的任何脚本都将从远程机器中删除。提升的脚本以及计划任务将始终被删除，无论 `skip_clean` 设置的值如何。

- `start_retry_timeout` (string) - 尝试_启动_远程进程的时间量。默认为 `5m` 或 5 分钟。此设置存在是为了处理 SSH 可能重启的情况，例如系统重启。如果重启需要更长时间，请将此设置为更高的值。

- `pause_after` (string) - 配置 PowerShell 脚本后等待的时间量，如果所有先前步骤都成功，则会进行此暂停。

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

## 默认环境变量

除了能够使用 `environment_vars` 配置指定自定义环境变量外，配置器还会自动定义某些常用的环境变量：

- `PACKER_BUILD_NAME` 设置为 Packer 正在运行的[构建名称](/docs/templates/legacy_json_templates/builders#named-builds)。当 Packer 进行多个构建并且你想从通用配置脚本中稍微区分它们时，这最有用。

- `PACKER_BUILDER_TYPE` 是用于创建脚本正在运行的机器的构建器类型。如果你只想在使用某些构建器构建的系统上运行脚本的某些部分，这很有用。

- `PACKER_HTTP_ADDR` 如果使用提供 HTTP 服务器进行文件传输的构建器（如 `hyperv`、`parallels`、`qemu`、`virtualbox` 和 `vmware`），这将设置为地址。你可以在配置器中使用此地址通过 HTTP 下载大文件。如果你使用默认 file 配置器时遇到速度较慢的问题，这可能很有用。使用 `winrm` 通信器的 file 配置器可能会遇到这类困难。

## 将 PowerShell 配置器与 SSH 通信器结合使用

好消息是，如果你使用 [Microsoft 移植的 OpenSSH](https://github.com/PowerShell/Win32-OpenSSH/wiki)，配置器应该按预期工作 - 不需要额外的配置工作。

现在是注意事项。如果你使用替代配置，并且你的 SSH 连接将你带到远程主机上的 \*nix shell，那么你很可能需要手动设置 `execute_command`；Packer 使用的默认 `execute_command` 对你不起作用。配置命令时，你需要确保任何美元符号或其他可能被远程 shell 错误解释的字符都被适当转义。

以下示例显示了如何重新配置标准 `execute_command` 以在安装了 [Cygwin/OpenSSH](https://cygwin.com/) 的远程系统上工作。`execute_command` 中的每个美元符号都使用反斜杠转义，以便远程 Bash shell 不会解释它 - Bash 是 Cygwin 环境的默认 shell。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "powershell" {
    execute_command = "powershell -executionpolicy bypass \"& { if (Test-Path variable:global:ProgressPreference){\\$ProgressPreference='SilentlyContinue'};. {{.Vars}}; &'{{.Path}}'; exit \\$LastExitCode }\""
    inline          = [ "Write-Host \"Hello from PowerShell\""]
}
```

</TabItem>

<TabItem value="t1">

```json
"provisioners": [
  {
    "type": "powershell",
    "execute_command": "powershell -executionpolicy bypass \"& { if (Test-Path variable:global:ProgressPreference){\\$ProgressPreference='SilentlyContinue'};. {{.Vars}}; &'{{.Path}}'; exit \\$LastExitCode }\"",
    "inline": ["Write-Host \"Hello from PowerShell\""]
  }
]
```

</TabItem>

</Tabs>

## Packer 对 PowerShell 特殊字符的处理

PowerShell 中的转义字符是 `backtick`（反引号），有时也称为 `grave accent`（重音符）。何时以及何时不转义 PowerShell 的特殊字符，最好用一系列示例来演示。

### 何时转义...

当特殊字符_直接_出现在 `inline` PowerShell 配置器中使用的命令中，以及当它们_直接_出现在用户自己的脚本中时，用户需要处理转义 PowerShell 的特殊字符。请注意，当双引号出现在双引号内时，需要添加反斜杠转义才能正确解析 JSON 模板。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "powershell" {
    inline = [
        "Write-Host \"A literal dollar `$ must be escaped\"",
        "Write-Host \"A literal backtick `` must be escaped\"",
        "Write-Host \"Here `\"double quotes`\" must be escaped\"",
        "Write-Host \"Here `'single quotes`' don`'t really need to be\"",
        "Write-Host \"escaped... but it doesn`'t hurt to do so.\"",
    ]
}
```

</TabItem>

<TabItem value="t1">

```json
  "provisioners": [
    {
      "type": "powershell",
      "inline": [
          "Write-Host \"A literal dollar `$ must be escaped\"",
          "Write-Host \"A literal backtick `` must be escaped\"",
          "Write-Host \"Here `\"double quotes`\" must be escaped\"",
          "Write-Host \"Here `'single quotes`' don`'t really need to be\"",
          "Write-Host \"escaped... but it doesn`'t hurt to do so.\""
      ]
    }
  ]
```

</TabItem>

</Tabs>

上面的代码片段应该在 Packer 控制台上产生以下输出：

```shellsession
==> amazon-ebs: Provisioning with Powershell...
==> amazon-ebs: Provisioning with PowerShell script: /var/folders/15/d0f7gdg13rnd1cxp7tgmr55c0000gn/T/packer-powershell-provisioner508190439
    amazon-ebs: A literal dollar $ must be escaped
    amazon-ebs: A literal backtick ` must be escaped
    amazon-ebs: Here "double quotes" must be escaped
    amazon-ebs: Here 'single quotes' don't really need to be
    amazon-ebs: escaped... but it doesn't hurt to do so.
```

### 何时不转义...

出现在用户环境变量值以及 `elevated_user` 和 `elevated_password` 字段中的特殊字符将自动为用户处理。在这些情况下不需要使用转义。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
variable "psvar" {
  type    = string
  default = "My$tring"
}

build {
  sources = ["source.amazon-ebs.example"]

  provisioner "powershell" {
      elevated_user     = "Administrator"
      elevated_password = "Super$3cr3t!"
      inline            = ["Write-Output \"The dollar in the elevated_password is interpreted correctly\""]
  }
  provisioner "powershell" {
    environment_vars = [
        "VAR1=A$Dollar",
        "VAR2=A`Backtick",
        "VAR3=A'SingleQuote",
        "VAR4=A\"DoubleQuote",
        "VAR5=${var.psvar}",
    ]
    inline = [
      "Write-Output \"In the following examples the special character is interpreted correctly:\"",
      "Write-Output \"The dollar in VAR1:                            $Env:VAR1\"",
      "Write-Output \"The backtick in VAR2:                          $Env:VAR2\"",
      "Write-Output \"The single quote in VAR3:                      $Env:VAR3\"",
      "Write-Output \"The double quote in VAR4:                      $Env:VAR4\"",
      "Write-Output \"The dollar in VAR5 (expanded from a user var): $Env:VAR5\"",
    ]
  }
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "variables": {
    "psvar": "My$tring"
  },
  ...
  "provisioners": [
    {
      "type": "powershell",
      "elevated_user": "Administrator",
      "elevated_password": "Super$3cr3t!",
      "inline": "Write-Output \"The dollar in the elevated_password is interpreted correctly\""
    },
    {
      "type": "powershell",
      "environment_vars": [
        "VAR1=A$Dollar",
        "VAR2=A`Backtick",
        "VAR3=A'SingleQuote",
        "VAR4=A\"DoubleQuote",
        "VAR5={{user `psvar`}}"
      ],
      "inline": [
        "Write-Output \"In the following examples the special character is interpreted correctly:\"",
        "Write-Output \"The dollar in VAR1:                            $Env:VAR1\"",
        "Write-Output \"The backtick in VAR2:                          $Env:VAR2\"",
        "Write-Output \"The single quote in VAR3:                      $Env:VAR3\"",
        "Write-Output \"The double quote in VAR4:                      $Env:VAR4\"",
        "Write-Output \"The dollar in VAR5 (expanded from a user var): $Env:VAR5\""
      ]
    }
  ]
  ...
}
```

</TabItem>

</Tabs>

上面的代码片段应该在 Packer 控制台上产生以下输出：

```shellsession
==> amazon-ebs: Provisioning with Powershell...
==> amazon-ebs: Provisioning with PowerShell script: /var/folders/15/d0f7gdg13rnd1cxp7tgmr55c0000gn/T/packer-powershell-provisioner961728919
    amazon-ebs: The dollar in the elevated_password is interpreted correctly
==> amazon-ebs: Provisioning with Powershell...
==> amazon-ebs: Provisioning with PowerShell script: /var/folders/15/d0f7gdg13rnd1cxp7tgmr55c0000gn/T/packer-powershell-provisioner142826554
    amazon-ebs: In the following examples the special character is interpreted correctly:
    amazon-ebs: The dollar in VAR1:                            A$Dollar
    amazon-ebs: The backtick in VAR2:                          A`Backtick
    amazon-ebs: The single quote in VAR3:                      A'SingleQuote
    amazon-ebs: The double quote in VAR4:                      A"DoubleQuote
    amazon-ebs: The dollar in VAR5 (expanded from a user var): My$tring
```
