---
title: Tor 中繼地球儀
description: 以真實資料構成的地球儀。將全球正在運作的近萬台 Tor 中繼落在各自的國界之內，另外整合連線受阻觀測、使用者估計、斷網事件、海底電纜與上網人口，放大到台灣還有縣市界、海纜登陸點、變電所、發電廠與電網。
icon: material/earth
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/tor-network.png
  image_width: 2560
  image_height: 1440
---

# :material-earth: Tor 中繼地球儀

![Tor 中繼地球儀的畫面，地球轉到亞洲一側，中繼以彩色點分布在各國界內，左側面板列出各國中繼數與托管商排行](https://assets.anoni.net/games/tor-network-globe.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

三件作品之中資料最多的一件。它把散落在不同機構的公開資料放到同一顆球上，讓「哪裡架得起中繼」與「哪裡連得上 Tor」兩件事得以並置對照。放大到台灣之後還多出一層，那些連線實際上依賴哪些實體設施。

[:octicons-arrow-right-24: 開始探索](tor-network/play/index.html){ .md-button .md-button--primary }

## 球面上有什麼

每台中繼在球面上是一個點，落在自己所屬的國界之內，顏色區分四種角色（guard、middle、exit、guard 兼 exit），大小對應頻寬。陸地的亮度另外代表一項指標，預設是中繼台數。

拖曳可以旋轉地球，滾輪或雙指放大會浮出更多國家標籤。網址加上 `#tw` 會在載入時直接飛到台灣，換成別的國碼（例如 `#jp`）同樣有效，分享連結時可以指定對方一開啟先看哪一塊。

### 陸地亮度可以換四種指標

![陸地亮度切換到共識權重之後的畫面，國家標籤改成顯示百分比，德國 29.5%、瑞典 6.1%](https://assets.anoni.net/games/tor-network-weight.webp){style="border-radius: 10px;"}

- **中繼台數**：該國託管的中繼數量
- **共識權重**：該國在 Tor 網路中實際承擔的流量比重，與台數常有明顯落差
- **單一業者集中度**：最大一家托管商佔該國的比例，用以觀察對單一業者的依賴程度
- **使用者估計**：該國使用 Tor 的人數估計，屬於需求端指標

台數與權重的落差值得切過去看一次。美國的中繼台數最多，換成共識權重，德國會排到前面，德國那批中繼單台扛的流量比較大。

### 點國家標籤展開資訊卡

![點開德國的資訊卡，列出 1715 台、佔全網 16.9%、權重 29.5%、角色組成、托管商與 OONI 測試結果](https://assets.anoni.net/games/tor-network-country.webp){style="border-radius: 10px;"}

卡片內容包含角色組成、頻寬佔比、執行官方建議版本的比例、主要托管商，以及該國在其他幾份資料中的狀況：使用者估計、OONI 的異常率、橋接繞道的 pluggable transport 分布。

## 整合了哪些資料

### 中繼分布（Onionoo，CC0 1.0）

畫面主體來自 Onionoo 的中繼快照，經蒸餾後只保留國家層級的聚合，內容不含 fingerprint、nickname、IP 或聯絡資訊。目前收錄近萬台運作中的中繼，分布於約八十個國家、九百多家托管商，其中美國、德國、荷蘭三國即佔去超過六成。這些數字取自最近一次快照，畫面上會標示該份快照的產出時間。

按下畫面上的「即時更新」後，資料改由你的瀏覽器直接向 onionoo.anoni.net 取得並重新計算，不再讀取站上的快照。這個動作會讓該伺服器看見你的 IP，因此預設不啟用，要不要開啟由你決定。

### 連線受阻的地區（OONI，CC BY-NC-SA 4.0）

取自 OONI 的 tor 測試結果，統計近 30 天各國未依預期完成的比率，OONI 稱之為 anomaly。異常的成因包含連線被阻擋、網路不穩與 ISP 故障，僅憑比率無法區分，因此畫面只標示異常率達 `85%` 以上且樣本數足夠的少數國家，中段數值一律不上色。門檻之所以訂得很高，是因為瑞士、加拿大這類沒有審查疑慮的國家，異常率也經常落在兩成上下，把中段畫出來等於用雜訊指控特定國家。受標示的國家以國界向內的紅色漸層呈現，相鄰但未受標示的國家不會被誤讀成同樣異常。

### 使用者與橋接（Tor Metrics，CC0 1.0）

包含兩份數字。一份是各國使用 Tor 的人數估計，另一份是橋接使用者數，並依 pluggable transport 分列 obfs4、snowflake、webtunnel 等項目，涵蓋兩百多個國家。兩者對照常出現有意義的落差：直連受阻的地區，橋接的數字明顯偏高。

### 斷網事件（Access Now #KeepItOn，CC BY 4.0）

`2009` 年至 `2025` 年間經人工彙整並逐筆查證的斷網事件，涵蓋五十餘國。這份資料與 OONI 的性質不同，每一筆都有查證過的成因，因此可以明確說明「此處發生過人為斷網」。武裝衝突與族群衝突造成的中斷未必出自政府決策，可能是戰事破壞基礎設施所致，畫面上與資訊管制類分開說明。

### 海底電纜與地理底圖（OpenStreetMap ODbL、Natural Earth public domain）

海面上較細的線條是海底電纜，取自 OpenStreetMap 貢獻者標註的兩百餘段路徑，收錄以歐洲、地中海與大西洋較為完整。最淡的一層是主要跨洋走廊的示意，取兩端公開的登陸地點拉出大圓弧，僅走向可信，實際路由請參考專門的海纜地圖。國界與海岸線來自 Natural Earth。

### 上網人口比例（World Bank CC BY 4.0、數位發展部 政府資料開放授權條款）

國家卡片上的上網人口比例是拿來當分母的。「這一國有幾人用 Tor」很大一部分是在比人口大小，知道該國有多少比例的人上網，才判斷得出兩國的落差來自需求還是來自基數。World Bank 那份的 208 個經濟體裡沒有台灣，台灣那一筆改用數位發展部的國家數位近用調查，兩份的方法論不同，一份是 ITU 彙整各國通報，一份是對 12 歲以上人口的電話抽樣，卡片上會標示出來，不宜直接比較。

## 放大到台灣

![地球儀放大到台灣，縣市界線與 345kV 輸電線疊在島上，中繼以彩色點集中在西半部](https://assets.anoni.net/games/tor-network-taiwan.webp){style="border-radius: 10px;"}

台灣是這顆地球儀唯一做到縣市尺度的地區，貼近之後會多出五層。左側面板把台灣相關的資訊獨立成一區，按「關注台灣」會直接飛過去。

- **縣市界線**：內政部國土測繪中心的直轄市、縣市界線，22 個縣市、84 條環線。它同時也是台灣的海岸線，全球那份的比例尺在這個尺度下不夠用，所以貼近之後粗輪廓會換成它。
- **海纜登陸點**：14 處，自建資料集。登陸點座標是 TeleGeography 商品的一部分，OpenStreetMap 也沒有收錄，所以以數位發展部公開的海纜清單為骨幹，逐點交叉查證座標，每一筆標記精度分級與各自的來源。這份 v1 並不完整，缺口寫在原始檔的檔頭。
- **變電所**：台電的二次變電所主變壓器裝置容量及負載，280 座，畫得出座標的 201 座。卡片上的容量計把 N-1 畫成看得到的幾何，可靠容量刻度到裝置容量之間那段斜紋，寬度正好是最大的一台主變壓器，故障時消失的就是那一段。全台有 64 座的尖峰負載超過可靠容量，那代表尖峰時掉一台就撐不住，跟現在有沒有過載是兩回事。
- **發電廠與 345kV 骨幹**：105 座電廠與 242 段輸電線。只有 17 座對得到座標，但那 17 座已經佔了裝置容量的七成一，對不到的多半是離岸風場與小水力。161kV 以下的配電網完全沒有畫，那不是完整電網。
- **用電與再生能源**：93 處台電自建的再生能源場址、124 個月的各縣市用電，以及今年 212 天的每日尖峰備轉容量率。

電廠、變電所、再生能源場址、登陸點與輸電線都點得開看細節。

### 用電那段可以換兩種看法

![左側面板切到工業用電佔比，新竹縣以 80.4% 排在第一，臺南市 78.5%、苗栗縣 77.9% 跟在後面](https://assets.anoni.net/games/tor-network-industry.webp){style="border-radius: 10px;"}

看售電量的話六都排在前面，換成工業用電佔比，新竹縣會跳到第一，科學園區的形狀就出來了。園區橫跨新竹市東區與新竹縣寶山鄉，行政上是分開的兩列，看總量會被切成兩半，看佔比則不受影響。

下方那排細條是今年每日的尖峰備轉容量率，低於 `10%` 的換成橘色，那是台電自己的供電吃緊門檻。

## 球上的動態

除了上面那幾份資料，畫面上還有幾層效果，這些是渲染出來的，不是外部資料。

地球的日夜分界由 UTC 時間換算出的太陽直射點決定，隨真實時間推移，四季晝長差異也會自動對應，過程不需對外連線。此外還有極光、大氣邊緣輝光與星空。

不定時出現的 Tor 三跳路徑動畫算是兩者之間：端點取自真實中繼位置，因此哪個國家較常被選中，會自然反映真實的分布，但三點的組合本身屬於示意，並未模擬 Tor 實際的選路規則。

## 資料來源與授權

每份資料檔都帶有 `source`、`sourceUrl`、`license`、`licenseUrl` 欄位，畫面下方也列有對應的來源聲明。完整的授權清單見專案根目錄的 `NOTICE`，其中 OONI 那一份是 CC BY-NC-SA 4.0，禁止商業使用。

## 延伸閱讀

- 這顆地球儀的資料怎麼來的：[地球儀的資料從哪來](../blog/posts/games-globe-open-data.md)
- 三跳路由與匿名原理：[什麼是 Tor](../tools/what-is-tor.md)
- 台灣的觀測涵蓋：[台灣 ASN 觀測涵蓋](../taiwan/ooni-asn-coverage.md)
- 其他兩件作品：[互動與呈現](index.md)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://anoni.net/docs/games/tor-network/#work",
      "name": "Tor 中繼地球儀",
      "alternateName": ["Tor Relay Globe", "Tor 中继地球仪"],
      "url": "https://anoni.net/docs/games/tor-network/play/",
      "mainEntityOfPage": "https://anoni.net/docs/games/tor-network/",
      "description": "以真實資料構成的地球儀。將全球正在運作的近萬台 Tor 中繼落在各自的國界之內，另外整合連線受阻觀測、使用者估計、斷網事件、海底電纜與上網人口，放大到台灣還有縣市界、海纜登陸點、變電所、發電廠與電網。",
      "image": "https://assets.anoni.net/games/tor-network.png",
      "inLanguage": ["zh-Hant", "zh-Hans", "en"],
      "applicationCategory": "EducationalApplication",
      "browserRequirements": "需要支援 WebGPU 或 WebGL2 的瀏覽器，免安裝",
      "isAccessibleForFree": true,
      "license": "https://github.com/anoni-net/docs/blob/main/LICENSE",
      "author": { "@id": "https://anoni.net/#organization" },
      "publisher": { "@id": "https://anoni.net/#organization" },
      "isPartOf": { "@id": "https://anoni.net/docs/games/#collection" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "文件", "item": "https://anoni.net/docs/" },
        { "@type": "ListItem", "position": 2, "name": "互動與呈現", "item": "https://anoni.net/docs/games/" },
        { "@type": "ListItem", "position": 3, "name": "Tor 中繼地球儀" }
      ]
    }
  ]
}
</script>
