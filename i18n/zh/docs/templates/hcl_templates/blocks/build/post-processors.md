---
description: >
  将 `post-processors` 块添加到 `build` 块以定义要应用于制品的后处理器列表。了解如何配置嵌套的 `post-processors` 块。
title: post-processors 块参考
---

# `post-processors` 块

本文提供关于 `post-processors` 块的参考信息。

## 描述

将 `post-processors` 块添加到 `build` 块中以包含[后处理器](/docs/templates/hcl_templates/blocks/build/post-processor)配置列表。Packer 在每次构建后为制品运行后处理器。

```hcl
# builds.pkr.hcl
build {
  # ...
  post-processors {
    post-processor "shell-local" { # 创建一个包含 "hello" 的 artifice.txt 文件
      inline = [ "echo hello > artifice.txt" ]
    }
    post-processor "artifice" { # 告诉 packer 这现在是新的制品
      files = ["artifice.txt"]
    }
    post-processor "checksum" { # 校验 artifice.txt
      checksum_types = [ "md5", "sha512" ] # 校验制品
      keep_input_artifact = true           # 保留制品
    }
  }

}
```

[`post-processor` 块](/docs/templates/hcl_templates/blocks/build/post-processor)允许定义从每个构建的 `Artifact` 运行的多个后处理器。阅读 `post-processor` 文档以了解如何使用后处理器。

### `post-processor` 和 `post-processors` 块的区别

这两个模板做的是同样的事情：

```hcl
# builds.pkr.hcl
build {
  # ... 构建镜像
  post-processor "checksum" { # 校验镜像
    checksum_types = [ "md5", "sha512" ] # 校验制品
  }

  post-processor "amazon-import" { # 上传镜像到 AWS
  }

  post-processor "googlecompute-import" { # 上传镜像到 GCP
  }
}
```

```hcl
# builds.pkr.hcl
build {
  # ... 构建镜像
  post-processors {
    post-processor "checksum" { # 校验镜像
      checksum_types = [ "md5", "sha512" ] # 校验制品
    }
  }

  post-processors {
    post-processor "amazon-import" { # 上传镜像到 AWS
    }
  }

  post-processors {
    post-processor "googlecompute-import" { # 上传镜像到 GCP
    }
  }
}
```

这些 `post-processors` 中的每一个都将在每次构建之后启动——即，在每个配置步骤在每个源上运行之后。在所有情况下，源镜像都将被删除。
