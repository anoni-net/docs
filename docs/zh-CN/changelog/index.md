---
title: 软件更新日志
description: Tor、tor daemon、Tails、OONI、Arti、OnionShare、操作系统、浏览器与通讯软件各版本更新的中文重点整理，从上游 changelog 翻译而成，方便华语读者快速掌握每次发布的关键变更与安全修补。
icon: material/history
changelog_digest:
  days: 45
  date_format: "{y}/{m}/{d}"
  asof: 数据截至 {date}，网站每次重新构建时更新
  filter_label: 按设备与用途筛选
  all: 全部
  latest: 最新：{title} · {date}
  empty_now: 过去 45 天没有需要立刻或尽快处理的更新。
  empty_recent: 过去 45 天没有新的条目。
  empty_filtered: 这个选项在这段时间内没有对应的条目。
  subscribe: 订阅「{label}」
  subscribe_urgent: 只订阅立刻与尽快
  feed_label: "RSS："
  feed_title: anoni.net 软件更新日志：{label}
  feed_description: 匿名工具与操作系统的版本更新与安全修补，整理自上游公告，每一条都链接到 anoni.net 文档站上的中文说明。
  feed_urgent: 立刻与尽快
  filters:
    - id: iphone
      label: iPhone 与 iPad
    - id: mac
      label: Mac
    - id: windows
      label: Windows
    - id: linux
      label: Linux
    - id: android
      label: Android
    - id: tails
      label: Tails
    - id: relay
      label: 搭建中继或 onion 服务
    - id: ooni
      label: 审查观测
---

# :material-history: 软件更新日志

匿名网络工具与常用操作系统每次版本发布的重点整理，由社群志愿者从上游 changelog 翻译精简而来。每一则都连回上游公告，内容是摘译。例行版本更新会以条目形式累积在此页面，遇到重大事件（安全审计、新架构公告、有强烈在地脉络的功能）会在 [近期公告](../blog/index.md) 写成完整文章。

## 最近的更新

<!-- changelog-digest:filter -->

### 现在要处理的

有紧急程度分级的页面各取最新一条（一页收两个产品的各取一条），只列「立刻」与「尽快」。各页分级的判断标准不同，写在每一项的日期后面。

<!-- changelog-digest:now -->

### 最近 45 天

所有页面在这段时间内的条目，最新的排在最前面。

<!-- changelog-digest:recent -->

## 先看哪一页

多数人只需要三页：[Tor 更新日志](./tor.md)、[浏览器安全更新](./browsers.md)，加上自己设备对应的那一页（iPhone 看 iOS、Mac 看 macOS、Windows 电脑看 Windows、Android 手机看 Android）。其余页面是给有特定需求的人，例如自架中继、被封锁需要换传输、做审查观测。

标「含紧急程度分级」的页面用三色标签回答「该多快处理」，各页的判断依据不完全相同，写在该页开头。没有标签的页面性质是进度或功能整理，读者不需要为它们做更新决定。

## 组织里负责信息安全的人

NGO、媒体、社区组织或小型团队里，常有一个人负责提醒大家更新。上游的公告散在十几个地方，用语也各不相同，这一页先整理成同一套分级，负责的人每个月花十几分钟就能转成团队听得懂的提醒。

