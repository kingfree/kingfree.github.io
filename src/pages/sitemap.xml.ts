import type { APIRoute } from 'astro';
import { loadPosts } from '../lib/posts';

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://meimoe.fun')).toString().replace(/\/$/, '');
  const posts = await loadPosts();
  const urls = ['/', '/posts/', '/archives/', '/tags/', '/about/', '/photos/', ...posts.map((p) => '/' + p.slug + '/')];
  const body = urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
