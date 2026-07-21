---
date: 2026-07-26
authors:
    - anoni-net
categories:
    - 翻譯文章
    - OONI
    - Tor
slug: 2026-defending-the-public-s-right-to-know
image: "https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png"
summary: "Tor Project 部落格上的一篇文章整理了 OONI 觀測資料在實際情境中如何被引用：肯亞高等法院的網路關閉訴訟、坦尚尼亞挑戰 Twitter/X 封鎖，以及俄羅斯流亡媒體 Meduza 寫文章邀讀者試用 OONI 工具，並從中看到公民團體、新聞工作者、技術研究者、律師如何從同一份資料集出發，把網路中斷推升為公共利益議題。"
description: "Tor Project 部落格上的一篇文章，整理 OONI 觀測資料如何進到肯亞高等法院、坦尚尼亞 Twitter/X 封鎖訴訟，俄羅斯流亡媒體 Meduza 也寫文章邀讀者試用 OONI 工具。文末補上台灣 ASN 觀測現況與在地倡議的接續方向。"
---

# 從肯亞高院到台灣盲點：OONI 開放資料如何進到法庭、新聞室與公共紀錄

!!! info ""

    這篇文章是 Tor Project 部落格「守護自由網際網路」系列的其中一篇，介紹 OONI 在實際情境中如何運作。原文翻譯如下：

    - [Defending the public's right to know, pavel 2026-05-12](https://blog.torproject.org/Defending-the-right-to-know/){target="_blank"}

    在原文之外，文末另外補一段台灣脈絡，談台灣的 OONI 觀測現況、可以對照肯亞案件的法律倡議切入點，以及一般讀者可以如何把家用網路、行動網路接進這份公共紀錄。

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png"
            alt="Tor Project 文章「守護自由網際網路」系列的視覺主圖，主題為 OONI"
            style="border-radius: 10px;">
    </a>
    <figcaption>圖片來源：<a target="_blank" href="https://blog.torproject.org/Defending-the-right-to-know/">Tor Project Blog</a>。</figcaption>
</figure>

網路自由已經[連續 15 年下滑](https://freedomhouse.org/article/new-report-persistent-authoritarian-repression-and-backsliding-democracies-drive-15th){target="_blank"}。除了監控、隱私與匿名性遭到侵蝕、各種資訊操弄之外，各國政府也針對特定網站與服務實施封鎖或限制，甚至直接攻擊網路基礎建設本身，造成網路關閉（shutdown）與蓄意中斷。我們要怎麼知道網路在什麼時候被審查、又用了什麼方式？

[OONI](https://ooni.org/){target="_blank"}（Open Observatory for Network Interference，網路干擾開放觀測站）是 Tor Project 衍生出來的計畫，提供[自由及開源工具](https://ooni.org/install/){target="_blank"}與[開放資料](https://ooni.org/data/){target="_blank"}。使用者用這些工具量測網路審查事件，把觀測結果上傳成可驗證的紀錄，後續也可以引用到報導、研究或法律行動。以下是幾個實際的案例。

<!-- more -->

## 守護公共紀錄

OONI 的觀測資料是[全球最大的網路審查開放資料集](https://explorer.ooni.org/){target="_blank"}，自 2012 年以來已累積數十億筆量測，涵蓋 245 個國家與地區、數萬個網路。這些資料能存在，是因為全球各地有人在使用 [OONI Probe](https://ooni.org/install/){target="_blank"}（一款免費的網路測量工具，桌面版與手機版都有，按一下就對你所在的網路跑一輪連線測試），把自己連線的網路狀況回報上來。每一筆新的量測，都會加進這份公共紀錄。

這份資料集之所以受到引用，原因同時來自規模與方法論。網路審查常常以「讓干擾看不出來」的方式進行，被封鎖的網站看起來像壞掉了、被限速的應用程式看起來不穩定、整段網路關閉看起來像是技術故障。在 OONI 採用的[公開量測方法論](https://github.com/ooni/spec/tree/master/nettests){target="_blank"}、同儕審查、專家回饋與對照組量測的基礎上，這些手段可以在資料層面被識別出來，「網路被審查了」這類主張因此可以被檢驗、被挑戰、被驗證。

為了降低查資料的門檻，OONI Explorer 上線了[主題式頁面](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/){target="_blank"}，聚焦在最常被審查的幾個領域，包括社群媒體與即時通訊應用程式、新聞媒體、翻牆工具。每個頁面都收錄短篇報告、長篇研究報告，以及帶最新 OONI 資料的圖表。

2025 年新增的「[新聞媒體封鎖](https://explorer.ooni.org/news-media){target="_blank"}」頁面就是一個例子，讀者不必翻數十億筆原始量測，就能直接看到這些發現。包括埃及封鎖獨立媒體 [Zawia3](https://explorer.ooni.org/findings/99431807200){target="_blank"}、約旦封鎖 [12 個新聞媒體網站](https://explorer.ooni.org/findings/101531332700){target="_blank"}、印度在與巴基斯坦軍事衝突期間封鎖 [The Wire](https://explorer.ooni.org/findings/667455800){target="_blank"}。

[網路審查事件通常發生的時間點](https://ooni.org/reports/){target="_blank"}，往往是選舉、抗議、武裝衝突、全國性大考、政局動盪期間，正是民眾最需要取得資訊的時候。在這些關鍵時刻，受影響的社群可以從 OONI 觀測資料取得共同的事實基礎，後續才有機會究責。

## 新聞工作者與媒體組織如何運用 OONI

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/0/034a6f0033d426dfc46e0fcfefb03e858f04b155.jpeg" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/0/034a6f0033d426dfc46e0fcfefb03e858f04b155.jpeg"
            alt="OONI Explorer 上的 dw.com 量測截圖，顯示俄羅斯、中國、伊朗對 dw.com 的封鎖"
            style="border-radius: 10px;">
    </a>
    <figcaption>OONI Explorer 的截圖，顯示 dw.com 在俄羅斯、中國、伊朗被封鎖的情形。圖片來源：<a target="_blank" href="https://blog.torproject.org/Defending-the-right-to-know/">Tor Project Blog</a>。</figcaption>
</figure>

2025 年，俄羅斯流亡媒體中相當知名的 [Meduza](https://meduza.io/en){target="_blank"} [發表了一篇文章介紹 OONI 工具](https://meduza.io/cards/tsenzury-v-runete-vse-bolshe-kak-mozhno-otslezhivat-blokirovki){target="_blank"}，邀讀者實際試用。從 Meduza 這個案例可以看到，新聞編輯室除了用網路審查量測來寫報導，也可以把它當作公共教育的一環，讓讀者理解網路干擾是如何運作的、可以如何被記錄下來、自己又能如何貢獻到這份證據基礎裡。

新聞網站被封鎖，影響從來不只是技術層面，代表的是大眾失去取得報導的管道、社群失去即時資訊、記者失去他們的讀者。只有當這件事被記錄成可以被引用、可以被分析的資料，後續行動才有立足點。

最具體的串接案例發生在肯亞。OONI 觀測資料被當作證據，用在一場挑戰「非法切斷網路連線」的公共利益訴訟。[這場訴訟由一個聯盟提出](https://blog.bake.co.ke/2025/05/14/bake-6-other-organizations-challenge-internet-shutdowns-in-kenya-in-landmark-public-interest-case/){target="_blank"}，成員包括 BAKE、ICJ Kenya、Paradigm Initiative、肯亞記者工會（Kenya Union of Journalists）、Katiba Institute、肯亞律師公會（Law Society of Kenya）和 CIPESA。為了支援這份提交給肯亞高等法院（High Court of Kenya）的聲請，OONI 以專家意見的形式產出了一份[詳細的研究報告](https://blog.bake.co.ke/wp-content/uploads/2025/05/HCCHRPET.276.2025-ICJ-v-CA-Internet-Shutdown-Case.pdf){target="_blank"}，記錄 Telegram 在肯亞 2023 與 2024 年 KCSE 全國性大考（肯亞的中學畢業會考，當局以防堵考題外洩為由，在考試期間限制社群與通訊軟體）期間被封鎖的情形。

在這個案子裡，記者工會、數位人權組織、法律倡議者與技術研究者從同一份資料集出發，把「網路被中斷」推升為公共利益議題。這也是區域上重要的先例，坦尚尼亞的律師後來主動聯絡 OONI 索取資料，用來支持當地挑戰封鎖 Twitter/X 的法律行動，OONI 也因此發表了一份[記錄這次封鎖的研究報告](https://ooni.org/post/2025-tanzania-blocked-twitter/){target="_blank"}。

## 為共同的網際網路集體行動

從肯亞延伸到坦尚尼亞的這個漣漪效應裡，可以看到網路審查如何跨地域運作，也可以看到大家可以如何回應。封鎖一個即時通訊應用程式，從來不是一件孤立的事。記者可能失去與消息來源的聯繫管道，社運行動者可能失去組織動員的通道，[翻牆工具開發者可能要重新調整](https://blog.torproject.org/fighting-censorship-with-webtunnel/){target="_blank"}，研究者可能要驗證實際情況，律師可能需要證據。所有人都需要文件紀錄。

OONI 的[開放資料](https://ooni.org/data/){target="_blank"}模型，正好對應這些關鍵時刻的需求。守護自由的網際網路，需要把審查記錄下來、把證據分享出去，並且一起累積回應這些事件的集體量能。

## 在地脈絡：台灣如何接上這個工作流程

OONI 在肯亞、坦尚尼亞、約旦、印度、埃及的故事，地理位置上看起來離我們很遠，但運作邏輯跟台灣是同一套，靠的都是公開的量測資料和跨領域的協作。台灣要接上這套工作流程，從觀測覆蓋、倡議路徑到一般人的參與，有三件事可以往下看。

### 台灣的 OONI 觀測覆蓋還有盲點

匿名網路社群長期維護一份 [ASN 自治網路觀測資料分析](../../taiwan/ooni-asn-coverage.md)，把台灣每個 ASN（自治系統編號，可粗略理解成每家 ISP 的網路編號，中華電信、台哥大各自不同）的 OONI 觀測筆數整理成圖表。實際看下來，觀測集中在少數幾家網路，行動網路、學術網路、許多本地 ISP 仍然是空白。OONI 全球資料集再龐大，台灣這塊還是要靠在地使用者持續[執行 OONI Probe](https://ooni.org/install/){target="_blank"} 才能補上盲點。

台灣的情況也一樣，哪個 ASN 沒人在跑 OONI，未來如果在那條路徑上發生封鎖或中斷，就缺少能引用的證據。

### 從肯亞訴訟看台灣的倡議切入點

肯亞高等法院的訴訟示範了公民團體、媒體工會、法律倡議者、技術研究者如何從同一份開放資料出發，把網路中斷的爭議推到制度層級的問責程序。報導中國、香港、緬甸的封鎖事件時，台灣媒體與公民團體已經能引用 OONI 公開資料當作佐證。下一步值得思考的是，當台灣自己遇到網路中斷或服務阻斷事件時（例如 2023 年馬祖海纜中斷導致離島對外連線受影響），如何在法律倡議、人權報告、立法質詢層面建立類似的證據鏈。

### 把家用網路、行動網路接進這份公共紀錄

OONI Probe 桌面版與行動版都能在家用網路、行動網路、公共 Wi-Fi 上執行，每換一個連線環境就能多留下一筆紀錄。對社群與民間組織來說，可以把它放進既有的工作節奏，例如在不同縣市的據點、活動現場、成員的行動門號上輪流量測，讓覆蓋從少數幾家網路擴散到更多日常情境。這跟前面提到的盲點是同一件事的兩面，一邊是看出哪裡還沒被測到，一邊是把那些網路一筆一筆補上來。

## 你可以做的事

不論你是想補觀測、做研究，還是要把資料用在報導或倡議，都有可以著手的起點。

- **一般讀者**：[安裝 OONI Probe](https://ooni.org/install/){target="_blank"} 跑一輪，讓你這條網路出現在公共紀錄裡（執行前可先看 OONI 對[潛在風險的說明](https://ooni.org/about/risks/){target="_blank"}）。如果有你常用、想納入定期測量的網站，可以到 OONI 的[測試清單編輯器](https://test-lists.ooni.org/login){target="_blank"}提交，之後全球的 OONI Probe 就會把它排進測試。
- **研究者與技術社群**：先看 [ASN 自治網路觀測資料分析](../../taiwan/ooni-asn-coverage.md) 上台灣 ASN 的盲點分布，再評估自己這條網路或實驗環境可以補上哪些量測，並把資料整理成可重複比對的圖表。
- **記者、媒體編輯、人權律師**：下次處理中國、香港、緬甸等地封鎖事件的報導時，[OONI Explorer](https://explorer.ooni.org/){target="_blank"} 上的量測截圖、調查發現（findings）短篇報告、長篇研究報告都可以引用做公開佐證。要走到公共利益訴訟層級的案件，肯亞案示範了向 OONI 申請專家意見報告的流程。

## 相關閱讀

- [發佈：新 OONI Explorer 主題審查頁面](./2025-ooni-explorer-thematic-censorship-pages.md)
- [OONI 全新的匿名憑證系統](./2026-ooni-anonymous-credentials.md)
- [ASN 自治網路觀測資料分析](../../taiwan/ooni-asn-coverage.md)
- [OONI 網站檢測清單](../../taiwan/ooni-checklist.md)
