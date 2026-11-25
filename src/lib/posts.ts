export type Badge = '译' | '转' | '书' | '';

export type Post = {
  slug: string;
  title: string;
  date: Date;
  tags: string[];
  /** 标记：译 / 转 / 书；空字符串表示原创文章。 */
  badge: Badge;
  /** 栏目：'转载'（译 + 转）/ '读书'（书）/ ''（原创）。 */
  category: string;
  /** 对话式排版：frontmatter 的 chat 说话人列表；空数组表示普通文章。 */
  chat: string[];
  /** 标题大纲（h2/h3），用于目录。 */
  headings: { depth: number; slug: string; text: string }[];
  legacy: boolean;
  source?: string;
  description?: string;
  Content: any;
};

export const SECTIONS = [
  { key: '转载', href: '/repost/', label: '转载', blurb: '译文与转载都归这里。' },
  { key: '读书', href: '/reading/', label: '读书', blurb: '读书笔记。' },
] as const;

/** 带这些标签的算译文 / 转载 / 读书笔记（简繁都认）。 */
const TRANSLATION_TAGS = ['翻译', '翻譯', '译文', '譯文'];
const REPOST_TAGS = ['转载', '轉載'];
const READING_TAGS = ['讀書筆記', '读书笔记', '读书', '讀書', '書評', '书评'];

/** 标题里遗留的旧标记，显示前统一去掉。 */
const TITLE_MARKER = /【[译轉转書书]】/g;

export function cleanTitle(title: string): string {
  return title.replace(TITLE_MARKER, '').replace(/\s+/g, ' ').trim();
}

export function badgeOf(title: string, tags: string[], explicit?: unknown): Badge {
  const forced = String(explicit ?? '').trim();
  if (forced === '译' || forced === '转' || forced === '书') return forced;
  if (forced === '转载') return '转';
  if (forced === '读书') return '书';
  if (title.includes('【译】') || tags.some((t) => TRANSLATION_TAGS.includes(t))) return '译';
  if (title.includes('【转】') || tags.some((t) => REPOST_TAGS.includes(t))) return '转';
  if (title.includes('【书】') || tags.some((t) => READING_TAGS.includes(t))) return '书';
  return '';
}

export function categoryOf(badge: Badge): string {
  if (badge === '书') return '读书';
  if (badge === '译' || badge === '转') return '转载';
  return '';
}

const modules = import.meta.glob('../content/posts/*.md');

export async function loadPosts(): Promise<Post[]> {
  const entries = await Promise.all(
    Object.entries(modules).map(async ([path, loader]) => {
      const mod: any = await loader();
      const slug = path.split('/').pop()!.replace(/\.md$/, '');
      const fm = mod.frontmatter ?? {};
      const rawTitle = String(fm.title ?? slug);
      const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
      const badge = badgeOf(rawTitle, tags, fm.badge ?? fm.category);
      return {
        slug,
        title: cleanTitle(rawTitle),
        date: new Date(fm.date ?? 0),
        tags,
        badge,
        category: categoryOf(badge),
        chat: Array.isArray(fm.chat) ? fm.chat.map(String) : [],
        headings: (typeof mod.getHeadings === 'function' ? mod.getHeadings() : []).map((h: any) => ({
          depth: Number(h.depth ?? 2),
          slug: String(h.slug ?? ''),
          text: String(h.text ?? ''),
        })),
        legacy: Boolean(fm.legacy),
        source: fm.source,
        description: fm.description,
        Content: mod.default,
      } satisfies Post;
    }),
  );
  return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** 原创文章：不带任何标记。 */
export function originals(posts: Post[]): Post[] {
  return posts.filter((p) => !p.category);
}

/** 取出某个栏目（转载 / 读书）的文章。 */
export function inCategory(posts: Post[], category: string): Post[] {
  return posts.filter((p) => p.category === category);
}

export function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const map = new Map<number, Post[]>();
  for (const p of posts) {
    const y = p.date.getUTCFullYear();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(p);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([year, list]) => ({ year, posts: list }));
}
