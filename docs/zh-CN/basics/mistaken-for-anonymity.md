---
title: 常被误认为匿名的网络
description: 加密 DNS、IPFS、Yggdrasil、DN42、I2P 各自保护了什么、还有谁能看到你，以及判断一个工具能否让你匿名的四个提问。
icon: material/incognito-off
---

# :material-incognito-off: 常被误认为匿名的网络

换掉手机上的 DNS 设置、把网站放上 IPFS、加入志愿者自组的网络，这几件事常被当成同一类，好像做了就能让自己在网络上更难被认出来。实际上它们改变的东西落差很大，有的只是把能看到你上网记录的一方从运营商换成另一家公司，有的一个旁观者都没有减少，IPFS 还会多留下一组长期不变、可以用来认出你的标识符。

加密让别人读不到内容，匿名让别人无法把一段网络活动对应到你这个人，两者是不同的保护（差别见 [匿名、隐私、假名、机密性的差别](anonymity-vs-privacy.md)）。本页拿各项目官方文档自己写下的设计目标来对照。Yggdrasil 的官方 FAQ 有一题就叫「Is Yggdrasil anonymous?」，回答的第一个字是 No[^ygg-faq]，其他几个系统没有明说，能看到你的人一样还在。

## 五个系统与 Tor 的对照表

Tor 放在最后一行当比较的基准（Tor 的运作方式见 [什么是 Tor](../tools/what-is-tor.md)）。

| 系统 | 用途 | 隐藏你的 IP | 隐藏你在找什么 | 匿名是设计目标 | 还有谁能看到你 |
|---|---|---|---|---|---|
| **加密 DNS**（DoH/DoT） | 查询域名时不被路上的人读到 | ❌ | 部分 | ❌ | 你选的 DNS 业者、你的运营商 |
| **IPFS** | 按内容取得文件、不容易被下架 | ❌ | ❌ | ❌ | 跟你交换数据的节点、查询公开索引的任何人 |
| **Yggdrasil** | 加密的实验性网络 | ❌ | ❌ | ❌ | 跟你直接相连的节点、同一个局域网上的设备 |
| **DN42** | 练习网络路由技术 | ❌ | ❌ | ❌ | 跟你直接相连的节点、读取公开注册数据的任何人 |
| **I2P** | 网络内部的匿名通信 | ✅ | ✅ | ✅ | 你的运营商能看出你在使用 I2P |
| **Tor** | 匿名连接与绕过封锁 | ✅ | ✅ | ✅ | 你的运营商、出口节点 |

分界落在「匿名是设计目标」那一栏，前四个系统的官方文档都没有把匿名列为设计目标，I2P 与 Tor 有。

VPN 没有列进来，它的取舍另有专页（见 [VPN 的风险与选择](../tools/vpn-guide.md)）。结论跟这张表同一个方向，VPN 换掉的也只是谁能看到你的流量。

## 加密 DNS

每次打开一个网站，设备会先向 DNS 服务器（resolver，负责把域名翻成 IP 地址）查询网站的地址。查询默认没有加密，同一个 Wi-Fi 的管理者、运营商与路上经过的设备，都可以读到你查过哪些域名。加密 DNS 把设备与 DNS 服务器之间的查询加密，常见的做法有 DoH（DNS over HTTPS）与 DoT（DNS over TLS）两种。

加密 DNS 要在操作系统或浏览器的加密 DNS 设置里填主机名称或网址，例如 Cloudflare 的 `security.cloudflare-dns.com`[^cf-families]。只在 Wi-Fi 设置或路由器里填一个 IP 地址，换掉的只有回答你的服务器。查询仍然没有加密，路上的人照样可以读到你查过哪些域名。

加密之后，DNS 业者仍然收下你的每一笔查询，也知道是谁问的。从运营商换成 Cloudflare 或 Google，改变的是这批记录由谁保管。你接着连往的网站 IP 地址也没有隐藏，提供你网络的运营商仍然知道你连去哪台服务器，连接开头的 SNI 字段通常也会露出网站名称（见 [Metadata 是什么，为什么重要](metadata.md)）。要选哪一家、各平台如何设置，见 [加密 DNS 怎么选、怎么确认真的生效](../tools/encrypted-dns.md)。

### 过滤型 DNS 服务

Cloudflare 除了不过滤的 `1.1.1.1`，另外提供 `1.1.1.2`（挡恶意软件）与 `1.1.1.3`（再加挡成人内容）。被判定为恶意的域名会返回 `0.0.0.0` 取代真实地址[^cf-families]，设备连不到任何地方，网站看起来就像无法连接。

