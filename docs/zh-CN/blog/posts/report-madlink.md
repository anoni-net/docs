---
date: 2026-05-23
authors:
    - anoni-net
categories:
    - 更新
    - 翻译文章
slug: report-madlink
image: "https://interseclab.org/wp-content/uploads/2026/04/MADLink-A-Taiwanese-Vestige-in-the-Geedge-Suply-Chain.jpg"
summary: "InterSecLab 在 2026 年 4 月发布《MADLink》报告，揭露凌华科技于 2019 至 2020 年间出货 1,708 台 CSA-7400 给中国 Geedge Networks，这批硬件最终部署在哈萨克斯坦，作为国家级网络审查与监控系统的核心。社区已完成正体中文翻译，并针对这份点名了台湾上市公司的报告，补上一页编辑观察，记录报告发布后台湾本地媒体、政府、立委的接收状况。"
description: "InterSecLab MADLink 报告中译上线。Geedge 第一代防火墙平台的 1,708 台硬件基底，是凌华科技在 2019 至 2020 年出货的 CSA-7400。本次同步补上编辑观察一页，记录报告发布后台湾本地的接收状况。"
---

# InterSecLab MADLink 翻译上线：凌华 1,708 台 CSA-7400 进入哈萨克斯坦审查系统，社区同步整理编辑观察

