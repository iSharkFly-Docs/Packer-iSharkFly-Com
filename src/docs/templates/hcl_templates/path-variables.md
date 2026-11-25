---
title: Path variables reference
description: |-
  Path variables are special variables that enable you to provide directory information. Learn how to use path variables in Packer templates.
---

# Path variables

This topic provides reference information about path variables for Packer templates written in HCL.

## Description

Use the following variables to build paths:  

- `path.cwd`: the directory from where Packer was started.

- `path.root`: the directory of the input HCL file or the input folder.

## Examples

```hcl
locals {
  settings_file  = "${path.cwd}/settings.txt"
  scripts_folder = "${path.root}/scripts"
  root           = path.root
}
```

## Path separators

Separate paths with a forward slash (`/`), especially when using relative paths in your configuration. 
Windows uses backward slashes (`\`) to separate paths, but Packer only recognizes `/` as path
separators when it creates builds from any non-Windows system. Packer also treat backslashes as plain text, which could lead to errors.

## Related functions

- [`abspath`](/docs/templates/hcl_templates/functions/file/abspath) takes a string containing
  a filesystem path and converts it to an absolute path.

- [`basename`](/docs/templates/hcl_templates/functions/file/basename) returns _only_ the last
  portion of a filesystem path, discarding the portion that would be returned
  by `dirname`.

- [`fileset`](/docs/templates/hcl_templates/functions/file/fileset) enumerates a set of
  regular file names given a path and pattern.

- [`dirname`](/docs/templates/hcl_templates/functions/file/dirname) returns all of the
  segments of a filesystem path _except_ the last, discarding the portion that
  would be returned by `basename`.
