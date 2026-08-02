---
title: 互動與呈現：Tor 網路的 3D 視覺化與互動遊戲
description: 以 3D 影像與可操作的遊戲呈現隱私與匿名技術。目前三件作品都以 Tor 為題：走一遍三跳洋蔥路由的解謎、連線流量在會合點相遇的動態呈現、整合十餘份公開資料的全球中繼地球儀，後者放大到台灣還有海纜登陸點與電網。
icon: material/cube-outline
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/tor-network.png
  image_width: 2993
  image_height: 1713
---

# :material-cube-outline: 互動與呈現

這一區收錄可以操作、或單純觀看的 3D 作品，將隱私與匿名技術的概念轉為可見、可點選的畫面。全部以 three.js（WebGPU/TSL）在瀏覽器中執行，免安裝，桌機與行動裝置都能使用。目前三件作品都以 Tor 為題，後續會延伸到其他隱私主題。

## 作品

三個語言版本共用同一份程式，語言由網址參數決定，作品內也可以直接切換。

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __Tor 路由解謎__

    ---

    可操作的解謎。將訊息從你送到對岸的收件人，自行挑選 3 個中繼組成 Tor 的 guard → middle → exit 路徑，過程中要避開被監聽的節點、將 3 跳分散到不同 ASN，遇到封鎖則改走橋接。四個關卡各對應一項真實的選路考量。

    [:octicons-arrow-right-24: 開始遊戲](onion-routing/index.html){ .md-button .md-button--primary }

-   :material-lan:{ .lg .middle } __Tor 連線流量__

    ---

    以觀看為主的呈現。用細小發光粒子與殘影表現 Tor 流量的兩種路徑：連線 .onion 服務時雙方各建一條 3 跳電路，在隨機挑出的會合點相遇，連線明網網站則經 3 跳出口後原路往返。relay 數、電路數、已被標記的有害節點、流量都能即時調整。

    [:octicons-arrow-right-24: 開始觀看](onion-rendezvous/index.html){ .md-button .md-button--primary }

-   :material-earth:{ .lg .middle } __Tor 中繼地球儀__

    ---

    以真實資料構成的地球儀。將全球正在運作的近萬台 Tor 中繼落在各自的國界之內，顏色區分 guard、middle、exit，大小對應頻寬，陸地亮度依指標上色。除了中繼分布，另外整合連線受阻觀測、使用者估計、斷網事件、海底電纜與上網人口。放大到台灣會再多出縣市界、海纜登陸點、變電所、發電廠與電網。

    [:octicons-arrow-right-24: 開始探索](tor-network/index.html){ .md-button .md-button--primary }

</div>

## 為什麼做成影像與遊戲

文字擅長定義與論證，卻說不清楚兩件事：順序，還有規模。

順序的部分，Tor 本身就是最好的例子。封包在三個中繼之間依序前進，每經過一跳剝除一層加密，到出口才還原成原本的請求。連線 .onion 服務時還多一層，雙方各建一條電路，在中途某台中繼相遇之後才開始交換內容。哪一層在哪一跳剝掉、每一站看得到什麼，都由這個順序決定。文字寫得再仔細，讀者腦中仍然要自行補上動起來的那一段，而每個人補出來的版本未必相同。動畫把那一段直接演示出來。

規模更難用文字傳達。「近萬台中繼，高度集中在少數國家」讀過即忘。把每一台實際標記到地球上，北美與西歐連成一片光帶、其餘地區僅零星數點，集中的程度就成為可以目視的事實。同一份數字換成畫面，讀者不必信任我們的形容詞，可以自己看。

遊戲補的是第三件事：取捨。ASN 是自治系統（Autonomous System），可以粗略理解成一個組織或個人掌管的一段網路。文件寫「三跳要分散在不同 ASN」，讀過就過去了。自行挑選三台中繼送出訊息，看著電路因為三跳落在同一個 ASN 而失敗，下一次就會記得分散的理由。

這些作品是入口，沒有要取代文件。先把抽象概念變得具體，需要細節時可以點連結回到文件，每件作品在完成或結束時都會提供對應的延伸閱讀。

