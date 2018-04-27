---
title: 博客迁移到Hexo
date: 2018-04-10 14:10:27
tags:
  - Jekyll
  - Hexo
  - Git
---

上午把一些很占资源的大图给删掉了，研究了一下现在 Github Pages 博客的最新进展，发现很多人都开始用基于 Node.js 的 [Hexo](https://hexo.io/zh-cn/) 了。功能比较丰富，而且配置简单，主题也多，所以就把博客从 Jekyll 迁移过来了。

本地写博客的话，还是起一个服务就够了。
```bash
hexo new "create-new-post"
hexo server
```

只不过发布比较麻烦，下面的命令生成静态文件后会自动push到Github的master分支，挺暴力的。
```bash
hexo clean && hexo generate && hexo deploy
```

所以现在写作的源代码就放在 hexo 分支下了，master分支是生成后的文件。一定要注意！这样的话，在克隆代码时需要加点料：

```bash
git clone --recurse-submodules -j2 -b hexo git@github.com:kingfree/kingfree.github.io.git
```

老的代码提交记录也在这个分支，因为master已经被暴力清空了TAT

接下来还要解决一下竖排模板的问题。