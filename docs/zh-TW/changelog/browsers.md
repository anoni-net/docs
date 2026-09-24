---
title: 瀏覽器安全更新
description: Chrome 與 Firefox 每月安全更新的白話整理，說明這個月有沒有已被利用的漏洞、要更新到哪一版，以及兩個瀏覽器的發布節奏。
icon: material/web-check
digest:
  name: 瀏覽器
  devices: [windows, mac, linux, android]
  tracks: [Chrome, Firefox]
  basis: 依上游是否標注已被利用分級
---

# :material-web-check: 瀏覽器安全更新

Chrome 與 Firefox 的安全更新整理，按月聚合，兩個瀏覽器分開寫。瀏覽器每天都在處理來自陌生網站的內容，是漏洞被實際利用最頻繁的軟體之一，2026 年 9 月 Chrome 就有兩個已被利用的漏洞。新的月份永遠在最上面。

iPhone 與 iPad 上的 Chrome 與 Firefox 用的是 Apple 的 WebKit 引擎，修補跟著系統更新走，整理在 [iOS 安全更新](./ios.md)。Tor Browser 以 Firefox ESR 為基底，Firefox 的修補多半會跟著帶進去，逐版內容見 [Tor 更新日誌](./tor.md)。

原始資料來自 [Chrome Releases](https://chromereleases.googleblog.com/){target="_blank"} 的桌面穩定版公告與 Mozilla 的[安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}。

## 急迫程度怎麼判斷

- <span class="urg-tag urg-tag--now">立刻</span>上游標注已被實際利用。Chrome 的寫法是「Google is aware that an exploit for … exists in the wild」，Mozilla 會在該項說明寫到 attacks in the wild。被 CISA 收進已知遭利用漏洞目錄（KEV）也算。
- <span class="urg-tag urg-tag--soon">儘快</span>有 Critical 或 High 等級的安全修補，上游沒有標注已被利用。
- <span class="urg-tag urg-tag--routine">一般</span>只有 Medium 以下的安全修補，或沒有安全修補。

這一頁的「立刻」需要證據，跟 iOS、Windows 那幾頁用同一個判準。嚴重度只當參考，2026 年 9 月被利用的 CVE-2026-87491，Chrome 自己評的嚴重度只有 Medium。

Mozilla 的公告裡常見「we presume that with enough effort some of these could have been exploited」，那是記憶體安全錯誤的固定寫法，代表理論上可能被利用，不代表已經有人在利用。判斷時看的是有沒有寫到 in the wild。

## 兩個瀏覽器的發布節奏

Chrome 每週都有帶安全修補的小版本，大版本原本約四週一版，2026 年 9 月的 153 與 154 只隔兩週。Firefox 也從 9 月起改成兩週一個大版本，另外維護三條延長支援版（ESR）：153、140 與 115，115 這條主要給還在用 Windows 7、8.1 與舊版 macOS 的人。

兩個瀏覽器都會在背景下載更新，但要重新啟動瀏覽器才會生效。長時間不關瀏覽器的人，可能早就下載了新版卻一直在執行舊版。Chrome 在網址列輸入 `chrome://settings/help` 可以查版本，Firefox 在選單的「說明」裡點「關於 Firefox」。

## Chrome 2026 年 9 月

> 2026-09-22 · [Chrome Releases](https://chromereleases.googleblog.com/2026/09/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>兩個已被利用的漏洞都在 V8（Chrome 執行 JavaScript 的引擎），Google 在公告裡標注已有利用程式在外流傳，CISA 也在隔天收進 KEV。更新到 153.0.8010.36 以上兩個都涵蓋，目前最新的是 9 月 22 日的 154.0.8037.57。
- CVE-2026-85046：V8 的型別混淆（type confusion），Google 評為 High，9 月 3 日的 152.0.7977.82 修掉。
- CVE-2026-87491：V8 的越界寫入（out of bounds write），Google 評為 Medium，9 月 8 日的 153.0.8010.36 修掉。
- Edge、Brave 這類以 Chromium 為基底的瀏覽器用的也是 V8，要等各自的更新。Tor Browser 以 Firefox 為基底，沒有 V8，不受這兩個影響。
- 這個月六次穩定版更新共修了 434 個安全問題，Critical 23 個。9 月 8 日的 153 與 22 日的 154 兩個大版本就占了 338 個。

## Firefox 2026 年 9 月

> 2026-09-15 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>兩個大版本 155（9 月 1 日）與 156（9 月 15 日）都有 High 等級的修補。Mozilla 沒有標注任何一項已被實際利用。
- 156 的修補特別多，High 就有 29 個。其中兩個是沙箱逃逸（CVE-2026-92035、CVE-2026-92018），8 個是 WebGL 畫布元件的權限提升。沙箱是瀏覽器隔開網頁與作業系統的那道隔離，逃逸類的漏洞常是完整攻擊鏈的最後一步。
- Android 版另有一個權限提升（CVE-2026-92033），同樣在 156 修掉。
- ESR 使用者對應的版本是 153.3、140.16 與 115.41，跟 156 同一天發布。Tor Browser 15.0.23 已經跟上 140.16。

## Chrome 2026 年 8 月

> 2026-08-25 · [Chrome Releases](https://chromereleases.googleblog.com/2026/08/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>五次穩定版更新共修了 395 個安全問題，Critical 19 個。Google 沒有標注任何一項已被實際利用。
- 8 月 25 日的 152 是大版本，一次就修了 327 個。8 月 4 日那一版只修一般錯誤，沒有安全修補。

## Firefox 2026 年 8 月

> 2026-08-18 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>8 月 18 日的 Firefox 154 有 19 個 High 等級的修補，ESR 對應的版本是 153.1、140.14 與 115.39。Mozilla 沒有標注任何一項已被實際利用。
- 8 月 4 日 Android 版另外發了 153.0.3，修掉一個資訊洩漏（CVE-2026-18809），Firefox Focus 也在影響範圍內。

## Chrome 2026 年 7 月

> 2026-07-29 · [Chrome Releases](https://chromereleases.googleblog.com/2026/07/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>六次穩定版更新共修了 436 個安全問題，Critical 14 個。Google 沒有標注任何一項已被實際利用。
- 7 月 29 日的 151 是大版本，一次就修了 371 個。7 月 7 日那一版沒有安全修補。

## Firefox 2026 年 7 月

> 2026-07-21 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>7 月 14 日的 152.0.6 修掉兩個 Critical，CVE-2026-15718（WebAssembly 的無效指標）與 CVE-2026-15719（頁面導覽的網站隔離問題）。Mozilla 寫明這兩個的利用程式已經公開，但沒有發現實際攻擊。利用程式公開代表任何人都拿得到，這個月的 Firefox 在「儘快」裡要排第一。
- ESR 晚了一週，7 月 21 日的 140.13 才修掉這兩個，115.38 只涵蓋 CVE-2026-15719。
- 同一天的 Firefox 153 另有 20 個 High 等級的修補。
