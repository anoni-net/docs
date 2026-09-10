---
date: 2026-09-11
authors:
    - anoni-net
categories:
    - 更新
    - Tor
    - 翻譯文章
slug: 2026-tor-vpn-beta
image: "https://forum.torproject.org/uploads/default/original/2X/1/1705e443e3cb9fe39eedf2432cf559090323d6fe.png"
summary: "Tor Project 在 2026 年 9 月 9 日發表 Tor VPN Beta 的開發回顧。構想始於 2021 年的使用者研究，第一個平台選 Android，去年秋天限量發布之後最主要的用途很快確定，使用者要的是解除封鎖。這篇整理官方回顧的內容，包含每個 app 各走一條獨立 Tor circuit 的隔離設計、Apps 畫面新增搜尋、出口選擇在可用性測試中造成的誤用（需要橋接的人去調了出口位置，因此現在必須先連上 Tor 才能選出口）、採用集中在伊朗與土庫曼這類高度審查地區、1.4.0 beta 優先補上 WebTunnel 橋接、底層 Arti 帶來的穩定性、可重現建置與 F-Droid 上架，以及壅塞控制尚未從 C 版 Tor 移植過來這件未完成的工作。文末補上台灣脈絡下的三個提醒。"
description: "Tor Project 在 2026 年 9 月 9 日發表 Tor VPN Beta 的開發回顧。構想始於 2021 年的使用者研究，第一個平台選 Android，去年秋天限量發布之後最主要的用途很快確定，使用者要的是解除封鎖。這篇整理官方回顧的內容，包含每個 app 各走一條獨立 Tor circuit 的隔離設計、Apps 畫面新增搜尋、出口選擇在可用性測試中造成的誤用（需要橋接的人去調了出口位置，因此現在必須先連上 Tor 才能選出口）、採用集中在伊朗與土庫曼這類高度審查地區、1.4.0 beta 優先補上 WebTunnel 橋接、底層 Arti 帶來的穩定性、可重現建置與 F-Droid 上架，以及壅塞控制尚未從 C 版 Tor 移植過來這件未完成的工作。文末補上台灣脈絡下的三個提醒。"
---

# 從零打造 Android 上的 Tor VPN，Beta 一年下來學到的事

