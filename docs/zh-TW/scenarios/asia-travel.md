---
title: 出差與研討會的數位準備（東亞與東南亞）
description: 整理東亞與東南亞十四個常見出差與研討會地點的網路審查、VPN 與 Tor 可達性、SIM 實名與入境查機現況，幫正體中文使用者在出發前安排對應的數位準備。
icon: material/bag-suitcase-outline
---

# :material-bag-suitcase-outline: 出差與研討會的數位準備（東亞與東南亞）

帶著平常的手機與筆電出國，多數時候不會有事。問題出在你去的地方，網路環境跟家裡差很多。同一支手機，在台灣連得上的 Signal，到了越南要掛 VPN 才連得上。在曼谷按一個讚，可能遇到當地刑法。出差或參加研討會時，先知道目的地的網路審查與監控到什麼程度，才能在出發前做對準備，而不是落地才發現工具用不了、或不小心讓自己暴露在法律風險裡。

這篇整理東亞與東南亞十四個常見地點的現況，做成一張對照表，再給出依風險分層的準備清單。無論你是從台灣、香港、澳門或其他華語環境出發，都可以拿這張表當行前依據。

!!! warning "查證日與時效"
    審查現況變動很快，VPN 能不能用、哪個服務被封，可能幾個月就翻一次。本表整體查證日為 **2026 年 8 月**，每地的判斷以該段時間的公開來源為準。出發前請以 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 查目的地的最新觀測、以各地官方公告查 SIM 與入境規定，不要把靜態表格當成當下的保證。

## 如何讀這張表

