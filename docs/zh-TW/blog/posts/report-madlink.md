---
date: 2026-05-28
authors:
    - toomore
categories:
    - 更新
    - 翻譯文章
slug: report-madlink
image: "https://interseclab.org/wp-content/uploads/2026/04/MADLink-A-Taiwanese-Vestige-in-the-Geedge-Suply-Chain.jpg"
summary: "InterSecLab 在 2026 年 4 月發布《MADLink》報告，揭露凌華科技於 2019 至 2020 年間出貨 1,708 台 CSA-7400 給中國 Geedge Networks，這批硬體最終部署於哈薩克，作為國家級網路審查與監控系統的核心。社群已完成正體中文翻譯，並針對這份點名了台灣上市公司的報告，補上一頁編輯觀察，記錄報告發布後台灣本地媒體、政府、立委的接收狀況。"
description: "InterSecLab MADLink 報告中譯上線。Geedge 第一代防火牆平台的 1,708 台硬體基底，是凌華科技在 2019 至 2020 年出貨的 CSA-7400。本次同步補上編輯觀察一頁，記錄報告發布後台灣本地的接收狀況。"
---

# InterSecLab MADLink 翻譯上線：凌華 1,708 台 CSA-7400 進入哈薩克審查系統，社群同步整理編輯觀察

