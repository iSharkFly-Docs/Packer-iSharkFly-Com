---
title: provenance 后处理器参考
description: '`provenance` 后处理器为 Packer 制品创建 SLSA 来源和软件物料清单证明。'
---

# `provenance` 后处理器

`provenance` 后处理器为输入制品创建 in-toto 证明。它可以创建软件制品供应链级别 (SLSA) 来源和软件物料清单 (SBOM) 证明。它还可以使用 PEM 密钥、密钥管理服务或 Sigstore 无密钥签名对它们进行签名。

## 示例

```hcl
post-processor "provenance" {
  build_type  = "https://packer.io/buildtypes/hcl2/v1"
  template    = "ubuntu.pkr.hcl"
  only_builds = ["qemu.ubuntu"]
  sbom        = true
}
```

## 配置

- `provenance`（boolean）- 是否发出来源证明。默认启用；设置为 `false` 可跳过后处理器并保持制品不变。

- `build_type`（string）- 记录在来源谓词中的 SLSA `buildType` URI。默认为 `https://packer.io/buildtypes/hcl2/v1`。

- `output_dir`（string）- 写入证明 sidecar 文件的目录。默认为包含制品第一个文件的目录，或者对于没有本地文件的制品使用当前目录。

- `template`（string）- 生成制品的 Packer 模板路径。作为外部参数记录在来源谓词中。

- `only_builds`（[]string）- 此制品来自的构建列表。作为外部参数记录在来源谓词中。

- `user_variables`（map[string]string）- 要作为外部参数记录在来源谓词中的其他用户变量。`packer_sensitive_variables` 中命名的变量值将被脱敏。

- `source_uri`（string）- 覆盖自动检测的源仓库 URI，该 URI 作为已解析的依赖项记录。默认情况下，源从包含当前工作目录的 Git 仓库或 CI 环境变量中检测。

- `sbom`（bool）- 是否同时在来源声明旁边生成软件物料清单 (SBOM) 和相应的 SBOM 证明。

- `sbom_format`（string）- SBOM 输出格式，可以是 `cyclonedx`（默认）或 `spdx`。

- `sbom_scan_path`（string）- 生成 SBOM 时要扫描的路径。默认为制品的文件或它们的公共父目录。当制品文件跨越多个目录时必需。

- `sbom_scope`（string）- SBOM 扫描范围，可以是 `squashed`（默认）或 `all-layers`。

- `sbom_exclude`（[]string）- 要从 SBOM 扫描中排除的路径的 glob 模式。

- `signing_mode`（string）- 证明的签名模式：`none`（默认，未签名的 JSON）、`key`（本地 PEM 密钥）、`kms`（KMS 或 Vault URI）或 `keyless`（Sigstore Fulcio）。

- `signer`（string）- 签名者引用。对于 `key` 模式是 PEM 私钥路径，对于 `kms` 模式是 KMS 或 Vault URI，如 `awskms://...`、`gcpkms://...`、`azurekms://...` 或 `hashivault://...`。

- `key`（string）- `signer` 的别名。当两者都设置时，它们必须相等。

- `verifier`（string）- 在 `key` 和 `kms` 模式中用于验证签名的 PEM 验证器路径。默认为签名者的派生公钥。

- `fulcio_url`（string）- 用于 `keyless` 签名的 Fulcio 证书颁发机构 URL。默认为 `https://fulcio.sigstore.dev`。

- `rekor_url`（string）- 当启用 `upload_tlog` 时使用的 Rekor 透明日志 URL。默认为 `https://rekor.sigstore.dev`。

- `upload_tlog`（bool）- 是否将 `keyless` 签名上传到 Rekor 透明日志并发出携带透明证据的 Sigstore 包。

- `trusted_root_path`（string）- 用于固定无密钥验证的 Sigstore trusted-root JSON 文件的可选路径。未设置时，将获取公共 Sigstore 可信根。

- `keyless_identity`（string）- `keyless` 模式的预期签名身份，如工作流引用 `https://github.com/OWNER/REPO/.github/workflows/build.yml@refs/heads/main`。无密钥签名必需。

- `keyless_oidc_issuer`（string）- `keyless` 模式的预期 OIDC 发行者，如 `https://token.actions.githubusercontent.com`。无密钥签名必需。

<!-- End of code generated from the comments of the Config struct in post-processor/provenance/post-processor.go; -->

## 输出文件

后处理器在制品旁边写入 sidecar 文件，或在 `output_dir` 参数指定的目录中。sidecar 文件以制品命名。例如，Packer 可能为名为 `image` 的制品创建以下文件：

- `image.provenance.json` - SLSA 来源证明。
- `image.provenance.sigstore.json` - Sigstore 包，当 `signing_mode = "keyless"` 时写入。
- `image.sbom.cdx.json` 或 `image.sbom.spdx.json` - 原始 SBOM，当 `sbom = true` 时写入。
- `image.sbom.att.json` - SBOM 证明，当 `sbom = true` 时写入。

## 验证证明

使用 [`packer verify-attestation`](/docs/commands/verify-attestation) 命令验证已签名的证明。对于无密钥签名，提供 Sigstore 包、预期的签名身份和 OIDC 发行者，并在你的策略需要透明日志证据时要求 Rekor 验证。
以下示例使用 `packer verify-attestation` 命令通过无密钥签名验证证明：

```shell
packer verify-attestation \
  -signing-mode=keyless \
  -bundle=image.provenance.sigstore.json \
  -require-rekor \
  -keyless-identity="https://github.com/OWNER/REPO/.github/workflows/build.yml@refs/heads/main" \
  -keyless-oidc-issuer="https://token.actions.githubusercontent.com" \
  image.provenance.json
```
