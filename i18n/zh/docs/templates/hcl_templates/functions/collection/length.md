---
title: length 函数参考
description: '`length` 函数确定集合或字符串的长度。了解如何在 Packer 模板中使用 `length` 函数。'
---

# `length` 函数

`length` 确定给定列表、映射或字符串的长度。

如果给定列表或映射，结果是该集合中的元素数量。如果给定字符串，结果是字符串中的字符数量。

## 示例

```shellsession
> length([])
0
> length(["a", "b"])
2
> length({"a" = "b"})
1
> length("hello")
5
```

当给定字符串时，结果是字符数量，而不是字节数或组成它们的 Unicode 序列数量：

```shellsession
> length("👾🕹️")
2
```

"字符"是[Unicode 标准附件 #29](http://unicode.org/reports/tr29/)定义的_字素簇_。请注意，远程 API 可能对字符串参数的长度限制有不同的"字符"定义；Packer 提供者负责将 Packer 的字符串表示转换为其各自远程系统使用的表示，并对其应用任何额外的验证规则。
