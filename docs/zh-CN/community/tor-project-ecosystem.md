---
title: Tor Project 生态与对接
description: Tor Project 的规划去哪里看、哪些项目还在持续运作、官方沟通渠道、以及对中文社区最容易切入的参与方式，一页看懂如何把在地推广接上游 Tor 生态。
icon: material/handshake-outline
---
<!-- zh-CN：Claude Code 候选稿，待人工校对（词汇差异与政治措辞） -->
# :material-handshake-outline: Tor Project 生态与对接

匿名网络社区 anoni.net 这一年在地推广 Tor、Tails、OONI，伙伴问得最多的，是除了自己用、对外讲之外，能不能直接参与 Tor 上游的开发与社区。可以，而且门槛比想象低。接上游能带来几件实际的事，在地的观测成果可以回馈给维护网络健康的团队，每多架一个中继就替所在区域增加一个节点、提升 IP 多样性，Tor 的繁体中文翻译也需要人持续维护、跟上每次更新。Tor Project 是公开治理的非营利组织，沟通渠道、源代码、规划文件大多对外开放，无论身在哪个华语环境，都能从翻译、跑中继、办推广开始参与。

这页把四件事整理在一起：Tor 的规划去哪里看、哪些项目还在动、官方的沟通渠道、以及对中文社区最容易切入的参与方式。各条参与方式若站内已有操作教程，会直接链接过去。

