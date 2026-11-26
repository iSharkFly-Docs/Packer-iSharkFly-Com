---
title: endswith - 函数 - 配置语言
description: |-
  endswith 函数接受两个值：要检查的字符串和后缀字符串。如果第一个字符串以该精确后缀结尾，则返回 true。
---

# `endswith` 函数

`endswith` 接受两个值：要检查的字符串和后缀字符串。如果第一个字符串以该精确后缀结尾，函数返回 true。

```hcl
endswith(string, suffix)
```

## 示例

```
> endswith("hello world", "world")
true
> endswith("hello world", "hello")
false
```

## 相关函数

- [`startswith`](/docs/templates/hcl_templates/functions/string/startswith) 接受两个值：要检查的字符串和前缀字符串。如果字符串以该精确前缀开头，函数返回 true。
