---
title: 零知识身份验证与支付
description: 从 Monero 环签名、Zcash zk-SNARKs，到链上分析的能与不能。延伸到零知识身份验证在私密 KYC、合规披露、捐款匿名情境的应用。
icon: material/shield-key-outline
---

# :material-shield-key-outline: 零知识身份验证与支付

「链上隐私」这个词容易让人误解。比特币的账本完全公开，每笔交易、每个地址的余额都可以查到，这是一种极端。Zcash 的屏蔽交易连金额都看不见，是另一种极端。多数情况夹在中间：地址被混淆、金额被遮蔽、但图谱仍可被推测。这篇文章拆开「链上隐私」的可见度光谱，介绍 Monero 与 Zcash 两种主流路线，讨论链上分析（chain analysis）的能与不能，最后延伸到零知识身份验证（zk-identity）在支付情境的可能应用。

## 链上隐私的可见度光谱

监控者观察一条链，会看到四个层次：

1. **账户**（Account）：谁拥有哪个地址。比特币公开，Monero 用 stealth address 隐匿。
2. **金额**（Amount）：这笔交易转了多少。比特币公开，Monero 用 RingCT 隐匿，Zcash 屏蔽交易完全隐藏。
3. **时间图谱**（Transaction Graph）：A 跟 B 之间的转账路径。比特币可重建完整图谱，Monero 用 ring signatures 制造诱饵混淆，Zcash 屏蔽交易看不到图谱。
4. **元数据**（Metadata）：交易由哪个 IP、哪个钱包客户端、什么时间点送出。所有链都仰赖 P2P 网络层的隐私（搭配 Tor、Dandelion++ 等）。

「隐私稳定币」的设计，多半在这四层中挑某几层做隐匿。四层全部隐匿的设计实际上很少。理解这四层的差别，比记住「哪个币最匿名」更有帮助。

## Monero 怎么做：环签名 + Stealth Address + RingCT

Monero 的设计来自 2013 年的 CryptoNote 白皮书，三个核心机制：

- **Stealth Address**：每笔交易产生新的一次性收款地址，从链上看不到「Alice 的地址收了 100 元」，只看到「某个一次性地址收了 100 元」。Alice 用自己的私钥能识别出哪些一次性地址是她的。
- **Ring Signatures**：寄件人签署交易时，把自己的真实签章混进其他过去交易输出的「诱饵」（decoys）中。观察者只能确定「这 16 个输出之一是真的」，但无法确定哪一个。Monero 目前默认环大小为 16。
- **RingCT**（Ring Confidential Transactions）：用 Bulletproofs+ 同态承诺隐藏金额，同时证明「输入总和等于输出总和」（没有凭空印钱）。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/monero-ring.drawio.svg" alt="Monero Ring Signature 示意：寄件人的真实签章混进 15 个诱饵中，环大小 16，观察者只能验证「16 个之一是真的」、无法反推哪一个">
</figure>

三者组合下，链上看到的是：「某个一次性地址收到一笔隐藏金额，由 16 个可能寄件人之一发送」。没有 Alice 与 Bob 的概念。

代价是区块链体积大、交易验证计算重、合规挑战大。多数 KYC 交易所自 2020 年起陆续下架 Monero。

## Zcash 怎么做：zk-SNARKs 与屏蔽池

Zcash 走的是另一条更激进的路线。屏蔽交易（shielded transaction）用 zk-SNARKs（Zero-Knowledge Succinct Non-Interactive Argument of Knowledge）证明：

- 我有花费这个 note 的权限。
- 我创造的新 note 金额总和等于消耗的 note 金额。
- 没有重复花费。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/zcash-shielded.drawio.svg" alt="Zcash 屏蔽交易：寄件人与收件人之间透过 zk-SNARK 证明连线。链上可见的部分：proof、nullifier、commitment、手续费。链上不可见的部分：寄件人地址、收件人地址、金额、图谱关联">
</figure>

整个证明在链上只有几百 bytes，验证者不需要知道金额、地址、来源。从链上看到的屏蔽交易只有「有一笔屏蔽交易发生」，看不到金额、寄件人、收件人。

Zcash 经历过几代 zk-SNARKs：

- **Sprout**（2016）：用 PGHR13，需要可信设定（trusted setup）。
- **Sapling**（2018）：升级到 Groth16，可信设定范围更小，效能大幅改善。
- **Halo 2**（2022 起逐步部署）：完全去除可信设定的需要，是密码学工程上的重大进展。

Zcash 的问题在使用率：屏蔽池（shielded pool）的使用人数远少于透明池（transparent pool），实际上多数交易仍是透明的。隐私的密码学保证再好，没有足够的屏蔽流量做混淆，被分析的风险仍在。

## 链上分析的能与不能

Chainalysis、Elliptic、TRM Labs 这类公司服务政府与金融机构，把链上资料转成可诉讼、可冻结、可追溯的情报。它们公开揭露的能力与限制：

