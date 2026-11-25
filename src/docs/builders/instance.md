---
description: >
  The amazon-instance Packer builder is able to create Amazon AMIs backed by

  instance storage as the root device. For more information on the difference

  between instance storage and EBS-backed instances, see the storage for the
  root

  device section in the EC2 documentation.
title: Amazon instance-store - Builders
nav_title: Instance
---

# AMI Builder (instance-store)

Type: `amazon-instance`
Artifact BuilderId: `mitchellh.amazon.instance`

The `amazon-instance` Packer builder is able to create Amazon AMIs backed by
instance storage as the root device. For more information on the difference
between instance storage and EBS-backed instances, see the ["storage for the
root device" section in the EC2
documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device).

This builder builds an AMI by launching an EC2 instance from an existing
instance-storage backed AMI, provisioning that running machine, and then
bundling and creating a new AMI from that machine. This is all done in your own
AWS account. This builder will create temporary key pairs, security group
rules, etc. that provide it temporary access to the instance while the image is
being created. This simplifies configuration quite a bit.

This builder does _not_ manage AMIs. Once it creates an AMI and stores it in
your account, it is up to you to use, delete, etc. the AMI.

::: info
**Note:** Temporary resources are, by default, all created with the
prefix `packer`. This can be useful if you want to restrict the security groups
and key pairs packer is able to operate on.
:::

