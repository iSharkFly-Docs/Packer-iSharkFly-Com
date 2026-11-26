---
title: join 函数参考
description: |-
  `join` 函数通过用给定的分隔符连接列表的元素来生成字符串。
---

# `join` 函数

`join` 通过用给定的分隔符将给定字符串列表的所有元素连接在一起来生成字符串。

```hcl
join(separator, list)
```

## 示例

```shellsession
> join(", ", ["foo", "bar", "baz"])
foo, bar, baz
> join(", ", ["foo"])
foo
```

## 相关函数

- [`split`](/docs/templates/hcl_templates/functions/string/split) 执行相反的操作：通过使用给定的分隔符分割单个字符串来生成列表。
