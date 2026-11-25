---
description: |
  The `http` data source makes an HTTP `GET` request to the specified URL and exports information about the response.
title: http data source reference
---

<Badge type="tip" text="Official" /> <Badge type="tip" text="HCP Packer Ready" />

# `http`

The `http` data source makes an HTTP `GET` request to the specified URL and exports information about the response.


## Basic Example

```hcl
data "http" "example" {
  url = "https://checkpoint-api.hashicorp.com/v1/check/terraform"

  # Optional request headers
  request_headers = {
    Accept = "application/json"
  }
}
```

## Configuration Reference

Configuration options are organized below into two categories: required and
optional. Within each category, the available options are alphabetized and
described.

### Required:

- `url` (string) - The URL to request data from. This URL must respond with a `2xx` range response code and a `text/*` or `application/json` Content-Type.

<!-- End of code generated from the comments of the Config struct in datasource/http/data.go; -->

### Not Required:
- `method` (string) - HTTP method used for the request. Supported methods are `HEAD`, `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`. Default is `GET`.

- `request_headers` (map[string]string) - A map of strings representing additional HTTP headers to include in the request.

- `request_body` (string) - HTTP request payload send with the request. Default is empty.

<!-- End of code generated from the comments of the Config struct in datasource/http/data.go; -->

## Datasource outputs

The outputs for this datasource are as follows:

- `url` (string) - The URL the data was requested from.

- `body` (string) - The raw body of the HTTP response.

- `request_headers` (map[string]string) - A map of strings representing the response HTTP headers.
  Duplicate headers are concatenated with, according to [RFC2616](https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2).

<!-- End of code generated from the comments of the DatasourceOutput struct in datasource/http/data.go; -->
