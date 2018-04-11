---
title: 《HTTP 权威指南》
etitle: "HTTP: The Definitive Guide"
author: David Gourley, Brian Totty, Marjorie Sayer, Sailu Reddy, etc.
tags: HTTP
categories: 讀書筆記
date: 2016-11-12
update: 2016-11-24
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

### 第7章 缓存

为什么要有缓存：

1. 数据传输存在冗余。
2. 带宽有瓶颈。
3. 大新闻发生时的瞬间拥塞。
4. 物理距离产生的延迟。

缓存无法保存世界上*每份文档*的副本，**缓存命中**、未命中和再验证是一个缓存的基本处理方式。一个缓存交互如下：

    If-Modified-Since: Sat, 29 Jul 2016, 14:30:00 GMT
    
    HTTP/1.1 304 Not Modified
    Expires: Fri, 05 Oct 2016, 20:00:00 GMT

缓存命中率和字节命中率用于不同场合对缓存效率的衡量。HTTP没有提供区分缓存命中和访问原始服务器得到的手段，可以使用 `Date` 或 `Age` 首部来判断。

共有代理缓存和私有缓存等可以构建起来层次化的缓存结构，也有复杂的网状缓存。

缓存的处理步骤：

1. 接收
2. 解析
3. 查询
4. 新鲜度检测
5. 创建响应
6. 发送
7. 日志

如何保证文档新鲜度：

1. 文档过期机制。
    2. 过期日期：`Expires: <日期>`
    3. 使用期：`Cache-Control: max-age=<秒数>`
4. 用条件方法再验证。
    5. 时间再验证：`If-Modified-Since: <时间>`
    6. 实体标签再验证：`If-None-Match: <标签>`
    7. 标签：`Etag: W/"v2.4"`

如何控制缓存：

    Cache-Control: no-store
    Cache-Control: no-cache
    Cache-Control: must-revalidate
    Cache-Control: max-stale
    Cache-Control: max-stale=<秒数>
    Cache-Control: min-fresh=<秒数>
    Cache-Control: max-age=<秒数>
    Cache-Control: only-if-cached
    Expires: <日期>
    Pragma: no-cache

    <meta http-equiv="Cache-Control" content="no-cache">
    
新鲜度算法：
```perl
sub server_freshness_limit
{
  local($heuristic, $server_freshness_limit, $time_since_last_modify);

  $heuristic = 0;

  if ($Max_Age_value_set) {
    $server_freshness_limit = $Max_Age_value;
  } elseif ($Expires_value_set) {
    $server_freshness_limit = $Expires_value - $Date_value;
  } elseif ($Last_Modified_value_set) {
    $time_since_last_modify = max(0, $Date_value - $Last_Modified_value);
    $server_freshness_limit = int($time_since_last_modify * lm_factor);
    $heuristic = 1;
  } else {
    $server_freshness_limit = $default_cache_min_lifetime;
    $heuristic = 1;
  }

  if ($heuristic) {
    if ($server_freshness_limit > $default_cache_max_lifetime) {
      $server_fresh_limit = $default_cache_max_lifetime;
    }
    if ($server_freshness_limit < $default_cache_min_lifetime) {
      $server_fresh_limit = $default_cache_min_lifetime;
    }
  }

  return ($server_freshness_limit);
}

sub client_modified_freshness_limit
{
  $age_limit = server_freshness_limit();

  if ($Max_Stale_value_set) {
    if ($Max_Stale_value == $INT_MAX) {
      $age_limit = $INT_MAX;
    } else {
      $age_limit = server_freshness_limit() + $Max_Stale_value;
    }
  }

  if ($Min_Fresh_value_set) {
    $age_limit = min($age_limit, server_freshness_limit() - $Min_Fresh_value_set);
  }

  if ($Max_Age_value_set) {
    $age_limit = min($age_limit, $Max_Age_value);
  }
}
```

广告商不喜欢缓存。

### 第8章 网关、隧道和中继

单个应用程序无法处理所有的资源，**网关**作为不同协议之间的翻译器，分为服务器网关（`HTTP/*`）和客户端网关（`*/HTTP`）。

协议网关可以在代理设置里配置。

