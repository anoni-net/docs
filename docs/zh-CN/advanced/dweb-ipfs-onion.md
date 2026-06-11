---
title: 去中心化网站发布
description: 从自架到 CDN、IPFS、Onion 服务的选择空间。内容定址 vs 连线匿名两种设计取舍，以及 anoni.net 文件站的 IPFS + Onion 部署实案。
icon: material/web-box
---

# :material-web-box: 去中心化网站发布

「网站如何发布」这件事，过去十年多了不少选择。传统的「自架服务器 + DNS」之外，CDN 把内容快取到全球节点降低延迟，IPFS 用内容定址让文件在多个节点之间流通，Tor Onion 服务则让网站直接以 .onion 域名运作于 Tor 网络。后两者常被一起讨论，但问题意识不同：IPFS 着重抵抗删除与审查，Onion 着重连线匿名与管制规避。这篇文章对照两者的设计差异、真实世界的合用组合，并以 anoni.net 文件站的部署作为实例。

## 「网站如何发布」的选择空间

网站发布的选项从「中心化 + 高效能」到「去中心化 + 抗审查」形成一道光谱：

- **自架服务器**：自己有 IP、自己有 DNS。完全可控，也完全集中。被封 IP、被没收服务器就挂了。
- **CDN**（Cloudflare、Fastly、CloudFront）：边缘节点代理流量。效能与抗 DDoS 强，但对 CDN 服务商与 root DNS 高度依赖。
- **静态站托管**（GitHub Pages、Cloudflare Pages、Netlify）：简化部署，但服务商可单方面下架。
- **IPFS**：内容用 hash 定址，理论上任何节点都可以代为提供。没有单一可下架的点，但内容存活靠 pin。
- **Onion 服务**：网站直接运作于 Tor 网络，不需要公开 IP、不需要 DNS。连线匿名、抗 IP 封锁，但效能差、跨设备连线有限。

实际选择多半是混搭：主站走 CDN 求效能，IPFS 镜像求抗删除，Onion 镜像求抗封锁。

## IPFS 设计核心

IPFS（InterPlanetary File System）的核心是内容定址（content addressing）。

- **CID**（Content Identifier）：每个文件算出一段 hash（内容的指纹，内容一样指纹就一样），hash 就是它的位址。同样的内容在任何节点都是同一个 CID。
- **DHT**（Distributed Hash Table，分布式哈希表）：节点之间互相询问「谁拥有这个 CID」，用 Kademlia 算法快速定位，不需要中央服务器登记。
- **IPNS**（InterPlanetary Name System）：把可变的「名字」对应到当前的 CID。内容更新时 CID 变，IPNS 记录更新。

对网站发布的意义：

1. **没有单一可下架的位置**：只要有任何节点 pin 着这个 CID，内容就存活。
2. **内容窜改可被侦测**：CID 是 hash，任何窜改都会改变 CID，可被验证。
3. **跨节点重复利用**：同一文件不管被多少站引用，CID 唯一，可共用快取。

设计上的限制：

- **内容存活靠 pin**：没有节点主动 pin 的内容会在垃圾回收中消失。「上 IPFS」不等于「永久保存」。
- **DHT 查询延迟**：第一次取得内容比 HTTP 慢。
- **网关依赖**：多数用户透过公开网关（ipfs.io、cf-ipfs.com）读取，网关被封等于连不上。
- **动态内容受限**：IPFS 适合静态，动态功能需要额外层。

## Onion 服务设计核心

Tor Onion 服务（v3）让网站直接运作于 Tor 网络：

- **自描述地址**：.onion 地址（v3，56 字元）本身就是服务的 ed25519 公钥，不需要 DNS、不需要凭证授权（少了 DNS 这层，就少一个被拦截或窜改网域解析的点）[^1]。
- **Descriptor publishing**：服务透过 Hidden Service Directories（HSDir）发布自己的位置描述。
- **Rendezvous protocol**：用户与服务透过 Tor 网络内的会合点建立加密连线，双方都不知道对方的 IP。

对网站发布的意义：

1. **完整连线匿名**：访客的 IP 对网站不可见，网站的 IP 对访客也不可见。
2. **不依赖 DNS**：.onion 地址自我验证，没有 CA 信任链问题。
3. **抗 IP 封锁**：流量都在 Tor 网络内，封 IP 没用。
4. **不依赖公开 IPv4**：可从 NAT 后、可从浮动 IP 启动。

设计上的限制：

- **效能受限**：Onion 服务连线是 client 三跳 + service 三跳共六个节点的电路，加上会合点机制，延迟比直连高。
- **依赖 Tor 网络**：Tor Project 与 Tor 中继网络被封禁时，整个 .onion 生态受影响。
- **不适合大量静态资产**：图片、视频走 Tor 成本高。
- **用户门槛**：访客需要 Tor Browser 或 Onion-aware 客户端。

## 两者解决不同问题

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/ipfs-vs-onion.drawio.svg" alt="IPFS 与 Onion 架构对照。IPFS 走 gateway → DHT → peer，主要解决抗删除。Onion 走 Guard → Middle → Rendezvous → HSDir → 服务，主要解决连线匿名">
</figure>

