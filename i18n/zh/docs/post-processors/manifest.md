---
description: >
  `manifest` 后处理器创建一个 JSON 文件，其中包含有关 Packer 构建制品的数据，让你可以跟踪运行的输出。
title: manifest 后处理器参考
---

<Badge type="tip" text="Official" />

# `manifest` 后处理器

制品 BuilderId：`packer.post-processor.manifest`

manifest 后处理器写入一个 JSON 文件，其中包含 packer 在运行期间生成的所有制品的列表。如果你的 Packer 模板包含多个构建，这可以帮助你跟踪哪些输出制品（文件、AMI ID、Docker 容器等）对应于每个构建。

manifest 后处理器在每次构建完成时被调用，并_更新_清单文件中的数据。构建通过名称和类型标识，包括构建时间、制品 ID 和文件列表。

如果使用 `-force` 标志运行 packer，清单文件将在每次 packer 运行期间自动截断。否则，后续构建将添加到文件中。你可以使用时间戳查看哪个是最新的制品。

你可以多次指定 manifest 并将每个构建写入其自己的文件，或将所有构建写入同一文件。对于简单的构建，manifest 只需要指定一次（见下文），但你也可以将其与其他后处理器（如 Docker 和 Artifice）链接在一起。

## 配置

### 可选：

- `output`（string）- 清单将写入此文件。默认为 `packer-manifest.json`。

- `strip_path`（bool）- 仅将文件名写入清单文件，不包含路径。默认为 false。

- `strip_time`（bool）- 不在输出中写入 `build_time` 字段。

- `custom_data`（map[string]string）- 要添加到清单的任意数据。这是一个[模板引擎](/docs/templates/legacy_json_templates/engine)。因此，你可以在此字段中使用用户变量和模板函数。

<!-- End of code generated from the comments of the Config struct in post-processor/manifest/post-processor.go; -->

::: warning
**注意**：与大多数其他后处理器不同，keep_input_artifact 选项不适用于 manifest 后处理器。我们将始终保留 manifest 的输入制品，因为删除我们刚刚记录的文件不是任何人应该期望的行为。
:::

### 示例配置

使用 manifest 后处理器的最简单方式是只写入其定义，如：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
post-processor "manifest" {}
```

</TabItem>

<TabItem value="t1">

```json
{
  "post-processors": [
    {
      "type": "manifest"
    }
  ]
}
```

</TabItem>

</Tabs>

更完整的示例：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
post-processor "manifest" {
    output = "manifest.json"
    strip_path = true
    custom_data = {
      my_custom_data = "example"
    }
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "post-processors": [
    {
      "type": "manifest",
      "output": "manifest.json",
      "strip_path": true,
      "custom_data": {
        "my_custom_data": "example"
      }
    }
  ]
}
```

</TabItem>

</Tabs>

示例清单文件如下所示：

```json
{
  "builds": [
    {
      "name": "docker",
      "builder_type": "docker",
      "build_time": 1507245986,
      "files": [
        {
          "name": "packer_example",
          "size": 102219776
        }
      ],
      "artifact_id": "Container",
      "packer_run_uuid": "6d5d3185-fa95-44e1-8775-9e64fe2e2d8f",
      "custom_data": {
        "my_custom_data": "example"
      }
    }
  ],
  "last_run_uuid": "6d5d3185-fa95-44e1-8775-9e64fe2e2d8f"
}
```

如果再次运行构建，新的构建制品将添加到清单文件中而不是替换它。可以使用 `packer_run_uuid` 从清单中获取特定的构建制品。

上述清单是使用以下模板生成的：

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
source "docker" "docker"{
    image = "ubuntu:latest"
    export_path = "packer_example"
    run_command = ["-d", "-i", "-t", "--entrypoint=/bin/bash", "{{.Image}}"]
}

build {
    sources = ["docker.docker"]

    post-processor "manifest" {
        output = "manifest.json"
        strip_path = true
        custom_data = {
          my_custom_data = "example"
        }
    }
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "builders": [
    {
      "type": "docker",
      "image": "ubuntu:latest",
      "export_path": "packer_example",
      "run_command": ["-d", "-i", "-t", "--entrypoint=/bin/bash", "{{.Image}}"]
    }
  ],
  "post-processors": [
    {
      "type": "manifest",
      "output": "manifest.json",
      "strip_path": true,
      "custom_data": {
        "my_custom_data": "example"
      }
    }
  ]
}
```

</TabItem>

</Tabs>

示例用法：

清单对于清理旧制品或将重要值打印到日志非常有用。以下示例使用 jq（一个用于解析 json 输出的命令行工具）来查找并回显由构建创建的 AMI 的 AWS ami-id。

```bash

#!/bin/bash

AMI_ID=$(jq -r '.builds[-1].artifact_id | split(":") | .[1]' manifest.json)
echo $AMI_ID

```
