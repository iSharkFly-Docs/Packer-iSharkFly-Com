---
title: provenance post-processor reference
description: The `provenance` post-processor creates SLSA provenance and software bill of materials attestations for Packer artifacts.
---

# `provenance` post-processor

The `provenance` post-processor creates in-toto attestations for an input
artifact. It can create Supply-chain Levels for Software Artifacts (SLSA) provenance
and software bill of materials (SBOM) attestations. It can also sign them with a PEM key,
a key management service, or Sigstore keyless signing.

## Example

```hcl
post-processor "provenance" {
  build_type  = "https://packer.io/buildtypes/hcl2/v1"
  template    = "ubuntu.pkr.hcl"
  only_builds = ["qemu.ubuntu"]
  sbom        = true
}
```

## Configuration

- `provenance` (boolean) - Whether to emit provenance attestations. Enabled by default; set to
  `false` to skip the post-processor and pass the artifact through unchanged.

- `build_type` (string) - The SLSA `buildType` URI recorded in the provenance predicate. Defaults to
  `https://packer.io/buildtypes/hcl2/v1`.

- `output_dir` (string) - Directory where attestation sidecar files are written. Defaults to the
  directory containing the artifact's first file, or the current directory
  for artifacts without local files.

- `template` (string) - Path to the Packer template that produced the artifact. Recorded as an
  external parameter in the provenance predicate.

- `only_builds` ([]string) - The list of builds this artifact came from. Recorded as an external
  parameter in the provenance predicate.

- `user_variables` (map[string]string) - Additional user variables to record as external parameters in the
  provenance predicate. Values for variables named in
  `packer_sensitive_variables` are redacted.

- `source_uri` (string) - Overrides the auto-detected source repository URI recorded as a resolved
  dependency. By default the source is detected from the Git repository
  containing the current working directory or from CI environment variables.

- `sbom` (bool) - Whether to also generate a software bill of materials (SBOM) and a
  corresponding SBOM attestation alongside the provenance statement.

- `sbom_format` (string) - The SBOM output format, either `cyclonedx` (default) or `spdx`.

- `sbom_scan_path` (string) - The path to scan when generating the SBOM. Defaults to the artifact's
  files or their common parent directory. Required when the artifact files
  span multiple directories.

- `sbom_scope` (string) - The SBOM scan scope, either `squashed` (default) or `all-layers`.

- `sbom_exclude` ([]string) - Glob patterns of paths to exclude from the SBOM scan.

- `signing_mode` (string) - The signing mode for attestations: `none` (default, unsigned JSON),
  `key` (local PEM key), `kms` (KMS or Vault URI), or `keyless` (Sigstore
  Fulcio).

- `signer` (string) - The signer reference. A PEM private key path for `key` mode, or a KMS or
  Vault URI such as `awskms://...`, `gcpkms://...`, `azurekms://...`, or
  `hashivault://...` for `kms` mode.

- `key` (string) - An alias for `signer`. When both are set they must be equal.

- `verifier` (string) - The PEM verifier path used to verify the signature in `key` and `kms`
  modes. Defaults to the signer's derived public key.

- `fulcio_url` (string) - The Fulcio certificate authority URL used for `keyless` signing. Defaults
  to `https://fulcio.sigstore.dev`.

- `rekor_url` (string) - The Rekor transparency log URL used when `upload_tlog` is enabled.
  Defaults to `https://rekor.sigstore.dev`.

- `upload_tlog` (bool) - Whether to upload the `keyless` signature to the Rekor transparency log
  and emit a Sigstore bundle carrying the transparency evidence.

- `trusted_root_path` (string) - An optional path to a Sigstore trusted-root JSON file used to pin keyless
  verification. When unset, the public Sigstore trusted root is fetched.

- `keyless_identity` (string) - The expected signing identity for `keyless` mode, such as the workflow
  ref `https://github.com/OWNER/REPO/.github/workflows/build.yml@refs/heads/main`.
  Required for keyless signing.

- `keyless_oidc_issuer` (string) - The expected OIDC issuer for `keyless` mode, such as
  `https://token.actions.githubusercontent.com`. Required for keyless signing.

<!-- End of code generated from the comments of the Config struct in post-processor/provenance/post-processor.go; -->

## Output files

The post-processor writes sidecar files next to the artifact, or in
directory specified in the `output_dir` argument. The sidecar files are named after the artifact. 
For example, Packer could creates the following files for an artifact named `image`:

- `image.provenance.json` - the SLSA provenance attestation.
- `image.provenance.sigstore.json` - the Sigstore bundle, written when
  `signing_mode = "keyless"`.
- `image.sbom.cdx.json` or `image.sbom.spdx.json` - the raw SBOM, written
  when `sbom = true`.
- `image.sbom.att.json` - the SBOM attestation, written when `sbom = true`.

## Verify an attestation

Use the [`packer verify-attestation`](/docs/commands/verify-attestation) command to
verify a signed attestation. For keyless signing, provide the Sigstore bundle,
the expected signing identity and OIDC issuer, and require Rekor verification
when your policy requires transparency-log evidence.
The following example uses the `packer verify-attestation` command to verify an attestation using keyless signing:

```shell
packer verify-attestation \
  -signing-mode=keyless \
  -bundle=image.provenance.sigstore.json \
  -require-rekor \
  -keyless-identity="https://github.com/OWNER/REPO/.github/workflows/build.yml@refs/heads/main" \
  -keyless-oidc-issuer="https://token.actions.githubusercontent.com" \
  image.provenance.json
```
