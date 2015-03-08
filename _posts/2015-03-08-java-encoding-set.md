---
layout: post
title: Java 编译时的编码设置
tags: Java 编码
---

在 UTF-8 成为事实文本编码标准的现在，我的所有程序都是 UTF-8 编码的。

编写 Java 程序，默认使用 `javac` 直接在 Windows 命令提示符下编译含有汉字的源代码，会报错：

<div class="alert alert-danger" role="alert">
    错误: 编码GBK的不可映射字符
</div>

解决办法也很简单，指定编码即可：

    javac -encoding UTF-8 <文件名>

# 参考文献

1. <http://bbs.csdn.net/topics/390374418>
