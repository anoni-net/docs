---
title: 通讯软件安全更新
description: WhatsApp 与 Signal 的安全公告整理，说明有没有已被利用的漏洞、影响哪些平台、要更新到哪一版。
icon: material/message-lock-outline
digest:
  name: 通讯软件
  devices: [iphone, android, windows, mac, linux]
  tracks: [WhatsApp, Signal]
  basis: 按上游是否标注已被利用分级
---

# :material-message-lock-outline: 通讯软件安全更新

WhatsApp 与 Signal 的安全公告整理，新的永远在最上面。通讯软件会自动处理陌生人发来的消息、图片与链接，有些漏洞不需要用户点开就会触发，针对记者、倡导工作者这类特定目标的攻击常从这里进来。2025 年 8 月，Meta 评估 WhatsApp 的 CVE-2025-55177 与 Apple 系统的 CVE-2025-43300 被串在一起，用来攻击特定的用户，CISA 也把它收入已知遭利用漏洞目录（KEV）。

两个软件的公告方式不同。WhatsApp 由 Meta 以 CVE 发布，[WhatsApp 安全公告](https://www.whatsapp.com/security/advisories){target="_blank"}按年整理。Signal 很少发布独立的安全公告，修补通常直接包含在普通版本里，这一页在 Signal 有公开的安全问题时才会加上条目。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>上游标注已被实际利用，或被 CISA 收入 KEV。
- <span class="urg-tag urg-tag--soon">尽快</span>有公开的安全公告，上游没有标注已被利用。通讯软件的漏洞常常不需要用户操作就能触发，所以只要有公告就列为尽快。

这一页不收没有安全公告的版本，所以不会出现「一般」。「立刻」需要证据，跟 iOS、Windows 那几页用同一个判断标准。

## 2026 年 7 月到 9 月的情况

这三个月 WhatsApp 与 Signal 都没有发布新的安全公告。WhatsApp 最近一次是 5 月的两个 CVE，收在下面。Signal 同期在三个平台共发布了 41 个正式版，发布说明都没有提到安全修补。

没有公告的时候也要保持自动更新。Signal 的每个版本都有使用期限，太旧的版本会停止运行并要求更新。WhatsApp 的 Windows 版通过 Microsoft Store 更新，要确认应用商店的自动更新没有关闭。

## WhatsApp 2026 年 5 月

> 2026-05-01 · [WhatsApp 安全公告](https://www.whatsapp.com/security/advisories/2026/){target="_blank"} · [CVE-2026-23863](https://www.facebook.com/security/advisories/cve-2026-23863){target="_blank"} · [CVE-2026-23866](https://www.facebook.com/security/advisories/cve-2026-23866){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>两个漏洞，上游明确说目前没有发现被实际利用。
- CVE-2026-23863：Windows 版的附件伪装。文件名里夹带 NUL 字符的文档，在 WhatsApp 里看起来是一种文件，打开时却会被当成可执行文件运行。v2.3000.1032164386.258709 之前的版本都受影响。
- CVE-2026-23866：iOS 与 Android 版处理 Instagram Reels 的 AI 回复消息时验证不完整，对方可以让你的设备去处理任意网址的媒体内容，还可能触发操作系统的自定义 URL 协议（custom URL scheme）。影响 iOS 版 2.25.8.0 到 2.26.15.72、Android 版 2.25.8.0 到 2.26.7.10。
- 第二个的触发方式跟 2025 年 8 月被利用的 CVE-2025-55177 相近，都是让设备去处理攻击者指定的网址。
