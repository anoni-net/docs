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

## 2026 年 7 月到 9 月的狀況

這三個月 WhatsApp 與 Signal 都沒有發布新的安全公告。WhatsApp 最近一次是 5 月的兩個 CVE，收在下面。Signal 同期在三個平台共發了 41 個正式版，發布說明都沒有提到安全修補。

沒有公告的時候也要保持自動更新。Signal 的每個版本都有使用期限，太舊的版本會停止運作並要求更新。WhatsApp 的 Windows 版透過 Microsoft Store 更新，要確認商店的自動更新沒有關掉。

## WhatsApp 2026 年 5 月

> 2026-05-01 · [WhatsApp 安全公告](https://www.whatsapp.com/security/advisories/2026/){target="_blank"} · [CVE-2026-23863](https://www.facebook.com/security/advisories/cve-2026-23863){target="_blank"} · [CVE-2026-23866](https://www.facebook.com/security/advisories/cve-2026-23866){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>兩個漏洞，上游明說目前沒有發現被實際利用。
- CVE-2026-23863：Windows 版的附件偽裝。檔名裡夾帶 NUL 字元的文件，在 WhatsApp 裡看起來是一種檔案，打開時卻會被當成執行檔執行。v2.3000.1032164386.258709 之前的版本都受影響。
- CVE-2026-23866：iOS 與 Android 版處理 Instagram Reels 的 AI 回覆訊息時驗證不完整，對方可以讓你的裝置去處理任意網址的媒體內容，還可能觸發作業系統的自訂網址協定（custom URL scheme）。影響 iOS 版 2.25.8.0 到 2.26.15.72、Android 版 2.25.8.0 到 2.26.7.10。
- 第二個的觸發方式跟 2025 年 8 月被利用的 CVE-2025-55177 相近，都是讓裝置去處理攻擊者指定的網址。
