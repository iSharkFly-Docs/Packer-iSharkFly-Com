---
title: vault 函数参考
description: '`vault` 函数从 HashiCorp Vault KV 存储中检索密钥。了解如何在 Packer 模板中使用 `vault` 函数。'
---

# `vault` 函数

从 HashiCorp Vault KV 存储中检索密钥。Packer 可以读取密钥并将它们作为用户变量添加到你的模板中。`vault` 函数仅在用户变量的默认值中可用，允许你将用户变量默认为 vault 密钥。

有关 Vault KV 存储的更多信息，请参阅 [Vault 文档](https://developer.hashicorp.com/vault/docs/commands/kv)。

使用 v2 kv 引擎的示例：

如果你使用 `vault kv put secret/hello foo=world` 在 vault 中存储一个值，你可以使用以下方式访问它：

```hcl
locals {
    foo = vault("/secret/data/hello", "foo")
}
```

这将把 `local.foo` 赋值为 "world"

使用 v1 kv 引擎的示例：

如果你使用以下方式在 vault 中存储一个值：

    vault secrets enable -version=1 -path=secrets kv
    vault kv put secrets/hello foo=world

你可以使用以下方式访问它：

```hcl
locals {
    foo = vault("secrets/hello", "foo")
}
```

此示例访问 Vault 路径 `secret/foo` 并返回存储在键 `foo` 中的值，将其存储为本地变量 `local.foo`。

如果 Vault 密钥包含高度敏感的值，可以使用 `local` 块（不要与 `locals` 块混淆）将值标记为敏感。

```hcl
local "foo" {
    expression = vault("secrets/hello", "foo")
    sensitive  = true
}
```

`local` 块示例访问 Vault 路径 `secrets/foo` 并返回存储在键 `foo` 中的值，将其存储为本地变量 `local.foo`。但是，新存储的本地变量的输出将从 Packer 构建输出中过滤，并替换为值 `<sensitive>`。有关更多详细信息，请参阅[本地值](/docs/templates/hcl_templates/locals)。

## 用法

为了使 Vault 函数工作，你必须将环境变量 `VAULT_TOKEN` 和 `VAULT_ADDR` 设置为有效值。

::: info
**注意：** HCL 函数可以在本地变量定义中使用，或与配置器/后处理器内联使用。它们不能在全局变量定义中使用。
:::

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
