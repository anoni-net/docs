---
title: ASN 自治網路觀測資料分析
description: 台灣各 ASN 的 OONI 觀測覆蓋率分析，從盲點看哪些電信商與網路系統需要更多測試。
icon: material/access-point-network
---

# :material-access-point-network: ASN 自治網路觀測資料分析

從 [OONI 網站檢測清單](./ooni-checklist.md) 接續討論「我們在測什麼」之後，這篇進一步看「實際在測的人有誰、覆蓋了哪些網路」。OONI Probe 的測量結果固然多，但如果絕大多數測量都來自同一兩家電信商，整體觀測就只能反映那幾家的網路狀況，無法代表整個台灣的連線環境。哪天某個網站只在特定一家電信商被擋，而那家剛好沒人在測，這次封鎖就不會被記錄下來。ASN（Autonomous System Number，網際網路上每個獨立管理網路的身分編號，電信商、企業、學術機構、CDN 業者各有各的）多樣性不足，是台灣 OONI 觀測資料目前最明確的問題之一。

## 為什麼關注 ASN 多樣性

網際網路是由許多自治系統（Autonomous System，AS）相互連結而成。每個 AS 是一群統一管理的網路（電信商、學術機構、企業、CDN 服務商等）所控制的網路群組，擁有獨立的路由策略，並透過 BGP（網路之間互相通報「我這邊能連到哪些位址」的協定）與其他 AS 交換流量。每個 AS 有獨一無二的識別號碼（ASN）。

