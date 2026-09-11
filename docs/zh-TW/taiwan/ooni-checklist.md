---
title: OONI 網站檢測清單
description: OONI Probe 在台灣使用的網站檢測清單如何維護，以及社群如何協助分類與更新。
icon: material/list-status
---
# :material-list-status: OONI 網站檢測清單

要知道台灣的網站有沒有被審查、連線正不正常，需先有一份「要測哪些網站」的清單。[OONI](../tools/what-is-ooni.md) Probe（公民自己就能執行的網路審查檢測工具）每次檢測，都照著一份事前列好的網站清單，逐一檢查每個網址連得上連不上。清單收錄了什麼、由誰維護、多久更新一次，直接決定 [ASN 覆蓋率分析](./ooni-asn-coverage.md) 等後續觀測能不能反映真實情況。台灣這份清單大多停在 2017 年，本頁說明它的現況、如何維護，以及不用寫程式也能參與的地方。

<figure markdown="span">
    <a target="_blank"
       href="../../assets/images/ooni_asn.svg">
        <img src="../../assets/images/ooni_asn.svg"
            alt="OONI Probe 檢測流程"
            title="OONI Probe 檢測流程"
        >
    </a>
    <figcaption>OONI Probe 檢測流程</figcaption>
</figure>

這份清單由 [Citizen Lab](https://citizenlab.ca/){target="_blank"} 維護的 [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 專案管理，分成本地（local）與全球（global）兩種，分別收錄各地與全球的熱門網址。

全球名單以英文網站為主。本地名單由各地區社群協助蒐集，貼近當地脈絡、用當地語言呈現。在有網路審查的國家，本地清單也會收錄已被封鎖的網站，方便後續觀測。

名單收錄標準粗分為四大主題（實際 CSV 以約 30 個細項分類標記）：

1. **政治**：與現任政府立場不同的網站。人權、言論自由、少數族群權利、宗教運動等延伸主題也包含在內。
2. **社會**：性別、賭博、非法藥物、酒精，以及其他在當地被視為敏感的議題。
3. **衝突、安全**：武裝衝突、邊界爭議、分裂運動、激進團體相關的內容。
4. **網際網路工具**：電子郵件、雲端空間、搜尋、翻譯、網路電話（VoIP）、規避審查工具等服務。

## 分類決定一個網址多常被測到

四大分類看起來只是整理用的標籤，實際上它決定了每個網址被測到的頻率。OONI Probe 取得的清單來自 OONI 的 API，是一份排序過的結果，並非直接讀取 CSV。排序依據寫在 [`prio.py`](https://github.com/ooni/backend/blob/master/api/ooniapi/prio.py){target="_blank"}。

排序分兩段計算。

第一段算出每個網址的優先權（priority）。OONI 維護一組規則，每條規則有四個比對欄位：分類、網域、完整網址、國家代碼，`*` 代表不限。命中的規則全部相加，不互相取代。全域預設那條 `*/*/*/*` 給 50，分類規則再疊上去，所以一則歸在新聞媒體（`NEWS`）的網址優先權是 `50 + 100 = 150`，歸在電子商務（`COMM`）的是 `50 + 20 = 70`。

目前的分類階梯（括號內為加上基底 50 之後的實際值）：

| 加權 | 分類 | 實際優先權 |
|---:|---|---:|
| +120 | `GRP` 社群網路 | 170 |
| +100 | `ANON` 匿名與規避工具、`HUMR` 人權、`LGBT`、`NEWS` 新聞媒體、`POLR` 政治批評 | 150 |
| +80 | `COMT` 通訊工具、`MMED` 媒體分享、`PUBH` 公共衛生、`SRCH` 搜尋引擎 | 130 |
| +60 | `ENV` 環境、`HOST` 主機與部落格、`REL` 宗教、`XED` 性教育 | 110 |
| +40 | `CULTR` 文化、`FILE` 檔案分享、`GOVT` 政府、`IGO` 國際組織 | 90 |
| +30 | `ALDR` 酒精與藥物、`DATE` 交友、`GMB` 賭博、`HATE` 仇恨言論、`MILX` 武裝團體、`PORN`、`PROV` 暴露服飾 | 80 |
| +20 | `COMM` 電子商務、`CTRL` 內容管制、`ECON` 經濟、`GAME` 遊戲、`HACK` 駭客工具、`MISC` 未分類 | 70 |

方向是社群平台與言論類最高，商業與娛樂最低。最高與最低相差 2.4 倍，落差存在但不到數量級。

第二段把優先權除以近期測量數，得到真正的排序鍵：

```
weight = priority / max(msmt_cnt, 0.1)
```

`msmt_cnt` 是該網址在本週與上週被測量的次數，範圍限定在同一個國家，probe 有回報 ASN 時則限定在同一個 ASN。測得越多，權重掉得越快，排到後面去，讓其他網址浮上來。

所以這套機制是反應式的。優先權決定一個網址的預算，測量數決定花掉多少。權重高的分類享有的是比較快的恢復速度，被測掉之後很快又排回前面，並非永遠佔住前排。

## OONI 用同一組規則應對突發事件

規則表除了分類階梯，還有兩種用法值得知道。

單一目標可以被頂到最前面。截至 2026-09，`www.aljazeera.net` 在以色列的優先權是 `9999999`，`orda.kz` 在哈薩克是 `99999`，`eltoque.com` 在古巴是 `6969`，Twitter、Facebook、Instagram、YouTube 四個網址在全球都是 `69999`。這些數字遠高於分類階梯的量級，效果是讓該目標在清單裡幾乎永遠排第一，通常對應正在發生或剛發生的封鎖事件。

優先權也可以設成負值來排除。程式對優先權小於等於零的項目直接跳過，不發給 probe。目前唯一的一組負值全在阿富汗，把酒精與藥物、交友、賭博、仇恨言論、`LGBT`、武裝團體、`PORN`、性教育八個分類設為 `-9999`。用意是保護當地執行測量的志工，不讓他們的網路紀錄裡出現可能帶來危險的內容。

台灣目前沒有任何國家層級的專屬規則，`tw.csv` 的每一則都只吃「50 加上分類加權」。這代表分類寫對是唯一能影響抽樣的槓桿。歸錯分類的網址不會有人發現，它只是被測得比應有的頻率少，或者多。提交清單修正時把分類判斷清楚，價值跟找到一個值得收錄的網站一樣大。

完整規則表可以在 [`api.ooni.io/api/_/url-priorities/list`](https://api.ooni.io/api/_/url-priorities/list){target="_blank"} 查到，設計背景見 OONI 的 [Building a smart URL list system](https://ooni.org/post/ooni-smart-url-list-system/){target="_blank"}。

## 台灣觀察名單現況

台灣的名單 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank" } 大多在 2017 年建立，此後缺乏持續維護。目前名單上不少網站已停止營運或更換品牌網址，也有許多項目仍以 `http://` 開頭，需要先做一次全面整理。

!!! note "http:// → https://"

    有些網站不會自動把 `http://` 透過 [`301 Moved Permanently`](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status/301){target="_blank"} 或 [`308 Permanent Redirect`](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status/308){target="_blank"} 轉址到 `https://`，這會讓 OONI 檢測誤判。現在 TLS/SSL 憑證取得門檻已經很低，加密傳輸也是網站基本配備，清單上的網址預設應該用 `https://`。

## 名單更新

第一步需要逐一檢查目前在 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} 上所列舉的網站狀況，標記「需更新」或「可棄用」。再提交 [Pull Request](https://gitbook.tw/chapters/github/pull-request){target="_blank"} 到 [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 請求更新。

!!! info "PR #1444"

    社群在 2023/09/28 [提交過一份檢測名單修正](https://github.com/citizenlab/test-lists/pull/1444){target="_blank"}，後續持續整理中。

## 名單新增

名單自 2017 年建立後未做過大規模調整，需要重新盤點哪些網站值得納入。新增與否依四大分類（政治、社會、衝突與安全、網際網路工具）篩選，這部分社群還在持續討論。

## 志工如何參與

清單維護是非常適合新貢獻者入門的工作，不需要寫程式，需要的是：

- **網路使用者的觀察力**：哪些網站在台灣被討論、哪些近期關閉、哪些是新出現值得納入的對象
- **判斷分類的能力**：對照 Citizen Lab 四大分類做歸類
- **基本的 GitHub 操作**：fork、修改 csv、提交 PR

具體入口：

- 想參與名單維護：到 Matrix 的 anoni-net 公開空間表達意願，會有夥伴協助分配對象
- 想參與技術擷取分析：見 [ASN 自治網路觀測資料分析](./ooni-asn-coverage.md) 與 [ASN 觀測資料擷取與分析](../community/asn-coverage-howto.md)
- 想讀懂測量資料本身：見 [OONI 測量資料結構導覽](../community/ooni-data-format.md) 與 [OONI 怎麼判定一個網站被封鎖](../community/ooni-blocking-determination.md)
- 想知道清單以外還有哪些測項：見 [OONI 測項速查表](../community/ooni-nettests-map.md)
- 想了解整體社群運作：見 [如何參與與認領主題](../community/how-to-contribute.md)

## 下一步

<div class="grid cards" markdown>

- [:material-access-point-network: ASN 自治網路觀測資料分析](./ooni-asn-coverage.md)
- [:material-chart-bar: Tor Relays 觀測點](./tor-relay-watcher.md)
- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)
- [:material-chat-question: 什麼是 OONI？](../tools/what-is-ooni.md)

</div>
