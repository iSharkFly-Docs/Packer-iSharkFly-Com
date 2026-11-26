---
description: |
  你可以创建或修改自定义插件以支持 HCP Packer。添加对 HCP Packer 的支持，让插件管理存储在 HCP Packer 注册表中的镜像元数据。
title: 为自定义插件启用 HCP Packer 支持
---

# 为自定义插件启用 HCP Packer 支持

本页面解释如何更新自定义插件，以便它可以将镜像元数据发布到 [HCP Packer 注册表](https://developer.hashicorp.com/hcp/docs/packer)。有关创建外部 Packer 插件的详细信息，请参阅[自定义构建器](/docs/plugins/creation/custom-builders)和[自定义后处理器](/docs/plugins/creation/custom-post-processors)。

在将元数据推送到 HCP Packer 注册表之前，Packer 使用 [`par.artifact.metadata` 键](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer/registry/image#pkg-constants)来查询构建器制品，以获取特定组件想要存储在注册表中的镜像元数据。

有关如何管理镜像元数据的详细信息和示例，请参阅 [HCP Packer GitHub 文档](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer/registry/image)。

HCP Packer 正在积极开发中，我们建议插件维护者关注 SDK 的更改以获取更多关于 HCP Packer 支持的信息。

## 构建器制品

为了支持 HCP Packer，必须对插件的构建制品进行更改。制品应该在 `par.artifact.metadata` 键下的状态中保存适当的镜像元数据。预期的键由 [image.ArtifactStateURI](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer/registry/image#pkg-constants) 常量提供。

为了使 HCP Packer 支持更容易，我们在 [packer-plugin-sdk](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer/registry/image#pkg-overview) 中提供了一个 Image 包。
我们提供了 [`FromArtifact`](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer/registry/image#FromArtifact) 函数，可以轻松地使用制品中包含的基本信息创建 Image。如果需要自定义，`FromArtifact` 接受覆盖函数作为第二个参数，可以用来为元数据设置不同的值。

[Image 元数据](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer/registry/image#Image)必须包含 HCP Packer 应该存储的关于此组件的每个元数据。结构如下：
```go
// Image 表示 HCP Packer 注册表中某个 Artifact 的元数据。
type Image struct {
	// ImageID 是存储在 HCP Packer 注册表中的唯一引用标识符，
	// 可用于获取构建器或后处理器的构建制品。
	ImageID string
	// ProviderName 表示构建制品所在的顶级云或服务的名称。
	// 例如 "aws, azure, docker, gcp, 和 vsphere"。
	ProviderName string
	// ProviderRegion 表示构建制品的位置。
	// 对于云提供商，region 通常映射到云区域或可用区，但对于像 file 构建器、
	// S3 存储桶或 vsphere 集群这样的东西，region 可以表示上游数据存储或集群上的路径。
	ProviderRegion string
	// Labels 表示构建器或后处理器可能希望为给定构建提供的关于镜像的额外详细信息。
	// 任何额外的元数据都将在 HCP Packer 注册表迭代中作为构建标签提供。
	Labels map[string]string
	// SourceImageID 是用作此镜像源的云镜像 ID。如果设置，
	// HCP Packer 注册表将能够链接父镜像和子镜像，以进行血统可视化和依赖跟踪。
	SourceImageID string
}
```

其中 `ImageID`、`ProviderName` 和 `SourceImageID` 是必填字段。

使用 `FromArtifact` 方法的示例：

- 简单形式：
```go
func (a *Artifact) State(name string) interface{} {
	if name == registryimage.ArtifactStateURI {
		img, err := registryimage.FromArtifact(a)
		if err != nil {
			log.Printf("[DEBUG] error encountered when creating a registry image %v", err)
			return nil
		}
	  return img
	}
	return a.StateData[name]
}
```

- 使用覆盖：
```go
func (a *Artifact) State(name string) interface{} {
	if name == registryimage.ArtifactStateURI {
		img, err := registryimage.FromArtifact(a,
                registryimage.WithID(a.Name),
                registryimage.WithRegion(a.Region.Name()),
                registryimage.WithProvider("happy-cloud"),
                registryimage.WithSourceID(a.SourceID),
                registryimage.SetLabels(a.Labels),
              )
		if err != nil {
			log.Printf("[DEBUG] error encountered when creating a registry image %v", err)
			return nil
		}
	  return img
	}
	return a.StateData[name]
}
```

有关更多示例，请参阅 [packer-plugin-sdk/packer/registry/image](https://pkg.go.dev/github.com/hashicorp/packer-plugin-sdk/packer/registry/image#pkg-examples)。

### SDK 版本

- HCP Packer 支持从 packer-plugin-sdk >= v0.2.7 开始可用

## 插件示例

以下插件目前支持 HCP Packer，是开发的很好参考：

- [packer-plugin-amazon](https://github.com/hashicorp/packer-plugin-amazon)
- [packer-plugin-azure](https://github.com/hashicorp/packer-plugin-azure)
- [packer-plugin-vsphere](https://github.com/hashicorp/packer-plugin-vsphere)
- [packer-plugin-docker](https://github.com/hashicorp/packer-plugin-docker)
- [packer-plugin-googlecompute](https://github.com/hashicorp/packer-plugin-googlecompute)

## HCP Packer

请参阅以下资源以了解 HCP Packer：

- [HCP Packer 文档](https://developer.hashicorp.com/hcp/docs/packer) 
- [HCP Packer 教程](https://developer.hashicorp.com/packer/tutorials/hcp-get-started)
- [登录 HCP 门户](https://portal.cloud.hashicorp.com)
