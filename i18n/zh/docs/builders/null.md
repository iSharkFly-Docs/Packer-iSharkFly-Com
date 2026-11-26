---
description: |
  `null` 构建器创建 SSH 连接并运行配置器。使用 `null` 构建器来调试配置器，而无需承担长时间的等待。
title: null 构建器参考
---

<Badge type="tip" text="Official" />

# `null` 构建器

`null` 构建器设置 SSH 连接并运行配置器。你可以使用它来调试配置器，而无需承担长时间的等待。它不创建镜像或制品。

## 基本示例

下面是一个完整可用的示例。它没有做任何有用的事情，因为没有定义配置器，但它会通过 ssh 连接到指定的主机。

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

## 配置参考

null 构建器除了[通信器](/docs/templates/legacy_json_templates/communicator)设置外没有其他配置参数。
