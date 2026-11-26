---
title: consul 函数参考
description: '`consul` 函数从 HashiCorp Consul KV 存储中检索密钥。了解如何在 Packer 模板中使用 `consul` 函数。'
---

# `consul_key` 函数

从 HashiCorp Consul KV 存储中检索密钥。你可以使用 `consul_key` 函数密钥将它们添加到你的模板中。有关 Consul KV 的更多信息，请参阅 [Consul 文档](https://developer.hashicorp.com/consul/docs/dynamic-app-config/kv)。

你可以在 locals 块中使用此函数，或直接内联在你想要使用该值的地方。

```hcl
locals {
  my_version = "${consul_key("myservice/version")}"
}

source "null" "first-example" {
  communicator = "none"
}

build {
  name = "my-build-name"
  sources = ["null.first-example"]

  provisioner "shell-local" {
    environment_vars = ["TESTVAR=${build.PackerRunUUID}"]
    inline = ["echo my_version is '${local.my_version}'",
              "echo version is '${consul_key("myservice/version")}'."]
  }
}
```

这将从 consul 加载存储在路径 `myservice/version` 的键。

consul 的配置（地址、令牌等）必须指定为环境变量，如[文档](https://developer.hashicorp.com/consul/commands#environment-variables)中所述。
