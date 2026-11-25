---
description: |
  Community-maintained builders are not part of the core Packer binary, but
  can run alongside Packer with minimal extra effort.
title: Community - Builders
---

# Community Builders

The following builders are developed and maintained by various members of the
Packer community, not by HashiCorp. For more information on how to use community
builders, see our docs on [extending Packer](/docs/plugins/creation/).

### Community Builders

- ARM builders

  - [packer-builder-arm-image](https://github.com/solo-io/packer-builder-arm-image) - simple builder lets you extend on existing system images.
  - [packer-builder-arm](https://github.com/mkaczanowski/packer-builder-arm) - flexible builder lets you extend or build images from scratch with variety of options (ie. custom partition table).

- [Exoscale builder](https://github.com/exoscale/packer-plugin-exoscale) - A builder to create Exoscale custom templates based on a Compute instance snapshot.

- [Huawei Cloud ECS builder](https://github.com/huaweicloud/packer-builder-huaweicloud-ecs) - Plugin for creating [Huawei Cloud ECS](https://www.huaweicloud.com/intl/en-us/) images.

- [UpCloud builder](https://github.com/UpCloudLtd/packer-plugin-upcloud) - A suite of Packer plugins for provisioning Upcloud servers.

- [Vultr builder](https://github.com/vultr/packer-builder-vultr) - A builder for creating [Vultr](https://www.vultr.com/) snapshots.

- [Citrix XenServer/Citrix Hypervisor](https://github.com/xenserver/packer-builder-xenserver) - Plugin for creating [Citrix XenServer/Citrix Hypervisor](https://xenserver.org/) images from an iso image or from an existing template.
