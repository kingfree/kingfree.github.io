---
title: ERC20 代币标准
categories: 翻译
tags: 区块链
---

*原文链接：<https://theethereum.wiki/w/index.php/ERC20_Token_Standard>*

[ERC20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) 代币标准描述了基于以太坊代币合约的一系列待实现的方法和事件。

## ERC20 代币标准接口

下面是一个适配 ERC20 标准要求的方法和事件的合约接口：

```java
// ----------------------------------------------------------------------------
// ERC 代币标准 #20 接口
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
// ----------------------------------------------------------------------------
contract ERC20Interface {
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}
```

以太坊区块链上的多数主要的代币都是兼容 ERC20 的。[GNT](https://theethereum.wiki/w/index.php/Golem_Network_Token) 是唯一一个部分兼容 ERC20 的，它没有实现 `approve(...)`、`allowance(..)` 和 `transferFrom(...)` 方法和 `Approval(...)` 事件。

部分代币包含了更多的描述信息：

```java
    string public constant name = "代币名称";
    string public constant symbol = "SYM";
    uint8 public constant decimals = 18;  // 18 是小数点后最大长度
```

## 代币合约是怎么运行的？

下面是代币合约的一个片段，证明代币合约如何维护以太坊账户的代币余额的：

```java
contract TokenContractFragment {
 
    // 每个账户的余额
    mapping(address => uint256) balances;
 
    // 账户拥有者认可的向其他账户的转账
    mapping(address => mapping (address => uint256)) allowed;
 
    // 获取账户 `tokenOwner` 的代币余额
    function balanceOf(address tokenOwner) public constant returns (uint balance) {
        return balances[tokenOwner];
    }
 
    // 从拥有者账户转账到其他账户
    function transfer(address to, uint tokens) public returns (bool success) {
        balances[msg.sender] = balances[msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        Transfer(msg.sender, to, tokens);
        return true;
    }
 
    // 将 `tokens` 个代币从地址 `from` 转给 `to`
    // transferFrom 方法用于提现工作流，允许合约以你的名义发送代币、
    // 转让代币或者收取费用。除非 _from 账户已经通过某种机制得到了
    // 发送者的授权，否则将返回失败。我们期望标准 API 如下：
    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        balances[from] = balances[from].sub(tokens);
        allowed[from][msg.sender] = allowed[from][msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        Transfer(from, to, tokens);
        return true;
    }
 
    // 允许 `spender` 从你的账户提现多次直到达到 `tokens`。
    // 方法被再次调用则会用 _value 覆盖当前值。
    function approve(address spender, uint tokens) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        Approval(msg.sender, spender, tokens);
        return true;
    }
}
```

### 代币余额

假设某个代币合约有下面两个代币持有者：

- `0x1111` 余额 100 单位
- `0x2222` 余额 200 单位

代币合约余额数据结构包含如下信息：
```
balances[0x1111] = 100
balances[0x2222] = 200
```

`balanceOf(...)` 方法返回如下值：
```
tokenContract.balanceOf(0x1111) 将返回 100
tokenContract.balanceOf(0x2222) 将返回 200
```

### 代币转账

如果 `0x1111` 想转给 `0x2222` 10 个代币，`0x1111` 要执行该方法：
```
tokenContract.transfer(0x2222, 10)
```

代币合约的 `transfer(...)` 方法会更新包含如下信息的 `balances` 数据结构：
```
balances[0x1111] = 90
balances[0x2222] = 210
```

`balanceOf(...)` 方法现在返回如下：
```
tokenContract.balanceOf(0x1111) 将返回 90
tokenContract.balanceOf(0x2222) 将返回 210
```

### 授权和转自方法

如果 `0x1111` 想要授权 `0x2222` 转一些代币给 `0x2222`，`0x1111` 需要执行：
```
tokenContract.approve(0x2222, 30)
```

授权数据结构现在包含如下信息：
```
tokenContract.allowed[0x1111][0x2222] = 30
```

如果 `0x2222` 想稍后从 `0x1111` 转给他自己一些代币，`0x2222` 要执行 `transferFrom(...)` 方法：
```
tokenContract.transferFrom(0x1111, 0x2222, 20)
```

余额数据结构将变为这样：
```
tokenContract.balances[0x1111] = 70
tokenContract.balances[0x2222] = 230
```

授权数据结构将包含如下信息：
```
tokenContract.allowed[0x1111][0x2222] = 10
```

`0x2222` 仍然可以从 `0x1111` 花费 10 个代币。

`balanceOf(...)` 方法将返回如下值：
```
tokenContract.balanceOf(0x1111) 将返回 70
tokenContract.balanceOf(0x2222) 将返回 230
```

##  Fixed Supply Token 合约例程


下面是 [Fixed Supply Token](https://github.com/bokkypoobah/Tokens#fixed-supply-token) 的合约，初始化给合约所有者 1,000,000 个单位的代币，并有最大 18 小数位限制：

```java
pragma solidity ^0.4.18;

// ----------------------------------------------------------------------------
// 'FIXED' '样例 Fixed Supply Token' 代币合约
//
// Symbol      : FIXED
// Name        : 样例 Fixed Supply Token
// Total supply: 1,000,000.000000000000000000
// Decimals    : 18
//
// Enjoy.
//
// (c) BokkyPooBah / Bok Consulting Pty Ltd 2017. The MIT Licence.
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// 安全的数学计算
// ----------------------------------------------------------------------------
library SafeMath {
    function add(uint a, uint b) internal pure returns (uint c) {
        c = a + b;
        require(c >= a);
    }
    function sub(uint a, uint b) internal pure returns (uint c) {
        require(b <= a);
        c = a - b;
    }
    function mul(uint a, uint b) internal pure returns (uint c) {
        c = a * b;
        require(a == 0 || c / a == b);
    }
    function div(uint a, uint b) internal pure returns (uint c) {
        require(b > 0);
        c = a / b;
    }
}


// ----------------------------------------------------------------------------
// ERC 代币标准 #20 接口
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
// ----------------------------------------------------------------------------
contract ERC20Interface {
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}


// ----------------------------------------------------------------------------
// 接受授权并在一次调用中执行方法
//
// 借用自 MiniMeToken
// ----------------------------------------------------------------------------
contract ApproveAndCallFallBack {
    function receiveApproval(address from, uint256 tokens, address token, bytes data) public;
}


// ----------------------------------------------------------------------------
// 所有者合约
// ----------------------------------------------------------------------------
contract Owned {
    address public owner;
    address public newOwner;

    event OwnershipTransferred(address indexed _from, address indexed _to);

    function Owned() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
    function acceptOwnership() public {
        require(msg.sender == newOwner);
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        newOwner = address(0);
    }
}


// ----------------------------------------------------------------------------
// ERC20 代币，包含附加的符号、名称、位数和初始化的代币
// ----------------------------------------------------------------------------
contract FixedSupplyToken is ERC20Interface, Owned {
    using SafeMath for uint;

    string public symbol;
    string public  name;
    uint8 public decimals;
    uint public _totalSupply;

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;


    // ------------------------------------------------------------------------
    // 构造器
    // ------------------------------------------------------------------------
    function FixedSupplyToken() public {
        symbol = "FIXED";
        name = "Example Fixed Supply Token";
        decimals = 18;
        _totalSupply = 1000000 * 10**uint(decimals);
        balances[owner] = _totalSupply;
        Transfer(address(0), owner, _totalSupply);
    }


    // ------------------------------------------------------------------------
    // 总额
    // ------------------------------------------------------------------------
    function totalSupply() public constant returns (uint) {
        return _totalSupply  - balances[address(0)];
    }


    // ------------------------------------------------------------------------
    // 获取 `tokenOwner` 的余额
    // ------------------------------------------------------------------------
    function balanceOf(address tokenOwner) public constant returns (uint balance) {
        return balances[tokenOwner];
    }


    // ------------------------------------------------------------------------
    // 从代币所有者转给 `to`
    // - 所有者账户必须有足够转账的余额
    // - 允许转账金额为 0
    // ------------------------------------------------------------------------
    function transfer(address to, uint tokens) public returns (bool success) {
        balances[msg.sender] = balances[msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        Transfer(msg.sender, to, tokens);
        return true;
    }


    // ------------------------------------------------------------------------
    // 所有者授权 `spender` 可以从自己账户里 transferFrom(...) 转 `tokens` 个代币
    //
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
    // 注意这里没有检查授权的双花攻击，因为这应该由用户接口实现
    // ------------------------------------------------------------------------
    function approve(address spender, uint tokens) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        Approval(msg.sender, spender, tokens);
        return true;
    }


    // ------------------------------------------------------------------------
    // 转 `tokens` 个代币从 `from` 到 `to`
    // 
    // 调用该方法之前应该已经调用过 approve(...) 授权从 `from` 账户扣款并且
    // - 来源用户必须有足够转账的余额
    // - 消费者有足够的消耗余额
    // - 允许值为 0 的交易
    // ------------------------------------------------------------------------
    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        balances[from] = balances[from].sub(tokens);
        allowed[from][msg.sender] = allowed[from][msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        Transfer(from, to, tokens);
        return true;
    }


    // ------------------------------------------------------------------------
    // 返回所有者给目标用户授权转账的金额
    // ------------------------------------------------------------------------
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }


    // ------------------------------------------------------------------------
    // 所有者可以授权给 `spender` 用 transferFrom(...) 从自己账上转 `tokens` 个代币。
    // `spender` 合约方法将致谢 `receiveApproval(...)`
    // ------------------------------------------------------------------------
    function approveAndCall(address spender, uint tokens, bytes data) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        Approval(msg.sender, spender, tokens);
        ApproveAndCallFallBack(spender).receiveApproval(msg.sender, tokens, this, data);
        return true;
    }


    // ------------------------------------------------------------------------
    // 不支持 ETH
    // ------------------------------------------------------------------------
    function () public payable {
        revert();
    }


    // ------------------------------------------------------------------------
    // 所有者可以将意外发送的 ERC20 代币
    // ------------------------------------------------------------------------
    function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {
        return ERC20Interface(tokenAddress).transfer(owner, tokens);
    }
}
```

参见 [20 分钟在以太坊上发布你自己的代币](https://medium.com/bitfwd/how-to-issue-your-own-token-on-ethereum-in-less-than-20-minutes-ac1f8f022793) 获取如何部署代币合约的步骤。

## 以太坊代币的更多信息

- Ethereum.org 代币页面: https://www.ethereum.org/token.
- Etherscan 流行的代币精选: https://etherscan.io/tokens
- EtherScan ERC20 代币搜索: https://etherscan.io/token-search
- HumanStandardToken: 一种提供了公共变量名称、位数、符号和版本的 ERC20 标准，使得合约易于阅读和无需配置: https://github.com/ConsenSys/Tokens/blob/master/Token_Contracts/contracts/HumanStandardToken.sol
- Token Factory 可以让你创建自己的代币: https://tokenfactory.surge.sh
- 库:
  - OpenZeppelin: https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts/token
  - Minime 代币协议允许自克隆，可以用于投票或者为单独的应用分离出代币: https://github.com/Giveth/minime
