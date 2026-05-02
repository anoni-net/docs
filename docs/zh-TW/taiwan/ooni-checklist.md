---
title: OONI 網站檢測清單
description: OONI Probe 在台灣使用的網站檢測清單怎麼維護，以及社群如何協助分類與更新。
icon: material/list-status
---
# :material-list-status: OONI 網站檢測清單

這頁是 [在地脈絡 → 連線層的在地觀測](./index.md) 群組的入門起點。在談「台灣的連線環境怎麼樣」之前，要先回答一個基本問題：「我們在測什麼網站？」OONI Probe 不是全網掃描，每次檢測會根據一份事前列舉的網站清單逐一執行。這份清單怎麼維護、怎麼更新、誰在貢獻，是後續 [ASN 覆蓋率分析](./ooni-asn-coverage.md) 與其他觀測解讀的前提。

<figure markdown="span">
    <a target="_blank"
       href="../../assets/images/ooni_asn.svg">
        <img src="../../assets/images/ooni_asn.svg"
            alt="OONI Probe 檢測流程"
            title="OONI Probe 檢測流程"
        >
    </a>
    <caption>OONI Probe 檢測流程</caption>
</figure>

在使用 OONI Probe 進行「網站」檢測時，檢測程式會根據事先列舉的「網站清單」逐一檢測。這裡所提及的「網站清單」實際上是透過 [Citizen Lab](https://citizenlab.ca/){target="_blank"} 所維護的 [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 專案，分別收錄本地（local）、全球（global）熱門的網站網址。

全球（global）名單上的大多數網站以英語呈現。本地名單則由地區提供，內容涵蓋當地和地區層級的多種分類，並使用當地語言。在有網際網路審查的國家，本地清單還包括了許多已被封鎖的網站。

名單收錄標準大致上可廣泛的分為四大類：

1. **政治：**主要關注於那些表達與現任政府持不同立場的網站。與人權、言論自由、少數族裔權利和宗教運動更廣泛相關的內容也被納入考量。
2. **社會：**包括與性別、賭博、非法藥物和酒精相關，以及其他可能在社會上被視為敏感或具冒犯性的話題。
3. **衝突、安全：**包括與武裝衝突、邊界爭議、分裂運動和激進團體相關的內容。
4. **網際網路工具：**提供電子郵件、雲端空間、搜尋、翻譯、網路電話（VoIP）服務和規避審查方法的網站被歸類在這一類別中。

## 台灣觀察名單現況

目前台灣的名單 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank" } 大部分在 2017 年新增建立，由於後續沒有持續維護，目前名單上有滿多網站已經結束或更換品牌網址，舊網址無效或仍是 `http://` 開頭，需要先整理目前的名單內容。

!!! note "http:// → https://"

    有些網站不會自動將 `http://` 開頭的傳輸協定透過轉址方式（如：[`301 Moved Permanently`](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status/301){target="_blank"}、[`308 Permanent Redirect`](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status/308){target="_blank"}）到 `https://` 而造成檢測錯誤。在申請 TLS/SSL 憑證門檻降低與加密傳輸成為基本網站建構條件下，`https://` 應為預設的輸入網址格式。

## 名單更新

第一步需要逐一檢查目前在 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} 上所列舉的網站狀況，標記「需更新」或「可棄用」。再提交 [Pull Request](https://gitbook.tw/chapters/github/pull-request){target="_blank"} 到 [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 請求更新。

!!! info "PR #1444"

    社群在 2023/09/28 [提交過一份檢測名單修正](https://github.com/citizenlab/test-lists/pull/1444){target="_blank"}，後續持續整理中。

## 名單新增

名單於 2017 年建立後，已多年未作大規模調整，需要審視目前也需要加入檢測的網站清單。「新增什麼」的判斷會依四大分類（政治、社會、衝突安全、網際網路工具）做篩選，社群協作中持續討論。

## 志工怎麼參與

清單維護是非常適合新貢獻者入門的工作，不需要寫程式，需要的是：

- **網路使用者的觀察力**：哪些網站在台灣被討論、哪些近期關閉、哪些是新出現值得納入的對象
- **判斷分類的能力**：對照 Citizen Lab 四大分類做歸類
- **基本的 GitHub 操作**：fork、修改 csv、提交 PR

具體入口：

- 想參與名單維護：到 Matrix 的 anoni-net 公開空間表達意願，會有夥伴協助分配對象
- 想參與技術擷取分析：見 [ASN 自治網路觀測資料分析](./ooni-asn-coverage.md) 與 [ASN 觀測資料擷取與分析](../community/asn-coverage-howto.md)
- 想了解整體社群運作：見 [如何參與與認領主題](../community/how-to-contribute.md)

## 下一步

<div class="grid cards" markdown>

- [:material-access-point-network: ASN 自治網路觀測資料分析](./ooni-asn-coverage.md)
- [:material-chart-bar: Tor Relays 觀測點](./tor-relay-watcher.md)
- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)
- [:material-chat-question: 什麼是 OONI？](../tools/what-is-ooni.md)

</div>
