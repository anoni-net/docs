---
title: 加密 DNS 怎么选与怎么设
description: DoH、DoT、DoQ 的差别，resolver 业者的挑选准则，以及怎么确认你设的真的是加密 DNS 而不是换了一台服务器。
icon: material/dns
---

# :material-dns: 加密 DNS 怎么选与怎么设

在手机的 Wi-Fi 设置里把 DNS 那一栏填成 `1.1.1.1`，是很多人做过的第一个隐私设置。这个动作换掉了回答你的那台服务器，查询本身仍然以明文送出去，路径上的设备照样读得到你问过哪些域名。要让查询加密，填进去的必须是主机名称或网址，而且系统与浏览器往往各有一份设置。

这页处理三个问题：DoH、DoT、DoQ 各自是什么、resolver 业者该怎么挑、怎么确认你设的真的生效了。加密 DNS 改变了什么、没改变什么，写在 [常被误认为匿名的网络](../advanced/mistaken-for-anonymity.md)，这里不重复那一层的论证。

!!! tip "没空全部读完，先抓这几点"

    - 填 IP 地址不是加密 DNS。加密要填的是主机名称（如 `dns.quad9.net`）或网址（如 `https://dns.quad9.net/dns-query`）
    - 加密之后，看得到你查询的人从运营商换成 resolver 业者，人数变少，没有归零
    - 挑 resolver 就是挑一个你愿意信任的记录保管者，看司法管辖、记录政策、有没有独立审计
    - 系统层与浏览器层是两份设置，只改一边，另一边照旧
    - Tor Browser 不受系统 DNS 设置影响，它的域名解析走 Tor 电路

## 没有加密时，路径上的人看得到什么

DNS 查询默认走第 53 端口的明文，你的设备每问一次「这个域名的 IP 是多少」，从家用路由器、运营商到中间任何一段线路上的设备，都读得到完整的域名。这份清单本身就足以还原你在什么时间访问过哪些站，内容有没有加密无关。域名查询属于哪一类暴露，写在 [Metadata 是什么，为什么重要](../basics/metadata.md)。

明文查询还有一个常被忽略的性质，任何在路径上的人都能篡改回应。DNS 层的封锁就是用这个做的，对特定域名回一个错的地址，连接就失败。

## DoH、DoT、DoQ 的差别

三种都是把查询加密，差别在包在什么协议里，这会直接影响它在受限网络里能不能活下来。

| 协议 | 规格 | 走哪里 | 在网络上的样子 |
|---|---|---|---|
| **DoH**（DNS over HTTPS） | `RFC 8484` | HTTPS，通常第 443 端口 | 跟一般网页流量混在一起，难以单独挑出来挡掉 |
| **DoT**（DNS over TLS） | `RFC 7858` | 专用的第 853 端口上的 TLS | 一眼可辨识，网络管理者容易允许或封锁 |
| **DoQ**（DNS over QUIC） | `RFC 9250`，2022 年发布 | QUIC | 较新，支持的操作系统与 resolver 还不普及 |

要在会封锁加密 DNS 的网络里用，DoH 的存活率比较高，因为挡它等于要从一般 HTTPS 流量里把它分辨出来。反过来说，企业或校园网络要管理内部解析时，DoT 那个独立端口让双方都比较清楚现在的状态。

## resolver 是你新的观察者

加密之后，你的每一笔查询完整交给一家业者，它知道是谁在问、问了什么、什么时候问。挑选时值得问四件事。

**司法管辖在哪。** 业者能被谁用法律手段要求交出数据，取决于它在哪里注册、服务器放在哪。

**记录什么、留多久。** 承诺的细节比「我们不记录」这句话重要。Cloudflare 对 `1.1.1.1` 的说明是不贩售或分享使用者个人数据、不用于投放广告，使用者的 IP 地址不会存进非易失性存储，相关记录在 25 小时内删除[^cf-privacy]。

**有没有独立审计。** 自己说跟第三方查过是两件事。Cloudflare 表示已委托四大会计师事务所之一审计并公开报告[^cf-privacy]。

**过不过滤，清单公不公开。** 过滤型 resolver 用返回假答案的方式挡掉特定域名，跟审查是同一个技术动作，取舍见下一节。

### 三家常被提到的服务

| 服务 | 司法管辖 | 不过滤的地址 | 过滤选项 |
|---|---|---|---|
| **Cloudflare** | 美国 | `1.1.1.1`、`1.0.0.1`（IPv6 `2606:4700:4700::1111`） | `1.1.1.2` 挡恶意软件、`1.1.1.3` 再加挡成人内容[^cf-ip] |
| **Quad9** | 瑞士（基金会设于苏黎世） | `9.9.9.10`、`149.112.112.10` | `9.9.9.9` 挡恶意软件并验证 DNSSEC、`9.9.9.11` 同上再加 ECS[^quad9] |
| **Mullvad** | 瑞典 | `194.242.2.2`（IPv6 `2a07:e340::2`） | `194.242.2.3` 挡广告，另有四种层级到 `194.242.2.9` 全开[^mullvad] |

