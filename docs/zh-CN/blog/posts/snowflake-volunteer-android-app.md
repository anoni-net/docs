---
date: 2026-08-05
authors:
    - anoni-net
categories:
    - 更新
    - Tor
    - 翻译文章
slug: snowflake-volunteer-android-app
image: "assets/images/tor.webp"
summary: "Tor Project 8 月发文介绍 4 月上架的 Snowflake Volunteer，把贡献 Snowflake 志愿者桥接做成一支 Android App，志愿者桥接数单月成长 29%。文末说明什么情况下适合用这支 App。"
description: "翻译 Tor Project 官方公告，介绍 Snowflake Volunteer 这支 Android App：开发背景、如何运作、上线后的成长数字，以及什么情况下适合用手机贡献 Snowflake 桥接。"
---

# Snowflake Volunteer：Tor Project 推出手机志愿者桥接 App

!!! info ""

    以下内容改写自 Tor Project 官方部落格文章，主语角色为 Tor Project 与文章作者 Pavel：

    - [Snowflake Volunteer, an Android app to help people bypass censorship | August 3, 2026](https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/){target="_blank"}

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/c/c9143874b416a1c6e0d676145c11846ad63bad39.jpeg" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/c/c9143874b416a1c6e0d676145c11846ad63bad39.jpeg"
            alt="Snowflake Volunteer 官方宣传图，画面中多支手机显示 App 的启用开关、设置选项与统计画面"
            style="border-radius: 10px;">
    </a>
    <figcaption>图片来源：<a target="_blank" href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/">Tor Project Blog</a>。</figcaption>
</figure>

