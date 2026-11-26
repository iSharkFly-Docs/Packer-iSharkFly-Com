---
description: |
  `compress` 后处理器将包含多个文件的制品（如 VMware 或 VirtualBox 构建）压缩成单个归档文件。
title: compress 后处理器参考
---

<Badge type="tip" text="Official" />

# `compress` 后处理器

制品 BuilderId：`packer.post-processor.compress`

Packer compress 后处理器获取包含文件的制品（如来自 VMware 或 VirtualBox 的制品），并将制品压缩成单个归档文件。

## 配置

### 可选：

默认情况下，packer 将以 `.tar.gz` 格式构建归档文件，文件名为：`packer_{{.BuildName}}_{{.BuilderType}}`。如果你想更改此设置，需要指定 `output` 选项。

- `output`（string）- 保存压缩归档文件的路径。归档格式从文件名推断。例如，`.tar.gz` 将是 gzip 压缩的 tarball。`.zip` 将是 zip 文件。如果无法检测扩展名，packer 默认使用 `.tar.gz` 行为但不会更改文件名。

  这被视为[模板引擎](/docs/templates/legacy_json_templates/engine)。因此，你可以在此字段中使用用户变量和模板函数。
  以下特殊变量也可在输出模板中使用：

  - `{{.BuildName}}`
  - `{{.BuilderType}}`

  如果你并行执行多个构建器，应确保每个构建器的 `output` 是唯一的。例如 `packer_{{.BuildName}}.zip`。

- `format`（string）- 禁用归档格式自动检测并使用提供的字符串。

- `compression_level`（number）- 指定压缩级别，对于支持此选项的算法，从 1 到 9（包括）。通常更高的压缩级别需要更长时间但生成更小的文件。默认为 `6`

- `keep_input_artifact`（boolean）- 如果为 `true`，同时保留源文件和压缩文件；如果为 `false`，丢弃源文件。默认为 `false`

### 支持的格式

支持的文件扩展名包括 `.zip`、`.tar`、`.gz`、`.tar.gz`、`.lz4` 和 `.tar.lz4`。请注意，如果你有多个文件要压缩，`.gz` 和 `.lz4` 将失败。

## 示例

以下是一些最小示例，仅显示后处理器配置：

```json
{
  "type": "compress",
  "output": "archive.tar.lz4"
}
```

```json
{
  "type": "compress",
  "output": "{{.BuildName}}_bundle.zip"
}
```

```json
{
  "type": "compress",
  "output": "log_{{.BuildName}}.gz",
  "compression_level": 9
}
```
