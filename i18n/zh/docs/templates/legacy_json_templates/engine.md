---
description: |
  JSON 模板引擎处理 JSON 模板中的字符串。了解如何使用 JSON 模板引擎函数和变量。
title: JSON 模板引擎参考
---

# JSON 模板引擎参考

本文描述处理 JSON 模板的 Packer 引擎。

::: info
**注意：** 本页面是关于旧式 JSON Packer 模板的。Packer 核心仍然支持 JSON 模板，但添加到 Packer 核心的新功能可能不会为 JSON 模板实现。我们建议你尽快过渡到 HCL 模板，以获得 Packer 的最佳体验。为了帮助你升级模板，我们编写了一个 [hcl2_upgrade 命令](/docs/commands/hcl2_upgrade)。
:::

## 描述

模板中的所有字符串都由通用的 Packer 模板引擎处理。引擎使用变量和函数在运行时修改配置参数的值。

模板的语法使用以下约定：

- 任何与模板相关的内容都在双大括号内：`{{ }}`。
- 函数直接在大括号内指定，例如 `{{timestamp}}`。
- 模板变量以句点为前缀并大写，例如 `{{.Variable}}`。

## 函数

函数在字符串内和字符串上执行操作，例如 `{{timestamp}}` 函数可用于任何字符串以生成当前时间戳。这对于需要唯一键的配置很有用，例如 AMI 名称。通过将 AMI 名称设置为类似 `My Packer AMI {{timestamp}}` 的内容，AMI 名称将精确到秒是唯一的。如果你需要比一秒更高的粒度，应该使用 `{{uuid}}`，例如当你在同一模板中有多个构建器时。

以下是可用函数的完整列表以供参考。

- `build_name` - 正在运行的构建的名称。
- `build_type` - 当前正在使用的构建器的类型。
- `clean_resource_name` - 镜像名称只能包含某些字符，并且有最大长度，例如 GCE 上为 63，Azure 上为 80。`clean_resource_name` 将大写转换为小写，并用 "-" 字符替换非法字符。示例：

  `"mybuild-{{isotime | clean_resource_name}}"` 将变成 `mybuild-2017-10-18t02-06-30z`。

  注意：有效的 Azure 镜像名称必须匹配正则表达式 `^[^_\\W][\\w-._)]{0,79}$`

  注意：有效的 GCE 镜像名称必须匹配正则表达式 `(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)`

  此引擎不保证最终镜像名称将匹配正则表达式；如果超过允许的最大字符数，它不会截断你的名称，也不会验证引擎输出的开头和结尾是否有效。例如，`"image_name": {{isotime | clean_resource_name}}"` 将导致构建失败，因为镜像名称将以数字开头，这就是为什么在上面的示例中我们在 isotime 前面加上 "mybuild"。
  `clean_resource_name` 的确切行为取决于它应用于哪个构建器；有关每个函数行为的更多详细信息，请参阅下面的构建特定文档。

