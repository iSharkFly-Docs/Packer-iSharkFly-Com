---
title: reverse function reference
description: The `reverse` function reverses the values in a sequence. Learn how to use the `reverse` function in Packer templates. 
---

# `reverse` Function

`reverse` takes a sequence and produces a new sequence of the same length
with all of the same elements as the given sequence but in reverse order.

## Examples

```shellsession
> reverse([1, 2, 3])
[
  3,
  2,
  1,
]
```

## Related Functions

- [`strrev`](/docs/templates/hcl_templates/functions/string/strrev) reverses a string.
