---
title: startswith - 函数 - 配置语言
description: |-
  startswith 函数接受两个值：要检查的字符串和前缀字符串。如果字符串以该精确前缀开头，函数返回 true。
---

# `startswith` 函数

`startswith` 接受两个值：要检查的字符串和前缀字符串。如果字符串以该精确前缀开头，函数返回 true。

```hcl
startswith(string, prefix)
```

## 示例

```
> startswith("hello world", "hello")
true
> startswith("hello world", "world")
false
```

## 相关函数

- [`endswith`](/docs/templates/hcl_templates/functions/string/endswith) 接受两个值：要检查的字符串和后缀字符串。如果第一个字符串以该精确后缀结尾，函数返回 true。
