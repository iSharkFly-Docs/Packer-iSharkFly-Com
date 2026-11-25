---
description: |
  Builders create machines and generate images from them for various platforms. Learn about the types of builders you can use in your Packer templates.
title: Builders overview
---

# Builders overview

Builders create machines and generate images from those machines for various platforms. Some builders in Packer perform helper tasks, such as running provisioners.

Packer has the following types of builders:

- [Plugins](/plugins/): Plugins that you install have their own associated set of builders. For example, EC2, VMware, and VirtualBox use their own separate sets of builders.
- [`file`](/docs/builders/file): The `file` builder creates an artifact from a file.
- [`null`](/docs/builders/null): The `null` builder sets up an SSH connection and runs the provisioners.
- [Custom](/docs/plugins/creation/custom-builders): You can write new builders for new or existing platforms.
- [Community-supported](/docs/builders/community-supported): The Packer community develops and maintains builders for several additional platforms.

Refer to the [`source`](/docs/templates/hcl_templates/blocks/source) block documentation to learn more about configuring builders in the Packer templating language.


