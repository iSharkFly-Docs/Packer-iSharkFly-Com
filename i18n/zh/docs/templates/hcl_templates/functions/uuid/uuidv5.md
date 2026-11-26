---
title: uuidv5 函数参考
description: |-
  `uuidv5` 函数根据 RFC 4122 版本 5 为值生成唯一的基于名称的 ID。
---

# `uuidv5` 函数

`uuidv5` 生成_基于名称_的 UUID，如 [RFC 4122 第 4.3 节](https://tools.ietf.org/html/rfc4122#section-4.3) 所述，也称为"版本 5" UUID。

```hcl
uuidv5(namespace, name)
```

与 [`uuidv4`](/docs/templates/hcl_templates/functions/uuid/uuidv4) 生成的伪随机 UUID 不同，基于名称的 UUID 派生自命名空间和名称，如果命名空间和名称不变，则每次都会产生相同的 UUID 值。

基于名称的 UUID 命名空间本身就是 UUID，但为了可读性，此函数接受一些关键字作为 RFC 4122 分配的命名空间的别名：

| 关键字   | 命名空间 ID                            | 名称格式                                                                     |
| -------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| `"dns"`  | `6ba7b810-9dad-11d1-80b4-00c04fd430c8` | 完全限定的 DNS 域名。                                                        |
| `"url"`  | `6ba7b811-9dad-11d1-80b4-00c04fd430c8` | [RFC 3986](https://tools.ietf.org/html/rfc3986) 中定义的任何有效 URL。       |
| `"oid"`  | `6ba7b812-9dad-11d1-80b4-00c04fd430c8` | [ISO/IEC 对象标识符](https://oidref.com/)                                    |
| `"x500"` | `6ba7b814-9dad-11d1-80b4-00c04fd430c8` | [X.500 专有名称](https://tools.ietf.org/html/rfc1779)                        |

要使用上表中未包含的任何其他命名空间，请在第一个参数中以通常的 UUID 字符串格式直接传递其分配的命名空间 ID。

## 示例

尽可能使用命名空间关键字，以使意图对未来的读者更加明显：

```shellsession
> uuidv5("dns", "developer.hashicorp.com")
a5008fae-b28c-5ba5-96cd-82b4c53552d6

> uuidv5("url", "https://developer.hashicorp.com/")
9db6f67c-dd95-5ea0-aa5b-e70e5c5f7cf5

> uuidv5("oid", "1.3.6.1.4")
af9d40a5-7a36-5c07-b23a-851cd99fbfa5

> uuidv5("x500", "CN=Example,C=GB")
84e09961-4aa4-57f8-95b7-03edb1073253
```

命名空间关键字被视为等同于其对应的命名空间 UUID，在某些特殊情况下，使用 UUID 形式可能更合适：

```shellsession
> uuidv5("6ba7b810-9dad-11d1-80b4-00c04fd430c8", "developer.hashicorp.com")
a5008fae-b28c-5ba5-96cd-82b4c53552d6
```

如果你希望使用 RFC 4122 之外定义的命名空间，则必须使用命名空间 UUID，因为没有相应的关键字可用：

```shellsession
> uuidv5("743ac3c0-3bf7-4a5b-9e6c-59360447c757", "LIBS:diskfont.library")
ede1a974-df7e-5f17-84b9-76208818b2c8
```

使用原始 UUID 命名空间时，请考虑在表达式旁边添加注释，以人类可理解的方式指示这代表哪个命名空间，例如通过引用定义它的标准。

## 相关函数

- [`uuidv4`](/docs/templates/hcl_templates/functions/uuid/uuidv4)，生成伪随机 UUID。
