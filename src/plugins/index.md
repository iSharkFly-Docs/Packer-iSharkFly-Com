---
description: |
  Plugins are installable components of Packer
title: Packer plugins
---

# External Packer Plugins

External Packer plugins are standalone applications that extend Packer functionality without modifying the core source code. Plugins can add new components to Packer, such as builders, provisioners, post-processors, and data sources. Refer to [Packer Plugins](/docs/plugins/) for details about installing and developing external plugins.

This section contains the documentation for available external Packer plugins.

## Tiers and Namespaces

Packer plugins are published and maintained by a variety of sources, including
HashiCorp, and the Packer community. We use tiers and badges to
denote the source of a plugin. Additionally, namespaces are used to help users
identify the organization or publisher responsible for the integration, as shown
in the table below.

| Tier                             | Description                                                                                                                   | Namespace                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| <Badge type="tip" text="Official" />  | Official plugins are owned and maintained by HashiCorp.                                                                       | hashicorp                                                   |
| <Badge type="info" text="Verified" /> | Verified plugins are owned and maintained by third-party technology partners. Plugins in this tier indicate HashiCorp has verified the authenticity of the Plugin’s publisher, and that the partner is a member of the [HashiCorp Technology Partner Program](https://www.hashicorp.com/partners).| Third-party organization |
| <Badge type="info" text="Community" /> | Community providers are published by individual maintainers, groups of maintainers, or other members of the Packer community. | Third-party organization or maintainer's individual account |
| <Badge type="warning" text="Archived" /> | Archived plugins are plugins that are no longer maintained by HashiCorp, a partner, or the community. This may occur if an API is deprecated or interest was low. | hashicorp or third-party |


## HCP Packer Badge
<Badge type="tip" text="HCP Packer Ready" /> is present for plugins that HashiCorp has verified to communicate build status to the HCP Packer registry.
