---
description: >
  `checksum` 后处理器为来自上游构建器或后处理器的制品列表计算校验和，以便你可以验证制品。
title: checksum 后处理器参考
---

<Badge type="tip" text="Official" />

# `checksum` 后处理器

制品 BuilderId：`packer.post-processor.checksum`

checksum 后处理器为来自上游构建器或后处理器的制品列表计算指定的校验和。所有下游后处理器都将看到新的制品。主要用例是为制品计算校验和以便稍后验证。

在为制品计算校验和后，你可以将新制品与其他后处理器一起使用，如
[artifice](/docs/post-processors/artifice)、
[compress](/docs/post-processors/compress)、
[docker-push](https://developer.hashicorp.com/packer/plugins/post-processors/docker/docker-push) 或
第三方后处理器。

## 基本示例

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
post-processor "checksum" {
  checksum_types = ["sha1", "sha256"]
  output = "packer_{{.BuildName}}_{{.ChecksumType}}.checksum"
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "checksum",
  "checksum_types": ["sha1", "sha256"],
  "output": "packer_{{.BuildName}}_{{.ChecksumType}}.checksum"
}
```

</TabItem>

</Tabs>

## 配置参考

可选参数：

- `checksum_types`（字符串数组）- 要计算的校验和类型数组。如果为空，默认为 md5。允许的值有：

  - md5
  - sha1
  - sha224
  - sha256
  - sha384
  - sha512

- `output`（string）- 指定存储校验和的文件名。默认为
  `packer_{{.BuildName}}_{{.BuilderType}}_{{.ChecksumType}}.checksum`。例如，如果你有一个名为 `database` 的构建器，你可能会看到写入的文件为 `packer_database_docker_md5.checksum`。这被视为[模板引擎](/docs/templates/legacy_json_templates/engine)。因此，你可以在此字段中使用用户变量和模板函数。
  以下特殊变量也可在输出模板中使用：

  - `BuildName`：生成制品的构建器名称。
  - `BuilderType`：用于生成制品的构建器类型。
  - `ChecksumType`：文件包含的校验和类型。如果 `checksum_types` 中有多个值，则应使用此变量。
