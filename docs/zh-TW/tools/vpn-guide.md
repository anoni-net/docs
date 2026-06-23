---
title: VPN 的風險與選擇
description: VPN 把監看你流量的對象從 ISP 換成 VPN 業者，不等於匿名。這篇說明 VPN 的具體風險、如何挑一個值得信任的服務、自架的取捨，以及在台灣、港澳與跨境工作時各地能不能用該注意什麼。
icon: material/vpn
---

# :material-vpn: VPN 的風險與選擇

對公民團體、人權組織、記者來說，裝 VPN 幾乎是資安準備的反射動作。但很多人裝了就以為自己安全了，沒搞清楚 VPN 實際上改變了什麼。VPN 沒有移除監看你的人，只是把能看到你全部流量的對象，從 ISP 換成 VPN 業者。這樣的轉移在某些情境確實划算，在另一些情境反而把風險集中到一個更難驗證的單點。

這篇回答三個問題：VPN 的具體風險有哪些、市面上的服務怎麼挑、各地區能不能用該注意什麼。動手前可以先看 [威脅模型如何建立](../basics/threat-model.md) 確認自己面對的是哪類對手，VPN 跟 Tor 的差別見 [什麼是 Tor](./what-is-tor.md)。

!!! tip "沒空全部讀完，先抓這幾點"

    - VPN 換掉的是「誰能看到你的流量」，把信任從 ISP 移到 VPN 業者，它不會讓你匿名。
    - 日常防公共 Wi-Fi 竊聽、解地理限制，挑一個經獨立稽核、所有權透明的服務就夠，沒頭緒就先看 Mullvad 或 Proton VPN。
    - 要對抗能傳喚業者的對手、或保護消息來源，VPN 不夠，改用 [Tor](./what-is-tor.md)。
    - 人在審查嚴的地方（中國、緬甸等），要選有混淆功能的方案、出發前先測，逐地狀況見 [亞洲出差與研討會的數位準備](../scenarios/asia-travel.md)。

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

就算用了 VPN，連線的時間、流量大小、你登入的帳號與瀏覽器指紋這些 metadata 都還在，VPN 處理的只有連線層。這層為什麼是獨立的風險見 [Metadata 是什麼](../basics/metadata.md)。

這跟 Tor 的差別在信任如何分配。Tor 把連線經過三個互相獨立的中繼（relay，由志工運作的中轉節點），沒有任何一個節點同時知道你是誰、你連去哪，所以你不需要信任任何單一節點。VPN 把信任集中在一家業者身上，匿名性取決於這家業者有沒有說謊、會不會被傳喚。完整對照見 [什麼是匿名網路](./what-is-anonymity-network.md)。

## VPN 的具體風險

