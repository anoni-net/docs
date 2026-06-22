---
title: VPN 的風險與選擇
description: VPN 把監看你流量的對象從 ISP 換成 VPN 業者，不等於匿名。這篇講清楚 VPN 的具體風險、如何挑一個值得信任的服務、自架的取捨，以及在台灣、港澳與跨境工作時各地能不能用該注意什麼。
icon: material/vpn
---

# :material-vpn: VPN 的風險與選擇

公民團體、人權組織、記者在資安準備清單上，VPN 幾乎是反射動作。但很多人裝了 VPN 就以為自己安全了，沒搞清楚 VPN 實際上改變了什麼。VPN 沒有把監看你的人移除，它把能看到你全部流量的對象，從你的 ISP 換成了 VPN 業者。這個交換在某些情境很值得，在某些情境反而把風險集中到一個你更難驗證的單點上。

這篇回答三個問題：VPN 的具體風險有哪些、市面上的服務怎麼挑、各地區能不能用該注意什麼。動手前可以先看 [威脅模型如何建立](../basics/threat-model.md) 確認自己在抗誰，VPN 跟 Tor 的差別見 [什麼是 Tor](./what-is-tor.md)。

## VPN 到底改變了什麼

VPN 的運作是把你裝置的網路流量，先加密送到 VPN 業者的伺服器，再從那台伺服器連出去。對你連線經過的 ISP、公共 Wi-Fi、本地網路管理者來說，他們只看得到你連到某個 VPN 伺服器，看不到你實際在連哪些網站。但這條隧道的另一端，VPN 業者看得到你連去哪、什麼時候連、連多久。

VPN 確實能做到的事：

- 在公共 Wi-Fi、飯店、會場網路上，擋掉同網段的竊聽，以及本地 ISP 對你瀏覽內容的側錄
- 遮蔽你對目的網站揭露的來源 IP 與大致地理位置
- 繞過 ISP 層級的封鎖（某些網站被你的電信商擋掉時）

VPN 做不到的事：

- 讓你匿名。你登入的 Google、Facebook、銀行帳號照樣認得你，瀏覽器指紋、cookie、登入狀態都還在
- 對 VPN 業者本身隱藏行蹤。業者是新的單點，它的紀錄、它的司法管轄、它的誠實程度，全部變成你的風險
- 擋掉惡意程式、釣魚，或裝置本身被入侵的問題

這跟 Tor 的差別在信任怎麼分配。Tor 把連線經過三個互相獨立的中繼，沒有任何一個節點同時知道你是誰、你連去哪，所以你不需要信任任何單一節點。VPN 把信任集中在一家業者身上，匿名性取決於這家業者有沒有說謊、會不會被傳喚。完整對照見 [什麼是匿名網路](./what-is-anonymity-network.md)。

## VPN 的具體風險

