---
date: 2026-07-10
authors:
    - anoni-net
categories:
    - OONI
    - 技術
    - 隱私
slug: 2026-ooni-faulty-measurements
image: "assets/images/2026-ooni-faulty-measurements.png"
summary: "OONI 公開資料集是很多人判斷各國網站可達性的依據，anoni.net 自己的台灣 ASN 涵蓋觀測也建立在上面。OONI 2026 年 7 月這篇工程文章攤開他們如何找出壞掉或惡意的量測，結論是絕大多數異常來自 VPN 與裝置設定錯誤而非蓄意污染，並說明新上線的匿名憑證系統如何在不儲存個資的前提下擋掉濫用。這篇導讀帶你逐節看懂原文十個大節。"
description: "OONI 公開資料集是判斷各國網站可達性的重要依據，anoni.net 的台灣 ASN 涵蓋觀測也建立在上面。OONI 2026 年 7 月這篇工程文章攤開他們如何辨認並過濾壞掉的量測，結論是絕大多數異常來自 VPN 與裝置設定錯誤，並說明新上線的匿名憑證系統如何在不儲存個資的前提下擋掉濫用。"
---

# OONI 如何分辨壞掉的量測資料：從啟發式規則到匿名憑證

!!! info ""

    本文是 anoni.net 對下面這篇 OONI 工程文章的導讀與摘要，帶你逐節看懂原文在做什麼，不是逐字翻譯。原文另有約 20 張統計圖與多份完整資料表，想看數據細節請直接讀原文：

    - [From Heuristics to Anonymous Credentials: Assessing OONI's Approach to Bad Measurements, OONI 2026-07-06](https://ooni.org/post/2026-faulty-measurements/){target="_blank"}

![OONI 壞量測偵測與匿名憑證導讀](./assets/images/2026-ooni-faulty-measurements.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

很多人判斷「某個網站在某個國家連不連得上」，用的是 OONI 的公開資料集，anoni.net 自己的台灣 ASN 涵蓋觀測也建立在同一份資料上。只要有人往裡面灌假資料，或裝置設定錯誤產生誤導性的紀錄，這份資料的可信度就會被稀釋。OONI 在 2026 年 7 月 6 日這篇工程文章[^1]裡，把他們如何找出這些壞掉的量測、以及新上線的匿名憑證（anonymous credentials）系統如何在不儲存個資的前提下擋掉濫用，完整攤開來說明。

OONI（Open Observatory of Network Interference，開放網路干擾觀測站）是一個全球的網路審查觀測專案，手機 app OONI Probe 會去連一份網站清單，回報每個網站在當地連不連得上，結果一律進到公開資料集。任何人都能下載這份資料做分析，好處是開放，代價是任何人也都能往裡面送資料。這篇文章要回答的問題，就是在開放投稿的前提下，如何辨認並過濾掉品質有問題的量測。

<!-- more -->

## 這篇文章想解決的問題

OONI 的資料愈開放，被灌壞資料的風險就愈高，來源可能是裝置設定錯誤，也可能是有人蓄意污染。OONI 想先用手上已經有的資料建立一套辨認壞量測的基準，再看新的匿名憑證系統能把這個基準往上推多少。全文分成三大塊：先用簡單規則檢查既有資料能揪出多少問題（既有啟發式與四類發現）、想再補上哪些新規則（新啟發式）、以及找到壞資料之後用什麼機制處理（緩解策略與匿名憑證）。以下逐節帶過。

## 原文十個大節速覽

想跳讀的話，先看這張對照表，再挑有興趣的節點回原文看圖表。

| 原文大節 | 導讀重點 | 關鍵數字或結論 |
|---|---|---|
| Existing metrics and heuristics｜Approach | 用既有資料建立偵測基準 | 四個不犧牲隱私的檢查角度 |
| IP geolocation mismatches | 探針回報位置對照真實 IP | 7.41% 對不上，多數是 VPN |
| Measurement volume anomalies | 單一探針投稿速率暴衝 | 中國 `ooniprobe-react-os` 每秒 3 筆 |
| Timestamp inconsistencies | 量測時間戳前後兜不攏 | 0.82% 異常，委內瑞拉時區設錯 |
| Probe OS, version metadata | 軟體名稱與平台互相矛盾 | 718 筆，含團隊開發機 |
| New heuristics | 想再補上的進階偵測 | MCC/MNC、伺服器端 GeoIP、TLS 指紋 |
| Mitigation strategies | 找到壞資料之後的處置 | 人類把關、不回改、限流、擋 sybil |
| Naive solution | 土法煉鋼會踩的坑 | 固定 ID 就能去匿名，還會變打地鼠 |
| Anonymous credentials solution | 憑證式信任評分 | 區間揭露、只存本地、沒有固定 ID |
| Future validation | 長期驗證指標 | 追蹤 verified/unverified/untrusted 比例 |

## 一、既有的指標與啟發式（Existing metrics and heuristics｜Approach & Methodology）

這一節先不動用任何新技術，只問一件事：光靠 OONI 現在就收得到的資料，能不能認出壞掉的量測？他們挑了四個不需要犧牲使用者隱私的檢查角度：IP 地理位置對不上、量測數量暴衝、時間戳記兜不攏、作業系統與版本資訊互相矛盾。每個角度原文都附了「但書」（caveat），說明什麼情況下這個訊號會誤判。例如探針（probe）內建的 GeoIP 資料庫可能過期，導致 `probe_cc`（探針回報的國碼）本來就會跟真實 IP 對不上，分析時要先把這種正常誤差濾掉。這一節是後面所有發現的方法論基礎。

## 二、四類異常的實際發現（Assessment & Findings）

把上面四個角度實際套到資料上，得到四組發現。

### IP 地理位置對不上

OONI 在 2025 年 3 月 19 到 21 日，於探針呼叫 `/api/v1/check-in` 端點時記錄 log，比對探針自己回報的國碼、ASN（自治系統編號）跟收集端看到的真實出口 IP。16,139 筆樣本裡有 1,196 筆對不上，約 7.41%。原文列出最常見的 10 組國碼錯配（回報國碼對照真實 IP 所在國碼）：

| 回報國碼 | 真實 IP 國碼 | 筆數 |
|---|---|---|
| US | CA | 89 |
| CA | RU | 49 |
| CZ | US | 43 |
| BS | US | 36 |
| CA | US | 30 |
| CA | SG | 30 |
| CZ | GB | 25 |
| CA | KH | 18 |
| AU | KH | 18 |
| US | DE | 16 |

追下去發現絕大多數對不上的來源是 VPN：出現最多的供應商是 Datacamp、Cloudflare、M247 這些已知的 VPN 機房，其中「回報加拿大、真實 IP 在俄羅斯」那 49 筆全部來自 Cloudflare，對應的是用 WARP 這類 VPN 的使用者。結論是這些不一致幾乎都跟 VPN 有關，沒有看到明顯可歸因於惡意竄改或探針設定錯誤的量。

### 量測數量暴衝

他們看每個探針在 1 分鐘內跑出多少筆量測，正常的平均是 8 筆，99 百分位是 54 筆。篩出每分鐘超過 200 筆的極端案例後，抓到一個叫 `ooniprobe-react-os` 的軟體名稱，並非 OONI 官方發行的版本，只針對 `probe_cc = CN`（中國）送資料，用每分鐘 200 筆（每秒 3 筆）的速度送 web_connectivity 量測。這個速率對這種測試並不合理，而且它的測試還跑得比同地區其他量測更快，量這麼大卻沒有網路瓶頸，很反常。另一個案例是緬甸在 2025 年 1 月 6 日出現的陣發性暴衝。

### 時間戳記兜不攏

比對量測開始時間 `measurement_start_time` 跟 `measurement_uid` 裡內含的時間戳，看有沒有「太晚上傳」或「時間來自未來」的紀錄。2025 年 3 月 2 日到 4 月 1 日這段，3,440 多萬筆量測裡只有 0.82% 有時間異常，多數是過去、集中在 Linux。原文依平台拆解如下，Linux 的異常率 2.16% 明顯高於其他平台：

| 平台 | 過去異常（>1h） | 未來異常（>1h） | 異常合計 | 該平台總量 | 異常率 |
|---|---|---|---|---|---|
| ios | 2,375 | 0 | 2,375 | 240,843 | 0.99% |
| windows | 34,192 | 24,938 | 59,130 | 10,503,040 | 0.56% |
| android | 21,132 | 5,509 | 26,641 | 10,389,320 | 0.26% |
| macos | 906 | 0 | 906 | 3,103,961 | 0.03% |
| linux | 185,322 | 7,908 | 193,230 | 8,947,716 | 2.16% |

這裡有一個很具體的例子：大量異常來自委內瑞拉同一個 ASN，OONI 聯絡上當地夥伴後發現，是那批裝置的時區被設錯了。把委內瑞拉排除後，Linux 的異常數字大幅下降，其他平台幾乎不變。設定錯誤就足以產生誤導性的紀錄，不必然是惡意。

### 作業系統與版本資訊互相矛盾

檢查軟體名稱跟平台兜不兜得起來，例如 `software_name = ooniprobe-android` 卻標成 iOS。找到 718 筆 Android 軟體跑在非 Android 平台上，其中一部分追出來是 OONI 團隊成員自己開發用的機器，另一部分又是前面那個中國來源的 `ooniprobe-react-os`。他們也列出幾個沒見過的軟體名稱（Vladhog、murakami-ooniprobe、MySorgenia、Dismantle 等），逐一用 Google 查是什麼來路。很多看起來可疑的資料，多半來自開發過程或第三方 fork，跟攻擊無關。

四類發現合起來給出一個讓人安心的結論：OONI 目前沒有在資料裡找到大量惡意污染，絕大多數異常來自 VPN、設定錯誤、開發機器或非官方分支。防禦機制要做，但威脅目前不是迫在眉睫的大規模攻擊。

## 三、想再補上的新啟發式（New heuristics）

既有規則之外，OONI 想再加幾種更進階的偵測。定位一直是最大的難題，因為 GeoIP 資料庫由探針自己查、又會過期。他們考慮的補強包括：向手機作業系統取得行動網路的國碼與電信商代碼（MCC/MNC）、詢問作業系統的定位服務、或改在伺服器端做 IP 到地點的對照。每種做法原文都附了限制，例如伺服器端對照會被翻牆工具擋在中間、看不到真實 IP，問定位權限則可能引起使用者疑慮。另外還想加上網路層與協定層的異常偵測，例如從 TLS 交握的指紋認出中間人設備（像是改寫流量的防毒軟體）。

## 四、找到壞資料之後怎麼處理（Strategies for mitigating faulty measurements）

偵測只是第一步，接下來是處置。OONI 定了兩條原則。第一，最終判定一筆量測是不是壞資料，要有人類審查介入，避免自動化把好資料誤殺。第二，除非牽涉使用者隱私，否則絕不回頭修改已經送進來的資料。因為要有人類把關，處置只能在壞資料已經進入資料管線之後才做。可用的手段包括封鎖行為異常的假名（pseudonym）、對單一憑證做投稿限流、動態調整某地區某時段能接受的投稿量、或輪換簽發金鑰。文章也誠實點出兩難：如果規定「只有半年以上的探針才能投稿」來擋 sybil 攻擊（大量假身分灌資料），也會連帶影響到正常新探針的投稿。

## 五、匿名憑證系統怎麼運作（Assessing the effectiveness of the solution）

匿名憑證系統是整篇的重點。先看「土法煉鋼」的做法會踩到什麼坑：給每個探針一個 ID、伺服器端做白名單。問題是就算隨機 ID，只要固定不變就足以辨識出單一探針，本身就是隱私災難，而且探針換一個新 ID 就能繞過，變成打地鼠。於是問題落在一個核心矛盾上，如何在不長期儲存個資的前提下，同時做到存取控制與信任評分。

匿名憑證系統的解法是用投稿數（`msm_count`）與探針年齡建立信任分數，範圍鎖定在特定國碼與 ASN 組合。憑證由伺服器簽發，只存在探針本地、不存在伺服器，也不會再次外傳。憑證用密碼學把投稿數與年齡編碼進去，而且以「區間」呈現（例如「我的投稿數介於 100 到 500 之間」），不是精確值。投稿時探針用憑證簽名，伺服器驗證簽名就能判斷這筆量測符不符合存取規則，例如「只有某國某 ASN、且過去投稿至少 100 筆的探針才能送」。整套設計沒有任何一個固定不變的探針 ID。代價是無法做非常精準的針對性封鎖，這是 OONI 為了保護匿名性刻意接受的取捨，改用逐個 `(probe_cc, asn)` 調整存取規則來因應。最後每筆量測會被標成 verified、unverified 或 failed 三種狀態，資料使用者可以自己決定要採信到什麼程度。

## 六、怎麼長期驗證這套系統有效（Future validation）

有些指標要長期觀察才看得出來。OONI 會持續追蹤 verified、unverified、untrusted 三類量測的比例變化，用來診斷是不是某次客戶端更新把協定實作弄壞了、或老探針沒更新。也會統計各協定版本的探針數量，以及在伺服器端跑一筆驗證要花多少時間，及早抓出效能退化。這套量測會在匿名憑證協定的整個生命週期裡持續進行。

## 從 anoni.net 的角度看這篇

兩個點對正體中文社群特別有參考價值。

第一，這篇直接關係到我們自己的觀測工作。anoni.net 的台灣 ASN 涵蓋分析、Tor Relay 觀測點都建立在 OONI 公開資料上，這篇等於是資料源頭在自我健檢。它給出的結論（目前沒有大規模惡意污染，多數異常來自 VPN 與設定錯誤）讓人比較放心，但也提醒我們讀 ASN 資料時，`probe_cc` 不等於地面真相，VPN 造成的地理錯配、時區設錯這類雜訊本來就存在，做分析時要記得先濾。

第二，匿名憑證的設計本身就是一個乾淨的隱私工程範例。「如何在不儲存個資的前提下做存取控制與信任評分」是很多系統都會遇到的難題，OONI 用區間揭露、憑證只存本地、放棄精準封鎖來換匿名性，這套取捨思路對關心個人隱私設計的讀者是很好的教材，也呼應我們社群個人隱私指引的主題。

如果社群裡有人想動手，OONI 另外有兩篇專門講匿名憑證系統的文章，適合接著讀：一篇談這套系統的[設計需求](https://ooni.org/post/2025-requirements-for-oonis-anonymous-credentials/){target="_blank"}[^2]，一篇[宣布系統上線](https://ooni.org/post/2025-announcing-ooni-new-anonymous-credential-system/){target="_blank"}[^3]。

## 名詞對照

原文用了不少 OONI 專有欄位名詞，這裡整理一份對照，方便對照原文閱讀。

| 名詞 | 說明 |
|---|---|
| OONI Probe | OONI 的手機與桌面 app，會去連一份網站清單、回報每個網站在當地連不連得上 |
| probe（探針） | 執行量測的那台裝置或那支程式 |
| `probe_cc` | 探針回報的國碼（country code） |
| `probe_asn` | 探針回報的 ASN |
| ASN | 自治系統編號（Autonomous System Number），一段 IP 位址的管理單位，通常對應一家 ISP 或機構 |
| `msm_count` | 該探針累積投稿的量測數（measurement count） |
| check-in 端點 | 探針開始量測前呼叫的 API，會回報自己的國碼與 ASN |
| web_connectivity | OONI 最常見的測試，測某個網站在當地連不連得上 |
| sybil 攻擊 | 用大量假身分灌資料、扭曲觀測結果的攻擊 |
| pseudonym（假名） | 匿名憑證下代表「同區域、同 IP」一群探針的識別，不是個人身分 ID |
| verified、unverified、failed | 匿名憑證系統給每筆量測的三種信任標記 |

## 相關閱讀

- [什麼是 OONI](../../tools/what-is-ooni.md)
- [台灣 OONI ASN 涵蓋觀測](../../taiwan/ooni-asn-coverage.md)
- [Tor Relays 觀測點](../../taiwan/tor-relay-watcher.md)
- [我們普查了 336 條 OONI Run v2 清單，3 條就佔了全網 72% 的檢測量](./2026-ooni-run-v2-usage-patterns.md)
- [個人隱私指引研究專題](../../community/privacy-guide.md)

[^1]: [From Heuristics to Anonymous Credentials: Assessing OONI's Approach to Bad Measurements, OONI 2026-07-06](https://ooni.org/post/2026-faulty-measurements/){target="_blank"}
[^2]: [Requirements for OONI's anonymous credentials, OONI](https://ooni.org/post/2025-requirements-for-oonis-anonymous-credentials/){target="_blank"}
[^3]: [Announcing OONI's new anonymous credential system, OONI](https://ooni.org/post/2025-announcing-ooni-new-anonymous-credential-system/){target="_blank"}
