---
title: 出国的手机号与网络连接
description: 出国时用原号码漫游、旅游 eSIM 或当地 SIM 卡，各自由谁登记你的身份、流量从哪个国家或地区出去、当地网络看得到什么，以及依需求怎么选。加上双卡手机的两个号码、酒店 Wi-Fi 的暴露面，以及旅行路由器能挡掉与挡不掉的部分。
icon: material/sim-outline
---

# :material-sim-outline: 出国的手机号与网络连接

出国前选号码，多数人比较的是价格与信号。同一个选择也决定了谁登记你的身份、你的网络流量从哪个国家或地区出去，以及哪一地的网站过滤与记录留存管得到你。到了酒店与会场，Wi-Fi 又是另一层，你带的每一台设备都会在那个网络上留下名称。

本页从技术面整理这两层，适用任何目的地，也不限定你从哪里出发。各地的 SIM 实名规定、审查现况与入境查机，整理在 [出差与研讨会的数字准备](./asia-travel.md)，目的地的风险高低先看那一页的对照表。

!!! tip "出发前先做这三件事"

    1. 依下方〈怎么选〉决定这趟用哪一种号码
    2. 手机与笔记本电脑的设备名称改成不含真实姓名，做法见〈设备名称〉
    3. 能换掉的两步验证，从短信换成验证 App 或 passkey，做法见〈双卡手机的两个号码〉

    到了当地之后，关掉 Wi-Fi 查一次自己的出口在哪个国家或地区，做法见〈到了之后查一次出口〉。

## 先认识三个词

- **出口**：你的网络流量最后从哪一家运营商、哪个国家或地区连上互联网。网站看到的是出口那一端的 IP 地址，所以出口在哪里，你在网站眼中就在哪里，那个国家或地区的网站过滤与记录规定也管得到这段流量
- **IMSI**：SIM 卡里的一组识别码，电信网络用它认出「这是哪一个号码的用户」。它跟电话号码是两组不同的编号，但都指向同一个人
- **IMEI**：手机本身的硬件识别码，每一部手机一组。换 SIM 卡不会换掉它

## 三种号码，流量各自怎么走

### 原号码漫游

数据漫游的主要做法是「归属地路由」（home-routed），你的流量经由运营商之间的专用网络回到原号码的运营商，再从原号码所在的国家或地区连上互联网[^rfc7445]。出口在原本所在地，网站看到的你人还在那里，目的地的网站过滤多半管不到，速度则会因为绕路而慢一些。多数运营商的官方说明没有写明漫游上网的出口在哪里，到了当地自己查一次最准。

流量回到原本的运营商再出去，所以原本所在地的网站过滤与记录留存，漫游时仍然适用。从网站过滤较严的地方出发，例如中国大陆的号码出境漫游，那一层过滤会跟着你走，记录也留在原本的运营商手上。

出口在原本所在地，不代表目的地看不到你。手机连的仍然是当地电信运营商的基站，当地运营商知道你的 IMSI、IMEI，以及你在哪一座基站附近[^3gpp-attach]。一般的电话与短信经过当地网络。移动通信的国际标准要求当地运营商具备监听入境漫游用户的能力，被列为监听对象的漫游用户进出当地网络时要能通知执法机关，也要能在不经原号码运营商协助的情况下提供位置[^3gpp-li]。实际会不会用、用在谁身上，依各国法律与程序而定。

Signal、微信这类 App 的通话与消息走的是网络，传输有加密，当地网络看得到的是你在使用网络、用了多少流量，看不到内容。服务提供方读不读得到内容是另一回事，只有端对端加密的 App 才读不到，差别见 [匿名通讯工具比较](../tools/messaging-comparison.md)。

### 旅游 eSIM

旅游 eSIM 多半也是漫游，只是「归属网络」换成了卖家合作的电信公司，那家公司可能在第三个国家或地区，出口就在那里。Holafly 的官方说明写着，部分合作伙伴会从自有的基础设施分配 IP 地址，跟你人在哪里无关[^holafly]。

Northeastern University 的研究团队在美国实测了一批旅游 eSIM，发表在 2025 年的 USENIX Security[^esim-paper]。几乎每一张的出口都不在使用者所在地，多数落在第三国。测量当时，总部在爱尔兰的 Holafly 与中国移动旗下的 CMLink，出口都在中国移动国际（China Mobile International）的网络，路由经过香港。出口那一家运营商负责把你的流量送上互联网，你连到哪里、何时连接都经过它。那是单一地点、单一时期的测量，运营商的合作对象会换，结果不能直接套用到今天。

