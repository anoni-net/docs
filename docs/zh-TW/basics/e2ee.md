---
title: 端對端加密的保護範圍
description: 傳輸加密、端對端加密與儲存加密各自能防範誰，以及備份、metadata、門號註冊與安全碼這些加密範圍之外的環節。
icon: material/key-chain-variant
---

# :material-key-chain-variant: 端對端加密的保護範圍

App 標示「已加密」，服務商仍可能讀取你的訊息。加密有好幾種，差別在金鑰放在誰手上。金鑰在服務商那裡，服務商就能解開內容。金鑰只在你和對方的裝置上，服務商經手的只是一串無法解讀的資料。端對端加密（End-to-End Encryption，E2EE）屬於後者，保護的是訊息內容，備份、通聯紀錄與帳號身分都在範圍之外，要另外處理。

## 三種加密的界線

| 加密方式 | 能防範 | 無法防範 | 常見例子 |
|---|---|---|---|
| 傳輸加密 | 連線路徑上的人，例如同一個 Wi-Fi 的其他使用者、網路業者 | 服務本身，資料到了伺服器就解開 | 網址開頭的 HTTPS、超過 50 人的 LINE 群組、雲端 AI 服務 |
| 端對端加密 | 路徑上的人與服務商 | 雙方的裝置被取得或被入侵、通聯紀錄（metadata） | Signal、LINE 的一對一聊天 |
| 儲存加密 | 硬碟或伺服器被偷走時想讀取資料的人 | 持有金鑰的一方，金鑰由業者保管時業者可以讀取 | 手機與電腦的裝置加密、一般的雲端硬碟 |

### 傳輸加密

瀏覽器網址列的 HTTPS 就是傳輸加密（TLS），保護你的裝置到伺服器之間的那一段。同一個咖啡店 Wi-Fi 的人、網路業者可以看到你連到哪個網站，無法讀取內容。資料抵達伺服器之後就解開了，服務商可以讀取、保存，也可以在司法協助請求下提供。雲端 AI 服務屬於同一種模型，服務需要讀取你的輸入才能回應（見[用 AI 工作時怎麼避免資料外洩](../tools/ai-privacy.md)）。

### 端對端加密

訊息在你的裝置上加密，只有對方的裝置能解開，中間的伺服器只負責轉送，手上沒有金鑰。服務商收到調閱要求，也無法交出訊息內容。保護的範圍到兩端的裝置為止，手機被拿走又被解鎖時，對話紀錄一樣可以直接讀取。

### 儲存加密

手機與電腦的裝置加密，在裝置遺失或被偷時保護裡面的檔案（各裝置的開啟方式見[裝置加密與資料抹除](../tools/device-encryption.md)）。雲端硬碟多半也會加密存放的檔案，但金鑰由業者保管，業者自己仍然可以讀取。要讓業者也無法讀取，需要改用端對端加密的服務，例如 [CryptPad](../tools/what-is-cryptpad.md)，或是上傳前先用 [age](../tools/what-is-age.md) 這類工具在自己的裝置上加密。

## 雙方共用金鑰的產生方式

兩個人只能透過伺服器傳話，卻要協商出一把伺服器不知道的金鑰，常見的比喻是混色。雙方從同一個公開的基底色出發，各自加入只有自己知道的秘密色，再把混合後的顏色交給對方。兩人把收到的混合色加上自己的秘密色，最後手上的顏色相同，中間經手的人只看過混合色，無法在合理時間內反推出秘密色。數學上這套方法叫 Diffie-Hellman 金鑰交換。

