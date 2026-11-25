---
description: |
  Packer uses communicators to upload files, execute scripts, and perform actions on the machine it creates. Learn how to configure communicators in JSON templates.
title: Communicators reference for JSON templates 
---

# Communicators reference for JSON templates

This topic describes how to use communicators in Packer templates written in JSON format. 

::: info
**Note:** This page is about older-style JSON Packer templates. JSON
templates are still supported by the Packer core, but new features added to the
Packer core may not be implemented for JSON templates. We recommend you
transition to HCL templates as soon as is convenient for you, in order to have
the best possible experience with Packer. To help you upgrade your templates,
we have written an [hcl2_upgrade command](/docs/commands/hcl2_upgrade).
:::

## Description

Packer uses communicators to upload files, execute scripts, and perform other actions on the machine being created. Configure communicators in the
[`builder`](/docs/templates/legacy_json_templates/builders) section.

All communicators have the following options:

- `communicator` (string) - Packer currently supports three kinds of communicators:
  
  -   `none` - No communicator will be used. If this is set, most
      provisioners also can't be used.
  
  -   `ssh` - An SSH connection will be established to the machine. This
      is usually the default.
  
  -   `winrm` - A WinRM connection will be established.
  
  In addition to the above, some builders have custom communicators they
  can use. For example, the Docker builder has a "docker" communicator
  that uses `docker exec` and `docker cp` to execute scripts and copy
  files.

- `pause_before_connecting` (duration string | ex: "1h5m2s") - We recommend that you enable SSH or WinRM as the very last step in your
  guest's bootstrap script, but sometimes you may have a race condition
  where you need Packer to wait before attempting to connect to your
  guest.
  
  If you end up in this situation, you can use the template option
  `pause_before_connecting`. By default, there is no pause. For example if
  you set `pause_before_connecting` to `10m` Packer will check whether it
  can connect, as normal. But once a connection attempt is successful, it
  will disconnect and then wait 10 minutes before connecting to the guest
  and beginning provisioning.

<!-- End of code generated from the comments of the Config struct in communicator/config.go; -->

## Getting Ready to Use the Communicator

Depending on your builder, your communicator may not have all it needs in order
to work "out of the box".

If you are building from a cloud image (for example, building on Amazon), there
is a good chance that your cloud provider has already preconfigured SSH on the
image for you, meaning that all you have to do is configure the communicator in
the Packer template.

However, if you are building from a brand-new and unconfigured operating system
image, you will almost always have to perform some extra work to configure SSH
on the guest machine. For most operating system distributions, this work will
be performed by a [boot_command](https://developer.hashicorp.com/packer/plugins/builders/vmware/iso#boot-configuration) that references a file which
provides answers to the normally-interactive questions you get asked when
installing an operating system. The name of this file varies by operating
system; some common examples are the "preseed" file required by Debian, the
"kickstart" file required by CentOS or the "answer file", also known as the
Autounattend.xml file, required by Windows. For simplicity's sake, we'll refer
to this file as the "preseed" file in the rest of the documentation.

If you are unfamiliar with how to use a preseed file for automatic
bootstrapping of an image, please either take a look at our quick guides to
image bootstrapping, or research automatic configuration for your specific
guest operating system. Knowing how to automatically initalize your operating
system is critical for being able to successfully use Packer.

## Communicator-Specific Options

For more details on how to use each communicator, visit the
[communicators](/docs/communicators/) page.
