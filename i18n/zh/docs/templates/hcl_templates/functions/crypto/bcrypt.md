---
title: bcrypt 函数参考
description: |-
  `bcrypt` 函数使用 Blowfish 密码算法计算给定字符串的哈希值。了解如何在 Packer 模板中使用 `bcrypt` 函数。
---

# `bcrypt` 函数

`bcrypt` 使用 Blowfish 密码算法计算给定字符串的哈希值，返回一个[模块化加密格式](https://passlib.readthedocs.io/en/stable/modular_crypt_format.html)的字符串，这种格式通常是许多 Unix 系统上影子密码文件所期望的格式。

```hcl
bcrypt(string, cost)
```

`cost` 参数是可选的，如果未指定则默认为 10。

由于 bcrypt 哈希值包含随机选择的盐值，每次调用此函数都会返回不同的值，即使给定的字符串和 cost 相同。因此，直接在资源参数中使用此函数会导致虚假的差异。我们建议仅在 `provisioner` 或 `post-processor` 块中使用此函数，或者在结果仅用于这些块的数据资源中使用。

生成字符串上的版本前缀（例如 `$2a$`）可能会在 Packer 的未来版本中更改。

## 示例

```shellsession
> bcrypt("hello world")
$2a$10$D5grTTzcsqyvAeIAnY/mYOIqliCoG7eAMX0/oFcuD.iErkksEbcAa
```
