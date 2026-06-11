---
title: Tor Browser 進階設定
description: 台灣連 Tor 通常不必開橋接，但出國、進高敏感場景或想換出口節點時，這六組進階設定（橋接、安全等級、身分隔離、電路檢視、Onion 站點、指紋抗性）能讓 Tor Browser 用得更精準。
icon: material/cog-outline
---

# :material-cog-outline: Tor Browser 進階設定

Tor Browser 的預設值已能涵蓋大部分日常情境，但在被封鎖的網路、進階威脅模型、需要切換多個身分時，預設值不夠用。這篇文章逐項看 Tor Browser 的進階設定：連線（Connection Assist 與橋接）、安全等級、身分隔離、電路檢視、Onion 站點偏好、指紋抗性、行動版，最後列出在台灣常見的錯誤訊息與排解步驟。調整設定之前可以先回頭看 [威脅模型如何建立](../basics/threat-model.md)，知道自己在抗誰。

如果還沒讀過 Tor 的基本原理，可以先看 [什麼是 Tor](./what-is-tor.md)。本文預設讀者已知道 Guard、Middle、Exit 三層中繼。

## 連線：Connection Assist 與橋接

Tor Browser 11.5 起，**Connection Assist**[^1] 達到穩定版本：偵測你的地區與連線狀況，自動選擇合適的橋接（bridge）設定。在台灣多數情境不需要橋接，網路自由度高、ISP 不主動封鎖 Tor 入口節點。出國（中國、伊朗、緬甸這類審查地區）才需要手動啟用橋接。

可選的橋接類型：

- **obfs4**：流量混淆，老牌 pluggable transport，多數情境可用
- **Snowflake**：短暫配對的 WebRTC 橋接點，IP 流動性高
- **meek-azure**：流量偽裝成往 Microsoft Azure 的 HTTPS 請求
- **WebTunnel**：較新的 transport（2024 年後成熟），完全偽裝成一般 HTTPS 站點流量

如果 Connection Assist 找到的橋接不通，可以手動取得新橋接：到 [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} 領取、寫信給 `bridges@torproject.org`、或使用 Telegram bot `@GetBridgesBot`。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-connection-assist.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-connection-assist.png"
            alt="Tor Browser 的 Connection Assist 與橋接設定"
            title="Tor Browser 的 Connection Assist 與橋接設定"
            class="brand-frame">
    </a>
    <capture>Tor Browser 的 Connection Assist 與橋接設定（詳見 <a href="https://support.torproject.org/zh-TW/bridges/" target="_blank">Tor 官方說明：橋接</a>）</capture>
</figure>

## 安全等級（Security Level）

Tor Browser 提供三段安全等級，從網址列旁的盾牌圖示點開「Change」可切換：

- **Standard**（預設）：JavaScript 全開，網站運作如常
- **Safer**：HTTPS 站點 JS 開、HTTP 站點關閉 JS，禁用部分字型與符號，媒體不自動播放
- **Safest**：JS 全關，媒體預設不播，部分網站表單可能無法送出

何時降到 Safer 或 Safest：陌生 onion 站點、來路不明的釣魚連結、不熟悉的網域。日常瀏覽與需要互動的網站可以保留 Standard。NoScript 仍存在於 Tor Browser 內，但 Tor Project 建議透過 Security Level slider 統一控制，不要直接修改 NoScript 設定。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-security-level.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-security-level.png"
            alt="Tor Browser Security Level slider 的三段選項"
            title="Tor Browser Security Level slider 的三段選項"
            class="brand-frame">
    </a>
    <capture>Tor Browser Security Level slider 的三段選項（詳見 <a href="https://support.torproject.org/zh-TW/security-settings/" target="_blank">Tor 官方說明：安全性等級</a>）</capture>
</figure>

## 身分隔離：New Identity 與 New Tor Circuit

Tor Browser 提供兩種身分切換，效果不同：

- **New Identity**（漢堡選單 → 「New Identity」）：清空 cookies、history、開啟頁面，重啟所有 Tor 連線。等於開一個全新身分。
- **New Tor Circuit for this Site**（網址列旁盾牌 → 「New Tor Circuit」）：保留登入與分頁，只更換中間節點與出口節點。

何時用哪個：

- 跨身分操作之前用 **New Identity**。剛逛完 A 帳號要切去 B 帳號時，必須完整切換，否則 cookies 與瀏覽器狀態會把兩個身分連起來。
- 單一網站連不上、CAPTCHA 不停跳、想換出口國家的時候用 **New Circuit**。保留登入，只換中間與出口節點。

Tor Browser 預設啟用 First Party Isolation，每個分頁的 cookies、cache、storage 都依網域隔離，跨站追蹤難度提高。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-new-identity.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-new-identity.png"
            alt="Tor Browser 漢堡選單顯示 New Identity 與 New Tor Circuit for this Site"
            title="Tor Browser 漢堡選單顯示 New Identity 與 New Tor Circuit for this Site"
            class="brand-frame">
    </a>
    <capture>Tor Browser 漢堡選單顯示 New Identity 與 New Tor Circuit for this Site（詳見 <a href="https://support.torproject.org/zh-TW/managing-identities/" target="_blank">Tor 官方說明：管理身分</a>）</capture>
</figure>

## Tor Circuit 檢視

點網址列旁的盾牌或鎖頭，展開「Tor Circuit for This Site」，會顯示這個分頁目前走的三個 hop（Guard、Middle、Exit）與各自的所在國家。

實際用途：

