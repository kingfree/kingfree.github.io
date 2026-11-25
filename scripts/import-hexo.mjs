import fs from 'node:fs';
import path from 'node:path';

const POSTS = process.env.HEXO_POSTS ?? 'C:/Users/mei/dsh/work/hexo-src/source/_posts';
const OUT = path.join(process.cwd(), 'src/content/posts');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function parseFm(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: text };
  const fm = {};
  const lines = m[1].split(/\r?\n/);
  let key = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && key) {
      if (!Array.isArray(fm[key])) fm[key] = fm[key] ? [fm[key]] : [];
      fm[key].push(listItem[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      let v = kv[2].trim();
      if (v.startsWith('[') && v.endsWith(']')) {
        fm[key] = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      } else if (v === '') {
        fm[key] = '';
      } else {
        fm[key] = v.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  for (const k of Object.keys(fm)) if (fm[k] === '') fm[k] = undefined;
  return { fm, body: text.slice(m[0].length) };
}

const files = fs.readdirSync(POSTS).filter((f) => f.endsWith('.md'));
const rows = [];
for (const f of files) {
  const raw = fs.readFileSync(path.join(POSTS, f), 'utf8');
  const { fm, body } = parseFm(raw);
  const base = f.replace(/\.md$/, '');
  const m = base.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  const dateFromName = m ? m[1] : null;
  const slug = m ? m[2] : base;
  const pad = (s) => s.replace(/^(\d{4})-(\d{1,2})-(\d{1,2})/, (_, y, m, d) => `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
  const date = pad((fm.date ? String(fm.date).slice(0, 10) : dateFromName) ?? '2008-01-01');
  const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  const tags = [...new Set([...toArr(fm.categories), ...toArr(fm.tags)])];
  const title = fm.title ?? slug;
  let md = body
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--\s*more\s*-->/g, '')
    .replace(/\r\n/g, '\n')
    .trim();
  const fmOut = [
    '---',
    'title: ' + JSON.stringify(title),
    'date: ' + date,
    'tags: ' + JSON.stringify(tags),
    fm.update ? 'updated: ' + String(fm.update).slice(0, 10) : null,
    '---',
  ].filter(Boolean).join('\n');
  // links to pages that never made it out of the old site
  md = md
    .replace(/\[([^\]]*)\]\(\/books\/xinlei_learning_method\.html\)/g, '$1')
    .replace(/\[([^\]]*)\]\(\/2016-japan-travel\)/g, '$1')
    .replace(/\[([^\]]*)\]\(https?:\/\/blog\.kingfree\.moe\/([^)]*)\)/g, '[$1](/$2)')
    .replace(/\((?:https?:\/\/blog\.kingfree\.moe)?\/\d{4}\/\d{2}\/\d{2}\/([\w-]+)\.html\)/g, '(/\$1/)');

  fs.writeFileSync(path.join(OUT, slug + '.md'), fmOut + '\n\n' + md + '\n', 'utf8');
  rows.push([slug, date, tags.join('/'), String(md.length)]);
}
rows.sort((a, b) => (a[1] < b[1] ? 1 : -1));
console.log(rows.map((r) => r.join(' | ')).join('\n'));
console.log('imported', rows.length);