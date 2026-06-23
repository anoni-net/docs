---
title: VPN 的风险与选择
description: VPN 把监看你流量的对象从 ISP 换成 VPN 业者，不等于匿名。这篇说明 VPN 的具体风险、如何挑一个值得信任的服务、自架的取舍，以及在不同司法管辖工作或往返时各地能不能用该注意什么。
icon: material/vpn
---

# :material-vpn: VPN 的风险与选择

对公民团体、人权组织、记者来说，装 VPN 几乎是资安准备的反射动作。但很多人装了就以为自己安全了，没搞清楚 VPN 实际上改变了什么。VPN 没有移除监看你的人，只是把能看到你全部流量的对象，从 ISP 换成 VPN 业者。这样的转移在某些情境确实划算，在另一些情境反而把风险集中到一个更难验证的单点。

这篇回答三个问题：VPN 的具体风险有哪些、市面上的服务怎么挑、各地区能不能用该注意什么。动手前可以先看 [威胁模型如何建立](../basics/threat-model.md) 确认自己面对的是哪类对手，VPN 跟 Tor 的差别见 [什么是 Tor](./what-is-tor.md)。

!!! tip "没空全部读完，先抓这几点"

    - VPN 换掉的是「谁能看到你的流量」，把信任从 ISP 移到 VPN 业者，它不会让你匿名。
    - 日常防公共 Wi-Fi 窃听、解地理限制，挑一个经独立审计、所有权透明的服务就够，没头绪就先看 Mullvad 或 Proton VPN。
    - 要对抗能传唤业者的对手、或保护消息来源，VPN 不够，改用 [Tor](./what-is-tor.md)。
    - 人在审查严的地方（中国、缅甸等），要选有混淆功能的方案、出发前先测，逐地状况见 [亚洲出差与研讨会的数位准备](../scenarios/asia-travel.md)。

## VPN 到底改变了什么

VPN 的运作是把你设备的网络流量，先加密送到 VPN 业者的服务器，再从那台服务器连出去。对你连接经过的 ISP、公共 Wi-Fi、本地网络管理者来说，他们只看得到你连到某个 VPN 服务器，看不到你实际在连哪些网站。但这条隧道的另一端，VPN 业者看得到你连去哪、什么时候连、连多久。

VPN 确实能做到的事：

- 在公共 Wi-Fi、酒店、会场网络上，挡掉同网段的窃听，以及本地 ISP 对你浏览内容的侧录
- 遮蔽你对目的网站揭露的来源 IP 与大致地理位置
- 绕过 ISP 层级的封锁（某些网站被你的电信商挡掉时）

VPN 做不到的事：

- 让你匿名。你登入的 Google、Facebook、银行账号照样认得你，浏览器指纹、cookie、登入状态都还在
- 对 VPN 业者本身隐藏行踪。业者是新的单点，它的记录、它的司法管辖、它的诚实程度，全部变成你的风险
- 挡掉恶意程序、钓鱼，或设备本身被入侵的问题

就算用了 VPN，连接的时间、流量大小、你登入的账号与浏览器指纹这些 metadata 都还在，VPN 处理的只有连接层。这层为什么是独立的风险见 [Metadata 是什么](../basics/metadata.md)。

这跟 Tor 的差别在信任如何分配。Tor 把连接经过三个互相独立的中继（relay，由志愿者运作的中转节点），没有任何一个节点同时知道你是谁、你连去哪，所以你不需要信任任何单一节点。VPN 把信任集中在一家业者身上，匿名性取决于这家业者有没有说谎、会不会被传唤。完整对照见 [什么是匿名网络](./what-is-anonymity-network.md)。

## VPN 的具体风险

