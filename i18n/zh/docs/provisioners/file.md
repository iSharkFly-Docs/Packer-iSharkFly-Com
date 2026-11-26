---
description: |
  `file` Packer 配置器将文件上传到由 Packer 构建的机器。了解如何使用 `file` 配置器以及 Packer 配置器工作流程。
title: file 配置器参考
---

<Badge type="tip" text="Official" />

# `file` 配置器

`file` Packer 配置器将文件上传到由 Packer 构建的机器。我们建议实施以下工作流程：

1. 使用 `file` 配置器上传文件
1. 使用 [`shell` 配置器](/docs/provisioners/shell)将文件移动到正确的位置、设置权限并执行其他任务。

你只能将文件上传到配置用户（通常不是 root）有权访问的位置。在 /tmp 中创建文件并使用 shell 配置器将它们移动到最终位置是将文件上传到 root 拥有位置的唯一方法。

file 配置器可以上传单个文件和完整目录。

## 基本示例

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "file" {
  source = "app.tar.gz"
  destination = "/tmp/app.tar.gz"
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "file",
  "source": "app.tar.gz",
  "destination": "/tmp/app.tar.gz"
}
```

</TabItem>

</Tabs>

## 配置参考

下面列出了可用的配置选项。

## 配置参考

必需参数：

- `content` (string) - 这是要复制到 `destination` 的内容。如果目标是文件，内容将写入该文件，如果是目录，则创建名为 `pkr-file-content` 的文件。建议使用文件作为目标。这里可以使用 `templatefile` 函数或任何插值语法。此属性不能与 source 或 sources 一起指定。

- `source` (string) - 要上传到机器的本地文件或目录的路径。路径可以是绝对路径或相对路径。如果是相对路径，则相对于 Packer 执行时的工作目录。如果这是一个目录，则尾部斜杠的存在很重要。阅读下面的上传目录部分。除非设置了 `sources`，否则是必需的。

- `destination` (string) - 文件将上传到机器中的路径。此值必须是可写位置，并且任何父目录必须已存在。如果配置用户（通常不是 root）无法写入此目录，你将收到"Permission Denied"错误。如果源是文件，最好也将目标设为文件，但如果你将目标设置为目录，请确保目标以尾部斜杠结尾，以便 Packer 知道在最终上传路径中使用源的基本名称。不这样做可能导致 Packer 在文件上传时失败。如果目标文件已存在，它将被覆盖。

<!-- End of code generated from the comments of the Config struct in provisioner/file/provisioner.go; -->

可选参数：

- `sources` ([]string) - 要上传的源列表。如果你有多个文件要上传到同一位置，可以使用此选项代替 `source` 选项。请注意，目标必须是带有尾部斜杠的目录，并且 `sources` 中列出的所有文件将上传到同一目录，文件名保持不变。

- `direction` (string) - 文件传输的方向。默认为"upload"。如果设置为"download"，则机器中的"source"文件将下载到本地"destination"。

- `generated` (bool) - 仅供高级用户使用。如果为 true，则仅在上传前检查文件是否存在，而不是在预构建验证时检查。这允许用户上传动态创建的文件。默认为 false。我们不建议使用此功能，因为它可能导致 Packer 依赖于系统状态。我们希望你在 Packer 运行之前生成文件，但认识到在某些情况下这可能无法避免。

<!-- End of code generated from the comments of the Config struct in provisioner/file/provisioner.go; -->

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

## 目录上传

file 配置器还能够将完整目录上传到远程机器。上传目录时，有几件重要的事情你应该知道。

首先，目标目录必须已存在。如果你需要创建它，请在 file 配置器之前使用 shell 配置器来创建目录。如果目标目录不存在，file 配置器可能会成功，但结果是未定义的。

其次，源路径上是否存在尾部斜杠将决定目录名称是否嵌入在目标中，或者是否创建目标。一个例子最能说明这一点：

如果源是 `/foo`（没有尾部斜杠），目标是 `/tmp`，那么本地机器上 `/foo` 的内容将上传到远程机器上的 `/tmp/foo`。远程机器上的 `foo` 目录将由 Packer 创建。

但是，如果源是 `/foo/`（有尾部斜杠），目标是 `/tmp`，那么 `/foo` 的内容将直接上传到 `/tmp` 中。

这种行为是从 rsync 的标准行为采用的。请注意，在底层，可能会也可能不会使用 rsync。

**注意：** Packer 不会根据客户操作系统推断行为，因为这会增加不必要的复杂性并降低可维护性。为确保所有平台上的行为一致，在指定目录时请使用尾部正斜杠，即使在使用 Windows 客户机时也是如此。

## 上传 Packer 启动前不存在的文件

通常，用作源的本地文件**必须**在 Packer 运行之前存在。这对于捕获拼写错误并确保一旦构建开始就会成功非常有用。但是，这也意味着你不能在构建期间生成文件，然后稍后使用 file 配置器上传它。一个方便的解决方法是上传目录而不是文件。目录仍然必须存在，但其内容不需要存在。你可以在 Packer 运行期间将生成的文件写入目录，并在稍后上传。

## 符号链接上传

上传符号链接时的行为取决于通信器。Docker 通信器将保留符号链接，但所有其他通信器将把本地符号链接视为常规文件。如果你希望在上传时保留符号链接，建议使用 `tar`。下面是一个示例：

```shellsession
$ ls -l files
total 16
drwxr-xr-x  3 mwhooker  staff  102 Jan 27 17:10 a
lrwxr-xr-x  1 mwhooker  staff    1 Jan 27 17:10 b -> a
-rw-r--r--  1 mwhooker  staff    0 Jan 27 17:10 file1
lrwxr-xr-x  1 mwhooker  staff    5 Jan 27 17:10 file1link -> file1
$ ls -l toupload
total 0
-rw-r--r--  1 mwhooker  staff    0 Jan 27 17:10 files.tar
```

<Tabs groupId="template-format" :tabs="[{label:'JSON',value:'t0'},{label:'HCL2',value:'t1'}]">

<TabItem value="t0">

```json
{
  "provisioners": [
    {
      "type": "shell-local",
      "command": "tar cf toupload/files.tar files"
    },
    {
      "destination": "/tmp/",
      "source": "./toupload",
      "type": "file"
    },
    {
      "inline": [
        "cd /tmp && tar xf toupload/files.tar",
        "rm toupload/files.tar"
      ],
      "type": "shell"
    }
  ]
}
```

</TabItem>

<TabItem value="t1">

```hcl
build {
  sources = [
    "source.docker.example"
  ]

  provisioner "shell-local" {
    command = "tar cf toupload/files.tar files"
  }
  provisioner "file" {
    destination = "/tmp/"
    source      = "./toupload"
  }
  provisioner "shell" {
    inline = [
      "cd /tmp && tar xf toupload/files.tar",
      "rm toupload/files.tar"
    ]
  }
}
```

</TabItem>

</Tabs>

## 通过 WinRM 传输大文件时速度慢

由于我们的 WinRM 传输工作方式，上传和下载即使是中等大小的文件也可能需要很长时间。如果你在 Windows 上使用 file 配置器时遇到速度慢的问题，建议你设置 SSH 服务器并使用 [ssh 通信器](/docs/communicators/ssh)。如果你只想将文件传输到客户机，并且你的构建器支持，你也可以使用 `http_directory` 或 `http_content` 指令。这将导致该目录通过 HTTP 对客户机可用，并将环境变量 `PACKER_HTTP_ADDR` 设置为地址。
