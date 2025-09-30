---
title: 引言
icon: material/arrow-right-bottom
---

# :material-file-outline: 引言

!!! note ""

    - 本篇報告翻譯自 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes | InterSecLab](https://interseclab.org/research/the-internet-coup/){target="_blank"}" 的 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}" 報告，內容以正體中文、臺灣用語翻譯。
    - 本章節內容翻譯範圍為報告 **INDEX 3/8** 的內容。

當聯合國 2022 網際網路治理論壇（IGF）的參與者齊聚在衣索比亞的亞的斯亞貝巴（Addis），討論「連結所有人並保障人權」時，提格雷（Tigray）地區的七百萬衣索比亞人已經經歷了超過兩年的網路封鎖[^1]，無法上網。儘管通訊中斷持續進行，國際論壇的代表對於兩週前簽署的停火協議保持樂觀。他們也在慶祝電信業的自由化，以及 Safaricom 進入當地市場——這是第一家獲得該國營運許可的國際公司[^2]。在為期一週的會議結束時，衣索比亞副總理德梅克·梅科南·哈森（Demeke Mekonnen Hassen）代表政府發表告別演說，感謝來自聯合國和多個成員國的國際貴賓。當他完成書面講稿時，一個不知名的聲音打斷了直播視頻，對遠程參會者播放：「恢復提格雷的網路連線的時間表是什麼？」這個問題不斷重複[^3]。

這一時刻突顯了衣索比亞在網路治理方法上的矛盾，以及國際社會對電信自由化和競爭自然改善網路自由的期待。實際上，當 IGF 正在進行時，中國公司 Geedge Networks 同時在與政府合作，安裝複雜的硬體和軟體產品包，以實現前所未有的監控和審查能力。

這份報告基於來自 Geedge Networks（在本報告中也稱為 Geedge）的超過 10 萬份文件的龐大資料洩漏的分析，提供了這家公司如何將這些數位壓制技術出口到全球的獨特內幕，包括從衣索比亞到哈薩克再到巴基斯坦與緬甸。它也揭示了公司如何參與中國防火長城的區域化，讓中國新疆、福建和江蘇等地區更準確地進行控制。報告概述了 Geedge Networks 所銷售的產品以及服務的全面能力，展示了 Geedge 工具在洩漏中識別的國家中是如何部署的，並探討了這些技術對於審查規避和數位安全倡議者的意涵，也對網路自由社群提供反思。

這份報告雖然包含詳細的技術章節，但我們努力使其對非技術受眾，包括數位權利倡議者和政策制定者，也能夠理解。為了便於更容易地引導發現，我們先描述 Geedge 銷售的每個產品和服務，突顯其監控和審查的能力。接著，我們說明這些產品如何安裝並作為硬體和軟體產品的套件協同運作，將數據傳送給客戶國的當局和 Geedge Networks。然後，我們檢視這些資料中揭露的中國以外國家及中國內部 Geedge 安裝技術的區域中，獨特的關係和運作時間線。最後，我們提供這些洩漏資料對於主要規避工具的意義分析，並指出進一步研究和行動的下一步。

我們選擇在全球網路自由緊要關頭發表這份報告。過去十年，威權政府一直在開發自己網路控制系統，與各種不透明的公司和供應商合作，建立拼圖式系統來封鎖網上內容、關閉網路，並監控使用者。這份報告揭示了一個根本的轉變：像 Geedge 這樣的公司現在公開推銷全面的產品套件，為任何政府提供廣泛的先進工具進行大規模和精準監控及審查——甚至提供自動與每個客戶共享的軟體更新。這些公司創新以識別、封鎖和禁用審查規避工具，同時在其系統中建立韌性，並透過設計與大多數商用網路硬體提供商的互操作性使其不受制裁影響。

我們的研究顯示，快速擴展的可能性很大。隨著這種一站式網路控制解決方案需求增長，像 Geedge 這類公司持續向新客戶推銷、創新與擴展其業務。我們敦促國際社會使用這份報告提供的見解，以面對這些技術商品化和數位壓制全球市場進化的現實。

[^1]: Access Now. "Preserving freedom in crisis: Ethiopia’s internet shutdowns must not become the norm" Access Now, April 6, 2023. https://www.accessnow.org/press-release/open-statement-internet-shutdown-amhara/
[^2]: Africanews. "Kenya's Safaricom to enter Ethiopia" Africanews, October 7, 2022. https://www.africanews.com/2022/10/07/kenyas-safaricom-to-enter-ethiopia/
[^3]: United Nations. "IGF 2022 - Conference Room 1 - English" YouTube Video, 9:20:32. Published November 2022. https://www.youtube.com/live/UOpmpxRFh-4?t=33662s
