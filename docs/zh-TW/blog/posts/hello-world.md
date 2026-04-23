---
date: 2025-01-06
authors:
    - toomore
categories:
    - 公告
    - 社群
image: "assets/images/post-update.png"
---

# 專案重啟 2025

嗨，各位，Anoni.net Docs 將在 2025 重新啟動專案，目前規劃三個子專案作為 2025 研究的方向與目標。如果對這議題有興趣的，可以考慮加入我們，一起研究、討論與「[網路自由](../../internet-freedom-matter.md){target="_blank"}」相關的議題。

而這個文件網站也會是未來持續更新進度、活動預告、研究結果發表的地方。建議可以先訂閱[郵件群組](../../contact.md){target="_blank"}，後續有任何新的訊息更新，我們也會使用郵件群組寄信通知。

<!-- more -->

## 專案計畫

Anoni.net Docs 計畫目前包含三個子專案項目，涵蓋資料分析、檢測網站清單在地協助維護更新、中文化與文件翻譯推廣，不論你來自哪一個背景、地區，只要對以下子專案有興趣，都可以一起參與！接下來將對子專案作簡單介紹與未來預計要完成的目標作說明。

### ASNs 自治網路觀測資料分析

延續 2023、2024 所研究的 「[ASNs 自治網路觀察資料涵蓋率](https://ocf.tw/p/ooni/report/202312.html){target="_blank"}」，報告將持續針對 ASNs 自治網路系統與網路審查、干預⋯等因素尋找其關聯性。另外也持續研究其他區域的 ASNs 涵蓋狀況，是否會因為資料的多樣性不足而影響 OONI 觀測資料的解釋能力。

預計也將建立資料流程基礎架構（data pipeline architecture），在研究過程中的資料蒐集與整理，透過程式自動化完成，能與 OONI Data 達到即時呈現結果的可能。

[:material-arrow-right-circle-outline: 瞭解更多此專案的說明](../../ooni-asns-coverage.md){ .md-button target="_blank" }

??? note "資料流程基礎架構（Data Pipeline Architecture）"

    可能的作法，但不侷限：

    1. 架構 Airflow 讓流程視覺化的方式完成資料整理與合併輸出報表的方向進行。
    2. 但也可能使用單純的 API 架構方式提供給前端表現圖表或後端其他應用。

### OONI 網站檢測清單

OONI Probe 網站檢測來自於各地區提供的名單，而臺灣（`tw.csv`）的部分自從最後一次更新（2017）後，已有好長一段時間沒有調整與檢視，名單上的網站會影響到觀測程式的結果，因此需要花點時間修正調整目前的名單，後續再進行 2025 可以收錄觀察的網站項目。

[:material-arrow-right-circle-outline: 瞭解更多此專案的說明](../../ooni-weblists.md){ .md-button target="_blank" }

??? note "檢測名單目前的狀況"

    1. 2017 年後沒有檢視與更新，許多網站不存在或網址已更換。
    2. 許多 `http` 開頭的網址未修正成 `https`。

### 中文化與文件翻譯

目前 OONI 的服務與工具也越來越多，中文化也將持續協助進行，保持在地化的詞彙與用語。另外我們也打算翻譯重要的公告與技術文件，讓理解與參與的門檻再降低，希望能吸引更多人加入研究與貢獻。

[:material-arrow-right-circle-outline: 瞭解更多此專案的說明](../../ooni-i18n.md){ .md-button target="_blank" }

## 參與方式

這個文件網站的建立是希望吸引更多對於「網路自由」、「內容審查」議題感興趣的夥伴加入，也希望跨出參與的第一步後，可以有手把手的文件先行閱讀或補足目前的專案進度。文件網站會是專案的入口，訂閱[郵件群組](../../contact.md){target="_blank"}可以持續保持進度更新，未來也會使用 [Github](https://github.com/anoni-net/docs){target="_blank"} 作為工作任務分派，朝著能多人協作與共享知識的方式進行。

## 活動預告

由於 [RightsCon 2025](https://rightscon.summit.tc/catalog/rightscon-2025){target="_blank"} 將在台北舉辦，許多國際專案團隊與社群也將在二月底來到台北參與活動，我們有幸的與 Tor、OONI 的團隊在會議前舉辦一場工作坊與講座活動，目前時間預定在 2025/02/23 下午與晚上，有興趣來到現場瞭解 Tor、OONI 專案或與專案團隊成員交流，也請把握這次機會喔！

??? question "如何報名？"

    由於活動報名流程還在籌備中，可以先訂閱[郵件群組](../../contact.md){target="_blank"}，當活動地點與報名方式確定，將會透過專案郵件群組發送提醒通知，不要錯過了！
