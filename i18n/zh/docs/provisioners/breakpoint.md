---
description: >
  `breakpoint` 配置器暂停构建直到你按 Enter 键。使用 `breakpoint` 配置器帮助你调试错误。
title: breakpoint 配置器参考
---

<Badge type="tip" text="Official" />

# `breakpoint` 配置器

`breakpoint` 配置器暂停构建操作，直到你按 Enter 键恢复构建。使用 `breakpoint` 配置器帮助你调试错误。

或者，你可以在运行构建时添加 [`-debug` 标志](/docs/commands/build#debug)，以在每一步和每个配置器之间暂停操作。

## 基本示例

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
source "null" "example" {
  communicator = "none"
}

build {
  sources = ["source.null.example"]

  provisioner "shell-local" {
    inline = ["echo hi"]
  }
  provisioner "breakpoint" {
    disable = false
    note    = "this is a breakpoint"
  }
  provisioner "shell-local" {
    inline = ["echo hi 2"]
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
      "inline": "echo hi"
    },
    {
      "type": "breakpoint",
      "disable": false,
      "note": "this is a breakpoint"
    },
    {
      "type": "shell-local",
      "inline": "echo hi 2"
    }
  ]
}
```

</TabItem>

</Tabs>

## 配置参考

### 可选

- `disable` (boolean) - 如果为 `true`，则跳过断点。当你设置了多个断点并想要切换它们的开关时很有用。默认值：`false`

- `note` (string) - 包含解释断点目的或位置的字符串。例如，你可能会发现对断点编号或用关于它们在构建中发生位置的信息标记它们很有用。

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

## 用法

在你想要构建暂停的任何位置插入此配置器。当你准备好时，你将看到 UI 输出提示你按"enter"继续构建。

例如：

```shellsession
==> docker: Pausing at breakpoint provisioner with note "foo bar baz".
==> docker: Press enter to continue.
```

一旦你按 enter，构建将恢复并正常运行，直到完成或出错。
