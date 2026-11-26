---
description: |
  `ssh` 通信器建立 SSH 连接，以便 Packer 可以在其创建的机器上执行操作，如上传文件和执行脚本。
title: 建立 SSH 连接
---

# 建立 SSH 连接

本主题描述如何使用 `ssh` 通信器与其创建的机器建立 SSH 连接，以便 Packer 可以执行操作，如上传文件和执行脚本。

## 简介

通信器是 Packer 用于在正在创建的机器上上传文件、执行脚本等操作的机制，在[构建器](/docs/templates/legacy_json_templates/builders)部分中配置。

`ssh` 通信器使用 SSH 协议来完成此操作。它是大多数构建器的默认通信器。

如果在运行 Packer 的主机上配置了 SSH 代理，并且在通信器配置中启用了 SSH 代理身份验证，Packer 将自动将 SSH 代理转发到远程主机。

## 准备使用 `ssh` 通信器

`ssh` 通信器是大多数构建器的默认通信器，但根据你的构建器，它可能不会"开箱即用"。

如果你从云镜像构建（例如，在 Amazon 上构建），你的云提供商很可能已经为你在镜像上预配置了 SSH，这意味着你只需要在 Packer 模板中配置通信器。

但是，如果你从全新的未配置操作系统镜像构建，你几乎总是需要执行一些额外的工作来在客户机上配置 SSH。对于大多数操作系统发行版，这项工作将通过[启动命令](https://developer.hashicorp.com/packer/plugins/builders/vmware/iso#boot-configuration)执行，该命令引用一个提供安装操作系统时通常交互式问题答案的文件。此文件的名称因操作系统而异；一些常见的例子是 Debian 需要的"preseed"文件、CentOS 需要的"kickstart"文件或 Windows 需要的"应答文件"（也称为 Autounattend.xml 文件）。为简单起见，我们在本文档的其余部分将此文件称为"preseed"文件。

如果你不熟悉如何使用 preseed 文件进行镜像自动引导，请查看我们的[快速指南](/guides/automatic-operating-system-installs/)了解镜像引导，或研究你特定客户操作系统的自动配置。了解如何自动初始化你的操作系统对于成功使用 Packer 至关重要。

## `ssh` 通信器参考

`ssh` 通信器通过 SSH 连接到主机。如果在运行 Packer 的主机上配置了 SSH 代理，并且在通信器配置中启用了 SSH 代理身份验证，Packer 将自动将 SSH 代理转发到远程主机。

`ssh` 通信器有以下选项：

- `ssh_host` (string) - 要 SSH 到的地址。这通常由构建器自动配置。

- `ssh_port` (int) - 要连接到 SSH 的端口。默认为 `22`。

- `ssh_username` (string) - 用于连接 SSH 的用户名。如果使用 SSH，则必需。

- `ssh_password` (string) - 用于 SSH 身份验证的明文密码。

- `ssh_ciphers` ([]string) - 这会覆盖 Golang 默认支持的密码值。默认值是 [
    "aes128-gcm@openssh.com",
    "chacha20-poly1305@openssh.com",
    "aes128-ctr", "aes192-ctr", "aes256-ctr",
  ]
  
  有效的密码选项包括：
  "aes128-ctr", "aes192-ctr", "aes256-ctr", "aes128-gcm@openssh.com",
  "chacha20-poly1305@openssh.com",
  "arcfour256", "arcfour128", "arcfour", "aes128-cbc", "3des-cbc",

- `ssh_clear_authorized_keys` (bool) - 如果为 true，Packer 将尝试从 `~/.ssh/authorized_keys` 和 `/root/.ssh/authorized_keys` 中删除其临时密钥。这主要是一个美观选项，因为无论此设置是否为 true，Packer 都会从主机系统中删除临时私钥（除非用户设置了 `-debug` 标志）。默认为"false"；目前仅适用于安装了 `sed` 的客户机。

- `ssh_key_exchange_algorithms` ([]string) - 如果设置，Packer 将覆盖 Golang 默认支持的密钥交换 (kex) 算法值。可接受的值包括："curve25519-sha256@libssh.org", "ecdh-sha2-nistp256", "ecdh-sha2-nistp384", "ecdh-sha2-nistp521", "diffie-hellman-group14-sha1", 和 "diffie-hellman-group1-sha1"。

- `ssh_certificate_file` (string) - 用于 SSH 身份验证的用户证书路径。路径中可以使用 `~`，它将扩展为当前用户的主目录。

- `ssh_pty` (bool) - 如果为 `true`，将为 SSH 连接请求 PTY。默认为 `false`。

- `ssh_timeout` (duration string | ex: "1h5m2s") - 等待 SSH 可用的时间。Packer 使用此时间确定机器何时启动，因此通常相当长。示例值：`10m`。默认为 `5m`，除非设置了 `ssh_handshake_attempts`。

- `ssh_disable_agent_forwarding` (bool) - 如果为 true，将禁用 SSH 代理转发。默认为 `false`。

- `ssh_handshake_attempts` (int) - SSH 连接后尝试握手的次数。默认为 `10`，除非设置了 `ssh_timeout`。

- `ssh_bastion_host` (string) - 用于实际 SSH 连接的堡垒机主机。

- `ssh_bastion_port` (int) - 堡垒机主机的端口。默认为 `22`。

- `ssh_bastion_agent_auth` (bool) - 如果为 `true`，将使用本地 SSH 代理与堡垒机进行身份验证。默认为 `false`。

- `ssh_bastion_username` (string) - 连接到堡垒机主机的用户名。

- `ssh_bastion_password` (string) - 用于堡垒机主机身份验证的密码。

- `ssh_bastion_interactive` (bool) - 如果为 `true`，使用键盘交互与堡垒机进行身份验证。

- `ssh_bastion_private_key_file` (string) - 用于堡垒机主机身份验证的 PEM 编码私钥文件路径。路径中可以使用 `~`，它将扩展为当前用户的主目录。

- `ssh_bastion_certificate_file` (string) - 用于堡垒机主机身份验证的用户证书路径。路径中可以使用 `~`，它将扩展为当前用户的主目录。

- `ssh_file_transfer_method` (string) - `scp` 或 `sftp` - 如何传输文件，安全复制（默认）或 SSH 文件传输协议。
  
  **注意**：使用 Win32-OpenSSH v9.1.0.0p1-Beta 的 Windows 客户机，scp（复制数据的默认协议）返回非零错误代码，因为无法设置 MOTW，这会导致任何文件传输失败。作为解决方法，你可以用 SFTP 覆盖传输协议 `ssh_file_transfer_method = "sftp"`。

- `ssh_proxy_host` (string) - 用于 SSH 连接的 SOCKS 代理主机

- `ssh_proxy_port` (int) - SOCKS 代理的端口。默认为 `1080`。

- `ssh_proxy_username` (string) - 用于代理服务器身份验证的可选用户名。

- `ssh_proxy_password` (string) - 用于代理服务器身份验证的可选密码。

- `ssh_keep_alive_interval` (duration string | ex: "1h5m2s") - 向服务器发送"保持活动"消息的频率。设置为负值（`-1s`）以禁用。示例值：`10s`。默认为 `5s`。

- `ssh_read_write_timeout` (duration string | ex: "1h5m2s") - 等待远程命令结束的时间量。例如，如果 packer 在重启后挂起连接，这可能很有用。示例：`5m`。默认禁用。

- `ssh_remote_tunnels` ([]string) - 远程隧道将端口从本地机器转发到实例。
	格式：["REMOTE_PORT:LOCAL_HOST:LOCAL_PORT"]
	示例："9090:localhost:80" 将你机器上的 localhost:9090 转发到实例上的端口 80。

- `ssh_local_tunnels` ([]string) - 本地隧道将端口从实例转发到本地机器。
	格式：["LOCAL_PORT:REMOTE_HOST:REMOTE_PORT"]
	示例："8080:localhost:3000" 允许实例通过 localhost:8080 访问本地机器的端口 3000。

<!-- End of code generated from the comments of the SSH struct in communicator/config.go; -->

- `ssh_keypair_name` (string) - 如果指定，这是将用于机器 SSH 的密钥。该密钥必须与加载到远程的密钥对名称匹配。默认情况下，这是空的，Packer 将生成一个临时密钥对，除非使用了 [`ssh_password`](#ssh_password)。当使用 [`ssh_keypair_name`](#ssh_keypair_name) 时，必须指定 [`ssh_private_key_file`](#ssh_private_key_file) 或 [`ssh_agent_auth`](#ssh_agent_auth)。

- `ssh_agent_auth` (bool) - 如果为 true，将使用本地 SSH 代理验证与源实例的连接。不会创建临时密钥对，[`ssh_password`](#ssh_password) 和 [`ssh_private_key_file`](#ssh_private_key_file) 的值将被忽略。必须设置环境变量 `SSH_AUTH_SOCK` 才能使此选项正常工作。

- `temporary_key_pair_name` (string) - 要生成的临时密钥对的名称。默认情况下，Packer 生成一个类似于 `packer_<UUID>` 的名称，其中 &lt;UUID&gt; 是 36 个字符的唯一标识符。

- `ssh_private_key_file` (string) - 用于 SSH 身份验证的 PEM 编码私钥文件路径。路径中可以使用 `~`，它将扩展为当前用户的主目录。

::: warning
注意：选项 `ssh_keypair_name`、`ssh_agent_auth`、`temporary_key_pair_name` 和 `ssh_private_key_file` 由通信器支持；但是，并非每个构建器都支持它们。请参阅构建器文档了解支持的选项。
:::

### `ssh` 通信器详细信息

Packer 将只使用一种身份验证方法，要么是 `publickey`，要么如果使用了 `ssh_password`，Packer 将提供 `password` 和 `keyboard-interactive`，两者都发送密码。换句话说，Packer 不会与使用 `AuthenticationMethods` 配置了多个身份验证方法的 _sshd_ 一起工作。

Packer 支持以下 MAC：

- hmac-sha1
- hmac-sha1-96
- hmac-sha2-256
- `hmac-sha2-256-etm@openssh.com`

有关 Packer 支持的密码的更多信息，请查阅 [ssh_ciphers](/docs/communicators/ssh#ssh_ciphers) 模板选项的文档。
