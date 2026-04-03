---
title: 網路自由為什麼重要？
description: 從亞洲脈絡理解網路審查、監控與平台壓力，以及 OONI 觀測與 Tor 匿名連線能扮演的角色。
icon: material/chat-question
---

# :material-chat-question: 網路自由為什麼重要？

在這裡，**網路自由**指的是：人們能否在免於不當干預的情況下取得資訊、表達意見，以及選擇自己信任的工具與連線方式。它和「匿名、隱私、規避審查」常一起出現，但側重點不同，可先從[什麼是匿名網路？](./what-is-anonymous-network.md)對照閱讀。

除了政府封鎖與大規模監控，跨境平台規則、帳號處置、演算法可見度與資料留存，也會形塑誰能說話、誰能被看見。多地的誹謗、國安或資訊治理相關法規爭議，則帶來制度性的寒蟬效應。在台灣的情境下，相對開放的連線環境仍伴隨對跨國平台的高度依賴，以及對公民社會、獨立媒體與倡議者的各種壓力，這些都與「網路自由是否穩固」直接相關。

以下先以東亞、東南亞為例，說明幾種常見的壓力模式。細節與新聞案例會隨時間改變，建議搭配 [Freedom on the Net](https://freedomhouse.org/explore-the-map){target="_blank"} 國別頁與在地報導交叉閱讀。

## 東亞

中國的「長城防火牆[^1]」長期過濾大量國際網站與服務，並對境內平台內容進行政治、宗教與社會議題上的審查。北韓則將一般民眾與全球網際網路幾乎隔絕，僅能使用國家控管下的內部網路「光明網[^2]」。

臺灣在區域內多被評為相對開放，但仍面對跨境平台治理、資安與政治性操弄的討論，以及對新聞與倡議工作者的法律與輿論壓力。分數與敘事會隨調查年度更新，可參考 Freedom House 臺灣條目[^10]。

<figure markdown="span">
    <a href="https://freedomhouse.org/explore-the-map" target="_blank">
        <img src="../assets/images/freedom_house_explore_the_map.png"
            alt="Freedom House Freedom on the Net 互動地圖"
            title="Freedom House Freedom on the Net 互動地圖"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>Freedom House「Freedom on the Net」互動地圖（各國分數隨年度報告更新，畫面為站內示意截圖）</capture>
</figure>

## 東南亞

越南政府曾要求國際平台配合下架政治性批評內容[^3]。印尼對特定類別網站採取封鎖或限制[^4]。馬來西亞曾出現針對調查報導媒體與部落格的封鎖[^5]。菲律賓在選舉等高張力時期，新聞與社群內容常成為監控與干預焦點[^6]。泰國對皇室相關言論的刑事追訴，長期影響線上表意空間[^7]。

緬甸在 2021 年政變後反覆斷網、封鎖社群與鎮壓獨立媒體[^8][^9]，是「衝突與戒嚴情境下網路成為戰場」的極端例子。

## 觀測與匿名連線

亞太地區的封鎖與干預，需要可被驗證的公開紀錄。[OONI](https://ooni.org/){target="_blank"} 透過志工與探測資料，讓特定網路與規避工具的可及性以圖表與開放資料呈現。下方截圖為歷史區間範例，實際曲線與國家篩選請以 [OONI Explorer](https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW){target="_blank"} 為準。

<figure markdown="span">
    <a href="https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW" target="_blank">
        <img src="../assets/images/ooni_chart_circumvention.png"
            alt="OONI Explorer：規避工具觀測（CN, HK, TW 範例）"
            title="OONI Explorer：規避工具觀測（CN, HK, TW 範例）"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>OONI Explorer：規避工具觀測（畫面為站內保留之示意截圖，區間與資料以網站為準）</capture>
</figure>

[Tor](https://www.torproject.org/){target="_blank"} 則透過多層路由與中繼網路，協助使用者在高風險環境下維持匿名與連線，並可貢獻中繼節點強化整體網路韌性。臺灣目前已有公開可見的中繼與守護節點分佈，可自 Tor Metrics 查詢。

<figure markdown="span">
    <a href="https://metrics.torproject.org/rs.html#search/country:tw" target="_blank">
        <img src="../assets/images/tor_relay_tw.png"
            alt="Tor Metrics：臺灣地區 Tor 中繼與守護節點"
            title="Tor Metrics：臺灣地區 Tor 中繼與守護節點"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 0%);">
    </a>
    <capture>Tor Metrics：臺灣地區中繼與守護節點（畫面隨網路狀態變動）</capture>
</figure>

無論是跑 OONI 測試、架設 Tor 中繼，或協助翻譯與教學，都是在具體支撐網路自由。你可以從下方專案列表挑一項開始。

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-chat-question: 什麼是匿名網路？](./what-is-anonymous-network.md)
- [:material-access-point-network: ASNs 自治網路觀測資料分析](./ooni-asns-coverage.md)
- [:material-list-status: OONI 網站檢測清單](./ooni-weblists.md)
- [:material-translate-variant: 中文化與文件翻譯](./ooni-i18n.md)

</div>

[^1]: [4所大學團隊每日測試4億個網域研究「防火長城」，發現有31萬網域被擋下、部分的封鎖只是「意外」](https://www.thenewslens.com/article/153597){target="_blank"} - TNL The News Lens 關鍵評論網
[^2]: [金正恩無所不在：北韓監視器數量增加，強化全方位監控](https://global.udn.com/global_vision/story/8663/7970562){target="_blank"} - 轉角國際 udn Global
[^3]: [【人權焦點】讓我們呼吸! 越南政府的網路審查 與科技巨頭的共謀](https://www.amnesty.tw/news/3805){target="_blank"} - 國際特赦組織台灣分會
[^4]: [印尼預計6月落實網路新規定，恐剝奪社交平台言論自由](https://www.thenewslens.com/article/164619){target="_blank"} - TNL The News Lens 關鍵評論網（法規細節請以印尼官方與最新報導為準）
[^5]: [馬來西亞局內人](https://zh.wikipedia.org/zh-tw/%E9%A9%AC%E6%9D%A5%E8%A5%BF%E4%BA%9A%E5%B1%80%E5%86%85%E4%BA%BA){target="_blank"} - 維基百科，自由的百科全書
[^6]: [菲律賓「Rappler」撤照風波：杜特蒂殺向記者的復仇印記？](https://global.udn.com/global_vision/story/8663/6435){target="_blank"} - 轉角國際 udn Global
[^7]: [泰國王室罵不得！男子臉書PO文惹禍 遭判刑50年破紀錄](https://udn.com/news/story/6812/7721452){target="_blank"} - 聯合新聞網
[^8]: [緬甸被徹底剝奪的新聞自由：報導颶風災害的記者遭軍政府判刑20年監禁](https://feja.org.tw/72219/){target="_blank"} - 卓越新聞獎基金會
[^9]: [封鎖、斷網、審查：從緬甸政變看「網路中立權」的重要性](https://lab.ocf.tw/2022/02/12/mymmar-block/){target="_blank"} - OCF Lab 開放實驗室
[^10]: [Freedom House：Taiwan（Freedom on the Net 國別條目）](https://freedomhouse.org/country/taiwan/freedom-net/2024){target="_blank"}（年度與網址隨報告更新，若連結失效請改從[互動地圖](https://freedomhouse.org/explore-the-map)進入）
