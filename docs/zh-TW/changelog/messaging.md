---
title: 通訊軟體安全更新
description: WhatsApp 與 Signal 的安全公告整理，說明有沒有已被利用的漏洞、影響哪些平台、要更新到哪一版。
icon: material/message-lock-outline
digest:
  name: 通訊軟體
  devices: [iphone, android, windows, mac, linux]
  tracks: [WhatsApp, Signal]
  basis: 依上游是否標注已被利用分級
---

# :material-message-lock-outline: 通訊軟體安全更新

WhatsApp 與 Signal 的安全公告整理，新的永遠在最上面。通訊軟體會自動處理陌生人傳來的訊息、圖片與連結，有些漏洞不需要使用者點開就會觸發，針對記者、倡議工作者這類特定目標的攻擊常從這裡進來。2025 年 8 月，Meta 評估 WhatsApp 的 CVE-2025-55177 與 Apple 系統的 CVE-2025-43300 被串在一起，用來攻擊特定的使用者，CISA 也把它收進已知遭利用漏洞目錄（KEV）。

兩個軟體的公告方式不同。WhatsApp 由 Meta 以 CVE 發布，[WhatsApp 安全公告](https://www.whatsapp.com/security/advisories){target="_blank"}按年整理。Signal 很少發布獨立的安全公告，修補通常直接包在一般版本裡，這一頁在 Signal 有公開的安全問題時才會加上條目。

## 急迫程度怎麼判斷

- <span class="urg-tag urg-tag--now">立刻</span>上游標注已被實際利用，或被 CISA 收進 KEV。
- <span class="urg-tag urg-tag--soon">儘快</span>有公開的安全公告，上游沒有標注已被利用。通訊軟體的漏洞常常不需要使用者操作就能觸發，所以只要有公告就列為儘快。

這一頁不收沒有安全公告的版本，所以不會出現「一般」。「立刻」需要證據，跟 iOS、Windows 那幾頁用同一個判準。

## 2026 年 7 月到 11 月的狀況 { #2026-年-7-月到-9-月的狀況 }

5 月之後，WhatsApp 一直到 11 月 20 日才再公開三個 CVE，整理在下面那一則。截至 11 月 21 日，Signal 沒有發布新的安全公告，CISA 的 KEV 也沒有新增這兩個軟體的項目。Signal 在 7 到 9 月三個平台共發了 41 個正式版，10 月 1 日到 11 月 10 日另有 20 個（Android 6 個、iOS 8 個、桌面版 6 個），11 月 11 日到 21 日再有 5 個（Android 1 個、iOS 2 個、桌面版 2 個），發布說明都沒有提到安全修補。

沒有公告的時候也要保持自動更新。Signal 的每個版本都有使用期限，太舊的版本會停止運作並要求更新。WhatsApp 的 Windows 版透過 Microsoft Store 更新，要確認商店的自動更新沒有關掉。

## WhatsApp 2026 年 11 月

> 2026-11-20 · [WhatsApp 安全公告](https://www.whatsapp.com/security/advisories/2026/){target="_blank"} · [CVE-2026-23871](https://www.facebook.com/security/advisories/cve-2026-23871){target="_blank"} · [CVE-2026-102769](https://www.facebook.com/security/advisories/cve-2026-102769){target="_blank"} · [CVE-2026-44908](https://www.facebook.com/security/advisories/cve-2026-44908){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>三個漏洞同一天公開，其中 CVE-2026-23871 的公告寫明可能已經跟特定的垃圾訊息一起被濫用（may have been abused），依本頁的判準列為立刻。三項的修補版本都已經發布一段時間，有開自動更新的人多半早就涵蓋，請確認 Android 版是 2.26.35.74 以後（一次涵蓋三項）、iOS 版是 2.26.24.72 以後、Mac 版是 2.26.23.72 以後。
- CVE-2026-23871：Android 版與 WhatsApp Business 的 Android 版，處理「點擊開啟 WhatsApp」廣告的回覆訊息時，外部網址驗證不完整。攻擊者送出經過設計的廣告回覆訊息，訊息在對話裡顯示時，裝置會去攻擊者控制的網址取得媒體，對方因此取得你的 IP 位址。2.26.17.4 修掉，CVSS 3.5。截至 11 月 21 日，KEV 沒有收錄這一項。
- CVE-2026-102769：Android 版的 SQL injection。收件人點開非官方用戶端送來的特製「訂單詳情」訊息，可能讓手機裡的 WhatsApp 檔案被刪除。如果收到訊息時人在線上，對方還能利用送達回條的時間差，問出聊天資料庫裡一個位元的資訊。2.26.35.74 修掉，CVSS 6.8，Meta 明說沒有發現實際被利用。
- CVE-2026-44908：WhatsApp 用來確認 Meta AI 機密運算後端可信的遠端證明，沒有正確檢查憑證鏈。位在 Meta 內部基礎設施的人可以繞過硬體信任根，但這樣的憑證需要先公開在 WhatsApp Private Processing 使用的第三方透明度帳本上，Meta 寫明帳本裡每一張憑證都連到硬體信任根，確認沒有被利用。影響 iOS 版 2.26.24.72 以前、Mac 版 2.26.23.72 以前，以及 Android 版 2.26.23.74 以前，CVSS 4.8。
- CVE-2026-23871 跟 5 月的 CVE-2026-23866 與 2025 年 8 月被利用的 CVE-2025-55177 同一類，都是讓裝置去處理攻擊者指定的網址。

## WhatsApp 2026 年 5 月

> 2026-05-01 · [WhatsApp 安全公告](https://www.whatsapp.com/security/advisories/2026/){target="_blank"} · [CVE-2026-23863](https://www.facebook.com/security/advisories/cve-2026-23863){target="_blank"} · [CVE-2026-23866](https://www.facebook.com/security/advisories/cve-2026-23866){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>兩個漏洞，上游明說目前沒有發現被實際利用。
- CVE-2026-23863：Windows 版的附件偽裝。檔名裡夾帶 NUL 字元的文件，在 WhatsApp 裡看起來是一種檔案，打開時卻會被當成執行檔執行。v2.3000.1032164386.258709 之前的版本都受影響。
- CVE-2026-23866：iOS 與 Android 版處理 Instagram Reels 的 AI 回覆訊息時驗證不完整，對方可以讓你的裝置去處理任意網址的媒體內容，還可能觸發作業系統的自訂網址協定（custom URL scheme）。影響 iOS 版 2.25.8.0 到 2.26.15.72、Android 版 2.25.8.0 到 2.26.7.10。
- 第二個的觸發方式跟 2025 年 8 月被利用的 CVE-2025-55177 相近，都是讓裝置去處理攻擊者指定的網址。
