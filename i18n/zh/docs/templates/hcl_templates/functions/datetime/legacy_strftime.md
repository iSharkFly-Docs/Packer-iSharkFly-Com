---
title: legacy_strftime 函数参考
description: |-
  `legacy_strftime` 函数返回当前日期和时间的字符串表示。了解如何在 Packer 模板中使用 `legacy_strftime` 函数。
---

# `legacy_strftime` — UTC 时间，使用 ISO C 标准格式

`legacy_strftime` 函数使用给定的格式字符串返回当前日期和时间。格式字符串遵循 strftime 的日期时间格式化。

此函数是为了与 Packer 的旧版 JSON 模板保持向后兼容而提供的。但是，我们建议你尽快将 HCL Packer 模板升级为同时使用 [`timestamp`](/docs/templates/hcl_templates/functions/datetime/timestamp) 和 [`formatdate`](/docs/templates/hcl_templates/functions/datetime/formatdate)。

::: info
**注意：** 如果你使用大量构建器、配置器或后处理器，每个的 strftime 可能略有不同，因为它是从插件启动时开始计算的，而不是初始 Packer 进程。为了避免这种情况并使所有插件的时间戳保持一致，请将其设置为用户变量，然后在插件中访问用户变量。
:::

## 示例

```shellsession
> legacy_strftime("%Y-%m")
2021-08
```

## 相关函数

- [`format`](/docs/templates/hcl_templates/functions/string/format) 是用于任意数据的更通用的格式化函数。
- [`timestamp`](/docs/templates/hcl_templates/functions/datetime/timestamp) 返回适合作为 `formatdate` 输入的当前日期和时间。
- [`formatdate`](/docs/templates/hcl_templates/functions/datetime/formatdate) 可以将结果时间戳转换为其他日期和时间格式。
