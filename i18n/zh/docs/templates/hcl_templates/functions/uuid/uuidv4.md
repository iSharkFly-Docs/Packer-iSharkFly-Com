---
title: uuidv4 函数参考
description: '`uuidv4` 函数根据 RFC 4122 版本 4 生成唯一的字符串 ID。'
---

# `uuidv4` 函数

`uuidv4` 生成唯一的标识符字符串。

该 ID 按照 [RFC 4122 第 4.4 节](https://tools.ietf.org/html/rfc4122#section-4.4) 的要求生成和格式化，生成版本 4 UUID。结果是仅从伪随机数生成的 UUID。

此函数每次调用时都会生成一个新值，因此直接在资源参数中使用它会导致虚假的差异。我们不建议在资源配置中使用 `uuidv4` 函数。

## 示例

```shellsession
> uuidv4()
9fc99a70-7cd5-482d-bb2b-03af016e4e94
```

## 相关函数

- [`uuidv5`](/docs/templates/hcl_templates/functions/uuid/uuidv5)，生成基于名称的 UUID。
