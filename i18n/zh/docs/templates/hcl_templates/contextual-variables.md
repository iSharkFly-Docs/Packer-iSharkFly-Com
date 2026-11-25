---
title: 上下文变量参考
description: >-
  源变量、构建变量和其他特殊变量依赖于上下文。了解返回连接和实例状态信息的上下文变量。
---

# 上下文变量

本文提供关于根据配置上下文返回连接和基本实例状态信息的特殊变量的参考信息。

## 源变量

使用以下语法从配置器和后处理器访问 `source` 的 `name` 和 `type`：

```
<build-name>.<source-type>.<source-name>
```

以下示例查询构建中使用的源名称：

```hcl
source "null" "first-example" {
  communicator = "none"
}

build {
  name = "roles"

  source "null.first-example" {
    name = "consul"
  }
  source "null.first-example" {
    name = "nomad"
  }
  source "null.first-example" {
    name = "vault"
  }
  sources = ["null.first-example"]

  provisioner "shell-local" {
    inline = ["echo ${source.name} and ${source.type}"]
  }
}
```

示例返回以下值：

- `roles.null.consul`：返回 `consul` 和 `null`
- `roles.null.nomad`：返回 `nomad` 和 `null`
- `roles.null.vault`：返回 `vault` 和 `null`
- `roles.null.first-example`：返回 `first-example` 和 `null`

## 构建变量

构建变量允许你访问构建器的连接信息和基本实例状态信息。所有特殊构建变量都存储在 `build` 变量中：

```hcl
source "null" "first-example" {
  communicator = "none"
}

build {
  name = "my-build-name"
  sources = ["null.first-example"]

  provisioner "shell-local" {
    environment_vars = ["TESTVAR=${build.PackerRunUUID}"]
    inline = ["echo source.name is ${source.name}.",
              "echo build.name is ${build.name}.",
              "echo build.PackerRunUUID is $TESTVAR"]
  }
}
```

以下是可用构建变量的列表：

- **name** 表示正在运行的构建块的名称。这与正在运行的源块的名称不同。

- **ID**：表示正在配置的虚拟机。例如，在 Amazon 中是实例 ID；在 DigitalOcean 中是 Droplet ID；在 VMware 中是虚拟机名称。

- **Host**、**Port**、**User** 和 **Password**：Packer 用于访问机器的主机、端口、用户和密码。对于使用 shell local 配置器来针对已配置实例运行 Ansible 或 Inspec 很有用。

- **ConnType**：正在使用的通信器类型。例如，对于 SSH 通信器，这将是 "ssh"。

- **PackerRunUUID**：当前构建的唯一 ID。可用于指定构建制品。例如，当多个构建同时运行并生成相同的制品时。可以通过使用构建的唯一 ID 命名这些制品来区分它们。

- **PackerHTTPIP**、**PackerHTTPPort** 和 **PackerHTTPAddr**：Packer 创建的用于向虚拟机提供 "http" 目录中项目的文件服务器的 HTTP IP、端口和地址。HTTP 地址以 `IP:PORT` 格式显示。

- **SSHPublicKey** 和 **SSHPrivateKey**：Packer 用于连接到实例的公钥和私钥。这些是 SSH 通信器独有的，使用其他通信器时未设置。**SSHPublicKey** 和 **SSHPrivateKey** 可能包含转义序列和特殊字符，因此它们的输出应该用单引号括起来以避免意外。例如：

  ```hcl
    provisioner "shell" {
        inline = ["echo '${build.SSHPrivateKey}' > /tmp/packer-session.pem"]
    }
  ```

为了向后兼容，`WinRMPassword` 也可以通过此引擎使用，尽管它与使用更通用的 `Password` 没有什么不同。

所有构建变量都可以与任何 [HCL2 函数](/docs/templates/hcl_templates/functions/)一起使用。使用 [upper](/docs/templates/hcl_templates/functions/string/upper) 将构建 ID 转换为大写的示例：

```hcl
  post-processor "shell-local" {
      inline = ["echo ${upper(build.ID)}"]
  }
```

有关构建器特定的构建变量，请参阅构建器文档：