Quad9 的默认地址 `9.9.9.9` 是有过滤的那一组，不想要过滤要改用 `9.9.9.10`，这一点跟 Cloudflare 相反。Mullvad 这项服务不需要有账号也能用[^mullvad]。

其他运营者还有 AdGuard、NextDNS、dns0.eu、Control D 等等，地址与端点请直接从各家官方文档取得，这类信息变动时网络上的转贴往往没跟着更新。

### 自架有一个反直觉的代价

自己跑一台递归 resolver（例如 Unbound 或 dnscrypt-proxy），确实没有任何业者收下你的查询。代价是你的查询直接以你自己的 IP 送到各个权威服务器，你成为网络上唯一发出这批查询的那个人。用公共 resolver 时你的查询混在几百万人里面，自架把这层混杂拿掉了。哪一种比较合适，取决于你在防谁，走一次 [威胁模型如何建立](../basics/threat-model.md) 比较快。

## 过滤型 resolver 的两面

过滤型 resolver 对被挡的域名返回一个不通的地址，Cloudflare 的做法是回 `0.0.0.0`[^cf-ip]。这确实挡得住一部分恶意域名，对家庭与小型组织是低成本的防护。

完整的封锁清单与分类方法通常不公开，你不会事先知道哪些域名被归进去，遇到误挡时只能从「这个网站怎么连不上」开始查。另一个代价落在测量上，跑 OONI Probe 时过滤型 resolver 会让测量结果出现不是当地网络造成的异常，做法见下面的在地脉络。

家里有需要保护的成员时，过滤型 resolver 是合理选择。要用来判断网络环境是否遭到干扰时，它会妨碍判断。

## 怎么确认你设的是加密 DNS

**看你填进去的是什么。** IP 地址（`1.1.1.1`、`9.9.9.9`）是明文查询。加密要填主机名称或网址，形状像 `dns.quad9.net`、`dns.mullvad.net`、`security.cloudflare-dns.com`，或 `https://dns.quad9.net/dns-query` 这样的网址[^quad9][^mullvad][^cf-families]。填的是点分十进制的数字，那就不是加密 DNS。

**看你改的是哪一层。** 系统设置与浏览器设置是两份独立的东西。浏览器开了 DoH，其他 App 的查询仍然走系统设置。系统设好了，浏览器若自己另外指定了一家 resolver，浏览器的流量会照它自己那份走。两层都要看过。

Android 的私人 DNS 是系统层的设置，选项有关闭、自动、以及填入主机名称三种，填的是主机名称不是 IP，Android 9 以后支持[^android][^google-dot]。Google 对这个功能的说明写得很直白：「Private DNS helps secure only DNS questions and answers. It can't protect anything else.」

**确认失败时会怎么样。** 这是最容易被略过的一项。Firefox 的解析模式里，模式 2 是「先用 TRR，只有在名称解析失败时才退回原生解析器」，模式 3 才是「只用 TRR，永不使用原生解析器」[^mozilla-trr]。前者代表加密查询一失败就静默改走明文，你不会收到任何提示。要确保不退回，得选只用加密的那个模式，代价是解析失败时网站直接打不开。

## 什么时候会失效

**企业或校园网络。** 内部域名要靠内部 DNS 才解析得到，加密 DNS 把查询送到外面，内部资源就找不到。这类网络通常也会封锁外部的加密 DNS。

**登录页拦截（captive portal）。** 旅馆、机场的 Wi-Fi 要先开一个页面登录，那个页面靠拦截你的 DNS 回应运作。加密 DNS 开着时常常连登录页都跳不出来，得先关掉、登录、再开回来。

**加密 DNS 被整段封锁。** DoT 的第 853 端口很容易被挡掉。DoH 混在 HTTPS 里比较难挡，但挡得掉特定 resolver 的 IP 与域名。

**静默退回明文。** 见上一节的解析模式。失效时如果没有提示，你会以为还在加密状态。

## 跟 ECH 与 Tor 的关系

加密 DNS 遮住的只有域名查询那一段，你接着建立 TLS 连接时，握手中的 SNI 字段仍然带着目标域名，掌握这条线路的人从那里一样读得到。Encrypted Client Hello（ECH）就是为这一段设计的，站上对它的评估写在 [Metadata 是什么，为什么重要](../basics/metadata.md)，重点是它需要服务器端支持，也可能被中间设备阻挡，还不能假设每条连接的 SNI 都被保护。就算 ECH 生效，你连上的目的 IP 地址仍然在数据包里。

