---
title: 開源科技開發者
description: 給開源社群開發者的參與路徑。依照你手上有的資源分成四條線，架設節點、觀測資料分析、校園提案、文件與翻譯，各自列出可以認領的工作。
icon: material/console
---

# :material-console: 開發者從這裡開始

其他身分的入口頁說明怎麼保護自己，這一頁說明你的技能能接到哪裡。匿名網路的多數基礎設施由志願者維運，中繼節點、橋接、觀測資料、鏡像站，每一項都缺人。

先看你手上有什麼，再決定走哪一條線。四條線互相獨立，挑一條開始就好。

## 二十分鐘：先確認方向

1. [2026 年度路線圖](../community/roadmap-2026.md)：社群今年投入的三個主題與各自的進度，先看有沒有你想接的
2. [如何參與與認領主題](../community/how-to-contribute.md)：怎麼選題、怎麼在 Matrix 表達意願、平時的參與方式
3. [自我技能評估表](../community/skill-level.md)：Tor、Tails、OONI 三個工具的分級自評，每一級下面都列了補齊用的文章

## 四條可以認領的線

### 有一台長期開機的機器與穩定頻寬

最直接的貢獻。從中繼節點開始，頻寬不足或 IP 會變動的話改做橋接。

- [如何搭建 Tor Relay](../community/setup-tor-relay.md)：中繼節點的完整設定
- [如何搭建 Tor WebTunnel 橋接](../community/setup-tor-webtunnel.md)：橋接對頻寬的要求低很多，在審查環境下的價值也更高
- [Tor Snowflake](../tools/tor-snowflake.md)：門檻最低的一種，裝一個瀏覽器擴充套件就開始運作
- [如何搭建 .onion 服務](../community/setup-onion-service.md)：把手上的服務多開一個 onion 入口
- [幫忙 pin 文件站的 IPFS 鏡像](../community/pin-ipfs-mirror.md)：目前是單點，多一個 pin 就多一份備援
- [Tor Relays 觀測點](../taiwan/tor-relay-watcher.md)：先看台灣現在有多少節點、分布在哪些 ASN

### 會寫程式，會處理資料

觀測資料這條線缺的是能把原始測量讀懂、寫成分析的人。

- [OONI 測量資料結構導覽](../community/ooni-data-format.md)：原始測量的欄位長什麼樣
- [OONI 怎麼判定一個網站被封鎖](../community/ooni-blocking-determination.md)：判定邏輯先弄懂才不會誤讀資料
- [OONI 測項速查表](../community/ooni-nettests-map.md)：各測項測的是什麼
- [ASN 觀測資料擷取與分析](../community/asn-coverage-howto.md)：社群自己那支擷取程式怎麼設定與使用，含 S3 公開資料集的路徑結構
- [ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)：台灣目前的涵蓋狀況，缺口就是題目
- [onionoo MCP](../community/onionoo-mcp.md)：社群自架的 Tor 中繼查詢服務，也是一個可以延伸的介面
- [OONI 網站檢測清單](../taiwan/ooni-checklist.md)：台灣的檢測清單怎麼維護，分類與更新都需要人

### 在學校或公司內部有影響力

校園中繼節點需要的是能跟行政與法務溝通的人，技術反而是簡單的部分。

- [校園 Tor Relay 提案範本](../community/campus-tor-relay-proposal.md)：從台灣師範大學的成功案例整理出的提案文件、四封溝通信與行政時間軸，可以直接改寫送審
- [校園 Tor Relay 架設 SOP](../community/campus-tor-relay-sop.md)：提案通過之後的實際步驟
- [給校方與法務的 FAQ](../community/campus-relay-faq.md)：審核時會被問到的問題與回答

### 會寫文件，會翻譯

- [貢獻者百科](../community/contributor-handbook.md)：寫作風格規範的單一來源，動筆前先讀
- [中文化與文件翻譯](../community/i18n.md)：三語系的翻譯流程
- [專案研究預先準備](../community/setup-repo.md)：開始一個新主題之前的準備工作

## 不分身分都要做到的

技術能力跟個人的操作習慣是兩件事。手上有 root 權限與一堆 API 金鑰的人，被盯上的價值比一般使用者高。

- [一般人平常該做到什麼](../scenarios/everyday-baseline.md)：依實際效果排序的做法，二十分鐘讀完
- [常被誤認為匿名的網路](../advanced/mistaken-for-anonymity.md)：區塊鏈、私密瀏覽視窗、VPN 這幾項常被高估到什麼程度

## 帶得走的東西

- [Matrix 公開 room](../community/tools.md)：認領主題前先在這裡說一聲，避免兩個人做同一件事
- [GitHub 的 anoni-net/docs](https://github.com/anoni-net/docs)：文件站的原始碼與 issue，每個 issue 都寫了預期內容
- 社群自架的 CryptPad 與 Etherpad 可以直接用來寫提案草稿，見[社群自架服務](../community/tools.md)

## 這條路徑沒有處理的

- **中繼節點的法律風險評估**：出口節點與中繼節點的差別很大，[校園 Tor Relay 的 FAQ](../community/campus-relay-faq.md) 有整理法務面的問答，個人架設前建議一併看過
- **Tor 本身的協定細節**：站上寫到工具層與觀測層為止，協定規格請直接看 Tor Project 的文件