返回假答案让连接失败正是 DNS 层审查的做法，技术上相同，差别在由谁决定。过滤是你自己选的，随时可以换回 `1.1.1.1`。完整的封锁清单与分类方法则没有公开，你无法事先知道哪些域名会被挡。

执行 OONI Probe（测量网络审查的 App）时要特别留意，过滤型 DNS 挡掉的域名在测量数据里看起来像当地网络的封锁，实际上来自你自己设备的设置。测量前该如何调整，同样写在 [加密 DNS 怎么选、怎么确认真的生效](../tools/encrypted-dns.md)。

## IPFS

IPFS 用文件内容算出一个标识符（CID）来找文件。手上有这份文件的任何节点（参与网络的电脑）都可以提供，不必依赖单一服务器，所以比较不容易被下架。要找出谁有某个 CID，节点会到一份公开的分布式索引（DHT，Distributed Hash Table）查询与宣告。发布者如何挑选建站方式，见社区首页的 [去中心化网站发布](https://anoni.net/zh-cn/articles/dweb-ipfs-onion/){target="_blank"}。

自己架一个 IPFS 节点时，节点会在 DHT 上公开自己的标识符（PeerID）与正在提供的 CID，查询也在公开网络上进行。官方文档写明这些信息都是公开的，第三方可以监看，判断哪些 CID 在什么时候被谁请求[^ipfs-privacy]。同一份文档里也写到，用 PeerID 查一次 DHT 就可能找出你的 IP 地址，节点长期在同一个地点（例如家里）运行时更是如此。

多数人没有架设节点，只是打开公开网关（gateway，把 IPFS 内容转成一般网页的服务）的网址来读。DHT 上不会出现你的信息，网关业者则一次看到你的 IP 与你要的每一个 CID，去中心化的部分又回到单一业者手上。

IPFS 只加密传输过程，文件内容本身没有加密，任何人取得 CID 都能下载并读取。官方建议的做法包括自行加密敏感内容，或建立私有的 IPFS 网络，但你下载数据时发出的查询与连接仍然带着你的 IP。需要匿名把文件交给别人，[OnionShare](../tools/onionshare.md) 是为此设计的工具，比在 IPFS 上自行组合安全得多。

## Yggdrasil

Yggdrasil 是架在现有互联网上的加密实验网络，每个节点用自己产生的密钥推导出固定的 IPv6 地址，用途偏向把分散各地的网络串在一起[^ygg-about]。官方 FAQ 写明提供匿名不是项目的目标，跟你直接相连的节点可以看到你的 IP 地址，并可能借此判断你的位置或身分。同一个局域网内自动建立的连接，通常还会暴露设备的 MAC 地址（网卡的硬件编号）[^ygg-faq]。

## DN42

DN42 是一群人用来练习网络路由技术（例如 BGP，网络之间互相通报路线的协议）的实验网络，在里面配置出错也不会波及真实的互联网[^dn42-home]。加入时要在公开的注册数据库填写名字或代号与 email，官方文档里写着必须假设填写的任何资料都会公开，而且无法完全移除[^dn42-start]。参与者还要跟其他具名的成员一对一协商连接，匿名与它的设计方向相反。

## I2P

I2P 是表上唯一跟 Tor 一样把匿名列为设计目标的系统，官方自称是一层匿名网络，应用程序可以架在上面通信[^i2p-intro]。流量经过多个节点层层加密，每个节点只看到传递过程的一部分，中间的节点无法得知消息从谁送给谁。设计重心放在 I2P 网络内部的服务，要连上一般网站需通过另外有人提供的出口（outproxy），默认没有设置。

即使如此，你的运营商仍然能看出你在使用 I2P。Tor 一样会被看出来，差别在 Tor 另外发展了网桥（bridge）等方式来隐藏这件事。要在会封锁的环境里使用 I2P，需先确认目前有哪些做法可行。

### I2P 与 Tor 的取舍

依 I2P 官方的比较，I2P 适合网络内部的服务与 P2P 应用，Tor 适合经由出口节点连上一般网站。I2P 对外连接的能力有限，官方也不鼓励[^i2p-comparison]。使用人数的差距也写在同一份比较里，I2P 列出的是数万个活跃路由器，Tor 则是每日数百万用户。一起使用的人越多，你越不容易从人群里被挑出来，人数本身就是匿名保护的一部分。

本页不包含安装步骤，想尝试的话从各项目的官方文档开始。

## 台湾的在地脉络

在台湾，换 DNS 常见的理由是解析比较快，或某些域名在运营商的 DNS 上连不到。两个理由都合理，但换 DNS 只对发生在 DNS 层的封锁有用。封锁发生在 IP 或 SNI 那一层时，换谁回答都一样连不上。

换掉之后会一并失去哪些原有的 DNS 防护、执行 OONI Probe 前设备该如何设置，都写在 [加密 DNS 怎么选、怎么确认真的生效](../tools/encrypted-dns.md)。社区长期整理的 [台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md) 就靠这些测量。

## 判断工具的四个提问

遇到号称能保护隐私的工具时，上面那张表的栏位可以换成四个提问：

1. 跟我通信的对象还能不能看到我的 IP（对应「隐藏你的 IP」）
2. 别人能不能看出我在找什么、连去哪里（对应「隐藏你在找什么」）
3. 这个项目自己有没有把匿名列为设计目标（对应「匿名是设计目标」）
4. 用了这个工具之后，还有谁能看到我（对应「还有谁能看到你」）

第三题最容易回答，却最常被跳过。项目的 FAQ 或设计文档通常会直接写明，Yggdrasil 与 DN42 都主动写了警告。前两题的答案如果是「能」，代表工具保护的是内容或速度，跟你的身分无关。第四题最常被忽略的答案是观察者换了一个，数量没有变少。把这四题带进 [威胁模型如何建立](threat-model.md) 的流程走一次，就能判断工具适不适合你。

## 常见问题

??? question "我怎么知道自己的 DNS 查询真的加密了"

    看你填进去的是主机名称还是 IP 地址。多数平台的一般 DNS 栏位只收 IP，填进去仍是明文，Windows 是例外。各平台的设置栏位、加密失败时会不会自动退回明文，以及设置完如何实测，见 [加密 DNS 怎么选、怎么确认真的生效](../tools/encrypted-dns.md)。

??? question "VPN 为什么不在这张表上"

    VPN 另有专页讨论，本页的判断方式对它完全适用。用了 VPN 之后，能看到你流量的一方从运营商换成 VPN 业者。如何挑选值得信任的服务、什么情况下它不够用，见 [VPN 的风险与选择](../tools/vpn-guide.md)。

??? question "我只用公开网关读 IPFS，暴露的程度一样吗"

    打开公开网关的网址时你没有加入 DHT，DHT 上不会出现你的信息，代价是网关业者一次看到你的 IP 与你要的每一个 CID。自己架节点是把信息公开给网络上的许多人，用网关是把信息集中交给一家业者，两种都无法让你匿名。

??? question "把两个叠起来用会更安全吗，例如在 Tor 上运行 IPFS"

    叠加使用不一定比较安全，因为底层协议可能绕过你以为的那条通道。IPFS 的传输与 DHT 就有这个问题，看起来都经过 Tor，实际上仍有流量直接连出去。需要匿名传文件，用 [OnionShare](../tools/onionshare.md) 等专门设计的工具，比自行组合可靠。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-incognito-circle: 匿名、隐私、假名、机密性的差别](anonymity-vs-privacy.md)
