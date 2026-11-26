---
title: "确定性线性时间最小生成树（中文版 + C 实现）"
date: 2026-11-26
tags: ["翻译", "算法", "最小生成树"]
description: "arXiv:2611.31187 的中文全译，附一份自己写的 C 实现；MST 的比较复杂度问题就此了结。"
---

2026 年 11 月 23 日，Sanjeev Khanna、Aaron Putterman 与 Junkai Song 把《A Deterministic Linear Time Algorithm for Minimum Spanning Tree》挂上 arXiv。结论一句话：最小生成树的确定性比较复杂度是 $O(m)$。Chazelle 在 2000 年做到 $O(m\alpha(m,n))$ 之后这个界再没动过，如今最后一层也被揭掉了——而这个问题从 Borůvka 1926 年为摩拉维亚的电气化算电网开始，已经问了整整一百年。

论文的路线不太寻常：它先证明 $T^*(m,n) = O(m)$，也就是存在一棵深度为线性的比较树，再借 Pettie–Ramachandran（JACM 2002）的归约把它变成真正的 $O(m)$ 时间算法。核心的「证书过程」读起来并不神秘：反复把顶点投影到越来越小的门户集合上，凡是被投影出的森林所支撑的边就整批丢弃，剩下的边只有 $\varepsilon m + C_\varepsilon\sqrt{nm}$ 条；跑常数个 Borůvka 阶段把 $\sqrt{nm}$ 压到 $m/4$ 以下，递归规模就减半，于是 $T(m) = T(m/2) + O(m)$。

我做了两件事。一是把全文译成中文、用 Typst 重排：29 条定理／引理／定义／断言／推论的编号与原文逐一对应，37 条参考文献、表 1 和两个算法都按原文重排。二是把算法用 C 写了一遍：单文件、无第三方依赖，基数排序版在字 RAM 上是 $O(m)$，加 `--cmpsort` 可以退回论文的两两比较模型。

- [中文版 PDF](/files/mst/mst-linear-zh.pdf)（25 页，约 1.0 MB）
- [C 实现与测试](https://github.com/kingfree/mst-linear-c)（MIT，`build.cmd` 一把编译，`--fuzz` 自带对拍）
- 原文：[arXiv:2611.31187](https://arxiv.org/abs/2611.31187)

要说清楚的是，论文的 $O(m)$ 是**比较次数**上的存在性结论：它靠「把所有调度表与历史枚举一遍，挑出对所有实例都表现良好的那一个」，外加 Komlós 的线性时间路径最大值查询，两者都跑不动。我的实现走的是另一条线——按 IEEE-754 位模式做基数排序，权值之间一次比较都不做；这在字 RAM 上确实是线性，但不是论文那种比较模型下的线性。实测单线程 $10^6$ 点 $2\times10^6$ 边跑 266 ms、平均 8.1 次比较/边，`--cmpsort` 退回比较模型则是 382 ms、20.3 次/边。哪些做了、哪些没做，仓库 README 里列得比这里直白。
