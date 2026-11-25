import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const dir = 'src/content/posts';
let fixed = 0;
for (const f of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
  const p = dir + '/' + f;
  const text = readFileSync(p, 'utf8');
  if (!text.includes('note.com/takkun_0')) continue;
  const next = text.replace(/(https:\/\/note\.com\/takkun_0\/n\/[A-Za-z0-9]+)"\)/g, '$1)');
  if (next !== text) { writeFileSync(p, next, 'utf8'); fixed += 1; console.log('fixed ' + f); }
}
console.log('files fixed=' + fixed);