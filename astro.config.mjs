import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://meimoe.fun',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
