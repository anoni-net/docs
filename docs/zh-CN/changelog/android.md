---
title: Android 安全补丁级别
description: Android 每月安全补丁级别的整理，说明怎么查自己的设备落后多少，以及 2026 年 7 月起公开公告不再列出漏洞明细的影响。
icon: material/android
---

# :material-android: Android 安全补丁级别

Android 每月安全更新的整理。这一页的做法跟 [iOS](./ios.md)、[macOS](./macos.md)、[Windows](./windows.md) 那几页不同，原因写在下一节。新的月份永远在最上面。

## 这一页为什么没有紧急程度分级

Google 的 Android 安全公告在 2026 年 7 月出现变化，公开页面不再列出漏洞明细。2026 年 6 月的公告还有 119 个 CVE，分成 Framework、System、Kernel 与各家芯片厂等分节，每一条都标了类型与严重度。7 月与 8 月的页面只剩说明文字，连「明细表的 Type 字段代表什么」这种模板解释都还留着，那张表格本身却不在页面上。用浏览器完整渲染过也一样，所以缺的是内容本身。

没有明细就无法判断「这个月有没有正在被实际利用的漏洞」，而那正是 iOS 与 Windows 那两页分级的依据。与其用不确定的数据硬做分级，这一页改成追三件可以确定的事：每月的补丁级别推进到哪、涵盖多少 CVE 与严重度分布、你的设备落后多少。

底下每则的 CVE 数字来自 [GrapheneOS 的发布说明](https://grapheneos.org/releases){target="_blank"}，但它代表的东西需要说明清楚。GrapheneOS 会发 security preview release，提前套用 Google 排定在未来几个月才公告的修补，发布说明里的「List of additional fixed CVEs」就是那批提前修好的清单，会逐版累积。所以那个数字是「GrapheneOS 已经比官方排程早修好多少」，不是「这个月官方公告涵盖多少」。后者在 7 月之后拿不到，因为明细不再公开。

## 先查自己的设备落后多少

Android 设备的实际补丁级别由手机厂决定，跟 Google 公告的日期不是同一件事。位置在设置、关于手机、Android 安全更新，各家界面名称略有差异，显示的是一个像 `2026-08-05` 的日期。

怎么看那个日期：

- 落后一个月以内属于正常，各厂都需要时间整合与测试。
- 落后三个月以上，代表这段期间公开的漏洞在你的设备上都还没补。Android 的漏洞公开之后细节会进 AOSP，攻击方跟防守方取得的是同一份数据。
- 完全停止更新的设备，已知漏洞不会再有修补。处理敏感联络或采访工作的话，该考虑换机或改装仍在维护的系统。

原厂支持期长短差很多，买之前查清楚该型号的承诺支持年限，比买了之后才发现划算。

## 2026 年 8 月

> 补丁级别 2026-08-05 · [Google 公告](https://source.android.com/docs/security/bulletin/2026/2026-08-01){target="_blank"} · [GrapheneOS 发布页](https://grapheneos.org/releases){target="_blank"}

- 到 8 月 13 日那版为止，GrapheneOS 已经提前修好 196 个尚未正式公告的 CVE（34 个 Critical、160 个 High、2 个未分类），涵盖 Google 排定在 2026 年 9 月到 2027 年 1 月公告的内容。
- Google 的公开公告没有明细，看不出这些修补落在哪些组件，也看不出有没有正在被利用的项目。
- GrapheneOS 在同一个月另外修掉两个上游还没处理的漏洞，把凭证管理器与 Play 服务的 FIDO 界面改为不透明，详见 [GrapheneOS 月度更新摘要](./grapheneos.md)。

## 2026 年 7 月

> 补丁级别 2026-07-05 · [Google 公告](https://source.android.com/docs/security/bulletin/2026/2026-07-01){target="_blank"} · [GrapheneOS 发布页](https://grapheneos.org/releases){target="_blank"}

- 到 7 月 29 日那版为止，提前修好的累积到 165 个（30 个 Critical、130 个 High、5 个未分类）。
- 明细从这个月开始消失。往前一个月还有完整的分节与类型标示，往后就只剩摘要。
- 这个级别在 Android 与 Pixel 两份公告里都没有额外的修补项目，属于例行推进。

## 2026 年 6 月

> 补丁级别 2026-06-01 与 2026-06-05 · [Google 公告](https://source.android.com/docs/security/bulletin/2026/2026-06-01){target="_blank"} · [GrapheneOS 发布页](https://grapheneos.org/releases){target="_blank"}

- 这是最后一个公开明细完整的月份，Google 公告列出 119 个 CVE。
- **CVE-2025-48595** 被标为可能正在被有限、针对性地利用。它在 Framework 组件，类型是提权（让程序取得比原本更高的系统权限），严重度 High，影响 Android 14、15、16 与 16-qpr2。Google 用「有限、针对性」这个说法时，背后通常是商业间谍软件对特定对象发动的攻击，记者与人权工作者是常见的目标。**工作性质属于这一类的人，请比照其他页面的「立刻」处理**：确认自己的设备补丁级别已经到 2026-06-05 或更新，没到就先别用它处理敏感联络。
- 组件分布的前五大类：System 37 个、Framework 30 个、Qualcomm 闭源组件 19 个、Unisoc 16 个、MediaTek 11 个。其余散在 Kernel、Imagination 与 Qualcomm 非闭源组件。
- 类型分布：提权 40 个、拒绝服务 21 个、信息泄露 6 个、远程执行代码 1 个。提权占最多是 Android 的常态，攻击链通常先取得执行机会，再靠提权升到系统权限。
- 6 月 18 日的 2026-06-05 级别随 Android 17 一起发布。

## 2026 年 5 月

> 补丁级别 2026-05-05 · [Google 公告](https://source.android.com/docs/security/bulletin/2026/2026-05-01){target="_blank"} · [GrapheneOS 发布页](https://grapheneos.org/releases){target="_blank"}

- 到 5 月 24 日那版为止，提前修好的累积到 111 个（18 个 Critical、91 个 High、2 个未分类）。
- GrapheneOS 在这个月的硬件内存标记抓到 Broadcom Wi-Fi 驱动的 use-after-free（程序把内存还回去之后又拿来用，可能被塞进恶意代码）与 DisplayPort 驱动的越界读取（读到不该读的内存，可能泄漏别的程序的数据），那些是上游没发现的问题。

## 2026 年 4 月

> [GrapheneOS 发布页](https://grapheneos.org/releases){target="_blank"}

- 到 4 月 21 日那版为止，提前修好的累积到 61 个（13 个 Critical、48 个 High）。
- GrapheneOS 在这个月没有推进标示的补丁级别，发布的内容以功能修正为主。
