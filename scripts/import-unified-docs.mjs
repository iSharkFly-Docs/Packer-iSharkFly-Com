// Imports the Packer documentation from a checkout of hashicorp/web-unified-docs
// (the source of developer.hashicorp.com/packer) into src/, converting the
// HashiCorp-specific MDX extensions to VitePress Markdown.
//
// Usage: node scripts/import-unified-docs.mjs <path-to-web-unified-docs> [version]
//   e.g. node scripts/import-unified-docs.mjs ../web-unified-docs          (latest version)
//        node scripts/import-unified-docs.mjs ../web-unified-docs v1.16.x
//
// A sparse checkout is enough:
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/hashicorp/web-unified-docs.git
//   git -C web-unified-docs sparse-checkout set content/packer
//
// - Pages keep their upstream URL without the /packer prefix
//   (content/docs/foo.mdx -> src/docs/foo.md -> /docs/foo).
// - The sidebar structure is written to scripts/nav.json and consumed by generate.mjs.
// - The navigation files are read as JSON; no upstream code is executed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(SITE_DIR, 'src');
const NAV_FILE = path.join(SITE_DIR, 'scripts', 'nav.json');
const UPSTREAM_SITE = 'https://developer.hashicorp.com';
const PRODUCT = 'packer';

// Pages in src/ that are maintained by hand and must survive a re-import.
const KEEP = new Set(['index.md']);

const USAGE = 'Usage: node scripts/import-unified-docs.mjs <path-to-web-unified-docs> [version]';
const repoRoot = process.argv[2] && path.resolve(process.argv[2]);
const productDir = repoRoot && path.join(repoRoot, 'content', PRODUCT);
if (!productDir || !fs.existsSync(productDir))
  throw new Error(USAGE);

function versionKey(name) {
  return (name.match(/\d+/g) ?? []).map(Number);
}
const VERSION = process.argv[3] ?? fs.readdirSync(productDir)
  .filter(name => /^v\d+\.\d+\.x$/.test(name))
  .sort((a, b) => {
    const [x, y] = [versionKey(a), versionKey(b)];
    return x[0] - y[0] || x[1] - y[1];
  })
  .pop();
const UPSTREAM = path.join(productDir, VERSION ?? '');
const CONTENT = path.join(UPSTREAM, 'content');
const PARTIALS = path.join(CONTENT, 'partials');
const IMG = path.join(UPSTREAM, 'img');
const DATA = path.join(UPSTREAM, 'data');
if (!VERSION || !fs.existsSync(CONTENT) || !fs.existsSync(DATA))
  throw new Error(`${USAGE}\nNo Packer docs found in ${UPSTREAM}`);

// Sidebar sections: URL prefix -> navigation data file.
const SECTIONS = [
  { base: 'docs', nav: 'docs-nav-data.json', overview: 'Overview' },
  { base: 'guides', nav: 'guides-nav-data.json', overview: 'Overview' },
  { base: 'plugins', nav: 'plugins-nav-data.json', overview: 'Overview' },
];

let warnings = 0;
function warn(message) {
  console.warn(`[import-unified-docs] ${message}`);
  warnings++;
}

function listDir(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
}

// ---------------------------------------------------------------------------
// Page collection
// ---------------------------------------------------------------------------

const pages = new Map(); // url path (no leading slash, '' for a section index) -> source file

function collectPages(dir, rel = '') {
  for (const entry of listDir(dir)) {
    const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entryRel !== 'partials') collectPages(path.join(dir, entry.name), entryRel);
    } else if (entry.name.endsWith('.mdx')) {
      const url = entryRel.replace(/\.mdx$/, '').replace(/(^|\/)index$/, '');
      pages.set(url, path.join(dir, entry.name));
    }
  }
}

// Section indexes ('docs/builders' from content/docs/builders/index.mdx) are folders.
function isFolder(url) {
  const file = pages.get(url);
  return !!file && path.basename(file) === 'index.mdx';
}

function pageFile(url) {
  if (url === '') return 'index.md';
  return isFolder(url) ? `${url}/index.md` : `${url}.md`;
}

// ---------------------------------------------------------------------------
// Redirects (exact sources only) so links to moved pages still resolve
// ---------------------------------------------------------------------------

