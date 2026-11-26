---
title: cidrsubnet 函数参考
description: |-
  `cidrsubnet` 函数在给定的 IP 网络地址前缀内计算子网地址。
---

# `cidrsubnet` 函数

`cidrsubnet` 在给定的 IP 网络地址前缀内计算子网地址。

```hcl
cidrsubnet(prefix, newbits, netnum)
```

`prefix` 必须以 CIDR 表示法给出，如 [RFC 4632 第 3.1 节](https://tools.ietf.org/html/rfc4632#section-3.1) 中定义的那样。

`newbits` 是用于扩展前缀的附加位数。例如，如果给定以 `/16` 结尾的前缀和 `newbits` 值为 `4`，则结果子网地址的长度将为 `/20`。

`netnum` 是一个整数，可以用不超过 `newbits` 位的二进制整数表示，它将用于填充添加到前缀的附加位。

此函数接受 IPv6 和 IPv4 前缀，结果始终使用与给定前缀相同的寻址方案。

与相关函数 [`cidrsubnets`](/docs/templates/hcl_templates/functions/ipnet/cidrsubnets) 不同，`cidrsubnet` 允许你指定要使用的特定网络号。`cidrsubnets` 可以一次分配多个网络地址，但从零开始自动编号。

## 示例

```shellsession
> cidrsubnet("172.16.0.0/12", 4, 2)
172.18.0.0/16
> cidrsubnet("10.1.2.0/24", 4, 15)
10.1.2.240/28
> cidrsubnet("fd00:fd12:3456:7890::/56", 16, 162)
fd00:fd12:3456:7800:a200::/72
```

## 网络掩码和子网

使用 `cidrsubnet` 需要熟悉一些网络寻址概念。

最重要的概念是 IP 地址（无论是 IPv4 还是 IPv6）从根本上是由二进制数字构成的，尽管我们通常将其表示为四个十进制八位字节（IPv4）或一系列 16 位十六进制数字（IPv6）。

以上面 `cidrsubnet("10.1.2.0/24", 4, 15)` 为例，该函数首先将给定的 IP 地址字符串转换为等效的二进制表示：

```txt
      10 .        1 .        2 .        0
00001010   00000001   00000010 | 00000000
         network               |   host
```

前缀字符串末尾的 `/24` 指定前 24 位——或者说前三个八位字节——标识网络，而剩余位（本例中为 32 - 24 = 8 位）标识网络中的主机。

CLI 工具 [`ipcalc`](https://gitlab.com/ipcalc/ipcalc) 对于将 CIDR 前缀可视化为二进制数很有用。我们可以通过向 `ipcalc` 提供相同的前缀字符串来确认上述转换：

```shellsession
$ ipcalc 10.1.2.0/24
Address:   10.1.2.0             00001010.00000001.00000010. 00000000
Netmask:   255.255.255.0 = 24   11111111.11111111.11111111. 00000000
Wildcard:  0.0.0.255            00000000.00000000.00000000. 11111111
=>
Network:   10.1.2.0/24          00001010.00000001.00000010. 00000000
HostMin:   10.1.2.1             00001010.00000001.00000010. 00000001
HostMax:   10.1.2.254           00001010.00000001.00000010. 11111110
Broadcast: 10.1.2.255           00001010.00000001.00000010. 11111111
Hosts/Net: 254                   Class A, Private Internet
```

这给了我们一些额外的信息，同时也确认了（使用略有不同的表示法）从十进制到二进制的转换，并显示了此网络中可能的主机地址范围。

虽然 [`cidrhost`](/docs/templates/hcl_templates/functions/ipnet/cidrhost) 允许计算单个主机 IP 地址，但 `cidrsubnet` 另一方面在给定的网络前缀_内_创建一个新的网络前缀。换句话说，它创建一个子网。

当我们调用 `cidrsubnet` 时，我们还传递两个额外的参数：`newbits` 和 `netnum`。`newbits` 决定结果前缀将在位数上比原来长多少；在我们这里的示例中，我们指定了 `4`，这意味着结果子网的前缀长度将为 24 + 4 = 28 位。我们可以想象这些位的分解如下：

```txt
      10 .        1 .        2 .    ?        0
00001010   00000001   00000010 |   XXXX | 0000
         parent network        | netnum | host
```

原来作为"主机号"的八位中的四位现在被重新用作子网号。网络前缀不再落在精确的八位字节边界上，所以实际上我们现在将 IP 地址中的最后一个十进制数字分成两部分，一半用于表示子网号，另一半用于表示主机号。

然后 `netnum` 参数决定将什么数值编码到这四个新的子网位中。在我们当前的示例中，我们传递了 `15`，它用二进制表示为 `1111`，这样我们就可以填充上面的 `XXXX` 段：

```txt
      10 .        1 .        2 .    15       0
00001010   00000001   00000010 |   1111 | 0000
         parent network        | netnum | host
```

要将其转换回正常的十进制表示法，我们需要重新组合最后一个八位字节的两个部分。将 `11110000` 从二进制转换为十进制得到 240，然后可以将其与我们的新前缀长度 28 组合以产生结果 `10.1.2.240/28`。同样，我们可以将此前缀字符串传递给 `ipcalc` 来可视化它：

```shellsession
$ ipcalc 10.1.2.240/28
Address:   10.1.2.240           00001010.00000001.00000010.1111 0000
Netmask:   255.255.255.240 = 28 11111111.11111111.11111111.1111 0000
Wildcard:  0.0.0.15             00000000.00000000.00000000.0000 1111
=>
Network:   10.1.2.240/28        00001010.00000001.00000010.1111 0000
HostMin:   10.1.2.241           00001010.00000001.00000010.1111 0001
HostMax:   10.1.2.254           00001010.00000001.00000010.1111 1110
Broadcast: 10.1.2.255           00001010.00000001.00000010.1111 1111
Hosts/Net: 14                    Class A, Private Internet
```

新子网有四位可用于主机编号，这意味着在减去网络自身地址和广播地址后，有 14 个主机地址可供分配。因此，你可以使用 [`cidrhost`](/docs/templates/hcl_templates/functions/ipnet/cidrhost) 函数通过提供 1 到 14 之间的值来计算这些主机地址：

```shellsession
> cidrhost("10.1.2.240/28", 1)
10.1.2.241
> cidrhost("10.1.2.240/28", 14)
10.1.2.254
```

有关 CIDR 表示法和子网划分的更多信息，请参阅[无类域间路由](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)。

## 相关函数

- [`cidrhost`](/docs/templates/hcl_templates/functions/ipnet/cidrhost) 在给定的网络地址前缀内计算单个主机的 IP 地址。
- [`cidrnetmask`](/docs/templates/hcl_templates/functions/ipnet/cidrnetmask) 将 CIDR 表示法的 IPv4 网络前缀转换为网络掩码表示法。
- [`cidrsubnets`](/docs/templates/hcl_templates/functions/ipnet/cidrsubnets) 可以一次在前缀下分配多个连续地址，自动编号。
