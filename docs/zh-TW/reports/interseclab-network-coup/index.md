---
title: 網路政變 / The Internet Coup | InterSecLab
description: InterSecLab 報告 The Internet Coup 的正體中文譯文，分析 Geedge Networks 如何把中國防火長城的技術做成產品，輸出到其他國家。
icon: material/file-outline
---

# :material-file-outline: 網路政變 - InterSecLab

![](https://assets.anoni.net/the-internet-coup/The-Internet-Coup-InterSecLab-2048x986.png){style="border-radius: 10px;"}

InterSecLab 分析外洩的約 500GB 檔案，說明 Geedge Networks（積至公司）如何把中國防火長城的技術做成整套產品，賣給哈薩克、衣索比亞、巴基斯坦、緬甸等國的政府，也在新疆等中國省分部署。審查設備成了可以採購的商品，各國政府取得大規模監控與封鎖規避工具的能力，不必再從頭開發。社群把報告譯成正體中文（臺灣用語），讓台灣、香港、澳門與其他華語環境的讀者，都能讀到完整的技術細節與各國案例，一起討論網路自由與網路治理。

本篇收錄在[研究報告中譯](../index.md)，翻譯自「[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes | InterSecLab](https://interseclab.org/research/the-internet-coup/){target="_blank"}」所附的「[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}」報告，以正體中文、臺灣用語翻譯。

報告全文共 71 頁、八個章節，譯文依照原報告的目錄（INDEX）分章，方便對照原文：

* [INDEX 1/8：摘要](./index_1.md)
* [INDEX 2/8：主要發現](./index_2.md)
* [INDEX 3/8：引言](./index_3.md)
* [INDEX 4/8：方法論](./index_4.md)
* [INDEX 5/8：產品與服務](./index_5.md)
* [INDEX 6/8：Geedge 的運營與客戶](./index_6.md)
* [INDEX 7/8：封鎖網路隱私與規避工具](./index_7.md)
* [INDEX 8/8：結論、反思與未來步驟：反擊作為服務的數位威權主義](./index_8.md)

## 參與討論

社群為這份報告開了一個 Matrix 討論頻道，加入需要 :simple-matrix: [Element/Matrix](https://element.io/){target="_blank"} 帳號。

* :material-chat-processing-outline: [#interseclab-the-internet-coup:im.anoni.net](https://matrix.to/#/#interseclab-the-internet-coup:im.anoni.net){target="_blank"}

## 更新紀錄

* **2025/10/01：**正體中文（臺灣用語）翻譯釋出，目前註腳內容尚未完全翻譯完成，持續補完中。
* **2026/10/13：**註腳全部翻譯完成。補上原報告第 17 到 76 則註腳（原報告沒有第 74 則），並依原報告修正第 5、9、13 則的誤植。

!!! info ":material-note-edit-outline: 編輯圖示"

    每個頁面的右上方、標題後方都有一個「**:material-note-edit-outline: 編輯圖示**」，如果在頁面上發現任何需要修正的內容，都可以直接透過「**:material-note-edit-outline: 編輯圖示**」的連結到 GitHub 上編輯、提交修正。

## 關於 InterSecLab

[InterSecLab](https://interseclab.org/about/){target="_blank"} 是一家專注於數位安全的實驗室，具備數位鑑識及威脅情報能力。他們透過技術分析與研究，協助各機構辨識數位威脅，並監測、分析更廣泛的趨勢，以及駭客的滲透和控管手法。團隊的專長包括網路鑑識、惡意軟體分析、事件應對、公開情報（OSINT）、系統安全與資料科學。

InterSecLab 與各機構合作，提供安全的研究基礎設施，並開發處理、分析大型複雜資料集的方法。他們也與研究人員、記者和各機構合作，識別、調查和應對數位威脅。InterSecLab 的介紹頁將這些工作的目的寫為擴展各方對全球威脅情勢的理解、促進數位自主，以及建立更具韌性與安全的線上環境。

### 使命

InterSecLab 在介紹頁列出四項使命：

1. 與各方協作、共同創造知識，提升外界取得監控產業與網路安全領域資訊的能力，這兩個領域向來不透明。
2. 透過與機構和社群的協同研究，擴大研究各種威脅與弱點的能力。
3. 培養全球視角，挑戰既有的權力地理觀，以多元、在地且了解脈絡的觀點面對挑戰。
4. 重視透明度，與利害關係人分享研究發現，並倡導以開放的溝通解決數位安全問題。

### 團隊組成 { #專家團隊包括 }

* 資訊技術專家：調查數位威脅、應對進階網路攻擊，並追溯威脅來源以預測趨勢。他們也分析可疑的應用程式、評估權限、監控未知的程序，並驗證 APK 的真偽。
* 研究人員：結合社會與脈絡分析，補強威脅情報。
* 溝通專家：提升受影響對象的意識、與媒體聯繫，並與合作夥伴協作，擴大研究發現的影響。

InterSecLab 以技術專業、研究與對外合作，協助第一線的防禦者提升資安能力。

!!! tip "原始程式碼探究"

    由於 InterSecLab 並未對外洩資料中的原始程式碼進行全面性審查，如果您對於程式碼研究有興趣，可以直接聯絡 [InterSecLab](https://interseclab.org/about/){target="_blank"} 參與後續的協作活動。
