---
description: |
  `packer validate` 命令验证 Packer 模板的语法和配置，帮助你防止错误。
title: packer validate 命令参考
---

# `packer validate` 命令参考

`packer validate` Packer 命令用于验证[模板](/docs/templates/)的语法和配置。成功时命令将返回零退出状态，失败时返回非零退出状态。此外，如果模板验证失败，将输出任何错误消息。

示例用法：

```shellsession
$ packer validate my-template.pkr.hcl
Template validation failed. Errors are shown below.

Errors validating build 'vmware'. 1 error(s) occurred:

* Either a path or inline script must be specified.
```

## 选项

- `-syntax-only` - 仅检查模板的语法。不验证配置。

- `-evaluate-datasources` - 在验证模板时评估所有数据源。这仅对 HCL2 模板有效，因为 JSON 模板不支持数据源，此选项将被忽略。

  ::: warning
  **警告：** 数据源可能依赖外部服务来获取数据，如果联系的服务按操作计费，验证时可能会产生一些费用。
  :::

- `-except=foo,bar,baz` - 验证所有构建，除了具有逗号分隔名称的那些。在旧版 JSON 模板中，构建名称默认为其构建器的类型（例如 `docker` 或 `amazon-ebs` 或 `virtualbox-iso`），除非在配置中指定了特定的 `name` 属性。在 HCL2 模板中，"name" 是源块的 "name" 标签，除非构建内源定义添加了 "name" 配置选项。

- `-no-warn-undeclared-var` - 当变量定义文件包含未声明变量的变量赋值时，不显示警告。当使用包含大量未用于给定 HCL2 模板的未使用变量的 var-file 时，可能会发生这种情况。对于 HCL2 模板，仅在 var-file 中为变量定义值本身不足以让 Packer 正常工作，因为模板文件 `pkr.hcl` 中还需要有该变量的变量块定义。默认情况下，当 var-file 包含一个或多个未声明的变量时，`packer validate` 会发出警告。

- `-only=foo,bar,baz` - 仅验证具有给定逗号分隔名称的构建。在旧版 JSON 模板中，构建名称默认为其构建器的类型（例如 `docker` 或 `amazon-ebs` 或 `virtualbox-iso`），除非在配置中指定了特定的 `name` 属性。在 HCL2 模板中，"name" 是源块的 "name" 标签，除非构建内源定义添加了 "name" 配置选项。

- `-machine-readable` 将所有输出设置为在 stdout 上变为机器可读。如果启用了日志记录，日志将继续出现在 stderr 上。

- `-var` - 在 Packer 模板中设置变量。此选项可以多次使用。这对于设置构建的版本号很有用。

- `-var-file` - 从文件设置模板变量。
