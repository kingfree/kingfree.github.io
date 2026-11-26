#!/usr/bin/env node
// 生日日历数据：把相册里的角色 tag 与生日、作品对上，生成 src/data/birthdays.json
// 用法：
//   node scripts/gallery/build-birthdays.mjs \
//     --gallery src/data/gallery.json \
//     --bgm "C:\Users\mei\bgm-birthday-calendar\public\characters.json" \
//     --cos-root "Z:\着ぐるみ\角色"
// 生日优先取着ぐるみ目录名（MMDD 前缀，自己拍的设定），没有再用 Bangumi 的 birth_mon/birth_day。
import { existsSync } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
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
// 相册选片工具自己的角色库（characters.json）：给了就以它为准，不再按目录名/Bangumi 猜。
const CHARACTERS = opt('characters', '');
const COS_ROOT = opt('cos-root', 'Z:\\着ぐるみ\\角色');
const OUT = resolve(repo, opt('out', 'src/data/birthdays.json'));

/** 明确不要的角色（用户指定） */
const EXCLUDE = new Set(['仓田真白', '二叶筑紫']);

/**
 * 人工核过的生日，压过目录名前缀与 Bangumi：
 * 目录名的 MMDD 是拍摄安排的日期，个别并不是角色生日。
 * 来源：萌娘百科条目 / Bangumi 角色页，见每行注释。
 */
const BIRTHDAY_OVERRIDES = {
  // 目录 1002浮波柚叶 是拍摄日；萌娘百科与 Bangumi（柚叶 11/2）都是 11 月 2 日
  浮波柚叶: { mon: 11, day: 2 },
  // 原神：萌娘百科角色卡
  云堇: { mon: 5, day: 21 },
  莱依拉: { mon: 12, day: 19 },
  砂糖: { mon: 11, day: 26 },
  // VOCALOID / 转生王女：Bangumi 角色页
  洛天依: { mon: 7, day: 12 },
  艾妮丝菲亚: { mon: 4, day: 16 },
};

const WORK_TYPES = new Set([1, 2, 4]); // 书籍 / 动画 / 游戏

function norm(s) {
  return String(s || '')
    .replace(/\s+/g, '')
    .replace(/[·・]/g, '')
    .trim();
}

function aliasesOf(c) {
  const set = new Set();
  const add = (v) => {
    if (typeof v === 'string' && v.trim()) set.add(v.trim());
  };
  add(c.name);
  add(c.name_cn);
  for (const ib of c.infobox || []) {
    if (typeof ib.value === 'string') add(ib.value);
    else if (Array.isArray(ib.value)) for (const it of ib.value) add(it && it.v);
  }
  return set;
}

