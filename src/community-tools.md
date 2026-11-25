---
title: Download Packer Community Projects
description: >-
  Packer has a vibrant community of contributors who have built a number of
  great tools on top of Packer. There are also quite a few projects
  demonstrating the power of Packer templates.
---

# Download Community Projects

Packer has a vibrant community of contributors who have built a number of great
tools on top of Packer. There are also quite a few projects demonstrating the
power of Packer templates.

## Third-Party plugins

The plugins listed below have been built by the community of Packer users and
vendors. These plugins are not officially tested nor officially maintained by
HashiCorp, and are listed here in order to help users find them easily.

To learn more about how to use community plugins, or how to build your own,
check out the docs on [extending Packer](/docs/plugins/)

If you have built a plugin and would like to add it to this community list,
please make a pull request to the website so that we can document your
contribution here!

### Community Builders

- ARM builders

  - [packer-builder-arm-image](https://github.com/solo-io/packer-builder-arm-image) - simple builder lets you extend on existing system images.
  - [packer-builder-arm](https://github.com/mkaczanowski/packer-builder-arm) - flexible builder lets you extend or build images from scratch with variety of options (ie. custom partition table).

- [Exoscale builder](https://github.com/exoscale/packer-plugin-exoscale) - A builder to create Exoscale custom templates based on a Compute instance snapshot.

- [Huawei Cloud ECS builder](https://github.com/huaweicloud/packer-builder-huaweicloud-ecs) - Plugin for creating [Huawei Cloud ECS](https://www.huaweicloud.com/intl/en-us/) images.

- [UpCloud builder](https://github.com/UpCloudLtd/packer-plugin-upcloud) - A suite of Packer plugins for provisioning Upcloud servers.

- [Vultr builder](https://github.com/vultr/packer-builder-vultr) - A builder for creating [Vultr](https://www.vultr.com/) snapshots.

- [Citrix XenServer/Citrix Hypervisor](https://github.com/xenserver/packer-builder-xenserver) - Plugin for creating [Citrix XenServer/Citrix Hypervisor](https://xenserver.org/) images from an iso image or from an existing template.

### Community Provisioners

- [Comment Provisioner](https://github.com/SwampDragons/packer-provisioner-comment) -
  Example provisioner that allows you to annotate your build with bubble-text
  comments.

- [Windows Update provisioner](https://github.com/rgl/packer-provisioner-windows-update) -
  A provisioner for gracefully handling windows updates and the reboots they
  cause.

### Community Post-Processors

- [Exoscale Import post-processor](https://github.com/exoscale/packer-plugin-exoscale) - A post-processor to import Exoscale custom templates from disk image files.

## Templates

- [bento](https://github.com/chef/bento) - Packer templates for building minimal
  Vagrant base boxes

- [boxcutter](https://github.com/boxcutter) - Community-driven templates and
  tools for creating cloud, virtual machines, containers and metal operating
  system environments

- [packer-build](https://github.com/tylert/packer-build) - Build fresh Debian
  and Ubuntu virtual machine images for Vagrant, VirtualBox and QEMU

- [packer-windows](https://github.com/joefitzgerald/packer-windows) - Windows
  Packer Templates

- [packer-baseboxes](https://github.com/taliesins/packer-baseboxes) - Templates
  for Packer to build base boxes

- [cbednarski/packer-ubuntu](https://github.com/cbednarski/packer-ubuntu) -
  Ubuntu LTS Virtual Machines for Vagrant

- [geerlingguy/packer-ubuntu-1604](https://github.com/geerlingguy/packer-ubuntu-1604)
  \- Ubuntu 16.04 minimal Vagrant Box using Ansible provisioner

- [jakobadam/packer-qemu-templates](https://github.com/jakobadam/packer-qemu-templates)
  \- QEMU templates for various operating systems

* [lucidone/baseliner](https://git.sr.ht/~lucidone/baseliner) - Example of using
  QEMU + Ansible with Packer

## Wrappers

- [packer-config](https://github.com/ianchesal/packer-config) - a Ruby model that lets you build Packer configurations in Ruby
- [racker](https://github.com/aspring/racker) - an opinionated Ruby DSL for generating Packer templates
- [packerlicious](https://github.com/mayn/packerlicious) - a python library for generating Packer templates
- [packer.py](https://github.com/mayn/packer.py) - a python library for executing Packer CLI commands

## Other

- [suitcase](https://github.com/tmclaugh/suitcase) - Packer based build system for CentOS OS images
- [Undo-WinRMConfig](https://cloudywindows.io/post/winrm-for-provisioning-close-the-door-on-the-way-out-eh/) - Open source automation to stage WinRM reset to pristine state at next shtudown
