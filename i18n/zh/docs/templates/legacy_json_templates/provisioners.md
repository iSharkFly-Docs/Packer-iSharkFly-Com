---
description: |
  `provisioners` 块包含 Packer 用于在机器上安装和配置软件的配置器。了解如何在 JSON 模板中配置配置器。
title: JSON 模板的 provisioners 参考
---

# JSON 模板的 `provisioners` 参考

本文提供关于 Packer JSON 模板中 `provisioners` 块的参考信息。有关特定配置器类型的配置选项，请参阅相关文档。

::: info
**注意：** 本页面是关于旧式 JSON Packer 模板的。Packer 核心仍然支持 JSON 模板，但添加到 Packer 核心的新功能可能不会为 JSON 模板实现。我们建议你尽快过渡到 HCL 模板，以获得 Packer 的最佳体验。为了帮助你升级模板，我们编写了一个 [hcl2_upgrade 命令](/docs/commands/hcl2_upgrade)。
:::

## 描述

`provisioners` 块包含 Packer 用于在将运行的机器转换为机器镜像之前安装和配置其中软件的配置器。

配置器是可选的。当你省略 `provisioners` 块时，Packer 只在生成的机器镜像中安装默认软件。

使用以下语法将 `provisioners` 块添加到你的 JSON 模板：

```json
{
  "provisioners": [
    // ... 这里是一个或多个配置器定义
  ]
}
```

对于每个定义，Packer 将为每个配置的构建运行配置器。配置器将按照它们在模板中定义的顺序运行。

## 配置器定义

配置器定义是一个 JSON 对象，至少必须包含 `type` 键。此键指定要使用的配置器的名称。对象中的其他键用于配置配置器，除了少数特殊键之外，稍后会介绍。

例如，"shell" 配置器需要一个如 `script` 的键，它指定要在正在创建的机器中执行的 shell 脚本的路径。

下面显示了一个示例配置器定义，配置 shell 配置器在机器中运行本地脚本：

```json
{
  "type": "shell",
  "script": "script.sh"
}
```

## 在特定构建上运行

你可以使用 `only` 或 `except` 配置来仅在特定构建上运行配置器。这两个配置做你期望的事情：`only` 将只在指定的构建上运行配置器，`except` 将在除指定构建之外的任何构建上运行配置器。

下面显示了使用 `only` 的示例，但 `except` 的用法实际上是相同的：

```json
{
  "type": "shell",
  "script": "script.sh",
  "only": ["virtualbox-iso"]
}
```

`only` 或 `except` 中的值是 _构建名称_，而不是构建器类型。如果你还记得，构建名称默认只是它们的构建器类型，但如果你指定了自定义 `name` 参数，那么你应该使用该值而不是类型。
`except` 中的值也可以是 _后处理器_ 名称。

## 错误时配置器

你可以选择创建一个称为 `error-cleanup-provisioner` 的单个专门配置器字段。除非正常配置运行失败，否则此配置器不会运行。如果正常配置运行确实失败，这个特殊的错误配置器将在 _实例关闭之前_ 运行。这允许你进行最后一刻的更改和清理行为，而 Packer 可能无法自行清理。

例如，用户可能使用此配置器来确保实例正确地从在构建运行期间连接到的任何服务取消订阅。

错误清理脚本的玩具用法示例：

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
      "inline": ["exit 2"]
    }
  ],
  "error-cleanup-provisioner": {
    "type": "shell-local",
    "inline": ["echo 'rubber ducky'> ducky.txt"]
  }
}
```

## 构建特定覆盖

虽然 Packer 的目标是生成相同的机器镜像，但有时需要一段时间机器是不同的，然后最终收敛到相同。在这些情况下，根据构建可能需要不同的配置器配置。这可以通过使用构建特定覆盖来完成。

这可能需要的一个示例是同时构建 EC2 AMI 和 VMware 机器。源 EC2 AMI 可能默认设置具有管理权限的用户，而 VMware 机器没有这些权限。在这种情况下，shell 脚本可能需要以不同方式执行。当然，目标是希望 shell 脚本使这两个镜像收敛到相同。但是，它们最初可能需要以不同方式运行。

此示例如下所示：

```json
{
  "type": "shell",
  "script": "script.sh",
  "override": {
    "vmware-iso": {
      "execute_command": "echo 'password' | sudo -S bash {{.Path}}"
    }
  }
}
```

如你所见，使用了 `override` 键。此键的值是另一个 JSON 对象，其中键是[构建器定义](/docs/templates/legacy_json_templates/builders)的名称。这反过来又是另一个 JSON 对象。这个 JSON 对象只是像正常一样包含配置器配置。此配置合并到默认配置器配置中。

## 运行前暂停

对于某些配置器，有时需要在运行之前暂停一段时间。特别是，在配置器重启机器的情况下，你可能希望在启动下一个配置器之前等待一段时间。

Packer 模板中的每个配置器定义都可以采用特殊配置 `pause_before`，即在运行该配置器之前暂停的时间量。默认情况下，没有暂停。示例如下所示：

```json
{
  "type": "shell",
  "script": "script.sh",
  "pause_before": "10s"
}
```

对于上述配置器，Packer 将在上传和执行 shell 脚本之前等待 10 秒。

## 错误时重试

对于某些配置器，有时需要在失败时重试。特别是，在配置器依赖于尚未完成的外部进程的情况下。

Packer 模板中的每个配置器定义都可以采用特殊配置 `max_retries`，即配置器错误时的最大重试次数。默认情况下，`max_retries` 为零，不会在错误时重试。示例如下所示：

```json
{
  "type": "shell",
  "script": "script.sh",
  "max_retries": 5
}
```

对于上述配置器，Packer 将最多重试五次直到停止失败。如果五次重试后配置器仍然失败，则整个构建将失败。

## 超时

有时命令可能比预期花费更多的时间

Packer 模板中的每个配置器定义都可以采用特殊配置 `timeout`，即在认为配置器失败之前等待的时间量。默认情况下，没有超时。示例如下所示：

```json
{
  "type": "shell",
  "script": "script.sh",
  "timeout": "5m"
}
```

对于上述配置器，如果脚本超过 5 分钟，Packer 将取消脚本。

超时在调试模式下无效。