- **信任集中**：不記錄不等於不能記錄。VPN 業者技術上看得到你的全部流量。多數業者宣稱 no-log（不記錄使用紀錄），但宣稱跟做到是兩回事。沒有獨立稽核、沒有真實案例驗證的「不記錄」，只是行銷文案。少數業者用真實事件證明過，2023 年 4 月瑞典警方持搜索令到 Mullvad 辦公室，要查扣含使用者資料的電腦，因為這類資料根本不存在而空手離開[^mullvad-raid]，這種就算被搜也沒東西可交，才是 no-log 的實質意義。
- **司法管轄與資料留存法**：業者所在國的法律決定它能不能、必須不必須交出資料。部分國家有強制資料留存規範（例如越南的網安法要求境內業者留存資料），落在這些管轄區的服務，再怎麼宣稱不記錄都受當地法律約束。挑服務時要看公司註冊在哪、伺服器在哪。
- **所有權不透明**：很多看似獨立的品牌其實同屬一家母集團。Kape Technologies（前身是被資安界記錄過散布 adware 的 Crossrider，2018 年更名[^kape]）目前擁有 ExpressVPN、CyberGhost、Private Internet Access、ZenMate，還買下多個 VPN 評測網站，等於同時當球員與裁判。NordVPN 與 Surfshark 在 2022 年併進同一個母集團 Nord Security[^nord]。這不代表這些服務一定不安全，但「我比較了好幾家才選」的安全感，可能只是同一家公司的不同招牌。
- **免費 VPN 的商業模式**：免費 VPN 要從別處賺錢。2016 年一份分析 Google Play 上 283 個 VPN App 的學術研究發現，38% 含惡意程式或惡意廣告、67% 內嵌第三方追蹤函式庫、18% 完全不加密流量[^free-vpn]。研究是 2016 年的資料，但免費的代價是你的資料，這個商業模式至今沒變。要免費又可信，看後面非營利導向的選項。
- **付款會留下身分軌跡**：用綁定真實姓名的信用卡訂閱 VPN，等於在業者那裡留下這個帳號是誰的對應。真的要把匿名性算進威脅模型，付款方式（現金、Monero）跟註冊時要不要 email 一樣重要。
- **連線洩漏**：VPN 隧道之外，真實 IP 還是可能從幾個縫隙漏出去，DNS 查詢走到 ISP 的解析器、IPv6 流量沒被隧道接管、瀏覽器的 WebRTC（瀏覽器做即時通訊用的連線技術）直接暴露本機 IP。一個合格的 VPN 客戶端要有 kill switch（VPN 斷線時立刻切斷所有流量的開關），避免一掉線就裸奔。裝好後值得用線上 leak test 工具實測一次。
- **在審查國使用 VPN 本身就是風險**：在強審查地區，VPN 流量會被 DPI（深度封包檢測，逐筆分析連線判斷是否放行的技術）辨識出來、進而封鎖，使用本身甚至可能違法。緬甸 2025 年生效的 Cybersecurity Law 把未經授權提供 VPN 服務入罪化，最高可判 6 個月徒刑並具域外效力[^myanmar]。中國對個人翻牆長期屬法律灰色地帶，2025 年底國安部公開示警會究責[^china]。這些地方需要的是有混淆（obfuscation，把 VPN 流量偽裝成一般 HTTPS）功能的方案，逐地細節見後面的地區段與 [亞洲出差與研討會的數位準備](../scenarios/asia-travel.md)。
- **把 VPN 當匿名工具是最危險的誤解**：VPN 提供的是隱私（內容加密、遮蔽 IP）。要匿名請用 Tor。把 VPN 當匿名工具去做高風險的事，等於把身家安危賭在一家公司的誠實上。

## 怎麼選一個值得信任的 VPN

把上面的風險翻成可檢查的問題，挑服務時逐項對照。

評估準則：

1. **司法管轄**：公司註冊國與伺服器所在國的法律，有沒有強制資料留存、容不容易被傳喚。
2. **經獨立稽核的 no-log**：不看它怎麼宣稱，看有沒有第三方（Cure53、Assured、Securitum 等）稽核過、有沒有真實搜索案例驗證。
3. **所有權與透明度**：母公司是誰、有沒有定期透明報告、會不會球員兼裁判。
4. **匿名註冊與付款**：能不能不給 email、能不能用現金或 Monero 付款。
5. **協定與混淆**：用 WireGuard、OpenVPN 這類現代協定，在審查地區還要有混淆能力。
6. **開源**：客戶端甚至基礎設施的程式碼公開，可被外部檢視。
7. **RAM-only 基礎設施**：伺服器只用記憶體、不寫硬碟，斷電即清，降低被查扣時外洩的風險。

### 評估準則速查表

| 服務 | 司法管轄 | 經稽核 no-log | 所有權透明 | 匿名註冊/付款 | 混淆能力 | 開源 |
|------|---------|--------------|-----------|--------------|---------|------|
| Mullvad | 瑞典 | 是 | 高 | 無需 email，現金、Monero、BTC | 有（Shadowsocks 橋接） | 是 |
| Proton VPN | 瑞士 | 是 | 高 | BTC、現金 | 有（Stealth 協定） | 是 |
| IVPN | 直布羅陀 | 是 | 高 | Monero、現金、BTC | 有限（以多跳為主） | 是 |
| Riseup VPN、CalyxVPN | 非營利維護 | 不記錄（非營利） | 高 | 免費，限人權社群 | 有限 | 是（LEAP/Bitmask） |
| (對照) ExpressVPN | 英屬維京群島 | 是 | 低（Kape 集團） | BTC | 有（自動混淆） | 部分（Lightway 協定） |
| (對照) NordVPN、Surfshark | 巴拿馬、荷蘭 | 是 | 中（同屬 Nord Security） | 加密貨幣 | 有 | 部分 |

