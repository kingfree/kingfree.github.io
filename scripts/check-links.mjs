import fs from 'node:fs';
import path from 'node:path';
const dist = path.join(process.cwd(), 'dist');
const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } };
walk(dist);
const missing = new Map();
const seen = new Set();
let total = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    let u = m[1];
    if (!u.startsWith('/') || u.startsWith('//')) continue;
    u = u.split('#')[0]; if (!u) continue;
    total++;
    const clean = decodeURIComponent(u.split('?')[0]);
    let target = path.join(dist, clean);
    if (!path.extname(clean)) target = path.join(dist, clean, 'index.html');
    if (!fs.existsSync(target)) {
      if (!missing.has(u)) missing.set(u, new Set());
      missing.get(u).add(path.relative(dist, f));
    }
  }
}
console.log('pages', files.length, 'internal refs', total, 'missing', missing.size);
for (const [u, from] of [...missing].slice(0, 25)) console.log('MISS', u, '<-', [...from].slice(0, 2).join(','));