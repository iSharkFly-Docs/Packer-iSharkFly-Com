---
description: >
  后处理器压缩文件、上传文件并执行其他转换制品的任务。了解如何创建扩展 Packer 的自定义后处理器。
title: 创建自定义后处理器
---

# 创建自定义后处理器

Packer 后处理器将一个制品转换为另一个。例如，后处理器可能会压缩或上传文件。

在压缩示例中，转换将是获取一组文件的制品，压缩这些文件，并返回只有单个文件（压缩归档）的新制品。对于上传示例，转换将是获取一组文件的制品，上传这些文件，并返回只有单个 ID（上传的 URL）的制品。

后处理器插件实现 [`packer.PostProcessor`](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer#PostProcessor) 接口，并使用 `plugin.ServePostProcessor` 函数提供服务。

本页面解释如何实现和提供自定义后处理器。如果你希望你的后处理器支持 HashiCorp Cloud Platform (HCP) Packer，你还应该查阅 [HCP Packer 支持](/docs/plugins/creation/hcp-support)文档。

::: warning
**警告：** 这是一个高级主题，需要对 Packer 和 Packer 插件有深入的了解。
:::

## 开始之前

我们建议在开始开发之前查阅以下资源：
- [开发插件 - 概述](/docs/plugins/creation/)
- [Go](https://go.dev/) 语言。你必须使用 Go 编写自定义插件，因此本指南假设你熟悉该语言。

## 接口

后处理器必须实现的接口是 [`packer.PostProcessor`](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer#PostProcessor) 接口。下面是该接口的引用。源代码中的实际接口还包含一些基本文档，解释每个方法应该做什么。

```go
type PostProcessor interface {
  ConfigSpec() hcldec.ObjectSpec
  Configure(interface{}) error
  PostProcess(context.Context, Ui, Artifact) (a Artifact, keep, mustKeep bool, err error)
}
```

### "ConfigSpec" 方法

此方法返回一个 hcldec.ObjectSpec，这是在 Packer 中使用 HCL2 模板所必需的规范。有关如何使用和实现此函数的信息，请查阅我们的[对象规范文档](/guides/hcl/component-object-spec)。

### "Configure" 方法

每个后处理器的 `Configure` 方法在构建过程的早期调用以配置后处理器。配置作为原始 `interface{}` 传入。configure 方法负责将此配置转换为内部结构、验证它并返回任何错误。

为了将 `interface{}` 解码为有意义的结构，建议使用 [mapstructure](https://github.com/mitchellh/mapstructure) 库。Mapstructure 将接受一个 `interface{}` 并将其解码为任意复杂的结构体。如果有任何错误，它会生成非常人性化的错误信息，可以直接从 configure 方法返回。

虽然不会主动强制执行，但运行 `Configure` 方法不应产生**任何副作用**。具体来说，不要创建文件，不要创建网络连接等。Configure 的目的仅仅是设置内部状态并尽可能多地验证配置。

`Configure` 被运行并不意味着 `PostProcess` 一定会运行。例如，`packer validate` 将运行 `Configure` 来验证配置是否有效，但永远不会实际运行构建。

### "PostProcess" 方法

`PostProcess` 方法是真正工作的地方。PostProcess 负责获取一个 `packer.Artifact` 实现，并将其转换为另一个。
`PostProcess` 调用可以在任何时刻取消。当上下文结构体的 done 通道（`<-ctx.Done()`）解除阻塞时会触发取消。

当我们说"转换"时，我们不是指实际修改现有的 `packer.Artifact` 值本身。我们的意思是获取制品的内容并从中创建一个新的制品。例如，如果我们正在创建一个负责压缩文件的"compress"后处理器，转换将是从原始制品中获取 `Files()`，压缩它们，并创建一个只有单个文件的新制品：压缩归档。

此方法的返回签名是 `(Artifact, bool, bool, error)`。每个返回值解释如下：

- `Artifact` - 如果没有发生错误，则为新创建的制品。
- `bool` - 如果 keep 为 true，则输入制品将被强制保留。默认情况下，Packer 通常会删除所有输入制品，因为用户通常不希望保留中间制品。但是，某些后处理器依赖于先前制品的存在。如果这是 `true`，它会强制 packer 保留制品。
- `bool` - 如果 forceOverride 为 true，则忽略用户对 keep_input_artifact 的任何输入，并根据 `keep` 中设置的值保留或丢弃制品。
- `error` - 如果以任何方式出现错误，则为非 nil。如果是这种情况，其他两个返回值将被忽略。