主流商用服務多半也做過稽核，速查表把區別放在所有權透明、匿名註冊與付款、開源這幾欄。查證日 `2026-06`，VPN 的所有權、稽核、各地法規變動很快，請以各家最新稽核報告與當地最新規定為準。

### 混淆能力為什麼越來越重要

混淆是目前最該優先確認的一欄。審查方擋 VPN 的手法，已經從早期的封掉 VPN 伺服器 IP，進化到直接看流量長相。標準的 WireGuard、OpenVPN 連線帶有可辨識的特徵，例如握手階段的固定指紋，DPI（深度封包檢測）一眼就認得出這是 VPN 並切斷。混淆做的事，是把 VPN 流量包裝成看起來像一般 HTTPS 網頁瀏覽，讓偵測系統分不出來。有沒有混淆，往往直接決定你在強審查地區連不連得上。

混淆不是越多越好的設定，要不要開取決於你人在哪、在抗誰。在台灣、日本這類沒有系統性封鎖的地方用不到它，標準協定又快又穩。混淆是給中國、緬甸、伊朗這種 DPI 強的環境用的，代價是速度通常會掉一些。

各家產品頁的行銷名稱不同，本質都是同一件事，看到下面這些字就知道它在講混淆：

- Shadowsocks、v2ray 類的橋接（Mullvad 提供 Shadowsocks）
- 把 WireGuard 包進 TLS 的偽裝（Proton VPN 的 Stealth）
- 各家自有名稱：ExpressVPN 的自動混淆、NordVPN 的 NordWhisper、Surfshark 的 Camouflage Mode、Astrill 的 StealthVPN

兩點提醒。第一，強審查系統會主動探測（active probing，主動連向可疑伺服器、測試它是不是 VPN 或 proxy，中國的防火長城就會這樣做），耐得住探測的混淆才扛得住。第二，混淆沒有一勞永逸，審查方會持續更新偵測，今天能用的協定下個月可能就被封，所以要備兩種以上、出發前實測（見下面的地區段）。連混淆都被封死時，改走 Tor 的 [WebTunnel](../community/setup-tor-webtunnel.md) 或 [Snowflake](./tor-snowflake.md) 橋接當備援。

### Mullvad

