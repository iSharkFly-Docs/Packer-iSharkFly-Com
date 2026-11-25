---
description: |
  了解如何使用 `packer build`、日志和其他故障排除工具调试 Packer 构建和插件的问题。
title: 调试 Packer
---

# 调试 Packer 构建

使用 `packer build -on-error=ask` 可以让你检查失败并在重新启动构建之前尝试解决方案。

对于使用 Amazon Web Services AMI 等云提供商的远程构建，使用 `packer build -debug` 可以大大简化 Packer 构建的调试。这会禁用并行化并启用调试模式。

调试模式通知构建器它们应该输出调试信息。调试模式的确切行为由构建器决定。通常，构建器会在每个步骤之间停止，等待键盘输入后再继续。这将允许你检查状态等。

在调试模式下，一旦远程实例被实例化，Packer 会将临时私有 SSH 密钥作为 .pem 文件输出到当前目录。使用它你可以 `ssh -i <key.pem>` 进入远程构建实例，查看正在发生的情况以进行调试。密钥只会为基于云的构建器输出。临时密钥将在 Packer 运行结束清理时被删除。

对于本地构建器，当在构建之前设置了 `PACKER_LOG=1` 环境变量时，启动的 SSH 会话将在提供的详细信息中可见，你可以使用在初始化本地 VM 时关联的 kickstart 或 preseed 中定义的用户 ID 和密码连接到本地机器。

应该注意的是，`-on-error` 的一个选项是 `retry`，问题步骤的重试有局限性：

- Packer 正在构建的模板**不会**从文件重新加载。
- 构建器指定的资源**会**从文件重新加载。

请查看你的构建器的具体信息以确认其行为。

### Windows

从 Packer 0.8.1 开始，默认的 WinRM 通信器将输出远程桌面连接到实例的密码。这发生在实例启动后的几分钟暂停之后。注意，仍然会创建 .pem 密钥用于安全传输密码。Packer 在调试模式下会自动为你解密密码。

## 调试 Packer

有时会出现某些东西可能不能完全正常工作，或者看起来不能正常工作的问题。在这些情况下，查看 Packer 实际正在做什么的更多细节有时会有所帮助。

Packer 有详细的日志，可以通过将 `PACKER_LOG` 环境变量设置为除 `""`（空字符串）和 `"0"` 以外的任何值来启用，如 `PACKER_LOG=1 packer build <config.json>`。这将导致详细日志出现在 stderr 上。日志包含来自 Packer 以及正在使用的任何插件的日志消息。来自插件的日志消息以其应用程序名称为前缀。

请注意，由于 Packer 是高度并行化的，日志消息有时会乱序出现，特别是对于插件。在这种情况下，重要的是注意日志消息的时间戳以确定顺序。

除了简单地启用日志之外，你还可以设置 `PACKER_LOG_PATH` 以强制日志在启用日志记录时始终写入特定文件。请注意，即使设置了 `PACKER_LOG_PATH`，也必须设置 `PACKER_LOG` 才能启用任何日志记录。

### 调试插件

每个 Packer 插件都在单独的进程中运行，并通过套接字上的 RPC 进行通信，因此使用调试器不起作用（至少会很复杂）。

但是大多数 Packer 代码非常简单，打开 PACKER_LOG 后很容易跟踪。如果这不起作用，当你定位到问题时添加一些额外的调试打印输出通常就足够了。

### 在 Powershell/Windows 中调试 Packer

在 Windows 中，你可以使用 PowerShell 环境变量设置详细日志环境变量 `PACKER_LOG` 或日志变量 `PACKER_LOG_PATH`。例如：

```powershell
$env:PACKER_LOG=1
$env:PACKER_LOG_PATH="packerlog.txt"
```

如果你发现 Packer 有 bug，请使用 [gist](https://gist.github.com) 等服务包含详细日志。

## 安装 Ubuntu 软件包的问题

在使用和构建 Ubuntu AMI 时可能会出现问题，_应该_ 从 Ubuntu Main 仓库安装的常见软件包在配置器步骤中找不到：

```txt
amazon-ebs: No candidate version found for build-essential
amazon-ebs: No candidate version found for build-essential
```

这显然会导致问题，构建无法成功完成，因为无法正确配置适当的软件包。问题出现在当 Packer 开始任何配置步骤时，cloud-init 在源 AMI 上尚未完全运行完毕。

在 Packer 模板中添加以下配置器，允许 cloud-init 进程在 Packer 开始配置源 AMI 之前完全完成。

```json
{
  "type": "shell",
  "inline": [
    "cloud-init status --wait"
  ]
}
```

## 使用大量构建器/配置器/后处理器时的问题

Packer 为每个构建器、配置器、后处理器和插件使用单独的进程。在某些情况下，如果你有太多这些，你可能会耗尽[文件描述符](https://en.wikipedia.org/wiki/File_descriptor)。这会导致类似以下的错误：

```txt
error initializing provisioner 'powershell': fork/exec /files/go/bin/packer:
too many open files
```

在 Unix 系统上，你可以使用 `ulimit -Sn` 检查你的文件描述符限制。你应该咨询你的操作系统供应商了解如何提高此限制。

## 使用过长临时目录时的问题

Packer 在内部使用 Unix 套接字，这些套接字创建在默认的临时文件目录中。某些操作系统对套接字名称的长度有限制，通常在 80 到 110 个字符之间。如果你遇到这样的错误（对于任何构建器，不仅仅是 Docker）：

```txt
Failed to initialize build 'docker': error initializing builder 'docker': plugin exited before we could connect
```

你应该尝试将临时目录设置为更短的路径。这可以通过 `TMPDIR` 环境变量来完成。
