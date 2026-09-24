---
title: 浏览器安全更新
description: Chrome 与 Firefox 每月安全更新的白话整理，说明这个月有没有已被利用的漏洞、要更新到哪一版，以及两个浏览器的发布节奏。
icon: material/web-check
digest:
  name: 浏览器
  devices: [windows, mac, linux, android]
  tracks: [Chrome, Firefox]
  basis: 按上游是否标注已被利用分级
---

# :material-web-check: 浏览器安全更新

Chrome 与 Firefox 的安全更新整理，按月聚合，两个浏览器分开写。浏览器每天都在处理来自陌生网站的内容，是漏洞被实际利用最频繁的软件之一，2026 年 9 月 Chrome 就有两个已被利用的漏洞。新的月份永远在最上面。

iPhone 与 iPad 上的 Chrome 与 Firefox 用的是 Apple 的 WebKit 引擎，修补跟着系统更新走，整理在 [iOS 安全更新](./ios.md)。Tor Browser 以 Firefox ESR 为基础，Firefox 的修补大多会跟着带进去，逐版内容见 [Tor 更新日志](./tor.md)。

原始数据来自 [Chrome Releases](https://chromereleases.googleblog.com/){target="_blank"} 的桌面稳定版公告与 Mozilla 的[安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>上游标注已被实际利用。Chrome 的写法是「Google is aware that an exploit for … exists in the wild」，Mozilla 会在该项说明里写到 attacks in the wild。被 CISA 收入已知遭利用漏洞目录（KEV）也算。
- <span class="urg-tag urg-tag--soon">尽快</span>有 Critical 或 High 级别的安全修补，上游没有标注已被利用。
- <span class="urg-tag urg-tag--routine">一般</span>只有 Medium 以下的安全修补，或没有安全修补。

这一页的「立刻」需要证据，跟 iOS、Windows 那几页用同一个判断标准。严重程度只作参考，2026 年 9 月被利用的 CVE-2026-87491，Chrome 自己评的严重程度只有 Medium。

Mozilla 的公告里常见「we presume that with enough effort some of these could have been exploited」，那是内存安全错误的固定写法，表示理论上可能被利用，不代表已经有人在利用。判断时看的是有没有写到 in the wild。

## 两个浏览器的发布节奏

Chrome 每周都有带安全修补的小版本，大版本原本约四周一版，2026 年 9 月的 153 与 154 只隔两周。Firefox 也从 9 月起改成两周一个大版本，另外维护三条延长支持版（ESR）：153、140 与 115，115 这条主要给还在用 Windows 7、8.1 与旧版 macOS 的人。

两个浏览器都会在后台下载更新，但要重新启动浏览器才会生效。长时间不关浏览器的人，可能早就下载了新版却一直在运行旧版。Chrome 在地址栏输入 `chrome://settings/help` 可以查看版本，Firefox 在菜单的「帮助」里点「关于 Firefox」。

## Chrome 2026 年 9 月

> 2026-09-22 · [Chrome Releases](https://chromereleases.googleblog.com/2026/09/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>两个已被利用的漏洞都在 V8（Chrome 执行 JavaScript 的引擎），Google 在公告里标注已有利用程序在外流传，CISA 也在次日收入 KEV。更新到 153.0.8010.36 以上两个都覆盖，目前最新的是 9 月 22 日的 154.0.8037.57。
- CVE-2026-85046：V8 的类型混淆（type confusion），Google 评为 High，9 月 3 日的 152.0.7977.82 修复。
- CVE-2026-87491：V8 的越界写入（out of bounds write），Google 评为 Medium，9 月 8 日的 153.0.8010.36 修复。
- Edge、Brave 这类基于 Chromium 的浏览器用的也是 V8，要等各自的更新。Tor Browser 基于 Firefox，没有 V8，不受这两个影响。
- 这个月六次稳定版更新共修复了 434 个安全问题，Critical 23 个。9 月 8 日的 153 与 22 日的 154 两个大版本就占了 338 个。

## Firefox 2026 年 9 月

> 2026-09-15 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>两个大版本 155（9 月 1 日）与 156（9 月 15 日）都有 High 级别的修补。Mozilla 没有标注任何一项已被实际利用。
- 156 的修补特别多，High 就有 29 个。其中两个是沙箱逃逸（CVE-2026-92035、CVE-2026-92018），8 个是 WebGL 画布组件的权限提升。沙箱是浏览器隔开网页与操作系统的那道隔离，逃逸类漏洞往往是完整攻击链的最后一步。
- Android 版另有一个权限提升（CVE-2026-92033），同样在 156 修复。
- ESR 用户对应的版本是 153.3、140.16 与 115.41，跟 156 同一天发布。Tor Browser 15.0.23 已经跟上 140.16。

## Chrome 2026 年 8 月

> 2026-08-25 · [Chrome Releases](https://chromereleases.googleblog.com/2026/08/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>五次稳定版更新共修复了 395 个安全问题，Critical 19 个。Google 没有标注任何一项已被实际利用。
- 8 月 25 日的 152 是大版本，一次就修复了 327 个。8 月 4 日那一版只修一般错误，没有安全修补。

## Firefox 2026 年 8 月

> 2026-08-18 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>8 月 18 日的 Firefox 154 有 19 个 High 级别的修补，ESR 对应的版本是 153.1、140.14 与 115.39。Mozilla 没有标注任何一项已被实际利用。
- 8 月 4 日 Android 版另外发布了 153.0.3，修复一个信息泄露（CVE-2026-18809），Firefox Focus 也在影响范围内。

## Chrome 2026 年 7 月

> 2026-07-29 · [Chrome Releases](https://chromereleases.googleblog.com/2026/07/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>六次稳定版更新共修复了 436 个安全问题，Critical 14 个。Google 没有标注任何一项已被实际利用。
- 7 月 29 日的 151 是大版本，一次就修复了 371 个。7 月 7 日那一版没有安全修补。

## Firefox 2026 年 7 月

> 2026-07-21 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>7 月 14 日的 152.0.6 修复两个 Critical，CVE-2026-15718（WebAssembly 的无效指针）与 CVE-2026-15719（页面导航的站点隔离问题）。Mozilla 写明这两个的利用程序已经公开，但没有发现实际攻击。利用程序公开意味着任何人都拿得到，这个月的 Firefox 在「尽快」里要排第一。
- ESR 晚了一周，7 月 21 日的 140.13 才修复这两个，115.38 只覆盖 CVE-2026-15719。
- 同一天的 Firefox 153 另有 20 个 High 级别的修补。
