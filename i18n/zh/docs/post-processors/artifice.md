---
description: >
  `artifice` 后处理器覆盖来自上游构建器或后处理器的制品列表。使用它在 Packer 构建器内部构建制品，例如启动 EC2 实例来构建 Docker 容器，但只保留 Docker 容器的制品。
title: artifice 后处理器参考
---

<Badge type="tip" text="Official" />

# `artifice` 后处理器

制品 BuilderId：`packer.post-processor.artifice`

artifice 后处理器覆盖来自上游构建器或后处理器的制品列表。所有下游后处理器都将看到你指定的新制品。

在使用 artifice 覆盖制品后，你可以将其与其他后处理器一起使用，包括大多数核心后处理器和第三方后处理器。

这样做的一个主要好处是你可以使用 shell-local 修改构建器制品，并将这些修改后的制品传递给可能无法与原始构建器一起工作的后处理器。
例如，也许你想从 amazon-ebs 构建器导出 Docker 容器，然后使用 Docker-push 将该 Docker 容器放入你的 Docker Hub 账户。

Artifice 允许你使用熟悉的 packer 工作流程在你选择的基础设施上为每次构建创建一个新鲜的、无状态的构建环境。你可以使用它来构建几乎任何东西：buildpacks、容器、jars、二进制文件、tarballs、msi 安装程序等。

请注意，artifice 后处理器_不会_删除你的旧制品文件，即使它从制品中移除它们。如果你想删除旧制品文件，可以使用 shell-local 后处理器来完成。

## 工作流程

Artifice 帮助你将其他几个 packer 功能联系在一起：

- 构建器，启动 VM（或容器）来构建你的制品
- 配置器，执行创建制品的步骤
- 文件配置器，从 VM 下载制品
- artifice 后处理器，标识从 VM 下载了哪些文件
- 其他后处理器，将制品推送到 Docker hub 等

你应该尽可能在 VM 内部执行工作。理想情况下，artifice 之后你唯一需要的其他后处理器是将制品上传到适当仓库的后处理器。

## 配置

配置允许你指定哪些文件组成你的制品。

### 必需：

- `files`（字符串数组）- 组成制品的文件列表。这些文件必须在 packer 的配置阶段完成后存在于本地磁盘上。这些将替换构建器的任何原始制品（如 VM 快照）。

### 可选：

- `keep_input_artifact`（boolean）- 如果为 true，创建新制品后不删除原始制品文件。默认为 true。

### 示例配置

你可以使用 Packer 部署 HashiCorp Consul，这是一个服务发现和服务网格解决方案。有关更多信息，请参阅 [Consul 网站](https://www.hashicorp.com/en/products/consul)。

在此示例中，Packer 使用最小配置执行以下操作：

1. 启动克隆的 VMware 虚拟机
1. 安装 Consul 发布版本。
1. 下载 Consul 二进制文件。
1. 将 Consul 打包成 `.tar.gz` 文件。
1. 将 Consul 上传到 S3。

VMX 是一种快速在本地构建和测试的方式，但你可以替换为不同的构建器。

```json
{
  "builders": [
    {
      "type": "vmware-vmx",
      "source_path": "/opt/ubuntu-1404-vmware.vmx",
      "ssh_username": "vagrant",
      "ssh_password": "vagrant",
      "shutdown_command": "sudo shutdown -h now",
      "headless": "true",
      "skip_compaction": "true"
    }
  ],
  "provisioners": [
    {
      "type": "shell",
      "inline": [
        "sudo apt-get install -y python-pip",
        "sudo pip install ifs",
        "sudo ifs install consul --version=0.5.2"
      ]
    },
    {
      "type": "file",
      "source": "/usr/local/bin/consul",
      "destination": "consul",
      "direction": "download"
    }
  ],
  "post-processors": [
    [
      {
        "type": "artifice",
        "files": ["consul"]
      },
      {
        "type": "compress",
        "output": "consul-0.5.2.tar.gz"
      },
      {
        "type": "shell-local",
        "inline": [
          "/usr/local/bin/aws s3 cp consul-0.5.2.tar.gz s3://<s3 path>"
        ]
      }
    ]
  ]
}
```

**请注意，后处理器部分有两组方括号。** 这创建了一个后处理器链，其中前面制品的输出被传递给后续的后处理器。如果你只使用一组方括号，后处理器将分别针对构建制品（在本例中为 vmx 文件）运行，这将不会产生期望的结果。

```json
{
  "post-processors": [
    [       // <--- 开始后处理器链
      {
        "type": "artifice",
        "files": ["consul"]
      },
      {
        "type": "compress",
        ...
      }
    ],      // <--- 结束后处理器链
    {
      "type":"compress"  // <-- 独立后处理器
    }
  ]
}
```

你可以创建多个后处理器链来处理多个构建器（例如，在同一构建期间构建 Linux 和 Windows 二进制文件）。
