---
title: 常被误认为匿名的网络
description: 加密 DNS、IPFS、Yggdrasil、DN42、I2P 各自解决什么问题、留下哪些暴露面。用官方文档的自述对照它们与 Tor 的差别。
icon: material/incognito-off
---

# :material-incognito-off: 常被误认为匿名的网络

换掉手机上的 DNS resolver、把网站放上 IPFS、加入一个志愿者自组的叠加网络，这几个动作在中文讨论里常被归进同一类，也就是让自己在网络上更难被指认。实际跑起来，它们对「谁看得到什么」的改动落差很大。有的把观察者从运营商换成另一家公司，有的一个观察者都没少，还额外留下一组长期不变的节点标识符。

这页把加密 DNS、IPFS、Yggdrasil、DN42、I2P 五个系统摆在一起，用它们官方文档写下的设计目标，对照各自留下的暴露面。Yggdrasil 的官方 FAQ 直接列了一题「Is Yggdrasil anonymous?」，回答的第一个字是 No，后面接着说明直接 peer 看得到你的 IP[^ygg-faq]。其余几个系统没有把话说得这么白，暴露面一样在那里。Tor 在表上只当参照的刻度，完整说明留在 [什么是 Tor](../tools/what-is-tor.md)，需要先厘清加密与匿名的界线时回到 [匿名、隐私、假名、机密性的差别](../basics/anonymity-vs-privacy.md)，判断自己需要哪一种保护则走一次 [威胁模型如何建立](../basics/threat-model.md)。

## 先把六个系统摆在一起

| 系统 | 它解决的问题 | 隐藏你的 IP | 隐藏你在找什么 | 匿名是设计目标 | 谁仍然看得到你 |
|---|---|---|---|---|---|
| **加密 DNS**（DoH/DoT） | 让网络路径上的第三方读不到你的域名查询 | ❌ | 部分（路径上看不到，resolver 全看得到） | ❌ | 你选的那家 resolver 收下全部查询，运营商仍看得到你接着连上的目的 IP |
| **IPFS** | 内容寻址、抗删除、抗单点下架 | ❌ | ❌ | ❌ | 交换数据的 peer 与 DHT 上的节点，看得到哪个 IP 在找哪个 CID |
| **Yggdrasil** | 端对端加密、自己找路的 IPv6 叠加网络 | ❌ | ❌ | ❌（官方 FAQ 明文） | 直接 peer 看得到你的 IP，局域网的自动 peering 还会露出设备 MAC 地址 |
| **DN42** | 用真实 BGP、whois、DNS 技术搭起来的实验网络 | ❌ | ❌ | ❌（官方明文警告） | peer 看得到你的 IP，公开 registry 长期留着你注册时填的联络信息 |
| **I2P** | 网络内部的匿名通信层 | ✅（对网络内的通信对象） | ✅ | ✅ | 你的运营商看得到你在跑 I2P，走 outproxy 出网时另有一组风险 |
| **Tor** | 连接匿名与规避审查 | ✅ | ✅ | ✅ | 不开网桥时运营商看得到你在用 Tor，出口节点看得到你的目的地 |

表上真正的分界落在第五栏，前四个系统的官方文档都没有把匿名列进设计目标，后两个有，而且为此付出了延迟与兼容性的代价。把前四个当成匿名工具使用，拿到的保护跟预期的差距就出在这里。

## 加密 DNS：换掉的是谁看得到

DNS 查询默认走明文，你的设备每问一次「这个域名的 IP 是多少」，路径上的设备都读得到。DoH（DNS over HTTPS，`RFC 8484`）把查询包进一般的 HTTPS 连接，DoT（DNS over TLS，`RFC 7858`）走专用端口的 TLS。两者加密的都是你到 resolver 这一段。

resolver 本身收下你的每一笔查询，而且知道是谁问的。把系统设置从运营商的 resolver 换成 Cloudflare 或 Google，改变的是这批记录落在谁手上。查询加密之后，你接着要连上的目的 IP 仍然出现在数据包里，掌握你这条线路的一方看得到你连去哪台服务器。TLS 握手里的 SNI 字段也还在，这一块的变化与限制写在 [Metadata 是什么，为什么重要](../basics/metadata.md)。

