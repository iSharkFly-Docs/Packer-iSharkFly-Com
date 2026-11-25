---
description: |
  `packer hcl2_upgrade` Packer 命令将 JSON 配置模板转换为 HCL2，以便你可以过渡到 HCL 模板。
title: packer hcl2_upgrade 命令参考
---

# `packer hcl2_upgrade` 命令参考

`packer hcl2_upgrade` Packer 命令将 JSON 配置模板转换为其格式化的 HCL2 对应物。成功时命令返回零退出状态，失败时返回非零退出状态。

::: info
**此命令处于 beta 阶段**。我们不建议在生产环境中使用 beta 功能。要报告问题并提供反馈，请[打开 GitHub issue](https://github.com/hashicorp/packer/issues/new/choose)。
:::

## 用法

```shellsession
$ packer hcl2_upgrade my-template.json

Successfully created my-template.json.pkr.hcl
```

## 升级变量文件

从 **v1.7.1** 开始，`hcl2_upgrade` 命令可以升级变量文件。

<Tabs :tabs="[{label:'原始文件 (variables.json)',value:'t0'},{label:'结果文件 (variables.pkr.hcl)',value:'t1'}]">

<TabItem value="t0">

```json
{
  "variables": {
    "aws_region": null,
    "aws_secondary_region": "{{ env `AWS_DEFAULT_REGION` }}",
    "aws_secret_key": "",
    "aws_access_key": ""
  },
  "sensitive-variables": ["aws_secret_key", "aws_access_key"]
}
```

</TabItem>

<TabItem value="t1">

```hcl
variable "aws_access_key" {
  type      = string
  default   = ""
  sensitive = true
}

variable "aws_region" {
  type = string
}

variable "aws_secondary_region" {
  type    = string
  default = "${env("AWS_DEFAULT_REGION")}"
}

variable "aws_secret_key" {
  type      = string
  default   = ""
  sensitive = true
}
```

</TabItem>

</Tabs>

## Go 模板函数

`hcl2_upgrade` 会尽力将你的 Go _模板调用_ 转换为 HCL2，以下是应该被转换的调用列表：

- `` {{ user `my_var` }} `` 变为 `${var.my_var}`。
- `` {{ env `my_var` }} `` 变为 `${var.my_var}`。Packer HCL2 通过输入变量支持环境变量。有关更多信息，请参阅[文档](/docs/templates/hcl_templates/variables#environment-variables)。
- `{{ timestamp }}` 变为 `${local.timestamp}`，局部变量将为所有生成的文件创建。
- `` {{ build `ID` }} `` 变为 `${build.ID}`。

其余的调用目前应该保持为 Go 模板调用，这将随着时间的推移而改进。

::: info
**注意**：`hcl2_upgrade` 命令尽力将模板调用转换为其 JSON 对应物，但可能会失败。在这种情况下，`hcl2_upgrade` 命令将简单地输出本地 HCL2 块而不进行转换，并在注释中包含错误消息。我们目前正在努力改进转换器的这一部分。
:::

## 选项

- `-output-file` - 生成的 hcl2 模板的文件名。默认为 JSON_TEMPLATE.pkr.hcl；例如，如果文件名为 "packerparty.json"，默认输出文件为 "packerparty.json.pkr.hcl"。
- `-with-annotations` - 向 HCL 模板添加有关生成的 HCL2 块的有用注释。

## 使用其他用户变量的用户变量

Packer JSON 最近开始允许在变量中使用用户变量。在 HCL2 中，输入变量不能使用函数或其他变量，实际上是静态的，必须使用局部变量来制作更动态的变量。

对于 v1.7.0 及更低版本，`hcl2_upgrade` 不会将变量升级为局部变量，你需要手动升级它们。升级到 **v1.7.1** 让命令自动为你完成。

以下是使用字符串输入变量的局部变量示例：

```hcl
variable "foo" {
  default = "Hello,"
}

variable "bar" {
  default = "World!"
}

locals {
  baz = "${var.foo} ${var.bar}"
}
```

## 升级使用第三方社区插件的模板

如果你的模板引用的插件没有与主 Packer 二进制文件捆绑在一起，你需要确保[插件已安装](/docs/plugins/#installing-plugins)，否则你将收到 `unknown builder type` 错误。Packer 需要加载插件来转换模板。