**能做的**：

- 比特币的完整图谱重建：跨多笔交易、多个地址，把属于同一个实体的地址分群（clustering）。
- 已知交易所、混币服务、暗网市场的标签匹配。
- Zcash 透明池与屏蔽池的「进出边界」分析：屏蔽池内部不可见，但进入屏蔽池的金额与时间可看到。
- Monero 早期低环大小时代的部分还原。环大小提升到 11 之后大幅降低，到 16 后几乎不可行。

**做不到的**：

- Monero 当前环大小（16）下的真实寄件人辨识，计算上不可行。
- Zcash 完全屏蔽交易（shielded-to-shielded）的还原。
- 不公开的链上活动（如 P2P 直接交易、未上链的闪电网络通道内部）。

关键洞察是「混淆的有效性取决于使用人数」。当所有人都用屏蔽池，匿名集（anonymity set）够大，分析难度极高。当只有少数人用，反而被标记为「可疑活动」。

## 零知识身份验证：证明属性而不泄漏属性

zk-SNARKs 的应用不限于支付。把它套到「身份验证」会出现一个全新的能力：证明你具备某个属性，而不泄漏属性的具体值。

例如：

- **proof-of-age**：证明「我超过 18 岁」，不泄漏出生年月日。
- **proof-of-citizenship**：证明「我是台湾公民」，不泄漏身份证字号。
- **proof-of-uniqueness**：证明「我是个独特的人，不是 bot」，不泄漏是谁。

几个正在发展的系统：

- **World ID**（前 Worldcoin）：用 iris scan 产生独特性凭证，用户用 zk proof 证明「我是独特的人」，不泄漏 iris 资料。
- **Polygon ID**：基于 Iden3 框架，把政府、银行、医疗等机构发出的可验证凭证（Verifiable Credential）转成 zk proof。
- **Anon Aadhaar**：印度国民身份系统的 zk 包装，用户可证明「我有有效的 Aadhaar」，不泄漏号码。

这些系统共同的设计目标是：把「我证明 X」与「我把 X 揭露给谁」彻底分离。传统 KYC 流程是「我把护照影本给你，你决定信不信」。zk 身份验证是「我给你一个证明，你能验证但拿不到原始资料」。

## 支付情境的应用

零知识证明套到支付情境，能解的问题包括：

- **私密 KYC**：证明「这笔交易来自合规 KYC 过的个人」，不泄漏个人身份。对交易所是合规满足，对用户是身份保护。
- **合规披露**：监管机构需要稽查时，用户可以选择性揭露特定属性（例如「这笔超过 100 万的交易，我是合规的个人」），其他信息维持隐私。
- **捐款匿名**：捐款人可证明「我已捐赠合法可抵税金额」，不泄漏个人。对倡议组织保护金主，对主管机关仍可稽核总额。
- **薪资隐私**：员工证明「我有资格接收这个 NGO 的薪资补助」，不泄漏个人薪资水准。

理论上很乾净，实作上最大的瓶颈是「验证者要相信底层的 zk 系统」。可信设定、软件实作 bug、量子电脑对椭圆曲线的长期威胁，都是要管理的风险。

## 在地脉络：VASP 法 2026 对隐私支付的影响

台湾 VASP 法 2026（虚拟资产服务业专法）将 KYC、Travel Rule 落实到加密币交易所层级。这对隐私支付的影响有三层：

1. **交易所端**：本地交易所提供 Monero、Zcash 屏蔽交易等隐私功能会面临明确监管压力，可能下架或限制。
2. **用户端**：用户透过去中心化交易所（DEX）或 P2P 持有隐私币的途径仍开放，但匯入匯出本地法币的接口受限。
3. **倡议组织端**：接受加密币捐款的 NGO 必须在「捐款人匿名性」与「会计合规披露」之间找平衡。零知识身份验证可能成为新的选项，但生态还不成熟。

关于 VASP 法的详细条文与技术影响，见 [台湾 VASP 法 2026](../taiwan/vasp-2026.md)。对「为什么匿名支付对社运倡议重要」的整体脉络，见 [为什么匿名支付重要](../basics/payments-anonymity.md)。社群在 [匿名支付研究专题](../community/payments-research.md) 持续追踪这个方向。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-cash-multiple: 为什么匿名支付重要](../basics/payments-anonymity.md)
- [:material-currency-btc: 加密货币隐私光谱](../tools/crypto-privacy-spectrum.md)
- [:material-key-chain-variant: 端对端加密如何运作](./e2ee.md)
- [:material-atom-variant: 后量子密码概观](./post-quantum.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-cash-multiple: 匿名支付研究专题](../community/payments-research.md)
- [:material-scale-balance: 台湾 VASP 法 2026](../taiwan/vasp-2026.md)
- [:material-handshake-outline: 倡议组织的匿名捐款](../scenarios/nonprofit-anonymous-donation.md)

</div>
