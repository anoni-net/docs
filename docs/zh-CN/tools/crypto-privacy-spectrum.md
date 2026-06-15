---
title: 加密货币的隐私光谱
description: 比特币、以太坊、Monero、Zcash 与稳定币的隐私差异，以及自管钱包与多重签署。
icon: material/currency-btc
---

# :material-currency-btc: 加密货币的隐私光谱

你想匿名订阅一份政治敏感的电子报、给海外的调查记者打赏、为准备离开的家暴幸存者备一笔对方看不到的资金。每个情境都有人推荐「用加密货币付款」当默认答案，但比特币与 Monero 的隐私差距，跟现金与信用卡的差距一样大。

这篇文章把几个常见币种排出一条光谱，帮你判断对手是谁、愿意付出多少摩擦、哪一段隐私强度足够你的需求。不需要懂密码学，原理链接放在每段，等你需要时再深入。如果想直接读技术细节，可延伸到 [零知识身份验证与支付](../advanced/zk-identity-payments.md)。

!!! tip "30 秒结论"

    - **个人匿名订阅**：Monero（钱包用 Cake Wallet）或 BTC 闪电网络（Phoenix）。
    - **组织跨境收款**：USDC 或 BTC，搭配 2-of-3 multisig。
    - **紧急资金调度**：预付礼物卡 + 现金优先，技术门槛够才用 BTC。

    展开细节见下方各情境段。

## 一张表先看光谱

公开可查的：BTC、ETH、稳定币。默认隐藏的：只有 Monero。Zcash 看你如何选用。

| 币种 | 账户 | 金额 | 图谱 | 取得难度 | 合规风险 |
|---|---|---|---|---|---|
| 比特币（BTC） | 公开 | 公开 | 可重建 | 低（多数交易所支持） | 低 |
| 以太坊（ETH） | 公开 | 公开 | 可重建 | 低 | 低 |
| 稳定币（USDT、USDC、DAI） | 公开 | 公开 | 可重建 | 低 | 中（发行方可冻结） |
| Zcash 透明池（t-addr） | 公开 | 公开 | 可重建 | 中 | 低 |
| Zcash 屏蔽池（z-addr） | 隐藏 | 隐藏 | 屏蔽池内不可见 | 中至高 | 中至高 |
| Monero（XMR） | 隐藏 | 隐藏 | 诱饵混淆 | 中至高（KYC 交易所多已下架） | 中至高 |

「合规风险」一栏反映个人用户在主流司法管辖下的可能阻力，主要表现在交易所是否愿意处理、银行是否愿意对接。实际责任请对照所在地法规。

## 监控者实际看得到什么

刚才那张表的栏位是如何得出的？看一条公开链时，外界看得见的东西落在四个维度：

- **账户**：谁拥有哪个地址。比特币、以太坊、稳定币公开可查，Monero 用 stealth address 隐匿，Zcash 屏蔽交易连地址都看不到。
- **金额**：这笔交易转了多少。比特币与多数链公开，Monero 用 RingCT 隐藏，Zcash 屏蔽交易完全不可见。
- **图谱**：A 跟 B 之间的转账路径。比特币可重建完整图谱，以太坊类似，Monero 用环签名制造诱饵，Zcash 屏蔽池内部不可见。
- **Metadata**：交易由哪个 IP、哪个钱包客户端、什么时间送出。所有链都依赖 P2P 网络层的隐私（搭配 Tor、Dandelion++）。

四个维度的内部机制与链上分析的能与不能，在 [零知识身份验证与支付](../advanced/zk-identity-payments.md) 有完整讨论。这页只用这四个维度当作后续比较的尺。

## 对应你的情境

没有「最匿名」的单一答案，只有对应你威胁模型的组合。下面三个常见情境作为起点。每段给你「推荐组合 + 一句为什么」，想知道为什么这样搭，往下看对应币种的段落。

### 个人小额订阅（每月几美元）

威胁：订阅事实本身会定义你（敏感议题的电子报、独立媒体）。需求：低摩擦、低金额、可重复。

