---
title: aws_secretsmanager 函数参考
description: >-
  `aws_secretsmanager` 函数从 Amazon Secrets Manager 存储中检索密钥。了解如何在 Packer 模板中使用 `aws_secretsmanager` 函数。
---

# `aws_secretsmanager` 函数

可以从 [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) 读取密钥并在模板中作为本地变量使用。

::: warning
注意：AWS 密钥支持始终获取密钥的最新版本，即 AWSCURRENT。不支持密钥的先前版本。
:::

```hcl
aws_secretsmanager(name, key)
```

当 key 未设置（`null` 或空：`""`）时，`aws_secretsmanager` 返回存储在密钥 `name` 中的第一个密钥键。

你可以在 `locals` 块中使用此函数，或直接内联在你想要使用该值的地方。

```hcl
locals {
  secret = aws_secretsmanager("my_secret", null)
}

source "null" "first-example" {
  communicator = "none"
}

build {
  name = "my-build-name"
  sources = ["null.first-example"]

  provisioner "shell-local" {
    environment_vars = ["TESTVAR=${build.PackerRunUUID}"]
    inline = ["echo my_secret is '${local.secret}'",
              "echo my_secret using an inline call is '${aws_secretsmanager("my_secret", null)}'."]
  }
}
```

这将从 aws secrets manager 加载存储在 `my_secret` 后面的密钥。

可以通过将 `key` 指定为（`null` 或空：`""`）来获取单键密钥或明文密钥。

当获取具有多个键的密钥时，你可以将 `key` 设置为要获取的特定键。例如，给定以下具有两个键的密钥，如果 `key` 设置为 "shell"，`aws_secretsmanager` 将只返回其值。

```json
{
  "test": "kitchen",
  "shell": "powershell"
}
```

```hcl
locals {
  secret = aws_secretsmanager("multikey/secret", "shell")
}

source "null" "first-example" {
  communicator = "none"
}

build {
  name = "my-build-name"
  sources = ["null.first-example"]

  provisioner "shell-local" {
    environment_vars = ["TESTVAR=${build.PackerRunUUID}"]
    inline = ["echo my_secret is '${local.secret}'"]
  }
}
```

这将加载存储在 `multikey/secret` 后面的键 `"shell"` 中的值 `"powershell"`。

要使用此函数，你必须使用以下方法之一配置有效的 AWS 凭证：

- [环境变量](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html)
- [CLI 配置文件](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [容器凭证](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [实例配置文件凭证](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)
