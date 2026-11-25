---
description: |
  The `null` builder creates an SSH connection and runs provisioners. Use the `null` builder to debug provisioners without incurring long wait times. 
title: null builder reference
---

<Badge type="tip" text="Official" />

# `null` builder

The `null` builder sets up an SSH connection and runs provisioners. You can use it to debug provisioners without incurring long wait times. It does not create a images or artifacts.

## Basic Example

Below is a fully functioning example. It doesn't do anything useful, since no
provisioners are defined, but it will connect to the specified host via ssh.

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

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

<TabItem value="t1">

```json
{
  "type": "null",
  "ssh_host": "127.0.0.1",
  "ssh_username": "foo",
  "ssh_password": "bar"
}
```

</TabItem>

</Tabs>

## Configuration Reference

The null builder has no configuration parameters other than the
[communicator](/docs/templates/legacy_json_templates/communicator) settings.
