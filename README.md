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

## 写真

`/photos/` 是写真页：占满整行的瀑布流（默认按拍摄时间倒序，点开是带切换动效的灯箱）。标题旁边一行是当前视图的
张数、角色数和年代跨度（如 `348 张 · 54 位角色 · 2016—2026`），筛选后跟着重算。页面只留标题和两个按钮，
筛选（角色 tag / 年份 / 顺序）折叠在「筛选」里，角色生日日历是页内的「生日」弹层：日期格用精选图铺满，悬停看角色名与作品，
同一天有多个角色时格子内等分、各放各自的照片，点这种格子会贴着它浮出一张卡片，列出当天每个角色的照片、名字、作品和照片数，
点其中一位就在当前页筛这个角色；单个角色的格子点了直接筛。格子里的照片一律用这个角色最新拍的那张。日期格固定 6 行、
弹窗宽度按视口高度收紧，所以翻月份时弹窗大小不变（不会因为 5 周 / 6 周来回跳）。旧的 `/birthday/` 地址会重定向回来。

- 照片来自两个只读目录：`Z:\娃照`（按日期/事件分目录）和 `Z:\着ぐるみ\角色`（按「MMDD角色名」分目录），每个目录最多取 4 张。
- 选片规则：优先手工修图导出（文件名标记、发布/精修目录、Lightroom/Photoshop 等 EXIF Software）；没有修图痕迹就按稳定哈希随机取 1 张；
  同一张图两边都有时保留 `着ぐるみ\角色` 的版本。截图、参考图、RAW、视频不进相册。
- 结果在 `src/data/gallery.json`，图片在 `public/gallery`（长边 1600 WebP + 720 缩略图，**不保留任何元数据**：EXIF/GPS/XMP 全部剥离，文件名用内容哈希）。
- 生日与作品在 `src/data/birthdays.json`，优先级是：脚本里人工核过的 `BIRTHDAY_OVERRIDES`（逐条按萌娘百科 / Bangumi 条目核，
  目录名前缀是拍摄日不是生日的会被它纠正）→ `着ぐるみ\角色` 目录名的 MMDD 前缀 → 本机 Bangumi 收藏
  （`C:\Users\mei\bgm-birthday-calendar\public\characters.json`）。每条还带 `birthdaySource`（manual / cos / bgm），
  罗马字目录名靠 `character-aliases.json` 对上角色。
- 角色别名在 `scripts/gallery/build-gallery.mjs` 顶部的 `ALIASES` / `CANON`（如 2023 年前的 lala 算羽衣拉拉，之后算真中啦啦）；
  不想收的角色写 `EXCLUDE`。

重新生成：

```bash
node scripts/gallery/build-characters.mjs                      # 目录名 tag → Bangumi 角色
node scripts/gallery/build-gallery.mjs --resume --picks ../gallery-build/selection-picker-*.json
node scripts/gallery/build-birthdays.mjs                       # 生日日历数据
node scripts/gallery/build-catalog.mjs                         # 给本地选片工具的台账
```

本地选片工具在 `C:\Users\mei\dsh\work\gallery-curator`（Rust/NSH），读 `gallery-build/catalog.json`，
勾选结果写回 `gallery-build/selection.json`，点「重建相册」会重跑上面的脚本。

## 搜索

导航栏右侧的放大镜打开一个搜索浮窗（也可以按 `/` 或 `⌘K` / `Ctrl+K`）。构建期由 `src/lib/search.ts` 把文章的标题、
标签、小标题、正文（Markdown 抹成纯文本）和写真角色的名字、作品、生日、照片数写成 `search-index.json`
（`src/pages/search-index.json.ts`）；浮窗第一次打开时才取这份索引（约 1 MB），其它页面不受影响，在浏览器里即时匹配：
文章按标题 > 标签 > 小标题 > 正文加权排序，命中处高亮并给一段上下文；查询是 4 位年份时给出「20xx 年的写真」；
角色结果直接跳到 `/photos/?tag=…`。`↑` / `↓` 选择，回车打开，`esc` 关闭；没输入时下面列的是照片最多的几位角色。

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

文章分三类，各自独立成栏，`/posts/`（以及首页“最近写的”）只列原创：

| 标记 | 判定 | 栏目 |
| --- | --- | --- |
| 译（蓝） | 标签含 `翻译` / `译文`，或旧标题里的 `【译】` | `/repost/`（转载） |
| 转（绿） | 标签含 `转载`，或旧标题里的 `【转】` | `/repost/`（转载） |
| 书（砖红） | 标签含 `讀書筆記` / `读书` | `/reading/`（读书） |

标题里不再写 `【译】【转】`，标记改成正文前的小方块图标：`<span class="badge" data-badge="译">`，
字符由 CSS `attr(data-badge)` 填进去，颜色在 `global.css` 的「译 / 转 / 书 标记」一节。
要强制指定时在 frontmatter 写 `badge: 书`（也接受 `category: 读书`）。`/translation/` 已重定向到 `/repost/`。

重新导入 Hexo 源码（需要 `hexo` 分支的 `source/_posts`）：

```bash
git worktree add ../hexo-src hexo
HEXO_POSTS=../hexo-src/source/_posts node scripts/import-hexo.mjs
```

## 部署

推送到 `master` 后由 `.github/workflows/deploy.yml` 构建并发布到 GitHub Pages，
`public/CNAME` 固定自定义域名为 `meimoe.fun`。
