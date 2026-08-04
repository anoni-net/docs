---
date: 2026-08-04
authors:
    - anoni-net
categories:
    - 更新
    - Tor
    - 翻译文章
slug: snowflake-volunteer-android-app
image: "assets/images/tor.webp"
summary: "Tor Project 8 月推出 Snowflake Volunteer，把当 Snowflake 志愿者桥接独立成一支 Android App，上线后三个月志愿者桥接数成长近 6 成。文末补充华语读者可以怎么看待这支 App。"
description: "翻译 Tor Project 官方公告，介绍新上线的 Snowflake Volunteer Android App：背景由来、怎么运作、上线后的成长数字，以及华语读者可以怎么看待用手机贡献 Snowflake 桥接这件事。"
---

# Snowflake Volunteer 上线：Tor Project 推出手机志愿者桥接 App

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

Tor Project 在 2026 年 8 月 3 日发布 [Snowflake Volunteer](https://f-droid.org/en/packages/io.bloco.snowflake/){target="_blank"}，一支专门让人用 Android 手机当 [Snowflake](../../tools/tor-snowflake.md) 志愿者桥接的独立 App。过去要贡献 Snowflake 桥接，需通过浏览器扩展、网站内嵌 widget、桌面命令行工具，或 Android 上的 [Orbot Kindness Mode](https://orbot.app/en/kindness/){target="_blank"}。新 App 把「当志愿者桥接」独立成一个单一用途的应用程序，界面与流程都只为此设计。

<!-- more -->

## 为什么要多做一支独立 App

Snowflake 的原理是把用户的流量伪装成视频通话的样子，再通过志愿者提供的临时连接转发，让审查者更难侦测与封锁。这个机制要运作得好，需要一大群稳定在线的志愿者桥接。2026 年上半年，Snowflake broker 平均每天约有 14 万 6 千个不重复志愿者桥接 IP 地址回报[^1]，其中约三分之一来自 Orbot 的 Kindness Mode。Kindness Mode 会显示这个桥接帮过几个连接，让贡献变得具体可见。

葡萄牙的 Android App 工作室 [Bloco](https://www.bloco.io/){target="_blank"} 看到 Kindness Mode 贡献的比重后，好奇一支「只做志愿者桥接」的独立 App，能不能吸引到更多人参与。他们主动找上 Tor 的反审查团队，发现对方本来就有类似计划，只是尚无余力着手，于是接下了开发工作。背后的原因，是 Bloco 团队先前参与 [OONI](https://ooni.org/){target="_blank"}（Open Observatory of Network Interference，全球最大规模的网络封锁观测计划）合作时，看到 NGO 与行动者有多依赖反审查工具维持安全与连接，发现贡献 Snowflake 桥接的门槛不高后，就想拿自己的专业回馈这个开源项目。

## App 做了什么

Bloco 站在 [Guardian Project](https://guardianproject.info){target="_blank"} 既有的移动端 Tor 生态基础上开发，特别是 [IPtProxy](https://github.com/tladesignz/IPtProxy){target="_blank"} 这个函式库，把 Tor 整合进移动 App 所需的工具与 pluggable transport 整合在一起。有这层基础，Bloco 就能把心力集中在三件事。第一是让 App 能长时间在后台稳定运作、尽量省电。第二是把用户体验做对，让每个人都看得懂 App 在做什么、能照自己的网络状况正确设置。第三是用统计数字持续呈现志愿者帮上了多少忙，维持参与的动力。

成果是 Snowflake Volunteer，一支把「什么时候贡献、贡献多少」的控制权交给志愿者自己的单一用途 App。用户可以让它在后台执行、限制只在 Wi-Fi（非计量网络）下运作、设置只在充电时执行，也可以设置同时能帮几个连接。启用后，App 会自动跟需要 Snowflake 桥接的用户配对，协助把对方的连接导向 Tor 网络。

<figure markdown="span">
    <a href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png" target="_blank">
        <img src="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png"
            alt="Snowflake Volunteer App 三个画面的截图：启用中的主画面显示帮助人数与流量统计、设置页可调整后台运行与限制 Wi-Fi 或充电时运行、统计页列出逐日的连接数与流量"
            style="border-radius: 10px;">
    </a>
    <figcaption>App 的主画面、设置页与统计页截图。图片来源：<a target="_blank" href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/">Tor Project Blog</a>。</figcaption>
</figure>

## 上线后的成效

Snowflake Volunteer 经过一轮社群测试与意见反馈后，于 4 月正式公开上线。5 月平均每天约 1,300 个不重复志愿者桥接 IP，6 月成长到约 1,700 个，单月成长 29%。这段期间单日峰值曾超过 2,100 个桥接。这个数字显示，一支专用 App 确实能把额外的志愿者带进 Snowflake 社群。

App 目前已支持 8 种语言（中文、英文、法文、德文、日文、葡萄牙文、土耳其文、越南文），要感谢社群本地化志愿者的贡献。想协助扩大语言覆盖，可以通过 [Weblate 项目页](https://hosted.weblate.org/projects/snowflake-volunteers/){target="_blank"} 或参考 [Tor 的本地化流程说明](https://community.torproject.org/localization/){target="_blank"} 加入。

## 怎么安装

Snowflake Volunteer 可以从 [F-Droid](https://f-droid.org/en/packages/io.bloco.snowflake/){target="_blank"}、[Google Play](https://play.google.com/store/apps/details?id=io.bloco.snowflake){target="_blank"} 下载，源代码开源在 [GitHub](https://github.com/blocoio/snowflake){target="_blank"}，想自己编译或反馈问题都可以直接[开 issue](https://github.com/blocoio/snowflake/issues/new){target="_blank"}。

[^1]: 统计依据 2026 年 1 月 1 日至 6 月 30 日、共 180 份 Snowflake broker 每日报告，数据来自 Tor Metrics 的 [CollecTor 存档](https://metrics.torproject.org/collector/archive/snowflakes/){target="_blank"} 汇整的 snowflake-stats descriptor。

## 什么情况下适合用这支 App

[Tor Snowflake 桥接点](../../tools/tor-snowflake.md) 页面已经说明过用浏览器贡献 Snowflake 桥接的风险，这支 App 改变的只是安装方式，判断原则不变：安装它代表你的设备会替审查地区的用户转发 Tor 流量。

如果你人在中国大陆，自身的网络本就受防火长城管控，能否稳定连上 Snowflake broker 完成注册是实际问题，让设备长期做这件事，风险与收益是否成比例，值得先想清楚。这支 App 更适合外部连接本身不受严格审查、又想帮上忙的华语读者：例如住在海外，或人在网络管制相对宽松地区的人。

如果你在香港，参与前请先看 [Tor Snowflake 桥接点](../../tools/tor-snowflake.md) 页里的风险提醒，把国安监控风险一并考虑进去。

## 相关阅读

- [Tor Snowflake 桥接点](../../tools/tor-snowflake.md)：浏览器版桥接点怎么开，以及需要留意的风险
- [伊朗封网 80 多天后重新开放，流量涌进社群架设的 Tor WebTunnel](iran-blackout-webtunnel.md)：桥接点在真实审查情境下的作用
- [如何搭建 Tor Relay](../../community/setup-tor-relay.md)：想投入更多心力的下一步
