---
title: 抗審查傳輸更新日誌
description: Snowflake、WebTunnel、lyrebird 各版本的中文重點整理，說明每次更新對繞過封鎖有什麼影響，以及三種傳輸各自適合什麼情況。
icon: material/shield-key-outline
---

# :material-shield-key-outline: 抗審查傳輸更新日誌

連不上 Tor 網路時要換的那幾種傳輸方式（pluggable transports）的版本整理。這裡的更新多半在調整偽裝手法，跟封鎖方的偵測是持續來回的過程，所以看更新的重點放在「偽裝有沒有跟上」，而不是安全修補。相關的使用說明見 [Tor Browser 進階設定](../tools/tor-browser-advanced.md)與 [Snowflake](../tools/tor-snowflake.md)。

新版本永遠在最上面。

## 三種傳輸適合什麼情況

- **Snowflake**：不需要事先取得橋接位址，在 Tor Browser 裡選了就能用，靠世界各地志願者的瀏覽器當臨時中轉。適合封鎖不算嚴密、或臨時需要連線的情況。速度不穩定是它的常態。
- **WebTunnel**：把 Tor 流量包裝成一般的 HTTPS 網站流量，在只放行 443 埠又做深度封包檢測的網路裡最有機會。需要事先取得橋接位址。
- **obfs4**：老牌選項，把流量變成沒有特徵的隨機位元組。在已經針對它建立特徵庫的地區成功率會下降，執行它的程式現在是 lyrebird。

三種都在 Tor Browser 的連線設定裡，不必另外安裝。橋接位址可以從 [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} 或 Moat 自動取得。

## WebTunnel 0.0.6

> 2026-07-23 · [專案頁](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel){target="_blank"}

- 加入 Debian 套件，架設 WebTunnel 橋接的人不必再自己編譯。
- WebTunnel 沒有維護獨立的 changelog，這一頁的條目是從版本標籤與提交訊息整理的，細節比其他兩個專案少。

## WebTunnel 0.0.5

> 2026-07-02 · [專案頁](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel){target="_blank"}

- 新增可信任代理跳數（Trusted Proxy Hops）設定。橋接架在 CDN 或反向代理後面時，這個設定決定要信任幾層轉發標頭，關係到記錄下來的用戶端位址正不正確。

## Snowflake 2.14.1

> 2026-06-25 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- 檢查型別斷言，並驗證收到的 WebRTC offer 與 answer（issue 40546）。這類輸入來自對面的節點，沒有驗證就處理有機會讓代理端崩潰，回報者是 Bogdan Barchuk 與 Alexander Kucher。
- Probetest 加入以 SOCKS5 為基礎的互動連線測試，用來排查代理端連不上的問題。

## Snowflake 2.14.0

> 2026-06-09 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- 更新 covert-dtls 並整理公開介面。covert-dtls 負責讓 DTLS 交握看起來像一般的 WebRTC 應用，是 Snowflake 避開特徵偵測的關鍵一環。
- covert-dtls 設定新增 `none` 選項，代理端可以關掉偽裝。
- Broker 的輪詢間隔改為可從檔案載入並以毫秒表示，代理端不必再重新編譯就能調整回報頻率。
- 修掉 Broker 一個可能的 nil 指標解參考，以及計量啟動失敗時沒有回報監聽錯誤的問題。

## Snowflake 2.13.0

> 2026-04-08 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- 代理端的 covert-dtls 預設值改為 `randomizemimic`（issue 40530），DTLS 交握的特徵每次都不一樣，比固定模仿單一實作更難被建成特徵。
- Broker 加入輪詢間隔欄位與 `NextPoll` 訊息，讓代理端知道下次該什麼時候回報。

## Snowflake 2.13.1、2.12.1

> 2026-03-10 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- 兩個版本都只修發布流程使用的 Go 版本（分別是 1.24 與 1.23），功能沒有變動。

## lyrebird 0.8.1

> 2026-01-14 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/lyrebird/-/blob/main/ChangeLog){target="_blank"}

- 修正 chrome120 模仿設定檔。lyrebird 用 uTLS 模仿特定瀏覽器的 TLS 指紋，模仿設定檔一旦跟真實的 Chrome 對不上，反而變成可辨識的特徵。
- lyrebird 是 obfs4、meek、WebTunnel 與 Snowflake 的統一執行程式，Tor Browser 內建的就是它。0.7.0 為 WebTunnel 加了憑證雜湊鏈釘選、多重伺服器名稱與 SNI 模仿選項，0.8.0 讓 meek 支援多組網址與 front 配對。
