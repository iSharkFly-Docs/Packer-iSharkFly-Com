---
title: substr 函数参考
description: |-
  `substr` 函数从给定字符串中按偏移量和长度提取子字符串。
---

# `substr` 函数

`substr` 从给定字符串中按偏移量和长度提取子字符串。

```hcl
substr(string, offset, length)
```

## 示例

```shellsession
> substr("hello world", 1, 4)
ello
```

偏移量索引可以是负数，在这种情况下它从字符串末尾向后计数。长度可以是 -1，这将返回从起始索引到字符串结尾的剩余部分。

```shellsession
> substr("hello world", -5, -1)
world
```

如果提供的长度超出剩余字符串的长度，它将被截断。

```shellsession
> substr("hello world", 6, 10)
world
```
