import { computed } from 'vue';
import { useData } from 'vitepress';

type SwitcherConfig = {
  enPrefix: string;
  pages: Record<string, string[]>;
};

export type SwitcherLink = { text: string; link: string; lang?: string; active: boolean };

const READING_LANGUAGES = [
  { key: 'zh', text: '简体中文', lang: 'zh-CN' },
  { key: 'en', text: 'English', lang: 'en-US' },
] as const;

function pageUrl(base: string, page: string) {
  return base + page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '');
}

export function useLanguageSwitcher() {
  const { page, theme, hash } = useData();
  const config = computed(() => theme.value.languageSwitcher as SwitcherConfig);

  const current = computed(() => {
    let rest = page.value.relativePath;
    const enDir = config.value.enPrefix.replace(/^\//, '') + '/';
    const reading = rest.startsWith(enDir) ? 'en' : 'zh';
    if (reading === 'en')
      rest = rest.slice(enDir.length);
    return { reading, page: rest };
  });

  function linkFor(reading: string, keepHash: boolean) {
    const base = reading === 'en' ? config.value.enPrefix + '/' : '/';
    const pages = config.value.pages['root'] ?? [];
    if (!pages.includes(current.value.page))
      return base;
    return pageUrl(base, current.value.page) + (keepHash ? hash.value : '');
  }

  const isZh = computed(() => current.value.reading === 'zh');

  const readingLanguages = computed<SwitcherLink[]>(() => READING_LANGUAGES.map(reading => ({
    text: reading.text,
    lang: reading.lang,
    link: linkFor(reading.key, true),
    active: reading.key === current.value.reading,
  })));

  const labels = computed(() => isZh.value
    ? { menu: '切换语言', reading: '阅读语言' }
    : { menu: 'Change language', reading: 'Language' });

  const currentLabel = computed(() =>
    READING_LANGUAGES.find(reading => reading.key === current.value.reading)!.text);

  return { readingLanguages, labels, currentLabel, isZh };
}
