---
description: >
  `packer inspect` 命令输出模板使用的变量、构建器和配置器，以便你可以在不阅读 HCL 的情况下查看模板。
title: packer inspect 命令参考
---

# `packer inspect` 命令参考

`packer inspect` 命令接受一个模板并输出模板定义的各种组件。这可以帮助你快速了解模板，而无需深入研究 HCL 本身。该命令会告诉你模板接受哪些变量、定义的构建器、定义的配置器及其运行顺序等信息。

此命令在启用[机器可读输出](/docs/commands/)时特别有用。该命令以机器可解析的方式输出组件。

该命令不验证各种组件的实际配置（这是 `validate` 命令的工作），但它必然会验证模板的语法。

## 示例

给定一个基本模板，以下是输出可能的样子：

```shellsession
$ packer inspect template.pkr.hcl
> input-variables:

var.aws_access_key: "<sensitive>"
var.aws_secret_key: "<sensitive>"

> local-variables:

> builds:

  > <unnamed build 0>:

    sources:

      amazon-ebs.foo
      amazon-instance.bar
      virtualbox-iso.basic

    provisioners:

      shell

    post-processors:

      <no post-processor>
```
