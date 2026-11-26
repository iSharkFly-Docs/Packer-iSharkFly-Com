---
description: |
  `shell` Packer 配置器在 Packer 构建的机器上运行 shell 脚本。使用 `shell` 配置器在机器上安装和配置软件。
title: shell 配置器参考
---

<Badge type="tip" text="Official" />

# `shell` 配置器

`shell` Packer 配置器在 Packer 构建的机器上运行 shell 脚本。使用 `shell` 配置器在机器上安装和配置软件。

::: info
**正在构建 Windows 镜像？** 你可能想使用 [PowerShell](/docs/provisioners/powershell) 或 [Windows Shell](/docs/provisioners/windows-shell) 配置器。
:::

## 基本示例

下面的示例是完全可用的。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell" {
    inline = ["echo foo"]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell",
  "inline": ["echo foo"]
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

- `env` (map of strings) - 在 execute_command 之前注入的键/值对映射。Packer 也会默认向环境中注入一些环境变量，这些在下面的部分中介绍。重复的 `env` 设置会覆盖 `environment_vars` 设置。

- `environment_vars` (array of strings) - 在 execute_command 之前注入的键/值对数组。格式应为 `key=value`。Packer 也会默认向环境中注入一些环境变量，这些在下面的部分中介绍。

- `env_var_format` (string) - 当我们解析你提供的 environment_vars 时，这给我们一个字符串模板来确保我们正确设置环境变量。默认为 `"%s='%s' "`。与 `use_env_var_file` 一起使用时默认为 `"export %s='%s'\n"`

- `use_env_var_file` (boolean) - 如果为 true，Packer 将把你的环境变量写入临时文件并从该文件中引用它们，而不是在我们的 execute_command 中内联声明它们。默认的 `execute_command` 将是 `chmod +x {{.Path}}; . {{.EnvVarFile}} && {{.Path}}`。对于大多数情况，此选项是不必要的，但如果你的自定义 `execute_command` 中有额外的引号，则可能需要它才能正确执行脚本。默认：`false`。

- `execute_command` (string) - 用于执行脚本的命令。默认为 `chmod +x {{ .Path }}; {{ .Vars }} {{ .Path }}`，除非用户设置了 `"use_env_var_file": true` -- 在这种情况下，默认的 `execute_command` 是 `chmod +x {{.Path}}; . {{.EnvVarFile}} && {{.Path}}`。这是一个[模板引擎](/docs/templates/legacy_json_templates/engine)。因此，你可以在此字段中使用用户变量和模板函数。此外，还有三个可用的额外变量：

  - `Path` 是要运行的脚本的路径
  - `Vars` 是 `environment_vars` 的列表（如果已配置）。
  - `EnvVarFile` 是包含环境变量的文件路径（如果 `use_env_var_file` 为 true）。

- `expect_disconnect` (boolean) - 默认为 `false`。当为 `true` 时，允许服务器断开与 Packer 的连接而不抛出错误。如果你重启 SSH 服务器或重启主机，可能会发生断开连接。

