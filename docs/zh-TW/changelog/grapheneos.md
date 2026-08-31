---
title: GrapheneOS 月度更新摘要
description: GrapheneOS 每月更新的白話整理，說明 Android 安全修補等級進度、日常會碰到的功能修補，以及機型支援變動。
icon: material/cellphone-lock
---

# :material-cellphone-lock: GrapheneOS 月度更新摘要

[GrapheneOS](../tools/grapheneos.md) 的更新整理，按月聚合。近四個月平均六天就發一版，版本號是發布日期（例如 `2026081300`），逐版看沒有意義，所以這一頁把同一個月的版本合成一則，回答三件事：這個月的 Android 安全修補等級推進到哪、有沒有修到日常會碰到的功能、機型支援有沒有變動。新的月份永遠在最上面。

GrapheneOS 走自動更新，裝置在背景就會裝好，一般使用者不需要為了這一頁做任何事。內容是給想知道背後發生什麼、或需要向團隊說明為何選這套系統的人看的。

原始資料來自[官方發布頁](https://grapheneos.org/releases){target="_blank"}。官方的 atom feed 只保留最近 20 則（大約四個月），更早的紀錄要到官網翻。

## 2026 年 8 月

> 版本 `2026080500`、`2026081300` · [官方發布頁](https://grapheneos.org/releases){target="_blank"}

- 安全修補等級推進到完整的 2026-08-05 Pixel 等級，同時更新 8 月的 Pixel 驅動與韌體程式碼。
- 核心 backport 了 CVE-2026-64560 的修補。同一個 Linux 核心漏洞 Tails 在 [7.10.1](./tails.md) 也緊急修過，在 Tails 上它可以讓 Tor Browser 內的攻擊者取得管理員權限。
- 通訊錄範圍控制（Contact Scopes）在 Android 17 上跟 WhatsApp 與沙箱化 Google Play 服務的相容問題，8 月 5 日先用暫時解法擋住，8 月 13 日換成正式做法，改用呼叫端 app 的身分執行過濾查詢。
- 8 月 13 日修掉兩個上游還沒修的漏洞：憑證管理員（CredentialManager）與 Play 服務的 FIDO 畫面都改為不透明，避免底下的畫面被疊在上面的內容看穿。GrapheneOS 自己先擋掉上游未修的問題，是它跟原廠 Android 的差別之一。
- Vanadium（GrapheneOS 內建的強化版 Chromium 瀏覽器）在 8 月連更四版，跟上 Chromium 151 系列。
- 機型涵蓋 Pixel 6 到 Pixel 10a，本月沒有變動。
- 8 月 13 日之後到月底沒有再發新版，是近四個月最長的一次間隔。

## 2026 年 7 月

> 版本 `2026070500`、`2026071100`、`2026071500`、`2026072900` · [官方發布頁](https://grapheneos.org/releases){target="_blank"}

- 安全修補等級在 7 月 11 日拉到 2026-07-05，Android 與 Pixel 兩份公告在該等級都沒有額外的修補項目。同一版更新 7 月的 Pixel 驅動與韌體程式碼。
- 位置隱私修掉一個上游 Android 的缺陷：沒有取得精確位置權限的 app，仍然可以從粗略位置讀到海拔、精確度這類次要欄位。GrapheneOS 改成只用允許清單上的欄位重建粗略位置。
- 核心的硬體記憶體標記（hardware memory tagging）抓到 USB 乙太網路 gadget 驅動的一個 double-free。GrapheneOS 預設開啟的防護實際攔下上游的錯誤，同樣的紀錄在後面幾個月還會反覆出現。
- 鎖定畫面以外的 PIN 輸入介面補上隱私強化，並修好 128 位數 PIN 在新版介面被截斷的問題。
- secure（exec）spawning 換成新實作，開關從全域改為逐 app 設定，相容性明顯改善。7 月 15 日再補上跟反竄改函式庫的相容處理，V-KEY 這類保護方案不會再被擋住。
- ContactsProvider 與電話（Telephony）各修一個上游 Android 的安全漏洞，後者的成因是缺少對 API 等級低於 30 的 app 的系統權限檢查。

## 2026 年 6 月

> 版本 `2026060100` 到 `2026062800`（八版）· [官方發布頁](https://grapheneos.org/releases){target="_blank"}

- Android 17 上線的月份。6 月 1 日先到完整的 2026-06-01 等級，6 月 18 日跟上隨 Android 17 發布的完整 2026-06-05 Pixel 等級。Android 17 對 GrapheneOS 的處境代表什麼，站上有[專文](../blog/posts/2026-grapheneos-android-17.md)討論。
- 硬體記憶體標記這個月抓到三個上游驅動的錯誤：Broadcom Wi-Fi 驅動的 use-after-free，以及 DisplayPort 驅動的兩次越界讀取。後者的成因是部分螢幕裝置沒有照 DisplayPort 規格實作。
- 網路定位（Network Location）對 Apple 與 Apple China 的定位服務也改為要求 TLSv1.3，跟 GrapheneOS 自家服務的要求一致。
- Android 17 帶來幾個行為變動：Wi-Fi 快速設定改成真的關閉 Wi-Fi，不再只是斷開目前的網路。鄰近裝置權限拆出區域網路存取，沒有針對 Android 17 改版的 app 預設仍可使用。
- 設定畫面把脅迫密碼（duress password）重新列回螢幕鎖定選單，這個功能靠有人看得到才會被用到。
