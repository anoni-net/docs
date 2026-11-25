---
title: 手機的位置追蹤與監控手法
description: 手機只要開著就不斷向外發出訊號，基地台、偽基地台、Wi-Fi 與藍牙、App 與廣告識別碼都能拿來定位你。本頁從手機本身出發，說明每一種追蹤方式能做到什麼、你能做什麼，以及感測器、生物辨識、一次性手機與手機被扣押時的鑑識。
icon: material/cellphone-marker
---

# :material-cellphone-marker: 手機的位置追蹤與監控手法

手機一直在用發出的訊號告訴別人你在哪裡，這是它對隱私最深、也最不容易察覺的威脅。除了你主動分享的位置，至少還有四種方式可以追蹤一支手機：基地台、偽基地台、Wi-Fi 與藍牙，以及 App 與網頁洩漏的位置[^ssd-loc]。

本頁從手機本身出發，說明每一種方式的原理與你能做的事。誰有能力做這些事、成本多高，見 [監控現在做得到什麼](./surveillance-capability.md)。實際要調整的設定，見 [手機隱私設定逐步指引](../tools/phone-privacy-settings.md)。

本頁依 EFF Surveillance Self-Defense 的手機系列五篇合併改寫（出處見[本頁的來源與核對](#本頁的來源與核對)）。

!!! tip "時間有限的話，先看這幾點"

    - 手機開機、插著 SIM 卡，電信業者就知道你大概在哪裡，這一點除了不帶手機之外沒有辦法
    - App 的位置權限能關就關，能給大概位置就不給精確位置，廣告識別碼也一併關閉
    - 台灣已經沒有 2G 網路，手機出現 2G 訊號很可能是偽基地台
    - 一般電話與簡訊不安全，敏感的內容改用端對端加密的通訊工具

## 基地台的定位

手機開機並連上電信網路時，電信業者就能從各基地台收到的訊號推算出手機的位置。有三座以上基地台時，精確度大約一公里，較新的網路還能回報手機的 GPS 座標。只要手機開機、插著登記過的 SIM 卡並連上電信網路，就無法躲過這種追蹤[^ssd-loc]。

政府可以要求電信業者交出即時或過去的位置紀錄，也可以要求列出某個時間、某個地點出現過的所有手機（基地台資料調取，tower dump），例如查出誰出現在某一場抗議[^ssd-loc]。台灣的電信業者保存哪些紀錄、保存多久，見 [監控現在做得到什麼](./surveillance-capability.md) 的〈電信商〉。

能做的事很有限，追蹤是在電信業者那一端發生的，唯一的方法是不帶手機[^ssd-loc]。

## 偽基地台

偽基地台（IMSI catcher，也叫 Stingray）是可以帶著走的假基地台，冒充正牌基地台，讓附近的手機連上，藉此偵測手機在場、監聽通訊。很多偽基地台利用的是 2G 網路的安全缺陷[^ssd-loc]。

偽基地台在台灣也被詐騙集團拿來用。2024 年刑事局破獲首宗假冒政府專屬簡訊的案件，嫌犯把基地台訊號發射器放在車上，假冒「111 政府專屬短碼」發送釣魚簡訊。NCC 提醒，台灣已經關閉 2G 網路，手機收到 2G 訊號屬於不正常，可能遇到假基地台[^cna]。

- **Android**：支援的手機可以關閉 2G，之後就不會搜尋或連上 2G 網路，撥打緊急電話時例外。Android 的說明也寫到，即使電信業者已經不提供 2G，關閉 2G 仍然重要。開關的位置依品牌不同，多在 SIM 卡或行動網路的設定裡[^aosp-2g]
- **iPhone**：開啟封閉模式會停用 2G，但也會關掉很多其他功能[^ssd-loc]
- **通訊內容**：改用端對端加密的通訊工具，即使連上偽基地台，內容也無法被攔截[^ssd-loc]

## Wi-Fi 與藍牙

Wi-Fi 與藍牙的訊號傳得比行動網路近，通常在同一個房間或同一棟建築內收得到。兩者的訊號都帶有裝置的硬體位址（MAC 位址），開著 Wi-Fi 的手機會不時發出搜尋網路的訊號，零售商店過去就用這些位址追蹤顧客的動線[^ssd-loc]。

新版的 iOS 與 Android 在搜尋網路時預設使用隨機的 MAC 位址，追蹤變得困難許多，但實作可能有漏洞。連上某個網路時，手機通常會對該網路使用固定的位址，網路的經營者就能認出你是不是之前來過的那台裝置，不需要你輸入任何姓名或 email。iOS 18 以後大約每兩週更換一次位址，Android 可以在各 Wi-Fi 網路的隱私設定裡選擇使用隨機的 MAC 位址。在意這類追蹤時，可以暫時關閉 Wi-Fi 與藍牙[^ssd-loc]。

別人放在你身上的藍牙追蹤器是另一回事，偵測方式見 [藍牙追蹤器的偵測與處理](../tools/bluetooth-tracker.md)。

## App 與網頁洩漏的位置

手機用 GPS、附近的基地台與 Wi-Fi 推算自己的位置，App 取得權限之後就能讀取，有些 App 會把位置傳回自己的伺服器，再分享給合作的第三方。位置紀錄能看出的不只是你現在在哪裡，還有你的信仰、參加過的活動與人際關係，例如誰在什麼時段去了誰家、誰出席了某場會議或抗議，或是記者的消息來源是誰。美國的執法機關就曾多次不經令狀，直接購買 App 蒐集的位置資料[^ssd-loc]。

能做的事是盡量收回 App 的位置權限，能給大概位置就不給精確位置，想想每個 App 是否真的需要。導航需要精確位置，天氣 App 輸入城市名稱通常就夠了，遊戲多半不需要。不確定時就收回，之後隨時可以再給[^ssd-loc]。位置權限的設定步驟見 [手機隱私設定逐步指引](../tools/phone-privacy-settings.md) 的第 4 步。

## 廣告識別碼與行為資料

很多 App 內建廣告公司的程式碼，記錄你安裝、打開、使用 App 的行為，透過即時競價廣告分享給數十家廣告商與資料仲介。單一筆資料看起來無關緊要，靠廣告識別碼串起來之後，就能拼出一個人在不同 App 裡的完整行為。廣告識別碼本身不含真實身分，但資料仲介要把它對應到本人並不難，例如從 App 裡填過的姓名或 email。政府也曾搭著這些商業監控取得資料[^ssd-loc]。

iPhone 的 App 要先取得你的同意才能讀取廣告識別碼，Android 預設每個 App 都讀得到，但可以刪除[^ssd-loc]。設定步驟見 [手機隱私設定逐步指引](../tools/phone-privacy-settings.md) 的第 5 步，平台還蒐集了什麼見 [社群平台怎麼收集你的資料](./platform-tracking.md)。

## 一般電話與簡訊

行動網路當初設計時沒有考慮防止竊聽。現在雖然有加密，但很多加密技術設計不良、部署不一致，部分國家的電信業者甚至沒有開啟加密，用對的無線電設備仍可能攔截空中傳送的通話與簡訊，執法機關也能直接從電信業者取得內容。最安全的假設是一般電話與簡訊都沒有防竊聽保護[^ssd-spy]。

敏感的內容改用端對端加密的工具，例如 Signal、WhatsApp，以及 iMessage（只有雙方都用 Apple 裝置、對話泡泡是藍色時才有端對端加密）[^ssd-spy]。Signal 的設定見 [Signal 的設定與群組管理](../tools/signal-guide.md)。

## 手機裡的元件與感測器

- **GPS**：GPS 衛星只發送訊號，不接收任何東西，衛星不知道誰在使用。所謂的「GPS 追蹤」是手機上的 App 讀取位置再傳出去。執法機關可以向 App 業者調取特定人的 GPS 資料，也有要求業者列出某時某地所有裝置的「地理圍欄」調取[^ssd-sensors]
- **NFC**：感應距離大約四公分，用在行動支付、門禁與旅館房卡。它不會知道你在世界上的哪裡，但每次感應付款或進出建築都可能留下紀錄。Android 可以關閉 NFC，iPhone 的 NFC 只開放給 Apple Pay 與 AirDrop 這類功能[^ssd-sensors]
- **動作與環境感測器**：加速度計與陀螺儀用來計步、導航，研究顯示加速度計可以從振動推測附近電腦鍵盤的按鍵，陀螺儀可以當作粗糙的麥克風。實際被這樣利用的機會很低，把手機收進包包或口袋就能降低風險。其他還有磁力計、氣壓計、距離感測器、環境光感測器、LiDAR，以及 iPhone 用來跟 AirTag 等 Apple 裝置溝通的 U1、U2 晶片[^ssd-sensors]

## 生物辨識解鎖

存在手機上的指紋與臉部資料經過加密，放在與系統其他部分隔離的安全硬體裡，不會離開手機，Apple、Google 這些廠商也拿不到。惡意軟體要讀取這些資料，必須先攻破那塊隔離的硬體，門檻很高，所以惡意軟體通常改試著繞過生物辨識鎖[^ssd-bio]。

生物辨識防不了的是有人要你「自願」解鎖，例如執法人員與海關。這跟硬體無關，是權力關係的問題。處境涉及執法單位時，只用 PIN 碼或密碼解鎖比較安全[^ssd-bio]。過境時的準備見 [出差與研討會的數位準備](../scenarios/asia-travel.md)。

數位身分或年齡驗證要你掃臉、上傳自拍時，資料送去哪裡、存在哪裡，跟手機本身的生物辨識完全不同，第三方服務讀不到你手機上用來解鎖的生物辨識資料[^ssd-bio]。台灣的行動自然人憑證則走 FIDO 標準，搭配手機本身的生物辨識（見 [一般人平常該做到什麼](../scenarios/everyday-baseline.md)）。

## 惡意軟體與關機

手機上的惡意軟體可以讀取簡訊與照片，偷偷開啟麥克風、相機與 GPS，也可以在 Signal、WhatsApp 的訊息於手機上解密顯示時讀取內容[^ssd-other]。iPhone 的封閉模式能擋下部分惡意軟體，Google 的進階保護計畫替整個 Google 帳號加上保護[^ssd-other]。一般惡意軟體的防範見 [惡意軟體的防範與處理](../tools/malware.md)。

有人建議談敏感的事情前把手機關機，甚至拔掉電池，因為有些惡意軟體會讓手機看起來關機、實際上仍在監聽。現在的手機多半拆不了電池，比較好的做法是把手機放進法拉第袋，2G 到 5G、藍牙、Wi-Fi 與 GPS 的訊號都會被擋住，即使手機已經被入侵也一樣[^ssd-other]。

## 一次性手機的限制

用完就丟的手機（burner）要真的難以追蹤，條件相當嚴格[^ssd-other]：

- 換 SIM 卡或把 SIM 卡移到別支手機，保護很有限，電信業者看得到哪張 SIM 卡用在哪支手機上，eSIM 也一樣
- 不同的手機常常一起移動、在同樣的地點使用，分析人員就能推測它們屬於同一個人
- 每個人的通話對象組合幾乎獨一無二，換了號碼之後又打給同樣的家人與同事，新號碼很快就會被認出來

因此至少要做到：SIM 卡與手機都不重複使用、不同的手機不一起攜帶、不在相同的地點使用、不當成長期的方案、不同的手機不聯絡同一群人。這份清單還不完整，就已經很難做到[^ssd-other]。台灣的預付卡也要實名登記，取捨見 [社運行動者的數位準備](../scenarios/activist.md) 的〈一次性手機（burner）的取捨〉。

## 手機被扣押時的鑑識

手機鑑識已經是成熟的專業，鑑識人員把扣押的手機接上專用設備，能讀出通話紀錄、照片、位置紀錄、App 資料與訊息，包括 Signal、WhatsApp 這類加密通訊 App 裡的對話，有時還能救回已經刪除的簡訊。鑑識的第一步是解鎖，手機的安全機制能擋下一部分，但也曾經被鑑識設備突破[^ssd-other]。

遠端抹除可以在手機遺失或被偷時保護資料，但手機被執法機關扣押之後才抹除，在部分司法管轄區會被另外追究湮滅證據或妨礙偵查，後果可能比原本的案件還重[^ssd-other]。在台灣該如何處理，見 [社運行動者的數位準備](../scenarios/activist.md) 的〈刪除「證據」前的合規考量〉，並先諮詢律師。

## 本頁的來源與核對

本頁合併 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 手機系列的五篇改寫，都以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授權：

- 〈[Mobile Phones: Location Tracking](https://ssd.eff.org/module/mobile-phones-location-tracking){target="_blank"}〉，審閱日 2024-11-05
- 〈[Mobile Phones: Spying on Mobile Communications](https://ssd.eff.org/module/mobile-phones-spying-mobile-communications){target="_blank"}〉，審閱日 2024-11-05
- 〈[Mobile Phones: Phone Components and Sensors](https://ssd.eff.org/module/mobile-phones-phone-components-and-sensors){target="_blank"}〉，審閱日 2024-11-05
- 〈[Mobile Phones: Device-Bound Biometrics](https://ssd.eff.org/module/mobile-phones-device-bound-biometrics){target="_blank"}〉，審閱日 2026-10-28
- 〈[Mobile Phones: Other Surveillance Techniques](https://ssd.eff.org/module/mobile-phones-malware){target="_blank"}〉，審閱日 2024-11-05

改寫時加入台灣偽基地台的案例與 NCC 的提醒、Android 關閉 2G 的官方說明，美國的法院判決、計畫名稱與個案改為概述，並連到文件站既有的設定與情境頁。本頁未經 EFF 審閱，內容與原文不同之處由匿名網路社群 anoni.net 負責。

## 相關閱讀

- [監控現在做得到什麼](./surveillance-capability.md)：平台、電信、國家與商用間諜軟體各自的能力邊界
- [手機隱私設定逐步指引](../tools/phone-privacy-settings.md)：位置權限、廣告追蹤與遺失遭竊的設定
- [Metadata 是什麼，為什麼重要](./metadata.md)：通聯紀錄為什麼比內容更能看出一個人
- [社運行動者的數位準備](../scenarios/activist.md)：一次性手機、現場的裝置設定與法律支援

[^ssd-loc]: [Mobile Phones: Location Tracking](https://ssd.eff.org/module/mobile-phones-location-tracking){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2024-11-05。
[^ssd-spy]: [Mobile Phones: Spying on Mobile Communications](https://ssd.eff.org/module/mobile-phones-spying-mobile-communications){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2024-11-05。
[^ssd-sensors]: [Mobile Phones: Phone Components and Sensors](https://ssd.eff.org/module/mobile-phones-phone-components-and-sensors){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2024-11-05。
[^ssd-bio]: [Mobile Phones: Device-Bound Biometrics](https://ssd.eff.org/module/mobile-phones-device-bound-biometrics){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2026-10-28。
[^ssd-other]: [Mobile Phones: Other Surveillance Techniques](https://ssd.eff.org/module/mobile-phones-malware){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2024-11-05。
[^cna]: [刑事局破首宗假冒「111」政府簡訊騙個資 逮2嫌](https://www.cna.com.tw/news/asoc/202411220166.aspx){target="_blank"} - 中央社，2024-11-22。
[^aosp-2g]: [停用 2G](https://source.android.com/docs/security/features/cellular-security/disable-2g?hl=zh-tw){target="_blank"} - Android 開放原始碼專案。
