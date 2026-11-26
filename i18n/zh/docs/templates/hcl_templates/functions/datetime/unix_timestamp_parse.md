---
title: unix_timestamp_parse 函数参考
description: '`unix_timestamp_parse` 函数将 Unix 时间戳转换为 Packer 模板的日期和时间值。'
---

# `unix_timestamp_parse` 函数

`unix_timestamp_parse` 函数将 Unix 时间戳（以秒为单位）转换为包含协调世界时 (UTC) 日期和时间值的对象。

```hcl
unix_timestamp_parse(UNIX_TIMESTAMP)
```

该函数需要一个适合有符号 64 位整数的整数。

## 示例

```hcl
locals {
  timestamp = unix_timestamp_parse(1690328596)
  rfc3339  = local.timestamp.rfc3339
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
| `rfc3339` | RFC 3339 时间戳字符串。 |
| `iso_year` | ISO 8601 周编号年份。 |
| `iso_week` | ISO 8601 周数。 |

## 相关函数

- [`rfc3339_parse`](/docs/templates/hcl_templates/functions/datetime/rfc3339_parse) 将 RFC 3339 时间戳转换为日期和时间值。
- [`formatdate`](/docs/templates/hcl_templates/functions/datetime/formatdate) 格式化 RFC 3339 时间戳字符串。
