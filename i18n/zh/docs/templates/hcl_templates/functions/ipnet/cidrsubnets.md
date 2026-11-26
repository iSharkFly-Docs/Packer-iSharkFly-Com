---
title: cidrsubnets 函数参考
description: |-
  `cidrsubnets` 函数在特定 CIDR 前缀内计算一系列连续的 IP 地址范围。
---

# `cidrsubnets` 函数

`cidrsubnets` 在特定 CIDR 前缀内计算一系列连续的 IP 地址范围。

```hcl
cidrsubnets(prefix, newbits...)
```

`prefix` 必须以 CIDR 表示法给出，如 [RFC 4632 第 3.1 节](https://tools.ietf.org/html/rfc4632#section-3.1) 中定义的那样。

其余参数（上面表示为 `newbits`）每个指定一个返回地址范围的附加网络前缀位数。因此，返回值是一个列表，每个 `newbits` 参数对应一个元素，每个都是包含 CIDR 表示法地址范围的字符串。

有关 IP 寻址概念的更多信息，请参阅相关函数 [`cidrsubnet`](/docs/templates/hcl_templates/functions/ipnet/cidrsubnet) 的文档。`cidrsubnet` 在前缀内计算单个子网地址，同时允许你指定其子网号，而 `cidrsubnets` 可以一次计算多个（可能是不同大小的），并自动分配子网号。

当使用此函数作为网络地址规划的一部分来划分地址空间时，一旦将网络地址分配给实际基础设施，就不得更改任何现有参数，否则以后的地址分配将失效。但是，只要有足够的地址空间可用，你_可以_安全地向现有调用追加新参数。

此函数接受 IPv6 和 IPv4 前缀，结果始终使用与给定前缀相同的寻址方案。

## 示例

```shellsession
> cidrsubnets("10.1.0.0/16", 4, 4, 8, 4)
[
  "10.1.0.0/20",
  "10.1.16.0/20",
  "10.1.32.0/24",
  "10.1.48.0/20",
]

> cidrsubnets("fd00:fd12:3456:7890::/56", 16, 16, 16, 32)
[
  "fd00:fd12:3456:7800::/72",
  "fd00:fd12:3456:7800:100::/72",
  "fd00:fd12:3456:7800:200::/72",
  "fd00:fd12:3456:7800:300::/88",
]
```

你可以使用嵌套的 `cidrsubnets` 调用配合 [`for` 表达式](/docs/templates/hcl_templates/expressions#for-expressions) 来简洁地分配网络地址块组：

```shellsession
> [for cidr_block in cidrsubnets("10.0.0.0/8", 8, 8, 8, 8) : cidrsubnets(cidr_block, 4, 4)]
[
  [
    "10.0.0.0/20",
    "10.0.16.0/20",
  ],
  [
    "10.1.0.0/20",
    "10.1.16.0/20",
  ],
  [
    "10.2.0.0/20",
    "10.2.16.0/20",
  ],
  [
    "10.3.0.0/20",
    "10.3.16.0/20",
  ],
]
```

## 相关函数

- [`cidrhost`](/docs/templates/hcl_templates/functions/ipnet/cidrhost) 在给定的网络地址前缀内计算单个主机的 IP 地址。
- [`cidrnetmask`](/docs/templates/hcl_templates/functions/ipnet/cidrnetmask) 将 CIDR 表示法的 IPv4 网络前缀转换为网络掩码表示法。
- [`cidrsubnet`](/docs/templates/hcl_templates/functions/ipnet/cidrsubnet) 计算单个子网地址，允许你指定其网络号。
