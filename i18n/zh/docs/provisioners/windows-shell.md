---
description: |
  `windows-shell` 配置器使用 `cmd` shell 在 Windows 上运行命令。了解如何使用 `windows-shell` 配置器。
title: windows-shell 配置器参考
---

<Badge type="tip" text="Official" />

# `windows-shell` 配置器

`windows-shell` Packer 配置器使用 `cmd` 在 Windows 机器上运行命令。该配置器设计用于与运行 WinRM 的机器通信。

## 基本示例

下面的示例是完全可用的。

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

- `execute_command` (string) - 用于执行脚本的命令。默认为 `{{ .Vars }}"{{ .Path }}"`。此值被视为[模板引擎](/docs/templates/legacy_json_templates/engine)。这是一个[模板引擎](/docs/templates/legacy_json_templates/engine)。因此，你可以在此字段中使用用户变量和模板函数。此外，还有两个可用的额外变量：

  - `Path` 是要运行的脚本的路径
  - `Vars` 是 `environment_vars` 的列表（如果已配置）。

- `remote_path` (string) - 脚本将上传到机器中的路径。默认为"c:/Windows/Temp/script.bat"。此值必须是可写位置，并且任何父目录必须已存在。

- `start_retry_timeout` (string) - 尝试_启动_远程进程的时间量。默认为"5m"或 5 分钟。此设置存在是为了处理 SSH 可能重启的情况，例如系统重启。如果重启需要更长时间，请将此设置为更高的值。

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
