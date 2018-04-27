---
title: 比特币Bitcoin源代码安装编译【转】
date: 2018-04-27 16:39:17
categories: 转载
tags: 
  - 区块链
---

*原文地址：<http://www.cnblogs.com/wintersun/p/3813424.html>*

比特币 (货币符号: ฿;英文名：Bitcoin;英文缩写: BTC)，是一种用于开源的P2P软件而产生的电子货币。

在这儿主要介绍Linux下的比特币Bitcoin安装，我们选择ubuntu 12.04的环境，安装相对容易得多。Windows下并不推荐，因为基于mingW配置相以繁琐。

同时也可以参考build官方文档。

  
先拉下源代码：
```
git clone https://github.com/bitcoin/bitcoin.git
```

安装Berkeley DB 4.8以上版本：
```
sudo apt-get install libdb5.1++-dev
```

然后进入到相关目录：
```
cd bitcoin

./autogen.sh
./configure
```

如果你遇到这样的提示：configure: error: Found Berkeley DB other than 4.8, required for portable wallets 那就可以这样：
```
./configure --with-incompatible-bdb
```

如查遇到到这样的提示：`checking for boostlib >= 1.20.0… configure: We could not detect the boost libraries (version 1.20 or higher)`. 那这样：
```
sudo apt-get install libboost-all-dev
```

然后再次configure，如果你需要bitcoin-qt前端，那需要安装
```
sudo apt-get install libqt4-core libqt4-gui libqt4-dev
```

再次configure，这次可以了
```
make
```

开始编译，大约5分钟，然后安装编译好的二进制文件
```
make install
```

想运行前端那执行
```
bitcoin-qt
```

服务端是
```
bitcoind  -server –printtoconcole
```
 

接到下，是否挖矿就看您自己了。以当前时间为起点，连接testnet有9G的blockchain数据需要下载，livesite有35G的数据需要下载。 
也可以从这里下载文件，以加快速度。后续会介绍关于比特币的更多内容。有兴趣可以阅读它的源代码。

 

资料LINK：

- [BitCoin比特币 wiki](https://en.bitcoin.it/wiki/Main_Page)
- [Bitcoin比特币 源代码文档](https://dev.visucore.com/bitcoin/doxygen/files.html)
- [Bitcoin比特币 中国](http://www.btcchina.org)

> 作者：Petter Liu 
> 出处：<http://www.cnblogs.com/wintersun/>
> 本文版权归作者和博客园共有，欢迎转载，但未经作者同意必须保留此段声明，且在文章页面明显位置给出原文连接，否则保留追究法律责任的权利。 
> 该文章也同时发布在我的独立博客中-Petter Liu Blog。
