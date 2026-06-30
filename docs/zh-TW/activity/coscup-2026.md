---
title: COSCUP 2026 匿名網路社群議程軌
description: 匿名網路社群 anoni.net 在 COSCUP 2026 社群議程軌的兩日議程與工作坊，涵蓋 Tor、Tails、OONI、瀏覽器追蹤、校園 Tor 節點、健保資料庫個資權利、隱私指南與匿名支付，並與 ETHTaipei 合辦匿名支付場，適合關注隱私與數位安全的台灣讀者到現場參與。
icon: material/calendar-star
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/event/anoni-net-eth-taipei.png
  image_type: image/png
  image_width: 1536
  image_height: 1024
  twitter_card: summary_large_image
---

# :material-calendar-star: COSCUP 2026 匿名網路社群議程軌

![COSCUP 2026 匿名網路社群議程軌主視覺](https://assets.anoni.net/event/anoni-net-eth-taipei.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

記者要保護消息來源、公民團體要守住成員與捐款人的安全、開發者想確認手上的工具真的擋得住監控。在審查與監控擴散的環境裡，這些需求都落在同一組風險上，通訊可能被攔截、身分可能被追蹤、一筆轉帳的時間與金額足以反推出整張關係網，組織的成員名單與金流甚至可能在你不知情時就被攤開。

匿名網路社群 anoni.net 把這一年在 [Tor](../tools/what-is-tor.md)、[Tails](../tools/what-is-tails.md)、[OONI](../tools/what-is-ooni.md)、個人隱私與匿名支付累積的實作經驗，帶進 COSCUP 2026 的開源社群現場。兩天的議程從網路與審查如何運作開始，一路到記者保護消息來源、校園 Tor 節點、瀏覽器追蹤、健保資料庫的個資權利，以及與 ETHTaipei 合辦的匿名支付場。不論你是來找馬上能用的工具，還是想一起貢獻開源專案，都能挑到對應的場次。

!!! info "活動資訊"

    - 日期：2026/08/08（六）、2026/08/09（日）
    - 地點：國立臺灣科技大學（NTUST），社群議程軌在 `TR-510`，8/08 下午與 ETHTaipei 合辦場在 `TR-511`
    - 形式：社群議程、實作工作坊、與 ETHTaipei 合辦的匿名支付場
    - 入場：COSCUP 免費入場，社群議程軌不需另外報名，當天到場即可參與（議程時間到活動前仍可能微調，以 COSCUP 官方議程為準）

[前往 COSCUP 2026 議程](https://pretalx.coscup.org/coscup-2026/){ .md-button .md-button--primary target="_blank"} [社群徵稿說明](./coscup-2026-cfp.md){ .md-button }

!!! tip "依你的身分，建議從這幾場開始"

    - **新聞媒體、獨立記者**：8/08 上午「記者如何用開源工具保護消息來源」最直接，可搭配「威脅模型與 Metadata 入門」。8/09 下午的「健保資料庫案之後」與「隱私指南 2026」延伸到個資權利與個人防護。
    - **公民團體、NGO**：8/08 上午四場導論最貼近組織處境，「隱私指南 2026」談到組織遭法律調取資料時的事前準備。想評估匿名捐款管道，8/08 下午與 ETHTaipei 合辦的匿名支付場（特別是「我不洗錢，為何要理解匿名支付？」）是好入門。
    - **開源、科技社群**：8/09 技術含量最高，OpenWRT、臺師大 Tor 節點、瀏覽器指紋研究都能動手。8/08 下午的零知識證明（ZK）自然人憑證、隱私保護的 KYC 身分驗證、隱匿地址是協議層最扎實的內容。想一起貢獻見[如何參與](../community/how-to-contribute.md)。
    - 各場都不需另外報名，當天到場即可，也歡迎帶同事一起來。

## :material-calendar-text: 議程總覽

以下為社群議程軌的規劃，實際時間以 [COSCUP 官方議程](https://pretalx.coscup.org/coscup-2026/){target="_blank"} 為準。場次之間安排換場休息（8/08 上午每場間 10 分鐘、8/09 因議程較滿改為 5 分鐘）。各場詳細摘要見下方[議程介紹](#議程介紹)。

### Day 1 — 2026/08/08（六）

8/08 上午由 anoni.net 社群成員主講四場開源匿名網路導論，特別適合公民團體、新聞媒體與獨立記者，從入門角度切入、四場都扣著開源主軸。下午 13:00 接續與 ETHTaipei 合辦的「匿名支付」場，協議層的技術含量更高。

**上午 09:30-12:00　社群開源匿名網路導論（教室 `TR-510`）**

| 時間 | 議程 | 講者 |
|------|------|------|
| 09:30-10:00<br>30 分鐘 | <span class="sess-tag sess-tag--basic">通用</span> :material-account-group: **匿名網路社群 anoni.net 介紹：開源匿名工具、社群實踐與 2026 三大主題**<br>:material-arrow-right-bottom: 介紹社群緣起、如何以開源協作參與國際專案，帶出 2026 推進的三大主題 | anoni.net 社群 |
| 10:10-10:40<br>30 分鐘 | <span class="sess-tag sess-tag--basic">通用</span> :material-target-account: **威脅模型與 Metadata 入門：認識你的對手，以及為什麼匿名工具要開源才可信**<br>:material-arrow-right-bottom: 用威脅模型搭出判斷框架，並說明為何匿名工具要開源才可信 | anoni.net 社群 |
| 10:50-11:20<br>30 分鐘 | <span class="sess-tag sess-tag--privacy">個人隱私</span> :material-newspaper-variant-outline: **記者如何用開源工具保護消息來源：從第一次接觸到報導刊出後的數位整理**<br>:material-arrow-right-bottom: 從第一次接觸到報導刊出，每一步該用哪些可受公開檢視的開源工具保護來源 | anoni.net 社群 |
| 11:30-12:00<br>30 分鐘 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-cash-multiple: **為什麼匿名支付重要：開源、去中心化的金流與台灣 VASP 法 2026**<br>:material-arrow-right-bottom: 金流為何是最難擺脫的 metadata，從捐款、募款到日常轉帳的隱私風險與開源替代方案 | anoni.net 社群 |

**下午 13:00-16:30　ETHTaipei 合辦「匿名支付」場（教室 `TR-511`，議程由 ETHTaipei 安排）**

| 時間 | 議程 | 講者 |
|------|------|------|
| 13:00-13:30<br>30 分鐘 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-card-account-details-outline: **零知識證明與自然人憑證身份驗證**<br>:material-arrow-right-bottom: 不必交出任何個資，就能用自然人憑證向網站證明你是台灣公民 | Ya-wen Jeng |
| 13:40-14:10<br>30 分鐘 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-account-check-outline: **The Privacy-preserving Identity Pipeline in KYC**<br>:material-arrow-right-bottom: 用一組密碼學原語組出能通過 KYC、卻不讓伺服器看到身分資料的流程 | ryanycw（Ryan Wang） |
| 14:20-14:50<br>30 分鐘 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-link-off: **從不可連結性出發：隱匿地址如何解決鏈上金融隱私（以 Fluidkey 為例）**<br>:material-arrow-right-bottom: 用隱匿地址讓同一人每次收款都落在不相關的位址，外部串不成同一身分 | Jennifer HSU |
| 15:00-15:30<br>30 分鐘 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-bitcoin: **我不洗錢，為何要理解匿名支付？從零開始介紹隱私加密金流交易**<br>:material-arrow-right-bottom: 為什麼倡議組織與捐款人也該懂加密貨幣金流的隱私風險，用白話走過幾套解法 | 黃豆泥 mashbean |
| 15:40-16:30<br>50 分鐘 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-hammer-wrench: **隱私支付實作工作坊：從龍捲風現金到隱私池**<br>:material-arrow-right-bottom: 用道具與實機操作示範 Tornado Cash 與 Privacy Pool 的用法與隱私眉角 | Liangcc |

### Day 2 — 2026/08/09（日）

8/09 全天排定七場錄取議程，題材從網路與審查基礎、家用網路與校園 Tor 節點，到健保資料庫的個資權利與個人隱私防護。技術場與貼近生活的場交錯，開發者、記者、公民團體都能挑到對應的場次。

**上午 10:00-12:00（教室 `TR-510`）**

| 時間 | 議程 | 講者 |
|------|------|------|
| 10:00-10:50<br>50 分鐘 | <span class="sess-tag sess-tag--basic">通用</span> :material-web: **The Workings of the Internet：網路如何運作、審查如何擋住你（英文進行）**<br>:material-arrow-right-bottom: 用寄明信片的比喻，看清你連上網站的路上有誰能偷看或竄改內容 | Raghu |
| 10:55-11:25<br>30 分鐘 | <span class="sess-tag sess-tag--basic">通用</span> :material-router-network: **以 OpenWRT 等開源軟體建立家用網路環境**<br>:material-arrow-right-bottom: 在家用路由器上做到一般機種沒有的進階設定，含 VLAN 隔離、多 WAN、site-to-site VPN 與 Tor 上游 | Pellaeon Lin |
| 11:30-12:00<br>30 分鐘 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-fingerprint: **區塊鏈網路上基於開放標準的實體身份識別方法**<br>:material-arrow-right-bottom: VASP 法通過後，台灣人的身分在區塊鏈上會用哪些開放標準被定位 | Yusef Schultz |

（12:00-13:00 午休）

**下午 13:00-16:00（教室 `TR-510`）**

| 時間 | 議程 | 講者 |
|------|------|------|
| 13:00-13:30<br>30 分鐘 | <span class="sess-tag sess-tag--relay">Tor Relay</span> :simple-torproject: **在學校種洋蔥？臺師大 Tor 節點建立實務與 EFF Tor University Challenge 經驗談**<br>:material-arrow-right-bottom: 在臺師大架設學術 Tor 節點的完整歷程，從技術配置到校內政策協調 | NZ |
| 13:35-14:25<br>50 分鐘 | <span class="sess-tag sess-tag--privacy">個人隱私</span> :material-eye-off-outline: **瀏覽器追蹤技術、反追蹤策略和使用者自主**<br>:material-arrow-right-bottom: 你每天用的瀏覽器如何被指紋追蹤、可能洩漏你聯繫了誰，以及如何反追蹤 | Pellaeon Lin |
| 14:30-15:00<br>30 分鐘 | <span class="sess-tag sess-tag--privacy">個人隱私</span> :material-database-lock: **健保資料庫案之後：停止利用權如何實踐？以及其他大型資料庫**<br>:material-arrow-right-bottom: 健保資料庫退出權訴訟到修法的經過，以及如何申請停止利用權 | Kuan-Ju Chou |
| 15:05-15:55<br>50 分鐘 | <span class="sess-tag sess-tag--privacy">個人隱私</span> :material-shield-account-outline: **隱私指南 2026**<br>:material-arrow-right-bottom: 從個人隱私風險矩陣，到 NGO 與媒體面對法律調取資料的準備，再到門檻簽章、MPC 等組織級進階工具 | Justyn |

## :material-text-box-multiple-outline: 議程介紹 { #議程介紹 }

### Day 1 — 8/08 上午：社群開源匿名網路導論

四場導論由 anoni.net 社群成員主講，取材自既有文件與 2025 工作坊內容。介紹的工具（Tor、Tails、OONI、Signal、SecureDrop、OnionShare、Cryptpad、mat2 等）全是自由開源軟體，社群本身也以貢獻國際開源專案（翻譯、架設中繼節點、回報問題）的方式參與。

??? abstract ":material-account-group: 匿名網路社群 anoni.net 介紹：開源匿名工具、社群實踐與 2026 三大主題"

    匿名網路社群 anoni.net 是台灣在地的開源社群，這一年持續推廣 Tor、Tails、OONI 這些自由開源的匿名網路工具。開場先說明社群的緣起與運作方式，以及如何以開源協作參與國際專案，把 Tor、Tails、OONI 與 Tor University Challenge 的介面翻成正體中文、回報問題、協助在校園架設中繼節點。接著從記者、公民團體、人權倡議者實際會遇到的處境切入：通訊可能被攔截、身分可能被追蹤，消息來源的安全也連帶受影響。這裡也說明為什麼這類高風險工作特別倚賴原始碼可被公開檢視的開源工具，封閉的黑箱軟體無從驗證它有沒有被動過手腳。最後介紹社群 2026 年推進的三個主題，依情境分級的個人隱私指引、校園 Tor Relay 中繼節點建立，以及在合法前提下對匿名支付的開源工具探索。

??? abstract ":material-target-account: 威脅模型與 Metadata 入門：認識你的對手，以及為什麼匿名工具要開源才可信"

    挑工具之前，先回答三個問題：你要保護什麼、要防的對手是誰、願意付出多少成本。這場用[威脅模型](../basics/threat-model.md)把這三個問題搭成判斷框架，讓你在遇到新工具、新威脅時知道如何對號入座。其中和開源最相關的一點是，當你的對手有能力檢查你的裝置與通訊時，你用的工具能不能被獨立稽核就攸關安全，這也是 Tor Browser、Tails 採用開放原始碼與可重現建置（reproducible build，任何人都能從原始碼編出位元相同的程式、驗證沒被動過手腳）的原因。接著談 [metadata](../basics/metadata.md)（那些沒被加密的連線、時間、聯絡對象等紀錄），就算通話內容沒被監聽，對手仍可能從通聯紀錄知道你在什麼時間聯繫了誰、聯繫多久。對記者與公民團體來說，這類紀錄往往足以反推出消息來源與行動網絡。

??? abstract ":material-newspaper-variant-outline: 記者如何用開源工具保護消息來源：從第一次接觸到報導刊出後的數位整理"

    調查報導的風險，最重的一端常落在消息來源身上。記者背後通常還有編輯部與媒體律師，消息來源卻可能是公司內部員工、政府機關承辦或被監控的社運參與者，暴露的代價高得多。這場沿著一個常見流程走一遍，每一步都對應到一套原始碼公開、可被獨立檢視的開源工具：第一次接觸的安全收件管道（Signal、Freedom of the Press Foundation 維運的 SecureDrop、[OnionShare](../tools/onionshare.md) 都是開源專案）、如何在不留紀錄的前提下確認對方身分、敏感檔案交換前用 mat2 或 Metadata Cleaner 去除 metadata 並以 VeraCrypt 或 Cryptpad 加密儲存、訪談紀錄的最小化，以及報導刊出後記者端與消息來源端各自要做的數位整理。內容會對照台灣的法規脈絡（通訊保障及監察法、2025 年上路的[揭弊者保護法](../taiwan/whistleblower-law.md)）與在地調查報導圈的實務做法。完整流程見[記者保護消息來源](../scenarios/journalist.md)。

??? abstract ":material-cash-multiple: 為什麼匿名支付重要：開源、去中心化的金流與台灣 VASP 法 2026"

    談匿名與隱私時，金流常被遺漏。一筆轉帳的時間、金額、收款對象，配上信用卡號或銀行戶名，幾乎能還原一個人的社交網絡與活動範圍。金流是最難擺脫的一種 metadata，開戶需要實名 KYC（金融機構確認客戶身分的程序）、紀錄依法長期保存、跨機構雙向留存、在合法程序下可被調閱。也會談金流如何被當成審查工具，從 PayPal、Venmo 凍結特定帳號的案例，到長年架設 Tor 中繼節點、卻被支付平台無預警關停的處境。對照之下，也會盤點以開源協定為基礎的替代方案，例如協議層就遮蔽交易資訊的隱私幣 Monero、Zcash，以及零知識證明、多重簽署等開源實作，並逐一點出各自在技術門檻、合法性與接受度上的取捨。最後結合台灣 2026 年上路的[虛擬資產服務法（VASP 法）](../taiwan/vasp-2026.md)說明在地脈絡。社群一向強調合法是匿名支付的前提，工具用於教育與理解風險。這也為下午與 ETHTaipei 合辦的匿名支付場暖身。

### Day 1 — 8/08 下午：ETHTaipei 合辦「匿名支付」場

13:00-16:30 為與 [ETHTaipei](https://ethtaipei.org/){target="_blank"}（台北以太坊社群）合辦的「匿名支付」主題場，在 `TR-511` 教室進行，議程由 ETHTaipei 安排，共五場。上午由社群導論談「為什麼要用」（公民與倡議視角、白話、不碰密碼學細節），下午這五場接續展開「如何實作」，從零知識證明結合自然人憑證、KYC 的隱私保護流程、鏈上隱匿地址，一路談到隱私加密金流與實作工作坊。兩個社群在匿名支付主題上各有切入角度，分工與背景見[跨社群合作](#跨社群合作)。

??? abstract ":material-card-account-details-outline: 零知識證明與自然人憑證身份驗證（Ya-wen Jeng，30 分鐘）"

    如何在不洩漏任何個人資訊的前提下，向服務提供者證明「我是台灣公民」？這場介紹一套結合零知識證明（zero-knowledge proof，不透露內容就能證明某件事為真的密碼學方法）與自然人憑證的隱私保護身分驗證系統。自然人憑證內建 RSA 非對稱金鑰，可對任意訊息數位簽章，系統以 OpenAC 電路框架設計一套 ZKP proving scheme，解析並驗證憑證產生的 RSA 簽章，同時在電路層面隱藏所有可識別個人的欄位。整套流程都在使用者裝置上執行，應用程式請求自然人憑證對特定 challenge 簽章後，於本地端生成零知識證明，最後只把 proof 提交給驗證方，驗證方能確認對方是持有合法自然人憑證的台灣公民，卻無從得知姓名、身分證字號等個資。講者也會介紹已釋出的 SDK 與範例應用，並涵蓋 RSA 簽章電路設計、on-device proof 生成的效能優化與整合示範，適合對隱私強化技術（PET）、去中心化身分（DID）與密碼學應用於公民科技有興趣的聽眾。

??? abstract ":material-account-check-outline: The Privacy-preserving Identity Pipeline in KYC（ryanycw / Ryan Wang，30 分鐘）"

    KYC（金融機構確認客戶身分的程序）有一個內在矛盾，主管機關要求強力的身分證明，但服務每多儲存一筆身分資料，就多一塊永久的外洩破口，傳統做法把證件收齊、查核、歸檔，反而讓每個 KYC 服務商成為高價值攻擊目標、讓使用者承擔永久的揭露風險。這場介紹 zkKYC 領域正在運作的另一套流程，用一組精選的密碼學原語組合出能證明使用者宣稱（護照有效、已成年、與上個月註冊的是同一人）卻不讓伺服器看到身分資料的系統，涵蓋裝置綁定金鑰、加密的身分儲存、政府簽署的證件鏈、生物特徵承諾、零知識證明與經過認證的宣稱遞送。內容以系統設計與架構圖為主，對每個密碼學原語只做高層次說明、不深入數學，適合工程師與產品人，並會誠實盤點尚未解決的問題，例如生物特徵撤銷、後量子 SNARK、不犧牲不可連結性的去重。

??? abstract ":material-link-off: 從不可連結性出發：隱匿地址如何解決鏈上金融隱私（以 Fluidkey 為例）（Jennifer HSU，30 分鐘）"

    區塊鏈上任何人都能查到一個地址的完整交易歷史與餘額，這種永久公開的財務紀錄並不符合日常支付、薪資發放或商業往來對隱私的基本需求。這場從 ECDH 金鑰交換出發，拆解隱匿地址（Stealth Address）的 ERC-5564 推導流程，收款方公開一組 stealth meta-address，每次收款都推導出一個全新的一次性地址，即使同一人收到上百筆款項，也會落在上百個彼此無關的鏈上地址，外部觀察者無法把它們連到同一個身分，只有持有對應 viewing key 的收款人能掃出哪些地址屬於自己。講者會說明為什麼隱匿地址提供的是不可連結性（unlinkability）而非不可追溯性（untraceability），每筆交易在鏈上依然可見、金額與流向都可審計，被切斷的只是地址與身分、以及同一人不同地址之間的關聯，因此在稅務、審計這類需要選擇性揭露的場景比全匿名方案更實用。最後以 Fluidkey 為例，說明它把 ephemeral key 改為從 viewing key 以 BIP-32 階層式路徑推導，讓使用者能完全獨立地重放歷史地址、恢復資金，不必依賴任何中心化服務。

??? abstract ":material-bitcoin: 我不洗錢，為何要理解匿名支付？從零開始介紹隱私加密金流交易（黃豆泥 mashbean，30 分鐘）"

    很多人以為加密貨幣是匿名的，事實正好相反，只要知道一個錢包地址，就能在公開鏈上看到對方完整的金流、社會關係與行動軌跡，對倡議組織、跨境協作的公民團體、需要保護身分的捐款人與受助者來說，這是被嚴重低估的風險。這場用最白話的方式走過鏈上隱私金流的設計邏輯，對照近年區塊鏈社群發展出的三套風格迥異的方案，從被美國制裁、開發者遭起訴的混幣器 Tornado Cash，到走白名單路線、把合規與隱私放進同一個架構協商的 Privacy Pool，再到以黑名單搭配冷卻期與集體偵測、在 2025 年擋下 zkLend 駭客約 950 萬美元洗錢的 Railgun，以及試圖讓隱私變成所有錢包預設值的 Kohaku。講者也會拋出一個對開源社群與公民團體都很關鍵的問題，當隱私從技術問題延伸成治理問題，由誰來定義好人與壞人？這場適合關心數位人權與公民安全的工作者、想了解加密貨幣合規邊界的法遵與會計人員，以及對「我又沒做壞事，為什麼要在乎隱私」這句話感到不太對勁的人。

??? abstract ":material-hammer-wrench: 隱私支付實作工作坊：從龍捲風現金到隱私池（Liangcc，50 分鐘）"

    工作坊從使用者視角出發，介紹龍捲風現金（Tornado Cash）的設計哲學，以及隱私池（Privacy Pool）在它之上的改進。現場會用道具與實機操作示範兩樣工具如何操作，重點放在實際操作與使用上的隱私眉角，密碼學細節則點到為止。時間允許的話，也會談這些工具的沿革與在現實世界造成的衝擊。

### Day 2 — 8/09：七場錄取議程

這七場從網路與審查如何運作的基礎開始，接著是家用網路與校園 Tor 節點的實地部署，再到區塊鏈身分、瀏覽器追蹤、健保資料庫個資權利與個人隱私指南等制度與個人層面的實踐，技術深淺不一，可挑與自己最相關的場次聽。

??? abstract ":material-web: The Workings of the Internet：網路如何運作、審查如何擋住你（Raghu，50 分鐘，英文進行）"

    你在瀏覽器輸入 `google.com` 按下 enter，封包到底經過哪些方的手？這場用寄明信片的比喻，帶你看清楚從你的裝置到目標網站之間，有哪些（多半合法的）角色坐在中間、它們能看到什麼、又能改動什麼。理解這套機制，才能理解審查、監控與資料外洩是怎麼發生的，也才看得懂那些把你嚇去買「某某 VPN」的廣告話術問題在哪。聽完這場，你可能會驚訝預設情況下網路有多不隱私，也會開始更嚴格地看待那些掠奪式的 VPN 行銷。

??? abstract ":material-router-network: 以 OpenWRT 等開源軟體建立家用網路環境（Pellaeon Lin，30 分鐘）"

    OpenWRT 是一套開源的路由器作業系統。這場跳過基本網路設定，直接示範一般家用路由器不提供、但用一點 OpenWRT 設定就能達成的方便、安全與隱私功能，涵蓋挑選支援 OpenWRT 的硬體、用 VLAN 做訪客網路與危險設備隔離、把電信商配發的多個 IP 透過多 WAN 設定充分運用、策略路由與 site-to-site VPN、危險 IP 與域名阻擋，以及 VPN 供應商與 Tor 等特殊上游網路的設定。

??? abstract ":material-fingerprint: 區塊鏈網路上基於開放標準的實體身份識別方法（Yusef Schultz，30 分鐘）"

    各國政府陸續參考並引入區塊鏈防洗錢法案，避免國際犯罪，共同特色就是定位使用者本身。台灣稱為虛擬資產服務法的法案已在 2026 年 4 月 2 日通過，台灣人的身分如何被定位，將逐漸成為台灣虛擬資產持有者關注的議題。講者會盤點現代用於鏈上身分定位的幾種開放標準，並從密碼學研究的角度，談它們為區塊鏈產業帶來的正面技術影響。

??? abstract ":simple-torproject: 在學校種洋蔥？臺師大 Tor 節點建立實務與 EFF Tor University Challenge 經驗談（NZ，30 分鐘）"

    學術網路頻寬穩定、IP 聲譽良好，一直是全球 Tor 網路最重要的支柱之一，但在校園環境部署 Tor 節點要同時處理技術配置與校內政策。講者會分享在國立臺灣師範大學（NTNU）建立學術 Tor 節點的完整歷程，從 EFF 發起的 Tor University Challenge 計畫緣起與其對全球匿名網路的意義，談到 Linux 環境下的節點配置與防火牆規則、如何與學校資訊單位溝通並應用 EFF 提供的法律指南，以及建立節點後的流量觀察與對後續校園推廣的建議，希望藉這段經驗鼓勵更多台灣學研單位參與全球隱私基礎設施的建設。社群整理過的校園架設脈絡見[校園 Tor Relay 建立](../community/relay-on-campus.md)。

??? abstract ":material-eye-off-outline: 瀏覽器追蹤技術、反追蹤策略和使用者自主（Pellaeon Lin，50 分鐘）"

    現代瀏覽器提供許多看似不屬於網頁的 API：WebGL 讓網頁使用圖形加速、WebAudio 讓網頁執行複雜的音訊合成、WebAssembly 讓網頁直接執行低階指令碼。這些與硬體緊密結合的 API 讓網頁能做的事變多，也讓網頁得以蒐集更多使用者資料、更精準地追蹤與識別使用者，而且網頁要求時自動啟用，從沒問過使用者的意見。Pellaeon Lin 會分享他對瀏覽器指紋（browser fingerprint）與反追蹤的研究，會提到 Tor Browser、Brave、VPN 等軟體與技術，並探討反追蹤的動機、策略、幾個潛在解決方案與使用心得。

??? abstract ":material-database-lock: 健保資料庫案之後：停止利用權如何實踐？以及其他大型資料庫（Kuan-Ju Chou，30 分鐘）"

    台灣的就醫資料多年來未經病人同意，就提供產業與學界使用。自台灣人權促進會、台灣女人連線、健保監督聯盟三個民間團體發動退出權訴訟以來，健保資料庫的目的外利用陸續停止販售光碟、限縮至僅供研究使用。2022 年憲法訴訟最終確認政府必須讓人民實踐停止利用權，也就是不同意將個資提供其他目的使用。去年台灣完成修法，開始讓民眾行使停止利用權，但立法過程增加不少例外，大幅縮小停止利用權的範圍。現場會說明如何申請停止利用權、目前的限制，以及台灣還有哪些規範不明、對個資當事人權利保障尚不清楚的大型資料庫，需要公民社會一起監督。

??? abstract ":material-shield-account-outline: 隱私指南 2026（Justyn，50 分鐘）"

    從個人到組織，這場工作坊與座談依序處理三件事。第一，建立個人隱私風險矩陣，把廣告追蹤與資料仲介、詐騙與盜帳號、親密關係加害者、跨境盤查、針對性監控等威脅來源分級，對應到數位身分、行動裝置、SaaS 與雲端、金流四個暴露面，每一格給出以開源工具與裝置內建設定為主的預設配置建議。第二，自我檢核方法學，這場把重點放在方法本身：如何看 App 內嵌的追蹤器、如何觀察裝置真正連去哪裡、如何讀懂 iOS App Privacy Report，並對照 NIST Privacy Framework 與 OWASP MASVS 做最小自評。第三，組織層面的多人協作隱私，針對 NGO、獨立媒體、小型公司，從共享密碼管理、端對端加密協作、組織遭遇法律調取資料的事前準備，到 Shamir Secret Sharing、門檻簽章（FROST、TSS）、MPC（多方計算）、Private Set Intersection（隱私集合交集）、OpenMLS 等較進階、適合技術背景組織管理者的前瞻工具，重點在辨識什麼情境下這些工具真的派得上用場，密碼學細節本身則點到為止。

## :material-handshake: 跨社群合作：匿名網路社群 × ETHTaipei { #跨社群合作 }

今年社群與 [ETHTaipei](https://ethtaipei.org/){target="_blank"}（台北以太坊社群）展開議程合作，8/08 下午的「匿名支付」合辦場把關心數位人權的社群和區塊鏈開發者帶到同一個房間。NGO 與記者能在這裡了解捐款與金流的隱私風險，開發者則能聽到協議層的零知識證明與隱匿地址實作。應用導向、科普類稿件安排在匿名網路社群議程軌，技術、協議層稿件可能調整到 ETHTaipei 區塊鏈議程軌（見[徵稿與聯合審稿安排](./coscup-2026-cfp.md#anoni-netxETHTaipei)），歡迎在兩個議程軌之間跨場。

## :material-link-variant: 相關連結

- [COSCUP 2026 公開徵稿](./coscup-2026-cfp.md)：徵稿主題、跨社群合作與投稿說明
- [匿名網路工作坊 2025（活動紀錄）](../event-workshop-2025.md)：去年兩日工作坊與圓桌會議的內容
- [延續 2025，走向 2026：個人隱私指引、Tor Relay 校園建立競賽、匿名支付探索](../blog/posts/2025to2026.md)
- [關於我們](../about/index.md)
- [如何參與與認領主題](../community/how-to-contribute.md)：想一起貢獻 Tor、OONI、翻譯或架設節點的入口
- [Tor Project 生態與對接](../community/tor-project-ecosystem.md)：與上游 Tor 專案對接的導引

!!! info "活動更新與聯絡"

    議程細節與時間到活動前仍可能調整，最新時間請以 [COSCUP 官方議程](https://pretalx.coscup.org/coscup-2026/){target="_blank"} 為準。想收到社群活動通知，歡迎[持續關注](../contact.md)我們的電子報與聯絡管道。
