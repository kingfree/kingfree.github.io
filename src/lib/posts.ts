export type Post = {
  slug: string;
  title: string;
  date: Date;
  tags: string[];
  /** 分类：空 = 原创文章；'译' = 译文；'转' = 转载。这三类各自独立成站内栏目。 */
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

export const CATEGORIES = [
  { key: '译', href: '/translation/', label: '译文' },
  { key: '转', href: '/repost/', label: '转载' },
] as const;

/** 带这些标签的算译文 / 转载（简繁都认）。 */
const TRANSLATION_TAGS = ['翻译', '翻譯', '译文', '譯文'];
const REPOST_TAGS = ['转载', '轉載'];

/**
 * 分类看标题标记和标签：标题带 `【转】` 或标签有「转载」→ 转载；
 * 标题带 `【译】` 或标签有「翻译 / 译文」→ 译文。
 * frontmatter 里显式写了 category 的以它为准。
 */
export function categoryOf(title: string, tags: string[]): string {
  if (title.includes('【转】') || tags.some((t) => REPOST_TAGS.includes(t))) return '转';
  if (title.includes('【译】') || tags.some((t) => TRANSLATION_TAGS.includes(t))) return '译';
  return '';
}

const modules = import.meta.glob('../content/posts/*.md');

export async function loadPosts(): Promise<Post[]> {
  const entries = await Promise.all(
    Object.entries(modules).map(async ([path, loader]) => {
      const mod: any = await loader();
      const slug = path.split('/').pop()!.replace(/\.md$/, '');
      const fm = mod.frontmatter ?? {};
      const title = String(fm.title ?? slug);
      const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
      return {
        slug,
        title,
        date: new Date(fm.date ?? 0),
        tags,
        category: String(fm.category ?? categoryOf(title, tags)),
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

/** 原创文章：不带 译/转 分类。 */
export function originals(posts: Post[]): Post[] {
  return posts.filter((p) => !p.category);
}

/** 取出某一分类（译 / 转）的文章。 */
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
