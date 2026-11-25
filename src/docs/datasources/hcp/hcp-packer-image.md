---
description: |
  The `hcp-packer-image` data source retrieves information about an image from the HCP Packer registry. This data source is deprecated, use the `hcp-packer-artifact` data source instead.
title: hcp-packer-image data source reference
---

<Badge type="tip" text="Official" />

# `hcp-packer-image`

::: warning
**This data source is deprecated**. Use the [`hcp-packer-artifact`](/docs/datasources/hcp/hcp-packer-artifact) data source instead.
:::

The `hcp-packer-image` data source retrieves information about an
image from the HCP Packer registry. This information can be used to
provide a source image to various Packer builders.

To get started with HCP Packer, refer to the [HCP Packer documentation](https://developer.hashicorp.com/hcp/docs/packer) or try the [Get Started with HCP Packer tutorials](https://developer.hashicorp.com/packer/tutorials/hcp-get-started).

::: warning
**Note:** You will receive an error if you try to reference metadata from a deactivated or deleted registry. An administrator can manually deactivate or delete a registry, and HCP Packer automatically deactivates registries with billing issues. Contact [HashiCorp Support](https://www.ibm.com/mysupport) with questions.
:::

## Revoked Iterations

If an iteration is revoked, the `hcp-packer-iteration` data source will fail and Packer won't proceed with the build. Building new images from a revoked image is not compliant.
Iterations that are scheduled to be revoked will still be considered valid until the revocation date.

## Basic Example

Below is a fully functioning example. It stores information about an image,
which can then be parsed and accessed as a variable.

```hcl
data "hcp-packer-image" "example" {
  bucket_name = "hardened-ubuntu-16-04"
  iteration_id = "${data.hcp-packer-iteration.hardened-source.id}"
  cloud_provider = "aws"
  region = "us-east-1"
}
```

## Full Example

This data source can be used in conjunction with the hcp-packer-iteration
data source to retrieve an image ID using a channel. You provide the channel
name to the iteration data source, then use the iteration source in the image
data source, then use the image data source inside your source block.

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
  # ...
}
```

## Configuration Reference

Configuration options are organized below into two categories: required and
optional. Within each category, the available options are alphabetized and
described.

### Required:

- `bucket_name` (string) - The name of the bucket your image is in.

- `channel` (string) - The name of the channel to use when retrieving your image.
  Either this or `iteration_id` MUST be set.
  Mutually exclusive with `iteration_id`.
  If using several images from a single iteration, you may prefer
  sourcing an iteration first, and referencing it for subsequent uses,
  as every `hcp-packer-image` with the channel set will generate a
  potentially billable HCP Packer request, but if several
  `hcp-packer-image`s use a shared `hcp-packer-iteration` that will
  only generate one potentially billable request.

- `iteration_id` (string) - The ID of the iteration to use when retrieving your image
  Either this or `channel` MUST be set.
  Mutually exclusive with `channel`

- `cloud_provider` (string) - The name of the cloud provider that your image is for. For example,
  "aws" or "gce".

- `region` (string) - The name of the cloud region your image is in. For example "us-east-1".

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-image/data.go; -->

### Optional:

::: warning
**Note:** This data source only returns the first found image's metadata filtered by the given options, from the returned list of images associated with the specified iteration. Therefore, if multiple images exist in the same region, it will only pick one of them. In this case, you can filter images by a source build name (Ex: `amazon-ebs.example`) using the `component_type` option.
:::

- `component_type` (string) - The specific Packer builder used to create the image.
  For example, "amazon-ebs.example"

<!-- End of code generated from the comments of the Config struct in datasource/hcp-packer-image/data.go; -->

### Output Fields:

- `cloud_provider` (string) - The name of the cloud provider that the image exists in. For example,
  "aws", "azure", or "gce".

- `component_type` (string) - The specific Packer builder or post-processor used to create the image.

- `created_at` (string) - The date and time at which the image was created.

- `build_id` (string) - The ID of the build that created the image. This is a ULID, which is a
  unique identifier similar to a UUID. It is created by the HCP Packer
  Registry when an build is first created, and is unique to this build.

- `iteration_id` (string) - The iteration ID. This is a ULID, which is a unique identifier similar
  to a UUID. It is created by the HCP Packer Registry when an iteration is
  first created, and is unique to this iteration.

- `channel_id` (string) - The ID of the channel used to query the image iteration. This value will be empty if the `iteration_id` was used
  directly instead of a channel.

- `packer_run_uuid` (string) - The UUID associated with the Packer run that created this image.

- `id` (string) - ID or URL of the remote cloud image as given by a build.

- `region` (string) - The cloud region as given by `packer build`. eg. "ap-east-1".
  For locally managed clouds, this may map instead to a cluster, server
  or datastore.

- `labels` (map[string]string) - The key:value metadata labels associated with this build.

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/hcp-packer-image/data.go; -->