- `inline_shebang` (string) - 运行由 `inline` 指定的命令时使用的 [shebang](https://en.wikipedia.org/wiki/Shebang_%28Unix%29) 值。默认为 `/bin/sh -e`。如果你不使用 `inline`，则此配置无效。**重要：** 如果你自定义此值，请确保包含类似 `-e` 标志的内容，否则单个步骤的失败不会导致配置器失败。

- `remote_folder` (string) - 上传脚本将驻留在机器上的文件夹。默认为 `/tmp`。

- `remote_file` (string) - 上传脚本在机器上的文件名。默认为 `script_nnn.sh`。

- `remote_path` (string) - 上传脚本在机器上的完整路径。默认情况下这是 `remote_folder/remote_file`，如果设置此选项将覆盖 `remote_folder` 和 `remote_file`。

- `skip_clean` (boolean) - 如果为 true，指定 Packer 不会从系统中删除上传的辅助脚本。默认为 `false`（从系统中清理脚本）。

- `start_retry_timeout` (string) - 尝试_启动_远程进程的时间量。默认为 `5m` 或 5 分钟。此设置存在是为了处理 SSH 可能重启的情况，例如系统重启。如果重启需要更长时间，请将此设置为更高的值。

- `pause_after` (string) - 配置 shell 脚本后等待的时间量，如果所有先前步骤都成功，则会进行此暂停。

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

## Execute Command 示例

对于许多新用户来说，`execute_command` 令人困惑。然而，它提供了一个重要的功能：自定义命令的执行方式。最常见的用例是处理 **sudo 密码提示**。如果你使用非 POSIX shell，如 FreeBSD 上的 `tcsh`，你可能也需要自定义这个。

### Sudo 示例

一些操作系统默认使用非 root 用户。例如，如果你以 `ubuntu` 登录并可以使用密码 `packer` 进行 sudo，那么你需要将 `execute_command` 更改为：

```txt
"echo 'packer' | sudo -S sh -c '{{ .Vars }} {{ .Path }}'"
```

`-S` 标志告诉 `sudo` 从 stdin 读取密码，在本例中通过管道传入值 `packer`。

如果你的环境变量包含空格或单引号，上述示例将不起作用；在这些情况下，请尝试删除单引号：

```txt
"echo 'packer' | sudo -S env {{ .Vars }} {{ .Path }}"
```

通过将 `execute_command` 设置为此，你的脚本可以以 root 权限运行而无需担心密码提示。

### FreeBSD 示例

FreeBSD 的默认 shell 是 `tcsh`，它偏离了 POSIX 语义。为了让 packer 传递环境变量，你需要将 `execute_command` 更改为：

```txt
chmod +x {{ .Path }}; env {{ .Vars }} {{ .Path }}
```

注意在 `{{ .Vars }}` 之前添加了 `env`。

## 默认环境变量

除了能够使用 `environment_vars` 配置指定自定义环境变量外，配置器还会自动定义某些常用的环境变量：

- `PACKER_BUILD_NAME` 设置为 Packer 正在运行的[构建名称](/docs/templates/legacy_json_templates/builders#named-builds)。当 Packer 进行多个构建并且你想从通用配置脚本中稍微区分它们时，这最有用。

- `PACKER_BUILDER_TYPE` 是用于创建脚本正在运行的机器的构建器类型。如果你只想在使用某些构建器构建的系统上运行脚本的某些部分，这很有用。

- `PACKER_HTTP_ADDR` 如果使用提供 HTTP 服务器进行文件传输的构建器（如 `hyperv`、`parallels`、`qemu`、`virtualbox` 和 `vmware`），这将设置为地址。你可以在配置器中使用此地址通过 HTTP 下载大文件。如果你使用默认 file 配置器时遇到速度较慢的问题，这可能很有用。使用 `winrm` 通信器的 file 配置器可能会遇到这类困难。

## 处理重启

配置有时涉及重启，通常是在更新操作系统时。Packer 能够通过 shell 配置器容忍重启。

Packer 通过在失败前重试启动脚本一段时间来处理这个问题。这允许机器有时间启动并准备好运行脚本。配置器等待的时间量使用 `start_retry_timeout` 配置，默认为几分钟。

有时，当执行像 `reboot` 这样的命令时，shell 脚本会返回，Packer 会在 SSH 实际退出和机器重启之前开始执行下一个脚本。为此，使用 `pause_before` 让 Packer 在执行下一个脚本之前等待：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell" {
  script       = "script.sh"
  pause_before = "10s"
  timeout      = "10s"
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell",
  "script": "script.sh",
  "pause_before": "10s",
  "timeout": "10s"
}
```

</TabItem>

</Tabs>

某些操作系统配置在重启时不会正确终止所有网络连接，导致配置器挂起，尽管重启正在进行。在这种情况下，请确保在重启时或在 shell 脚本中关闭网络接口。例如，在 Gentoo 上：

```txt
/etc/init.d/net.eth0 stop
```

## SSH 代理转发

某些配置需要从 packer 实例内部连接到远程 SSH 服务器。下面的示例是使用客户端上的 openssh 从私有 git 仓库拉取代码。确保你正在运行 `ssh-agent` 并使用 `ssh-add /path/to/key` 将你的 git 仓库 SSH 密钥添加到其中。当 Packer 实例需要访问 SSH 密钥时，代理会将请求转发回你的 `ssh-agent`。

注意：通过 git 配置时，你应该将 git 服务器密钥添加到 `~/.ssh/known_hosts` 文件中，否则 git 命令可能会挂起等待输入。这可以通过 [file 配置器](/docs/provisioners/file)复制文件来完成（更安全）或使用 `ssh-keyscan` 填充文件（不太安全）。后者访问 github 的示例如下：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell" {
  inline = [
    "sudo apt-get install -y git",
    "ssh-keyscan github.com >> ~/.ssh/known_hosts",
    "git clone git@github.com:exampleorg/myprivaterepo.git"
  ]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell",
  "inline": [
    "sudo apt-get install -y git",
    "ssh-keyscan github.com >> ~/.ssh/known_hosts",
    "git clone git@github.com:exampleorg/myprivaterepo.git"
  ]
}
```

</TabItem>

</Tabs>

## 故障排除

_我的 shell 脚本在 Ubuntu 上不能正确工作_

- 在 Ubuntu 上，`/bin/sh` shell 是 [dash](https://en.wikipedia.org/wiki/Debian_Almquist_shell)。如果你的脚本包含 [bash](<https://en.wikipedia.org/wiki/Bash_(Unix_shell)>) 特定的命令，请在脚本顶部放置 `#!/bin/bash -e`。dash 和 bash 之间的差异可以在 Ubuntu wiki 页面 [DashAsBinSh](https://wiki.ubuntu.com/DashAsBinSh) 上找到。

_我的 shell 在登录时工作但在 shell 配置器中失败_

- 请参阅上面的提示。很可能，你的登录 shell 使用 `/bin/bash` 而配置器使用 `/bin/sh`。

_使用 `apt-get` 或 `yum` 时我的安装挂起_

- 确保在命令中添加 `-y` 以防止它在继续之前需要用户输入。

_如何知道我的 shell 脚本正在做什么？_

- 在脚本顶部的 shebang 中添加 `-x` 标志（`#!/bin/sh -x`）将在执行时回显脚本语句。

_我的构建不总是以相同的方式工作_

- 某些发行版在其他核心服务之前启动 SSH 守护程序，这可能会创建竞争条件。你的第一个配置器可以告诉机器等待直到它完全启动。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell" {
  inline = ["sleep 10"]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "shell",
  "inline": ["sleep 10"]
}
```

</TabItem>

</Tabs>

## 引用环境变量

Packer 为你管理引号，所以你不必担心它。下面是 Packer 模板输入的示例以及你应该期望得到的输出：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "shell" {
  environment_vars = [
    "FOO=foo",
    "BAR=bar's",
    "BAZ=baz=baz",
    "QUX==qux",
    "FOOBAR=foo bar",
    "FOOBARBAZ='foo bar baz'",
    "QUX2=\"qux\""
  ]
  inline = [
    "echo \"FOO is $FOO\"",
    "echo \"BAR is $BAR\"",
    "echo \"BAZ is $BAZ\"",
    "echo \"QUX is $QUX\"",
    "echo \"FOOBAR is $FOOBAR\"",
    "echo \"FOOBARBAZ is $FOOBARBAZ\"",
    "echo \"QUX2 is $QUX2\""
  ]
}
```

</TabItem>

<TabItem value="t1">

```json
"provisioners": [
  {
    "type":  "shell",
    "environment_vars": ["FOO=foo",
                         "BAR=bar's",
                         "BAZ=baz=baz",
                         "QUX==qux",
                         "FOOBAR=foo bar",
                         "FOOBARBAZ='foo bar baz'",
                         "QUX2=\"qux\""],
    "inline": ["echo \"FOO is $FOO\"",
               "echo \"BAR is $BAR\"",
               "echo \"BAZ is $BAZ\"",
               "echo \"QUX is $QUX\"",
               "echo \"FOOBAR is $FOOBAR\"",
               "echo \"FOOBARBAZ is $FOOBARBAZ\"",
               "echo \"QUX2 is $QUX2\""]
  }
]
```

</TabItem>

</Tabs>

输出：

```txt
docker: FOO is foo
docker: BAR is bar's
docker: BAZ is baz=baz
docker: QUX is =qux
docker: FOOBAR is foo bar
docker: FOOBARBAZ is 'foo bar baz'
docker: QUX2 is "qux"
```
