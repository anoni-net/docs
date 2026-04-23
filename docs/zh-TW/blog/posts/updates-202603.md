---
date: 2026-03-29
authors:
    - toomore
categories:
    - 更新
    - 社群
slug: updates-202603
image: "assets/images/post-update.png"
summary: "2026/03 社群近況：Tor Project 客座文章、COSCUP 2026 議程軌確認、g0v Hackath71n 匿名支付討論、Cryptpad 正體中文翻譯"
description: "2026/03 社群近況：Tor Project 客座文章、COSCUP 2026 議程軌確認、g0v Hackath71n 匿名支付討論、Cryptpad 正體中文翻譯"
---

# 2026/03 社群近況更新

![2026/03 社群近況更新](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

感謝 Tor Project 的邀約，讓我們匿名網路社群有機會分享在學術網路上架設 Tor Relay（中繼點）的經驗。

Tor Project 的官方網站 Blog 文章 [Setting up a Tor Relay at a university in Taiwan](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"} 中，我們分享了在台灣師範大學架設 Tor Relay 的經驗，以及如何與學校溝通、留下可能性的實作經驗。

感謝來自 Tor Project 的 Pavel 與 Roger 給予我們的幫助，讓我們有這個機會透過客座文章的方式分享我們的經驗。

<!-- more -->

## 社群近期近況

匿名網路社群近期正持續籌備 2026/08 的工作坊活動，COSCUP 年會的社群議程軌已確認申請到，為期兩天，將以議程與工作坊混合的形式進行。後續我們會另行公告徵稿方式，歡迎持續關注。

去年我們透過參與 COSCUP，將「匿名網路」與「網路自由」的概念帶進台灣開源社群年會。今年也會持續參與，聚焦於「隱私」、「校園匿名網路建設」、「匿名支付」等議題，並持續邀請新聞媒體、獨立記者、公民團體與科技社群一同參與。由於 COSCUP 本身不需報名或驗證身分，因此可在匿名的前提下加入活動。

此外，在「匿名支付」議題上，我們打算與以太坊基金會在台北的在地社群共同合辦，並希望透過區塊鏈、去中心化與無須許可的技術，協助我們探索並打通「匿名支付」實踐的可能性。

### g0v Hackath71n（高雄）

2026/01 我們參與了 g0v Hackath71n（高雄）活動，並在「匿名支付」主題上先釐清一個核心問題：匿名不只發生在上網行為，支付流程本身也可能暴露個人身分與關係網。基於這個前提，我們先從真實使用情境出發，盤點哪些支付場景確實有匿名需求，而不是把所有交易都一概視為同一種問題。

討論過程中，我們也聚焦在合規與技術之間的拉扯。實務上，許多支付與轉帳流程會經過中心化交易所，而交易所通常必須遵循 AML/KYC 與跨境監管要求，進而帶來個資揭露與交易可追蹤性的風險。這些限制不只影響工具可行性，也會直接改變使用者在不同地區的實際選擇。

因此，在那次的黑客松活動將「匿名支付」定位為研究與討論導向的專案。先整理風險、限制與法規疑慮，再逐步形成可持續深化的研究方向。接下來我們也會持續與在地社群協作，將討論轉化為更具體、可驗證的實作路線。

活動的共筆討論紀錄可以參考[這份文件](https://cryptpad.anoni.net/pad/#/2/pad/view/3XxPju-P5tDaPaVclZUwhWvx5uA8CVZv7+8T7uiLqFE/){target="_blank"}。

### 參與我們

如果你對「隱私保護」、「校園 Tor Relay 建置」或「匿名支付」等主題有興趣，歡迎加入我們一起協作。社群目前整理了 2026 年的主題方向與參與方式，你可以先從[這裡看看](../../about/community/participate.md)有哪些議題最想投入。

不需要等到活動現場才參與，平時就能從線上開始。你可以先挑一個有感的主題，接著到對應的討論空間打聲招呼、分享關注點，或認領一個你願意持續追蹤的小題目，讓大家知道可以如何彼此支援。

我們日常主要透過 Matrix 討論、用 Cryptpad 進行共筆協作、在需要時以 Jitsi 開線上會議。工具入口、帳號申請方式與基本使用說明都整理在[溝通與協作工具](../../about/community/communication-tools.md)頁面。

如果你是第一次接觸這些工具，也不用擔心。可以先從加入 [Public Space](https://matrix.to/#/#community:im.anoni.net){target="_blank"} 開始，看看目前有哪些 room 正在討論，再選擇自己想先旁聽或直接參與的主題。通常從閱讀近期訊息、回覆一兩個問題開始，就是最好的第一步。

我們很期待更多夥伴一起把討論變成可落地的行動。無論你想投入研究、文件整理、活動協作，或只是先來了解現況，都非常歡迎加入，一起把匿名網路的實踐做得更完整。

### Cryptpad 正體中文翻譯

我們近期也將 Cryptpad 的正體中文[翻譯完成](https://github.com/cryptpad/cryptpad/issues/2237){target="_blank"}，並進一步提出了 [PR #2254](https://github.com/cryptpad/cryptpad/pull/2254){target="_blank"}，將原本籠統的 `zh` 語系拆分為 `zh_Hant`（正體中文）與 `zh_Hans`（簡體中文）兩個明確的語系設定。這份 PR 已被納入 Spring Release（2026.3.0）的里程碑，預計在該版本正式支援正體中文介面。

Cryptpad 可以把它想成「比較重視隱私的 Google Docs」，有文件、試算表、簡報和看板等常用功能。差別是資料在送到伺服器前就先加密了，伺服器端也看不到內容。對我們這種重視匿名與隱私的社群來說，用它來共筆、討論和整理專案，能減少不必要的個資暴露，也比較安心。

Cryptpad 是一套很好用的線上協作工具，也正在規劃如何在台灣推廣這個服務。目前社群有自己架設一台，提供 50 MBs 的空間，歡迎申請使用：[cryptpad.anoni.net](https://cryptpad.anoni.net){target="_blank"}
