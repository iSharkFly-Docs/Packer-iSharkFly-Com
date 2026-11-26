---
title: aws_secretsmanager_raw 函数参考
description: '`aws_secretsmanager_raw` 函数检索 Amazon Web Services Secrets Manager 密钥的原始值，以便在 Packer 模板中使用。'
---

# `aws_secretsmanager_raw` 函数

`aws_secretsmanager_raw` 函数从 Amazon Web Services (AWS) Secrets Manager 检索密钥的原始值。

```hcl
aws_secretsmanager_raw(NAME)
```

该函数将明文密钥作为字符串返回。对于键值密钥，它返回原始 JSON 值。当你需要完整的密钥值而不是单个键时，请使用此函数。

## 示例

```hcl
locals {
  database_credentials = jsondecode(
    aws_secretsmanager_raw("production/database")
  )
}
```

要使用此函数，你必须使用以下方法之一配置有效的 AWS 凭证：

- [环境变量](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html)
- [CLI 配置文件](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [容器凭证](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [实例配置文件凭证](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)

## 相关函数

- [`aws_secretsmanager`](/docs/templates/hcl_templates/functions/contextual/aws_secretsmanager) 从键值密钥中检索一个键。
- [`jsondecode`](/docs/templates/hcl_templates/functions/encoding/jsondecode) 将原始 JSON 值转换为对象。
