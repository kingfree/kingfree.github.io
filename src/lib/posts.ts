export type Post = {
  slug: string;
  title: string;
  date: Date;
  tags: string[];
  /** 分类：空 = 原创文章；'译' = 译文；'转' = 转载。这三类各自独立成站内栏目。 */
  category: string;
  /** 对话式排版：frontmatter 的 chat 说话人列表；空数组表示普通文章。 */
  chat: string[];
  legacy: boolean;
  source?: string;
  description?: string;
  Content: any;
};

export const CATEGORIES = [
  { key: '译', href: '/translation/', label: '译文' },
  { key: '转', href: '/repost/', label: '转载' },
] as const;

const modules = import.meta.glob('../content/posts/*.md');

export async function loadPosts(): Promise<Post[]> {
  const entries = await Promise.all(
    Object.entries(modules).map(async ([path, loader]) => {
      const mod: any = await loader();
      const slug = path.split('/').pop()!.replace(/\.md$/, '');
      const fm = mod.frontmatter ?? {};
      return {
        slug,
        title: String(fm.title ?? slug),
        date: new Date(fm.date ?? 0),
        tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
        category: String(fm.category ?? ''),
        chat: Array.isArray(fm.chat) ? fm.chat.map(String) : [],
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
