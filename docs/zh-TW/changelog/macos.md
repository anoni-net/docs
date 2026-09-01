---
title: macOS 安全更新
description: Mac 每次安全更新的白話整理，說明這次修了什麼、需不需要馬上更新，以及三條維護線各自的狀態。
icon: material/apple
---

# :material-apple: macOS 安全更新

Mac 的安全更新整理。Apple 一次更新動輒上百個 CVE，逐條讀完也很難判斷該怎麼做，所以這一頁不做逐條翻譯，只回答三個問題：需不需要馬上更新、修補打到哪些常見的攻擊路徑、舊系統還收不收得到。新版本永遠在最上面。

原始資料來自 Apple 的[安全性更新發布頁](https://support.apple.com/en-us/100100){target="_blank"}。判斷方式與 [iOS 安全更新](./ios.md)那一頁一致。

## 急迫程度怎麼判斷

- <span class="urg-tag urg-tag--now">立刻</span>Apple 在公告裡標注該問題可能已被實際利用，或漏洞被美國 CISA 的已知遭利用漏洞目錄收錄。看到這一級，當天就更新。
- <span class="urg-tag urg-tag--soon">儘快</span>修補涵蓋 WebKit 或 Kernel 的記憶體損毀類問題（程式寫錯記憶體位置，攻擊者可以藉此塞進自己的程式碼執行），或有取得 root 權限（系統的最高控制權）、繞過 Gatekeeper 與隱私偏好的項目。幾天內更新。
- <span class="urg-tag urg-tag--routine">一般</span>其餘修補，跟著平常的節奏更新即可。

顏色回答的是「該多快處理」。「有沒有人已經在利用」是另一個維度，每一則條目都會寫明。這一頁的「立刻」需要證據，也就是 Apple 自己標注可能已被實際利用，或漏洞進了 CISA 的目錄。

分級是社群志工讀完公告後的整理，Apple 自己不做這種標示。判斷不確定時以較高一級為準。

macOS 上特別值得留意的是繞過類問題。Gatekeeper 擋的是沒有簽章的程式，隱私偏好（系統設定裡的取用權限）擋的是 app 讀取螢幕、麥克風與檔案。這兩層被繞過時，畫面上不會有任何異狀。

## 三條維護線

Apple 同時維護最新版與前兩代，安全修補三條線都發，但只有最新線拿得到新功能與完整的修補集。

| 線 | 版本號 | 狀態 |
|---|---|---|
| Tahoe | 26.x | 最新，修補最完整 |
| Sequoia | 15.x | 前一代，安全修補跟上 |
| Sonoma | 14.x | 再前一代，收到的修補數量最少 |

同一天三條線一起發是常態，數量落差很正常，見下面 2026-07-27 那則的比較。硬體太舊升不上 Tahoe 的話，留在 Sequoia 或 Sonoma 仍然收得到安全修補，但要注意 Sonoma 這條線再過一輪就會停止支援。

## macOS Tahoe 26.6.2

> 2026-08-17 · [上游公告](https://support.apple.com/en-us/148281){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>28 個修補，其中 19 個在 WebKit，多數是處理惡意網頁內容造成的記憶體損毀或崩潰。Apple 沒有標注任何一項已被實際利用。
- ImageIO 有一個「處理影像可能導致任意程式碼執行」，這一類常被用在傳一張圖過去就能觸發的攻擊。
- Kernel 有 3 個、IOGPUFamily 有 1 個。這一波只發給 Tahoe，Sequoia 與 Sonoma 沒有對應版本。

## macOS Tahoe 26.6.1、Sequoia 15.7.9、Sonoma 14.8.9

> 2026-08-06 · [26.6.1 公告](https://support.apple.com/en-us/148170){target="_blank"} · [15.7.9 公告](https://support.apple.com/en-us/148171){target="_blank"} · [14.8.9 公告](https://support.apple.com/en-us/148172){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>三條線同時發，各自只修一個問題。單一修補動用三條線，代表 Apple 認為不能等到下次排程。Apple 沒有標注這一項已被實際利用，不過驗證被繞過本身就等於門沒鎖。
- CVE-2026-65400：同一網路上的攻擊者可以在沒有有效憑證的情況下通過螢幕共享（Screen Sharing）的驗證。成因是驗證流程的狀態管理問題。
- 有開啟螢幕共享的人優先處理。系統設定裡的「一般」、「共享」可以確認自己有沒有開，平常用不到就關掉，那是最直接的處理方式。

## macOS Tahoe 26.6、Sequoia 15.7.8、Sonoma 14.8.8

> 2026-07-27 · [26.6 公告](https://support.apple.com/en-us/128067){target="_blank"} · [15.7.8 公告](https://support.apple.com/en-us/128071){target="_blank"} · [14.8.8 公告](https://support.apple.com/en-us/128072){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>年度最大的一波，Tahoe 補 153 個、Sequoia 138 個、Sonoma 127 個。三條線的數量落差就是舊線收到的修補比較少的具體證據。Apple 沒有標注任何一項已被實際利用。
- Kernel 是重點，Tahoe 佔 27 個、Sequoia 21 個、Sonoma 20 個。
- Accounts 有一個 app 可能取得 root 權限。Assets 有一個惡意應用程式可以繞過隱私偏好，也就是不必經過你同意就取得原本要授權的權限。
- AppleDouble 處理惡意檔案時可能導致應用程式異常結束，或是被執行任意程式碼。Model I/O 與 HFS 各有多個檔案解析類的問題，這一類的觸發方式通常是打開一個別人給的檔案。

## macOS Tahoe 26.5.2

> 2026-06-29 · [上游公告](https://support.apple.com/en-us/127595){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>38 個修補裡有 24 個在 WebKit、4 個在 WebRTC，整包幾乎都是瀏覽器引擎。Apple 沒有標注任何一項已被實際利用。
- 影響範圍不只 Safari。系統上任何用 WebView 顯示網頁內容的 app 都走同一套引擎，包含郵件預覽與許多聊天軟體的內建瀏覽器。

## macOS Tahoe 26.5

> 2026-05-11 · [上游公告](https://support.apple.com/en-us/127115){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>87 個修補，WebKit 佔 22 個、Kernel 佔 9 個。Apple 沒有標注任何一項已被實際利用。
- CUPS 有一個 app 可能取得 root 權限。CUPS 是列印系統，平常不會想到它，而它預設就在執行。
- BOM 有一個惡意的 ZIP 壓縮檔可以繞過 Gatekeeper 檢查。解壓縮別人寄來的檔案是很日常的動作，這條值得知道。
- Accounts 有一個繞過部分隱私偏好的問題，mDNSResponder 有 4 個。