- 確認出口國家。某些網站根據 IP 提供不同地區內容，影片可能有地區鎖
- 發現連線異常。出口節點若在某網站封鎖的國家（例如出口在中國連歐洲新聞媒體），網站可能拒絕服務
- 排解 CAPTCHA 無限循環。看到出口國家後，用 New Circuit 換到別的國家試試

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-circuit-display.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-circuit-display.png"
            alt="Tor Browser 顯示當前 Tor Circuit 的三層中繼節點與所在國家"
            title="Tor Browser 顯示當前 Tor Circuit 的三層中繼節點與所在國家"
            class="brand-frame">
    </a>
    <capture>Tor Browser 顯示當前 Tor Circuit 的三層中繼節點與所在國家（詳見 <a href="https://support.torproject.org/zh-TW/managing-identities/" target="_blank">Tor 官方說明：管理身分</a>）</capture>
</figure>

## Onion 站點偏好

許多媒體與服務提供 onion 對應版本（DuckDuckGo、ProPublica、Facebook、Reuters 都有）。網站透過 `.onion-Location` HTTP header 宣告自己的 onion 位址，Tor Browser 會在頂端跳出提示橫幅，讓你一鍵跳到 onion 版本。

可以到 `about:preferences#privacy` 開啟「Always Prioritize .onion sites」，之後 Tor Browser 偵測到對應的 onion 站點會自動跳轉，省下手動切換。

驗證 onion 指紋很重要。onion 字串長且不易辨識（v3 onion 是 56 字元 base32），人眼難以逐字驗證。從不可信來源拿 onion 連結，社交工程風險高，建議：

- 從官方網站、官方社群帳號的連結進入，加進書籤
- 第一次造訪後即建立書籤，之後永遠從書籤點
- 不要相信第三方文件、論壇貼文裡列出的 onion 連結

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-onion-location.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-onion-location.png"
            alt="Tor Browser 對 .onion-Location 的提示與 onion 站點偏好設定"
            title="Tor Browser 對 .onion-Location 的提示與 onion 站點偏好設定"
            class="brand-frame">
    </a>
    <capture>Tor Browser 對 .onion-Location 的提示與 onion 站點偏好設定（詳見 <a href="https://support.torproject.org/zh-TW/onion-services/" target="_blank">Tor 官方說明：洋蔥服務</a>）</capture>
</figure>

## 指紋抗性與視窗大小

Tor Browser 的匿名性靠「全球使用者長得一樣」維持。幾個基本動作都會破壞這個前提：

- **不要最大化視窗**。Tor Browser 內建 letterboxing[^2]，會自動加灰邊把可視區域對齊到 200×100 倍數，但仍建議保留預設視窗。最大化等於告訴網站你的螢幕解析度
- **不要安裝其他瀏覽器擴充套件**。NoScript 與 HTTPS 相關（已內建）以外的擴充套件，會讓你的 Tor Browser 跟全世界其他人不一樣，反而更容易被指紋追蹤
- **不要登入會綁真實身分的帳號**。Gmail 個人帳、Facebook 真實姓名、銀行帳號這類，登入瞬間匿名性失效，後面所有 Tor 流量都跟你的真實身分連起來
- HTTPS-only 模式預設開啟，無需手動設定

## 行動版

桌面版以外的選擇有限：

- **Android**：[Tor Browser for Android](https://www.torproject.org/download/#android){target="_blank"}（Tor Project 官方），跟桌面版同一個 Tor 引擎，多數設定齊備
- **iOS**：[Onion Browser](https://onionbrowser.com/){target="_blank"}（Mike Tigas 維護的社群版本，**非 Tor Project 官方**）。Apple 的 App Store 政策不允許 Tor Project 直接發 iOS 版本，所有 iOS 上的瀏覽器底層都受限於 WebKit（Safari 內核）

行動裝置上的 Tor 體驗較弱，跟桌面版有幾個差異：

- iOS 因 WebKit 限制，無法做到桌面版完整的指紋抗性
- 行動裝置不適合長時間跑 Snowflake 客戶端，耗電、發熱、進入背景會被系統殺
- 進階威脅模型（記者、行動者）建議優先用桌面版的 Tor Browser，或直接改用 [Tails](./what-is-tails.md)

## 台灣常見錯誤排解

| 訊息 | 可能原因 | 處理 |
|---|---|---|
| `Tor failed to establish a network connection` | ISP 短暫干擾、防火牆阻擋 | 重試。仍失敗則啟用橋接 |
| `PT_PROXY_FAILED` | pluggable transport 啟動失敗 | 換橋接類型，例如 obfs4 換 meek-azure |
| Cloudflare CAPTCHA 無限循環 | 出口節點被該站封鎖 | 用 New Tor Circuit for this Site 換出口 |
| 校園或企業網路阻擋 Tor | 網路管理員封鎖 entry 節點 | 啟用 Connection Assist，自動選 obfs4 或 meek-azure 穿透 |

## 接下來

設定調好之後，可以開一個 [Tor Snowflake](./tor-snowflake.md) 分頁，幫審查地區的人連上 Tor，這是台灣門檻最低的貢獻方式。任務敏感度更高、想連作業系統一起隔離時，再往 [Tails](./what-is-tails.md) 升級。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 什麼是 Tor](./what-is-tor.md)
- [:material-chat-question: 威脅模型如何建立](../basics/threat-model.md)
- [:material-chat-question: 什麼是匿名網路](./what-is-anonymity-network.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-snowflake: Tor Snowflake 橋接點](./tor-snowflake.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>

[^1]: [New Release: Tor Browser 11.5](https://blog.torproject.org/new-release-tor-browser-115/){target="_blank"} - The Tor Project Blog
[^2]: [Anti-Fingerprinting / Letterboxing](https://tb-manual.torproject.org/anti-fingerprinting/){target="_blank"} - Tor Browser User Manual
