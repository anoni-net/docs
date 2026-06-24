---
title: Tor Project 生態與對接
description: Tor Project 的規劃去哪裡看、哪些專案還在持續運作、官方溝通管道、以及對台灣與正體中文社群最容易切入的參與方式，一頁看懂如何把在地推廣接上游 Tor 生態。
icon: material/handshake-outline
---
# :material-handshake-outline: Tor Project 生態與對接

匿名網路社群 anoni.net 這一年在地推廣 Tor、Tails、OONI，夥伴問得最多的，是除了在台灣用、在台灣講，能不能直接參與 Tor 上游的開發與社群。可以，而且門檻比想像低。接上游能帶來幾件實際的事，台灣的觀測成果可以回饋給維護網路健康的團隊，每多架一個中繼就替亞太增加一個節點、提升 IP 多元性，Tor 的正體中文翻譯也需要人持續維護、跟上每次更新。Tor Project 是公開治理的非營利組織，溝通管道、原始碼、規劃文件大多對外開放，無論在台灣、香港、澳門或其他華語環境，都能從翻譯、跑中繼、辦推廣開始參與。

這頁把四件事整理在一起：Tor 的規劃去哪裡看、哪些專案還在動、官方的溝通管道、以及對正體中文社群最容易切入的參與方式。各條參與方式若站內已有操作教學，會直接連過去。

