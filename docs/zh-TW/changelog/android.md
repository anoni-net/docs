---
title: Android 安全修補等級
description: Android 每月安全修補等級的整理，說明怎麼查自己的裝置落後多少，以及 2026 年 7 月起公開公告不再列出漏洞明細的影響。
icon: material/android
---

# :material-android: Android 安全修補等級

Android 每月安全更新的整理。這一頁的做法跟 [iOS](./ios.md)、[macOS](./macos.md)、[Windows](./windows.md) 那幾頁不同，原因寫在下一節。新的月份永遠在最上面。

## 這一頁為什麼沒有急迫程度分級

Google 的 Android 安全公告在 2026 年 7 月出現變化，公開頁面不再列出漏洞明細。2026 年 6 月的公告還有 119 個 CVE，分成 Framework、System、Kernel 與各家晶片廠等分節，每一條都標了類型與嚴重度。7 月與 8 月的頁面只剩說明文字，連「明細表的 Type 欄位代表什麼」這種樣板解釋都還留著，那張表格本身卻不在頁面上。用瀏覽器完整渲染過也一樣，所以缺的是內容本身。

沒有明細就無法判斷「這個月有沒有正在被實際利用的漏洞」，而那正是 iOS 與 Windows 那兩頁分級的依據。與其用不確定的資料硬做分級，這一頁改成追三件可以確定的事：每月的修補等級推進到哪、涵蓋多少 CVE 與嚴重度分佈、你的裝置落後多少。

底下每則的 CVE 數字來自 [GrapheneOS 的發布說明](https://grapheneos.org/releases){target="_blank"}，但它代表的東西需要說明清楚。GrapheneOS 會發 security preview release，提前套用 Google 排定在未來幾個月才公告的修補，發布說明裡的「List of additional fixed CVEs」就是那批提前修好的清單，會逐版累積。所以那個數字是「GrapheneOS 已經比官方排程早修好多少」，不是「這個月官方公告涵蓋多少」。後者在 7 月之後拿不到，因為明細不再公開。

## 先查自己的裝置落後多少

Android 裝置的實際修補等級由手機廠決定，跟 Google 公告的日期不是同一件事。位置在設定、關於手機、Android 安全性更新，各家介面名稱略有差異，顯示的是一個像 `2026-08-05` 的日期。

怎麼看那個日期：

- 落後一個月以內屬於正常，各廠都需要時間整合與測試。
- 落後三個月以上，代表這段期間公開的漏洞在你的裝置上都還沒補。Android 的漏洞公開之後細節會進 AOSP，攻擊方跟防守方取得的是同一份資料。
- 完全停止更新的裝置，已知漏洞不會再有修補。處理敏感聯絡或採訪工作的話，該考慮換機或改裝仍在維護的系統。

原廠支援期長短差很多，買之前查清楚該型號的承諾支援年限，比買了之後才發現划算。

## 2026 年 8 月

> 修補等級 2026-08-05 · [Google 公告](https://source.android.com/docs/security/bulletin/2026/2026-08-01){target="_blank"} · [GrapheneOS 發布頁](https://grapheneos.org/releases){target="_blank"}

- 到 8 月 13 日那版為止，GrapheneOS 已經提前修好 196 個尚未正式公告的 CVE（34 個 Critical、160 個 High、2 個未分類），涵蓋 Google 排定在 2026 年 9 月到 2027 年 1 月公告的內容。
- Google 的公開公告沒有明細，看不出這些修補落在哪些元件，也看不出有沒有正在被利用的項目。
- GrapheneOS 在同一個月另外修掉兩個上游還沒處理的漏洞，把憑證管理員與 Play 服務的 FIDO 畫面改為不透明，詳見 [GrapheneOS 月度更新摘要](./grapheneos.md)。

## 2026 年 7 月

> 修補等級 2026-07-05 · [Google 公告](https://source.android.com/docs/security/bulletin/2026/2026-07-01){target="_blank"} · [GrapheneOS 發布頁](https://grapheneos.org/releases){target="_blank"}

- 到 7 月 29 日那版為止，提前修好的累積到 165 個（30 個 Critical、130 個 High、5 個未分類）。
- 明細從這個月開始消失。往前一個月還有完整的分節與類型標示，往後就只剩摘要。
- 這個等級在 Android 與 Pixel 兩份公告裡都沒有額外的修補項目，屬於例行推進。

## 2026 年 6 月

> 修補等級 2026-06-01 與 2026-06-05 · [Google 公告](https://source.android.com/docs/security/bulletin/2026/2026-06-01){target="_blank"} · [GrapheneOS 發布頁](https://grapheneos.org/releases){target="_blank"}

- 這是最後一個公開明細完整的月份，Google 公告列出 119 個 CVE。
- **CVE-2025-48595** 被標為可能正在被有限、針對性地利用。它在 Framework 元件，類型是提權（讓程式取得比原本更高的系統權限），嚴重度 High，影響 Android 14、15、16 與 16-qpr2。Google 用「有限、針對性」這個說法時，背後通常是商業間諜軟體對特定對象發動的攻擊，記者與人權工作者是常見的目標。**工作性質屬於這一類的人，請比照其他頁面的「立刻」處理**：確認自己的裝置修補等級已經到 2026-06-05 或更新，沒到就先別用它處理敏感聯絡。
- 元件分佈的前五大類：System 37 個、Framework 30 個、Qualcomm 閉源元件 19 個、Unisoc 16 個、MediaTek 11 個。其餘散在 Kernel、Imagination 與 Qualcomm 非閉源元件。
- 類型分佈：提權 40 個、阻斷服務 21 個、資訊外洩 6 個、遠端執行程式碼 1 個。提權佔最多是 Android 的常態，攻擊鏈通常先取得執行機會，再靠提權升到系統權限。
- 6 月 18 日的 2026-06-05 等級隨 Android 17 一起發布。

## 2026 年 5 月

> 修補等級 2026-05-05 · [Google 公告](https://source.android.com/docs/security/bulletin/2026/2026-05-01){target="_blank"} · [GrapheneOS 發布頁](https://grapheneos.org/releases){target="_blank"}

- 到 5 月 24 日那版為止，提前修好的累積到 111 個（18 個 Critical、91 個 High、2 個未分類）。
- GrapheneOS 在這個月的硬體記憶體標記抓到 Broadcom Wi-Fi 驅動的 use-after-free（程式把記憶體還回去之後又拿來用，可能被塞進惡意程式碼）與 DisplayPort 驅動的越界讀取（讀到不該讀的記憶體，可能外洩別的程式的資料），那些是上游沒發現的問題。

## 2026 年 4 月

> [GrapheneOS 發布頁](https://grapheneos.org/releases){target="_blank"}

- 到 4 月 21 日那版為止，提前修好的累積到 61 個（13 個 Critical、48 個 High）。
- GrapheneOS 在這個月沒有推進標示的修補等級，釋出的內容以功能修正為主。
