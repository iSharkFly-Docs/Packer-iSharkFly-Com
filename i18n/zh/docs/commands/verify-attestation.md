---
title: packer verify-attestation 命令参考
description: "`packer verify-attestation` 命令验证签名的 DSSE 证明，并可以执行来源策略检查。"
---

# `packer verify-attestation` 命令

`packer verify-attestation` 命令验证签名的 DSSE 证明。你还可以要求预期的谓词类型、构建器身份、源 URI 或制品摘要。

## 用法

```shell
packer verify-attestation [OPTIONS] ATTESTATION
```

`ATTESTATION` 必须是 DSSE 证明文件的路径。

## 选项

- `-signing-mode` - 签名模式：`key`、`kms` 或 `keyless`。Packer 会在可能的情况下检测模式。
- `-key` - PEM 密钥路径、KMS URI 或 Vault URI。
- `-verifier` - PEM 验证器路径。
- `-predicate-type` - 预期的证明谓词类型。
- `-builder-id` - 预期的 SLSA 构建器 ID。
- `-source-uri` - 预期的解析源 URI。
- `-artifact` - 用于匹配证明主题的制品路径。
- `-trusted-root-path` - 用于无密钥验证的 Sigstore 可信根 JSON 文件的路径。
- `-keyless-identity` - 预期的无密钥签名身份。
- `-keyless-oidc-issuer` - 用于无密钥签名的预期 OpenID Connect (OIDC) 发行者。
- `-bundle` - 用于 Rekor 或时间戳验证的 Sigstore bundle JSON 文件的路径。
- `-require-rekor` - 要求从 bundle 进行 Rekor 透明日志验证。
- `-require-timestamp` - 要求来自 Rekor 集成时间或 RFC 3161 证据的可信观察者时间戳。

## 示例

以下命令验证使用 PEM 密钥签名的证明：

```shell
packer verify-attestation \
  -signing-mode=key \
  -verifier=keys/provenance-signing.pub.pem \
  provenance.intoto.json
```