- **信任集中**：不记录不等于不能记录。VPN 业者技术上看得到你的全部流量。多数业者宣称 no-log（不记录使用记录），但宣称与实际做到之间仍有距离。没有独立审计、没有真实案例验证的「不记录」，只是营销文案。少数业者有真实事件作为佐证，2023 年 4 月瑞典警方持搜索令到 Mullvad 办公室，要查扣含用户数据的电脑，因这类数据根本不存在而空手离去[^mullvad-raid]。能在被搜索后仍无数据可交，才是 no-log 的实质意义。
- **司法管辖与数据留存法**：业者所在国的法律决定它能不能、必须不必须交出数据。部分国家有强制数据留存规范（例如越南的网安法要求境内业者留存数据），落在这些管辖区的服务，无论如何宣称 no-log，仍受当地法律约束。挑服务时要看公司注册在哪、服务器在哪。
- **所有权不透明**：很多看似独立的品牌其实同属一家母集团。Kape Technologies（前身是 Crossrider，其开发平台被大量滥用来散布 adware 与不受欢迎软件，2018 年更名[^kape]）目前拥有 ExpressVPN、CyberGhost、Private Internet Access、ZenMate，还买下多个 VPN 评测网站，等于同时当球员与裁判。NordVPN 与 Surfshark 在 2022 年并进同一个母集团 Nord Security[^nord]。这不代表这些服务一定不安全，但「我比较了好几家才选」的安全感，可能只是同一家公司的不同招牌。
- **免费 VPN 的商业模式**：免费 VPN 要从别处赚钱。2016 年一份分析 Google Play 上 283 个 VPN App 的学术研究发现，38% 被多家防毒引擎标记含某种恶意程序、18% 完全不加密流量、84% 会泄漏 IPv6 流量，且 75% 内嵌第三方追踪函式库[^free-vpn]。这份研究是 2016 年的数据，但免费 VPN 靠用户数据或广告获利的商业模式，至今没有改变。要免费又可信，看后面非营利导向的选项。
- **付款会留下身分轨迹**：用绑定真实姓名的信用卡订阅 VPN，等于在业者那里留下这个账号是谁的对应。真的要把匿名性算进威胁模型，付款方式（现金，或 Monero 这种设计上难以追踪资金流的加密货币）跟注册时要不要 email 一样重要。注册用的 email 若跟其他敏感服务共用，账号之间会被串连，建议用独立 email 加上 [密码管理器](./password-manager.md) 隔离。
- **连接泄漏**：就算开了 VPN，真实 IP 还是可能从几个缝隙漏出去。常见的是 DNS 查询（把网址转成 IP 的查询）没走进 VPN 隧道、IPv6（较新的 IP 地址格式）流量没被隧道接管、浏览器的 WebRTC（浏览器做实时通讯用的连接技术）直接暴露本机 IP。一个合格的 VPN 客户端应具备 kill switch（VPN 断线时立刻切断所有流量的开关），避免 VPN 中断的瞬间真实 IP 暴露。装好后值得用在线 leak test 工具实测一次，怎么测见最后的常见问题。
- **在审查国使用 VPN 本身就是风险**：在强审查地区，VPN 流量会被 DPI（深度封包检测，逐笔分析连接判断是否放行的技术）辨识出来、进而封锁，使用本身甚至可能违法。缅甸 2025 年 1 月通过、7 月生效的 Cybersecurity Law 把未经授权提供 VPN 服务入罪化，最高可判 1 至 6 个月徒刑或并科罚款、并具域外效力。法律主要针对未授权的 VPN 服务提供者，个人使用是否适用仍有疑义[^myanmar]。中国对个人翻墙长期属法律灰色地带，2025 年底官方公开示警翻墙会被究责[^china]。这些地方需要具备混淆（obfuscation，把 VPN 流量伪装成一般 HTTPS）功能的方案，各地详情见后面的地区章节与 [亚洲出差与研讨会的数位准备](../scenarios/asia-travel.md)。
- **把 VPN 当匿名工具是最危险的误解**：VPN 提供的是隐私（内容加密、遮蔽 IP）。要匿名请用 Tor。把 VPN 当匿名工具用于高风险情境，等于把自身安全完全托付给一家公司的诚信记录。

## 怎么选一个值得信任的 VPN

把上述风险转化为可逐项确认的问题，挑选服务时依序比对。没时间全部查的话，前三项（司法管辖、经独立审计的 no-log、所有权透明）最关键，先看这三个。

评估准则：

