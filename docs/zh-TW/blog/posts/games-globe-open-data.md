---
date: 2026-07-27
authors:
    - anoni-net
categories:
    - 更新
    - 技術
    - Tor
slug: games-globe-open-data
image: "https://assets.anoni.net/games/tor-network.png"
summary: "文件站新增「互動與呈現」區，用 3D 畫面呈現匿名網路的基礎建設。做地球儀的過程中查了二十幾份公開資料，能用的只有六份。卡住的原因幾乎都跟技術無關，API 大多打得通，擋下來的是條款不給再散布。這篇記錄那些能用與不能用的資料，以及為什麼開放授權比開放 API 更關鍵。"
description: "文件站新增「互動與呈現」區，用 3D 畫面呈現匿名網路的基礎建設。做地球儀的過程中查了二十幾份公開資料，能用的只有六份。卡住的原因幾乎都跟技術無關，API 大多打得通，擋下來的是條款不給再散布。這篇記錄那些能用與不能用的資料，以及為什麼開放授權比開放 API 更關鍵。"
---

# 把匿名網路畫成一顆地球：互動區上線，以及我們在開放資料上撞到的牆

![Tor 中繼地球儀](https://assets.anoni.net/games/tor-network.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

文件站新增了[互動與呈現](https://anoni.net/docs/games/)區，目前放了三件作品，都以 Tor 為題。其中資料量最大的是 [Tor 中繼地球儀](https://anoni.net/docs/games/tor-network/)，把全球近萬台運作中的中繼標到球面上，超過六成集中在美國、德國、荷蘭三個國家。

做這顆地球儀的過程中，我們查了二十幾份公開資料，最後能用的只有六份。卡住的原因幾乎都不是取不到資料。API 大多打得通，資料也拿得到，卡住的是條款不給我們把它再發出去。

<!-- more -->

## 為什麼要做成畫面

匿名網路的基礎建設很難用文字描述清楚，難在兩件事上：順序，還有規模。

順序的部分，Tor 是最好的例子。封包在三個中繼之間依序前進，每經過一跳剝除一層加密，到出口才還原成原本的請求。哪一層在哪一跳剝掉、每一站看得到什麼，都由這個順序決定。文字寫得再仔細，讀者腦中仍然要自行補上動起來的那一段，而每個人補出來的版本未必相同。

規模則更難傳達。「近萬台中繼，高度集中在少數國家」是一句讀過即忘的敘述。把每一台實際標記到地球上，北美與西歐連成一片光帶、其餘地區僅零星數點，集中的程度就成為可以目視的事實。同一份數字換成畫面，讀者不必信任我們的形容詞，可以自己看。

## 地球儀用到的六份資料

最後進到畫面上的有這幾份：

| 資料 | 來源 | 授權 |
|------|------|------|
| 中繼分布 | [Onionoo](https://metrics.torproject.org/onionoo.html) | CC0 1.0 |
| 使用者與橋接人數 | [Tor Metrics](https://metrics.torproject.org/) | CC0 1.0 |
| 連線受阻的觀測 | [OONI](https://ooni.org/) | CC BY-NC-SA 4.0 |
| 斷網事件 | [Access Now KeepItOn](https://www.accessnow.org/keepiton-data-dashboard/) | CC BY 4.0 |
| 海底電纜 | [OpenStreetMap](https://www.openstreetmap.org/copyright) 貢獻者 | ODbL 1.0 |
| 國界與海岸線 | [Natural Earth](https://www.naturalearthdata.com/) | public domain |

Onionoo 的中繼快照經過蒸餾，只保留國家層級的聚合，內容不含 fingerprint、nickname、IP 或聯絡資訊。ASN 的登記名稱另外過濾過，因為個人申請的 AS 在 RIR 上登記的就是持有人本名，對某些地區的操作者來說那是真實風險。

陸地亮度可以切換四種指標。中繼台數是最直觀的一種，共識權重（consensus weight）反映該國實際承擔的流量比重，與台數常有明顯落差。單一業者集中度看的是最大一家托管商佔該國的比例，用來觀察對單一業者的依賴。使用者估計則是需求端的數字，跟前三個供給端指標並列時，落差本身就是資訊。

## 資料的呈現刻意克制

OONI 的資料最能說明我們的取捨。它提供各國 tor 測試的異常率（anomaly rate），數字看起來足以畫一張全球審查地圖，但中段其實是量測雜訊。實測瑞士 `22.2%`、加拿大 `21.2%`、紐西蘭 `41.1%`，這些國家沒有審查疑慮。把中段畫成色階，等於用雜訊指控特定國家。

最後畫面只標示異常率達 `85%` 以上且樣本足夠的少數國家，中段數值一律不上色，措辭也停在「沒有照預期完成」。異常的成因包含連線被阻擋、網路不穩與 ISP 故障，僅憑比率無法區分。

Access Now 的斷網事件則相反，每一筆都經過人工查證，成因清楚，所以可以明確說明「此處發生過人為斷網」。即使如此，武裝衝突與族群衝突造成的中斷未必出自政府決策，可能是戰事破壞了基礎設施，畫面上與資訊管制類分開說明。

## 撞到的牆

真正花掉最多時間的是那些最後沒能用上的資料。

### 海底電纜

一開始想用 [TeleGeography](https://www.submarinecablemap.com/) 的 Submarine Cable Map，那是這個領域最權威的資料集。查下去才發現他們現在把座標資料當成正式商品在賣，[License TeleGeography's Map Data](https://www2.telegeography.com/license-geocoded-map-data) 是年費授權，GeoJSON 經 Amazon S3 或 API 交付，每次更新自動推送。GeoJSON 就是他們的商品本體。

我們也去看了台灣的[海纜動態地圖](https://smc.peering.tw/)，那是一個維護得很勤的民間專案。它的做法很值得記下來：程式碼採 MIT 開源，但幾何資料放在另一個 repo，對外是 404。主 repo 的 README 直接寫「You can leave the folder empty」。程式碼開源，資料不散布，這是在授權不明朗時最務實的選擇。

那顆地球儀上的海纜最後取自 OpenStreetMap 貢獻者標註的路徑，`228` 段。覆蓋以歐洲、地中海與大西洋較完整，太平洋中段幾乎是空的。回頭看 OSM 社群 2011 年的討論，當年有人提議把 TeleGeography 的資料併進 OSM，結論是授權不相容。十五年過去這件事沒有進展，太平洋的空白就是那個結論的具體樣子。

### 網路基礎建設

這一類我們查了一輪，幾乎全軍覆沒，而且共同點很一致。

[RIPE Atlas](https://atlas.ripe.net/) 的探針資料很漂亮，全球 `59,729` 個探針，含經緯度與 ASN，API 直接回得出來。但服務條款寫明商業使用需另外取得 RIPE NCC 許可，沒有開放授權宣告。PeeringDB 的 API 一樣打得通，但可接受使用政策寫明不可整批轉散布給第三方。Packet Clearing House 的 IXP 目錄是 CC BY-NC-SA 3.0，Cloudflare Radar 是 CC BY-NC 4.0，兩者的非商業條款都會傳染到我們的內容上。

[IODA](https://ioda.inetintel.cc.gatech.edu/) 是這裡面最可惜的一份。它以 BGP 路由撤除、主動探測與 darknet 流量異常偵測各國的網路中斷，是真量測不是評分，主題跟這個站高度吻合。API 回得出資料，但回應本身就帶著一行 `Copyright (c) 2021-2025 Georgia Tech Research Corporation. All Rights Reserved.`，沒有任何開放授權說明。

還有一類更麻煩：**條款完全不存在**。各 RIR 的 delegated stats 檔案下載得到，開頭只有免責聲明，沒有一個字提到授權。root-servers.org 的節點清單有 JSON 端點，整站找不到授權宣告。這種情況比明文禁止更難處理，因為沉默無法解讀成允許。

### 指數類資料

Freedom House 的 Freedom on the Net、無國界記者的新聞自由指數、V-Dem 的數位社會指標，這幾份最常被引用，但都不能用。RSF 的授權是 CC BY-**ND**，禁止改作，把它轉成 JSON 重新呈現就違反了。Freedom House 官方頁面查不到授權聲明，取得資料要寫信申請。

V-Dem 的授權技術上可用，我們仍然決定不碰，理由跟授權無關。那份資料是每個國家每年由約五位專家評分，經統計模型轉成連續量表。把專家評分畫成地圖色塊，等於用我們的畫面替某個機構的政治判斷背書。這跟前面對 OONI 的克制是同一條線。

## 我們學到的

**開放 API 不等於開放資料。** 這是最大的體感落差。我們原本以為困難會在技術面，實際上絕大多數端點都打得通、資料格式也乾淨，卡住的全在條款。RIR、CAIDA、RIPE NCC、PeeringDB 這些機構的預設立場是「可以看、可以研究，但不能整批搬走」，那是一種跟 Tor Metrics、OONI、Natural Earth 完全不同的文化。

**授權沉默的成本很高。** 沒有授權宣告的資料集，實務上等同不可用。業界確實有很多工具在用那些檔案，但那是各自承擔風險，一個公開發布的文件站沒有這個空間。

**我們的架構讓這件事沒有模糊地帶。** 文件站是靜態網站，資料檔會直接發出去，而且會推上 IPFS。內容定址意味著發出去就收不回來，鏡像可能長期存在。所以「應該沒問題」這個程度的把握不夠用。

**授權相容性要在架構層處理，不能靠事後補救。** OONI 那份是 CC BY-NC-SA 4.0，其中的 SA（相同方式分享）跟站台的 CC BY 4.0 互不相容。處理方式是讓 `ooni.json` 保持獨立的一份，不把它的內容併進其他資料檔，畫面上也只跟其他來源並列。這樣整體屬於 CC 定義的「集合」，SA 的範圍停在那一份檔案身上。這個前提要寫進 `NOTICE` 記下來，否則哪天有人把 OONI 的欄位併進中繼快照，整份衍生物就落入 SA 了。

**CC0 這種選擇的價值，要到有人想用的時候才看得出來。** 地球儀能做出來，很大程度是因為 Tor Project 把 Onionoo 與 Tor Metrics 都放成 CC0，Natural Earth 放成公有領域。這些決定在當年可能只是一行設定，但它讓十幾年後一個不相干的社群能夠直接拿去用，不必寫信、不必談授權、不必擔心哪天被要求下架。

## 其他兩件作品

[Tor 路由解謎](https://anoni.net/docs/games/onion-routing/)讓你自己挑三個中繼組成 guard、middle、exit 路徑，過程中要避開被監聽的節點、把三跳分散到不同 ASN，遇到封鎖改走橋接。看著電路因為三跳擠在同一個 ASN 而失敗，比讀十次「要分散」有效。

[Tor 連線流量](https://anoni.net/docs/games/onion-rendezvous/)用發光粒子呈現兩種路徑的差異。連線 .onion 服務時雙方各建一條三跳電路，在隨機挑出的會合點相遇。連線明網網站則走三跳到出口後原路往返。

三件作品都以 three.js 在瀏覽器中執行，免安裝，支援正體中文、簡體中文與英文。原始碼在 [anoni-net/docs](https://github.com/anoni-net/docs) 的 `docs/zh-TW/games/` 底下，沒有建置流程，改完存檔重新整理就看得到。

有想法或想一起做，歡迎到[社群](https://anoni.net/docs/community/)找我們。
