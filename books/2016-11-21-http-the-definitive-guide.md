---
layout: page
group: book
title: HTTP 权威指南
etitle: "HTTP: The Definitive Guide"
permalink: /books/http-the-definitive-guide/
author: David Gourley, Brian Totty, Marjorie Sayer, Sailu Reddy, etc.
date: 2016-11-12
update: 2016-11-21
---

一直想看的经典书籍之一，终于有时间，断断续续花了一周左右的时间看完了。

这本书解释了我之前对很多名词和协议的疑惑，也比较全面地补充了 HTTP 相关的知识体系。我就在阅读中发现的一些问题，和补充的内容，作一下记录和讨论。

## 第一部分 HTTP 基础

### 第1章 HTTP 概述

所有类型的内容来源都是**资源**。

URI 包括 URL 和 URN，现在几乎所有的 URI 都是 URL。另外，[磁力链接](https://zh.wikipedia.org/wiki/%E7%A3%81%E5%8A%9B%E9%93%BE%E6%8E%A5)是 URN。

### 第2章 URL 与资源

URL 的语法：

    <方案>://<用户>:<密码>@<主机>:<端口>/<路径>;<参数>?<查询>#<片段>

URL 可以通过 `.` 和 `..` 来进行相对定位。

URL 编码限于 ASCII 范围，用 `%` 转义。

### 第3章 HTTP 报文

所有报文都向下游流动。

虽然分割符是 `\r\n`，但是稳健的应用程序也应该支持单个换行符的情况。

请求行：`<方法> <路径> <协议>`

HTTP/1.1 定义的安全方法有 `GET`、`HEAD`、`POST`、`PUT`、`TRACE`、`OPTIONS`、`DELETE`。

协议包含版本号，版本号不应作为小数点比较，比如 `1.10` > `1.2`。

响应行：`<状态码> <原因短语>`

常见的状态码有200、201、302、400、401、403、404、500、502、504，参见 [HTTP 状态码](https://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81)。

首部字段根据请求还是响应，分为四类。具体参见 [HTTP 头字段列表](https://zh.wikipedia.org/wiki/HTTP%E5%A4%B4%E5%AD%97%E6%AE%B5%E5%88%97%E8%A1%A8)。

1. 通用首部。
2. 请求首部。
3. 响应首部。
4. 实体首部。

### 第4章 连接管理

TCP 保证的传输可靠性，见《TCP/IP 详解（第一卷）》。

HTTP 事务的时延，包括 DNS 查询、连接建立、请求处理过程和数据传输验证过程。

并行连接不能根本解决问题，可以结合持久连接：

    Connection: Keep-Alive
    Keep-Alive: max=5, timeout=120

持久连接需要代理支持：

    Proxy-Connection: Keep-Alive

## 第二部分 HTTP 结构

### 第5章 Web 服务器

书中给出了一个老旧的 Perl 服务器示例。注意到 Apache 已经逐步被 Nginx 部分取代，Node.js 也越来越活跃了。可以参见 [Netcraft 的服务器市场调查](https://www.netcraft.com/survey)，现在是微软的市场份额占据了一半。

一个 Web 服务器处理请求需要七步：

1. 建立连接。其中确认用户的 ident 协议已经基本没人用了。
2. 接受请求。单线程、多线程/进程（Apache）、复用IO（Node.js），以及复用IO的多线程服务器。
3. 处理请求。
4. 访问资源。
5. 构建相应。
6. 发送响应。
7. 记录日志。

### 第6章 代理

**代理**连接的是相同协议的应用程序，**网关**连接的是不同协议的应用程序。

常见的代理：防火墙、缓存服务器、反向代理（Nginx）、匿名服务。客户端的代理方式有：

1. 手动代理。就是浏览器的 Internet 选项。
2. PAC文件。实现 `FindProxyForURL(url, host)` 的 JavaScript 程序。
3. WPAD。自动配置 PAC 的方式。

代理相关的首部：

    Via: 1.0 fred, 1.1 example.com (Apache/1.1)
    Proxy-Authenticate: Basic
    Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==
    X-Forwarded-For: client1, proxy1, proxy2

つづく

# 参考文献

1. [Hypertext Transfer Protocol -- HTTP/1.1](https://tools.ietf.org/html/rfc2616)