- **信任集中**：不記錄不等於不能記錄。VPN 業者技術上看得到你的全部流量。多數業者宣稱 no-log（不記錄使用紀錄），但宣稱與實際做到之間仍有距離。沒有獨立稽核、沒有真實案例驗證的「不記錄」，只是行銷文案。少數業者有真實事件作為佐證，2023 年 4 月瑞典警方持搜索令到 Mullvad 辦公室，要查扣含使用者資料的電腦，因這類資料根本不存在而空手離去[^mullvad-raid]。能在被搜索後仍無資料可交，才是 no-log 的實質意義。
- **司法管轄與資料留存法**：業者所在國的法律決定它能不能、必須不必須交出資料。部分國家有強制資料留存規範（例如越南的網安法要求境內業者留存資料），落在這些管轄區的服務，無論如何宣稱 no-log，仍受當地法律約束。挑服務時要看公司註冊在哪、伺服器在哪。
- **所有權不透明**：很多看似獨立的品牌其實同屬一家母集團。Kape Technologies（前身是 Crossrider，其開發平台被大量濫用來散布 adware 與不受歡迎軟體，2018 年更名[^kape]）目前擁有 ExpressVPN、CyberGhost、Private Internet Access、ZenMate，還買下多個 VPN 評測網站，等於同時當球員與裁判。NordVPN 與 Surfshark 在 2022 年併進同一個母集團 Nord Security[^nord]。這不代表這些服務一定不安全，但「我比較了好幾家才選」的安全感，可能只是同一家公司的不同招牌。
- **免費 VPN 的商業模式**：免費 VPN 要從別處賺錢。2016 年一份分析 Google Play 上 283 個 VPN App 的學術研究發現，38% 被多家防毒引擎標記含某種惡意程式、18% 完全不加密流量、84% 會洩漏 IPv6 流量，且 75% 內嵌第三方追蹤函式庫[^free-vpn]。這份研究是 2016 年的資料，但免費 VPN 靠使用者資料或廣告獲利的商業模式，至今沒有改變。要免費又可信，看後面非營利導向的選項。
- **付款會留下身分軌跡**：用綁定真實姓名的信用卡訂閱 VPN，等於在業者那裡留下這個帳號是誰的對應。真的要把匿名性算進威脅模型，付款方式（現金，或 Monero 這種設計上難以追蹤金流的加密貨幣）跟註冊時要不要 email 一樣重要。註冊用的 email 若跟其他敏感服務共用，帳號之間會被串連，建議用獨立 email 加上 [密碼管理器](./password-manager.md) 隔離。
- **連線洩漏**：就算開了 VPN，真實 IP 還是可能從幾個縫隙漏出去。常見的是 DNS 查詢（把網址轉成 IP 的查詢）沒走進 VPN 隧道、IPv6（較新的 IP 位址格式）流量沒被隧道接管、瀏覽器的 WebRTC（瀏覽器做即時通訊用的連線技術）直接暴露本機 IP。一個合格的 VPN 客戶端應具備 kill switch（VPN 斷線時立刻切斷所有流量的開關），避免 VPN 中斷的瞬間真實 IP 暴露。裝好後值得用線上 leak test 工具實測一次，怎麼測見最後的常見問題。
- **在審查國使用 VPN 本身就是風險**：在強審查地區，VPN 流量會被 DPI（深度封包檢測，逐筆分析連線判斷是否放行的技術）辨識出來、進而封鎖，使用本身甚至可能違法。緬甸 2025 年 1 月通過、7 月生效的 Cybersecurity Law 把未經授權提供 VPN 服務入罪化，最高可判 1 至 6 個月徒刑或併科罰款、並具域外效力。法律主要針對未授權的 VPN 服務提供者，個人使用是否適用仍有疑義[^myanmar]。中國對個人翻牆長期屬法律灰色地帶，2025 年底官方公開示警翻牆會被究責[^china]。這些地方需要具備混淆（obfuscation，把 VPN 流量偽裝成一般 HTTPS）功能的方案，各地詳情見後面的地區章節與 [亞洲出差與研討會的數位準備](../scenarios/asia-travel.md)。
- **把 VPN 當匿名工具是最危險的誤解**：VPN 提供的是隱私（內容加密、遮蔽 IP）。要匿名請用 Tor。把 VPN 當匿名工具用於高風險情境，等於把自身安全完全託付給一家公司的誠信紀錄。

## 怎麼選一個值得信任的 VPN

把上述風險轉化為可逐項確認的問題，挑選服務時依序比對。沒時間全部查的話，前三項（司法管轄、經獨立稽核的 no-log、所有權透明）最關鍵，先看這三個。

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
| (對照) ExpressVPN | 英屬維京群島 | 是 | 低（Kape 集團） | BTC | 有（自動混淆） | 僅協定開源（Lightway） |
| (對照) NordVPN、Surfshark | 巴拿馬、荷蘭 | 是 | 中（同屬 Nord Security） | 加密貨幣 | 有 | 部分 |