!!! tip "最低门槛的起手式"

    两件事就能开始，都不需要等任何人批准，个人身份参与就行，不必代表整个社区。一是到 Weblate 维护 Tor 支持文档的繁体中文翻译，zh_Hant 已大致翻完，持续需要人跟上原文更新与校对（[Tor new-support-portal](https://hosted.weblate.org/projects/tor/new-support-portal/){target="_blank"}，流程见 [中文化与文件翻译](./i18n.md)）。二是进 Tor 官方论坛与 Matrix 的 `#tor-project:matrix.org` 频道自我介绍。先把贡献记录与能见度建立起来，后面的正式对接都从这里开始。

## 从哪里看 Tor 的规划

Tor Project 的规划公开在两层，给一般关注者看的策略层在官方博客，给贡献者看的细节规划在自架的 GitLab wiki。

对外策略层在 [blog.torproject.org](https://blog.torproject.org/){target="_blank"}。每年的方向文会点出当年度的优先项目，2026 年的版本聚焦把规避能力整合进更多 Tor 软件（例如 Tails 与 Tor VPN），并把对抗俄罗斯、中国这类把网络各自筑墙的做法当成贯穿的关注[^1]。年度回顾自述四个长期核心关注：性能与安全、网络健康度、抗审查、第三方整合兼容性[^2]。财报则透露策略重心，美国政府资助占比已从 FY2021-22 的 53.5% 降到 FY2023-24 的 35.08%，方向是降低单一资助来源的依赖[^3]。线上大会 State of the Onion 通常在年底举办，2025 年分两场（11 月团队更新、12 月社区更新），是看年度方向最集中的时间点[^4]。

内部规划层在 [gitlab.torproject.org/tpo](https://gitlab.torproject.org/tpo){target="_blank"}，公开项目不需登录就能读。各团队的 `team` meta 项目 wiki 放 roadmap 与会议记录，全机构的 sponsor 组合整理在 `tpo/team` 的 Sponsors 总览页[^5]，TPA（系统管理团队）的年度 roadmap 是最具体可读的一份[^6]，Arti 的逐项里程碑挂在群组的 Roadmap 标签 issue 上[^7]（milestones 端点需登录，计划的时程日期透过公开 API 读不到，要从各 wiki 内嵌的链接追）。

## 目前的重点方向与活跃项目

看不懂下面的技术细节没关系，参与 Tor 不需要先懂这些，想直接知道能做什么可以跳到 [如何开始对接](#如何开始对接)。这节是给想掌握 Tor 往哪走的人。

### 活跃度快照

Tor 的 GitLab 上有两百多个项目，活跃程度差异很大。截至 2026 年 6 月的一次公开 API 扫描，非归档项目约 252 个，近 30 天内有活动的约 103 个，其中以 network-health 最活跃，web、core、tpa、applications 也都有不少在动的项目[^8]。这是当下的快照，要看实时状态直接到 GitLab 依 `last_activity_at` 排序最准，数字本身会随时间变动。

### 技术主线

几条主线值得社区跟着看：

- 抗审查三件套。WebTunnel 把网桥流量伪装成普通 HTTPS，2025 年在俄罗斯是关键工具。Snowflake 用浏览器志愿者的 WebRTC（浏览器做视频通话那种实时连接）当临时代理，稳定运作中，站内介绍见 [Tor Snowflake 网桥点](../tools/tor-snowflake.md)。Conjure 利用 ISP 未使用的地址空间，对抗审查者把已知代理 IP 逐一列出来封锁的手法，官方规划 2026 年起开始逐步推出[^9]。
- Arti，Tor 的纯 Rust 重写版。客户端核心、circuit、Onion Service 已经稳定，relay 与 directory authority（维护中继名册的核心服务器）仍在开发，官方未承诺与旧版 C 实现功能对等的时程。
- Counter-Galois-Onion（CGO）新对称加密，修补旧加密可被篡改、被用来追踪连接的弱点，目前在 Arti 内标为实验，测试完成才会默认启用。
- Tor VPN（Android），底层用 Arti，2025 年 9 月上架 beta，官方标明仍属实验、不适合高风险场景。iOS 仍是既有的 Orbot。
- Onion Services 的易用性与防滥用，以及 Tails（见 [什么是 Tails](../tools/what-is-tails.md)）并入 Tor Project 后的整合。

### 看 sponsor 判断哪些方向会持续做

哪些方向会持续做，看 sponsor 资助最准。下表是 Sponsors 总览页列出的部分案子[^5]，编号以 `S` 开头：

| Sponsor | 方向 | 与匿名网络社区的关联 |
|---|---|---|
| `S96` | 中国、香港、西藏的审查规避：新 pluggable transports、更难封锁的网桥、改善网桥派发 | 最相关，正是社区关注的议题 |
| `S112` | 对抗恶意中继、提升网络健康：监控工具、中继运营者行为准则、抗中继攻击 | 对应社区的观测工作 |
| `S119` | Arti，Tor 的纯 Rust 实现 | 下一代技术基础 |
| `S150` | 淘汰 BridgeDB，全面迁移到 RDSys 新派发系统 | 网桥派发机制 |
| `S101` | Android 的 Tor VPN client | 消费级产品 |
| `S131` | Mullvad Browser 与 Tor Browser 重构 | 浏览器 |

`S96` 与 `S112` 跟匿名网络社区的关注重叠最深，一个是繁体中文用户面对的审查规避，一个对应社区在做的网络可达性观测。

## 官方沟通渠道

Tor 把 IRC（OFTC 网络）与 Matrix 双向桥接，用 Element 加入 Matrix 或用 IRC 都会进到同一个频道[^10]。这里的 Matrix 是 Tor 官方的 `matrix.org` 频道，跟匿名网络社区自架的 `im.anoni.net` 是两回事。

| 频道 | 用途 |
|---|---|
| `#tor` | 用户支持，问 Tor 操作问题 |
| `#tor-dev` | 开发、协议、程序技术讨论 |
| `#tor-project` | 组织与社区事务、meetup、outreach |
| `#tor-relays` | 跑中继的运营者社区 |
| `#tor-l10n` | 翻译与本地化讨论 |
| `#tor-meeting` | 旁听或参加公开记录的团队会议 |

文字讨论与公告在 [Tor Forum](https://forum.torproject.org/){target="_blank"}（Discourse 论坛，分用户支持、本地化、活动等类别），各邮件列表在 [lists.torproject.org](https://lists.torproject.org/){target="_blank"} 订阅。组织层级的事务走 email：非营利事务、商标、合作协调寄 <frontdesk@torproject.org>，邀请讲者寄 <speaking@torproject.org>，安全问题寄 <security@torproject.org>。

进这些频道与论坛前，先读 Tor 的 [社区政策与行为准则](https://community.torproject.org/policies/){target="_blank"}，了解社区对互动的共同期待。

## 如何开始对接

针对一个中文的在地社区，依实际可行性排序，每一项都标出站内已有的操作教程：

1. 本地化翻译。门槛最低，不需审核账号、不需技术背景，个人就能在 Weblate 开始，还能直接把繁体中文做好，是建立社区贡献记录最快的方式。流程与 Weblate 链接见 [中文化与文件翻译](./i18n.md) 的「Tor 文件翻译」一节，第一次参与先读 [成为 Tor 翻译者](https://community.torproject.org/localization/becoming-tor-translator/){target="_blank"}。
2. 进 `#tor-project` 与论坛自我介绍。这是 meetup、outreach、社区事务的主场，后续一切正式对接的起点。
3. 办在地 meetup。Tor 的 [Outreach](https://community.torproject.org/outreach/){target="_blank"} 提供 Street Team Kit、讲稿与「如何办自己的 Tor meetup」素材，属官方鼓励的自主行动，不需审批，需要讲者时写信给 <speaking@torproject.org>。
4. 跑中继或架网桥。有机器与带宽的成员可架设中继，强化区域节点覆盖，技术操作见 [如何搭建 Tor Relay](./setup-tor-relay.md)。想架设伪装成 HTTPS 的网桥见 [设置 Tor WebTunnel](./setup-tor-webtunnel.md)，求助渠道是 `#tor-relays` 与 tor-relays 邮件列表。
5. 开发与回报问题。需要 GitLab 账号的人到 [anonticket.torproject.org](https://anonticket.torproject.org/){target="_blank"} 匿名申请或回报，再到对应 repo 开 issue，新手可从标 first-contributors 的 issue 入手，技术讨论在 `#tor-dev`。
6. Training Partner 正式对接。Tor 有 [training partners](https://community.torproject.org/training/partners/){target="_blank"} 机制，这是社区对组织最正式的合作形式，通常建立在前面几项已有贡献记录之后，适合当中长期目标。

## 匿名网络社区的对接脉络

社区现有的工作跟 Tor 几个方向接得起来：

- 繁体中文文件与用语。社区已在做 zh-Hant 的翻译与用语规范，直接转成 Weblate 上的 Tor 翻译贡献，是最自然的延伸。
- 网络可达性观测。社区维运的 Pulse（[Tor Relays 观测点](../taiwan/tor-relay-watcher.md) 的图表来源）与 ASN Coverage（[ASN 观测数据分析](../taiwan/ooni-asn-coverage.md)）对应 network-health 团队与 `S112` 的工作方向，观测成果可带到该团队的社区分享。
- 校园中继。[Tor Relay 校园建立研究专题](./relay-on-campus.md) 源自 EFF 与 Tor Project 合作的 Tor University Challenge，台师大已有运行中的案例（见 [台师大 NZ 访谈](../blog/posts/ntnu-nz.md)），是把在地推广接回 Tor 生态的具体成果。

这些方向如何排进社区的年度节奏，见 [2026 年度路线图](./roadmap-2026.md)。State of the Onion 的社区场会公开征集社区更新，是把这些成果对国际亮相的场合。

## :fontawesome-solid-diagram-project: 相关阅读

<div class="grid cards" markdown>

- [:material-translate-variant: 中文化与文件翻译](./i18n.md)
- [:simple-torproject: 如何搭建 Tor Relay](./setup-tor-relay.md)
- [:material-tunnel-outline: 设置 Tor WebTunnel](./setup-tor-webtunnel.md)
- [:material-hand-heart: 如何参与与认领主题](./how-to-contribute.md)

</div>

[^1]: [Advancing digital rights in 2026](https://blog.torproject.org/advancing-digital-rights-in-2026/){target="_blank"} - The Tor Project Blog
[^2]: [The Tor Project's 2024 Year in Review](https://blog.torproject.org/2024-year-in-review/){target="_blank"} - The Tor Project Blog
[^3]: [The Tor Project Financial Reports for July 2023 to June 2024](https://blog.torproject.org/financials-blog-post-2023-2024/){target="_blank"} - The Tor Project Blog
[^4]: [State of the Onion 2025](https://blog.torproject.org/state-of-the-onion-2025/){target="_blank"} - The Tor Project Blog
[^5]: [tpo/team wiki：Sponsors 总览](https://gitlab.torproject.org/tpo/team/-/wikis/Projects/Sponsors-2023){target="_blank"} - Tor Project GitLab
[^6]: [tpo/tpa/team wiki：roadmap/2025](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/roadmap/2025){target="_blank"} - Tor Project GitLab
[^7]: [tpo 群组 Roadmap 标签 issues](https://gitlab.torproject.org/groups/tpo/-/issues/?label_name[]=Roadmap&state=opened){target="_blank"} - Tor Project GitLab
[^8]: [Tor Project GitLab 公开 API](https://gitlab.torproject.org/api/v4/groups/tpo/projects?include_subgroups=true){target="_blank"} - 2026 年 6 月扫描的非归档项目活跃度快照
[^9]: [Staying ahead of the censors in 2025](https://blog.torproject.org/staying-ahead-of-censors-2025/){target="_blank"} - The Tor Project Blog
[^10]: [Chat with the Tor community](https://support.torproject.org/get-in-touch/chat-with-us/){target="_blank"} - Tor Project Support
