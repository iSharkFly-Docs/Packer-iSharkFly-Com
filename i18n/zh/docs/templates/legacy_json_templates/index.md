---
description: >
  JSON 模板是配置 Packer 组件以创建一个或多个机器镜像的文件。了解如何配置 JSON 模板。
title: JSON 模板配置参考
---

# JSON 模板配置参考

本文提供为 Packer 创建 JSON 模板的参考信息。

::: info
**注意：** 本页面是关于旧式 JSON Packer 模板的。Packer 核心仍然支持 JSON 模板，但添加到 Packer 核心的新功能可能不会为 JSON 模板实现。我们建议你尽快过渡到 HCL 模板，以获得 Packer 的最佳体验。为了帮助你升级模板，我们编写了一个 [hcl2_upgrade 命令](/docs/commands/hcl2_upgrade)。
:::

## 简介

你可以将 Packer 模板创建为 JSON 文件，以配置 Packer 的各个组件来创建一个或多个机器镜像。模板是可移植的、静态的，并且可由人和计算机读写。使用 Packer CLI 运行模板中描述的构建以生成任何生成的机器镜像。

## JSON 模板结构

模板是一个 JSON 对象，它有一组配置 Packer 各个组件的键。模板中可用的键如下所列。每个键都会注明它是必需的还是可选的。

- `builders`（_必需_）是一个或多个对象的数组，定义将用于为此模板创建机器镜像的构建器，并配置每个构建器。有关如何定义和配置构建器的更多信息，请阅读[在模板中配置构建器](/docs/templates/legacy_json_templates/builders)子部分。

- `description`（可选）是一个字符串，提供模板功能的描述。此输出仅用于 [inspect 命令](/docs/commands/inspect)。

- `min_packer_version`（可选）是一个字符串，指定解析模板所需的最低 Packer 版本。这可用于确保使用适当版本的 Packer 与模板一起使用。无法指定最大版本，因为 Packer 通过 `packer fix` 保持向后兼容性。

- `post-processors`（可选）是一个或多个对象的数组，定义对构建的镜像执行的各种后处理步骤。如果未指定，则不会进行后处理。有关后处理器做什么以及如何定义它们的更多信息，请阅读[在模板中配置后处理器](/docs/templates/legacy_json_templates/post-processors)子部分。

- `provisioners`（可选）是一个或多个对象的数组，定义将用于为每个构建器创建的机器安装和配置软件的配置器。如果未指定，则不会运行任何配置器。有关如何定义和配置配置器的更多信息，请阅读[在模板中配置配置器](/docs/templates/legacy_json_templates/provisioners)子部分。

- `variables`（可选）是一个或多个键/值字符串的对象，定义模板中包含的用户变量。如果未指定，则不定义任何变量。有关如何定义和使用用户变量的更多信息，请阅读[模板中的用户变量](/docs/templates/legacy_json_templates/user-variables)子部分。

## 注释

JSON 不支持注释，Packer 将未知键报告为验证错误。如果你想注释模板，可以在 _根级别_ 键前加下划线。示例：

```json
{
  "_comment": "This is a comment",
  "builders": [{}]
}
```

**重要：** 只有 _根级别_ 键可以加下划线前缀。构建器、配置器等中的键仍然会导致验证错误。

::: info
**注意：** Packer 从 1.6.0 版本开始支持 HCL2。HashiCorp 配置语言确实支持在模板文件中的任何位置添加注释。如果注释对你很重要，请考虑使用 `packer hcl2_upgrade` 命令将你的 JSON 模板升级到 HCL2。
:::

如果你还没准备好升级到 HCL，一种解决方法是在运行 `packer build` 之前使用 jq 从 Packer 模板中去除不支持的注释。

例如，这是一个名为 `commented_template.json` 的文件：

```json
{
  "_comment": ["this is", "a multi-line", "comment"],
  "builders": [
    {
      "_comment": "this is a comment inside a builder",
      "type": "null",
      "communicator": "none"
    }
  ],
  "_comment": "this is a root level comment",
  "provisioners": [
    {
      "_comment": "this is a different comment",
      "type": "shell",
      "_comment": "this is yet another comment",
      "inline": ["echo hellooooo"]
    }
  ]
}
```

如果你使用以下 jq 命令：

```shellsession
$ jq 'walk(if type == "object" then del(._comment) else . end)' commented_template.json > uncommented_template.json
```

该工具将生成一个包含以下内容的新文件：

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
      "type": "shell",
      "inline": ["echo hellooooo"]
    }
  ]
}
```

一旦你有了未注释的文件，你就可以像平常一样对它调用 `packer build`。

如果你安装的 jq 没有 walk 函数并且你收到如下错误：

```txt
jq: error: walk/1 is not defined at <top-level>,
```

你可以创建一个文件 `~/.jq` 并手动添加 [walk 函数](https://github.com/stedolan/jq/blob/ad9fc9f559e78a764aac20f669f23cdd020cd943/src/builtin.jq#L255-L262)。

## 示例模板

下面是一个基本模板的示例，可以使用 `packer build` 调用。它将在 AWS 中创建一个实例，一旦运行就复制一个脚本到它并使用 SSH 运行该脚本。

::: info
**注意：** 此示例需要一个 Amazon Web Services 账户。有许多参数需要提供才能进行功能构建。有关更多信息，请参阅 [Amazon 构建器](https://developer.hashicorp.com/packer/plugins/builders/amazon)文档。
:::

```json
{
  "builders": [
    {
      "type": "amazon-ebs",
      "access_key": "...",
      "secret_key": "...",
      "region": "us-east-1",
      "source_ami": "ami-fce3c696",
      "instance_type": "t2.micro",
      "ssh_username": "ubuntu",
      "ami_name": "packer {{timestamp}}"
    }
  ],

  "provisioners": [
    {
      "type": "shell",
      "script": "setup_things.sh"
    }
  ]
}
```
