---
title: dirname 函数参考
description: '`dirname` 函数从文件系统路径中删除最后一部分。了解如何在 Packer 模板中使用 `dirname` 函数。'
---

# `dirname` 函数

`dirname` 接受一个包含文件系统路径的字符串，并删除最后一部分。

此函数仅处理路径字符串，不访问文件系统本身。因此，它无法考虑符号链接等文件系统特性。

如果路径为空，则结果为 `"."`，表示当前工作目录。

此函数的行为取决于主机平台。在 Windows 系统上，它使用反斜杠 `\` 作为路径段分隔符。在 Unix 系统上，使用斜杠 `/`。此函数的结果是规范化的，因此在 Windows 系统上，给定路径中的任何斜杠在返回之前都将被替换为反斜杠。

在资源参数中直接引用文件系统路径可能会导致虚假的差异，如果相同的配置从多个系统应用或在不同的主机操作系统上应用。我们建议仅将文件系统路径用于临时值，例如 [`file`](/docs/templates/hcl_templates/functions/) 的参数（其中仅存储内容）或在 `connection` 和 `provisioner` 块中。

## 示例

```shellsession
> dirname("foo/bar/baz.txt")
foo/bar
```

## 相关函数

- [`basename`](/docs/templates/hcl_templates/functions/file/basename) _仅_返回文件系统路径的最后一部分，丢弃 `dirname` 将返回的部分。
