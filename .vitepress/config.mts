import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type DefaultTheme, type LocaleConfig } from 'vitepress';

type GeneratedLocale = {
  label: string;
  base: string;
  sidebar: DefaultTheme.SidebarMulti;
};

const siteFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'generated', 'site.json');
if (!fs.existsSync(siteFile))
  throw new Error('Run "node scripts/generate.mjs" first. The file .vitepress/generated/site.json is missing.');
const site: { locales: Record<string, GeneratedLocale> } = JSON.parse(fs.readFileSync(siteFile, 'utf8'));
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const englishSrcDir = path.join(rootDir, 'src');

const EN_PREFIX = '/en';

const zhSidebarText: Record<string, string> = {
  'What is Packer?': '什么是 Packer？',
  'Commands (CLI)': '命令（CLI）',
  'Templates': '模板',
  'HCL Templates': 'HCL 模板',
  'Blocks': '块',
  'Functions': '函数',
  'Contextual Functions': '上下文函数',
  'Numeric Functions': '数值函数',
  'String Functions': '字符串函数',
  'Collection Functions': '集合函数',
  'Encoding Functions': '编码函数',
  'Filesystem Functions': '文件系统函数',
  'Date and Time Functions': '日期和时间函数',
  'Hash and Crypto Functions': '哈希和加密函数',
  'UUID Functions': 'UUID 函数',
  'IP Network Functions': 'IP 网络函数',
  'Type Conversion Functions': '类型转换函数',
  'JSON Templates': 'JSON 模板',
  'Communicators': '通信器',
  'Builders': '构建器',
  'Data sources reference': '数据源参考',
  'HCP Packer': 'HCP Packer',
  'Provisioners': '配置器',
  'Post-Processors': '后处理器',
  'Release notes': '发行说明',
  'Upgrades': '升级',
  'Plugins': '插件',
  'Developing Plugins': '开发插件',
  'HCL guides': 'HCL 指南',
  'Automatic OS Installs': '自动安装操作系统',
  'Build Immutable Infrastructure with Packer in CI/CD': '在 CI/CD 中使用 Packer 构建不可变基础设施',
};

function enLink(link: string) {
  return link.startsWith('/') ? EN_PREFIX + link : link;
}

function mapSidebar(
  sidebar: DefaultTheme.SidebarMulti,
  mapLink: (link: string) => string,
  mapGroupText: (text: string) => string,
): DefaultTheme.SidebarMulti {
  const mapItems = (items: DefaultTheme.SidebarItem[]): DefaultTheme.SidebarItem[] => items.map(item => ({
    ...item,
    ...(item.items ? { text: mapGroupText(item.text ?? ''), items: mapItems(item.items) } : {}),
    ...(item.link ? { link: mapLink(item.link) } : {}),
  }));
  return Object.fromEntries(Object.entries(sidebar).map(([key, value]) => [
    mapLink(key),
    Array.isArray(value) ? mapItems(value) : { ...value, base: mapLink(value.base), items: mapItems(value.items) },
  ]));
}

const zhThemeText: DefaultTheme.Config = {
  outline: { level: [2, 3], label: '本页目录' },
  docFooter: { prev: '上一页', next: '下一页' },
  darkModeSwitchLabel: '外观',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',
  sidebarMenuLabel: '菜单',
  returnToTopLabel: '回到顶部',
  langMenuLabel: '切换语言',
  skipToContentLabel: '跳到正文',
  notFound: {
    title: '页面未找到',
    quote: '你要找的页面不存在，或者已经被移动。',
    linkLabel: '返回首页',
    linkText: '返回首页',
  },
  footer: {
    message: '基于 MPL-2.0 许可证发布。',
    copyright: 'Copyright © HashiCorp',
  },
};

const zhSearchText = {
  button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
  modal: {
    displayDetails: '显示详细列表',
    resetButtonTitle: '清除查询',
    backButtonTitle: '关闭搜索',
    noResultsText: '没有找到结果',
    footer: {
      selectText: '选择',
      selectKeyAriaLabel: '回车',
      navigateText: '切换',
      navigateUpKeyAriaLabel: '向上',
      navigateDownKeyAriaLabel: '向下',
      closeText: '关闭',
      closeKeyAriaLabel: 'Esc',
    },
  },
};

const zhLocales: LocaleConfig<DefaultTheme.Config> = {};
const enLocales: LocaleConfig<DefaultTheme.Config> = {};