// redirects.jsonc: sources and destinations are /packer/... paths.
function readRedirects() {
  const file = path.join(UPSTREAM, 'redirects.jsonc');
  const map = new Map();
  if (!fs.existsSync(file)) return map;
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/"source":\s*"([^"]+)",\s*"destination":\s*"([^"]+)"/g)) {
    if (!/[:*(]/.test(m[1])) map.set(m[1].replace(/\/$/, ''), m[2]);
  }
  return map;
}
const redirects = readRedirects();

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function toNavItems(routes, base) {
  const items = [];
  for (const route of routes) {
    if (route.divider || route.heading || route.hidden) continue;
    if (route.routes) {
      const children = toNavItems(route.routes, base);
      if (children.length) items.push({ text: route.title, items: children });
      continue;
    }
    if (route.href) {
      items.push({ text: route.title, link: rewriteTarget(route.href) });
      continue;
    }
    if (route.path === undefined) continue;
    const url = `${base}/${route.path}`.replace(/\/$/, '');
    if (!pages.has(url)) {
      warn(`navigation entry without a page: ${route.title} (${url})`);
      continue;
    }
    items.push({ text: route.title, link: `/${url}${isFolder(url) ? '/' : ''}` });
  }
  return items;
}

function collectNav() {
  return SECTIONS.map(section => {
    const routes = JSON.parse(fs.readFileSync(path.join(DATA, section.nav), 'utf8'));
    const items = toNavItems(routes, section.base);
    if (pages.has(section.base)) items.unshift({ text: section.overview, link: `/${section.base}/` });
    return { base: `/${section.base}/`, items };
  });
}

// ---------------------------------------------------------------------------
// Markdown conversion
// ---------------------------------------------------------------------------

const LANGUAGES = {
  'shell-session': 'shellsession', hcl2: 'hcl', text: 'txt', plaintext: 'txt', golang: 'go', command: 'shell',
};

// <PluginBadge type="..."> -> VitePress <Badge>.
const PLUGIN_BADGES = {
  official: ['tip', 'Official'],
  verified: ['info', 'Verified'],
  community: ['info', 'Community'],
  archived: ['warning', 'Archived'],
  hcp_packer_ready: ['tip', 'HCP Packer Ready'],
};
function pluginBadge(type) {
  const [kind, text] = PLUGIN_BADGES[type] ?? ['info', type];
  return `<Badge type="${kind}" text="${text}" />`;
}
const CALLOUTS = { '->': 'info', '~>': 'warning', '!>': 'danger', '=>': 'tip' };

// Tags rendered as HTML / components. Anything else that looks like a tag outside
// code (e.g. `<wait5>` in prose) is escaped so the Vue compiler does not choke on it.
const HTML_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em',
  'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'iframe', 'img', 'ins', 'kbd', 'li',
  'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot',
  'th', 'thead', 'tr', 'u', 'ul', 'video', 'source', 'picture', 'Tabs', 'TabItem', 'Badge',
]);

