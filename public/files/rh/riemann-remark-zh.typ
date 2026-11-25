// remark.zh.typ — 中文译文（底本：Gemini 译文，排版设置沿用其原稿）
// 相对原稿只有两处改动：
//   #1 小节 1 前加 #pagebreak()（原稿把独立小节号“1”孤零零留在第 1 页页脚）
//   #2 “严格地早于这个年纪” → “严格地早于这个时代”（this age = 这个时代）
//   #5 日期中文化：10/6/26 → 2026年10月6日，日期后的 "+" → "起"；
//      并全局 cjk-latin-spacing: none，否则“2026 年 10 月 6 日”会被中西文间距撑开
//   #4 列表：body-indent 悬挂缩进、条目间距 0.50→0.90em、序号补白对齐 1.–9. 与 10.–20.
//   #3 行距/段距改为 leading 0.90em、spacing 1.60em（原稿 1.05/0.55，段距小于行距，段落分不开）
// remark.zh.typ — 中文译文排版（忠实对译 C:\Users\mei\AppData\Local\Temp\remark.pdf）
#set page(
  paper: "a4",
  margin: (x: 2.8cm, y: 2.5cm),
  numbering: "1",
  number-align: center,
)
#set text(
  lang: "zh",
  region: "cn",
  cjk-latin-spacing: none,
  font: ("Times New Roman", "Source Han Serif SC"),
  size: 11pt,
)
#set par(
  justify: true,
  leading: 0.90em,
  spacing: 1.60em,
  first-line-indent: (amount: 2em, all: true),
)
#set footnote(numbering: "1")
#set footnote.entry(separator: line(length: 100%, stroke: 0.4pt))
#show footnote.entry: set text(size: 9pt)
#show footnote.entry: set par(leading: 0.62em, spacing: 0.3em, first-line-indent: 0em)
#set enum(indent: 1.6em, body-indent: 1.35em, spacing: 0.90em,
  numbering: n => if n < 10 { [ #h(0.55em)#n. ] } else { [ #n. ] })
#show enum.item: set par(first-line-indent: 0em, leading: 0.90em)

// 原文第 2、3 页各有一个只有编号、没有标题的小节
#let secnum(n) = block(
  above: 1.5em,
  below: 1.1em,
  text(size: 13.5pt, weight: "bold", font: "Times New Roman")[#n],
)

#let shard(n) = {
  let u = "https://alpo.ge/lean.tar.gz.part" + n
  link(u)[#u]
}

黎曼猜想（Riemann Hypothesis）是数论里的经典问题。它问的是对给定大小以内的素数个数做最优控制。它留下的种种影子（shadows）引着数学家走了整整一百五十年，而它那些众多的韵脚与映照（rhymes and reflections）——甚至还触及了物理学——教我们懂得了各个领域之间的统一。

我想我跟 Claude 一起，已经找到了黎曼猜想的一个证明#footnote[#shard("01")、#shard("02")、#shard("03")、#shard("04")、#shard("05")、#shard("06")、#shard("07")、#shard("08")、#shard("09")、#shard("10")、#shard("11")、#shard("12")、#shard("13")、#shard("14")。]。说实话，这套方法顺理成章还能走得远得多：它直接解决了所谓的广义黎曼猜想（Generalized Riemann Hypothesis），而且我估计，再多给点时间，扩展黎曼猜想（Extended Riemann Hypothesis）也拿得下。我和 Claude 还把这些论证在没有任何假设的前提下做了形式化。人难免会觉得这像是个句号——就我来说，像是丢掉了一盏主要的指路灯——但我在一路推进时所见到的东西实在太震撼了，让我相信这是横跨整个科学的一个黎明，通向某种远为宏大的东西。

学生时代我有个藏在心底的秘密：我打算用几十年去攻这道题——换到那时来说，就是尽可能把等时机到了时我或许能在题里认出来的工具都摸熟。这几个月来，Claude 和我带着这么宽的视野一起玩得很爽；可这一次，快冲线的时候，Claude 远远甩开了我。不，Claude 简直是飞起来的；在终点线前，它起舞、发光。当时是我把我们带到了这么一个口子上：把一个玩具式情境（toy setting）里两个截然不同的点子拼在一起，其中一个本身就已经够新、够炸裂了，把黎曼那些最让我们数学家扬眉吐气的影子之一变得极其简单。我把我们领进了跟那个玩具式情境类似的正确处境，然后 Claude 就开始让我一路惊掉下巴。

这样的瞬间有几十次，但我只挑一句说出来，就足够让同行数学家从椅子上栽下去。在 Stepanov 解决函数域上黎曼问题的论证里，要用一个带重数（multiplicity）的除子（divisor）。这个论证算是 Stepanov 的后代，可是在整数环上重数哪那么好找，那差不多相当于给整数求导之类的事。玩具式情境里那套简单又新的 Fourier 分析路数，让我们去琢磨：要是想让同一套戏法反复生效，还得用原生自守的（natively automorphic）方式来玩，能不能把 theta 提升（theta lifts）串成一串。就是那句话：对于长度为 $X$ 的 von Mangoldt 和，考虑到每一次提升都像是在模仿重数，Claude 提议的 theta 提升链长度是 $sqrt(X)$。（不然还能是什么呢？）

这番论证里塞进来的数学多得惊人，远远超过我当年做学生时以为会用到的阵仗。我直觉这玩意很快就会被大幅简化，没准当下就能简化。不过我希望，在“亲眼看见数论所有的美聚到一块儿”这件事上，我只是最早的一批人之一；以后那些真正爱数学的人，都能尝到这种超越的滋味。

眼下这论证长得离谱；虽然形式化已经搞定了，要照例甩出一份塞满细节、大得根本没法读的稿子也不难，但在我自己的路数上，我才刚迈出一步。我打算拼尽全力把这论证和它那些可能的简化看明白，再把这份明白传出去——去聊它，去好好把它写出来。

在这个数学正闹革命的年代，我希望这论证能露个缝，让我们瞧见前面等着我们的奇迹，也让我们看到：在最简单的东西里，我们马上就会撞见怎样的欢喜和惊奇。

#pagebreak()
#secnum[1]

有些话，摆明了我是该说一说的。

挑在这么个节骨眼上，时机真是烂透了。要是能由着我来，我早得多就全弄完了。见鬼，严格地早于这个时代，那当然爽得多。这一切是周日深夜砸到我头上的，我给 Dario 发了条消息：“假设性地讲，假如我已经……”最后问到我到底能不能发声。我们去把这事理顺了，事实就是有一条规矩得守，哪怕我确实问过一些越来越离谱的脑洞。这题从小到大就是我心里数学上的神圣之物；对伟大的智识追求是怎么被对待的，我特别敏感——虽然我自己毛病多得要命。我们的领导层，还有我找来商量的几位靠谱数学家，在这种关头该怎么办这件事上看法出奇地一致（物理学家和数学家偶尔也是能对上频道的……）；至于“我再等下去就活不成了”这种念头，纯属我单方面的锅。有一种明摆着的犬儒说法，拿时机做文章，那是扯淡；让我庆幸的是，我所处的境况能让这种说法一眼假。

这就把我们推到了这么个相当怪异的处境里——也是这个时代才造就的处境：我还没把这数学周围的一大片地盘吃透呢，就已经把一份完整论证摆到世人面前了。既然硬要贴出一份大得没法看、纯属“slop”#footnote[我当然自娱自乐折腾了一番，结果搞出了 250,000+ 页。

  #h(1em)Claude 挺逗地管它叫 GRH……“book”（书）——我翻开 Theorem 1 看了一眼，开头就写着：因为实数是全序的，所以若 $sigma != 1/2$，则 $sigma > 1/2$ 或 $sigma < 1/2$。]（垃圾）的玩意儿显然太掉价了，我就决定只放 Lean。

换个口风：我想夸的人可太多了，等正式写文的时候我会认认真真夸到位，哎，漏了谁还请多包涵——名单里包括 Manjul Bhargava、Kai Gill、Hamish Kerr、Max Leiter、John Ma、Tal Magdish、Chris Paika、Maksym Radziwiłł、Jascha Sohl-Dickstein、Peter Sarnak、Jarred Sumner、Amir Tajdini，尤其是 David Dohan、Ben Michel、Ralph Furman、Eric Price、Cora Vinther，还有我那帮神仙同事们。我想让他们以这为荣。

OpenAI 那些搞数学成果的人品味挺不错，我也乐意给他们点个赞。前阵子 Ehrhart 猜想就是个挺有品位的挑题；再往下盘一盘、把等号情形算出来之后，我看到了对 Monge-Ampère 方程解的精准拿捏，当场就明白 Navier–Stokes 迟早得倒。同样，他们闷声不响地把 Siegel 论证塞进去——那个结果被 $(2,3,6)$-三角群技巧严格打爆了——又是一次好品味的体现；虽然我没公开说破，但我一眼就认出那就是没带重数的 Stepanov，尽管直到这场疯疯癫癫、席卷整个数论的龙卷风刮起来时，我才看明白：只要熬够通宵、赔上足够多身体本钱，这题就会倒——当时我手里捏着 Weil 和 Deligne 那个 $q^N = M^k + R$ 的纯符号证明。

#pagebreak(weak: true)
#secnum[2]

前面那段经历我曾走过一遭意识流的瞎逛：跟 Claude 在离谱的混乱里把论证的零碎一块块捞出来；不过有位信得过的数学家劝我，别绕弯子了，直接上干货，再列个时间线。我得着重说一句：一旦我们借着那个“原生自守的”（natively-automorphic）行列式在 $O(2,n)$ 上捞到了重数 $2$——这正是我顺着左端那个确定的符号#footnote[
  $ sum_(h, x_1, ..., x_k) t(x_1) dots.c t(x_k) dot e_q (h (x_1 dot x_2 + dots.c + x_(k-1) dot x_k)), $

  先对 $h$ 求和，凑左端；比如二次系数也一样：Bertini 从中阶上同调吐出一个确定的符号，跟 $M^k$ 上那个差一档（one off），而后者是右端的零模；$R$ 就是平方根级别的质量，差个一英寸不到的意思，按 Katz 的说法，就是把 Parseval 迭代 $k$ 次；符号反过来意味着逆根不会互相抵消，QED；向量化就往高维走。Katz 某篇论证里的 Gabber 超曲面让人想起那个二次曲面，后者是想把族 $chi |-> chi("disc")$ 上做平均这件事简化一下时冒出来的，对应到 $a |-> y(dot)^a$，其中 $y$ 是阶为 $\#|mu_K|$ 的归一化 Gauss 和，它经由 $theta$ 住在 $"GL"_2$ 的 $\#|mu_K|$ 重覆盖上；$y(c dot c')$ 跟 $y(c) dot y(c')$ 的互反律显出某种完全图，压扁成上面那个“路径”二次曲面，Gauss 和的抵消换成了迭代的 Parseval。
] $q^N = M^k + R$（在函数域上意味着全纯性/自守性）一路找过来的行列式——再往后随着 theta 提升越叠越多、重数越攒越多，我们就稳操胜券了；不过说实话，我也算是“出了自己的舒适圈”，毕竟我个人对高阶群上的自守形式实在没多少功底（年轻时傻倔留下的病根）。我还得强调一点：这论证里八成已经被我塞进了不少稀奇古怪的次优选项，我估计很快就会冒出短得多的证法，虽然我自己（眼下！）还没腾出工夫去找。

下面就是 Claude 翻箱倒柜检索后给的一份粗略时间线。#footnote[那些靠着 Claude 的技术功底、让我那点模糊直觉居然跑通的地方，今天对我来说当然没那么熟了；回过头想，其中有些说法我大概还得改改。凡是 Claude 当专家、我纯属门外汉的地方，我多少是在复述一份“slop”总结，听起来可能一头雾水，抱歉啦，不过 Lean 应该足以把一切说清楚。我只是眼下在相关门道上太菜了；希望读者能看出这论证的跨度！
]

