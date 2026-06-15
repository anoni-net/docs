---
date: 2026-05-21
authors:
    - anoni-net
categories:
    - 社群
    - 公告
slug: 2026-campus-tor-relay-template-kit
image: "assets/images/post-update.png"
summary: "NZ 把台師大校園 Tor Relay 的提案計畫、溝通 email、技術設定、踩雷整理成三份 CC-BY 4.0 範本，給想響應的學校直接拿去用。"
description: "NZ 把台師大校園 Tor Relay 的提案計畫、溝通 email、技術設定、踩雷整理成三份 CC-BY 4.0 範本，給想響應的學校直接拿去用。"
---

# 校園 Tor Relay 範本工具包：提案、SOP、FAQ 三份範本上線

![校園 Tor Relay 範本工具包](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

2025/11，台灣第一個校園 Tor Relay 在台師大資工系上線。社群這半年想把這段過程、「跟學校溝通、走 TANet 行政流程、技術部署、長期維運」的經驗整理成其他學校可以直接拿去用的文件，不要再讓每一所學校的學生從零開始摸索。

社群夥伴 NZ（蘇恩立）這半年陸續把當時的計畫書、溝通 email、技術設定、踩過的雷整理出來，跟社群一起改寫成可複製範本。三份範本目前都已經上線，並以 CC-BY 4.0 授權釋出，搭配[台師大案例訪談](./ntnu-nz.md)當入口。

範本已經齊了。接下來，希望能有更多學校一起響應。

<!-- more -->

## 範本工具包：三份檔案接力

工具包分三份，對應推動 Tor Relay 過程中三個不同角色的需求。

**[校園 Tor Relay 提案範本](../../community/campus-tor-relay-proposal.md)**：一份完整的「Tor University Challenge at <學校名>」提案計畫書、四封對外溝通 email（給指導教授、資訊中心網路組組長、系上網管申請主機/IP、對外開放 port 申請）、台師大實際走過的兩個月行政時間軸，以及提案前的準備清單與踩雷提醒。所有放在 `<placeholder>` 裡的欄位都標出來，複製出去把學校名、系所、IP 段、教授姓名填進去就能送進審核流程。

**[校園 Tor Relay 架設 SOP](../../community/campus-tor-relay-sop.md)**：提案通過、拿到機房位置與 IP 之後的技術部署文件。內容包含 torrc 參考設定（ContactInfo、Non-Exit 宣告、頻寬上限、MetricsPort 安全提醒）、UFW 防火牆設計（SSH 限校內 VPN 段、ORPort 9001 對外開放）、對外狀態網頁兩種架構選擇（Nginx + Onionoo 推薦，或 MetricsPort + Prometheus + Grafana）、監控與事件處置 runbook、IPv6 設定、畢業後交接清單。

**[校園 Tor Relay：給校方與法務的 FAQ](../../community/campus-relay-faq.md)**：十題校方資訊中心、法務、網管最常擔心的問題，每題都有台灣脈絡補充，刑法妨害電腦使用罪章、個資法第 2 條、TANet 對外連線審核機制都已經對到具體條文。頁尾另外整理「給網管的一頁摘要」與「給校方行政與法務的一頁摘要」，30 秒讀完，可以直接複製貼進 mail 開頭或當會議 handout。

三份檔案的整體入口、推動目標、案例累積，以及「待翻譯延伸閱讀」清單，都收在 [Tor Relay 校園建立研究專題](../../community/relay-on-campus.md)。

## 建議的閱讀順序

依角色挑切入點，省下繞路時間。

- **還在評估「該不該做」**：先讀[台師大案例訪談](./ntnu-nz.md)，對全貌有感再決定
- **想推動但沒寫過提案**：提案範本 → FAQ → SOP。提案前先把 FAQ 讀完，被問到才不會答不上來
- **提案已通過、要開始裝**：直接跳 SOP，搭配[「如何搭建 Tor Relay」](../../community/setup-tor-relay.md)的個人 operator 視角補完基礎
- **單純被校方問到 Tor Relay**：把 FAQ 頁尾的兩份一頁摘要直接轉貼給對方

## NZ 公開釋出的原始素材

範本是 placeholder 化、去掉個人資訊的乾淨版本。如果你想看「真實案例長什麼樣」，NZ 把當時的原始 Google Drive 資料夾整份公開：

- [NZ 原始 Google Drive 資料夾](https://drive.google.com/drive/folders/1B9ysi2ELC9w46bD3o7TMsnv55nupI1nz){target="_blank"}

裡面包含台師大原版專案計畫說明書（Google Doc）、2025/12/21 校內分享 slides、現場照片。原始 Doc 裡有 NZ 個人 email、指導教授資訊、學校 IP 段等具體欄位，請不要直接 fork 原始 Doc 改學校名就送出去，容易在送件時被識破。原始存檔的價值是讓你對照寫作結構、用語拿捏，動手時還是用 anoni.net 上 placeholder 化過的範本。

英文版的案例脈絡，也已經刊在 Tor Project 官方部落格，國際同行看得到台灣這條線：

- [Setting up a Tor Relay at a university in Taiwan](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"}

## 為什麼台灣需要更多校園 Tor Relay

Tor 網路的匿名性靠多元的中繼節點支撐。當全球中繼集中在少數國家或少數網路供應商，Tor 對抗流量分析的能力就會降低。台灣目前在 Tor Metrics 上能觀測到的中繼數量仍然有限，每多一個穩定運作的節點，整個網路對抗流量分析的能力就多一分。即時觀測見 anoni.net 的 [Tor Relays 觀測點](../../taiwan/tor-relay-watcher.md)。

大學校園是補上這個缺口的合適切入點：

- **頻寬與人才**：學術網路頻寬穩定，資工、資管、資訊中心的師生有架設與維運能力，畢業交接也比個人架設容易延續
- **制度路徑清晰**：學校有正式的提案與審核流程，比個人或小公司架設更容易說清楚「誰負責、出事找誰」
- **教育與國際接軌**：架設過程本身是匿名網路、資安、開源治理的教學場景，並對接 EFF [Tor University Challenge](https://toruniversity.eff.org/zh-tw/){target="_blank"} 全球計畫

同時，台灣社會近年對揭弊者保護、家暴與跟蹤騷擾防制、新聞自由的關注持續上升，Tor 對這些情境的價值跟全球趨勢一致。校園 Relay 是「讓這套基礎設施在台灣可用」的具體貢獻。它的意義在於讓真正需要的人能順利使用，比抽象的隱私倡議更貼近實際處境。

## 號召：在台灣的大學生、社團、系所

如果你符合以下任一條件，特別歡迎加入：

- **資工、資安、資管、電機、網路相關系所的學生**：你的技術背景剛好，跟指導教授或系上網管討論起來不會有溝通落差
- **校內資安、開源、Linux、網路相關社團**：社團 email 與長期維運分工，正好補上「畢業交接」這個校園 Relay 最常斷掉的環節
- **指導教授、實驗室助理、資訊中心的教職員**：你掛名能讓提案順利不少。學校行政體系對「有教授掛名」的提案接受度普遍更高
- **正在找專題題目或修網路、資安課程的同學**：Tor Relay 架設本身就是完整的網路、系統管理、政策溝通實作題目，可以整理成專題、學位論文或 COSCUP 投稿

不需要架過 Tor Relay 也歡迎參與。「我想學」就是合理的加入動機，社群會搭配[「如何搭建 Tor Relay」](../../community/setup-tor-relay.md)文件協助你動手。

如果你正在自己學校推動、卡在某個環節想找人討論，或者已經有想法但不知道如何跟教授開口，任何一個階段都歡迎聯繫社群。常用入口整理在[社群自架服務](../../community/tools.md)頁面，Matrix 公開 room 也可以直接打招呼。

## 致謝

範本工具包的原始材料由社群夥伴 NZ（蘇恩立）提供，整理自他在國立臺灣師範大學的計畫書、溝通記錄、實作經驗、技術設計。NZ 同意以 CC-BY 4.0 授權釋出全部素材，作為台灣其他學校的參考範本。

每個成功上線的校園 Relay 都讓推動成本變低一點。你的案例會幫到後面響應的學校。社群會把新增的學校加進「Tor Relay 校園建立研究專題」的「已完成的事」段落，往後加入的學校可以有更多參考。

這份工具包是給想響應的學校一個共用起點，可被任何一所大學拿去、改寫、送進自己校園的審核流程。每多一所學校加入，共用範本庫就持續累積，後續推動的人會更省力。
