---
title: max function reference
description: The `max` function returns the largest number from the given set of one or more numbers. 
---

# `max` Function

`max` takes one or more numbers and returns the greatest number from the set.

## Examples

```shellsession
> max(12, 54, 3)
54
```

If the numbers are in a list or set value, use `...` to expand the collection
to individual arguments:

```shellsession
> max([12, 54, 3]...)
54
```

## Related Functions

- [`min`](/docs/templates/hcl_templates/functions/numeric/min), which returns the _smallest_ number from a set.
