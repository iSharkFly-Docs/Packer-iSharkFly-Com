---
title: log 函数参考
description: '`log` 函数返回给定数字在给定底数下的对数。'
---

# `log` 函数

`log` 返回给定数字在给定底数下的对数。

```hcl
log(number, base)
```

## 示例

```shellsession
> log(50, 10)
1.6989700043360185
> log(16, 2)
4
```

`log` 和 `ceil` 可以一起使用来计算表示给定数量的不同值所需的最小二进制位数：

```shellsession
> ceil(log(15, 2))
4
> ceil(log(16, 2))
4
> ceil(log(17, 2))
5
```