async function main() {
  const gallery = JSON.parse((await readFile(GALLERY, 'utf8')).replace(/^\uFEFF/, ''));
  const tags = gallery.tags || [];

  let charsData = { characters: [] };
  if (existsSync(BGM)) charsData = JSON.parse((await readFile(BGM, 'utf8')).replace(/^\uFEFF/, ''));

  const byName = new Map();
  for (const c of charsData.characters || []) {
    for (const a of aliasesOf(c)) {
      const k = norm(a);
      if (k && !byName.has(k)) byName.set(k, c);
    }
  }

  const cosDirs = [];
  if (existsSync(COS_ROOT)) {
    for (const d of await readdir(COS_ROOT, { withFileTypes: true })) {
      if (d.isDirectory()) cosDirs.push(d.name);
    }
  }
  const cosByName = new Map();
  for (const d of cosDirs) {
    const m = d.match(/^(\d{2})(\d{2})(.+)$/);
    if (!m) continue;
    const mon = Number(m[1]);
    const day = Number(m[2]);
    const name = m[3].trim();
    cosByName.set(name, mon >= 1 && mon <= 12 && day >= 1 && day <= 31 ? { mon, day } : null);
  }

  function worksOf(c) {
    const list = [];
    for (const s of c.subjects || []) {
      if (!WORK_TYPES.has(s.type)) continue;
      if (s.staff && s.staff !== '主角') continue;
      const title = s.name_cn || s.name;
      if (title && !list.includes(title)) list.push(title);
      if (list.length >= 2) break;
    }
    return list;
  }

  // 相册选片工具的角色库优先：生日、日文名、作品、着ぐるみ都照它写。
  const dbPath = CHARACTERS ? resolve(repo, CHARACTERS) : '';
  let database = null;
  if (dbPath && existsSync(dbPath)) {
    try {
      database = JSON.parse((await readFile(dbPath, 'utf8')).replace(/^\uFEFF/, ''));
      console.log('[birthdays] characters from ' + dbPath + ': ' + (database.characters || []).length);
    } catch (e) {
      console.warn('[birthdays] cannot read ' + dbPath + ': ' + e.message);
    }
  }
  const fromDb = new Map();
  for (const row of (database && database.characters) || []) {
    if (row && row.tag) fromDb.set(String(row.tag), row);
  }

  const characters = [];
  const unknown = [];
  const covered = new Set();
  for (const t of tags) {
    const name = t.name;
    if (EXCLUDE.has(name)) continue;
    const row = fromDb.get(name);
    if (row) {
      const mon = Number(row.mon) || 0;
      const day = Number(row.day) || 0;
      const dbEntry = {
        tag: name,
        name: row.name || name,
        nameJa: row.nameJa || '',
        mon,
        day,
        works: Array.isArray(row.works) ? row.works.map(String) : [],
        kigurumi: Boolean(row.kigurumi),
        birthdaySource: row.source || 'db',
      };
      covered.add(name);
      if (mon >= 1 && mon <= 12 && day >= 1 && day <= 31) characters.push(dbEntry);
      else unknown.push(dbEntry);
      continue;
    }
    const c = byName.get(norm(name)) || null;
    const cosBirth = cosByName.get(name) || null;
    const bgmBirth =
      c && c.birth_mon && c.birth_day && c.birth_mon >= 1 && c.birth_mon <= 12 && c.birth_day >= 1
        ? { mon: c.birth_mon, day: c.birth_day }
        : null;
    const manual = BIRTHDAY_OVERRIDES[name] || null;
    const birth = manual || cosBirth || bgmBirth;
    const entry = {
      tag: name,
      name: name,
      nameJa: (c && c.name) || '',
      mon: birth ? birth.mon : 0,
      day: birth ? birth.day : 0,
      works: c ? worksOf(c) : [],
      kigurumi: cosByName.has(name),
      birthdaySource: manual ? 'manual' : cosBirth ? 'cos' : bgmBirth ? 'bgm' : '',
    };
    if (birth) characters.push(entry);
    else unknown.push(entry);
  }

  characters.sort((a, b) => a.mon - b.mon || a.day - b.day || a.name.localeCompare(b.name, 'zh'));
  unknown.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));

  await writeFile(
    OUT,
    JSON.stringify(
      {
        note: database
          ? '由 scripts/gallery/build-birthdays.mjs 生成：角色、生日、日文名、作品、着ぐるみ以相册选片工具的角色库（--characters ' +
            dbPath +
            '）为准；角色库里没有的 tag 才退回人工核过的 BIRTHDAY_OVERRIDES、着ぐるみ目录名的 MMDD 前缀与 Bangumi 数据。'
          : '由 scripts/gallery/build-birthdays.mjs 生成：生日先取脚本里人工核过的 BIRTHDAY_OVERRIDES（萌娘百科 / Bangumi），其次 Z:\\着ぐるみ\\角色 目录名的 MMDD 前缀，最后 Bangumi 角色数据；作品取 Bangumi 关联作品的主角作。',
        characters,
        unknown,
        excluded: [...EXCLUDE],
      },
      null,
      1,
    ) + '\n',
    'utf8',
  );

  console.log(
    'characters=' +
      characters.length +
      ' unknown=' +
      unknown.length +
      ' kigurumi=' +
      characters.filter((c) => c.kigurumi).length,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
