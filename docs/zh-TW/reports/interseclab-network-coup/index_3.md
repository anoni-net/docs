---
title: 引言
description: 2022 年 IGF 在衣索比亞召開時，政府正與 Geedge Networks 合作建置監控系統，本章交代報告的背景與架構。
icon: material/arrow-right-bottom
---

# :material-file-outline: 引言

!!! note ""

    - 本章翻譯自 InterSecLab 的報告「[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}」（[報告介紹頁](https://interseclab.org/research/the-internet-coup/){target="_blank"}），以正體中文、臺灣用語翻譯。
    - 本章對應原報告目錄（INDEX）的第 3/8 章。
    - 歡迎[參與討論](./index.md#參與討論)，或查看譯文的[更新紀錄](./index.md#更新紀錄)。

2022 年，聯合國網際網路治理論壇（IGF）在衣索比亞的阿迪斯阿貝巴（Addis Ababa）召開，與會者討論「連結所有人、保障人權」（Connecting All People and Safeguarding Human Rights）。同一時間，衣索比亞提格雷（Tigray）地區的七百萬人已經斷網超過兩年，仍然無法上網[^1]。雖然電信中斷還在持續，參加論壇的各國代表對兩週前簽訂的停火協定抱持樂觀，也在慶祝衣索比亞的電信業自由化，以及肯亞電信業者 Safaricom 進入當地市場。Safaricom 是第一家取得衣索比亞營運執照的國際公司[^2]。為期一週的會議來到閉幕典禮，副總理 Demeke Mekonnen Hassen 代表政府致閉幕詞，感謝來自聯合國與數十個會員國的國際貴賓。他念完講稿時，一個不見人影的聲音插進播給遠端與會者的直播畫面，重複問道：「提格雷的網路什麼時候恢復？」[^3]

這一幕凸顯衣索比亞的網路治理方式與國際社會期待之間的矛盾，國際社會原本以為電信自由化與市場競爭自然會改善網路自由。實際上，就在 IGF 舉辦期間，衣索比亞政府正同時與中國公司 Geedge Networks（積至公司）合作，大幅強化控制機制，安裝一整套精密的軟硬體產品，讓政府在全國擁有前所未有的監控與審查能力。

本報告分析 Geedge Networks（本報告也簡稱 Geedge）外洩的大批資料，共超過 10 萬份文件，從少見的內部視角，呈現這家公司如何把數位鎮壓的技術輸出到世界各地，從衣索比亞、哈薩克、巴基斯坦到緬甸。報告也說明 Geedge 如何參與中國防火長城的區域化，讓新疆、福建、江蘇等地區的控制更加精準。報告概述 Geedge Networks 整套產品與服務的能力，以及這些工具在外洩資料提到的國家如何部署。接著說明相關技術對規避審查的工作與數位安全倡議者的影響，最後依研究發現，為網路自由社群提出反思。

本報告雖然有幾章深入的技術內容，我們仍盡力讓數位權利倡議者、政策制定者等沒有技術背景的讀者也能理解研究發現。為了方便讀者查閱，報告先逐一介紹 Geedge 銷售的每項產品與服務，著重說明監控與審查的能力。接著說明產品如何安裝，如何組成一整套軟硬體協同運作，把資料傳給客戶國家的主管機關與 Geedge Networks。然後從資料檢視 Geedge 在中國以外的國家與中國境內各地區安裝技術的情況，各自有什麼特殊的合作關係與營運時程。最後分析外洩資料對主要規避工具的影響，並提出後續研究與行動的方向。

我們在全球網路自由的關鍵時刻發表本報告。過去十年，威權政府一直在發展自己的網路控制系統，跟各種不透明的公司與供應商合作，東拼西湊出各種系統，用來封鎖網路內容、切斷網路、監控使用者。本報告揭露的根本轉變，在於像 Geedge 這樣的公司如今公開推銷整套產品，讓任何政府都能取得大量尖端工具，同時做大規模與精準的監控與審查，甚至還提供自動派送給每個客戶的軟體更新。這類公司不斷研發辨識、封鎖、癱瘓規避審查工具的技術，也刻意讓產品跟大多數商用網路硬體互通，增強韌性，不受制裁影響。

從我們的研究來看，這類系統很可能快速擴張。隨著買來就能上線的網路控制方案需求增加，像 Geedge 這樣的公司持續爭取新客戶、研發新功能、擴大營運規模。我們呼籲國際社會善用本報告的分析，正視現實，這些技術已經商品化，數位鎮壓的全球市場也在持續演變。

[^1]: Access Now，[Open Statement: Internet Shutdown in Amhara](https://www.accessnow.org/press-release/open-statement-internet-shutdown-amhara/){target="_blank"}，2023-04-06。（譯註：標題與日期照錄原報告。這個網址在 2026-10 查核時是 Access Now 2023-09-12 的〈Preserving freedom in crisis: Ethiopia’s internet shutdowns must not become the norm〉，跟[第 6 章](./index_6.md)的第 33 則相同。）
[^2]: Africanews，[Kenya’s Safaricom to Enter Ethiopia](https://www.africanews.com/2022/10/07/kenyas-safaricom-to-enter-ethiopia/){target="_blank"}，2022-10-07。
[^3]: United Nations，[IGF 2022 – Conference Room 1 – English](https://www.youtube.com/live/UOpmpxRFh-4?t=33662s){target="_blank"}，YouTube 影片（9:20:32 處），2022 年 11 月發布。
