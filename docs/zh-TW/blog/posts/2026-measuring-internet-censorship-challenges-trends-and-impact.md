---
date: 2026-06-26
authors:
    - toomore
categories:
    - 觀察
    - OONI
    - 翻譯文章
slug: 2026-measuring-internet-censorship-challenges-trends-and-impact
summary: "OONI 整理出全球網路審查正在變得更精細、更難偵測的幾項關鍵趨勢，包括 HTTPS 加密化反而讓封鎖更不透明、TLS 干擾與 DPI 的擴散、流量限速、國家內網等現象，並說明這些觀察如何支援數位人權倡議。"
description: "OONI 整理出全球網路審查正在變得更精細、更難偵測的幾項關鍵趨勢，包括 HTTPS 加密化反而讓封鎖更不透明、TLS 干擾與 DPI 的擴散、流量限速、國家內網等現象，並說明這些觀察如何支援數位人權倡議。"
---

# 測量網路審查：挑戰、趨勢與影響

!!! info ""

    **翻譯備註：**這篇文章由 OONI 的 Maria Xynou 撰寫，原刊於 Internet Society 的 Pulse blog，後由 OONI 轉貼。OONI 是目前全球規模最大的網路審查觀測公開資料集，本文整理了測量網路審查的方法挑戰、近年觀察到的審查趨勢，以及這些資料如何被用在數位人權的倡議行動。對中文讀者來說，這份脈絡有助於理解為什麼「網路看起來能用」不等於「沒有被審查」，以及為什麼台灣的網路韌性議題也需要持續的觀測資料來支撐。

    以下內容原文翻譯來自：

    - [Measuring Internet Censorship: Challenges, Trends, and Impact, Maria Xynou 2026-05-05](https://ooni.org/post/2026-measuring-internet-censorship-trends-challenges-impact/){target="_blank"}
    - 原始版本刊載於 [Internet Society Pulse blog](https://pulse.internetsociety.org/en/blog/2026/05/measuring-internet-censorship-challenges-trends-and-impact/){target="_blank"}

重點摘要：

- 網路審查正在變得更精細、更具針對性，也更難被偵測。
- OONI 以群眾外包方式收集的網路觀測資料，能支援研究、倡議行動，以及對網路審查事件的快速反應。
- OONI 的長期資料揭示了幾項全球網路審查的關鍵走向，包括短期針對性的間歇封鎖，以及長期、系統性的壓制。

<!-- more -->

網路審查正在變得更精細、更難被偵測，「透明度」這件事比以往更迫切。

[俄羅斯](https://ooni.org/post/2024-russia-report/){target="_blank"}、[哈薩克](https://ooni.org/post/2024-kazakhstan-report/){target="_blank"}等國家正在封鎖大量獨立新聞媒體，[選舉與抗爭期間針對社群媒體的限制](https://ooni.org/reports/social-media-im/){target="_blank"}在全球各地也越來越常見。連民主國家也在擴張審查做法。舉例來說，[阿爾巴尼亞去年封鎖了 TikTok](https://explorer.ooni.org/findings/274282914400){target="_blank"}，西班牙則[間歇性封鎖了部分網路](https://www.techradar.com/vpn/vpn-privacy-security/la-ligas-war-on-piracy-is-breaking-the-internet-in-spain-and-your-vpn-could-be-the-next-target){target="_blank"}，做法是針對 LaLiga 直播站台所使用的 Cloudflare 基礎設施下手。

這些案例都由 [Open Observatory of Network Interference（OONI）](https://ooni.org/){target="_blank"}記錄下來。OONI 是一個非營利組織，維護[全球最大的網路審查公開資料集](https://ooni.org/data/){target="_blank"}，資料來自群眾外包的測量。本文簡要討論測量網路審查的挑戰、正在浮現的審查趨勢，以及網路觀測如何推動人權倡議。

## 測量網路審查的挑戰

要判斷一件事算不算網路審查，[很少能用](https://ramakrishnansr.com/assets/censorship-data-analysis.pdf){target="_blank"}「能不能連」、「有沒有被封鎖」這種二分結果就講清楚。

許多因素都可能讓服務看起來無法存取，即使沒有任何人刻意限制。架在不穩定伺服器上的網站可能短暫失效，跟政府毫無關係。網路品質不佳時，使用者也可能難以開啟網站或 App。連[ DNS 設定錯誤](https://ooni.org/post/not-quite-network-censorship/){target="_blank"}都可能造成存取失敗，但跟審查無關。

[誤判（false positives）](https://ooni.org/support/faq/#what-are-false-positives){target="_blank"}很常見。挑戰更進一步來自審查做法的多樣性，從 DNS 操縱、IP 封鎖，到更隱晦的流量限速或注入偽造回應都有。同一個網站可能在某個網路能用、在另一個網路被擋，因此需要廣泛、去中心化的測試才有機會做出可靠判斷。

[OONI](https://ooni.org/){target="_blank"} 用幾個方式來面對這些挑戰。一是開發[公開的測量方法論](https://github.com/ooni/spec/tree/master/nettests){target="_blank"}並鼓勵同儕審查與專家回饋，並利用對照測量（control measurements）作為基準。OONI 也使用一套[機率式指標](https://docs.ooni.org/data/pipeline-design/){target="_blank"}估計某個資源在特定網路與時間區間內被限制的可能性。這套方法在 [OONI Pipeline v5](https://github.com/ooni/data){target="_blank"} 上實作，會比對量測結果並套用啟發式規則，把結果分類為「blocked」、「down」或「OK」，並附上一定信心度的估計。

直接從在地網路收集到的量測，比遠端測試更有價值，因為它反映了使用者真實的審查體驗。當志工根據他們實際遇到的封鎖內容、在自己所在的脈絡下執行測試時，這些資料比較有機會捕捉到突發、情境特定的審查事件。

OONI 正是依此運作。世界各地的人們執行 [OONI Probe](https://ooni.org/install/){target="_blank"}，從他們所連的網路上貢獻量測。[資料](https://ooni.org/data){target="_blank"}的取得仰賴志工選擇測什麼、何時、何地，因此各國的涵蓋率差異很大，同一個國家的不同網路之間也會有落差。涵蓋率不均是一項重要挑戰，要可靠地偵測（並確認）審查，需要持續的資料來累積信心。

審查事件常發生在高風險情境，例如反政府抗爭期間。在這些時刻進行測試，會讓貢獻者承擔實際的[風險](https://ooni.org/about/risks/){target="_blank"}，這也讓量測與審查偵測變得更困難。在 OONI，使用者安全是優先事項，所有貢獻量測的人都會經過[知情同意](https://ooni.org/support/ooni-probe-desktop#onboarding-informed-consent){target="_blank"}的程序，在 [OONI Probe App](https://ooni.org/install/){target="_blank"} 中以小測驗的形式確認。

## 浮現中的網路審查趨勢

OONI 的[長期資料](https://ooni.org/data){target="_blank"}揭示了幾項全球網路審查正在演變的關鍵趨勢：

### 網路審查的全球化與常態化

網路層級的審查已經不只發生在中國或伊朗這類國家。今日幾乎每個國家都有某種形式的審查，封鎖的內容與影響範圍差異很大。多數國家現在同時具備技術基礎設施與法律框架，能執行網路層的限制。

### 短期控制的針對性、間歇性封鎖

許多政府會在[政治敏感事件期間部署臨時性審查](https://ooni.org/reports/social-media-im/){target="_blank"}，例如選舉、抗爭或衝突。這類封鎖通常針對特定網站或 App，舉例來說，[烏干達在 2026 年大選後封鎖了 WhatsApp 與 Facebook](https://explorer.ooni.org/findings/352623460000#social-media-blocks-following-ugandas-2026-general-election){target="_blank"}。短期封鎖通常持續幾小時到幾週，這種做法能降低政治與經濟成本，又能讓當局在關鍵時刻控制公共討論、限制資訊流通。

### 系統性壓制的長期封鎖

長期封鎖會持續數年，目的是在網路上強制執行某種意識形態、政策或法律。相較於針對特定站點或 App 的短期封鎖，長期封鎖往往限制整個被視為「在法律或社會上不可接受」的內容類別。這類審查經常壓抑邊緣族群、強化既有體制。例子包括[封鎖 LGBTQI 權益相關網站](https://ooni.org/post/2021-no-access-lgbtiq-website-censorship-six-countries/){target="_blank"}、[族群或宗教少數團體相關內容](https://ooni.org/post/iran-internet-censorship/#human-rights-issues){target="_blank"}，以及[生育權相關網站](https://ooni.org/post/2019-blocking-abortion-rights-websites-women-on-waves-web/){target="_blank"}。以坦尚尼亞為例，在多年針對 LGBTQI 社群的打壓之後，[針對 LGBTQI 相關內容的大規模封鎖](https://ooni.org/post/2024-tanzania-lgbtiq-censorship-and-other-targeted-blocks/){target="_blank"}陸續被觀察到。

### 加密化網路中越來越不透明的審查

隨著越來越多網站採用 HTTPS 與加密標準，審查反而變得更不可見。傳統的[封鎖頁面（block page）](https://ooni.org/support/glossary/#block-page){target="_blank"}會告知使用者「這個站點被刻意限制」，但這類頁面如今已經少見。政府改採直接干擾 TLS（Transport Layer Security）協定本身的手段，通常使用 DPI（Deep Packet Inspection，深度封包檢測）這類進階設備。OONI 的[資料顯示](https://ooni.org/reports/){target="_blank"}，TLS 層級的干擾在許多國家被記錄下來，這也反映出全球審查技術產業正在擴張。遇到 TLS 干擾時，使用者通常只會看到一般的連線錯誤，而非封鎖頁面，因此很難分辨這是刻意的審查、還是網路故障或其他技術問題。加密化原本是要保護使用者，反過來卻讓審查變得更不透明。

### 流量限速與服務劣化

各國政府越來越常用頻寬限速作為一種較隱晦的控制手段，限制特定服務的可用性而不直接封鎖。這會讓通訊 App 或其他平台變慢，讓人不想再使用，但連線在技術上仍然「成立」。為了調查這類案例，OONI 開發了一套[針對性流量限速的測量方法論](https://github.com/ooni/probe-cli/blob/master/docs/design/dd-007-throttling.md){target="_blank"}，並在[哈薩克](https://ooni.org/post/2023-throttling-kz-elections/){target="_blank"}、[俄羅斯](https://ooni.org/post/2022-russia-blocks-amid-ru-ua-conflict/#twitter-throttled){target="_blank"}與[土耳其](https://ooni.org/post/2025-turkiye-throttling-social-media/){target="_blank"}的真實案例中應用與驗證。

### 審查與隱私技術的拉鋸

當局也把目標放在新興的隱私技術上。例如伊朗從至少 2020 年起就[封鎖加密 DNS](https://ooni.org/post/2022-iran-blocks-social-media-mahsa-amini-protests/#blocking-of-dns-over-https-doh){target="_blank"}，而[俄羅斯在 2024 年 11 月封鎖了 ECH（Encrypted Client Hello）](https://theins.ru/news/275980){target="_blank"}。這些手段讓使用者更難繞過審查，同時也壓縮了線上隱私的空間。對此，OONI 開發了新的實驗來[量測 ECH](https://github.com/ooni/spec/blob/master/nettests/ts-039-echcheck.md){target="_blank"} 與[加密 DNS](https://github.com/ooni/spec/blob/master/nettests/ts-028-dnscheck.md){target="_blank"}。這些測試已整合進 [OONI Probe](https://ooni.org/install){target="_blank"}，世界各地的測量資料以[公開資料](https://ooni.org/data){target="_blank"}形式即時發佈。

### 國家內網與「允許清單」做法的興起

部分政府正朝向高度控管的國家網路演進。在[伊朗](https://www.kentik.com/blog/from-stealth-blackout-to-whitelisting-inside-the-iranian-shutdown/){target="_blank"}、[俄羅斯](https://habr.com/ru/articles/997088/){target="_blank"}、[緬甸](https://www.article19.org/resources/unplugged-in-myanmar-internet-restrictions-following-the-military-coup/){target="_blank"}等國家，當局正在實驗「允許清單（allowlisting）」做法，把可存取的範圍限縮在被核准的服務或網站，實質上建立出網際網路的圍牆區。

這些趨勢都顯示審查手法越來越精細、針對性越來越強，也越來越難被偵測。要守護線上接取權與數位人權，持續的測量與倡議因此格外重要。

## 從測量到倡議

對網路進行測量，能讓我們觀察到網路流量在實務上是如何被處理的。審查經常在網路層被實作，這類測量可以揭示「什麼」被封鎖、「如何」被封鎖、「何時」被封鎖，以及是「哪一個網路」執行的。這個層級的洞察可以提供審查的證據，使得網路測量成為捍衛開放網路的有力倡議工具。

也因為這個理由，OONI 從 2016 年起就是全球 [#KeepItOn 行動](https://www.accessnow.org/keepiton){target="_blank"}的活躍成員，協助全世界數百個人權組織用 [OONI 資料](https://ooni.org/data/){target="_blank"}去倡議反對網路關閉。OONI 資料因此支援了多國挑戰社群媒體封鎖的倡議行動，包括[加彭](https://www.accessnow.org/press-release/keepiton-social-media-restore-access-in-gabon/){target="_blank"}、[坦尚尼亞](https://www.accessnow.org/press-release/keepiton-tanzanian-authorities-and-meta-must-reverse-course-and-respect-human-rights/){target="_blank"}、[尼泊爾](https://www.accessnow.org/press-release/access-nows-statement-on-nepals-escalating-digital-repression-and-deadly-crackdown/){target="_blank"}、[多哥](https://www.accessnow.org/press-release/keepiton-togolese-authorities-must-uphold-human-rights-online-and-off-during-protests/){target="_blank"}與[莫三比克](https://www.hrw.org/news/2024/11/06/mozambique-post-election-internet-restrictions-hinder-rights){target="_blank"}，也用在政策與法律介入上，例如[巴基斯坦](https://web.archive.org/web/20190322194634/pakistantoday.com.pk/2019/03/21/submit-reply-or-face-contempt-ihc-tells-pta-chairman/){target="_blank"}與[肯亞](https://blog.bake.co.ke/wp-content/uploads/2025/05/HCCHRPET.276.2025-ICJ-v-CA-Internet-Shutdown-Case.pdf){target="_blank"}的高等法院申請案。

OONI 資料集的規模也強化了倡議價值。自 2012 年起，已從 245 個國家與地區、30,000 個網路收集到[超過 30 億筆量測](https://explorer.ooni.org/){target="_blank"}，[OONI 資料](https://ooni.org/data){target="_blank"}是同類型中全球最大的網路審查公開資料集。每個月都有數千萬筆新的量測從約 180 個國家收進來，每天則持續以即時方式發佈來自世界各地的新量測。

OONI 資料是一份等待被探索的[豐富資料集](https://ooni.org/data){target="_blank"}。它的廣度與深度能支援研究，即時發佈的特性則能支援倡議與快速反應行動。它也定期被收進 [ISOC 的 Pulse Shutdown 專案](https://pulse.internetsociety.org/en/shutdowns/){target="_blank"}用來記錄全球的社群媒體封鎖。你也可以使用這份資料，[加入這個社群](https://ooni.org/get-involved/){target="_blank"}，一起捍衛自由開放的網路。

## 台灣觀點

### 對照 OONI Probe 在台灣的觀測資料

台灣常被認為是「網路自由度高」的地區，這不代表網路層完全沒有干擾。透過 [OONI Probe](https://ooni.org/install/){target="_blank"} 在台灣固網 ISP 與行動網路上的長期測量，可以盤點是否出現 TLS 干擾、DNS 操縱或封鎖跡象，作為討論「數位韌性」議題時的本地證據。社群已經在 [Tor Relays 觀測點](../../taiwan/tor-relay-watcher.md)與 [ASN 觀測資料分析](../../taiwan/ooni-asn-coverage.md)上累積了一部分基礎，測量者社群的規模仍然偏小，覆蓋率不足會直接影響到可信度。

### 反詐騙阻擋與「合理執法」的界線

台灣近年來陸續出現針對境外詐騙、賭博、未授權內容平台的網路層阻擋。這些措施在程序上通常透過警政、NCC 或 ISP 的合作執行，目的具有公共政策正當性，執行細節、阻擋清單、誤擋的爭議與救濟機制，往往缺乏對外可驗證的透明度。本文討論的 TLS 干擾、流量限速、加密 DNS 封鎖等手段，在民主國家也有採用，「合理執法」與「不透明審查」之間的界線必須持續被檢視。OONI Probe 這類獨立觀測工具，正是讓這條界線可以被驗證的關鍵基礎建設。

### 在台灣推廣 OONI Probe 與測量貢獻者社群

中文圈的網路審查觀測資料長期偏少。台灣作為正體中文使用者的主要在地之一，有條件擔任這份補上資料的角色。可以從基礎內容在地化開始，把 OONI Probe 的安裝、安全使用、資料解讀整理成中文文件，讓有興趣的人能自己上手。長期則需要更多元的參與者，包括公民科技社群、學術網路、校園與企業內網的志工，才能累積足夠的測量涵蓋率。社群這側已經整理了 [OONI 網站檢測清單](../../taiwan/ooni-checklist.md)，可以作為入門起點。

## 延伸閱讀

- [什麼是 OONI？](../../tools/what-is-ooni.md)
- [OONI 網站檢測清單](../../taiwan/ooni-checklist.md)
- [Tor Relays 觀測點](../../taiwan/tor-relay-watcher.md)
- [ASN 觀測資料分析](../../taiwan/ooni-asn-coverage.md)
- [OONI Run v2 操作說明](../../tools/ooni-run-v2.md)
