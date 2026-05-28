---
date: 2026-05-28
authors:
    - toomore
categories:
    - 更新
    - 社区
    - Tor
    - Relay
slug: iran-blackout-webtunnel
image: "assets/images/tor.webp"
summary: "伊朗在军事行动期间封网 80 多天，重新开放后流量涌进社群架设的 Tor WebTunnel。这篇记下我们看到的现象，并号召有能力的人一起架 WebTunnel 桥接。"
description: "伊朗封网 80 多天后重新开放，大量流量经过社群架设的 Tor WebTunnel。WebTunnel 把 Tor 流量伪装成 HTTPS，是重度审查地区最难封锁的桥接。对外连接自由、带宽充足的地方，正是合适的桥接来源地。"
---

# 伊朗封网 80 多天后重新开放，流量涌进社群架设的 Tor WebTunnel

对伊朗的网络使用者来说，过去这近三个月，外面的网络几乎不存在。直到前几天连接稍微恢复，社群架设在台湾的 Tor WebTunnel 桥接开始涌进大量流量，那是想尽办法绕过审查、连回 Tor 的伊朗人，重新连上了外面的网络。

!!! tip "你也可以帮上忙"

    手上有一台 VPS（云端主机）或实体主机，再加一个域名，就能架一个 Tor WebTunnel 桥接，让被审查切断的人能连回外面的网络。架不了服务器也没关系，打开浏览器跑 [Snowflake](../../tools/tor-snowflake.md) 一样能贡献匿名流量。

    服务器规格、法律考量与完整架设步骤，都整理在 [**如何搭建 Tor WebTunnel 桥接**](../../community/setup-tor-webtunnel.md)。

<!-- more -->

## 封了 80 多天的网络

2026 年 2 月 28 日起，伊朗在军事行动期间切断了对外连接。这次断的是整个国家对外的网络，接近全国规模，跟平常封锁个别网站的审查是不同量级的事。根据 Cloudflare Radar 的观测，伊朗对外的网络流量在断网后掉到平常高点的 0.3% 上下，几乎归零，整个三月、四月都压在这个低点[^1][^2]。一直到 5 月 26 日前后，流量才急速回升，重新接近正常水准。从断网到重新开放，前后 80 多天。

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-radar-cf.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-radar-cf.png"
            alt="Cloudflare Radar 显示伊朗对外网络流量的时间轴，2026 年 2 月 28 日断网后骤降到接近零，整个三、四月维持在低点，到 5 月 26 日前后才急速回升"
            title="Cloudflare Radar 观测到的伊朗对外流量，2 月 28 日断网、5 月 26 日前后回升"
            class="brand-frame">
    </a>
    <figcaption>Cloudflare Radar 观测到的伊朗对外网络流量。2026 年 2 月 28 日断网后接近归零，整个三、四月维持低点，5 月 26 日前后才急速回升。</figcaption>
</figure>

封网的这段期间，伊朗只剩一个被高度过滤的国内网络可用，银行、外送这类本地服务还能运作，但对外的连接几乎全断。NetBlocks 把这次列为现代史上最长的全国性断网，全国 9000 万人口里，大多数在这近三个月几乎连不上国际网络[^3]。

## 社群的 WebTunnel 在伊朗重新开放网络后流量跳升

社群在台湾架设的 Tor WebTunnel 桥接，平常就在背景持续运作，帮连不上 Tor 的人绕过审查连进来。伊朗重新开放的那两天，这个节点的连接明显跳升，流量比平常高出许多。看到流量回来的当下，我们其实松了一口气，那代表又有人能重新连上外面的网络。

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-blackout-webtunnel-cf.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-blackout-webtunnel-cf.png"
            alt="社群架设的 Tor WebTunnel 桥接在伊朗重新开放后的流量图，连接量比平常明显跳升"
            title="社群 WebTunnel 桥接的流量，伊朗重新开放后明显跳升"
            class="brand-frame">
    </a>
    <figcaption>社群架设的 Tor WebTunnel 桥接流量。伊朗重新开放后，经过这个节点的连接明显跳升。</figcaption>
</figure>

封网期间，当地人连 Tor 都连不上，因为整条对外连接都断了。连接一恢复，很多人急着想知道外面这段期间发生了什么、跟失联的亲友重新联络上。记者要把当地消息传出去，公民团体需要和外界协调，这些都得连上那些被长期封锁的网站和服务。要绕过审查，多半得靠 Tor，而在 Tor 本身也被封锁的地方，还得透过各地志愿者架设的桥接才连得上。他们透过桥接连上 Tor 时，有一部分连接就经过社群架在台湾的这个节点（社群在新加坡也架了一台节点，这次没有被分配到流量）。