1. **司法管辖**：公司注册国与服务器所在国的法律，有没有强制数据留存、容不容易被传唤。
2. **经独立审计的 no-log**：不看它怎么宣称，看有没有第三方（Cure53、Assured、Securitum 等）审计过、有没有真实搜索案例验证。
3. **所有权与透明度**：母公司是谁、有没有定期透明报告、会不会球员兼裁判。
4. **匿名注册与付款**：能不能不给 email、能不能用现金或 Monero 付款。
5. **协议与混淆**：用 WireGuard、OpenVPN 这类现代协议，在审查地区还要有混淆能力。
6. **开源**：客户端甚至基础设施的代码公开，可被外部检视。
7. **RAM-only 基础设施**：服务器只用内存、不写硬盘，断电即清，降低被查扣时外泄的风险。

### 评估准则速查表

| 服务 | 司法管辖 | 经审计 no-log | 所有权透明 | 匿名注册/付款 | 混淆能力 | 开源 |
|------|---------|--------------|-----------|--------------|---------|------|
| Mullvad | 瑞典 | 是 | 高 | 无需 email，现金、Monero、BTC | 有（Shadowsocks 桥接） | 是 |
| Proton VPN | 瑞士 | 是 | 高 | BTC、现金 | 有（Stealth 协议） | 是 |
| IVPN | 直布罗陀 | 是 | 高 | Monero、现金、BTC | 有限（以多跳为主） | 是 |
| Riseup VPN、CalyxVPN | 非营利维护 | 不记录（非营利） | 高 | 免费，限人权社群 | 有限 | 是（LEAP/Bitmask） |
| (对照) ExpressVPN | 英属维尔京群岛 | 是 | 低（Kape 集团） | BTC | 有（自动混淆） | 仅协议开源（Lightway） |
| (对照) NordVPN、Surfshark | 巴拿马、荷兰 | 是 | 中（同属 Nord Security） | 加密货币 | 有 | 部分 |

