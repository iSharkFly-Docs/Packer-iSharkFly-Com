---
description: |
  `winrm` 通信器建立 WinRM 连接，使 Packer 能够在其创建的机器上上传文件或执行脚本。
title: 建立 WinRM 连接
---

# 建立 WinRM 连接

本主题描述如何使用 `winrm` 通信器与其创建的机器建立 WinRM 连接，以便 Packer 可以执行操作，如上传文件和执行脚本。

## 简介

通信器是 Packer 用于在正在创建的机器上上传文件、执行脚本等操作的机制。`winrm` 通信器使用 Windows 远程管理协议来完成此操作。

## 准备使用 `winrm` 通信器

`winrm` 通信器不是默认通信器，因此你总是需要显式设置 `"communicator": "winrm",` 模板选项。此外，你几乎总是需要提供一个在客户机上启用和配置 WinRM 的预运行脚本。这通常以 PowerShell 脚本或批处理文件的形式提供。

如果你从全新的未配置操作系统镜像构建，你需要将此预运行脚本作为 Autounattend.xml 文件的一部分提供，Windows 需要此文件进行自动操作系统安装。如果你在云中构建或从预安装的镜像构建，提供此预运行脚本的方法将根据构建器而有所不同。有关如何提供 winrm 配置脚本的更多信息，请参阅每个构建器的文档。

如果你不熟悉如何使用 autounattend 文件，请查看我们的[快速指南](/guides/automatic-operating-system-installs/)；了解如何自动初始化你的操作系统对于成功使用 Packer 从 iso 构建至关重要。

## `winrm` 通信器选项

- `winrm_username` (string) - 用于连接 WinRM 的用户名。

- `winrm_password` (string) - 用于连接 WinRM 的密码。