从后台看连入这个桥接的来源网络，前五名全是伊朗的主要电信业者，流量确实来自当地的一般网络用户。

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-asn.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-asn.png"
            alt="Cloudflare 后台的来源 ASN 列表，连入这个 WebTunnel 桥接的前五名来源网络全是伊朗电信业者：MCI 移动通信 144.7 GB、伊朗电信 TCI、Irancell、Aria Shatel、Pasargad"
            title="连入 WebTunnel 桥接的来源 ASN，前五名全是伊朗主要电信业者"
            class="brand-frame">
    </a>
    <figcaption>连入这个 WebTunnel 桥接的来源 ASN（Cloudflare 后台）。前五名全是伊朗的主要电信业者：移动通信公司（MCI）、伊朗电信（TCI）、Irancell、Aria Shatel、Pasargad，流量确实来自伊朗的网络用户。</figcaption>
</figure>

流量并没有在那两天之后就退去。这几天，连接持续经过这个桥接。根据 NetBlocks 等监测机构，伊朗这次的恢复并不完整，移动网络一度仍中断、家用 Wi-Fi 才先恢复，主要社群平台的封锁也还在，甚至比封网前更严，当地人要连到外面的一般网站，多半得靠 VPN 之类的工具才连得出去[^3][^4]。对很多人来说，就算网络「重新开放」，要连到外面还是得绕过大量封锁，而社群的 WebTunnel 就是这些绕过封锁的方式之一。

流量这几天持续经过社群架设的 WebTunnel，这几个节点显然不够用。所以我们想邀请更多有能力的人一起架设桥接，让更多需要连到外面的人连得上。

!!! info "需要连接的人，可以来信索取"

    社群目前在台湾、新加坡各运作一个 Tor WebTunnel 桥接。为了不让审查者直接把位址封掉，这些 bridge line 不会公开贴出来。你或你认识的人若需要，欢迎来信 <whisper@anoni.net> 索取（其他联络方式见[持续关注](../../contact.md)）。

## 为什么是 WebTunnel

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-webtunnel.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-webtunnel.png"
            alt="WebTunnel 示意图，Tor 流量被包进一般 HTTPS 连接、伪装成普通网站浏览以绕过审查"
            title="WebTunnel 把 Tor 流量伪装成一般 HTTPS 连接"
            class="brand-frame">
    </a>
    <figcaption>WebTunnel 把 Tor 流量包进一般 HTTPS 连接里，在审查者眼中就像普通的网站浏览（示意图）。</figcaption>
</figure>

Tor 的桥接有好几种，差别在于「有多难被审查者封锁」。

[Snowflake](../../tools/tor-snowflake.md) 门槛最低，开个浏览器分页就能帮人连接，不必准备服务器，谁都能马上上手，在多数受审查的地方都很有用。它走 WebRTC（浏览器做视讯通话用的那种即时连接技术），这种流量跟一般浏览网页长得不太一样，在过滤特别严的环境里比较容易被认出来。另一种叫 obfs4 的桥接，把流量变成一团看不出规律的噪声，但审查系统用深度封包检测（DPI，逐笔分析连接、判断要不要放行的技术）仍可能认出它不像正常上网而挡掉。

WebTunnel 的做法不同，它把 Tor 流量包进一个真正的 HTTPS 连接里（就是平常浏览器网址列上锁、开头 https 的那种安全连接）。在审查者眼中，连到 WebTunnel 桥接跟连到一个普通网站没有两样。要封锁它，就得连带封掉大量正常的 HTTPS 网站，代价高到审查者通常下不了手。这让 WebTunnel 成为对付这类过滤最强的桥接之一，在中国、俄罗斯都已经实际派上用场。

伊朗这次的情况更极端，整段对外连接都被切断，断网期间连桥接也无从运作。等连接回来、回到日常的过滤状态，桥接才重新派得上用场。不过伊朗的过滤比中俄棘手，当地用协定白名单只放行特定几种连接，WebTunnel 起初并不容易在那里运作。