- **審查強度**用 Freedom House 的 [Freedom on the Net](https://freedomhouse.org/report/freedom-net){target="_blank"}（FOTN，年度網路自由評比，滿分 100，分數越高越自由）2025 年版的分數與分級。香港、澳門不在 FOTN 單獨評分範圍，改用質性描述標註。
- **分數高不代表沒有風險**。香港、澳門主流服務都連得上，表面像自由網，真正的代價在實名登記、瀏覽紀錄長期留存與法律追究。讀的時候要把「能不能連上」跟「連上之後會不會被究責」分開看。
- **VPN 與 Tor 兩欄**呈現工具的技術可達性與合法性。Tor 是把連線經過多個中繼轉送、隱藏你來源位置的免費匿名工具（詳見 [什麼是 Tor](../tools/what-is-tor.md)），不熟的人可以先看 VPN 欄，把 Tor 欄當進階參考。即使工具能用，發表特定內容仍可能觸法，這部分看逐地註記與最後的研討會提醒。
- 先看下一節的「出發前通用準備」，每個地點都適用，再依目的地落在哪個風險層補上加碼準備。

## 東亞與東南亞網路監控對照表

| 地區 | 審查強度（FOTN 2025） | VPN | Tor | SIM 實名 | 入境裝置檢查 |
|---|---|---|---|---|---|
| 台灣（基準） | 79（自由），亞洲第 1 | 合法 | 可直連 | 護照、第二證件 | 低 |
| 日本 | 78（自由） | 合法 | 可直連 | 日本業者售卡須驗護照（2026/4 起） | 低 |
| 南韓 | 65（部分自由） | 合法 | 可直連 | 護照實名 | 低 |
| 菲律賓 | 61（部分自由） | 合法 | 可直連 | 護照實名，旅客卡 30 天 | 低 |
| 馬來西亞 | 60（部分自由） | 合法 | 可直連 | 護照正本、住宿地址 | 中 |
| 新加坡 | 53（部分自由） | 合法 | 可直連 | 護照實名，30 天效期 | 中（搜查授權強） |
| 印尼 | 48（部分自由） | 合法 | 可直連 | 護照實名、IMEI 登錄 | 中 |
| 香港 | 未單獨評分（FiW 41，部分自由） | 合法 | 一般可直連 | 護照實名（2023 起） | **高**（2026/3 起可要求解鎖，含轉機） |
| 澳門 | 未涵蓋 | 合法 | 一般可直連 | 護照實名、ISP 留存一年 | 中（資料少） |
| 柬埔寨 | 42（部分自由） | 合法 | 一般可直連 | 多需證件，無強制法 | 低 |
| 泰國 | 39（不自由） | 合法 | 建議備橋接 | 護照、臉部辨識，每業者上限 3 張 | 中高 |
| 越南 | 22（不自由） | 合法（受網安法規範） | 建議備橋接 | 護照實名 | 中（資料少） |
| 中國大陸 | 9（不自由） | 灰色，須強混淆 | 重度封鎖 | 護照、人臉 | 高 |
| 緬甸 | 9（不自由） | 提供服務入罪（2025 網安法） | 重度封鎖 | 護照或 NRC、攔截設備 | 高 |

香港、澳門未列入 FOTN 單獨評分，香港的 FiW（Freedom in the World）2026 年為 41 分（部分自由）僅供質性對照。SIM 與入境規定為 2026 年 8 月查證，細節以出發前官方公告為準。

自上一版（2026 年 6 月）以來改動最大的是香港，入境裝置檢查從「中」升到「高」，理由是 2026 年 3 月生效的兩項新規，細節見後面逐地註記的香港一節。其餘變動集中在泰國的 SIM 新規、南韓的 CDN 層封鎖、新加坡的新監理機關，同樣見逐地註記。

## 出發前的通用準備（每個地點都適用）

這幾項不分地點都建議做，風險越高的目的地越要做滿。

- **帶最簡化的裝置**。出差用的手機、筆電裡，跟這趟無關的資料越少越好。高風險地建議準備一支只裝必要 App 的乾淨機，敏感資料留在雲端或家裡，需要時再透過加密連線取用。
- **出發前裝好並測試規避工具**。VPN、Tor Browser 與橋接都要在家裡先裝好、連一次確認可用。到了審查嚴的地方，App 商店與工具官網本身就連不上，落地才想下載通常來不及。Tor 的橋接設定見 [Tor Snowflake 橋接點](../tools/tor-snowflake.md) 與 [Tor Browser 進階設定](../tools/tor-browser-advanced.md)，自架橋接見 [如何架設 Tor WebTunnel](../community/setup-tor-webtunnel.md)。
- **準備兩種以上的連線方式**。單一 VPN 協定常被封，多帶一兩款備援。多數目的地用一般 VPN 就夠，只有中國、緬甸這種強封鎖地，標準的 WireGuard、OpenVPN 幾秒內就被封，要改用有混淆（obfuscation，把 VPN 流量偽裝成一般 HTTPS）功能的方案。具備這類混淆的服務，例如 Proton VPN（Stealth 協定）、Mullvad（混淆、Shadowsocks 橋接）、ExpressVPN（自動混淆，Lightway 協定）、NordVPN（NordWhisper）、Surfshark（Camouflage Mode）、Astrill（StealthVPN）。哪些「現在能用」會隨封鎖更新而變，出發前查當地最新回報並先測試一次。怎麼挑一個值得信任的 VPN（稽核、所有權、匿名付款）見 [VPN 的風險與選擇](../tools/vpn-guide.md)。
- **敏感通訊改用端對端加密工具**。Signal 是常見選擇，但部分地區會封鎖，出發前確認目的地能不能連，連不上時改走 Tor 或 VPN。團隊出差可事先約好主要與備用管道。
- **帳號分流**。研討會社交、商務聯絡與個人帳號分開，減少一個被盯上時牽連到其他身分。
- **SIM 用漫遊或純數據 eSIM**。三種方式都會留下某種身分紀錄，差別在這份紀錄落在誰手上、當地政府能不能直接把門號對應到你本人：
    - **落地辦實名卡**：護照（部分地區還加人臉）與這個本地門號，直接登進當地電信商與政府的資料庫，當地執法即查即得，且常長期留存。
    - **本國門號漫遊**：登記你身分的是家鄉的電信商，當地只看到一個外國漫遊號碼的連線與位置，要對應到本人通常得走跨境調取。
    - **純數據 eSIM（無本地號碼）**：連本地門號這層都省掉，身分多半只留在 eSIM 供應商與你的付款紀錄裡。

    對「目的地監控」這個威脅來說，漫遊與 eSIM 把對應留在境外，比較難被當場對應到本人。需要本地號碼收驗證碼時，再評估是否落地辦卡。實名要求正在往 eSIM 延伸，日本 2026 年 4 月起向日本業者購買任何 SIM 或 eSIM（含純數據方案）都要出示護照或居留證，出發前在自己國家向國際 eSIM 供應商買的旅遊方案則不受這條省令規範。這個差別各地不同，出發前查目的地的當下規則，不要預設 eSIM 一定匿名。

- **開啟全碟加密、設好開機密碼**。入境查機風險高的地方，關機狀態加上強密碼，比解鎖狀態安全。要分清楚這道防護擋的是什麼，加密擋的是裝置被拿去離線取出資料，擋不掉「當場要求你解鎖」。香港 2026 年 3 月起，在檢查站拒絕交出密碼本身就是刑事罪，中國、緬甸則有現場臨檢。在這些地方，真正有效的是裝置裡本來就沒有敏感內容。
- **留好離線備份與緊急聯絡方式**。遇到斷網或裝置被扣，至少還能聯絡上同事或家人。

## 依風險分層的加碼準備

先做完上一節的通用準備，再依目的地落在哪一層補上加碼項。這節給的是跨地的準備強度，每地更細的被封服務與查證來源見後面的逐地註記。

### 低風險：台灣（基準）、日本、南韓

接近家用環境，用平常的工具即可。主要記得辦 SIM 要帶護照，日本 2026 年 4 月起向日本業者買卡一律要驗證身分。南韓有內容過濾與較強的通訊攔截法制，2026 年起又把封鎖推進到 CDN 層，過度封鎖波及正常網站的機會變高，處理敏感資料或遇到連不上的站台時自備 VPN。

### 中風險：菲律賓、馬來西亞、新加坡、印尼、澳門

主流服務大致可用，VPN 與 Tor 可連，但各有針對性封鎖與較強的法律工具。這裡真正要顧的是你發表了什麼、以及實名登記留下的紀錄，連線本身通常不成問題。落地辦卡帶齊證件，公共與會場 Wi-Fi 一律走 VPN，對外發表前先了解當地的誹謗與內容法規。

### 高風險：香港、泰國、越南、柬埔寨、中國大陸

系統性封鎖規模大，法律對線上言論的追訴力道強。出發前務必裝好混淆型 VPN 與 Tor 橋接並測試，帶乾淨機，敏感工作不要在當地網路上做。中國要假設所有連線都受監看、境外服務都連不到。泰國、越南建議預設 Tor 橋接，因為近年封鎖規模大增、直連可能受阻。

香港列在這一層的理由跟其他四地不同。香港的連線環境接近中風險，Google、社群與通訊服務照常可達，門檻在入境檢查站，2026 年 3 月起海關、入境處與警務人員可要求任何受檢查的人解鎖手機、筆電與平板，適用所有國籍，包含只在香港機場轉機並通關的旅客。裝置內容成為主要暴露面之後，準備強度就要拉到乾淨機這一層，帶最少的東西過關比事後解釋有用。

### 極高風險：緬甸

數位環境是亞洲最危險的之一。2025 年網路安全法把未經授權的 VPN 服務入罪化，街頭與檢查哨會臨檢手機、搜查 VPN App 與社群貼文，衝突區隨時可能全面斷網。攜帶最簡化的乾淨裝置、避免落地辦卡綁定身分、全程假設受監控。涉及敏感主題者面臨人身與資料雙重風險，行前應做完整的威脅評估，必要時諮詢有當地經驗的組織。

## 逐地註記

每地列出主要被封服務、SIM 與入境重點，以及該段時間的查證來源。

### 中國大陸

防火長城（Great Firewall）長期完整封鎖 Google、YouTube、Facebook、Instagram、WhatsApp、Signal、Telegram、X 與全語系 Wikipedia，外媒多數被封。手法含 DNS 污染、SNI 過濾與深度封包檢測（DPI，逐筆分析連線判斷是否放行的技術）。個人翻牆屬違法灰色地帶，2025 年底國安部公開警告會究責。VPN 要選有強混淆的方案、入境前裝好至少兩款。Tor 直連在中國無法使用，obfs4 橋接長期被封。Tor Project 對中國目前建議優先用 WebTunnel，Snowflake、meek 作為備選，但可用性會隨封鎖更新大幅波動，出發前務必先測試，並多備幾種橋接。SIM 自 2019 年底起強制實名加人臉，外籍旅客同樣適用。2024 年 7 月起新規授權國安人員檢查個人電子裝置，深圳、上海有海關抽查手機與筆電的報告。查證來源（2026-08）：[FOTN 2025 China](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"}、[Tor 對中國的連線指引](https://support.torproject.org/censorship/connecting-from-china/){target="_blank"}。

### 香港

不適用防火長城，Google、社群與通訊服務一般正常可達。但《國安法》下出現選擇性封鎖，2021 年起有 ISP 依法封鎖 HKChronicles 等網站，2024 年通過的《維護國家安全條例》（基本法 23 條立法）擴大調查與下架權限。SIM 自 2023 年 2 月起全面實名，旅客可用護照登記。2024 年已有外國企業赴港改用拋棄式（burner）手機的報導。

2026 年 3 月有兩項獨立的新規上路，把裝置內容變成赴港的主要暴露面：

- **3 月 23 日**刊憲生效的《國安法》第 43 條實施細則修訂，要求受國安調查的人、以及被認為知道被扣裝置密碼或解密方法的人交出密碼。個人拒絕最高可判監禁一年並罰款 10 萬港元，明知而提供虛假或誤導資料最高三年與 50 萬港元。
- **3 月 30 日**生效的邊境檢查權另成一套，海關、入境處與警務人員可要求任何受檢查的人解鎖手機、筆電、平板並提供合理協助。這一條不以國安嫌疑為前提，適用範圍比前一條廣，涵蓋所有國籍，也涵蓋在香港機場轉機並通關的旅客。純空側轉機、不入境直接轉搭下一班，一般不在適用範圍。這條的公開法律文本與罰則細節比 3 月 23 日那條少，各家報導對罰則的描述不一致，出發前以官方公告為準。

美國駐港澳總領事館於 2026 年 3 月 26 日就此發出安全警示，提醒旅客做好被要求交出裝置密碼的準備。實務上要把準備從「連線加密」移到「裝置內容最小化」，敏感資料留在境外、用乾淨機過關，比到了櫃檯再考慮要不要配合有用。主流服務連得上不等於安全，敏感討論用端對端加密工具，並避免留存在本地裝置。查證來源（2026-08）：[Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"} - HKFP、[香港引入國安嫌疑人交出密碼的罪行](https://hongkongfp.com/2026/03/23/hong-kong-introduces-offence-requiring-national-security-suspects-to-hand-over-passwords/){target="_blank"} - HKFP、[Security Alert：拒絕交出行動裝置密碼在香港已入罪](https://hk.usconsulate.gov/security-alert-2026032601/){target="_blank"} - 美國駐港澳總領事館、[FiW 2026 Hong Kong](https://freedomhouse.org/country/hong-kong/freedom-world/2026){target="_blank"}。

### 澳門

無防火長城，Google、Facebook、YouTube、X、WhatsApp、Telegram、LINE 通常正常運作。代價在《網絡安全法》要求電信實名，且 ISP 須保留用戶瀏覽紀錄至少一年，等於連線行為被長期記錄。SIM 自 2019 年底起須登記，旅客以護照辦理。建議用 VPN 蓋住瀏覽內容、SIM 用漫遊或純數據 eSIM。澳門的 Tor 可達性與入境查機公開資料較少，屬證據不足，敏感任務仍採乾淨裝置原則。香港 2026 年 3 月的邊境解鎖權只適用於香港，澳門目前未見同類公開規定，但港澳常排在同一趟行程，只要途中經過香港，整趟就按香港的標準準備。查證來源（2026-08）：[FOTN 2025 報告](https://freedomhouse.org/report/freedom-net/2025/uncertain-future-global-internet){target="_blank"}（未含澳門，說明覆蓋範圍）。

### 日本

無系統性封鎖，一般旅客連線完全開放。唯一的灰色地帶是盜版網站的著作權執法走法院途徑，不影響日常上網。VPN 完全合法，Tor 直連可用，日本本身就是 Tor 中繼與出口節點的重要所在地。SIM 方面，2026 年 4 月 1 日起依總務省省令，向日本業者購買任何 SIM 或 eSIM 都要出示護照或居留證，純數據方案也一樣，目的是壓制匿名預付卡被用於詐騙。語音門號一向要驗證身分、短期旅客多半辦不到。這條省令規範的是日本境內業者，出國前在自己國家向國際 eSIM 供應商買的日本旅遊方案，目前不需要向日方驗證身分。建議旅客用數據型 eSIM，本國門號保留收銀行驗證碼。查證來源（2026-08）：[FOTN 2025 Japan](https://freedomhouse.org/country/japan/freedom-net/2025){target="_blank"}。

### 南韓

主流外站不封鎖，旅客一般瀏覽不受影響。但有系統性的內容過濾，KCSC 對色情、賭博、北韓宣傳等類別封鎖，近年每年封鎖逾 20 萬件網站、網頁與社群貼文，技術上採 SNI 過濾（監看 HTTPS 連線中未加密的網域名稱欄位來比對黑名單），等於 ISP 拿得到你造訪的網域清單。VPN 合法，常被用來繞過過濾。Tor 直連一般可用。SIM 須出示護照實名，觀光 eSIM 較寬鬆但仍綁護照。南韓通訊攔截法制偏強，《通訊秘密保護法》授權即時攔截，處理敏感資料者宜納入威脅模型。

2026 年封鎖手段升了一級，從 ISP 端推進到全球 CDN 業者端。依 2025 年 5 月施行的非法資訊接取阻斷技術義務化規定，主管機關於 2025 年 9 月要求 Cloudflare 配合，2026 年 5 月 1 日起經 Cloudflare 代管的目標站台對韓國連線直接回 HTTP `451`。同月再上路著作權侵害網站的緊急阻斷制度，改由主管部會命令先行封鎖、事後審議，走完整審議程序的時間被壓縮掉。這個層級的封鎖改 DNS 規避不了，過去在 ISP 端有效的規避工具也跟著失效。對商務旅客的實際影響是過度封鎖的機率上升，同一 CDN 上的正常站台可能一併連不上，行程仰賴特定服務時先備好 VPN。查證來源（2026-08）：[FOTN 2025 South Korea](https://freedomhouse.org/country/south-korea/freedom-net/2025){target="_blank"}、[South Korea SNI filtering](https://www.bleepingcomputer.com/news/security/south-korea-is-censoring-the-internet-by-snooping-on-sni-traffic/){target="_blank"} - BleepingComputer、[KCSC 行政審查統計](https://www.opennetkorea.org/en/wp/5153){target="_blank"} - Open Net Korea、[韓國 CDN 層封鎖與規避工具失效](https://cybernews.com/vpn-news/goodbyedpi-free-sites-apps-bypass-tools-not-working-korea-vpn-demand-2026/){target="_blank"} - Cybernews。

### 台灣（基準）

全亞洲最開放的網路環境，FOTN 2025 亞洲第 1、全球第 7，主流服務皆不封鎖，作為本表的最低風險對照。Freedom House 點出的疑慮在制度層面：TWNIC 透明度報告顯示 2025 上半年逾 5 萬個網域被列入 RPZ 屏蔽，多數透過緊急請求（RPZ 1.5）、未經事前司法審查，屬治理透明度問題，非旅客日常會遇到的廣泛封鎖。TWNIC 已上線 2025 下半年與年度報告，並開放歷年報告下載，要引用數字時以該站當期公布為準。VPN 合法、Tor 直連可用。SIM 預付卡須出示護照（含入境章），通常還要第二證件，機場購買多半只需護照。查證來源（2026-08）：[FOTN 2025 Taiwan](https://freedomhouse.org/country/taiwan/freedom-net/2025){target="_blank"}、[TWNIC RPZ 透明度報告](https://rpz.twnic.tw/){target="_blank"}。

### 菲律賓

東南亞中相對開放的一個，無系統性封鎖。最受關注的事件是 NTC 在 2022 年依《反恐法》要求封鎖含獨立媒體 Bulatlat、Pinoy Weekly 在內的 27 個網站，該封鎖令已於 2025 年 11 月經法院判違憲撤銷。一度傳出要封 Telegram，2026 年 2 月政府與平台達成內容防制協議後不予封鎖。VPN 與 Tor 可正常使用。SIM 依 2022 年《SIM Registration Act》（RA 11934）強制實名，旅客以護照加當地地址登記，卡片 30 天有效。主要法律風險是網路誹謗（cyberlibel），公開發表留意用詞。查證來源（2026-08）：[FOTN 2025 Philippines](https://freedomhouse.org/country/philippines/freedom-net/2025){target="_blank"}、[Court voids NTC blocking order](https://www.bulatlat.com/2025/11/25/bulatlat-wins-censorship-case-court-voids-memo-blocking-27-websites/){target="_blank"} - Bulatlat。

### 馬來西亞

有封鎖，但以線上賭博、色情、侵權為大宗，2018 至 2024 年累計封逾 24,000 個網站。政治動機封鎖過 Sarawak Report、Medium，兩者已於 2025 年 3 月前解封。2024 年底兩項新法擴權：《通訊與多媒體法》修正案，以及《線上安全法》（Online Safety Act 2025，2024 年 12 月國會通過），賦予 MCMC 更廣的內容移除與監控權。《線上安全法》已於 2026 年 1 月 1 日生效，在馬用戶數達 800 萬以上的社群與通訊平台自動視為持牌，須配合內容處置要求，MCMC 上路第一週就依該法處理逾 1,500 則貼文。法規對象是平台業者，一般使用者不在直接規範範圍，實際影響落在內容被移除的速度變快。2025 年對 Telegram 取得針對特定公開頻道的法院禁制令。WhatsApp、Telegram、Signal 一般可用，VPN 與 Tor 可用。SIM 自 2018 年起強制實名，旅客須出示護照正本（不接受影本）加在馬住宿地址，2025 年底起本地新卡登記須綁 MyDigital ID（限馬國公民，外國旅客不適用，仍以護照登記）。真正的紅線是涉及王室、煽動、宗教與種族的內容。查證來源（2026-08）：[FOTN 2025 Malaysia](https://freedomhouse.org/country/malaysia/freedom-net/2025){target="_blank"}、[MCMC SIM 登記 FAQ](https://www.mcmc.gov.my/en/faqs/prepaid-registration/what-type-of-documents-can-be-used-for-the-registr){target="_blank"}。

### 新加坡

封鎖範圍窄但法律工具強。2024 年 10 月封鎖 10 個被指可用於對新加坡發動敵意資訊行動的網站。新聞網站受 IMDA 牌照與 POFMA（防止網路假訊息與操縱法）約束，政府可對被認定不實的陳述發更正指令。VPN 與 Tor 合法可用，主流服務日常可達。SIM 須以護照登記，以護照登記的非居民卡自 2024 年 7 月起效期僅 30 天。2024 年《刑事訴訟修正法》擴大無令狀搜查權，逮捕可疑犯罪者時得搜查其持有或控制的物件，實務上一般旅客少見隨機解鎖，但法律門檻低。

2026 年 6 月 29 日起，依《線上安全（救濟與問責）法》成立的線上安全委員會（Online Safety Commission）開始受理案件，處理網路霸凌、起底、未經同意散布私密影像等線上傷害。委員會可要求平台限期移除內容，平台不配合時得命令 ISP 封鎖特定頁面、群組，必要時封鎖整個平台。封鎖整個平台屬最後手段，但這項權力讓新加坡的封鎖工具箱從 POFMA 的個案更正指令擴大到服務層級。最大風險仍在你發表了什麼（POFMA、誹謗、FICA）。查證來源（2026-08）：[FOTN 2025 Singapore](https://freedomhouse.org/country/singapore/freedom-net/2025){target="_blank"}、[Criminal Procedure Amendments Act 2024](https://sso.agc.gov.sg/Acts-Supp/5-2024/Published/20240318?DocDate=20240318){target="_blank"}、[線上安全委員會與《線上安全（救濟與問責）法》自 2026 年 6 月 29 日施行](https://www.mlaw.gov.sg/online-safety-commission-and-online-safety-relief-and-accountability-act-2025-to-start-on-29-june-2026/){target="_blank"} - 新加坡律政部。

### 印尼

中度且大致可預測的審查，封鎖集中在色情與賭博，透過 Trust Positif 黑名單以 DNS 竄改執行。另有 PSE 平台註冊制，未註冊就封鎖：2022 年曾封 PayPal、Steam、Epic Games 等，2024 年 7 月封 DuckDuckGo，2026 年 2 月底到 4 月底封鎖 Wikimedia 的登入網域，同樣以未完成註冊為由。2026 年 5 月 22 日以線上賭博為由封鎖預測市場平台 Polymarket。另自 2026 年 3 月起施行兒少數位空間保護規則（PP Tunas），未滿 16 歲不得在高風險平台持有帳號，平台須配合驗證年齡。WhatsApp、Tor 在測試期間多為可達，VPN 普及合法。SIM 外國旅客以護照辦理，另自 2020 年起手機須登錄 IMEI，用本地 SIM 時需在入境向海關登錄裝置。整體對一般商務旅客風險可控，行前確認常用服務是否在封鎖名單上，需要登入編輯維基或使用小眾服務的人尤其要先測。查證來源（2026-08）：[FOTN 2025 Indonesia](https://freedomhouse.org/country/indonesia/freedom-net/2025){target="_blank"}、[iMAP Indonesia 2024](https://imap.sinarproject.org/reports/2024/imap-indonesia-2024-internet-censorship-report){target="_blank"} - Sinar Project。

### 柬埔寨

採選擇性 DNS 封鎖獨立媒體，非全國性大斷網。Voice of Democracy 於 2023 年被關閉，2023 年大選前封鎖 Cambodia Daily、Radio Free Asia 等。OONI 量測顯示被封站多為新聞與人權類，由多家 ISP 以 DNS 執行。VPN 與 Tor 合法可用，是繞過被封新聞站的常見手段，邊境一般不查手機。SIM 目前無強制實名法規，但電信商辦卡多會要求出示證件。需留意 National Internet Gateway（國家網關）計畫在 2025 年復活、規劃 2026 年起建設單一對外網關，一旦上線會大幅增加集中式審查與監控能力。這項計畫自 2022 年原定啟用日起多次延期，截至 2026 年 8 月仍未見上線的公開確認，出發前值得再查一次狀態。查證來源（2026-08）：[FOTN 2025 Cambodia](https://freedomhouse.org/country/cambodia/freedom-net/2025){target="_blank"}、[Cambodia resurrects internet gateway plan](https://asia.nikkei.com/business/telecommunication/cambodia-resurrects-plan-for-controversial-internet-gateway){target="_blank"} - Nikkei Asia。

### 泰國

東南亞主要商旅目的地中審查最受關注的一個，FOTN 列為不自由（與越南、緬甸同列）。法源是《電腦犯罪法》與刑法第 112 條（冒犯王室，lèse-majesté，刑期 3 至 15 年）。法院下令、數位經濟與社會部執行 URL 封鎖，官方稱 2025 年底到 2026 年初封鎖逾 22 萬個 URL（多數為線上賭博）。LINE 為主流，WhatsApp、Telegram、Signal 目前可用。VPN 合法普遍，但近年封鎖規模大增，建議旅客預設 Tor 橋接以防直連受阻。SIM 規則在 2026 年 5 月再收緊，NBTC 於 5 月 15 日公報、5 月 16 日生效的科技犯罪防制公告修訂 2025 年 8 月版，外國人在每一家業者最多只能登記 3 張 SIM，護照為主要登記文件、須本人到場並通過含生物特徵的查驗，登記後 60 天內未啟用就要重新驗證，插滿四張卡以上的多卡設備會被業者阻斷。舊資料常把「60 天」寫成旅客卡效期，實際上那是啟用期限，各家旅客方案本身的效期另計。第 112 條與電腦犯罪法適用境內任何人、不分國籍，外國人曾因相關貼文被捕、沒收護照、驅逐並終身禁入，按讚與轉發都可能擔責。絕不公開評論王室。查證來源（2026-08）：[FOTN 2025 Thailand](https://freedomhouse.org/country/thailand/freedom-net/2025){target="_blank"}、[Thailand biometric SIM registration](https://www.biometricupdate.com/202508/thailand-mandates-biometric-liveness-detection-for-sim-registration){target="_blank"} - Biometric Update、[泰國 2026 年 SIM 卡新規](https://lexbangkok.com/thailand-sim-card-rules-2026/){target="_blank"} - Lex Bangkok（引 NBTC 2026 年 5 月 15 日公報）、[True Tourist SIM（方案效期、護照登記）](https://www.true.th/en/prepaid/sim/tourist){target="_blank"}。

### 越南

高審查環境，FOTN 22 分。2025 年 5 月電信局下令 ISP 封鎖 Telegram，用戶未掛 VPN 即難以連上。Decree 53/2022 要求外國業者資料在地化、留存資料至少 24 個月。Decree 147/2024 要求大型平台以越南手機號或身分證實名、24 小時內移除違法內容，Facebook 受影響最大。修訂版《網路安全法》（Law 116/2025/QH15）自 2026 年 7 月 1 日生效，維持資料在地化與留存要求，並把下架時限寫進法律，一般違法內容 24 小時、緊急案件 6 小時內須依公安部要求移除。《個人資料保護法》也於 2026 年 1 月 1 日生效。這幾部法的規範對象都是業者，對旅客的意義在境內平台的下架速度更快、連線與帳號紀錄留在越南境內的量更大。另有數萬人規模的「47 部隊」網軍以檢舉與帶風向壓制異議。VPN 使用合法但受網安法規範，建議行前裝好設定。Tor 直連大致可用，但審查機制活躍，建議備妥 WebTunnel 或 Snowflake 橋接。SIM 強制護照實名。會場與飯店 Wi-Fi 不應視為可信，敏感通訊改用 Signal 並先確認可達。查證來源（2026-08）：[FOTN 2025 Vietnam](https://freedomhouse.org/country/vietnam/freedom-net/2025){target="_blank"}、[Vietnam orders Telegram ban](https://www.aljazeera.com/news/2025/5/24/vietnam-orders-ban-on-popular-messaging-app){target="_blank"} - Al Jazeera。

### 緬甸

與中國並列全球最差，FOTN 9 分。政變後封鎖 Facebook、X、Instagram、WhatsApp，2024 年中封鎖 Signal 與主要 VPN。2024 年起以中國 Geedge Networks 的 DPI 技術全國封鎖 VPN，《Cybersecurity Law No. 1/2025》於 2025 年 7 月 30 日生效，未經授權提供 VPN 服務可判 1 至 6 個月徒刑、併科 100 萬至 1,000 萬緬元罰款，且具域外效力。這部法律的規範對象是未經授權的 VPN 服務提供者，個人使用 VPN 是否構成犯罪仍有疑義，但對旅客來說這個區別意義有限，實際風險來自臨檢時手機裡被搜出 VPN App 與社群內容。Tor 與 Psiphon 都被當作非法目標封鎖，旅客不應假設預設 Tor 或一般橋接能連上。SIM 強制實名，軍方已令電信商安裝攔截設備，SIM 與國民登記卡連結，檢查哨以監控系統核對身分。街頭與檢查哨會搜查手機裡的 VPN 與社群內容。衝突區頻繁全面斷網，Access Now 記錄緬甸 2024 年至少 85 次、2025 年至少 95 次斷網，連兩年居全球之冠。2025 年全球至少 313 次、遍及 52 國，是該組織有紀錄以來最高，緬甸一國就占了近三成。涉敏感主題者面臨人身與資料雙重風險。查證來源（2026-08）：[FOTN 2025 Myanmar](https://freedomhouse.org/country/myanmar/freedom-net/2025){target="_blank"}、[Myanmar cybersecurity law restricts VPNs](https://www.rfa.org/english/myanmar/2025/01/02/cybersecurity-law-vpn/){target="_blank"} - RFA、[internet shutdowns in 2025](https://www.accessnow.org/internet-shutdowns-2025/){target="_blank"} - Access Now。

## 研討會場景的特別提醒

研討會跟單純出差不同，下面幾項要另外準備。

- **報到實名與議程資料**。不少研討會報名要綁實名與單位，到了現場領的識別證、簽到系統都會留下出席紀錄。涉及敏感議題的活動，評估用哪個身分報名、要不要公開出席。
- **經香港轉機也算通關**。區域研討會常把香港排成轉機點或主辦地，2026 年 3 月起只要通關入境，海關與入境處就可要求解鎖裝置，帶著整台工作機與未發表的會議資料過關，暴露程度高過在會場連 Wi-Fi。行程含香港時，把裝置最小化排進準備清單。
- **會場與飯店 Wi-Fi 一律視為不可信**。公共網路有假熱點與竊聽風險，連線一律走 VPN 加密。在中國、越南、緬甸這類地方，更要假設場館網路本身受監控。
- **公開發表的法律風險才是大宗**。多數地點連得上網，真正會出事的是你發表了什麼、分享了什麼。泰國的刑法第 112 條、新加坡的 POFMA 與誹謗法、馬來西亞涉王室與宗教的內容、越南與中國的政治言論，都可能讓外國與會者被追訴。發表涉當地政治、王室、宗教、種族的內容前先查清楚規範。
- **團隊出差約好通訊管道**。主要與備用管道各一，遇到斷網或單一工具被封時還能聯絡。緬甸這類隨時可能斷網的地方尤其要先約好。

## 回報過時資訊

審查現況變動快，本表難免有落後現實的地方。如果你發現某地的封鎖、VPN、SIM 或入境規定已經跟表上不同，歡迎到 [社群 Matrix 公開 room](../community/tools.md) 回報，或匿名寄到 [whisper@anoni.net](mailto:whisper@anoni.net)，我們會查證後更新。有當地第一手經驗、願意補充逐地註記的人，也歡迎一起參與。

## 相關閱讀

- [出國前數位安全：用 AI 自助產生目的地概況](./travel-ai-briefing.md)：本表沒收錄的目的地，用這一頁的 prompt 問你自己的 AI，自己產生對照。
- [威脅模型](../basics/threat-model.md)：先想清楚對手是誰、能取得什麼，才知道每地要做到哪種程度。
- [Metadata 為什麼重要](../basics/metadata.md)：連線與裝置留下的紀錄，是出差時最容易忽略的暴露面。
- [LGBTQ+ 與性少數的匿名社交](./lgbtq.md)：其中的跨國旅行裝置準備一節，可搭配本文的乾淨機建議。
- [Tor Browser 進階設定](../tools/tor-browser-advanced.md) 與 [什麼是 Tor](../tools/what-is-tor.md)：橋接與規避設定的操作細節。
