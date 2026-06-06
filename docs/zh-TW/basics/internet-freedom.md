---
title: 網路自由為什麼重要
description: 從匿名網路社群的觀點理解網路自由：連線層、個資與身分、金流的三個面向，連結到 2026 三大主題與在地法規動態。
icon: material/chat-question
---

# :material-chat-question: 網路自由為什麼重要

匿名網路社群 anoni.net 是一個關注匿名網路、隱私、網路自由的在地社群。為什麼網路自由值得我們長期投入，現在談仍然有意義？台灣的連線環境相對開放，但「相對」兩個字承擔的條件愈來愈不穩固。這頁整理我們具體看到的事，以及正在做什麼來回應。

## 我們如何理解網路自由

**網路自由**關注在人們能否在免於不當干預的情況下取得資訊、表達意見，以及選擇自己信任的工具與連線方式。它和「匿名」、「隱私」、「規避審查」常一起出現，側重點略有不同，可先從 [匿名、隱私、假名、機密性的差別](./anonymity-vs-privacy.md) 對照閱讀。

放回社群成員的日常裡，網路自由是一組我們具體看到的事：

- 跨境平台規則決定誰能說話、誰會被降低能見度
- 帳號處置、演算法可見度、資料留存形塑公共討論的空間
- 多地的誹謗、國安或資訊治理相關法規爭議帶來制度性的寒蟬效應
- 在台灣，相對開放的連線環境伴隨對跨國平台的高度依賴，以及對公民社會、獨立媒體、倡議者的各種壓力

把這些放在一起看，「網路自由是否穩固」是一個多面向的問題，由連線層、個資與身分、金流三件事共同決定。這也對應到社群 2026 三大主題：個人隱私指引、Tor Relay 校園建立、匿名支付。

## 我們關心的三個面向

### 連線層的自由

簡單說，你能不能連上想連的服務、用信任的工具，過程中不留下能識別到你的痕跡。

這是社群既有工作的核心。我們長期推廣 [Tor](../tools/what-is-tor.md)（多層路由的匿名連線）、[Tails](../tools/what-is-tails.md)（即用即丟的隨身作業系統）、[OONI](../tools/what-is-ooni.md)（公開的網路審查觀測），也協助 [Tor Snowflake](../tools/tor-snowflake.md) 橋接、[OONI Run v2](../tools/ooni-run-v2.md) 客製化檢測等工具的在地推廣。長期工作線之一是 [Tor Relay 校園建立](../community/roadmap-2026.md)，把台灣的頻寬納入全球 Tor 網路的基礎建設。

### 個資與身分的自由

簡單說，你能不能掌握「關於你的資料」流向了哪裡、被誰持有、能否要求刪除。

這個面向對應到社群熟悉的兩個概念，[威脅模型如何建立](./threat-model.md)（評估你保護什麼、防誰、付出多少成本）與 [Metadata 是什麼](./metadata.md)（為什麼通訊內容被加密還不夠）。在地脈絡上，[2025 個資法修法](../taiwan/pdpa-2025.md) 設立了個人資料保護委員會，把過去分散的監督權責集中、罰則向 GDPR 靠攏，是台灣個資制度近年最大的一次調整。

### 金流的自由

金流是社群比較新的關注點。一筆轉帳的時間、金額、收款人，配上信用卡號或銀行戶名，幾乎能還原一個人的社交網絡與行動軌跡。這份 metadata 比通訊 metadata 更黏：強制連結到實名、長期保留、跨機構交叉。

社群把這個議題寫成 [為什麼匿名支付重要](./payments-anonymity.md)，並在 [匿名支付研究專題](../community/payments-research.md) 持續累積素材。在地脈絡上，[2026 台灣 VASP 法草案](../taiwan/vasp-2026.md) 進入立法院審議，加密資產監理從登記制走向許可制，是另一條制度性的轉折。

## 區域脈絡：為什麼這在台灣也值得關注

