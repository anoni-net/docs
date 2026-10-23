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

Chrome 每週都有帶安全修補的小版本，大版本原本約四週一版，2026 年 9 月起的 153 到 156 都只隔兩週。Firefox 也從 9 月起改成兩週一個大版本，另外維護延長支援版（ESR）153 與 115，115 這條主要給還在用 Windows 7、8.1 與舊版 macOS 的人。ESR 140 在 9 月 29 日的 140.17 之後就沒有新版，Mozilla 的版本資訊也不再列出這條線。

兩個瀏覽器都會在背景下載更新，但要重新啟動瀏覽器才會生效。長時間不關瀏覽器的人，可能早就下載了新版卻一直在執行舊版。Chrome 在網址列輸入 `chrome://settings/help` 可以查版本，Firefox 在選單的「說明」裡點「關於 Firefox」。

## Chrome 2026 年 10 月

> 2026-10-20 · [Chrome Releases](https://chromereleases.googleblog.com/2026/10/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>10 月 20 日的大版本 156.0.8078.47 修了 353 個安全問題，Critical 6 個、High 61 個。這個月四份桌面穩定版公告，Google 都沒有標注任何一項已被實際利用，目前最新的就是這一版。
- 156 的 6 個 Critical 有 5 個是記憶體損毀，分別在 Skia（繪圖引擎）、Accessibility、CSS、Paint 與 WebRTC（CVE-2026-113341、CVE-2026-113279、CVE-2026-113072、CVE-2026-113280、CVE-2026-113303），另一個是 Accessibility 的 use-after-free（CVE-2026-113271）。High 裡 V8 與它的編譯器 Turbolev 合計 7 個，另有一個網站隔離的 use-after-free（CVE-2026-113101）與一個 Proxy 的輸入驗證不足（CVE-2026-113040）。
- 10 月 13 日的 155.0.8059.79 修了 37 個，Critical 7 個、High 29 個。7 個 Critical 都是記憶體錯誤，落在 ANGLE、瀏覽器本體、PDF、Network、Core、SVG 與 Media，其中 PDF 那一個（CVE-2026-110136）開啟 PDF 就會經過。High 裡有 Windows 安裝程式的提權（CVE-2026-110150）與更新程式的授權錯誤（CVE-2026-110159）。
- 10 月 15 日的 155.0.8059.84 修了 10 個，Critical 1 個，是預先轉譯（Prerender）的 use-after-free（CVE-2026-110922），High 6 個裡有 3 個在 V8。
- Android 版跟著桌面版發布，公告寫明修補內容相同。延長穩定版（Extended Stable）152 也在 10 月 13 日與 15 日跟著更新，最新是 152.0.7977.169。
- 10 月 6 日的大版本 155.0.8059.39 修了 247 個安全問題，Critical 4 個、High 53 個。Google 沒有標注任何一項已被實際利用。
- 4 個 Critical 都是 use-after-free（程式把記憶體還回去之後又拿來用），分別在 Chromecast、瀏覽器本體、頁面導覽（Navigation）與 Track 元件（CVE-2026-106382、CVE-2026-106197、CVE-2026-106358、CVE-2026-106347）。High 裡 ANGLE 有 7 個、V8 有 3 個，另有一個網站隔離（Site Isolation）的授權錯誤（CVE-2026-102322）。
- 10 月 1 日的 154.0.8037.97 修了 11 個安全問題，Critical 1 個、High 9 個。Google 沒有標注任何一項已被實際利用。
- Critical 那一項是 WebGL（網頁呼叫顯示卡繪製 3D 圖形的介面）的越界寫入（CVE-2026-103628）。High 裡有一個 V8 的型別混淆（CVE-2026-103625），其餘分散在 FileSystem、SVG、Skia、MediaStream 等元件。
- 九月那兩個已被利用的 V8 漏洞早在 152.0.7977.82 與 153.0.8010.36 修掉，更新到這一版同樣涵蓋。

## Firefox 2026 年 10 月

> 2026-10-21 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>10 月 13 日的 Firefox 158 修了 77 個問題，High 30 個、Moderate 33 個、Low 14 個，沒有 Critical。Mozilla 沒有標注任何一項已被實際利用，公告裡也沒有出現 in the wild 的字樣。桌面版目前最新的是 10 月 20 日的 158.0.1。
- Mozilla 從這一版起改了公告的寫法，內部找到的記憶體安全錯誤不再併成一個彙總的 CVE，改成一個錯誤一個編號。High 的數量因此比過去多，跨月比較數字時要知道這件事。過去每版都有的那句「could have been exploited」固定套語，也跟著彙總條目一起消失了。
- 158 的 High 裡有 4 個沙箱逃逸，落在網路與圖形元件（CVE-2026-109705、CVE-2026-109707、CVE-2026-109708、CVE-2026-109712），應用程式更新元件有一個提權（CVE-2026-109704），JavaScript 引擎與 JIT 編譯器有 7 個。其餘多是 DOM、SVG、圖形與影音元件的 use-after-free。
- 158.0.1 修了 4 個問題，其中 2 個 High。一個跟憑證有關：eMudhra 的中繼憑證遭到濫用，Mozilla 在 10 月 17 日透過 OneCRL（Firefox 的憑證撤銷清單）封鎖了它們。OneCRL 平常靠遠端設定自動更新，這一版把更新後的清單直接放進程式裡，關掉遠端設定的人也會擋下這些憑證（CVE-2026-113470）。另一個是 SVG 的邊界條件錯誤（CVE-2026-113399）。
- ESR 153.5 與 115.43 在 10 月 13 日跟著 158 發布，分別修了 61 個與 17 個，10 月 20 日的 153.5.1 與 115.43.1 再補上 eMudhra 那一項。ESR 140 這一輪沒有對應的版本。Android 版在 10 月 21 日另發 158.0.2，同樣只補 eMudhra 那一項。Tor Browser 15.0.26 與 GrapheneOS 的對應更新見 [Tor 更新日誌](./tor.md)與 [GrapheneOS 月度更新摘要](./grapheneos.md)。
- 10 月 6 日的 157.0.1 只修了一個 Moderate 等級的問題，檔案處理元件的防護機制可以被繞過（CVE-2026-106016）。

## Chrome 2026 年 9 月

> 2026-09-29 · [Chrome Releases](https://chromereleases.googleblog.com/2026/09/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>兩個已被利用的漏洞都在 V8（Chrome 執行 JavaScript 的引擎），Google 在公告裡標注已有利用程式在外流傳，CISA 也在隔天收進 KEV。更新到 153.0.8010.36 以上兩個都涵蓋，目前最新的是 9 月 29 日的 154.0.8037.92。
- CVE-2026-85046：V8 的型別混淆（type confusion），Google 評為 High，9 月 3 日的 152.0.7977.82 修掉。
- CVE-2026-87491：V8 的越界寫入（out of bounds write），Google 評為 Medium，9 月 8 日的 153.0.8010.36 修掉。
- Edge、Brave 這類以 Chromium 為基底的瀏覽器用的也是 V8，要等各自的更新。Tor Browser 以 Firefox 為基底，沒有 V8，不受這兩個影響。
- 9 月 29 日的 154.0.8037.92 修了 32 個安全問題，Critical 1 個，是 ANGLE（把網頁的圖形指令轉成各平台繪圖介面的轉譯層）的緩衝區溢位（CVE-2026-102331）。Google 沒有標注這一版有已被利用的漏洞。
- 這個月七次穩定版更新共修了 466 個安全問題，Critical 24 個。9 月 8 日的 153 與 22 日的 154 兩個大版本就占了 338 個。

## Firefox 2026 年 9 月

> 2026-09-29 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>三個大版本 155（9 月 1 日）、156（9 月 15 日）與 157（9 月 29 日）都有 High 等級的修補。Mozilla 沒有標注任何一項已被實際利用。
- 157 的修補比 156 還多，High 有 38 個，其中 9 個是沙箱逃逸，連同 Moderate 等級共 15 個。沙箱是瀏覽器隔開網頁與作業系統的那道隔離，逃逸類的漏洞常是完整攻擊鏈的最後一步。WebGPU（網頁直接呼叫顯示卡運算的介面）另有 4 個 High。
- 156 的 High 有 29 個，其中兩個是沙箱逃逸（CVE-2026-92035、CVE-2026-92018），8 個是 WebGL 畫布元件的權限提升。
- Android 版另有一個權限提升（CVE-2026-92033），同樣在 156 修掉。
- ESR 使用者對應的最新版本是 153.4、140.17 與 115.42，跟 157 同一天發布。Tor Browser 15.0.24 已經跟上 140.17。

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
