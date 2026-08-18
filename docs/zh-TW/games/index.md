---
title: 互動與呈現：Tor 網路的 3D 視覺化與互動遊戲
description: 以 3D 影像與可操作的遊戲呈現隱私與匿名技術。目前三件作品都以 Tor 為題：走一遍三跳洋蔥路由的解謎、連線流量在會合點相遇的動態呈現、整合十餘份公開資料的全球中繼地球儀，後者放大到台灣還有海纜登陸點與電網。
icon: material/cube-outline
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/tor-network.png
  image_width: 2560
  image_height: 1440
---

# :material-cube-outline: 互動與呈現

這一區收錄可以操作、或單純觀看的 3D 作品，將隱私與匿名技術的概念轉為可見、可點選的畫面。全部以 three.js（WebGPU/TSL）在瀏覽器中執行，免安裝，桌機與行動裝置都能使用。目前三件作品都以 Tor 為題，後續會延伸到其他隱私主題。

## 作品

三個語言版本共用同一份程式，語言由網址參數決定，作品內也可以直接切換。

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __Tor 路由解謎__

    ---

    可操作的解謎。將訊息從你送到對岸的收件人，自行挑選 3 個中繼組成 Tor 的 guard → middle → exit 路徑，過程中要避開被監聽的節點、將 3 跳分散到不同 ASN，遇到封鎖則改走橋接。四個關卡各對應一項真實的選路考量。

    [:octicons-arrow-right-24: 看說明](onion-routing.md){ .md-button .md-button--primary }
    [開始遊戲](onion-routing/play/index.html){ .md-button }

-   :material-lan:{ .lg .middle } __Tor 連線流量__

    ---

    以觀看為主的呈現。用細小發光粒子與殘影表現 Tor 流量的兩種路徑：連線 .onion 服務時雙方各建一條 3 跳電路，在隨機挑出的會合點相遇，連線明網網站則經 3 跳出口後原路往返。relay 數、電路數、已被標記的有害節點、流量都能即時調整。

    [:octicons-arrow-right-24: 看說明](onion-rendezvous.md){ .md-button .md-button--primary }
    [開始觀看](onion-rendezvous/play/index.html){ .md-button }

-   :material-earth:{ .lg .middle } __Tor 中繼地球儀__

    ---

    以真實資料構成的地球儀。將全球正在運作的近萬台 Tor 中繼落在各自的國界之內，顏色區分 guard、middle、exit，大小對應頻寬，陸地亮度依指標上色。除了中繼分布，另外整合連線受阻觀測、使用者估計、斷網事件、海底電纜與上網人口。放大到台灣會再多出縣市界、海纜登陸點、變電所、發電廠與電網。

    [:octicons-arrow-right-24: 看說明](tor-network.md){ .md-button .md-button--primary }
    [開始探索](tor-network/play/index.html){ .md-button }

</div>

## 為什麼做成影像與遊戲

文字擅長定義與論證，卻說不清楚兩件事：順序，還有規模。

順序的部分，Tor 本身就是最好的例子。封包在三個中繼之間依序前進，每經過一跳剝除一層加密，到出口才還原成原本的請求。連線 .onion 服務時還多一層，雙方各建一條電路，在中途某台中繼相遇之後才開始交換內容。哪一層在哪一跳剝掉、每一站看得到什麼，都由這個順序決定。文字寫得再仔細，讀者腦中仍然要自行補上動起來的那一段，而每個人補出來的版本未必相同。動畫把那一段直接演示出來。

規模更難用文字傳達。「近萬台中繼，高度集中在少數國家」讀過即忘。把每一台實際標記到地球上，北美與西歐連成一片光帶、其餘地區僅零星數點，集中的程度就成為可以目視的事實。同一份數字換成畫面，讀者不必信任我們的形容詞，可以自己看。

遊戲補的是第三件事：取捨。ASN 是自治系統（Autonomous System），可以粗略理解成一個組織或個人掌管的一段網路。文件寫「三跳要分散在不同 ASN」，讀過就過去了。自行挑選三台中繼送出訊息，看著電路因為三跳落在同一個 ASN 而失敗，下一次就會記得分散的理由。

這些作品是入口，沒有要取代文件。先把抽象概念變得具體，需要細節時可以點連結回到文件，每件作品在完成或結束時都會提供對應的延伸閱讀。

## 想先閱讀文字版

以下三篇對應目前作品中出現的概念。

- 三跳路由與匿名原理：[什麼是 Tor](../tools/what-is-tor.md)
- 中繼要分散在不同 ASN：[台灣 ASN 觀測涵蓋](../taiwan/ooni-asn-coverage.md)
- 封鎖時的橋接：[Tor Snowflake 橋接](../tools/tor-snowflake.md)

## 想一起做

三件作品的原始碼都在 [anoni-net/docs](https://github.com/anoni-net/docs) 這個 repo，位置是 `docs/zh-TW/games/<作品>/play/`，三件加起來約六千三百行 JavaScript，其中地球儀佔了四千三百行。沒有建置流程，瀏覽器直接載入 ES module，改完存檔重新整理就看得到。three.js 是本地 vendor 的版本，onion 與 IPFS 版本都不依賴外部 CDN。

站上的文件內容採 [CC BY 4.0](https://github.com/anoni-net/docs/blob/main/LICENSE)，三件作品的原始碼放在 `docs/` 底下，同樣適用這份授權。地球儀用到的外部資料各自沿用原本的授權，清單在 repo 根目錄的 `NOTICE`，其中 OONI 那一份是 CC BY-NC-SA 4.0，禁止商業使用。

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