### 过滤型 resolver 与 DNS 审查是同一个动作

Cloudflare 除了不过滤的 `1.1.1.1`，另外提供 `1.1.1.2`（挡恶意软件）与 `1.1.1.3`（再加挡成人内容）。官方文档说明被判定为恶意的域名会返回 `0.0.0.0`，取代真实地址[^cf-families]。

返回一个假答案让连接失败，这正是 DNS 层审查的做法。技术动作一样，差别在使用者这一端的位置：过滤是你自己选的，随时可以换回 `1.1.1.1`，Cloudflare 也提供匿名反馈误判的渠道。要留意的是完整封锁清单与分类方法并未公开，你无法事先知道哪些域名会被挡掉。

这件事对跑 OONI Probe 的人有实际影响。网络连接测试（Web Connectivity）的判断方式是用系统 resolver 解析域名，再跟测试辅助服务器解出来的结果比对，地址或 ASN 对得上才算一致[^ooni-wc]。过滤型 resolver 对被挡的域名返回 `0.0.0.0`，这个结果跟辅助服务器对不上。测量数据看起来像当地网络出了状况，来源其实是这台设备自己的设置。

## IPFS：去中心化，每次查询仍带着你的 IP

IPFS 的内容寻址与 DHT 怎么运作，写在 [去中心化网站发布](./dweb-ipfs-onion.md)，那页处理的是发布者要怎么选建站方式。这里只看它留下的暴露面。

官方文档把话说得相当清楚：节点发布到 DHT 的必要 metadata，包含节点标识符（PeerID）与它正在提供的 CID，都是公开的，而且「那些 DHT 查询在公开场合发生」，因此第三方有可能监看这些流量，判断哪些 CID 在什么时候被谁请求[^ipfs-privacy]。同一份文档还提到，对你的 PeerID 做一次 DHT 查询就可能找出你的 IP 地址，节点若长期从同一个地点运作（例如家里）更是如此。

加密的范围是另一层落差，IPFS 加密的是传输过程，内容本身维持原样，任何人拿到 CID 都能下载并读取那份数据。官方给的缓解做法是关掉 reproviding、自行加密敏感内容，或者干脆跑一个私有的 IPFS 网络。

## Yggdrasil：把 IPv6 叠在现有网络上

Yggdrasil 是一个端对端加密的 IPv6 叠加网络，跑在现有的互联网之上，节点之间用 `tcp://` 或 `tls://` 建立 peering。地址落在 `0200::/7` 这个 IETF 已经废弃的范围，选它是为了避开与既有 ULA 地址的冲突。节点自己产生一组密码学身分，稳定的 IPv6 地址由这把密钥推导出来，不需要中央机构配发[^ygg-about]。这个寻址方式跟 Tor 的 v3 洋葱地址是同一种思路，地址本身带着验证信息。

匿名性上它走的方向不同，而且官方写得毫不含糊。FAQ 那一题的回答是「不，提供匿名并非 Yggdrasil 项目的目标。互联网上的直接 peer 看得到你的 IP 地址，并可能用这项信息判断你的位置或身分」，后面还补上一句：同一个局域网内经由 multicast 自动建立的 peering，通常会暴露你的设备 MAC 地址[^ygg-faq]。项目同时把自己标为 alpha 阶段的软件，附带相应的警语。

## DN42：去中心化到极致，也公开到极致

DN42 的自述是一个大型的动态 VPN，使用 BGP、whois 数据库、DNS 这些互联网技术，用途放在学习路由技术、串接私有网络，以及做实验，因为在里面弄坏东西不会有大型网络运营商找上门[^dn42-home]。

它用的资源全部取自私有范围，IPv4 是 `172.20.0.0/14`、IPv6 是 `fd00::/8`、ASN 落在 `4242420000` 到 `4242423999`，所以整套跟真实互联网的地址空间是隔开的。加入方式是 fork 官方的 git registry，建立维护者、联络人、ASN、网段这些对象，签名后送出 PR[^dn42-start]。

