---
title: 加密 DNS 怎么选、怎么确认真的生效
description: DoH、DoT、DoQ 的差别，resolver 业者的挑选准则，各平台的栏位收什么、失败时会不会静默退回明文，以及设完之后怎么实测。
icon: material/dns
---

# :material-dns: 加密 DNS 怎么选、怎么确认真的生效

在手机的 Wi-Fi 设置里把 DNS 那一栏填成 `1.1.1.1`，是很多人做过的第一个隐私设置。换掉的只有回答你的那台服务器，查询本身仍然以明文送出去，路径上的设备照样读得到你问过哪些域名。

要不要做这件事，看你想解决什么，想让运营商看不到你查询过哪些域名，加密 DNS 有效，代价是换一家业者保管这批记录。想绕过封锁，得先确认封锁在哪一层。想匿名，加密 DNS 做不到，理由写在 [常被误认为匿名的网络](../advanced/mistaken-for-anonymity.md)。

这页不写各平台的逐步设置画面，那类步骤随系统版本改变，网络上的转贴往往没跟着更新。给的是不管在哪个平台都用得上的东西：各家栏位收什么形状、失败时会不会静默退回明文，以及设完之后怎么实测。

!!! tip "没空全部读完，先抓这几点"

    - 加密 DNS 要指定一个主机名称或网址。多数平台的一般 DNS 栏位只收 IP，填进去就是明文。Windows 是例外，它用 IP 对照内建的已知清单
    - 加密之后，看得到你查询的人从运营商换成 resolver 业者，人数变少，没有归零
    - 挑 resolver 就是挑一个你愿意信任的记录保管者，看司法管辖、记录政策、有没有独立审计、过不过滤
    - **设置显示已开启不代表正在加密。** Windows、Firefox、Chrome 的默认模式都会在失败时退回明文，而且不通知你
    - 系统层与浏览器层是两份设置，只改一边，另一边照旧
    - 设完一定要实测，看你自己填了什么是检查不出静默退回的

## 没有加密时，路径上的人看得到什么、能改什么

DNS 查询默认走第 53 端口的明文，你的设备每问一次「这个域名的 IP 是多少」，从家用路由器、运营商到中间任何一段线路上的设备，都读得到完整的域名。累积下来的查询记录就足以还原你在什么时间访问过哪些站，跟连接内容有没有加密无关。域名查询属于哪一类暴露，写在 [Metadata 是什么，为什么重要](../basics/metadata.md)。

路径上的人除了读得到查询，也能改掉回应。常见的 DNS 层封锁就是对特定域名回一个错的地址，连接直接失败。后面谈的过滤型 resolver、测量污染，全部建立在这个机制上。

## DoH、DoT、DoQ 的差别

三种都是把查询加密，差别在外面包了什么协议，直接影响它在受限网络里会不会被挡掉。

| 协议 | 规格 | 走哪里 | 在网络上的样子 |
|---|---|---|---|
| **DoH**（DNS over HTTPS） | `RFC 8484` | HTTPS，通常第 443 端口 | 跟一般网页流量共用端口，按端口一刀切挡不掉 |
| **DoT**（DNS over TLS） | `RFC 7858` | 第 853 端口上的 TLS | 专用端口，一眼可辨识，管理者容易允许或封锁 |
| **DoQ**（DNS over QUIC） | `RFC 9250` | QUIC，第 853 端口 | 与 QUIC 流量共用，可按端口辨识 |

DoQ 是 2022 年才定稿的规格，支持的操作系统与 resolver 还不普及。

DoH 常被说成抗封锁能力最好，这句话要限缩。它挡住的只有「按端口一刀切」这一种手法，DoH 连接自己的 TLS 握手里带着 resolver 的域名，按 SNI 或按 IP 封锁特定 resolver 一样做得到。在会针对加密 DNS 动手的网络里，别把 DoH 当成一定连得上。

还有一种 ODoH（Oblivious DoH，`RFC 9230`）针对的正是下一节的问题，它用一个代理把两件事拆开，让「知道你是谁」跟「知道你问了什么」落在不同的服务器上，规格的说法是不让任何单一服务器同时掌握客户端 IP 地址与查询内容[^odoh]。目前部署的业者少，可以当成一个发展方向留意。