Signal 這類工具每傳一則訊息就換一把金鑰，今天的金鑰被偷，昨天的訊息仍然無法解開，這項性質叫前向保密。Double Ratchet、群組加密與各種協定的比較，寫在社群首頁的[端對端加密的協定機制](https://anoni.net/articles/e2ee-protocols/){target="_blank"}。

## 加密範圍外的 metadata

端對端加密保護訊息內容，誰在什麼時間傳訊息給誰、多久傳一次、從哪個 IP 連線，這些 metadata 仍然經過伺服器。光是通聯關係就能還原一個人的社交網路與作息（見 [Metadata 是什麼，為什麼重要](./metadata.md)）。Signal 的 Sealed Sender 隱藏單則訊息的寄件人，帳號本身的 metadata 仍留在伺服器上。LINE 的通聯紀錄全部經過伺服器。SimpleX、Session 從設計上減少伺服器端取得的資訊，各自的取捨見[匿名通訊工具比較](../tools/messaging-comparison.md)。

## 多裝置與備份的取捨

手機、平板、電腦要同時看到同一段對話，或換手機時要帶走舊訊息，金鑰就需要離開原本的那台裝置。常見的做法有三種：

- **連結裝置**（Signal、WhatsApp）：每台裝置各自有金鑰，新裝置掃主裝置上的 QR code 加入。隱私保護最好，新裝置通常看不到加入之前的訊息，除非主裝置另外傳送過去
- **加密雲端備份**（WhatsApp、iMessage）：訊息紀錄用你設定的密碼或金鑰加密後存到雲端。換手機方便，安全程度取決於密碼強度，業者被入侵時，所有人的密文集中在同一處
- **所有裝置共用一把長期金鑰**（早期的 iMessage、部分企業通訊軟體）：同步最簡單，任何一台裝置被偷，全部對話都會曝光

Telegram 的秘密聊天（Secret Chats）走相反的路，只存在參與對話的兩台裝置上，沒有雲端備份，換手機就無法帶走。

Signal 在 2025 年 9 月推出加密備份（Secure Backups），先在 Android 的 beta 版提供，2026 年 9 月 iOS 版上線時各平台都已提供[^1]。解開備份的是一組在你的裝置上產生的 64 字元復原金鑰，Signal 的伺服器不會取得這組金鑰，遺失時 Signal 也無法替你找回。免費方案涵蓋全部的文字訊息與最近 45 天的媒體，更早的媒體需要每月 US$1.99 的付費方案。

## iCloud 的進階資料保護

iPhone 上的資料很多也同步到 iCloud。iCloud 預設使用「標準資料保護」，資料在傳輸與存放時都有加密，但多數資料的金鑰存放在 Apple 的資料中心，Apple 可以替你解密，換新手機、從備份回復、忘記密碼時才救得回資料，也代表 Apple 有能力在依法被要求時提供[^apple-icloud]。健康資料、iCloud 鑰匙圈裡的密碼等 15 個類別，即使在標準資料保護下也是端對端加密[^apple-icloud]。

標準資料保護下，iCloud 備份不是端對端加密。備份裡包含「訊息」的紀錄，所以 iMessage 本身雖然是端對端加密，開了 iCloud 備份，Apple 仍然有能力讀取備份裡的對話[^ssd-icloud]。

開啟「進階資料保護」之後，端對端加密的類別增加到 25 個，包括 iCloud 備份（含裝置與「訊息」的備份）、iCloud 雲碟、照片與備忘錄，金鑰只在你的受信任裝置上[^apple-icloud]。以下幾項仍然不是端對端加密：

- iCloud 郵件、聯絡人與行事曆，這三項要跟其他郵件與行事曆系統的標準相容[^apple-icloud]
- iWork 的合作文件、「照片」的共享相簿，以及用「任何擁有連結的使用者」分享的內容[^apple-adp]
- Apple 仍會保留備份、iCloud 雲碟檔案、照片、備忘錄等的部分 metadata[^ssd-icloud]

代價是 Apple 無法再協助你復原這些資料。開啟之前，系統會要求設定至少一個復原聯絡人或復原密鑰。復原聯絡人是你信任的親友，可以提供一組代碼協助你復原帳號，但看不到你的資料。所有 Apple 裝置也要更新到支援的軟體版本[^apple-adp]。

- **iPhone**：「設定」> 你的姓名 >「iCloud」>「進階資料保護」>「開啟進階資料保護」，照螢幕上的指示檢查復原方式
- **Mac**：「蘋果」選單 >「系統設定」> 你的姓名 >「iCloud」>「進階資料保護」>「開啟」

在一台裝置上開啟，整個帳號都會啟用，之後可以隨時關閉。管理式 Apple 帳號與兒童帳號不能使用[^apple-adp]。2025 年 2 月起，英國尚未開啟的使用者無法再開啟進階資料保護[^apple-uk]，EFF 的說明是為了回應英國政府要求加密後門[^ssd-icloud]。

本節依 EFF Surveillance Self-Defense 的〈[How to: Encrypt Your iPhone](https://ssd.eff.org/module/how-encrypt-your-iphone){target="_blank"}〉（審閱日 2025-02-25，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"}）改寫，資料類別與步驟依 Apple 2026 年的說明更新，未經 EFF 審閱。

## LINE 與 Signal 的在地脈絡 { #在地脈絡正體中文社群為何用-Signal-與-Matrix }

台灣與日本最普及的通訊軟體是 LINE。LINE 的端對端加密叫 Letter Sealing，2015 年以選用功能推出，2016 年擴及群組，同年起在主要的用戶端預設開啟，2021 年起無法手動關閉[^2]。一對一的文字、媒體與語音、視訊通話都受到保護，以下幾種情況只有傳輸加密，LINE 在司法協助請求下可以提供內容：

- 超過 50 人的群組
- 有官方帳號或聊天機器人加入的聊天室，從加入那一刻起的訊息
- 群組語音通話、群組視訊通話與 LINE Meeting

LINE 的用戶端不開源，金鑰管理無法由第三方獨立稽核，metadata 也全部經過伺服器。

香港最普及的通訊軟體是 WhatsApp。《國安法》之後，通訊與社群平台上的紀錄成為國安、煽動案件的證據來源[^hk]，威脅模型要對應國安監控，不只是一般的司法協助請求。中國大陸以微信為主，微信沒有端對端加密，帳號採實名註冊，跟這一頁談的其他工具屬於不同的類別。

各地主流平台的落差多半集中在群組加密與 metadata 兩處。anoni.net 社群建議兩條路：

- **Signal**：一對一與小群組的首選，操作接近 LINE，門檻低
- **Matrix**：開源、聯邦式、可以自架，適合群組與社群討論，anoni.net 也自架了一台伺服器

在敏感的工作情境，兩條路的差異會更明顯，見[記者保護消息來源](../scenarios/journalist.md)、[社運行動者的數位準備](../scenarios/activist.md)與[家暴受害者的數位準備](../scenarios/domestic-violence.md)。

## Signal 的門號與免門號註冊

Signal 的帳號長期建立在手機號碼上。在台灣、香港、澳門申辦門號都要實名登記，訊息加密得再嚴密，帳號透過電信業者的登記資料仍然對應到本人。Signal 從 2024 年起提供 username，聯絡人之間可以只交換 username，號碼也可以設成不對任何人顯示，但 Signal 的伺服器上仍然記著每個帳號綁定的號碼[^3]。

2026 年 9 月，Signal 在 Android 的 beta 版開放不需要門號的註冊方式 Signal Login，改收一筆一次性的費用（說明頁寫 US$2.99），目前只能透過 Google Play 付款[^4]。付款與帳號之間用零知識證明切開，Signal 對不回是哪一筆付款建立了哪個帳號，但付款日期仍然跟著帳號存下來，Google 也留有購買紀錄。用門號註冊仍然免費，也仍是主要的註冊方式，正式版與 iOS 的時程截至 2026 年 9 月都還沒有公布。付款紀錄會留下什麼、依威脅模型如何選擇，見[Signal 免門號註冊與付款紀錄](../blog/posts/2026-signal-login-numberless.md)。

## 安全碼的核對

端對端加密保證只有對話的兩端能解開訊息，前提是另一端真的是對方。Signal 為每段對話產生一組安全碼（safety number），在對方的個人資料頁點「檢視安全碼」，可以當面互掃 QR code，或透過另一條可信的管道比對那串數字。

收到安全碼變更的通知，代表對方的金鑰換了，可能只是換手機或重新安裝，也可能是帳號被別人接管。先停下來，透過另一條管道確認過再繼續談敏感的事。

Signal 在 2026 年 8 月推出自動金鑰驗證，由 App 與第三方稽核者確認聯絡人的公開金鑰在整個系統中一致，不必另約時間當面核對。功能需要你手上有對方的電話號碼，只透過 username 聯繫的對象仍要用安全碼核對，限制與做法見[介紹 Signal 自動金鑰驗證](../blog/posts/signal-automatic-key-verification.md)。

## 相關閱讀

- [匿名通訊工具比較](../tools/messaging-comparison.md)：Signal、SimpleX、Session、Briar、Matrix 的身分綁定、metadata 與群組設計
- [Metadata 是什麼，為什麼重要](./metadata.md)：訊息加密之後仍然暴露的通聯關係
- [裝置加密與資料抹除](../tools/device-encryption.md)：電腦與手機的全碟加密，以及出售裝置前的清除
- [什麼是匿名網路？](../tools/what-is-anonymity-network.md)：隱藏連線來源的另一層保護
- [端對端加密的協定機制](https://anoni.net/articles/e2ee-protocols/){target="_blank"}：Double Ratchet、Sender Keys、MLS 與四種協定的對照
- [後量子密碼概觀](https://anoni.net/articles/post-quantum/){target="_blank"}：量子電腦對現有加密的威脅與轉換時程
- [零知識身分驗證與支付](https://anoni.net/articles/zk-identity-payments/){target="_blank"}：證明身分或付款而不揭露其他資訊的密碼學方法
- [記者保護消息來源](../scenarios/journalist.md)、[社運行動者的數位準備](../scenarios/activist.md)：加密通訊在實際情境裡的用法
- [中文化與文件翻譯](../community/i18n.md)：歡迎一起參與文件站的翻譯

[^1]: [Introducing Signal Secure Backups](https://signal.org/blog/introducing-secure-backups/){target="_blank"} - Signal
[^2]: [LINE Encryption Report](https://www.lycorp.co.jp/en/privacy-security/security/transparency/encryption-report/2025/){target="_blank"} - LY Corporation
[^3]: [Keep your phone number private with Signal usernames](https://signal.org/blog/phone-number-privacy-usernames/){target="_blank"} - Signal Blog
[^4]: [Phone Numberless Registration for Android](https://support.signal.org/hc/en-us/articles/11197884108826-Phone-Numberless-Registration-for-Android){target="_blank"} - Signal Support
[^hk]: 香港《國安法》後的監控與言論起訴脈絡見 [Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"} - Hong Kong Free Press、[Hong Kong: New Security Law a Full-Scale Assault on Rights](https://www.hrw.org/news/2024/03/19/hong-kong-new-security-law-full-scale-assault-on-rights){target="_blank"} - Human Rights Watch。
[^apple-icloud]: [iCloud 資料安全性概覽](https://support.apple.com/zh-tw/102651){target="_blank"} - Apple 支援，2026-01-08。
[^apple-adp]: [如何開啟「iCloud 進階資料保護」](https://support.apple.com/zh-tw/108756){target="_blank"} - Apple 支援，2026-04-24。
[^ssd-icloud]: [How to: Encrypt Your iPhone](https://ssd.eff.org/module/how-encrypt-your-iphone){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2025-02-25。
[^apple-uk]: [Apple can no longer offer Advanced Data Protection in the United Kingdom to new users](https://support.apple.com/en-gb/122234){target="_blank"} - Apple 支援（英國），2025-09-23。
