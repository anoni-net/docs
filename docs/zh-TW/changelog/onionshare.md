---
title: OnionShare 更新日誌
description: OnionShare 各版本更新的中文重點整理，從上游 changelog 與安全公告翻譯而成，方便台灣與華語讀者掌握安全修補與新功能。
icon: material/share-variant
---

# :material-share-variant: OnionShare 更新日誌

[OnionShare](../tools/onionshare.md) 的版本發布整理，從上游 changelog 與安全公告條列摘譯。新版本永遠在最上面。

OnionShare 的發版節奏比 Tor Browser 與 Tails 慢很多，2.6.3 到 2.6.4 之間隔了十五個月。長時間沒有新版屬於正常狀態，重點放在每次釋出的安全修補有沒有打到自己的用法。

## 急迫程度怎麼判斷

- <span class="urg-tag urg-tag--soon">儘快</span>該版含安全修補。OnionShare 的服務在執行期間是對外可觸及的，修補通常關係到誰讀得到你分享的內容。
- <span class="urg-tag urg-tag--routine">一般</span>功能、相依套件與打包更新。

發版節奏慢，目前沒有出現過需要當天更新的等級，所以這一頁還沒有「立刻」。

## OnionShare 2.6.5

> 2026-07-28 · [上游發布頁](https://github.com/onionshare/onionshare/releases/tag/v2.6.5){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>相依套件更新，涵蓋內建的 tor、Python 套件與網頁端相依。
- 沒有新功能與行為變更。2.6.4 的兩個安全修補仍是這一輪的重點，還停在 2.6.3 的人可以直接升到 2.6.5。

## OnionShare 2.6.4

> 2026-06-09 · [上游發布頁](https://github.com/onionshare/onionshare/releases/tag/v2.6.4){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>修補兩個安全問題，影響 2.6.3 與更早的版本，桌面版與 `onionshare-cli` 都受影響，兩者共用同一份 web 模組。
- CVE-2026-54706（[GHSA-22p9-r2f5-22mf](https://github.com/onionshare/onionshare/security/advisories/GHSA-22p9-r2f5-22mf){target="_blank"}）：分享模式與網站模式會跟著資料夾裡的符號連結（symlink）走，把連結指向的檔案一併提供出去。分享的資料夾裡若有他人放進來或來源不明的符號連結，取得 onion 網址的對方就能讀到 OnionShare 行程權限範圍內的其他本機檔案。嚴重度評為中等，利用前提是對方要先有辦法把符號連結放進你分享的資料夾。
- CVE-2026-54707（[GHSA-v833-3823-cmhp](https://github.com/onionshare/onionshare/security/advisories/GHSA-v833-3823-cmhp){target="_blank"}）：接收模式勾選「停用檔案上傳」之後，限制沒有落實到實際寫檔那一段。送出特製的 multipart 請求仍會把檔案寫進磁碟，路由處理只是不把它計入上傳紀錄。設定成純文字訊息端點的服務因此可能被寫入非預期的檔案。同一版順手修掉空的 POST 請求會建立空資料夾的問題。
- 相依套件更新，包含內建的 tor 與 flatpak runtime。
- 連線 Tor 的等待期間改為顯示不確定進度並提示使用者，避免以為程式沒有反應。

## OnionShare 2.6.3

> 2025-02-25 · [上游發布頁](https://github.com/onionshare/onionshare/releases/tag/v2.6.3){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>CLI 新增 `--log-filenames`，分享模式與網站模式可以看到哪些網址被造訪過。
- 儲存下來的持續性 onion 分頁，可在 OnionShare 啟動並連上 Tor 之後自動開始服務。
- 修好無法取得橋接、無法使用 meek 傳輸的問題，以及橋接查詢沒有回傳結果時的致命錯誤。
- 修好 CLI 關閉時執行緒競爭造成的 segfault，以及分享模式在有人造訪過之後自動停止計時器失效的問題。
- 介面新增愛爾蘭文、斯洛伐克文與坦米爾文，其他語言的翻譯也有增補。
- 文件補齊設定檔各欄位的說明，並加入用 systemd unit 維持持續性 onion 的範例。
- 打包：snap 支援 Ubuntu 24.04 以上，修正 ARM64 的 flatpak 打包，armhf 因為取不到 PySide6 套件暫停支援。

## OnionShare 2.6.2

> 2024-03-21 · [上游發布頁](https://github.com/onionshare/onionshare/releases/tag/v2.6.2){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>全部是安全修補，集中在接收模式與聊天模式的輸入處理。
- 歷史紀錄項目的路徑移除換行字元。
- 接收模式的文字訊息長度上限設為 524288 字元。
- 使用者名稱只允許特定 ASCII 字元並移除控制字元，另補上名稱驗證的例外處理，避免無聲加入聊天室。
- 收到 `disconnect` 事件時強制中斷該使用者的連線。
