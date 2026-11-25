---
description: |
  `packer console` 命令启动一个交互式控制台，让你可以尝试 Packer 变量插值。
title: packer console 命令参考
---

# `packer console` 命令参考

`packer console` 命令允许你尝试 Packer 变量插值。你可以访问调用控制台时使用的 Packer 配置中的变量，或者在调用控制台时使用 -var 或 -var-file 命令行选项提供变量。

::: warning
**注意：** `console` 从 1.4.2 及以上版本可用。
:::

::: warning
**注意：** 对于 HCL2，`console` 从 1.6.0 及以上版本可用，使用 `packer console --config-type=hcl2` 可以在没有配置文件的情况下尝试。Go 模板（或 `{{..}}` 调用）在 HCL2 模式下不起作用。
:::

输入要测试的插值并按 `<enter>` 查看结果。

要退出控制台，输入 "exit" 并按 `<enter>`，或使用 Control-C。

```shellsession
$ packer console my_template.json
```

控制台命令接受的完整选项列表可以在帮助输出中看到，可以通过 `packer console -h` 查看。

## 选项

- `-var` - 在 Packer 模板中设置变量。此选项可以多次使用。这对于设置构建的版本号很有用。
  示例：`-var "myvar=asdf"`

- `-var-file` - 从文件设置模板变量。
  示例：`-var-file myvars.json`

## REPL 命令

- `help` - 显示 Packer 控制台的帮助文本。

- `exit` - 退出控制台

- `variables` - 打印从 `-var` 选项、`-var-files` 选项和模板读入控制台的所有变量列表。

## 使用示例 - repl 会话（JSON）

假设你使用 Packer 模板 `example_template.json` 启动控制台：

```shellsession
$ packer console example_template.json
```

你将进入一个提示符，允许你输入模板函数并查看它们的求值结果；例如，如果变量 `myvar` 在你的 example_template 的 variable 部分中定义：

```json
"variables":{
	"myvar": "asdfasdf"
},
...
```

并且你在 Packer 控制台中输入 `` {{user `myvar`}} ``，你将看到 myvar 的值：

```shellsession
> {{user `myvar`}}
asdfasdf
```

从那里你可以测试更复杂的插值：

```shellsession
> {{user `myvar`}}-{{timestamp}}
asdfasdf-1559854396
```

当你使用完控制台后，只需输入 "exit" 或 CTRL-C

```shellsession
> exit
$
```

如果你想提供变量或变量文件，可以这样做：

```shellsession
$ packer console -var "myvar=fdsafdsa" -var-file myvars.json example_template.json
```

如果你没有特定的变量或 var 文件要测试，只想尝试特定的模板引擎，你可以简单地调用 `packer console` 而不带模板文件。

## 使用示例 - 管道命令（JSON）

如果你只想查看特定的单个插值而不启动 REPL，你可以通过 echo 并将字符串管道到控制台命令来实现：

```shellsession
$ echo {{timestamp}} | packer console
1559855090
```

## 使用示例 - repl 会话（HCL2）

::: warning
**注意：** 对于 HCL2，`console` 从 1.6.0 及以上版本可用，使用 `packer console --config-type=hcl2` 可以在没有配置文件的情况下尝试。Go 模板（或 `{{..}}` 调用）在 HCL2 模式下不起作用。
:::

没有配置文件时，`packer console` 可用于尝试表达式语法和[内置函数](/docs/templates/hcl_templates/functions/)。

### 启动

要在包含 HCL2 配置文件的文件夹上启动会话，运行：

```shellsession
packer console folder/
```

因为 `folder/` 是一个文件夹，Packer 将以 HCL2 模式启动，你也可以直接传递一个 HCL2 格式的配置文件：

```shellsession
packer console file.pkr.hcl
```

因为文件以 `.pkr.hcl` 为后缀，Packer 将以 HCL2 模式启动。

当你只想在没有配置文件的情况下尝试时，你可以设置 `--config-type=hcl2` 选项，Packer 将以 HCL2 模式启动：

```shellsession
packer console --config-type=hcl2
```

### 脚本编写

`packer console` 命令可以通过将以换行符分隔的命令管道到它来在非交互式脚本中使用。除非之前发生错误，否则只打印最后一个命令的输出。

例如：

```shellsession
$ echo "1 + 5" | packer console
6
```
