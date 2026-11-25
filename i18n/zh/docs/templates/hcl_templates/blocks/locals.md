---
description: >
  `locals` 和 `local-variable` 块在 Packer 配置中声明局部变量。了解如何使用这些块在模板中声明局部变量。
title: locals 块参考
---

# `locals` 块

本文提供关于 `locals` 块的参考信息。

## 描述

`locals` 和 `local-variable` 块在 Packer 配置中声明局部变量。

```hcl
# locals.pkr.hcl
locals {
    # locals 可以是裸值，如：
    wee = local.baz
    # locals 也可以用其他变量设置：
    baz = "Foo is '${var.foo}' but not '${local.wee}'"
}

# 如果你需要将 local 标记为敏感，请使用单数 local 块
local "mylocal" {
  expression = "${var.secret_api_key}"
  sensitive  = true
}
```

有关使用 `locals` 和 `local-variable` 块的更多信息，请参阅以下主题：

- [局部变量](/docs/templates/hcl_templates/locals)
- [输入变量和局部变量](/guides/hcl/variables)
