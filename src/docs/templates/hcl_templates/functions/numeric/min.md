---
title: min function reference
description: The `min` function returns the smallest number in a set of one or more numbers. 
---

# `min` Function

`min` takes one or more numbers and returns the smallest number from the set.

## Examples

```shellsession
> min(12, 54, 3)
3
```

If the numbers are in a list or set value, use `...` to expand the collection
to individual arguments:

```shellsession
> min([12, 54, 3]...)
3
```

## Related Functions

- [`max`](/docs/templates/hcl_templates/functions/numeric/max), which returns the _greatest_ number from a set.
