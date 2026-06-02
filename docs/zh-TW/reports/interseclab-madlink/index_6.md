---
title: 編輯觀察：台灣的後續反應
description: anoni.net 編輯團隊整理 MADLink 報告發布後台灣媒體、政府、立委的反應現況，記錄這份點名台灣公司的研究在本地能見度為何如此有限。內含英文版觀察供國際讀者閱讀。
icon: material/eye-outline
---

# :material-eye-outline: 編輯觀察：台灣對 MADLink 報告的後續反應

!!! note ""

    - 本頁為 anoni.net 編輯團隊的觀察整理，**不屬於** [InterSecLab MADLink 原報告](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"}的內容。
    - 觀察快照時間：**2026-05-20**（2026-05-16 初版，2026-05-20 新增「外部交叉驗證」段落）。後續若有新進展（媒體報導、政府表態、凌華稽核結果、立委公開發言等），請透過頁面右上方「:material-note-edit-outline: 編輯圖示」回報，或在[參與討論](./index.md#參與討論)頻道分享。
    - 頁面下半段提供 **English summary for international readers**，方便從海外連過來的讀者了解這份報告在台灣本地的後續狀況。

## 為什麼要寫這段觀察

MADLink 報告的核心問題，是台灣現行出口管制制度能否阻止本地公司供應監控與審查設備給威權政府的供應鏈。當報告點名了一家台灣上市公司，理論上會引發本地媒體追問、立委質詢、主管機關回應這樣的循環。

但這份報告發布後，台灣中文公共領域的反應明顯偏少。這種「沒有反應」本身就是觀察素材，它顯示報告所指出的制度缺口可能不只在法規層面，也在政治關注與媒體議題化的層面。記錄這個狀態，是為了讓後續查找這份報告的人能看到當下的接收脈絡，也讓社群有一個追蹤的起點。

## 外部交叉驗證

這份報告點名一家上市公司、引述一連串技術細節。在記錄台灣本地反應之前，我們先對報告中的關鍵事證做了一輪獨立查證，讓讀者能自行重現。

### 報告核心事證

**IEEE OUI `00:30:64` 確實登記在 ADLINK Technology, Inc. 名下。** 這是報告把 EtherFabric 與凌華關聯起來的硬體指紋，也是整份報告最容易自行驗證的一條線索。透過 macvendors.com（[`api.macvendors.com/00:30:64`](https://api.macvendors.com/00:30:64){target="_blank"}）或 macvendorlookup.com（[`api.macvendorlookup.com/api/v2/003064`](https://www.macvendorlookup.com/api/v2/003064){target="_blank"}）查詢，兩個獨立來源都回傳「ADLINK TECHNOLOGY, INC.」，註冊地址為新北中和區建一路 166 號 9 樓（凌華舊址）。這從硬體層級確認了「EtherFabric 管理介面 MAC 位址來自凌華設備」這項主張屬實。

**CSA-7400 被凌華自家行銷成 DPI 與防火牆設備。** 報告反駁凌華「通用平台」說法的核心，就是這款產品本身的市場定位。在凌華中英文官網[產品頁](https://www.adlinktech.com/Products/Network_Security_Appliance/4UNetworkAppliance/CSA-7400?lang=en){target="_blank"}上，CSA-7400 明確被分類在「Network Security Appliance」底下，行銷為「DPI、IDS/IPS、DDoS、NGFW」carrier-grade 設備。manualzz 上的 [Quick Start Manual](https://manualzz.com/doc/55701658/adlink-technology-csa-7400-quick-start-manual){target="_blank"} 也載明出貨預載 CentOS 7，與報告描述 TSG-OS 早期基於 CentOS 的細節一致。

**積至（海南）信息技術有限公司由方濱興於 2018 年在海南創立。** 維基百科[积至信息](https://zh.wikipedia.org/wiki/%E7%A7%AF%E8%87%B3%E4%BF%A1%E6%81%AF){target="_blank"}、[大紀元 2025-09-13 報導](https://www.epochtimes.com/b5/25/9/13/n14593857.htm){target="_blank"}、[新唐人](https://www.ntdtv.com/b5/2025/09/13/a104019706.html){target="_blank"} 互相印證該公司基本資訊、創辦人身分，以及與中科院信息工程研究所 MESA 實驗室的同根關係。

**New Bloom Magazine 2026-04-29 那篇報導真實存在。** 標題「[Taiwanese Company Implicated in Great Firewall Supply Chain By Report](https://newbloommag.net/2026/04/29/tw-adlink-geedge/){target="_blank"}」，發佈時間 2026-04-29 07:41 UTC。這是目前唯一明確聚焦凌華與 Geedge 連結的台灣相關英文媒體報導。

### 編輯觀察自身

**「台灣中文主流媒體零覆蓋」的判斷有跨來源支持。** 用「凌華 Geedge」、「MADLink 凌華」、「凌華 哈薩克」等關鍵字跨媒體搜尋，截至 2026-05-20 沒有任何一則台灣中文主流報導直接聚焦這條供應鏈線。同期凌華自家中文新聞版面在邊緣 AI、Taiwan Excellence 獎項、CYBERSEC 2026 參展等業務話題上。

**「沈伯洋無公開發言」的判斷可重現。** 搜尋他在立法院議事系統、社群平台與媒體採訪的近期版面，找不到他就此議題的進一步發聲。他目前公開版面被「中國紅色通緝令」、「徵召選台北市長」、「凌濤揭沈父親公司與中國有商業往來」等議題佔據。

**「凌華未發布相關重大訊息」的判斷可重現。** 在 [公開資訊觀測站](https://mopsov.twse.com.tw/){target="_blank"} 以代號 6166 查詢，截至 2026-05-20 沒有針對 Geedge、CSA-7400 出貨案、內部稽核啟動的公開重大訊息公告。

## 媒體覆蓋對比

### 國際與英文媒體（有覆蓋）

* [InterSecLab](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"} 原報告（2026-04）：本系列調查的第一手研究，接續 2025-09 的「[The Internet Coup](https://interseclab.org/research/the-internet-coup/){target="_blank"}」。
* [New Bloom Magazine](https://newbloommag.net/2026/04/29/tw-adlink-geedge/){target="_blank"}（破土，台灣議題英文媒體，2026-04-29）：目前唯一明確聚焦此案的台灣相關獨立媒體報導，文章自身就觀察到「Geedge 是中國公司，台灣政府對涉及中國的案子通常會有反應，但這次卻意外地安靜」。
* 國際科技與資安媒體（cybernews、osnews、Daily Security Review 等）：多數延續 2025-09 Geedge 500GB 外洩事件的報導框架，凌華這個台灣供應鏈節點未被特別放大。

### 台灣中文媒體（基本無覆蓋）

* 台灣主流新聞媒體（聯合、自由、中央社、TVBS、TechNews、iThome 等）：截至 2026-05-16，搜尋未發現任何一則直接報導 MADLink 或凌華、Geedge、哈薩克這條線。
* [TechNews 科技新報](https://infosecu.technews.tw/2025/09/14/china-geedge-mesa-leak-analyzing-the-great-firewall-largest-document-leak/){target="_blank"} 在 2025-09 寫過防火長城 500GB 外洩事件本身，但沒有後續追凌華供應鏈這塊。
* 凌華公司的中文新聞版面集中在邊緣 AI 接單、Taiwan Excellence 獎項、CYBERSEC 2026 參展等業務話題。
* 立法委員沈伯洋雖然在原始報告中被引述發言，但在台灣公開場合（質詢、記者會、社群平台）找不到他就此議題進一步發聲的紀錄。他近期版面被「徵召選台北市長」與「重慶公安立案偵查」兩件事吃光。
* 經濟部國際貿易署只回覆了制式說法（出口管制框架以聯合國與盟邦清單為主），未對個案表態。

## 為什麼台灣這麼安靜

以下是編輯團隊整理的可能因素，這是觀察而非定論，歡迎社群補充與挑戰。

**技術門檻高、議題框架難建立。** 一般財經、政治記者要把 CSA-7400、深度封包檢測、Geedge TSG、出口管制這條技術線串起來不容易，缺少在地的 brief 與翻譯，要寫出一則符合台灣讀者語境的報導成本相當高。

**資安媒體聚焦企業市場，較少寫人權與出口管制議題。** iThome、資安人這類媒體焦點在企業資安採購與技術趨勢，「台灣零組件用於威權監控」的議題框架不在其報導習慣中。

**2025-09 的外洩事件熱度已過。** MADLink 在 2026-04 才把凌華具體點名出來，但 Geedge 外洩事件本身的新聞熱度在 2025 年底就已消退，當下台灣媒體沒有把這條線當成「未完待續」的素材在追。

**既有政治攻防焦點與此案不重疊。** 對綠營來說，這個案子拉出來會打到「台灣公司助中國輸出審查」的尷尬位置。對藍營來說，戳這個議題容易被定位成「配合美國打台灣業者」。雙方都沒有主動放大的政治誘因。

**公民社會的議題分配。** 台灣資訊類公民團體近年主要關注中國對台資訊戰、假訊息治理與數位平台責任，較少有 NGO 把「監控科技出口的人權審查」當主戰場。這也是 anoni.net 翻譯這份報告想補上的位置。

## 制度面缺口仍在

報告本身已詳細論述台灣出口管制框架以武擴為主軸，未涵蓋具監控能力的科技出口給供應威權政府廠商的情況。媒體與公共討論的沉默，反過來強化了這個結構性問題：當缺乏報導、缺乏質詢、缺乏公民團體倡議時，主管機關沒有壓力去修補框架，凌華也沒有壓力對外揭露內部稽核進度。

## 後續可追蹤指標

如果你想關注或推進這個議題，以下是按單位分組的觀察入口（追蹤什麼），與不同成本的執行方式（如何追蹤）。

### 政府與制度層面

**經濟部國際貿易署**

* 入口：[戰略性高科技貨品出口實體管制清單](https://publicinfo.trade.gov.tw/icp/exportList.html){target="_blank"}、[國貿署新聞稿](https://www.trade.gov.tw/Pages/List.aspx?nodeID=40){target="_blank"}
* 觀察什麼：是否把監控、審查設備供應商納入實體清單。是否引入針對「最終用途」的審查機制。是否就此案在跨部會審查會議中有公開揭露的結論。

**立法院與立委沈伯洋**

* 入口：[立法院 IVOD](https://ivod.ly.gov.tw/){target="_blank"}、[立法院議事暨公報資訊網](https://lci.ly.gov.tw/){target="_blank"}、[立法院議事整合資訊網](https://ppg.ly.gov.tw/ppg/){target="_blank"}、沈伯洋的 X、Facebook、Threads
* 觀察什麼：沈伯洋是否就此議題提書面質詢、口頭質詢、提案或新聞稿。其他立委（特別是經濟、外交及國防、司法及法制委員會）是否接手。委員會是否邀請主管機關列席報告。

**金管會與證交所（凌華為上市公司）**

* 入口：[公開資訊觀測站](https://mopsov.twse.com.tw/){target="_blank"} 代號 6166（重大訊息、年報、ESG 報告）
* 觀察什麼：凌華是否公告與 Geedge 出貨案相關的重大訊息。是否在 2026 年年報、ESG/永續報告書揭露此案與內部稽核結果。法說會逐字稿中是否被分析師問到。

**監察院**

* 入口：[監察院糾正案公告](https://www.cy.gov.tw/){target="_blank"}
* 觀察什麼：是否有就主管機關「出口合規審查未識別最終用途」一事，提出糾正或糾舉。

### 媒體與公民社會層面

* **中文媒體**：特別是過去寫過防火長城、中國資安、出口管制議題的記者，是否有後續追蹤報導。可關注 TechNews、iThome、報導者、READr、端傳媒等。
* **台灣公民團體**：g0v、開放文化基金會、台灣人權促進會、經濟民主連合等，是否就此議題發起連署、座談或政策倡議。

### 如何動手追蹤（成本由低到高）

| 方式 | 一次性成本 | 持續成本 | 適用 |
|---|---|---|---|
| **Google Alerts** | 10 分鐘 | 0 | 設「凌華 Geedge」、「戰略性高科技貨品 監控」、「沈伯洋 凌華」、「ADLINK Geedge」等關鍵字，命中時收 email 通知 |
| **手動巡查** | 0 | 每月約 30 分鐘 | 社群輪值，依上述 5 個入口跑 checklist，回報到本頁編輯紀錄 |
| **RSS / HTML diff bot** | 1–2 小時設定 | 0 | 把國貿署新聞稿、公開資訊觀測站 6166 抓進 anoni.net 既有的 Matrix 頻道 |
| **自動化爬蟲** | 4–6 小時設定 | 0 | 定期爬實體清單與重訊頁面，內容有變動時自動開 GitHub Issue 通報 |

四種方式可以混用，最低成本的組合是 Google Alerts 加手動巡查。觀察到具體訊號（例如國貿署更新框架、沈伯洋公開質詢、凌華發重訊）之後，再考慮是否加上自動化監測。

## 觀察更新方式

* 若你發現本頁未收錄的相關報導、政府文件或公開發言，歡迎透過頁面右上方「:material-note-edit-outline: 編輯圖示」直接送 PR 補充。
* 重要進展（如媒體開始報導、立委公開質詢、凌華稽核結果公布）會在本頁加上日期戳記更新，並在 [Matrix 討論頻道](./index.md#參與討論)同步通知。

---

## English summary for international readers

!!! note ""

    This section is an editorial observation by **anoni.net**, not part of the original [InterSecLab MADLink report](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"}. Snapshot as of **2026-05-20** (initial 2026-05-16; independent verification section added 2026-05-20).

### Why we're documenting this

The MADLink report's central question is whether Taiwan's regulatory framework prevented a Taiwanese company from supplying hardware to a Chinese surveillance exporter. When a published report names a publicly listed Taiwanese company, the expected follow-up loop is local journalism, legislative questioning, and a government response. That loop has barely started. The absence is itself data: it suggests the regulatory gap the report describes operates at the political and media-attention level, not only the legal one. We document the snapshot so future readers of the report can see the local reception context.

### Independent verification

The report names a publicly listed company and cites a chain of technical details. Before recording the local reception, we ran an independent verification pass on the key claims so readers can reproduce the checks themselves.

**Verifying the core report claims:**

* **The IEEE OUI `00:30:64` is registered to ADLINK Technology, Inc.** This is the hardware-layer fingerprint the report uses to link EtherFabric to ADLINK, and the most easily verifiable claim. Two independent lookup services ([`api.macvendors.com/00:30:64`](https://api.macvendors.com/00:30:64){target="_blank"}, [`api.macvendorlookup.com/api/v2/003064`](https://www.macvendorlookup.com/api/v2/003064){target="_blank"}) both return "ADLINK TECHNOLOGY, INC." with ADLINK's old Chung-ho (New Taipei) address.
* **The CSA-7400 is marketed by ADLINK itself as a DPI / firewall appliance.** On ADLINK's [official product page](https://www.adlinktech.com/Products/Network_Security_Appliance/4UNetworkAppliance/CSA-7400?lang=en){target="_blank"}, the CSA-7400 sits in the "Network Security Appliance" category and is positioned for DPI, IDS/IPS, DDoS, and NGFW workloads. The publicly mirrored [Quick Start Manual](https://manualzz.com/doc/55701658/adlink-technology-csa-7400-quick-start-manual){target="_blank"} confirms it ships with CentOS 7 preinstalled, consistent with the report's description of early TSG-OS being CentOS-based.
* **Geedge (Hainan) Information Technology Co., Ltd. was founded in 2018 by Fang Binxing.** Cross-confirmed by [Chinese Wikipedia](https://zh.wikipedia.org/wiki/%E7%A7%AF%E8%87%B3%E4%BF%A1%E6%81%AF){target="_blank"}, [Epoch Times' September 2025 reporting](https://www.epochtimes.com/b5/25/9/13/n14593857.htm){target="_blank"}, and [NTD](https://www.ntdtv.com/b5/2025/09/13/a104019706.html){target="_blank"}, including the company's links to MESA Lab at CAS Institute of Information Engineering.
* **The New Bloom Magazine article we cite exists and is dated 2026-04-29.** Title "[Taiwanese Company Implicated in Great Firewall Supply Chain By Report](https://newbloommag.net/2026/04/29/tw-adlink-geedge/){target="_blank"}", published 2026-04-29 07:41 UTC.

**Verifying our own editorial observations:**

* **The "no Taiwan Chinese-language coverage" call is supported across sources.** Cross-outlet searches for "凌華 Geedge", "MADLink 凌華", and "凌華 哈薩克" returned no direct Taiwan Chinese-language reporting on this angle as of 2026-05-20. ADLINK's own Chinese-language press coverage during the same window stayed on edge AI, Taiwan Excellence awards, and CYBERSEC 2026.
* **The "no public statement from Puma Shen" call is reproducible.** Searches across his parliamentary record, social platforms, and recent press coverage show no follow-up statements on MADLink or ADLINK. His current public attention is absorbed by China's Red Notice against him, his Taipei mayoral nomination, and a separate accusation regarding his father's business in China.
* **The "no ADLINK material disclosure" call is reproducible.** Querying [Taiwan's Market Observation Post System](https://mopsov.twse.com.tw/){target="_blank"} under stock code 6166 returns no public material announcement regarding Geedge, the CSA-7400 shipment, or the promised internal audit, as of 2026-05-20.

### Coverage map

**International / English coverage (present):**

* InterSecLab's original report (April 2026), part of the [Internet Coup](https://interseclab.org/research/the-internet-coup/){target="_blank"} investigative series.
* [New Bloom Magazine](https://newbloommag.net/2026/04/29/tw-adlink-geedge/){target="_blank"} (Taiwan-focused English outlet, 2026-04-29): the only Taiwan-related independent media piece directly engaging with the ADLINK angle. The article itself notes the surprising silence, given Taiwan typically responds to cases involving Chinese entities.
* International tech and infosec outlets (cybernews, osnews, Daily Security Review and others) continued framing the story under the September 2025 Geedge leak narrative, without surfacing the ADLINK supply-chain node specifically.

**Taiwan Chinese-language coverage (substantively absent):**

* Major Taiwan outlets (UDN, Liberty Times, CNA, TVBS, TechNews, iThome) had no direct reporting on MADLink or the ADLINK / Geedge / Kazakhstan link as of 2026-05-16.
* TechNews covered the September 2025 leak itself but did not follow up on the ADLINK supply-chain angle.
* ADLINK's Chinese-language press coverage stayed within its usual business beat: edge AI orders, Taiwan Excellence awards, the CYBERSEC 2026 expo.
* Legislator Puma Shen, quoted in the original report, has no public follow-up on this issue in Taiwan venues (no parliamentary questioning, no press release, no social media post). His public attention is currently absorbed by his Taipei mayoral nomination and a separate criminal investigation filed against him by Chongqing public security authorities.
* The Ministry of Economic Affairs (Bureau of Foreign Trade) responded with a procedural statement about Taiwan's export-control framework and declined to comment on the specific case.

### Why Taiwan has been quiet

These are observed factors, offered as hypotheses rather than verdicts:

* **High technical barrier.** Connecting CSA-7400, deep packet inspection, Geedge's TSG product line, and Taiwan's export control framework into a story that lands for a general Taiwanese audience requires a local technical brief. That brief does not yet exist in Chinese.
* **Domestic infosec media focus on enterprise security.** Outlets like iThome and isecur cover enterprise cybersecurity procurement and trend pieces. The frame of "Taiwanese components used in authoritarian surveillance abroad" sits outside their reporting habits.
* **The September 2025 leak news cycle had cooled.** MADLink names ADLINK specifically only in April 2026, but the underlying Geedge leak story peaked in late 2025. Taiwan media did not treat that earlier story as a thread to keep pulling.
* **No political camp has incentive to amplify.** For the ruling DPP, the story creates an awkward "Taiwanese company helped China export censorship infrastructure" narrative. For the opposition KMT, raising it risks being framed as "siding with the US against a Taiwanese business." Neither side has political upside in pushing the issue into the news cycle.
* **Civil society attention is elsewhere.** Taiwan's digital-rights and information-integrity NGOs largely focus on Chinese influence operations against Taiwan, disinformation governance, and platform accountability. Human-rights export controls on surveillance technology has not yet become a sustained civil society campaign here. This is part of the gap anoni.net's translation aims to address.

### What this means for the regulatory gap

The original report already argues that Taiwan's export control framework is oriented toward weapons non-proliferation and does not cover surveillance or censorship technology shipped to vendors supplying authoritarian governments. The domestic silence reinforces the structural problem: without media coverage, legislative pressure, or civil society campaigns, regulators face no impetus to update the framework, and ADLINK faces no public pressure to disclose its internal audit findings.

### Indicators to watch

Grouped by entity, with concrete entry points (what to watch) and execution tiers (how to watch).

<!-- 以下為英文附錄，破折號是英文標點，不套用中文寫作規則 -->
<!-- docs-style-lint: disable -->
**Government and regulatory level:**

* **Bureau of Foreign Trade, MOEA** — Entry points: [Strategic High-Tech Commodities Entity List](https://publicinfo.trade.gov.tw/icp/exportList.html){target="_blank"}, [BoFT press releases](https://www.trade.gov.tw/Pages/List.aspx?nodeID=40){target="_blank"}. Watch for: addition of surveillance/censorship technology vendors to the entity list; introduction of end-use review; any publicly disclosed conclusions from the quarterly interagency review meetings.
* **Legislative Yuan and Legislator Puma Shen** — Entry points: [Legislative Yuan IVOD](https://ivod.ly.gov.tw/){target="_blank"}, [Legislative Yuan proceedings and gazette](https://lci.ly.gov.tw/){target="_blank"}, [Legislative Yuan integrated information system](https://ppg.ly.gov.tw/ppg/){target="_blank"}, Puma Shen's X / Facebook / Threads. Watch for: written or oral questioning by Shen; proposals or press releases from him or other legislators (particularly on the Economic, Foreign and National Defense, or Judiciary committees); committee invitations for the responsible agency to report.
* **Financial Supervisory Commission and TWSE (ADLINK is publicly listed)** — Entry points: [Market Observation Post System](https://mopsov.twse.com.tw/){target="_blank"}, stock code 6166 (material announcements, annual reports, ESG reports). Watch for: material announcements regarding Geedge; disclosure of this matter in the 2026 annual report or sustainability report; investor questions on earnings calls.
* **Control Yuan** — Entry point: [Control Yuan corrective measures](https://www.cy.gov.tw/){target="_blank"}. Watch for: any corrective action or impeachment regarding the regulatory failure to identify end use during export compliance review.

**Media and civil society level:**

* **Chinese-language media** — Whether journalists who previously covered the Great Firewall, Chinese infosec topics, or export controls follow up. Outlets to track include TechNews, iThome, The Reporter, READr, and Initium.
* **Taiwan civil society** — Whether g0v, Open Culture Foundation, Taiwan Association for Human Rights, Economic Democracy Union and similar organisations launch petitions, panel discussions, or policy advocacy on this issue.

<!-- docs-style-lint: enable -->

**How to actually track these (low to high cost):**

| Approach | One-time setup | Ongoing | Best for |
|---|---|---|---|
| **Google Alerts** | 10 minutes | 0 | Keywords like "凌華 Geedge", "ADLINK Geedge", "戰略性高科技貨品 監控", email notification on hit |
| **Manual check** | 0 | ~30 min/month | Community rotation, run a checklist over the five entry points above, log to this page's changelog |
| **RSS / HTML diff bot** | 1–2 hours | 0 | Feed BoFT press releases and MOPS code 6166 into anoni.net's existing Matrix channel |
| **Scheduled scraper** | 4–6 hours | 0 | Periodically scrape the entity list and material announcements; auto-open a GitHub Issue when content changes |

These four approaches can be combined. The lowest-cost starting point is Google Alerts plus a manual check. Adding automated monitoring is worth considering once concrete signals appear, such as the BoFT updating the framework, Shen raising the issue publicly, or ADLINK filing a material announcement.

### Contributing updates

If you spot reporting, government documents, or public statements not yet captured here, please open a pull request via the ":material-note-edit-outline:" edit icon at the top of this page. Substantive developments are dated and logged inline, with sync notifications in the [Matrix discussion channel](./index.md#參與討論).

*[ADLINK]: 凌華科技股份有限公司（ADLINK Technology, Inc.），台灣上市公司（股票代號 6166）。
*[Geedge Networks]: 中文簡稱：積至公司，是一家中國網路公司，涉及網際網路審查與監控技術的研發、部署與對外出口。
*[Geedge]: 積至公司。
*[CSA-7400]: 凌華科技推出的高密度 4U 網路平台設備，廠商行銷定位用於防火牆與深度封包檢測應用。
*[TSG]: 天狗安全閘道 Tiangou Secure Gateway，Geedge Networks 的旗艦審查與監控產品。
*[MOEA]: Ministry of Economic Affairs，台灣經濟部。
