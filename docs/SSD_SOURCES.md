# EFF Surveillance Self-Defense 與文件站的內容對照

文件站有幾頁依 EFF 的 [Surveillance Self-Defense](https://ssd.eff.org/)（SSD）改寫，這份記錄每篇 SSD 指南對應到文件站的哪一頁、改寫時依據的是哪一次審閱，以及還沒涵蓋的篇目。SSD 改版時照這張表追。這一份不會被建置（`docs_dir` 指向語系目錄），只給維護的人看。規劃與進度見 [anoni-net/docs#696](https://github.com/anoni-net/docs/issues/696)。

## 為什麼改寫

SSD 是寫給一般讀者的個人數位安全指南，讀者與範圍跟文件站的隱私手冊重疊。正體中文讀者目前能讀到的 SSD 譯本譯自 2017-11 的舊站，沒有人維護。文件站依 SSD 現行版改寫，補上台灣與東亞的情境，讓正體中文讀者在文件站就能讀到對應現行 SSD 的內容。

## 改寫的慣例

- 依 SSD 現行版的內容改寫，不逐句翻譯。截圖用正體中文介面重拍，步驟對照 Apple、Google、Microsoft 等廠商當下的官方說明
- 每頁的「本頁的來源與核對」寫明 SSD 篇名、審閱日、CC BY 4.0、未經 EFF 審閱，以及跟原文不同的地方。只改寫一節的頁面，在該節末尾寫同樣的資訊
- SSD 與文件站都是 CC BY 4.0，不需要另外取得授權。SSD 裡的介面截圖不屬於 EFF 原創，不沿用
- zh-CN 可以參考 SSD 站上的簡體中文版（`ssd.eff.org/zh-hans/`），但簡中版有幾篇落後英文版，要對過英文版的審閱日。en 寫短版，連回 SSD 原文
- 不要把「已經改寫」寫成「已經翻譯」，對 EFF 與讀者都是部分改寫

## 如何確認 SSD 有沒有改版

SSD 每篇指南的頁首都有 `Last Reviewed`，跟下表「改寫依據」那一欄比對即可。SSD 沒有公開的原始檔或變更紀錄，`EFForg/ssd-l10n` 只有 2016 年舊站的 XLIFF。分類頁（`/module-categories/basics` 等）列出目前在目錄裡的指南，篇目增減從那裡看。手機系列 5 篇不在分類頁，只從「Privacy Breakdown of Mobile Phones」清單連入。

舊版的部分指南已經退出目錄，網址卻還能開（例如 PGP 三篇、分平台的 Signal 與 Tor 教學），沒有標示停止維護，不要拿來當改寫依據。

## 已改寫的頁面

| 文件站頁面 | SSD 指南 | 改寫依據的審閱日 | 改寫日期 |
|---|---|---|---|
| `tools/bluetooth-tracker` | [How to: Detect Bluetooth Trackers](https://ssd.eff.org/module/how-to-detect-bluetooth-trackers) | 2024-07-15 | 2026-11 |
| `tools/phishing` | [How to: Avoid Phishing Attacks](https://ssd.eff.org/module/how-avoid-phishing-attacks) | 2024-06-21 | 2026-11 |
| `tools/device-encryption` | [How to: Encrypt Your Windows, Mac, or Linux Computer](https://ssd.eff.org/module/how-encrypt-your-windows-device) | 2025-02-06 | 2026-11 |
| `tools/device-encryption` | [How to: Delete Your Computer's Data Securely](https://ssd.eff.org/module/how-delete-your-data-securely-windows) | 2025-05-08 | 2026-11 |
| `tools/malware` | [How Do I Protect Myself Against Malware?](https://ssd.eff.org/module/how-do-i-protect-myself-against-malware) | 2024-06-21 | 2026-11 |
| `basics/e2ee` 的「iCloud 的進階資料保護」 | [How to: Encrypt Your iPhone](https://ssd.eff.org/module/how-encrypt-your-iphone) | 2025-02-25 | 2026-11 |
| `tools/signal-guide` | [How to: Use Signal](https://ssd.eff.org/module/how-to-use-signal) | 2026-06-15 | 2026-11 |
| `tools/signal-guide` | [Creating and Managing Signal Groups](https://ssd.eff.org/module/creating-and-managing-signal-groups) | 2026-04-24 | 2026-11 |
| `basics/phone-surveillance` | [Mobile Phones: Location Tracking](https://ssd.eff.org/module/mobile-phones-location-tracking) | 2024-11-05 | 2026-11 |
| `basics/phone-surveillance` | [Mobile Phones: Spying on Mobile Communications](https://ssd.eff.org/module/mobile-phones-spying-mobile-communications) | 2024-11-05 | 2026-11 |
| `basics/phone-surveillance` | [Mobile Phones: Phone Components and Sensors](https://ssd.eff.org/module/mobile-phones-phone-components-and-sensors) | 2024-11-05 | 2026-11 |
| `basics/phone-surveillance` | [Mobile Phones: Device-Bound Biometrics](https://ssd.eff.org/module/mobile-phones-device-bound-biometrics) | 2026-10-28 | 2026-11 |
| `basics/phone-surveillance` | [Mobile Phones: Other Surveillance Techniques](https://ssd.eff.org/module/mobile-phones-malware) | 2024-11-05 | 2026-11 |
| `scenarios/parents-youth` | [Online Privacy for Parents and Youth](https://ssd.eff.org/module/online-privacy-for-parents-and-youth) | 2026-10-21 | 2026-11 |

`tools/tor-browser-mobile` 的 iOS 警示（[anoni-net/docs#698](https://github.com/anoni-net/docs/pull/698)）見下一節，Apple 修補之後要回頭更新或拿掉。

## 補強的既有頁面

這些頁面不是依 SSD 改寫，只有標明的段落依 SSD 補充，段落結尾寫了出處。SSD 改版時一併對照。

| 文件站頁面 | 補充的段落 | SSD 指南 | 依據的審閱日 | 補充日期 |
|---|---|---|---|---|
| `tools/what-is-tor` | 使用 Tor Browser 的注意事項 | [How to: Use Tor](https://ssd.eff.org/module/how-to-use-tor) | 2025-01-28 | 2026-11 |
| `tools/phone-privacy-settings` | 第 3 步的解鎖密碼、選做：關閉 2G、做完之後的備份 | [How to: Get to Know Android Privacy and Security Settings](https://ssd.eff.org/module/how-to-get-to-know-android-privacy-and-security-settings)、[How to: Get to Know iPhone Privacy and Security Settings](https://ssd.eff.org/module/how-to-get-to-know-iphone-privacy-and-security-settings) | 2025-06-23、2025-09-15 | 2026-11 |
| `tools/password-manager` | 瀏覽器內建的密碼管理與自動填入、被要求交出密碼的情況、passphrase 字數、裝置保持乾淨、家庭方案 | [Choosing a Password Manager](https://ssd.eff.org/module/choosing-the-password-manager-that-s-right-for-you)、[Creating Strong Passwords](https://ssd.eff.org/module/creating-strong-passwords) | 2025-03-06、2023-08-18 | 2026-11 |
| `tools/ai-privacy` | 代理型 AI 的存取範圍、暫時對話與分享連結、執法與政府調取、帳號的設定、混合式助理 | [Privacy Considerations with AI Tools](https://ssd.eff.org/module/privacy-considerations-with-ai-tools) | 2026-08-05 | 2026-11 |
| `tools/tor-browser-mobile` | iOS 的 IP 洩漏警示 | [How to: Use Tor on Android and iPhone](https://ssd.eff.org/module/how-to-use-tor-on-android-and-iphone) 頁首的提醒 | 2026-08 的提醒 | 2026-11 |

## 全部篇目的對照

2026-11-25 核對。「文件站」欄的「有」是有對應的專頁，「一節」是某頁裡有一段，「無」是沒有專頁也沒有成段的內容，依頁面標題與關鍵字判斷，沒有逐段比對。「簡中」欄記 SSD 簡體中文版的狀態。

### 基礎（Basics）

| SSD 指南 | SSD 審閱日 | 簡中 | 文件站 |
|---|---|---|---|
| Your Security Plan | 2023-10-27 | 有 | 有，`basics/threat-model` |
| Online Privacy for Parents and Youth | 2026-10-21 | 無 | 有，`scenarios/parents-youth`（改寫） |
| Creating Strong Passwords | 2023-08-18 | 有 | 有，`tools/password-manager`、`tools/asian-diceware` |
| Keeping Your Data Safe | 2024-07-22 | 有 | 一節，`scenarios/everyday-baseline` |
| What Should I Know About Encryption? | 2025-01-01 | 有 | 有，`basics/e2ee` |
| Communicating With Others | 2024-08-06 | 有 | 有，`basics/e2ee`、`tools/messaging-comparison` |
| Choosing Your Tools | 2024-08-06 | 有 | 一節，`start/` 各頁 |
| Seven Steps To Digital Security | 2024-07-22 | 有 | 有，`scenarios/everyday-baseline` |
| Why Communication Metadata Matters | 2024-07-22 | 有 | 有，`basics/metadata` |
| 動畫影片 4 篇 | 2019-11-10 | 英文 | 無 |

### 延伸閱讀（Further Learning）

| SSD 指南 | SSD 審閱日 | 簡中 | 文件站 |
|---|---|---|---|
| Privacy Considerations with AI Tools | 2026-08-05 | 無 | 有，`tools/ai-privacy` |
| Creating and Managing Signal Groups | 2026-04-24 | 無 | 有，`tools/signal-guide`（改寫） |
| Choosing a Password Manager | 2025-03-06 | 有 | 有，`tools/password-manager` |
| How Do I Protect Myself Against Malware? | 2024-06-21 | 有 | 有，`tools/malware`（改寫） |
| Key Verification | 2025-01-01 | 有 | 一節，`basics/e2ee` |
| Attending a Protest | 2026-06-26 | 落後（2024-11） | 一節，`scenarios/activist` |
| Choosing the VPN That's Right for You | 2026-07-28 | 落後（2025-01） | 有，`tools/vpn-guide` |
| A Deep Dive on End-to-End Encryption | 2025-01-01 | 有 | 一節，`basics/e2ee` |
| Protecting Yourself on Social Networks | 2023-10-13 | 有 | 有，`basics/platform-tracking`、`basics/multiple-identities` |
| Facebook Groups: Reducing Risks | 2023-10-13 | 有 | 無 |
| Key Concepts in Encryption | 2025-01-01 | 有 | 一節，`basics/e2ee` |
| Privacy for Students | 2020-03-01 | 無 | 無 |
| What Is Fingerprinting? | 2024-08-27 | 有 | 有，`basics/browser-fingerprinting` |

### 工具指南（Tool Guides）

| SSD 指南 | SSD 審閱日 | 簡中 | 文件站 |
|---|---|---|---|
| How to: Manage Your Digital Footprint | 2025-05-16 | 有 | 一節，`basics/platform-tracking`、`taiwan/realname-data-market` |
| How to: Use Tor | 2025-01-28 | 有 | 有，`tools/what-is-tor`、`tools/tor-browser-advanced` |
| How to: Get to Know Android Privacy and Security Settings | 2025-06-23 | 有 | 有，`tools/phone-privacy-settings` |
| How to: Get to Know iPhone Privacy and Security Settings | 2025-09-15 | 落後（2025-04） | 有，`tools/phone-privacy-settings` |
| How to: Enable Lockdown Mode on iPhone | 2024-09-03 | 有 | 一節，`tools/phone-privacy-settings` |
| How to: Detect Bluetooth Trackers | 2024-07-15 | 無 | 有，`tools/bluetooth-tracker`（改寫） |
| How to: Use WhatsApp | 2026-03-10 | 落後（2025-04） | 一節，`tools/messaging-comparison` |
| How to: Use Tor on Android and iPhone | 2023-11-08 | 有 | 有，`tools/tor-browser-mobile` |
| How to: Use Signal | 2026-06-15 | 落後（2025-03） | 有，`tools/signal-guide`（改寫） |
| How to: Encrypt Your iPhone | 2025-02-25 | 落後一週 | 有，`basics/e2ee` 的「iCloud 的進階資料保護」（改寫）、`tools/device-encryption` |
| How to: Encrypt Your Windows, Mac, or Linux Computer | 2025-02-06 | 有 | 有，`tools/device-encryption`（改寫） |
| How to: Delete Your Computer's Data Securely | 2025-05-08 | 有 | 有，`tools/device-encryption`（改寫） |
| How to: Enable Two-factor Authentication | 2024-03-11 | 有 | 一節，`scenarios/everyday-baseline`、`tools/what-is-passkey` |
| How to: Avoid Phishing Attacks | 2024-06-21 | 有 | 有，`tools/phishing`（改寫） |
| How to: Understand and Circumvent Network Censorship | 2024-02-01 | 有 | 有，`tools/what-is-anonymity-network`、`tools/tor-snowflake` |

### 手機隱私分析（只從清單連入）

| SSD 指南 | SSD 審閱日 | 簡中 | 文件站 |
|---|---|---|---|
| Mobile Phones: Location Tracking | 2024-11-05 | 有 | 有，`basics/phone-surveillance`（改寫） |
| Mobile Phones: Spying on Mobile Communications | 2024-11-05 | 有 | 有，`basics/phone-surveillance`（改寫） |
| Mobile Phones: Phone Components and Sensors | 2024-11-05 | 有 | 有，`basics/phone-surveillance`（改寫） |
| Mobile Phones: Device-Bound Biometrics | 2026-10-28 | 無 | 有，`basics/phone-surveillance`（改寫） |
| Mobile Phones: Other Surveillance Techniques | 2024-11-05 | 有 | 有，`basics/phone-surveillance`（改寫） |

42 篇文字指南裡，文件站有專頁的 30 篇（其中 14 篇依 SSD 改寫），一節帶到的 10 篇，沒有的 2 篇。

## 之後的候選

- 沒有專頁的兩篇：Facebook Groups: Reducing Risks、Privacy for Students
- 「一節」的主題（雙因素驗證、金鑰驗證、參加抗議、WhatsApp 等），可以拿 SSD 的現行版回頭補強既有頁面
- 2026-11 的差距盤點（見 [anoni-net/docs#696](https://github.com/anoni-net/docs/issues/696)）列出既有專頁相對 SSD 的缺口，第三批補完了 Tor、手機設定、密碼管理器與 AI 隱私四頁。還沒處理的是同平台其他使用者的防範設定（`basics/platform-tracking`、`basics/multiple-identities`），以及從受審查讀者角度寫的網路審查總覽頁