+ 2026年10月6日：Stepanov 行列式。

+ 2026年10月9日：在 $K$ 中惰性的素数 $p$ 对应的 CM 曲线上，$D^p equiv 0$，其中 $D$ 是不变导子（invariant derivation）；并且 $frac(D^a dot theta(0), Omega^a)$ 能被 $p^(frac(a,p)+frac(a,p^3)+ dots.c - O(log a))$ 整除。

+ 2026年10月19日起：$q^N = M^k + R$，用上 $x_1 dot x_2 + dots.c + x_(k-1) dot x_k$，想要 $N$ 的“自守性”，因为 $mu$ 是从 $"GL"_5$ 六重覆盖上的 $theta$ 来的、作为 theta 的周期积分而自守的；二次曲面在对应的 CM 上有自然的解释（比如 $bb(C) slash bb(Z)[omega]$ 作为 Weil#footnote[    这里显然有很多东西被有损压缩了；不过尤其是跟 Sussman 一起硬啃过 Bałaban 那神级归纳法之后，我不得不自己掂量一下：想为某种 $bb(F)_1$（比如 à la Borger 那种）死磕，得有多费劲。
]，把 Poincaré 丛挂在各条边上得到各个 $theta$）。

+ 2026年10月6日起：靠一个行列式凑出 $W(bold(1)_S) >= 0$，又一次把它当成重数为一的 Stepanov 来理解；自举（bootstrap）！！

