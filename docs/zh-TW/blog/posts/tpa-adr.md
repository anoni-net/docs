---
date: 2026-03-19
authors:
    - toomore
categories:
    - 更新
    - Tor
    - 翻譯文章
slug: tpa-adr
image: "assets/images/tor.webp"
summary: "Tor 系統管理團隊 TPA 改用 ADR 記錄決策：更短的模板、更清楚的決策者、以及把決策紀錄與對外溝通分開。"
description: "TPA 從 RFC 改為 ADR 的緣由與做法，以及為何「先決定誰做決定」很重要；文末整理其他開源專案的提案與決策流程。"
---

# 用 ADR 記錄決策：Tor 系統管理團隊的新做法

!!! info ""

    以下內容原文翻譯來自以下文章，主詞角色為 Tor Project TPA 團隊：

    - [Keeping track of decisions using the ADR model, by anarcat | February 16, 2026](https://blog.torproject.org/tpa-adr/){target="_blank"}

    文末另有一節「**台灣專案與社群的現況**」，整理台灣在地脈絡與為什麼值得引進 ADR，歡迎直接跳讀。

![Tor](./assets/images/tor.webp)

在 Tor Project 的系統管理員團隊（俗稱 TPA）裡，我們最近改變了做決策的方式，這代表你會從我們這邊收到更清楚的溝通：無論是即將進行的變更，或是針對某項提案的具體問題。

請注意，這項變更只影響 TPA 團隊。在 Tor 內部，每個團隊都有自己協調與決策的方式，目前這套流程只在 TPA 使用。我們鼓勵 Tor 內外其他團隊評估這套做法，看看是否能改善你們的流程與文件。

<!-- more -->

## 新流程

我們過去一直使用「RFC」（Request For Comments，請求意見）流程，最近已改為「ADR」（Architecture Decision Record，架構決策紀錄）。

對我們來說，ADR 流程相當簡單，包含三件事：

1. 更精簡的模板
2. 更精簡的流程
3. 與決策紀錄分開的溝通準則

### 模板

作為團隊負責人，我做的第一件事是提出新模板（見 [ADR-100](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/0100-adr-template){target="_blank"}），這是 [Nygard 模板](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md){target="_blank"}的變體。[TPA 的模板版本](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/template){target="_blank"}同樣簡潔，只有 5 個標題，值得完整引用：

- **Context（脈絡）**：我們看到什麼問題，促使我們做這項決策或變更？
- **Decision（決策）**：我們提議和（或）正在做的變更是什麼？
- **Consequences（後果）**：因為這項變更，哪些事會變得更容易或更困難？
- **More Information（更多資訊，選填）**：還有什麼我們該知道的？對較大的專案，可考慮納入時程與成本估計、對受影響使用者的衝擊（或許包含既有 Personas）。一般來說，這裡會包含對所考量替代方案的簡短評估。
- **Metadata（詮釋資料）**：狀態、決策日期、決策者、被諮詢者、需被告知的使用者，以及討論論壇連結。

[先前的 RFC 模板](https://gitlab.torproject.org/tpo/tpa/wiki-replica/-/blob/d52de1828d3ee406996345704d12663dd30f5513/policy/template.md){target="_blank"}有 **17**（十七個！）標題，容易催生出很長的文件。現在，決策紀錄更容易一眼讀完、消化。

一個立竿見影的效果是，我開始更常把比較與腦力激盪放在 GitLab 的 issue 裡。像是定價或深入替代方案比較這類細節，我們改在討論 issue 裡記錄，讓文件保持精簡。

### 流程

整個流程簡單到也值得完整引用：

> 重大決策在會議中向利害關係人說明，較小的決策則用電子郵件。一段延遲時間讓人可以在採納前提出最後意見。

當然，魔鬼藏在細節裡（見 [ADR-101](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/0101-adr-process){target="_blank"}），但重點是保持簡單。

這項提案的關鍵之一，也就是 Jacob Kaplan-Moss 所說的 [one weird trick](https://jacobian.org/2023/dec/5/how-to-decide/){target="_blank"}，就是「先決定誰做決定」。我們過去的流程對「誰來做決策」很模糊，新模板（與流程）則在每項決策上都釐清決策者。

反過來說，有些決策會淪為在瑣碎議題上沒完沒了的討論，因為被諮詢的利害關係人太多：這就是所謂的 [瑣碎法則](https://en.wikipedia.org/wiki/Bike_shedding){target="_blank"}（Law of triviality），也叫「自行車棚效應」（Bike Shed syndrome）。

新流程更清楚區分利害關係人：

- **「決策者」**（decision maker）（取代模糊的「核准」）
- **「被諮詢者」**（consulted）（以前沒有定義！）
- **「需被告知者」**（informed）使用者（以前叫「受影響使用者」）

要挑出這些利害關係人仍然不簡單，但我們的定義更明確，也與經典的 [RACI 矩陣](https://en.wikipedia.org/wiki/Responsibility_assignment_matrix){target="_blank"}（Responsible, Accountable, Consulted, Informed）對齊。

### 溝通準則

最後，流程中很重要的一環（[ADR-102](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/0102-adr-communications){target="_blank"}）是：把「做決策與記錄決策」和「對外溝通決策」拆開。這是兩個截然不同的問題。我們發現，一份文件無法同時滿足兩者。

因為 ADR 可能影響的範圍很廣，我們沒有為溝通訂死一個模板。我們建議用 [五何法](https://en.wikipedia.org/wiki/Five_Ws){target="_blank"}（Five Ws）（誰？什麼？何時？哪裡？為什麼？），再次強調：保持簡單。

## 為何走到這一步

[ADR 流程](https://adr.github.io/){target="_blank"}不是我發明的。我最早是在 [Thunderbird Android 專案](https://github.com/thunderbird/thunderbird-android/blob/be2af5c6a0bce08385fc3f654c1185ccf9db3859/docs/architecture/adr/README.md){target="_blank"}裡看到的。接著，在檢討 RFC 流程的同時（見 [討論 issue](https://gitlab.torproject.org/tpo/tpa/team/-/issues/41428){target="_blank"}），我讀了 Jacob Kaplan-Moss 對 [RFC 流程的批評](https://jacobian.org/2023/dec/1/against-rfcs/){target="_blank"}。他大致認為：

1. RFC 流程「沒有包含任何決策框架」
2. 「RFC 流程容易導致無止境的討論」
3. 流程「獎勵寫到精疲力竭的人」
4. 「這些流程對專業不敏感」、對「權力動態與權力結構」也不敏感

說實話，上述問題我很多都犯過。身為一個囉唆的作者，我寫過 [極長的提案](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/tpa-rfc-33-monitoring){target="_blank"}，我懷疑從來沒有人從頭讀完。有些提案是靠大家累到放棄才通過的，有些則因為沒找對利害關係人而被忽略。

我們在 [討論 issue](https://gitlab.torproject.org/tpo/tpa/team/-/issues/41428){target="_blank"} 裡有更多關於我們 RFC 流程問題的細節。但要公平地說，舊流程在當時還是有用的：有總比沒有好，而且讓我們在 6 年間記錄了數量可觀的變更與決策（[95 份 RFC](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy){target="_blank"}！）。

## 接下來呢？

我們仍在實驗「決策周邊的溝通」該怎麼做，這篇文章本身或許就是例子。因為溝通是獨立一步，我們也容易忘記或拖延，例如這篇貼文就晚了好幾個月。

以前我們會直接把 RFC 副本寄給大家，又快又簡單，但對多數人來說難以理解。現在我們得另外寫一份溝通稿，工作變多了，但希望結果更容易消化，值得這份付出。

我們很期待聽到你對新流程的想法、以及它對你的效果、可以在這裡回覆，或到 [討論 issue](https://gitlab.torproject.org/tpo/tpa/team/-/issues/41428){target="_blank"}。我們特別感興趣的是：已經在用類似流程的人，或是讀完這篇後打算採用的人。

!!! question "這篇在說什麼？為什麼 Tor 做這樣的改變？"

    若你剛讀完上面的翻譯，這裡是整篇的重點整理。
    
    **問題在哪裡？**  
    TPA 過去用 RFC 記錄決策，但 RFC 流程有幾個根本問題：缺乏明確的決策框架、討論容易拖成冗長戰、變相獎勵「寫很多」的人、對專業與權力結構不敏感。雖然 6 年來 95 份 RFC 仍有貢獻，但文件難讀、誰有權做決定也不清楚。
    
    **他們做了什麼？**  
    改採 ADR，並聚焦三件事：
    
    1. **更短的模板**：從 17 個標題縮成 5 個（脈絡、決策、後果、更多資訊、詮釋資料），細節改放到 GitLab issue 討論。
    2. **更簡單的流程**：重大決策在會議說明、小決策用 email；並**先決定誰做決定**——明確區分「決策者」「被諮詢者」「需被告知者」，對齊 RACI，避免人人可發言、沒人拍板，或太多人捲入瑣事（自行車棚效應）。
    3. **決策與溝通分開**：ADR 只負責「記錄決策」；對外公告、說明另寫一份（例如用五何法），讓決策紀錄與溝通各司其職。
    
    **效果**：決策文件更好讀、權責清楚、減少無止境討論與自行車棚效應；對外溝通雖然多一步，但更易消化。

!!! info "其他開源專案的提案與決策流程"

    不同專案用不同方式做「提案」與「記錄決策」，以下簡要整理幾個常見做法，供對照與參考。
    
    - **GOV.UK Design System**：用 **RFC** 討論提案、用 **ADR** 記錄最終決策；proposals 放在公開儲存庫，例如 [001-use-rfcs-and-adrs-to-discuss-proposals-and-record-decisions](https://github.com/alphagov/govuk-design-system-architecture/blob/main/proposals/001-use-rfcs-and-adrs-to-discuss-proposals-and-record-decisions.md){target="_blank"}，等於「討論用 RFC、定案用 ADR」並行。
    
    - **Bitwarden**：有專用的 [ADR 文件與索引](https://contributing.bitwarden.com/architecture/adr/){target="_blank"}，提供模板與瀏覽介面，以 ADR 為主記錄架構決策。
    
    - **GitLab**：部分子專案（例如 GitLab Chart）逐步把架構文件改寫成 ADR 格式，屬於「既有文件 ADR 化」的實踐。
    
    - **ADR 社群、MADR**：[adr.github.io](https://adr.github.io/){target="_blank"} 提供 MADR（Markdown Architectural Decision Records）模板與工具，許多專案採用，通用且輕量。
    
    - **Rust**：透過 [rust-lang/rfcs](https://github.com/rust-lang/rfcs){target="_blank"} 的 **RFC** 流程，編號提案、社群討論、最終決策記錄，推動語言與標準庫變更。
    
    - **Python**：使用 **PEP**（Python Enhancement Proposal）作為語言與標準庫變更的正式提案與編號制度。
    
    - **Kubernetes**：使用 **KEP**（Kubernetes Enhancement Proposal）處理功能與架構變更的提案與討論流程。
    
    整體來說：有的專案「RFC 討論 + ADR 記錄」並行（如 GOV.UK），有的以 ADR 為主（如 Bitwarden、TPA），大型生態則常用編號提案（RFC、PEP、KEP）。Tor TPA 的特別之處在於明確「先決定誰做決定」、以及把「決策紀錄」與「對外溝通」分開處理。

!!! info "台灣專案與社群的現況"

    在台灣，多數專案或社群其實已經有「提案、討論、共識」的流程，只是**不一定用 ADR 這個名字**，也較少把決策文件以 `adr/` 目錄或 MADR 模板的形式公開出來。
    
    - **公民科技與社群（例如 g0v 生態）**：  
      常見作法是「提案文件、[HackMD 共筆](https://g0v.hackmd.io/@jothon/intro){target="_blank"}、黑客松或線上會議討論」（可參考 [g0v 開源協作手冊](https://g0v.hackmd.io/@jothon/g0v-cowork-guideline/){target="_blank"}），專案討論與決策多散落在共筆、issue 或大松提案中，架構層級的關鍵決策往往分散在 issue、PR、簡報或共筆裡，過一段時間就不容易追溯「當初為什麼這樣決定」。
    
    - **政府與公共部門合作案**：  
      專案通常會有規格書、系統設計文件或專案報告，形式上比較接近「一次性的大文件」，而不是隨著時間累積的 ADR log，而且多半不完全公開，外部貢獻者很難看到背後的取捨。
    
    - **企業開源專案（台灣團隊）**：  
      某些團隊在公司內部其實有用「決策紀錄」或「設計文件」的方式管理架構變更，但經常只在內部維運知識庫中存在，開源出去的只有程式碼本身，看不到決策歷史。
    
    目前的狀況，台灣社群不是沒有決策的流程，主要是少一種「穩定、好追溯、又對外面友善」的記錄方式。這也是為什麼 Tor TPA 用的 ADR 模型，或許也可能適合台灣的專案參考：

    - 每個重要決定都可以寫成一份小檔案，把「為什麼要這樣決定」記清楚。
    - 不用大家硬寫一大本規格書，又比只丟在 issue 裡容易長久維護。
    - 新手或外來的人看 ADR，就能很快懂「**原來系統是因為這樣才變成這樣**」，也比較不會一直重複這些討論。

