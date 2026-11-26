---
description: |
  `file` 构建器从文件创建制品。使用 `file` 构建器来调试后处理器，而无需承担长时间的等待。
title: file 构建器参考
---

<Badge type="tip" text="Official" />

# `file` 构建器

`file` 构建器从文件创建制品。你可以使用它来调试后处理器，而无需承担长时间的等待。

制品 `BuilderId`：`packer.file`

## 基本示例

下面是一个完整可用的示例。它在 `target` 位置创建一个包含指定 `content` 的文件。

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
source "file" "basic-example" {
  content =  "Lorem ipsum dolor sit amet"
  target =  "dummy_artifact"
}

build {
  sources = ["sources.file.basic-example"]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "file",
  "content": "Lorem ipsum dolor sit amet",
  "target": "dummy_artifact"
}
```

</TabItem>

</Tabs>

## 配置参考

配置选项按以下两个类别组织：必需和可选。在每个类别中，可用选项按字母顺序排列并进行描述。

任何定义的[通信器](/docs/templates/legacy_json_templates/communicator)都会被忽略。

### 必需

- `target` (string) - 将要创建的制品文件的路径。如果路径包含不存在的目录，Packer 也会创建它们。

### 可选

你只能定义 `source` 或 `content` 中的一个。如果两者都没有定义，制品将为空。

- `source` (string) - 将被复制为制品的文件路径。Packer 必须有权限打开此文件，否则构建会返回错误。

- `content` (string) - 将放入制品中的内容。
