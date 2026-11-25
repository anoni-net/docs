---
title: 网络封锁的手法与绕过方式
description: 连不上某个网站时，可能是网站故障，也可能是网络的某一段在挡。本页说明封锁发生在哪里、DNS、IP、域名与协议封锁各自的运作方式，如何用 OONI Probe 确认，以及加密 DNS、VPN、Tor 与通信软件的 Proxy 各自挡得住哪一种封锁、会留下什么痕迹。
icon: material/wall-fire
---

# :material-wall-fire: 网络封锁的手法与绕过方式

政府、电信运营商、学校与公司都可能在网络上挡掉特定的网站或服务。封锁之前需先看得到流量，所以封锁与监控用的是同一套能力，能减少网络管理者看到的内容的工具，同时也让选择性封锁更难运行[^ssd-cens]。多数情况下都有办法绕过封锁取得信息，但绕过的方法各自有代价：有些只解决一种封锁，有些会让网络管理者知道你在使用绕过工具，在部分国家，使用本身就有法律风险[^ssd-cens]。

本页依 EFF Surveillance Self-Defense 的〈How to: Understand and Circumvent Network Censorship〉改写，补上台湾的封锁制度与中国大陆的法规（出处见[本页的来源与核对](#本页的来源与核对)）。网络自由为什么重要见 [网络自由为什么重要](./internet-freedom.md)，整个网络被切断时的准备见 [网络中断时的准备与应对](../scenarios/shutdown.md)。

!!! tip "时间有限的话，先看这几点"

    - 先确认是被封锁、还是网站本身故障，OONI Probe 可以测，但在部分国家运行测试本身有风险
    - 只被 DNS 挡的话，改用加密 DNS 通常就能连上
    - VPN 与 Tor 挡得住更多种封锁，但网络管理者通常看得出你在使用它们
    - 在中国大陆，条文禁止个人自行使用其他通道连上国际网络，有个人被罚款的案例，出发或使用前先评估

!!! warning "在中国大陆的读者"

    在中国大陆运行 OONI Probe、使用 VPN 或 Tor 都有被注意到的风险，法规与处罚案例见[绕过工具本身的风险](#绕过工具本身的风险)。Tor Project 对中国的建议是先试 Connection Assist，再改用 WebTunnel 网桥，官网打不开时从 Telegram 的 `@gettor_bot` 下载 Tor Browser[^tor-cn]。

## 封锁发生的位置

从你的设备到网站之间，有三个地方可以挡[^ssd-cens]：

- **你的设备上**：学校或公司发的电脑与手机，管理者可以安装软件限制能连的网站与能用的通信方式。间谍软件的运作方式跟这类管理软件相近，见 [恶意软件的防范与处理](../tools/malware.md)
- **局域网**：学校、公司、咖啡店的 Wi-Fi，管理者可以过滤或记录你连到哪里、搜索了哪些关键字
- **网络服务提供商（ISP）**：许多国家的政府要求运营商过滤，运营商也可能把过滤当成服务卖给家庭与公司

台湾也有运营商层级的封锁，对象是诈骗网站。依《诈欺犯罪危害防制条例》第 42 条，主管机关可以命令网络运营商对涉诈网站「停止解析」或「限制接取」[^xhs]。数位发展部的参考程序由 TWNIC 协调各家运营商以 DNS RPZ（让运营商的 DNS 服务器对清单上的域名不回应）运行，触发条件限定法院裁定或合法的行政命令，程序文件也记载了误挡 Instagram、wordpress.com 这类案例[^moda-rpz]。2025 年 12 月，刑事警察局依同一条对小红书实施停止解析与限制接取[^xhs]。

## 封锁的手法

### DNS 封锁

连上网站前，设备要先问 DNS 服务器「这个域名的 IP 地址是什么」。默认的 DNS 服务器多半属于你的 ISP，它可以对被封锁的域名返回错误的地址，或者不回应。改用其他 DNS 服务器时，如果查询没有加密，ISP 仍然可以拦下或改写答案[^ssd-cens]。

### IP 封锁

运营商或网络管理者维护一份 IP 地址清单，丢弃往返这些地址的流量。许多网站共用同一个 IP，许多用户也共用同一个对外 IP，所以 IP 封锁常常挡到不相干的网站[^ssd-cens]。台湾的参考程序因为这个原因，目前较少采用 IP 封锁[^moda-rpz]。

### 依域名过滤 HTTPS 连接

HTTPS 加密了网址的路径与网页内容，域名在连接开始时仍以明文送出，这个字段叫 SNI（Server Name Indication，告诉服务器你要连哪个网站）。网络管理者看得到你连的是 `eff.org`，看不到你读的是哪一页，可以依域名挡掉整个网站[^ssd-cens]。

新的 ECH（Encrypted Client Hello）把域名也加密起来。Chrome 117 起、Firefox 119 起默认启用，Cloudflare 的免费方案网站默认支持[^chrome-ech][^cf-ech]。ECH 要搭配加密 DNS 才完整，中国与伊朗的做法是封锁加密 DNS，间接让 ECH 无法使用[^foci-ech]。2020 年 7 月中国的防火长城就曾直接丢弃带有 ECH 前身（ESNI）的连接[^gfw-esni]。

### 关键字过滤

运营商读取没有加密的流量内容，网页出现特定字词就挡下。网站普遍改用 HTTPS 之后，这种做法变少了[^ssd-cens]。要注意的例外是学校与公司管理的设备，管理者可以在设备上安装自己的根证书（CA certificate），之后就能解开设备上的 HTTPS 流量逐一检查[^ssd-cens]。

### 协议与端口封锁

防火墙可以从流量的协议特征与端口辨识出 VoIP、P2P 文件分享或 VPN 这类技术，整类挡掉[^ssd-cens]。深度封包检测（DPI，逐笔分析连接特征、判断要不要放行的技术）让这类辨识更准，所以强审查地区要用把流量伪装成一般 HTTPS 的混淆方案（见 [VPN 的风险与选择](../tools/vpn-guide.md)）。

### 断网与限速

最极端的做法是拔掉物理的网络设备、切断基站，或挡掉全部的国外 IP、只留国内连接。另一种是限速，选择性地让某些服务慢到不能用，比直接封锁难察觉，用户常以为是自己的网络或对方的服务有问题[^ssd-cens]。断网的分级与准备见 [网络中断时的准备与应对](../scenarios/shutdown.md)。

## 封锁的确认方式

[OONI Probe](../tools/what-is-ooni.md) 可以帮你判断遇到的是哪一种封锁[^ssd-cens]。它的网站连接测试（Web Connectivity）从你的网络与 OONI 的对照服务器各做一次 DNS 查询、TCP 连接与 HTTP 请求，比对两边的结果，判断是 DNS、TCP/IP 还是 HTTP 层的封锁[^ooni-wc]。

单次的「异常」不等于封锁，网络不稳、网站故障、网站依国家提供不同内容都会造成异常。比较可靠的判断方式是看 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 上同一个网站的长期结果，并依网络运营商（ASN，自治系统编号）分开看，同一家运营商反复出现相同的错误，才是比较强的封锁信号[^ooni-interp]。

运行 OONI Probe 之前先了解 OONI 自己写的风险[^ooni-risks]：

- 监控你网络的人看得出你在运行 OONI Probe，被测试的网站也会看到你的 IP
- 在部分国家，任何主动的网络量测都可能违法，可能面临民事、刑事或法律以外的惩罚。测试清单里也可能有在当地浏览就违法的网站
- 测试结果默认公开，包含大略位置与网络运营商，可以在 App 的设置里关闭公开
- OONI 建议在高风险的地方先咨询律师

## 绕过的方法

越少让网络看到你连去哪里，选择性封锁就越难运行。下面四种方法由轻到重排列，适用的封锁手法不同[^ssd-cens]。

### 加密 DNS

只被 DNS 挡的时候，改用加密 DNS（DoH、DoT）就能绕过，网络上的人也看不到你查询了哪些域名[^ssd-cens]。一份 2022 年的研究估计，加密域名可以解开中国约 55%、其他依赖 DNS 过滤的国家约 95% 被封锁的域名[^pam]。

加密 DNS 解决不了依域名过滤的 HTTPS 连接与 IP 封锁。常见的加密 DNS 服务（例如 `1.1.1.1`、`8.8.8.8`）本身也可能被封锁，伊朗在 2022 年封锁过已知的加密 DNS 服务，中国、俄罗斯与沙特阿拉伯也有封锁加密 DNS 的记录[^ssd-cens][^pam]。换了 DNS 服务，原本 ISP 看得到的查询记录就换成新的服务看得到，选择方式与设置步骤见 [加密 DNS 怎么选、怎么确认真的生效](../tools/encrypted-dns.md)。

### VPN

VPN 把你所有的流量加密，送到另一个国家的服务器再连出去，挡得住当地的 IP 封锁与多数依域名的过滤。网络管理者看不到内容，但通常看得出你在用 VPN，强审查地区会封锁 VPN 的协议，标准的 WireGuard、OpenVPN 可能完全连不上[^ssd-cens]。

VPN 服务商看得到你连去哪里，可能留存记录，政府取得服务商记录或监听 VPN 连接的风险，对部分用户来说大于翻墙带来的好处[^ssd-cens]。如何挑选见 [VPN 的风险与选择](../tools/vpn-guide.md)。

### Tor Browser 与网桥

遇到协议封锁、IP 封锁、DNS 封锁，或者 VPN 无法使用时，可以改用 Tor Browser。流量经过世界各地不同人经营的三个中继节点，你的 ISP 看不出你连到哪个网站，网站也看不出你从哪里来[^ssd-cens]。

Tor 本身也会被封锁，网络管理者也看得出你在使用 Tor[^ssd-cens]。被挡的时候用网桥（bridge）：Tor Browser 的「Connection Assist」会依你的所在地自动挑选网桥，也可以手动选择 obfs4（让流量看起来像随机数据）、Snowflake（看起来像视频通话）、WebTunnel（看起来像一般的 HTTPS 网站）或 meek（看起来像连到云服务）[^tor-pt]。Tor Project 对中国的建议依序是 WebTunnel、Snowflake、meek，WebTunnel 不在内置菜单里，要另外索取[^tor-cn]。Tor 的基本用法见 [什么是 Tor](../tools/what-is-tor.md)。

Tor Browser 一定要从官方网站或官方管道下载。官网被封锁时，可以从 Telegram 的 `@gettor_bot` 或寄信到 `gettor@torproject.org` 取得[^tor-cn]。

### 通信软件的 Proxy

Signal 或 WhatsApp 被封锁时，可以通过 Proxy 连接。消息仍然是端对端加密，Proxy 的经营者读不到内容，但看得到你的 IP[^ssd-cens]。Signal 的 Proxy 外观就像一般的加密网页流量，要在手机上设置，电脑版目前不支持。公开张贴的 Proxy 地址比较容易被封锁，私下分享比较能持久[^signal-proxy]。设置与自建方式见 [Signal Proxy](../tools/signal-proxy.md)。

## 绕过工具本身的风险

管理网络的人可能注意到你在使用某种绕过工具，进而对你或其他人采取行动[^ssd-cens]。工具名称有「匿名」字样，不代表它会隐藏你的身份，判断前先想清楚自己要防谁（见 [威胁模型如何建立](./threat-model.md)）[^ssd-cens]。

各地的法律风险差很多。台湾使用 VPN 与 Tor 完全合法。在中国大陆，《计算机信息网络国际联网管理暂行规定》第 6 条规定任何单位和个人不得自行建立或使用其他通道连上国际网络，第 14 条的罚则是警告，可并处人民币 15,000 元以下罚款，并没收违法所得[^cn-reg]。有个人因此被罚：2018 年广东韶关有人因使用翻墙软件被罚 1,000 元[^sixthtone]，2023 年河北承德一名替国外公司工作的程序员被罚 200 元，另被没收三年多来约 105 万元的收入[^cdt]。

出入境时的手机检查、各国 VPN 与 Tor 的可用性，见 [出差与研讨会的数字准备（东亚与东南亚）](../scenarios/asia-travel.md)。

## 本页的来源与核对

本页依 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的〈[How to: Understand and Circumvent Network Censorship](https://ssd.eff.org/module/understanding-and-circumventing-network-censorship){target="_blank"}〉改写，该篇审阅日 2024-02-01，以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授权。

跟原文不同的地方：加上台湾的诈骗网站封锁制度、中国大陆的法规与罚款案例、OONI 对结果判读与运行风险的说明、ECH 的现况、Tor Project 目前的网桥建议与 Signal Proxy 的细节，这几项依各自注脚的来源。原文逐一说明浏览器与操作系统设置加密 DNS 的步骤，本页改连到文档站的加密 DNS 页。与原文不同之处由匿名网络社区 anoni.net 负责，不代表 EFF 的立场。

2026 年 11 月核对。

## 相关阅读

- [什么是 OONI](../tools/what-is-ooni.md)：网络审查的公开观测数据从哪里来
- [VPN 的风险与选择](../tools/vpn-guide.md)：挑选标准、混淆与各地区的可用性
- [什么是 Tor](../tools/what-is-tor.md)：Tor Browser 的基本用法与注意事项
- [在中国大陆的公开平台传播信息](../scenarios/mainland-speech.md)：实名环境下的风险与取舍

[^ssd-cens]: [How to: Understand and Circumvent Network Censorship](https://ssd.eff.org/module/understanding-and-circumventing-network-censorship){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2024-02-01。
[^moda-rpz]: [运用 DNS RPZ 自律机制停止解析违法网站处理参考程序](https://www-api.moda.gov.tw/File/Get/moda/zh-tw/Qv1tZuiNEVfsLIl){target="_blank"} - 数位发展部，2025-01。
[^xhs]: [小红书遭依法中止连接 刑事局说明启动处置原因](https://udn.com/news/story/124671/9185901){target="_blank"} - 联合新闻网，2025-12-06。
[^chrome-ech]: [Encrypted Client Hello (ECH)](https://chromestatus.com/feature/6196703843581952){target="_blank"} - Chrome Platform Status。Firefox 见 [Firefox 119 release notes](https://www.mozilla.org/en-US/firefox/119.0/releasenotes/){target="_blank"}。
[^cf-ech]: [Encrypted Client Hello](https://developers.cloudflare.com/ssl/edge-certificates/ech/){target="_blank"} - Cloudflare Docs。
[^foci-ech]: [Encrypted Client Hello (ECH) in Censorship Circumvention](https://petsymposium.org/foci/2025/foci-2025-0016.php){target="_blank"} - Niere et al., FOCI 2025。
[^gfw-esni]: [Exposing and Circumventing China's Censorship of ESNI](https://gfw.report/blog/gfw_esni_blocking/en/){target="_blank"} - GFW Report、iYouPort 与 Geneva 团队，2020-08。
[^ooni-wc]: [Web Connectivity](https://ooni.org/nettest/web-connectivity/){target="_blank"} - OONI。
[^ooni-interp]: [Interpreting OONI data](https://ooni.org/support/interpreting-ooni-data/){target="_blank"} - OONI。
[^ooni-risks]: [Risks: Things you should know before running OONI Probe](https://ooni.org/about/risks/){target="_blank"} - OONI。
[^pam]: [Measuring the Accessibility of Domain Name Encryption and Its Impact on Internet Filtering](https://arxiv.org/abs/2202.00663){target="_blank"} - Hoang, Polychronakis, Gill, PAM 2022。
[^tor-pt]: [Unblocking Tor](https://support.torproject.org/tor-browser/circumvention/unblocking-tor/){target="_blank"} - Tor Project Support。
[^tor-cn]: [Connecting to Tor from censored regions](https://support.torproject.org/tor-browser/circumvention/connecting-from-censored-regions/){target="_blank"} - Tor Project Support。
[^signal-proxy]: [Proxy Support](https://support.signal.org/hc/en-us/articles/360056052052-Proxy-Support){target="_blank"} - Signal Support。
[^cn-reg]: [中华人民共和国计算机信息网络国际联网管理暂行规定](https://www.cac.gov.cn/1996-02/02/c_126468621.htm){target="_blank"} - 国家互联网信息办公室。2024 年修订只删除第 6 条第 1 款的「邮电部」，第 6 条第 2 款与第 14 条未变动。
[^sixthtone]: [Guangdong Man Fined $150 for Using a VPN](https://www.sixthtone.com/news/1003431){target="_blank"} - Sixth Tone，2019-01。
[^cdt]: [Chengde Seizes Three Years of "Illegal Income" from Programmer Who Used VPN for Overseas Work](https://chinadigitaltimes.net/2023/09/chengde-seizes-three-years-of-illegal-income-from-programmer-who-used-vpn-for-overseas-work/){target="_blank"} - China Digital Times，2023-09-28。
