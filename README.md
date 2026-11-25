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

## 公式

行内 `$...$`、块级 `$$...$$` 由 KaTeX 在构建期渲染（`src/lib/satteri-katex.mjs`），样式取自 `katex/dist/katex.min.css`，深浅色都跟着正文走。
公式里的中文要包在 `\text{}` 里，或者干脆别塞进公式——KaTeX 的字体没有中文。

## 对话式文章

想把它排成聊天记录的样子，在 frontmatter 里写说话人列表即可（「我」渲染成靠右的用户气泡，其余是助手气泡）：

```yaml
chat: ["我", "Gemini", "Sonnet 5"]
```

正文里用「加粗说话人 + 段落」分段，轮与轮之间用 `---` 隔开（分隔线会被吃掉）。
渲染走 `src/lib/chat-turns.mjs`，在构建期把 Markdown 转成气泡结构，不需要客户端脚本。

## 目录

文章页只要有 2 个以上 h2/h3，就会自动生成目录：宽屏（≥1240px）固定悬浮在正文右侧并随滚动高亮当前小节，窄屏收成正文上方可展开的「目录 · N 节」。
对话式文章（`chat:`）的标题在渲染时补 id，同样进目录。

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

## 分类

站内分三类，各自独立成栏，`/posts/` 只列原创：

分类由**标题里的标记**决定，不用另写字段：

- 标题带 `【译】` → `/translation/`
- 标题带 `【转】` → `/repost/`
- 其余 → `/posts/`（首页“最近写的”也只取这些）

标记放在开头或结尾都识别（`【转】标题` 与 `标题【转】` 等效），旧博客那批 `……【转】` 的稿子会归到转载。
需要强制指定时可以在 frontmatter 写 `category: 译`，会覆盖标题推断。

重新导入 Hexo 源码（需要 `hexo` 分支的 `source/_posts`）：

```bash
git worktree add ../hexo-src hexo
HEXO_POSTS=../hexo-src/source/_posts node scripts/import-hexo.mjs
```

## 部署

推送到 `master` 后由 `.github/workflows/deploy.yml` 构建并发布到 GitHub Pages，
`public/CNAME` 固定自定义域名为 `meimoe.fun`。
