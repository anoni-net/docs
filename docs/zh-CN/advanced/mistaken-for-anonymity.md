---
title: 常被误认为匿名的网络
description: 加密 DNS、IPFS、Yggdrasil、DN42、I2P 各自解决什么问题、留下哪些暴露面。用官方文档的自述对照它们与 Tor 的差别。
icon: material/incognito-off
---

# :material-incognito-off: 常被误认为匿名的网络

换掉手机上的 DNS resolver（负责把域名翻成 IP 地址的服务器）、把网站发布到 IPFS、加入一个志愿者自组的叠加网络（overlay network，架在现有互联网之上、自成一套寻址与路由的网络），这几个动作在中文讨论里常被归进同一类，也就是让自己在网络上更难被指认。实际运作起来，它们对「谁看得到什么」的改动落差很大，有的把观察者从运营商换成另一家公司，有的一个观察者都没有减少，IPFS 那种还额外留下一组长期不变的节点标识符。

Yggdrasil 的官方 FAQ 里有一题就叫「Is Yggdrasil anonymous?」，回答的第一个字是 No[^ygg-faq]。其余几个系统没有这样明说，暴露面一样在那里。这页用各项目自己写下的设计目标，对照它们留下的暴露面，读完会有四个可以套在任何工具上的提问。

Tor 只在表上当对照组，完整说明见 [什么是 Tor](../tools/what-is-tor.md)。要先厘清加密与匿名的界线，看 [匿名、隐私、假名、机密性的差别](../basics/anonymity-vs-privacy.md)。

## 五个系统加上 Tor 这把尺

| 系统 | 它解决的问题 | 隐藏你的 IP | 隐藏你在找什么 | 匿名是设计目标 | 谁仍然看得到你 |
|---|---|---|---|---|---|
| **加密 DNS**（DoH/DoT） | 域名查询不被路径上的人读到 | ❌ | 部分 | ❌ | 你选的 resolver 业者、你的运营商 |
| **IPFS** | 内容寻址、抗下架 | ❌ | ❌ | ❌ | 跟你交换数据的 peer、DHT 上的任何人 |
| **Yggdrasil** | 加密的 IPv6 叠加网络 | ❌ | ❌ | ❌ | 直接 peer、同一个局域网上的设备 |
| **DN42** | 用真实路由技术做实验 | ❌ | ❌ | ❌ | 直接 peer、registry 的任何读者 |
| **I2P** | 网络内部的匿名通信 | ✅ | ✅ | ✅ | 你的运营商看得到你在使用 I2P |
| **Tor** | 连接匿名与规避审查 | ✅ | ✅ | ✅ | 你的运营商、出口节点 |

表上真正的分界落在第五栏，前四个系统的官方文档都没有把匿名列进设计目标，后两个有。

VPN 没有列进来，它的取舍另有专页处理，见 [VPN 的风险与选择](../tools/vpn-guide.md)。那页的结论跟这张表同一个方向，VPN 换掉的也是谁看得到你的流量。

## 加密 DNS：换掉的只是谁收下你的查询

DNS 查询默认走明文，你的设备每问一次「这个域名的 IP 是多少」，路径上的设备都读得到。DoH（DNS over HTTPS，`RFC 8484`）把查询包进一般的 HTTPS 连接，DoT（DNS over TLS，`RFC 7858`）走专用端口的 TLS。两者加密的都是你到 resolver 这一段。

加密查询要指定的是一个主机名称或网址，例如 Cloudflare 的 DoT 主机名称 `security.cloudflare-dns.com` 与 DoH 网址 `https://security.cloudflare-dns.com/dns-query`[^cf-families]，这一点很容易混淆。在 Wi-Fi 设置或路由器里填一个 IP 地址，换掉的只有回答你的那台服务器，查询仍然走明文的第 53 端口，路径上的人照样读得到你问过哪些域名。要真正加密，需使用操作系统或浏览器的加密 DNS 设置填入主机名称，各平台的设置方式差异不小。

resolver 本身收下你的每一笔查询，也知道是谁问的，把系统设置从运营商的 resolver 换成 Cloudflare 或 Google，改变的只是这批记录落在谁手上。查询加密之后，你接着要连上的目的 IP 仍然出现在数据包里，掌握你这条线路的一方看得到你连去哪台服务器。TLS 握手里的 SNI 字段也还在，SNI 的变化与限制写在 [Metadata 是什么，为什么重要](../basics/metadata.md)。具体要选哪一家、各平台的栏位收什么，见 [加密 DNS 怎么选、怎么确认真的生效](../tools/encrypted-dns.md)。

