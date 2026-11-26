---
title: strcontains - 函数 - 配置语言
description: |-
  strcontains 函数检查给定字符串是否可以在另一个字符串中找到。
---

# `strcontains` 函数

`strcontains` 接受两个值：要检查的字符串和要搜索的子字符串。如果第二个参数（子字符串）可以在第一个参数（字符串）中找到，函数返回 true。

```hcl
strcontains(string, substr)
```

## 示例

```
> strcontains("hello world", "wor")
true
> strcontains("hello world", "wod")
false
```
