---
title: 软件更新日志
description: Tor、tor daemon、Tails、OONI、Arti、OnionShare、iOS 与 GrapheneOS 各版本更新的中文重点整理，从上游 changelog 翻译而成，方便华语读者快速掌握每次发布的关键变更与安全修补。
icon: material/history
---

# :material-history: 软件更新日志

匿名网络工具与常用操作系统每次版本发布的重点整理，由社群志愿者从上游 changelog 翻译精简而来。每一则都连回上游公告，内容是摘译。例行版本更新会以条目形式累积在此页面，遇到重大事件（安全审计、新架构公告、有强烈在地脉络的功能）会在 [近期公告](../blog/index.md) 写成完整文章。

## 先看哪一页

多数人只需要两页：[Tor 更新日志](./tor.md)，加上自己设备对应的那一页（iPhone 看 iOS、Mac 看 macOS、Windows 电脑看 Windows、Android 手机看 Android）。其余页面是给有特定需求的人，例如自架中继、被封锁需要换传输、做审查观测。

标「含紧急程度分级」的页面用三色标签回答「该多快处理」，各页的判准基础不完全相同，写在该页开头。没有标签的页面性质是进度或功能整理，读者不需要为它们做更新决定。

## 匿名工具

从上游 changelog 逐版摘译，保留版本号与跟踪编号。

- :simple-torbrowser: [Tor 更新日志](./tor.md)：Tor Browser 的稳定版与 Alpha 通道
- :material-server-network: [tor daemon 更新日志](./tor-daemon.md)：c-tor 的安全发布，给中继与 onion 服务运营者（含紧急程度分级）
- :material-shield-key-outline: [抗审查传输更新日志](./anti-censorship.md)：Snowflake、WebTunnel、obfs4，连不上 Tor 时要换的那几种
- :material-code-tags: [Arti 更新日志](./arti.md)：Tor Project 的 Rust 实现，开发中，一般读者目前用不到
- :material-access-point-network: [OONI 更新日志](./ooni.md)：OONI Probe 与测量引擎，做审查观测的人才需要追
- :material-share-variant: [OnionShare 更新日志](./onionshare.md)：OnionShare 文件分享与匿名网站（含紧急程度分级）

## 操作系统

设备本身就是攻击面。操作系统这一组不逐条翻译，改成回答「需不需要现在更新」。Android 与 GrapheneOS 两页是例外，前者拿不到上游明细、后者走自动更新，原因写在各自页面开头。

- :material-usb-flash-drive-outline: [Tails 更新日志](./tails.md)：Tails 操作系统（含紧急程度分级）
- :material-apple-ios: [iOS 安全更新](./ios.md)：iPhone 与 iPad，含紧急程度分级与旧机支持状况
- :material-apple: [macOS 安全更新](./macos.md)：Mac，含紧急程度分级与三条维护线的状态
- :material-microsoft-windows: [Windows 安全更新](./windows.md)：每月 Patch Tuesday，含紧急程度分级，先分清楚桌面还是服务器
- :material-cellphone-lock: [GrapheneOS 月度更新摘要](./grapheneos.md)：Pixel 上的强化 Android，按月聚合
- :material-android: [Android 安全补丁级别](./android.md)：每月补丁级别与 CVE 数，先查自己的设备落后多少
