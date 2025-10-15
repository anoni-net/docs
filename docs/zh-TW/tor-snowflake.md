---
title: Tor Snowflake
description: 透過 WebRTC 偽裝為視訊通訊方式協助建立橋接點
icon: material/snowflake
---
# :material-snowflake: Tor Snowflake 橋接點建立（網頁版）

直接透過網頁的方式建立 Tor 橋接點，只需要一個步驟「啟用」，就可以協助無法透過傳統的 Tor 連線方式建立 onion 連線。

## 啟動 Snowflake 橋接點

<div class="grid cards" markdown>

-   <iframe src="https://snowflake.torproject.org/embed.html" width="100%" height="250" frameborder="0" scrolling="no"></iframe>

-   
    - 請直接「啟動」按鈕。
    - 此頁面可放置在分頁背景中運作。
    - 如果啟動後沒有正常運作，請檢查是否有啟用 WebRTC 功能，理論上可以建立視訊會議的瀏覽器都有支援。
    - 可透過瀏覽器套件安裝，請參考[官方頁面](https://snowflake.torproject.org/zh-TW/){target="_blank"}說明。

</div>

## 常見問題

### 什麼是 Snowflake？

Tor Snowflake 是一種用於 Tor 網路的橋接技術，主要幫助使用者繞過網際網路審查。透過全世界志工使用 WebRTC 通訊建立臨時的點對點連接，使被封鎖或受限制的使用者能夠訪問被阻擋的網站和服務。

### Snowflake 如何運作？

Snowflake 使用一種叫做 WebRTC 的技術，這項技術通常被應用在視訊會議軟體中。它的運作方式是讓你的 Tor 使用看起來像是在進行音訊或視訊通話，以此方式來掩蓋並避開網路上的審查。

### 我可以使用瀏覽器擴充套件來繞過審查嗎？

如果你想繞過審查，你需要下載一個使用 Tor 技術的應用程式，像是 Tor Browser 或 Orbot。如果應用程式無法連線，並且看起來連線仍然被阻擋，你可以到應用程式的設定中，啟用 Snowflake 來協助解除封鎖。