## 地球儀整合了哪些資料

三件作品之中，地球儀整合的資料最多。它把散落在不同機構的公開資料放到同一顆球上，讓「哪裡架得起中繼」與「哪裡連得上 Tor」兩件事得以並置對照。放大到台灣之後還多出一層，那些連線實際上依賴哪些實體設施。

### 中繼分布（Onionoo，CC0 1.0）

畫面主體來自 Onionoo 的中繼快照，經蒸餾後只保留國家層級的聚合，內容不含 fingerprint、nickname、IP 或聯絡資訊。目前收錄近萬台運作中的中繼，分布於約八十個國家、九百多家托管商，其中美國、德國、荷蘭三國即佔去超過六成。這些數字取自最近一次快照，畫面上會標示該份快照的產出時間。

每台中繼在球面上是一個點，顏色區分四種角色（guard、middle、exit、guard 兼 exit），大小對應頻寬。陸地亮度可切換四種指標：

- **中繼台數**：該國託管的中繼數量
- **共識權重**：該國在 Tor 網路中實際承擔的流量比重，與台數常有明顯落差
- **單一業者集中度**：最大一家托管商佔該國的比例，用以觀察對單一業者的依賴程度
- **使用者估計**：該國使用 Tor 的人數估計，屬於需求端指標

點選任一國家會展開資訊卡，內容包含角色組成、頻寬佔比、執行官方建議版本的比例、主要托管商，以及該國在其他幾份資料中的狀況。

按下畫面上的「即時更新」後，資料改由你的瀏覽器直接向 onionoo.anoni.net 取得並重新計算，不再讀取站上的快照。這個動作會讓該伺服器看見你的 IP，因此預設不啟用，要不要開啟由你決定。

### 連線受阻的地區（OONI，CC BY-NC-SA 4.0）

取自 OONI 的 tor 測試結果，統計近 30 天各國未依預期完成的比率，OONI 稱之為 anomaly。異常的成因包含連線被阻擋、網路不穩與 ISP 故障，僅憑比率無法區分，因此畫面只標示異常率達 `85%` 以上且樣本數足夠的少數國家，中段數值一律不上色。門檻訂在這個高度，是因為瑞士、加拿大這類沒有審查疑慮的國家，異常率也經常落在兩成上下，把中段畫出來等於用雜訊指控特定國家。受標示的國家以國界向內的紅色漸層呈現，相鄰但未受標示的國家不會被誤讀成同樣異常。

### 使用者與橋接（Tor Metrics，CC0 1.0）

包含兩份數字。一份是各國使用 Tor 的人數估計，另一份是橋接使用者數，並依 pluggable transport 分列 obfs4、snowflake、webtunnel 等項目，涵蓋兩百多個國家。兩者對照常出現有意義的落差：直連受阻的地區，橋接的數字明顯偏高。

### 斷網事件（Access Now #KeepItOn，CC BY 4.0）

`2009` 年至 `2025` 年間經人工彙整並逐筆查證的斷網事件，涵蓋五十餘國。這份資料與 OONI 的性質不同，每一筆都有查證過的成因，因此可以明確說明「此處發生過人為斷網」。武裝衝突與族群衝突造成的中斷未必出自政府決策，可能是戰事破壞基礎設施所致，畫面上與資訊管制類分開說明。

### 海底電纜與地理底圖（OpenStreetMap ODbL、Natural Earth public domain）

海面上較細的線條是海底電纜，取自 OpenStreetMap 貢獻者標註的兩百餘段路徑，收錄以歐洲、地中海與大西洋較為完整。最淡的一層是主要跨洋走廊的示意，取兩端公開的登陸地點拉出大圓弧，僅走向可信，實際路由請參考專門的海纜地圖。國界與海岸線來自 Natural Earth。

### 上網人口比例（World Bank CC BY 4.0、數位發展部 政府資料開放授權條款）

