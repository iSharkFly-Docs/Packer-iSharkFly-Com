---
description: |
  The `packer build` command takes a template and runs all the builds within it
  in order to generate a set of artifacts. The various builds specified within a
  template are executed in parallel, unless otherwise specified. And the
  artifacts that are created will be outputted at the end of the build.
title: packer build - Commands
---

# `build` Command

The `packer build` command takes a template and runs all the builds within it
in order to generate a set of artifacts. The various builds specified within a
template are executed in parallel, unless otherwise specified. And the
artifacts that are created will be outputted at the end of the build.

## Options

- `-color=false` - Disables colorized output. Enabled by default.

- `-debug` - Disables parallelization and enables debug mode. Debug mode
  flags the builders that they should output debugging information. The exact
  behavior of debug mode is left to the builder. In general, builders usually
  will stop between each step, waiting for keyboard input before continuing.
  This will allow the user to inspect state and so on.

- `-except=foo,bar,baz` - Run all the builds and post-processors except those
  with the given comma-separated names. In legacy JSON templates, build names default to the
  types of their builders (e.g. `docker` or
  `amazon-ebs` or `virtualbox-iso`, unless a specific `name` attribute is
  specified within the configuration. In HCL2 templates, the "name" is the
  source block's "name" label, unless an in-build source definition adds the
  "name" configuration option. Any post-processor following
  a skipped post-processor will not run. Because post-processors can be nested
  in arrays a different post-processor chain can still run. A post-processor
  with an empty name will be ignored.

- `-force` - Forces a builder to run when artifacts from a previous build
  prevent a build from running. The exact behavior of a forced build is left
  to the builder. In general, a builder supporting the forced build will
  remove the artifacts from the previous build. This will allow the user to
  repeat a build without having to manually clean these artifacts beforehand.

- `-on-error=cleanup` (default), `-on-error=abort`, `-on-error=ask`, `-on-error=run-cleanup-provisioner` -
  Selects what to do when the build fails during provisioning. Please note that
  this only affects the build during the provisioner run, not during the
  post-processor run, because it is related to whether or not to keep the
  instance running and related artifacts like generated SSH keys on the system
  when a provisioner fails.

  - `cleanup` cleans up after the previous steps, deleting temporary files and virtual machines.
  - `abort` exits without any cleanup, which might require the next build to use `-force`.
  - `ask` presents a prompt and waits for you to decide to clean up, abort, or retry
    the failed step.
  - `run-cleanup-provisioner` aborts and exits without any cleanup besides
    the [error-cleanup-provisioner](/docs/templates/legacy_json_templates/provisioners#on-error-provisioner) if one is defined.

- `-only=foo,bar,baz` - Only run the builds with the given comma-separated
  names. In legacy JSON templates, build names default to the
  types of their builders (e.g. `docker` or
  `amazon-ebs` or `virtualbox-iso`, unless a specific `name` attribute is
  specified within the configuration. In HCL2 templates, the "name" is the
  source block's "name" label, unless an in-build source definition adds the
  "name" configuration option.

- `-parallel-builds=N` - Limit the number of builds to run in parallel, 0
  means no limit (defaults to 0).

- `-timestamp-ui` - Enable prefixing of each ui output with an RFC3339
  timestamp.

- `-var` - Set a variable in your Packer template. This option can be used
  multiple times. This is useful for setting version numbers for your build.

- `-var-file` - Set template variables from a file.