!!! info ""

    以下內容整理翻譯自以下文章，主詞角色為 Tor Project：

    - [Tor VPN Beta: What we've learned building our own VPN for Android from scratch | September 9, 2026](https://blog.torproject.org/tor-vpn-beta/){target="_blank"}，作者 pavel

![Tor VPN beta 的主視覺，左側寫著已可在 download.torproject.org 取得，下方是 F-Droid 與 Google Play 的下載徽章，右側手機顯示已連線畫面與上下傳流量](https://forum.torproject.org/uploads/default/original/2X/1/1705e443e3cb9fe39eedf2432cf559090323d6fe.png){style="border-radius: 10px;"}

Tor Browser 多年來是保護隱私與繞過審查最有效的工具之一，而現在多數人上網的入口是各自慣用的 app，不是瀏覽器。把同一套保護延伸到通訊軟體、社群與電子郵件，是 Tor Project 的使用者研究裡反覆出現的要求，使用者想要一個簡單的方式保護整台裝置。Tor VPN 的構想在 2021 年因此成形，第一個平台選 Android，那裡的需求最強烈，也最能觸及受審查地區的使用者。

Tor VPN Beta 作為第一個版本推出時就預期要從真實使用中學習，去年秋天限量發布之後，最主要的使用情境很快清楚起來，使用者要的是解除封鎖。這件事決定了發布至今的開發與支援優先順序，也決定了產品往後的方向。

<!-- more -->

![兩支手機並排，左邊是 Tor VPN 的連線畫面顯示上傳 103.4 MB 與下載 398.7 MB，右邊是 Apps 畫面，Tor-powered apps 分區列出 OnionShare 與 Orbot，瀏覽器與其他 app 各有獨立開關，Signal、WhatsApp 已開啟，OONI Probe、Thunderbird 未開啟](https://forum.torproject.org/uploads/default/original/2X/3/3019334ddba9f2b40c00deb06c9c9817ccbf1dc5.png){style="border-radius: 10px;"}

## app 隔離的設計來自 Tor Browser

Tor VPN Beta 底下的模型與商業 VPN 根本不同。裝置上每個 app 各自取得一條自己的 Tor circuit（連線路徑），共用同一條通道的做法沒有採用，一個 app 的活動因此不容易被關聯到另一個 app。這種 app 隔離大量參考了 Tor Browser 的跨站追蹤防護，預設就在降低跨 app 的關聯，對行動裝置來說是裝置層網路保護的第一步。

app 層級的控制隨版本演進做得更好用。Apps 畫面現在可以搜尋，要找某一個特定的 app 並決定它是否走 Tor，速度快得多。

![Tor VPN 的 Apps 畫面搜尋列，輸入 Firefox 之後結果列出 Firefox、Firefox Focus 與 Firefox Nightly 三項，各自帶著獨立的開關](https://forum.torproject.org/uploads/default/original/2X/5/5bc40ac9fee7460120633665924571f718173ee4.jpeg){style="border-radius: 10px;"}

## 出口選擇造成的誤用改變了設計

出口選擇是一般人熟悉的 VPN 功能，對想繞過審查的使用者來說不見得是對的做法。官方把這件事列為開發階段的可用性測試與早期回饋帶來的最重要一課。

最初的方向是讓使用者對出口選擇有更多控制權，設計在紙上看起來很合理，做出來卻造成混淆。想繞過封鎖的使用者去調了出口位置，他們需要的功能是橋接（bridges）。Tor 的運作方式與使用者以為的運作方式之間有落差，目前的設計因此要求先把 app 連上 Tor 網路，之後才能選出口。官方仍然想更完整地探索出口選擇，前提是引入的方式不會在高風險情境下誘發操作錯誤。

## 使用者集中在高度審查的地區

早期的採用集中在高度審查地區，包含伊朗與土庫曼。Tor Browser for Android 的使用者分布偏向全球北方，Tor VPN Beta 這邊看到的是全球南方使用者更深的投入，網路限制對他們是每天要面對的現實。

規避能力的改善力度因此加倍。一個例子是在早期版本之一（1.4.0 beta）優先加入 WebTunnel 橋接，它讓 Tor 流量看起來像一般的加密網頁流量，審查方要偵測並封鎖連線因此變得更難。橋接支援整體也修掉幾個錯誤、做了幾項體驗改善，目標是讓橋接用起來更可靠。

## 穩定性、可重現建置與 F-Droid

早期發布之後，相當大一部分的工作投入在提升穩定性。Tor VPN 建立在 [Arti 這個以 Rust 撰寫的下一代 Tor 實作](https://blog.torproject.org/announcing-arti/){target="_blank"}之上，底層換成新的、扎實的技術基礎，舊架構上繼續打補丁的路沒有走。立即可見的好處是可靠性提升，崩潰次數減少，對各種網路狀況的處理也更好。

另外投入的兩項是把建置做成可重現，以及把 app 送上 F-Droid。可重現建置讓任何人都能驗證手上執行的二進位檔與公開的原始碼相符，F-Droid 讓使用者不必依賴 Google Play 就能安裝與更新，對一個以隱私與安全為重的工具來說，兩件事都重要。

速度上，Tor VPN Beta 的行為不像為速度最佳化的商業 VPN，而 [Tor 網路的效能這幾年確實提升了](https://blog.torproject.org/congestion-contrl-047/){target="_blank"}，[這些改善也在持續帶進行動端的體驗](https://gitlab.com/guardianproject/tormobile/arti-mobile){target="_blank"}。C 語言版 Tor 上的部分效能功能，例如壅塞控制（congestion control），在 Arti 還沒有，把這些能力移植過去是接下來的工作之一。

Tor VPN 的 UX 團隊負責人與產品經理 Duncan 在文中補充，專案的形狀很快就被使用者的真實用法推著走，尤其是需要可靠且涵蓋整台裝置的規避能力的那些人。團隊因此把力氣放在替行動端的 Tor 打好基礎，做成以 Arti 與 [Onionmasq](https://gitlab.torproject.org/ahf/onionmasq){target="_blank"} 為核心的模組化 Tor 堆疊，能隨真實使用一起演進。這些元件現在可以被多個應用程式重複使用，生態系的碎片化與長期維護風險都因此降低。官方也寫明工作還沒結束，Tor Browser 目前仍然是這件事能做到什麼程度的標準，讓 Tor VPN 隨時間逼近那個水準是團隊目標的一部分。

## 接下來的方向

Tor VPN Beta 是橫跨數年的協作成果。官方在文中感謝 [The Guardian Project](https://guardianproject.info/){target="_blank"} 的指引與關鍵的低階行動端函式庫，也感謝 LEAP Encryption Access Project 的高品質工作，少了任何一方這個 app 都不會問世。[開發持續在公開狀態下進行](https://blog.torproject.org/code-audit-tor-vpn/){target="_blank"}，由使用者的真實用法塑形。

具體的方向有三個，改善受限環境下的規避能力，把更多效能功能帶進 Arti，以及調整使用者體驗來減少混淆與風險。想參與開發方向的人可以到[改版過的下載頁面](https://download.torproject.org/){target="_blank"}，除了下載 APK 或從 Google Play 商店安裝，現在也能透過 F-Droid 取得 Tor VPN Beta。

## 台灣脈絡下值得關注的地方

**用途的落差要先說明**：Tor VPN Beta 最主要的用途是解除封鎖，而台灣目前沒有全國性的網址封鎖，迫切性跟伊朗、土庫曼不同。在台灣用得上的是它裝置層的 app 隔離，每個 app 各走一條 circuit，降低跨 app 被關聯的機會。要去有封鎖的地區之前先裝好、先熟悉操作，相關準備見[亞洲旅行的數位安全](../../scenarios/asia-travel.md)。

**橋接與出口選擇的混淆同樣會發生在這裡**：官方在可用性測試裡看到的誤用，是被封鎖的人去調出口位置。本地推廣或帶工作坊時，這一組概念的先後順序要先交代，連不上要處理的是橋接，出口位置解決的是另一件事。橋接類型的說明見 [Snowflake 與橋接](../../tools/tor-snowflake.md)。

**Beta 的警語仍然有效**：官方支援文件到現在還標著可能洩漏資訊、不應用於任何敏感用途。對記者、人權工作者這類高風險使用者，現階段它適合測試與熟悉，真正高敏感的任務仍用 [Tor Browser](../../tools/what-is-tor.md) 或 Tails。安全稽核的結果見 [Cure53 完成 Tor VPN 安全稽核](./2026-code-audit-for-tor-vpn-completed-by-cure53.md)，工具之間的取捨比較見 [VPN 選擇指南](../../tools/vpn-guide.md)。

!!! info "參考資料"

    - 原文全文：[Tor VPN Beta: What we've learned building our own VPN for Android from scratch](https://blog.torproject.org/tor-vpn-beta/){target="_blank"}，Tor Project 官方部落格，2026 年 9 月 9 日
    - 圖片來源：[Tor Project 官方論壇的同一篇討論串](https://forum.torproject.org/t/tor-vpn-beta-what-weve-learned-building-our-own-vpn-for-android-from-scratch/22104){target="_blank"}，本篇引用論壇上的原始尺寸檔案