- Amazon EC2：[chroot](https://developer.hashicorp.com/packer/plugins/builders/amazon/chroot#build-shared-information-variables)、[EBS Volume](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebsvolume#build-shared-information-variables)、[EBS](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebs#build-shared-information-variables)、[EBS Surrogate](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebssurrogate#build-shared-information-variables)、[Instance](https://developer.hashicorp.com/packer/plugins/builders/amazon/instance#build-shared-information-variables)。

HCL2 特殊构建变量处于测试阶段；请在 GitHub 上的 Packer 问题跟踪器中报告任何问题或请求。

## Packer 版本

此变量设置为当前运行的 Packer 版本。

```hcl
source "null" "first-example" {
  communicator = "none"
}

build {
  sources = ["null.first-example"]

  provisioner "shell-local" {
    inline = ["echo packer_version is '${packer.version}'"]
  }
}
```

如果你正在运行 Packer 的开发版本，版本变量将包含已发布的版本号、dev 标志和当前提交。

```shellsession
PACKER_LOG=0 packer build packer_version_demo.pkr.hcl
null.first-example: output will be in this color.

==> null.first-example: Running local shell script: /var/folders/8t/0yb5q0_x6mb2jldqq_vjn3lr0000gn/T/packer-shell083160352
    null.first-example: packer_version is 1.6.5-dev (a69392129+CHANGES)
```

如果你正在运行已发布版本的 Packer，版本变量将只包含已发布的版本号：

```shellsession
PACKER_LOG=0 packer build packer_version_demo.pkr.hcl
null.first-example: output will be in this color.

==> null.first-example: Running local shell script: /var/folders/8t/0yb5q0_x6mb2jldqq_vjn3lr0000gn/T/packer-shell718995312
    null.first-example: packer_version is 1.6.5
```

确保将变量用单引号括起来以转义返回的字符串；如果你正在运行 Packer 的开发版本，括号可能会影响你的 shell 转义。

## HCP Packer 迭代 ID

::: warning
**注意**：`packer.iterationID` 变量现已弃用，将在未来版本的 Packer 中移除。应该使用指纹来访问 HCP Packer 版本。`packer.versionFingerprint` 变量现已公开，可与新的 HCP Packer 数据源一起使用。
:::

如果你的构建正在向 HCP Packer 注册表推送元数据，此变量将设置为与此运行关联的迭代 ID 的值。

```hcl
source "null" "example" {
  communicator = "none"
}

data "hcp-packer-version" "hardened-source" {
  bucket_name = "example"
  channel_name = "latest"
}

data "hcp-packer-artifact" "file" {
  bucket_name = "example"
  version_fingerprint = "${data.hcp-packer-version.hardened-source.fingerprint}"
  platform = "aws"
  region = "us-east-1"
}

build {
  hcp_packer_registry {
    bucket_name = "simple"
  }
  sources = [
    "source.null.example"
  ]

  provisioner "shell-local" {
    inline = [
      "echo data is ${packer.iterationID}"
    ]
  }
}

```

```shellsession
==> mybuild.null.example: Running local shell script: /var/folders/cz/q3cr3tld2457gtlgw7qs1kqc0000gq/T/packer-shell842419427
    mybuild.null.example: data is 01HN3KCRPVKR5PBQ28TS6B12W0
```

## HCP Packer 版本指纹

如果你的构建正在向 HCP Packer 注册表推送元数据，此变量将设置为与此运行关联的版本指纹的值。

```hcl
source "null" "example" {
  communicator = "none"
}

data "hcp-packer-version" "hardened-source" {
  bucket_name = "example"
  channel_name = "latest"
}

data "hcp-packer-artifact" "file" {
  bucket_name = "example"
  version_fingerprint = "${data.hcp-packer-version.hardened-source.fingerprint}"
  platform = "aws"
  region = "us-east-1"
}

build {
  hcp_packer_registry {
    bucket_name = "simple"
  }
  sources = [
    "source.null.example"
  ]

  provisioner "shell-local" {
    inline = [
      "echo data is ${packer.versionFingerprint}"
    ]
  }
}

```

```shellsession
==> mybuild.null.example: Running local shell script: /var/folders/cz/q3cr3tld2457gtlgw7qs1kqc0000gq/T/packer-shell842419427
    mybuild.null.example: data is 01HN3KCRPVKR5PBQ28TS6B12W0
```

你还可以将此值添加到后处理器，例如添加到清单文件：

```hcl
  post-processor "manifest" {
    output     = "manifest.json"
    strip_path = true
    custom_data = {
      version_fingerprint = "${packer.versionFingerprint}"
      iteration = "${packer.iterationID}"
    }
  }

```
