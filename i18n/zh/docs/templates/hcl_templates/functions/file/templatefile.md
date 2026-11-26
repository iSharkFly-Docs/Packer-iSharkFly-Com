---
title: templatefile 函数参考
description: |-
  `templatefile` 函数读取文件并使用一组模板变量将其内容渲染为模板。了解如何使用 `templatefile` 函数。
---

# `templatefile` 函数

`templatefile` 函数读取给定路径下的文件，并使用提供的一组模板变量将其内容渲染为模板。

```hcl
templatefile(path, vars)
```

我们建议在使用 `templatefile` 函数创建模板时使用 `.pkrtpl.hcl` 文件扩展名。Packer 将 HCL 模板视为文件和模板的组合。因此，HCL 模板文件与具有 `.pkr.hcl` 扩展名的模板具有略有不同的功能集。使用 `.pkr.hcl` 扩展名还可以使语法高亮器正确理解你的文件。

模板语法与主 HCL2 语言中的字符串模板相同，包括用 `${ ... }` 分隔的插值序列。此函数只是允许将较长的模板序列分解到单独的文件中以提高可读性。

"vars" 参数必须是一个映射。在模板文件中，映射中的每个键都可用作插值变量。模板还可以使用 Packer 中可用的任何其他函数，但不允许递归调用 templatefile。变量名必须以字母开头，后跟零个或多个字母、数字或下划线。

HCL2 中的字符串是 Unicode 字符序列，因此此函数将文件内容解释为 UTF-8 编码的文本，并返回结果 Unicode 字符。如果文件包含无效的 UTF-8 序列，则此函数将产生错误。

此函数只能用于在运行开始时磁盘上已存在的文件。

## 示例

### 列表

给定一个包含以下内容的模板文件 backends.tpl：

```hcl
%{ for addr in ip_addrs ~}
backend ${addr}:${port}
%{ endfor ~}
```

templatefile 函数渲染模板：

```shellsession
> templatefile("${path.root}/backends.tmpl", { port = 8080, ip_addrs = ["10.0.0.1", "10.0.0.2"] })
backend 10.0.0.1:8080
backend 10.0.0.2:8080
```

### 映射

给定一个包含以下内容的模板文件 config.tmpl：

```hcl
%{ for config_key, config_value in config }
set ${config_key} = ${config_value}
%{ endfor ~}
```

templatefile 函数渲染模板：

```shellsession
> templatefile(
               "${path.root}/config.tmpl",
               {
                 config = {
                   "x"   = "y"
                   "foo" = "bar"
                   "key" = "value"
                 }
               }
              )
set foo = bar
set key = value
set x = y
```

### 从模板生成 JSON 或 YAML

如果你想生成的字符串将采用 JSON 或 YAML 语法，编写一个模板来生成有效的 JSON 或 YAML 通常既棘手又繁琐，尤其是在使用大量单独的插值序列和指令时。

相反，你可以编写一个仅包含对 jsonencode 或 yamlencode 的单个插值调用的模板，使用正常的表达式语法指定要编码的值，如以下示例所示：

```hcl
${jsonencode({
  "backends": [for addr in ip_addrs : "${addr}:${port}"],
})}
${yamlencode({
  "backends": [for addr in ip_addrs : "${addr}:${port}"],
})}
```

给定与上一节 `backends.tmpl` 示例相同的输入，这将生成给定数据结构的有效 JSON 或 YAML 表示，无需手动处理转义或分隔符。在上面的最新示例中，基于 ip_addrs 元素的重复是通过使用 for 表达式而不是模板指令来实现的。

```
{"backends":["10.0.0.1:8080","10.0.0.2:8080"]}
```

如果生成的模板很小，你可以选择在主配置文件中内联编写 jsonencode 或 yamlencode 调用，完全避免创建单独的模板文件：

```hcl
locals {
  backend_config_json = jsonencode({
    "backends": [for addr in ip_addrs : "${addr}:${port}"],
  })
}
```

有关更多信息，请参阅 jsonencode 和 yamlencode 的主要文档。

## 相关函数

- [`file`](/docs/templates/hcl_templates/functions/file/file) 读取给定路径下文件的内容。
- [`fileexists`](/docs/templates/hcl_templates/functions/file/fileexists) 确定给定路径下是否存在文件。
