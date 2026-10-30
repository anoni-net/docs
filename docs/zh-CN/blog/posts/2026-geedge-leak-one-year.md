---
date: 2026-10-30
authors:
    - anoni-net
categories:
    - 观察
    - Tor
slug: geedge-leak-one-year
image: "https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp"
summary: "2025 年 9 月，为中国与其他国家构建网络审查系统的 Geedge Networks 内部文件外泄。一年来的调查从 Geedge 卖了什么给谁，走到哪些部分真的在运作，中国防火长城有一部分设备很可能用了这套系统，其他国家多半还无法确认。"
description: "Geedge 外泄一年来，从文件调查、供应链追查到代码比对的研究历程，以及翻墙工具、Tor 与 VPN 受到的影响。"
---

# Geedge 外泄一年后的研究重点

2025 年 9 月，为中国与其他国家构建网络审查系统的 Geedge Networks（积至公司）发生外泄，内部文件与源代码（软件的程序本文）都被公开。过去外界只能从墙外推测防火长城（中国用来审查与监控网络的系统）如何运作，这批数据让记者与研究者第一次能拿审查设备的程序对照真实的网络。一年来的研究从 Geedge 卖了什么给谁，一路走到哪些部分真的在运作。确认下来的范围比新闻标题说的窄，但比过去的推测扎实，使用翻墙工具、Tor 与 VPN 的人也更清楚自己面对的是什么。

<!-- more -->

## 从文件开始的调查

外泄之初，合作的媒体与调查组织 InterSecLab 先读的是文件与工单。InterSecLab 在 2025 年 9 月发表报告〈网络政变〉，整理出 Geedge 把审查系统卖给哈萨克斯坦、埃塞俄比亚、巴基斯坦与缅甸的政府，也在中国的新疆、福建与江苏构建省级的防火墙。Geedge 与中国科学院的 MESA 实验室关系密切，依研究防火长城的 GFW Report 整理，被称为「防火长城之父」的方滨兴是 Geedge 的首席科学家。外泄的文件共 572 GiB（约 600 GB），包含源代码、项目管理记录与客户的部署配置。

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp"
            alt="外泄文件记录的 Geedge 部署地点地图"
            style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;">
    </a>
    <figcaption markdown="span">外泄文件记录的 Geedge 部署地点：① 哈萨克斯坦、② 埃塞俄比亚、③ 巴基斯坦、④ 缅甸，⑤ 到 ⑦ 是中国的新疆、福建与江苏。国界数据来自 Natural Earth（公有领域）。</figcaption>
</figure>

