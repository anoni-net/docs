---
title: 互動與呈現
description: 用可以動手玩、或看資料動起來的 3D 小畫面理解匿名網路。有帶你走一遍 Tor 三跳洋蔥路由的解謎，有模擬 Tor 連線流量在會合點相遇的動態呈現，也有把全球近萬台真實 Tor 中繼標在地球上的網路現況。
icon: material/cube-outline
---

# :material-cube-outline: 互動與呈現

這一區放可以動手玩、或單純看著它動的 3D 小畫面，把匿名網路的概念變成看得到、點得到的東西。全部用 three.js（WebGPU/TSL）在瀏覽器裡跑，免安裝，桌機和手機都能玩。

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __路由任務（暫名）__

    ---

    動手玩的解謎。把訊息從你送到對岸的收件人，自己挑 3 個中繼組成 Tor 的 guard → middle → exit 路徑，避開監聽、把 3 跳分散到不同 ASN，遇到封鎖改走橋接。

    [:octicons-arrow-right-24: 開始遊戲](onion-routing/index.html){ .md-button .md-button--primary }

-   :material-lan:{ .lg .middle } __Tor 連線流量__

    ---

    看的呈現。用細小發光粒子與殘影表現 Tor 流量的兩種路徑：連 .onion 服務在隨機會合點相遇，連明網網站則經 3 跳出口後原路往返。relay 數、電路數、有害節點、流量都可即時調控。

    [:octicons-arrow-right-24: 開始觀看](onion-rendezvous/index.html){ .md-button .md-button--primary }

-   :material-earth:{ .lg .middle } __Tor 中繼地球儀__

    ---

    看真實資料。把全球正在運作的近萬台 Tor 中繼標在地球上，顏色分 guard、middle、exit，大小分頻寬，一眼看出網路高度集中在少數國家與網段。資料取自 Onionoo。

    [:octicons-arrow-right-24: 開始探索](tor-network/index.html){ .md-button .md-button--primary }

</div>

## 想先讀文字版

- 三跳路由與匿名原理：[什麼是 Tor](../tools/what-is-tor.md)
- 中繼要分散在不同 ASN：[台灣 ASN 觀測涵蓋](../taiwan/ooni-asn-coverage.md)
- 封鎖時的橋接：[Tor Snowflake 橋接](../tools/tor-snowflake.md)

## 接下來

這是互動區的頭三個作品，之後會再加更多。有想法或想一起做，歡迎到[社群](../community/index.md)找我們。
