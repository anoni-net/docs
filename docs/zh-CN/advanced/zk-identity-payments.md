---
title: 零知识身份验证与支付
description: 从 Monero 环签名、Zcash zk-SNARKs，到链上分析的能与不能。延伸到零知识身份验证在私密 KYC、合规披露、捐款匿名情境的应用。
icon: material/shield-key-outline
---

# :material-shield-key-outline: 零知识身份验证与支付

「链上隐私」这个词容易让人误解。比特币的账本完全公开，每笔交易、每个地址的余额都可以查到，这是一种极端。Zcash 的屏蔽交易连金额都看不见，是另一种极端。多数情况介于两者之间：地址被混淆、金额被遮蔽，但图谱仍可被推测。这篇文章拆开「链上隐私」的可见度光谱，介绍 Monero 与 Zcash 两种主流路线，讨论链上分析（chain analysis）的能与不能，最后延伸到零知识身份验证（zk-identity）在支付情境的可能应用。

## 链上隐私的可见度光谱

监控者观察一条链，会看到四个层次：

1. **账户**（Account）：谁拥有哪个地址。比特币公开，Monero 用 stealth address 隐匿。
2. **金额**（Amount）：这笔交易转了多少。比特币公开，Monero 用 RingCT 隐匿，Zcash 屏蔽交易完全隐藏。
3. **时间图谱**（Transaction Graph）：A 跟 B 之间的转账路径。比特币可重建完整图谱，Monero 用 ring signatures 制造诱饵混淆，Zcash 屏蔽交易看不到图谱。
4. **元数据**（Metadata）：交易由哪个 IP、哪个钱包客户端、什么时间点送出。所有链都仰赖 P2P 网络层的隐私，搭配 Tor，或 Dandelion++ 这类把交易广播路径打散、隐藏来源 IP 的协议。

「隐私稳定币」的设计，多半在这四层中挑某几层做隐匿，四层全部隐匿的设计实际上很少。Monero 与 Zcash 各自选了不同的组合。

## Monero 如何做到：环签名 + Stealth Address + RingCT

Monero 的设计来自 2013 年的 CryptoNote 白皮书，三个核心机制：

- **Stealth Address**：每笔交易产生新的一次性收款地址，从链上看不到「Alice 的地址收了 100 元」，只看到「某个一次性地址收了 100 元」。Alice 用自己的私钥能识别出哪些一次性地址是她的。
- **Ring Signatures**：寄件人签署交易时，把自己的真实签章混进其他过去交易输出的「诱饵」（decoys）中。观察者只能确定「这 16 个输出之一是真的」，但无法确定哪一个。Monero 目前默认环大小为 16。
- **RingCT**（Ring Confidential Transactions）：用 Pedersen 同态承诺（一种能在不揭露数字的前提下、仍可验算加总的加密承诺）隐藏金额，再以 Bulletproofs+ 范围证明确保每笔金额非负，整体证明「输入总和等于输出总和」（没有凭空印钱）。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/monero-ring.drawio.svg" alt="Monero Ring Signature 示意：寄件人的真实签章混进 15 个诱饵中，环大小 16，观察者只能验证「16 个之一是真的」、无法反推哪一个">
</figure>

三者组合下，链上看到的是：「某个一次性地址收到一笔隐藏金额，由 16 个可能寄件人之一发送」。没有 Alice 与 Bob 的概念。对照前面四层，stealth address 盖掉账户层、RingCT 盖掉金额层、ring signatures 打散图谱层，第四层元数据仍要靠 Tor 另外处理。

代价是区块链体积较大、交易验证计算重，且隐匿交易难以满足 KYC（实名验证）的合规要求。要求 KYC 的交易所自 2021 年起陆续下架 Monero，2023 至 2024 年下架规模最大（包含 Kraken 欧洲区、Binance、OKX）[^1]。

## Zcash 如何做到：zk-SNARKs 与屏蔽池

Zcash 走的是另一条更激进的路线。屏蔽交易（shielded transaction）用 zk-SNARKs（Zero-Knowledge Succinct Non-Interactive Argument of Knowledge）证明：

- 我有花费这个 note 的权限。
- 我创造的新 note 金额总和等于消耗的 note 金额。
- 没有重复花费。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/zcash-shielded.drawio.svg" alt="Zcash 屏蔽交易：寄件人与收件人之间透过 zk-SNARK 证明连线。链上可见的部分：proof、nullifier、commitment、手续费。链上不可见的部分：寄件人地址、收件人地址、金额、图谱关联">
</figure>

整个证明在链上只有几百 bytes，验证者不需要知道金额、地址、来源。从链上能看到的只有「有一笔屏蔽交易发生」这个事实。对照四层，屏蔽交易一次盖掉账户、金额、图谱三层，第四层元数据同样留给网络层处理。