## resolver 是你新的观察者

加密之后，你的每一笔查询完整交给一家业者，它知道是谁在问、问了什么、什么时候问。

**司法管辖在哪。** 业者能被谁用法律手段要求交出数据或配合封锁，取决于它在哪里注册、服务器放在哪。这一项有真实案例可看，Quad9 这几年在欧洲面对过两次要求它封锁域名的诉讼，德国 Sony Music 那件打到 2023 年 12 月有了对它有利的结果，2024 年 12 月又被法国的 Canal+ 提告[^quad9-press]。注册在瑞士并不等于免疫于其他国家的法院命令。

**记录什么、留多久。** 承诺的细节比「我们不记录」这句话重要，Cloudflare 对 `1.1.1.1` 的承诺包含不贩售或分享使用者个人数据、不用于投放广告，使用者的 IP 地址不会写进长期存储（non-volatile storage），相关记录在 25 小时内删除[^cf-privacy]。

**有没有独立审计。** 自己说跟第三方查过是两件事，Cloudflare 表示已委托四大会计师事务所之一审计并公开报告[^cf-privacy]。这类报告查核的是某个时点宣称的做法，不是持续保证。

**过不过滤。** 见下一节。

### 过滤型 resolver 的两面

过滤型 resolver 对被挡的域名返回一个不通的地址，Cloudflare 会回 `0.0.0.0`[^cf-ip]。这确实挡得住一部分恶意域名，对家庭与小型组织是低成本的防护。它跟 DNS 层审查是同一个技术动作，差别在这个动作由谁决定，姊妹页 [常被误认为匿名的网络](../advanced/mistaken-for-anonymity.md) 对这一层有完整讨论。

完整的封锁清单与分类方法通常不公开，你不会事先知道哪些域名被归进去，遇到误挡时只能从「这个网站怎么连不上」开始查。另一个代价落在测量上，跑 OONI Probe 时被过滤掉的域名会被记成异常，来源是你自己的 resolver，跟当地网络无关。

家里有需要保护的成员时，过滤型 resolver 是合理选择，同一台设备若还要拿来判断网络有没有被封锁，测量前得先关掉。

### 逐一对过官方文档的三家

只收三家，因为这三家的地址、加密端点与政策我逐一对过它们自己的文档。查证日 `2026-07`。

| 服务 | 司法管辖 | 记录政策 | 独立审计 | 不过滤的地址与端点 | 过滤选项 |
|---|---|---|---|---|---|
| **Cloudflare** | 美国 | 不写进长期存储，25 小时内删除[^cf-privacy] | 有，四大之一[^cf-privacy] | `1.1.1.1`、`1.0.0.1`、`2606:4700:4700::1111` | `1.1.1.2` 挡恶意软件、`1.1.1.3` 再加挡成人内容。加密端点 `security.cloudflare-dns.com`、`family.cloudflare-dns.com`[^cf-families] |
| **Quad9** | 瑞士，基金会设于苏黎世。曾在德国、法国被诉要求封锁域名[^quad9-press] | 官方文档未于本次查证的页面载明 | 未于本次查证的页面载明 | `9.9.9.10`、`149.112.112.10`、`dns10.quad9.net`、`https://dns10.quad9.net/dns-query` | `9.9.9.9`（默认地址）挡恶意软件并验证 DNSSEC、`9.9.9.11` 再加 ECS[^quad9] |
| **Mullvad** | 瑞典。不需账号即可使用 | 官方文档未于本次查证的页面载明 | 未于本次查证的页面载明 | `194.242.2.2`、`2a07:e340::2`、`dns.mullvad.net`、`https://dns.mullvad.net/dns-query` | `194.242.2.3` 挡广告，另有四种层级，`194.242.2.9` 把全部清单都打开[^mullvad] |

这张表有两个容易踩到的地方。第一，Quad9 挂在门面上的 `9.9.9.9` 是**有过滤**的那一组，不想要过滤得改用 `9.9.9.10`，默认值跟 Cloudflare 刚好相反。第二，Quad9 的 `9.9.9.11` 多出来的 ECS（EDNS Client Subnet）会把你 IP 地址的一段前缀附在查询里送给权威服务器，用途是让 CDN 选近一点的节点，代价是原本只有 resolver 知道的来源信息，上游也拿得到一部分，以隐私而言那是减项。

