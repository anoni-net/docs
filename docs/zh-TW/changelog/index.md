---
title: 軟體更新日誌
description: Tor、tor daemon、Tails、OONI、Arti、OnionShare、iOS 與 GrapheneOS 各版本更新的中文重點整理，從上游 changelog 翻譯而成，方便台灣與華語讀者快速掌握每次發布的關鍵變更與安全修補。
icon: material/history
---

# :material-history: 軟體更新日誌

匿名網路工具與常用作業系統每次版本發布的重點整理，由社群志工從上游 changelog 翻譯精簡而來。每一則都連回上游公告，內容是摘譯。例行版本更新會以條目形式累積在此頁面，遇到重大事件（安全稽核、新架構公告、有強烈台灣脈絡的功能）會在 [近期公告](../blog/index.md) 寫成完整文章。

## 先看哪一頁

多數人只需要兩頁：[Tor 更新日誌](./tor.md)，加上自己裝置對應的那一頁（iPhone 看 iOS、Mac 看 macOS、Windows 電腦看 Windows、Android 手機看 Android）。其餘頁面是給有特定需求的人，例如自架中繼、被封鎖需要換傳輸、做審查觀測。

標「含急迫程度分級」的頁面用三色標籤回答「該多快處理」，各頁的判準基礎不完全相同，寫在該頁開頭。沒有標籤的頁面性質是進度或功能整理，讀者不需要為它們做更新決定。

## 匿名工具

從上游 changelog 逐版摘譯，保留版本號與追蹤編號。

- :simple-torbrowser: [Tor 更新日誌](./tor.md)：Tor Browser 的穩定版與 Alpha 通道
- :material-server-network: [tor daemon 更新日誌](./tor-daemon.md)：c-tor 的安全釋出，給中繼與 onion 服務營運者（含急迫程度分級）
- :material-shield-key-outline: [抗審查傳輸更新日誌](./anti-censorship.md)：Snowflake、WebTunnel、obfs4，連不上 Tor 時要換的那幾種
- :material-code-tags: [Arti 更新日誌](./arti.md)：Tor Project 的 Rust 實作，開發中，一般讀者目前用不到
- :material-access-point-network: [OONI 更新日誌](./ooni.md)：OONI Probe 與量測引擎，做審查觀測的人才需要追
- :material-share-variant: [OnionShare 更新日誌](./onionshare.md)：OnionShare 檔案分享與匿名網站（含急迫程度分級）

## 作業系統

裝置本身就是攻擊面。作業系統這一組不逐條翻譯，改成回答「需不需要現在更新」。Android 與 GrapheneOS 兩頁是例外，前者拿不到上游明細、後者走自動更新，原因寫在各自頁面開頭。

- :material-usb-flash-drive-outline: [Tails 更新日誌](./tails.md)：Tails 作業系統（含急迫程度分級）
- :material-apple-ios: [iOS 安全更新](./ios.md)：iPhone 與 iPad，含急迫程度分級與舊機支援狀況
- :material-apple: [macOS 安全更新](./macos.md)：Mac，含急迫程度分級與三條維護線的狀態
- :material-microsoft-windows: [Windows 安全更新](./windows.md)：每月 Patch Tuesday，含急迫程度分級，先分清楚桌面還是伺服器
- :material-cellphone-lock: [GrapheneOS 月度更新摘要](./grapheneos.md)：Pixel 上的強化 Android，按月聚合
- :material-android: [Android 安全修補等級](./android.md)：每月修補等級與 CVE 數，先查自己的裝置落後多少