我们在[伊朗封网后的那篇](iran-blackout-webtunnel.md)提过，[Snowflake](../../tools/tor-snowflake.md) 是帮人连上 Tor 门槛最低的方式：开一个浏览器标签页放着不动，就是在帮忙转发流量。2026 年 8 月 3 日，Tor Project 发文介绍 4 月已经上架的 Snowflake Volunteer，把「贡献志愿者桥接」做成一支独立的 Android App，门槛又降了一阶。过去要贡献 Snowflake 桥接，需通过浏览器扩展、网站内嵌 widget、桌面版命令行工具，或 Android 上的 [Orbot Kindness Mode](https://orbot.app/en/kindness/){target="_blank"}。新 App 只做这一件事，界面与设置都只为此设计。

<!-- more -->

## 为什么需要一支独立的 App

Snowflake 的运作原理，是把用户的流量伪装成视频通话，再通过志愿者提供的临时连接转发，让审查者更难侦测与封锁。机制要运作得好，需要大量稳定在线的志愿者桥接。2026 年上半年，Snowflake 的媒合服务器（broker）平均每天约有 146,000 个不重复志愿者桥接 IP 地址回报[^1]，其中约三分之一来自 Orbot 的 Kindness Mode，它会显示自己的设备协助过多少条连接，让贡献变得具体可见。

葡萄牙的 Android App 工作室 [Bloco](https://www.bloco.io/){target="_blank"} 先前参与 [OONI](https://ooni.org/){target="_blank"}（Open Observatory of Network Interference，网络干扰开放观测，拥有全球最大的网络审查开放数据集）的合作，看到 NGO 与行动者高度依赖反审查工具维持安全与连接。他们发现贡献 Snowflake 桥接的门槛不高，想以自身专业回馈这个开源项目，注意到 Kindness Mode 贡献的比重后，好奇一支「只做志愿者桥接」的独立 App 能不能吸引更多人参与，于是主动接洽 Tor 的反审查团队。对方本来就有类似计划，只是尚无余力着手，这个任务便交给了 Bloco。

## App 的功能

Bloco 站在 [Guardian Project](https://guardianproject.info){target="_blank"} 既有的移动端 Tor 生态基础上开发，特别是函式库 [IPtProxy](https://github.com/tladesignz/IPtProxy){target="_blank"}，它把移动 App 串接 Tor 所需的工具与 pluggable transport（可插拔传输，让流量伪装成其他外观以规避审查的技术模块）打包在一起。有了这些现成元件，Bloco 可以把心力放在后台稳定运作与省电、让用户看得懂并能照自己的网络状况正确设置，以及用统计数字持续呈现志愿者协助了多少连接。

成果是 Snowflake Volunteer：用户可以设置让它在后台执行、只在 Wi-Fi 等非计量网络下运作、只在充电时运作，也可以设置同时协助的连接数上限。启用后，App 会自动与需要 Snowflake 桥接的用户配对，协助把对方的连接导向 Tor 网络，过程中双方互不知道彼此身份。

浏览器标签页版本的 Snowflake 在手机上有已知限制：标签页进入后台后，Android 系统经常会直接中断 WebRTC 连接，长时间贡献一直都建议改用台式机或笔电。Snowflake Volunteer 是独立 App，用的是 Android 允许持续执行的后台服务，不受标签页被系统回收的限制，正是手机能长期贡献的关键差异。

<figure markdown="span">
    <a href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png" target="_blank">
        <img src="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png"
            alt="Snowflake Volunteer App 三个画面的截图：启用中的主画面显示帮助人数与流量统计、设置页可调整后台运行与限制 Wi-Fi 或充电时运行、统计页列出逐日的连接数与流量"
            style="border-radius: 10px;">
    </a>
    <figcaption>App 的主画面、设置页与统计页截图。图片来源：<a target="_blank" href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/">Tor Project Blog</a>。</figcaption>
</figure>

## 上线后的成效

Snowflake Volunteer 经过一段社群测试与意见反馈后，于 4 月正式在 [F-Droid](https://f-droid.org/en/packages/io.bloco.snowflake/){target="_blank"} 与 [Google Play](https://play.google.com/store/apps/details?id=io.bloco.snowflake){target="_blank"} 上架。5 月平均每天约 1,300 个不重复志愿者桥接 IP，6 月成长到约 1,700 个，单月成长 29%，单日峰值曾超过 2,100 个桥接。相对于整体约 146,000 个桥接的规模，这批新增志愿者还只是一小块，但原本并不在池子里，多半是过去被浏览器标签页版本挡在门外的手机用户。

App 目前支持 8 种语言（英文、法文、德文、日文、葡萄牙文、土耳其文、越南文，以及简体中文），这些语言版本来自社群本地化志愿者的贡献。想协助支持更多语言，可以到 [Weblate 项目页](https://hosted.weblate.org/projects/snowflake-volunteers/){target="_blank"}，或先读 [Tor 的本地化流程说明](https://community.torproject.org/localization/){target="_blank"}。

## 什么情况下适合用这支 App

[Tor Snowflake 桥接点](../../tools/tor-snowflake.md) 页面已经说明过用浏览器贡献 Snowflake 桥接的风险，这支 App 改变的只是安装方式，判断原则不变。安装它，表示设备会替审查地区的用户转发 Tor 流量，实际运作上有几件事值得先知道：对外网站看到的是 Tor 出口节点，不是你的 IP，你自己也看不到流量内容，因为流量在转发前已经被 Tor 加密。预设设置下对日常网络使用几乎无感，勾选只在 Wi-Fi、只在充电时运作，就不会动用移动网络的流量或电量。在公司或校园网络上执行，等于把那个网络的 IP 用来转发第三方流量，信息政策严格的环境建议先问过信息部门。

如果你人在中国大陆，自身的网络本就受防火长城管控，能否稳定连上 Snowflake broker 完成注册是实际问题，让设备长期做这件事，风险与收益是否成比例，值得先想清楚。这支 App 更适合外部连接本身不受严格审查、又想帮上忙的华语读者：例如住在海外，或人在网络管制相对宽松地区的人。已经在用 Orbot Kindness Mode 的人不必重复安装，可以继续用它，Snowflake Volunteer 的差别在于只做桥接一件事，能单独设置只在 Wi-Fi、只在充电时运作，不必连着整个 Orbot 一起开。

如果你在香港，参与前请先读 [Tor Snowflake 桥接点](../../tools/tor-snowflake.md) 页里的风险提醒，把国安监控风险一并评估。

## 如何安装

Snowflake Volunteer 可以从 [F-Droid](https://f-droid.org/en/packages/io.bloco.snowflake/){target="_blank"}、[Google Play](https://play.google.com/store/apps/details?id=io.bloco.snowflake){target="_blank"} 下载，一般用户用 Google Play 即可，偏好开源商店的人可以用 F-Droid。源代码开源在 [GitHub](https://github.com/blocoio/snowflake){target="_blank"}，可以自行编译，遇到问题也可以直接[开 issue](https://github.com/blocoio/snowflake/issues/new){target="_blank"}。iOS 目前没有对应的 App，iPhone 用户可以改用[浏览器版桥接点](../../tools/tor-snowflake.md)。

## 相关阅读

- [Tor Snowflake 桥接点](../../tools/tor-snowflake.md)：浏览器版桥接点如何开，以及需要留意的风险
- [伊朗封网 80 多天后重新开放，流量涌进社群架设的 Tor WebTunnel](iran-blackout-webtunnel.md)：桥接点在真实审查情境下的作用
- [如何搭建 Tor Relay](../../community/setup-tor-relay.md)：想投入更多心力的下一步

[^1]: 统计依据 2026 年 1 月 1 日至 6 月 30 日、共 180 份 Snowflake broker 每日报告，数据来自 Tor Metrics 的 [CollecTor 存档](https://metrics.torproject.org/collector/archive/snowflakes/){target="_blank"} 汇整的 snowflake-stats descriptor。