Zcash 经历过几代 zk-SNARKs：

- **Sprout**（2016）：用 BCTV14（PGHR13 的改良变体），需要可信设定（trusted setup）[^2]。
- **Sapling**（2018）：升级到 Groth16，可信设定范围更小，效能大幅改善。
- **Halo 2**（2022 年 5 月随 NU5 升级启动）：完全去除可信设定的需要，是密码学工程上的重大进展。

Zcash 的问题长期在使用率：屏蔽池（shielded pool）的使用人数一度远少于透明池（transparent pool），多数交易仍是透明的（2025 年起屏蔽池占比明显上升，但完整屏蔽交易仍非全部）。隐私的密码学保证再好，没有足够的屏蔽流量做混淆，被分析的风险仍在。

## 链上分析的能与不能

链上分析是一个专门替政府与金融机构追踪加密货币金流的产业。Chainalysis、Elliptic、TRM Labs 这类公司把链上资料转成可诉讼、可冻结、可追溯的情报。它们公开揭露的能力与限制：

**能做的**：

- 比特币的完整图谱重建：跨多笔交易、多个地址，把属于同一个实体的地址分群（clustering）。
- 已知交易所、混币服务、暗网市场的标签匹配。
- Zcash 透明池与屏蔽池的「进出边界」分析：屏蔽池内部不可见，但进入屏蔽池的金额与时间可看到。
- Monero 早期低环大小时代的部分还原。环大小提升到 11、再到 16 之后，已知机率分析方法的追踪难度大幅上升[^3]。

**做不到的**：

- Monero 当前环大小（16）下的真实寄件人辨识，目前学术界尚无已发表的有效还原方法。
- Zcash 完全屏蔽交易（shielded-to-shielded）的还原。
- 不公开的链上活动（如 P2P 直接交易、未上链的闪电网络通道内部）。

混淆的有效性取决于使用人数。当所有人都用屏蔽池，匿名集（anonymity set）够大，分析难度极高。当只有少数人用，反而被标记为「可疑活动」。

链上分析的能力有边界，但合规要求不会消失。把「证明自己合规」与「揭露自己是谁」拆开，正是零知识证明在身份领域能着力的地方。

## 零知识身份验证：证明属性而不泄漏属性

zk-SNARKs 的应用不限于支付。把它套到「身份验证」会出现一个全新的能力：证明你具备某个属性，而不泄漏属性的具体值。

例如：

- **proof-of-age**：证明「我超过 18 岁」，不泄漏出生年月日。
- **proof-of-citizenship**：证明「我是某国公民」，不泄漏身份证号。
- **proof-of-uniqueness**：证明「我是个独特的人，不是 bot」，不泄漏是谁。

几个正在发展的系统：

- **World ID**（所属项目 Worldcoin 已于 2024 年更名为 World）：用 iris scan 产生独特性凭证，用户用 zk proof 证明「我是独特的人」，不泄漏 iris 资料。
- **Polygon ID**：基于 Iden3 框架，把政府、银行、医疗等机构发出的可验证凭证（Verifiable Credential）转成 zk proof。
- **Anon Aadhaar**：印度国民身份系统的 zk 包装，用户可证明「我有有效的 Aadhaar」，不泄漏号码。

三者成熟度差距大：Polygon ID 生态最完整，但需要 DID 基础设施。Anon Aadhaar 只服务印度身份系统。World ID 最通用，但 iris scan 的争议也最大，目前仍以早期采用者为主。

这些系统共同的设计目标是把「我证明 X」与「我把 X 揭露给谁」彻底分离。传统 KYC 流程是「我把护照影本交给你，你判断是否信任」。零知识身份验证是「我给你一个证明，你能验证但无法取得原始资料」。

## 支付情境的应用

零知识证明套到支付情境，能解的问题包括：

- **私密 KYC**：证明「这笔交易来自合规 KYC 过的个人」，不泄漏个人身份。对交易所是合规满足，对用户是身份保护。
- **合规披露**：监管机构需要稽查时，用户可以选择性揭露特定属性（例如「这笔超过 100 万的交易，我是合规的个人」），其他信息维持隐私。
- **捐款匿名**：捐款人可证明「我已捐赠合法可抵税金额」，不泄漏个人。对倡议组织保护金主，对主管机关仍可稽核总额。
- **薪资隐私**：员工证明「我有资格接收这个 NGO 的薪资补助」，不泄漏个人薪资水准。

理论上很干净，实作上最大的瓶颈是「验证者要相信底层的 zk 系统」。可信设定、软件实作 bug、量子电脑对椭圆曲线的长期威胁，都是要管理的风险。

## 监管脉络与在地

