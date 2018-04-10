---
layout: post
title: GitLab 服务从 laala 迁移到 ako
tags: 
  - Git
  - VPS
  - Linux
update: 2016-11-10
---

昨天晚上升级了 laala 的系统，升级到一半 SSH 断掉了，本来以为重启就好了，结果重启完直接硬盘挂了。进去控制台，一看：

    Unable to mount root fs on Unknown-block(0,0)

尝试开了新机器，把旧的硬盘挂上去，结果还是启动不起来。对于 Linux，升级内核升级挂了的也不少见，加上懒得跟 Conoha 直接沟通，就不折腾这个了。
于是开了台新机器，把本地的 Git 仓库导入进去，所幸是没丢什么东西（就算是丢了也忘了）。

旧机器 [laala.kingfree.moe](http://laala.kingfree.moe) 转移到了 [ako.kingfree.moe](http://ako.kingfree.moe)，GitLab 服务的域名不变，指向新机器 [git.kingfree.moe](http://git.kingfree.moe)。

还有就是一年没更新博客了，导致 Github-Pages 都升级了好几个版本了，今天做一下迁移。需要注意的是，进行 `bundle install` 之前，要为 nokogiri 的编译准备相关的库：

    sudo apt-get install libxslt-dev libxml2-dev build-essential

我现在用的是 Ubuntu bash on Windows，进入 bash 只有加上 `bash --login` 才能使用 RVM 环境。
还有就是在启动 Jekyll 服务时，加上这个选项：

    bundle exec jekyll serve --force_polling --no-watch

# 参考文献

1. [Nokogiri installation fails -libxml2 is missing](http://stackoverflow.com/questions/6277456/nokogiri-installation-fails-libxml2-is-missing)
2. [jekyll serve not working on Windows Subsystem for Linux](https://github.com/jekyll/jekyll/issues/5233)
