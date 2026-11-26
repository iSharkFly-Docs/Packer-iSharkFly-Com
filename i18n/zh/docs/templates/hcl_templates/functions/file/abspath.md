---
title: abspath 函数参考
description: '`abspath` 函数将参数转换为绝对文件系统路径。了解如何在 Packer 模板中使用 `abspath` 函数。'
---

# `abspath` 函数

`abspath` 接受一个包含文件系统路径的字符串，并将其转换为绝对路径。也就是说，如果路径不是绝对路径，它将与当前工作目录连接。

在资源参数中直接引用文件系统路径可能会导致虚假的差异，如果相同的配置从多个系统应用或在不同的主机操作系统上应用。我们建议仅将文件系统路径用于临时值，例如 [`file`](/docs/templates/hcl_templates/functions/) 的参数（其中仅存储内容）。

## 示例

```shellsession
> abspath(path.root)
/home/user/some/packer/root
```
