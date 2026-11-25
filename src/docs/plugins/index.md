---
description: |
  Packer Plugins allow new functionality to be added to Packer without modifying
  the core source code. Packer plugins are able to add new builders,
  provisioners, hooks, and more.
title: Plugins
---

# Packer Plugins

Packer Plugins allow new functionality to be added to Packer without modifying
the core source code. Packer plugins are able to add new components to Packer,
such as builders, provisioners, post-processors, and data sources.

This page documents how to install plugins.

If you're interested in developing plugins, see the [developing
plugins](/docs/plugins/creation/#developing-plugins) page.

The current official listing of community-written plugins can be found
[here](/community-tools#third-party-plugins); if you have written a Packer
plugin, please reach out to us so we can add your plugin to the website.

## How Plugins Work

Packer plugins are completely separate, standalone applications that the core
of Packer starts and communicates with. Even the components that ship with the
Packer core (core builders, provisioners, and post-processors) are implemented
in a similar way and run as though they are standalone plugins.

These plugin applications aren't meant to be run manually. Instead, Packer core
launches and communicates with them. The next time you run a Packer build,
look at your process list and you should see a handful of `packer-` prefixed
applications running. One of those applications is the core; the rest are
plugins -- one plugin process is launched for each component used in a Packer
build.

## Tiers and Namespaces

Packer plugins are published and maintained by a variety of sources, including HashiCorp, and the Packer community. The Packer website uses tiers and badges to denote the source of a provider. Additionally, namespaces are used to help users identify the organization or publisher responsible for the integration, as shown in the table below.

| Tier                                 | Description                                                                                                                   | Namespace                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Official**  | Official plugins are owned and maintained by HashiCorp.                                                                       | hashicorp                                                   |
| **Community** | Community providers are published by individual maintainers, groups of maintainers, or other members of the Packer community. | Third-party organization or maintainer's individual account |

## Installing Plugins

Currently, you do not need to install plugins for builder, provisioner, or
post-processor components documented on the Packer website; these components
ship with the Packer core and Packer automatically knows how to find and launch
them. These instructions are for installing custom components that are not
bundled with the Packer core.

The below tabs reference "multi-component" and "single-component" plugins. If
you are not sure what kind of plugin you are trying to install, the easiest way
to find out is to check the name. If the name starts with `packer-plugin-`, then
it is a multi-component plugin. If the name starts with a prefix that actually
says the component type (e.g. `packer-provisioner-` or `packer-builder`), then
it is a single-component plugin.

<Tabs :tabs="[{label:'Packer init (from Packer v1.7.0)',value:'t0'},{label:'manually (multi-component plugin)',value:'t1'},{label:'manually (single-component plugin)',value:'t2'}]">

<TabItem value="t0">

::: warning
**Note**: Only _multi-component plugin binaries_ -- that is plugins named
packer-plugin-\*, like the `packer-plugin-amazon` -- are expected to work with
Packer init. The legacy `builder`, `post-processor` and `provisioner` plugin
types will keep on being detected but Packer cannot install them automatically.
If a plugin you use has not been upgraded to use the multi-component plugin
architecture, contact your maintainer to request an upgrade.
:::

### Create a required_plugins block

1. Add a
   [`required_plugins`](/docs/templates/hcl_templates/blocks/packer#specifying-plugin-requirements)
   block to your [packer block](/docs/templates/hcl_templates/blocks/packer). Each block will tell Packer what version(s) of a
   particular plugin can be installed. Make sure to set a valid [version
   constraint string](/docs/templates/hcl_templates/blocks/packer#version-constraints).

Here is an example `required_plugins` block:

```hcl
packer {
  required_plugins {
    myawesomecloud = {
      version = ">= 2.7.0"
      source = "github.com/azr/myawesomecloud"
    }
    happycloud = {
      version = ">= 1.1.3"
      source = "github.com/azr/happycloud"
    }
  }
}
```

2. Run [`packer init`](/docs/commands/init) from your project directory (the
   directory containing your Packer templates) to install all missing plugin
   binaries. Given the above example, Packer will try to look for a GitHub
   repository owned by user or organization `azr` named
   `packer-plugin-myawesomecloud` and `packer-plugin-happycloud`.

## Names and Addresses

Each plugin has two identifiers:

- A `source` address, which is only necessary when requiring a plugin outside the HashiCorp domain.
- A unique **local name**, which is used everywhere else in a Packer
  configuration.

### Local Names

Local names allow you to access the components of a plugin and must be unique
per configuration.

This is best explained using an example. In the above `required_plugins` block,
we declared the local name "myawesomecloud" for the plugin `azr/myawesomecloud`.
If the "myawesomecloud" plugin contains both an "ebs" builder and an "import"
post-processor, then the builder will be accessed in a source block by using:

```hcl
source "myawesomecloud-ebs" "example" {
  // builder configuration...
}
```

similarly, the import post-processor would be accessed by declaring the
post-processor block:

```hcl
post-processor "myawesomecloud-import" {
  // post-processor configuration...
}
```

If we change the required_plugins block to use a different local name "foo":

```hcl
  required_plugins {
    foo = {
      version = ">= 2.7.0"
      source = "github.com/azr/myawesomecloud"
    }
  }
```

Then we'd instead access that builder using the source:

```hcl
source "foo-ebs" "example" {
  // builder configuration...
}
```

## Source Addresses

A plugin's source address is its global identifier. It also tells Packer where
to download it.

Source addresses consist of three parts delimited by slashes (`/`), as
follows:

`<HOSTNAME>/<NAMESPACE>/<TYPE>`

- **Hostname:** The hostname of the location/service that
  distributes the plugin. Currently, the only valid "hostname" is github.com,
  but we plan to eventually support plugins downloaded from other domains.

- **Namespace:** An organizational namespace within the specified host.
  This often is the organization that publishes the plugin.

- **Type:** A short name for the platform or system the plugin manages. The
  type is usually the plugin's preferred local name.

For example, the fictional `myawesomecloud` plugin could belong to the
`hashicorp` namespace on `github.com`, so its `source` could be
`github.com/hashicorp/myawesomecloud`,
Note: the actual _repository_ that myawesomecloud comes from must always have
the name format `github.com/hashicorp/packer-plugin-myawesomecloud`, but the
`required_plugins` block omits the redundant `packer-plugin-` repository prefix
for brevity.

The source address with all three components given explicitly is called the
plugin's _fully-qualified address_. You will see fully-qualified address in
various outputs, like error messages.

## Plugin location

Plugins will usually be located in the
[PACKER_HOME_DIR](/docs/configure#packer-s-home-directory).

* [`packer init`](/docs/commands/init) will install plugins in the **last** directory
in the following numbered list.

* During the initialization of Packer, any plugin required in the
**`required_plugins`** section will be looked up in all entries of the following
list. **First** plugin found takes precedence. Two binaries of the same plugin
with two different version will be considered as two different plugins. Highest
found version matching `required_plugins` will be taken into consideration.

1. The directory where `packer` is, or the executable directory.
1. The current working directory. (`"."`)
1. The `PACKER_HOME_DIR/plugins` directory. PACKER_HOME_DIR refers to *[Packer's home
directory](/docs/configure#packer-s-home-directory)*, if it could be found.
1. The director(y/ies) under the `PACKER_PLUGIN_PATH` env var, if `PACKER_PLUGIN_PATH`
is set.

::: warning
**Note**: There can be more than one directory in the `PACKER_PLUGIN_PATH`
env var, it will be seperated by a semicolon (`;`) on Windows systems and a
colon (`:`) on other systems. The order priority will be kept.
:::

Using the following example :
```hcl
    required_plugins {
      happycloud = {
        version = ">= 2.7.0"
        source = "github.com/azr/happycloud"
      }
    }
```

The plugin getter will then install the binaries in the following location for a
system with no `PACKER_PLUGIN_PATH` env var set.

* `PACKER_HOME_DIR/plugins/github.com/hashicorp/happycloud/`

During initialization, on a `darwin_amd64` system, Packer will look-up for the
following files:

* `PACKER_EXEC_DIR/github.com/azr/happycloud/packer-plugin-happycloud_*_x5.0_darwin_amd64`
* `./github.com/azr/happycloud/packer-plugin-happycloud_*_x5.0_darwin_amd64`
* `PACKER_HOME_DIR/plugins/github.com/azr/happycloud/packer-plugin-happycloud_*_x5.0_darwin_amd64`
* `PACKER_PLUGIN_PATH/github.com/azr/happycloud/packer-plugin-happycloud_*_x5.0_darwin_amd64`
* `./packer-plugin-happycloud`

The first plugin-name/version files found will take precedence.

For plugins located under the `github.com/azr/happycloud/` directory structure an accompanying SHA256SUM file
will be required in order for `packer init` to ensure the plugin being loaded has not been tampered with.
The SHA256SUM file will be automatically generated when a plugin is installed via `packer init` if the plugin
was installed manually into `PACKER_HOME_DIR/plugins/github.com/azr/happycloud/` then the file
`PACKER_HOME_DIR/plugins/github.com/azr/happycloud/packer-plugin-happycloud_*_x5.0_darwin_amd64_SHA256SUM` must be generated manually as well.

::: info
Note: `PACKER_HOME_DIR` is not an actual env var and refers to [Packer's home
directory](#packer-s-home-directory). `PACKER_EXEC_DIR` is not an actual env var
and refers to the directory where `packer` is, or the executable directory.
:::

## Implicit Github urls

Using the following example :

```hcl
    required_plugins {
      happycloud = {
        version = ">= 2.7.0"
        source = "github.com/azr/happycloud"
      }
    }
```

The plugin getter will look for plugins located at:

- github.com/azr/packer-plugin-happycloud

Packer will error if you set the `packer-plugin-` prefix in a `source`. This
will avoid conflicting with other plugins for other tools, like Terraform.

</TabItem>

<TabItem value="t1">

The easiest way to manually install a plugin is to name it correctly, then place
it in the proper directory. To name a plugin correctly, make sure the binary is
named `packer-plugin-NAME`. For example, `packer-plugin-amazon` for a "plugin"
binary named "amazon". This binary will make one or more components available to
use. Valid types for plugins are down this page.

Once the plugin is named properly, Packer automatically discovers plugins in
the following directories in the given order. If a conflicting plugin is found
later, it will take precedence over one found earlier.

1.  The directory where `packer` is, or the executable directory.

2.  The `$HOME/.packer.d/plugins` directory, if `$HOME` is defined (unix)

3.  The `%APPDATA%/packer.d/plugins` if `%APPDATA%` is defined (windows)

4.  The `%USERPROFILE%/packer.d/plugins` if `%USERPROFILE%` is defined
    (windows)

5.  The current working directory.

6.  The directory defined in the env var `PACKER_PLUGIN_PATH`. There can be more
    than one directory defined; for example, `~/custom-dir-1:~/custom-dir-2`.
    Separate directories in the PATH string using a colon (`:`) on posix systems and
    a semicolon (`;`) on windows systems. The above example path would be able to
    find a provisioner named `packer-provisioner-foo` in either
    `~/custom-dir-1/packer-provisioner-foo` or
    `~/custom-dir-2/packer-provisioner-foo`.

The valid types for plugins are:

- `plugin` - A plugin binary that can contain one or more of each Packer component
  type.

- `builder` - Plugins responsible for building images for a specific
  platform.

- `post-processor` - A post-processor responsible for taking an artifact from
  a builder and turning it into something else.

- `provisioner` - A provisioner to install software on images created by a
  builder.

</TabItem>

<TabItem value="t2">

The easiest way to manually install a plugin is to name it correctly, then place
it in the proper directory. To name a plugin correctly, make sure the binary is
named `packer-COMPONENT-NAME`. For example, `packer-provisioner-comment` for a "plugin"
binary named "comment". This binary will make a single provisioner named `comment` available to
use. Valid types for plugins are down this page.

Once the plugin is named properly, Packer automatically discovers plugins in
the following directories in the given order. If a conflicting plugin is found
later, it will take precedence over one found earlier.

1.  The directory where `packer` is, or the executable directory.

2.  The `$HOME/.packer.d/plugins` directory, if `$HOME` is defined (unix)

3.  The `%APPDATA%/packer.d/plugins` if `%APPDATA%` is defined (windows)

4.  The `%USERPROFILE%/packer.d/plugins` if `%USERPROFILE%` is defined
    (windows)

5.  The current working directory.

6.  The directory defined in the env var `PACKER_PLUGIN_PATH`. There can be more
    than one directory defined; for example, `~/custom-dir-1:~/custom-dir-2`.
    Separate directories in the PATH string using a colon (`:`) on posix systems and
    a semicolon (`;`) on windows systems. The above example path would be able to
    find a provisioner named `packer-provisioner-foo` in either
    `~/custom-dir-1/packer-provisioner-foo` or
    `~/custom-dir-2/packer-provisioner-foo`.

The valid types for plugins are:

- `plugin` - A plugin binary that can contain one or more of each Packer component
  type.

- `builder` - Plugins responsible for building images for a specific
  platform.

- `post-processor` - A post-processor responsible for taking an artifact from
  a builder and turning it into something else.

- `provisioner` - A provisioner to install software on images created by a
  builder.

</TabItem>

</Tabs>
