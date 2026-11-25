---
description: |
  The SSH communicator uses SSH to upload files, execute scripts, etc. on
  the machine being created.
title: Communicators - SSH
---

# SSH Communicator

Communicators are the mechanism Packer uses to upload files, execute scripts,
etc. on the machine being created, and are configured within the
[builder](/docs/templates/legacy_json_templates/builders) section.

The SSH communicator does this by using the SSH protocol. It is the default
communicator for a majority of builders.

If you have an SSH agent configured on the host running Packer, and SSH agent
authentication is enabled in the communicator config, Packer will automatically
forward the SSH agent to the remote host.

## Getting Ready to Use the SSH Communicator

The SSH communicator is the default communicator for a majority of builders, but
depending on your builder it may not work "out of the box".

If you are building from a cloud image (for example, building on Amazon), there
is a good chance that your cloud provider has already preconfigured SSH on the
image for you, meaning that all you have to do is configure the communicator in
the Packer template.

However, if you are building from a brand-new and unconfigured operating system
image, you will almost always have to perform some extra work to configure SSH
on the guest machine. For most operating system distributions, this work will
be performed by a [boot command](https://www.packer.io/docs/builders/vmware-iso#boot-configuration)
that references a file which provides answers to the normally-interactive
questions you get asked when installing an operating system. The name of this
file varies by operating system; some common examples are the "preseed" file
required by Debian, the "kickstart" file required by CentOS or the
"answer file", also known as the Autounattend.xml file, required by Windows.
For simplicity's sake, we'll refer to this file as the "preseed" file in the
rest of the documentation.

If you are unfamiliar with how to use a preseed file for automatic
bootstrapping of an image, please either take a look at our
[quick guides](/guides/automatic-operating-system-installs/) to
image bootstrapping, or research automatic configuration for your specific
guest operating system. Knowing how to automatically initalize your operating
system is critical for being able to successfully use Packer.

## SSH Communicator

The SSH communicator connects to the host via SSH. If you have an SSH agent
configured on the host running Packer, and SSH agent authentication is enabled
in the communicator config, Packer will automatically forward the SSH agent to
the remote host.

The SSH communicator has the following options:

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

::: warning
Note: SSH communicator options: `ssh_keypair_name`, `ssh_agent_auth`,
`temporary_key_pair_name` and `ssh_private_key_file` are also supported by
the communicator. But they may not be supported for every builder. Please check
the builder specific documentation for additional SSH supported options.
:::

### SSH Communicator Details

Packer will only use one authentication method, either `publickey` or if
`ssh_password` is used packer will offer `password` and `keyboard-interactive`
both sending the password. In other words Packer will not work with _sshd_
configured with more than one configured authentication method using
`AuthenticationMethods`.

Packer supports the following MACs:

- hmac-sha1
- hmac-sha1-96
- hmac-sha2-256
- `hmac-sha2-256-etm@openssh.com`

For more information on the ciphers that Packer supports, check the docs for
the [ssh_ciphers](/docs/communicators/ssh#ssh_ciphers) template option.
