# meimoe.fun

原田莓莓的个人站，Astro 静态构建，部署在 GitHub Pages。

- 文章源：`src/content/posts/*.md`（由 `hexo` 分支的 Hexo 源码导入）
- 图片与附件：`public/images`、`public/files`
- 旧站地址 `/<slug>/` 全部保留

## 本地

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 输出到 dist/
```

## 格式

保存时不自动格式化；`.zed/settings.json` 对 Astro / Markdown / HTML 关闭了保存时格式化，
免得改文案时整个模板被重排。`*.astro` 与 `src/content/posts/` 不进 Prettier（见 `.prettierignore`），
其余代码用 Prettier 统一：

```bash
npm run format         # 格式化
npm run format:check   # 只检查
```

## 内容

新增文章：在 `src/content/posts/` 放一个 `<slug>.md`，frontmatter 至少写 `title` 与 `date`，
可选 `tags` 数组。slug 即 URL：`/<slug>/`。

重新导入 Hexo 源码（需要 `hexo` 分支的 `source/_posts`）：

```bash
git worktree add ../hexo-src hexo
HEXO_POSTS=../hexo-src/source/_posts node scripts/import-hexo.mjs
```

## 部署

推送到 `master` 后由 `.github/workflows/deploy.yml` 构建并发布到 GitHub Pages，
`public/CNAME` 固定自定义域名为 `meimoe.fun`。
