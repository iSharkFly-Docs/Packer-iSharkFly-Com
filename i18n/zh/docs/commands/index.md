---
description: |
  Packer 命令行界面让你可以执行 Packer 操作。使用 `packer` CLI 命令配合子命令、标志和选项来构建和管理制品以及安装和管理插件。
title: Packer 命令概述
---

# Packer 命令概述

Packer 通过命令行界面进行控制。与 Packer 的所有交互都通过 `packer` 工具完成。与许多其他命令行工具一样，`packer` 工具接受一个要执行的子命令，该子命令可能还有额外的选项。子命令通过 `packer SUBCOMMAND` 执行，其中 "SUBCOMMAND" 是你希望执行的实际命令。

如果你单独运行 `packer`，将显示帮助信息，列出所有可用的子命令及其简要说明。除此之外，你可以使用 `-h` 标志运行任何 `packer` 命令，以获取特定子命令的更详细帮助。

文档包含每个子命令的信息。

## 机器可读输出

默认情况下，Packer 的输出非常易于人类阅读。它使用良好的格式、间距和颜色，使 Packer 使用起来很愉快。然而，Packer 在设计时就考虑了自动化。为此，Packer 支持完全机器可读的输出设置，允许你在自动化环境中使用 Packer。

因为机器可读的输出格式是为 Unix 工具设计的，所以它对 `awk`/`sed`/`grep` 等工具很友好，提供了熟悉的接口，无需你学习新格式。

### 启用机器可读输出

可以通过向任何 Packer 命令传递 `-machine-readable` 标志来启用机器可读输出格式。这会立即使 stdout 上的所有输出变为机器可读。如果启用了日志记录，日志将继续出现在 stderr 上。输出示例如下：

```shellsession
$ packer -machine-readable version
1498365963,,version,1.0.2
1498365963,,version-prelease,
1498365963,,version-commit,3ead2750b+CHANGES
1498365963,,ui,say,Packer v1.0.2
```

格式将在后面详细介绍。但如你所见，输出立即变得对机器友好。尝试使用 `-machine-readable` 标志运行其他命令看看！

::: warning
`-machine-readable` 标志是为自动化环境设计的，与为交互式环境设计的 `-debug` 标志互斥。
:::

### 机器可读输出的格式

机器可读格式是面向行的、逗号分隔的文本格式。这使得除了 Ruby 或 Python 等完整编程语言外，使用标准 Unix 工具（如 `awk` 或 `grep`）解析也更加方便。

格式为：

```txt
timestamp,target,type,data...
```

每个组件解释如下：

- `timestamp` 是消息打印时的 Unix 时间戳（UTC）。

- `target` 当你调用 `packer build` 时，这可以是空的或单个构建名称，例如 `amazon-ebs`。当构建正在进行时通常为空，当引用特定构建的制品时为构建名称。

- `type` 是输出的机器可读消息的类型。两种最常见的 `type` 是 `ui` 和 `artifact`。

- `data` 是与前面类型相关联的零个或多个逗号分隔的值。此数据的确切数量和含义取决于类型，因此你必须阅读与该类型相关的文档才能完全理解。

在格式中，如果数据包含逗号，它会被替换为 `%!(PACKER_COMMA)`。这比使用转义字符（如 `\'`）更受欢迎，因为它对 `awk` 等工具更友好。

格式中的换行符被替换为各自的标准转义序列。换行符在输出中变为字面量 `\n`。回车符变为字面量 `\r`。

### 机器可读消息类型

以下是你可能在机器可读输出中看到的类型的不完整列表：

运行 `packer build` 时你会看到这些数据类型：

- `ui`：这意味着提供的信息是人类可读的字符串，即使我们不在机器可读模式下也会发送到 stdout。与此类型相关联的有三个"数据"子类型：

  - `say`：在非机器可读格式中，这将显示为粗体。通常用于宣布构建过程中新步骤的开始

  - `message`：最常用的消息类型，用于构建过程中的基本更新。

  - `error`：保留用于错误

- `artifact-count`：此数据类型告诉你特定构建产生了多少个制品。

- `artifact`：此数据类型告诉你 Packer 在构建期间创建的信息。输出示例遵循 `timestamp, buildname, artifact, artifact_number, key, value` 的模式，其中 `key` 和 `value` 包含关于制品的信息。

  例如：

  ```txt
    1539967803,,ui,say,\n==> Builds finished. The artifacts of successful builds are:
    1539967803,amazon-ebs,artifact-count,2
    1539967803,amazon-ebs,artifact,0,builder-id,mitchellh.amazonebs
    1539967803,amazon-ebs,artifact,0,id,eu-west-1:ami-04d23aca8bdd36e30
    1539967803,amazon-ebs,artifact,0,string,AMIs were created:\neu-west-1: ami-04d23aca8bdd36e30\n
    1539967803,amazon-ebs,artifact,0,files-count,0
    1539967803,amazon-ebs,artifact,0,end
    1539967803,,ui,say,--> amazon-ebs: AMIs were created:\neu-west-1: ami-04d23aca8bdd36e30\n
    1539967803,amazon-ebs,artifact,1,builder-id,
    1539967803,amazon-ebs,artifact,1,id,
    1539967803,amazon-ebs,artifact,1,string,
    1539967803,amazon-ebs,artifact,1,files-count,0
    2018/10/19 09:50:03 waiting for all plugin processes to complete...
    1539967803,amazon-ebs,artifact,1,end
  ```

运行 `packer version` 时你会看到这些数据类型：

- `version`：正在运行的 Packer 版本

- `version-prerelease`：如果版本是预发布版本，数据将包含 `dev`，否则为空。

- `version-commit`：Packer 当前所在分支的 git 哈希；对 Packer 开发者最有用。

## 自动补全

`packer` 命令具有可选的子命令自动补全功能，你可以使用 `packer -autocomplete-install` 为你的 shell 启用它。之后，你可以调用新的 shell 并使用该功能。

例如，假设在每个提示行的末尾输入了一个 tab：

```shellsession
$ packer p
plugin  build
$ packer build -
-color             -debug             -except            -force             -machine-readable  -on-error          -only              -parallel          -timestamp          -var               -var-file
```