其他运营者还有 AdGuard、NextDNS、dns0.eu、Control D 等，地址与端点请直接从各家官方文档取得，这类信息变动时网络上的转贴往往没跟着更新。Google 的 `8.8.8.8` 使用率很高，它同样提供 DoH 与 DoT[^google-dot]，没有列进上表是因为这次没有逐一核对它的政策，不是因为判定它不合格。

## 自架不等于没有代价

自己跑一台递归 resolver（自己一路向根服务器、顶级域名服务器、权威服务器问到底的那种，例如 Unbound、Knot Resolver），确实没有任何业者收下你的查询。这个选项有两个代价，第二个常被忽略而且更严重。

你的查询直接以自己的 IP 送到各家权威服务器，你成为网络上唯一发出这批查询的来源。用公共 resolver 时你的查询混在几百万人里面，自架把这层混杂拿掉了。

更关键的是，**递归解析对外送出的查询绝大多数仍然走明文第 53 端口**。权威服务器普遍不支持加密传输，所以自架之后，你的运营商重新看得到你要查的每一个域名，只是对象从一台 resolver 换成一整排权威服务器。如果你的威胁模型里最在意的是运营商，自架递归 resolver 的暴露反而比用一家可信业者的 DoH 更差。

要判断哪一种合适，先看 [威胁模型如何建立](../basics/threat-model.md)。想要不信任单一业者又不让运营商看到，该找的方向是上面提过的 ODoH 这类设计，不是自架递归解析。

（dnscrypt-proxy 常跟 Unbound 一起被提到，但它是本机的转送代理，把查询加密后交给上游的公共 resolver，仍然有业者收下你的查询，跟这一节谈的自架是两回事。）

## 加密 DNS 遮不到什么

加密 DNS 遮住的只有域名查询那一段。你接着建立 TLS 连接时，握手中的 SNI（Server Name Indication，在 TLS 握手里以明文带出目标域名的字段）仍然带着域名，路径上的人从那里一样读得到。就算 SNI 被解决，你连上的目的 IP 地址仍然在数据包里。

Encrypted Client Hello（ECH）是为 SNI 这一段设计的。站上对它的评估写在 [Metadata 是什么，为什么重要](../basics/metadata.md)，它需要服务器端支持，也可能被中间设备阻挡，还不能假设每条连接的 SNI 都被保护。反过来说，ECH 要生效需要先取得服务器公布的设置，而那份设置是透过 DNS 拿到的，所以加密 DNS 是 ECH 的前提之一，两者是搭配关系。

Tor Browser 不使用系统的 DNS 设置。Tor 的 SOCKS 接口直接收主机名称，由 Tor 网络内部完成解析，规格给的理由是客户端自己查 DNS 的话，DNS 服务器就会知道它想连到哪些地址[^tor-socks]。为了 Tor 调整系统 DNS 没有效果，Tor Browser 的流量本来就不经过那份设置，同一台设备上其他 App 才受影响。这句话只对 Tor Browser 成立，Orbot 的 VPN 模式、Tails、Whonix 的解析路径各不相同，要照各自的文档确认。

## 各平台填什么、失败时会怎样

栏位收什么形状，决定你设出来的是加密还是明文。失败时会不会退回，决定你能不能相信那个「已开启」的显示。

| 平台 | 加密 DNS 填什么 | 失败时 |
|---|---|---|
| **Android 私人 DNS**（指定主机名称） | 主机名称，走 DoT，Android 9 起支持[^android][^google-dot] | 连不到就把网络标记为无法上网，不退回明文[^android-dot] |
| **Android 私人 DNS**（自动） | 不必填 | 网络的 resolver 支持时才升级为加密，不支持就照旧走明文[^android-dot] |
| **iOS** | 内建 Wi-Fi 设置的 DNS 栏位只收 IP，也套用不到移动网络。要加密得装业者的 App 或配置描述文件[^cf-ios] | 依所装的 App 而定 |
| **macOS** | 网络设置的 DNS 栏位同样填 IP，加密要另外处理[^cf-macos] | 依做法而定 |
| **Windows** | 填 IP，但那个 IP 必须在系统内建的已知 DoH 服务器清单里，加密与否另有下拉选单[^ms-doh] | 选「加密优先，允许未加密」时会退回明文，微软文档明白写着不会给你任何通知[^ms-doh] |
| **Firefox** | 选 resolver 并设置解析模式 | 模式 `2` 解析失败时退回系统原生的解析器，模式 `3` 只用加密不退回[^mozilla-trr] |
| **Chrome** | 选现有供应商或自订供应商 | 自动模式遇到问题会改用未加密，选了自订供应商就不会退回[^chrome-dns] |

