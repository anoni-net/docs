---
title: 你正在用哪一種方式閱讀
description: 文件站同時發布在標準網站、Tor Onion 與 IPFS。三份內容一樣，送到你面前的路徑不一樣，過程中誰看得到什麼也不一樣。
icon: material/routes
---

# :material-routes: 你正在用哪一種方式閱讀

文件站同時發布成三份，內容完全一樣。差別在內容怎麼送到你面前，以及過程中誰看得到什麼。頁首右上角的小標記會告訴你手上這一份是哪一種，標準網站不掛標記。

## 三種方式對照

| | 標準網站 | Onion | IPFS 鏡像 |
|---|---|---|---|
| 位址 | `anoni.net/docs` | `docs.…onion` | `ipfs.anoni.net` 或其他閘道 |
| 誰看得到你的 IP | 我們的 CDN 與主機 | 沒有人 | 你連上的閘道業者 |
| 誰知道你讀了哪幾頁 | 同上 | 沒有人 | 同上 |
| 你的網路業者看得到 | 你連了 anoni.net | 你在用 Tor | 你連了那個閘道 |
| 網站被下架時 | 讀不到 | 不受影響 | 不受影響 |
| 需要什麼 | 一般瀏覽器 | Tor Browser | 一般瀏覽器 |
| 離線閱讀 | 提供 | 不提供 | 不提供 |
| 流量統計 | 有 | 沒有 | 沒有 |

## 標準網站

走一般的網路連到 `anoni.net`，速度最快，功能最完整，[離線閱讀](../offline.md) 只有這一版提供。

代價是我們的 CDN 與主機看得到你的 IP，站上也有一份不記錄個人身分的流量統計。網域被封鎖或被處理的時候，這一版就讀不到了。

## Onion

網站直接運作在 Tor 網路裡。訪客與網站互相看不到 IP，中間不經過 DNS，也沒有憑證機構。你的網路業者只看得到你在用 Tor，看不到你連了哪個站、讀了哪一頁。

`.onion` 位址沒有憑證機構背書，核對位址本身就是唯一的驗證手段。完整位址印在每一頁的頁尾，拿它跟網址列比對，對得上就是我們的站。這一步值得養成習慣，因為相似位址的釣魚站是真實存在的手法。

這一版不載入任何分析腳本，也不註冊背景的 Service Worker，所以沒有離線閱讀。延遲比標準網站高，那是 Tor 的常態。

## IPFS 鏡像

內容用指紋（CID）定址，任何節點都能提供同一份內容，沒有單一可以被下架的位置。社群成員可以幫忙留存一份，做法見 [幫忙 pin 文件站的 IPFS 鏡像](../community/pin-ipfs-mirror.md)。

要注意的是走 IPFS 讀不會讓連線變匿名。你用的是一般瀏覽器連到一台閘道，那台閘道看得到你的 IP 與你要求的每一個位址，在網路上你看起來就是一個普通的 HTTPS 客戶端。想同時要抗下架與連線匿名，用 Tor Browser 開 Onion 版。

完整的暴露面說明見 [常被誤認為匿名的網路](../advanced/mistaken-for-anonymity.md)，發布端的設計取捨見 [去中心化網站發布](../advanced/dweb-ipfs-onion.md)。

## 怎麼選

平常閱讀用標準網站就好。

在意連線被看到，或者人在會被監看的網路環境，用 Onion 版。

標準網站連不上而手邊沒有 Tor Browser 的時候，IPFS 鏡像是讀得到內容的備援。別把它當成匿名手段。

## :fontawesome-solid-diagram-project: 相關閱讀

<div class="grid cards" markdown>

- [:material-web-box: 去中心化網站發布](../advanced/dweb-ipfs-onion.md)
- [:material-incognito: 常被誤認為匿名的網路](../advanced/mistaken-for-anonymity.md)
- [:simple-ipfs: 幫忙 pin 文件站的 IPFS 鏡像](../community/pin-ipfs-mirror.md)
- [:material-download: 離線閱讀](../offline.md)

</div>