主流商用服务多半也做过审计，速查表把区别放在所有权透明、匿名注册与付款、开源这几栏。查证日 `2026-06`。VPN 的所有权、审计结果、各地法规都可能随时变动，最新状态以各家审计报告与当地现行规定为准，也可参考 [Privacy Guides](https://www.privacyguides.org/zh-Hant/vpn/){target="_blank"} 这类非商业索引的更新。

### 混淆能力为什么越来越重要

混淆是目前最该优先确认的一栏。审查方挡 VPN 的手法，已经从早期的封掉 VPN 服务器 IP，进化到直接看流量长相。标准的 WireGuard、OpenVPN 连接在刚建立时带有固定、可辨识的特征，DPI 一眼就认得出这是 VPN 并切断。混淆把 VPN 流量包装成一般 HTTPS 网页浏览的样子，让侦测系统无法辨识。有没有混淆，往往直接决定你在强审查地区连不连得上。

混淆不是越多越好的设定，要不要开取决于你人在哪、面对哪类审查。在没有系统性封锁的环境（多数民主国家），不需要混淆，标准协议速度更快、也更稳定。混淆是给中国、缅甸、伊朗这种 DPI 强的环境用的，代价是速度通常会掉一些。

各家产品页的营销名称各有不同，本质都是混淆技术，以下几个关键词都指向同一件事：

- Shadowsocks、v2ray 类的桥接（Mullvad 提供 Shadowsocks）
- 把 WireGuard 包进 TLS 的伪装（Proton VPN 的 Stealth）
- 各家自有名称：ExpressVPN 的自动混淆、NordVPN 的 NordWhisper、Surfshark 的 Camouflage Mode、Astrill 的 StealthVPN

两点提醒。第一，强审查系统会主动探测（active probing，主动连向可疑服务器、测试它是不是 VPN 或 proxy，中国的防火长城就会这样做），耐得住探测的混淆才顶得住。第二，混淆没有一劳永逸，审查方会持续更新侦测，今天能用的协议下个月可能就被封，所以要备两种以上并在出发前实际测试（详情见后面的地区章节）。若混淆协议也遭封锁，可改用 Tor 的 [WebTunnel](../community/setup-tor-webtunnel.md) 或 [Snowflake](./tor-snowflake.md) 桥接作为备援。

下面逐一介绍符合上述准则的服务，照你的威胁模型挑一个就好，不必全部看完。没有特别技术背景、预算有限的话，从 Proton VPN 的免费方案或 Mullvad 开始最省事。

### Mullvad

[Mullvad](https://mullvad.net/){target="_blank"} 在隐私设计上做得最彻底。注册不需要 email，只给你一组随机账号编号。付款接受现金邮寄、Monero、Bitcoin，不需要把身分绑进去。2023 年 9 月完成全服务器 RAM-only 迁移[^mullvad-ram]，基础设施与 app 经 Cure53 等多家机构多次审计、Web App 由 Assured 独立审计，客户端开源。前面提到的瑞典警方搜索案例，就是 Mullvad no-log 政策的实证。

**适合谁**：把匿名性算进威胁模型的人、想用现金或 Monero 不留身分轨迹的人、要一个经得起搜索的服务的记者与组织。

**限制**：

- 为了减少指纹已移除 port forwarding，某些 P2P 与自架服务情境会受影响
- 定价单一（每月固定费率），没有长约折扣
- 解串流地理限制的能力不强，它的设计目标不在这

### Proton VPN

[Proton VPN](https://protonvpn.com/){target="_blank"}（跟 Proton Mail 同一家瑞士公司）的最大优势是有一个不限流量的免费方案，加上专为抗审查设计的 Stealth 协议（把 WireGuard 包进 TLS，用来穿越 DPI 封锁[^stealth]）。客户端全平台开源，连续多年通过 no-log 审计，另有 Secure Core 多跳路由。

**适合谁**：预算有限又要可信免费方案的人、在审查地区需要混淆的人、已经在用 Proton 生态的人。

**限制**：

- 免费方案的服务器国家与速度受限，完整功能要付费
- Stealth 宣称能穿越强封锁，但实际可达性随封锁更新而变，到中国这类地方仍要出发前实测，不能当成确定能用

### IVPN

[IVPN](https://www.ivpn.net/){target="_blank"} 是直布罗陀的老牌服务，严格 no-log、接受 Monero 与现金、支援多跳，客户端以 GPLv3 开源，每年由 Cure53 审计。它刻意拿掉联盟营销与限时促销，避免用营销话术扭曲用户判断。

**适合谁**：重视透明与审计记录、不想被营销牵着走、需要多跳的进阶用户。

**限制**：

- 生态与服务器数量比大厂小
- 价格不算便宜，没有免费方案
- 混淆能力以多跳为主，强审查地的耐封度不如专门的混淆协议

### Riseup VPN、CalyxVPN

[Riseup VPN](https://riseup.net/en/vpn){target="_blank"} 与 CalyxVPN 由非营利组织提供，技术上都建在 LEAP 的 Bitmask 平台，免费给人权与社运社群使用、不记录用户 IP。Calyx Institute 是美国 501(c)(3) 非营利，Riseup VPN 免费开放下载，而 Riseup 整体服务定位在认同其使命的行动者社群。

**适合谁**：预算有限的行动者与社运社群、需要一个不靠卖数据维生的免费基本隐私工具。

**限制**：

- 容量、速度与服务器选择有限
- Riseup 的定位是服务社运社群，使用前建议了解并认同其使命
- 混淆能力有限，把它当日常基本隐私够用，高敏感的匿名仍要走 Tor

### 主流商用服务（ExpressVPN、NordVPN、Surfshark 等）

这些大厂的优势在速度、相容性（解地理限制、看串流）、客服与一键混淆，也都做过第三方审计。取舍在所有权集中与营销导向：ExpressVPN 属 Kape（同时经营 VPN 评测网站），NordVPN 与 Surfshark 同属 Nord Security。日常防公共 Wi-Fi 窃听、解地理限制够用，但真正高敏感、出错赌不起的场景，可信度与透明度不如前面几家。

### 红旗：这几种要避开

- 来路不明的免费 VPN App，多半靠卖你的数据或塞广告赚钱
- 把浏览器内建的免费 VPN 当成完整防护，它的覆盖与保证通常很有限
- 只有营销页宣称 no-log、没有任何第三方审计或真实案例佐证的服务

不想只听我们的，可以对照 [Privacy Guides 的 VPN 建议](https://www.privacyguides.org/zh-Hant/vpn/){target="_blank"}。它跟前面说的 Kape 评测站不同，不收广告主、不靠推荐抽成，评选标准也公开可查，目前同样列 Mullvad、Proton VPN、IVPN 三家[^pg]。

## 自架 VPN

自架 VPN 是另一个选项，把信任从 VPN 业者转移到你租用的 VPS 供应商与自身的维运能力。常见工具有三种：

- **WireGuard**：现代、精简的 VPN 协议，自己在一台 VPS 上跑。
- **Algo VPN**：Trail of Bits 维护的一套 Ansible 脚本，几分钟在云端主机架好 WireGuard，刻意缩小安装范围（攻击面）以降低供应链风险[^algo]。
- **Outline**：Google Jigsaw 开发、给记者与新闻编辑室抗审查用的自架方案，以 Shadowsocks 为基础，2026 年 1 月起由独立的 Outline Foundation 主导维运，Jigsaw 仍以贡献伙伴参与[^outline]。

要先想清楚的取舍：

- 你不再信任 VPN 业者，但改信任你的 VPS 供应商（它一样看得到服务器流量），以及你自己的维运能力（设定有误时没有厂商可以协助排除）。
- 自架 VPN 的出口 IP 通常是你独享，反而更容易被溯源到个人。它提供的匿名保护有限，适合组织内部安全连接、个人绕过封锁，不适合需要隐匿身分的高敏感场景。要匿名仍是 Tor。
- 对抗审查时，Outline 这类 Shadowsocks 方案的混淆能力，常比商业 VPN 的标准协议更耐封。

**适合谁**：有技术人力的组织、想完全掌控基础设施、不信任商业业者的记者与技术型工作者。

## Tor VPN（Beta，目前仅 Android）

Tor Project 自己也做了一个叫 Tor VPN 的 app。它以系统的 VPN 机制为操作界面，把你选定的 app 流量导入 Tor 网络，底层引擎是 Arti（Rust 版的 Tor）加上 Onionmasq[^torvpn-about]，跟一般商业 VPN 是两回事。免费、开源（BSD 3-Clause），目前只有 Android（7.0 以上），iOS 与桌面版都还没有[^torvpn-install]。

它的意义是把这整页的核心取舍变成一个能直接装来用的选项。一般 VPN 把信任集中到一家业者，Tor VPN 的出口是 Tor 的志愿者中继，没有任何单一方同时看得到你的来源与目的地，每个 app 还各走一条独立的 Tor circuit（连接路径）、拿到不同的出口 IP，降低跨 app 被关联的机会[^torvpn-intro]。

!!! warning "现在是 Beta，别拿来做高敏感的事"

    Tor Project 官方明确标注 Tor VPN 还在 Beta，可能泄漏信息、不应用于任何敏感用途[^torvpn-about]。对人权工作者、记者这类高风险用户，现阶段它适合测试与熟悉，真正高敏感的任务仍用成熟的 [Tor Browser](./what-is-tor.md) 或 Tails。可用性与安全性会随版本演进，采用前以官方最新状态为准。

几个现实限制：

- 出口是 Tor exit node，速度比一般 VPN 慢，也不适合解地理限制或看串流，主流平台多半封锁 Tor 的出口 IP。
- 目前只有 Android。iOS 上没有 Tor VPN，要在 iPhone、iPad 用 Tor 改用 Tor 官方推荐的 [Onion Browser](https://onionbrowser.com/){target="_blank"}，可搭配 Guardian Project 的 Orbot 强化防漏[^ios-tor]。要在 Linux 桌面做类似的全流量 Tor 隔离，可看社群介绍的 [oniux 内核层级隔离工具](../blog/posts/oniux-kernel-level-tor.md)。
- 跟 Guardian Project 的 Orbot 功能高度重叠，差别在开发团队与底层引擎（Orbot 用较旧的 C 版 Tor，Tor VPN 用 Arti），官方目前没有明说哪个取代哪个[^torvpn-orbot]。

安全性上，Tor Project 在 2025 年委托 Cure53 对 Tor VPN 的 Android 版与 Onionmasq 网络层做了源代码审计，2026 年 4 月公开报告，结论是核心路由稳固、没有根本性问题，待改善的是输入验证、DNS 处理、明文配置存储等项目。完整中文摘要见社群整理的 [Cure53 完成 Tor VPN 安全审计](../blog/posts/2026-code-audit-for-tor-vpn-completed-by-cure53.md)。

## 各地区能不能用：先评估，不要落地才试

VPN 在某地能不能用没有全球通用答案，会随地区与时间变。出国或在当地工作前，用下面的框架评估，逐地细节查 [亚洲出差与研讨会的数位准备](../scenarios/asia-travel.md) 与 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 的当下观测。

合法性大致分四级（用来判断风险，不是法律意见）：

- **合法**：日常使用不受限，例如多数民主国家。
- **受规范**：合法但业者受数据留存、实名等规范，例如越南、澳门。
- **灰色地带**：法律未明确禁止个人使用，但封锁积极、官方时有示警，例如中国、香港。
- **入罪化**：未经授权提供可能触法（个人使用的适用范围仍有争议），例如缅甸。

行前与在地必做：

- **出发前就装好并连接测试一次**。审查严的地方，App 商店与 VPN 官网本身可能连不上，落地才下载通常来不及。
- **备两种以上连接方式**。单一协议常被封，强封锁地（中国、缅甸）要用有混淆的方案，标准 WireGuard、OpenVPN 可能几秒就被挡。
- **判断是否需要混淆**。一般地区用标准协议即可，强审查地才需要 Stealth、Shadowsocks 这类伪装。
- **开启 kill switch**，避免切换网络或 VPN 掉线的瞬间短暂暴露真实 IP。

审查国的额外风险：

- 使用 VPN 本身可能被 DPI 辨识、被标记。
- 街头临检与入境查机可能搜查设备里的 VPN App 与社群内容，缅甸与部分地区已有案例（详见 [亚洲出差与研讨会的数位准备](../scenarios/asia-travel.md)）。
- 高敏感任务带干净设备（一台没有平常账号、没有个人数据的专用机，例如重设出厂或另外准备的手机），全程假设受监控。VPN 连不上时改走 Tor 的 WebTunnel、Snowflake 桥接，设定见 [Tor Snowflake](./tor-snowflake.md) 与 [如何架设 Tor WebTunnel](../community/setup-tor-webtunnel.md)。

## VPN 还是 Tor

两个工具解决不同问题，看你要对抗的是谁来选。

- **VPN 够用**：在公共 Wi-Fi、会场、酒店网络上加密连接，解开地理限制，做组织内部安全连接，或对速度敏感的日常使用。你的对手是同网段窃听者、本地 ISP、地理封锁。
- **必须 Tor**：你要对抗的是能拿到 VPN 业者记录的人，要保护消息来源，或做高敏感的匿名。你的对手有能力传唤业者、做流量比对。
- **两者搭配**：少数情境会叠用。先连 VPN 再进 Tor，能对 ISP 隐藏你在用 Tor 这件事，代价是多一个信任点与速度。先连 Tor 再出 VPN 很少见，会牺牲 Tor 的部分匿名优势。多数人不需要叠，叠错反而更糟，不确定就单用 Tor。完整说明见 [什么是 Tor](./what-is-tor.md)。
- **介于两者之间**：想要 Tor 的分散式信任又要 VPN 式的全 app 保护，可以试前面介绍的 Tor VPN（Beta），但它还在 Beta，别拿来做高敏感的事。

## 连接遮得住，身分遮不住

真正要顾的往往是你在账号里留了什么、发表了什么，连接本身反而其次。VPN 把来源 IP 换掉，遮不住你登入的身分。这层差别见 [匿名与隐私的差别](../basics/anonymity-vs-privacy.md)，逐地的合法性与在地风险见 [亚洲出差与研讨会的数位准备](../scenarios/asia-travel.md)。

## 常见问题

??? question "免费 VPN 到底能不能用"

    分两种。来路不明的免费 App 多半靠卖你的数据或塞广告赚钱，避开。可信的免费方案是少数有清楚金主的服务：Proton VPN 有不限流量的免费方案，Riseup 与 CalyxVPN 由非营利提供给人权社群。判准一样是它靠什么赚钱、有没有被审计。

??? question "用了 VPN 我就匿名了吗"

    不会。VPN 换掉的是看得到你流量的人，不会让你登入的网站、浏览器指纹、cookie 消失，你连 VPN 业者也得信任。要匿名请用 Tor，概念差别见 [匿名与隐私的差别](../basics/anonymity-vs-privacy.md)。

??? question "VPN 跟 Tor 要不要叠着用"

    多数人不用。先 VPN 后 Tor 可以对 ISP 藏住你在用 Tor，代价是多一个信任点与速度。先 Tor 后 VPN 很少见、会牺牲匿名。不确定就单用 Tor，它本身已经处理好你大部分要的匿名。

??? question "公司或组织要我装它指定的 VPN，安全吗"

    公司 VPN 的设计目的通常是保护公司网络、让你连回内网，顺带能看到你经过它的流量。它保护的是组织，不是你个人隐私。上班用没问题，但别拿公司 VPN 处理私人敏感的事，那等于把浏览记录交给雇主。

??? question "在中国、缅甸这种地方该用哪种"

    要有强混淆的方案，入境前装好至少两款并测试。中国 Tor 直连不通，优先用 WebTunnel、Snowflake、meek 当备援。缅甸连 VPN 服务与 Tor 都被当封锁目标，使用本身可能触法，要假设全程受监控、带干净设备。可用性随封锁天天变，务必出发前查最新回报，逐地见 [亚洲出差与研讨会的数位准备](../scenarios/asia-travel.md)。

??? question "怎么知道我的 VPN 有没有泄漏"

    连着 VPN，开 [browserleaks.com](https://browserleaks.com/){target="_blank"} 这类能一次测 IP、DNS、WebRTC 泄漏的工具，看显示的 IP 与 DNS 是否为 VPN 的、有没有漏出你原本的真实 IP。它不属于任何 VPN 业者，不过也没有权威机构正式背书，当常用工具参考即可。确认客户端的 kill switch 开着。换 Wi-Fi、手机切到移动网络时最容易短暂泄漏，这些时候再测一次。

??? question "手机上的 VPN 要注意什么"

    前面推荐的 Mullvad、Proton VPN、IVPN 都有 iOS 与 Android 官方 app，从官方网站或正规 App 商店下载，别用来路不明的免费 VPN App（风险见前面的免费 VPN 段）。iOS 想用 Tor，Tor VPN 没有 iOS 版，改用 Onion Browser（见前面 Tor VPN 段）。Android 想把整台设备或选定 app 走 Tor，才有前面介绍的 Tor VPN（Beta）。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:material-incognito-circle: 匿名与隐私的差别](../basics/anonymity-vs-privacy.md)
- [:material-airplane: 亚洲出差与研讨会的数位准备](../scenarios/asia-travel.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 个人隐私指引研究专题](../community/privacy-guide.md)
- [:material-server-network-outline: 社群自架服务](../community/tools.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>

[^mullvad-raid]: [Mullvad VPN was subject to a search warrant. Customer data not compromised](https://mullvad.net/en/blog/2023/4/20/mullvad-vpn-was-subject-to-a-search-warrant-customer-data-not-compromised){target="_blank"} - Mullvad 官方博客（2023-04-20）
[^mullvad-ram]: [We have successfully completed our migration to RAM-only VPN infrastructure](https://mullvad.net/en/blog/we-have-successfully-completed-our-migration-to-ram-only-vpn-infrastructure){target="_blank"} - Mullvad 官方博客（2023-09-20）
[^kape]: [Kape Technologies (Formerly Crossrider) Now Owns ExpressVPN, CyberGhost, Private Internet Access, Zenmate](https://cyberinsider.com/kape-technologies-owns-expressvpn-cyberghost-pia-zenmate-vpn-review-sites/){target="_blank"} - Cyber Insider。另见 [Kape Technologies - Wikipedia](https://en.wikipedia.org/wiki/Kape_Technologies){target="_blank"}
[^nord]: [Nord Security joins forces with Surfshark](https://nordvpn.com/blog/nord-security-surfshark-merger-agreement/){target="_blank"} - NordVPN 官方公告（2022-02-02）
[^free-vpn]: [An Analysis of the Privacy and Security Risks of Android VPN Permission-enabled Apps](https://dl.acm.org/doi/10.1145/2987443.2987471){target="_blank"} - ACM IMC 2016（CSIRO、ICSI、UNSW）。数据为 2016 年，App 生态已演变，但免费 VPN 的基本商业模式问题至今未改变。
[^myanmar]: [Myanmar enacts cybersecurity law that aims to restrict use of VPNs](https://www.rfa.org/english/myanmar/2025/01/02/cybersecurity-law-vpn/){target="_blank"} - Radio Free Asia。法律分析见 [Myanmar Cybersecurity Law Takes Effect](https://www.tilleke.com/insights/myanmar-cybersecurity-law-takes-effect/){target="_blank"} - Tilleke & Gibbins
[^china]: [FOTN 2025 China](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"} - Freedom House。GFW 与翻墙连接指引见 [Tor 对中国的连接指引](https://support.torproject.org/censorship/connecting-from-china/){target="_blank"} - Tor Project。2025 年底官方公开示警见 [AI Cop Signals VPN Crackdown](https://chinamediaproject.org/2025/11/13/ai-cop-signals-vpn-crackdown/){target="_blank"} - China Media Project
[^stealth]: [Defeat censorship with Stealth, our new VPN protocol](https://protonvpn.com/blog/stealth-vpn-protocol){target="_blank"} - Proton VPN 官方
[^pg]: [VPN Services](https://www.privacyguides.org/zh-Hant/vpn/){target="_blank"} - Privacy Guides（非商业、不收广告主的开源隐私工具索引）
[^algo]: [trailofbits/algo](https://github.com/trailofbits/algo){target="_blank"} - Trail of Bits（GitHub）
[^outline]: [Introducing the Outline Foundation: An Independent Home for Outline](https://medium.com/jigsaw/introducing-the-outline-foundation-an-independent-home-for-outline-39fba2ab4e25){target="_blank"} - Jigsaw。记者应用案例见 [Google has a new tool to outsmart authoritarian internet censorship](https://www.technologyreview.com/2023/09/13/1079381/google-jigsaw-outline-vpn-internet-censorship/){target="_blank"} - MIT Technology Review
[^torvpn-about]: [About Tor VPN](https://support.torproject.org/tor-vpn/getting-started/about-tor-vpn/){target="_blank"} - Tor Project 官方支援文件（含 Beta 警语）
[^torvpn-install]: [Download and Install - Tor VPN](https://support.torproject.org/tor-vpn/getting-started/download-and-install/){target="_blank"} - Tor Project 官方支援文件。BSD 3-Clause 授权见 [Tor VPN Beta on F-Droid](https://f-droid.org/en/packages/org.torproject.vpn/){target="_blank"} - F-Droid
[^torvpn-intro]: [Tor VPN Threat Model](https://support.torproject.org/tor-vpn/security/threat-model/){target="_blank"} - Tor Project 官方支援文件（每个 app 独立 circuit 与信任模型）
[^torvpn-orbot]: [What's the difference between TorVPN and Orbot](https://forum.torproject.org/t/whats-the-difference-between-torvpn-and-orbot/21204){target="_blank"} - Tor Project 官方论坛（社群讨论）。Orbot 底层为 C-tor，见 [orbot-android](https://github.com/guardianproject/orbot-android){target="_blank"} - Guardian Project
[^ios-tor]: iOS 官方推荐 Onion Browser 见 [Tor Project download page](https://www.torproject.org/download/){target="_blank"} - Tor Project。搭配 Orbot 强化防漏的建议见 [Onion Browser Review](https://www.privacyguides.org/articles/2024/09/18/onion-browser-review/){target="_blank"} - Privacy Guides
