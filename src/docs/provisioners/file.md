---
description: |
  The file Packer provisioner uploads files to machines built by Packer. The
  recommended usage of the file provisioner is to use it to upload files, and
  then use shell provisioner to move them to the proper place, set permissions,
  etc.
title: File - Provisioners
---

# File Provisioner

Type: `file`

The file Packer provisioner uploads files to machines built by Packer. The
recommended usage of the file provisioner is to use it to upload files, and
then use [shell provisioner](/docs/provisioners/shell) to move them to the
proper place, set permissions, etc.

Warning: You can only upload files to locations that the provisioning user
(generally not root) has permission to access. Creating files in /tmp and
using a shell provisioner to move them into the final location is the only
way to upload files to root owned locations.

The file provisioner can upload both single files and complete directories.

## Basic Example

<Tabs groupId="template-format" :tabs="[{label:'JSON',value:'t0'},{label:'HCL2',value:'t1'}]">

<TabItem value="t0">

```json
{
  "type": "file",
  "source": "app.tar.gz",
  "destination": "/tmp/app.tar.gz"
}
```

</TabItem>

<TabItem value="t1">

```hcl
provisioner "file"{
  source = "app.tar.gz"
  destination = "/tmp/app.tar.gz"
}
```

</TabItem>

</Tabs>

## Configuration Reference

The available configuration options are listed below.

## Configuration Reference

Required Parameters:

- `source` (string) - The path to a local file or directory to upload to the
  machine. The path can be absolute or relative. If it is relative, it is
  relative to the working directory when Packer is executed. If this is a
  directory, the existence of a trailing slash is important. Read below on
  uploading directories. Mandatory unless `sources` is set.

- `destination` (string) - The path where the file will be uploaded to in the machine. This value
  must be a writable location and any parent directories
  must already exist. If the provisioning user (generally not root) cannot
  write to this directory, you will receive a "Permission Denied" error.
  If the source is a file, it's a good idea to make the destination a file
  as well, but if you set your destination as a directory, at least make
  sure that the destination ends in a trailing slash so that Packer knows
  to use the source's basename in the final upload path. Failure to do so
  may cause Packer to fail on file uploads. If the destination file
  already exists, it will be overwritten.

<!-- End of code generated from the comments of the Config struct in provisioner/file/provisioner.go; -->

Optional Parameters:

- `sources` ([]string) - A list of sources to upload. This can be used in place of the `source`
  option if you have several files that you want to upload to the same
  place. Note that the destination must be a directory with a trailing
  slash, and that all files listed in `sources` will be uploaded to the
  same directory with their file names preserved.

- `direction` (string) - The direction of the file transfer. This defaults to "upload". If it is
  set to "download" then the file "source" in the machine will be
  downloaded locally to "destination"

- `generated` (bool) - For advanced users only. If true, check the file existence only before
  uploading, rather than upon pre-build validation. This allows users to
  upload files created on-the-fly. This defaults to false. We
  don't recommend using this feature, since it can cause Packer to become
  dependent on system state. We would prefer you generate your files before
  the Packer run, but realize that there are situations where this may be
  unavoidable.

<!-- End of code generated from the comments of the Config struct in provisioner/file/provisioner.go; -->

Parameters common to all provisioners:

- `pause_before` (duration) - Sleep for duration before execution.

- `max_retries` (int) - Max times the provisioner will retry in case of failure. Defaults to zero (0). Zero means an error will not be retried.

- `only` (array of string) - Only run the provisioner for listed builder(s)
  by name.

- `override` (object) - Override the builder with different settings for a
  specific builder, eg :

  In HCL2:

  ```hcl
  source "null" "example1" {
    communicator = "none"
  }

  source "null" "example2" {
    communicator = "none"
  }

  build {
    sources = ["source.null.example1", "source.null.example2"]
    provisioner "shell-local" {
      inline = ["echo not overridden"]
      override = {
        example1 = {
          inline = ["echo yes overridden"]
        }
      }
    }
  }
  ```

  In JSON:

  ```json
  {
    "builders": [
      {
        "type": "null",
        "name": "example1",
        "communicator": "none"
      },
      {
        "type": "null",
        "name": "example2",
        "communicator": "none"
      }
    ],
    "provisioners": [
      {
        "type": "shell-local",
        "inline": ["echo not overridden"],
        "override": {
          "example1": {
            "inline": ["echo yes overridden"]
          }
        }
      }
    ]
  }
  ```