台灣的連線環境放在區域裡面看仍是相對開放的，但「相對」承擔的條件來自鄰近地區的具體事件。中國的「長城防火牆[^1]」長期過濾大量國際網站，並對境內平台內容進行政治、宗教、社會議題的審查。北韓則將一般民眾與全球網際網路幾乎隔絕，僅能使用國家控管的內部網路「光明網[^2]」。東南亞各地有越南要求平台下架政治性批評內容[^3]、印尼對特定類別網站封鎖[^4]、馬來西亞針對調查報導媒體的封鎖[^5]、菲律賓在選舉時期的監控與干預[^6]、泰國對皇室相關言論的刑事追訴[^7]、緬甸 2021 年政變後反覆斷網[^8][^9]。除了封鎖網站，管制也延伸到工具與使用者本身。印尼自 2026 年 3 月起，率先在東南亞禁止未滿 16 歲者使用社群媒體[^12]。緬甸則在 2025 年通過資安法（Cybersecurity Law），把未經許可提供 VPN 入罪[^13]。台灣則仍面對跨境平台治理、資安與政治性操弄的討論，以及對新聞與倡議工作者的法律與輿論壓力，分數與敘事會隨年度更新[^10]。

<figure markdown="span">
    <a href="https://freedomhouse.org/explore-the-map" target="_blank">
        <img src="../../assets/images/freedom_house_explore_the_map.png"
            alt="Freedom House Freedom on the Net 互動地圖"
            title="Freedom House Freedom on the Net 互動地圖"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>Freedom House「Freedom on the Net」互動地圖（各國分數隨年度報告更新，畫面為站內示意截圖）</capture>
</figure>

「狀態正在改變」的訊號近期愈來愈具體。2025 年 InterSecLab 公布了一份關於中國防火長城技術輸出的研究報告，社群完成中譯後在 [網路自由小聚](../blog/posts/internetfreedom-oct2025.md) 分享：當監控技術以容器化、產品化的方式對外輸出時，過去給個人的資安建議需要重新檢視。完整的中譯版本見 [網路政變：InterSecLab 報告](../reports/interseclab-network-coup/index.md)。2025 年 9 月再有大量防火長城內部資料外流（超過 500GB，來自承包商 Geedge Networks 與中國科學院旗下 MESA Lab），文件顯示這套技術已輸出到哈薩克、衣索比亞、緬甸、巴基斯坦等至少五個國家，讓外界長期推測的「把審查系統當產品輸出」首次有了內部文件層級的佐證[^11]。

亞太地區的封鎖與干預需要可被驗證的公開紀錄。OONI 透過志工探測讓特定網路與規避工具的可及性以圖表與開放資料呈現。

<figure markdown="span">
    <a href="https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW" target="_blank">
        <img src="../../assets/images/ooni_chart_circumvention.png"
            alt="OONI Explorer：規避工具觀測（CN, HK, TW 範例）"
            title="OONI Explorer：規避工具觀測（CN, HK, TW 範例）"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>OONI Explorer：規避工具觀測（畫面為站內保留之示意截圖，區間與資料以網站為準）</capture>
</figure>

Tor 網路在台灣也已經有公開可見的中繼與守護節點，社群的 Tor Relay 校園建立工作正是把這份基礎建設推得更深入的具體行動。

<figure markdown="span">
    <a href="https://metrics.torproject.org/rs.html#search/country:tw" target="_blank">
        <img src="../../assets/images/tor_relay_tw.png"
            alt="Tor Metrics：臺灣地區 Tor 中繼與守護節點"
            title="Tor Metrics：臺灣地區 Tor 中繼與守護節點"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 0%);">
    </a>
    <capture>Tor Metrics：臺灣地區中繼與守護節點（畫面隨網路狀態變動）</capture>
</figure>

## 你可以從哪裡開始

社群的工作是一份持續累積、需要更多人加入的進行式，沒有單一的「完成」時刻。看你想從哪個方向切入，三條建議路徑：