Tor Browser 是另一回事，它不使用系统的 DNS 设置。Tor 的 SOCKS 接口直接收主机名称，由 Tor 网络内部完成解析，官方规格对这个设计的理由写得很清楚：「if clients do their own DNS lookup, the DNS server can learn which addresses the client wants to reach」[^tor-socks]。所以为了 Tor 而去调整系统 DNS 没有效果，Tor Browser 的流量本来就不经过它。这也表示同一台设备上，Tor Browser 与其他 App 走的是两条完全不同的解析路径。

## 在地脉络：台湾

台湾读者换掉 DNS 的常见动机是解析比较快，或者某些域名在运营商的 resolver 上连不到。第二个动机要看阻挡发生在哪一层，DNS 层的阻挡换 resolver 有用，IP 或 SNI 层的阻挡换谁回答你都连不上。

跑 OONI Probe 的人要特别留意。网络连接测试（Web Connectivity）先用系统 resolver 解析域名，再跟测试辅助服务器解出来的结果比对，地址或 ASN 对得上才算一致[^ooni-wc]。设备上开着过滤型 resolver 时，被挡的域名会解到 `0.0.0.0`，跟辅助服务器对不上，数据看起来像当地网络遭到干扰。社群长期在整理 [台湾 ASN 覆盖率](../taiwan/ooni-asn-coverage.md)，测量的目标正是这个网络本身的 DNS 行为，所以这里不建议统一改用境外 resolver，那会把真正的运营商层阻挡一起盖掉。要做的是移除自己额外加上的过滤型 resolver，让设备回到该网络原本的设置。

## 常见问题

??? question "我到底该不该换 DNS"

    看你想解决什么。想让运营商看不到你查询过哪些域名，换到加密 DNS 有效，代价是换一家业者保管这批记录。想绕过封锁，得先确认封锁在哪一层。想匿名，这件事加密 DNS 做不到，见 [常被误认为匿名的网络](../advanced/mistaken-for-anonymity.md)。

??? question "用运营商的 DNS 是不是最糟的选项"

    不一定。运营商本来就看得到你连上的每一个目的 IP，换掉 DNS 并不会让它看不到你去了哪里，只是少看到域名这一份。相对地，换到境外 resolver 等于多一个原本看不到你的对象开始看得到。哪一边比较好，取决于你比较不希望被谁掌握。

??? question "免费的 resolver 为什么免费"

    各家理由不同，有的是基础设施业者顺带提供并藉此改善自家网络的测量，有的由非营利组织或基金会营运并接受捐款。这一题没有通则，该做的是去看它的记录政策与资金来源，而不是预设免费就有问题或免费就没问题。

??? question "设了加密 DNS，公司的内部网站连不上"

    这是预期行为。内部域名只有公司的 DNS 解析得到，查询送到外面自然找不到。多数操作系统允许针对特定网络关闭加密 DNS，或设置让特定域名走内部解析。在公司网络上先关掉是最单纯的做法。

??? question "DNSSEC 跟加密 DNS 是同一件事吗"

    两件事。加密 DNS 处理的是传输过程有没有被读取，DNSSEC 处理的是回应有没有被篡改，用签章让你验证这笔回应确实来自该域名的权威服务器。两者互补，Quad9 的 `9.9.9.9` 就同时做了加密传输与 DNSSEC 验证[^quad9]。

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
[^quad9]: [Service Addresses and Features](https://quad9.net/service/service-addresses-and-features/){target="_blank"} - Quad9 官方站。
[^mullvad]: [Mullvad DNS over HTTPS and DNS over TLS](https://mullvad.net/en/help/dns-over-https-and-dns-over-tls){target="_blank"} - Mullvad 官方说明。
[^android]: [Change your Android device's Private DNS settings](https://support.google.com/android/answer/9089903){target="_blank"} - Google 支援文档。
[^google-dot]: [DNS-over-TLS](https://developers.google.com/speed/public-dns/docs/dns-over-tls){target="_blank"} - Google Public DNS 文档，Android 9 起支持 DoT 的说明在此页。
[^mozilla-trr]: [Trusted Recursive Resolver](https://wiki.mozilla.org/Trusted_Recursive_Resolver){target="_blank"} - Mozilla Wiki，解析模式的定义在此页。
[^tor-socks]: [SOCKS extensions](https://spec.torproject.org/socks-extensions.html){target="_blank"} - Tor 规格文档。
[^ooni-wc]: [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} - OONI 测试规格。