<figure markdown="span" style="width: 80%;">
    <a target="_blank"
       href="https://www.cloudflare.com/zh-tw/learning/network-layer/what-is-an-autonomous-system/">
        <img src="../../assets/images/autonomous-system-diagram.svg"
            alt="ASN 在實際網路上串連在一起，圖示來源：cloudflare.com"
            title="ASN 在實際網路上串連在一起，圖示來源：cloudflare.com">
    </a>
    <caption>ASN 在實際網路上串連在一起（[圖片來源](https://www.cloudflare.com/zh-tw/learning/network-layer/what-is-an-autonomous-system/){target="_blank"}）。</caption>
</figure>

對 OONI 觀測來說，ASN 是「在哪一家網路上看到審查」的最小單位。同一個網站可能在中華電信看不到、在台灣大哥大看得到，這種差異需要先以 ASN 為單位才能區分清楚。所以 OONI 分析常常會問「這個地區的測量資料有多少不同的 ASN 來源」，這個比例越高，越能反映該區域的整體連線環境。

??? question "想知道自己連線的 ASN？"

    - [ip.me](https://ip.me/){target="_blank"}：顯示目前 IP 與所屬 ASN
    - [Cloudflare Radar（AS3462）](https://radar.cloudflare.com/zh-tw/as3462){target="_blank"}：觀察 ASN 流量趨勢與歷程
    - [Is BGP safe yet?](https://isbgpsafeyet.com/){target="_blank"}：檢查目前 ISP 的 BGP 是否安全

??? question "想了解 BGP 劫持、AS 行為等延伸主題？"

    參考 [Cloudflare Learning - What is an autonomous system?](https://www.cloudflare.com/zh-tw/learning/network-layer/what-is-an-autonomous-system/){target="_blank"} 與 [What is BGP?](https://www.cloudflare.com/zh-tw/learning/security/glossary/what-is-bgp/){target="_blank"}。

## 台灣現況：少數電信商佔掉大半測量

[OONI](http://ooni.org/){target="_blank"} 透過全球志工夥伴使用 [Probe 觀測程式](https://ooni.org/install/){target="_blank"} 檢測網路審查狀況。所有測量結果上傳到專案的 [公開資料庫](https://registry.opendata.aws/ooni/){target="_blank"}。

2023/11 ~ 2024/03 期間，社群透過 [程式抓取](https://github.com/anoni-net/docs/tree/main/asn_coverage){target="_blank"} 公開資料初步分析台灣的觀測樣態。根據 2023/12 的 [報告](https://ocf.tw/p/ooni/report/202312.html){target="_blank"}：

- 台灣的觀察資料數量在 OONI Explorer 排名前十名，**數量上充足**
- 但 78.94% 的測量集中在 [AS3462（中華電信）](https://radar.cloudflare.com/zh-tw/as3462){target="_blank"} 與 [AS18041（Taiwan Digital Streaming）](https://radar.cloudflare.com/zh-tw/as18041){target="_blank"}
- 台灣目前約 437 組 ASN，但測量資料中不重複的 ASN 數量僅 7.32%

這幾個數字合起來，說明台灣的觀測還不夠全面與多樣，無法反映完整的網路樣態。三大電信業者、有線電視寬頻、固網、第二類電信（租用電信基礎設施提供服務的業者，例如虛擬行動網路、網路電話轉售等）等，都有覆蓋不足的問題。

[:material-chart-bar: 2023/12 觀察報告](https://ocf.tw/p/ooni/report/202312.html){ .md-button .md-button--primary target="_blank" }

## 如何解讀單筆測量資料（進階）

這一節示範如何讀懂一筆原始測量紀錄，適合想自己動手分析的人，一般讀者可以直接跳到下一節。想了解單筆 OONI 測量的內容如何判讀，從 OONI Probe 操作開始：

1. 下載 [OONI Probe](https://ooni.org/install/){target="_blank"}（行動裝置或桌面版本）
2. 開啟 OONI Probe、選擇「網站」項目並執行檢測
3. 完成後到「測試結果」找到剛剛的網站檢測，檢視是否有「！」或「？」項目
4. 點擊任一「！」或「？」查看可能的檢測問題。其中可看到「數據」、「在 OONI Explorer 中顯示」連結
5. 點擊連結即可查看原始數據資料

舉例：[`20241024185921.623617_TW_webconnectivity_578b6d3845fed2e2`](https://explorer.ooni.org/zh-Hant/m/20241024185921.623617_TW_webconnectivity_578b6d3845fed2e2){target="_blank"}

此筆結果為「在 AS3462 上執行檢測失敗」，失敗訊息 `unknown_failure: dial tcp [scrubbed]: connect: host is down`，可斷定為網站已不提供服務。在「DNS 查詢」段落可看到 `www.asap.com.tw` 設定 DNS `A` 指向 `60.250.151.72 (AS3462 (Chunghwa Telecom Co., Ltd.)`，其來自 Cloudflare DNS 的查詢結果。

「原始測量資料」會列出所有檢測項目的細節，有些不會完整顯示在結果頁面，但可從這裡找到更多分析素材。

<figure markdown="span">
    <a target="_blank"
       href="../../assets/images/ooni_raw_data.png">
        <img src="../../assets/images/ooni_raw_data.png"
            alt="OONI Probe「原始測量資料」的資訊"
            title="OONI Probe「原始測量資料」的資訊"
            style="border: 1px solid #000000; border-radius: 10px;">
    </a>
    <caption>OONI Probe「原始測量資料」的資訊。</caption>
</figure>

!!! question "AS 與 DNS 的差異"

    OONI Probe 會將檢測過程都記錄下來。這個範例顯示：即使透過中華電信網路上網，DNS 查詢服務卻是用 Cloudflare 的。

    - 問題：網站受到阻擋無法連線存取，是 AS 還是 DNS 的問題呢？

## 想動手分析？

如果你想自己擷取與分析 OONI 公開資料，計算特定區域的 ASN 覆蓋率，相關工具設定與指令見：

[:material-database-search: ASN 觀測資料擷取與分析](../community/asn-coverage-howto.md){ .md-button .md-button--primary }

## 後續方向

- 持續追蹤台灣 ASN 覆蓋率隨時間的變化（社群志工協作中）
- 把 [Pulse 後端](https://api.anoni.net/api/readme){target="_blank"} 的觀測資料用 Vega-Lite 圖表呈現在這頁
- 與 [OONI 網站檢測清單](./ooni-checklist.md) 維護工作搭配，提升觀測品質與多樣性

## 下一步

<div class="grid cards" markdown>

- [:material-list-status: OONI 網站檢測清單](./ooni-checklist.md)
- [:material-chart-bar: Tor Relays 觀測點](./tor-relay-watcher.md)
- [:material-database-search: ASN 觀測資料擷取與分析](../community/asn-coverage-howto.md)
- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)

</div>
