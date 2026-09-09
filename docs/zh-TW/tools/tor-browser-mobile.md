---
title: 手機上的 Tor
description: Android 有 Tor Project 官方的 Tor Browser，iOS 沒有也不會有，只能用社群維護的 Onion Browser。這一頁說明兩邊各自怎麼裝、第一次啟動要處理什麼、怎麼確認自己真的走在 Tor 上，以及什麼時候應該放下手機改用電腦。
icon: material/cellphone-lock
---

# :material-cellphone-lock: 手機上的 Tor

看到一個 `.onion` 位址，用平常的瀏覽器打不開，需要的是 Tor。手機上要裝什麼，Android 與 iOS 的答案不一樣，而且差距不只是「有沒有上架」。

先讀過 [什麼是 Tor](./what-is-tor.md) 會比較好理解底下的取捨。橋接與安全等級的細節在 [Tor Browser 進階設定](./tor-browser-advanced.md)，這一頁只說明手機上不同的部分。

## 兩個平台的差別

Android 上有 Tor Project 自己發布的 Tor Browser，跟桌面版同一個 Tor 引擎，多數設定齊備。

iOS 上沒有官方版本。Apple 要求 iOS 上所有瀏覽器都用 WebKit 算繪，而 Tor Browser 的指紋抗性建立在對瀏覽器引擎的修改上，那些修改在 WebKit 上做不出來。這是平台政策造成的結構限制，不是哪一版還沒跟上。Tor Project 因此把 iOS 讀者指向 Onion Browser。[^1]

| | Android | iOS |
|---|---|---|
| 官方版本 | 有，Tor Project 發布 | 沒有 |
| App 名稱 | Tor Browser for Android | Onion Browser |
| 流量走 Tor | 是 | 是 |
| 指紋抗性 | 接近桌面版 | 做不到，受 WebKit 限制 |
| 系統需求 | Android 5.0 以上 | 依 App Store 標示 |

兩邊的共同點是流量都真的走 Tor，所以「打開一個 `.onion` 位址」這件事兩邊都做得到。差別在你能不能同時抵抗指紋追蹤。

## Android 有四個取得管道

Tor Project 列出的管道是 Google Play、F-Droid、官方網站與 GetTor。[^2]

**Google Play** 最直接，更新由系統處理。需要 Google 帳號，而且下載紀錄會留在帳號上。

**F-Droid** 不需要 Google 帳號。步驟是先裝 F-Droid，在「我的應用程式」的儲存庫設定裡加入 Guardian Project 的官方儲存庫，再搜尋 Tor Browser for Android 安裝。[^3]

**官方網站**直接給 APK 檔。前面兩個管道連不上時用這個。

**GetTor** 是連官網都被封鎖時的最後手段，透過電子郵件或其他管道取得下載連結。

選哪一個取決於你的處境。平常在台灣，前兩個都可以，想避開 Google 帳號就用 F-Droid。人在封鎖比較嚴重的地方，順序往下走。

Tor Project 的簽章驗證說明只涵蓋 Windows、macOS 與 Linux，沒有 Android 的步驟，[^4] 你取得 APK 之後很難用官方文件教的方式確認它沒被動過。能用 F-Droid 或 Google Play 就用，那兩個管道的完整性由商店負責，直接下載 APK 是它們都連不上時的備案。

## 第一次啟動要處理的事

打開 Tor Browser for Android 之後會先連線。台灣對外連線受審查的程度低，多半直接連得上，不需要額外設定。