[Mullvad](https://mullvad.net/){target="_blank"} 在隱私設計上做得最徹底。註冊不需要 email，只給你一組隨機帳號編號。付款接受現金郵寄、Monero、Bitcoin，不需要把身分綁進去。2023 年完成全伺服器 RAM-only 遷移，基礎設施經 Cure53、Web App 經 Assured 稽核，客戶端開源。前面提到的瑞典警方搜索案例，就是它 no-log 政策的實證。

**適合誰**：把匿名性算進威脅模型的人、想用現金或 Monero 不留身分軌跡的人、要一個經得起搜索的服務的記者與組織。

**限制**：

- 為了減少指紋已移除 port forwarding，某些 P2P 與自架服務情境會受影響
- 定價單一（每月固定費率），沒有長約折扣
- 解串流地理限制的能力不強，它的設計目標不在這

### Proton VPN

[Proton VPN](https://protonvpn.com/){target="_blank"}（跟 Proton Mail 同一家瑞士公司）的最大優勢是有一個不限流量的免費方案，加上專為抗審查設計的 Stealth 協定（把 WireGuard 包進 TLS，用來穿越 DPI 封鎖[^stealth]）。客戶端全平台開源，連續多年通過 no-log 稽核，另有 Secure Core 多跳路由。

**適合誰**：預算有限又要可信免費方案的人、在審查地區需要混淆的人、已經在用 Proton 生態的人。

**限制**：

- 免費方案的伺服器國家與速度受限，完整功能要付費
- Stealth 宣稱能穿越強封鎖，但實際可達性隨封鎖更新而變，到中國這類地方仍要出發前實測，不能當成確定能用

### IVPN

[IVPN](https://www.ivpn.net/){target="_blank"} 是直布羅陀的老牌服務，嚴格 no-log、接受 Monero 與現金、支援多跳，客戶端以 GPLv3 開源，連續多年由 Cure53 稽核。它刻意拿掉聯盟行銷與限時促銷，避免用行銷話術扭曲使用者判斷。

**適合誰**：重視透明與稽核紀錄、不想被行銷牽著走、需要多跳的進階使用者。

**限制**：

- 生態與伺服器數量比大廠小
- 價格不算便宜，沒有免費方案
- 混淆能力以多跳為主，強審查地的耐封度不如專門的混淆協定

### Riseup VPN、CalyxVPN

[Riseup VPN](https://riseup.net/en/vpn){target="_blank"} 與 CalyxVPN 由非營利組織提供，技術上都建在 LEAP 的 Bitmask 平台，免費給人權與社運社群使用、不記錄使用者 IP。Calyx Institute 是美國 501(c)(3) 非營利，Riseup 則僅開放給認同其使命的行動者社群。

**適合誰**：預算有限的行動者與社運社群、需要一個不靠賣資料維生的免費基本隱私工具。

**限制**：

- 容量、速度與伺服器選擇有限
- Riseup 不開放給一般非人權用途，要先認同其使命
- 混淆能力有限，把它當日常基本隱私夠用，高敏感的匿名仍要走 Tor

### 主流商用服務（ExpressVPN、NordVPN、Surfshark 等）

這些大廠的優勢在速度、相容性（解地理限制、看串流）、客服與一鍵混淆，也都做過第三方稽核。取捨在所有權集中與行銷導向：ExpressVPN 屬 Kape（同時經營 VPN 評測網站），NordVPN 與 Surfshark 同屬 Nord Security。日常防公共 Wi-Fi 竊聽、解地理限制夠用，但要把身家賭上去的高敏感場景，可信度與透明度不如前面幾家。

### 紅旗：這幾種要避開

- 來路不明的免費 VPN App，多半靠賣你的資料或塞廣告賺錢
- 把瀏覽器內建的免費 VPN 當成完整防護，它的覆蓋與保證通常很有限
- 只有行銷頁宣稱 no-log、沒有任何第三方稽核或真實案例佐證的服務

不想只聽我們的，可以對照非商業、不收廣告主的 [Privacy Guides VPN 建議](https://www.privacyguides.org/en/vpn/){target="_blank"}，它目前同樣列 Mullvad、Proton VPN、IVPN 三家[^pg]。

## 自架 VPN

還有一條路是自己架 VPN，把信任從 VPN 業者轉到你租的 VPS 加上你自己的維運。常見工具有三種：

- **WireGuard**：現代、精簡的 VPN 協定，自己在一台 VPS 上跑。
- **Algo VPN**：Trail of Bits 維護的一套 Ansible 腳本，幾分鐘在雲端主機架好 WireGuard，刻意最小化安裝面以降低供應鏈風險[^algo]。
- **Outline**：Google Jigsaw 開發、給記者與新聞編輯室抗審查用的自架方案，以 Shadowsocks 為基礎，2026 年起交由獨立的 Outline Foundation 維運[^outline]。

要先想清楚的取捨：

- 你不再信任 VPN 業者，但改信任你的 VPS 供應商（它一樣看得到伺服器流量），以及你自己的維運能力（設定錯了沒人幫你兜底）。
- 自架 VPN 的出口 IP 通常是你獨享，反而更容易指向你個人。它的去匿名性差，適合組織內部安全連線、個人繞過封鎖，不適合藏在人群裡的匿名。要匿名仍是 Tor。
- 對抗審查時，Outline 這類 Shadowsocks 方案的混淆能力，常比商業 VPN 的標準協定更耐封。

**適合誰**：有技術人力的組織、想完全掌控基礎設施、不信任商業業者的記者與技術型工作者。

## 各地區能不能用：先評估，不要落地才試

VPN 在某地能不能用沒有全球通用答案，會隨地區與時間變。出國或在當地工作前，用下面的框架評估，逐國細節查 [亞洲出差與研討會的數位準備](../scenarios/asia-travel.md) 與 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 的當下觀測。

合法性大致分四級（用來判斷風險，不是法律意見）：

- **合法**：日常使用不受限，例如台灣、日本與多數民主國家。
- **受規範**：合法但業者受資料留存、實名等規範，例如越南。
- **灰色地帶**：法律未明確禁止個人使用，但封鎖積極、官方時有示警，例如中國。
- **入罪化**：未經授權使用或提供可能觸法，例如緬甸。

行前與在地必做：

- **出發前就裝好並連線測試一次**。審查嚴的地方，App 商店與 VPN 官網本身可能連不上，落地才下載通常來不及。
- **備兩種以上連線方式**。單一協定常被封，強封鎖地（中國、緬甸）要用有混淆的方案，標準 WireGuard、OpenVPN 可能幾秒就被擋。
- **判斷是否需要混淆**。一般地區用標準協定即可，強審查地才需要 Stealth、Shadowsocks 這類偽裝。
- **開啟 kill switch**，避免切換網路或 VPN 掉線時短暫裸奔。

審查國的額外風險：

- 使用 VPN 本身可能被 DPI 辨識、被標記。
- 街頭臨檢與入境查機可能搜查裝置裡的 VPN App 與社群內容，緬甸與部分地區已有案例（見 asia-travel）。
- 高敏感任務帶乾淨裝置、全程假設受監控。VPN 被封死時改走 Tor 的 WebTunnel、Snowflake 橋接，設定見 [Tor Snowflake](./tor-snowflake.md) 與 [如何架設 Tor WebTunnel](../community/setup-tor-webtunnel.md)。

## VPN 還是 Tor

兩個工具解決不同問題，按你在抗誰來選。

- **VPN 夠用**：在公共 Wi-Fi、會場、飯店網路上加密連線，解開地理限制，做組織內部安全連線，或對速度敏感的日常使用。你的對手是同網段竊聽者、本地 ISP、地理封鎖。
- **必須 Tor**：你要對抗的是能拿到 VPN 業者紀錄的人，要保護消息來源，或做高敏感的匿名。你的對手有能力傳喚業者、做流量比對。
- **兩者搭配**：少數情境會疊用。先連 VPN 再進 Tor，能對 ISP 隱藏你在用 Tor 這件事，代價是多一個信任點與速度。先連 Tor 再出 VPN 很少見，會犧牲 Tor 的部分匿名優勢。多數人不需要疊，疊錯反而更糟，不確定就單用 Tor。完整說明見 [什麼是 Tor](./what-is-tor.md)。

## 在台灣與正體中文使用者的補充

台灣 VPN 完全合法、無系統性封鎖。多數人的實際用途是公共 Wi-Fi 加密、保護瀏覽隱私、跨境出差前的準備，不是翻牆。

港澳與中國的脈絡不同。香港近年網路環境變化、澳門有資料留存規範、中國有防火長城，正體中文使用者在這些地方工作或往返時要分開評估，別把台灣隨便用都行的習慣直接套上去。

真正要顧的往往是你在帳號裡留了什麼、發表了什麼，連線本身反而其次。VPN 遮得住來源 IP，遮不住你登入的身分。個資與身分層的風險見 [台灣個資法 2025 修法](../taiwan/pdpa-2025.md)。

## 常見問題

??? question "免費 VPN 到底能不能用"

    分兩種。來路不明的免費 App 多半靠賣你的資料或塞廣告賺錢，避開。可信的免費方案是少數有清楚金主的服務：Proton VPN 有不限流量的免費方案，Riseup 與 CalyxVPN 由非營利提供給人權社群。判準一樣是它靠什麼賺錢、有沒有被稽核。

??? question "用了 VPN 我就匿名了嗎"

    不會。VPN 換掉的是看得到你流量的人，不會讓你登入的網站、瀏覽器指紋、cookie 消失，你連 VPN 業者也得信任。要匿名請用 Tor，概念差別見 [匿名與隱私的差別](../basics/anonymity-vs-privacy.md)。

??? question "VPN 跟 Tor 要不要疊著用"

    多數人不用。先 VPN 後 Tor 可以對 ISP 藏住你在用 Tor，代價是多一個信任點與速度。先 Tor 後 VPN 很少見、會犧牲匿名。不確定就單用 Tor，它本身已經處理好你大部分要的匿名。

??? question "公司或組織要我裝它指定的 VPN，安全嗎"

    公司 VPN 的設計目的通常是保護公司網路、讓你連回內網，順帶能看到你經過它的流量。它保護的是組織，不是你個人隱私。上班用沒問題，但別拿公司 VPN 處理私人敏感的事，那等於把瀏覽紀錄交給雇主。

??? question "在中國、緬甸這種地方該用哪種"

    要有強混淆的方案，入境前裝好至少兩款並測試。中國 Tor 直連不通，優先用 WebTunnel、Snowflake、meek 當備援。緬甸連 VPN 服務與 Tor 都被當封鎖目標，使用本身可能觸法，要假設全程受監控、帶乾淨裝置。可用性隨封鎖天天變，務必出發前查最新回報，逐地見 [亞洲出差與研討會的數位準備](../scenarios/asia-travel.md)。

??? question "怎麼知道我的 VPN 有沒有洩漏"

    連著 VPN，用線上的 DNS leak、IP leak、WebRTC leak 測試工具（搜尋 DNS leak test），看顯示的 IP 與 DNS 是不是 VPN 的、有沒有漏出你原本的。確認客戶端的 kill switch 開著。換 Wi-Fi、手機切到行動網路時最容易短暫洩漏，這些時候再測一次。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 威脅模型如何建立](../basics/threat-model.md)
- [:material-incognito-circle: 匿名與隱私的差別](../basics/anonymity-vs-privacy.md)
- [:material-airplane: 亞洲出差與研討會的數位準備](../scenarios/asia-travel.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 個人隱私指引研究專題](../community/privacy-guide.md)
- [:material-server-network-outline: 社群自架服務](../community/tools.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>

[^mullvad-raid]: [Mullvad VPN was subject to a search warrant. Customer data not compromised](https://mullvad.net/en/blog/2023/4/20/mullvad-vpn-was-subject-to-a-search-warrant-customer-data-not-compromised){target="_blank"} - Mullvad 官方部落格（2023-04-20）
[^kape]: [Kape Technologies (Formerly Crossrider) Now Owns ExpressVPN, CyberGhost, Private Internet Access, Zenmate](https://cyberinsider.com/kape-technologies-owns-expressvpn-cyberghost-pia-zenmate-vpn-review-sites/){target="_blank"} - Cyber Insider。另見 [Kape Technologies - Wikipedia](https://en.wikipedia.org/wiki/Kape_Technologies){target="_blank"}
[^nord]: [Nord Security joins forces with Surfshark](https://nordvpn.com/blog/nord-security-surfshark-merger-agreement/){target="_blank"} - NordVPN 官方公告（2022-02-02）
[^free-vpn]: [An Analysis of the Privacy and Security Risks of Android VPN Permission-enabled Apps](https://dl.acm.org/doi/10.1145/2987443.2987471){target="_blank"} - ACM IMC 2016（CSIRO、ICSI、UNSW）。資料為 2016 年，App 生態已演變，但免費 VPN 的基本商業模式問題至今未改變。
[^myanmar]: [Myanmar enacts cybersecurity law that aims to restrict use of VPNs](https://www.rfa.org/english/myanmar/2025/01/02/cybersecurity-law-vpn/){target="_blank"} - Radio Free Asia。法律分析見 [Myanmar Cybersecurity Law Takes Effect](https://www.tilleke.com/insights/myanmar-cybersecurity-law-takes-effect/){target="_blank"} - Tilleke & Gibbins
[^china]: [FOTN 2025 China](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"} - Freedom House。GFW 與翻牆連線指引見 [Tor 對中國的連線指引](https://support.torproject.org/censorship/connecting-from-china/){target="_blank"} - Tor Project
[^stealth]: [Defeat censorship with Stealth, our new VPN protocol](https://protonvpn.com/blog/stealth-vpn-protocol){target="_blank"} - Proton VPN 官方
[^pg]: [VPN Services](https://www.privacyguides.org/en/vpn/){target="_blank"} - Privacy Guides（非商業、不收廣告主的開源隱私工具索引）
[^algo]: [trailofbits/algo](https://github.com/trailofbits/algo){target="_blank"} - Trail of Bits（GitHub）
[^outline]: [Introducing the Outline Foundation: An Independent Home for Outline](https://medium.com/jigsaw/introducing-the-outline-foundation-an-independent-home-for-outline-39fba2ab4e25){target="_blank"} - Jigsaw。記者應用案例見 [Google has a new tool to outsmart authoritarian internet censorship](https://www.technologyreview.com/2023/09/13/1079381/google-jigsaw-outline-vpn-internet-censorship/){target="_blank"} - MIT Technology Review
