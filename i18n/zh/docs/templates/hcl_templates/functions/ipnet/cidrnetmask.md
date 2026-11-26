---
title: cidrnetmask 函数参考
description: |-
  `cidrnetmask` 函数将以 CIDR 表示法给出的 IPv4 地址前缀转换为子网掩码地址。
---

# `cidrnetmask` 函数

`cidrnetmask` 将以 CIDR 表示法给出的 IPv4 地址前缀转换为子网掩码地址。

```hcl
cidrnetmask(prefix)
```

`prefix` 必须以 IPv4 CIDR 表示法给出，如 [RFC 4632 第 3.1 节](https://tools.ietf.org/html/rfc4632#section-3.1) 中定义的那样。

结果是按照某些软件所期望的传统点分十进制 IPv4 地址语法格式化的子网地址。

CIDR 表示法是 IPv6 地址唯一有效的表示法，因此如果给定 IPv6 地址，`cidrnetmask` 会产生错误。

## 示例

```shellsession
> cidrnetmask("172.16.0.0/12")
255.240.0.0
```