**Windows 是「填 IP 就不是加密」这条通则的例外**，它靠内建对照表把 IP 换成加密端点。**iOS 没有内建的加密 DNS 栏位**，只在 Wi-Fi 设置里填 `1.1.1.1` 得到的是纯明文，而且移动网络完全没被涵盖。**多数平台的默认模式会静默退回明文**，Windows、Firefox 模式 `2`、Chrome 自动模式都是，Android 指定主机名称的严格模式反而是少数失败就直接断掉的做法。

Firefox 另外有一个机制，网络可以透过一个特定的查询回应让它自行停用加密 DNS，官方的诊断代码里称为 canary heuristic[^firefox-trr-skip]。企业网络用得到它，代价是你的浏览器可能在你不知情的状况下退回明文。

## 怎么确认你设对了

**看你填进去的是什么形状。** 对照上一张表，你填的栏位收的是主机名称、网址、还是 IP，决定了它是不是加密。Windows 是例外，看的是加密下拉选单的状态。

**看你改的是哪一层。** 系统设置与浏览器设置各自独立，浏览器开了 DoH，其他 App 的查询仍然走系统设置。家用路由器与 DHCP 是第三层，在路由器上填 `9.9.9.9` 得到的是零加密，因为多数消费级路由器不会替你做 DoT 或 DoH，而且内网到路由器那一段本来就是明文。要涵盖整个家或整间办公室，得确认那台设备自己支持加密上游。

