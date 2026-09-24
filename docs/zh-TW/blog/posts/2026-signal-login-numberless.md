---
date: 2026-09-25
authors:
    - anoni-net
categories:
    - 技術
    - 隱私
slug: 2026-signal-login-numberless
image: "https://assets.anoni.net/blog/2026-signal-login-numberless.webp"
summary: "Signal 在 Android beta 開放不綁門號的註冊方式 Signal Login，改收一筆約 3 美元的一次性費用。付款沿用捐款系統的零知識證明，Signal 對不上哪一筆付款建立了哪個帳號，但付款日期仍跟著帳號存下來，Google Play 也留有「你買過」的紀錄。文中整理付款與帳號之間被切斷與仍然留著的環節，以及依不同擔心的做法。"
description: "Signal Login 讓 Android 使用者付費註冊、不必綁門號。說明付款紀錄會留下什麼、查不到什麼，以及依威脅模型決定要不要用、用什麼方式付款。"
---

# :material-message-lock-outline: Signal 免門號註冊與付款紀錄

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-signal-login-numberless.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-signal-login-numberless.webp"
            alt="木桌上一只皮夾露出現金與卡片，旁邊放著一支手機與一串鑰匙"
            style="border-radius: 5px;">
    </a>
    <figcaption markdown="span">圖片：皮夾、手機與鑰匙，對應用付款與金鑰取代門號的註冊方式。攝影 Towfiqu barbhuiya，來源 [Pexels](https://www.pexels.com/photo/brown-wallet-beside-the-blue-and-black-smartphone-9053308/){target="_blank"}（Pexels License）。</figcaption>
</figure>

在台灣、香港、澳門申辦門號，包括預付卡，都要實名登記。Signal 的帳號建立在門號上，訊息加密得再嚴密，帳號透過電信業者的登記資料，仍然對應到一個有名有姓的人。東亞與東南亞多數地方的門號也採實名制。對記者的消息來源、跨境工作的倡議者，以及不想讓帳號連回本人的使用者來說，綁門號一直是 Signal 最常被提到的限制。

2026 年 9 月，Signal 在 Android 的 beta 版開放一種不需要門號的註冊方式 Signal Login，代價是一筆一次性的小額付款。消息傳開後，不少人擔心付款紀錄會把身分帶回來。Signal 用捐款系統的零知識證明，讓帳號對不回是哪一筆付款，但付款日期仍然跟著帳號存下來，Google 那端也留有「你買過」的紀錄。要不要用、用什麼方式付款，取決於你擔心的是哪一種追查。

<!-- more -->

!!! info "撰寫時的狀態"

    本文依 2026 年 9 月 Android beta 的狀態撰寫（8.28.1 起開放，9 月 23 日的最新 beta 為 8.28.4），價格、付款方式與 iOS 時程在正式版推出前都可能調整，更新時會補在文末。

## 門號在 Signal 帳號上的角色

Signal 從 2024 年起提供 username[^1]，聯絡人之間可以只交換 username，號碼也可以設成沒有人看得到、沒有人能用號碼搜尋到。設了 username 之後別人看不到號碼，但 Signal 伺服器上仍然記著每個帳號綁定的號碼。

依 Signal 公開的政府調閱紀錄，Signal 能提供的資料只有帳號的註冊時間與最後一次連線的日期[^2]，訊息內容、聯絡人與群組都不在其中。執法機關手上只要有門號，就能向 Signal 查詢號碼有沒有註冊、何時註冊，再向電信業者取得登記資料。這份範圍來自 Signal 自己公布的調閱回應，反映的是伺服器目前保存的資料，並非密碼學上的保證，系統設計改變時範圍也會跟著改變（Signal Login 就新增了一筆，見後文）。

門號還帶來另一層風險。註冊驗證靠簡訊，SIM 卡被盜換（SIM swap）或驗證簡訊被攔截時，別人可能用你的號碼重新註冊帳號。Signal 的註冊鎖（Registration Lock）可以擋下這種情況，但要使用者自行開啟。Signal Login 沒有門號，也就沒有這條簡訊驗證的路徑。

## Signal Login 的註冊流程

Signal 的 Android 開發者 Greyson Parrelli 在 9 月 16 日於 Signal 社群論壇公告 Signal Login[^3]。功能目前只開放給 Android beta 的測試者，正式版與 iOS 的時程都還沒有公布。

註冊時選擇不使用電話號碼註冊（Register Without Phone Number），再付一筆一次性的費用。說明頁寫的是 US$2.99，論壇公告寫約 3 美元，各國價格可能不同。付款完成後，Signal 產生一組 32 字元的 Account ID 與一組 64 字元的金鑰（論壇公告稱 Account Key，說明頁稱 Recovery Key）[^4]，兩者相當於帳號與密碼，取代門號成為登入的身分。

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-signal-login-numberless-screen.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-signal-login-numberless-screen.webp"
            alt="Signal App 的 Your Signal Login 畫面，說明購買完成、忘記登入資訊就無法復原帳號，下方一張藍色卡片列出 Account 與 Recovery 兩組字串，只顯示末四碼，底下有存進密碼管理器與手動保存兩個按鈕"
            style="border-radius: 5px; max-width: 320px;">
    </a>
    <figcaption markdown="span">付款完成後顯示的 Signal Login 畫面，Account 與 Recovery 各只顯示末四碼。圖片來源：[Signal Support](https://support.signal.org/hc/en-us/articles/11197884108826-Phone-Numberless-Registration-for-Android){target="_blank"}。</figcaption>
</figure>

收費是為了阻擋垃圾帳號，公告的原話是「如果免費，垃圾訊息業者會大量取得這種帳號，毀掉我們的網路」[^3]。用門號註冊仍然免費，也仍然是主要的註冊方式，付費註冊是另外加上的選項。

Account ID 與金鑰同時取代了原本的 Signal PIN，遺失就無法復原帳號，Signal 沒有其他復原管道，建議存進密碼管理器。

帳號可以加上 TOTP 兩步驟驗證（Google Authenticator 這類 App 產生的一次性密碼）。設定之後，別人即使取得 Account ID 與金鑰，沒有一次性密碼也無法在另一台裝置登入[^11]，產生密碼的 App 最好放在另一台裝置上。反過來，所有兩步驟驗證的裝置都遺失時，帳號會永久鎖住，論壇公告建議設定不只一個[^3]。

沒有門號，朋友手機通訊錄裡的號碼也不會自動配對到你的帳號。username 是選配，不設的話別人無法找到你，只能由你主動發起對話。Signal Desktop 這類連結裝置的用法與門號帳號相同。目前只有新帳號能用這種方式註冊，已經綁門號的帳號無法移除號碼。

## 付款與帳號之間的零知識憑證

Signal Login 的付款沿用 Signal 捐款系統的零知識證明（zero-knowledge proof，證明自己符合某個條件、卻不透露其他資訊的密碼學方法）[^3]。依 Signal 捐款常見問題的說明，付款之後 App 向伺服器取得一張憑證，伺服器能驗證出示憑證的人屬於付過款的那群人，但憑證裡沒有能對應到某一筆付款的資訊[^5]。Signal 的私密群組用的也是同一套匿名憑證機制。

套用到註冊流程上，Signal 的伺服器有一筆 Signal Login 的付款紀錄，也有一個新帳號出示了有效的憑證，憑證本身對不回是哪一筆付款，但付款日期仍然留了下來。

Signal 伺服器的原始碼是公開的。核發憑證時，憑證的到期日由 Google Play 的付款時間加上五年算出，只取到日期[^6]。帳號建立時，伺服器把憑證的到期日連同帳號編號一起寫進資料庫[^7]，到期日往回減五年就是付款那一天。另一張資料表保存每一筆 Google Play 購買的識別碼與同一個到期日，保存到到期後 30 天[^10]。從 Signal 手上的資料，可以推回每個 Signal Login 帳號是哪一天付款的，也能列出當天每一筆購買的識別碼。Google 再把識別碼對回各自的 Google 帳號，同一天付款的人就成了一份具名的名單。

## 付款端留下的紀錄

前一段的切斷只發生在 Signal 伺服器上，付款本身走 Google Play 的 App 內購買。依論壇公告，目前只接受這種付款方式，之後會加上其他方式[^3]。Google 的紀錄跟任何一筆 App 內購買一樣，記著哪個 Google 帳號、什麼時間、向 Signal 買了什麼。

| 誰手上有紀錄 | 查得到 | 查不到 |
|---|---|---|
| Google | 某個 Google 帳號在某個時間買了 Signal Login | 買完之後建立的是哪個 Signal 帳號 |
| 發卡銀行或電信業者 | 一筆付給 Google Play 的款項，帳單上可能帶有 App 名稱 | 同上 |
| Signal | 每個 Signal Login 帳號的付款日期（以日計）、註冊時間、每一筆購買的 Google Play 識別碼 | 帳號是哪一筆付款建立的 |

付款紀錄最多只能證明你買過，也就是你很可能有一個不綁門號的 Signal 帳號。單憑付款紀錄查不到是哪一個帳號，更查不到帳號裡的聯絡人與訊息，要縮小範圍需要把 Google 與 Signal 兩邊的資料合起來比對（見下一節）。門號的情況不同，號碼本身就是帳號的識別碼，取得號碼就能直接對應到帳號。

付款方式決定這筆紀錄連回本人的程度。在台灣，Google Play 常見的付款方式有這幾種[^8]：

- 信用卡或金融卡：發卡銀行開戶時做過實名審查（KYC），紀錄直接對應到本人
- 電信帳單代付：費用併入門號的帳單，付款紀錄回到原本想避開的門號上
- PayPal 與超商付款：兩者都連到帳戶，超商付款需要先綁定玉山 e-Pay，並不等於在超商用現金付款
- Google Play 禮物卡：在超商用現金購買後儲值，付款不經過銀行與電信業者

禮物卡只處理了金流，Google 帳號通常綁著手機號碼或其他 email，裝置登入 Google Play 也會留下紀錄。要讓 Google 帳號也與本人脫鉤，需要另外準備一個沒有個人資料的帳號。Google 的隱私權政策寫明，登入時會把裝置的唯一識別碼與帳號一起保存[^12]，同一支手機先後登入本名帳號與新帳號，兩個帳號的紀錄可能指向同一台裝置，要完全拆開需要一支沒有登入過本名帳號的手機。同一份政策也列出會蒐集行動網路資訊，包括電信業者名稱與電話號碼，手機裡插著本名門號的 SIM 卡時，付款的 Google 帳號也可能連到這個號碼，繞了一圈又回到門號上。金流為什麼特別難匿名，見[為什麼匿名支付重要](../../basics/payments-anonymity.md)。

## 還沒解決的問題

付款與註冊幾乎同時發生，兩邊的時間都可以調閱。Signal 回應調閱時會提供帳號的註冊時間[^2]，Google 有精確的付款時間與付款人。兩份資料放在一起，註冊前幾分鐘內付款的人就是候選名單。就算只有 Signal 自己的資料，前面提到的付款日期也能把範圍縮到同一天付款的人。

beta 期間用這種方式註冊的人還不多，同一天、同幾分鐘內的購買可能只有少數幾筆，比對相對容易。使用的人增加之後，同一天的名單會變長，但無法預期什麼時候會長到足以掩護個人，現在就要把這項風險當成存在。論壇上已經有使用者提出同樣的疑慮，建議 Signal 把註冊時間的紀錄降到以日計[^3]，截至 9 月 23 日 Signal 還沒有回應。

註冊當下的連線 IP 是另一條線索。Signal 公開的伺服器原始碼裡，不綁門號的註冊流程沒有讀取 IP，帳號資料也沒有 IP 欄位[^11]，但速率限制等機制會經手連線 IP，其中部分模組沒有公開原始碼，保留多久無從確認。付款那一端，Google 的隱私權政策寫明會蒐集 IP 位址[^12]。擔心這一點的使用者，可以在付款與註冊時都透過 Tor 或 VPN 連線。

沒有 Google Play 服務的手機目前無法付款，也就無法用這種方式註冊。[GrapheneOS](../../tools/grapheneos.md) 預設不帶 Google 服務，使用者要先裝上沙盒化的 Google Play 並登入 Google 帳號才能付款[^9]。其他付款方式還沒有公布是哪些。

iOS 版還沒有公布時程。Signal 說明頁的註冊步驟寫著用 Apple Pay 或 Google Pay 付款[^4]，與論壇公告所說的 Play Store 內購不同，說明頁可能還沒定稿。

## 不同追查情境下的做法

只想避免聯絡人或陌生人看到號碼的話，現有的 username 就夠了，iPhone 使用者現在也可以設定。在 Signal 的隱私設定裡，把號碼的可見範圍與可搜尋範圍都設成「沒有人」，對外只給 username。

記者的消息來源、跨境工作的倡議者這類需要讓帳號對應不回本人的使用者，改用 Signal Login 之後，帳號與本人之間少了門號這條直接的線索，付款日期與時間比對的線索仍然存在。付款盡量選禮物卡這類不經過銀行的方式，Account ID 與金鑰存進密碼管理器並另外備份。beta 版可能還有錯誤，帳號的金鑰又只有一份，重要的聯絡管道等正式版推出再搬過去比較穩妥。

如果要防的是有人證明你用過 Signal，Signal Login 無法處理，Google 的購買紀錄本身就是證據，用門號註冊同樣會留下紀錄。需要連使用過都不留痕跡的情境，要回到[威脅模型](../../basics/threat-model.md)重新評估，替代方案見下一節。

## Signal 之外的替代方案

評估之後認為 Signal Login 也不夠用時，要看風險落在哪一層再選工具（各工具的完整比較見[匿名通訊工具比較](../../tools/messaging-comparison.md)）。

| 評估出的風險 | 替代方案 | 適合的理由 | 主要代價 |
|---|---|---|---|
| 帳號會對應回本人 | [SimpleX](https://simplex.chat/){target="_blank"} | 沒有任何使用者識別碼，每段對話各用一組獨立的佇列，註冊不需要門號、email 或付款 | 學習曲線高，沒有傳統的聯絡人列表 |
| 同上，希望操作接近一般通訊軟體 | [Threema](https://threema.com/){target="_blank"} | 不需要門號或 email，帳號是隨機產生的 8 碼 Threema ID，官方商店可以用現金或比特幣購買授權碼，付款不經過 Google 或 Apple | 需付費，定價 6 美元或 6 歐元，依商店與國家而定。伺服器由 Threema 集中營運，位於瑞士。沒有綁門號或 email 時，忘記 ID 就無法找回 |
| 同上，不想付費 | [Session](https://getsession.org/){target="_blank"} | 帳號是隨機 ID，靠一組助記詞復原，流量經過多跳路由 | 目前的正式版沒有前向保密，所有訊息用同一把長期金鑰加密，金鑰一旦外洩，過去的訊息都可能被解開，具前向保密的新協議還沒有發布[^13]。群組功能較弱、訊息延遲較高 |
| 不信任中央伺服器，或擔心伺服器端的紀錄被調閱 | [Briar](https://briarproject.org/){target="_blank"} | 點對點傳訊，沒有中央伺服器，網路中斷時還能用藍牙與 Wi-Fi 在近距離傳訊 | 沒有 iOS 版，一台裝置就是一個帳號，雙方要同時在線才能傳送（可用一台閒置的 Android 手機架 Briar Mailbox 代收） |
| 團體長期協作，想自行掌握伺服器 | [Matrix](https://matrix.org/){target="_blank"}（自架 homeserver） | 伺服器與紀錄的保存方式由社群自行決定 | homeserver 看得到誰在哪個房間、何時發言，公開房間預設不加密 |
| 手機可能被扣押或檢查 | [Molly](https://molly.im/){target="_blank"} | Signal 的 Android 分支，沒有密碼就打不開手機裡的聊天紀錄，閒置一段時間後自動上鎖，通知可以不經過 Google 的推播服務 | 仍走 Signal 的伺服器、仍要註冊帳號，只處理裝置這一層 |

如果風險只是 Signal 在所在地被封鎖，可以先試 [Signal Proxy](../../tools/signal-proxy.md)，不一定要換工具。

換工具時對方也要一起安裝，比較可行的做法是分流，只把最敏感的幾個聯絡人搬到新工具，其他對話留在原處。

從 Google Play 或 App Store 安裝 SimpleX、Session，下載紀錄同樣留在 Google 或 Apple 帳號裡，跟 Signal Login 的付款紀錄屬於同一類問題。Android 可以改用 F-Droid 或官方網站提供的 APK，iOS 沒有這個選項。

SimpleX 能處理身分，無法處理手機被扣押。Briar 不經過伺服器，但沒有 iOS 版。每個工具只涵蓋其中幾層，先確定要防的是哪一層再選工具，判斷方式見[威脅模型如何建立](../../basics/threat-model.md)。

### Signal 帳號的刪除

只刪除 App，帳號仍留在 Signal 的伺服器上，綁定的門號與註冊時間也還在，要從 App 內的「設定 → 帳號 → 刪除帳號」正式刪除。刪除前先把群組管理員權限交給其他成員，並透過其他管道告知聯絡人新的聯絡方式，避免對方繼續傳訊息到已經停用的帳號。

## 相關閱讀

- [Metadata 是什麼](../../basics/metadata.md)：訊息加密之後，誰跟誰聯絡、什麼時候聯絡仍然看得到
- [為什麼匿名支付重要](../../basics/payments-anonymity.md)：金流紀錄為什麼比其他 metadata 更難消除
- [匿名通訊工具比較](../../tools/messaging-comparison.md)：Signal、SimpleX、Session、Briar、Matrix 的身分模型差異
- [記者保護消息來源](../../scenarios/journalist.md)：與消息來源第一次接觸、交換聯絡方式與檔案的做法
- [出差與研討會的數位準備（東亞與東南亞）](../../scenarios/asia-travel.md)：各地的 SIM 實名、入境查機現況與跨境門號的取捨
- [社運行動者的數位準備](../../scenarios/activist.md)：行動中的通訊與裝置設定、被盤查時的應對
- [介紹 Signal 自動金鑰驗證](./signal-automatic-key-verification.md)：Signal 2026 年 8 月推出的另一項安全更新

[^1]: [Keep your phone number private with Signal usernames](https://signal.org/blog/phone-number-privacy-usernames/){target="_blank"} - Signal Blog
[^2]: [Government Communication](https://signal.org/bigbrother/){target="_blank"} - Signal
[^3]: [Beta feedback for the upcoming Android 8.28 release](https://community.signalusers.org/t/beta-feedback-for-the-upcoming-android-8-28-release/76457){target="_blank"} - Signal Community Forum
[^4]: [Phone Numberless Registration for Android](https://support.signal.org/hc/en-us/articles/11197884108826-Phone-Numberless-Registration-for-Android){target="_blank"} - Signal Support
[^5]: [Donor FAQs](https://support.signal.org/hc/en-us/articles/360031949872-Donor-FAQs){target="_blank"} - Signal Support
[^6]: [LoginPurchaseManager.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/subscriptions/LoginPurchaseManager.java){target="_blank"} - signalapp/Signal-Server
[^7]: [Accounts.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/storage/Accounts.java){target="_blank"}、[RedeemedReceiptsManager.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/storage/RedeemedReceiptsManager.java){target="_blank"} - signalapp/Signal-Server
[^8]: [Google Play 接受的付款方式 - 台灣](https://support.google.com/googleplay/answer/2651410?hl=zh-Hant&co=GENIE.CountryCode%3DTW){target="_blank"} - Google Play 說明
[^9]: [GrapheneOS usage guide](https://grapheneos.org/usage){target="_blank"} - GrapheneOS
[^10]: [IssuedReceiptsManager.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/storage/IssuedReceiptsManager.java){target="_blank"} - signalapp/Signal-Server
[^11]: [RegistrationController.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/controllers/RegistrationController.java){target="_blank"} - signalapp/Signal-Server
[^12]: [Google 隱私權政策](https://policies.google.com/privacy?hl=zh-TW){target="_blank"} - Google
[^13]: [Session Protocol V2](https://getsession.org/session-protocol-v2){target="_blank"} - Session
