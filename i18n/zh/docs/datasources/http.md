---
description: |
  `http` 数据源向指定的 URL 发出 HTTP `GET` 请求并导出有关响应的信息。
title: http 数据源参考
---

<Badge type="tip" text="Official" /> <Badge type="tip" text="HCP Packer Ready" />

# `http`

`http` 数据源向指定的 URL 发出 HTTP `GET` 请求并导出有关响应的信息。


## 基本示例

```hcl
data "http" "example" {
  url = "https://checkpoint-api.hashicorp.com/v1/check/terraform"

  # 可选请求头
  request_headers = {
    Accept = "application/json"
  }
}
```

## 配置参考

配置选项按以下两个类别组织：必需和可选。在每个类别中，可用选项按字母顺序排列并进行描述。

### 必需：

- `url` (string) - 要请求数据的 URL。此 URL 必须以 `2xx` 范围响应代码和 `text/*` 或 `application/json` Content-Type 响应。

<!-- End of code generated from the comments of the Config struct in datasource/http/data.go; -->

### 非必需：
- `method` (string) - 用于请求的 HTTP 方法。支持的方法有 `HEAD`、`GET`、`POST`、`PUT`、`DELETE`、`OPTIONS`、`PATCH`。默认为 `GET`。

- `request_headers` (map[string]string) - 表示要包含在请求中的额外 HTTP 头的字符串映射。

- `request_body` (string) - 与请求一起发送的 HTTP 请求负载。默认为空。

<!-- End of code generated from the comments of the Config struct in datasource/http/data.go; -->

## 数据源输出

此数据源的输出如下：

- `url` (string) - 请求数据的 URL。

- `body` (string) - HTTP 响应的原始正文。

- `request_headers` (map[string]string) - 表示响应 HTTP 头的字符串映射。
  根据 [RFC2616](https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2)，重复的头会连接在一起。

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/http/data.go; -->