### 过滤型 resolver：跟审查用同一个动作，也会污染测量

Cloudflare 除了不过滤的 `1.1.1.1`，另外提供 `1.1.1.2`（挡恶意软件）与 `1.1.1.3`（再加挡成人内容）。官方文档说明被判定为恶意的域名会返回 `0.0.0.0`，取代真实地址[^cf-families]。设备取得这个地址就连不到任何地方，网站看起来就像无法连接。

返回一个假答案让连接失败，正是 DNS 层审查的做法，技术动作一样，差别在这个动作由谁决定。过滤是你自己选的，随时可以换回 `1.1.1.1`，Cloudflare 也提供匿名反馈误判的渠道。完整封锁清单与分类方法并未公开，你无法事先知道哪些域名会被挡掉。

执行 OONI Probe 的人会直接遇到这个差别。过滤型 resolver 对被挡的域名返回 `0.0.0.0`，测量数据看起来像当地网络出了状况，来源是这台设备自己的设置。比对机制与测量前该怎么调整，见 [加密 DNS 怎么选、怎么确认真的生效](../tools/encrypted-dns.md)。

## IPFS：去中心化，每次查询仍带着你的 IP

IPFS 的内容寻址与 DHT（Distributed Hash Table，分布式哈希表）怎么运作，写在给发布者挑建站方式的 [去中心化网站发布](./dweb-ipfs-onion.md)。

自行架设一个 IPFS 节点时，暴露面来自它必须对外宣告的东西。节点发布到 DHT 的必要 metadata，包含节点标识符（PeerID）与它正在提供的内容标识符（CID），官方文档写明都是公开的，这些 DHT 查询也是在公开网络上进行的，因此第三方有可能监看这些流量，判断哪些 CID 在什么时候被谁请求[^ipfs-privacy]。同一份文档还提到，对你的 PeerID 做一次 DHT 查询就可能找出你的 IP 地址，节点若长期从同一个地点运作（例如家里）更是如此。

多数说自己在用 IPFS 的人没有架设节点，只是开 `ipfs.io` 这类公开网关的网址来读。这个情境的暴露面是另外一组，DHT 上看不到你，网关业者则是一次看到你的 IP 与你要的每一个 CID，你在网络上的样子就是一个普通的 HTTPS 客户端，去中心化的那一部分换回了单一业者。

加密的范围是另一层落差，IPFS 加密的是传输过程，内容本身维持原样，任何人取得 CID 都能下载并读取那份数据。官方给的缓解做法是关掉 reproviding（节点定期向 DHT 重新宣告自己有哪些内容的机制）、自行加密敏感内容，或者建立一个私有的 IPFS 网络。要留意关掉 reproviding 只让你不再宣告自己提供什么，你去抓数据时发出的 DHT 查询与 peer 连接照样带着你的 IP。需要匿名把文件交给别人，[OnionShare](../tools/onionshare.md) 是为这件事设计的工具，比在 IPFS 上自行组合安全得多。

## Yggdrasil：官方 FAQ 自己回答了不匿名

Yggdrasil 是一个端对端加密的 IPv6 叠加网络，运作在现有的互联网之上，节点之间用 `tcp://` 或 `tls://` 建立 peering（两个节点互相对接、交换路由与流量的关系）。地址落在 `0200::/7` 这个 IETF 已经废弃的范围，选它是为了避开与既有地址的冲突。节点自己产生一组密钥对，稳定的 IPv6 地址由这把密钥推导出来，不需要中央机构配发[^ygg-about]。这个寻址方式跟 Tor 的 v3 洋葱地址是同一种思路，地址本身带着验证信息。

社群拿它来串接分散各地的私有网络、架设社群内部服务、做 mesh 网络实验，用途偏向连通性。

匿名性上走的方向不同，FAQ 那一题的回答是「不，提供匿名并非 Yggdrasil 项目的目标。互联网上的直接 peer 看得到你的 IP 地址，并可能用这项信息判断你的位置或身分」，后面还补上一句，同一个局域网内经由 multicast（一台设备同时对局域网上多台设备广播的传送方式）自动建立的 peering，通常会暴露你的设备 MAC 地址[^ygg-faq]。项目同时把自己标为 alpha 阶段的软件。