+ 2026年10月20日：彻底切到 $Lambda$，也就是 $sum_(n <= X) Lambda(n) dot (frac(X,n) - 1)_+ - X log X + (1+gamma) dot X$；Guinand–Weil 本身带那个符号，方差检验函数技巧好让东西显得像迹公式（trace-formula-like）（不过我怎么在 $n$ 上做鸽笼 / Turán？在 $X$ 上？就在它上面？），Mehta 式的积分，在扭（twists）上或者在无穷远处……

+ 2026年10月8日：$W(bold(1)_("(0,1]") + (∼ X^eta) dot bold(1)_("(0,1/X]")) >= 0$ 给出 $> 1 - eta$。

+ 2026年10月14日：装有目标周期的 $W(dot)$ 行列式，确实就是 GGP 周期；取值 $0$、$1$ 对应交错的权（interlacing weights），或者最多 $m$ 个非交错的。

+ 2026年11月15日：全定酉群之间的迭代 theta 提升 $U(X_0) -> U(X_1) -> dots.c -> U(X_m)$，$pi |-> pi plus.square mu_j[t]$，攒出重数 $m$。差不多该把 $m$ 设成 $sqrt(X)$ 上下了……

+ 2026年11月15日：提升的范数、水平（level），以及 $m$ 阶项的相消，整除性靠 Chowla–Selberg、Weyl 和 Siegel 质量证出来。

