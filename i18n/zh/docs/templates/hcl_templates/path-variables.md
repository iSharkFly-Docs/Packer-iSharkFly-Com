---
title: 路径变量参考
description: |-
  路径变量是使你能够提供目录信息的特殊变量。了解如何在 Packer 模板中使用路径变量。
---

# 路径变量

本文提供关于用 HCL 编写的 Packer 模板的路径变量的参考信息。

## 描述

使用以下变量来构建路径：

- `path.cwd`：Packer 启动的目录。

- `path.root`：输入 HCL 文件或输入文件夹的目录。

## 示例

```hcl
locals {
  settings_file  = "${path.cwd}/settings.txt"
  scripts_folder = "${path.root}/scripts"
  root           = path.root
}
```

## 路径分隔符

使用正斜杠 (`/`) 分隔路径，特别是在配置中使用相对路径时。Windows 使用反斜杠 (`\`) 分隔路径，但当 Packer 从任何非 Windows 系统创建构建时，它只识别 `/` 作为路径分隔符。Packer 还会将反斜杠视为纯文本，这可能导致错误。

## 相关函数

- [`abspath`](/docs/templates/hcl_templates/functions/file/abspath) 接受包含文件系统路径的字符串并将其转换为绝对路径。

- [`basename`](/docs/templates/hcl_templates/functions/file/basename) _只_ 返回文件系统路径的最后一部分，丢弃 `dirname` 将返回的部分。

- [`fileset`](/docs/templates/hcl_templates/functions/file/fileset) 给定路径和模式，枚举一组常规文件名。

- [`dirname`](/docs/templates/hcl_templates/functions/file/dirname) 返回文件系统路径的 _除最后一部分外_ 的所有段，丢弃 `basename` 将返回的部分。
