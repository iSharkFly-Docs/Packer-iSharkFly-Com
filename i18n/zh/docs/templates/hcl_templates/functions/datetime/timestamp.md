---
title: timestamp 函数参考
description: |-
  `timestamp` 函数返回当前日期和时间的字符串表示。了解如何在 Packer 模板中使用 `timestamp` 函数。
---

# `timestamp` 函数

`timestamp` 返回当前日期和时间。

在 Packer 语言中，时间戳通常使用 [RFC 3339](https://tools.ietf.org/html/rfc3339) "日期和时间格式" 语法表示为字符串，因此 `timestamp` 以此格式返回字符串。

此函数的结果每秒都会改变，因此直接将此函数与资源属性一起使用会导致每次 Packer 运行都检测到差异。

::: info
**破坏性更改说明：** Packer 以前允许你决定自己的 "日期和时间格式" 语法。使用 HCL2 并为了与 Terraform 保持一致，Packer 将使用 [RFC 3339](https://tools.ietf.org/html/rfc3339) "日期和时间格式" 语法。作为字符串。[`formatdate`](/docs/templates/hcl_templates/functions/datetime/formatdate) 仍然允许你格式化日期。
:::

## 示例

```shellsession
> timestamp()
2018-05-13T07:44:12Z
```

## 相关函数

- [`formatdate`](/docs/templates/hcl_templates/functions/datetime/formatdate) 可以将结果时间戳转换为其他日期和时间格式。
