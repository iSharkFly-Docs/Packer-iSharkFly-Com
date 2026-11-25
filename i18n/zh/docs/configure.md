---
description: |
  了解如何使用环境变量配置 Packer 的全局行为。
title: 配置 Packer
---

# 配置 Packer

本文介绍如何配置 Packer。默认配置适合学习入门，但随着你对 Packer 越来越熟悉，应该参考本文获取指导。

## 概述

你可以在配置文件中设置 Packer 专用的环境变量来全局配置 Packer 行为。将配置文件安装到 Packer 配置目录以实现配置。你还可以将插件文件及其 SHA256SUM 文件安装到配置目录下的 plugins 子目录。有关说明，请参阅[安装插件](/docs/plugins/install)。

你也可以在 JSON 配置文件中定义 Packer 设置并将其添加到执行路径。此配置方法已弃用。

## 安装配置文件

你可以将内部配置文件放入 Packer 的 `config` 目录。Packer 检查以下路径的配置文件：

| 操作系统 | 路径 | 说明 |
| --- | ---| --- |
| Unix | `${HOME}/.config/packer/` | Packer 默认遵循 XDG 基础目录规范。因此，当 `PACKER_CONFIG_DIR` 环境变量未设置或为空时，Packer 使用 `$HOME/.config/packer` 作为默认目录。当设置了 `PACKER_CONFIG_DIR` 变量或安装使用旧式 `.packer.d` 风格目录（例如 `$HOME/.packer.d/`）时，Packer 会忽略 XDG 规范。有关更多信息，请参阅 [XDG 规范](https://specifications.freedesktop.org/basedir-spec/latest/)。 |
| Windows | `%APPDATA%\packer.d\` | |


### 示例

- **Unix**：如果 `$PACKER_CONFIG_DIR` 设置为 `/home/packer`，则配置目录为 `/home/packer/.packer.d/`。Packer 不检查其他值。
- **Windows**：如果 `PACKER_CONFIG_DIR` 设置为 `C:/`，则配置目录为 `C:/packer.d/`。Packer 不检查其他值。


<a id="packer-s-config-file"></a>

## 安装 JSON 配置文件

此安装方法自 1.7 起已弃用。请改用 [HCL2 `required_plugins` 块](/docs/templates/hcl_templates/blocks/packer#specifying-plugin-requirements)来配置 Packer 如何安装插件。

你使用 JSON 文件来设置 Packer 核心设置。Packer 检查以下路径的配置文件：

| Unix                             | Windows                           |
| -------------------------------- | --------------------------------- |
| `${PACKER_CONFIG}`               | `%PACKER_CONFIG%`                 |
| `${HOME}/.packerconfig`          | `%APPDATA%\packer.config\`        |


### JSON 配置文件参考

使用基本 JSON 来配置文件。你可以指定核心配置文件的配置参数。所有参数都是可选的。这些都不是必需的，因为都有默认值。

- `plugin_min_port`：数字，指定 Packer 可用于与插件通信的最低端口。Packer 通过本地主机上的 TCP 或 Unix 套接字与插件通信。默认值为 `10000`。我们建议在 `plugin_min_port` 和 `plugin_max_port` 之间设置一个较宽的范围，以便 Packer 在单次运行中至少可以访问 25 个端口。
- `plugin_max_port`：数字，指定 Packer 可用于与插件通信的最高端口。Packer 通过本地 Unix 主机上的 TCP 连接与插件通信。默认值为 `25000`。我们建议在 `plugin_min_port` 和 `plugin_max_port` 之间设置一个较宽的范围，以便 Packer 在单次运行中至少可以访问 25 个端口。

[`packer init`](/docs/commands/init) 命令在安装插件时优先于 JSON 配置的设置。


## 配置缓存目录

Packer 使用缓存目录来下载大文件以及处理大文件下载的相关事务。默认情况下，Packer 在当前目录的 `.packer_cache` 文件夹中缓存文件。使用 `PACKER_CACHE_DIR` 环境变量来配置缓存目录。有关详细信息，请参阅 [`PACKER_CACHE_DIR`](/docs/configure#packer_config_dir)。

如果多个构建执行类似操作，我们建议在构建之间使用相同的 Packer 缓存目录。这是为了避免多次下载相同的大文件（如 ISO）。


## 配置参考

Packer 使用多种环境变量。以下是每个变量的列表和描述：

- `PACKER_CACHE_DIR` - Packer 缓存的位置。默认为 `./packer_cache/`。可以使用相对路径。某些插件可以在缓存目录中缓存大文件（如 ISO）。

- `PACKER_CONFIG` - 核心配置文件的位置。配置文件的格式是基本 JSON。请参阅 [Packer 配置文件](#packer-s-config-file)。

- `PACKER_CONFIG_DIR` - Packer 主目录的位置。有关更多信息，请参阅 [Packer 主目录](#packer-s-home-directory)。

- `PACKER_GETTER_READ_TIMEOUT` - 覆盖 Packer 插件尝试获取 ISO 时的超时时间。默认为 `30m`。这是一个带有持续时间后缀的字符串。插件需要基于 SDK 的 [v0.6.0](https://github.com/hashicorp/packer-plugin-sdk/releases/tag/v0.6.0) 及以上版本构建才能与此变量兼容。

- `PACKER_GITHUB_API_TOKEN` - 在 HCL2 模板上使用 Packer init 时，Packer 会查询 GitHub 的公共 API，该 API 对其接口有速率限制。你可以设置 `PACKER_GITHUB_API_TOKEN` 环境变量为 GitHub Token 来提高限制。

- `PACKER_LOG` - 将此设置为除 ""（空字符串）或 "0" 以外的任何值将启用日志记录器。请参阅[调试页面](/docs/debugging)。

- `PACKER_LOG_PATH` - 日志文件的位置。注意：必须设置 `PACKER_LOG` 才能进行任何日志记录。请参阅[调试页面](/docs/debugging)。

- `PACKER_NO_COLOR` - 将此设置为任何值将禁用终端中的颜色。

- `PACKER_PLUGIN_MAX_PORT` - Packer 用于与插件通信的最大端口，因为插件通信通过本地主机上的 TCP 连接进行。默认值为 25,000。这也可以使用 Packer 配置文件设置，有关更多信息，请参阅[配置文件配置参考](#packer-config-file-configuration-reference)。

- `PACKER_PLUGIN_MIN_PORT` - Packer 用于与插件通信的最小端口，因为插件通信通过本地主机上的 TCP 连接进行。默认值为 10,000。这也可以使用 Packer 配置文件设置，有关更多信息，请参阅[配置文件配置参考](#packer-config-file-configuration-reference)。

- `PACKER_PLUGIN_PATH` - 查找 Packer 插件的路径变量。如果定义了此变量，它将优先于 `PACKER_CONFIG_DIR/plugins` 进行插件发现。插件安装需要访问 `TMPDIR` 下的临时文件。如果系统的临时目录不可写或不可执行，请参阅 `TMPDIR` 来覆盖 Packer 使用的临时文件存储位置。

- `CHECKPOINT_DISABLE` - 当调用 Packer 时，它有时会调用 [checkpoint.hashicorp.com](https://checkpoint.hashicorp.com/) 来查找 Packer 的新版本。如果出于安全或隐私原因想要禁用此功能，可以将此环境变量设置为 `1`。

- `TMPDIR`（Unix）/ `TMP`、`TEMP`、`USERPROFILE`（Windows）- 指定临时文件的目录（Linux/Unix 上默认为 `/tmp`，Windows Vista 及更高版本上默认为 `%USERPROFILE%\AppData\Local\Temp`）。对于默认临时目录不可写或不可执行的系统，可能需要自定义此设置。