随着 Tor 改用 Telegram 分发桥接、志愿者把节点数撑起来，2025 年起 Tor 观察到越来越多伊朗使用者成功透过 WebTunnel 连上 Tor[^5]，也呼应了社群节点这次在重新开放后看到的流量。同一时期，Snowflake 也在伊朗特别好用，Tor 形容它是当地最好用的连接工具之一[^6]。对伊朗的网络自由来说，WebTunnel 和 Snowflake 都是有效的路，两种都欢迎更多人一起加入。

## 你也可以架一个

对外连接自由、带宽充足的地方，是合适的桥接来源地。审查者会持续封锁已知的桥接 IP，所以分散在不同国家、不同网络供应商的 WebTunnel 越多，当地人能用的入口就越多。每多架一个节点，就是给当地人多一个还没被封锁、能连上 Tor 的入口。

门槛其实不高：

- 一台 512MB 到 1GB 内存的小型 VPS 就跑得动，成本和维护心力都比架 [Tor Relay](../../community/setup-tor-relay.md) 低。
- 需要一个域名（或子域名）和一张 TLS 证书（让网站能用 https 安全连接的证书），用 Let's Encrypt 免费就能申请。
- 法律风险很低。桥接只是中转站，不会直接连到使用者最后要造访的网站，对外网站看到的是 Tor 网络的出口，不是你的服务器，比架设 Tor 出口节点安全得多。

我们把完整的架设流程整理成一份指引，从准备域名、申请证书、把桥接架起来，到防火墙、伪装页、监控与后续维运都写进去了：

- :material-tunnel-outline: [**如何搭建 Tor WebTunnel 桥接**](../../community/setup-tor-webtunnel.md)

如果没办法协助架设 WebTunnel，也可以打开浏览器跑 [Snowflake](../../tools/tor-snowflake.md)，开着分页就能贡献匿名流量，帮连不上 Tor 的人绕过审查。等你准备好投入一台服务器，再回来架 WebTunnel。

## 不只是伊朗

伊朗这次的断网很极端，但网络审查与断网不是遥远的特例。缅甸、白俄罗斯、中国长期维持高强度的过滤，每一次区域冲突、选举、抗争，都伴随着网络的收紧。同样身处华语圈的香港，也从过去开放的网络环境，这几年开始出现依国安法的网站封锁。东亚一带遇到地震、海缆中断或区域紧张时，对外连接同样可能中断或被干扰。现在帮其他地方的人架起绕过审查的桥接，也是在替自己累积架设与运维匿名网络的经验。

一个节点不会改变什么，但很多个分散在世界各地的节点加起来，就是审查者很难一次拔掉的网络。如果你有一台闲置的 VPS 或实体主机、一个域名，和一点时间，欢迎一起架起更多桥接。

社群讨论在 [Matrix](../../contact.md)（家服务器 `im.anoni.net`），加入方式与其他联络管道都在那页。

## 相关阅读

- [如何搭建 Tor WebTunnel 桥接](../../community/setup-tor-webtunnel.md)
- [Tor Snowflake 桥接点](../../tools/tor-snowflake.md)
- [如何搭建 Tor Relay](../../community/setup-tor-relay.md)
- [网络自由为什么重要](../../basics/internet-freedom.md)
- [2025 年 10 月国际网络自由观察](./internetfreedom-oct2025.md)

[^1]: [Cloudflare Radar — Iran](https://radar.cloudflare.com/ir){target="_blank"} - Cloudflare Radar
[^2]: [Internet shutdown in Iran amid military actions](https://x.com/CloudflareRadar/status/2027709437981450502){target="_blank"} - Cloudflare Radar
[^3]: [Internet restored to tens of millions in Iran after three-month blackout](https://www.thenationalnews.com/news/mena/2026/05/27/internet-restored-to-tens-of-millions-in-iran-after-three-month-blackout/){target="_blank"} - The National
[^4]: [Iran's Internet restored for some after 88 days of blackout](https://www.upi.com/Top_News/World-News/2026/05/26/iran-internet-restored-88-days/9231779817270/){target="_blank"} - UPI
[^5]: [Staying ahead of censors in 2025: What we've learned from fighting censorship in Iran and Russia](https://blog.torproject.org/staying-ahead-of-censors-2025/){target="_blank"} - The Tor Project
[^6]: [How Iranians are overcoming unprecedented internet censorship](https://www.techradar.com/vpn/vpn-privacy-security/iranians-are-resilient-they-always-find-ways-to-speak-how-iranians-are-overcoming-unprecedented-internet-censorship){target="_blank"} - TechRadar