匿名性在这里是反方向的要求，注册时必须公开联络人对象，里面有名字或代号与 email，官方文档在数据隐私那一节写着：「请同时注意，DN42 registry 是公开资源，你必须假设所提供的任何细节都会被公开，而且无法被完全移除」[^dn42-start]。之后还要跟具名的人一对一协商 peering，并维持一台长时间开机的路由器。任何人若是从隐私角度靠近它，这几件事应该在动手之前就知道。

### 为什么它反而是学 ASN 与 BGP 的好地方

站上的 [互动与呈现](../games/index.md) 区有一件 Tor 路由解谜，玩法就是把三跳分散到不同 ASN，[台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md) 整套分析同样建立在 AS 这个单位上，但读者多半只能从外面理解这个概念。DN42 提供的是从里面看的机会，你可以自己领一个 ASN、宣告路由、跟别人建立 peering，然后看着路由决策实际发生，弄错了也不会波及真实网络。它不提供匿名，这件事不影响它作为练习场的价值。

## I2P：同样以匿名为设计目标

I2P 自述是一个可扩展、自我组织、有韧性的分组交换匿名网络层，各种注重匿名或安全的应用可以架在上面[^i2p-intro]。它跟 Tor 的分工差别，官方写得很直接：「I2P 本身不是一个 outproxy 网络」，因为把数据送进送出混合网络本身带有匿名与安全上的疑虑，所以设计重心放在让使用者不必依赖外部资源就能满足需求。I2PTunnel 仍提供选用的 outproxy 功能，但默认没有人担任 outproxy。

tunnel 在 I2P 是单向的，outbound tunnel 把消息送出去、inbound tunnel 把消息收进来，每个参与者只看得到通信流程的一半。消息采用 garlic routing，一个加密消息里可以包进多个完整的消息与各自的投递指示，中间的节点无法判断里面有几则消息、要送去哪里。网络数据库由称为 floodfill 的路由器以 Kademlia 算法存储与分发。

即使如此，你的运营商仍然看得到你在跑 I2P。这一点跟 Tor 相同，两者处理的是连接内容与对应关系的匿名，并未隐藏「你在使用这个网络」这个事实。

### 跟 Tor 的取舍差在哪里

依 I2P 自己的比较，它优化的对象是网络内部的隐藏服务与 P2P 应用，Tor 优化的是经由出口节点连上一般网站，I2P 对外连出的能力有限而且不被鼓励[^i2p-comparison]。单向 tunnel 让时序关联分析更困难，代价是一次往返经过的节点数比 Tor 的隐藏服务电路多。匿名集的规模差距也在那份比较里，I2P 列出的是数万个活跃路由器，Tor 则是每日数百万使用者，人数本身就是匿名保护的一部分。

需要浏览一般网站，Tor 是成熟得多的选择，细节见 [什么是 Tor](../tools/what-is-tor.md)。

## 回到威胁模型：表上那几栏各自对应什么提问

拿到一个号称能保护隐私的工具时，上面那张表的栏位可以直接翻成四个提问。

1. 我的 IP 对通信对象还看不看得到（对应第三栏）
2. 别人看不看得出我在找什么、在连谁（对应第四栏）
3. 这个项目自己有没有把匿名列进设计目标（对应第五栏）
4. 换过之后，剩下哪些人还看得到我（对应第六栏）

第三个提问最省力也最容易被跳过，项目的 FAQ 或设计文档通常会直说，Yggdrasil 与 DN42 都主动写了警告。把这四题带进 [威胁模型如何建立](../basics/threat-model.md) 的流程，就能判断手上的工具挡不挡得住你真正在意的那个对手。

## 在地脉络：台湾读者会碰到的版本

台湾读者换掉 DNS 设置的常见动机是解析比较快，或者某些域名在运营商的 resolver 上连不到。这两个动机都合理，得到的结果是查询记录换一个对象保管，连接本身的可见度没有变化。