!!! tip "最低門檻的起手式"

    兩件事就能開始，都不需要等任何人核准，個人身分參與就行，不必代表整個社群。一是到 Weblate 維護 Tor 支援文件的正體中文翻譯，zh_Hant 已大致翻完，持續需要人跟上原文更新與校對（[Tor new-support-portal](https://hosted.weblate.org/projects/tor/new-support-portal/){target="_blank"}，流程見 [中文化與文件翻譯](./i18n.md)）。二是進 Tor 官方論壇與 Matrix 的 `#tor-project:matrix.org` 頻道自我介紹。先把貢獻紀錄與能見度建立起來，後面的正式合作都從這裡開始。

## 從哪裡看 Tor 的規劃

Tor Project 的規劃公開在兩層，給一般關注者看的策略層在官方部落格，給貢獻者看的細部規劃在自架的 GitLab wiki。

對外策略層在 [blog.torproject.org](https://blog.torproject.org/){target="_blank"}。每年的方向文會點出當年度的優先項目，2026 年的版本聚焦把規避能力整合進更多 Tor 軟體（例如 Tails 與 Tor VPN），並把對抗俄羅斯、中國這類把網路各自築牆的做法當成貫穿的關注[^1]。年度回顧自述四個長期核心關注：效能與安全、網路健康度、抗審查、第三方整合相容性[^2]。財報則透露策略重心，美國政府資助佔比已從 FY2021-22 的 53.5% 降到 FY2023-24 的 35.08%，方向是降低單一資助來源的依賴[^3]。線上大會 State of the Onion 通常在年底舉辦，2025 年分兩場（11 月團隊更新、12 月社群更新），是看年度方向最集中的時間點[^4]。

內部規劃層在 [gitlab.torproject.org/tpo](https://gitlab.torproject.org/tpo){target="_blank"}，公開專案不需登入就能讀。各團隊的 `team` meta 專案 wiki 放 roadmap 與會議記錄，全機構的 sponsor 組合整理在 `tpo/team` 的 Sponsors 總覽頁[^5]，TPA（系統管理團隊）的年度 roadmap 是最具體可讀的一份[^6]，Arti 的逐項里程碑掛在群組的 Roadmap 標籤 issue 上[^7]（milestones 端點需登入，計畫的期程日期透過公開 API 讀不到，要從各 wiki 內嵌的連結追）。

## 目前的重點方向與活躍專案

看不懂下面的技術細節沒關係，參與 Tor 不需要先懂這些，想直接知道能做什麼可以跳到 [如何開始對接](#如何開始對接)。這節是給想掌握 Tor 往哪走的人。

### 活躍度快照

Tor 的 GitLab 上有兩百多個專案，活躍程度差異很大。截至 2026 年 6 月的一次公開 API 掃描，非封存專案約 252 個，近 30 天內有活動的約 103 個，其中以 network-health 最活躍，web、core、tpa、applications 也都有不少在動的專案[^8]。這是當下的快照，要看即時狀態直接到 GitLab 依 `last_activity_at` 排序最準，數字本身會隨時間變動。

### 技術主線

幾條主線值得社群跟著看：

- 抗審查三件套。WebTunnel 把橋接流量偽裝成一般 HTTPS，2025 年在俄羅斯是關鍵工具。Snowflake 用瀏覽器志工的 WebRTC（瀏覽器做視訊通話那種即時連線）當臨時代理，穩定運作中，站內介紹見 [Tor Snowflake 橋接點](../tools/tor-snowflake.md)。Conjure 利用 ISP 未使用的位址空間，對抗審查者把已知代理 IP 逐一列出來封鎖的手法，官方規劃 2026 年起開始逐步推出[^9]。
- Arti，Tor 的純 Rust 重寫版。客戶端核心、circuit、Onion Service 已經穩定，relay 與 directory authority（維護中繼名冊的核心伺服器）仍在開發，官方未承諾與舊版 C 實作功能對等的時程。
- Counter-Galois-Onion（CGO）新對稱加密，修補舊加密可被竄改、被用來追蹤連線的弱點，目前在 Arti 內標為實驗，測試完成才會預設啟用。
- Tor VPN（Android），底層用 Arti，2025 年 9 月上架 beta，官方標明仍屬實驗、不適合高風險場景。iOS 仍是既有的 Orbot。
- Onion Services 的易用性與防濫用，以及 Tails（見 [什麼是 Tails](../tools/what-is-tails.md)）併入 Tor Project 後的整合。

### 看 sponsor 判斷哪些方向會持續做

哪些方向會持續做，看 sponsor 資助最準。下表是 Sponsors 總覽頁列出的部分案子[^5]，編號以 `S` 開頭：

| Sponsor | 方向 | 與匿名網路社群的關聯 |
|---|---|---|
| `S96` | 中國、香港、西藏的審查規避：新 pluggable transports、更難封鎖的橋接、改善橋接派發 | 最相關，正是社群關注的議題 |
| `S112` | 對抗惡意中繼、提升網路健康：監控工具、中繼營運者行為準則、抗中繼攻擊 | 對應社群的觀測工作 |
| `S119` | Arti，Tor 的純 Rust 實作 | 下一代技術基礎 |
| `S150` | 淘汰 BridgeDB，全面遷移到 RDSys 新派發系統 | 橋接派發機制 |
| `S101` | Android 的 Tor VPN client | 消費級產品 |
| `S131` | Mullvad Browser 與 Tor Browser 重構 | 瀏覽器 |

`S96` 與 `S112` 跟匿名網路社群的關注重疊最深，一個是正體中文使用者面對的審查規避，一個對應社群在做的網路可達性觀測。

## 官方溝通管道

Tor 把 IRC（OFTC 網路）與 Matrix 雙向橋接，用 Element 加入 Matrix 或用 IRC 都會進到同一個頻道[^10]。這裡的 Matrix 是 Tor 官方的 `matrix.org` 頻道，跟匿名網路社群自架的 `im.anoni.net` 是兩回事。

| 頻道 | 用途 |
|---|---|
| `#tor` | 使用者支援，問 Tor 操作問題 |
| `#tor-dev` | 開發、協定、程式技術討論 |
| `#tor-project` | 組織與社群事務、meetup、outreach |
| `#tor-relays` | 跑中繼的營運者社群 |
| `#tor-l10n` | 翻譯與在地化討論 |
| `#tor-meeting` | 旁聽或參加公開記錄的團隊會議 |

文字討論與公告在 [Tor Forum](https://forum.torproject.org/){target="_blank"}（Discourse 論壇，分使用者支援、在地化、活動等類別），各郵件列表在 [lists.torproject.org](https://lists.torproject.org/){target="_blank"} 訂閱。組織層級的事務走 email：非營利事務、商標、合作協調寄 <frontdesk@torproject.org>，邀請講者寄 <speaking@torproject.org>，安全問題寄 <security@torproject.org>。

進這些頻道與論壇前，先讀 Tor 的 [社群政策與行為準則](https://community.torproject.org/policies/){target="_blank"}，了解社群對互動的共同期待。

## 如何開始對接

針對一個正體中文的在地社群，依實際可行性排序，每一項都標出站內已有的操作教學：

1. 在地化翻譯。門檻最低，不需審核帳號、不需技術背景，個人就能在 Weblate 開始，還能直接把正體中文做好，是建立社群貢獻紀錄最快的方式。流程與 Weblate 連結見 [中文化與文件翻譯](./i18n.md) 的「Tor 文件翻譯」一節，第一次參與先讀 [成為 Tor 翻譯者](https://community.torproject.org/localization/becoming-tor-translator/){target="_blank"}。
2. 進 `#tor-project` 與論壇自我介紹。這是 meetup、outreach、社群事務的主場，後續一切正式對接的起點。
3. 辦在地 meetup。Tor 的 [Outreach](https://community.torproject.org/outreach/){target="_blank"} 提供 Street Team Kit、講稿與「如何辦自己的 Tor meetup」素材，屬官方鼓勵的自主行動，不需審批，需要講者時寫信給 <speaking@torproject.org>。
4. 跑中繼或架橋接。有機器與頻寬的成員可在台灣架設中繼，強化亞太節點覆蓋，技術操作見 [如何搭建 Tor Relay](./setup-tor-relay.md)。想架設偽裝成 HTTPS 的橋接見 [設置 Tor WebTunnel](./setup-tor-webtunnel.md)，求助管道是 `#tor-relays` 與 tor-relays 郵件列表。
5. 開發與回報問題。需要 GitLab 帳號的人到 [anonticket.torproject.org](https://anonticket.torproject.org/){target="_blank"} 匿名申請或回報，再到對應 repo 開 issue，新手可從標 first-contributors 的 issue 入手，技術討論在 `#tor-dev`。
6. Training Partner 正式對接。Tor 有 [training partners](https://community.torproject.org/training/partners/){target="_blank"} 機制，這是社群對組織最正式的合作形式，通常建立在前面幾項已有貢獻紀錄之後，適合當中長期目標。

## 匿名網路社群的對接脈絡

社群現有的工作跟 Tor 幾個方向接得起來：

- 正體中文文件與用語。社群已在做 zh-Hant 的翻譯與用語規範，直接轉成 Weblate 上的 Tor 翻譯貢獻，是最自然的延伸。
- 網路可達性觀測。社群維運的 Pulse（[Tor Relays 觀測點](../taiwan/tor-relay-watcher.md) 的圖表來源）與 ASN Coverage（[ASN 觀測資料分析](../taiwan/ooni-asn-coverage.md)）對應 network-health 團隊與 `S112` 的工作方向，觀測成果可帶到該團隊的社群分享。
- 校園中繼。[Tor Relay 校園建立研究專題](./relay-on-campus.md) 源自 EFF 與 Tor Project 合作的 Tor University Challenge，台師大已有運行中的案例（見 [台師大 NZ 訪談](../blog/posts/ntnu-nz.md)），是把在地推廣接回 Tor 生態的具體成果。

這些方向如何排進社群的年度節奏，見 [2026 年度路線圖](./roadmap-2026.md)。State of the Onion 的社群場會公開徵集社群更新，是把這些成果對國際亮相的場合。

## :fontawesome-solid-diagram-project: 相關閱讀

<div class="grid cards" markdown>

- [:material-translate-variant: 中文化與文件翻譯](./i18n.md)
- [:simple-torproject: 如何搭建 Tor Relay](./setup-tor-relay.md)
- [:material-tunnel-outline: 設置 Tor WebTunnel](./setup-tor-webtunnel.md)
- [:material-hand-heart: 如何參與與認領主題](./how-to-contribute.md)

</div>

[^1]: [Advancing digital rights in 2026](https://blog.torproject.org/advancing-digital-rights-in-2026/){target="_blank"} - The Tor Project Blog
[^2]: [The Tor Project's 2024 Year in Review](https://blog.torproject.org/2024-year-in-review/){target="_blank"} - The Tor Project Blog
[^3]: [The Tor Project Financial Reports for July 2023 to June 2024](https://blog.torproject.org/financials-blog-post-2023-2024/){target="_blank"} - The Tor Project Blog
[^4]: [State of the Onion 2025](https://blog.torproject.org/state-of-the-onion-2025/){target="_blank"} - The Tor Project Blog
[^5]: [tpo/team wiki：Sponsors 總覽](https://gitlab.torproject.org/tpo/team/-/wikis/Projects/Sponsors-2023){target="_blank"} - Tor Project GitLab
[^6]: [tpo/tpa/team wiki：roadmap/2025](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/roadmap/2025){target="_blank"} - Tor Project GitLab
[^7]: [tpo 群組 Roadmap 標籤 issues](https://gitlab.torproject.org/groups/tpo/-/issues/?label_name[]=Roadmap&state=opened){target="_blank"} - Tor Project GitLab
[^8]: [Tor Project GitLab 公開 API](https://gitlab.torproject.org/api/v4/groups/tpo/projects?include_subgroups=true){target="_blank"} - 2026 年 6 月掃描的非封存專案活躍度快照
[^9]: [Staying ahead of the censors in 2025](https://blog.torproject.org/staying-ahead-of-censors-2025/){target="_blank"} - The Tor Project Blog
[^10]: [Chat with the Tor community](https://support.torproject.org/get-in-touch/chat-with-us/){target="_blank"} - Tor Project Support