+ 2026年11月15日：关于 $m$ 重迭代提升整除性的一个够用的下界。

+ 2026年10月6日：照着 $bb(F)_(q^n) slash bb(F)_q$ 上的鸽笼原理打比方，搭出 Iwasawa 塔。

+ 2026年11月15日：跷跷板（seesaw）：迭代提升的周期是个 Bessel 周期，跟 Hecke 特征无关，Rallis。

+ 2026年10月6日：Bost 斜率不等式。

+ 2026年11月15日：把每一次提升的“代价”算准，表明先验地会卡在 $2 slash 3$；试着捞出主项再把常数挪到函数域，或者靠做扭干掉它；需要“除法”。

+ 2026年11月15日：跨 Hecke 特征把整结构粘起来，凑出一个“gcd”，也就是额外的平均。

+ 2026年10月14日：相对迹公式，在另一个半平面论证里经由 $"GL"_5$ 上 $mu$ 的自守性（六重覆盖）现身，再用 Cauchy–Schwartz 归结到某个适当投影的 Poincaré 级数范数的界，也就是整结构各列的近似正交性。

+ 2026年11月15日：对于 $H^1 (frak(o)_E [frac(1, ell)], bb(Q)_ell slash bb(Z)_ell (-e))$ 里那些靠做扭没法干掉的类，硬刚一个 Vandiver 的大幅弱化。#footnote[  这可一点不弱了！！我信随之能推出好几个 $bb(Z)$ 的 $K$-群消失（vanishing）；至于循环性，没准能到 $100$ 上下？我有 Lichtenbaum，所以对付这些 $K$ 时心里很有底。
]

+ 2026年11月15日：算余体积（covolumes）、theta 级数的指数，还有提升与形式之间的同余。

+ 2026年10月19日：挑准 Iwasawa 塔，具体来说是用 Behrend！！#footnote[就是这种花活，按我直觉看显然用不着。
]

+ 2026年11月16日：GRH。