國家卡片上的上網人口比例是拿來當分母的。「這一國有幾人用 Tor」很大一部分是在比人口大小，知道該國有多少比例的人上網，才判斷得出兩國的落差來自需求還是來自基數。World Bank 那份的 208 個經濟體裡沒有台灣，台灣那一筆改用數位發展部的國家數位近用調查，兩份的方法論不同，一份是 ITU 彙整各國通報，一份是對 12 歲以上人口的電話抽樣，卡片上會標示出來，不宜直接比較。

### 台灣的基礎設施（政府資料開放授權條款、OpenStreetMap ODbL）

放大到台灣會再多出五層，那是這顆地球儀唯一做到縣市尺度的地區。

- **縣市界線**：內政部國土測繪中心的直轄市、縣市界線，22 個縣市、84 條環線。它同時也是台灣的海岸線，全球那份的比例尺在這個尺度下不夠用，所以貼近之後粗輪廓會換成它。
- **海纜登陸點**：14 處，自建資料集。登陸點座標是 TeleGeography 商品的一部分，OpenStreetMap 沒有收錄這份資料，所以以數位發展部公開的海纜清單為骨幹，逐點交叉查證座標，每一筆標記精度分級與各自的來源。這份 v1 並不完整，缺口寫在原始檔的檔頭。
- **變電所**：台電的二次變電所主變壓器裝置容量及負載，280 座，畫得出座標的 201 座。卡片上的容量計把 N-1 畫成看得到的幾何，可靠容量刻度到裝置容量之間那段斜紋，寬度正好是最大的一台主變壓器，故障時消失的就是那一段。全台有 64 座的尖峰負載超過可靠容量，那代表尖峰時掉一台就撐不住，跟現在有沒有過載是兩回事。
- **發電廠與 345kV 骨幹**：105 座電廠與 242 段輸電線。只有 17 座對得到座標，但那 17 座已經佔了裝置容量的七成一，對不到的多半是離岸風場與小水力。161kV 以下的配電網完全沒有畫，那不是完整電網。
- **用電與再生能源**：93 處台電自建的再生能源場址、124 個月的各縣市用電，以及今年 212 天的每日尖峰備轉容量率。用電那段可以切換總用電量與工業用電佔比兩種看法，換成後者，科學園區的形狀就出來了。

左側面板把台灣相關的資訊獨立成一區，按「關注台灣」會直接飛過去。網址加上 `#tw` 是同一件事，分享連結時可以指定對方一開啟先看哪一塊，換成別的國碼（例如 `#jp`）同樣有效。電廠、變電所、再生能源場址、登陸點與輸電線都點得開看細節。

每份資料檔都帶有 `source`、`sourceUrl`、`license`、`licenseUrl` 欄位，畫面下方也列有對應的來源聲明。完整的授權清單見專案根目錄的 `NOTICE`。

## 地球儀上的動態

除了上面那幾份資料，畫面上還有幾層效果，這些是渲染出來的，不是外部資料。

地球的日夜分界由 UTC 時間換算出的太陽直射點決定，隨真實時間推移，四季晝長差異也會自動對應，過程不需對外連線。此外還有極光、大氣邊緣輝光與星空。

不定時出現的 Tor 三跳路徑動畫算是兩者之間：端點取自真實中繼位置，因此哪個國家較常被選中，會自然反映真實的分布，但三點的組合本身屬於示意，並未模擬 Tor 實際的選路規則。

## 想先閱讀文字版

以下三篇對應目前作品中出現的概念。

- 三跳路由與匿名原理：[什麼是 Tor](../tools/what-is-tor.md)
- 中繼要分散在不同 ASN：[台灣 ASN 觀測涵蓋](../taiwan/ooni-asn-coverage.md)
- 封鎖時的橋接：[Tor Snowflake 橋接](../tools/tor-snowflake.md)

## 想一起做

