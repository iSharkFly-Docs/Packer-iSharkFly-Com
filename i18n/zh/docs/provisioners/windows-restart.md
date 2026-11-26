---
description: |
  `windows-restart` 配置器重启 Windows 机器并等待它重新上线。了解如何使用 `windows-restart` 配置器。
title: windows-restart 配置器参考
---

<Badge type="tip" text="Official" />

# `windows-restart` 配置器

`windows-restart` 配置器启动 Windows 机器的重启并等待机器重新上线。

Windows 配置过程通常需要多次重启，此配置器有助于简化该过程。

Packer 期望机器在重启后准备好继续配置。Packer 通过 Windows 远程管理 (WinRM) 服务进行 RPC 调用来检测重启是否完成，而不是通过 ACPI 功能，因此 Windows 必须完全启动才能继续。

## 基本示例

下面的示例是完全可用的。

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

## 配置参考

下面列出了可用配置选项的参考。

可选参数：

- `check_registry` (bool) - 如果为 `true`，则检查几个表示系统将要重启的注册表键。如果安装启动了重启并且你希望配置器在重新连接之前等待该重启完成，这很有用。请注意，此选项是测试版功能，我们通常建议你在 `winrm` 配置器连接之前在 _autounattend_ 阶段完成自动重启的安装（如 Windows 更新）。

- `registry_keys` (array of strings) - 如果 `check-registry` 为 `true`，`windows-restart` 在所有列出的键不再存在于注册表中之后才会重新连接。

```
  默认值：

      var DefaultRegistryKeys = []string{
        "HKLM:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Component Based Servicing\\RebootPending",
        "HKLM:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Component Based Servicing\\PackagesPending",
        "HKLM:Software\\Microsoft\\Windows\\CurrentVersion\\Component Based Servicing\\RebootInProgress",
      }
```

- `restart_command` (string) - 执行以启动重启的命令。默认为 `shutdown /r /f /t 0 /c "packer restart"`。

- `restart_check_command` (string) - 执行 `restart_command` 后运行以检查客户机是否已重启的命令。此命令将重试直到与客户机的连接恢复或 `restart_timeout` 超时。

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

- `restart_timeout` (string) - 等待重启的超时时间。默认为 5 分钟。示例值：`5m`。如果你正在安装更新或有很多启动服务，你可能需要增加此持续时间。

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
