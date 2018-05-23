---
title: Dagger Hashimoto
categories: 翻译
tags: 
  - 区块链
  - 算法
---

*原文链接：<https://github.com/ethereum/wiki/blob/master/Dagger-Hashimoto.md>*

## 介绍

Dagger Hashimoto 是以太坊 1.0 挖矿算法的一个规范。Dagger Hashimoto 目标是实现如下两个目标：

1. **反电路特性**: 为算法设计专用硬件的好处应当尽可能地小。理想情况下，相对于使用传统计算机的空闲 CPU 资源挖矿的用户，开发硬件电路的用户也只能有极小的加速效果而缺乏经济效益。
2. **轻量客户端可验证性**: 一个区块应当在轻量客户端上相对的容易进行验证。

另外，如果我们需要的话，也定义了如何满足第三个目标，但是相应地也会增加额外的复杂性和花销：
3. **全量链存储**: 矿主应存储整条区块链的状态。（由于以太坊状态树不规则的结构，我们期望有一些可行的剪枝，去最小化某些常用的合约操作）

Dagger Hashimoto 建立在之前两个关键的工作之上：

* [Hashimoto](http://vaurum.com/hashimoto.pdf) 是由 Thaddeus Dryja 设计的通过限制输入输出以达成反电路特性的算法，比如在挖矿进程中限制内存读取的因子。理论是，RAM 原则上是一种比计算更通用的成分，并且已经有数十亿美元的研究试图对不同的近乎随机访问模式的（由于“随机内存访问”）用例对它进行优化；因此，现有的 RAM 在评估算法时已较接近最优。Hashimoto 使用区块链作为来源数据，同时满足了上面的 (1) 和 (3)。
* [Dagger](http://vitalik.ca/ethereum/dagger.html) 是由 Vitalik Buterin 设计的用于在有向无环图（DAG）上实现计算上对内存难但验证对内存易的算法。核心理念是每个单独的 nonce 只需要一大棵数据树的一小部分，并且禁止矿主重新计算每个 nonce 对应的子树——因此需要存储整棵树——但是允许对单独的 nonce 进行验证。Dagger 意义在于指出了存在一种类似于 [Scrypt](http://en.wikipedia.org/wiki/Scrypt) 的对内存难算法，不仅对内存难，而且对当内存难度增加到真正安程度的验证也非常难。然而，Dagger 已经被 [Sergio Lerner](https://bitslog.wordpress.com/2014/01/17/ethereum-dagger-pow-is-flawed/) 证明容易受到共享内存硬件加速的影响，并转而支持其他途径的研究去了。

在 Dagger 和 Dagger Hashimoto 之间的处理不是我们本次关注的重点，包括：

* “基于区块链的工作证明”——一种为区块链上运行的合约证明工作的方法。因为它有受到溢出攻击的漏洞所以被废弃了，攻击者可以创建分支并且用它们有的一种机密的快速“trapdoor”执行机制的合约填充来它们。
* “随机电路”——一个由 Vlad Zamfir 开发的工作证明算法，通过对每 1000 个 nonce 生成一段新程序实现——本质上，每次选择一个新的散列算法是比重新配置 FPGA 更快。这种算法被搁置的原因在于很难看出人们可以用什么机制来产生随机的程序，这使得专门化的收益降低；然而，我们没有看到为什么这个概念不能实现的根本原因。

Dagger Hashimoto 和 Hashimoto 的区别在于，Dagger Hashimoto 没有使用区块链作为数据源，而是使用了一个自定义生成的 1GB 数据集，该数据集根据每 N 块的块数据进行更新。该数据集是使用 Dagger算法生成的，允许对每个 nonce 进行有效计算，用于轻客户端验证算法。Dagger Hashimoto 和 Dagger 的区别还在于，与原来的 Dagger 不同，用于查询块的数据集是半永久性的，只是偶尔更新（比如每周一次）。这意味着用于生成数据集的部分工作接近于零，因此 Sergio Lerner 关于共享内存速度的争论变得微不足道了。

## DAG 生成

算法定义在下面的 Python 代码中。首先，我们给出 `encode_int`，用于将指定精度的非负整数转为字符串。它的逆算法也给出：

```python
NUM_BITS = 512

def encode_int(x):
    "将整数 x 编码为 64 字符的大端序格式"
    o = ''
    for _ in range(NUM_BITS / 8):
        o = chr(x % 256) + o
        x //= 256
    return o

def decode_int(s):
    "从大端序字符串解码为整数 x"
    x = 0
    for c in s:
        x *= 256
        x += ord(c)
    return x
```

`sha3` 接收一个整数并输出一个整数，而 `dbl_sha3` 则运行了两遍 `sha3`；代码实现：

```python
from pyethereum import utils
def sha3(x):
    if isinstance(x, (int, long)):
        x = encode_int(x)
    return decode_int(utils.sha3(x))

def dbl_sha3(x):
    if isinstance(x, (int, long)):
        x = encode_int(x)
    return decode_int(utils.sha3(utils.sha3(x)))    
```

### 参数

算法需要的参数如下：

```python
SAFE_PRIME_512 = 2**512 - 38117     # 小于 2**512 的最大安全素数

params = {
      "n": 4000055296 * 8 // NUM_BITS,  # 数据集大小（4 GB）；必须是 65536 的倍数
      "n_inc": 65536,                   # 每 n 个周期增长的值；必须是 65536 的倍数
                                        # 并且每年当 epochtime=20000 时增加 882 MB 
      "cache_size": 2500,               # 轻客户端缓存大小（由客户端决定；非算法一部分）
      "diff": 2**14,                    # 难度（适用于块验证）
      "epochtime": 100000,              # 块中每世代长度（数据集更新频率）
      "k": 1,                           # 结点的父结点数量
      "w": w,                           # 用于模幂运算散列
      "accesses": 200,                  # Hashimoto 时访问数据集的次数
      "P": SAFE_PRIME_512               # 用于散列和随机数生成的安全素数
}
```

`P` 是一个素数并满足 `log₂(P)` 略小于 512，以对应我们使用的 512 位表示的数字。注意实际上只需要存储 DAG 的后半部分，因为从 1 GB 开始的每年的内存增长就会是 441 MB。

### Dagger 图构建

有向图的建立过程如下：

```python
def produce_dag(params, seed, length):
    P = params["P"]
    picker = init = pow(sha3(seed), params["w"], P)
    o = [init]
    for i in range(1, length):
        x = picker = (picker * init) % P
        for _ in range(params["k"]):
            x ^= o[x % i]
        o.append(pow(x, params["w"], P))
    return o
```

算法从某个随机结点开始计算 `sha3(seed)`，在此之上依次添加其他结点。创建新结点时，会随机对小于 `i` 的来计算种子的模幂（用上面的 `x % i`），结点值还用于计算 `x`，然后用基于 XOR 的证明算法来生成 `i` 上的 `x`。该算法要求 DAG 是可以顺序访问的，并且只能在已知当前结点时才能访问下一个结点。最后，用模幂运算计算散列值。

算法依赖于附录描述的几个数论方面的结论。

## 轻量客户端验证

上述图构造的目的是通过计算仅有少量节点的子树并仅需要少量辅助存储器来重构图中的每个单独节点。注意当 k=1 时，子树仅是 DAG 首个元素后的一条链。

DAG 上的轻客户端计算方法如下：

```python
def quick_calc(params, seed, p):
    w, P = params["w"], params["P"]
    cache = {}

    def quick_calc_cached(p):
        if p in cache:
            pass
        elif p == 0:
            cache[p] = pow(sha3(seed), w, P)
        else:
            x = pow(sha3(seed), (p + 1) * w, P)
            for _ in range(params["k"]):
                x ^= quick_calc_cached(x % p)
            cache[p] = pow(x, w, P)
        return cache[p]

    return quick_calc_cached(p)
```

本质上，这只是对上面算法的一种简写，其中删除了计算整个 DAG 值的循环，并利用记忆化递归实现结点查找。注意，k=1 时不需要缓存，进一步的优化会预先计算出 DAG 的前几千个值并缓存。请参阅附录中的实现。

## DAG 的双缓冲区

In a full client, a [*double buffer*](https://en.wikipedia.org/wiki/Multiple_buffering) of 2 DAGs produced by the above formula is used.  The idea is that DAGs are produced every `epochtime` number of blocks according to the params above.  The client does not use the latest DAG produced, but the previous one. The benefit of this is that it allows the DAGs to be replaced over time without needing to incorporate a step where miners must suddenly recompute all of the data. Otherwise, there is the potential for an abrupt temporary slowdown in chain processing at regular intervals and dramatically increasing centralization and thus 51% attack risks within those few minutes before all data is recomputed.

The algorithm used to generate the actual set of DAGs used to compute the work for a block is as follows:

```python
def get_prevhash(n):
    from pyethereum.blocks import GENESIS_PREVHASH 
    from pyethreum import chain_manager
    if n <= 0:
        return hash_to_int(GENESIS_PREVHASH)
    else:
        prevhash = chain_manager.index.get_block_by_number(n - 1)
        return decode_int(prevhash)

def get_seedset(params, block):
    seedset = {}
    seedset["back_number"] = block.number - (block.number % params["epochtime"])
    seedset["back_hash"] = get_prevhash(seedset["back_number"])
    seedset["front_number"] = max(seedset["back_number"] - params["epochtime"], 0)
    seedset["front_hash"] = get_prevhash(seedset["front_number"])
    return seedset

def get_dagsize(params, block):
    return params["n"] + (block.number // params["epochtime"]) * params["n_inc"]

def get_daggerset(params, block):
    dagsz = get_dagsize(params, block)
    seedset = get_seedset(params, block)
    if seedset["front_hash"] <= 0:
        # No back buffer is possible, just make front buffer
        return {"front": {"dag": produce_dag(params, seedset["front_hash"], dagsz), 
                          "block_number": 0}}
    else:
        return {"front": {"dag": produce_dag(params, seedset["front_hash"], dagsz),
                          "block_number": seedset["front_number"]},
                "back": {"dag": produce_dag(params, seedset["back_hash"], dagsz),
                         "block_number": seedset["back_number"]}}
```

## Hashimoto

The idea behind the original Hashimoto is to use the blockchain as a dataset, performing a computation which selects N indices from the blockchain, gathers the transactions at those indices, performs an XOR of this data, and returns the hash of the result. Thaddeus Dryja's original algorithm, translated to Python for consistency, is as follows:

```python
def orig_hashimoto(prev_hash, merkle_root, list_of_transactions, nonce):
    hash_output_A = sha256(prev_hash + merkle_root + nonce) 
    txid_mix = 0
    for i in range(64):
        shifted_A = hash_output_A >> i 
        transaction = shifted_A % len(list_of_transactions) 
        txid_mix ^= list_of_transactions[transaction] << i 
    return txid_max ^ (nonce << 192)
```

Unfortunately, while Hashimoto is considered RAM hard, it relies on 256-bit arithmetic, which has considerable computational overhead. To address this issue, dagger hashimoto only uses the least significant 64 bits when indexing its dataset.

```python
def hashimoto(dag, dagsize, params, header, nonce):
    m = dagsize / 2
    mix = sha3(encode_int(nonce) + header)
    for _ in range(params["accesses"]):
        mix ^= dag[m + (mix % 2**64) % m]
    return dbl_sha3(mix)
```

The use of double sha3 allows for a form of zero-data, near-instant pre-verification, verifying only that a correct intermediate value was provided. This outer layer of PoW is highly ASIC-friendly and fairly weak, but exists to make DDoS even more difficult since that small amount of work must be done in order to produce a block that will not be rejected immediately. Here is the light-client version:

```python
def quick_hashimoto(seed, dagsize, params, header, nonce):
    m = dagsize // 2
    mix = sha3(nonce + header)
    for _ in range(params["accesses"]):
        mix ^= quick_calc(params, seed, m + (mix % 2**64) % m)
    return dbl_sha3(mix)
```

## 挖矿和验证

Now, let us put it all together into the mining algo:

```python
def mine(daggerset, params, block):
    from random import randint
    nonce = randint(0, 2**64)
    while 1:
        result = hashimoto(daggerset, get_dagsize(params, block),
                           params, decode_int(block.prevhash), nonce)
        if result * params["diff"] < 2**256:
            break
        nonce += 1
        if nonce >= 2**64:
            nonce = 0 
    return nonce
```

Here is the verification algorithm:
```python
def verify(daggerset, params, block, nonce):
    result = hashimoto(daggerset, get_dagsize(params, block),
                       params, decode_int(block.prevhash), nonce)
    return result * params["diff"] < 2**256
```

Light-client friendly verification:

```python
def light_verify(params, header, nonce):
    seedset = get_seedset(params, block)
    result = quick_hashimoto(seedset["front_hash"], get_dagsize(params, block),
                             params, decode_int(block.prevhash), nonce)
    return result * params["diff"] < 2**256
```

Also, note that Dagger Hashimoto imposes additional requirements on the block header:

* For two-layer verification to work, a block header must have both the nonce and the middle value pre-sha3
* Somewhere, a block header must store the sha3 of the current seedset

# 附录

As noted above, the RNG used for DAG generation relies on some results from number theory. First, we provide assurance that the Lehmer RNG that is the basis for the `picker` variable has a wide period.  Second, we show that `pow(x,3,P)` will not map `x` to `1` or `P-1` provided `x ∈ [2,P-2]` to start.  Finally, we show that `pow(x,3,P)` has a low collision rate when treated as a hashing function.

## Lehmer 随机数生成器

While the `produce_dag` function does not need to produce unbiased random numbers, a potential threat is that `seed**i % P` only takes on a handful of values. This could provide an advantage to miners recognizing the pattern over those that do not.

To avoid this, a result from number theory is appealed to. A [*Safe Prime*](https://en.wikipedia.org/wiki/Safe_prime) is defined to be a prime `P` such that `(P-1)/2` is also prime.  The *order* of a member `x` of the [multiplicative group](https://en.wikipedia.org/wiki/Multiplicative_group_of_integers_modulo_n) `ℤ/nℤ` is defined to be the minimal `m` such that <center><pre>xᵐ mod P ≡ 1</pre></center>
Given these definitions, we have:

> Observation 1. Let `x` be a member of the multiplicative group `ℤ/Pℤ` for a safe prime `P`.  If `x mod P ≠ 1 mod P` and `x mod P ≠ P-1 mod P`, then the order of `x` is either `P-1` or `(P-1)/2`.

*Proof*.  Since `P` is a safe prime, then by [Lagrange's Theorem][Lagrange] we have that the order of `x` is either `1`, `2`, `(P-1)/2`, or `P-1`.

The order of `x` cannot be `1`, since by Fermat's Little Theorem we have:
<center><pre>x<sup>P-1</sup> mod P ≡ 1</pre></center>
Hence `x` must be a multiplicative identity of `ℤ/nℤ`, which is unique.  Since we assumed that `x ≠ 1` by assumption, this is not possible.

The order of `x` cannot be `2` unless `x = P-1`, since this would violate that `P` is prime.
<div align="right">◻</div>

From the above proposition, we can recognize that iterating `(picker * init) % P` will have a cycle length of at least `(P-1)/2`.  This is because we selected `P` to be a safe prime approximately equal to be a higher power of two, and `init` is in the interval `[2,2**256+1]`.  Given the magnitude fo `P`, we should never expect a cycle from modular exponentiation.

When we are assigning the first cell in the DAG (the variable labeled `init`), we compute `pow(sha3(seed) + 2, 3, P)`.  At first glance, this does not guarantee that the result is neither `1` nor `P-1`.  However, since `P-1` is a safe prime, we have the following additional assuance, which is a corollary of Observation 1:

> Observation 2. Let `x` be a member of the multiplicative group `ℤ/Pℤ` for a safe prime `P`, and let `w` be a natural number. If `x mod P ≠ 1 mod P` and `x mod P ≠ P-1 mod P`, as well as `w mod P ≠ P-1 mod P` and `w mod P ≠ 0 mod P`, then `xʷ mod P ≠ 1 mod P` and `xʷ mod P ≠ P-1 mod P`

[Lagrange]: https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(group_theory)

## 以模幂运算作为散列函数

For certain values of `P` and `w`, the function `pow(x, w, P)` may have many collisions.  For instance, `pow(x,9,19)` only takes on values `{1,18}`. 

Given that `P` is prime, then an appropriate `w` for a modular exponentation hashing function can be chosen using the following result:

> Observation 3. Let `P` be a prime; `w` and `P-1` are relatively prime if and only if for all `a` and `b` in `ℤ/Pℤ`:<center>`aʷ mod P ≡ bʷ mod P` if and only if `a mod P ≡ b mod P`</center>

Thus, given that `P` is prime and `w` is relatively prime to `P-1`, we have that `|{pow(x, w, P) : x ∈ ℤ}| = P`, implying that the hashing function has the minimal collision rate possible.

In the special case that `P` is a safe prime as we have selected, then `P-1` only has factors 1, 2, `(P-1)/2` and `P-1`.  Since `P` > 7, we know that 3 is relatively prime to `P-1`, hence `w=3` satisfies the above proposition.

## 更有效的基于缓存的验证算法

```python
def quick_calc(params, seed, p):
    cache = produce_dag(params, seed, params["cache_size"])
    return quick_calc_cached(cache, params, p)

def quick_calc_cached(cache, params, p):
    P = params["P"]
    if p < len(cache):
        return cache[p]
    else:
        x = pow(cache[0], p + 1, P)
        for _ in range(params["k"]):
            x ^= quick_calc_cached(cache, params, x % p)
        return pow(x, params["w"], P)

def quick_hashimoto(seed, dagsize, params, header, nonce):
    cache = produce_dag(params, seed, params["cache_size"])
    return quick_hashimoto_cached(cache, dagsize, params, header, nonce)

def quick_hashimoto_cached(cache, dagsize, params, header, nonce):
    m = dagsize // 2
    mask = 2**64 - 1
    mix = sha3(encode_int(nonce) + header)
    for _ in range(params["accesses"]):
        mix ^= quick_calc_cached(cache, params, m + (mix & mask) % m)
    return dbl_sha3(mix)
```

-----------------------------------

感谢下面的反馈：

* Tim Hughes
* Matthew Wampler-Doty
* Thaddeus Dryja