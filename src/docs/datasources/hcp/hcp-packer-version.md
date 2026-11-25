---
description: |
  The `hcp-packer-version` data source retrieves information about
  an HCP Packer version from the HCP Packer registry. Use this information to
  get a source's external identifier.
title: hcp-packer-version data source reference
---

<Badge type="tip" text="Official" /> <Badge type="tip" text="HCP Packer Ready" />

# `hcp-packer-version`

The `hcp-packer-version` dsata source retrieves information about
an HCP Packer version from the HCP Packer registry. You can use the version information to
query HCP for a source's external identifier so that you can use it in various Packer builders.

To get started with HCP Packer, refer to the [HCP Packer documentation](https://developer.hashicorp.com/hcp/docs/packer) or try the
[Get Started with HCP Packer tutorials](https://developer.hashicorp.com/packer/tutorials/hcp-get-started).

Packer prints an error if you try to reference metadata from a deactivated or deleted registry.
An administrator can manually deactivate or delete a registry, and HCP Packer automatically deactivates registries with billing issues. Contact [HashiCorp Support](https://www.ibm.com/mysupport) with questions.

## Revoked Versions

If an HCP Packer Version is revoked, the `hcp-packer-version` data source will fail and Packer won't proceed with
the build. Building new artifacts from a revoked artifact is not compliant.
Versions that are scheduled to be revoked will still be considered valid until the revocation date.

## Basic Example

Below is a fully functioning example. It stores information about an HCP Packer Version, which can then be accessed as a variable.

```hcl
data "hcp-packer-version" "hardened-source" {
  bucket_name  = "hardened-ubuntu-16-04"
  channel_name = "dev"
}
```

## Full Example

This data source can be used in conjunction with the `hcp-packer-artifact`
data source to retrieve an artifact identifier. You provide the version fingerprint and channel
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

- `bucket_name` (string) - The bucket name in the HCP Packer Registry.

- `channel_name` (string) - The channel name in the given bucket to use for retrieving the version.

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-version/data.go; -->

There are currently no optional fields for this datasource, though we intend
to add filtering fields in the future.

### Output Fields:

- `author_id` (string) - Name of the author who created this version.

- `bucket_name` (string) - The name of the bucket that this version is associated with.

- `status` (string) - Current state of the version.

- `created_at` (string) - The date the version was created.

- `fingerprint` (string) - The fingerprint of the version; this is a  unique identifier set by the Packer build
  that created this version.

- `id` (string) - The version ID. This is a ULID, which is a unique identifier similar
  to a UUID. It is created by the HCP Packer Registry when a version is
  first created, and is unique to this version.

- `name` (string) - The version name is created by the HCP Packer Registry once a version is
  "complete". Incomplete or failed versions currently default to having a name "v0".

- `updated_at` (string) - The date when this version was last updated.

- `channel_id` (string) - The ID of the channel used to query this version.

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/hcp-packer-version/data.go; -->
