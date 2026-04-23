---
date: 2025-04-08
authors:
    - toomore
categories:
    - 技術
    - OONI
    - 翻譯文章
slug: 2025-ooni-explorer-thematic-censorship-pages
image: "assets/images/ooni-explorer-thematic-censorship-pages.png"
summary: "發佈全新 OONI Explorer 主題審查頁面！全球社群媒體、新聞媒體和翻牆工具封鎖情況的圖表和報告"
description: "發佈全新 OONI Explorer 主題審查頁面！全球社群媒體、新聞媒體和翻牆工具封鎖情況的圖表和報告"
---

# 發佈：新 OONI Explorer 主題審查頁面

!!! info ""

    以下內容原文翻譯來自以下文章，主詞角色為 OONI：

    - [Launch: New OONI Explorer thematic censorship pages, Maria Xynou 2025-04-02](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/){target="_blank"}

<figure markdown="span">
  ![New OONI Explorer thematic censorship pages](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/images/image-1.png){style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);"}
  <figcaption>圖片來源：<a target="_blank" href="https://explorer.ooni.org/social-media">OONI Explorer thematic censorship pages</a></figcaption>
</figure>

我們很高興地宣布，2025/04/02 發佈了全新的 OONI Explorer 主題審查頁面！這些新頁面包含了依 OONI 觀察資料的全球[社群媒體](https://explorer.ooni.org/social-media){target="_blank"}、[新聞媒體](https://explorer.ooni.org/news-media){target="_blank"}和[翻牆工具](https://explorer.ooni.org/circumvention){target="_blank"}封鎖情況的圖表和報告。

在這篇部落格文章中，我們分享有關新 OONI Explorer 主題審查頁面的資訊。

- 關於 OONI Explorer
      - 為什麼要有新的主題審查頁面？
- 新的 OONI Explorer 主題審查頁面
      - 社群媒體和即時通訊應用程式的封鎖
      - 新聞媒體的封鎖
      - 翻牆工具的可達性
- 感謝

<!-- more -->

## 關於 OONI Explorer

[OONI Explorer](https://explorer.ooni.org/){target="_blank"} 是全球最大的**網際網路審查開放資料庫**。

這些觀察資料數據由全球 [OONI Probe](https://ooni.org/install/){target="_blank"} 使用者貢獻，他們在其所在地的網路上進行審查測試，並將測試結果即時上傳、貢獻回開放資料庫中。自 2012 年以來，OONI Probe 使用者已經貢獻了來自 [242 個國家和地區、28000 個網路以及超過 20 億筆測量觀測資料](https://explorer.ooni.org/){target="_blank"}，所有這些資料數據都可在 OONI Explorer 上公開獲得。隨著 OONI Probe 使用者持續進行測試，每天都有新的測量觀測結果即時公開發佈。您也可以透過協助[執行 OONI Probe](https://ooni.org/install/){target="_blank"} 來貢獻 OONI 觀測數據資料。

為了讓研究人員和人權捍衛者能夠監測和回應全球的審查事件，我們建立了 OONI Explorer：一個網路平台，其中包含一個測量觀測數據資料[搜尋工具](https://explorer.ooni.org/search){target="_blank"}，以及一個[測量資料彙整工具包（MAT）](https://explorer.ooni.org/chart/mat){target="_blank"}，用於根據 OONI 觀測資料數據來彙整生成可視圖表。OONI Explorer 還包括[以域名為中心的頁面](https://explorer.ooni.org/domains){target="_blank"}，讓您查看與 OONI Probe 測試特定域名相關的數據資料、以網路為中心的頁面，透過這些頁面您可以了解特定自治網路（AS）上進行的 OONI Probe 測試，以及提供每個國家 OONI 測量覆蓋詳情的[國家專屬頁面](https://explorer.ooni.org/countries){target="_blank"}。我們還在 OONI Explorer 的「審查發現」頁面上發布短篇報告，記錄[新出現的審查事件](https://explorer.ooni.org/findings){target="_blank"}。

### 為什麼要有新的主題審查頁面？

在很大程度上，使用 OONI Explorer 需要深入研究 OONI 測量觀測數據資料以發現審查事件，而探索和[解釋 OONI 測量觀測數據資料](https://ooni.org/support/interpreting-ooni-data/){target="_blank"}對於不熟悉 OONI 工具和方法的使用者可能是一項挑戰。因此，我們建立了新的 OONI Explorer 頁面，來展示主題式的審查結果，以便網路自由社群能夠更輕鬆地發現並回應影響公共利益（如新聞媒體）平台的新審查事件，而不必深入挖掘 OONI 測量觀測數據資料。多年來，這項需求在社群回饋中多次被提及。

為了確定在 OONI Explorer 上呈現哪些審查結果最有用，我們透過一項調查和與網路自由社群成員的訪談進行了廣泛的使用者研究。這項使用者研究的目標是更好地了解網路自由社群如何使用 OONI Explorer，以及他們在透過該平台發現審查結果時遇到的挑戰。

根據這項使用者研究中蒐集的社群建議回饋，我們得出結論：OONI Explorer 上的新主題審查結果頁面將聚焦於以下主題：社群媒體、新聞媒體和翻牆工具。社群的意見回饋也幫助我們確定了在這些主題頁面上呈現資訊的方式。

## 新的 OONI Explorer 主題審查頁面

為了讓網路自由社群更容易地發現和反應審查事件，我們建立了新的 OONI Explorer 頁面，提供以下主題的 OONI 數據資料和觀察：

- [社群媒體和即時通訊應用程式的封鎖](https://explorer.ooni.org/social-media){target="_blank"}
- [新聞媒體的封鎖](https://explorer.ooni.org/news-media){target="_blank"}
- [翻牆工具的可達性](https://explorer.ooni.org/circumvention){target="_blank"}

每個新的 OONI Explorer 主題頁面均包括：

- 基於 OONI 觀察資料記錄相關封鎖的[簡短報告](https://explorer.ooni.org/findings){target="_blank"}
- 基於 OONI 觀察資料記錄相關封鎖的[長篇研究報告](https://ooni.org/reports/){target="_blank"}
- 涵蓋每個主題（社群媒體、新聞媒體、翻牆工具）的**最新 OONI 資料數據圖表**

這些圖表預設是根據三個國家篩選的：中國、伊朗和俄羅斯。我們選擇這些國家是因為它們擁有穩定的 OONI 測量覆蓋和高層級的網路審查，相較於其他國家提供了呈現更具意義圖表的機會。大多數國家都有 OONI 測量覆蓋，您可以透過更改國家和日期範圍（預設設定為過去一個月）來調整這些頁面上的圖表。若要更好地理解這些圖表，請參考我們的 [OONI 觀測資料數據解讀文件](https://ooni.org/support/interpreting-ooni-data/){target="_blank"}。

這三個主題（社群媒體、新聞媒體、翻牆工具）是根據使用者研究中蒐集的社群回饋，以及社群媒體、新聞媒體和翻牆工具在全球經常被封鎖的事實所決定的，這也影響到人權。因此我們希望這些新頁面能呼應全球的 [#KeepItOn 運動](https://www.accessnow.org/campaign/keepiton/){target="_blank"}和其他全球倡議。

### 社群媒體和即時通訊應用程式的封鎖

<figure markdown="span">
  ![OONI Explorer Social Media page](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/images/image-2.png){style="border: 1px #ababab solid;"}
  <figcaption>圖片來源：<a target="_blank" href="https://explorer.ooni.org/social-media">OONI Explorer Social Media page</a></figcaption>
</figure>

社群媒體平台在全球各地[經常被封鎖](https://ooni.org/documents/2022-ooni-submission-ohchr-report-internet-shutdowns.pdf){target="_blank"}，特別是在選舉期間和大型抗議活動中。透過新的 OONI Explorer 社群媒體頁面，我們分享根據 OONI 觀測資料數據記錄的全球社群媒體和即時通訊應用程式封鎖的**（[短篇](https://explorer.ooni.org/findings?theme=social_media){target="_blank"}和[長篇](https://ooni.org/reports/social-media-im){target="_blank"}）報告**。我們還分享包含最新 OONI 觀測資料的**圖表**，這些資料數據與受測的熱門社群網站及以下即時通訊應用程式有關：[WhatsApp](https://ooni.org/nettest/whatsapp/){target="_blank"}、[Facebook Messenger](https://ooni.org/nettest/facebook-messenger/){target="_blank"}、[Telegram](https://ooni.org/nettest/telegram/){target="_blank"} 和 [Signal](https://ooni.org/nettest/signal/){target="_blank"}（這些是我們唯一特別進行的 [OONI Probe 實驗](https://ooni.org/nettest/){target="_blank"}即時通訊應用程式）。

我們選擇特定社群媒體網域是基於其全球相關性、使用情況、全球 OONI 測量覆蓋，以及它們是否被封鎖（或可能被封鎖）。我們避免在新的社群媒體頁面中包括所有被測社群媒體網域的圖表，以提高其易用性。如果您有興趣查看社群媒體頁面上未列出的[其他社群媒體網域](https://explorer.ooni.org/social-media){target="_blank"}的 OONI 觀測資料數據，您可以透過 OONI Explorer [搜尋工具](https://explorer.ooni.org/search){target="_blank"}或[測量資料彙整工具包（MAT）](https://explorer.ooni.org/chart/mat){target="_blank"}來進行。

我們鼓勵您了解全球 [#KeepItOn 運動](https://www.accessnow.org/campaign/keepiton/){target="_blank"}的倡議工作，這項運動正在對抗全球社交媒體封鎖。

### 新聞媒體的封鎖

<figure markdown="span">
  ![OONI Explorer Social Media page](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/images/image-3.png){style="border: 1px #ababab solid;"}
  <figcaption>圖片來源：<a target="_blank" href="https://explorer.ooni.org/social-media">OONI Explorer Social Media page</a></figcaption>
</figure>

新聞自由在全球各地面臨越來越大的威脅，因為許多國家的新聞媒體網站遭到封鎖。透過新的 OONI Explorer [新聞媒體頁面](https://explorer.ooni.org/news-media){target="_blank"}，我們分享根據 OONI 觀測資料數據記錄的全球新聞媒體網站封鎖的（[短篇](https://explorer.ooni.org/findings?theme=news_media){target="_blank"}和[長篇](https://ooni.org/reports/news-media){target="_blank"}）報告。我們還分享含有最新 OONI 觀測資料的圖表，這些資料數據與受測的多個新聞媒體網站有關。我們選擇特定的新聞媒體網域是基於其全球相關性、全球 OONI 測量覆蓋，以及它們是否被封鎖（或可能被封鎖）。

我們避免在新的[新聞媒體頁面中](https://explorer.ooni.org/news-media){target="_blank"}包括所有被測新聞媒體網域的圖表，以提高易用性。如果您有興趣查看新聞媒體頁面上未列出的其他新聞媒體網域的 OONI 資料數據，您可以透過 OONI Explorer [搜尋工具](https://explorer.ooni.org/search){target="_blank"}或[測量資料彙整工具包（MAT）](https://explorer.ooni.org/chart/mat){target="_blank"}來進行。不過請注意，[OONI 觀測資料數據](https://ooni.org/data/){target="_blank"}的可用性取決於那些網域是否已被該國家的 OONI Probe 使用者測試。您可以透過我們的[測試清單編輯器上傳網站](https://ooni.org/support/test-lists-editor){target="_blank"}以供[測試](https://test-lists.ooni.org/login){target="_blank"}。

### 翻牆工具的可達性

<figure markdown="span">
  ![OONI Explorer Circumvention Tools page](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/images/image-4.png){style="border: 1px #ababab solid;"}
  <figcaption>圖片來源：<a target="_blank" href="https://explorer.ooni.org/circumvention">OONI Explorer Circumvention Tools page</a></figcaption>
</figure>

由於翻牆工具（如 VPN）能夠讓使用者繞過網際網路審查，一些政府封鎖了這些工具的使用。事實上，OONI 觀察資料數據多年來[顯示](https://ooni.org/reports/){target="_blank"}，翻牆工具的封鎖經常與社群媒體的封鎖有關聯。

透過 OONI Explorer [翻牆工具頁面](https://explorer.ooni.org/circumvention){target="_blank"}，我們分享根據 OONI 觀測資料數據記錄的全球翻牆工具網站封鎖的（[短篇](https://explorer.ooni.org/findings?theme=circumvention){target="_blank"}和[長篇](https://ooni.org/reports/circumvention){target="_blank"}）報告。我們還分享含有最新 OONI 觀測資料數據的圖表，這些資料數據與 [Tor](https://ooni.org/nettest/tor/){target="_blank"}、[Tor Snowflake](https://ooni.org/nettest/tor-snowflake/){target="_blank"} 和 [Psiphon](https://ooni.org/nettest/psiphon/){target="_blank"}（目前我們以特定的 OONI Probe 實驗功能來檢測主要翻牆工具）的可達性測試，以及多個翻牆工具網站的測試相關。

我們選擇這些特定翻牆工具網域是基於其全球相關性、使用情況、全球 OONI 測量覆蓋，以及它們是否被封鎖（或可能被封鎖）。我們避免在[新的翻牆工具頁面中](https://explorer.ooni.org/circumvention){target="_blank"}包括所有被測翻牆工具網域的圖表，以提高易用性。如果您有興趣查看翻牆工具頁面上未列出的其他翻牆工具網站的 OONI 觀察資料數據，您可以透過 OONI Explorer [搜尋工具](https://explorer.ooni.org/search){target="_blank"}或[測量資料彙整工具包（MAT）](https://explorer.ooni.org/chart/mat){target="_blank"}來進行。

檢視圖表時，請注意[異常測量](https://ooni.org/support/interpreting-ooni-data/#anomalous-measurements){target="_blank"}的存在**並不**總是意味着封鎖，因為可能會出現[誤判](https://ooni.org/support/interpreting-ooni-data/#false-positives){target="_blank"}。此外，翻牆工具通常內建規避審查的技術。因此，我們建議參考 [Tor Metrics](https://metrics.torproject.org/){target="_blank"} 和 [Psiphon Data Engine](https://psix.ca/){target="_blank"} 以查看使用狀況統計資料，並更全面地了解這些工具在各國的有效性。

## 感謝

感謝每一位自 2012 年以來貢獻測量資料數據的 [OONI Probe](https://ooni.org/install/){target="_blank"} 使用者，使網路自由社群能夠監測和回應全球的審查事件。
