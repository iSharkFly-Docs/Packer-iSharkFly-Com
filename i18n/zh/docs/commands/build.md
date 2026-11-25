---
description: |
  `packer build` 命令构建模板中定义的所有制品。构建可以并行或顺序运行。
title: packer build - 命令
---

# `packer build` 命令参考

::: info
从 2025 年 8 月 1 日起，许多官方 HashiCorp 维护的 Packer 插件的源将从 GitHub releases 迁移到官方 HashiCorp 发布站点 [releases.hashicorp.com](https://releases.hashicorp.com)。有关更多信息，请参阅[安装 HashiCorp 维护的插件](/docs/plugins/install#install-hashicorp-maintained-plugins)。
:::

`packer build` 命令接受一个模板并按顺序运行其中的所有构建，以生成一组制品。模板中指定的各种构建默认并行执行，除非另有指定。构建结束时将输出创建的制品。

## 选项

- `-color=false` - 禁用彩色输出。默认启用。

- `-debug` - 禁用并行化并启用调试模式。调试模式标记构建器应该输出调试信息。调试模式的确切行为由构建器决定。通常，构建器会在每个步骤之间停止，等待键盘输入后再继续。这将允许用户检查状态等。

- `-except=foo,bar,baz` - 运行所有构建和后处理器，除了具有给定逗号分隔名称的那些。在旧版 JSON 模板中，构建名称默认为其构建器的类型（例如 `docker` 或 `amazon-ebs` 或 `virtualbox-iso`），除非在配置中指定了特定的 `name` 属性。在 HCL2 模板中，"name" 是源块的 "name" 标签，除非构建内源定义添加了 "name" 配置选项。跳过的后处理器之后的任何后处理器都不会运行。因为后处理器可以嵌套在数组中，所以不同的后处理器链仍然可以运行。名称为空的后处理器将被忽略。

- `-force` - 当先前构建的制品阻止构建运行时，强制构建器运行。强制构建的确切行为由构建器决定。通常，支持强制构建的构建器将删除先前构建的制品。这将允许用户重复构建，而无需事先手动清理这些制品。

- `-on-error=cleanup`（默认）、`-on-error=abort`、`-on-error=ask`、`-on-error=run-cleanup-provisioner` - 选择构建在配置期间失败时的操作。请注意，这只影响配置器运行期间的构建，不影响后处理器运行期间，因为它与配置器失败时是否保持实例运行以及系统上生成的 SSH 密钥等相关制品有关。

  - `cleanup` 清理先前步骤后的内容，删除临时文件和虚拟机。
  - `abort` 退出而不进行任何清理，这可能需要下次构建使用 `-force`。
  - `ask` 显示提示并等待你决定清理、中止或重试失败的步骤。
  - `run-cleanup-provisioner` 中止并退出，不进行任何清理，除了[错误清理配置器](/docs/templates/legacy_json_templates/provisioners#on-error-provisioner)（如果定义了的话）。

- `-only=foo,bar,baz` - 仅运行具有给定逗号分隔名称的构建。在旧版 JSON 模板中，构建名称默认为其构建器的类型（例如 `docker` 或 `amazon-ebs` 或 `virtualbox-iso`），除非在配置中指定了特定的 `name` 属性。在 HCL2 模板中，"name" 是源块的 "name" 标签，除非构建内源定义添加了 "name" 配置选项。

- `-parallel-builds=N` - 限制并行运行的构建数量，0 表示无限制（默认为 0）。

- `-timestamp-ui` - 启用每个 UI 输出的 RFC3339 时间戳前缀。

- `-var` - 在 Packer 模板中设置变量。此选项可以多次使用。这对于设置构建的版本号很有用。

- `-var-file` - 从文件设置模板变量。

- `-warn-on-undeclared-var` - 设置此标志将对变量定义文件（*.pkrvars.hcl | *.pkrvars.json）中没有对应变量块的每个赋值产生警告。当使用包含大量未用于给定 HCL2 模板的未使用变量的 var-file 时，可能会发生这种情况。对于 HCL2 模板构建，仅在 var-file 中为变量定义值本身不足以让 Packer 正常工作，因为模板文件 `pkr.hcl` 中还需要有该变量的变量块定义。默认情况下，当 var-file 包含一个或多个未声明的变量时，`packer build` 不会发出警告。

- `-skip-enforcement` - 跳过注入 HCP Packer 强制配置器。强制配置器是链接到 HCP Packer 存储桶的版本化配置器定义，Packer 在构建期间自动应用它们。有关详细信息，请参阅[强制配置器](https://developer.hashicorp.com/hcp/docs/packer/store/enforce-provisioners)。