三件作品的原始碼都在 [anoni-net/docs](https://github.com/anoni-net/docs) 這個 repo，位置是 `docs/zh-TW/games/`，三件加起來約六千三百行 JavaScript，其中地球儀佔了四千三百行。沒有建置流程，瀏覽器直接載入 ES module，改完存檔重新整理就看得到。three.js 是本地 vendor 的版本，onion 與 IPFS 版本都不依賴外部 CDN。

站上的文件內容採 [CC BY 4.0](https://github.com/anoni-net/docs/blob/main/LICENSE)，這三件作品的原始碼放在 `docs/` 底下，同樣適用這份授權。地球儀用到的外部資料各自沿用原本的授權，清單在 repo 根目錄的 `NOTICE`，其中 OONI 那一份是 CC BY-NC-SA 4.0，禁止商業使用。

會 JavaScript 就能改文案、關卡設計與互動邏輯，動到畫面呈現則需要一些 three.js 或 WebGPU 的經驗。產生資料的十四支 `gen_*.py` 在 `tools/` 底下，只用 Python 標準庫加 curl，不引入 GIS 套件，連縣市界的 SHP 都是用 `struct` 自己解的。同一個目錄另有四支回歸測試，把函式從 `atlas.js` 原地抽出來重放事件或開 headless Chrome 量版面，改到相關的地方時 CI 會執行它們。另有修正海纜走廊座標的輔助腳本與發布資料用的 shell 腳本，都不需要額外安裝套件。

## 接下來

這是互動區的頭三件作品，主題集中在 Tor。隱私領域中值得做成畫面的題材仍然很多，中繼資料會洩漏什麼、威脅模型如何隨處境改變、匿名支付的金流樣貌，都在候補名單上。有想法或想一起參與，歡迎到[社群](../community/index.md)找我們。

<!-- 結構化資料。三件作品的 index.html 不經 mkdocs 模板，各自在 head 寫了自己的
     JSON-LD，並用 isPartOf 指向這裡的 #collection。這一段補上另一半：把三件作品
     列成 ItemList，讓搜尋引擎知道它們同屬一個系列。@id 兩邊必須一致。 -->

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://anoni.net/docs/games/#collection",
      "name": "互動與呈現",
      "url": "https://anoni.net/docs/games/",
      "description": "以 3D 影像與可操作的遊戲呈現隱私與匿名技術。目前三件作品都以 Tor 為題，其中地球儀整合十餘份公開資料。",
      "inLanguage": "zh-Hant",
      "publisher": { "@id": "https://anoni.net/#organization" },
      "mainEntity": { "@id": "https://anoni.net/docs/games/#works" }
    },
    {
      "@type": "ItemList",
      "@id": "https://anoni.net/docs/games/#works",
      "name": "作品",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "VideoGame",
            "@id": "https://anoni.net/docs/games/onion-routing/#work",
            "name": "Tor 路由解謎",
            "url": "https://anoni.net/docs/games/onion-routing/",
            "image": "https://assets.anoni.net/games/onion-routing.png",
            "description": "可操作的解謎。自行挑選 3 個中繼組成 Tor 的 guard、middle、exit 路徑，避開被監聽的節點、將 3 跳分散到不同 ASN，遇到封鎖則改走橋接。"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "WebApplication",
            "@id": "https://anoni.net/docs/games/onion-rendezvous/#work",
            "name": "Tor 連線流量",
            "url": "https://anoni.net/docs/games/onion-rendezvous/",
            "image": "https://assets.anoni.net/games/onion-rendezvous.png",
            "applicationCategory": "EducationalApplication",
            "description": "以觀看為主的呈現。用發光粒子與殘影表現 Tor 流量的兩種路徑，連線 .onion 服務時雙方各建一條 3 跳電路，在隨機挑出的會合點相遇。"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "WebApplication",
            "@id": "https://anoni.net/docs/games/tor-network/#work",
            "name": "Tor 中繼地球儀",
            "url": "https://anoni.net/docs/games/tor-network/",
            "image": "https://assets.anoni.net/games/tor-network.png",
            "applicationCategory": "EducationalApplication",
            "description": "以真實資料構成的地球儀。將全球正在運作的近萬台 Tor 中繼落在各自的國界之內，另外整合連線受阻觀測、使用者估計、斷網事件、海底電纜與上網人口，放大到台灣還有縣市界、海纜登陸點、變電所、發電廠與電網。"
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "文件", "item": "https://anoni.net/docs/" },
        { "@type": "ListItem", "position": 2, "name": "互動與呈現" }
      ]
    }
  ]
}
</script>
