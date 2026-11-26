#!/usr/bin/env node
// 生成「选片台账」catalog.json：给本地选片工具用
// 字段：rel 相对各自 root；id 对应 public/gallery/<id>.webp 缩略图；selected 默认勾选状态
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : fallback;
};
const PICKS_DIR = opt('picks-dir', 'C:\\Users\\mei\\dsh\\work\\gallery-build');
const OUT = opt('out', join(PICKS_DIR, 'catalog.json'));
const SEL_OUT = opt('selection-out', join(PICKS_DIR, 'selection.json'));
const GALLERY = resolve(repo, 'src/data/gallery.json');

const idOf = (rel, kind) => createHash('sha1').update(kind + ':' + rel).digest('hex').slice(0, 10);
const parseTime = (s) => {
  const t = Date.parse(String(s || '').replace(' ', 'T'));
  return Number.isFinite(t) ? t : 0;
};

const gallery = JSON.parse((await readFile(GALLERY, 'utf8')).replace(/^\uFEFF/, ''));
const byId = new Map(gallery.photos.map((p) => [p.id, p]));
const tagsByRel = new Map();
const photos = [];

for (let n = 1; n <= 9; n++) {
  const p = join(PICKS_DIR, 'selection-picker-' + n + '.json');
  if (!existsSync(p)) continue;
  const data = JSON.parse((await readFile(p, 'utf8')).replace(/^\uFEFF/, ''));
  const root = data.root || 'Z:\\娃照';
  const kind = /着ぐるみ/.test(root) ? 'cos' : 'blog';
  for (const item of data.picks || []) {
    const rel = String(item.rel).replace(/\\/g, '/');
    const id = idOf(rel, kind);
    const inGallery = byId.get(id);
    if (inGallery) {
      inGallery.tags.forEach((t) => tagsByRel.set(id, t));
    }
    photos.push({
      rel,
      root,
      kind,
      album: item.album,
      datetime: item.datetime,
      ts: parseTime(item.datetime),
      reason: item.reason || '',
      detail: item.detail || '',
      width: item.width || 0,
      height: item.height || 0,
      id,
      hasThumb: Boolean(inGallery),
      full: inGallery ? inGallery.src : '',
      thumb: inGallery ? inGallery.thumb : '',
      tags: inGallery ? inGallery.tags : [],
      selected: Boolean(inGallery),
    });
  }
}

photos.sort((a, b) => b.ts - a.ts || a.rel.localeCompare(b.rel));
await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), root: 'Z:\\娃照', photos }, null, 1) + '\n', 'utf8');
await writeFile(
  SEL_OUT,
  JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      selected: photos.filter((p) => p.selected).map((p) => p.rel + '|' + p.kind),
    },
    null,
    1,
  ) + '\n',
  'utf8',
);
console.log('catalog', photos.length, 'selected', photos.filter((p) => p.selected).length, 'thumb', photos.filter((p) => p.hasThumb).length);
