---
title: Tor 連線流量：連 .onion 與連明網，兩種路徑長得不一樣
description: 以觀看為主的呈現。用發光粒子與殘影表現 Tor 流量的兩種路徑，連線 .onion 服務時雙方各建一條 3 跳電路在會合點相遇，連線明網網站則經 3 跳出口後原路往返。
icon: material/lan
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/onion-rendezvous.png
  image_width: 2990
  image_height: 1706
---

# :material-lan: Tor 連線流量

![Tor 連線流量的畫面，多條發光曲線在深色背景中交織，白色的會合點與紅色的有害節點散布其間](https://assets.anoni.net/games/onion-rendezvous-flow.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

不用操作也能看的一件作品。畫面上呈現的是 Tor 的兩種流量路徑，用細小的發光粒子與殘影畫出來，看得出封包在哪幾站之間移動。

[:octicons-arrow-right-24: 開始觀看](onion-rendezvous/play/index.html){ .md-button .md-button--primary }

## 兩種路徑

兩種流量都走 3 跳中繼，差別在後半段。

連線 .onion 服務時，你和服務各自建一條 3 跳電路，在隨機挑出的會合點相遇，全程共 6 跳。會合點只負責轉送，看不到雙方交換的內容，兩邊也都不知道對方的真實位置。畫面上這一種是你的電路走青色、服務的電路走紫色，交會的那個白點就是會合點。

連線明網網站時只有一條電路。你走 3 跳到出口，出口直接連上網站，回應再原路傳回。畫面上這一種走綠色，回程帶亮頭的彗星代表回應正在傳回。

紅色的是已經被標記的有害節點，電路會繞開它們。

## 可以調的四項

左下角的滑桿即時生效，改了畫面立刻跟著變：

- **relay 節點**：場上有幾台中繼可選
- **電路數**：同時有幾條連線在運作
- **有害節點**：紅色節點的數量，看電路怎麼繞
- **流量**：粒子的密度與速度

點畫面任一處會多加一條連線，拖曳可以平移，滾輪或雙指縮放。

## 跟真實的 Tor 差在哪

作品內的說明區也列了同一份，這裡整理成三點。

介紹點被省略了。實際上服務會先把介紹點清單發布出去，你連線前要先查到這份清單，挑好會合點，再透過介紹點悄悄告知服務。畫面為了乾淨，把介紹點與查詢的過程整段拿掉。

每條連線的 3 跳都重新抽選。實際使用時你的入口節點（Guard）會固定用上數週才換，只有中間與出口常常變動。畫面上全部重抽是為了同時呈現很多條。

紅色節點代表已經被標記出問題的中繼。真實的 Tor 選路徑只排除已經被標記的節點，還沒被抓到的惡意中繼一樣可能被選中。Tor 的安全靠的是把路徑拆開，讓任何一方都無法同時看到你是誰與你在連什麼。

## 延伸閱讀

- 三跳路由與匿名原理：[什麼是 Tor](../tools/what-is-tor.md)
- 封鎖時的橋接：[Tor Snowflake 橋接](../tools/tor-snowflake.md)
- 其他兩件作品：[互動與呈現](index.md)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://anoni.net/docs/games/onion-rendezvous/#work",
      "name": "Tor 連線流量",
      "alternateName": ["Tor Traffic Flow", "Tor 连线流量"],
      "url": "https://anoni.net/docs/games/onion-rendezvous/play/",
      "mainEntityOfPage": "https://anoni.net/docs/games/onion-rendezvous/",
      "description": "以觀看為主的呈現。用發光粒子與殘影表現 Tor 流量的兩種路徑，連線 .onion 服務時雙方各建一條 3 跳電路，在隨機挑出的會合點相遇。",
      "image": "https://assets.anoni.net/games/onion-rendezvous.png",
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
        { "@type": "ListItem", "position": 3, "name": "Tor 連線流量" }
      ]
    }
  ]
}
</script>
