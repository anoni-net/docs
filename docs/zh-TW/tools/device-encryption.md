---
title: 裝置加密與資料抹除
description: 全碟加密讓遺失、被偷或被拿走的電腦與手機讀不出資料，也是固態硬碟唯一可靠的刪除方式。本頁說明復原金鑰該存在哪裡、Windows、Mac、Linux、iPhone、Android 如何開啟加密，以及丟棄檔案、出售或送出裝置之前要做的事。
icon: material/harddisk
---

# :material-harddisk: 裝置加密與資料抹除

筆電忘在公車上、手機被偷，或室友、同事、家人、執法人員取得你的裝置，裡面的資料能不能被讀出來，取決於有沒有開啟全碟加密（也稱為裝置加密）。開啟之後，裝置關機時整個儲存空間都是加密的，要輸入密碼登入才會解開，把硬碟拆下來接到別台電腦也讀不出內容[^ssd-enc]。

加密也跟刪除有關。把檔案丟進垃圾桶再清空，檔案仍留在磁碟上，現代電腦與手機用的固態硬碟（SSD）更是幾乎無法可靠地覆寫單一檔案。對 SSD 來說，事先加密、再重置裝置，是最實際的刪除方式[^ssd-del]。

本頁依 EFF Surveillance Self-Defense 的〈How to: Encrypt Your Windows, Mac, or Linux Computer〉與〈How to: Delete Your Computer's Data Securely〉兩篇合併改寫（出處見[本頁的來源與核對](#本頁的來源與核對)）。

!!! tip "時間有限的話，先看這幾點"

    - iPhone 設好密碼、Android 設好螢幕鎖定，手機就已經加密，重點是密碼夠長
    - 電腦確認 Windows 的「裝置加密」或 BitLocker、Mac 的「檔案保險箱」已經開啟
    - 復原金鑰存在 Microsoft 或 Apple 帳號裡比較不會弄丟，代價是廠商握有解鎖的鑰匙
    - 出售或送出裝置之前，先確認已加密，再用系統的重置功能清除

## 全碟加密擋得住什麼

全碟加密保護的是關機或鎖定中的裝置。開機登入之後資料就是解開的狀態，這時被人拿走、或被要求當場解鎖，加密都幫不上忙[^ssd-enc]。出入境被要求解鎖的情境見 [出差與研討會的數位準備](../scenarios/asia-travel.md)。

Windows 與 macOS 都內建免費的全碟加密，不必另外安裝軟體。兩者都是封閉原始碼，但使用 Windows 或 macOS 本來就某種程度信任了 Microsoft 與 Apple。多數 Linux 發行版用 LUKS（Linux Unified Key Setup）[^ssd-enc]。

## 復原金鑰存在哪裡

開啟加密時，系統會產生一組復原金鑰，忘記密碼時用它解鎖。金鑰與密碼都弄丟的話，資料多半就永遠救不回來了[^ssd-enc]。保存的方式有兩種：

- **存在 Microsoft 或 Apple 帳號裡**：忘記密碼時用帳號就能解鎖，廠商也能協助恢復存取。代價是廠商握有解密需要的金鑰，依法被要求時可能交給執法機關。對竊賊與其他人仍然有保護效果[^ssd-enc]
- **自行保存**：廠商拿不到金鑰，但弄丟了就沒有任何補救方式。撿到金鑰的人也能解鎖你的電腦，所以要存在安全的地方[^ssd-enc]

自行保存時，印在紙上的話，放進防火保險箱，或交給住在別處、你信任的親友。存成數位檔案的話，不要放在同一台電腦或你平常用的雲端硬碟，改存進密碼管理器，而且密碼管理器的帳號密碼要跟電腦的不同[^ssd-enc]。密碼管理器的選擇見 [密碼管理器入門](./password-manager.md)。

## 各裝置的開啟方式

