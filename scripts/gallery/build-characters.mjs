#!/usr/bin/env node
// 角色识别：把相册 tag（多是目录名里的罗马字/中文名）对到 Bangumi 收藏里的角色
// 输出 src/data/character-aliases.json：{ 原始 tag: 规范角色名 }
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : fallback;
};

const GALLERY = resolve(repo, opt('gallery', 'src/data/gallery.json'));
const BGM = opt('bgm', 'C:\\Users\\mei\\bgm-birthday-calendar\\public\\characters.json');
const OUT = resolve(repo, opt('out', 'src/data/character-aliases.json'));

const EXCLUDE = new Set(['仓田真白', '二叶筑紫']);

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[\s·・.,、'’"（）()\[\]【】\-_/]/g, '')
    .trim();

function romajiOf(c) {
  const out = [];
  for (const ib of c.infobox || []) {
    const key = String(ib.key || '');
    if (!/罗马字|羅馬字|romaji|拼音/i.test(key)) continue;
    if (typeof ib.value === 'string') out.push(ib.value);
    else if (Array.isArray(ib.value)) for (const it of ib.value) if (it && it.v) out.push(it.v);
  }
  // 有些条目把罗马字放在别名里，形如 {k:'罗马字', v:'Nagato Yuki'}
  for (const ib of c.infobox || []) {
    if (Array.isArray(ib.value)) {
      for (const it of ib.value) if (it && /罗马字|羅馬字|romaji/i.test(it.k || '') && it.v) out.push(it.v);
    }
  }
  return out;
}

function namesOf(c) {
  const set = new Set();
  const add = (v) => {
    if (typeof v === 'string' && v.trim()) set.add(v.trim());
  };
  add(c.name);
  add(c.name_cn);
  for (const ib of c.infobox || []) {
    if (/罗马字|羅馬字|romaji/i.test(String(ib.key || ''))) continue;
    if (typeof ib.value === 'string') add(ib.value);
    else if (Array.isArray(ib.value)) for (const it of ib.value) add(it && it.v);
  }
  return set;
}

async function main() {
  const gallery = JSON.parse((await readFile(GALLERY, 'utf8')).replace(/^\uFEFF/, ''));
  const bgm = existsSync(BGM) ? JSON.parse((await readFile(BGM, 'utf8')).replace(/^\uFEFF/, '')) : { characters: [] };

  const exact = new Map(); // normalize(name) -> character
  const romaji = new Map(); // normalize(romaji) -> [character]
  for (const c of bgm.characters || []) {
    for (const n of namesOf(c)) {
      const k = norm(n);
      if (k && !exact.has(k)) exact.set(k, c);
    }
    for (const r of romajiOf(c)) {
      const k = norm(r);
      if (!k) continue;
      if (!romaji.has(k)) romaji.set(k, []);
      romaji.get(k).push(c);
    }
  }
  // 罗马字也可能是 name_cn 的拼音式写法，这里再按「去掉空格」的原名兜底
  for (const c of bgm.characters || []) {
    for (const n of namesOf(c)) {
      const k = norm(n);
      if (!k || /[^\x00-\x7f]/.test(n)) continue;
      if (!romaji.has(k)) romaji.set(k, []);
      if (!romaji.get(k).includes(c)) romaji.get(k).push(c);
    }
  }

  const aliases = {};
  const matched = [];
  const unmatched = [];
  for (const t of gallery.tags || []) {
    const name = t.name;
    if (EXCLUDE.has(name)) continue;
    const exactHit = exact.get(norm(name));
    if (exactHit && !EXCLUDE.has(exactHit.name_cn) && !EXCLUDE.has(exactHit.name)) {
      const canonical = exactHit.name_cn || exactHit.name;
      if (canonical !== name) aliases[name] = canonical;
      matched.push({ tag: name, canonical, how: 'exact' });
      continue;
    }
    // 罗马字兜底：只处理纯 ASCII 的 tag，且必须唯一命中
    if (/^[\x00-\x7f]+$/.test(name)) {
      const hits = romaji.get(norm(name)) || [];
      const uniq = [...new Set(hits)];
      if (uniq.length === 1) {
        const canonical = uniq[0].name_cn || uniq[0].name;
        if (canonical && !EXCLUDE.has(canonical)) {
          aliases[name] = canonical;
          matched.push({ tag: name, canonical, how: 'romaji' });
          continue;
        }
      }
    }
    unmatched.push(name);
  }

  await writeFile(
    OUT,
    JSON.stringify(
      {
        note:
          '由 scripts/gallery/build-characters.mjs 生成：把相册 tag 对到 Bangumi 角色收藏（' +
          (bgm.fetched_at || '本地缓存') +
          '）。aliases 用于把目录名里的罗马字/别名统一成中文角色名。',
        source: BGM,
        aliases,
        matched,
        unmatched,
      },
      null,
      1,
    ) + '\n',
    'utf8',
  );

  console.log(
    'tags=' +
      (gallery.tags || []).length +
      ' matched=' +
      matched.length +
      ' aliases=' +
      Object.keys(aliases).length +
      ' unmatched=' +
      unmatched.length,
  );
  const rom = matched.filter((m) => m.how === 'romaji');
  if (rom.length) console.log('romaji:', rom.map((r) => r.tag + '→' + r.canonical).join(', '));
  if (unmatched.length) console.log('unmatched:', unmatched.join(', '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