![MADLink 報告封面](https://interseclab.org/wp-content/uploads/2026/04/MADLink-A-Taiwanese-Vestige-in-the-Geedge-Suply-Chain.jpg){style="border-radius:10px;"}

一家在台北證交所掛牌的上市公司，2019 至 2020 年間出貨了 1,708 台 CSA-7400 高密度網路平台設備給一家中國客戶。這批硬體最終在哈薩克開機運行，作為國家級網路審查與監控系統的核心。設備來自凌華科技（ADLINK Technologies，股票代號 6166），客戶是中國公司 Geedge Networks（積至公司），他們的旗艦產品「天狗安全閘道（Tiangou Secure Gateway，TSG）」其能力可媲美中國防火長城。

這是 InterSecLab 在 2026 年 4 月發布的調查報告 [MADLink: A Taiwanese Vestige in the Geedge Supply Chain](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"} 的核心發現，也是 2025 年 9 月《[The Internet Coup](../../reports/interseclab-network-coup/index.md){target="_blank"}》之後，InterSecLab 對 Geedge 供應鏈延伸調查的第一篇。匿名網路社群 anoni.net 已完成正體中文（臺灣用語）翻譯，這次跟上一份報告不同，我們同步整理了一頁「編輯觀察」，記錄報告發布後台灣本地媒體、政府、立委的接收狀況。

<!-- more -->

## 報告找到了什麼

凌華科技在 2019 至 2020 年間出貨給 Geedge 的 1,708 台 CSA-7400，構成 Geedge 第一代防火牆平台的硬體基底，部署在哈薩克，推動國家層級的網路審查與監控。CSA-7400 是凌華自家行銷定位用於深度封包檢測（DPI）與防火牆的高密度 4U 設備。

凌華的硬體還出現在 Geedge 部署於緬甸的 EtherFabric 之中。EtherFabric 是一款客製化的網路封包經紀（network packet broker，NPB），用來在多個 TSG 節點之間做流量負載平衡。外洩文件中的一組 MAC 位址可追溯到凌華，這顯示凌華在 Geedge 產品線中的影響並非單筆 CSA-7400 交易那麼簡單。

Geedge 目前這一代的 TSG 部署在衣索比亞、巴基斯坦和緬甸，伺服器來自中科曙光（Sugon，已遭美國制裁）旗下的 Nettrix，儲存來自浪潮（Inspur）。這些是標準 x86 元件，即便直接採購受限，仍可從次級市場取得。報告認為，這類為監控用途設計的專用硬體（CSA-7400、EtherFabric 中使用的凌華元件），才是出口管制最能發揮效果的對象。

## 翻譯版的閱讀路徑

完整中譯放在這裡：[MADLink / 台灣在 Geedge 供應鏈中的遺留 - InterSecLab](../../reports/interseclab-madlink/index.md){target="_blank"}

原報告為單頁長文，翻譯團隊依主題切成 5 章，便於在 Matrix 上分章節討論：

* [第 1/5 章：摘要與主要發現](../../reports/interseclab-madlink/index_1.md){target="_blank"}
* [第 2/5 章：Geedge 供應鏈深入解析（三代 TSG 硬體）](../../reports/interseclab-madlink/index_2.md){target="_blank"}
* [第 3/5 章：EtherFabric 與 ADLINK 的角色和回應](../../reports/interseclab-madlink/index_3.md){target="_blank"}
* [第 4/5 章：結論](../../reports/interseclab-madlink/index_4.md){target="_blank"}
* [第 5/5 章：附錄（凌華科技與經濟部完整聲明）](../../reports/interseclab-madlink/index_5.md){target="_blank"}

關於 ADLINK 的指控段落，翻譯團隊將凌華的回應全文完整保留在附錄章節，讀者可以自行比對兩造說法。

## 這次跟上一份報告不同的地方：編輯觀察頁

上一份《The Internet Coup》翻譯時，我們的工作止於忠實中譯。MADLink 這次點名了一家台灣上市公司，理論上會引發本地媒體追問、立委質詢、主管機關回應這樣的循環，但截至 2026-05-20 的觀察，台灣中文公共領域明顯安靜。這個現象本身就是觀察素材，所以多寫了一頁：[編輯觀察：台灣對 MADLink 報告的後續反應](../../reports/interseclab-madlink/index_6.md){target="_blank"}。

這頁明確標示為 anoni.net 編輯團隊的整理，不屬於 InterSecLab 原報告。內容分成五個區塊：

**外部交叉驗證：** 為了讓讀者能自行重現，我們對報告中的關鍵事證跑了一輪獨立查證，例如 IEEE OUI `00:30:64` 確實登記在凌華名下（macvendors 與 macvendorlookup 兩個獨立來源都回傳「ADLINK TECHNOLOGY, INC.」）、CSA-7400 在凌華中英文官網上明確被分類為「Network Security Appliance」並行銷 DPI/IDS/IPS/NGFW、積至（海南）信息技術有限公司由方濱興 2018 年在海南創立（維基百科、大紀元、新唐人交叉印證）、New Bloom Magazine 2026-04-29 那篇報導真實存在。

**媒體覆蓋對比：** 國際與英文媒體有覆蓋（InterSecLab 原報告、New Bloom Magazine、cybernews 等）。台灣中文媒體基本無覆蓋（聯合、自由、中央社、TVBS、TechNews、iThome 等截至 2026-05-16 都沒有直接報導，TechNews 雖然在 2025-09 寫過 Geedge 500GB 外洩本身，但未追凌華這條線）。被原報告引述的立法委員沈伯洋，在公開場合也找不到就此議題的進一步發聲。

**為什麼台灣這麼安靜：** 編輯團隊整理了 5 個可能因素：技術門檻高且缺少在地 brief、資安媒體聚焦企業市場而非人權與出口管制、2025-09 外洩事件熱度已過、藍綠兩邊都沒有主動放大的政治誘因、公民社會的議題分配還沒把監控科技出口的人權審查當主戰場。這些都是觀察而非定論，歡迎社群補充與挑戰。

**後續可追蹤指標：** 按政府/媒體/公民社會分組，列出國貿署戰略性高科技貨品出口實體管制清單、立法院議事系統、公開資訊觀測站代號 6166、監察院糾正案公告等具體入口的 URL，並附上 4 種成本不同的執行方式（Google Alerts、手動巡查、RSS bot、自動化爬蟲）對照表，讓不同人力與技術背景的社群成員都能找到合適的參與方式。

**English summary for international readers：** 完整英文版觀察，方便從海外連過來的讀者了解這份報告在台灣本地的接收脈絡。

## 為什麼做這頁觀察

MADLink 的核心問題，是台灣現行出口管制制度能否阻止本地公司供應監控與審查設備給威權政府的供應鏈。這個問題沒辦法靠一份英文報告自己解決，需要本地的報導、質詢、倡議跟上，才會產生制度修補的壓力。

當這個循環沒有啟動時，記錄當下的接收狀態，本身是一種接力的方式。後續若有新進展（媒體開始追、立委公開質詢、凌華發重訊、國貿署更新框架），這頁會持續加上日期戳記更新，並在 Matrix 同步通知。

## 感謝與參與

感謝 InterSecLab 持續推動這個系列調查，也感謝社群成員投入翻譯與編輯觀察的整理工作。

兩份報告（《The Internet Coup》與《MADLink》）的社群討論延用同一個 Matrix 頻道：

* :material-chat-processing-outline: <https://matrix.to/#/#interseclab-the-internet-coup:im.anoni.net>{target="_blank"}

如果你發現編輯觀察頁未收錄的相關報導、政府文件或公開發言，歡迎透過頁面右上方的編輯圖示直接送 PR 補充，或在 Matrix 頻道分享。

## 相關閱讀

* [MADLink 中譯首頁](../../reports/interseclab-madlink/index.md){target="_blank"}：報告翻譯入口
* [編輯觀察：台灣對 MADLink 報告的後續反應](../../reports/interseclab-madlink/index_6.md){target="_blank"}：本社群整理的接收狀況快照
* [The Internet Coup / 網路政變 - InterSecLab](../../reports/interseclab-network-coup/index.md){target="_blank"}：本系列首部報告
* [技術分析報告：網路政變](./report-the-internet-coup.md){target="_blank"}：上一份報告中譯上線時的 blog 公告
