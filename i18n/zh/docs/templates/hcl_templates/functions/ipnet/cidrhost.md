---
title: cidrhost 函数参考
description: |-
  `cidrhost` 函数在给定的 IP 网络地址前缀中计算完整的主机 IP 地址。
---

# `cidrhost` 函数

`cidrhost` 在给定的 IP 网络地址前缀中为给定的主机号计算完整的主机 IP 地址。

```hcl
cidrhost(prefix, hostnum)
```

`prefix` 必须以 CIDR 表示法给出，如 [RFC 4632 第 3.1 节](https://tools.ietf.org/html/rfc4632#section-3.1) 中定义的那样。

`hostnum` 是一个整数，可以用不超过给定前缀后地址中剩余位数的二进制整数表示。有关此函数如何解释 CIDR 前缀和填充主机号的更多详细信息，请参阅 [`cidrsubnet`](/docs/templates/hcl_templates/functions/ipnet/cidrsubnet) 的工作示例。

按照惯例，主机号零用于表示网络本身的地址，而将所有主机位填充为二进制 1 的主机号表示网络的广播地址。除非在特殊情况下（如点对点链接），否则通常不应使用这些数字来标识单个主机。

此函数接受 IPv6 和 IPv4 前缀，结果始终使用与给定前缀相同的寻址方案。

## 示例

```shellsession
> cidrhost("10.12.127.0/20", 16)
10.12.112.16
> cidrhost("10.12.127.0/20", 268)
10.12.113.12
> cidrhost("fd00:fd12:3456:7890:00a2::/72", 34)
fd00:fd12:3456:7890::22
```

## 相关函数

- [`cidrsubnet`](/docs/templates/hcl_templates/functions/ipnet/cidrsubnet) 在给定的网络地址前缀下计算子网地址。
