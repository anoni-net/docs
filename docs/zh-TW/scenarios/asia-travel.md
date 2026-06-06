---
title: 出差與研討會的數位準備（東亞與東南亞）
description: 整理東亞與東南亞十四個常見出差與研討會地點的網路審查、VPN 與 Tor 可達性、SIM 實名與入境查機現況，幫正體中文使用者在出發前安排對應的數位準備。
icon: material/bag-suitcase-outline
---

# :material-bag-suitcase-outline: 出差與研討會的數位準備（東亞與東南亞）

帶著平常的手機與筆電出國，多數時候不會有事。問題出在你去的地方，網路環境跟家裡差很多。同一支手機，在台灣連得上的 Signal，到了越南要掛 VPN 才連得上。在曼谷按一個讚，可能踩到當地刑法。出差或參加研討會時，先知道目的地的網路審查與監控到什麼程度，才能在出發前做對準備，而不是落地才發現工具用不了、或不小心讓自己暴露在法律風險裡。

這篇整理東亞與東南亞十四個常見地點的現況，做成一張對照表，再給出依風險分層的準備清單。無論你是從台灣、香港、澳門或其他華語環境出發，都可以拿這張表當行前依據。

!!! warning "查證日與時效"
    審查現況變動很快，VPN 能不能用、哪個服務被封，可能幾個月就翻一次。本表整體查證日為 **2026 年 6 月**，每地的判斷以該段時間的公開來源為準。出發前請以 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 查目的地的最新觀測、以各地官方公告查 SIM 與入境規定，不要把靜態表格當成當下的保證。

## 如何讀這張表