许多司法管辖把 KYC、Travel Rule 落实到加密币交易所层级，对隐私支付的影响类似：交易所端面对监管压力可能下架隐私功能，用户端的 DEX 与 P2P 路径仍开放但与法币的对接受限，倡议组织端必须在「捐款人匿名性」与「会计合规披露」之间找平衡。零知识身份验证在合规披露这一段提供新的可能。

!!! info "在地脉络：anoni.net 来自台湾"

    anoni.net 是来自台湾的社群，对台湾的法规演变特别关注。下方资讯供有兴趣的读者参考。

    台湾《虚拟资产服务法》（2026 年草案，俗称 VASP 专法）拟把 KYC、Travel Rule 落实到加密币交易所层级。草案 2026 年 4 月经行政院通过送立法院，6 月完成委员会初审，尚未三读立法[^4]。若通过，对隐私支付的影响有三层：

    1. **交易所端**：本地交易所提供 Monero、Zcash 屏蔽交易等隐私功能会面临明确监管压力，可能下架或限制。
    2. **用户端**：用户透过去中心化交易所（DEX）或 P2P 持有隐私币的途径仍开放，但汇入汇出本地法币的接口受限。
    3. **倡议组织端**：接受加密币捐款的 NGO 必须在「捐款人匿名性」与「会计合规披露」之间找平衡。举例来说，台湾的倡议团体若想收 Monero 捐款保护金主，本地交易所多半已下架 Monero，得透过海外平台或 P2P 换成法币，会计上要对主管机关交代捐款总额并不容易。零知识身份验证可能成为新的选项（捐款人证明「我捐了合法可抵税的金额」，组织仍能对主管机关披露总额），但生态还不成熟。

    关于 VASP 法的详细条文与技术影响，见 [台湾 VASP 法 2026](../taiwan/vasp-2026.md)。

香港的框架与风险层级不同。当地自 2023 年 6 月起实施 VATP（虚拟资产交易平台）发牌制度，由证监会（SFC）依《证券及期货条例》监理，散户只能在持牌平台交易符合资格的代币，Monero、Zcash 这类隐私币因与 AML（洗钱防制）、KYC 要求冲突，实务上几乎无法在持牌平台上架[^hk]。香港倡议捐款要担心的核心风险，是资金用途本身可能被定性为危害国家安全。在为 2019 年反送中运动被捕者提供人道援助的「612 人道支援基金」案里，基金遭调查停运，五名信托人一度以《国安法》第 29 条被捕，最终改以《社团条例》未注册定罪。零知识身份验证在这里的意义，是让捐款人不必把身份留在可能被国安调查回溯的记录里，但它挡不掉「资金流向本身被定性为危害国安」这一层，技术做得再干净也无法取代法律风险评估。

对「为什么匿名支付对社运倡议重要」的整体脉络，见 [为什么匿名支付重要](../basics/payments-anonymity.md)。社群在 [匿名支付研究专题](../community/payments-research.md) 持续追踪这个方向。

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

[^1]: [Monero, Zcash and other privacy coins face delisting wave](https://www.coinspeaker.com/monero-xmr-zcash-zec-privacy-coins-delisting/){target="_blank"} - Coinspeaker
[^2]: [Zcash Counterfeiting Vulnerability Successfully Remediated](https://electriccoin.co/blog/zcash-counterfeiting-vulnerability-successfully-remediated/){target="_blank"} - Electric Coin Company
[^3]: [The rise of Monero: traceability challenges and research review](https://www.trmlabs.com/resources/blog/the-rise-of-monero-traceability-challenges-and-research-review){target="_blank"} - TRM Labs
[^4]: [行政院会通过「虚拟资产服务法」草案](https://www.ey.gov.tw/Page/9277F759E41CCD91/bfd446a7-ce23-4308-9347-9ce6e6c44196){target="_blank"} - 行政院
[^hk]: 香港 VATP 发牌制度自 2023 年 6 月生效见 [New Hong Kong Regulatory Requirements and Licensing Regime for Virtual Asset Trading Platforms](https://www.gibsondunn.com/wp-content/uploads/2023/06/new-hong-kong-regulatory-requirements-and-licensing-regime-for-virtual-asset-trading-platforms-finalised-as-legislation-takes-effect.pdf){target="_blank"} - Gibson Dunn、[持牌 VATP 名单](https://www.sfc.hk/en/Welcome-to-the-Fintech-Contact-Point/Virtual-assets/Virtual-asset-trading-platforms-operators/Lists-of-virtual-asset-trading-platforms){target="_blank"} - SFC。「612 人道支援基金」案见 [Cardinal Zen and 4 others appeal against conviction over failing to register protester relief fund as society](https://hongkongfp.com/2022/12/14/cardinal-zen-and-4-others-appeal-against-conviction-over-failing-to-register-protester-relief-fund-as-society/){target="_blank"} - Hong Kong Free Press。
