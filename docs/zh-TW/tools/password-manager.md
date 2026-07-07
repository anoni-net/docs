---
title: 密碼管理器入門
description: 為什麼需要密碼管理器、如何選擇，以及 Bitwarden、KeePassXC、1Password 的取捨。
icon: material/key-variant
---

# :material-key-variant: 密碼管理器入門

重複密碼、簡單密碼、寫在便條紙上的密碼，是被攻擊時最常見的破口。密碼管理器讓你只需要記一組主密碼，其他密碼可以又長又隨機，並在不同裝置之間同步。這篇文章說明密碼管理器的核心威脅模型、四類常見工具的取捨（KeePassXC、Bitwarden、1Password、Apple Passwords）、TOTP 雙因子驗證的搭配方式、Passkey 與硬體金鑰的角色，以及在台灣使用時的特殊情境與備援策略。動之前可以先回頭看 [威脅模型如何建立](../basics/threat-model.md)，知道自己在抗誰。

## 為什麼需要密碼管理器

過去十年的大規模資料外洩，把人類密碼的弱點完整暴露出來。現代攻擊者不需要破解你的密碼，他們從某次外洩事件拿到「Email + 密碼」的資料庫，再把同樣組合往別的服務試（這叫 credential stuffing，重複密碼從 A 站流到 B 站）。如果你在 10 個服務都用同一組密碼，只要其中一個外洩，10 個帳號全部失守。

簡單密碼也撐不住。一台普通電腦每秒可以試上千萬個常見密碼組合，加上社交工程拿到的姓名、生日、寵物名字，「客製化字典」攻擊速度更快。再加上 SIM swap 攻擊（攻擊者透過社交工程把你的門號移到他們的 SIM 卡，攔截簡訊驗證碼），單純的「密碼 + 簡訊 2FA」就會失守。

瀏覽器內建的「記住密碼」功能能幫一點忙，但限制明顯：跨裝置同步弱、被偷裝置就全暴露、惡意的瀏覽器擴充套件可以讀取、沒有恢復機制。

密碼管理器的核心承諾是：**你只記一組難記的主密碼，其他每個服務都用不同、隨機、長密碼，由金庫加密保管**。主密碼用來解鎖金庫，金庫裡是你所有的密碼、TOTP 種子、安全筆記。

## 主密碼與 passphrase

主密碼是整套系統的單一支點，值得花一點時間想清楚。

