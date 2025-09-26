---
title: 方法論
icon: material/arrow-right-bottom
---

# :material-file-outline: 方法論

!!! note ""

    - 本篇報告翻譯自 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes | InterSecLab](https://interseclab.org/research/the-internet-coup/){target="_blank"}" 的 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}" 報告，內容以正體中文、臺灣用語翻譯。
    - 本章節內容翻譯範圍為報告 **INDEX 4/8** 的內容。

這項研究所審查的超過 10 萬份洩漏文件來自一個消息來源，該來源也將資料共享給以下合作夥伴：國際特赦組織、緬甸正義（Justice For Myanmar）、Paper Trail Media、《環球郵報》、Tor Project、奧地利報紙《DER STANDARD》及 Follow The Money。這些夥伴以及本報告的作者合作分析、驗證並報導此資料的各個方面。

InterSecLab 團隊開發並主導了一個協作基礎設施，以促進針對資料洩漏文件的多夥伴、跨國調查。我們部署了一個 OpenSearch 叢集，將文件編入開源文件探索平台 Datashare。我們的合作夥伴聯盟使用這個平台查詢這些文件。夥伴們利用這個基礎設施共享來自人員訪談和其他訂閱資料庫（包括公司記錄、專利等）的附加資料數據和發現。

接著，我們使用開源內容擷取軟體 Apache Tika 及結合 Tesseract 和 Apple Vision 框架進行光學字符識別，並將每份文件經由 Meta 的 Llama 大型語言模型翻譯並生成英文摘要。我們的研究團隊隨後將這些摘要編入經改良的開源 wiki.js 軟體，以便選擇文件。

選定的文件進一步被翻譯和分析。有些資料數據本身已提供英文（因為 Geedge Networks 通常用英文與其國際客戶溝通）。當文件只有中文時，我們交叉參考多種機器翻譯和大型語言模型。InterSecLab 也會諮詢中文使用者和專家以解讀本研究中使用的關鍵文件。我們也進一步檢視了 Geedge 的插圖和網路圖進行分析。我們的研究結果詳情經由進出口數據資料庫、LinkedIn 和公共新聞來源交叉參考，以證實洩漏文件中描述的事件。洩漏內容中包含原始程式碼，且我們已對這些程式碼進行了索引。值得注意的是，**InterSecLab 並未對原始程式碼進行全面性審查**。
