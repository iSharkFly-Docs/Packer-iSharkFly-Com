---
title: pathexpand 函数参考
description: |-
  `pathexpand` 函数将前导波浪号 `~` 字符替换为当前用户的主目录。了解如何在 Packer 模板中使用 `pathexpand` 函数。
---

# `pathexpand` 函数

`pathexpand` 接受一个可能以 `~` 段开头的文件系统路径，如果是的话，它会用当前用户的主目录路径替换该段。

此函数仅处理路径字符串，不访问文件系统本身。因此，它无法考虑符号链接等文件系统特性。

如果路径中的前导段不是 `~`，则返回给定的路径不变。

在资源参数中使用此函数会导致虚假的差异，如果相同的配置由具有不同主目录路径的多个用户运行，或在不同的主机操作系统上使用。我们建议仅将此函数用于临时值，例如在 `connection` 和 `provisioner` 块中定位 SSH 密钥等。

确定当前用户"主目录"的规则因主机操作系统而异。

**对于 Unix 系统**，按优先级顺序查询以下来源：

- `HOME` 环境变量。
- 运行 `getent passwd` 后跟 Packer 进程 uid 的结果。
- 在 `sh` 中运行 `cd && pwd` 的结果。

**对于 Windows 系统**，没有与 Unix 相同意义上的主目录概念，但按优先级顺序查询以下来源：

- `HOME` 环境变量。
- `HOMEDRIVE` 和 `HOMEPATH` 环境变量（如果两者都设置了）。
- `USERPROFILE` 环境变量。

每个操作系统采用的确切规则可能会在 Packer 的未来版本中更改。

## 示例

```shellsession
> pathexpand("~/.ssh/id_rsa")
/home/steve/.ssh/id_rsa
> pathexpand("/etc/resolv.conf")
/etc/resolv.conf
```