第一步是盘点团队实际在用的设备与工具，在[最近的更新](#最近的更新)找到对应的筛选项，订阅那几份 :material-rss-box:{ .rss-icon } RSS，再加上「只订阅立刻与尽快」。用阅读器或团队群聊里的订阅机器人接收都可以，新条目一出现就会收到。盘点记下设备种类与系统版本就够了，不需要列出谁在用 Tor 或其他匿名工具，那份名单泄露的风险比漏掉一次提醒更高。

出现「立刻」时，当天就转给受影响的人。消息写清楚影响哪些设备与版本、要更新到哪一版、在哪里检查版本，并附上条目的链接（每一条的标题都有自己的链接）。直接附链接比转述数字可靠，微软与 Apple 的公告在发布后还会修订，站上的条目会跟着更新。转达前先看每一项后面写的判断标准与对象，例如 tor daemon 的「立刻」只跟搭建中继与 onion 服务的人有关，转给全团队只会让大家以为自己的电脑出了问题。

「尽快」与没有标签的更新可以集中在固定的时间提醒，例如每周的例会或每月的内部通讯。Tor Browser 的稳定版现在大约两周一版，提醒大家看到更新提示就接受，会比逐版转述内容实际。

确认更新完成时，请成员对照自己的版本号，不必上报到统一的表格。检查的位置写在 [iOS 页的「你的机器走哪一条线」](./ios.md#你的机器走哪一条线)、[macOS 页的「三条维护线」](./macos.md#三条维护线)与 [Android 页的「先查自己的设备落后多少」](./android.md#先查自己的设备落后多少)。已经拿不到安全更新的旧设备在盘点时标出来，排进淘汰计划，之后的「立刻」更新都不会覆盖它们。

向主管或合作单位说明时，以每一条链接到的上游公告作为依据。这里的内容是摘译，数字以上游为准。

## 浏览器与通讯软件

每天都在处理陌生内容的两类软件，按月或按公告整理，只看有没有已被利用的漏洞、要更新到哪一版。

- :material-web-check: [浏览器安全更新](./browsers.md)：Chrome 与 Firefox，含紧急程度分级 <!-- changelog-latest:browsers -->
- :material-message-lock-outline: [通讯软件安全更新](./messaging.md)：WhatsApp 与 Signal，含紧急程度分级 <!-- changelog-latest:messaging -->

## 匿名工具

从上游 changelog 逐版摘译，保留版本号与跟踪编号。

- :simple-torbrowser: [Tor 更新日志](./tor.md)：Tor Browser 的稳定版与 Alpha 通道 <!-- changelog-latest:tor -->
- :material-server-network: [tor daemon 更新日志](./tor-daemon.md)：c-tor 的安全发布，给中继与 onion 服务运营者（含紧急程度分级） <!-- changelog-latest:tor-daemon -->
- :material-shield-key-outline: [抗审查传输更新日志](./anti-censorship.md)：Snowflake、WebTunnel、obfs4，连不上 Tor 时要换的那几种 <!-- changelog-latest:anti-censorship -->
- :material-code-tags: [Arti 更新日志](./arti.md)：Tor Project 的 Rust 实现，开发中，一般读者目前用不到 <!-- changelog-latest:arti -->
- :material-access-point-network: [OONI 更新日志](./ooni.md)：OONI Probe 与测量引擎，做审查观测的人才需要追 <!-- changelog-latest:ooni -->
- :material-share-variant: [OnionShare 更新日志](./onionshare.md)：OnionShare 文件分享与匿名网站（含紧急程度分级） <!-- changelog-latest:onionshare -->

## 操作系统

设备本身就是攻击面。操作系统这一组不逐条翻译，改成回答「需不需要现在更新」。Android 与 GrapheneOS 两页是例外，前者拿不到上游明细、后者走自动更新，原因写在各自页面开头。

- :material-usb-flash-drive-outline: [Tails 更新日志](./tails.md)：Tails 操作系统（含紧急程度分级） <!-- changelog-latest:tails -->
- :material-apple-ios: [iOS 安全更新](./ios.md)：iPhone 与 iPad，含紧急程度分级与旧机支持状况 <!-- changelog-latest:ios -->
- :material-apple: [macOS 安全更新](./macos.md)：Mac，含紧急程度分级与三条维护线的状态 <!-- changelog-latest:macos -->
- :material-microsoft-windows: [Windows 安全更新](./windows.md)：每月 Patch Tuesday，含紧急程度分级，先分清楚桌面还是服务器 <!-- changelog-latest:windows -->
- :material-cellphone-lock: [GrapheneOS 月度更新摘要](./grapheneos.md)：Pixel 上的强化 Android，按月聚合 <!-- changelog-latest:grapheneos -->
- :material-android: [Android 安全补丁级别](./android.md)：每月补丁级别与 CVE 数，先查自己的设备落后多少 <!-- changelog-latest:android -->
