---
title: 藍牙追蹤器的偵測與處理
description: AirTag 這類藍牙追蹤器被偷放進包包或車上時，iPhone 與 Android 可以自動警示，也可以手動掃描。本頁說明兩種手機各自偵測得到哪些追蹤器、收到警示後如何找出來，以及找到之後先顧安全、再決定是否停用。
icon: material/bluetooth
---

# :material-bluetooth: 藍牙追蹤器的偵測與處理

AirTag、Tile、Samsung SmartTag 這類藍牙追蹤器原本用來找鑰匙與行李，體積跟硬幣相近，塞進包包夾層、外套口袋或車上都不容易發現。放的人在自己的手機上就看得到追蹤器目前的位置，被追蹤的人可能完全不知情。

iPhone 與 Android 都內建偵測功能，有不明追蹤器跟著你移動一段時間之後會發出警示，也可以手動掃描附近。兩邊偵測得到的品牌不同，警示也有延遲。本頁整理各自的範圍、收到警示之後如何找出追蹤器，以及找到之後的處理。

本頁依 EFF Surveillance Self-Defense 的〈How to: Detect Bluetooth Trackers〉改寫，並依 Apple 與 Google 2026 年的官方說明更新步驟（出處與差異見[本頁的來源與核對](#本頁的來源與核對)）。

!!! warning "懷疑是伴侶、前任或家人放的"

    停用追蹤器之後，對方會發現位置不再更新，可能改用更危險的方式。處理之前先讀 [家暴受害者的數位準備](../scenarios/domestic-violence.md) 的〈離開是風險最高的時刻〉，或撥 `113` 保護專線討論安全計畫。

!!! tip "時間有限的話，先看這幾點"

    - iPhone 更新到 iOS 17.5 以上、Android 6.0 以上，系統就會自動警示 AirTag 與相容的追蹤器，前提是藍牙、定位與通知都開著
    - 警示要等追蹤器跟著你移動一段時間才會出現，懷疑的當下改用手動掃描
    - Android 內建手動掃描，iPhone 沒有，需要另外安裝 AirGuard
    - 找到之後先截圖保留序號與擁有者資訊，再決定要不要停用

## 藍牙追蹤器的運作方式

追蹤器本身沒有 GPS，也沒有行動網路。它持續發出藍牙訊號，附近的手機收到之後，把手機自己的大概位置回報給廠商，擁有者再從 App 看到追蹤器在哪裡。Apple 的網路叫「尋找」，iPhone 預設都會參與。Google 的網路叫「尋找中心」，Samsung 與 Tile 各有自己的網路。參與的手機越多位置越準，在人多的城市通常相當準確[^ssd]。

擁有者要用帳號註冊追蹤器，帳號通常綁著姓名、email 或電話號碼，追蹤器被找到時，這是可以追查的線索。AirTag 可以共享給其他人，被共享的人不會收到這顆 AirTag 的警示，掃描 AirTag 取得的擁有者資訊也不會顯示它共享給了誰[^ssd]。

AirTag 的擁有者只看得到目前的位置，看不到移動的歷史紀錄。Tile、Samsung SmartTag 等其他品牌則可能保留歷史紀錄給擁有者[^ssd]。

## 常見的追蹤器

- **Apple AirTag**：白色圓形，比十元硬幣略大
- **Tile**：有方形、卡片型、貼片型等多種外型
- **Samsung Galaxy SmartTag**
- **Chipolo、Pebblebee、Motorola moto tag**：部分型號可以加入 Apple 的「尋找」或 Google 的「尋找中心」[^google]

AirTag 與相容的追蹤器離開擁有者一段時間之後，移動時會發出提示聲[^apple]。沒有智慧型手機的人，這個聲音可能是唯一的線索，但喇叭可以被拆掉，聽不到聲音不代表沒有追蹤器[^ssd]。

藏放的位置以包包內袋與夾層、外套口袋、車上最常見，車上包含車牌後方[^ssd]。

## 手機的自動警示

| | iPhone | Android |
|---|---|---|
| 系統需求 | iOS 14.5 以上可以偵測 AirTag 與「尋找」網路配件，iOS 17.5 以上再加上相容的第三方追蹤器 | Android 6.0 以上，功能由 Google Play 服務在背景更新 |
| 偵測得到 | AirTag、AirPods、「尋找」網路配件、相容的藍牙追蹤器 | AirTag、與「尋找中心」相容的追蹤器與耳機 |
| 要另外處理 | Samsung SmartTag、Tile | Samsung SmartTag、Tile |

Apple 與 Google 的說明頁都沒有把 Samsung SmartTag 與 Tile 列為相容的追蹤器[^apple][^google]，這兩個品牌要靠各自的 App 或 AirGuard（見[手動掃描](#手動掃描)）。

警示要等追蹤器跟著你移動一段時間才會出現，Apple 與 Google 都沒有公布確切的時間，EFF 測試時最長要等到 24 小時[^ssd]。借朋友的鑰匙、跟帶著追蹤器的人同行，也可能收到警示，收到時先想想最近有沒有借用別人的東西。

=== "iPhone"

    確認以下設定都已開啟[^apple]：

    1. 「設定」>「一般」>「關於本機」，確認 iOS 版本。17.5 以上才偵測得到第三方追蹤器
    2. 「設定」>「隱私權與安全性」>「定位服務」，開啟「定位服務」，再到「系統服務」開啟「重要位置」
    3. 「設定」>「藍牙」，開啟藍牙
    4. 「設定」>「通知」>「追蹤通知」，開啟「允許通知」
    5. 關閉飛航模式，飛航模式下收不到追蹤通知

    警示的文字會是「偵測到有 AirTag 正跟著你移動」、「已偵測到你身旁有一個（產品名稱）」或「已偵測到未知的配件」。點開通知，「尋找」會顯示地圖，紅點是你的 iPhone 偵測到這個物品的位置，虛線標出偵測的順序。紅點的時間不代表擁有者在那個時間查看了位置[^apple]。

    點「繼續」之後有兩個選項：

    - **播放聲音**：讓追蹤器發出聲音。無法播放時，可能是物品已經不在身邊、擁有者就在附近，或識別碼已經變更
    - **尋找附近**：未知的物品是 AirTag，而且你的 iPhone 有超寬頻晶片時，畫面會顯示到 AirTag 的距離與方向

    向家人借用的物品，可以在通知裡把該物品的警示關閉一天或永久關閉。之前收到的警示列在「尋找」>「物品」最下方的「在你身旁偵測到未知的物品」[^apple]。

=== "Android"

    警示功能預設開啟。確認的位置在「設定」>「安全與緊急救援」>「不明追蹤器警示」，「允許顯示警示」要開著。Android 11 以下在「設定」>「Google」>「個人與裝置安全」>「不明追蹤器警示」。自動警示需要開啟位置資訊[^google]。

    點開通知會顯示地圖，標出系統偵測到追蹤器跟著你移動的位置。接著可以：

    - **播放音效**：讓追蹤器發出聲音，擁有者不會收到通知
    - **後續步驟 > 尋找附近的裝置**：限與「尋找中心」相容的追蹤器，越靠近，畫面上的圖案填得越滿

    同一個追蹤器每天只會警示一次。之前的警示在同一個設定頁中央的按鈕查看，48 小時後刪除[^google]。

## 手動掃描

自動警示要等追蹤器跟著你移動一段時間，懷疑的當下可以手動掃描。在停車場、公寓大樓這類人多的地方，結果會混進別人的追蹤器，盡量到附近沒有其他人的地方掃描，多掃幾次比對[^ssd]。

=== "Android"

    「設定」>「安全與緊急救援」>「不明追蹤器警示」>「立即掃描」，大約 10 秒完成。結果只列出不在擁有者身邊的追蹤器。Android 11 以上不必開啟位置資訊也能掃描[^google]。

    內建掃描找不到 Samsung SmartTag 與 Tile。要一併偵測，可以安裝 AirGuard，Android 版偵測得到 AirTag、Samsung SmartTag 與「尋找中心」的追蹤器[^airguard]。

=== "iPhone"

    iPhone 沒有內建手動掃描，需要安裝第三方 App。EFF 測試過的是德國達姆施塔特工業大學（TU Darmstadt）研究團隊開發的 AirGuard，iPhone 版偵測得到 Samsung SmartTag 與 Tile[^airguard]。

    AirGuard 會要求位置、藍牙與通知權限。不給位置權限也能使用，只是不會記錄在哪裡偵測到追蹤器[^ssd]。開啟掃描頁面之後，點選不認得的追蹤器，進入搜尋畫面，畫面上的百分比是手機跟追蹤器之間的訊號強度。拿著手機移動，數字變大代表越來越近，到 90% 以上時追蹤器就在很近的地方[^ssd]。

    EFF 測試時，AirGuard 有幾次比預期晚才偵測到追蹤器，不要只依賴它[^ssd]。

=== "Samsung Galaxy"

    除了 Android 內建的警示，Samsung 的 SmartThings App 在 SmartThings Find 的設定裡有「未知標籤偵測」（Unknown tag detection），未知的智慧標籤跟著你移動時會通知你[^samsung]。台灣介面的選項名稱可能與此不同，找不到時用 App 裡的搜尋。

## 找到追蹤器之後

追蹤器可能是伴侶、前任或家人放的時候，先想清楚安全。停用之後對方會知道你發現了，可能改用其他方式找你。先跟信任的人或 `113` 保護專線討論，再決定如何處理[^ssd]。

### 保留證據

- 截圖警示畫面與地圖
- AirTag：把 iPhone 或有 NFC 的 Android 手機頂端靠近 AirTag 白色那一面，會打開一個網頁，顯示序號與註冊者電話號碼的末四碼。電話可能是另外申辦的門號[^apple][^ssd]
- AirTag 的擁有者如果把它標示為遺失，網頁會顯示擁有者留下的聯絡資訊[^apple]
- 其他品牌：照手機畫面的指示取得裝置 ID，部分追蹤器的機身印有序號[^google]

### 停用

- 在警示畫面點「停用說明」，照著畫面操作，通常是取出電池。停用之後擁有者不再收到位置更新，但可能仍看得到停用前最後的位置[^apple][^google]
- 部分追蹤器停用之後會回到出廠設定，不再連結原本的擁有者，警方就無法再向廠商查詢擁有者。打算報案的話，先截圖保留資訊，再決定是否停用[^google]
- 關閉手機的藍牙、定位或開啟飛航模式，擋不住擁有者看到追蹤器的位置，其他人的手機仍會回報它[^apple][^google]

### 報案與求助

覺得有立即危險時，先到人多的公共場所，再撥 `110`。警方可以向 Apple 等廠商調閱擁有者的資料，會需要追蹤器的序號或裝置 ID[^apple]。

在台灣，[跟蹤騷擾防制法](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0080211&flno=3){target="_blank"} 第 3 條把「監視、觀察、跟蹤或知悉特定人行蹤」列為跟蹤騷擾行為之一，要件是反覆或持續、違反對方意願、與性或性別有關，並使對方心生畏怖。對象是特定人的配偶、親屬等關係密切的人時，不需要與性或性別有關[^stalking]。是否構成要看個案，報案時把上面保留的證據一併帶著。家暴相關的保護令與求助管道見 [家暴受害者的數位準備](../scenarios/domestic-violence.md) 的〈台灣的求助管道與法律〉。

## 偵測的限制

- 警示有延遲，Android 上同一個追蹤器每天只警示一次[^google]
- 追蹤器的藍牙識別碼會定期變更，離開擁有者較久時大約一天變更一次，變更之後系統會把它當成新的追蹤器[^google]
- 只偵測得到加入 Apple 與 Google 共同標準的品牌，其他品牌要靠各自的 App 或 AirGuard
- 插 SIM 卡、自行用行動網路回報位置的 GPS 定位器不靠附近的手機回報，本頁的偵測方式找不到它們，只能實際檢查包包與車輛
- 手機上的追蹤類 App、共用帳號的位置分享是另一種管道，見 [家暴受害者的數位準備](../scenarios/domestic-violence.md) 與 [手機隱私設定逐步指引](./phone-privacy-settings.md) 的第 7 步

## 本頁的來源與核對

本頁依 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的〈[How to: Detect Bluetooth Trackers](https://ssd.eff.org/module/how-to-detect-bluetooth-trackers){target="_blank"}〉改寫，原文的審閱日是 2024-07-15，以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授權。改寫時加入台灣的求助管道與法規，並依官方說明更新了三處：

- Android 從 6.0 起就內建不明追蹤器警示，原文寫 Android 14 以上
- iPhone 從 iOS 17.5 起偵測得到相容的第三方追蹤器，原文寫只偵測得到 AirTag
- 部分追蹤器停用之後會回到出廠設定，警方無法再查詢擁有者，原文沒有提到

本頁未經 EFF 審閱，內容與原文不同之處由匿名網路社群 anoni.net 負責。

步驟依下列官方說明整理，2026 年 11 月核對：

- iPhone：Apple 支援〈如果收到提示指出有 AirTag、AirPods、「尋找」網絡配件或相容的藍牙位置追蹤裝置在你身邊，該如何處理〉，該頁的發佈日期是 2026-03-24 <!-- docs-style-lint: disable-line -->
- Android：Android 說明中心〈尋找不明追蹤器〉
- Samsung Galaxy：Samsung 美國支援頁，台灣介面的名稱沒有核對

照著做卻找不到選項，歡迎到社群的線上聊天室（[Matrix 公開 room](https://anoni.net/services/){target="_blank"}）告訴我們手機型號與系統版本，我們會查證後更新。

## 相關閱讀

- [家暴受害者的數位準備](../scenarios/domestic-violence.md)：位置追蹤之外的帳號共用、追蹤類 App 與智慧家庭，以及如何在不驚動對方的前提下確認
- [手機隱私設定逐步指引](./phone-privacy-settings.md)：第 7 步檢查誰看得到你的位置
- [監控現在做得到什麼](../basics/surveillance-capability.md)：平台、電信、國家與商用間諜軟體各自的能力邊界
- [威脅模型如何建立](../basics/threat-model.md)：先想清楚面對的是誰，再決定要做到哪裡

[^ssd]: [How to: Detect Bluetooth Trackers](https://ssd.eff.org/module/how-to-detect-bluetooth-trackers){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2024-07-15。
[^apple]: [如果收到提示指出有 AirTag、AirPods、「尋找」網絡配件或相容的藍牙位置追蹤裝置在你身邊，該如何處理](https://support.apple.com/zh-tw/119874){target="_blank"} - Apple 支援，發佈日期 2026-03-24。 <!-- docs-style-lint: disable-line -->
[^google]: [尋找不明追蹤器](https://support.google.com/android/answer/13658562?hl=zh-Hant){target="_blank"} - Android 說明。支援的追蹤器、手動掃描、停用後回到出廠設定與識別碼變更的說明都在這一頁。
[^airguard]: [AirGuard](https://github.com/seemoo-lab/AirGuard){target="_blank"} - 達姆施塔特工業大學 Secure Mobile Networking Lab，以及 App Store 與 Google Play 上的 App 說明。iPhone 版最近一次更新是 2025-05，Android 版是 2026-09。
[^samsung]: [Use SmartThings Find with the SmartThings app](https://www.samsung.com/us/support/answer/ANS10004549/){target="_blank"} - Samsung 美國支援頁。
[^stalking]: [跟蹤騷擾防制法 第 3 條](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0080211&flno=3){target="_blank"} - 全國法規資料庫。