**实测一次。** 前两项查的是你填了什么，查不出静默退回、浏览器另有一份在跑、或某个 App 硬写死了 resolver。三家都有检测页：Cloudflare 的 [1.1.1.1/help](https://1.1.1.1/help){target="_blank"}、Quad9 的 [on.quad9.net](https://on.quad9.net/){target="_blank"}、Mullvad 的 [连接检查](https://mullvad.net/en/check){target="_blank"}。要看的是它报告的 resolver 跟加密状态，是否等于你设的那一家。在你平常用的浏览器与其他 App 环境下各测一次，两边结果可能不同。

## 什么时候会失效

**企业或校园网络。** 内部域名要靠内部 DNS 才解析得到，加密 DNS 把查询送到外面，内部资源就找不到。多数操作系统允许针对特定网络关闭加密 DNS，或设置让特定域名走内部解析，组织规模的正解是条件转送或分割解析，不是叫所有人自己关掉。

**登录页拦截（captive portal）。** 旅馆、机场的 Wi-Fi 要先开一个页面登录，登录前网络多半挡掉往外的连接，加密 DNS 因此解析不出来，登录页也就跳不出来。现在多数操作系统会自己侦测并处理这种情况，真的需要手动关掉时要记得两件事：关掉期间你的查询对这个网络完全可读，不要在那段时间做敏感操作。登录完立刻确认已经开回来，这一步很容易忘记。

**加密 DNS 本身被封锁。** DoT 的第 853 端口很容易被挡掉。DoH 混在 HTTPS 里比较难用端口挡，网络管理者仍可以直接封锁特定 resolver 的 IP 与域名。

## 在地脉络：台湾

台湾读者换掉 DNS 的常见动机是解析比较快，或者某些域名在运营商的 resolver 上连不到。第二个动机要看封锁发生在哪一层，DNS 层的封锁换 resolver 有用，IP 或 SNI 层的封锁换谁回答你都连不上。

换掉之前值得知道你会一并失去什么，中华电信的色情守门员、数字发展部与 TWNIC 的打诈域名封锁，都是在 DNS 这一层运作的，站上 [什么是 OONI](./what-is-ooni.md) 对这些机制与它们在观测数据里的样子有完整说明。换到境外 resolver 之后这几层一起失效，换来的是查询不被运营商看到，失去的是那些封锁原本挡下的钓鱼与诈骗域名。家里有长辈或小孩的话，这个取舍要自己衡量，过滤型 resolver 是一个折衷。

跑 OONI Probe 的人要特别留意。依 `ts-017` 规格，网络连接测试（Web Connectivity）先用系统 resolver 解析域名，再跟测试辅助服务器解出来的结果比对，地址或 ASN 对得上才算一致[^ooni-wc]。

设备上任何第三方 resolver 都会影响结果，而且方向不同。过滤型 resolver 让被挡的域名解到 `0.0.0.0`，测量看起来像当地网络遭到干扰，那是假阳性，至少会有人去查。不过滤的境外加密 resolver 更麻烦，它会直接绕过运营商层真正的封锁，测量显示一切正常，没有人会发现漏掉了什么。社群长期在整理 [台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md)，测量的目标就是台湾本地网络的 DNS 行为，所以测量时请使用该网络 DHCP 发下来的 resolver，关掉所有第三方加密 DNS，不分过不过滤。

三个容易漏掉的地方：手机的 Android 私人 DNS 是全系统设置，跨 Wi-Fi 与移动网络都生效。家里的 Pi-hole 或 AdGuard Home 会让设备上明明没设置却已经被过滤。笔电整理干净了不代表手机也是。

## 带走的检查清单

设完之后照这三题跑一遍，三题都答得出来才算设好。

1. 我填的栏位收的是主机名称或网址吗（Windows 例外，看加密下拉选单）
2. 系统、浏览器、路由器这三层我都确认过了吗
3. 检测页报告的 resolver 与加密状态，跟我设的那一家对得上吗

要跑 OONI Probe 之前，把上面三题反过来做一次，关掉所有第三方 resolver，手机与笔电各一份，并确认家里的路由器没有另外挂过滤。

## 常见问题

??? question "用运营商的 DNS 是不是最糟的选项"

    不一定。运营商本来就看得到你连上的每一个目的 IP，换掉 DNS 并不会让它看不到你去了哪里，只是少看到域名这一份。换到境外 resolver 等于多一个原本看不到你的对象开始看得到，先想清楚你比较不希望被谁掌握。

??? question "加密 DNS 跟 VPN 一起开会怎样"

    通常由 VPN 决定。多数 VPN 客户端会接管整台设备的 DNS，把查询送进隧道交给它自己的 resolver，你另外设的加密 DNS 可能完全不生效。这本身不算坏事，因为查询已经在隧道里，但你信任的对象变成 VPN 业者。要确认实际状况，用上面那几个检测页在 VPN 开启时测一次，看它报告的是谁。VPN 的取舍见 [VPN 的风险与选择](./vpn-guide.md)。

??? question "设了会不会变慢"

    加密会多一次握手，第一次查询通常慢一点，之后连接重用就差不多。实际感受更取决于那家 resolver 在你这条线路上的距离，境外业者不一定比运营商快。想追求速度的话自己实测比看评测可靠，同一条线路不同时段的差异就不小。

??? question "组织要统一换，该怎么部署"

    先决定改在哪一层，改在每台设备上最可靠但要逐台管，用移动设备管理（MDM）推配置描述文件可以解掉这个问题。改在路由器最省事，前提是那台设备自己支持加密上游，否则对外那段仍是明文。另外要处理内部域名的解析，正解是条件转送或分割解析，让内部域名走内部 DNS、其余走加密上游。备援也要想清楚，填第二家等于把查询分给两家业者，隐私承诺直接打折。

??? question "免费的 resolver 为什么免费"

    各家的位置不同，Cloudflare 是基础设施业者，顺带取得网络效能的测量数据。Quad9 是瑞士的非营利基金会，靠捐款与赞助营运。Mullvad 是付费 VPN 业者，把 resolver 当成附带服务公开提供。直接看它的记录政策与资金来源，别用收不收费下判断。

??? question "DNSSEC 跟加密 DNS 是同一件事吗"

    两件事。加密 DNS 让传输过程不被读取，DNSSEC 用签章证明回应没有被篡改。要注意两个前提：验证通常发生在 resolver 那一端，你的设备拿到的只是一个「已验证」的标记，没有加密传输的话那个标记本身也可能被路径上的人伪造。DNSSEC 只保护有签章的域名，很多常见域名并没有签，对那些域名它不提供任何保护。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-incognito-off: 常被误认为匿名的网络](../advanced/mistaken-for-anonymity.md)