**用 passphrase，不要用單字密碼**。Passphrase 是 4 到 6 個隨機英文單字串成的句子（例如 `correct horse battery staple`），熵比短而複雜的密碼高得多，也比較好記。可以用 [diceware](https://theworld.com/~reinhold/diceware.html){target="_blank"} 字典隨機抽單字，避免自己選有意義的詞。社群也做了一份帶亞洲味、與 EFF 相容的 [Asian Diceware 密語字典](./asian-diceware.md)，附 A5 小冊與擲骰、安全亂數的產生教學。

**主密碼不要重用**。這個密碼一旦曝露，等於你所有的帳號全部曝露。除了密碼管理器，其他任何服務都不能用這組密碼。

**不要存在電腦上**。記在腦中、寫在紙上、放保險櫃。可以給家人或律師一份封存的副本，作為遺產規劃。

## 四類密碼管理器與選擇取捨

依儲存與同步方式可分成四類，各有適合的使用者。

### 離線金庫：KeePassXC（與 GNOME Secrets）

[KeePassXC](https://keepassxc.org/){target="_blank"} 把金庫存在你電腦上的 `.kdbx` 檔，跨裝置同步靠你自己處理（[Syncthing](https://syncthing.net/){target="_blank"}、自架雲端、加密硬碟）。客戶端齊全：桌面用 KeePassXC、Android 用 KeePassDX、iOS 用 Strongbox。

[Tails 7.6](../blog/posts/2026-tails-7-6.md) 起預裝 GNOME Secrets 取代 KeePassXC，使用相同的 `.kdbx` 格式，原本的金庫檔可以直接開啟。

`.kdbx` 是公開格式，2017 年後陸續有新一代客戶端從零開始實作、能開同一個金庫：Apple 平台原生 SwiftUI 的 [KeePassium](https://keepassium.com/){target="_blank"} 與 [Strongbox](https://strongboxsafe.com/){target="_blank"}（GPL）、跨平台 Flutter 的 [AuthPass](https://authpass.app/){target="_blank"}。換 client 不用搬資料，金庫格式跟著你走，不被任何一家綁死。

適合：自己掌握儲存的人、Tails 使用者、不想依賴廠商雲端的人。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/pm-keepassxc-main.png" target="_blank">
        <img src="https://assets.anoni.net/docs/pm-keepassxc-main.png"
            alt="KeePassXC 主畫面顯示金庫項目列表"
            title="KeePassXC 主畫面顯示金庫項目列表"
            class="brand-frame">
    </a>
    <capture>KeePassXC 主畫面顯示金庫項目列表（圖片來源：<a href="https://keepassxc.org/docs/" target="_blank">KeePassXC 官方文件</a>）</capture>
</figure>

### 雲端同步：Bitwarden

[Bitwarden](https://bitwarden.com/){target="_blank"} 是開源密碼管理器，廠商提供雲端儲存與同步，端對端加密由廠商實作。免費版功能齊全（無限項目、無限裝置、無限平台），Premium 每年 19.80 美元（2026 年 1 月調漲，實際以官網為準），加上 TOTP 整合、進階報告、優先支援。

技術上，Bitwarden 有公開的第三方安全 audit，原始碼開放。如果你不信任 Bitwarden 公司本身，可以自架 [Vaultwarden](https://github.com/dani-garcia/vaultwarden){target="_blank"}（社群重寫的相容後端），客戶端不變。

信任前提是：廠商不被駭、E2EE 實作正確。即使廠商被駭，攻擊者拿到的也是加密過的金庫，需要再破解你的主密碼。但 LastPass 2022 的事件說明了金庫的元資料（網站 URL 等欄位）並未加密，攻擊者能據此規劃針對性釣魚。

適合：跨多裝置、多平台使用、能接受廠商依賴的人。

### 商業整合：1Password

[1Password](https://1password.com/){target="_blank"} 是付費服務（個人每年約 48 美元，2026 年 3 月調漲，實際以官網為準），在 UX 與額外功能上做得最完整。Watchtower 主動監控你的密碼是否出現在外洩資料庫、是否使用弱密碼、哪些服務該開 2FA 還沒開。家庭與團隊計畫成熟，多人共享部分項目方便。

1Password 是閉源，但有公開第三方 audit，並用「Secret Key」設計：除了主密碼，還有一組裝置上才有的長隨機字串，攻擊者光拿到主密碼也解不開金庫。

適合：願意付費換 UX 與監控功能、需要家庭或團隊共享、追求最低操作摩擦的使用者。

### 系統整合：Apple Passwords / iCloud Keychain

iOS 18 與 macOS Sequoia 起，Apple 把密碼功能獨立成 [Passwords](https://support.apple.com/zh-tw/guide/passwords/welcome/mac){target="_blank"} app，跨 Apple 裝置自動同步、支援 passkey 與 TOTP，整合到系統 autofill。

限制：Android 與 Windows 上的跨平台體驗弱（只能用 [iCloud for Windows](https://support.apple.com/zh-tw/guide/icloud-windows/welcome/icloud){target="_blank"} 或 web 介面），不適合多平台使用者。同步綁 Apple ID，威脅模型要把「Apple ID 失守 = 密碼全失守」算進去。

適合：完全在 Apple 生態的個人使用者、不想額外裝 app 的人。

## TOTP（兩步驟驗證）與密碼管理器的關係

兩步驟驗證在密碼之外加一道時效驗證碼。TOTP（Time-based One-Time Password）是最常見的形式，每 30 秒換一次。

存放策略上有兩派：

- **同金庫存 TOTP**：KeePassXC、Bitwarden（Premium）、1Password 都支援。方便、跨裝置同步自動處理。缺點是主密碼曝露 = TOTP 也曝露，等於兩步驟變成一步
- **獨立 app 存 TOTP**：Android 用 [Aegis](https://getaegis.app/){target="_blank"}、iOS 用 [Raivo](https://raivo-otp.com/){target="_blank"} 或 [Ente Auth](https://ente.io/auth/){target="_blank"}（跨平台）。多一道分層，安全多一道

社群建議：高敏感帳號（Email、銀行、雲端服務）用獨立 app，其他可以同金庫圖方便。

簡訊 2FA 在台灣的銀行、政府服務還是常態，但 SIM swap 攻擊在台近年也常見，只要服務支援 TOTP 一律改 TOTP。TOTP 的 recovery codes（救援碼）要跟主密碼分開存，不要一起放在金庫裡，否則金庫一掉就全部都掉。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/pm-bitwarden-totp.png" target="_blank">
        <img src="https://assets.anoni.net/docs/pm-bitwarden-totp.png"
            alt="Bitwarden 為帳號設定 TOTP authenticator 的畫面"
            title="Bitwarden 為帳號設定 TOTP authenticator 的畫面"
            class="brand-frame">
    </a>
    <capture>Bitwarden 為帳號設定 TOTP authenticator 的畫面（圖片來源：<a href="https://bitwarden.com/help/integrated-authenticator/" target="_blank">Bitwarden 官方說明</a>）</capture>
</figure>

## Passkeys：取代密碼的新方案

Passkey 是基於 [FIDO2 / WebAuthn](https://fidoalliance.org/passkeys/){target="_blank"} 標準的無密碼登入方式。2026 年已經在主流服務（Google、Apple、Microsoft、GitHub、PayPal）廣泛支援。

運作上：你的裝置產生一對公私鑰，公鑰交給服務，私鑰存在你的密碼管理器或硬體金鑰上。登入時用生物辨識（Face ID、指紋）解鎖私鑰簽名挑戰。沒有打字輸入的密碼，自然就沒有 phishing 風險。

哪些密碼管理器存得了 passkey：Bitwarden、1Password、Apple Passwords，KeePassXC 透過 plugin 也可以。

過渡期建議：能用 passkey 就用，但保留密碼加 TOTP 作為備援。不是每個服務都支援 passkey，更不是每台裝置都能掃指紋。如果常切換不同人的裝置（公用電腦、家人裝置），passkey 的同步機制要先弄清楚。

跟匿名情境的取捨：passkey 跟生物辨識與裝置綁定，在純匿名瀏覽（例如用 Tor Browser 開不同身分）的情境下難用。請依 [威脅模型](../basics/threat-model.md) 判斷。

## 硬體金鑰（YubiKey、Solo）

硬體金鑰跟密碼管理器搭配使用，是 2FA 與 passkey 的最強層級，主要對抗釣魚（Phishing-resistant 2FA）。即使你被釣魚網站騙到輸入密碼，硬體金鑰會檢查網域，不對的就不會送出簽名。

主流產品：[YubiKey](https://www.yubico.com/){target="_blank"}（含 NFC 版本，能跟手機配合）、[Solo](https://solokeys.com/){target="_blank"}（開源硬體）。透過 USB、NFC、Lightning 與裝置溝通。

適合放在誰身上：高敏感帳號（個人 Email、銀行、政府服務、GitHub 開發者帳號）。Bitwarden、1Password、Google、GitHub、Microsoft、Apple ID 都支援硬體金鑰當作 2FA。

**至少買兩支**：一支日常用、一支備用（鎖在家裡的保險櫃或信任的家人那邊）。只買一支遺失就被鎖死，要走服務的「帳號回復」流程，那是你不會想經歷的麻煩。

## 常見錯誤（避免踩坑）

社群實際遇過的踩坑案例：

- **匯出後忘了刪檔**：從瀏覽器或舊密碼管理器匯出時是 CSV / JSON 明文，匯入新工具後忘記刪掉檔案，後來電腦被偷或檔案外流就裸奔
- **兩個金庫並存沒同步**：家用裝置一個金庫、工作裝置另一個金庫，新增密碼只在一邊，要用時找不到。決定一套就好
- **主密碼跟其他服務的密碼重用**：違反主密碼的核心原則。哪怕是「跟某個自己舊帳號類似」也算重用
- **金庫檔放沒加密的雲端**：`.kdbx` 本身有加密，但放在共用雲端硬碟（Dropbox 共享資料夾、Google Drive 工作資料夾）會增加曝露面，建議再加一層自己的加密
- **不開 2FA 的密碼管理器帳號**：Bitwarden / 1Password 帳號本身的登入務必開 2FA，最好用硬體金鑰

## 備援與恢復策略

密碼管理器是單一支點，備援要做到位。

**主密碼紙本備份**：寫在紙上、放保險櫃 / 律師 / 信任的家人。可以分兩半放兩個地方，要兩個合起來才能還原。

**金庫檔案多地備份**（離線使用者）：加密硬碟、家中第二個地點、雲端加密上傳。`.kdbx` 檔本身已經是加密的，但放雲端時依然建議再加一層自己的加密。

各家工具的 recovery 機制：

- **KeePassXC / GNOME Secrets**：你自己的 `.kdbx` 檔備份就是 recovery，沒有廠商可以幫你回復
- **Bitwarden**：個人帳號可以設 Recovery Code，組織帳號靠 Master Password Hint（保護弱）
- **1Password**：Emergency Kit（一張 PDF 包含 Secret Key、留空欄填主密碼），列印放安全處
- **Apple Passwords**：iCloud Account Recovery 機制 + Recovery Contacts（信任聯絡人，可幫你重置 Apple ID）

**至少一人知道**「萬一我出事，密碼在哪、怎麼解開」。家人、配偶、律師擇一。需要交代的操作流程包括：保險櫃在哪、Emergency Kit 在哪、怎麼開。主密碼本身不必、也不該交給對方。

Tails 使用者：把 `.kdbx` 存進 Persistent Storage 並另外備份到加密硬碟。Tails 預設關機就清空，沒做 Persistent Storage 設定的話下次開機什麼都沒了。

## 在台灣與香港的補充

台灣有幾個跟密碼管理器相關的特殊情境，國際指南通常不會提：

- **簡訊 2FA 是常態但不安全**：銀行（網銀、信用卡 OTP）、政府服務（自然人憑證、健保署）多半依賴簡訊。能改 TOTP 的服務（Google、Microsoft、PChome、蝦皮、各家交易所）一律改，並把 recovery codes 存進金庫
- **SIM swap 在台近年常見**：跟電信業者設定「號碼異動需臨櫃 + 雙重驗證」，避免攻擊者打客服就能把門號移走
- **雙證件帳號**：自然人憑證、行動自然人憑證、健保卡的 PIN 與恢復碼存進金庫，但**主密碼仍要跟這些 PIN 分開**
- **Apple ID 在台等同關鍵帳號**：很多服務（電商、串流、訂閱制 app）透過 Sign in with Apple 登入，Apple ID 失守會連帶失去多個服務。Apple ID 本身務必開 2FA、設 Recovery Contacts
- **被盜後的補救**：見 [緊急求救](../help/index.md) 的「帳號被盜或被異常登入」章節，這篇是預防、求救頁是事後補救

香港的對應情境：

- **政府與銀行服務的 2FA**：HKID、iAM Smart（政府數位身分）與網銀多用簡訊 OTP，SIM swap 同樣存在，能改 TOTP 的服務就改，recovery codes 存進金庫。
- **Apple ID 一樣是關鍵帳號**：Sign in with Apple 綁定多個服務的邏輯在香港一樣成立，務必開 2FA 與 Recovery Contacts。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 威脅模型如何建立](../basics/threat-model.md)
- [:material-chat-question: Metadata 是什麼](../basics/metadata.md)
- [:material-chat-question: 什麼是 Tails](./what-is-tails.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 個人隱私指引研究專題](../community/privacy-guide.md)
- [:material-lifebuoy: 緊急求救](../help/index.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>