連不上的話，通常是網路端擋掉了 Tor。App 裡有 Connection Assist，也可以手動選橋接。哪一種橋接適合哪一種封鎖，寫在 [Tor Browser 進階設定](./tor-browser-advanced.md#連線Connection-Assist-與橋接)。

安全等級預設是 **Standard**。要提高到 **Safer** 或 **Safest** 之前，先看 [安全等級的說明](./tor-browser-advanced.md#安全等級Security-Level)，等級愈高愈多網站會壞掉，值不值得取決於你在抗誰。

## iOS 只有 Onion Browser

Onion Browser 在 App Store 上架，開源，貢獻者包含 Mike Tigas、Benjamin Erhart 與 Guardian Project。它不是 Tor Project 的官方產品。

實務上這代表什麼：

- 流量走 Tor，`.onion` 位址打得開，你的網路業者看不到你連了哪個站
- 指紋抗性做不到桌面版的程度。同一個網站在不同時間把你的瀏覽器指紋比對成同一人的機率，比在桌面版 Tor Browser 上高
- 更新節奏跟 Tor Project 的桌面版與 Android 版各自獨立

如果你在 iOS 上的需求是「讀一個 `.onion` 頁面」，Onion Browser 夠用。如果需求是「在手機上維持一個不被關聯的身分」，iOS 給不了那個保證。

## 怎麼確認真的走在 Tor 上

裝好之後開 [check.torproject.org](https://check.torproject.org/){target="_blank"}。不是走 Tor 的時候，那一頁會直接寫著 Sorry. You are not using Tor.，並列出你的 IP。

讀本站的 onion 版本時，把網址列的位址跟頁尾印的完整位址逐字比對。`.onion` 位址沒有憑證機構背書，核對位址本身就是唯一的驗證手段，而用相似位址架設釣魚站是真實存在的手法。三種閱讀方式的差別寫在 [你正在用哪一種方式閱讀](../about/how-you-are-reading.md)。

## 什麼時候該換成電腦

手機上的 Tor 適合臨時查閱與日常瀏覽。威脅模型落在記者或行動者那一端的時候，指紋抗性與作業系統層級的隔離都重要，桌面版的 Tor Browser 或 [Tails](./what-is-tails.md) 才給得起，手機給不起。

## 用手機幫別人連上 Tor 是另一回事

自己讀 Tor 跟幫審查地區的人連上 Tor 是兩件事，後者手機做得到。瀏覽器分頁版的 [Snowflake](./tor-snowflake.md) 在手機上效果有限，分頁進到背景之後 Android 經常直接中斷 WebRTC 連線。Tor Project 另外推出獨立的 Snowflake Volunteer App，用的是背景服務，可以設定只在 Wi-Fi 或只在充電時運作，那才是手機長期貢獻的做法。

## 接下來

裝好之後，設定的細節看 [Tor Browser 進階設定](./tor-browser-advanced.md)。想知道自己需要調到什麼程度，先回頭建立 [威脅模型](../basics/threat-model.md)。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 什麼是 Tor](./what-is-tor.md)
- [:material-cog-outline: Tor Browser 進階設定](./tor-browser-advanced.md)
- [:material-routes: 你正在用哪一種方式閱讀](../about/how-you-are-reading.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-snowflake: Tor Snowflake 橋接點](./tor-snowflake.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>

[^1]: [Can I run Tor Browser on an iOS device?](https://support.torproject.org/tormobile/tormobile-3/){target="_blank"} - Tor Project Support。原文寫著 Apple requires browsers on iOS to use something called Webkit, which prevents Onion Browser from having the same privacy protections as Tor Browser。
[^2]: [Tor Browser for Android](https://support.torproject.org/mobile-tor/){target="_blank"} - Tor Project Support。原文列出 the Play Store, F-Droid, the Tor Project website and GetTor，系統需求是 Android 5.0 以上。
[^3]: [How do I install Tor Browser for Android from F-Droid?](https://support.torproject.org/tormobile/tormobile-7/){target="_blank"} - Tor Project Support，含加入 Guardian Project 儲存庫的完整流程。
[^4]: [How can I verify Tor Browser's signature?](https://support.torproject.org/tbb/how-to-verify-signature/){target="_blank"} - Tor Project Support，該頁只涵蓋 Windows、macOS 與 GNU/Linux。