=== "Windows"

    Windows 的全碟加密有兩種名稱，「裝置加密」與「BitLocker 磁碟機加密」。裝置加密在家用版也能使用，但硬體要支援。用 Microsoft 帳戶或公司、學校帳戶第一次登入時，裝置加密會自動開啟，復原金鑰也會存進該帳戶。使用本機帳戶時不會自動開啟[^ms-enc]。

    確認或開啟的位置是「設定」>「隱私權與安全性」>「裝置加密」，需要用系統管理員帳戶登入。看不到這個選項，可能是硬體不支援，或你登入的是標準使用者帳戶[^ms-enc]。

    BitLocker 只在專業版、企業版、教育版提供，開啟時可以選擇把復原金鑰存進 Microsoft 帳戶、存成檔案或印出來[^ssd-enc]。存在 Microsoft 帳戶裡的復原金鑰，可以在另一台裝置登入 [account.microsoft.com/devices/recoverykey](https://account.microsoft.com/devices/recoverykey){target="_blank"} 查看[^ms-key]。

    家用版的硬體又不支援裝置加密時，就沒有內建的加密可以用，EFF 建議改用 VeraCrypt，操作可以參考新聞自由基金會（Freedom of the Press Foundation）的教學[^ssd-enc]。

=== "Mac"

    配備 Apple 晶片或 T2 安全晶片的 Mac，資料本來就會自動加密。開啟「檔案保險箱」之後，必須輸入登入密碼才能解密，多一層保護。沒有這兩種晶片的 Mac，要開啟「檔案保險箱」才會加密[^apple-fv]。

    1. 「蘋果」選單 >「系統設定」>「隱私權與安全性」>「檔案保險箱」（可能需要向下捲動）
    2. 開啟「檔案保險箱」，輸入密碼
    3. 選擇忘記密碼時的解鎖方式：「允許我的 iCloud 帳號解鎖我的磁碟」，或「製作復原密鑰並且不使用我的 iCloud 帳號」。選後者的話，寫下復原密鑰並保存在安全的地方，不要跟 Mac 放在一起[^apple-fv]

=== "Linux"

    多數 Linux 發行版只能在安裝作業系統時開啟全碟加密，Ubuntu、Fedora、Arch Linux 都是如此。安裝時沒有開啟的話，通常要備份資料、清空磁碟、重新安裝[^ssd-enc]。

    以 Ubuntu 為例，在安裝程式的磁碟設定選擇使用 LVM 並加密新的安裝，接著設定加密用的密碼，也可以選擇產生復原金鑰。安裝完成後，每次開機都要先輸入加密密碼，這組密碼跟登入密碼不同[^ssd-enc]。各發行版的選項名稱與位置不同，以安裝程式的說明為準。

=== "iPhone"

    設定密碼就會開啟資料保護，用 256 位元 AES 加密 iPhone 上的資料[^apple-passcode]。位置在「設定」>「Face ID 與密碼」（依機型可能是「Touch ID 與密碼」）。6 位數字之外，可以在「密碼選項」改用更長的英數密碼。

=== "Android"

    Android 10 以上出廠的新裝置使用檔案型加密[^aosp-enc]。保護效果取決於螢幕鎖定，沒有設定 PIN、圖案或密碼時，取得手機的人不需要任何密碼就能讀取資料。螢幕鎖定的設定見 [手機隱私設定逐步指引](./phone-privacy-settings.md)。

## 刪除檔案為什麼刪不乾淨

電腦一般不會真的「刪除」檔案。丟進垃圾桶再清空，系統只是把檔案隱藏起來，標記那塊空間可以被覆寫，實際被覆寫可能是幾週、幾個月甚至幾年之後。在那之前，用救援軟體或鑑識工具就可能把檔案找回來[^ssd-del]。

傳統的機械硬碟可以靠立刻覆寫解決。SSD、隨身碟與記憶卡則用了「平均抹寫」（wear leveling）的技術，每個區塊能抹寫的次數有限，磁碟會把修改後的資料寫到別的區塊，舊區塊只標記為失效。即使你下指令覆寫一個檔案，也無法保證原本的區塊真的被覆寫。作業系統刪除檔案後會送出 TRIM 指令，資料最終會被清掉，但無法確定是什麼時候[^ssd-del]。2015 年以後買的電腦多半是 SSD[^ssd-del]。

所以在 SSD 上，加密比事後刪除可靠。檔案就算還留在磁碟上，取得裝置的人沒有金鑰也只看到亂碼[^ssd-del]。

## 出售、送人或丟棄之前

- **電腦（SSD）**：先確認已經加密，再重置成出廠狀態。部分 SSD 廠商在 BIOS 提供安全抹除工具，可以當作額外的一步[^ssd-del]
    - Windows：「重設您的電腦」選「移除所有項目」，並開啟「清除資料」，會移除檔案並清除磁碟機。Microsoft 註明這項功能不符合政府與產業的資料清除標準[^ms-reset]
    - Mac：「系統設定」>「一般」>「移轉或重置」>「清除所有內容和設定」[^apple-mac-erase]
- **電腦（機械硬碟）**：整顆磁碟先覆寫過再處理。磁碟一直都有加密的話，銷毀主金鑰就能讓內容無法讀取，比整顆覆寫快得多[^ssd-del]
- **iPhone**：先登出「Apple 帳號」，再到「設定」>「一般」>「移轉或重置 iPhone」>「清除所有內容和設定」[^apple-iphone-sell]
- **Android**：先記下手機上的 Google 帳戶與密碼，再恢復原廠設定，各品牌的選單位置不同[^google-reset]
- **光碟**：跟紙本一樣用碎紙機處理，沒有碎紙機就折成小塊再丟[^ssd-del]

在二手平台出售物品時的照片與資料處理，見 [在二手平台賣東西](../utils/case-secondhand.md)。

## 刪除單一檔案

機械硬碟上的單一檔案，可以用開放原始碼的 [BleachBit](https://www.bleachbit.org/){target="_blank"} 安全刪除，支援 Windows 與 Linux。macOS 很早就拿掉了安全刪除功能，Mac 請改靠「檔案保險箱」[^ssd-del]。BleachBit 的主要功能[^ssd-del]：

- **Shred Files / Shred Folders**：選擇檔案或資料夾後永久刪除，資料夾會先逐一刪除裡面的檔案
- **預設清理項目**：一次清除某個軟體的痕跡，例如瀏覽器的暫存檔、瀏覽紀錄與密碼。有些項目會清掉軟體本身以外的所有資料，先按 Preview 看清楚要刪什麼，不確定用途的系統項目不要勾
- **Wipe Free Space**：把磁碟的空白區域覆寫成隨機資料，清掉已刪除檔案的殘留，空間越大花的時間越久

這些功能在 SSD 上無法保證效果，原因見上一節。

## 刪除的其他限制

以上方法只刪得到這台電腦上的那一份。備份、另一顆硬碟、隨身碟、郵件伺服器、雲端，以及已經寄給別人的副本都不會一起刪除，要安全刪除一個檔案，必須刪掉所有副本。檔案放上 Dropbox 這類雲端服務之後，通常無法保證它被永久刪除[^ssd-del]。

檔案刪掉了，名稱與痕跡也可能留在系統裡，例如 Office 的「最近使用的文件」、終端機的指令紀錄，類似的程式可能有幾十個。要百分之百確定紀錄消失，只能整顆磁碟覆寫並重新安裝作業系統[^ssd-del]。

## 本頁的來源與核對

本頁合併 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的兩篇指南改寫，兩篇都以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授權：

- 〈[How to: Encrypt Your Windows, Mac, or Linux Computer](https://ssd.eff.org/module/how-encrypt-your-windows-device){target="_blank"}〉，審閱日 2025-02-06
- 〈[How to: Delete Your Computer's Data Securely](https://ssd.eff.org/module/how-delete-your-data-securely-windows){target="_blank"}〉，審閱日 2025-05-08

改寫時加入手機的加密、出售裝置前的重置步驟，並依官方說明更新了 Windows 裝置加密的行為（使用 Microsoft 帳戶登入時自動開啟、復原金鑰存入帳戶）。原文 BleachBit 的逐步安裝說明沒有收錄。本頁未經 EFF 審閱，內容與原文不同之處由匿名網路社群 anoni.net 負責。

設定步驟 2026 年 11 月依 Microsoft 支援、Apple 的 Mac 與 iPhone 使用手冊、Apple 支援、Android 說明中心與 Android 開放原始碼專案核對。照著做卻找不到選項，歡迎到社群的線上聊天室（[Matrix 公開 room](https://anoni.net/services/){target="_blank"}）告訴我們。

## 相關閱讀

- [一般人平常該做到什麼](../scenarios/everyday-baseline.md)：全碟加密在日常準備裡的位置
- [出差與研討會的數位準備](../scenarios/asia-travel.md)：被要求當場解鎖時，加密之外要準備的事
- [在二手平台賣東西](../utils/case-secondhand.md)：上架照片的 metadata 與截圖遮蔽
- [什麼是 age](./what-is-age.md)：只加密單一檔案時的做法

[^ssd-enc]: [How to: Encrypt Your Windows, Mac, or Linux Computer](https://ssd.eff.org/module/how-encrypt-your-windows-device){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2025-02-06。
[^ssd-del]: [How to: Delete Your Computer's Data Securely](https://ssd.eff.org/module/how-delete-your-data-securely-windows){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2025-05-08。
[^ms-enc]: [Windows 中的裝置加密](https://support.microsoft.com/zh-tw/windows/cf7e2b6f-3e70-4882-9532-18633605b7df){target="_blank"} - Microsoft 支援。
[^ms-key]: [尋找您的 BitLocker 修復金鑰](https://support.microsoft.com/zh-tw/windows/6b71ad27-0b89-ea08-f143-056f5ab347d6){target="_blank"} - Microsoft 支援。
[^ms-reset]: [重設您的電腦](https://support.microsoft.com/zh-tw/windows/0ef73740-b927-549b-b7c9-e6f2b48d275e){target="_blank"} - Microsoft 支援。
[^apple-fv]: [在 Mac 上透過「檔案保險箱」保護資料](https://support.apple.com/zh-tw/guide/mac-help/mh11785/mac){target="_blank"} - Mac 使用手冊。
[^apple-passcode]: [在 iPhone 上設定密碼](https://support.apple.com/zh-tw/guide/iphone/iph14a867ae/ios){target="_blank"} - iPhone 使用手冊。
[^apple-mac-erase]: [清除 Mac 並將其重置為出廠預設值](https://support.apple.com/zh-tw/102664){target="_blank"} - Apple 支援。
[^apple-iphone-sell]: [將 iPhone 或 iPad 賣掉、送人或換購以前的注意事項](https://support.apple.com/zh-tw/109511){target="_blank"} - Apple 支援。
[^aosp-enc]: [Encryption](https://source.android.com/docs/security/features/encryption){target="_blank"} - Android 開放原始碼專案。Android 10 以上的新裝置不允許使用全磁碟加密，改用檔案型加密。
[^google-reset]: [將 Android 裝置恢復原廠設定](https://support.google.com/android/answer/6088915?hl=zh-Hant){target="_blank"} - Android 說明。