| 维度 | IPFS | Onion |
|---|---|---|
| 主要解的问题 | 抗删除、抗集中失效 | 连线匿名、抗 IP 封锁 |
| 访客匿名 | ❌ 无内建 | ✅ 默认提供 |
| 服务匿名 | ❌ 节点 IP 可见 | ✅ 默认提供 |
| 内容窜改检测 | ✅（CID hash） | 透过 TLS / 签章另外提供 |
| 抗下架 | ✅（多节点 pin） | 部分（单一服务可被人为关闭） |
| 大档效能 | 中等 | 差 |
| 动态内容 | 困难 | 跟一般网站类似 |
| 访客门槛 | 低（浏览器网关） | 高（要 Tor Browser） |

要抗删除选 IPFS，要连线匿名选 Onion，两者都需要就同站双镜像。

## 已知限制与风险

在挑选组合前，先认清两个技术各自有「去中心化」承诺无法完全兑现的地方：

- **IPFS 的内容存活依赖主动 pin**：没有 pin 就消失。Pinata 这类中心化 pin 服务商、或 Filecoin 这类需要代币激励的去中心化存储协议，都让「永久保存」重新依赖第三方。
- **Onion 依赖 Tor 网络**：Tor 中继节点若大量被封禁，或 Tor Project 停止维运，.onion 生态都会受影响。
- **两者的入口仍多半是中心化服务**：用户透过 ipfs.io 或 Tor Browser 访问，这些入口本身仍是潜在攻击面。
- **法律灰色地带**：架设 Tor exit node、提供 IPFS pin 服务在不同司法管辖下风险不同。

## 常见组合

### Onion + IPFS 双镜像

主站发布到一般 Web，同时：

- IPFS 镜像：固定 CID 对应每次发布的内容，社群志工可协助 pin。
- Onion 镜像：跟主站同内容、提供匿名访问。

EFF、ProtonMail、纽约时报、BBC、CIA（美国中央情报局）都架设过官方 Onion 镜像[^2]。Cloudflare 也提供 Onion Routing：使用 Cloudflare 的网站启用后，Tor Browser 访客会自动改走 Cloudflare 的 .onion 端点连入、不经 exit node[^3]。

### IPFS + ENS（以太坊网域系统）

把 IPFS 内容透过 ENS 给一个可记忆的名字（例如 `vitalik.eth`），用 ENS 上的记录指到当前 CID。每次更新内容更新 ENS 记录。

问题在 ENS 本身依赖以太坊链，且 ENS 名字需要付费，不是纯粹去中心化。

## anoni.net 文件站的实际部署

anoni.net 文件站本身就是一个 IPFS + Onion 双镜像案例。简化的流程：

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/anoni-deployment.drawio.svg" alt="anoni.net 文件站三轨部署：同一份 GitHub repo 透过三套 build script 处理路径差异，分别部署到主站 anoni.net、IPFS 网络、.onion 隐藏服务">
</figure>


1. **Source**：MkDocs Material 写的 markdown，repo 在 GitHub。
2. **Main build**：`build_docs_anoni.sh` 生成 zh-TW / zh-CN / en 三语系静态网站，发布到 anoni.net。
3. **IPFS build**：`build_docs_anoni_ipfs.sh` 把同一份内容调整为 IPFS 友善的相对路径，pin 到 IPFS 网络。
4. **Onion build**：`build_docs_anoni_onion.sh` 调整为 .onion 域名相对路径，部署到 Tor 隐藏服务。

维运上的取舍：

- **IPFS pin 与内容存活**：社群成员可协助 pin 增加存活率，没有官方保证。
- **Onion 镜像延迟**：Tor 的延迟让 SPA 或大型 JS 套件 UX 较差，所以文件站走纯静态 + minimal JS。
- **三套域名的 SEO 与 trust 处理**：搜寻引擎主要索引 anoni.net 主站，IPFS 与 Onion 是备援与抗封锁层。

实际运作的限制：

- IPFS gateway（ipfs.io）有时不稳定，影响第一次访问。
- Onion 镜像的更新频率比主站慢一拍（部署流程较重）。
- 多语系资源在 IPFS 上会放大 CID 数量，pin 列表变长。

关于 Tor 网络本身的设计与威胁，见 [什么是 Tor](../tools/what-is-tor.md)。InterSecLab 对中国防火长城资料外泄的分析（[网络政变报告](https://anoni.net/docs/reports/interseclab-network-coup/){target="_blank"}）也说明了「集中化的审查基础建设」如何成为去中心化策略的对手。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 什么是 Tor](../tools/what-is-tor.md)
- [:material-snowflake: Tor Snowflake 桥接点](../tools/tor-snowflake.md)
- [:material-key-chain-variant: 端对端加密如何运作](./e2ee.md)
- [:material-atom-variant: 后量子密码概观](./post-quantum.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)
- [:material-school-outline: Tor Relay 校园建立](../community/relay-on-campus.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>

[^1]: [V3 onion services usage](https://blog.torproject.org/v3-onion-services-usage/){target="_blank"} - The Tor Project
[^2]: [EFF Now Has Tor Onions](https://www.eff.org/deeplinks/2023/04/eff-now-has-tor-onions){target="_blank"} - Electronic Frontier Foundation
[^3]: [Onion Routing](https://developers.cloudflare.com/network/onion-routing/){target="_blank"} - Cloudflare Docs
