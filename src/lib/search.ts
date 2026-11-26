import gallery from '../data/gallery.json';
import birthdays from '../data/birthdays.json';
import { formatDate, loadPosts } from './posts';

const rawSources = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

/** 把 Markdown 抹成一段纯文本，只用于搜索（不直接展示）。 */
export function searchText(md: string): string {
  let s = md.replace(/^\uFEFF/, '').replace(FRONTMATTER, '');
  s = s.replace(/```[\s\S]*?```/g, ' ');
  s = s.replace(/~~~[\s\S]*?~~~/g, ' ');
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  s = s.replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1');
  s = s.replace(/\[\^[^\]]*\]/g, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/^\s{0,3}(?:-{3,}|\*{3,})\s*$/gm, ' ');
  s = s.replace(/^\s{0,3}(?:#{1,6}\s+|[-*+]\s+|>\s?|\d+\.\s+)/gm, ' ');
  s = s.replace(/\|/g, ' ');
  s = s.replace(/\\[a-zA-Z]+/g, ' ');
  s = s.replace(/[*_~`]+/g, ' ');
  s = s.replace(/[ \t\u3000]+/g, ' ');
  s = s.replace(/\s*\n\s*/g, ' ');
  return s.trim();
}

export type IndexPost = {
  /** slug */ s: string;
  /** 标题 */ t: string;
  /** 日期 */ d: string;
  /** 栏目：原创 / 转载 / 读书 */ c: string;
  /** 标签 */ g: string[];
  /** 小标题 */ h: string[];
  /** 正文纯文本 */ x: string;
};

export type IndexCharacter = {
  /** 显示名 */ n: string;
  /** 角色 tag（= /photos/?tag= 的值） */ k: string;
  /** 照片数 */ c: number;
  /** 年代跨度 */ y: string;
  /** 首个作品 */ w: string;
  /** 生日 */ b: string;
};

export type SearchIndex = {
  v: number;
  posts: IndexPost[];
  chars: IndexCharacter[];
  years: { y: string; c: number }[];
};

export async function buildSearchIndex(): Promise<SearchIndex> {
  const posts = await loadPosts();
  const docs: IndexPost[] = posts.map((p) => ({
    s: p.slug,
    t: p.title,
    d: formatDate(p.date),
    c: p.category || '原创',
    g: p.tags,
    h: p.headings.filter((h) => h.depth <= 3).map((h) => h.text),
    x: searchText(rawSources['../content/posts/' + p.slug + '.md'] ?? ''),
  }));

  // 角色：照片数、年代跨度、作品、生日
  const span = new Map<string, { from: number; to: number }>();
  for (const photo of gallery.photos) {
    const year = Number(photo.year) || Number(photo.date.slice(0, 4)) || 0;
    for (const tag of photo.tags) {
      const s = span.get(tag);
      if (!s) span.set(tag, { from: year, to: year });
      else {
        if (year && year < s.from) s.from = year;
        if (year > s.to) s.to = year;
      }
    }
  }

  const bd = new Map(birthdays.characters.map((c) => [c.tag, c]));
  const chars: IndexCharacter[] = gallery.tags.map((t) => {
    const s = span.get(t.name);
    const c = bd.get(t.name);
    return {
      n: c?.name || t.name,
      k: t.name,
      c: t.count,
      y: s ? (s.from === s.to ? String(s.from) : s.from + '—' + s.to) : '',
      w: (c?.works && c.works[0]) || '',
      b: c && c.mon > 0 && c.day > 0 ? c.mon + ' 月 ' + c.day + ' 日' : '',
    };
  });
  chars.sort((a, b) => b.c - a.c || a.n.localeCompare(b.n, 'zh'));

  const yearCount = new Map<string, number>();
  for (const photo of gallery.photos) {
    yearCount.set(photo.year, (yearCount.get(photo.year) || 0) + 1);
  }
  const years = gallery.years.map((y) => ({ y, c: yearCount.get(y) || 0 }));

  return { v: 1, posts: docs, chars, years };
}