资源网关，通过 API 与客户端通信。最初的应用程序网关就是 CGI。API 交互方式有 XML 和 SOAP 等。

**隧道**通过 HTTP 来承载非 HTTP 流量以通过防火墙：

    CONNECT 127.0.0.1:1080 HTTP/1.1
    
    HTTP/1.1 200 Connection Established
    Proxy-agent: SSH-Proxy/2

**中继**是没有完全遵循 HTTP 规范的简单 HTTP 代理，负责处理建立连接的部分，然后对字节进行盲转发。

中继能当能够处理 `Connection` 首部来避免互操作的问题。

### 第9章 爬虫

**爬虫**（Web 机器人），从根集开始，提取页面上的链接，进行相对链接标准化和转义的规范化。

注意避免环路，可以使用树和散列表、存在位图、检查点和分类机制来进行管理。文件系统链接也会产生环路，需要特殊处理。几种避免重复和循环的技术：

* 规范化 URL。
* 广度优先的爬行。
* 节流。
* 限制 URL 长度。
* URL 黑名单。
* 模式检测。
* 内容指纹。
* 人工监视。

爬虫需要支持最小集合的 HTTP，具体包括 `User-Agent`、`From`、`Accept`、`Referer`、`Host` 等，也要支持 `http-equiv` 和重定向信息。

拒绝机器人访问标准：`robots.txt`。

    User-Agent: *
    Disallow: /home
    Allow: /index

搜索引擎相关内容，参见《搜索引擎：信息检索实践》。
    
### 第10章 HTTP/2

HTTP/2于2015年5月以正式发布。

当前所有浏览器均只支持 HTTP/2 Over TLS。

## 第三部分 HTTP 状态

HTTP 是无状态的，所以要有一套机制来实现状态。

### 第11章 Cookie 和 Session

客户端 IP 地址在经过多重代理时会不断发生变化，现在会使用 `X-Forworded-For` 来记录。

胖 URL 可以作为识别用户的标记，但不利于搜索引擎优化和阅读。

Cookie 和 Session 的唯一区别就是它们的过期时间。不同站点使用不同的 Cookie，并且不能跨域访问。

虽然书中讲到了 `Set-Cookie2`，不过现在大多数应用程序都使用 `Set-Cookie`，少有实现前者的。

设置的 Cookie 需要在请求时加在首部：

    Set-Cookie: session-id=111, uid=1, path=/; domain=.kingfree.moe, expires=Tuesday, 24-Nov-2018 18:00:00 GMT
    
    Cookie: session-id=111, uid=1
    
### 第12章 基本认证机制

基本认证：

    GET /user
    
    HTTP/1.1 401 Authorization Required
    WWW-Authenticate: Basic realm="kingfree"

    GET /user
    Authorization: Basic <Base64编码的用户名:密码>
    
    HTTP/1.1 200 Success
    
代理认证把返回码改成 `407`，请求改为 `Proxy-Authorization`，响应改为 `Proxy-Authorizate`。

基本认证通过网络发送用户名和密码，存在安全缺陷。将基本认证与加密传输结合起来，是一种常用的技巧。

### 第13章 摘要认证

摘要认证作了如下改进：

* 永远不会以明文方式在网络上发送密码。
* 可以防止恶意用户捕获并重放认证的握手过程。
* 可以有选择地防止对报文内容的修改。
* 防范其他几种常见的攻击方式。

通过随机数，可以防止重放攻击。

摘要的计算：

1. 由单项散列函数$H(d)$和摘要$KD(s, d)$组成一对函数，其中$s$表示密码，$d$表示数据。
2. 密码是包含了安全信息的数据块，称$A_1$。
3. 请求报文中非保密属性的数据块，成$A_2$。
4. 计算$H(A_2)$和$KD(A_1, A_2)$，产生摘要。

建议的摘要算法为 MD5：

$$H(d) = MD5(d)\\
KD(s, d) = H(concatenate(s, d))$$

**预授权**可以减少报文数量，通过在首部加入预选随机数实现：

    Authentication-Info: nextnonce="<随机数>"

注意，摘要认证仍然不够安全，词典攻击和中间人攻击依然奏效。

### 第14章 HTTPS

