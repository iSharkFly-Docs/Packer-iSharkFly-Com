---
title: HCL 模板概述
description: |-
  HCL 模板是使用 HashiCorp 配置语言 (HCL) 描述基础设施和设置变量的配置文件。了解 Packer 的 HCL 模板。
---

# HCL 模板概述

本文提供关于 Packer 的 HashiCorp 配置语言 (HCL) 模板的概述信息。

## 简介

Packer 读取并应用 HCL 模板文件中定义的配置。HCL 模板提供了获取构建文件所需步骤的简洁描述。你可以在 HCL 模板中添加参数、块和表达式来将构建定义为代码。有关更多信息，请参阅 [Packer HCL2 简介](/guides/hcl/)。

## 构建

HCL 语言的主要目的是定义构建和源。所有其他语言特性仅用于使构建的定义更加灵活和方便。

`packer build` 接受一个参数。当传递一个目录时，文件夹中所有名称以 `.pkr.hcl` 或 `.pkr.json` 结尾的文件都将使用 HCL2 格式解析。当传递一个以 `.pkr.hcl` 或 `.pkr.json` 结尾的文件时，它将使用 HCL2 模式解析。对于所有其他情况，将使用 _仅 JSON_ 的旧 Packer 模式。

## 参数、块和表达式

HCL 语言的语法仅由几个基本元素组成：

```hcl
source "amazon-ebs" "main" {
  ami_name = "main-ami"
}

<BLOCK TYPE> "<BLOCK LABEL>" "<BLOCK LABEL>" {
  # Block body
  <IDENTIFIER> = <EXPRESSION> # Argument
}
```

- _块_ 是其他内容的容器，通常代表某种对象的配置，如源。块有一个 _块类型_，可以有零个或多个 _标签_，并有一个包含任意数量参数和嵌套块的 _主体_。Packer 的大多数功能由配置文件中的顶级块控制。
- _参数_ 将值分配给名称。它们出现在块中。
- _表达式_ 表示一个值，可以是字面量或通过引用和组合其他值。它们作为参数的值出现，或在其他表达式中出现。

有关 Packer 语法的完整详细信息，请参阅：

- [配置语法](/docs/templates/hcl_templates/syntax)
- [表达式](/docs/templates/hcl_templates/expressions)

## 代码组织

HCL 语言使用以 `.pkr.hcl` 文件扩展名命名的配置文件。还有一种[基于 JSON 的语言变体](/docs/templates/hcl_templates/syntax-json)，以 `.pkr.json` 文件扩展名命名。

配置文件必须始终使用 UTF-8 编码，按照惯例通常使用 Unix 风格的行尾 (LF) 而不是 Windows 风格的行尾 (CRLF) 维护，尽管两者都被接受。

## 配置顺序

根块的顺序不重要。`build` 中 `provisioner` 或 `post-processor` 块的顺序是块顺序重要的唯一主要功能。