主流商用服務多半也做過稽核，速查表把區別放在所有權透明、匿名註冊與付款、開源這幾欄。查證日 `2026-06`。VPN 的所有權、稽核結果、各地法規都可能隨時變動，最新狀態以各家稽核報告與當地現行規定為準，也可參考 [Privacy Guides](https://www.privacyguides.org/zh-TW/vpn/){target="_blank"} 這類非商業索引的更新。

### 混淆能力為什麼越來越重要

混淆是目前最該優先確認的一欄。審查方擋 VPN 的手法，已經從早期的封掉 VPN 伺服器 IP，進化到直接看流量長相。標準的 WireGuard、OpenVPN 連線在剛建立時帶有固定、可辨識的特徵，DPI 一眼就認得出這是 VPN 並切斷。混淆把 VPN 流量包裝成一般 HTTPS 網頁瀏覽的樣子，讓偵測系統無法辨識。有沒有混淆，往往直接決定你在強審查地區連不連得上。

混淆不是越多越好的設定，要不要開取決於你人在哪、面對哪類審查。在台灣、日本這類沒有系統性封鎖的環境，不需要混淆，標準協定速度更快、也更穩定。混淆是給中國、緬甸、伊朗這種 DPI 強的環境用的，代價是速度通常會掉一些。

各家產品頁的行銷名稱各有不同，本質都是混淆技術，以下幾個關鍵詞都指向同一件事：

- Shadowsocks、v2ray 類的橋接（Mullvad 提供 Shadowsocks）
- 把 WireGuard 包進 TLS 的偽裝（Proton VPN 的 Stealth）
- 各家自有名稱：ExpressVPN 的自動混淆、NordVPN 的 NordWhisper、Surfshark 的 Camouflage Mode、Astrill 的 StealthVPN

兩點提醒。第一，強審查系統會主動探測（active probing，主動連向可疑伺服器、測試它是不是 VPN 或 proxy，中國的防火長城就會這樣做），耐得住探測的混淆才頂得住。第二，混淆沒有一勞永逸，審查方會持續更新偵測，今天能用的協定下個月可能就被封，所以要備兩種以上並在出發前實際測試（詳情見後面的地區章節）。若混淆協定也遭封鎖，可改用 Tor 的 [WebTunnel](../community/setup-tor-webtunnel.md) 或 [Snowflake](./tor-snowflake.md) 橋接作為備援。

下面逐一介紹符合上述準則的服務，照你的威脅模型挑一個就好，不必全部看完。沒有特別技術背景、預算有限的話，從 Proton VPN 的免費方案或 Mullvad 開始最省事。

### Mullvad

[Mullvad](https://mullvad.net/){target="_blank"} 在隱私設計上做得最徹底。註冊不需要 email，只給你一組隨機帳號編號。付款接受現金郵寄、Monero、Bitcoin，不需要把身分綁進去。2023 年 9 月完成全伺服器 RAM-only 遷移[^mullvad-ram]，基礎設施與 app 經 Cure53 等多家機構多次稽核、Web App 由 Assured 獨立稽核，客戶端開源。前面提到的瑞典警方搜索案例，就是 Mullvad no-log 政策的實證。

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

[IVPN](https://www.ivpn.net/){target="_blank"} 是直布羅陀的老牌服務，嚴格 no-log、接受 Monero 與現金、支援多跳，客戶端以 GPLv3 開源，每年由 Cure53 稽核。它刻意拿掉聯盟行銷與限時促銷，避免用行銷話術扭曲使用者判斷。

**適合誰**：重視透明與稽核紀錄、不想被行銷牽著走、需要多跳的進階使用者。

**限制**：

- 生態與伺服器數量比大廠小
- 價格不算便宜，沒有免費方案
- 混淆能力以多跳為主，強審查地的耐封度不如專門的混淆協定

### Riseup VPN、CalyxVPN

[Riseup VPN](https://riseup.net/en/vpn){target="_blank"} 與 CalyxVPN 由非營利組織提供，技術上都建在 LEAP 的 Bitmask 平台，免費給人權與社運社群使用、不記錄使用者 IP。Calyx Institute 是美國 501(c)(3) 非營利，Riseup VPN 免費開放下載，而 Riseup 整體服務定位在認同其使命的行動者社群。

**適合誰**：預算有限的行動者與社運社群、需要一個不靠賣資料維生的免費基本隱私工具。

**限制**：

- 容量、速度與伺服器選擇有限
- Riseup 的定位是服務社運社群，使用前建議了解並認同其使命
- 混淆能力有限，把它當日常基本隱私夠用，高敏感的匿名仍要走 Tor

### 主流商用服務（ExpressVPN、NordVPN、Surfshark 等）

這些大廠的優勢在速度、相容性（解地理限制、看串流）、客服與一鍵混淆，也都做過第三方稽核。取捨在所有權集中與行銷導向：ExpressVPN 屬 Kape（同時經營 VPN 評測網站），NordVPN 與 Surfshark 同屬 Nord Security。日常防公共 Wi-Fi 竊聽、解地理限制夠用，但真正高敏感、出錯賭不起的場景，可信度與透明度不如前面幾家。

### 紅旗：這幾種要避開

- 來路不明的免費 VPN App，多半靠賣你的資料或塞廣告賺錢
- 把瀏覽器內建的免費 VPN 當成完整防護，它的覆蓋與保證通常很有限
- 只有行銷頁宣稱 no-log、沒有任何第三方稽核或真實案例佐證的服務

不想只聽我們的，可以對照 [Privacy Guides 的 VPN 建議](https://www.privacyguides.org/zh-TW/vpn/){target="_blank"}。它跟前面說的 Kape 評測站不同，不收廣告主、不靠推薦抽成，評選標準也公開可查，目前同樣列 Mullvad、Proton VPN、IVPN 三家[^pg]。

## 自架 VPN

自架 VPN 是另一個選項，把信任從 VPN 業者轉移到你租用的 VPS 供應商與自身的維運能力。常見工具有三種：

- **WireGuard**：現代、精簡的 VPN 協定，自己在一台 VPS 上跑。
- **Algo VPN**：Trail of Bits 維護的一套 Ansible 腳本，幾分鐘在雲端主機架好 WireGuard，刻意縮小安裝範圍（攻擊面）以降低供應鏈風險[^algo]。
- **Outline**：Google Jigsaw 開發、給記者與新聞編輯室抗審查用的自架方案，以 Shadowsocks 為基礎，2026 年 1 月起由獨立的 Outline Foundation 主導維運，Jigsaw 仍以貢獻夥伴參與[^outline]。

要先想清楚的取捨：

- 你不再信任 VPN 業者，但改信任你的 VPS 供應商（它一樣看得到伺服器流量），以及你自己的維運能力（設定有誤時沒有廠商可以協助排除）。
- 自架 VPN 的出口 IP 通常是你獨享，反而更容易被溯源到個人。它提供的匿名保護有限，適合組織內部安全連線、個人繞過封鎖，不適合需要隱匿身分的高敏感場景。要匿名仍是 Tor。
- 對抗審查時，Outline 這類 Shadowsocks 方案的混淆能力，常比商業 VPN 的標準協定更耐封。

**適合誰**：有技術人力的組織、想完全掌控基礎設施、不信任商業業者的記者與技術型工作者。

## Tor VPN（Beta，目前僅 Android）

Tor Project 自己也做了一個叫 Tor VPN 的 app。它以系統的 VPN 機制為操作介面，把你選定的 app 流量導入 Tor 網路，底層引擎是 Arti（Rust 版的 Tor）加上 Onionmasq[^torvpn-about]，跟一般商業 VPN 是兩回事。免費、開源（BSD 3-Clause），目前只有 Android（7.0 以上），iOS 與桌面版都還沒有[^torvpn-install]。

它的意義是把這整頁的核心取捨變成一個能直接裝來用的選項。一般 VPN 把信任集中到一家業者，Tor VPN 的出口是 Tor 的志工中繼，沒有任何單一方同時看得到你的來源與目的地，每個 app 還各走一條獨立的 Tor circuit（連線路徑）、拿到不同的出口 IP，降低跨 app 被關聯的機會[^torvpn-intro]。

!!! warning "現在是 Beta，別拿來做高敏感的事"

    Tor Project 官方明確標注 Tor VPN 還在 Beta，可能洩漏資訊、不應用於任何敏感用途[^torvpn-about]。對人權工作者、記者這類高風險使用者，現階段它適合測試與熟悉，真正高敏感的任務仍用成熟的 [Tor Browser](./what-is-tor.md) 或 Tails。可用性與安全性會隨版本演進，採用前以官方最新狀態為準。

幾個現實限制：

- 出口是 Tor exit node，速度比一般 VPN 慢，也不適合解地理限制或看串流，主流平台多半封鎖 Tor 的出口 IP。
- 目前只有 Android。iOS 上沒有 Tor VPN，要在 iPhone、iPad 用 Tor 改用 Tor 官方推薦的 [Onion Browser](https://onionbrowser.com/){target="_blank"}，可搭配 Guardian Project 的 Orbot 強化防漏[^ios-tor]。要在 Linux 桌面做類似的全流量 Tor 隔離，可看社群介紹的 [oniux 核心層級隔離工具](../blog/posts/oniux-kernel-level-tor.md)。
- 跟 Guardian Project 的 Orbot 功能高度重疊，差別在開發團隊與底層引擎（Orbot 用較舊的 C 版 Tor，Tor VPN 用 Arti），官方目前沒有明說哪個取代哪個[^torvpn-orbot]。

安全性上，Tor Project 在 2025 年委託 Cure53 對 Tor VPN 的 Android 版與 Onionmasq 網路層做了原始碼稽核，2026 年 4 月公開報告，結論是核心路由穩固、沒有根本性問題，待改善的是輸入驗證、DNS 處理、明文設定存儲等項目。完整中文摘要見社群整理的 [Cure53 完成 Tor VPN 安全稽核](../blog/posts/2026-code-audit-for-tor-vpn-completed-by-cure53.md)。

## 各地區能不能用：先評估，不要落地才試

VPN 在某地能不能用沒有全球通用答案，會隨地區與時間變。出國或在當地工作前，用下面的框架評估，逐國細節查 [亞洲出差與研討會的數位準備](../scenarios/asia-travel.md) 與 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 的當下觀測。

合法性大致分四級（用來判斷風險，不是法律意見）：

- **合法**：日常使用不受限，例如台灣、日本與多數民主國家。
- **受規範**：合法但業者受資料留存、實名等規範，例如越南、澳門。
- **灰色地帶**：法律未明確禁止個人使用，但封鎖積極、官方時有示警，例如中國、香港。
- **入罪化**：未經授權提供可能觸法（個人使用的適用範圍仍有爭議），例如緬甸。

行前與在地必做：

- **出發前就裝好並連線測試一次**。審查嚴的地方，App 商店與 VPN 官網本身可能連不上，落地才下載通常來不及。
- **備兩種以上連線方式**。單一協定常被封，強封鎖地（中國、緬甸）要用有混淆的方案，標準 WireGuard、OpenVPN 可能幾秒就被擋。
- **判斷是否需要混淆**。一般地區用標準協定即可，強審查地才需要 Stealth、Shadowsocks 這類偽裝。
- **開啟 kill switch**，避免切換網路或 VPN 掉線的瞬間短暫暴露真實 IP。

審查國的額外風險：

- 使用 VPN 本身可能被 DPI 辨識、被標記。
- 街頭臨檢與入境查機可能搜查裝置裡的 VPN App 與社群內容，緬甸與部分地區已有案例（詳見 [亞洲出差與研討會的數位準備](../scenarios/asia-travel.md)）。
- 高敏感任務帶乾淨裝置（一台沒有平常帳號、沒有個人資料的專用機，例如重設出廠或另外準備的手機），全程假設受監控。VPN 連不上時改走 Tor 的 WebTunnel、Snowflake 橋接，設定見 [Tor Snowflake](./tor-snowflake.md) 與 [如何架設 Tor WebTunnel](../community/setup-tor-webtunnel.md)。

## VPN 還是 Tor

兩個工具解決不同問題，看你要對抗的是誰來選。

- **VPN 夠用**：在公共 Wi-Fi、會場、飯店網路上加密連線，解開地理限制，做組織內部安全連線，或對速度敏感的日常使用。你的對手是同網段竊聽者、本地 ISP、地理封鎖。
- **必須 Tor**：你要對抗的是能拿到 VPN 業者紀錄的人，要保護消息來源，或做高敏感的匿名。你的對手有能力傳喚業者、做流量比對。
- **兩者搭配**：少數情境會疊用。先連 VPN 再進 Tor，能對 ISP 隱藏你在用 Tor 這件事，代價是多一個信任點與速度。先連 Tor 再出 VPN 很少見，會犧牲 Tor 的部分匿名優勢。多數人不需要疊，疊錯反而更糟，不確定就單用 Tor。完整說明見 [什麼是 Tor](./what-is-tor.md)。
- **介於兩者之間**：想要 Tor 的分散式信任又要 VPN 式的全 app 保護，可以試前面介紹的 Tor VPN（Beta），但它還在 Beta，別拿來做高敏感的事。

## 在台灣與正體中文使用者的補充

台灣 VPN 完全合法、無系統性封鎖。多數人的實際用途是公共 Wi-Fi 加密、保護瀏覽隱私、跨境出差前的網路準備。

港澳與中國的脈絡不同，正體中文使用者在這些地方工作或往返時要分開評估，不要把台灣這種寬鬆環境的使用習慣直接套用。

- **香港**：VPN 合法、沒有防火長城等級的全面封鎖，但屬於灰色地帶。2020 年《國安法》後，警方依第 43 條要求 ISP 以 DNS 竄改封鎖特定網站，HKChronicles、Hong Kong Watch 等都被封過。2024 年《維護國家安全條例》，加上 2026 年 3 月生效、屬 2020 年《國安法》實施細則修訂的解密義務（持令狀調查國安案時可要求被調查人交出裝置密碼，拒絕最高一年徒刑），讓裝置搜查與監控的法律基礎大幅收緊。VPN 合法不等於安全，記者與人權工作者要把國安監控與選擇性封鎖當成實質風險[^hk]。
- **澳門**：VPN 合法、無系統性封鎖，屬於受規範。《網絡安全法》（第 13/2019 號）要求電信實名登記，另有打擊電腦犯罪法的修法（第 4/2020 號）要求 ISP 留存可把連線追溯到具體用戶的對應紀錄至少一年[^macau]。連線本身會被長期記錄，敏感任務要把這點算進去。
- **中國**：有防火長城，個人翻牆屬灰色地帶。細節見前面的審查國風險段，逐地狀況見 [亞洲出差與研討會的數位準備](../scenarios/asia-travel.md)。

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

    連著 VPN，開 [browserleaks.com](https://browserleaks.com/){target="_blank"} 這類能一次測 IP、DNS、WebRTC 洩漏的工具，看顯示的 IP 與 DNS 是否為 VPN 的、有沒有漏出你原本的真實 IP。它不屬於任何 VPN 業者，不過也沒有權威機構正式背書，當常用工具參考即可。確認客戶端的 kill switch 開著。換 Wi-Fi、手機切到行動網路時最容易短暫洩漏，這些時候再測一次。

??? question "手機上的 VPN 要注意什麼"

    前面推薦的 Mullvad、Proton VPN、IVPN 都有 iOS 與 Android 官方 app，從官方網站或正規 App 商店下載，別用來路不明的免費 VPN App（風險見前面的免費 VPN 段）。iOS 想用 Tor，Tor VPN 沒有 iOS 版，改用 Onion Browser（見前面 Tor VPN 段）。Android 想把整台裝置或選定 app 走 Tor，才有前面介紹的 Tor VPN（Beta）。

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
[^mullvad-ram]: [We have successfully completed our migration to RAM-only VPN infrastructure](https://mullvad.net/en/blog/we-have-successfully-completed-our-migration-to-ram-only-vpn-infrastructure){target="_blank"} - Mullvad 官方部落格（2023-09-20）
[^kape]: [Kape Technologies (Formerly Crossrider) Now Owns ExpressVPN, CyberGhost, Private Internet Access, Zenmate](https://cyberinsider.com/kape-technologies-owns-expressvpn-cyberghost-pia-zenmate-vpn-review-sites/){target="_blank"} - Cyber Insider。另見 [Kape Technologies - Wikipedia](https://en.wikipedia.org/wiki/Kape_Technologies){target="_blank"}
[^nord]: [Nord Security joins forces with Surfshark](https://nordvpn.com/blog/nord-security-surfshark-merger-agreement/){target="_blank"} - NordVPN 官方公告（2022-02-02）
[^free-vpn]: [An Analysis of the Privacy and Security Risks of Android VPN Permission-enabled Apps](https://dl.acm.org/doi/10.1145/2987443.2987471){target="_blank"} - ACM IMC 2016（CSIRO、ICSI、UNSW）。資料為 2016 年，App 生態已演變，但免費 VPN 的基本商業模式問題至今未改變。
[^myanmar]: [Myanmar enacts cybersecurity law that aims to restrict use of VPNs](https://www.rfa.org/english/myanmar/2025/01/02/cybersecurity-law-vpn/){target="_blank"} - Radio Free Asia。法律分析見 [Myanmar Cybersecurity Law Takes Effect](https://www.tilleke.com/insights/myanmar-cybersecurity-law-takes-effect/){target="_blank"} - Tilleke & Gibbins
[^china]: [FOTN 2025 China](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"} - Freedom House。GFW 與翻牆連線指引見 [Tor 對中國的連線指引](https://support.torproject.org/censorship/connecting-from-china/){target="_blank"} - Tor Project。2025 年底官方公開示警見 [AI Cop Signals VPN Crackdown](https://chinamediaproject.org/2025/11/13/ai-cop-signals-vpn-crackdown/){target="_blank"} - China Media Project
[^stealth]: [Defeat censorship with Stealth, our new VPN protocol](https://protonvpn.com/blog/stealth-vpn-protocol){target="_blank"} - Proton VPN 官方
[^pg]: [VPN Services](https://www.privacyguides.org/zh-TW/vpn/){target="_blank"} - Privacy Guides（非商業、不收廣告主的開源隱私工具索引）
[^algo]: [trailofbits/algo](https://github.com/trailofbits/algo){target="_blank"} - Trail of Bits（GitHub）
[^outline]: [Introducing the Outline Foundation: An Independent Home for Outline](https://medium.com/jigsaw/introducing-the-outline-foundation-an-independent-home-for-outline-39fba2ab4e25){target="_blank"} - Jigsaw。記者應用案例見 [Google has a new tool to outsmart authoritarian internet censorship](https://www.technologyreview.com/2023/09/13/1079381/google-jigsaw-outline-vpn-internet-censorship/){target="_blank"} - MIT Technology Review
[^torvpn-about]: [About Tor VPN](https://support.torproject.org/tor-vpn/getting-started/about-tor-vpn/){target="_blank"} - Tor Project 官方支援文件（含 Beta 警語）
[^torvpn-install]: [Download and Install - Tor VPN](https://support.torproject.org/tor-vpn/getting-started/download-and-install/){target="_blank"} - Tor Project 官方支援文件。BSD 3-Clause 授權見 [Tor VPN Beta on F-Droid](https://f-droid.org/en/packages/org.torproject.vpn/){target="_blank"} - F-Droid
[^torvpn-intro]: [Tor VPN Threat Model](https://support.torproject.org/tor-vpn/security/threat-model/){target="_blank"} - Tor Project 官方支援文件（每個 app 獨立 circuit 與信任模型）
[^torvpn-orbot]: [What's the difference between TorVPN and Orbot](https://forum.torproject.org/t/whats-the-difference-between-torvpn-and-orbot/21204){target="_blank"} - Tor Project 官方論壇（社群討論）。Orbot 底層為 C-tor，見 [orbot-android](https://github.com/guardianproject/orbot-android){target="_blank"} - Guardian Project
[^hk]: 香港封鎖案例與法律依據見 [Websites blocked in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"} - Hong Kong Free Press。2026 年 3 月解密義務見 [Hong Kong introduces new requirement for national security suspects to hand over passwords](https://hongkongfp.com/2026/03/23/hong-kong-introduces-offence-requiring-national-security-suspects-to-hand-over-passwords/){target="_blank"} - HKFP。2024《維護國家安全條例》（基本法 23 條立法）見 [Hong Kong: New Security Law a Full-Scale Assault on Rights](https://www.hrw.org/news/2024/03/19/hong-kong-new-security-law-full-scale-assault-on-rights){target="_blank"} - Human Rights Watch。自由度評級見 [Hong Kong: Freedom in the World 2026](https://freedomhouse.org/country/hong-kong/freedom-world/2026){target="_blank"} - Freedom House（Freedom on the Net 未獨立評估香港，網路自由併入此報告）
[^macau]: [Macau Cybersecurity Law](https://www2.deloitte.com/cn/en/pages/risk/articles/macau-cybersecurity-law.html){target="_blank"} - Deloitte China。ISP 留存 NAT 對應紀錄一年見 [Amendments to Macau's law combating cyber crime](https://www.ibanet.org/article/66791638-131e-4bac-8077-4301eb0d6fcf){target="_blank"} - International Bar Association
[^ios-tor]: iOS 官方推薦 Onion Browser 見 [Tor Project download page](https://www.torproject.org/download/){target="_blank"} - Tor Project。搭配 Orbot 強化防漏的建議見 [Onion Browser Review](https://www.privacyguides.org/articles/2024/09/18/onion-browser-review/){target="_blank"} - Privacy Guides