**数字证书**用于安全认证身份验证。一个 HTTPS 连接的建立要满足：

1. 用户相信他们的浏览器正确实现了 HTTPS 且安装了正确的证书颁发机构；
2. 用户相信证书颁发机构仅信任合法的网站；
3. 被访问的网站提供了一个信任的证书颁发机构签发的证书；
4. 该证书正确地验证了被访问的网站，或者互联网上相关的节点是值得信任的，或者用户相信本协议的加密层不能被窃听者破坏。

HTTPS 运行在 TLS/SSL 之上，使用 OpenSSL 来编写相关应用程序。

## 第四部分 HTTP 内容

### 第15章 实体和编码

报文承载实体。

`Content-Length` 可以用于检测截尾。`Content-MD5` 用以验证实体内容。

    Content-Type: <MIME类型>; charset=<编码>
    
多部分表单提交：    

    Content-Type: multipart/form-data; boundary=${bound}
    
    --${bound}  
    Content-Disposition: form-data; name="Filename"  
      
    HTTP.pdf  
    --${bound}  
    Content-Disposition: form-data; name="file000"; filename="HTTP协议详解.pdf"  
    Content-Type: application/octet-stream  
      
    %PDF-1.5
    file content  
    %%EOF  
      
    --${bound}  
    Content-Disposition: form-data; name="Upload"  
      
    Submit Query  
    --${bound}--  

内容编码：

    Accept-Encoding: *

    Content-Encoding: gzip
    Content-Encoding: compress
    Content-Encoding: deflate
    Content-Encoding: identity # 默认

分块编码：

    Transfer-encoding: chunked
    
条件请求和验证标签：

    ETag: <标签>
    Last-Modified: <日期>
    
    If-Match: <标签>
    If-None-Match: <标签>
    If-Modified-Since: <日期>
    If-Unmodified-Since: <日期>

范围请求可以实现断点续传和多线程下载：

    Range: bytes=4000-
    Range: bytes=4000-8000
    Range: bytes=-1
    
    Accept-Ranges: bytes

实现差异编码所需的额外磁盘空间会将减少传输量获得的好处抵消掉，所以现在一般不用。

### 第16章 国际化

    Accept-Language:zh-CN,zh;q=0.8,ja;q=0.6,en-US;q=0.4,en;q=0.2,zh-TW;q=0.2

    Content-Language: zh-CN

通过[Punycode](https://www.ietf.org/rfc/rfc3492)，域名已经支持中文。

URL 也支持中文，根据服务器处理实现不同。

最重要，统一使用 UTF-8 避免编码问题！

### 第17章 内容协商与转码

    Accept: <MIME类型>
    Accept-Language: <自然语言>
    Accept-Charset: <字符集>
    Accept-Encoding: <编码>
    
    Content-Type: <MIME类型>; charset=<字符集>
    Content-Language: <自然语言>
    Content-Encoding: <编码>
    
## 第五部分 HTTP 部署
    
### 第18章 Web 主机托管

虚拟主机的多域名托管：

    Host: blog.kingfree.moe
    
### 第19章 发布系统

书中讲的 FrontPage 和 WebDAV 均已过时。

### 第20章 重定向和均衡负载

报文重定向的方法：

* DNS 轮转。
* IP 地址转发。
* IP MAC 转发。
* HTTP 重定向。
* 任播寻址。

代理重定向的方法：

* 显式浏览器配置。
* 代理自动配置（PAC）。
* 代理自动发现（WPAD）。

缓存重定向的方法：

* WCCP 重定向。
* 因特网缓存协议（ICP）。
* 缓存阵列路由协议（CARP）。
* 超文本缓存协议（HTCP）。
* 内容分发网络（CDN）。

### 第21章 日志

常用日志格式和组合日志格式：

    <远程主机名> <用户名> <认证用户名> <请求的日期时间> <请求首行> <响应状态码> <Content-Length> <Referer> <User-Agent>

# 参考文献

1. [超文本传输协议——HTTP/1.1](https://tools.ietf.org/html/rfc2616)
2. [HTTP/2 资料汇总](https://imququ.com/post/http2-resource.html)
3. [HTTP 状态管理机制](https://tools.ietf.org/html/rfc6265)
