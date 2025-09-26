---
title: 摘要
icon: material/arrow-right-bottom
---

# :material-file-outline: 網路政變 - 摘要

!!! note ""

    - 本篇報告翻譯自 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes | InterSecLab](https://interseclab.org/research/the-internet-coup/){target="_blank"}" 的 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}" 報告，內容以正體中文、臺灣用語翻譯。
    - 本章節內容翻譯範圍為報告 **INDEX 1/8** 的內容。

> 技術分析：一家中國公司如何向威權政權出口防火長城

過去二十年來，中國政府一直在國內透過監控和審查技術不斷完善其網路管控模式，同時以「數位主權（Digital Sovereignty）」為名向其他國家推廣這一做法。通過出口監控技術，中國不僅擴大其全球影響力，也為一個聯邦化的網路治理系統奠定了基礎。在這個系統中，中國公司為客戶（政府）提供基礎設施和專業知識，使其更容易監控和控制自己的網路，並從這些部署中學習，以提升全球範圍的數位威權主義集體能力。

這項由 InterSecLab 進行的研究揭示了 Geedge Networks，一家與中國科學院研究實驗室 Massive and Effective Stream Analysis（Mesalab）有關聯的私人公司，出口類似於中國防火長城技術套件的證據。我們團隊的調查辨識出監控能力商業化的趨勢，Geedge Networks 提供一套產品，能夠全面監控和控制網路使用者。

InterSecLab 的分析顯示，Geedge Networks 已與哈薩克、衣索比亞、巴基斯坦、緬甸及一個未知國家的政府簽約，建立先進的網路審查和監控系統。此外，我們的研究結果表明，Geedge Networks 也參與在中國境內（包括新疆及其他地區）部署類似系統的開發。

基於與 InterSecLab 分享的超過 10 萬份 Geedge Networks 文件洩漏文件的分析，這項研究揭示了 Geedge Networks 系統的功能和能力，包括深度封包檢測、行動用戶的即時監控、細緻的網路流量控制，以及可根據各區域定制的審查規則。洩漏的文件也揭示了 Geedge Networks 與學術實體 Mesalab 的關係，以及他們與客戶政府的互動。對於資料主權的意涵極其重大，我們的發現引發了對監控和資訊控制技術商品化的顧慮。

這項研究探討了 Geedge Networks 系統在多個國家的近期發展情形，包括其部署時間線。通過分析公司的內部文件，InterSecLab 得以紀錄商用國家防火牆的擴展，並推測這類系統擴散對全球網路未來的影響。

*[InterSecLab]: 資安實驗室，本報告發佈的組織
*[Geedge Networks]: 中文簡稱：積至公司（积至公司），商業名稱：積至（海南）信息技術有限公司
*[Mesalab]: 中國科學院信息工程研究所的研究室（處理架構組）
*[DPI]: 深度封包檢測，縮寫為 DPI，是一種電腦網路封包過濾技術，用來檢查通過檢測點封包的資料部分（也可能包含其標頭），以搜尋不符合規範的協定、病毒、垃圾郵件、入侵，或以預定準則來決定封包是否可通過或需被路由至其他不同目的地，或是為了收集統計資料。