## DN42：注册数据从一开始就是公开的

DN42 的自述是一个大型的动态 VPN，使用 BGP（网络之间互相通报「我这边能连到哪些地址」的协议）、whois 数据库、DNS 这些互联网技术，用途放在学习路由技术、串接私有网络，以及做实验，因为在里面出了差错不会有大型网络运营商前来追究[^dn42-home]。

它用的资源全部取自私有范围，IPv4 是 `172.20.0.0/14`、IPv6 是 `fd00::/8`、ASN（Autonomous System Number，每个独立管理网络的身分编号）落在 `4242420000` 到 `4242423999`。加入方式是 fork 官方的 git registry，建立维护者、联络人、ASN、网段这些对象，签名后送出 PR[^dn42-start]。

匿名性在这里是反方向的要求，注册时必须公开联络人对象，里面有名字或代号与 email，官方文档在数据隐私那一节写着：「请同时注意，DN42 registry 是公开资源，你必须假设所提供的任何细节都会被公开，而且无法被完全移除」[^dn42-start]。之后还要跟具名的人一对一协商 peering，并维持一台长时间开机的路由器。

不提供匿名这件事，不妨碍它成为理解 AS 与 BGP 的地方。站上的 [互动与呈现](../games/index.md) 区有一个 Tor 路由解谜的主题就是把三跳分散到不同 ASN，[台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md) 整套分析同样建立在 AS 这个单位上，而 DN42 是少数能让人自己领一个 ASN、宣告路由、看着路由决策实际发生的地方，设置错误也不会波及真实网络。

## I2P：把匿名列进设计目标的那一个

前面四个系统的官方文档都没有把匿名写进设计目标，这一个有。I2P 自称是一层匿名的分组交换网络，能扩展、也能自我组织，各种注重匿名或安全的应用可以架在上面[^i2p-intro]。它跟 Tor 的分工差别，官方写得很直接：「I2P 本身不是一个 outproxy 网络」，数据进出混合网络这个动作本身带有匿名与安全上的疑虑，所以设计重心放在让使用者不必离开 I2P 就能把事情做完。I2PTunnel 仍提供选用的 outproxy（相当于 Tor 的出口节点，把流量送回一般互联网），但默认没有人担任这个角色。

tunnel 在 I2P 是单向的，outbound 送出去、inbound 收进来，每个参与者只看得到通信流程的一半。消息采用 garlic routing，一个加密消息里可以包进多个完整的消息与各自的投递指示，中间的节点无法判断里面有几则消息、要送去哪里。网络数据库交给称为 floodfill 的路由器保管，它们看得到的是谁在查询哪个目的地，看不到消息内容。

即使如此，你的运营商仍然看得到你在使用 I2P，Tor 也一样，两者做的是连接内容与对应关系的匿名，没有隐藏你正在使用这个网络。差别在于 Tor 另外发展了网桥与可插拔传输来处理这件事，要在封锁环境使用 I2P，需先确认目前有哪些做法可行。

### 跟 Tor 的取舍差在哪里

依 I2P 自己的比较，它优化的对象是网络内部的隐藏服务与 P2P 应用，Tor 优化的是经由出口节点连上一般网站，I2P 对外连出的能力有限，官方也不鼓励[^i2p-comparison]。单向 tunnel 让时序关联分析更困难，代价是一次往返经过的节点数比 Tor 的洋葱服务电路多。匿名集（anonymity set，同一批可能是你的人有多少）的规模差距也在那份比较里，I2P 列出的是数万个活跃路由器，Tor 则是每日数百万使用者，人数本身就是匿名保护的一部分。

这页不谈安装，要实际尝试的话从各项目的官方文档开始。

## 在地脉络：台湾

台湾读者换掉 DNS 设置的常见动机是解析比较快，或者某些域名在运营商的 resolver 上连不到，两个动机都合理，但换 resolver 只对 DNS 层的封锁有用，如果封锁发生在 IP 或 SNI 那一层，换谁回答你都连不上。

换掉之后会一并失去哪些既有的 DNS 层防护、执行 OONI Probe 时设备该如何设置，都写在 [加密 DNS 怎么选、怎么确认真的生效](../tools/encrypted-dns.md)。社群长期在整理的 [台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md) 就靠这些测量。

## 回到威胁模型：表上那几栏各自对应什么提问

