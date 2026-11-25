---
description: |
  `variables` 块包含模板的参数化值。了解如何配置 `variables` 以提高模板的安全性、可移植性和可共享性。
title: JSON 模板的 variables 参考
---

# JSON 模板的 `variables` 参考

本文描述如何在 JSON 格式编写的 Packer 模板中使用用户变量。

::: info
**注意：** 本页面是关于旧式 JSON Packer 模板的。Packer 核心仍然支持 JSON 模板，但添加到 Packer 核心的新功能可能不会为 JSON 模板实现。我们建议你尽快过渡到 HCL 模板，以获得 Packer 的最佳体验。为了帮助你升级模板，我们编写了一个 [hcl2_upgrade 命令](/docs/commands/hcl2_upgrade)。
:::

## 描述

`variables` 块允许你使用命令行、环境变量、Vault 或文件中的变量进一步配置模板。这让你可以参数化模板，以便将密钥令牌、特定于环境的数据和其他类型的信息保留在模板之外。这最大化了模板的可移植性。

使用用户变量需要你了解[配置模板](/docs/templates/legacy_json_templates/engine)的工作原理。如果你还不知道配置模板如何工作，请先阅读该页面。

## 用法

要设置用户变量，你必须在模板的 `variables` 部分中定义它，或使用命令行 `-var` 或 `-var-file` 标志。

即使你想让用户变量默认为空字符串，最好也明确定义它。这种明确性有助于减少新手理解模板中可修改内容所需的时间。

`variables` 部分是用户变量名称到默认值的键/值映射。默认值可以是空字符串。示例如下所示：

```json
{
  "variables": {
    "aws_access_key": "",
    "aws_secret_key": ""
  },

  "builders": [
    {
      "type": "amazon-ebs",
      "access_key": "{{user `aws_access_key`}}",
      "secret_key": "{{user `aws_secret_key`}}"
      // ...
    }
  ]
}
```

在上面的示例中，模板定义了两个用户变量：`aws_access_key` 和 `aws_secret_key`。它们默认为空值。稍后，变量在我们定义的构建器中使用，以便配置 Amazon 构建器的实际密钥。

如果默认值为 `null`，则用户变量将是 _必需的_。这意味着用户必须为此变量指定一个值，否则模板验证将失败。

用户变量通过以 `{{user 'variable'}}` 形式调用 `{{user}}` 函数来使用。此函数可用于模板中除 `type` 之外的 _任何值_：在构建器、配置器中，_variables 部分之外的任何地方_。用户变量在模板的其余部分全局可用。

## 环境变量

环境变量可以在模板中通过用户变量使用。`env` 函数 _仅_ 在用户变量的默认值中可用，允许你将用户变量默认为环境变量。示例如下所示：

```json
{
  "variables": {
    "my_secret": "{{env `MY_SECRET`}}"
  }
}
```

这将使 "my_secret" 默认为 "MY_SECRET" 环境变量的值（如果不存在则为空字符串）。

::: info
**为什么不能在其他地方使用环境变量？** 用户变量是模板可配置输入的唯一来源。我们认为在模板的 _任何地方_ 使用环境变量会让用户对模板的可能输入感到困惑。通过仅允许在用户变量的默认值中使用环境变量，用户变量仍然是用户可以使用 `packer inspect` 轻松发现的模板输入的唯一来源。
:::

::: info
**为什么不能使用 `~` 作为 home 变量？** `~` 是一个特殊变量，在变量展开期间由 shell 评估。由于 Packer 不在 shell 中运行，它不会展开 `~`。
:::

## Consul 键

Consul 键可以在模板中通过 `consul_key` 函数使用。由于与上述环境变量类似的原因，此函数 _仅_ 在用户变量的默认值中可用。

```json
{
  "variables": {
    "soft_versions": "{{ consul_key `my_image/softs_versions/next` }}"
  }
}
```

这将使 `soft_versions` 默认为 consul 中键 `my_image/softs_versions/next` 的值。