- [:material-file-tree: Metadata 是什么，为什么重要](../basics/metadata.md)
- [:material-vpn: VPN 的风险与选择](./vpn-guide.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-access-point-network: 什么是 OONI](./what-is-ooni.md)
- [:material-chart-bar: 台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md)
- [:material-shield-account-outline: 个人隐私指引](../community/privacy-guide.md)

</div>

[^cf-ip]: [1.1.1.1 IP addresses](https://developers.cloudflare.com/1.1.1.1/ip-addresses/){target="_blank"} 与 [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 开发者文档，`0.0.0.0` 的说明在后者。
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 开发者文档，for Families 的 DoH 与 DoT 端点在此页。
[^cf-privacy]: [1.1.1.1 Public DNS Resolver privacy](https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/){target="_blank"} - Cloudflare 开发者文档。
[^cf-ios]: [Set up 1.1.1.1 on iOS](https://developers.cloudflare.com/1.1.1.1/setup/ios/){target="_blank"} - Cloudflare 开发者文档，手动设置只提供 IP 地址，加密需另装 App。
[^cf-macos]: [Set up 1.1.1.1 on macOS](https://developers.cloudflare.com/1.1.1.1/setup/macos/){target="_blank"} - Cloudflare 开发者文档。
[^quad9]: [Service Addresses and Features](https://quad9.net/service/service-addresses-and-features/){target="_blank"} - Quad9 官方站。
[^quad9-press]: [Quad9 Press](https://quad9.net/news/press/){target="_blank"} - Quad9 官方新闻稿，其中提到德国 Sony Music 案于 2023 年 12 月取得有利结果，以及 2024 年 12 月来自法国 Canal+ 的新诉讼。
[^mullvad]: [Mullvad DNS over HTTPS and DNS over TLS](https://mullvad.net/en/help/dns-over-https-and-dns-over-tls){target="_blank"} - Mullvad 官方说明。
[^android]: [Change your Android device's Private DNS settings](https://support.google.com/android/answer/9089903){target="_blank"} - Google 支援文档。
[^android-dot]: [DNS over TLS support in Android P](https://android-developers.googleblog.com/2018/04/dns-over-tls-support-in-android-p.html){target="_blank"} - Android Developers Blog，自动升级与指定主机名称两种模式的差别在此页。
[^google-dot]: [DNS-over-TLS](https://developers.google.com/speed/public-dns/docs/dns-over-tls){target="_blank"} - Google Public DNS 文档，Android 9 起支持 DoT 的说明在此页。
[^ms-doh]: [Secure DNS Client over HTTPS (DoH)](https://learn.microsoft.com/en-us/windows-server/networking/dns/doh-client-support){target="_blank"} - Microsoft Learn，已知 DoH 服务器清单与三种加密设置的说明在此页。
[^mozilla-trr]: [Trusted Recursive Resolver](https://wiki.mozilla.org/Trusted_Recursive_Resolver){target="_blank"} - Mozilla Wiki，解析模式的定义在此页。
[^firefox-trr-skip]: [TRR Skip Reasons](https://firefox-source-docs.mozilla.org/networking/dns/trr-skip-reasons.html){target="_blank"} - Firefox 源码文档，canary heuristic 的诊断代码在此页。
[^chrome-dns]: [Use secure DNS in Chrome](https://support.google.com/chrome/answer/10468685){target="_blank"} - Google Chrome 说明，自动模式与自订供应商的退回行为差别在此页。
[^tor-socks]: [SOCKS extensions](https://spec.torproject.org/socks-extensions.html){target="_blank"} - Tor 规格文档。
[^odoh]: [RFC 9230: Oblivious DNS over HTTPS](https://www.rfc-editor.org/rfc/rfc9230.html){target="_blank"} - IETF。
[^ooni-wc]: [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} - OONI 测试规格。
