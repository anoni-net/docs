---
title: 互動遊戲
description: 用可以動手玩的 3D 小遊戲理解匿名網路怎麼運作。第一個關卡帶你走一遍 Tor 的三跳洋蔥路由，看懂為什麼台灣的中繼要分散在不同 ASN，被封鎖時又怎麼靠橋接繞過去。
icon: material/gamepad-variant-outline
---

# :material-gamepad-variant-outline: 互動遊戲

這一區放可以動手玩的小東西，把匿名網路的概念變成看得到、點得到的操作。全部用 three.js（WebGPU／TSL）在瀏覽器裡跑，免安裝，桌機和手機都能玩，載入後離線也能繼續。

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __路由任務（暫名）__

    ---

    把一則訊息從你送到對岸的收件人。你要自己挑 3 個中繼，組成 Tor 的 guard → middle → exit 路徑，避開被監聽的節點、把 3 跳分散到不同 ASN，遇到封鎖時改走橋接。送出後看著封包沿路徑流動，逐跳剝掉一層加密。

    [:octicons-arrow-right-24: 開始遊戲](onion-routing/index.html){ .md-button .md-button--primary }

</div>

## 玩完會懂的事

- 為什麼 Tor 固定走 3 跳，入口和出口各自只知道一半
- 中繼由世界各地的志工營運，為什麼要分散信任、避開有問題的節點
- ASN（自治系統，網路上一群共同管理的 IP）是什麼，為什麼 3 跳擠在同一個 ASN 就失去意義
- 被審查者封鎖時，橋接（Snowflake、obfs4、WebTunnel）怎麼把你帶進網路

想先讀文字版，可以看[什麼是 Tor](../tools/what-is-tor.md)、[Tor Snowflake 橋接](../tools/tor-snowflake.md)與[台灣 ASN 觀測涵蓋](../taiwan/ooni-asn-coverage.md)。

## 接下來

這是遊戲區的第一個作品，之後會再加更多互動關卡。有想法或想一起做，歡迎到[社群](../community/index.md)找我們。
