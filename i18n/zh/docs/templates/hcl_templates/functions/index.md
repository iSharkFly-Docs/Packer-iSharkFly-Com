---
title: 内置函数参考概述
description: |-
  HCL 语言内置的函数可以转换和组合值。了解如何在 Packer 模板中使用内置函数。
---

# 内置函数概述

本文提供可在 Packer 模板中使用的内置 HashiCorp 配置语言 (HCL) 函数的概述。

## 函数语法

你可以在 Packer 模板中使用函数来转换和组合值。函数调用的语法是函数名后跟括号中的逗号分隔参数：

```hcl
max(5, 12, 9)
```

有关在字符串字面量中调用函数的信息，请参阅[字符串字面量参考](/docs/templates/hcl_templates/expressions#string-literals)部分。

HCL 不支持用户定义的函数。你只能调用语言内置的函数。