![MADLink 报告封面](https://interseclab.org/wp-content/uploads/2026/04/MADLink-A-Taiwanese-Vestige-in-the-Geedge-Suply-Chain.jpg){style="border-radius:10px;"}

一家在台北证交所挂牌的上市公司，2019 至 2020 年间出货了 1,708 台 CSA-7400 高密度网络平台设备给一家中国客户。这批硬件最终在哈萨克斯坦开机运行，作为国家级网络审查与监控系统的核心。设备来自凌华科技（ADLINK Technologies，股票代号 6166），客户是中国公司 Geedge Networks（积至公司），他们的旗舰产品「天狗安全闸道（Tiangou Secure Gateway，TSG）」其能力可媲美中国防火长城。

这是 InterSecLab 在 2026 年 4 月发布的调查报告 [MADLink: A Taiwanese Vestige in the Geedge Supply Chain](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"} 的核心发现，也是 2025 年 9 月《[The Internet Coup](https://anoni.net/docs/reports/interseclab-network-coup/){target="_blank"}》之后，InterSecLab 对 Geedge 供应链延伸调查的第一篇。匿名网络社区 anoni.net 已完成正体中文（台湾用语）翻译，这次跟上一份报告不同，我们同步整理了一页「编辑观察」，记录报告发布后台湾本地媒体、政府、立委的接收状况。

<!-- more -->

## 报告找到了什么

凌华科技在 2019 至 2020 年间出货给 Geedge 的 1,708 台 CSA-7400，构成 Geedge 第一代防火墙平台的硬件基底，部署在哈萨克斯坦，推动国家层级的网络审查与监控。CSA-7400 是凌华自家行销定位用于深度封包检测（DPI）与防火墙的高密度 4U 设备。

凌华的硬件还出现在 Geedge 部署于缅甸的 EtherFabric 之中。EtherFabric 是一款定制的网络封包代理（network packet broker，NPB），用来在多个 TSG 节点之间做流量负载均衡。外泄文件中的一组 MAC 地址可追溯到凌华，这显示凌华在 Geedge 产品线中的影响并非单笔 CSA-7400 交易那么简单。

Geedge 目前这一代的 TSG 部署在埃塞俄比亚、巴基斯坦和缅甸，服务器来自中科曙光（Sugon，已遭美国制裁）旗下的 Nettrix，存储来自浪潮（Inspur）。这些是标准 x86 元件，即便直接采购受限，仍可从二手市场取得。报告认为，这类为监控用途设计的专用硬件（CSA-7400、EtherFabric 中使用的凌华元件），才是出口管制最能发挥效果的对象。

## 翻译版的阅读路径

完整中译放在这里（中译版仅在 zh-TW 维护）：[MADLink / 台湾在 Geedge 供应链中的遗留 - InterSecLab](https://anoni.net/docs/reports/interseclab-madlink/){target="_blank"}

原报告为单页长文，社区依主题切成 5 章，便于在 Matrix 上分章节讨论：

* [第 1/5 章：摘要与主要发现](https://anoni.net/docs/reports/interseclab-madlink/index_1/){target="_blank"}
* [第 2/5 章：Geedge 供应链深入解析（三代 TSG 硬件）](https://anoni.net/docs/reports/interseclab-madlink/index_2/){target="_blank"}
* [第 3/5 章：EtherFabric 与 ADLINK 的角色和回应](https://anoni.net/docs/reports/interseclab-madlink/index_3/){target="_blank"}
* [第 4/5 章：结论](https://anoni.net/docs/reports/interseclab-madlink/index_4/){target="_blank"}
* [第 5/5 章：附录（凌华科技与经济部完整声明）](https://anoni.net/docs/reports/interseclab-madlink/index_5/){target="_blank"}

关于 ADLINK 的指控段落，翻译团队将凌华的回应全文完整保留在附录章节，读者可以自行比对两造说法。

## 这次跟上一份报告不同的地方：编辑观察页

上一份《The Internet Coup》翻译时，我们的工作止于忠实中译。MADLink 这次点名了一家台湾上市公司，理论上会引发本地媒体追问、立委质询、主管机关回应这样的循环，但截至 2026-05-20 的观察，台湾中文公共领域明显安静。这个现象本身就是观察素材，所以多写了一页：[编辑观察：台湾对 MADLink 报告的后续反应](https://anoni.net/docs/reports/interseclab-madlink/index_6/){target="_blank"}。

这页明确标示为 anoni.net 编辑团队的整理，不属于 InterSecLab 原报告。内容分成五个区块：

**外部交叉验证：** 为了让读者能自行重现，我们对报告中的关键事证跑了一轮独立查证，例如 IEEE OUI `00:30:64` 确实登记在凌华名下（macvendors 与 macvendorlookup 两个独立来源都回传「ADLINK TECHNOLOGY, INC.」）、CSA-7400 在凌华中英文官网上明确被分类为「Network Security Appliance」并行销 DPI/IDS/IPS/NGFW、积至（海南）信息技术有限公司由方滨兴 2018 年在海南创立（维基百科、大纪元、新唐人交叉印证）、New Bloom Magazine 2026-04-29 那篇报道真实存在。

**媒体覆盖对比：** 国际与英文媒体有覆盖（InterSecLab 原报告、New Bloom Magazine、cybernews 等）。台湾中文媒体基本无覆盖（联合、自由、中央社、TVBS、TechNews、iThome 等截至 2026-05-16 都没有直接报道，TechNews 虽然在 2025-09 写过 Geedge 500GB 外泄本身，但未追凌华这条线）。被原报告引述的立法委员沈伯洋，在公开场合也找不到就此议题的进一步发声。

**为什么台湾这么安静：** 编辑团队整理了 5 个可能因素：技术门槛高且缺少在地 brief、信息安全媒体聚焦企业市场而非人权与出口管制、2025-09 外泄事件热度已过、蓝绿两边都没有主动放大的政治诱因、公民社会的议题分配还没把监控科技出口的人权审查当主战场。这些都是观察而非定论，欢迎社区补充与挑战。

**后续可追踪指标：** 按政府/媒体/公民社会分组，列出国贸署战略性高科技货品出口实体管制清单、立法院议事系统、公开信息观测站代号 6166、监察院纠正案公告等具体入口的 URL，并附上 4 种成本不同的执行方式（Google Alerts、手动巡查、RSS bot、自动化爬虫）对照表，让不同人力与技术背景的社区成员都能找到合适的参与方式。

**English summary for international readers：** 完整英文版观察，方便从海外连过来的读者了解这份报告在台湾本地的接收脉络。

## 为什么做这页观察

MADLink 的核心问题，是台湾现行出口管制制度能否阻止本地公司供应监控与审查设备给威权政府的供应链。这个问题没办法靠一份英文报告自己解决，需要本地的报道、质询、倡议跟上，才会产生制度修补的压力。

当这个循环没有启动时，记录当下的接收状态，本身是一种接力的方式。后续若有新进展（媒体开始追、立委公开质询、凌华发重大讯息、国贸署更新框架），这页会持续加上日期戳记更新，并在 Matrix 同步通知。

## 感谢与参与

感谢 InterSecLab 持续推动这个系列调查，也感谢社区成员投入翻译与编辑观察的整理工作。

两份报告（《The Internet Coup》与《MADLink》）的社区讨论延用同一个 Matrix 频道：

* :material-chat-processing-outline: <https://matrix.to/#/#interseclab-the-internet-coup:im.anoni.net>{target="_blank"}

如果你发现编辑观察页未收录的相关报道、政府文件或公开发言，欢迎透过页面右上方的编辑图示直接送 PR 补充，或在 Matrix 频道分享。

## 相关阅读

* [MADLink 中译首页](https://anoni.net/docs/reports/interseclab-madlink/){target="_blank"}：报告翻译入口（中译版仅在 zh-TW 维护）
* [编辑观察：台湾对 MADLink 报告的后续反应](https://anoni.net/docs/reports/interseclab-madlink/index_6/){target="_blank"}：本社区整理的接收状况快照
* [The Internet Coup / 网络政变 - InterSecLab](https://anoni.net/docs/reports/interseclab-network-coup/){target="_blank"}：本系列首部报告（中译版仅在 zh-TW 维护）
* [技术分析报告：网络政变](./report-the-internet-coup.md){target="_blank"}：上一份报告中译上线时的 blog 公告
