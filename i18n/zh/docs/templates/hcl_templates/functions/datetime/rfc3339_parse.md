---
title: rfc3339_parse 函数参考
description: '`rfc3339_parse` 函数将 RFC 3339 时间戳解析为 Packer 模板的日期和时间值。'
---

# `rfc3339_parse` 函数

`rfc3339_parse` 函数解析 RFC 3339 时间戳字符串并返回包含其日期和时间值的对象。

```hcl
rfc3339_parse(TIMESTAMP)
```

该函数接受在日期和时间之间使用 `T` 或空格的时间戳。例如，`2023-07-25T23:43:16Z` 和 `2023-07-25 23:43:16Z` 都是有效的时间戳。该函数还接受带有可选小数秒的时间戳。

## 示例

```hcl
locals {
  timestamp = rfc3339_parse("2023-07-25T23:43:16Z")
  epoch     = local.timestamp.unix
}
```

结果包含以下属性：

| 属性 | 描述 |
| --- | --- |
| `year` | 日历年份。 |
| `year_day` | 一年中的第几天。 |
| `month` | 月份数字。 |
| `month_name` | 完整的月份名称。 |
| `day` | 月份中的日期。 |
| `weekday` | 星期几，周日为 `0`。 |
| `weekday_name` | 完整的星期名称。 |
| `hour` | 24 小时制的小时。 |
| `minute` | 小时内的分钟。 |
| `second` | 分钟内的秒。 |
| `unix` | Unix 时间戳（秒）。 |
| `iso_year` | ISO 8601 周编号年份。 |
| `iso_week` | ISO 8601 周数。 |

## 相关函数

- [`unix_timestamp_parse`](/docs/templates/hcl_templates/functions/datetime/unix_timestamp_parse) 将 Unix 时间戳转换为日期和时间值。
- [`formatdate`](/docs/templates/hcl_templates/functions/datetime/formatdate) 格式化 RFC 3339 时间戳字符串。