- `env` - 返回环境变量。请参阅[使用 home 变量](/docs/templates/legacy_json_templates/user-variables#using-home-variable)中的示例
- `build` - 此引擎允许你从配置器和后处理器访问提供连接信息和基本实例状态信息的特殊变量。
  用法示例：

  ```json
  {
    "type": "shell-local",
    "environment_vars": ["TESTVAR={{ build `PackerRunUUID`}}"],
    "inline": ["echo $TESTVAR"]
  }
  ```

  可请求的有效变量是：

  - **ID**：表示正在配置的虚拟机。例如，在 Amazon 中是实例 ID；在 DigitalOcean 中是 Droplet ID；在 VMware 中是虚拟机名称。

  - **Host**、**Port**、**User** 和 **Password**：Packer 用于访问机器的主机、端口、用户和密码。对于使用 shell local 配置器来针对已配置实例运行 Ansible 或 Inspec 很有用。

  - **ConnType**：正在使用的通信器类型。例如，对于 SSH 通信器，这将是 "ssh"。

  - **PackerRunUUID**：当前构建的唯一 ID。可用于指定构建制品。例如，当多个构建同时运行并生成相同的制品时。可以通过使用构建的唯一 ID 命名这些制品来区分它们。

  - **PackerHTTPIP**、**PackerHTTPPort** 和 **PackerHTTPAddr**：Packer 创建的用于向虚拟机提供 "http" 目录中项目的文件服务器的 HTTP IP、端口和地址。HTTP 地址以 `IP:PORT` 格式显示。

  - **SSHPublicKey** 和 **SSHPrivateKey**：Packer 用于连接到实例的公钥和私钥。这些是 SSH 通信器独有的，使用其他通信器时未设置。**SSHPublicKey** 和 **SSHPrivateKey** 可能包含转义序列和特殊字符，因此它们的输出应该用单引号括起来以避免意外。例如：

    ```json
    { ... "provisioners": [{
      "type": "shell",
      "inline": [ "echo '{{ build `SSHPrivateKey`}}' > /tmp/packer-session.pem" ]
      }]
    }
    ```

  为了向后兼容，`WinRMPassword` 也可以通过此引擎使用，尽管它与使用更通用的 `Password` 没有什么不同。

  此函数仅用于 _配置器_ 内的特定选项——这些选项将在配置器文档中列为模板引擎。

  有关构建器特定的构建变量，请参阅构建器文档：

  - Amazon EC2：[chroot](https://developer.hashicorp.com/packer/plugins/builders/amazon/chroot#build-shared-information-variables)、[EBS Volume](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebsvolume#build-shared-information-variables)、[EBS](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebs#build-shared-information-variables)、[EBS Surrogate](https://developer.hashicorp.com/packer/plugins/builders/amazon/ebssurrogate#build-shared-information-variables)、[Instance](https://developer.hashicorp.com/packer/plugins/builders/amazon/instance#build-shared-information-variables)。

  此引擎处于测试阶段；请在 GitHub 上的 Packer 问题跟踪器中报告任何问题或请求。

- `isotime [FORMAT]` - UTC 时间，可以[格式化](https://pkg.go.dev/time#example_Time_Format)。请参阅下面的[`isotime` 格式参考](#isotime-函数格式参考)中的更多示例。
  `strftime FORMAT` - UTC 时间，使用 ISO C 标准格式 `FORMAT` 格式化。请参阅 [jehiah/go-strftime](https://github.com/jehiah/go-strftime) 以获取可用格式说明符的列表。

  请注意，如果你使用大量构建器、配置器或后处理器，直接在插件配置中使用 isotime 引擎可能会导致每个插件的时间戳略有不同。这是因为时间戳是在每个插件启动时生成的，而不是在初始 Packer 进程中。为避免这种情况并确保时间戳在所有插件中一致，将其设置为用户变量，然后在插件中访问用户变量。

- `lower` - 将字符串转换为小写。
- `packer_version` - 返回 Packer 版本。
- `pwd` - 执行 Packer 时的工作目录。
- `replace` - ( old, new string, n int, s ) Replace 返回字符串 s 的副本，其中前 n 个非重叠的 old 实例被 new 替换。
- `replace_all` - ( old, new string, s ) ReplaceAll 返回字符串 s 的副本，其中所有非重叠的 old 实例被 new 替换。
- `split` - 使用分隔符分割输入字符串并返回请求的子字符串。
- `template_dir` - 构建模板的目录。
- `timestamp` - Packer 进程启动时的 Unix UTC 时间戳。请注意，如果你使用大量构建器、配置器或后处理器，每个的时间戳可能略有不同，因为它来自插件启动时而不是初始 Packer 进程。为避免这种情况并使时间戳在所有插件中一致，将其设置为用户变量，然后在插件中访问用户变量。
- `uuid` - 返回随机 UUID。
- `upper` - 将字符串转换为大写。
- `user` - 指定用户变量。

#### 特定于 Amazon 构建器：

- `clean_resource_name` - AMI 名称只能包含某些字符。此函数将非法字符替换为 '-' 字符。示例用法，因为 ":" 不是合法的 AMI 名称：`{{isotime | clean_resource_name}}`。

#### 特定于 Google Compute 构建器：

- `clean_resource_name` - GCE 镜像名称只能包含某些字符，最大长度为 63。此函数将大写转换为小写，并用 "-" 字符替换非法字符。示例：

  `"mybuild-{{isotime | clean_resource_name}}"` 将变成 `mybuild-2017-10-18t02-06-30z`。

  注意：有效的 GCE 镜像名称必须匹配正则表达式 `(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)`

  此引擎不保证最终镜像名称将匹配正则表达式；如果超过 63 个字符，它不会截断你的名称，也不会验证引擎输出的开头和结尾是否有效。例如，`"image_name": {{isotime | clean_resource_name}}"` 将导致构建失败，因为镜像名称将以数字开头，这就是为什么在上面的示例中我们在 isotime 前面加上 "mybuild"。

#### 特定于 Azure 构建器：

- `clean_resource_name` - Azure 托管镜像名称只能包含某些字符，最大长度为 80。此函数将非法字符替换为 "-" 字符。示例：

  `"mybuild-{{isotime | clean_resource_name}}"` 将变成 `mybuild-2017-10-18t02-06-30z`。

  注意：有效的 Azure 镜像名称必须匹配正则表达式 `^[^_\\W][\\w-._)]{0,79}$`

  此引擎不保证最终镜像名称将匹配正则表达式；如果超过 80 个字符，它不会截断你的名称，也不会验证引擎输出的开头和结尾是否有效。在转换非法字符时，它会从名称末尾截断无效字符。例如，`"managed_image_name: "My-Name::"` 将转换为 `"managed_image_name: "My-Name"`

## 模板变量

模板变量是 Packer 在构建时自动设置的特殊变量。一些构建器、配置器和其他组件有仅对该组件可用的模板变量。模板变量是可识别的，因为它们以句点为前缀，例如 `{{ .Name }}`。例如，当使用 [`shell`](https://developer.hashicorp.com/packer/plugins/builders/vmware/iso) 构建器时，模板变量可用于自定义用于确定 Packer 如何运行 shell 命令的 [`execute_command`](/docs/provisioners/shell#execute_command) 参数。

```json
{
  "provisioners": [
    {
      "type": "shell",
      "execute_command": "{{.Vars}} sudo -E -S bash '{{.Path}}'",
      "scripts": ["scripts/bootstrap.sh"]
    }
  ]
}
```

`{{ .Vars }}` 和 `{{ .Path }}` 模板变量将分别被环境变量列表和要执行的脚本的路径替换。

::: info
**注意：** 除了模板变量之外，你还可以指定自己的用户变量。有关用户变量的更多信息，请参阅[用户变量](/docs/templates/legacy_json_templates/user-variables)文档。
:::

## `isotime` 函数格式参考

`isotime` 模板引擎使用 Go 生成时间戳。如果你不熟悉 Go，那么格式化时间戳的方式与你可能习惯的格式化日期时间字符串的方式相比会感觉有点不寻常。

Go 时间格式化函数的完整文档和示例可以在[这里](https://pkg.go.dev/time#example_Time_Format)找到

但是，格式化基础值得在这里描述。来自 [Go 文档](https://pkg.go.dev/time#pkg-constants)：

> 这些是用于 Time.Format 和 time.Parse 的预定义布局。布局中使用的参考时间是特定时间：
>
> Mon Jan 2 15:04:05 MST 2006
>
> 这是 Unix 时间 1136239445。由于 MST 是 GMT-0700，参考时间可以认为是
>
> 01/02 03:04:05PM '06 -0700
>
> 要定义你自己的格式，写下参考时间按你的方式格式化后的样子；参见 ANSIC、StampMicro 或 Kitchen 等常量的值作为示例。模型是演示参考时间的样子，以便 Format 和 Parse 方法可以将相同的转换应用于一般时间值。

那么在 Packer 模板函数中是什么样子？以下是如何使用 isotime 函数声明变量的示例。

```json
"variables": {
  "myvar": "packer-{{isotime `2006-01-02 03:04:05`}}"
}
```

你可以在 packer 模板或 `packer console` 中尝试修改以下示例，以了解如何设置不同的时间戳：

| 输入                                             | 输出                         |
| ------------------------------------------------ | ---------------------------- |
| `` "packer-{{isotime `2006-01-02`}}" ``          | "packer-2021-05-17"          |
| `` "packer-{{isotime `Jan-_2-15:04:05.000`}}" `` | "packer-May-17-23:40:16.786" |
| `` "packer-{{isotime `3:04PM`}}" ``              | "packer-11:40PM"             |
| `"{{ isotime }}"`                                | "June 7, 7:22:43pm 2014"     |
| `` "{{isotime `2006-01-02`}}" ``                 | "2014-06-07"                 |
| `` "{{isotime `Mon 1504`}}" ``                   | "Sat 1922"                   |
| `` "{{isotime `02-Jan-06 03\_04\_05`}}" ``       | "07-Jun-2014 07_22_43"       |
| `` "{{isotime `Hour15Year200603`}}" ``           | "Hour19Year201407"           |

`isotime` 函数的格式化使用魔法参考日期 **Mon Jan 2 15:04:05 -0700 MST 2006**，分解如下：

<table class="table table-bordered table-condensed">
  <thead>
    <tr>
      <th></th>
      <th align="center">星期几</th>
      <th align="center">月</th>
      <th align="center">日</th>
      <th align="center">时</th>
      <th align="center">分</th>
      <th align="center">秒</th>
      <th align="center">年</th>
      <th align="center">时区</th>
    </tr>
  </thead>
  <tr>
    <th>数字</th>
    <td align="center">-</td>
    <td align="center">01</td>
    <td align="center">02</td>
    <td align="center">03 (15)</td>
    <td align="center">04</td>
    <td align="center">05</td>
    <td align="center">06</td>
    <td align="center">-0700</td>
  </tr>
  <tr>
    <th>文本</th>
    <td align="center">Monday (Mon)</td>
    <td align="center">January (Jan)</td>
    <td align="center">-</td>
    <td align="center">-</td>
    <td align="center">-</td>
    <td align="center">-</td>
    <td align="center">-</td>
    <td align="center">MST</td>
  </tr>
</table>

_括号中的值是缩写或 24 小时制值_

注意 "-0700" 总是格式化为 "+0000"，因为 `isotime` 总是 UTC 时间。

## `split` 函数格式参考

`split` 函数接受一个输入字符串、一个分隔符字符串和一个数字组件值，并返回请求的子字符串。

请注意，你不能在用户变量上使用 `split` 函数，因为我们目前无法嵌套函数。此函数旨在用于构建器变量，如 build_name。如果你需要分割用户变量，最好的方法是创建一个单独的变量。

以下是使用上述选项的一些示例：

```liquid
build_name = foo-bar-provider

{{split build_name "-" 0}} = foo
{{split "fixed-string" "-" 1}} = string
```

请注意，双引号字符在模板中需要转义（在这种情况下，在 `fixed-string` 值上）：

```json
{
  "post-processors": [
    [
      {
        "type": "vagrant",
        "compression_level": 9,
        "keep_input_artifact": false,
        "vagrantfile_template": "tpl/{{split build_name \"-\" 1}}.rb",
        "output": "output/{{build_name}}.box",
        "only": ["org-name-provider"]
      }
    ]
  ]
}
```

## `replace` 函数格式参考

以下是使用 `replace` 选项的一些示例：

```liquid
build_name = foo-bar-provider

{{ replace_all "-" "/" build_name }}  = foo/bar/provider
{{ build_name | replace "-" "/" 1 }} = foo/bar-provider
```