同一份研究也记录了卖家拿得到什么。多数卖你 eSIM 的网站或 App 是转售商，向电信运营商批发之后转卖。研究团队只用一个 email 与付款方式就成为转售商，平台会提供每一张使用中 eSIM 的 IMSI 与号码，其中一个平台还提供设备的大致位置，实测有时误差在 800 米内。转售商也能主动对使用者发送短信。

旅游 eSIM 免去了当地实名，换来的是一条你看不清楚的路径。可以做的有几件：

- 购买前看卖家的说明页有没有写合作运营商或出口国家，没写的话，到了当地自己查一次出口
- 账号用的 email 与付款方式，就是这张 eSIM 对到你本人的线索，介意的话用不跟主要身份绑在一起的 email
- 安装用的二维码只从卖家官方取得。手机设置里的蜂窝网络或 SIM 卡列表，偶尔看一下有没有自己没装过的 eSIM
- 很多 eSIM 只能安装一次，删除之后就无法重新安装，行程结束之前不要删

实名的要求也开始延伸到 eSIM，日本已修法把纯数据 SIM 与 eSIM 纳入身份确认，出发前查目的地的当下规定。

### 当地 SIM 卡

当地 SIM 卡的流量直接从当地运营商出去，出口在当地。当地的网站过滤、记录留存与执法调取，跟当地居民一样全部适用。办卡多半要用护照实名登记，部分地方还要人脸，等于把护照与号码一起送进当地运营商与政府的数据库。

### 三种方式对照

| | 原号码漫游 | 旅游 eSIM | 当地 SIM 卡 |
|---|---|---|---|
| 谁登记你的身份 | 原号码的运营商 | eSIM 卖家（email 与付款） | 当地运营商，通常用护照 |
| 出口 | 通常是原号码所在的国家或地区 | 常常是第三国，卖家多半不说明 | 当地 |
| 网站过滤 | 目的地的多半管不到，原所在地的仍然适用 | 看出口在哪里 | 当地的全部适用 |
| 当地电信网络看得到 | IMSI、IMEI、位置、一般电话与短信 | 同左 | 同左，再加上全部的上网记录 |
| 经手的运营商 | 原号码的运营商与当地运营商 | 卖家、合作运营商、当地运营商，可能跨三个国家或地区 | 当地运营商 |
| 费用与方便 | 最贵，不必换卡，原号码照常收短信 | 便宜，出发前在手机上安装 | 便宜，有当地号码，要到门店或柜台办 |

三种方式在当地电信网络那一行都一样。只要手机连上当地的基站，位置与 IMEI 就在当地运营商手上，换哪一种号码都改变不了。想让当地基站完全看不到这部手机，只能开飞行模式，代价是收不到电话与短信。

## 怎么选

依这趟最需要的东西来选：

- 一定要收原号码的短信验证码，例如银行，或行程只有两三天、不想多花心思：原号码漫游
- 主要是上网，想控制费用：旅游 eSIM。原号码要不要同时开着，见下一节
- 需要当地号码打车、订餐厅、让主办单位联系：当地 SIM 卡，接受护照实名这个代价
- 目的地在 [出差与研讨会的数字准备](./asia-travel.md) 对照表里属于高风险：先读那一页对应的分层准备，号码的选择只是其中一项

常见的组合是旅游 eSIM 上网，原号码开着收短信。好处是两边都顾到，代价是原号码也连在当地网络上，可能另外产生漫游费用。

## 双卡手机的两个号码

用旅游 eSIM 上网时，原号码如果还开着，两个号码都连在当地网络上，都收得到电话与短信[^apple-esim-travel]。关掉原号码，就收不到发到这个号码的短信验证码。

