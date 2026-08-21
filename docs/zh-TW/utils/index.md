---
title: 小工具
description: 在瀏覽器裡直接跑的小工具，全部不送出任何資料，存進裝置之後沒有網路也能用。
icon: material/tools
---

# :material-tools: 小工具

站上的文章說明怎麼保護自己，這一區放的是可以直接按的東西。共同的規則有三條：

- 全部在你的瀏覽器裡運算，不送出任何資料
- 存進裝置之後沒有網路也能用，斷網可用本身就是「沒有偷送東西」的證明
- 原始碼在 [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"}，看得懂的人可以自己驗

## 目前有的

<div class="grid cards" markdown>

-   :material-dice-multiple-outline: **[密語與密碼產生器](passphrase.md)**

    用 asian-diceware 的 7776 字詞表抽密語，或從你選的字元集抽隨機密碼。亂數來自瀏覽器的 `crypto.getRandomValues`，並且會告訴你這組密碼的熵有多少。

-   :material-qrcode: **[QR code 產生器](qrcode.md)**

    把 onion 網址、Tor bridge 這類很長又容易打錯的字串變成 QR code，讓眼前的人用相機讀走，中間不經過任何伺服器。可以下載成 SVG 印出來。

-   :material-eye-outline: **[你的瀏覽器透露了什麼](leaks.md)**

    列出任何網站不必問你就拿得到的資訊，並標出 Tor Browser 會把哪些統一掉。換個瀏覽器再看一次，就知道那些防護實際上做了什麼。

</div>

## 要離線帶著走

這些工具的程式與資料會跟頁面一起存下來。在[離線閱讀](../offline.md)的清單裡勾起這一區的頁面，之後沒有網路也打得開。

## 沒有收進來的東西

需要連到外部服務才能運作的功能不會放在這裡，那跟「離線可用」與「不送出資料」兩條規則衝突。網路測量請用 [OONI Probe](../tools/what-is-ooni.md)，那是設計來做這件事的工具，資料的處理方式也公開。