for (const [key, locale] of Object.entries(site.locales)) {
  zhLocales[key] = {
    label: `简体中文`,
    lang: 'zh-CN',
    link: locale.base,
    title: 'Packer',
    description: `Packer 中文文档`,
    themeConfig: {
      ...zhThemeText,
      nav: [
        { text: '简介', link: `${locale.base}docs/intro/`, activeMatch: `^${locale.base}docs/intro/` },
        { text: '文档', link: `${locale.base}docs/`, activeMatch: `^${locale.base}docs/(?!intro/)` },
        { text: '指南', link: `${locale.base}guides/`, activeMatch: `^${locale.base}guides/` },
        { text: '插件', link: `${locale.base}plugins/`, activeMatch: `^${locale.base}(plugins/|community-plugins)` },
      ],
      sidebar: mapSidebar(locale.sidebar, link => link, text => zhSidebarText[text] ?? text),
    },
  };

  const enBase = enLink(locale.base);
  enLocales[key === 'root' ? 'en' : `en/${key}`] = {
    label: `English`,
    lang: 'en-US',
    link: enBase,
    title: 'Packer',
    description: `Packer documentation`,
    themeConfig: {
      nav: [
        { text: 'Intro', link: `${enBase}docs/intro/`, activeMatch: `^${enBase}docs/intro/` },
        { text: 'Docs', link: `${enBase}docs/`, activeMatch: `^${enBase}docs/(?!intro/)` },
        { text: 'Guides', link: `${enBase}guides/`, activeMatch: `^${enBase}guides/` },
        { text: 'Plugins', link: `${enBase}plugins/`, activeMatch: `^${enBase}(plugins/|community-plugins)` },
      ],
      sidebar: mapSidebar(locale.sidebar, enLink, text => text),
    },
  };
}

const locales: LocaleConfig<DefaultTheme.Config> = { ...zhLocales };
for (const key of Object.keys(enLocales).sort((a, b) => b.length - a.length))
  locales[key] = enLocales[key];

function listPages(dir: string, rel = ''): string[] {
  if (!fs.existsSync(dir))
    return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const entryRel = rel + entry.name;
    if (entry.isDirectory()) {
      if (!rel && (['zh', 'en', 'public'].includes(entry.name) || site.locales[entry.name]))
        return [];
      return listPages(path.join(dir, entry.name), `${entryRel}/`);
    }
    return entry.name.endsWith('.md') ? [entryRel] : [];
  });
}

const pagesByLanguage = Object.fromEntries(Object.keys(site.locales).map(key => [
  key,
  listPages(key === 'root' ? englishSrcDir : path.join(englishSrcDir, key)),
]));

export default defineConfig({
  srcDir: 'site',
  lang: 'zh-CN',
  title: 'Packer',
  description: 'Packer 中文文档',
  cleanUrls: true,
  lastUpdated: false,
  ignoreDeadLinks: true,
  locales,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/img/favicons/favicon-32x32.png' }],
  ],
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    config: md => {
      const defaultCodeInline = md.renderer.rules.code_inline!;
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) =>
        defaultCodeInline(tokens, idx, options, env, self).replace(/^<code/, '<code v-pre');
      // Indented code blocks are common in the Packer docs and often contain Go
      // template syntax ({{ ... }}); keep Vue from compiling them.
      const defaultCodeBlock = md.renderer.rules.code_block!;
      md.renderer.rules.code_block = (tokens, idx, options, env, self) =>
        defaultCodeBlock(tokens, idx, options, env, self).replace(/^<pre/, '<pre v-pre');
      const defaultText = md.renderer.rules.text!;
      md.renderer.rules.text = (tokens, idx, options, env, self) =>
        defaultText(tokens, idx, options, env, self).replace(/\{\{/g, '&#123;&#123;').replace(/\}\}/g, '&#125;&#125;');
    },
  },
  themeConfig: {
    logo: '/img/logo-packer-padded.svg',
    search: {
      provider: 'local',
      options: {
        locales: Object.fromEntries(Object.keys(zhLocales).map(key => [key, { translations: zhSearchText }])),
      },
    },
    outline: { level: [2, 3] },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hashicorp/packer' },
    ],
    editLink: undefined,
    footer: {
      message: 'Released under the MPL-2.0 License.',
      copyright: 'Copyright © HashiCorp',
    },
    languageSwitcher: {
      enPrefix: EN_PREFIX,
      pages: pagesByLanguage,
    },
  } as DefaultTheme.Config,
  vite: {
    build: { chunkSizeWarningLimit: 4096 },
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBarTranslations\.vue$/,
          replacement: fileURLToPath(new URL('./theme/components/NavBarLanguageSwitcher.vue', import.meta.url)),
        },
        {
          find: /^.*\/VPNavScreenTranslations\.vue$/,
          replacement: fileURLToPath(new URL('./theme/components/NavScreenLanguageSwitcher.vue', import.meta.url)),
        },
      ],
    },
  },
});