出发前能换的先换。Google、Apple、社群账号这类支持验证 App 或 passkey 的服务，把两步验证从短信换掉，关掉原号码也不会被锁在账号外面。验证 App 是在手机上每 30 秒生成一组数字的 App，passkey 是存在手机或密码管理器里的登录凭证，两者都不需要收短信，差别见 [什么是 passkey](../tools/what-is-passkey.md)，各账号的检查位置见 [手机隐私设置逐步指引](../tools/phone-privacy-settings.md#9-账号的登录保护)。银行这类只能收短信的服务换不掉，就让原号码开着。

原号码要关掉时：

=== "iPhone"

    打开「设置」>「蜂窝网络」，点原号码，关闭「启用此号码」[^apple-esim-travel]。

    iMessage 与 FaceTime 走网络，原号码关掉之后，仍然可以用原号码的身份收发[^apple-esim-travel]。

=== "Android"

    打开设置里管理 SIM 卡的页面（Pixel 在网络与互联网的设置下），点原号码，关闭使用这张 SIM 卡的开关。

    其他品牌搜索「SIM」。

=== "Samsung Galaxy"

    搜索「SIM 卡管理」，点原号码，把它关闭。

关掉的号码不再连上当地网络，研究团队在测试环境里也观察到，停用的 eSIM 会向网络注销[^esim-paper]。

## 到了之后查一次出口

先关掉 Wi-Fi，确认手机走的是移动网络，再用浏览器打开 [ipinfo.io](https://ipinfo.io/what-is-my-ip){target="_blank"} 或 [ifconfig.co](https://ifconfig.co/){target="_blank"}，看 IP 地址属于哪个国家或地区、哪一家运营商。两个网站用的地理数据库不同，判断的国家偶尔不一致，运营商名称比国家更能说明流量经过谁。

查到的结果怎么看：

- 原号码漫游查到原号码所在的国家或地区，符合预期。原所在地的网站过滤与记录留存仍然适用
- 旅游 eSIM 查到第三国，代表那个国家或地区的运营商经手你的流量。网页与 App 的内容多半有加密，对方看得到的是你连到哪些网站与何时连接
- 不希望那一家运营商看到这些时，开启 VPN，出口就换成 VPN 业者，再查一次确认。怎么挑 VPN 见 [VPN 的风险与选择](../tools/vpn-guide.md)

连上酒店 Wi-Fi 之后也照同样方式查一次。

## 设备名称

手机的名称会显示在蓝牙、隔空投送（AirDrop）与个人热点上，iPhone 的个人热点名称就是设备名称[^apple-hotspot]。电脑连上 Wi-Fi 时，Windows 会把电脑名称交给网络[^ms-dhcp]，Mac 会用电脑名称让同一个网络上的其他设备认出它[^mac-hostname]。Android 15 起，每个 Wi-Fi 网络有一个「发送设备名称」的开关，原生 Android 的默认是开启[^aosp-hostname]。

很多人的手机与电脑名称就是自己的名字。Microsoft 的说明也写到，默认设备名称可能透露设备类型或用户的信息，带来安全风险[^ms-rename]。出发前全部改成不含真实姓名的名称：

- 手机：见 [手机隐私设置逐步指引](../tools/phone-privacy-settings.md#2-设备名称)，同一步也会关掉 Android 的「发送设备名称」
- Windows：打开「设置」>「系统」>「关于」，选「重命名此电脑」，改完重新启动[^ms-rename]
- Mac：选取苹果菜单 >「系统设置」，点边栏中的「通用」>「关于本机」，修改电脑的名称[^mac-hostname]

## 酒店与会场的 Wi-Fi

酒店的 Wi-Fi 可以用，留意下面几件事就好。

多数网站与 App 的连接已经加密，美国联邦贸易委员会（FTC）因此认为使用公共 Wi-Fi 通常是安全的，主要的风险在假冒的网站[^ftc-wifi]。加密保护的是内容，酒店网络仍然看得到你连到哪些网站、何时连接。

同一个酒店网络上还有其他房客的设备。有些网络会阻挡同网络的设备互相连接，这叫「客户端隔离」，但 2026 年的一份研究测试了多款路由器与网络，每一个都至少有一种方法可以绕过[^airsnitch]。所以电脑上的文件共享功能（Windows 的「网络发现」与「文件与打印机共享」、Mac 的「文件共享」）出门前关掉，同网络的人才读不到你共享出来的文件夹[^cisa-wireless]。

FBI 对酒店 Wi-Fi 的提醒[^fbi-hotel]还有两件事：

- 跟前台确认酒店官方的网络名称。有人会架一个名称相近的假 Wi-Fi，连上去之后流量都经过对方
- 不用的时候关闭蓝牙，以及手机与电脑可被附近设备发现的设置

用房号与姓名登录的认证页面，会把你这台设备跟入住资料连在一起。设备连 Wi-Fi 时用的是网卡的硬件地址（MAC 地址），手机默认会对每个网络换一组随机的地址，所以认证页记到的是这组随机地址加上你的房号。

## 旅行路由器

旅行路由器是一台手掌大小的无线路由器。它连上酒店的 Wi-Fi，再发出一个你自己的 Wi-Fi，手机、笔记本电脑、平板改连这个自己的 Wi-Fi。

### 什么情况值得带

在酒店房间或固定的会场待得久、一次带两三台设备用 Wi-Fi 的人最用得上。行程大多在外面走动、主要靠手机移动网络的人，路由器帮得上的地方不多，做好手机设置比较实际。

### 能挡掉的部分

- 酒店网络只看到路由器一台设备，你的手机、笔记本电脑各自的名称与地址留在路由器后面。以常见的 GL.iNet 机种为例，默认模式会替你的设备隔出一个独立的小网络，挡在酒店网络与你的设备之间[^glinet-repeater]
- 同一个酒店网络上的其他房客，连不到路由器后面的设备
- 认证页面只需要登录一次，不会每一台设备各留一笔记录
- 在路由器上设置 VPN，后面的设备全部经过 VPN，包括电子书阅读器这类不能自己装 VPN 的设备

以下用 GL.iNet 的官方文档当例子，因为它的酒店使用情境写得最完整，不代表推荐这个品牌，其他品牌多半有对应的功能。

### 出发前要设置好的部分

- 更新路由器的系统软件（固件），改掉默认的 Wi-Fi 名称与密码。默认的 Wi-Fi 名称多半带着品牌与型号，印在机身底部的标签上[^glinet-setup]
- 设置一组够长的管理密码，用来进入路由器的设置页
- 设置 VPN。路由器上用的是 WireGuard 或 OpenVPN 这两种 VPN 协议，多数 VPN 业者的网站可以下载对应的配置文件，上传到路由器即可。VPN 账号要另外向 VPN 业者申请
- 开启 kill switch，意思是 VPN 断线时，路由器挡下所有连接，不让设备改走酒店网络直接连出去。GL.iNet 4.8 版之后的固件，VPN 启用时默认会开启[^glinet-killswitch]。出发前在家把 VPN 连接关掉试一次，设备应该全部连不上网络

有些酒店只允许每个房间连两台设备，用的是 MAC 地址来数。路由器可以复制手机的 MAC 地址，让酒店以为连上的是那部手机，就不会被挡[^glinet-portal]。

### 认证页面的处理

酒店的认证页面要在一般的网页连接下才能显示，VPN 开着时常常打不开。GL.iNet 的做法是暂时切到公共热点登录模式，官方文档写明这段时间你的网络活动可能被酒店或商场看到[^glinet-portal]。所以顺序是：

1. 用手机连上路由器，打开浏览器，跳出酒店的认证页面就登录
2. 登录完成后，立刻在路由器的设置页开回 VPN
3. 照〈到了之后查一次出口〉查一次，确认出口是 VPN 业者

### 挡不掉的部分

- 手机的移动网络。手机只要开着移动网络，就照样连在当地的基站上，位置与 IMEI 都在当地运营商手上
- 手机在 Wi-Fi 信号差时自动改用移动数据。在房间里想确保上网只走路由器，关掉移动数据就好。想连当地基站都不连，开飞行模式之后再把 Wi-Fi 打开，代价是收不到电话与短信
- 蓝牙。路由器只处理 Wi-Fi，蓝牙设备名称仍然会被附近的人看到
- VPN 业者。流量经过 VPN 之后，看得到连接记录的从酒店换成 VPN 业者
- 过境检查。预先设好 VPN 的路由器在检查时一看就知道是连接工具。入境查机风险高的地方，见 [出差与研讨会的数字准备](./asia-travel.md) 对照表的入境装置检查一栏

路由器整天放在房间里没人看管，理论上有被人改装的可能。一般出差的概率很低，前往高风险地方时，出门带着走。

## 出发前的检查

- 依〈怎么选〉决定这趟用哪一种号码，旅游 eSIM 先看卖家有没有说明合作运营商
- 能换的两步验证从短信换成验证 App 或 passkey
- 手机与电脑的设备名称改成不含真实姓名，电脑的文件共享关掉
- 带旅行路由器的话，更新固件、改掉默认名称与密码、设好 VPN 与 kill switch，在家实测一次
- 到了之后，移动网络、酒店 Wi-Fi、VPN 各查一次出口

## 相关阅读

- [出差与研讨会的数字准备](./asia-travel.md)：十四地的审查、VPN 与 Tor 可达性、SIM 实名与入境查机，以及干净机的取舍
- [出国前数字安全：用 AI 自助生成目的地概况](./travel-ai-briefing.md)：任何目的地都适用的行前概况生成方式
- [手机隐私设置逐步指引](../tools/phone-privacy-settings.md)：出发前先把手机的基本设置做完
- [VPN 的风险与选择](../tools/vpn-guide.md)：在酒店与路由器上用 VPN 之前，先挑一家值得信任的业者
- [Metadata 是什么，为什么重要](../basics/metadata.md)：内容加密之后，电信网络仍然看得到的那一层

[^rfc7445]: [RFC 7445: Analysis of Failure Cases in IPv6 Roaming Scenarios](https://www.rfc-editor.org/rfc/rfc7445.html){target="_blank"} - IETF（2015）。第 2.1.1 节说明归属地路由模式下，设备的 IP 由归属网络分配，流量全部回到归属网络，是国际数据漫游的主要模式。
[^3gpp-attach]: [3GPP TS 23.401](https://www.3gpp.org/ftp/Specs/archive/23_series/23.401/){target="_blank"} - 3GPP。第 5.3.2.1 节，手机注册网络时由网络端取得设备识别码。
[^3gpp-li]: [3GPP TS 33.126](https://www.3gpp.org/ftp/Specs/archive/33_series/33.126/){target="_blank"} - 3GPP。第 6.3 节的 R6.3-110、R6.3-130、R6.3-330，分别是当地运营商监听入境漫游用户、监听对象进出网络时通知执法机关、依执法授权自行提供位置的能力要求。
[^holafly]: [流量路由機制：我們如何保障您海外行動數據的安全](https://esim.holafly.com/zh/faq/about-esims/traffic-routing/){target="_blank"} - Holafly（正体中文页面，官方没有简体中文版）。
[^esim-paper]: Motallebighomi、Veara、Bitsikas、Ranganathan，[eSIMplicity or eSIMplification? Privacy and Security Risks in the eSIM Ecosystem](https://www.usenix.org/conference/usenixsecurity25/presentation/motallebighomi){target="_blank"} - USENIX Security 2025。测量在美国单一地点进行四个月，出口 IP 的归属见论文的 Table 1。原文的位置误差写作 0.5 英里。
[^apple-esim-travel]: [出境旅行时在 iPhone 上使用 eSIM](https://support.apple.com/zh-cn/118227){target="_blank"} - Apple 支持。
[^apple-hotspot]: [共享 iPhone 的互联网连接](https://support.apple.com/zh-cn/guide/iphone/iph45447ca6/ios){target="_blank"} - iPhone 使用手册。
[^aosp-hostname]: [WifiConfiguration.java](https://android.googlesource.com/platform/packages/modules/Wifi/+/refs/heads/main/framework/java/android/net/wifi/WifiConfiguration.java){target="_blank"} - Android 开放源代码项目，`mIsSendDhcpHostnameEnabled` 的默认值为 `true`。手机厂商可以改变默认值，GrapheneOS 在 [2024 年 10 月的版本](https://grapheneos.org/releases){target="_blank"} 把它改成默认关闭。
[^ms-dhcp]: [MS-DHCPE Appendix A](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-dhcpe/73d899d4-6978-4328-a151-5d20f3ef8271){target="_blank"} - Microsoft。DHCP 客户端在请求 IP 地址时送出主机名。
[^ms-rename]: [重命名 Windows 设备](https://support.microsoft.com/zh-cn/help/4558981){target="_blank"} - Microsoft 支持。
[^mac-hostname]: [在 Mac 上更改电脑的名称或本地主机名](https://support.apple.com/zh-cn/guide/mac-help/mchlp2322/mac){target="_blank"} - Mac 使用手册。
[^ftc-wifi]: [Are Public Wi-Fi Networks Safe? What You Need To Know](https://consumer.ftc.gov/articles/are-public-wi-fi-networks-safe-what-you-need-know){target="_blank"} - FTC。
[^airsnitch]: [AirSnitch: Demystifying and Breaking Client Isolation in Wi-Fi Networks](https://ndss-symposium.org/ndss-paper/airsnitch-demystifying-and-breaking-client-isolation-in-wi-fi-networks/){target="_blank"} - NDSS 2026。
[^cisa-wireless]: [Using Wireless Technology Securely](https://www.cisa.gov/sites/default/files/publications/Wireless-Security.pdf){target="_blank"} - CISA。
[^fbi-hotel]: [A COVID 19-Driven Increase in Telework from Hotels Could Pose a Cyber Security Risk for Guests](https://www.ic3.gov/PSA/2020/PSA201006){target="_blank"} - FBI IC3（2020）。
[^glinet-repeater]: [Repeater](https://docs.gl-inet.com/router/en/4/interface_guide/internet_repeater/){target="_blank"} - GL.iNet 文档。
[^glinet-setup]: [First time setup](https://docs.gl-inet.com/router/en/4/faq/first_time_setup/){target="_blank"} - GL.iNet 文档。
[^glinet-killswitch]: [VPN Kill Switch](https://docs.gl-inet.com/router/en/4/faq/block_non_vpn_traffic/){target="_blank"} - GL.iNet 文档。
[^glinet-portal]: [Connect to public hotspot with Captive Portal](https://docs.gl-inet.com/router/en/4/faq/connect_to_a_hotspot_with_captive_portal/){target="_blank"} - GL.iNet 文档。
