---
title: fileexists 函数参考
description: '`fileexists` 函数确定给定路径下是否存在文件。了解如何在 Packer 模板中使用 `fileexists` 函数。'
---

# `fileexists` 函数

`fileexists` 确定给定路径下是否存在文件。

```hcl
fileexists(path)
```

函数在配置解析期间求值，而不是在应用时求值，因此此函数只能用于在 Packer 采取任何操作之前磁盘上已存在的文件。

此函数仅适用于常规文件。如果用于目录、FIFO 或其他特殊模式，它将返回错误。

## 示例

```shellsession
> fileexists("${path.folder}/hello.txt")
true
```

```hcl
fileexists("custom-section.sh") ? file("custom-section.sh") : local.default_content
```

## 相关函数

- [`file`](/docs/templates/hcl_templates/functions/file/file) 读取给定路径下文件的内容。
