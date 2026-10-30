---
title: 研究方法
description: InterSecLab 如何架設協作平台，索引、翻譯並交叉核對超過 10 萬份 Geedge Networks 的外洩文件。
icon: material/arrow-right-bottom
---

# :material-file-outline: 研究方法 { #方法論 }

!!! note ""

    - 本章翻譯自 InterSecLab 的報告「[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}」（[報告介紹頁](https://interseclab.org/research/the-internet-coup/){target="_blank"}），以正體中文、臺灣用語翻譯。
    - 本章對應原報告目錄（INDEX）的第 4/8 章。
    - 歡迎[參與討論](./index.md#參與討論)，或查看譯文的[更新紀錄](./index.md#更新紀錄)。

本研究檢視的超過 10 萬份外洩文件來自一位消息來源，消息來源也把資料提供給下列合作夥伴：國際特赦組織、Justice For Myanmar、Paper Trail Media、《環球郵報》（The Globe and Mail）、Tor Project、奧地利《標準報》（DER STANDARD）與 Follow The Money。這些夥伴與本報告的作者一起分析、查證這批資料，並就資料的不同面向發表報導。

InterSecLab 團隊開發並架設一套協作基礎設施，讓多個夥伴可以跨國合作，調查外洩資料裡的整批文件。我們部署 OpenSearch 叢集，把文件索引進開源的文件探索平台 Datashare，聯合調查團隊的夥伴用 Datashare 查詢文件。夥伴也用這套基礎設施分享更多資料與發現，包括訪談消息來源人士的內容，以及公司登記、專利等訂閱制的資料庫。

接著，我們用開源的文字擷取函式庫 Apache Tika，搭配 Tesseract 與 Apple Vision 框架做光學字元辨識，再把每份文件交給 Meta 的 Llama 系列大型語言模型翻譯，替每份文件產生英文摘要。研究團隊再把摘要索引進修改過的開源軟體 wiki.js，用來挑選文件。

選出的文件再進一步翻譯與分析。有些資料原本就是英文，因為 Geedge Networks（積至公司）跟國際客戶溝通時常用英文。只有中文版本的文件，我們交叉比對多種機器翻譯與大型語言模型的結果。InterSecLab 也請教以中文為母語的人士與專家，確認本研究關鍵文件的解讀。我們另外檢視 Geedge 的示意圖與網路架構圖，補充分析。研究發現的細節，我們用進出口資料庫、LinkedIn 與公開的新聞報導交叉核對，佐證外洩文件描述的事件。外洩資料裡有原始程式碼，我們也替原始程式碼建立了索引。不過，InterSecLab 這次的研究沒有全面審查原始程式碼。

*[Apache Tika]: 從各種格式的檔案擷取文字與中繼資料的開源工具
*[Datashare]: 國際調查記者同盟（ICIJ）開發的開源文件搜尋與分析平台
*[OpenSearch]: 從 Elasticsearch 分支出來的開源搜尋與分析引擎
*[Tesseract]: 開源的光學字元辨識引擎，把圖片裡的文字轉成可編輯的文字
