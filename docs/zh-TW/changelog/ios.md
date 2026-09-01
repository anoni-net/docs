---
title: iOS 安全更新
description: iPhone 與 iPad 每次安全更新的白話整理，說明這次修了什麼、需不需要馬上更新，以及舊機型還收不收得到修補。
icon: material/apple-ios
---

# :material-apple-ios: iOS 安全更新

iPhone 與 iPad 的安全更新整理。Apple 一次更新動輒上百個 CVE，逐條讀完也很難判斷該怎麼做，所以這一頁不做逐條翻譯，只回答三個問題：需不需要馬上更新、修補打到哪些常見的攻擊路徑、舊機型還收不收得到。新版本永遠在最上面。

原始資料來自 Apple 的[安全性更新發布頁](https://support.apple.com/en-us/100100){target="_blank"}。Apple 沒有發布 CVE 清單的版本（例如只修錯誤的小改版），本頁不另立條目。

## 急迫程度怎麼判斷

- <span class="urg-tag urg-tag--now">立刻</span>Apple 在公告裡標注該問題可能已被實際利用，或漏洞被美國 CISA 的已知遭利用漏洞目錄收錄。看到這一級，當天就更新。
- <span class="urg-tag urg-tag--soon">儘快</span>修補涵蓋 WebKit 或 Kernel 的記憶體損毀類問題（程式寫錯記憶體位置，攻擊者可以藉此塞進自己的程式碼執行）。前者是造訪網頁就可能觸發的環節，後者決定攻擊者能取得多少權限，兩者串起來就是一條完整的遠端攻擊鏈。幾天內更新。
- <span class="urg-tag urg-tag--routine">一般</span>其餘修補，跟著平常的節奏更新即可。

顏色回答的是「該多快處理」。「有沒有人已經在利用」是另一個維度，每一則條目都會寫明。這一頁的「立刻」需要證據，也就是 Apple 自己標注可能已被實際利用，或漏洞進了 CISA 的目錄。其他頁面的判準基礎不一定相同，跨頁比較時要看該頁自己的說明。

分級是社群志工讀完公告後的整理，Apple 自己不做這種標示。判斷不確定時以較高一級為準。

長期可能被鎖定的人（記者、律師、人權工作者、社運參與者）另外開啟鎖定模式（Lockdown Mode），位置在設定、隱私權與安全性、鎖定模式。它會關掉多項常被用來遞送攻擊的功能，代價是部分網頁與附件無法正常顯示。

## 你的機器走哪一條線

Apple 同一天常常發好幾條更新線，版本號差很多，內容也不一樣。以 2026 年 8 月的狀況來說：

| 機型 | 目前的更新線 |
|---|---|
| iPhone 11 以後、iPad Air 3 以後、iPad 8 以後 | 26.x |
| iPhone XS、XS Max、XR、iPad 7 | 18.x |
| iPad Pro 12.9 吋二代、iPad Pro 10.5 吋、iPad 6 | 17.x |
| iPhone 8、8 Plus、X、iPad 5、iPad Pro 9.7 吋、iPad Pro 12.9 吋一代 | 16.x |
| iPhone 6s、7、SE 一代、iPad Air 2、iPad mini 4、iPod touch 7 | 15.x |

愈舊的線收到的修補愈少也愈慢，下面 2026-04-22 那則有具體例子。完全收不到更新的機型代表已知漏洞不再有人修，處理敏感資料的話該考慮換機。

## iOS 26.6.1、iPadOS 26.6.1（同日另有 18.7.10）

> 2026-08-17 · [26.6.1 公告](https://support.apple.com/en-us/148282){target="_blank"} · [18.7.10 公告](https://support.apple.com/en-us/148287){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>沒有標注已被實際利用的問題，不過 WebKit 與 Kernel 都在修補範圍內。
- 26.x 線補了 29 個問題，其中 19 個落在 WebKit，多數是處理惡意網頁內容造成的記憶體損毀或崩潰。ImageIO 有一個「處理影像可能導致任意程式碼執行」，這一類常被用在傳一張圖過去就能觸發的攻擊。
- Telephony 修掉一個問題：處於特權網路位置的攻擊者可以繞過 IPSec 驗證並攔截流量。
- 18.x 線同日發 18.7.10，一次補 122 個，WebKit 佔 38 個、Kernel 佔 18 個。數量遠多於新機那條線，反映舊機的修補是累積一陣子才一次補齊。還在用 iPhone XS、XS Max、XR 與 iPad 7 的人尤其該裝。

## iOS 26.6、iPadOS 26.6

> 2026-07-27 · [上游公告](https://support.apple.com/en-us/128066){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>86 個修補，Kernel 佔 19 個、WebKit 佔 7 個、ImageIO 佔 6 個。Apple 沒有標注任何一項已被實際利用。
- WebKit 修掉一個瀏覽紀錄外洩：網站有辦法知道你是否造訪過某個連結。同一組還修了惡意內容違反 iframe 沙箱政策（沙箱是把嵌入的網頁關在隔離環境裡，破得掉就能碰到不該碰的東西），以及網頁內嵌惡意內容造成的介面偽裝。
- Kernel 有一個連到惡意 NFS 伺服器就可能造成核心記憶體損毀的問題，接不明網路儲存空間的人要留意。
- Contacts 修了三個問題，包含 app 未經授權新增聯絡人，以及處理惡意聯絡人資料造成的資料外洩。

## iOS 26.5.2、iPadOS 26.5.2

> 2026-06-29 · [上游公告](https://support.apple.com/en-us/127594){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>38 個修補裡有 24 個在 WebKit、4 個在 WebRTC，整包幾乎都是瀏覽器引擎。Apple 沒有標注任何一項已被實際利用。
- 多個「惡意網站跨來源竊取資料」與「處理惡意網頁內容洩漏敏感使用者資訊」，這一類直接影響在瀏覽器裡登入的服務。
- 有一個惡意網站可以在沙箱外處理受限網頁內容，沙箱是瀏覽器隔離網頁的最後一道，破得掉就等於少一層防護。
- 6 月 1 日另有 26.5.1，Apple 沒有發布 CVE 清單，本頁不另立條目。

## iOS 26.5、18.7.9（同日另有 17.7.11、16.7.16、15.8.8）

> 2026-05-11 · [26.5 公告](https://support.apple.com/en-us/127110){target="_blank"} · [18.7.9 公告](https://support.apple.com/en-us/127111){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>26.x 線補 67 個，WebKit 佔 21 個、Kernel 佔 6 個。Kernel 那組有一個 app 可能取得 root 權限（系統的最高控制權，取得之後等同裝置的主人）。Apple 沒有標注任何一項已被實際利用。
- 18.x 線補 49 個，另外修了三個值得注意的隱私問題：app 可能繞過 App 隱私報告的記錄（那份報告本來就是拿來稽核 app 在背後連了哪裡）、app 可能列舉裝置上已安裝的應用程式（可用來側寫使用者身分）、Wi-Fi 元件有一個 app 可能以核心權限執行任意程式碼。
- 同日發給更舊裝置的 17.7.11、16.7.16、15.8.8 各只補一個問題，就是下面 4 月 22 日那個通知保留問題。

## iOS 26.4.2、18.7.8

> 2026-04-22 · [26.4.2 公告](https://support.apple.com/en-us/127002){target="_blank"} · [18.7.8 公告](https://support.apple.com/en-us/127003){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>隱私意涵值得知道。整個更新只修一個問題。Apple 沒有標注這一項已被實際利用。
- CVE-2026-28950：標記為刪除的通知，可能仍然被保留在裝置上。原因是日誌記錄的問題，Apple 用改進的資料遮蔽修好。以為滑掉就消失的通知內容，實際上還留在裝置裡，對取得裝置的人可見。
- 同一個修補到 17.x、16.x、15.x 這三條舊線是 5 月 11 日，晚了 19 天。舊機不只收到的修補比較少，時間也比較慢。