- 对手方接受 Monero：用 Monero（取得管道：原子交换 BTC 转 XMR），钱包用 Cake Wallet 或 Feather。为什么选 Monero，看 [§Monero](#monero)。
- 对手方只接受 BTC、USDT：BTC 走闪电网络（Phoenix、Blue Wallet），或用稳定币搭配每次新建地址。
- 对手方接受预付礼物卡：[为什么匿名支付重要](../basics/payments-anonymity.md) 讨论的低门槛方案可能更省事。

### 组织跨境收款

威胁：捐款人匿名性、组织会计合规、跨境流动性。需求：可规模化、可稽核、合法揭露。

- 主管道用比特币或 USDC（流动性与会计工具最成熟），搭配 multisig（2-of-3 起跳，至少一把在组织外的会计师或理事手上）。为什么用 multisig，看 [§multisig](#multisig)。
- 愿意承担合规门槛的组织再加 Monero 或 Zcash 屏蔽池作为额外管道，明确标示「进阶匿名」。
- 完整流程与税务见 [倡议组织的匿名捐款管道](../scenarios/nonprofit-anonymous-donation.md)。

### 紧急资金调度（家暴幸存者准备离开）

威胁：加害者可能监控家庭网银、共用装置、共用记事本。需求：自己可立即取用、不留下被监控者可见的痕迹。

- 预付礼物卡或现金优先（取得门槛最低、不需要技术设定）。
- 加密货币：用独立装置（不是家里共用电脑）、新的种子片语、不在家中网络操作。钱包选 Bitcoin Core 或 Electrum，搭配硬件钱包（Coldcard、SeedSigner）寄到信任的人手上。
- 场景指引可从 [为什么匿名支付重要](../basics/payments-anonymity.md) 与 [威胁模型如何建立](../basics/threat-model.md) 延伸。

## 比特币与以太坊：所有人都查得到

比特币与以太坊的链是公开账本。只要拿到地址，任何人都能查到收发记录、余额、与哪些地址互动过。隐私落在地址层而非身份层：地址本身没有名字，只要在某个 KYC 交易所提领过、留下 IP、寄送给已标记过的地址，链上分析公司（Chainalysis、TRM Labs）就能把属于同一个实体的地址分群（clustering）。

取得管道对可追溯性的影响很大：

- **KYC 交易所**：Coinbase、Binance、Kraken 这类大型中心化交易所要求实名注册。从交易所提到自管地址的那一笔，会把链上身份跟法定身份绑起来。
- **去中心化交易所（DEX）**：Uniswap、Curve 等链上交易协议不要求 KYC，但你跟它互动的地址仍公开可查，图谱上看得到。
- **点对点（P2P）**：Bisq、Hodl Hodl、线下 OTC 群。能绕开 KYC，但对手方信任、价差、流动性是门槛。

实务上，比特币与以太坊在四个维度中只有 Metadata 可以靠 Tor 改善，账户、金额、图谱三层都是设计上公开的。要在 BTC 或 ETH 上获得更多隐私，多半要靠协议外的混淆机制。

## CoinJoin 与 mixers：为什么社群不再主推

CoinJoin 是比特币早期的隐私强化路线：多名用户把交易合并成一笔，外界无法分辨哪个输入对应哪个输出。代表性实作有 Wasabi Wallet、Samourai Wallet 的 Whirlpool 服务，以及在以太坊上的 Tornado Cash。

!!! warning "法律风险：2024 年后的三件事"

    - **Tornado Cash**：2022 年 8 月被美国 OFAC 列入 SDN 清单（首次制裁「智能合约地址」本身），2024 年 11 月第五巡回法院裁定制裁逾越授权，OFAC 于 2025 年 3 月除名。开发者刑事诉追另案进行，混币协调服务的法律风险仍未完全消除。
    - **Samourai Wallet**：2024 年 4 月开发者被美国司法部起诉、服务关闭，2025 年 11 月两位共同创办人分别被判 5 年与 4 年有期徒刑。
    - **Wasabi Wallet**：运营方 zkSNACKs 在 2024 年公告停止 CoinJoin 协调服务。

对个人用户的判断重点：技术本身没有犯罪化，「协调服务」与「混币输出」在多数司法管辖会引发合规关切。详细案例分析见 [倡议组织的匿名捐款管道](../scenarios/nonprofit-anonymous-donation.md) 的 Tornado Cash 段落。社群目前的立场是把这条路线当作背景知识，不再做为主推工具。

## 稳定币：方便，但会被冻结

稳定币是法币连动的链上资产，便于跨境支付与保值。隐私特性继承所在链，并带来币种特有的反隐私风险：发行方的冻结权。

- **USDT（Tether）、USDC（Circle）**：中心化发行，发行方持续维护黑名单地址，可单方面冻结指定地址的余额。历史上已对 OFAC 制裁、黑客地址、执法请求多次执行冻结。
- **DAI（MakerDAO 出身）**：曾以「去中心化、无冻结」为设计目标。其抵押品中的 USDC 比例上升后，间接受 Circle 政策影响。
- **算法稳定币**：Terra/Luna 在 2022 年崩盘后，主流支付情境的成功案例有限。

从匿名支付角度看，稳定币的价值来自跨境流动性与低波动。它不擅长隐私。要在稳定币上获得隐私，多半要转到隐私链上的包装资产（如 Zcash 上的桥接资产），代价是流动性大幅下降。

## Monero：强匿名，取得有摩擦 {#monero}

Monero 把账户、金额、图谱这三个维度的隐藏内建成默认行为。stealth address、ring signatures、RingCT 三个机制叠加，链上看不到 Alice 与 Bob 的概念，只看到「某个一次性地址收到一笔隐藏金额，由 16 个可能寄件人之一送出」。原理细节见 [零知识身份验证与支付](../advanced/zk-identity-payments.md)。

- **钱包**：Cake Wallet（移动设备与桌面）、Feather Wallet（桌面、轻量、开源）、Monero GUI（官方桌面）。
- **合规处境**：在多数司法管辖，个人持有与点对点交易未受明文禁止，但本地交易所是否提供 XMR 对接因地区而异。

!!! note "如何购买 Monero（不靠 KYC 交易所）"

    KYC 交易所自 2020 年起陆续下架 Monero，2022–2024 年间 Binance、Kraken 等主要交易所也相继跟进。实务上的取得管道：

    - 去中心化交易（Haveno）。
    - P2P 平台（LocalMonero 已关闭，Bisq、RetoSwap 是现存选项）。
    - 先持有 BTC 或 USDT，透过原子交换（atomic swap）转成 XMR。

Monero 的设计强度高，代价是取得摩擦大、合规空间窄。

## Zcash：可选隐私，弱在使用率 {#zcash}

Zcash 的屏蔽交易（shielded transaction）走 zk-SNARKs 路线，链上看不到金额、寄件人、收件人。Zcash 同时保留「透明池」（t-addr，跟比特币一样公开）给合规情境用，用户可以选择要不要走屏蔽。

**真实弱点历来落在使用率**：屏蔽池的活跃用户长期远少于透明池（2024 年以前屏蔽供应量不到一成），匿名集（anonymity set）偏小、分析难度没有设计上那么高。不过屏蔽池使用率自 2025 年起明显成长，实际匿名集大小持续变化，要评估时建议查最新链上数据。Halo 2 升级后完全去除可信设定的需要，是密码学工程的重大进展。

实务取舍：

- **钱包**：Zashi（移动设备，Electric Coin Company 出品）、Ywallet（多链、支持 Zcash 与其他资产）、Zecwallet Lite（桌面）。
- **取得管道**：部分主流交易所仍上架 Zcash（透明池），shielded-to-shielded 的合规门槛较高，部分交易所只接受透明池进出。
- **建议流程**：取得后立即从 t-addr 转到 z-addr（屏蔽），完成支付后若要兑回法币再从 z-addr 转回 t-addr。中间在屏蔽池内的交易能维持高隐私。

## 谁持有私钥：托管 vs 自管

不论币种，托管与自管的差别都是同一个决策：谁持有私钥。

- **托管钱包**：交易所账户（Binance、Coinbase）、第三方托管服务。优点是备份不会遗失、客服可协助。缺点是需要 KYC、可被冻结、存在交易所倒闭与内部盗用风险（FTX 是近年代表性事件）。
- **自管钱包**：私钥由用户持有。优点是不依赖第三方、不用 KYC、不可被冻结。缺点是私钥遗失等于资金消失，责任全在自己。

各币种常见的自管钱包：

| 币种 | 桌面 | 移动设备 | 进阶（含硬件） |
|---|---|---|---|
| BTC | Bitcoin Core、Electrum、Sparrow | Blue Wallet、Phoenix（闪电网络） | Coldcard、SeedSigner |
| ETH 与稳定币 | Frame、Rabby | MetaMask、Rainbow | Ledger、Trezor |
| Monero | Monero GUI、Feather | Cake Wallet | （硬件支持有限） |
| Zcash | Zecwallet Lite、Ywallet | Zashi | （硬件支持有限） |

硬件钱包（Ledger、Trezor、Coldcard、SeedSigner）是自管的进阶选项：私钥存在装置内，签署时不离开硬件。Ledger 在 2023 年的 Recover 服务争议引发信任问题后，部分用户转向开源的 Coldcard 或 SeedSigner。

## multisig：把钥匙拆给多个人 {#multisig}

multisig 把单一私钥拆成多把钥匙，需要其中 N 把同意才能花费。常见配置是 2-of-3（三把钥匙、任两把可动用）、3-of-5（五把钥匙、任三把可动用）。

multisig 对隐私与安全的价值：

- **降低图谱可追溯度**：把单一钱包拆成多个 multisig 地址后，不同用途的资金分散在不同地址，图谱上难以还原成「同一个人」。
- **降低单点失效**：单一钥匙遗失或被盗不等于资金消失。对组织尤其重要。
- **权责分离**：组织内可以由不同角色持有不同钥匙，动用资金需要协作而非个人决定。

各币种对 multisig 的支持度不同：

- **比特币**：支持度最完整，Sparrow、Caravan、Specter 提供易用界面，社群成熟。
- **以太坊**：透过智能合约实作（Safe，前 Gnosis Safe），是 Web3 组织钱包的事实标准。
- **Monero**：协议层支持，钱包软件支持度与工具成熟度远低于 BTC、ETH。实务上组织用 Monero 做 multisig 的案例不多。
- **Zcash**：屏蔽池目前不支持 multisig，透明池可用但失去隐私优势。

multisig 的常见坑：

- **密钥备份**：N 把钥匙都要有可靠的备份策略，否则 N-1 把遗失后资金永远锁死。
- **社工攻击**：攻击者不必拿到所有钥匙，只要说服 N 个钥匙持有人签署一笔恶意交易即可。
- **协作摩擦**：每次动用资金都要 N 个人协调，日常小额支付用不上。

组织端的具体实作建议见 [倡议组织的匿名捐款管道](../scenarios/nonprofit-anonymous-donation.md)。

## 法规与在地

!!! info "在地脉络：anoni.net 来自台湾"

    anoni.net 是来自台湾的社群，对台湾的法规演变特别关注。下方资讯供有兴趣的读者参考。

    台湾 VASP 法 2026 通过后，本地交易所对隐私功能的支持会明显收紧：Monero 与 Zcash 屏蔽交易在本地对接的可能性降低，用户要更倚赖 DEX、P2P、原子交换等管道。稳定币发行进入专章管制，个人在自管钱包持有与移转自有资产，多数情况不落入「经营虚拟资产服务业」的定义。详见 [台湾 VASP 法 2026](../taiwan/vasp-2026.md)。

    mixers 与 CoinJoin 的法律风险主要在美国司法管辖。具体到不同地区，「协助他人混币」、「运营混币协调服务」需谨慎评估。

社群长期立场是合法为前提、技术中立、把风险与选择同时揭露给用户。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-cash-multiple: 为什么匿名支付重要](../basics/payments-anonymity.md)
- [:material-shield-key-outline: 零知识身份验证与支付](../advanced/zk-identity-payments.md)
- [:material-handshake-outline: 倡议组织的匿名捐款](../scenarios/nonprofit-anonymous-donation.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-folder-search-outline: 匿名支付研究专题](../community/payments-research.md)
- [:material-scale-balance: 台湾 VASP 法 2026](../taiwan/vasp-2026.md)

</div>
