# Packer 文档中文翻译规范

## 文件位置

- 英文原文：`src/<路径>.md`，**不要修改**。它由 `scripts/import-unified-docs.mjs` 从官方仓库 [hashicorp/web-unified-docs](https://github.com/hashicorp/web-unified-docs) 的 `content/packer/<版本>/` 转换生成；构建时 `scripts/sync-zh.mjs` 会把它发布到 `/en/<路径>`。
- 中文译文：`i18n/zh/<路径>.md`，与原文路径一一对应。构建时发布到站点根路径 `/<路径>`。
- 没有译文的页面会自动以英文显示并标记 `untranslated: true`。

## 翻译要求

1. 读者是中文开发者和运维工程师。译文要自然、通顺，不要逐词硬译；使用简体中文。
2. **术语**：Packer 核心术语首次出现时写成「中文（English）」，之后只用中文。例如：模板（Template）、构建（Build）、构建器（Builder）、数据源（Data Source）、配置器（Provisioner）、后处理器（Post-Processor）、通信器（Communicator）、制品（Artifact）、插件（Plugin）、块（Block）、源（Source）、变量（Variable）、局部变量（Local）、表达式（Expression）、函数（Function）、镜像（Image）、实例（Instance）。
3. 产品名、平台名、API 名称和代码标识符保持英文：Packer、HCL2、Terraform、Vagrant、Amazon EC2、Azure、Docker、`packer build`、`source`、`build` 等。
4. **不翻译**：代码块内的代码、行内代码（反引号内）、文件路径、命令、URL、HTML 标签和属性、Vue/VitePress 组件标签及属性名（如 `<Tabs>`、`<TabItem>`）。代码块中的**注释**可以翻译。
   - 代码块的整行 fence（包括 ```` ```hcl ```` 这类语言标记）保持原样。
   - `<Tabs :tabs="[...]">` 中的 `label`（如 HCL2、JSON）保持原样。
5. **保持结构**：标题层级、列表、表格、`:::` 容器（`::: info`、`::: warning`、`::: danger`、`::: tip`）、HTML 片段、空行和 frontmatter 的键名都保持原样。frontmatter 中的 `title`、`description` 等文字值要翻译。容器中常见的粗体前缀统一译为：**Note:** → **注意：**，**Warning:** → **警告：**，**Tip:** → **提示：**。
6. **链接**：链接地址保持原样（站内的 `/xxx` 链接会自动指向中文页面），只翻译链接文字。锚点链接（`#some-heading`）保持原样。
   - 标题锚点不用手动处理：`scripts/sync-zh.mjs` 构建时会按顺序把中文标题与英文标题配对，自动加上英文锚点 `{#english-slug}`。因此**译文的标题数量和顺序必须与原文完全一致**，不能合并、拆分或增删标题。原文已有的 `{#xxx}` 保持原样。
7. 中英文之间、中文与数字之间加一个空格。中文语境下使用全角标点（，。：；？！「」（）），代码和英文内容中保持半角。
8. 不要增删内容，不要添加译者注，除非原文有明显错误。
