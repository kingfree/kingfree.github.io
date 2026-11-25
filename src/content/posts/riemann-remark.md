---
title: "黎曼猜想证明的声明（中文版）"
date: 2026-11-21
tags: ["翻译", "黎曼猜想"]
description: "Levent Alpöge 与 Claude 声称证明了黎曼猜想；这里给出中文全译的 PDF 与 Typst 源文件。"
---

2026 年 11 月 21 日，Levent Alpöge（Anthropic / 哈佛学会 Junior Fellow）在个人主页挂出一份四页的英文声明：他与 Claude 合作找到了黎曼猜想的证明，同一套方法顺带解决了广义黎曼猜想，再多给点时间连扩展黎曼猜想也能拿下，而且论证已经在 Lean 里无假设地形式化了。

这份中文版是原声明的全文翻译（Gemini 翻译，我重新排版、校对），正文里作者那些自嘲式的括注也一并照译。

- [中文版 PDF](/files/rh/riemann-remark-zh.pdf)（4 页，约 313 KB）
- [Typst 源文件](/files/rh/riemann-remark-zh.typ)（约 15 KB，可直接重新排版）
- 原文 PDF：[alpo.ge/remark.pdf](https://alpo.ge/remark.pdf)（4 页，英文）
- 形式化源码：[alpo.ge/lean.tar.gz.part01](https://alpo.ge/lean.tar.gz.part01)（共 14 个分片，把末两位依次换成 02–14 即可）

要说明的是，这只是一份声明，数学界尚未审议。它的分量最终取决于 Lean 形式化和那些分片源码，愿意较真的读者可以自己去核。作者本人在文末也提到，眼下这个论证长得离谱，估计很快就会被大幅简化。
