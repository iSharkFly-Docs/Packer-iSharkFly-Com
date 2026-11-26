---
title: rsadecrypt 函数参考
description: '`rsadecrypt` 函数解密 RSA 加密的消息。了解如何在 Packer 模板中使用 `rsadecrypt` 函数。'
---

# `rsadecrypt` 函数

`rsadecrypt` 解密 RSA 加密的密文，返回相应的明文。

```hcl
rsadecrypt(ciphertext, privatekey)
```

`ciphertext` 必须是密文的 base64 编码表示，使用 PKCS #1 v1.5 填充方案。Packer 使用 [RFC 4648 第 4 节](https://tools.ietf.org/html/rfc4648#section-4)中定义的"标准" Base64 字母表。

`privatekey` 必须是 PEM 编码的 RSA 私钥，该私钥本身不能是加密的。

Packer 没有相应的_加密_消息的函数。使用此函数来解密远程服务使用带外协商的密钥对返回的密文。

## 示例

```shellsession
> rsadecrypt(base64(file("${path.folder}/ciphertext")), file("privatekey.pem"))
Hello, world!
```
