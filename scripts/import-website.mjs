// Imports the Packer documentation from website/content (Next.js MDX) into src/,
// converting packer.io-specific MDX extensions to VitePress Markdown.
//
// Usage: node scripts/import-website.mjs [path-to-website-dir]   (default: website)
//
// - Pages keep their packer.io URL (content/docs/foo.mdx -> src/docs/foo.md -> /docs/foo),
//   so the root-relative links used inside the docs keep working.
// - The sidebar structure is written to scripts/nav.json and consumed by generate.mjs.
// - The navigation files are read as JSON; no upstream code is executed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(SITE_DIR, 'src');
const NAV_FILE = path.join(SITE_DIR, 'scripts', 'nav.json');
const UPSTREAM_SITE = 'https://www.packer.io';

// Pages in src/ that are maintained by hand and must survive a re-import.
const KEEP = new Set(['index.md']);

const WEBSITE = path.resolve(process.argv[2] ?? path.join(SITE_DIR, 'website'));
const CONTENT = path.join(WEBSITE, 'content');
const PARTIALS = path.join(CONTENT, 'partials');
const PUBLIC = path.join(WEBSITE, 'public');
const DATA = path.join(WEBSITE, 'data');
if (!fs.existsSync(CONTENT) || !fs.existsSync(DATA))
  throw new Error('Usage: node scripts/import-website.mjs [path-to-website-dir]');

// Sidebar sections: URL prefix -> navigation data file.
const SECTIONS = [
  { base: 'intro', nav: 'intro-nav-data.json', overview: 'What is Packer?' },
  { base: 'docs', nav: 'docs-nav-data.json', overview: 'Overview' },
  { base: 'guides', nav: 'guides-nav-data.json', overview: 'Overview' },
];

let warnings = 0;
function warn(message) {
  console.warn(`[import-website] ${message}`);
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

function readRedirects() {
  const file = path.join(WEBSITE, 'redirects.next.js');
  const map = new Map();
  if (!fs.existsSync(file)) return map;
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/source:\s*'([^']+)',\s*destination:\s*'([^']+)'/g)) {
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
    if (route.divider) continue;
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

const LANGUAGES = { 'shell-session': 'shellsession', hcl2: 'hcl', text: 'txt', plaintext: 'txt', golang: 'go' };
const CALLOUTS = { '->': 'info', '~>': 'warning', '!>': 'danger', '=>': 'tip' };

// Tags rendered as HTML / components. Anything else that looks like a tag outside
// code (e.g. `<wait5>` in prose) is escaped so the Vue compiler does not choke on it.
const HTML_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em',
  'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'iframe', 'img', 'ins', 'kbd', 'li',
  'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot',
  'th', 'thead', 'tr', 'u', 'ul', 'video', 'source', 'picture', 'Tabs', 'TabItem',
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

  // Plugin tier badges -> text.
  text = text.replace(/<PluginTierLabel\s+tier="(\w+)"\s*\/>/g, (_, tier) => `**${tier[0].toUpperCase()}${tier.slice(1)}**`);
  // Checklist is only a styling wrapper.
  text = text.replace(/^[ \t]*<\/?Checklist>[ \t]*$/gm, '');
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
  if (/^(https?:|mailto:|#|\.\.?\/|data:|tel:)/.test(target)) return target;
  if (!target.startsWith('/')) return target;
  const [, pathname, suffix = ''] = target.match(/^\/([^?#]*)(.*)$/);
  const clean = pathname.replace(/\.html$/, '').replace(/\/$/, '');
  if (clean === '') return `/${suffix}`;
  if (fs.existsSync(path.join(PUBLIC, clean))) return `/${clean}${suffix}`;
  if (pages.has(clean)) return `/${clean}${isFolder(clean) ? '/' : ''}${suffix}`;
  const redirect = redirects.get(`/${clean}`);
  if (redirect) return redirect.startsWith('/') && redirect !== `/${clean}` ? rewriteTarget(redirect + suffix) : redirect;
  return `${UPSTREAM_SITE}/${pathname}${suffix}`;
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
  const leftovers = text.match(/<(Tabs>|Tab\s|PluginTierLabel|Checklist)/g);
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

  // Static files referenced as /img/..., /files/... and the favicon.
  for (const name of ['img', 'files', 'favicon.ico', 'robots.txt']) {
    const from = path.join(PUBLIC, name);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(SRC_DIR, 'public', name), { recursive: true });
  }

  fs.writeFileSync(NAV_FILE, JSON.stringify(nav, null, 2) + '\n');
  console.log(`[import-website] ${pages.size} pages, ${warnings} warnings. Sidebar: scripts/nav.json`);
}

main();
