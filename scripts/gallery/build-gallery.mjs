#!/usr/bin/env node
// 相册构建：挑选结果 -> 压缩图（WebP）+ src/data/gallery.json
// 用法：
//   node scripts/gallery/build-gallery.mjs --picks "selection-picker-*.json"
//   node scripts/gallery/build-gallery.mjs --picks ... --data-only
// 说明：
//   - 每个 picks 文件自带 root（照片库根目录），rel 相对该 root。
//   - 只输出压缩后的 WebP，源图不复制、不修改。
//   - sharp 默认剔除全部元数据（EXIF/GPS/XMP/IPTC），这里也不调用 withMetadata。
//   - 生成源清单 src/data/gallery-sources.json，供审阅与重建。
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, stat, open } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const args = process.argv.slice(2);
const has = (name) => args.includes('--' + name);
const opt = (name, fallback) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : fallback;
};
const DEFAULT_ROOT = opt('root', 'Z:\\娃照');
const OUT_DIR = join(repo, 'public/gallery');
const DATA_OUT = join(repo, 'src/data/gallery.json');
const MANIFEST = join(repo, 'src/data/gallery-sources.json');
const CONCURRENCY = Number(opt('concurrency', '4'));
const LONG_EDGE = Number(opt('long-edge', '1600'));
const THUMB_EDGE = Number(opt('thumb-edge', '720'));
const DATA_ONLY = has('data-only');
const RESUME = has('resume');

/** 角色别名：目录名里的小写罗马字 -> 中文名（与中文目录合并成同一个 tag） */
const ALIASES = {
  yume: '虹野梦',
  mashiro: '仓田真白',
  sucrose: '砂糖',
  yunjin: '云堇',
  marin: '海梦',
  anon: '千早爱音',
  soyo: '长崎素世',
  kita: '喜多郁代',
  ichigo: '星宫莓',
  akari: '大空明',
  lala: '真中啦啦',
  akira: '砂冢明',
  kanon: '中川花音',
  ruby: '黑泽露比',
  nico: '矢泽妮可',
  gabu: '珈百璃',
  mona: '莫娜',
  amber: '安柏',
  nijigasaki: '虹咲学园',
  umamusu: '赛马娘',
  newjersey: '新泽西',
  ai: '宫下爱',
  akimiho: '砂冢明',
  akiras: '砂冢明',
  anisphia: '艾妮丝菲亚',
  chiori: '三上千织',
  hanami: '花海咲季',
  juju: '乾纱寿叶',
  layla: '莱伊拉',
  mikan: '阳夏木蜜柑',
  miko: '伊井野弥子',
  rino: '衣之咲璃乃',
  sagiri: '和泉纱雾',
};

/** 不进 tag 的词：格式词、拍摄者标记、无意义碎片 */
const STOPWORDS = new Set([
  'raw',
  'jpg',
  'jpeg',
  'png',
  'web',
  'by',
  'from',
  'the',
  'and',
  'm',
  's',
  'mf',
  'fuji',
  'sony',
  'canon',
  'nikon',
  '合',
  '图',
  '小图',
  '原图',
  '副本',
  'edit',
  'edited',
  'final',
  'ok',
  'out',
  'ps',
  'lr',
  'h',
  'hdr',
  '发布',
  '发布图',
  '模特图',
  '返图',
  '收到的返图',
  '返图给别人的',
  '娃照',
  '精选',
  '成片',
  '精修',
  '24h',
  'w',
  'dsc',
  'img',
  'pic',
  'photo',
  'copy',
  'zip',
  '7z',
  'rar',
  'jpeg',
]);

/** 由 build-characters.mjs 生成的「相册 tag → Bangumi 角色」映射（可选） */
const ALIAS_FILE = join(repo, 'src/data/character-aliases.json');
const EXTRA_ALIASES = (() => {
  try {
    const raw = existsSync(ALIAS_FILE) ? JSON.parse(readFileSync(ALIAS_FILE, 'utf8')) : null;
    const out = {};
    for (const [k, v] of Object.entries(raw?.aliases || {})) out[String(k).toLowerCase()] = v;
    return out;
  } catch {
    return {};
  }
})();

/** Bangumi 里的长名/别名统一成常用名 */
const CANON = {
  莱依拉: '莱伊拉',
  卯香菱: '香菱',
  矢泽日香: '矢泽妮可',
  阿斯托洛吉斯·莫娜·梅姬斯图斯: '莫娜',
  鹿目圆: '鹿目圆香',
};

