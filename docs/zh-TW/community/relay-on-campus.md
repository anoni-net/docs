---
title: Tor Relay 校園建立研究專題
description: 2026 三大主題之一：與 EFF/Tor Project 推動校園 Tor 中繼節點的計畫、案例與如何加入。
icon: material/server-network
---

# :material-server-network: Tor Relay 校園建立研究專題

Tor Relay 校園建立是 匿名網路社群 anoni.net 2026 的三大主題之一，跟「個人隱私指引」、「匿名支付」並列為今年的重點推進項目。這頁是專題的對外入口，整理推動目標、相關文章索引、案例累積，以及如何加入社群協作。

## 為什麼把校園 Tor Relay 獨立成一個主題

Tor 網路的匿名性靠**多元的中繼節點**支撐。當絕大多數中繼集中在少數國家或少數網路供應商時，Tor 對抗流量分析的能力就會降低。台灣目前在 Tor Metrics 上能看到的中繼數量有限，多元性還有很大成長空間（即時觀測見 [Tor Relays 觀測點](../taiwan/tor-relay-watcher.md)）。

大專院校是補上這個缺口的合適切入點：

- **頻寬穩定**：學術網路通常有充足且穩定的頻寬
- **技術人才在場**：資工、資管、資訊中心的師生有架設與維運能力
- **法律與制度相對清晰**：學校有正式的提案與審核流程，比個人或小公司架設更容易說明用途、爭取支持
- **教育價值**：架設過程本身就是匿名網路、資安、開源治理的具體教學場景
- **國際接軌**：對接 EFF 的 [Tor University Challenge](https://toruniversity.eff.org/zh-tw/){target="_blank"} 計畫，把台灣校園納入全球架設網絡

社群想做的是**把校園架設的完整流程、跟學校溝通的話術、實際維運經驗整理成可複製的方法論**，讓第二、第三所學校的推動成本明顯降低。

## 2026 推動目標

- **校園架設 SOP 文件**：從提案、跟學校溝通、技術設置、上線、後續維運的完整流程
- **跟學校溝通的話術與案例庫**：法律疑慮、頻寬使用、用途說明等高頻問題的回應參考
- **第二、三所學校接洽**：以台師大為起點，向其他大專院校擴展
- **EFF/Tor Project 對接**：建立穩定的國際對接管道，把台灣案例回饋給全球計畫
- **觀測即時化**：透過 [Pulse](https://api.anoni.net/api/readme){target="_blank"} 持續追蹤校園節點的運作狀況
- **跟資安教育活動的搭配**：把 Tor Relay 架設整合進校園資安宣傳、迎新講座等場合

## 相關文章

- 案例：[在台師大架設 Tor Relay：一段與學校溝通、留下可能性的實作經驗](../blog/posts/ntnu-nz.md)
- 國際參考：[Tor Project 客座文章：Setting Up a Tor University Relay in Taiwan](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"}
- 技術 how-to：[如何搭建 Tor Relay](./setup-tor-relay.md)
- 觀測：[Tor Relays 觀測點](../taiwan/tor-relay-watcher.md)
- 概念：[什麼是 Tor](../tools/what-is-tor.md)、[Tor Snowflake 橋接點](../tools/tor-snowflake.md)
- 進階：[一個會遺忘的伺服器：探索無狀態中繼](../blog/posts/2026-a-server-that-forgets-exploring-stateless-relays.md)

## 已完成的事

- **第一個校園案例上線**：國立臺灣師範大學資訊工程學系資訊中心的 Tor Relay 已運行，由社群夥伴 NZ 透過教授與教職員提案、協調後完成建置
- **Tor Project blog 客座文章**：把台師大案例寫成英文版本，刊登於 [Tor Project blog](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"}，登錄到全球視野
- **Tor University Challenge 中譯**：完成 [EFF Tor University Challenge 網站](https://toruniversity.eff.org/zh-tw/){target="_blank"} 的正體中文翻譯，降低台灣其他學校接觸計畫的語言門檻
- **觀測站 Pulse 上線**：[Tor Relays 觀測點](../taiwan/tor-relay-watcher.md) 即時顯示台灣（與日本、南韓、香港）的中繼節點狀況
- **訪談企劃**：把台師大架設過程整理成 [深度訪談](../blog/posts/ntnu-nz.md)，公開給後續推動者參考
- **範本工具包上線**：把台師大實作經驗整理成提案文件、技術 SOP、校方 FAQ 三份檔案，其他學校可直接套用（見下方「範本工具包」段落）

## 範本工具包（可直接拿去用）

這個工具包整理自社群夥伴 NZ 在台師大的實作經驗，目的是把「**第二、三所學校的推動成本**」降到最低。其他學校的學生不必從零開始，可以直接複製範本、改寫、送進自己學校的審核流程。

- :material-file-document-edit-outline: [校園 Tor Relay 提案範本](./campus-tor-relay-proposal.md)：提案文件、四封溝通 email、行政時間軸
- :material-server-network-outline: [校園 Tor Relay 架設 SOP](./campus-tor-relay-sop.md)：torrc、UFW、狀態網頁、監控、事件處置 runbook
- :material-chat-question-outline: [校園 Tor Relay：給校方與法務的 FAQ](./campus-relay-faq.md)：Q1-Q10 校方常見疑慮與台灣脈絡補充

建議的閱讀順序：先看 [台師大案例訪談](../blog/posts/ntnu-nz.md) 對全貌有感，再依角色挑工具包裡的對應檔案。提案者讀提案範本、技術維運者讀 SOP、要面對校方時帶上 FAQ。

## 進行中與待完成

- **第二所學校接洽**：與其他大專院校的初步聯繫與評估
- **資安活動搭配**：跟學校資安週、迎新講座、Hackerton 等活動的合作模式
- **政策溝通材料**：給教育部層級的計畫說明、跨國比較資料
- 翻譯候選報告（候選清單見下方）

## 待翻譯與延伸閱讀

以下是社群已標記的候選外部資源，歡迎志工協助翻譯或重點摘錄：

- [Tor Project Relay Operator Guides](https://community.torproject.org/relay/){target="_blank"}：中繼站營運官方指南
- [Tor University Challenge case studies](https://toruniversity.eff.org/case-studies/){target="_blank"}：國際校園案例研究
- [EFF Legal FAQ for Tor relay operators](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"}：營運中繼的法律常見問題
- 各國校園 Tor Relay 政策案例（MIT、Northeastern、CMU 等）

## 如何加入討論

社群討論在 Matrix（家伺服器 `im.anoni.net`）。Tor Relay 校園主題目前以社群 Public Space 中的相關 room 為主要溝通管道。帳號申請與服務入口請見 [社群自架服務](./tools.md)。

如果你有以下任一背景，特別歡迎加入：

- **大學在學、校友、教職員**：對自家學校有理解，能評估推動可行性
- **網路維運經驗**：能參與技術設置與長期維運
- **政策溝通能力**：能協助跟校方、資訊中心、法務單位溝通
- **法律專業**：能解讀中繼營運相關的法律疑慮（個資、刑事、學校規章）
- **活動籌辦經驗**：能把架設工作整合進資安週、迎新等校園活動

不需要架過 Tor Relay 也歡迎參與。「我想學」就是合理的加入動機，社群會搭配 [如何搭建 Tor Relay](./setup-tor-relay.md) 文件協助你動手。

## 議題守則

社群所有討論以合法用途為前提。Tor Relay 校園主題會以教育、研究、基礎建設參與為目的呈現，不協助任何違法行為。校園架設過程涉及學校資源使用，應走正式提案與審核流程，並充分告知校方節點用途與營運責任。