- **想先理解概念**：往 basics/ 其他四篇繼續走。[匿名、隱私、假名、機密性的差別](./anonymity-vs-privacy.md) 釐清詞彙，[威脅模型如何建立](./threat-model.md) 給判斷框架，[Metadata 是什麼](./metadata.md) 補上「機密 ≠ 匿名」的盲點，[為什麼匿名支付重要](./payments-anonymity.md) 把金流納入匿名思維。
- **想看在地脈絡**：往 [taiwan/](../taiwan/index.md) 走。[個資法 2025 修法](../taiwan/pdpa-2025.md) 與 [VASP 法 2026](../taiwan/vasp-2026.md) 是兩個進行中的關鍵法規，[ASN 觀測](../taiwan/ooni-asn-coverage.md)、[OONI 網站檢測清單](../taiwan/ooni-checklist.md)、[Tor Relays 觀測點](../taiwan/tor-relay-watcher.md) 則是社群長期維運的在地資料。
- **想參與實作**：往 [community/](../community/index.md) 走。可以先看 [2026 年度路線圖](../community/roadmap-2026.md)、[匿名支付研究專題](../community/payments-research.md)、[如何參與與認領主題](../community/how-to-contribute.md)，再依興趣選一個方向加入 Matrix 討論。

跑 OONI 測試、架設 Tor 中繼、協助翻譯、寫一篇文章、把這頁分享給可能受用的人，每一個都算數。

[^1]: [4所大學團隊每日測試4億個網域研究「防火長城」，發現有31萬網域被擋下、部分的封鎖只是「意外」](https://www.thenewslens.com/article/153597){target="_blank"} - TNL The News Lens 關鍵評論網
[^2]: [金正恩無所不在：北韓監視器數量增加，強化全方位監控](https://global.udn.com/global_vision/story/8663/7970562){target="_blank"} - 轉角國際 udn Global
[^3]: [【人權焦點】讓我們呼吸! 越南政府的網路審查 與科技巨頭的共謀](https://www.amnesty.tw/news/3805){target="_blank"} - 國際特赦組織台灣分會
[^4]: [印尼預計6月落實網路新規定，恐剝奪社交平台言論自由](https://www.thenewslens.com/article/164619){target="_blank"} - TNL The News Lens 關鍵評論網（法規細節請以印尼官方與最新報導為準）
[^5]: [馬來西亞局內人](https://zh.wikipedia.org/zh-tw/%E9%A9%AC%E6%9D%A5%E8%A5%BF%E4%BA%9A%E5%B1%80%E5%86%85%E4%BA%BA){target="_blank"} - 維基百科，自由的百科全書
[^6]: [菲律賓「Rappler」撤照風波：杜特蒂殺向記者的復仇印記？](https://global.udn.com/global_vision/story/8663/6435){target="_blank"} - 轉角國際 udn Global
[^7]: [泰國王室罵不得！男子臉書PO文惹禍 遭判刑50年破紀錄](https://udn.com/news/story/6812/7721452){target="_blank"} - 聯合新聞網
[^8]: [緬甸被徹底剝奪的新聞自由：報導颶風災害的記者遭軍政府判刑20年監禁](https://feja.org.tw/72219/){target="_blank"} - 卓越新聞獎基金會
[^9]: [封鎖、斷網、審查：從緬甸政變看「網路中立權」的重要性](https://lab.ocf.tw/2022/02/12/mymmar-block/){target="_blank"} - OCF Lab 開放實驗室
[^10]: [Freedom House：Taiwan（Freedom on the Net 國別條目）](https://freedomhouse.org/country/taiwan/freedom-net/2025){target="_blank"}（年度與網址隨報告更新，若連結失效請改從[互動地圖](https://freedomhouse.org/explore-the-map)進入）
[^11]: [Geedge & MESA Leak: Analyzing the Great Firewall's Largest Document Leak](https://gfw.report/blog/geedge_and_mesa_leak/en/){target="_blank"} - GFW Report
[^12]: [Indonesia social media ban for minors comes into effect](https://www.jurist.org/news/2026/03/indonesia-social-media-ban-for-minors-comes-into-effect/){target="_blank"} - JURIST
[^13]: [Myanmar enacts cybersecurity law that aims to restrict use of VPNs](https://www.rfa.org/english/myanmar/2025/01/02/cybersecurity-law-vpn/){target="_blank"} - Radio Free Asia