/** 这次明确不要的角色 */
const EXCLUDE = new Set(['仓田真白', '二叶筑紫']);

/** 目录名里不是角色的词：城市、场次、拍摄者、系列名、无意义碎片 */
const NONCHAR = new Set([
  '展会',
  '虹之咲无影墙',
  '虹团jpg',
  '大豫金象偶活',
  '原点',
  '合照',
  '品红',
  '上海安缦',
  '广州萤火虫',
  '徐州',
  '成都',
  '长沙',
  '上海',
  '广州',
  '郑州',
  '北京',
  '深圳',
  '杭州',
  '武汉',
  '西安',
  '苏州',
  '南京',
  '重庆',
  '天津',
  '千叶',
  'h君',
  'mei',
  'yao',
  'simon',
  '莓莓simon',
  '莓莓',
  'qb',
  'humm',
  'mmm',
  'mcp',
  'rizu',
  'er',
  'z',
  'wf',
  'idol',
  'imas',
  'rubber',
  '虹咲学园',
  '赛马娘',
  'soyoanon',
  '瑞幸联动',
  '联动',
  '合作',
  'dolleveryday',
  'doll everyday',
  'niji',
]);

/** 明显不是照片的图（动画截图、参考图、表情包等），选片误入时在这里兜底 */
const SKIP_PATH = /(参考图|截图|截屏|screenshot|BDRip|壁纸|wallpaper|表情包|设定集)/i;

function tokensFromRest(rest, year) {
  return rest
    .split(/[-_,、／/;；.·．\s]+/)
    .map((t) => t.replace(/^(from|by)/i, '').trim())
    .filter(Boolean)
    .map((t) => {
      const low = t.toLowerCase();
      if (!isNaN(Number(t))) return null; // 纯数字序号
      if (STOPWORDS.has(low)) return null;
      // 展会/活动编号（CP26、CICF、DW10…）不是角色，不进 tag
      if (/^(cp|dw|wf|bw|cicf|iqc)\d*$/.test(low)) return null;
      // 2023 年前的 lala 是《Star☆Twinkle》的羽衣拉拉，之后才是真中啦啦
      let mapped;
      if (low === 'lala') mapped = year && year < 2023 ? '羽衣拉拉' : '真中啦啦';
      // 2019–2021 的 ako 是早乙女亚子，其余年份是新子憧
      else if (low === 'ako') mapped = year >= 2019 && year <= 2021 ? '早乙女亚子' : '新子憧';
      else mapped = ALIASES[low] ?? EXTRA_ALIASES[low] ?? t;
      mapped = CANON[mapped] ?? mapped;
      if (NONCHAR.has(mapped.toLowerCase())) return null;
      return mapped;
    })
    .filter(Boolean);
}

/**
 * 目录名 -> { date, birthday, tags }
 * - 娃照：20250323-仓田真白（8 位日期前缀）
 * - 着ぐるみ：0303虹野梦（MMDD 生日前缀）
 */
function tokenize(album, kind) {
  if (kind === 'cos') {
    const m = album.match(/^(\d{2})(\d{2})(?!\d)/);
    const mon = m ? Number(m[1]) : 0;
    const day = m ? Number(m[2]) : 0;
    const rest = m ? album.slice(4) : album;
    const birthday = mon >= 1 && mon <= 12 && day >= 1 && day <= 31 ? { mon, day } : null;
    return { date: '', birthday, tags: tokensFromRest(rest, 0) };
  }
  const m = album.match(/^(\d{4})(\d{2})(\d{2})/);
  const date = m ? m[1] + '-' + m[2] + '-' + m[3] : '';
  const year = m ? Number(m[1]) : 0;
  const rest = m ? album.slice(8) : album;
  return { date, birthday: null, tags: tokensFromRest(rest, year) };
}

function hashId(rel) {
  return createHash('sha1').update(rel).digest('hex').slice(0, 10);
}

function parseTime(s) {
  if (!s) return null;
  const t = Date.parse(String(s).replace(' ', 'T'));
  return Number.isFinite(t) ? t : null;
}

/** 超大 TIFF 主文件：优先找同名 JPG 当代理，避免从网络盘读几个 G；实在太大就跳过 */
async function resolveSource(file) {
  const st = await stat(file);
  const ext = file.toLowerCase();
  const big = st.size > 60 * 1024 * 1024;
  if (!big || !/\.(tif|tiff)$/.test(ext)) return { file, size: st.size };
  const stem = file.replace(/\.(tif|tiff)$/i, '');
  for (const cand of [stem + '.jpg', stem + '.JPG', stem + '.jpeg', stem + '.JPEG']) {
    try {
      const cst = await stat(cand);
      if (cst.size > 0 && cst.size < 60 * 1024 * 1024) return { file: cand, size: cst.size, proxyFrom: file };
    } catch {}
  }
  if (st.size > 600 * 1024 * 1024) return { file, size: st.size, skip: 'too-large-tiff' };
  return { file, size: st.size };
}