- [:material-file-tree: Metadata 是什么，为什么重要](metadata.md)
- [:material-radar: 社交平台怎么收集你的数据](platform-tracking.md)
- [:material-vpn: VPN 的风险与选择](../tools/vpn-guide.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-share-variant-outline: OnionShare](../tools/onionshare.md)
- [:material-chart-bar: 台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md)
- [:material-shield-account-outline: 个人隐私指引](https://anoni.net/zh-cn/join/privacy-guide/){target="_blank"}

</div>

[^ygg-faq]: [Yggdrasil Network FAQ](https://yggdrasil-network.github.io/faq.html){target="_blank"} - Yggdrasil Network 官方站，「Is Yggdrasil anonymous?」一题。
[^ygg-about]: [About Yggdrasil](https://yggdrasil-network.github.io/about.html){target="_blank"} - Yggdrasil Network 官方站。
[^dn42-home]: [DN42 Home](https://dn42.dev/Home){target="_blank"} - DN42 官方 wiki。
[^dn42-start]: [DN42 Getting Started](https://dn42.dev/howto/Getting-Started){target="_blank"} - DN42 官方 wiki，注册数据的公开性警告在 Create person objects 的 Data Privacy 一节。
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 开发者文档，`0.0.0.0` 的说明与 DoH/DoT 端点都在此页。
[^ipfs-privacy]: [Privacy and Encryption](https://docs.ipfs.tech/concepts/privacy-and-encryption/){target="_blank"} - IPFS 官方文档。
[^i2p-intro]: [Intro to I2P](https://i2p.net/en/docs/overview/intro){target="_blank"} - I2P 官方站。旧域名 `geti2p.net` 现已转向此站。
[^i2p-comparison]: [I2P Compared to Tor](https://i2p.net/en/docs/overview/comparison){target="_blank"} - I2P 官方站，人数与路由器规模为该页列出的数字。