- **審查強度**用 Freedom House 的 [Freedom on the Net](https://freedomhouse.org/report/freedom-net){target="_blank"}（FOTN，年度網路自由評比，滿分 100，分數越高越自由）2025 年版的分數與分級。香港、澳門不在 FOTN 單獨評分範圍，改用質性描述標註。
- **分數高不代表沒有風險**。香港、澳門主流服務都連得上，表面像自由網，真正的代價在實名登記、瀏覽紀錄長期留存與法律追究。讀的時候要把「能不能連上」跟「連上之後會不會被究責」分開看。
- **VPN 與 Tor 兩欄**呈現工具的技術可達性與合法性。即使工具能用，發表特定內容仍可能觸法，這部分看逐地註記與最後的研討會提醒。
- 先看下一節的「出發前通用準備」，每個地點都適用，再依目的地落在哪個風險層補上加碼準備。

## 東亞與東南亞網路監控對照表

| 地區 | 審查強度（FOTN 2025） | VPN | Tor | SIM 實名 | 入境裝置檢查 |
|---|---|---|---|---|---|
| 台灣（基準） | 79（自由），亞洲第 1 | 合法 | 可直連 | 護照、第二證件 | 低 |
| 日本 | 78（自由） | 合法 | 可直連 | 數據 eSIM 2026/4 起須驗護照 | 低 |
| 南韓 | 65（部分自由） | 合法 | 可直連 | 護照實名 | 低 |
| 菲律賓 | 61（部分自由） | 合法 | 可直連 | 護照實名，旅客卡 30 天 | 低 |
| 馬來西亞 | 60（部分自由） | 合法 | 可直連 | 護照正本、住宿地址 | 中 |
| 新加坡 | 53（部分自由） | 合法 | 可直連 | 護照實名，30 天效期 | 中（搜查授權強） |
| 印尼 | 48（部分自由） | 合法 | 可直連 | 護照實名、IMEI 登錄 | 中 |
| 香港 | 未單獨評分（FiW 41，部分自由） | 合法 | 一般可直連 | 護照實名（2023 起） | 中（升高中） |
| 澳門 | 未涵蓋 | 合法 | 一般可直連 | 護照實名、ISP 留存一年 | 中（資料少） |
| 柬埔寨 | 42（部分自由） | 合法 | 一般可直連 | 多需證件，無強制法 | 低 |
| 泰國 | 39（不自由） | 合法 | 建議備橋接 | 護照、臉部辨識，60 天 | 中高 |
| 越南 | 22（不自由） | 合法（受網安法規範） | 建議備橋接 | 護照實名 | 中（資料少） |
| 中國大陸 | 9（不自由） | 灰色，須強混淆 | 重度封鎖 | 護照、人臉 | 高 |
| 緬甸 | 9（不自由） | 入罪（2025 網安法） | 重度封鎖 | 護照或 NRC、攔截設備 | 高 |

香港、澳門未列入 FOTN 單獨評分，香港的 FiW（Freedom in the World）2026 年為 41 分（部分自由）僅供質性對照。SIM 與入境規定為 2026 年 6 月查證，細節以出發前官方公告為準。

## 出發前的通用準備（每個地點都適用）

這幾項不分地點都建議做，風險越高的目的地越要做滿。

- **帶最簡化的裝置**。出差用的手機、筆電裡，跟這趟無關的資料越少越好。高風險地建議準備一支只裝必要 App 的乾淨機，敏感資料留在雲端或家裡，需要時再透過加密連線取用。
- **出發前裝好並測試規避工具**。VPN、Tor Browser 與橋接都要在家裡先裝好、連一次確認可用。到了審查嚴的地方，App 商店與工具官網本身就連不上，落地才想下載通常來不及。Tor 的橋接設定見 [Tor Snowflake 橋接點](../tools/tor-snowflake.md) 與 [Tor Browser 進階設定](../tools/tor-browser-advanced.md)，自架橋接見 [如何架設 Tor WebTunnel](../community/setup-tor-webtunnel.md)。
- **準備兩種以上的連線方式**。單一 VPN 協定常被封，多帶一兩款備援。中國這類地方標準 WireGuard、OpenVPN 幾秒內被封，要選有混淆（obfuscation，把 VPN 流量偽裝成一般 HTTPS）功能的方案。具備這類混淆的服務，例如 Proton VPN（Stealth 協定）、Mullvad（混淆、Shadowsocks 橋接）、ExpressVPN（Lightway 自動混淆）、NordVPN（NordWhisper）、Surfshark（Camouflage Mode）、Astrill（StealthVPN）。哪些「現在能用」會隨封鎖更新而變，出發前查當地最新回報並先測試一次。
- **敏感通訊改用端對端加密工具**。Signal 是常見選擇，但部分地區會封鎖，出發前確認目的地能不能連，連不上時改走 Tor 或 VPN。團隊出差可事先約好主要與備用管道。
- **帳號分流**。研討會社交、商務聯絡與個人帳號分開，減少一個被盯上時牽連到其他身分。
- **SIM 用漫遊或純數據 eSIM**。三種方式都會留下某種身分紀錄，差別在這份紀錄落在誰手上、當地政府能不能直接把門號對應到你本人：
    - **落地辦實名卡**：護照（部分地區還加人臉）與這個本地門號，直接登進當地電信商與政府的資料庫，當地執法即查即得，且常長期留存。
    - **本國門號漫遊**：登記你身分的是家鄉的電信商，當地只看到一個外國漫遊號碼的連線與位置，要對應到本人通常得走跨境調取。
    - **純數據 eSIM（無本地號碼）**：連本地門號這層都省掉，身分多半只留在 eSIM 供應商與你的付款紀錄裡。

    對「目的地監控」這個威脅來說，漫遊與 eSIM 把對應留在境外，比較難被當場對應到本人。需要本地號碼收驗證碼時，再評估是否落地辦卡。要注意一個例外，日本 2026 年 4 月起連純數據 eSIM 都要驗護照，這個優勢在部分地區正在縮小。

- **開啟全碟加密、設好開機密碼**。入境查機風險高的地方，關機狀態加上強密碼，比解鎖狀態安全。
- **留好離線備份與緊急聯絡方式**。遇到斷網或裝置被扣，至少還能聯絡上同事或家人。

## 依風險分層的加碼準備

### 低風險：台灣（基準）、日本、南韓

接近家用環境，用平常的工具即可。主要記得辦 SIM 要帶護照，日本 2026 年 4 月起連純數據 eSIM 都要驗護照。南韓有內容過濾與較強的通訊攔截法制，處理敏感資料時仍建議自備 VPN。

### 中風險：菲律賓、馬來西亞、新加坡、印尼、香港、澳門

主流服務大致可用，VPN 與 Tor 可連，但各有針對性封鎖與較強的法律工具。這裡真正要顧的是你發表了什麼、以及實名登記留下的紀錄，連線本身通常不成問題。落地辦卡帶齊證件，公共與會場 WiFi 一律走 VPN，對外發表前先了解當地的誹謗與內容法規。

### 高風險：泰國、越南、柬埔寨、中國大陸

系統性封鎖規模大，法律對線上言論的追訴力道強。出發前務必裝好混淆型 VPN 與 Tor 橋接並測試，帶乾淨機，敏感工作不要在當地網路上做。中國要假設所有連線都被看、境外服務都連不到。泰國、越南建議預設 Tor 橋接，因為近年封鎖規模大增、直連可能受阻。

### 極高風險：緬甸

數位環境是亞洲最危險的之一。2025 年網路安全法把未經授權的 VPN 服務入罪化，街頭與檢查哨會臨檢手機、搜查 VPN App 與社群貼文，衝突區隨時可能全面斷網。攜帶最簡化的乾淨裝置、避免落地辦卡綁定身分、全程假設受監控。涉及敏感主題者面臨人身與資料雙重風險，行前應做完整的威脅評估，必要時諮詢有當地經驗的組織。

## 逐地註記

每地列出主要被封服務、SIM 與入境重點，以及該段時間的查證來源。

### 中國大陸

防火長城（Great Firewall）長期完整封鎖 Google、YouTube、Facebook、Instagram、WhatsApp、Signal、Telegram、X 與全語系 Wikipedia，外媒多數被封。手法含 DNS 污染、SNI 過濾與深度封包檢測（DPI，逐筆分析連線判斷是否放行的技術）。個人翻牆屬違法灰色地帶，2025 年底國安部公開警告會究責。VPN 要選有強混淆的方案、入境前裝好至少兩款。Tor 直連無法使用，obfs4、meek、Snowflake 幾乎都失效，WebTunnel 偶爾連得上但常數分鐘內被封，不應視為可靠管道。SIM 自 2019 年底起強制實名加人臉，外籍旅客同樣適用。2024 年 7 月起新規授權國安人員檢查個人電子裝置，深圳、上海有海關抽查手機與筆電的報告。查證來源（2026-06）：[FOTN 2025 China](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"}、[Tor 對中國的連線指引](https://support.torproject.org/censorship/connecting-from-china/){target="_blank"}。

### 香港

不適用防火長城，Google、社群與通訊服務一般正常可達。但《國安法》下出現選擇性封鎖，2021 年起有 ISP 依法封鎖 HKChronicles 等網站，2024 年通過的《維護國家安全條例》（基本法 23 條立法）擴大調查與下架權限。SIM 自 2023 年 2 月起全面實名，旅客可用護照登記。2024 年已有外國企業赴港改用拋棄式（burner）手機的報導。主流服務連得上不等於安全，敏感討論建議用端對端加密工具、避免存在本地裝置。查證來源（2026-06）：[Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"} - HKFP、[FiW 2026 Hong Kong](https://freedomhouse.org/country/hong-kong/freedom-world/2026){target="_blank"}。

### 澳門

無防火長城，Google、Facebook、YouTube、X、WhatsApp、Telegram、LINE 通常正常運作。代價在《網絡安全法》要求電信實名，且 ISP 須保留用戶瀏覽紀錄至少一年，等於連線行為被長期記錄。SIM 自 2019 年底起須登記，旅客以護照辦理。建議用 VPN 蓋住瀏覽內容、SIM 用漫遊或純數據 eSIM。澳門的 Tor 可達性與入境查機公開資料較少，屬證據不足，敏感任務仍採乾淨裝置原則。查證來源（2026-06）：[FOTN 2025 報告](https://freedomhouse.org/report/freedom-net/2025/uncertain-future-global-internet){target="_blank"}（未含澳門，說明覆蓋範圍）。

### 日本

無系統性封鎖，一般旅客連線完全開放。唯一的灰色地帶是盜版網站的著作權執法走法院途徑，不影響日常上網。VPN 完全合法，Tor 直連可用，日本本身就是 Tor 中繼與出口節點的重要所在地。SIM 方面，2026 年 4 月起依總務省省令，連純數據 eSIM 業者結帳時都要上傳護照或居留證照片。語音門號一向要驗證身分、短期旅客多半辦不到。建議旅客選數據型 eSIM，本國門號保留收銀行驗證碼。查證來源（2026-06）：[FOTN 2025 Japan](https://freedomhouse.org/country/japan/freedom-net/2025){target="_blank"}。

### 南韓

主流外站不封鎖，旅客一般瀏覽不受影響。但有系統性的內容過濾，KCSC 對色情、賭博、北韓宣傳等類別封鎖，2023 年封鎖約 22 萬個網站或網頁，技術上採 SNI 過濾（監看 HTTPS 連線中未加密的網域名稱欄位來比對黑名單），等於 ISP 拿得到你造訪的網域清單。VPN 合法，常被用來繞過過濾。Tor 直連一般可用。SIM 須出示護照實名，觀光 eSIM 較寬鬆但仍綁護照。南韓通訊攔截法制偏強，《通訊秘密保護法》授權即時攔截，處理敏感資料者宜納入威脅模型。查證來源（2026-06）：[FOTN 2025 South Korea](https://freedomhouse.org/country/south-korea/freedom-net/2025){target="_blank"}、[South Korea SNI filtering](https://www.bleepingcomputer.com/news/security/south-korea-is-censoring-the-internet-by-snooping-on-sni-traffic/){target="_blank"} - BleepingComputer。

### 台灣（基準）

全亞洲最開放的網路環境，FOTN 2025 亞洲第 1、全球第 7，主流服務皆不封鎖，作為本表的最低風險對照。Freedom House 點出的疑慮在制度層面：TWNIC 透明度報告顯示 2025 上半年逾 5 萬個網站被列入封鎖（多走 DNS RPZ 框架、且大多未經司法審查），屬治理透明度問題，非旅客日常會遇到的廣泛封鎖。VPN 合法、Tor 直連可用。SIM 預付卡須出示護照（含入境章），通常還要第二證件，機場購買多半只需護照。查證來源（2026-06）：[FOTN 2025 Taiwan](https://freedomhouse.org/country/taiwan/freedom-net/2025){target="_blank"}。

### 菲律賓

東南亞中相對開放的一個，無系統性封鎖。最受關注的事件是 NTC 在 2022 年依《反恐法》要求封鎖含獨立媒體 Bulatlat、Pinoy Weekly 在內的 27 個網站，該封鎖令已於 2025 年 11 月經法院判違憲撤銷。一度傳出要封 Telegram，2026 年 2 月政府與平台達成內容防制協議後不予封鎖。VPN 與 Tor 可正常使用。SIM 依 2022 年《SIM Registration Act》（RA 11934）強制實名，旅客以護照加當地地址登記，卡片 30 天有效。主要法律風險是網路誹謗（cyberlibel），公開發表留意用詞。查證來源（2026-06）：[FOTN 2025 Philippines](https://freedomhouse.org/country/philippines/freedom-net/2025){target="_blank"}、[Court voids NTC blocking order](https://www.bulatlat.com/2025/11/25/bulatlat-wins-censorship-case-court-voids-memo-blocking-27-websites/){target="_blank"} - Bulatlat。

### 馬來西亞

有封鎖，但以線上賭博、色情、侵權為大宗，2018 至 2024 年累計封逾 24,000 個網站。政治動機封鎖過 Sarawak Report、Medium，兩者已於 2025 年 3 月前解封。2024 年底兩項新法擴權：《通訊與多媒體法》修正案與《線上安全法》，賦予 MCMC 更廣的內容移除與監控權。2025 年對 Telegram 取得針對特定公開頻道的法院禁制令。WhatsApp、Telegram、Signal 一般可用，VPN 與 Tor 可用。SIM 自 2018 年起強制實名，旅客須出示護照正本（不接受影本）加在馬住宿地址，2025 年底起新卡須搭配 MyDigital ID。真正的紅線是涉及王室、煽動、宗教與種族的內容。查證來源（2026-06）：[FOTN 2025 Malaysia](https://freedomhouse.org/country/malaysia/freedom-net/2025){target="_blank"}、[MCMC SIM 登記 FAQ](https://www.mcmc.gov.my/en/faqs/prepaid-registration/what-type-of-documents-can-be-used-for-the-registr){target="_blank"}。

### 新加坡

封鎖範圍窄但法律工具強。2024 年 10 月封鎖 10 個被指可用於對新加坡發動敵意資訊行動的網站。新聞網站受 IMDA 牌照與 POFMA（防止網路假訊息與操縱法）約束，政府可對被認定不實的陳述發更正指令。VPN 與 Tor 合法可用，主流服務日常可達。SIM 須以護照登記，以護照登記的非居民卡自 2024 年 7 月起效期僅 30 天。2024 年《刑事訴訟修正法》擴大警方與移民關卡局的搜查權，合法逮捕時可搜查隨身手機毋須另行令狀，實務上一般旅客少見隨機解鎖，但法律門檻低。最大風險在你發表了什麼（POFMA、誹謗、FICA）。查證來源（2026-06）：[FOTN 2025 Singapore](https://freedomhouse.org/country/singapore/freedom-net/2025){target="_blank"}、[Criminal Procedure Amendments Act 2024](https://sso.agc.gov.sg/Acts-Supp/5-2024/Published/20240318?DocDate=20240318){target="_blank"}。

### 印尼

中度且大致可預測的審查，封鎖集中在色情與賭博，透過 Trust Positif 黑名單以 DNS 竄改執行。另有 PSE 平台註冊制，未註冊就封鎖：2022 年曾封 PayPal、Steam、Epic Games 等，2024 年 7 月封 DuckDuckGo。WhatsApp、Tor 在測試期間多為可達，VPN 普及合法。SIM 外國旅客以護照辦理，另自 2020 年起手機須登錄 IMEI，用本地 SIM 時需在入境向海關登錄裝置。整體對一般商務旅客風險可控，行前確認常用服務是否在封鎖名單上。查證來源（2026-06）：[FOTN 2025 Indonesia](https://freedomhouse.org/country/indonesia/freedom-net/2025){target="_blank"}、[iMAP Indonesia 2024](https://imap.sinarproject.org/reports/2024/imap-indonesia-2024-internet-censorship-report){target="_blank"} - Sinar Project。

### 柬埔寨

採選擇性 DNS 封鎖獨立媒體，非全國性大斷網。Voice of Democracy 於 2023 年被關閉，2023 年大選前封鎖 Cambodia Daily、Radio Free Asia 等。OONI 量測顯示被封站多為新聞與人權類，由多家 ISP 以 DNS 執行。VPN 與 Tor 合法可用，是繞過被封新聞站的常見手段，邊境一般不查手機。SIM 目前無強制實名法規，但電信商辦卡多會要求出示證件。需留意 National Internet Gateway（國家網關）計畫在 2025 年復活、規劃 2026 年起建設單一對外網關，一旦上線會大幅增加集中式審查與監控能力。查證來源（2026-06）：[FOTN 2025 Cambodia](https://freedomhouse.org/country/cambodia/freedom-net/2025){target="_blank"}、[Cambodia resurrects internet gateway plan](https://asia.nikkei.com/business/telecommunication/cambodia-resurrects-plan-for-controversial-internet-gateway){target="_blank"} - Nikkei Asia。

### 泰國

東南亞中最受限，FOTN 唯一列為不自由的一個。法源是《電腦犯罪法》與刑法第 112 條（冒犯王室，lèse-majesté，刑期 3 至 15 年）。法院下令、數位經濟與社會部執行 URL 封鎖，官方稱 2025 年底到 2026 年初封鎖逾 22 萬個 URL（多數為線上賭博）。LINE 為主流，WhatsApp、Telegram、Signal 目前可用。VPN 合法普遍，但近年封鎖規模大增，建議旅客預設 Tor 橋接以防直連受阻。SIM 自 2025 年 8 月起導入臉部活體偵測，所有人辦卡須本人到場、出示護照正本，旅客卡 60 天效期。第 112 條與電腦犯罪法適用境內任何人、不分國籍，外國人曾因相關貼文被捕、沒收護照、驅逐並終身禁入，按讚與轉發都可能擔責。絕不公開評論王室。查證來源（2026-06）：[FOTN 2025 Thailand](https://freedomhouse.org/country/thailand/freedom-net/2025){target="_blank"}、[Thailand biometric SIM registration](https://www.biometricupdate.com/202508/thailand-mandates-biometric-liveness-detection-for-sim-registration){target="_blank"} - Biometric Update。

### 越南

高審查環境，FOTN 22 分。2025 年 5 月電信局下令 ISP 封鎖 Telegram，用戶未掛 VPN 即難以連上。Decree 53/2022 要求外國業者資料在地化、留存資料至少 24 個月。Decree 147/2024 要求大型平台以越南手機號或身分證實名、24 小時內移除違法內容，Facebook 受影響最大。另有數萬人規模的「47 部隊」網軍以檢舉與帶風向壓制異議。VPN 使用合法但受網安法規範，建議行前裝好設定。Tor 直連大致可用，但審查機制活躍，建議備妥 WebTunnel 或 Snowflake 橋接。SIM 強制護照實名。會場與飯店 WiFi 不應視為可信，敏感通訊改用 Signal 並先確認可達。查證來源（2026-06）：[FOTN 2025 Vietnam](https://freedomhouse.org/country/vietnam/freedom-net/2025){target="_blank"}、[Vietnam orders Telegram ban](https://www.aljazeera.com/news/2025/5/24/vietnam-orders-ban-on-popular-messaging-app){target="_blank"} - Al Jazeera。

### 緬甸

與中國並列全球最差，FOTN 9 分。政變後封鎖 Facebook、X、Instagram、WhatsApp，2024 年中封鎖 Signal 與主要 VPN。2024 年起以中國 Geedge Networks 的 DPI 技術全國封鎖 VPN，《Cybersecurity Law No. 1/2025》於 2025 年 7 月 30 日生效，未經授權提供 VPN 服務最高可判 6 個月徒刑與高額罰款，且具域外效力。Tor 與 Psiphon 都被當作非法目標封鎖，旅客不應假設預設 Tor 或一般橋接能連上。SIM 強制實名，軍方已令電信商安裝攔截設備，SIM 與國民登記卡連結，檢查哨以監控系統核對身分。街頭與檢查哨會搜查手機裡的 VPN 與社群內容。衝突區頻繁全面斷網，Access Now 記錄緬甸 2024 年至少 85 次、2025 年至少 95 次斷網，連兩年居全球之冠。涉敏感主題者面臨人身與資料雙重風險。查證來源（2026-06）：[FOTN 2025 Myanmar](https://freedomhouse.org/country/myanmar/freedom-net/2025){target="_blank"}、[Myanmar cybersecurity law restricts VPNs](https://www.rfa.org/english/myanmar/2025/01/02/cybersecurity-law-vpn/){target="_blank"} - RFA、[internet shutdowns in 2025](https://www.accessnow.org/internet-shutdowns-2025/){target="_blank"} - Access Now。

## 研討會場景的特別提醒

研討會跟單純出差多了幾個面向，值得另外留意。

- **報到實名與議程資料**。不少研討會報名要綁實名與單位，到了現場領的識別證、簽到系統都會留下出席紀錄。涉及敏感議題的活動，評估用哪個身分報名、要不要公開出席。
- **會場與飯店 WiFi 一律視為不可信**。公共網路有假熱點與竊聽風險，連線一律走 VPN 加密。在中國、越南、緬甸這類地方，更要假設場館網路本身受監控。
- **公開發表的法律風險才是大宗**。多數地點連得上網，真正會出事的是你發表了什麼、分享了什麼。泰國的刑法第 112 條、新加坡的 POFMA 與誹謗法、馬來西亞涉王室與宗教的內容、越南與中國的政治言論，都可能讓外國與會者被追訴。發表涉當地政治、王室、宗教、種族的內容前先查清楚規範。
- **團隊出差約好通訊管道**。主要與備用管道各一，遇到斷網或單一工具被封時還能聯絡。緬甸這類隨時可能斷網的地方尤其要先約好。

## 回報過時資訊

審查現況變動快，本表難免有落後現實的地方。如果你發現某地的封鎖、VPN、SIM 或入境規定已經跟表上不同，歡迎到 [社群 Matrix 公開 room](../community/tools.md) 回報，或匿名寄到 [whisper@anoni.net](mailto:whisper@anoni.net)，我們會查證後更新。有當地第一手經驗、願意補充逐地註記的人，也歡迎一起參與。

## 相關閱讀

- [威脅模型](../basics/threat-model.md)：先想清楚對手是誰、能拿到什麼，才知道每地要做到哪種程度。
- [Metadata 為什麼重要](../basics/metadata.md)：連線與裝置留下的紀錄，是出差時最容易忽略的暴露面。
- [LGBTQ+ 與性少數的匿名社交](./lgbtq.md)：其中的跨國旅行裝置準備一節，可搭配本文的乾淨機建議。
- [Tor Browser 進階設定](../tools/tor-browser-advanced.md) 與 [什麼是 Tor](../tools/what-is-tor.md)：橋接與規避設定的操作細節。