async function quickHash(file, bytes = 131072) {
  const fh = await open(file, 'r');
  try {
    const buf = Buffer.alloc(bytes);
    const { bytesRead } = await fh.read(buf, 0, bytes, 0);
    const st = await fh.stat();
    return createHash('sha1').update(buf.subarray(0, bytesRead)).update(String(st.size)).digest('hex').slice(0, 16);
  } finally {
    await fh.close();
  }
}

async function main() {
  const pickArgs = args.filter((a) => a.endsWith('.json'));
  if (!pickArgs.length) throw new Error('need --picks <selection json ...>');

  const picks = [];
  for (const p of pickArgs) {
    const data = JSON.parse((await readFile(p, 'utf8')).replace(/^\uFEFF/, ''));
    const root = data.root || DEFAULT_ROOT;
    const kind = /着ぐるみ/.test(root) ? 'cos' : 'blog';
    for (const item of data.picks ?? []) picks.push({ ...item, root, kind });
  }

  console.log('[gallery] picks loaded', picks.length);
  const rows = [];
  const seen = new Set();
  for (const p of picks) {
    const rel = String(p.rel).replace(/\\/g, '/');
    const key = p.root + '|' + rel;
    if (seen.has(key)) continue;
    seen.add(key);
    if (SKIP_PATH.test(rel)) {
      console.warn('skip non-photo:', rel);
      continue;
    }
    const src = join(p.root, rel);
    if (!existsSync(src)) {
      console.warn('missing:', src);
      continue;
    }
    let resolved;
    try {
      resolved = await resolveSource(src);
    } catch {
      continue;
    }
    if (resolved.skip) {
      console.warn('skip oversized tiff:', rel);
      continue;
    }
    let srcPath = resolved.file;
    const { date, tags } = tokenize(p.album, p.kind);
    const keptTags = [...new Set(tags)].filter((t) => !EXCLUDE.has(t));
    const ts = parseTime(p.datetime) ?? parseTime(date) ?? Date.now();
    const d = new Date(ts);
    const ymd =
      d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    rows.push({
      album: p.album,
      rel,
      src: srcPath,
      srcRel: rel,
      kind: p.kind,
      id: hashId(p.kind + ':' + rel),
      reason: p.reason ?? '',
      detail: p.detail ?? '',
      datetime: p.datetime ?? ymd + ' 00:00:00',
      datetimeSource: p.datetime_source ?? '',
      date: ymd,
      time: ts,
      tags: keptTags,
      year: String(d.getFullYear()),
    });
  }

  // 内容去重：同一张图在娃照与着ぐるみ都出现时，保留着ぐるみ（选片标准）。
  // 先按文件大小分组，只有大小相同的候选才读头部哈希，避免把整个照片库读一遍。
  console.log('[gallery] rows', rows.length, 'resolving sizes/hashes');
  const bySize = new Map();
  for (const r of rows) {
    try {
      const st = await stat(r.src);
      r.size = st.size;
      r.sizeKey = String(st.size);
    } catch {
      r.sizeKey = 'u:' + r.rel;
    }
    if (!bySize.has(r.sizeKey)) bySize.set(r.sizeKey, []);
    bySize.get(r.sizeKey).push(r);
  }
  const byHash = new Map();
  for (const [key, group] of bySize) {
    if (group.length === 1) {
      byHash.set(key + '|' + group[0].rel, group[0]);
      continue;
    }
    for (const r of group) {
      let h;
      try {
        h = await quickHash(r.src);
      } catch {
        h = 'nohash:' + r.rel;
      }
      const prev = byHash.get(h);
      if (!prev) byHash.set(h, r);
      else if (prev.kind === 'blog' && r.kind === 'cos') byHash.set(h, r);
    }
  }
  const unique = [...byHash.values()];
  console.log('[gallery] unique', unique.length, 'start encoding');
  unique.sort((a, b) => a.time - b.time || a.rel.localeCompare(b.rel));

  await mkdir(dirname(DATA_OUT), { recursive: true });
  await writeFile(
    MANIFEST,
    JSON.stringify(
      {
        note: '相册源清单：rel 相对各自照片库根目录；由 scripts/gallery/build-gallery.mjs 生成。',
        count: unique.length,
        photos: unique.map((r) => ({
          root: r.root ?? '',
          album: r.album,
          rel: r.srcRel ?? r.rel,
          kind: r.kind,
          reason: r.reason,
          detail: r.detail,
          datetime: r.datetime,
          datetimeSource: r.datetimeSource,
        })),
      },
      null,
      1,
    ) + '\n',
    'utf8',
  );

  const out = [];
  let totalBytes = 0;
  let idx = 0;
  async function worker() {
    while (idx < unique.length) {
      const r = unique[idx++];
      const name = r.id;
      try {
        const pipeline = () => sharp(r.src, { failOn: 'none', sequentialRead: true, unlimited: true }).rotate();
        let info;
        let thumb;
        if (!DATA_ONLY) {
          await mkdir(OUT_DIR, { recursive: true });
          const fullPath = join(OUT_DIR, name + '.webp');
          const thumbPath = join(OUT_DIR, name + '-t.webp');
          if (RESUME && existsSync(fullPath) && existsSync(thumbPath)) {
            const fm = await sharp(fullPath).metadata();
            const tm = await sharp(thumbPath).metadata();
            info = { width: fm.width, height: fm.height, size: 0 };
            thumb = { width: tm.width, height: tm.height, size: 0 };
          } else {
            const base = pipeline();
            info = await base
              .clone()
              .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 78, effort: 4 })
              .toFile(fullPath);
            thumb = await base
              .clone()
              .resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 72, effort: 4 })
              .toFile(thumbPath);
            totalBytes += info.size + thumb.size;
          }
        } else {
          // 只更新数据时，尺寸必须取已经转过方向的成品：源图带 EXIF Orientation 时，
          // metadata() 读到的是未旋转的宽高，会把竖图当横图，瀑布流算错位置。
          const fullPath = join(OUT_DIR, name + '.webp');
          const thumbPath = join(OUT_DIR, name + '-t.webp');
          if (existsSync(fullPath) && existsSync(thumbPath)) {
            const fm = await sharp(fullPath).metadata();
            const tm = await sharp(thumbPath).metadata();
            info = { width: fm.width, height: fm.height };
            thumb = { width: tm.width, height: tm.height };
          } else {
            const meta = await pipeline().metadata();
            const swap = [5, 6, 7, 8].includes(meta.orientation || 1);
            const w = swap ? meta.height : meta.width;
            const h = swap ? meta.width : meta.height;
            const scale = Math.min(1, LONG_EDGE / Math.max(w, h));
            info = { width: Math.round(w * scale), height: Math.round(h * scale) };
            const tscale = Math.min(1, THUMB_EDGE / Math.max(w, h));
            thumb = { width: Math.round(w * tscale), height: Math.round(h * tscale) };
          }
        }
        out.push({
          id: name,
          src: '/gallery/' + name + '.webp',
          thumb: '/gallery/' + name + '-t.webp',
          w: info.width,
          h: info.height,
          tw: thumb.width,
          th: thumb.height,
          date: r.date,
          datetime: String(r.datetime).slice(0, 16).replace(' ', 'T'),
          ts: r.time,
          album: r.album,
          tags: r.tags,
          year: r.year,
          source: r.kind,
        });
        if (out.length % 10 === 0) console.log('[gallery] encoded', out.length + '/' + unique.length);
      } catch (e) {
        console.warn('skip', r.rel, e.message);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  out.sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id));

  const tagCounts = new Map();
  for (const p of out) for (const t of p.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const tags = [...tagCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));
  const years = [...new Set(out.map((p) => p.year))].sort();

  await writeFile(
    DATA_OUT,
    JSON.stringify(
      {
        note: '由 scripts/gallery/build-gallery.mjs 生成；图片已去除全部元数据（EXIF/GPS/XMP）。',
        count: out.length,
        years,
        tags,
        photos: out,
      },
      null,
      0,
    ) + '\n',
    'utf8',
  );

  console.log('[gallery] progress', out.length + '/' + unique.length);
  console.log(
    'photos=' +
      out.length +
      ' (cos ' +
      out.filter((p) => p.source === 'cos').length +
      ')' +
      ' tags=' +
      tags.length +
      ' albums=' +
      new Set(out.map((p) => p.album)).size +
      (DATA_ONLY ? '' : ' out=' + (totalBytes / 1024 / 1024).toFixed(1) + 'MB'),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
