---
description: |
  你可以为 Packer 创建自定义构建器来扩展构建功能。了解如何使用 Packer 插件接口编写自定义构建器。
title: 创建自定义构建器
---

# 创建自定义构建器

Packer 构建器负责创建虚拟机、设置虚拟机以进行配置，然后将配置好的虚拟机转换为机器镜像。我们官方维护和分发多个构建器，包括在 Amazon EC2、VMware、Google Compute Engine 等上创建镜像的构建器。有关详细信息，请参阅[构建器](/docs/builders/)文档。

本页面解释如何使用 Packer 插件接口编写自定义构建器。如果你希望你的构建器支持 HashiCorp Cloud Platform (HCP) Packer，你还应该查阅 [HCP Packer 支持](/docs/plugins/creation/hcp-support)文档。

::: warning
**警告：** 这是一个高级主题，需要对 Packer 和 Packer 插件有深入的了解。
:::

## 开始之前

我们建议在开始开发之前查阅以下资源：

- [开发插件 - 概述](/docs/plugins/creation/)
- [Go](https://go.dev/) 语言。你必须使用 Go 编写自定义插件，因此本指南假设你熟悉该语言。

## 接口

要创建你自己的构建器，你必须创建一个实现 [`packer.Builder`](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer#Builder) 接口的结构体。下面是该接口的引用。

```go
type Builder interface {
  ConfigSpec() hcldec.ObjectSpec
  Prepare(...interface{}) ([]string, []string, error)
  Run(context.Context, ui Ui, hook Hook) (Artifact, error)
}
```

### "ConfigSpec" 方法

此方法返回一个 hcldec.ObjectSpec，这是在 Packer 中使用 HCL2 模板所必需的规范。有关如何使用和实现此函数的信息，请查阅我们的[对象规范文档](/guides/hcl/component-object-spec)。

### "Prepare" 方法

每个构建器的 `Prepare` 方法将在构建开始时由 Packer 核心调用。其目的是解析和验证使用 `packer build your_packer_template.json` 提供给 Packer 的配置模板，但不执行 API 调用或开始创建任何资源或制品。

来自 Packer 模板的配置作为 `interface{}` 类型的数组传递给 Prepare() 方法，但通常是 `map[string]interface{}`。Prepare 方法负责将此配置转换为内部结构、验证它并返回任何错误。

如果将多个参数传递给 Prepare()，它们应该合并到最终配置中，后面的参数覆盖任何先前的配置。合并的确切语义由构建器作者决定。

我们建议你使用 [mapstructure](https://godoc.org/github.com/mitchellh/mapstructure) 库将 `interface{}` 解码为有意义的结构。Mapstructure 将接受一个 `interface{}` 并将其解码为任意复杂的结构体。如果有任何错误，它会生成非常人性化的错误信息，可以直接从 prepare 方法返回。你可以在 HashiCorp 维护的 Packer 插件的 Prepare() 方法中找到此库的许多使用示例。

虽然 Packer 不会主动强制执行，但运行 `Prepare` 方法不应产生**任何副作用**。具体来说：不要创建文件，不要启动虚拟机等。Prepare 的目的仅仅是将模板中的配置加载为构建器可用的格式、验证该配置并为该配置应用必要的默认值。

除了 Packer 模板中提供的配置外，Packer 还将提供一个包含构建名称、构建器类型、核心版本等元信息的 [common.PackerConfig](https://github.com/hashicorp/packer-plugin-sdk/blob/8a28198491f70deca3824ce452adf6f9bd507880/common/packer_config.go#L44)，编码为 `map[string]interface{}`。此映射中一个重要的元信息是 `packer.DebugConfigKey`，如果为构建启用了调试模式，则设置为布尔值 `true`。如果设置为 true，则构建器应启用调试模式，以帮助构建器开发者和高级用户内省构建过程中发生的情况。在调试构建期间，严格禁用并行处理，因此可以安全地从 stdin 请求输入等。

Prepare() 返回一个字符串数组和一个错误。字符串数组是你的构建器将使用 generatedData 机制提供给配置器的运行时创建的变量的特殊键列表（详见下文）。例如，可以是你的构建器创建的云实例的实例 ID。如果你不打算使用 generatedData 功能，只需返回一个空列表。如果用户提供的配置有问题且构建不应继续，则应使用错误。

### "Run" 方法

`Run` 通常为多个构建器并行执行，以实际构建机器、配置它并创建生成的机器镜像，该镜像作为 `packer.Artifact` 接口的实现返回。

`Run` 方法接受三个参数。context.Context 用于取消构建。`packer.Ui` 对象用于向控制台发送输出。`packer.Hook` 用于执行钩子，这将在下面的配置部分详细介绍。

由于构建器运行通常是许多步骤的复杂集合，packer-plugin-sdk 包含一个 [multistep](https://godoc.org/github.com/hashicorp/packer-plugin-sdk/multistep) 模块。Multistep 允许你将构建逻辑分成多个独立的"步骤"，具有单独的运行和清理阶段，并按顺序运行它们。它支持中途取消、调试时在步骤之间暂停、CLI 的 on-error 标志等。所有 HashiCorp 维护的构建器都使用此模块，虽然构建器实现不要求使用它，但它将帮助你以符合用户和 Packer 核心假设的方式创建构建器。SDK 还提供了许多"辅助"通用步骤，可以防止你不得不重新实现 HashiCorp 维护者已经完成的工作。示例包括发送启动命令、连接到 SSH 和创建要挂载到 VM 上的虚拟 CD。请查看 SDK 中的 [communicator](https://github.com/hashicorp/packer-plugin-sdk/tree/main/communicator) 和 [multistep/commonsteps](https://github.com/hashicorp/packer-plugin-sdk/tree/main/multistep/commonsteps) 模块，了解可用的工具。

最后，`Run` 应该返回 `packer.Artifact` 的实现。有关创建 `packer.Artifact` 的更多详细信息，请参阅下面的制品部分。如果在构建过程中出现问题导致无法正确创建制品，`Run` 应该返回错误和 nil 制品。请注意，你的构建器可以不产生制品也不产生错误，尽管这是罕见的用例。

### 取消

#### 使用 "Cancel" 方法（适用于 Packer < v1.3 的插件）

`Cancel` 方法可以在任何时候调用，请求取消正在进行的任何构建器运行。此方法应该阻塞直到运行实际停止。请注意，Packer 版本 >= 1.4.0 不会调用 Cancel 方法。

#### 上下文取消（从 Packer v1.4 开始）

`<-ctx.Done()` 可以在任何时候解除阻塞，表示请求取消正在进行的任何构建器运行。

取消最常见的触发是外部中断，例如用户按下 `Ctrl-C`。Packer 只有在所有构建器清理完成后才会退出，因此重要的是你要设计你的构建器，使其能够快速响应这些取消并自行清理。如果你的构建器进行长时间运行的调用，你应该考虑用户可能在该调用期间取消构建的可能性，并确保这种取消不会被阻塞。

## 创建制品

`Run` 方法预期返回 `packer.Artifact` 接口的实现。每个构建器必须创建自己的此接口实现。

通过阅读 [packer.Artifact 接口文档](https://godoc.org/github.com/hashicorp/packer-plugin-sdk/packer#Artifact)，制品的大部分内容应该相当容易理解。

然而，制品中可能令人困惑的一部分是 `BuilderId` 方法。此方法必须返回构建器的绝对唯一 ID。一般来说，合理的 ID 是创建构建器的 github 用户名或组织，后面是它正在构建的平台。例如，VMware 构建器的构建器 ID 是 "hashicorp.vmware"。

后处理器使用构建器 ID 值来对制品结果做出一些假设，并确定它们是否能够针对给定的制品运行，因此重要的是一旦构建器发布，此 ID 永远不要更改。

每个构建器的构建器 ID 包含在相关文档页面上。

## 配置

Packer 使用配置器插件内置支持配置。但是构建器本身，而不是 Packer 核心，必须确定何时调用配置器，因为只有构建器知道机器何时运行并准备好进行通信。

当机器准备好被配置时，运行 `packer.HookProvision` 钩子，确保通信器不为 nil，因为这是配置器所必需的。下面是调用钩子的示例：

```go
hook.Run(context.Context, packer.HookProvision, ui, comm, nil)
```

此时，Packer 将运行配置器，不需要额外的工作。

如果你使用 multistep 工具，Packer 插件 SDK 包含一个通用的 StepProvision，它为你处理配置钩子的执行，并自动提供你想要提供给配置器的任何自定义构建器 generatedData（有关 generatedData 的更多详细信息，请参见下文）。

## 模板引擎

::: warning
注意：在 HCL2 中，JSON 模板引擎和生成的数据将逐渐被弃用，取而代之的是使用 HCL2 对象，我们将继续支持这些，但如果可以的话，建议避免使用它们。
:::

### 构建变量

Packer JSON 使得可以使用 `build` 函数提供自定义模板引擎变量以与配置器和后处理器共享。JSON 模板 `build` 文档在[这里](/docs/templates/legacy_json_templates/engine#build)，HCL 模板构建文档在[这里](/docs/templates/hcl_templates/contextual-variables#build-variables)。

从 Packer v1.5.0 开始，构建器 Prepare() 方法返回一个自定义变量列表，我们称之为 `generated data`。我们使用该变量列表为每个构建器生成一个自定义占位符映射，该映射将自定义变量与 Packer 创建的默认构建变量的占位符映射结合起来。这是一个告诉 packer 构建器将提供什么的示例代码片段：

```go
func (b *Builder) Prepare(raws ...interface{}) ([]string, []string, error) {
    // ...

    generatedData := []string{"SourceImageName"}
    return generatedData, warns, nil
}
```

当用户提供使用 `build` 函数的 Packer 模板时，Packer 使用此 generatedData 数组验证 `build` 函数中的键是否存在于给定的构建器中。如果不存在，则 Packer 验证将失败。

设置占位符后，需要在调用配置器时传递变量的实际值。这可以像下面的示例一样完成：

```go
func (b *Builder) Run(ctx context.Context, ui packer.Ui, hook packer.Hook) (packer.Artifact, error) {
    // ...

    // 创建自定义变量映射
    generatedData := map[string]interface{}{"SourceImageName": "the source image name value"}
    // 将映射传递给配置器
    hook.Run(context.Context, packer.HookProvision, ui, comm, generatedData)

    // ...
}
```

为了使这些相同的变量和 Packer 默认变量也可用于后处理器，你的构建器需要将它们添加到其制品中。这可以通过向制品添加 `map[string]interface{}` 类型的属性并将生成的数据放入其中来完成。后处理器稍后将通过制品的 `State` 方法访问此数据。

制品代码应该类似于以下实现：

```go
type Artifact struct {
	// ...

	// StateData 应该存储诸如 GeneratedData 之类的数据
	// 以与后处理器共享
	StateData map[string]interface{}
}

// ...

func (a *Artifact) State(name string) interface{} {
	return a.StateData[name]
}

// ...
```

构建器应该返回包含生成数据的上述制品，代码应该类似于以下示例代码片段：

```go
func (b *Builder) Run(ctx context.Context, ui packer.Ui, hook packer.Hook) (packer.Artifact, error) {
    // ...

    return &Artifact{
                // ...
                StateData: map[string]interface{}{"generated_data": state.Get("generated_data")},
            }, nil
}
```

上面的代码将 `generated_data` 状态分配给 `StateData` 映射，键为 `generated_data`。

以下是后处理器如何使用此数据的一些示例：

```go
func (p *PostProcessor) PostProcess(ctx context.Context, ui packer.Ui, source packer.Artifact) (packer.Artifact, bool, bool, error) {
    generatedData := source.State("generated_data")

    // 然后 generatedData 将用于插值

    // ...
}
```

## 整合所有内容

到目前为止，本页面重点介绍了 Builder 接口的实现细节。你需要创建一个服务器并将构建器存储在二进制文件中，以便将其作为插件提供给 Packer 核心。我们创建了一个[脚手架](https://github.com/hashicorp/packer-plugin-scaffolding/blob/main/builder/scaffolding/builder.go)仓库，让你了解仓库中构建器实现和服务器实现之间的关系，然后阅读[插件工作原理基础](/docs/plugins/install)，其中详细介绍了所有服务器细节。
