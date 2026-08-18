---
title: Tor 路由解謎
description: 可操作的解謎。自行挑選 3 個中繼組成 Tor 的 guard、middle、exit 路徑，避開被監聽的節點、把 3 跳分散到不同 ASN，遇到封鎖改走橋接。四個關卡各對應一項真實的選路考量。
icon: material/shuffle-variant
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/onion-routing.png
  image_width: 2560
  image_height: 1440
---

# :material-shuffle-variant: Tor 路由解謎

![Tor 路由解謎的起始盤面，左側是寄件端，右側是收件人，中間浮著五個顏色不同的中繼](https://assets.anoni.net/games/onion-routing-board.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

把訊息從左邊的你送到右邊的收件人，中間要自己挑 3 個中繼組成路徑。四個關卡各擋一次，每一關擋的都是 Tor 選路時真的要處理的一項限制。

[:octicons-arrow-right-24: 開始遊戲](onion-routing/play/index.html){ .md-button .md-button--primary }

## 怎麼玩

畫面上浮著的球是中繼，顏色代表它所在的 ASN。依序點三個，就會照點選順序組成 guard、middle、exit 三跳，再點一次可以取消。拖曳能旋轉視角，滾輪或雙指縮放。挑好之後按「送出訊息」，訊息會沿著你畫出的路徑走一遍。

![選好三跳之後的畫面，一條曲線從寄件端串過三個中繼連到收件人，下方顯示台灣 AS3462、日本 AS2914、荷蘭 AS16276](https://assets.anoni.net/games/onion-routing-path.webp){style="border-radius: 10px;"}

下方三格會顯示每一跳落在哪裡與它的 ASN。三跳都填滿才送得出去，路徑不合規則的話會擋下來並說明原因。

## 四個關卡在教什麼

### 關卡 1：三跳的基本

任意 3 台都算合法，先熟悉操作。Tor 的預設電路長度就是 3 跳，這個數字在匿名性與延遲之間取平衡：少一跳，入口與出口之間少一層隔離。多一跳，延遲增加而匿名性沒有等比例提升。

### 關卡 2：避開監聽

盤面上出現紅色的中繼，代表已知被監聽。挑一條完全避開紅色的路徑。實際的 Tor 沒有這種明確標記，目錄伺服器只會標記行為異常或已知有害的中繼，一般使用者看不到「這台正在被誰監看」。這一關把那個資訊直接畫出來，方便先建立「路徑上每一站都看得到一部分」的直覺。

### 關卡 3：三跳要分散到不同 ASN

![三跳全挑了台灣的中繼，三格都顯示台灣 AS3462，下方紅字說明這 3 跳沒有分散到 3 個不同的 ASN](https://assets.anoni.net/games/onion-routing-asn.webp){style="border-radius: 10px;"}

同色代表同一個 ASN。ASN 是自治系統（Autonomous System），可以粗略理解成一個組織或個人掌管的一段網路。三跳落在同一個 ASN 的話，對手只要盯住那一個 ASN，就同時看得到入口與出口的流量，中間繞了幾站都沒有意義。

文件寫「三跳要分散在不同 ASN」，讀過就過去了。自己選一次、被擋一次，下次就會記得原因。真實的 Tor 客戶端預設會避開同一個 `/16` 網段與同一個 family 的中繼，實際的判斷比這一關嚴格。

### 關卡 4：封鎖時走橋接

![關卡 4 的盤面，兩個中繼被紅圈標記為封鎖，左側出現兩個菱形的橋接節點](https://assets.anoni.net/games/onion-routing-bridge.webp){style="border-radius: 10px;"}

直連的入口被封鎖了，畫面上用紅圈標出來，第一跳必須改用菱形的橋接節點。橋接是沒有公開在目錄裡的入口，封鎖方拿不到完整清單，所以擋不乾淨。盤面上兩個橋接分別標了 Snowflake 與 obfs4，那是兩種 pluggable transport，差別在於流量偽裝成什麼樣子。

## 跟真實的 Tor 差在哪

這是一個解謎，不是模擬器。幾個刻意簡化的地方：

- 真實的選路由客戶端自動完成，使用者不會逐台挑。guard 還會固定使用數個月，減少反覆更換入口帶來的曝險
- 盤面上一關只有五到八台中繼，實際的網路有近萬台
- 中繼的頻寬與共識權重會影響被選中的機率，這裡沒有模擬
- 「被監聽」在畫面上是明確標記，實務上沒有這種提示

三個語言版本共用同一份程式，語言由網址參數決定，作品內也可以直接切換。

## 延伸閱讀

- 三跳路由與匿名原理：[什麼是 Tor](../tools/what-is-tor.md)
- 中繼分散與 ASN：[台灣 ASN 觀測涵蓋](../taiwan/ooni-asn-coverage.md)
- 封鎖時的橋接：[Tor Snowflake 橋接](../tools/tor-snowflake.md)
- 其他兩件作品：[互動與呈現](index.md)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "VideoGame",
      "@id": "https://anoni.net/docs/games/onion-routing/#work",
      "name": "Tor 路由解謎",
      "alternateName": ["Tor Routing Puzzle", "Tor 路由解谜"],
      "url": "https://anoni.net/docs/games/onion-routing/play/",
      "mainEntityOfPage": "https://anoni.net/docs/games/onion-routing/",
      "description": "可操作的解謎。自行挑選 3 個中繼組成 Tor 的 guard、middle、exit 路徑，避開被監聽的節點、將 3 跳分散到不同 ASN，遇到封鎖則改走橋接。四個關卡各對應一項真實的選路考量。",
      "image": "https://assets.anoni.net/games/onion-routing.png",
      "inLanguage": ["zh-Hant", "zh-Hans", "en"],
      "genre": ["解謎", "教育"],
      "applicationCategory": "GameApplication",
      "gamePlatform": "Web browser",
      "playMode": "SinglePlayer",
      "browserRequirements": "需要支援 WebGPU 或 WebGL2 的瀏覽器，免安裝",
      "isAccessibleForFree": true,
      "isFamilyFriendly": true,
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
        { "@type": "ListItem", "position": 3, "name": "Tor 路由解謎" }
      ]
    }
  ]
}
</script>