const FENCE = /^(\s*)(`{3,}|~{3,})(.*)$/;

// Calls fn(line, index, inFence) for each line and joins the results.
function mapLines(text, fn) {
  let marker = null;
  return text.split('\n').map((line, i) => {
    const f = line.match(FENCE);
    if (f) {
      if (!marker) { marker = f[2]; return fn(line, i, 'open', f); }
      if (f[2].startsWith(marker) && !f[3].trim()) { marker = null; return fn(line, i, 'close', f); }
    }
    return fn(line, i, marker ? 'code' : null, f);
  }).join('\n');
}

function resolveIncludes(text, page, stack = []) {
  return mapLines(text, (line, _, inFence) => {
    if (inFence) return line;
    // Both `@include 'x.mdx'` and @include 'x.mdx' are used upstream.
    const m = line.match(/^(\s*)`?@include\s+['"]([^'"]+)['"]`?\s*$/);
    if (!m) return line;
    const file = path.join(PARTIALS, m[2]);
    if (!fs.existsSync(file)) {
      warn(`${page}: missing partial ${m[2]}`);
      return '';
    }
    if (stack.includes(file)) {
      warn(`${page}: recursive partial ${m[2]}`);
      return '';
    }
    const body = resolveIncludes(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'), page, [...stack, file])
      .replace(/^\s*<!--[\s\S]*?-->\s*\n/, '') // generated-file banner
      .replace(/\s+$/, '');
    return body.split('\n').map(l => (l ? m[1] + l : l)).join('\n');
  });
}

function convertFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return text;
  const lines = m[1].split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const key = lines[i].match(/^([\w-]+):/)?.[1];
    // Generated metadata block: "# START AUTO GENERATED METADATA", created_at, last_modified.
    if (/^#\s*(START|END) AUTO GENERATED METADATA/.test(lines[i]) || key === 'created_at' || key === 'last_modified')
      continue;
    if (key === 'sidebar_title') {
      while (i + 1 < lines.length && /^\s/.test(lines[i + 1])) i++;
      continue;
    }
    out.push(key === 'page_title' ? lines[i].replace(/^page_title:/, 'title:') : lines[i]);
  }
  return `---\n${out.join('\n')}\n---\n${text.slice(m[0].length)}`;
}

function attrs(source) {
  const out = {};
  for (const m of source.matchAll(/([\w-]+)(?:\s*=\s*"([^"]*)"|\s*=\s*'([^']*)')?/g))
    out[m[1]] = m[2] ?? m[3] ?? true;
  return out;
}

function dedent(text) {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(Number.isFinite(indent) ? indent : 0)).join('\n');
}

function jsString(value) {
  return String(value).trim().replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/"/g, '&quot;');
}

function convertBlocks(text) {
  // <Tabs><Tab heading="..."> -> theme Tabs/TabItem components.
  text = text.replace(/^([ \t]*)<Tabs>([\s\S]*?)^[ \t]*<\/Tabs>/gm, (_, indent, inner) => {
    const tabs = [...inner.matchAll(/<Tab\b([^>]*)>([\s\S]*?)<\/Tab>/g)];
    const labels = tabs.map((t, i) => String(attrs(t[1]).heading ?? `Tab ${i + 1}`).trim());
    const list = labels.map((label, i) => `{label:'${jsString(label)}',value:'t${i}'}`);
    // Tab groups with the same labels (mostly HCL2 / JSON) share the selected tab.
    const group = labels.length > 1 && labels.every(l => /^(HCL2|JSON)$/.test(l)) ? ' groupId="template-format"' : '';
    const items = tabs.map((t, i) => `<TabItem value="t${i}">\n\n${dedent(t[2])}\n\n</TabItem>`);
    const block = `<Tabs${group} :tabs="[${list.join(',')}]">\n\n${items.join('\n\n')}\n\n</Tabs>`;
    return block.split('\n').map(l => (l ? indent + l : l)).join('\n');
  });

  // Plugin tier badges.
  text = text.replace(/<PluginBadge\s+type="(\w+)"\s*\/>/g, (_, type) => pluginBadge(type));
  text = text.replace(/<PluginTierLabel\s+tier="(\w+)"\s*\/>/g, (_, type) => pluginBadge(type));
  // <BadgesHeader> holds the badges shown above the title: keep them on one line.
  text = text.replace(/^[ \t]*<BadgesHeader>([\s\S]*?)<\/BadgesHeader>/gm,
    (_, inner) => inner.trim().split(/\s*\n\s*/).join(' '));
  // <Note> -> info container.
  text = text.replace(/^([ \t]*)<Note>([\s\S]*?)^[ \t]*<\/Note>/gm,
    (_, indent, inner) => `${indent}::: info\n${dedent(inner)}\n${indent}:::`);
  // Styling-only wrappers.
  text = text.replace(/^[ \t]*<\/?(Checklist|ImageConfig)\b[^>]*>[ \t]*$/gm, '');
  // JSX style objects -> CSS: style={{ textAlign: 'center' }} -> style="text-align: center".
  text = text.replace(/\bstyle=\{\{([^}]*)\}\}/g, (_, body) => {
    const css = [...body.matchAll(/(\w+)\s*:\s*(?:'([^']*)'|"([^"]*)"|([\w.%-]+))/g)]
      .map(m => `${m[1].replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}: ${m[2] ?? m[3] ?? m[4]}`);
    return `style="${css.join('; ')}"`;
  });
  text = text.replace(/\bclassName=/g, 'class=');
  return text;
}

function convertLines(text) {
  const out = [];
  const lines = text.split('\n');
  let marker = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const f = line.match(FENCE);
    if (f) {
      if (!marker) {
        marker = f[2];
        const info = f[3].trim().match(/^([\w+/-]*)(.*)$/);
        const lang = info[1].replace(/^\/bin\//, '').toLowerCase();
        out.push(`${f[1]}${f[2]}${LANGUAGES[lang] ?? lang}${info[2]}`);
      } else {
        if (f[2].startsWith(marker) && !f[3].trim()) marker = null;
        out.push(line);
      }
      continue;
    }
    if (marker) { out.push(line); continue; }

    // Callout paragraphs: "-> text", "~> text", "!> text", "=> text".
    const c = line.match(/^(\s*)(->|~>|!>|=>)\s?(.*)$/);
    if (c) {
      const body = [c[3]];
      while (i + 1 < lines.length && lines[i + 1].trim() && !FENCE.test(lines[i + 1]))
        body.push(lines[++i].slice(c[1].length));
      out.push(`${c[1]}::: ${CALLOUTS[c[2]]}`, ...body.map(l => (l ? c[1] + l : l)), `${c[1]}:::`);
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

function rewriteTarget(target) {
  // Absolute links to pages that exist locally become site links.
  const absolute = target.match(/^https:\/\/(?:developer\.hashicorp\.com|www\.packer\.io)(\/.*)$/);
  if (absolute) {
    const local = rewriteTarget(absolute[1].startsWith(`/${PRODUCT}/`) ? absolute[1] : `/${PRODUCT}${absolute[1]}`);
    return local.startsWith('/') ? local : target;
  }
  if (/^(https?:|mailto:|#|\.\.?\/|data:|tel:)/.test(target)) return target;
  if (!target.startsWith('/')) return target;
  const [, pathname, suffix = ''] = target.match(/^\/([^?#]*)(.*)$/);
  let clean = pathname.replace(/\.html$/, '').replace(/\/$/, '');
  if (clean.startsWith('img/') && fs.existsSync(path.join(IMG, clean.slice(4)))) return `/${clean}${suffix}`;
  // Site links are /packer/...; a few older ones omit the product prefix.
  if (clean === PRODUCT || clean.startsWith(`${PRODUCT}/`)) clean = clean.slice(PRODUCT.length + 1);
  else if (!/^(docs|guides|plugins)(\/|$)/.test(clean)) return `${UPSTREAM_SITE}/${pathname}${suffix}`; // other products
  if (clean === '') return `/${suffix}`;
  if (pages.has(clean)) return `/${clean}${isFolder(clean) ? '/' : ''}${suffix}`;
  const redirect = redirects.get(`/${PRODUCT}/${clean}`);
  if (redirect && redirect !== `/${PRODUCT}/${clean}`)
    return redirect.startsWith('/') ? rewriteTarget(redirect + suffix) : redirect;
  return `${UPSTREAM_SITE}/${PRODUCT}/${clean}${suffix}`;
}

function rewriteProse(part) {
  return part
    .replace(/<(\/?)([A-Za-z][\w.-]*)([^<>]*)>/g, (tag, slash, name, rest) => {
      if (HTML_TAGS.has(name) || /^(https?|mailto):/.test(name + rest)) return tag;
      if (!slash && name.includes('@')) return tag; // <user@example.com> autolink
      return `&lt;${slash}${name}${rest}&gt;`;
    })
    .replace(/(\]\()(<?)([^)\s>]+)(>?)/g, (_, pre, lt, target, gt) => `${pre}${lt}${rewriteTarget(target)}${gt}`)
    .replace(/^(\s*\[[^\]]+\]:\s*)(\S+)/gm, (_, pre, target) => pre + rewriteTarget(target))
    .replace(/\b(href|src)="([^"]+)"/g, (_, attr, target) => `${attr}="${rewriteTarget(target)}"`);
}

function rewriteLinks(text) {
  const m = text.match(/^---\n[\s\S]*?\n---\n/);
  const frontmatter = m ? m[0] : '';
  const body = text.slice(frontmatter.length);
  // Split off fenced code blocks, then inline code spans.
  const parts = body.split(/(^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\2[ \t]*$)/m);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 2) continue; // captured fence marker
    if (i % 3 === 1) { out.push(parts[i]); continue; }
    out.push(parts[i].split(/(`+[^`\n]*?`+)/).map((p, j) => (j % 2 ? p : rewriteProse(p))).join(''));
  }
  return frontmatter + out.join('');
}