::: info
**Note:** This builder requires that the [Amazon EC2 AMI
Tools](https://aws.amazon.com/developertools/368) are installed onto the
machine. This can be done within a provisioner, but must be done before the
builder finishes running.
:::

::: warning
Instance builds are not supported for Windows. Use
[`amazon-ebs`](https://www.packer.io/docs/builders/amazon-ebs) instead.
:::

## Configuration Reference

There are many configuration options available for the builder. In addition to
the items listed here, you will want to look at the general configuration
references for [AMI](#ami-configuration),
[BlockDevices](#block-devices-configuration),
[Access](#access-configuration),
[Run](#run-configuration) and
[Communicator](#communicator-configuration)
configuration references, which are
necessary for this build to succeed and can be found further down the page.

### Required:



### Optional:



### AMI Configuration

#### Required:



#### Optional:



### Access Configuration

#### Required:



#### Optional:



### Assume Role Configuration





### Polling Configuration





### Run Configuration

#### Required:



#### Optional:





### Block Devices Configuration

Block devices can be nested in the
[ami_block_device_mappings](#ami_block_device_mappings) or the
[launch_block_device_mappings](#launch_block_device_mappings) array.



#### Optional:



### Communicator Configuration

#### Optional:

- `communicator` (string) - Packer currently supports three kinds of communicators:
  
  -   `none` - No communicator will be used. If this is set, most
      provisioners also can't be used.
  
  -   `ssh` - An SSH connection will be established to the machine. This
      is usually the default.
  
  -   `winrm` - A WinRM connection will be established.
  
  In addition to the above, some builders have custom communicators they
  can use. For example, the Docker builder has a "docker" communicator
  that uses `docker exec` and `docker cp` to execute scripts and copy
  files.

- `pause_before_connecting` (duration string | ex: "1h5m2s") - We recommend that you enable SSH or WinRM as the very last step in your
  guest's bootstrap script, but sometimes you may have a race condition
  where you need Packer to wait before attempting to connect to your
  guest.
  
  If you end up in this situation, you can use the template option
  `pause_before_connecting`. By default, there is no pause. For example if
  you set `pause_before_connecting` to `10m` Packer will check whether it
  can connect, as normal. But once a connection attempt is successful, it
  will disconnect and then wait 10 minutes before connecting to the guest
  and beginning provisioning.

- `ssh_host` (string) - The address to SSH to. This usually is automatically configured by the
  builder.

- `ssh_port` (int) - The port to connect to SSH. This defaults to `22`.

- `ssh_username` (string) - The username to connect to SSH with. Required if using SSH.

- `ssh_password` (string) - A plaintext password to use to authenticate with SSH.

- `ssh_ciphers` ([]string) - This overrides the value of ciphers supported by default by golang.
  The default value is [
    "aes128-gcm@openssh.com",
    "chacha20-poly1305@openssh.com",
    "aes128-ctr", "aes192-ctr", "aes256-ctr",
  ]
  
  Valid options for ciphers include:
  "aes128-ctr", "aes192-ctr", "aes256-ctr", "aes128-gcm@openssh.com",
  "chacha20-poly1305@openssh.com",
  "arcfour256", "arcfour128", "arcfour", "aes128-cbc", "3des-cbc",

- `ssh_clear_authorized_keys` (bool) - If true, Packer will attempt to remove its temporary key from
  `~/.ssh/authorized_keys` and `/root/.ssh/authorized_keys`. This is a
  mostly cosmetic option, since Packer will delete the temporary private
  key from the host system regardless of whether this is set to true
  (unless the user has set the `-debug` flag). Defaults to "false";
  currently only works on guests with `sed` installed.

- `ssh_key_exchange_algorithms` ([]string) - If set, Packer will override the value of key exchange (kex) altorighms
  supported by default by golang. Acceptable values include:
  "curve25519-sha256@libssh.org", "ecdh-sha2-nistp256",
  "ecdh-sha2-nistp384", "ecdh-sha2-nistp521",
  "diffie-hellman-group14-sha1", and "diffie-hellman-group1-sha1".

- `ssh_certificate_file` (string) - Path to user certificate used to authenticate with SSH.
  The `~` can be used in path and will be expanded to the
  home directory of current user.

- `ssh_pty` (bool) - If `true`, a PTY will be requested for the SSH connection. This defaults
  to `false`.

- `ssh_timeout` (duration string | ex: "1h5m2s") - The time to wait for SSH to become available. Packer uses this to
  determine when the machine has booted so this is usually quite long.
  Example value: `10m`.

- `ssh_disable_agent_forwarding` (bool) - If true, SSH agent forwarding will be disabled. Defaults to `false`.

- `ssh_handshake_attempts` (int) - The number of handshakes to attempt with SSH once it can connect. This
  defaults to `10`.

- `ssh_bastion_host` (string) - A bastion host to use for the actual SSH connection.

- `ssh_bastion_port` (int) - The port of the bastion host. Defaults to `22`.

- `ssh_bastion_agent_auth` (bool) - If `true`, the local SSH agent will be used to authenticate with the
  bastion host. Defaults to `false`.

- `ssh_bastion_username` (string) - The username to connect to the bastion host.

- `ssh_bastion_password` (string) - The password to use to authenticate with the bastion host.

- `ssh_bastion_interactive` (bool) - If `true`, the keyboard-interactive used to authenticate with bastion host.

- `ssh_bastion_private_key_file` (string) - Path to a PEM encoded private key file to use to authenticate with the
  bastion host. The `~` can be used in path and will be expanded to the
  home directory of current user.

- `ssh_bastion_certificate_file` (string) - Path to user certificate used to authenticate with bastion host.
  The `~` can be used in path and will be expanded to the
  home directory of current user.

- `ssh_file_transfer_method` (string) - `scp` or `sftp` - How to transfer files, Secure copy (default) or SSH
  File Transfer Protocol.

- `ssh_proxy_host` (string) - A SOCKS proxy host to use for SSH connection

- `ssh_proxy_port` (int) - A port of the SOCKS proxy. Defaults to `1080`.

- `ssh_proxy_username` (string) - The optional username to authenticate with the proxy server.

- `ssh_proxy_password` (string) - The optional password to use to authenticate with the proxy server.

- `ssh_keep_alive_interval` (duration string | ex: "1h5m2s") - How often to send "keep alive" messages to the server. Set to a negative
  value (`-1s`) to disable. Example value: `10s`. Defaults to `5s`.

- `ssh_read_write_timeout` (duration string | ex: "1h5m2s") - The amount of time to wait for a remote command to end. This might be
  useful if, for example, packer hangs on a connection after a reboot.
  Example: `5m`. Disabled by default.

- `ssh_remote_tunnels` ([]string) - 

- `ssh_local_tunnels` ([]string) -

- `temporary_key_pair_type` (string) - `dsa` | `ecdsa` | `ed25519` | `rsa` ( the default )
  
  Specifies the type of key to create. The possible values are 'dsa',
  'ecdsa', 'ed25519', or 'rsa'.

- `temporary_key_pair_bits` (int) - Specifies the number of bits in the key to create. For RSA keys, the
  minimum size is 1024 bits and the default is 4096 bits. Generally, 3072
  bits is considered sufficient. DSA keys must be exactly 1024 bits as
  specified by FIPS 186-2. For ECDSA keys, bits determines the key length
  by selecting from one of three elliptic curve sizes: 256, 384 or 521
  bits. Attempting to use bit lengths other than these three values for
  ECDSA keys will fail. Ed25519 keys have a fixed length and bits will be
  ignored.

- `ssh_keypair_name` (string) - If specified, this is the key that will be used for SSH with the
  machine. The key must match a key pair name loaded up into the remote.
  By default, this is blank, and Packer will generate a temporary keypair
  unless [`ssh_password`](#ssh_password) is used.
  [`ssh_private_key_file`](#ssh_private_key_file) or
  [`ssh_agent_auth`](#ssh_agent_auth) must be specified when
  [`ssh_keypair_name`](#ssh_keypair_name) is utilized.

- `ssh_private_key_file` (string) - Path to a PEM encoded private key file to use to authenticate with SSH.
  The `~` can be used in path and will be expanded to the home directory
  of current user.

- `ssh_agent_auth` (bool) - If true, the local SSH agent will be used to authenticate connections to
  the source instance. No temporary keypair will be created, and the
  values of [`ssh_password`](#ssh_password) and
  [`ssh_private_key_file`](#ssh_private_key_file) will be ignored. The
  environment variable `SSH_AUTH_SOCK` must be set for this option to work
  properly.

## Basic Example

Here is a basic example. It is completely valid except for the access keys:

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
source "amazon-instance" "basic-example" {
  region = "us-east-1"
  source_ami = "ami-d9d6a6b0"
  instance_type = "m1.small"
  ssh_username = "ubuntu"

  account_id = "0123-4567-0890"
  s3_bucket = "packer-images"
  x509_cert_path = "x509.cert"
  x509_key_path = "x509.key"
  x509_upload_path = "/tmp"
}

build {
  source "sources.amazon-instance.basic-example" {
    ami_name = "packer-quick-start {{timestamp}}"
  }
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "amazon-instance",
  "access_key": "YOUR KEY HERE",
  "secret_key": "YOUR SECRET KEY HERE",
  "region": "us-east-1",
  "source_ami": "ami-d9d6a6b0",
  "instance_type": "m1.small",
  "ssh_username": "ubuntu",

  "account_id": "0123-4567-0890",
  "s3_bucket": "packer-images",
  "x509_cert_path": "x509.cert",
  "x509_key_path": "x509.key",
  "x509_upload_path": "/tmp",

  "ami_name": "packer-quick-start {{timestamp}}"
}
```

</TabItem>

</Tabs>

::: info
**Note:** Packer can also read the access key and secret access key from
environmental variables. See the configuration reference in the section above
for more information on what environmental variables Packer will look for.
:::

## Accessing the Instance to Debug

If you need to access the instance to debug for some reason, run this builder
with the `-debug` flag. In debug mode, the Amazon builder will save the private
key in the current directory and will output the DNS or IP information as well.
You can use this information to access the instance as it is running.

## Build template data

In configuration directives marked as a template engine above, the following
variables are available:

- `BuildRegion` - The region (for example `eu-central-1`) where Packer is
  building the AMI.
- `SourceAMI` - The source AMI ID (for example `ami-a2412fcd`) used to build
  the AMI.
- `SourceAMICreationDate` - The source AMI creation date (for example `"2020-05-14T19:26:34.000Z"`).
- `SourceAMIName` - The source AMI Name (for example
  `ubuntu/images/ebs-ssd/ubuntu-xenial-16.04-amd64-server-20180306`) used to
  build the AMI.
- `SourceAMIOwner` - The source AMI owner ID.
- `SourceAMIOwnerName` - The source AMI owner alias/name (for example `amazon`).
- `SourceAMITags` - The source AMI Tags, as a `map[string]string` object.

## Build Shared Information Variables

This builder generates data that are shared with provisioner and post-processor via build function of [template engine](/docs/templates/legacy_json_templates/engine) for JSON and [contextual variables](/docs/templates/hcl_templates/contextual-variables) for HCL2.

The generated variables available for this builder are:

- `BuildRegion` - The region (for example `eu-central-1`) where Packer is
  building the AMI.
- `SourceAMI` - The source AMI ID (for example `ami-a2412fcd`) used to build
  the AMI.
- `SourceAMICreationDate` - The source AMI creation date (for example `"2020-05-14T19:26:34.000Z"`).
- `SourceAMIName` - The source AMI Name (for example
  `ubuntu/images/ebs-ssd/ubuntu-xenial-16.04-amd64-server-20180306`) used to
  build the AMI.
- `SourceAMIOwner` - The source AMI owner ID.
- `SourceAMIOwnerName` - The source AMI owner alias/name (for example `amazon`).

Usage example:

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
// When accessing one of these variables from inside the builder, you need to
// use the golang templating syntax. This is due to an architectural quirk that
// won't be easily resolvable until legacy json templates are deprecated:

{
source "amazon-ebs" "basic-example" {
  tags = {
        OS_Version = "Ubuntu"
        Release = "Latest"
        Base_AMI_ID = "{{ .SourceAMI }}"
        Base_AMI_Name = "{{ .SourceAMIName }}"
    }
}

// when accessing one of the variables from a provisioner or post-processor, use
// hcl-syntax
post-processor "manifest" {
    output = "manifest.json"
    strip_path = true
    custom_data = {
        source_ami_name = "${build.SourceAMIName}"
    }
}
```

</TabItem>

<TabItem value="t1">

```json
"post-processors": [
  {
    "type": "manifest",
    "output": "manifest.json",
    "strip_path": true,
    "custom_data": {
      "source_ami_name": "{{ build `SourceAMIName` }}"
    }
  }
]
```

</TabItem>

</Tabs>

## Custom Bundle Commands

A lot of the process required for creating an instance-store backed AMI
involves commands being run on the actual source instance. Specifically, the
`ec2-bundle-vol` and `ec2-upload-bundle` commands must be used to bundle the
root filesystem and upload it, respectively.

Each of these commands have a lot of available flags. Instead of exposing each
possible flag as a template configuration option, the instance-store AMI
builder for Packer lets you customize the entire command used to bundle and
upload the AMI.

These are configured with `bundle_vol_command` and `bundle_upload_command`.
Both of these configurations are [configuration
templates](/docs/templates/legacy_json_templates/engine) and have support for their own set of
template variables.

### Bundle Volume Command

The default value for `bundle_vol_command` is shown below. It is split across
multiple lines for convenience of reading. The bundle volume command is
responsible for executing `ec2-bundle-vol` in order to store and image of the
root filesystem to use to create the AMI.

```shellsession
$ sudo -i -n ec2-bundle-vol \
  -k {{.KeyPath}}  \
  -u {{.AccountId}} \
  -c {{.CertPath}} \
  -r {{.Architecture}} \
  -e {{.PrivatePath}}/* \
  -d {{.Destination}} \
  -p {{.Prefix}} \
  --batch \
  --no-filter
```

The available template variables should be self-explanatory based on the
parameters they're used to satisfy the `ec2-bundle-vol` command.

::: warning
**Warning!** Some versions of ec2-bundle-vol silently ignore all .pem
and .gpg files during the bundling of the AMI, which can cause problems on some
systems, such as Ubuntu. You may want to customize the bundle volume command to
include those files (see the `--no-filter` option of `ec2-bundle-vol`).
:::

### Bundle Upload Command

The default value for `bundle_upload_command` is shown below. It is split
across multiple lines for convenience of reading. Access key and secret key are
omitted if using instance profile. The bundle upload command is responsible for
taking the bundled volume and uploading it to S3.

```shellsession
$ sudo -i -n ec2-upload-bundle \
  -b {{.BucketName}} \
  -m {{.ManifestPath}} \
  -a {{.AccessKey}} \
  -s {{.SecretKey}} \
  -d {{.BundleDirectory}} \
  --batch \
  --region {{.Region}} \
  --retry
```

The available template variables should be self-explanatory based on the
parameters they're used to satisfy the `ec2-upload-bundle` command.
Additionally, `{{.Token}}` is available when overriding this command. You must
create your own bundle command with the addition of `-t {{.Token}}` if you are
assuming a role.

#### Bundle Upload Permissions

The `ec2-upload-bundle` requires a policy document that looks something like
this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:PutObjectAcl"
      ],
      "Resource": "*"
    }
  ]
}
```

You may wish to constrain the resource to a specific bucket.


