import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import katex from './src/lib/satteri-katex.mjs';

export default defineConfig({
  site: 'https://meimoe.fun',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    processor: satteri({ features: { math: true }, hastPlugins: [katex] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
