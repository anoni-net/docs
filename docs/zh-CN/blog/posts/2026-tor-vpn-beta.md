---
date: 2026-09-11
authors:
    - anoni-net
categories:
    - 更新
    - Tor
    - 翻译文章
slug: 2026-tor-vpn-beta
image: "https://forum.torproject.org/uploads/default/original/2X/1/1705e443e3cb9fe39eedf2432cf559090323d6fe.png"
summary: "Tor Project 在 2026 年 9 月 9 日发表 Tor VPN Beta 的开发回顾。构想始于 2021 年的用户研究，第一个平台选 Android，去年秋天限量发布之后最主要的用途很快确定，用户要的是解除封锁。这篇整理官方回顾的内容，包含每个 app 各走一条独立 Tor circuit 的隔离设计、Apps 界面新增搜索、出口选择在可用性测试中造成的误用（需要桥接的人去调了出口位置，因此现在必须先连上 Tor 才能选出口）、采用集中在伊朗与土库曼斯坦这类高度审查地区、1.4.0 beta 优先补上 WebTunnel 桥接、底层 Arti 带来的稳定性、可复现构建与 F-Droid 上架，以及拥塞控制尚未从 C 版 Tor 移植过来这件未完成的工作。文末补上中国境内与海外华人视角的四点提醒。"
description: "Tor Project 在 2026 年 9 月 9 日发表 Tor VPN Beta 的开发回顾。构想始于 2021 年的用户研究，第一个平台选 Android，去年秋天限量发布之后最主要的用途很快确定，用户要的是解除封锁。这篇整理官方回顾的内容，包含每个 app 各走一条独立 Tor circuit 的隔离设计、Apps 界面新增搜索、出口选择在可用性测试中造成的误用（需要桥接的人去调了出口位置，因此现在必须先连上 Tor 才能选出口）、采用集中在伊朗与土库曼斯坦这类高度审查地区、1.4.0 beta 优先补上 WebTunnel 桥接、底层 Arti 带来的稳定性、可复现构建与 F-Droid 上架，以及拥塞控制尚未从 C 版 Tor 移植过来这件未完成的工作。文末补上中国境内与海外华人视角的四点提醒。"
---

# 从零打造 Android 上的 Tor VPN，Beta 一年下来学到的事