取得一个号称能保护隐私的工具时，上面那张表的栏位可以直接翻成四个提问。

1. 通信对象还看不看得到我的 IP（对应第三栏）
2. 别人看不看得出我在找什么、在连谁（对应第四栏）
3. 这个项目自己有没有把匿名列进设计目标（对应第五栏）
4. 换上这个工具之后，剩下哪些人还看得到我（对应第六栏）

第三个提问最容易回答，也最容易被跳过，项目的 FAQ 或设计文档通常会直说，Yggdrasil 与 DN42 都主动写了警告。前两题的答案若是「看得到」，代表这个工具处理的是内容或性能，跟身分无关。第四题最容易被忽略的答案是「换了一个，没有变少」。把这四题带进 [威胁模型如何建立](../basics/threat-model.md) 的流程走一次，答案就出来了。

## 常见问题

??? question "我怎么知道自己的 DNS 查询真的加密了"

    看你填进去的是主机名称还是 IP 地址。多数平台的一般 DNS 栏位只收 IP，填进去就是明文，Windows 是例外。各平台的栏位形状、失败时会不会静默退回明文，以及设完怎么实测，见 [加密 DNS 怎么选、怎么确认真的生效](../tools/encrypted-dns.md)。

??? question "VPN 为什么不在这张表上"

    因为它值得一整页。VPN 在中文讨论里被误认得最严重，这页的论证对它完全成立，换掉的一样是谁看得到你的流量，从运营商换成 VPN 业者。完整的取舍、如何挑选值得信任的服务、什么情况下它不够用，见 [VPN 的风险与选择](../tools/vpn-guide.md)。

??? question "我只用公开网关读 IPFS，暴露面一样吗"

    不一样，但也没有比较好。开 `ipfs.io` 的网址时你没有加入 DHT，所以 DHT 上看不到你，代价是网关业者一次看到你的 IP 与你要的每一个 CID。自行架设节点是把信息公开给网络上的许多人，用网关是把信息集中交给一家业者。

??? question "把两个叠起来用会更安全吗，例如在 Tor 上执行 IPFS"

    不要预设可行。这类组合的困难在于底层协议会不会绕过你以为的那条通道，IPFS 的传输与 DHT 就有这个问题，看起来包好了，实际上仍有流量走原路。需要匿名传文件，用 [OnionShare](../tools/onionshare.md) 这种为此设计的工具，比自行组合可靠。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-incognito-circle: 匿名、隐私、假名、机密性的差别](../basics/anonymity-vs-privacy.md)
- [:material-file-tree: Metadata 是什么，为什么重要](../basics/metadata.md)
- [:material-radar: 社群平台怎么收集你的数据](../basics/platform-tracking.md)
- [:material-vpn: VPN 的风险与选择](../tools/vpn-guide.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-share-variant-outline: OnionShare](../tools/onionshare.md)
- [:material-chart-bar: 台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md)
- [:material-shield-account-outline: 个人隐私指引](../community/privacy-guide.md)

</div>

[^ygg-faq]: [Yggdrasil Network FAQ](https://yggdrasil-network.github.io/faq.html){target="_blank"} - Yggdrasil Network 官方站，「Is Yggdrasil anonymous?」一题。
[^ygg-about]: [About Yggdrasil](https://yggdrasil-network.github.io/about.html){target="_blank"} - Yggdrasil Network 官方站。
[^dn42-home]: [DN42 Home](https://dn42.dev/Home){target="_blank"} - DN42 官方 wiki。
[^dn42-start]: [DN42 Getting Started](https://dn42.dev/howto/Getting-Started){target="_blank"} - DN42 官方 wiki，registry 的公开性警告在 Create person objects 的 Data Privacy 一节。
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 开发者文档，`0.0.0.0` 的说明与 DoH/DoT 端点都在此页。
[^ipfs-privacy]: [Privacy and Encryption](https://docs.ipfs.tech/concepts/privacy-and-encryption/){target="_blank"} - IPFS 官方文档。
[^i2p-intro]: [Intro to I2P](https://i2p.net/en/docs/overview/intro){target="_blank"} - I2P 官方站。旧域名 `geti2p.net` 现已转向此站。
[^i2p-comparison]: [I2P Compared to Tor](https://i2p.net/en/docs/overview/comparison){target="_blank"} - I2P 官方站，人数与路由器规模为该页列出的数字。
