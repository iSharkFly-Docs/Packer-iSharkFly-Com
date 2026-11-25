---
description: |
  The amazon-ebs Packer builder is able to create Amazon AMIs backed by EBS
  volumes for use in EC2. For more information on the difference between
  EBS-backed instances and instance-store backed instances, see the storage for
  the root device section in the EC2 documentation.
title: Amazon EBS - Builders
nav_title: EBS
---

# AMI Builder (EBS backed)

Type: `amazon-ebs`
Artifact BuilderId: `mitchellh.amazonebs`

The `amazon-ebs` Packer builder is able to create Amazon AMIs backed by EBS
volumes for use in [EC2](https://aws.amazon.com/ec2/). For more information on
the difference between EBS-backed instances and instance-store backed
instances, see the ["storage for the root device" section in the EC2
documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device).

This builder builds an AMI by launching an EC2 instance from a source AMI,
provisioning that running machine, and then creating an AMI from that machine.
This is all done in your own AWS account. The builder will create temporary
keypairs, security group rules, etc. that provide it temporary access to the
instance while the image is being created. This simplifies configuration quite
a bit.

The builder does _not_ manage AMIs. Once it creates an AMI and stores it in
your account, it is up to you to use, delete, etc. the AMI.

::: info
**Note:** Temporary resources are, by default, all created with the
prefix `packer`. This can be useful if you want to restrict the security groups
and key pairs Packer is able to operate on.
:::

## EBS Specific Configuration Reference

There are many configuration options available for the builder. In addition to
the items listed here, you will want to look at the general configuration
references for [AMI](#ami-configuration),
[BlockDevices](#block-devices-configuration),
[Access](#access-configuration),
[Run](#run-configuration) and
[Communicator](#communicator-configuration)
configuration references, which are
necessary for this build to succeed and can be found further down the page.

#### Optional:



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



#### Metadata Settings





Usage Example

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
source "amazon-ebs" "basic-example" {
  region        =  "us-east-1"
  source_ami    =  "ami-fce3c696"
  instance_type =  "t2.micro"
  ssh_username  =  "ubuntu"
  ami_name      =  "packer_AWS_example_{{timestamp}}"
  metadata_options {
    http_endpoint = "enabled"
    http_tokens = "required"
    http_put_response_hop_limit = 1
  }
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "variables": {
    "aws_access_key": "{{env `AWS_ACCESS_KEY_ID`}}",
    "aws_secret_key": "{{env `AWS_SECRET_ACCESS_KEY`}}"
  },
  "builders": [
    {
      "type": "amazon-ebs",
      "access_key": "{{user `aws_access_key`}}",
      "secret_key": "{{user `aws_secret_key`}}",
      "region": "us-east-1",
      "source_ami": "ami-fce3c696",
      "instance_type": "t2.micro",
      "ssh_username": "ubuntu",
      "ami_name": "packer_AWS {{timestamp}}",
      "metadata_options": {
        "http_endpoint": "enabled",
        "http_tokens": "required",
        "http_put_response_hop_limit": 1
      }
    }
  ]
}
```

</TabItem>

</Tabs>



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

Here is a basic example. You will need to provide access keys, and may need to
change the AMI IDs according to what images exist at the time the template is
run:

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
// To make Packer read these variables from the environment into the var object,
// set the environment variables to have the same name as the declared
// variables, with the prefix PKR_VAR_.

// There are other ways to [set variables](/docs/templates/hcl_templates/variables#assigning-values-to-build-variables)
// including from a var file or as a command argument.

// export PKR_VAR_aws_access_key=$YOURKEY
variable "aws_access_key" {
  type = string
  // default = "hardcoded_key"
}

// export PKR_VAR_aws_secret_key=$YOURSECRETKEY
variable "aws_secret_key" {
  type = string
  // default = "hardcoded_secret_key"
}

source "amazon-ebs" "basic-example" {
  access_key = var.aws_access_key
  secret_key =  var.aws_secret_key
  region =  "us-east-1"
  source_ami =  "ami-fce3c696"
  instance_type =  "t2.micro"
  ssh_username =  "ubuntu"
  ami_name =  "packer_AWS {{timestamp}}"
}

build {
  sources = [
    "source.amazon-ebs.basic-example"
  ]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "variables": {
  "aws_access_key": "{{env `AWS_ACCESS_KEY_ID`}}",
  "aws_secret_key": "{{env `AWS_SECRET_ACCESS_KEY`}}"
},
  "builders": [
    {
      "type": "amazon-ebs",
      "access_key": "{{user `aws_access_key`}}",
      "secret_key": "{{user `aws_secret_key`}}",
      "region": "us-east-1",
      "source_ami": "ami-fce3c696",
      "instance_type": "t2.micro",
      "ssh_username": "ubuntu",
      "ami_name": "packer_AWS {{timestamp}}"
    }
  ]
}
```

</TabItem>

</Tabs>

::: info
**Note:** Packer can also read the access key and secret access key directly
from environmental variables instead of being set as user variables. See the
configuration reference in the section above for more information on what
environmental variables Packer will look for.
:::

Further information on locating AMI IDs and their relationship to instance
types and regions can be found in the AWS EC2 Documentation [for
Linux](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/finding-an-ami.html)
or [for
Windows](http://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/finding-an-ami.html).

## Accessing the Instance to Debug

If you need to access the instance to debug for some reason, run the builder
with the `-debug` flag. In debug mode, the Amazon builder will save the private
key in the current directory and will output the DNS or IP information as well.
You can use this information to access the instance as it is running.

## AMI Block Device Mappings Example

Here is an example using the optional AMI block device mappings. Our
configuration of `launch_block_device_mappings` will expand the root volume
(`/dev/sda`) to 40gb during the build (up from the default of 8gb). With
`ami_block_device_mappings` AWS will attach additional volumes `/dev/sdb` and
`/dev/sdc` when we boot a new instance of our AMI.

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
source "amazon-ebs" "basic-example" {
  region        =  "us-east-1"
  source_ami    =  "ami-fce3c696"
  instance_type =  "t2.micro"
  ssh_username  =  "ubuntu"
  ami_name      =  "packer_AWS_example_{{timestamp}}"
  launch_block_device_mappings {
    device_name = "/dev/sda1"
    volume_size = 40
    volume_type = "gp2"
    delete_on_termination = true
  }
  // Notice that instead of providing a list of mappings, you are just providing
  // multiple mappings in a row. This diverges from the JSON template format.
  ami_block_device_mappings {
    device_name  = "/dev/sdb"
    virtual_name = "ephemeral0"
  }
  ami_block_device_mappings {
    device_name  = "/dev/sdc"
    virtual_name = "ephemeral1"
  }
}

build {
  sources = [
    "source.amazon-ebs.basic-example"
  ]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "builders": [
    {
      "type": "amazon-ebs",
      "region": "us-east-1",
      "source_ami": "ami-fce3c696",
      "instance_type": "t2.micro",
      "ssh_username": "ubuntu",
      "ami_name": "packer-quick-start {{timestamp}}",
      "launch_block_device_mappings": [
        {
          "device_name": "/dev/sda1",
          "volume_size": 40,
          "volume_type": "gp2",
          "delete_on_termination": true
        }
      ],
      "ami_block_device_mappings": [
        {
          "device_name": "/dev/sdb",
          "virtual_name": "ephemeral0"
        },
        {
          "device_name": "/dev/sdc",
          "virtual_name": "ephemeral1"
        }
      ]
    }
  ]
}
```

</TabItem>

</Tabs>

The above build template is functional assuming you have set the environment
variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.

::: info
**Note:** Packer uses pre-built AMIs as the source for building images.
These source AMIs may include volumes that are not flagged to be destroyed on
termination of the instance building the new image. Packer will attempt to
clean up all residual volumes that are not designated by the user to remain
after termination. If you need to preserve those source volumes, you can
overwrite the termination setting by setting `delete_on_termination` to `false`
in the `launch_block_device_mappings` block for the device.
:::

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
# When accessing one of these variables from inside the builder, you need to
# use the golang templating syntax. This is due to an architectural quirk that
# won't be easily resolvable until legacy json templates are deprecated:
build {
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

## Tag Example

Here is an example using the optional AMI tags. This will add the tags
`OS_Version` and `Release` to the finished AMI. As before, you will need to
provide your access keys, and may need to change the source AMI ID based on
what images exist when this template is run:

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
source "amazon-ebs" "basic-example" {
  region =  "us-east-1"
  source_ami =  "ami-fce3c696"
  instance_type =  "t2.micro"
  ssh_username =  "ubuntu"
  ami_name =  "packer_tag_example {{timestamp}}"
  tags = {
      OS_Version = "Ubuntu"
      Release = "Latest"
      Base_AMI_Name = "{{ .SourceAMIName }}"
      Extra = "{{ .SourceAMITags.TagName }}"
  }
}

build {
  sources = [
    "source.amazon-ebs.basic-example"
  ]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "builders": [
      {
      "type": "amazon-ebs",
      "region": "us-east-1",
      "source_ami": "ami-fce3c696",
      "instance_type": "t2.micro",
      "ssh_username": "ubuntu",
      "ami_name": "packer-tag-example {{timestamp}}",
      "tags": {
        "OS_Version": "Ubuntu",
        "Release": "Latest",
        "Base_AMI_Name": "{{ .SourceAMIName }}",
        "Extra": "{{ .SourceAMITags.TagName }}"
      }
    }
  ]
}
```

</TabItem>

</Tabs>

## Connecting to Windows instances using WinRM

If you want to launch a Windows instance and connect using WinRM, you will need
to configure WinRM on that instance. The following is a basic powershell script
that can be supplied to AWS using the "user_data_file" option. It enables
WinRM via HTTPS on port 5986, and creates a self-signed certificate to use to
connect. If you are using a certificate from a CA, rather than creating a
self-signed certificate, you can omit the "winrm_insecure" option mentioned
below.

autogenerated_password_https_boostrap.txt

```powershell
<powershell>

# MAKE SURE IN YOUR PACKER CONFIG TO SET:
#
#
#    "winrm_username": "Administrator",
#    "winrm_insecure": true,
#    "winrm_use_ssl": true,
#
#


write-output "Running User Data Script"
write-host "(host) Running User Data Script"

Set-ExecutionPolicy Unrestricted -Scope LocalMachine -Force -ErrorAction Ignore

# Don't set this before Set-ExecutionPolicy as it throws an error
$ErrorActionPreference = "stop"

# Remove HTTP listener
Remove-Item -Path WSMan:\Localhost\listener\listener* -Recurse

# Create a self-signed certificate to let ssl work
$Cert = New-SelfSignedCertificate -CertstoreLocation Cert:\LocalMachine\My -DnsName "packer"
New-Item -Path WSMan:\LocalHost\Listener -Transport HTTPS -Address * -CertificateThumbPrint $Cert.Thumbprint -Force

# WinRM
write-output "Setting up WinRM"
write-host "(host) setting up WinRM"

cmd.exe /c winrm quickconfig -q
cmd.exe /c winrm set "winrm/config" '@{MaxTimeoutms="1800000"}'
cmd.exe /c winrm set "winrm/config/winrs" '@{MaxMemoryPerShellMB="1024"}'
cmd.exe /c winrm set "winrm/config/service" '@{AllowUnencrypted="true"}'
cmd.exe /c winrm set "winrm/config/client" '@{AllowUnencrypted="true"}'
cmd.exe /c winrm set "winrm/config/service/auth" '@{Basic="true"}'
cmd.exe /c winrm set "winrm/config/client/auth" '@{Basic="true"}'
cmd.exe /c winrm set "winrm/config/service/auth" '@{CredSSP="true"}'
cmd.exe /c winrm set "winrm/config/listener?Address=*+Transport=HTTPS" "@{Port=`"5986`";Hostname=`"packer`";CertificateThumbprint=`"$($Cert.Thumbprint)`"}"
cmd.exe /c netsh advfirewall firewall set rule group="remote administration" new enable=yes
cmd.exe /c netsh firewall add portopening TCP 5986 "Port 5986"
cmd.exe /c net stop winrm
cmd.exe /c sc config winrm start= auto
cmd.exe /c net start winrm

</powershell>
```

You'll notice that this config does not define a user or password; instead,
Packer will ask AWS to provide a random password that it generates
automatically. The following config will work with the above template:

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
# This example uses a amazon-ami data source rather than a specific AMI.
# this allows us to use the same filter regardless of what region we're in,
# among other benefits.
data "amazon-ami" "example" {
  filters = {
    virtualization-type = "hvm"
    name                = "*Windows_Server-2012*English-64Bit-Base*"
    root-device-type    = "ebs"
  }
  owners      = ["amazon"]
  most_recent = true
  # Access Region Configuration
  region      = "us-east-1"
}

source "amazon-ebs" "winrm-example" {
  region =  "us-east-1"
  source_ami = data.amazon-ami.example.id
  instance_type =  "t2.micro"
  ami_name =  "packer_winrm_example {{timestamp}}"
  # This user data file sets up winrm and configures it so that the connection
  # from Packer is allowed. Without this file being set, Packer will not
  # connect to the instance.
  user_data_file = "../boot_config/winrm_bootstrap.txt"
  communicator = "winrm"
  force_deregister = true
  winrm_insecure = true
  winrm_username = "Administrator"
  winrm_use_ssl = true
}

build {
  sources = [
    "source.amazon-ebs.winrm-example"
  ]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "builders": [
    {
      "type": "amazon-ebs",
      "region": "us-east-1",
      "instance_type": "t2.micro",
      "source_ami_filter": {
        "filters": {
          "virtualization-type": "hvm",
          "name": "*Windows_Server-2012*English-64Bit-Base*",
          "root-device-type": "ebs"
        },
        "most_recent": true,
        "owners": "amazon"
      },
      "ami_name": "default-packer",
      "user_data_file": "./boot_config/winrm_bootstrap.txt",
      "communicator": "winrm",
      "force_deregister": true,
      "winrm_insecure": true,
      "winrm_username": "Administrator",
      "winrm_use_ssl": true
    }
  ]
}
```

</TabItem>

</Tabs>

## Windows 2016 Sysprep Commands - For Amazon Windows AMIs Only

For Amazon Windows 2016 AMIs it is necessary to run Sysprep commands which can
be easily added to the provisioner section.

<Tabs groupId="template-format" :tabs="[{label:'HCL2',value:'t0'},{label:'JSON',value:'t1'}]">

<TabItem value="t0">

```hcl
provisioner "powershell" {
  inline = [
    "C:/ProgramData/Amazon/EC2-Windows/Launch/Scripts/InitializeInstance.ps1 -Schedule",
    "C:/ProgramData/Amazon/EC2-Windows/Launch/Scripts/SysprepInstance.ps1 -NoShutdown"
  ]
}
```

</TabItem>

<TabItem value="t1">

```json
{
  "type": "powershell",
  "inline": [
    "C:/ProgramData/Amazon/EC2-Windows/Launch/Scripts/InitializeInstance.ps1 -Schedule",
    "C:/ProgramData/Amazon/EC2-Windows/Launch/Scripts/SysprepInstance.ps1 -NoShutdown"
  ]
}
```

</TabItem>

</Tabs>


