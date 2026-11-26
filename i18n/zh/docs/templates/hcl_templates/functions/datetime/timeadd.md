---
title: timeadd 函数参考
description: |-
  `timeadd` 函数向时间戳添加时间并返回新的时间戳。了解如何在 Packer 模板中使用 `timeadd` 函数。
---

# `timeadd` 函数

`timeadd` 向时间戳添加持续时间，返回新的时间戳。

```hcl
timeadd(timestamp, duration)
```

在 Packer 语言中，时间戳通常使用 [RFC 3339](https://tools.ietf.org/html/rfc3339) "日期和时间格式" 语法表示为字符串。`timeadd` 要求 `timestamp` 参数是符合此语法的字符串。

`duration` 是时间差的字符串表示，由数字和单位对的序列组成，如 `"1.5h"` 或 `"1h30m"`。接受的单位有 `"ns"`、`"us"`（或 `"µs"`）、`"ms"`、`"s"`、`"m"` 和 `"h"`。第一个数字可以是负数以表示负持续时间，如 `"-2h5m"`。

结果是一个字符串，也是 RFC 3339 格式，表示将给定持续时间添加到给定时间戳的结果。

::: info
**破坏性更改说明：** Packer 以前允许你决定自己的 "日期和时间格式" 语法。使用 HCL2 并为了与 Terraform 保持一致，Packer 将使用 [RFC 3339](https://tools.ietf.org/html/rfc3339) "日期和时间格式" 语法。作为字符串。[`formatdate`](/docs/templates/hcl_templates/functions/datetime/formatdate) 仍然允许你格式化日期。
:::

## 示例

```shellsession
> timeadd("2017-11-22T00:00:00Z", "10m")
2017-11-22T00:10:00Z
```