跑 OONI Probe 的人另外要留意设置。社群长期在整理 [台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md)，数据来自各地志愿者的测量，一台设备若同时开着过滤型 resolver，它报告的异常有机会来自自己的设置而非当地网络。要做观测时把系统 resolver 换回不过滤的那一组，数据会干净得多。[什么是 OONI](../tools/what-is-ooni.md) 说明了这些测量怎么被使用。

## 常见问题

??? question "换成 `1.1.1.1` 之后，运营商就看不到我在连哪里了吗"

    看得到。加密的是域名查询那一段，你接着要跟目的服务器建立连接，那个 IP 地址就在数据包里。运营商不需要看你的 DNS 查询，看你连去哪台机器一样能推出你在访问什么。要让运营商看不到目的地，需要的是 Tor 或 VPN 这类会把流量整段转走的工具，取舍见 [VPN 的风险与选择](../tools/vpn-guide.md)。

??? question "Yggdrasil 或 DN42 能拿来取代 VPN 吗"

    两者都不适合。Yggdrasil 的官方 FAQ 直接说明匿名不是项目目标，直接 peer 看得到你的 IP。DN42 更进一步，加入时就要把联络信息登记在公开的 registry 上，而且官方写明无法完全移除。它们解决的是连通性与学习需求，跟 VPN 想解决的问题不同。

??? question "我把文件放上 IPFS，别人查得到是我放的吗"

    有机会。官方文档说明节点提供的 CID 与 PeerID 都会公开发布到 DHT，对 PeerID 做查询可能找出对应的 IP，节点长期在同一个地点时更容易对上。内容本身也没有加密，拿到 CID 的人都读得到。需要匿名发布时，IPFS 要另外搭配能隐藏连接的工具。

??? question "I2P 跟 Tor 我该选哪个"

    看你要连的东西在哪里。目标是一般网站，Tor 的出口生态成熟得多，I2P 对外连出的能力有限而且官方不鼓励。目标是网络内部的服务或 P2P 应用，I2P 就是为此设计的。两者都以匿名为设计目标，差别在优化的方向。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-incognito-circle: 匿名、隐私、假名、机密性的差别](../basics/anonymity-vs-privacy.md)
- [:material-file-tree: Metadata 是什么，为什么重要](../basics/metadata.md)
- [:material-web-box: 去中心化网站发布](./dweb-ipfs-onion.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-access-point-network: 什么是 OONI](../tools/what-is-ooni.md)
- [:material-chart-bar: 台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md)
- [:material-shield-account-outline: 个人隐私指引](../community/privacy-guide.md)

</div>

[^ygg-faq]: [Yggdrasil Network FAQ](https://yggdrasil-network.github.io/faq.html){target="_blank"} - Yggdrasil Network 官方站，「Is Yggdrasil anonymous?」一题。
[^ygg-about]: [About Yggdrasil](https://yggdrasil-network.github.io/about.html){target="_blank"} - Yggdrasil Network 官方站。
[^dn42-home]: [DN42 Home](https://dn42.dev/Home){target="_blank"} - DN42 官方 wiki。
[^dn42-start]: [DN42 Getting Started](https://dn42.dev/howto/Getting-Started){target="_blank"} - DN42 官方 wiki，registry 的公开性警告在 Create person objects 的 Data Privacy 一节。
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 开发者文档。
[^ipfs-privacy]: [Privacy and Encryption](https://docs.ipfs.tech/concepts/privacy-and-encryption/){target="_blank"} - IPFS 官方文档。
[^i2p-intro]: [Intro to I2P](https://i2p.net/en/docs/overview/intro){target="_blank"} - I2P 官方站。旧域名 `geti2p.net` 现已转向此站。
[^i2p-comparison]: [I2P Compared to Tor](https://i2p.net/en/docs/overview/comparison){target="_blank"} - I2P 官方站，人数与路由器规模为该页列出的数字。
[^ooni-wc]: [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} - OONI 测试规格。
