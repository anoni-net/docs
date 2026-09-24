---
title: 軟體更新日誌
description: Tor、tor daemon、Tails、OONI、Arti、OnionShare、iOS 與 GrapheneOS 各版本更新的中文重點整理，從上游 changelog 翻譯而成，方便台灣與華語讀者快速掌握每次發布的關鍵變更與安全修補。
icon: material/history
changelog_digest:
  days: 45
  date_format: "{y}/{m}/{d}"
  asof: 資料截至 {date}，網站每次重新建置時更新
  filter_label: 依裝置與用途篩選
  all: 全部
  latest: 最新：{title} · {date}
  empty_now: 過去 45 天沒有需要立刻或儘快處理的更新。
  empty_recent: 過去 45 天沒有新的條目。
  empty_filtered: 這個選項在這段期間沒有對應的條目。
  subscribe: 訂閱「{label}」
  subscribe_urgent: 只訂閱立刻與儘快
  feed_label: "RSS："
  feed_title: anoni.net 軟體更新日誌：{label}
  feed_description: 匿名工具與作業系統的版本更新與安全修補，整理自上游公告，每一則連回 anoni.net 文件站上的中文說明。
  feed_urgent: 立刻與儘快
  filters:
    - id: iphone
      label: iPhone 與 iPad
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
      label: 架設中繼或 onion 服務
    - id: ooni
      label: 審查觀測
---

# :material-history: 軟體更新日誌

匿名網路工具與常用作業系統每次版本發布的重點整理，由社群志工從上游 changelog 翻譯精簡而來。每一則都連回上游公告，內容是摘譯。例行版本更新會以條目形式累積在此頁面，遇到重大事件（安全稽核、新架構公告、有強烈台灣脈絡的功能）會在 [近期公告](../blog/index.md) 寫成完整文章。

## 最近的更新

<!-- changelog-digest:filter -->

### 現在要處理的

有急迫程度分級的六頁各取最新一則，只列「立刻」與「儘快」。各頁分級的判準不同，寫在每一項的日期後面。

<!-- changelog-digest:now -->

### 最近 45 天

十二頁在這段期間的所有條目，新的在最上面。

<!-- changelog-digest:recent -->

## 先看哪一頁

多數人只需要兩頁：[Tor 更新日誌](./tor.md)，加上自己裝置對應的那一頁（iPhone 看 iOS、Mac 看 macOS、Windows 電腦看 Windows、Android 手機看 Android）。其餘頁面是給有特定需求的人，例如自架中繼、被封鎖需要換傳輸、做審查觀測。

標「含急迫程度分級」的頁面用三色標籤回答「該多快處理」，各頁的判準基礎不完全相同，寫在該頁開頭。沒有標籤的頁面性質是進度或功能整理，讀者不需要為它們做更新決定。

## 組織裡負責資安的人

NGO、媒體、社群或小型團隊裡，常有一個人負責提醒大家更新。上游的公告散在十幾個地方，用語也各不相同，這一頁先整理成同一套分級，負責的人每個月花十幾分鐘就能轉成團隊聽得懂的提醒。

第一步是盤點團隊實際在用的裝置與工具，在[最近的更新](#最近的更新)找到對應的篩選項，訂閱那幾份 :material-rss-box:{ .rss-icon } RSS，再加上「只訂閱立刻與儘快」。用閱讀器或團隊聊天室的訂閱機器人接收都可以，新條目一出現就會收到。盤點記下裝置種類與系統版本就夠了，不需要列出誰在用 Tor 或其他匿名工具，那份名單外流的風險比漏掉一次提醒更高。

出現「立刻」時，當天就轉給受影響的人。訊息寫清楚影響哪些裝置與版本、要更新到哪一版、在哪裡檢查版本，並附上條目的連結（每一則的標題都有自己的網址）。直接附連結比轉述數字可靠，微軟與 Apple 的公告在發布後還會修訂，站上的條目會跟著更新。轉達前先看每一項後面寫的判準與對象，例如 tor daemon 的「立刻」只跟架設中繼與 onion 服務的人有關，轉給全團隊只會讓大家以為自己的電腦出了問題。

「儘快」與沒有標籤的更新可以集中在固定的時間提醒，例如每週的例會或每月的內部通訊。Tor Browser 的穩定版現在大約兩週一版，提醒大家看到更新提示就接受，會比逐版轉述內容實際。

確認更新完成時，請成員對照自己的版本號，不必回報到集中的表格。檢查的位置寫在 [iOS 頁的「你的機器走哪一條線」](./ios.md#你的機器走哪一條線)、[macOS 頁的「三條維護線」](./macos.md#三條維護線)與 [Android 頁的「先查自己的裝置落後多少」](./android.md#先查自己的裝置落後多少)。已經拿不到安全更新的舊裝置在盤點時標出來，排進汰換計畫，之後的「立刻」更新都不會涵蓋它們。

向主管或合作單位說明時，以每一則連回的上游公告當依據。這裡的內容是摘譯，數字以上游為準。

## 匿名工具

從上游 changelog 逐版摘譯，保留版本號與追蹤編號。

- :simple-torbrowser: [Tor 更新日誌](./tor.md)：Tor Browser 的穩定版與 Alpha 通道 <!-- changelog-latest:tor -->
- :material-server-network: [tor daemon 更新日誌](./tor-daemon.md)：c-tor 的安全釋出，給中繼與 onion 服務營運者（含急迫程度分級） <!-- changelog-latest:tor-daemon -->
- :material-shield-key-outline: [抗審查傳輸更新日誌](./anti-censorship.md)：Snowflake、WebTunnel、obfs4，連不上 Tor 時要換的那幾種 <!-- changelog-latest:anti-censorship -->
- :material-code-tags: [Arti 更新日誌](./arti.md)：Tor Project 的 Rust 實作，開發中，一般讀者目前用不到 <!-- changelog-latest:arti -->
- :material-access-point-network: [OONI 更新日誌](./ooni.md)：OONI Probe 與量測引擎，做審查觀測的人才需要追 <!-- changelog-latest:ooni -->
- :material-share-variant: [OnionShare 更新日誌](./onionshare.md)：OnionShare 檔案分享與匿名網站（含急迫程度分級） <!-- changelog-latest:onionshare -->

## 作業系統

裝置本身就是攻擊面。作業系統這一組不逐條翻譯，改成回答「需不需要現在更新」。Android 與 GrapheneOS 兩頁是例外，前者拿不到上游明細、後者走自動更新，原因寫在各自頁面開頭。

- :material-usb-flash-drive-outline: [Tails 更新日誌](./tails.md)：Tails 作業系統（含急迫程度分級） <!-- changelog-latest:tails -->
- :material-apple-ios: [iOS 安全更新](./ios.md)：iPhone 與 iPad，含急迫程度分級與舊機支援狀況 <!-- changelog-latest:ios -->
- :material-apple: [macOS 安全更新](./macos.md)：Mac，含急迫程度分級與三條維護線的狀態 <!-- changelog-latest:macos -->
- :material-microsoft-windows: [Windows 安全更新](./windows.md)：每月 Patch Tuesday，含急迫程度分級，先分清楚桌面還是伺服器 <!-- changelog-latest:windows -->
- :material-cellphone-lock: [GrapheneOS 月度更新摘要](./grapheneos.md)：Pixel 上的強化 Android，按月聚合 <!-- changelog-latest:grapheneos -->
- :material-android: [Android 安全修補等級](./android.md)：每月修補等級與 CVE 數，先查自己的裝置落後多少 <!-- changelog-latest:android -->