consul 的配置（地址、令牌等）必须指定为环境变量，如[文档](https://developer.hashicorp.com/consul/docs/commands#environment-variables)中所述。

## Vault 变量

Packer 可以从 HashiCorp Vault 读取密钥并将它们作为用户变量添加到你的模板中。你只能在用户变量的默认值中使用 `vault` 函数。这允许你将用户变量默认为 Vault 密钥。有关与 Vault 密钥引擎集成的更多信息，请参阅 [Vault 文档](https://developer.hashicorp.com/vault/docs/secrets)。

使用 v2 kv 引擎的示例：

如果你使用 `vault kv put secret/hello foo=world` 在 vault 中存储一个值，你可以使用以下模板引擎访问它：

```json
{
  "variables": {
    "my_secret": "{{ vault `/secret/data/hello` `foo`}}"
  }
}
```

这将分配 "my_secret": "world"

使用 v1 kv 引擎的示例：

如果你使用以下方式在 vault 中存储一个值：

    vault secrets enable -version=1 -path=secrets kv
    vault kv put secrets/hello foo=world

你可以使用以下模板引擎访问它：

    {
      "variables": {
        "VAULT_SECRETY_SECRET": "{{ vault `secrets/hello` `foo`}}"
      }
    }

此示例访问 Vault 路径 `secret/data/foo` 并返回存储在键 `bar` 处的值，将其存储为 "my_secret"。

为了使其工作，你必须将环境变量 `VAULT_TOKEN` 和 `VAULT_ADDR` 设置为有效值。

我们使用的 api 工具允许通过环境变量对 Vault 客户端进行更多自定义配置。

可用环境变量的完整列表是：

```txt
"VAULT_ADDR"
"VAULT_AGENT_ADDR"
"VAULT_CACERT"
"VAULT_CAPATH"
"VAULT_CLIENT_CERT"
"VAULT_CLIENT_KEY"
"VAULT_CLIENT_TIMEOUT"
"VAULT_SKIP_VERIFY"
"VAULT_NAMESPACE"
"VAULT_TLS_SERVER_NAME"
"VAULT_WRAP_TTL"
"VAULT_MAX_RETRIES"
"VAULT_TOKEN"
"VAULT_MFA"
"VAULT_RATE_LIMIT"
```

每个变量的详细使用文档可以在[这里](https://developer.hashicorp.com/vault/docs/commands#environment-variables)找到。

## AWS Secrets Manager 变量

密钥可以从 [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) 读取并在模板中作为用户变量使用。`aws_secretsmanager` 函数 _仅_ 在用户变量的默认值中可用，允许你将用户变量默认为 AWS Secrets Manager 密钥。

### 纯文本密钥

```json
{
  "variables": {
    "password": "{{ aws_secretsmanager `globalpassword` }}"
  }
}
```

在上面的示例中，假设密钥 `globalpassword` 不是作为键值对存储的，而是作为单个非 JSON 字符串值存储的。`aws_secretsmanager` 函数将其作为原始字符串返回。

### 单键密钥

```json
{
  "variables": {
    "password": "{{ aws_secretsmanager `sample/app/password` }}"
  }
}
```

在上面的示例中，假设 `sample/app/password` 中只存储了一个键，如果其中存储了多个键，则需要指示你要获取的特定键，如下所示。

### 多键密钥

```json
{
  "variables": {
    "db_password": "{{ aws_secretsmanager `sample/app/passwords` `db` }}",
    "api_key": "{{ aws_secretsmanager `sample/app/passwords` `api_key` }}"
  }
}
```

为了使用此函数，你必须使用以下方法之一配置有效的 AWS 凭据：

- [环境变量](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html)
- [CLI 配置文件](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [容器凭据](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [实例配置文件凭据](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)

## 使用数组值

一些模板需要数组值。你也可以为这些使用模板变量。例如，`amazon-ebs` 构建器有一个名为 `ami_regions` 的配置参数，它接受一个区域数组，AMI 将被复制到这些区域。你可以通过使用由 `,` 连接的区域列表的变量来参数化它。例如：

```json
{
  "variables": {
    "destination_regions": "us-west-1,us-west-2"
  },
  "builders": [
    {
      "ami_name": "packer-qs-{{timestamp}}",
      "instance_type": "t2.micro",
      "region": "us-east-1",
      "source_ami_filter": {
        "filters": {
          "name": "*ubuntu-xenial-16.04-amd64-server-*",
          "root-device-type": "ebs",
          "virtualization-type": "hvm"
        },
        "most_recent": true,
        "owners": ["099720109477"]
      },
      "ami_regions": "{{user `destination_regions`}}",
      "ssh_username": "ubuntu",
      "type": "amazon-ebs"
    }
  ]
}
```

## 设置变量

现在我们介绍了如何在模板中定义和使用用户变量，下一个重要的点是如何实际设置这些变量。Packer 提供了两种设置用户变量的方法：从命令行或从文件。

### CLI

要从命令行设置用户变量，`-var` 标志作为 `packer build`（和一些其他命令）的参数使用。继续我们上面的示例，我们可以使用下面的命令构建模板。命令为了可读性跨多行，但当然可以是单行。

```shellsession
$ packer build \
    -var 'aws_access_key=foo' \
    -var 'aws_secret_key=bar' \
    template.json
```

如你所见，可以多次指定 `-var` 标志以设置多个变量。此外，在命令行上稍后设置的变量会覆盖任何先前设置的同名变量。

**警告** 如果你从 cmd.exe 调用 Packer，你应该使用双引号而不是单引号包围变量。例如：

`packer build -var "aws_secret_key=foo" template.json`

### 从文件

变量也可以从外部 JSON 文件设置。`-var-file` 标志读取包含变量到值的键/值映射的文件并设置这些变量。示例 JSON 文件可能如下所示：

```json
{
  "aws_access_key": "foo",
  "aws_secret_key": "bar"
}
```

它是一个单独的 JSON 对象，其中键是变量，值是变量值。假设此文件在 `variables.json` 中，我们可以使用以下命令构建模板：

```txt
On Linux :
$ packer build -var-file=variables.json template.json
On Windows :
packer build -var-file variables.json template.json
```

`-var-file` 标志可以多次指定，来自多个文件的变量将被读取和应用。正如你所期望的，从稍后指定的文件读取的变量会覆盖先前设置的变量。

将 `-var` 和 `-var-file` 标志组合在一起也按你期望的方式工作。在命令中稍后设置的变量会覆盖先前设置的变量。因此，例如，在以下命令中使用上面的 `variables.json` 文件：

```shellsession
$ packer build \
    -var 'aws_access_key=bar' \
    -var-file=variables.json \
    -var 'aws_secret_key=baz' \
    template.json
```

结果是以下变量：

| 变量           | 值    |
| -------------- | ----- |
| aws_access_key | foo   |
| aws_secret_key | baz   |

## 敏感变量

如果你使用环境设置敏感变量，你可能不希望该变量打印到 Packer 日志中。你可以通过将它们添加到 Packer 模板中的 "sensitive-variables" 列表来确保敏感变量不会打印到日志中：

```json
{
  "variables": {
    "my_secret": "{{env `MY_SECRET`}}",
    "not_a_secret": "plaintext",
    "foo": "bar"
  },

  "sensitive-variables": ["my_secret", "foo"],
  ...
}
```

上面的代码片段将与你不设置 "sensitive-variables" 时功能完全相同，除了 Packer UI 和日志将用 `<sensitive>` 替换 "bar" 和 "my_secret" 值的所有实例。这让你有信心不会意外地将密钥以纯文本打印到日志中。

## 技巧

### 使配置器步骤根据变量值有条件地执行

Packer 模板中没有特定的语法来根据变量的值使配置器步骤有条件地执行。但是，你可以通过在执行的命令中引用变量来做到这一点。例如，以下是如何使 `shell-local` 配置器仅在 `do_nexpose_scan` 变量非空时运行。

```json
{
  "type": "shell-local",
  "command": "if [ ! -z \"{{user `do_nexpose_scan`}}\" ]; then python -u trigger_nexpose_scan.py; fi"
}
```

### 使用 HOME 变量

为了使用 `$HOME` 变量，你可以在 Packer 中创建一个 `home` 变量：

```json
{
  "variables": {
    "home": "{{env `HOME`}}"
  }
}
```

这将在模板的其余部分中可用，即：

```json
{
  "builders": [
    {
      "type": "google",
      "account_file": "{{ user `home` }}/.secrets/gcp-{{ user `env` }}.json"
    }
  ]
}
```