- `winrm_host` (string) - WinRM 要连接的地址。
  
  注意：如果使用 Amazon EBS 构建器，你可以通过 [`ssh_interface`](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebs#ssh_interface) 指定 WinRM 连接的接口

- `winrm_no_proxy` (bool) - 将此设置为 `true` 会将远程 `host:port` 添加到 `NO_PROXY` 环境变量。这会在连接到远程主机时绕过任何配置的代理。默认为 `false`。

- `winrm_port` (int) - 要连接的 WinRM 端口。对于普通未加密连接默认为 `5985`，当 `winrm_use_ssl` 设置为 true 时 SSL 默认为 `5986`。

- `winrm_timeout` (duration string | ex: "1h5m2s") - 等待 WinRM 可用的时间量。由于设置 Windows 机器通常需要很长时间，默认为 `30m`。

- `winrm_use_ssl` (bool) - 如果为 `true`，对 WinRM 使用 HTTPS。

- `winrm_insecure` (bool) - 如果为 `true`，不检查服务器证书链和主机名。

- `winrm_use_ntlm` (bool) - 如果为 `true`，WinRM 将使用 NTLMv2 身份验证（带会话安全），而不是默认的（基本身份验证），从而无需在目标客户机中启用基本身份验证。有关远程连接身份验证的更多信息可以在[这里](https://msdn.microsoft.com/en-us/library/aa384295(v=vs.85).aspx)找到。

<!-- End of code generated from the comments of the WinRM struct in communicator/config.go; -->

## 示例

### WinRM 连接基础

请注意，WinRM 不是 Packer 特定的协议。Microsoft 有大量关于 WinRM 的文档。如果你在阅读本指南后发现仍然无法通过 WinRM 连接，请查看 [Microsoft 文档](https://docs.microsoft.com/en-us/windows/win32/winrm/installation-and-configuration-for-windows-remote-management)以确保你没有遗漏任何内容。

为了使 Packer 能够通过 WinRM 连接，你通常需要执行一些步骤：

1. 设置 Packer 连接使用的用户名和密码。
2. 进行必要的注册表编辑以启用远程执行（以及如果需要，使用提升权限的远程执行）
3. 启动 WinRM，设置允许基本身份验证所需的任何配置
4. 根据你的连接方式打开端口 5985 和/或 5986
5. 启动 WinRM 并将其设置为计算机重启时自动启动
6. 如有必要，为 WinRM 侦听器生成自签名证书或提供真实证书。

#### 在 VMware 中配置 WinRM

如果你使用 Autounattend.xml 配置 WinRM，设置 WinRM 的最简单方法是将配置命令直接放入 Autounattend 文件中，如[此处](https://github.com/StefanScherer/packer-windows/blob/6e603e904e9b280eeb97f7eb542940a043954112/answer_files/2008_r2_core/Autounattend.xml#L157-L234)所示

你也可以不单独输入每一行，而是在 autounattend 中添加一个包含配置 winrm 命令的批处理文件。根据你的 winrm 设置，这可能是一个复杂的批处理文件，也可能是一个非常简单的批处理文件。

下面是一个如何从 Autounattend 文件内部调用批处理文件的示例。

```xml
<FirstLogonCommands>
  ...
  <SynchronousCommand wcm:action="add">
      <CommandLine>cmd.exe /c a:\winrmConfig.bat</CommandLine>
      <Description>Configure WinRM</Description>
      <Order>3</Order>
      <RequiresUserInput>true</RequiresUserInput>
  </SynchronousCommand>
  ...
</FirstLogonCommands>
```

也可以以类似的方式调用 PowerShell 脚本。

上面引用的 winrmConfig.bat 可以很简单：

```powershell
rem basic config for winrm
cmd.exe /c winrm quickconfig -q

rem allow unencrypted traffic, and configure auth to use basic username/password auth
cmd.exe /c winrm set winrm/config/service @{AllowUnencrypted="true"}
cmd.exe /c winrm set winrm/config/service/auth @{Basic="true"}

rem update firewall rules to open the right port and to allow remote administration
cmd.exe /c netsh advfirewall firewall set rule group="remote administration" new enable=yes

rem restart winrm
cmd.exe /c net stop winrm
cmd.exe /c net start winrm
```

请注意，上述批处理文件 _极其_ 简单，不安全。它旨在作为最低配置的示例。下面，你将找到一个更复杂的更安全 WinRM 配置过程的示例。

此批处理文件仅适用于 HTTP 连接，不适用于 HTTPS，但将使你能够仅使用先前在 Autounattend 文件中创建的用户名和密码进行连接。上述批处理文件将允许你使用非常简单的 Packer 配置进行连接：

```json
        "communicator": "winrm",
        "winrm_username": "packeruser",
        "winrm_password": "SecretPassword"
```

下面可以看到用于配置的更复杂 PowerShell 脚本示例。

```powershell
# A Packer config that works with this example would be:
#
#
#    "winrm_username": "Administrator",
#    "winrm_password": "SuperS3cr3t!!!",
#    "winrm_insecure": true,
#    "winrm_use_ssl": true
#
#

# Create username and password
net user Administrator SuperS3cr3t!!!
wmic useraccount where "name='Administrator'" set PasswordExpires=FALSE

Set-ExecutionPolicy Unrestricted -Scope LocalMachine -Force -ErrorAction Ignore

# Don't set this before Set-ExecutionPolicy as it throws an error
$ErrorActionPreference = "stop"

# Remove HTTP listener
Remove-Item -Path WSMan:\Localhost\listener\listener* -Recurse

# Create a self-signed certificate to let ssl work
$Cert = New-SelfSignedCertificate -CertstoreLocation Cert:\LocalMachine\My -DnsName "packer"
New-Item -Path WSMan:\LocalHost\Listener -Transport HTTPS -Address * -CertificateThumbPrint $Cert.Thumbprint -Force

# WinRM
write-output "Setting up WinRM"
write-host "(host) setting up WinRM"

# Configure WinRM to allow unencrypted communication, and provide the
# self-signed cert to the WinRM listener.
cmd.exe /c winrm quickconfig -q
cmd.exe /c winrm set "winrm/config/service" '@{AllowUnencrypted="true"}'
cmd.exe /c winrm set "winrm/config/client" '@{AllowUnencrypted="true"}'
cmd.exe /c winrm set "winrm/config/service/auth" '@{Basic="true"}'
cmd.exe /c winrm set "winrm/config/client/auth" '@{Basic="true"}'
cmd.exe /c winrm set "winrm/config/service/auth" '@{CredSSP="true"}'
cmd.exe /c winrm set "winrm/config/listener?Address=*+Transport=HTTPS" "@{Port=`"5986`";Hostname=`"packer`";CertificateThumbprint=`"$($Cert.Thumbprint)`"}"

# Make sure appropriate firewall port openings exist
cmd.exe /c netsh advfirewall firewall set rule group="remote administration" new enable=yes
cmd.exe /c netsh advfirewall firewall add rule name="Port 5986" dir=in action=allow protocol=TCP localport=5986 profile=any

# Restart WinRM, and set it so that it auto-launches on startup.
cmd.exe /c net stop winrm
cmd.exe /c sc config winrm start= auto
cmd.exe /c net start winrm
```

请注意，如果你将来不需要服务器接收 WinRM 连接，让 WinRM 在所有启动时自动启动可能不是你的正确选择。在最终配置步骤中清理并关闭不必要的防火墙端口，以确保你的镜像安全。

#### 在云中配置 WinRM

大多数云允许你提供在实例启动时运行的配置脚本。在 AWS 中，这是 [user_data_file](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebs#user_data_file)。在 Google Cloud 中，这是使用 `windows-startup-script-cmd` [metadata](https://developer.hashicorp.com/packer/plugins/builders/googlecompute#metadata) 标签提供的。
[示例](https://developer.hashicorp.com/packer/plugins/builders/googlecompute#windows-example)

本质上，这些文件是配置 winrm 的 powershell 或 cmd 脚本，无需包装在 Autounattend 中。按照每个云请求的格式提供脚本，并确保手动配置云不允许你内部管理的任何防火墙规则。每个云的更多具体详细信息可以在构建器部分找到。

上述示例也适用于云准备，但根据云为你做了多少预配置，可能是多余的。
