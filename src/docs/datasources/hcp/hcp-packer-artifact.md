---
description: |
  The `hcp-packer-artifact` data source retrieves information about an
  artifact from the HCP Packer Registry. Use the information to provide a source artifact to Packer builders.
title: hcp-packer-artifact data source reference
---

<Badge type="tip" text="Official" /> <Badge type="tip" text="HCP Packer Ready" />

# `hcp-packer-artifact`

The `hcp-packer-artifact` data source retrieves information about an
artifact from the HCP Packer Registry. Use this retrieved information to
provide a source artifact to various Packer builders.

To get started with HCP Packer, refer to the [HCP Packer documentation](https://developer.hashicorp.com/hcp/docs/packer) or try
the [Get Started with HCP Packer tutorials](https://developer.hashicorp.com/packer/tutorials/hcp-get-started).

::: warning
**Note:** You will receive an error if you try to reference metadata from a deactivated or deleted registry.
An administrator can manually deactivate or delete a registry, and HCP Packer automatically deactivates registries
with billing issues. Contact [HashiCorp Support](https://www.ibm.com/mysupport) with questions.
:::

## Revoked Versions

If an HCP Packer Version is revoked, the `hcp-packer-version` data source will fail and Packer won't proceed with
the build. Building new artifacts from a revoked artifact is not compliant.
Versions that are scheduled to be revoked will still be considered valid until the revocation date.

## Basic Example

Below is a fully functioning example. It stores information about an image artifact,
which can then be parsed and accessed as a variable.

```hcl
data "hcp-packer-artifact" "example" {
  bucket_name         = "hardened-ubuntu-16-04"
  version_fingerprint = "${data.hcp-packer-version.hardened-source.fingerprint}"
  platform            = "aws"
  region              = "us-east-1"
}
```

## Full Example

This data source can be used in conjunction with the hcp-packer-version
data source to retrieve a version fingerprint using a channel. You provide the version fingerprint and channel
name to the version data source, then use the version source inside the
artifact data source, then use the artifact data source inside your source block.

```hcl
# Retrieves information about the HCP Packer Version; a "version" can be
# thought of as all the metadata created by a single call of `packer build`.
data "hcp-packer-version" "hardened-source" {
  bucket_name  = "hardened-ubuntu-16-04"
  channel_name = "dev"
}

# Retrieves information about the HCP Packer Artifact; an artifact can be thought
# of as all the metadata (including the artifact names) created by a single
# "source" builder; this can include multiple artifacts so we provide a
# region to disambiguate.
data "hcp-packer-artifact" "example" {
  bucket_name         = "hardened-ubuntu-16-04"
  version_fingerprint = data.hcp-packer-version.hardened-source.fingerprint
  platform            = "aws"
  region              = "us-east-1"
}

# This source uses the output from a previous Packer build. By using the
# HCP Packer Registry in this way, you can easily create build pipelines where
# a single base artifact can be customized in multiple secondary layers.
source "amazon-ebs" "packer-secondary" {
  source_ami       = data.hcp-packer-artifact.example.external_identifier
  ...
}
```

## Configuration Reference

Configuration options are organized below into two categories: required and
optional. Within each category, the available options are alphabetized and
described.

### Required:

- `bucket_name` (string) - The name of the bucket your artifact is in.

- `channel_name` (string) - The name of the channel to use when retrieving your artifact.
  Either `channel_name` or `version_fingerprint` MUST be set.
  If using several artifacts from a single version, you may prefer sourcing a version first,
  and referencing it for subsequent uses, as every `hcp_packer_artifact` with the channel set will generate a
  potentially billable HCP Packer request, but if several `hcp_packer_artifact`s use a shared `hcp_packer_version`
  that will only generate one potentially billable request.

- `version_fingerprint` (string) - The fingerprint of the version to use when retrieving your artifact.
  Either this or `channel_name` MUST be set.
  Mutually exclusive with `channel_name`

- `platform` (string) - The name of the platform that your artifact is for.
  For example, "aws", "azure", or "gce".

- `region` (string) - The name of the region your artifact is in.
  For example "us-east-1".

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-artifact/data.go; -->

### Optional:

::: warning
**Note:** This data source only returns the first found artifact's metadata filtered by the given options,
from the returned list of artifacts associated with the specified version. Therefore, if multiple artifacts exist
in the same region, it will only pick one of them. In this case, you can filter artifact by a source build name
(Ex: `amazon-ebs.example`) using the `component_type` option.
:::

- `component_type` (string) - The specific Packer builder used to create the artifact.
  For example, "amazon-ebs.example"

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-artifact/data.go; -->

### Output Fields:

- `platform` (string) - The name of the platform that the artifact exists in.
  For example, "aws", "azure", or "gce".

- `component_type` (string) - The specific Packer builder or post-processor used to create the artifact.

- `created_at` (string) - The date and time at which the artifact was created.

- `build_id` (string) - The ID of the build that created the artifact. This is a ULID, which is a
  unique identifier similar to a UUID. It is created by the HCP Packer
  Registry when a build is first created, and is unique to this build.

- `version_id` (string) - The version ID. This is a ULID, which is a unique identifier similar
  to a UUID. It is created by the HCP Packer Registry when a version is
  first created, and is unique to this version.

- `channel_id` (string) - The ID of the channel used to query the version. This value will be empty if the `version_fingerprint` was used
  directly instead of a channel.

- `packer_run_uuid` (string) - The UUID associated with the Packer run that created this artifact.

- `external_identifier` (string) - Identifier or URL of the remote artifact as given by a build.
  For example, ami-12345.

- `region` (string) - The region as given by `packer build`. eg. "ap-east-1".
  For locally managed clouds, this may map instead to a cluster, server or datastore.

- `labels` (map[string]string) - The key:value metadata labels associated with this build.

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/hcp-packer-artifact/data.go; -->
