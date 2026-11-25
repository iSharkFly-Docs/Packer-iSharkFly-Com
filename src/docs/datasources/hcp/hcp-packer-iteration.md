---
description: |
  The `hcp-packer-iteration` data source retrieves information about an iteration from the HCP Packer registry. This data source is deprecated. Use the `hcpe-packer-verion` data source instead.
title: hcp-packer-iteration data source reference
---

<Badge type="tip" text="Official" />

# `hcp-packer-iteration`

::: warning
**This data source is deprecated**. Use the [`hcp-packer-version`](/docs/datasources/hcp/hcp-packer-version) data source instead.
:::

The `HCP Packer Iteration` Data Source retrieves information about an
iteration from the HCP Packer registry. This information can be used to query
HCP for a source image for various Packer builders.

To get started with HCP Packer, refer to the [HCP Packer documentation](https://developer.hashicorp.com/hcp/docs/packer) or try the [Get Started with HCP Packer tutorials](https://developer.hashicorp.com/packer/tutorials/hcp-get-started).

::: warning
**Note:** You will receive an error if you try to reference metadata from a deactivated or deleted registry. An administrator can manually deactivate or delete a registry, and HCP Packer automatically deactivates registries with billing issues. Contact [HashiCorp Support](https://www.ibm.com/mysupport) with questions.
:::

## Revoked Iterations

If an iteration is revoked, the `hcp-packer-iteration` data source will fail and Packer won't proceed with the build. Building new images from a revoked image is not compliant.
Iterations that are scheduled to be revoked will still be considered valid until the revocation date.

## Basic Example

Below is a fully functioning example. It stores information about an image
iteration, which can then be accessed as a variable.

```hcl
data "hcp-packer-iteration" "hardened-source" {
  bucket_name = "hardened-ubuntu-16-04"
  channel = "packer-test"
}
```

## Full Example

This data source can be used in conjunction with the hcp-packer-image
data source to retrieve an image ID using a channel. You provide the channel
name to the iteration data source, then use the iteration source inside the
image data source, then use the image data source inside your source block.

```hcl
# Retrieves information about the HCP Packer "iteration"; an "iteration" can be
# thought of as all the metadata created by a single call of `packer build`.
data "hcp-packer-iteration" "hardened-source" {
  bucket_name = "hardened-ubuntu-16-04"
  channel = "packer-test"
}

# Retrieves information about the HCP Packer "image"; an image can be thought
# of as all the metadata (including the artifact names) created by a single
# "source" builder; this can include multiple images so we provide a cloud
# region to disambiguate.
data "hcp-packer-image" "foo" {
  bucket_name = "hardened-ubuntu-16-04"
  iteration_id = data.hcp-packer-iteration.hardened-source.id
  cloud_provider = "aws"
  region = "us-east-1"
}

# This source uses the output from a previous Packer build. By using the
# HCP Packer registry in this way, you can easily create build pipelines where
# a single base image can be customized in multiple secondary layers.
source "amazon-ebs" "packer-secondary" {
  source_ami       = data.hcp-packer-image.foo.id
  ...
}
```

## Configuration Reference

Configuration options are organized below into two categories: required and
optional. Within each category, the available options are alphabetized and
described.

### Required:

- `bucket_name` (string) - The name of the bucket your image is in.

- `channel` (string) - The name of the channel to use when retrieving your image

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-iteration/data.go; -->

There are currently no optional fields for this datasource, though we intend
to add filtering fields in the future.

### Output Fields:

- `author_id` (string) - who created the iteration

- `bucket_name` (string) - Name of the bucket that the iteration was retrieved from

- `complete` (bool) - If true, this iteration is considered "ready to use" and will be
  returned even if the include_incomplete flag is "false" in the
  list iterations request. Note that if you are retrieving an iteration
  using a channel, this will always be "true"; channels cannot be assigned
  to incomplete iterations.

- `created_at` (string) - The date the iteration was created.

- `fingerprint` (string) - The fingerprint of the build; this could be a git sha or other unique
  identifier as set by the Packer build that created this iteration.

- `id` (string) - The iteration ID. This is a ULID, which is a unique identifier similar
  to a UUID. It is created by the HCP Packer Registry when an iteration is
  first created, and is unique to this iteration.

- `incremental_version` (int32) - The version number assigned to an iteration. This number is an integer,
  and is created by the HCP Packer Registry once an iteration is
  marked "complete". If a new iteration is marked "complete", the version
  that HCP Packer assigns to it will always be the highest previous
  iteration version plus one.

- `updated_at` (string) - The date when this iteration was last updated.

- `channel_id` (string) - The ID of the channel used to query the image iteration.

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/hcp-packer-iteration/data.go; -->
