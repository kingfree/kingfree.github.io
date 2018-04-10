---
layout: post
title: Java 编译时的编码设置
tags: Java 编码
update: 2015-3-17
---

在 UTF-8 成为事实文本编码标准的现在，我的所有程序都是 UTF-8 编码的。

编写 Java 程序，默认使用 `javac` 直接在 Windows 命令提示符下编译含有汉字的源代码，会报错：

<div class="alert alert-danger" role="alert">
    错误: 编码GBK的不可映射字符
</div>

解决办法也很简单，指定编码即可：

    javac -encoding UTF-8 <文件名>
	
在 Eclipse 中则可以在属性中配置。

javadoc 也会产生相同的问题，在命令行参数中或在 Eclipse 中的 Generate Javadoc 的 VM options 中加入：
	
	-encoding utf-8 -charset utf-8
	
Linux 默认编码就是 UTF-8，没有这个问题。
