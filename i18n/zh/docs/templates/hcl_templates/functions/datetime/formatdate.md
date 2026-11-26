---
title: formatdate 函数参考
description: '`formatdate` 函数将时间戳转换为指定的时间格式。了解如何在 Packer 模板中使用 `formatdate` 函数。'
---

# `formatdate` 函数

`formatdate` 将时间戳转换为不同的时间格式。

```hcl
formatdate(spec, timestamp)
```

在 Packer 中，时间戳通常使用 [RFC 3339](https://tools.ietf.org/html/rfc3339) "日期和时间格式" 语法表示为字符串。`formatdate` 要求 `timestamp` 参数是符合此语法的字符串。

## 示例

```shellsession
> formatdate("DD MMM YYYY hh:mm ZZZ", "2018-01-02T23:12:01Z")
02 Jan 2018 23:12 UTC
> formatdate("EEEE, DD-MMM-YY hh:mm:ss ZZZ", "2018-01-02T23:12:01Z")
Tuesday, 02-Jan-18 23:12:01 UTC
> formatdate("EEE, DD MMM YYYY hh:mm:ss ZZZ", "2018-01-02T23:12:01-08:00")
Tue, 02 Jan 2018 23:12:01 -0800
> formatdate("MMM DD, YYYY", "2018-01-02T23:12:01Z")
Jan 02, 2018
> formatdate("HH:mmaa", "2018-01-02T23:12:01Z")
11:12pm
```

## 规范语法

格式规范是一个包含下表格式化序列的字符串。此函数旨在生成常见的_面向机器的_时间戳格式，例如 RFC822、RFC850 和 RFC1123 中定义的格式。它不适合真正面向人类的日期格式化，因为它不支持本地化。特别是，它只能生成英语的月份和星期名称。

规范可以包含以下序列：

| 序列 | 结果 |
| -------- | ----------------------------------------------------------------------- |
| `YYYY`   | 四位（或更多）数字年份，如 "2006"。 |
| `YY`     | 年份对 100 取模，零填充至少两位数字，如 "06"。 |
| `MMMM`   | 英语月份全名，如 "January"。 |
| `MMM`    | 英语月份名称缩写为三个字母，如 "Jan"。 |
| `MM`     | 月份数字零填充至两位，如 "01" 表示一月。 |
| `M`      | 月份数字不填充，如 "1" 表示一月。 |
| `DD`     | 月份中的日期零填充至两位，如 "02"。 |
| `D`      | 月份中的日期不填充，如 "2"。 |
| `EEEE`   | 英语星期全名，如 "Monday"。 |
| `EEE`    | 英语星期名称缩写为三个字母，如 "Mon"。 |
| `hh`     | 24 小时制小时零填充至两位，如 "02"。 |
| `h`      | 24 小时制小时不填充，如 "2"。 |
| `HH`     | 12 小时制小时零填充至两位，如 "02"。 |
| `H`      | 12 小时制小时不填充，如 "2"。 |
| `AA`     | 大写 AM/PM 标记，如 "AM"。 |
| `aa`     | 小写 AM/PM 标记，如 "am"。 |
| `mm`     | 小时内的分钟零填充至两位，如 "05"。 |
| `m`      | 小时内的分钟不填充，如 "5"。 |
| `ss`     | 分钟内的秒零填充至两位，如 "09"。 |
| `s`      | 分钟内的秒，如 "9"。 |
| `ZZZZZ`  | 时区偏移，用冒号分隔小时和分钟，如 "-08:00"。 |
| `ZZZZ`   | 时区偏移，只有符号和数字，如 "-0800"。 |
| `ZZZ`    | 类似 `ZZZZ`，但 UTC 显示为 "UTC"。 |
| `Z`      | 类似 `ZZZZZ`，但 UTC 显示为 "Z"。 |

任何非字母字符（如标点符号）将在输出中按原样复制。要在格式字符串中包含字面字母，请用单引号 `'` 将它们括起来。要包含字面引号，请通过双引号进行转义。

```shellsession
> formatdate("h'h'mm", "2018-01-02T23:12:01-08:00")
23h12
> formatdate("H 'o''clock'", "2018-01-02T23:12:01-08:00")
11 o'clock
```

此格式规范语法旨在让读者即使不是语法专家也能轻松猜测将产生什么格式。因此，没有常见格式的预定义简写，但下面给出了各种 RFC 指定格式的格式字符串，以便根据需要复制到你的配置中：

- [RFC 822](https://tools.ietf.org/html/rfc822#section-5) 和
  [RFC RFC 2822](https://tools.ietf.org/html/rfc2822#section-3.3):
  `"DD MMM YYYY hh:mm ZZZ"`
- [RFC 850](https://tools.ietf.org/html/rfc850#section-2.1.4):
  `"EEEE, DD-MMM-YY hh:mm:ss ZZZ"`
- [RFC 1123](https://tools.ietf.org/html/rfc1123#section-5.2.14):
  `"EEE, DD MMM YYYY hh:mm:ss ZZZ"`
- [RFC 3339](https://tools.ietf.org/html/rfc3339):
  `"YYYY-MM-DD'T'hh:mm:ssZ"`（但这也是输入格式，所以这样的转换是多余的。）

## 相关函数

- [`format`](/docs/templates/hcl_templates/functions/string/format) 是用于任意数据的更通用的格式化函数。
- [`timestamp`](/docs/templates/hcl_templates/functions/datetime/timestamp) 返回适合作为 `formatdate` 输入的当前日期和时间。
