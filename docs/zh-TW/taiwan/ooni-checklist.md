---
title: OONI 網站檢測清單
description: OONI Probe 在台灣使用的網站檢測清單如何維護，以及社群如何協助分類與更新。
icon: material/list-status
---
# :material-list-status: OONI 網站檢測清單

這頁是 [在地脈絡 → 連線層的在地觀測](./index.md) 群組的入門起點。OONI Probe 每次檢測都依據一份事前列舉的網站清單，逐一檢查每個網址的連線狀況。清單上收錄什麼、由誰維護、多久更新一次，會直接影響 [ASN 覆蓋率分析](./ooni-asn-coverage.md) 等後續觀測能讀出什麼。

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

這份清單由 [Citizen Lab](https://citizenlab.ca/){target="_blank"} 維護的 [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 專案管理，分成本地（local）與全球（global）兩種，分別收錄各地與全球的熱門網址。

全球名單以英文網站為主。本地名單由各地區社群協助蒐集，貼近當地脈絡、用當地語言呈現。在有網路審查的國家，本地清單也會收錄已被封鎖的網站，方便後續觀測。

名單收錄標準大致分為四大類：

1. **政治**：與現任政府立場不同的網站。人權、言論自由、少數族群權利、宗教運動等延伸主題也包含在內。
2. **社會**：性別、賭博、非法藥物、酒精，以及其他在當地被視為敏感的議題。
3. **衝突、安全**：武裝衝突、邊界爭議、分裂運動、激進團體相關的內容。
4. **網際網路工具**：電子郵件、雲端空間、搜尋、翻譯、網路電話（VoIP）、規避審查工具等服務。

## 台灣觀察名單現況

台灣的名單 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank" } 大多在 2017 年建立，之後沒有持續維護，現在名單上有不少網站已經停止營運或換了品牌網址，也有許多項目仍是 `http://` 開頭，需要先整理一輪。

!!! note "http:// → https://"

    有些網站不會自動把 `http://` 透過 [`301 Moved Permanently`](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status/301){target="_blank"} 或 [`308 Permanent Redirect`](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status/308){target="_blank"} 轉址到 `https://`，這會讓 OONI 檢測誤判。現在 TLS/SSL 憑證取得門檻已經很低，加密傳輸也是網站基本配備，清單上的網址預設應該用 `https://`。

## 名單更新

第一步需要逐一檢查目前在 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} 上所列舉的網站狀況，標記「需更新」或「可棄用」。再提交 [Pull Request](https://gitbook.tw/chapters/github/pull-request){target="_blank"} 到 [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 請求更新。

!!! info "PR #1444"

    社群在 2023/09/28 [提交過一份檢測名單修正](https://github.com/citizenlab/test-lists/pull/1444){target="_blank"}，後續持續整理中。

## 名單新增

名單從 2017 年建立後就沒有再做大規模調整，需要重新盤點哪些網站值得加進來。新增的判斷依四大分類（政治、社會、衝突與安全、網際網路工具）做篩選，這部分社群還在持續討論。

## 志工如何參與

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