!!! info ""

    以下内容整理翻译自这篇文章，叙述主语为 Tor Project：

    - [Tor VPN Beta: What we've learned building our own VPN for Android from scratch | September 9, 2026](https://blog.torproject.org/tor-vpn-beta/){target="_blank"}，作者 pavel

![Tor VPN beta 的主视觉，左侧写着已可在 download.torproject.org 取得，下方是 F-Droid 与 Google Play 的下载徽章，右侧手机显示已连接界面与上下行流量](https://forum.torproject.org/uploads/default/original/2X/1/1705e443e3cb9fe39eedf2432cf559090323d6fe.png){style="border-radius: 10px;"}

Tor Browser[^tor-browser] 多年来是保护隐私与绕过审查最有效的工具之一，而现在多数人上网的入口是各自惯用的 app，不是浏览器。把同一套保护延伸到通讯软件、社交与电子邮件，是 Tor Project 的用户研究里反复出现的要求，用户想要一个简单的方式保护整台设备。Tor VPN 的构想在 2021 年因此成形，第一个平台选 Android，那里的需求最强烈，也最能触及受审查地区的用户。

Tor VPN Beta 作为第一个版本推出时就预期要从真实使用中学习，去年秋天限量发布之后，最主要的使用场景很快清楚起来，用户要的是解除封锁。发布至今的开发与用户支持优先顺序因此跟着调整，产品往后的方向也一样。

<!-- more -->

![两台手机并排，左边是 Tor VPN 的连接界面显示上行 103.4 MB 与下行 398.7 MB，右边是 Apps 界面，Tor-powered apps 分区列出 OnionShare 与 Orbot，浏览器与其他 app 各有独立开关，Signal、WhatsApp 已开启，OONI Probe、Thunderbird 未开启](https://forum.torproject.org/uploads/default/original/2X/3/3019334ddba9f2b40c00deb06c9c9817ccbf1dc5.png){style="border-radius: 10px;"}

## app 隔离的设计来自 Tor Browser

Tor VPN Beta 底下的模型与商业 VPN 根本不同。设备上每个 app 各自取得一条自己的 Tor circuit（连接路径）[^circuit]，共用同一条通道的做法没有采用，一个 app 的活动因此不容易被关联到另一个 app。这种 app 隔离大量参考了 Tor Browser 的跨站追踪防护，默认就在降低跨 app 的关联，对移动设备来说是设备层网络保护的第一步。

app 层级的控制随版本演进做得更好用。Apps 界面现在可以搜索，要找某一个特定的 app 并决定它是否走 Tor，速度快得多。

![Tor VPN 的 Apps 界面搜索栏，输入 Firefox 之后结果列出 Firefox、Firefox Focus 与 Firefox Nightly 三项，各自带着独立的开关](https://forum.torproject.org/uploads/default/original/2X/5/5bc40ac9fee7460120633665924571f718173ee4.jpeg){style="border-radius: 10px;"}

## 出口选择造成的误用改变了设计

出口选择是一般人熟悉的 VPN 功能，对想绕过审查的用户来说不见得是对的做法。官方把这件事列为开发阶段的可用性测试与早期反馈带来的最重要一课。

最初的方向是让用户对出口选择有更多控制权，设计在纸上看起来很合理，做出来却造成混淆。想绕过封锁的用户去调了出口位置，他们需要的功能是桥接（bridges）[^bridge]。Tor 的运作方式与用户以为的运作方式之间有落差，目前的设计因此要求先把 app 连上 Tor 网络，之后才能选出口。出口选择仍在官方的后续规划里，前提是引入的方式不会在高风险场景下诱发操作错误。

## 用户集中在高度审查的地区

早期的采用集中在高度审查地区，包含伊朗与土库曼斯坦。Tor Browser for Android 的用户分布偏向全球北方，Tor VPN Beta 这边看到的是全球南方用户更深的投入，网络限制对他们是每天要面对的现实。

规避能力的改善力度因此加倍。一个例子是在早期版本之一（1.4.0 beta）优先加入 WebTunnel[^webtunnel] 桥接，它让 Tor 流量看起来像一般的加密网页流量，审查方要检测并封锁连接因此变得更难。桥接支持整体也修掉几个错误、做了几项体验改善，目标是让桥接用起来更可靠。

## 稳定性、可复现构建与 F-Droid

早期发布之后，相当大一部分的工作投入在提升稳定性。Tor VPN 建立在 [Arti 这个以 Rust 撰写的下一代 Tor 实现](https://blog.torproject.org/announcing-arti/){target="_blank"}之上[^arti]，底层换成新的、扎实的技术基础，旧架构上继续打补丁的路没有走。立即可见的好处是可靠性提升，崩溃次数减少，对各种网络状况的处理也更好。

另外投入的两项是把构建做成可复现[^reproducible]，以及把 app 送上 F-Droid[^fdroid]。可复现构建让任何人都能验证手上运行的二进制文件与公开的源代码一致，F-Droid 让用户不必依赖 Google Play 就能安装与更新，对一个以隐私与安全为重的工具来说，两件事都重要。

速度上，Tor VPN Beta 的行为不像为速度优化的商业 VPN，而 [Tor 网络的性能这几年确实提升了](https://blog.torproject.org/congestion-contrl-047/){target="_blank"}，[这些改善也在持续带进移动端的体验](https://gitlab.com/guardianproject/tormobile/arti-mobile){target="_blank"}。C 语言版 Tor 上的部分性能功能，例如拥塞控制（congestion control）[^congestion]，在 Arti 还没有，把这些能力移植过去是接下来的工作之一。

Tor VPN 的 UX 团队负责人与产品经理 Duncan 在文中补充，项目很快就被用户的真实用法推着走，尤其是需要可靠且涵盖整台设备的规避能力的那些人。团队因此把力气放在替移动端的 Tor 打好基础，做成以 Arti 与 [Onionmasq](https://gitlab.torproject.org/ahf/onionmasq){target="_blank"}[^onionmasq] 为核心的模块化 Tor 堆栈，能随真实使用一起演进。这些组件现在可以被多个应用程序重复使用，生态系统的碎片化与长期维护风险都因此降低。官方也写明工作还没结束，Tor Browser 目前仍然是这件事能做到什么程度的标准，让 Tor VPN 随时间逼近那个水准是团队目标的一部分。

## 接下来的方向

Tor VPN Beta 是横跨数年的协作成果。官方在文中感谢 [The Guardian Project](https://guardianproject.info/){target="_blank"}[^guardian] 的指引与关键的低层移动端库，也感谢 LEAP Encryption Access Project[^leap] 的高质量工作，少了任何一方这个 app 都不会问世。[开发持续在公开状态下进行](https://blog.torproject.org/code-audit-tor-vpn/){target="_blank"}，由用户的真实用法塑形。

具体的方向有三个，改善受限环境下的规避能力，把更多性能功能带进 Arti，以及调整用户体验来减少混淆与风险。想参与开发方向的人可以到[改版过的下载页面](https://download.torproject.org/){target="_blank"}，除了下载 APK 或从 Google Play 商店安装，现在也能通过 F-Droid 取得 Tor VPN Beta。

## 中国境内与海外华人视角

**解除封锁这个主要用途，在境内的门槛更高**：Tor 的公开入口地址在中国境内长期无法直接连上，连不上要处理的是桥接，出口位置解决的是另一件事。可用性测试里出现的那种误用，在这里的代价更高，因为尝试的机会本来就有限。文章里写的 1.4.0 beta 优先补上的 WebTunnel，正是为会针对 Tor 特征过滤的网络准备的传输方式。桥接类型的说明见 [Tor Snowflake 桥接点建立](../../tools/tor-snowflake.md)，境内公开表达的整体考虑见[在中国大陆的公开平台传播信息](../../scenarios/mainland-speech.md)。

**安装渠道的差别是实际的**：Google Play 在中国境内不可用，官方这次把 F-Droid 与 APK 直接下载都补上，对取不到 Play 的人是能落地的差别。同时要有准备，下载站点本身也可能不可达，在网络还通的时候先取得安装包并核对官方签名，比事后再想办法可靠得多。

**Beta 警语在这里的分量更重**：官方支持文件写明可能泄漏信息、不应用于任何敏感用途[^torvpn-about]。在把使用规避工具本身就视为风险的环境里，工具的成熟度直接关系到人身安全。高敏感的事情仍然用 [Tor Browser](../../tools/what-is-tor.md) 或 Tails[^tails]，选择之前先对齐自己的威胁模型，见[威胁模型如何建立](../../basics/threat-model.md)。安全审计的结果见 [Cure53 完成 Tor VPN 安全审计](./2026-code-audit-for-tor-vpn-completed-by-cure53.md)，工具之间的取舍比较见 [VPN 的风险与选择](../../tools/vpn-guide.md)。

**海外使用简体中文的读者会遇到相反方向的问题**：日常需要连回境内服务时，Tor 的出口 IP 经常被风控直接拒绝。逐 app 开关正好用在这种混用场景，需要匿名的 app 走 Tor，需要连回境内服务的 app 留在正常网络，跨 app 的关联因此降低，代价是这份名单要自己维护。搭配出行的整体准备见[出差与研讨会的数字准备](../../scenarios/asia-travel.md)。

!!! info "参考资料"

    - 原文全文：[Tor VPN Beta: What we've learned building our own VPN for Android from scratch](https://blog.torproject.org/tor-vpn-beta/){target="_blank"}，Tor Project 官方博客，2026 年 9 月 9 日
    - 图片来源：[Tor Project 官方论坛的同一篇讨论帖](https://forum.torproject.org/t/tor-vpn-beta-what-weve-learned-building-our-own-vpn-for-android-from-scratch/22104){target="_blank"}，本篇引用论坛上的原始尺寸文件

[^tor-browser]: Tor Browser 是 Tor Project 维护的浏览器，以 Firefox ESR 为基础，连接经由 Tor 网络送出，并内置跨站追踪隔离与浏览器指纹一致化。站内介绍见[什么是 Tor](../../tools/what-is-tor.md)，官方下载页见 [Download Tor Browser](https://www.torproject.org/download/){target="_blank"} - Tor Project。查证日 2026-09-11。
[^circuit]: Tor circuit（连接路径）是流量在 Tor 网络里经过的一组中继，通常由入口、中间与出口三个节点组成，每一段各自加密。单一节点只知道相邻的前后一段，没有任何一个节点同时掌握来源与目的地。站内说明见[什么是 Tor](../../tools/what-is-tor.md)。
[^bridge]: 桥接（bridge）是没有公开列在 Tor 目录里的入口中继。公开的入口 IP 被封锁时，改用桥接仍然连得上 Tor 网络，取得方式与可用类型见 [桥接](https://support.torproject.org/zh-CN/bridges/){target="_blank"} - Tor Project 官方支持文件。查证日 2026-09-11。
[^webtunnel]: WebTunnel 是一种可插拔传输（pluggable transport），把 Tor 流量包进 HTTPS 连接里，在网络上看起来像连往一般网站，适合用在会针对 Tor 特征过滤的网络。站内的搭建教程见[如何搭建 Tor WebTunnel 桥接](../../community/setup-tor-webtunnel.md)，设计说明见 [Hiding in plain sight: Introducing WebTunnel](https://blog.torproject.org/introducing-webtunnel-evading-censorship-by-hiding-in-plain-sight/){target="_blank"} - Tor Project 博客，2024 年 3 月 12 日。查证日 2026-09-11。
[^arti]: Arti 是 Tor Project 以 Rust 从头撰写的 Tor 实现，用来接手 C 语言版 tor 的角色。它以库为主要形式，方便被其他软件嵌进去使用，Tor VPN 的底层就是它。站内的版本记录见 [Arti 更新日志](../../changelog/arti.md)，源代码见 [arti](https://gitlab.torproject.org/tpo/core/arti){target="_blank"} - Tor Project GitLab。查证日 2026-09-11。
[^reproducible]: 可复现构建（reproducible builds）指同一份源代码在不同机器、不同时间构建，都产生比特完全相同的成品。任何人因此可以自行构建一次，比对哈希值，确认手上的可执行文件确实来自公开的那份源代码。说明见 [Reproducible Builds](https://reproducible-builds.org/){target="_blank"} - Reproducible Builds 项目。查证日 2026-09-11。
[^fdroid]: F-Droid 是 Android 上的自由软件应用商店，收录的 app 由 F-Droid 自行从源代码构建，安装与更新都不需要 Google 账号。Tor VPN Beta 的页面见 [Tor VPN Beta on F-Droid](https://f-droid.org/en/packages/org.torproject.vpn/){target="_blank"} - F-Droid。查证日 2026-09-11。
[^congestion]: 拥塞控制（congestion control）是 Tor 0.4.7 引入的流量控制机制，让连接依实际网络状况调整发送速率，降低排队造成的延迟。说明见 [Congestion Control Arrives in Tor 0.4.7-stable!](https://blog.torproject.org/congestion-contrl-047/){target="_blank"} - Tor Project 博客，2022 年 5 月 4 日。查证日 2026-09-11。
[^onionmasq]: Onionmasq 是以 Rust 撰写的隧道接口，拦截设备或单个 app 的 TCP、UDP 与 DNS 流量并改由 Tor 送出，Tor VPN 的网络层就是它。站内介绍见 [OnionMasq 的流量隔离实验](./tor-sambent-onionmasq.md)，源代码见 [onionmasq](https://gitlab.torproject.org/tpo/core/onionmasq){target="_blank"} - Tor Project GitLab。查证日 2026-09-11。
[^guardian]: The Guardian Project 是专做移动设备隐私工具的组织，Orbot 与 Android 上多个低层网络库都出自他们，与 Tor Project 长期合作。组织介绍见 [Guardian Project](https://guardianproject.info/){target="_blank"}。查证日 2026-09-11。
[^leap]: LEAP Encryption Access Project 是开发加密通讯工具的自由软件团队，主要产品是 LEAP VPN，一套针对受审查环境设计的开源白标 VPN，RiseupVPN 与 Bitmask 共用它的代码基础。组织介绍见 [LEAP](https://leap.se/){target="_blank"}。查证日 2026-09-11。
[^tails]: Tails 是从 U 盘启动的操作系统，所有对外连接经由 Tor，关机后不在电脑上留下痕迹。站内介绍见[什么是 Tails](../../tools/what-is-tails.md)，官方网站见 [Tails](https://tails.net/){target="_blank"}。查证日 2026-09-11。
[^torvpn-about]: Beta 警语的出处。[About Tor VPN](https://support.torproject.org/tor-vpn/getting-started/about-tor-vpn/){target="_blank"} - Tor Project 官方支持文件。查证日 2026-09-11。
