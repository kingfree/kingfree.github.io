import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import katex from './src/lib/satteri-katex.mjs';

export default defineConfig({
  site: 'https://meimoe.fun',
  trailingSlash: 'always',
  build: { format: 'directory' },
  redirects: {
    '/translation/': '/repost/',
    // 标签统一转简体后，旧的繁体标签地址仍可访问
    '/tags/讀書筆記/': '/tags/读书笔记/',
    '/tags/經史子集/': '/tags/经史子集/',
    '/tags/史記/': '/tags/史记/',
    '/tags/十三經/': '/tags/十三经/',
    '/tags/遊記/': '/tags/游记/',
  },
  markdown: {
    processor: satteri({ features: { math: true }, hastPlugins: [katex] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