从文件可以知道 Geedge 卖给谁、客户要求什么，部署出去的设备是否照着程序运作，则要另外验证。GFW Report 在同一个月的分析文章里也写到，源代码的部分还没有人仔细分析。社区在 2025 年 10 月发布[网络政变](https://anoni.net/docs/reports/interseclab-network-coup/){target="_blank"}的正体中文译文，2026 年 10 月[重新翻译了全文](./interseclab-coup-retranslation.md)。

## 从供应链追到台湾

文件也是追查供应链的线索。2026 年 4 月，InterSecLab 发表〈MADLink〉，依外泄文件追查 Geedge 的硬件从哪里来。台湾的凌华科技在 2019 到 2020 年初，经由北京分公司向 Geedge 出货 1,708 台网络设备。这批设备是 Geedge 第一代审查系统的硬件基础，外泄文件里这套配置只部署在哈萨克斯坦。

凌华给 InterSecLab 的回复写到，出货前做了出口管制名单的筛查，当时 Geedge 不在受限名单上。截至 2026 年 10 月 30 日，在我们比对的美国与欧盟制裁名单里，都没有 Geedge。社区也翻译了 [MADLink](https://anoni.net/docs/reports/interseclab-madlink/){target="_blank"} 的全文（正体中文）。

## 代码与真实网络的比对

读文件之外，另一条研究线是直接读代码。2026 年 8 月，美国与德国几所大学和 GFW Report 的研究者发表论文，他们把外泄的源代码实际构建起来，在隔离的环境测试 Geedge 的审查系统（简称 TSG），再到各地的网络上比对审查设备的反应。在 DNS 注入（抢先发回假的域名查询结果）与中断连接这两项，防火长城有三台设备的行为与 TSG 高度吻合。研究者的结论是，外泄的代码或与它相近的版本，很可能部署在防火长城的一部分。

同样测量过的其他防火长城设备与 TSG 不吻合，那些设备由谁提供，目前没有公开的证据。哈萨克斯坦、缅甸与巴基斯坦的结果多半停在「可能」或「无法确认」，埃塞俄比亚没有测量。新闻网站 Risky Bulletin 的报道里，TSG 是防火长城「三种已知流量过滤能力之一」，论文里没有这种写法，同一篇报道引用的研究者也提到 Geedge 只是参与防火长城的厂商之一。

〈网络政变〉的副标题写的是一家中国公司把防火长城输出到威权国家，那是从文件看到的销售与部署。代码的比对回答的是另一个问题，结果是防火长城的一部分用了 Geedge 的程序，其他国家的部署还有待测量确认。

## 翻墙工具、Tor 与 VPN 受到的影响

外泄数据里有大量封锁翻墙工具与 VPN（把网络流量转到其他地方的服务器、借此绕过封锁的服务）的记录。客户国家会上报哪些工具还能连接、哪些封锁误封了其他服务，Geedge 再反复调整封锁规则。翻墙工具 Psiphon 的流量没有明显特征，Geedge 就改用服务器的 IP 地址（网络上的门牌号码）封锁。外泄文件里也有 NordVPN 的完整服务器清单，服务器的地址本身就是收集与封锁的对象。

Tor 是隐藏用户位置、让网络运营商无法得知你连去哪里的匿名网络。外泄数据里，Tor 列在要识别的工具中，但论文里没有 TSG 如何识别 Tor 的说明，也没有 Tor 连接的测试。InterSecLab 的报告里写到，外泄时 Geedge 似乎还没有有效封锁 WebTunnel（Tor 把流量伪装成普通网页浏览的连接方式）的手段，InterSecLab 也没有找到 Geedge 发现或利用 Tor 未公开漏洞的证据。

在受审查的网络无法连上 Tor 时，一般的做法仍然适用，可以改用网桥（不公开地址的 Tor 入口），设置方式见 [Tor Browser 进阶设定](../../tools/tor-browser-advanced.md)。〈网络政变〉里写到，连接没有加密时，TSG 能拦截密码与邮件内容，所以不要在浏览器标示「不安全」的网站登录或输入个人信息。也不要安装来路不明的证书（网站向浏览器证明身份的数字文件），安装之后，加密的连接可以被完整解密。即使没有安装，TSG 仍能从加密的连接取得连去哪个网站这类信息。选择 VPN 之前，可以先读 [VPN 的风险与选择](../../tools/vpn-guide.md)。

## 测量看不到的封锁

2026 年 2 月的另一篇论文里，研究者从域名切入，比对外泄文件里出现的域名。在测量点实测被封锁的域名，九成以上不在常用来测量的两份网站清单里。[OONI](../../tools/what-is-ooni.md)（检测网站是否被封锁的开源工具）这类依清单检测的工具，结果只涵盖清单里的网站。清单以外的网站本来就不在观测范围内，没有发现封锁不等于没有封锁。社区维护 Citizen Lab 检测清单里台湾的部分，清单只能涵盖维护者想到的网站，是我们整理清单时要记得的限制。

## 审查与规避共用的开源软件

Geedge 的系统大量使用 Linux、Kafka（处理大量实时数据的软件）等开源软件，InterSecLab 在报告里推测，部分代码的使用方式可能违反许可条款（规定使用条件的条文）。开源许可不限制用途，审查系统与 Tor 这类规避工具都建立在开源软件上。一年来的调查也依赖开放的做法，研究者用开源工具整理文件、公开测量脚本，InterSecLab 的报告则以开放许可发布，社区因此可以译成中文。

## 还没有答案的问题

防火长城其他设备由谁提供，目前没有公开的证据。哈萨克斯坦与埃塞俄比亚缺少合适的测量点，各客户国家的部署还无法用测量确认。外泄文件里另有一个代号 A24 的客户，身份至今不明，外泄的代码也还没有完整审查。Tor、Psiphon 与 VPN 厂商则还没有公开说明为应对外泄做了哪些调整。社区会持续跟踪后续的研究，也欢迎到 [Matrix](https://anoni.net/zh-cn/contact/){target="_blank"} 一起讨论。

## 更完整的分析

比对结果的表格、TSG 的系统架构图、开源软件的整理，以及每个说法的出处，写在社区首页的技术文章[Geedge 外泄一年后的研究回顾](https://anoni.net/zh-cn/articles/geedge-leak-one-year/){target="_blank"}。

## 相关阅读

- [研究报告中译](../../reports/index.md)：网络政变与 MADLink 两份 InterSecLab 报告的中译
- [什么是 Tor](../../tools/what-is-tor.md)：Tor 如何隐藏你的位置与连接对象
- [Tor Browser 进阶设定](../../tools/tor-browser-advanced.md)：无法连上 Tor 时如何设置网桥
- [什么是 OONI](../../tools/what-is-ooni.md)：用 OONI 检测网站是否被封锁
- [监控现在做得到什么](../../basics/surveillance-capability.md)：网络监控的实际能力与限制
