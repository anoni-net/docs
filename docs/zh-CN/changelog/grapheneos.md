---
title: GrapheneOS 月度更新摘要
description: GrapheneOS 每月更新的白话整理，说明 Android 安全修补等级进度、日常会碰到的功能修补，以及机型支持变动。
icon: material/cellphone-lock
---

# :material-cellphone-lock: GrapheneOS 月度更新摘要

[GrapheneOS](../tools/grapheneos.md) 的更新整理，按月聚合。近四个月平均六天就发一版，版本号是发布日期（例如 `2026081300`），逐版看没有意义，所以这一页把同一个月的版本合成一则，回答三件事：这个月的 Android 安全修补等级推进到哪、有没有修到日常会碰到的功能、机型支持有没有变动。新的月份永远在最上面。

GrapheneOS 走自动更新，设备在后台就会装好，一般用户不需要为了这一页做任何事。内容是给想知道背后发生什么、或需要向团队说明为何选这套系统的人看的。

原始数据来自[官方发布页](https://grapheneos.org/releases){target="_blank"}。官方的 atom feed 只保留最近 20 则（大约四个月），更早的记录要到官网翻。

## 2026 年 8 月

> 版本 `2026080500`、`2026081300` · [官方发布页](https://grapheneos.org/releases){target="_blank"}

- 安全修补等级推进到完整的 2026-08-05 Pixel 等级，同时更新 8 月的 Pixel 驱动与固件代码。
- 内核 backport 了 CVE-2026-64560 的修补。同一个 Linux 内核漏洞 Tails 在 [7.10.1](./tails.md) 也紧急修过，在 Tails 上它可以让 Tor Browser 内的攻击者取得管理员权限。
- 通讯录范围控制（Contact Scopes）在 Android 17 上跟 WhatsApp 与沙盒化 Google Play 服务的兼容问题，8 月 5 日先用临时解法挡住，8 月 13 日换成正式做法，改用调用端 app 的身份执行过滤查询。
- 8 月 13 日修掉两个上游还没修的漏洞：凭证管理器（CredentialManager）与 Play 服务的 FIDO 界面都改为不透明，避免底下的界面被叠在上面的内容看穿。GrapheneOS 自己先挡掉上游未修的问题，是它跟原厂 Android 的差别之一。
- Vanadium（GrapheneOS 内置的强化版 Chromium 浏览器）在 8 月连更四版，跟上 Chromium 151 系列。
- 机型涵盖 Pixel 6 到 Pixel 10a，本月没有变动。
- 8 月 13 日之后到月底没有再发新版，是近四个月最长的一次间隔。

## 2026 年 7 月

> 版本 `2026070500`、`2026071100`、`2026071500`、`2026072900` · [官方发布页](https://grapheneos.org/releases){target="_blank"}

- 安全修补等级在 7 月 11 日拉到 2026-07-05，Android 与 Pixel 两份公告在该等级都没有额外的修补项目。同一版更新 7 月的 Pixel 驱动与固件代码。
- 位置隐私修掉一个上游 Android 的缺陷：没有取得精确位置权限的 app，仍然可以从粗略位置读到海拔、精度这类次要字段。GrapheneOS 改成只用允许列表上的字段重建粗略位置。
- 内核的硬件内存标记（hardware memory tagging）抓到 USB 以太网 gadget 驱动的一个 double-free。GrapheneOS 默认开启的防护实际拦下上游的错误，同样的记录在后面几个月还会反复出现。
- 锁屏以外的 PIN 输入界面补上隐私强化，并修好 128 位数 PIN 在新版界面被截断的问题。
- secure（exec）spawning 换成新实现，开关从全局改为逐 app 设置，兼容性明显改善。7 月 15 日再补上跟反篡改库的兼容处理，V-KEY 这类保护方案不会再被挡住。
- ContactsProvider 与电话（Telephony）各修一个上游 Android 的安全漏洞，后者的成因是缺少对 API 等级低于 30 的 app 的系统权限检查。

## 2026 年 6 月

> 版本 `2026060100` 到 `2026062800`（八版）· [官方发布页](https://grapheneos.org/releases){target="_blank"}

- Android 17 上线的月份。6 月 1 日先到完整的 2026-06-01 等级，6 月 18 日跟上随 Android 17 发布的完整 2026-06-05 Pixel 等级。Android 17 对 GrapheneOS 的处境代表什么，站上有[专文](../blog/posts/2026-grapheneos-android-17.md)讨论。
- 硬件内存标记这个月抓到三个上游驱动的错误：Broadcom Wi-Fi 驱动的 use-after-free，以及 DisplayPort 驱动的两次越界读取。后者的成因是部分屏幕设备没有照 DisplayPort 规格实现。
- 网络定位（Network Location）对 Apple 与 Apple China 的定位服务也改为要求 TLSv1.3，跟 GrapheneOS 自家服务的要求一致。
- Android 17 带来几个行为变动：Wi-Fi 快速设置改成真的关闭 Wi-Fi，不再只是断开当前的网络。邻近设备权限拆出局域网访问，没有针对 Android 17 改版的 app 默认仍可使用。
- 设置界面把胁迫密码（duress password）重新列回屏幕锁定菜单，这个功能靠有人看得到才会被用到。
