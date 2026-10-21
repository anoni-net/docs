---
title: MADLink / 台灣在 Geedge 供應鏈中的遺留 | InterSecLab
description: InterSecLab 揭露台灣公司凌華科技於 2019 至 2020 年出貨 1,708 台 CSA-7400 網路安全設備給中國 Geedge Networks，最終部署於哈薩克的國家級網路審查系統。
icon: material/file-outline
---

# :material-file-outline: MADLink：台灣在 Geedge 供應鏈中的遺留 - InterSecLab

<figure markdown="span">
  [![MADLink 報告封面](https://interseclab.org/wp-content/uploads/2026/04/MADLink-A-Taiwanese-Vestige-in-the-Geedge-Suply-Chain.jpg)](https://interseclab.org/wp-content/uploads/2026/04/MADLink-A-Taiwanese-Vestige-in-the-Geedge-Suply-Chain.jpg){target="_blank"}
  <figcaption markdown="span">圖片來源：[MADLink: A Taiwanese Vestige in the Geedge Supply Chain | InterSecLab](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"}</figcaption>
</figure>

MADLink 是 InterSecLab 繼 2025 年 9 月發布「[The Internet Coup](../interseclab-network-coup/index.md)」之後，供應鏈延伸調查系列的第一篇。InterSecLab 的調查發現，台灣上市公司凌華科技（ADLINK Technologies，股票代號 6166）於 2019 至 2020 年間，向中國 Geedge Networks（積至公司）出貨 1,708 台 CSA-7400 高密度網路平台設備。這批硬體最終被部署在哈薩克，運作 Geedge 的旗艦產品天狗安全閘道（Tiangou Secure Gateway，TSG），功能可媲美中國防火長城。緬甸部署的 EtherFabric 客製化網路封包經紀設備中也有 ADLINK 元件，ADLINK 在 Geedge 產品線中的角色不只 CSA-7400 這一筆交易。

報告收錄凌華科技的回應、台灣經濟部國際貿易署的書面說明，以及立法委員沈伯洋對台灣出口管制框架的批評，焦點在台灣現行制度能否有效防止監控與審查技術流向威權政府，與台灣讀者直接相關。社群把報告譯成正體中文（臺灣用語），讓台灣、香港、澳門與其他華語環境的讀者都能讀到全文。

本篇收錄在[研究報告中譯](../index.md)，翻譯自「[MADLink: A Taiwanese Vestige in the Geedge Supply Chain | InterSecLab](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"}」，以正體中文、臺灣用語翻譯。

!!! tip ":material-eye-outline: 編輯觀察 / Editorial observation"

    MADLink 報告點名了一家台灣上市公司，截至 2026-05 的觀察，台灣的中文公共領域卻少有討論。社群把當時的觀察整理成一篇社群動態「[台灣對 MADLink 報告的反應，2026 年 5 月的觀察紀錄](https://anoni.net/updates/2026/05/madlink-editorial-2026-05/){target="_blank"}」，記錄國內外媒體報導的對比、討論冷淡的可能原因，以及可追蹤的指標。

    The MADLink report names a publicly listed Taiwanese company, yet Taiwan's Chinese-language public sphere stayed noticeably quiet. The community's snapshot from May 2026, [Taiwan's Response to the MADLink Report](https://anoni.net/en/updates/2026/05/madlink-editorial-2026-05/){target="_blank"}, maps international and local coverage, possible reasons for the silence, and indicators worth watching.

原報告為單頁網路文章，無明確章節編號。為了便於閱讀以及在 Matrix 上分章節討論，翻譯團隊按主題切分為 5 個章節呈現：

* [第 1/5 章：摘要與主要發現](./index_1.md)
* [第 2/5 章：Geedge 供應鏈深入解析（三代 TSG 硬體）](./index_2.md)
* [第 3/5 章：EtherFabric 與 ADLINK 的角色和回應](./index_3.md)
* [第 4/5 章：結論](./index_4.md)
* [第 5/5 章：附錄（凌華科技與經濟部完整聲明）](./index_5.md)

## 編輯立場聲明

本翻譯為 InterSecLab 報告原文之忠實中譯，引述包含立法委員、政府機關、廠商等多方聲音。所載資訊與主張均為原報告觀點，不代表匿名網路社群 anoni.net 立場。對於 ADLINK 的指控段落，翻譯團隊完整呈現 ADLINK 的回應全文於附錄章節，請讀者自行比對兩造說法。

## 參與討論

MADLink 與 InterSecLab 的「The Internet Coup」屬同一系列調查，社群討論沿用同一個 Matrix 頻道，加入需要 :simple-matrix: [Element/Matrix](https://element.io/){target="_blank"} 帳號。點下方的連結會開啟社群自架的 Element，請用 `im.anoni.net` 的帳號登入。已有 `matrix.org` 或其他伺服器帳號的話，改[從 matrix.to 加入](https://matrix.to/#/#interseclab-the-internet-coup:im.anoni.net){target="_blank"}。

* :material-chat-processing-outline: [#interseclab-the-internet-coup:im.anoni.net](https://matrix.anoni.net/#/room/%23interseclab-the-internet-coup:im.anoni.net){target="_blank"}

## 更新紀錄

* **2026/05/16：**正體中文（臺灣用語）翻譯初稿釋出。
* **2026/05/16：**新增「[編輯觀察：台灣對 MADLink 報告的後續反應](https://anoni.net/updates/2026/05/madlink-editorial-2026-05/){target="_blank"}」頁，整理報告發布後本地媒體、政府、立委的接收狀況（中英並列）。
* **2026/05/20：**於「[編輯觀察](https://anoni.net/updates/2026/05/madlink-editorial-2026-05/){target="_blank"}」頁新增「外部交叉驗證」段落（中英並列），列出 OUI、CSA-7400 行銷定位、積至海南公司登記、New Bloom 報導、台灣媒體零覆蓋、沈伯洋無公開發言、凌華未發重訊等可獨立復現的查證點。
* **2026/05/20：**擴充「[編輯觀察](https://anoni.net/updates/2026/05/madlink-editorial-2026-05/){target="_blank"}」頁的「後續可追蹤指標」段落（中英並列），按政府、媒體、公民社會分組，列出各單位的觀察入口（國貿署、立法院、公開資訊觀測站、監察院等的 URL）與 4 種成本不同的執行方式（Google Alerts、手動巡查、RSS bot、自動化爬蟲）。

!!! info ":material-image-outline: 圖片來源說明"

    本翻譯中的圖片皆以外部連結方式指向 InterSecLab 原站（`interseclab.org/wp-content/...`），並未自行下載備份。如 InterSecLab 異動原始圖片路徑或檔案，本翻譯中的圖片可能無法正常顯示。若發現破圖，歡迎透過頁面右上方「:material-note-edit-outline: 編輯圖示」回報。

!!! info ":material-note-edit-outline: 編輯圖示"

    每個頁面的右上方、標題後方都有一個「**:material-note-edit-outline: 編輯圖示**」，如果在頁面上發現任何需要修正的內容，都可以直接透過「**:material-note-edit-outline: 編輯圖示**」的連結到 GitHub 上編輯、提交修正。

## 關於 InterSecLab

[InterSecLab](https://interseclab.org/about/){target="_blank"} 是一家專注於數位安全的實驗室，具備先進的數位鑑識及威脅情報能力。透過技術分析及創新研究，他們協助各機構辨識數位威脅並監測、分析更廣泛的趨勢以及駭客的滲透和控管手法。團隊在網路鑑識、惡意軟體分析、事件應對、公開情報（OSINT）、系統安全及資料科學擁有專業技術。

關於 InterSecLab 的詳細使命、團隊組成與聯絡方式，可參考 [The Internet Coup 翻譯版的「關於 InterSecLab」段落](../interseclab-network-coup/index.md#關於-InterSecLab)。

!!! tip "原始程式碼探究"

    由於 InterSecLab 並未對外洩資料中的原始程式碼進行全面性審查，如果您對於程式碼研究有興趣，可以直接聯絡 [InterSecLab](https://interseclab.org/about/){target="_blank"} 參與後續的協作活動。

## 相關閱讀

* [The Internet Coup / 網路政變 - InterSecLab](../interseclab-network-coup/index.md)：本系列首部報告，解析 Geedge Networks 如何輸出中國防火長城到威權政權
* **2026/10/13：**編輯觀察從報告翻譯拆出，改成社群首頁的[社群動態](https://anoni.net/updates/2026/05/madlink-editorial-2026-05/){target="_blank"}，以 2026-05-20 的快照保存，報告的章節只留原報告的譯文。
