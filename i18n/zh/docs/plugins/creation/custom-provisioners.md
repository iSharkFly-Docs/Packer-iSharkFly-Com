---
description: >
  配置器在将机器转换为镜像之前安装和配置软件。了解如何创建扩展 Packer 功能的自定义配置器。

title: 创建自定义配置器
---

# 创建自定义配置器

Packer 配置器在将运行中的机器转换为镜像之前安装和配置软件。例如，[shell 配置器](/docs/provisioners/shell)在机器内运行 shell 脚本。

配置器插件实现 [`packer.Provisioner`](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer#Provisioner) 接口，并使用 `plugin.ServeProvisioner` 函数提供服务。

::: warning
**警告：** 这是一个高级主题，需要对 Packer 和 Packer 插件有深入的了解。
:::

## 开始之前

我们建议在开始开发之前查阅以下资源：
- [开发插件 - 概述](/docs/plugins/creation/)
- [Go](https://go.dev/) 语言。你必须使用 Go 编写自定义插件，因此本指南假设你熟悉该语言。

## 接口

配置器必须实现的接口是 [`packer.Provisioner`](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer#Provisioner) 接口。下面是该接口的引用。源代码中的实际接口还包含一些基本文档，解释每个方法应该做什么。

```go
type Provisioner interface {
  ConfigSpec() hcldec.ObjectSpec
  Prepare(...interface{}) error
  Provision(context.Context, Ui, Communicator, map[string]interface{}) error
}
```

### `Prepare` 方法

每个配置器的 `Prepare` 方法在任何运行之前使用模板中给出的配置调用。这作为 `interface{}` 类型的数组传递，但通常是 `map[string]interface{}`。prepare 方法负责将此配置转换为内部结构、验证它并返回任何错误。

对于多个参数，它们应该合并到最终配置中，后面的参数覆盖任何先前的配置。合并的确切语义由构建器作者决定。

为了将 `interface{}` 解码为有意义的结构，建议使用 [mapstructure](https://github.com/mitchellh/mapstructure) 库。Mapstructure 将接受一个 `interface{}` 并将其解码为任意复杂的结构体。如果有任何错误，它会生成非常人性化的错误信息，可以直接从 prepare 方法返回。

虽然不会主动强制执行，但运行 `Prepare` 方法不应产生**任何副作用**。具体来说，不要创建文件，不要启动虚拟机等。Prepare 的目的仅仅是配置构建器和验证配置。

`Prepare` 方法在构建过程的早期调用，以便可以在任何实际发生之前向用户显示错误。

### `ConfigSpec` 方法

此方法返回一个 `hcldec.ObjectSpec`，这是在 Packer 中使用 HCL2 模板所必需的规范。有关如何使用和实现此函数的信息，请查阅我们的[对象规范文档](/guides/hcl/component-object-spec)。

### `Provision` 方法

`Provision` 方法在机器运行并准备好被配置时调用。配置器应该在这里执行其实际工作。

该方法接受两个参数：一个 `packer.Ui` 和一个 `packer.Communicator`。UI 可用于与用户沟通正在发生的事情。通信器用于与运行中的机器通信，并保证此时已连接。

provision 方法在配置完成之前不应返回。

map[string]interface{} 为用户提供特定于构建的信息，如主机和 IP，由 `build` 模板引擎提供。配置器可以随意使用此信息，或不使用它。

## 使用通信器

`packer.Communicator` 参数和接口用于与运行中的机器通信。机器可能是本地的（在某种虚拟机或容器中）或者可能是远程的（在云中）。通信器接口抽象了这一点，因此整体通信是相同的。

[代码本身](https://godoc.org/github.com/hashicorp/packer-plugin-sdk/packer#Communicator)周围的文档作为如何使用接口的概述非常好。你应该首先阅读它。阅读后，你可以看到下面的一些使用示例：

```go
// 构建远程命令。
var cmd packer.RemoteCmd
cmd.Command = "echo foo"

// 我们关心 stdout，所以让我们将其收集到缓冲区中。由于
// 我们没有设置 stderr，它将被丢弃。
var stdout bytes.Buffer
cmd.Stdout = &stdout

// 启动命令
if err := comm.Start(&cmd); err != nil {
  panic(err)
}

// 等待它完成
cmd.Wait()

// 读取 stdout！
fmt.Printf("Command output: %s", stdout.String())
```