function convertPage(text, page) {
  text = text.replace(/\r\n/g, '\n');
  text = resolveIncludes(text, page);
  text = convertFrontmatter(text);
  text = convertBlocks(text);
  text = convertLines(text);
  text = rewriteLinks(text);
  const leftovers = text.match(/<(Tabs>|Tab\s|PluginTierLabel|PluginBadge|BadgesHeader|Note>|Checklist|ImageConfig)/g);
  if (leftovers) warn(`${page}: unconverted ${[...new Set(leftovers.map(s => s.trim()))].join(', ')}`);
  return text;
}

// ---------------------------------------------------------------------------

function clearSrc(dir, rel = '') {
  for (const entry of listDir(dir)) {
    const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entryRel === 'public') { fs.rmSync(full, { recursive: true, force: true }); continue; }
      clearSrc(full, entryRel);
      if (!fs.readdirSync(full).length) fs.rmdirSync(full);
    } else if (entry.name.endsWith('.md') && !KEEP.has(entryRel)) {
      fs.rmSync(full);
    }
  }
}

function main() {
  collectPages(CONTENT);
  const nav = collectNav();

  fs.mkdirSync(SRC_DIR, { recursive: true });
  clearSrc(SRC_DIR);
  for (const [url, file] of pages) {
    const rel = pageFile(url);
    if (KEEP.has(rel)) continue;
    const out = path.join(SRC_DIR, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, convertPage(fs.readFileSync(file, 'utf8'), url || 'index'));
  }

  // Images referenced as /img/...
  if (fs.existsSync(IMG)) fs.cpSync(IMG, path.join(SRC_DIR, 'public', 'img'), { recursive: true });

  fs.writeFileSync(NAV_FILE, JSON.stringify(nav, null, 2) + '\n');
  console.log(`[import-unified-docs] ${VERSION}: ${pages.size} pages, ${warnings} warnings. Sidebar: scripts/nav.json`);
}

main();
