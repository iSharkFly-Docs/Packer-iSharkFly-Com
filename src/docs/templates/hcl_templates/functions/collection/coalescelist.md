---
title: coalescelist function reference
description: |-
  The `coalescelist` function returns the first non-empty argument in a list of arguments. Learn how to use the `coalescelist` function in Packer templates.
---

# `coalescelist` Function

`coalescelist` takes any number of list arguments and returns the first one
that isn't empty.

## Examples

```shellsession
> coalescelist(["a", "b"], ["c", "d"])
[
  "a",
  "b",
]
> coalescelist([], ["c", "d"])
[
  "c",
  "d",
]
```

To perform the `coalescelist` operation with a list of lists, use the `...`
symbol to expand the outer list as arguments:

```shellsession
> coalescelist([[], ["c", "d"]]...)
[
  "c",
  "d",
]
```

## Related Functions

- [`coalesce`](/docs/templates/hcl_templates/functions/collection/coalesce) performs a similar operation with string
  arguments rather than list arguments.
