export type Post = {
  slug: string;
  title: string;
  date: Date;
  tags: string[];
  legacy: boolean;
  source?: string;
  description?: string;
  Content: any;
};

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
        legacy: Boolean(fm.legacy),
        source: fm.source,
        description: fm.description,
        Content: mod.default,
      } satisfies Post;
    }),
  );
  return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
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