- `timeout` (duration) - If the provisioner takes more than for example
  `1h10m1s` or `10m` to finish, the provisioner will timeout and fail.

## Directory Uploads

The file provisioner is also able to upload a complete directory to the remote
machine. When uploading a directory, there are a few important things you
should know.

First, the destination directory must already exist. If you need to create it,
use a shell provisioner just prior to the file provisioner in order to create
the directory. If the destination directory does not exist, the file
provisioner may succeed, but it will have undefined results.

Next, the existence of a trailing slash on the source path will determine
whether the directory name will be embedded within the destination, or whether
the destination will be created. An example explains this best:

If the source is `/foo` (no trailing slash), and the destination is `/tmp`,
then the contents of `/foo` on the local machine will be uploaded to `/tmp/foo`
on the remote machine. The `foo` directory on the remote machine will be
created by Packer.

If the source, however, is `/foo/` (a trailing slash is present), and the
destination is `/tmp`, then the contents of `/foo` will be uploaded into `/tmp`
directly.

This behavior was adopted from the standard behavior of rsync. Note that under
the covers, rsync may or may not be used.

## Uploading files that don't exist before Packer starts

In general, local files used as the source **must** exist before Packer is run.
This is great for catching typos and ensuring that once a build is started,
that it will succeed. However, this also means that you can't generate a file
during your build and then upload it using the file provisioner later. A
convenient workaround is to upload a directory instead of a file. The directory
still must exist, but its contents don't. You can write your generated file to
the directory during the Packer run, and have it be uploaded later.

## Symbolic link uploads

The behavior when uploading symbolic links depends on the communicator. The
Docker communicator will preserve symlinks, but all other communicators will
treat local symlinks as regular files. If you wish to preserve symlinks when
uploading, it's recommended that you use `tar`. Below is an example of what
that might look like:

```shellsession
$ ls -l files
total 16
drwxr-xr-x  3 mwhooker  staff  102 Jan 27 17:10 a
lrwxr-xr-x  1 mwhooker  staff    1 Jan 27 17:10 b -> a
-rw-r--r--  1 mwhooker  staff    0 Jan 27 17:10 file1
lrwxr-xr-x  1 mwhooker  staff    5 Jan 27 17:10 file1link -> file1
$ ls -l toupload
total 0
-rw-r--r--  1 mwhooker  staff    0 Jan 27 17:10 files.tar
```

<Tabs groupId="template-format" :tabs="[{label:'JSON',value:'t0'},{label:'HCL2',value:'t1'}]">

<TabItem value="t0">

```json
{
  "provisioners": [
    {
      "type": "shell-local",
      "command": "tar cf toupload/files.tar files"
    },
    {
      "destination": "/tmp/",
      "source": "./toupload",
      "type": "file"
    },
    {
      "inline": [
        "cd /tmp && tar xf toupload/files.tar",
        "rm toupload/files.tar"
      ],
      "type": "shell"
    }
  ]
}
```

</TabItem>

<TabItem value="t1">

```hcl
build {
  sources = [
    "source.docker.example"
  ]

  provisioner "shell-local" {
    command = "tar cf toupload/files.tar files"
  }
  provisioner "file" {
    destination = "/tmp/"
    source      = "./toupload"
  }
  provisioner "shell" {
    inline = [
      "cd /tmp && tar xf toupload/files.tar",
      "rm toupload/files.tar"
    ]
  }
}
```

</TabItem>

</Tabs>

## Slowness when transferring large files over WinRM.

Because of the way our WinRM transfers works, it can take a very long time to
upload and download even moderately sized files. If you're experiencing slowness
using the file provisioner on Windows, it's suggested that you set up an SSH
server and use the [ssh communicator](/docs/communicators/ssh). If you only want
to transfer files to your guest, and if your builder supports it, you may also
use the `http_directory` or `http_content` directives. This will cause that
directory to be available to the guest over http, and set the environment
variable `PACKER_HTTP_ADDR` to the address.
