---
description: |
  The null Packer builder is not really a builder, it just sets up an SSH
  connection and runs the provisioners. It can be used to debug provisioners
  without incurring high wait times. It does not create any kind of image or
  artifact.
title: Null - Builders
---

# Null Builder

Type: `null`

The `null` Packer builder is not really a builder, it just sets up an SSH
connection and runs the provisioners. It can be used to debug provisioners
without incurring high wait times. It does not create any kind of image or
artifact.

## Basic Example

Below is a fully functioning example. It doesn't do anything useful, since no
provisioners are defined, but it will connect to the specified host via ssh.

<Tabs groupId="template-format" :tabs="[{label:'JSON',value:'t0'},{label:'HCL2',value:'t1'}]">

<TabItem value="t0">

```json
{
  "type": "null",
  "ssh_host": "127.0.0.1",
  "ssh_username": "foo",
  "ssh_password": "bar"
}
```

</TabItem>

<TabItem value="t1">

```hcl
source "null" "basic-example" {
  ssh_host = "127.0.0.1"
  ssh_username = "foo"
  ssh_password = "bar"
}

build {
  sources = ["sources.null.basic-example"]
}
```

</TabItem>

</Tabs>

## Configuration Reference

The null builder has no configuration parameters other than the
[communicator](/docs/templates/legacy_json_templates/communicator) settings.
