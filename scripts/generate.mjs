// Generates the site.json configuration file for the Packer documentation.
// The sidebar comes from scripts/nav.json, which import-unified-docs.mjs writes from the
// upstream web-unified-docs content/packer/<version>/data/*-nav-data.json files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAV_FILE = path.join(SITE_DIR, 'scripts', 'nav.json');
const GENERATED_DIR = path.join(SITE_DIR, '.vitepress', 'generated');

// Top-level groups that start expanded.
const EXPANDED_GROUPS = new Set(['Getting Started']);

function toSidebarItems(items, depth) {
  return items.map(item => {
    if (item.items) {
      return {
        text: item.text,
        collapsed: !(depth === 0 && EXPANDED_GROUPS.has(item.text)),
        items: toSidebarItems(item.items, depth + 1),
      };
    }
    return { text: item.text, link: item.link };
  });
}

function main() {
  if (!fs.existsSync(NAV_FILE))
    throw new Error('scripts/nav.json is missing. Run "node scripts/import-unified-docs.mjs <path-to-web-unified-docs>" first.');
  const nav = JSON.parse(fs.readFileSync(NAV_FILE, 'utf8'));

  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const site = {
    locales: {
      root: {
        label: 'Packer',
        base: '/',
        sidebar: Object.fromEntries(nav.map(section => [section.base, toSidebarItems(section.items, 0)])),
      },
    },
  };

  fs.writeFileSync(path.join(GENERATED_DIR, 'site.json'), JSON.stringify(site, null, 2));
  console.log('[generate] Generated site.json');
}

main();
