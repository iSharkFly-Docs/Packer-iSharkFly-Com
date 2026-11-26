---
description: >
  数据源获取要在 Packer 配置中使用的数据。了解如何定义自定义数据源，以便 Packer 可以在构建中使用外部数据。
title: 自定义数据源 - 扩展
---

# 自定义数据源

Packer 数据源允许 Packer 获取要在配置中使用的数据，包括在 Packer 外部定义的信息。例如，[amazon-ami 数据源](https://developer.hashicorp.com/packer/plugins/datasources/amazon/ami)输出来自 Amazon AMI 的数据。

数据源插件实现 `packersdk.Datasource` 接口，并使用 `set.RegisterDatasource(...)` 函数在插件集中注册，使用 `set.Run()` 提供服务。

::: warning
**警告：** 这是一个高级主题，需要对 Packer 和 Packer 插件有深入的了解。
:::

## 开始之前

我们建议在开始开发之前查阅以下资源：

- [开发插件 - 概述](/docs/plugins/creation/)
- [Go](https://go.dev/) 语言。你必须使用 Go 编写自定义插件，因此本指南假设你熟悉该语言。

## 接口

数据源必须实现的接口是 `packersdk.Datasource` 接口。下面是该接口的引用。源代码中的实际接口还包含一些基本文档，解释每个方法应该做什么。

```go
type Datasource interface {
    ConfigSpec() hcldec.ObjectSpec
    OutputSpec() hcldec.ObjectSpec
    Configure(...interface{}) error
    Execute() (cty.Value, error)
}
```

### "ConfigSpec" 方法

此方法返回一个 hcldec.ObjectSpec，这是在 Packer 中使用 HCL2 模板所必需的规范。有关如何使用和实现此函数的信息，请查阅我们的[对象规范文档](/guides/hcl/component-object-spec)。

### "OutputSpec" 方法

此方法返回数据源输出的 [hcldec.ObjectSpec](/guides/hcl/component-object-spec)。对象规范可以使用命令 [`packer-sdc mapstructure-to-hcl2`](https://github.com/hashicorp/packer-plugin-sdk/tree/main/cmd/packer-sdc) 生成，就像 `ConfigSpec` 方法的配置规范一样。

此方法用于 `packer validate` 命令。Packer 将使用该规范为数据源分配未知值，而不是执行它并获取实际值。

### "Configure" 方法

`Configure` 方法在任何运行之前使用模板中给出的配置调用。这作为 `interface{}` 类型的数组传递，但通常是 `map[string]interface{}`。Configure 方法负责将此配置转换为内部结构、验证它并返回任何错误。

对于多个参数，它们应该合并到最终配置中，后面的参数覆盖任何先前的配置。合并的确切语义由构建器作者决定。

为了将 `interface{}` 解码为有意义的结构，建议使用 [mapstructure](https://github.com/mitchellh/mapstructure) 库。Mapstructure 将接受一个 `interface{}` 并将其解码为任意复杂的结构体。如果有任何错误，它会生成非常人性化的错误信息，可以直接从 Configure 方法返回。

虽然不会主动强制执行，但运行 `Configure` 方法不应产生**任何副作用**。具体来说，不要创建文件，不要启动虚拟机等。Configure 的目的仅仅是配置数据源和验证配置。

`Configure` 方法在构建过程的早期调用，以便可以在任何实际发生之前向用户显示错误。

### "Execute" 方法

此方法返回一个 HCL cty.Value 和一个错误。Packer 将在 `packer build` 命令上运行 Execute 方法，以便在评估 build 和 locals 块之前数据源输出可用。预期 Execute 命令将获取数据并将其作为 cty.Value 返回。

要从输出配置获取等效的 cty.Value，我们建议使用我们的 [packer-plugin-sdk hcl2helper 函数](https://github.com/hashicorp/packer-plugin-sdk/blob/v0.0.7/hcl2helper/values.go)。

## 脚手架模板

为了在开发新的数据源插件时更轻松，我们提供了一个 [Packer 插件脚手架](https://github.com/hashicorp/packer-plugin-scaffolding)作为你插件仓库的模板。该模板结构包含基础内容和必要的配置，以开始创建你自己的插件。
