---
title: 方法論
description: 網路政變 / The Internet Coup | InterSecLab
icon: material/arrow-right-bottom
---

# :material-file-outline: 方法論

!!! note ""

    - 本篇報告翻譯自 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes | InterSecLab](https://interseclab.org/research/the-internet-coup/){target="_blank"}" 的 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}" 報告，內容以正體中文、臺灣用語翻譯。
    - 本章節內容翻譯範圍為報告 **INDEX 4/8** 的內容。
    - 你可以[參與討論](./index.md#參與討論)或檢視[報告翻譯更新](./index.md#更新紀錄)。

這項研究所審查的超過 10 萬份洩漏文件來自一個消息來源，該來源也將資料共享給以下合作夥伴：國際特赦組織、緬甸正義（Justice For Myanmar）、Paper Trail Media、《環球郵報》、Tor Project、奧地利報紙《DER STANDARD》及 Follow The Money。這些夥伴以及本報告的作者合作分析、驗證並報導此資料的各個方面。

InterSecLab 團隊開發並主導了一個協作基礎設施，以促進針對資料洩漏文件的多夥伴、跨國調查。我們部署了一個 OpenSearch 叢集，將文件編入開源文件探索平台 Datashare。我們的合作夥伴聯盟使用這個平台查詢這些文件。夥伴們利用這個基礎設施共享來自人員訪談和其他訂閱資料庫（包括公司記錄、專利等）的附加資料數據和發現。

接著，我們使用開源內容擷取軟體 Apache Tika 及結合 Tesseract 和 Apple Vision 框架進行光學字元辨識，並將每份文件經由 Meta 的 Llama 大型語言模型翻譯並生成英文摘要。我們的研究團隊隨後將這些摘要編入經改良的開源 wiki.js 軟體，以便選擇文件。

選定的文件進一步被翻譯和分析。有些資料數據本身已提供英文（因為 Geedge Networks 通常用英文與其國際客戶溝通）。當文件只有中文時，我們交叉參考多種機器翻譯和大型語言模型。InterSecLab 也會諮詢中文使用者和專家以解讀本研究中使用的關鍵文件。我們也進一步檢視了 Geedge 的插圖和網路圖進行分析。我們的研究結果詳情經由進出口數據資料庫、LinkedIn 和公共新聞來源交叉參考，以證實洩漏文件中描述的事件。洩漏內容中包含原始程式碼，且我們已對這些程式碼進行了索引。值得注意的是，**InterSecLab 並未對原始程式碼進行全面性審查**。

!!! tip "原始程式碼探究"

    由於 InterSecLab 並未對外洩資料中的原始程式碼進行全面性審查，如果您對於程式碼研究有興趣，可以直接聯絡 [InterSecLab](https://interseclab.org/about/){target="_blank"} 參與後續的協作活動。

*[Apache Tika]: Apache Tika 是一個開源工具，專門用於檔案和文件的內容分析和抽取。它可以自動識別並解析多種格式的文件，提取其中的文字、語言資訊及中繼資料。Tika 支援的檔案格式包含 PDF、Word、Excel、影像、音頻等多種類型，使其成為開發人員在構建內容分析和搜尋應用時的強大助手。通過 Apache Tika，使用者能夠輕鬆地從異質數據中獲取有用資訊。
*[Datashare]: Datashare 是由國際調查記者同盟（ICIJ）開發的開源、自主架設的文件搜尋與分析平台。它能處理各種類型的資料（如 PDFs、電子郵件、試算表、圖片、壓縮檔等），並透過 OCR 技術提取文字，並加入中繼資料及命名實體進行強化。Datashare 提供強大的搜尋介面和 REST API，讓使用者能夠快速檢索資料。由於 Datashare 是在您自己的機器上運行，您能完全掌控敏感資料，而不需依賴外部雲端服務。 https://github.com/ICIJ/datashare
*[Geedge Networks]: 中文簡稱：積至公司（积至公司），商業名稱：積至（海南）信息技術有限公司，是一家中國網路公司，涉及網際網路審查與監控技術的研發、部署與對外出口。
*[Geedge]: 積至公司（积至公司）是一家中國網路公司，涉及網際網路審查與監控技術的研發、部署與對外出口。
*[InterSecLab]: 資安實驗室，本報告發佈的組織
*[OpenSearch]: OpenSearch 是一個開源的搜尋和分析套件，源自於 Elasticsearch 及其周邊技術。由於原來的 Elasticsearch 採取了不同的授權模式，亞馬遜網路服務公司（AWS）基於早期的開源版本開發了 OpenSearch，並持續提供社群驅動的開發和支持。OpenSearch 包含一套強大的搜尋功能，能夠進行即時的資料搜尋、分析及可視化工作，適用於各種使用情境，包括網站搜尋、日誌分析和業務情報。OpenSearch 的設計目標是提供一個可擴展、高效能且易於管理的搜尋平台，並且保持開源社群的貢獻和參與。
*[Tesseract]: Tesseract 是一個開源的光學字元識別（OCR）引擎，能將圖片中的文字轉換為機器可讀取的文本。它支持多種語言，並且不斷完善以提高準確性。Tesseract 被廣泛應用於文件數位化、文字提取和自動化數據錄入等場景，因其強大的識別能力和開源特性，是許多開發者和企業的首選工具。
