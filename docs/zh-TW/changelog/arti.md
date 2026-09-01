---
title: Arti 更新日誌
description: Arti（Tor Project 以 Rust 開發的新一代 Tor 實作）各版本更新的中文重點整理，方便台灣與華語讀者掌握 RPC、relay 開發、設定系統等關鍵進展。
icon: material/code-tags
---

# :material-code-tags: Arti 更新日誌

Arti 是 [Tor Project](../tools/what-is-tor.md) 以 Rust 開發的新一代 Tor 實作。本頁從上游 release notes 條列摘譯，新版本永遠在最上面。

## c-tor 移植到 Rust 的進度

Arti 是 Tor Project 從 2021 年開始的計畫，把原本用 C 寫成的 Tor（社群慣稱 c-tor）整套以 Rust 重寫，換取更好的記憶體安全、模組化架構與可嵌入性。開發順序先把用戶端補到足以取代 c-tor，再往中繼端推進。下表依官方 [CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"} 與 release notes 整理，狀態以實際釋出的功能為準。

| 功能領域 | 進度 | 完成 / 進行的版本 |
|---|---|---|
| 用戶端核心（SOCKS 代理、`arti-client` 嵌入函式庫） | ✅ 已完成，宣告 stable | 1.0.0（2022-09） |
| DNS 代理 | ✅ 已完成 | 1.0.0（2022-09） |
| 抗審查：橋接與 pluggable transports（obfs4、Snowflake、WebTunnel） | ✅ 已完成 | 1.1.0（2022-11） |
| 連線 onion 服務（用戶端） | ✅ 已完成 | 1.1.6（2023-06） |
| 架設 onion 服務（服務端，含 full vanguards、限制性探索、用戶端授權） | ✅ 已完成 | 1.2.0（2024-03）起 |
| RPC 控制介面（取代 c-tor 的 control port） | ✅ 已完成，轉 stable | 1.4.2（2025-03） |
| HTTP CONNECT 代理 | ✅ 已完成，預設啟用 | 2.2.0（2026-03） |
| 流量控制與壅塞控制 | ✅ 2.6.0 起永遠啟用，`flowctl-cc` 這個開關已移除 | 2.4.0 轉 stable、2.6.0（2026-09）預設化 |
| Counter Galois Onion 加密（CGO） | ✅ 2.6.0 起永遠啟用 | 2.6.0（2026-09） |
| 嵌入非 Rust 語言（C FFI） | 🟡 RPC client 已有 C 友善介面，完整 FFI 規畫中 | 進行中 |
| 中繼（relay） | 🟡 開發中，官方明說不要拿去接公開網路 | 2.0.0（2026-02）到 2.6.0 持續推進 |
| 目錄權威（directory authority） | 🟡 開發中，文件解析與 microdescriptor 計算已有雛形 | 2.0.0（2026-02）到 2.6.0 持續推進 |
| control-port 協定相容 | ⬜ 不另實作，改以 RPC 取代 | — |

圖例：✅ 已完成　🟡 開發中　⬜ 不實作

用戶端這一側的能力已大致對齊 c-tor，能當 SOCKS 代理、連線與架設 onion 服務、走橋接與 pluggable transports。計畫現在的主力放在中繼端，還無法用 Arti 架設 Tor 中繼，這部分目前只能用 c-tor。c-tor 的 control port 在 Arti 改以 RPC 介面取代，設計取向不同。

## 中繼端做到哪裡

2.6.0 隨版附上一份 [`README_relay.md`](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/README_relay.md){target="_blank"}，把中繼與目錄權威要做的事列成清單並標出完成狀態。這是目前最接近官方路線圖的東西，開頭第一句就是不要在公開 Tor 網路上執行 `arti-relay`。

依 2026 年 8 月那份清單，中繼端的完成度：

| 區塊 | 已完成 | 待辦 |
|---|---|---|
| 基本運作（通道、電路、CREATE2、EXTEND2、ORPort） | 9 | 8 |
| 出口支援（DNS、BEGIN、RESOLVE、離開政策） | 0 | 5 |
| 目錄快取 | 0 | 13 |
| 自我檢測（ORPort 可達性、頻寬、DNS） | 0 | 3 |
| onion 服務支援（HsDir、引介、會合） | 0 | 3 |
| 安全功能（離線身分金鑰、記憶體與 socket 層 DoS 防禦） | 0 | 4 |
| 效能功能（緩衝區調校、電路排程、conflux） | 0 | 5 |
| 目錄權威 | 0 | 28 |

已完成的九項集中在最底層：接受連入通道、雙向通道認證、處理與遞送 relay cell、CREATE2 與 CREATE\_FAST、EXTEND2、監聽 ORPort。也就是說電路建得起來，但一個中繼要能真的上線所需的其他東西幾乎都還沒開始，金鑰產生與輪替、發布 router descriptor、頻寬上限這些都還在待辦。

那份清單自己註明 2026 年 8 月 11 日之後團隊還沒回頭勾選，所以實際進度可能比表上更前面，2.6.0 就補上了 `ntor-v3` 的 CREATE2 握手與中繼 DNS 解析器的初步設計。要追精確狀態得看 [issue tracker](https://gitlab.torproject.org/tpo/core/arti/-/issues/){target="_blank"}。

## Arti 2.6.0

> 2026-09-01 · [CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"}

- 壅塞控制與 Counter Galois Onion 加密（CGO）改為永遠啟用，`flowctl-cc` 與 `counter-galois-onion` 兩個 cargo feature 開關一併移除。用 `arti-client` 或 `tor-proto` 的專案升上來時要拿掉那兩個開關。
- 中繼端進展：支援 `ntor-v3` 的 CREATE2 握手、不再把認不得的電路 ID 當成通道協定違規、收到 DESTROY 的通道不再回送 DESTROY，另有中繼 DNS 解析器與快取的初步設計。
- 目錄權威端進展：可以計算 microdescriptor、初步支援 Extra Info 文件、`DirMgr` 暫時可以當 `DirServer` 的後端。
- 隨版附上 `README_relay.md`，列出中繼與目錄權威還要做哪些事，見上面的「中繼端做到哪裡」。
- 上游沒有提到已被實際利用。這一版沒有列出安全修補。

## Arti 2.5.1

> 2026-08-03 · [官方 CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"}

- 修補一個影響效能的重要錯誤：`XON` 訊息原本把「每秒位元組」誤判為「每秒位元」，導致允許傳輸的資料量少了 8 倍，現已修正。
- Onion 服務新增可設定連到 `AF_UNIX` 位址。
- 用戶端與 onion 服務之間，在啟用實驗性 feature（`hsc-negotiate-extensions`、`hss-negotiate-extensions`）時，可協商壅塞控制與 Counter Galois Onion（CGO）加密。
- 持續往「Arti 作為 Tor 中繼」開發，新增驗證與處理傳入中繼訊息的基礎設施。

## Arti 2.5.0

> 2026-06-30 · [上游公告](https://blog.torproject.org/arti_2_5_0_released/){target="_blank"}

- Counter Galois Onion（CGO）加密正式列為穩定，編譯時啟用 `counter-galois-onion` feature（或 `full`）即可使用。這是本次釋出的主打項目。
- 壅塞控制（`flowctl-cc`）改為預設啟用，不需額外設定即可提升傳輸吞吐。此 feature 已於 2.4.0 轉 stable，本版把預設打開。
- **這一版唯一的安全修補**：兩個中危阻斷服務（DoS，讓服務當掉或無法回應）漏洞，TROVE-2026-24（惡意目錄鏡像可觸發 `tor-netdoc` parser crash，最終停掉 `tor-dirmgr` 任務）、TROVE-2026-27（低效演算法可被利用拖垮 CPU），兩者皆未發現實際被利用。
- 持續往「Arti 作為 Tor 中繼」與「Arti 作為 directory authority」開發，新增 router descriptor、microdescriptor 與 consensus 的編解碼，以及 CREATE2 cell 的 ntor 握手回應。
- MSRV（最低支援 Rust 版本）提升至 Rust 1.91。

## Arti 2.4.0

> 2026-06-01 · [上游公告](https://blog.torproject.org/arti_2_4_0_released/){target="_blank"}

- 持續往「Arti 作為 Tor 中繼」與「Arti 作為 directory authority」開發。
- 修補多個影響 onion 服務用戶端連線的錯誤。
- 流量控制與壅塞控制（flow control / congestion control）正式列為穩定，編譯時啟用 `flowctl-cc` feature 即可使用。
- `arti-client` crate 出現多項 `TorClient` API 破壞性變更，並移除 `use_obsolete_software` 選項（#1960），對應 2.3.0 預告的介面調整。

## Arti 2.3.0

> 2026-05-07 · [上游公告](https://blog.torproject.org/arti_2_3_0_released/){target="_blank"}

- macOS 最低支援版本由 10.12 提升至 10.14。
- 持續往「Arti 作為 Tor 中繼」與「Arti 作為 directory authority」開發。
- RPC 介面新增「檢視 tunnel paths」的 API。
- 新增 syslog 日誌輸出（啟用 `syslog` feature 並開啟 `logging.syslog` 設定）。
- 新增 `logging.protocol_warnings` 選項，將協定違規以 warning 等級記錄。
- 預告下一版會把 `TorClient` 改為明確的 `Arc<T>` 包裝（破壞性變更，影響 `arti-client` crate 的使用者）。

## Arti 2.2.0

> 2026-03-31 · [上游公告](https://blog.torproject.org/arti_2_2_0_released/){target="_blank"}

- HTTP CONNECT 代理納入完整建置且預設啟用，部署 Arti 作為 SOCKS 替代代理更直接。
- RPC 介面支援非阻塞請求與 superuser session 管理，便於外部工具控制 Arti 行為。
- relay 開發持續推進，朝「Arti 可作為 Tor 中繼運行」的目標邁進。
- 目錄服務、設定系統與多項內部模組同步迭代修補。
- 安全修補：一個低危問題。嵌入 arti 的應用程式如果也用了 `weak-table` 且開啟 `ahash`，在沒有硬體 AES 支援的機器上，抗阻斷服務的能力會變差（TROVE-2026-005）。

## Arti 2.1.0

> 2026-03-03 · [上游公告](https://blog.torproject.org/arti_2_1_0_released/){target="_blank"}

- 中繼支援的底層建設大幅補完，為 2.2.0 開始對外開放 relay 功能鋪路。
- 設定系統改用 `derive-deftly` 巨集架構，新增設定型別的成本顯著降低。
- RPC 介面持續打磨，加入更多管理用 API。
- MSRV（最低支援 Rust 版本）提升至 Rust 1.89.0。
- 安全修補三項，都是相依套件升級：`bytes` 升到 0.11.1，避開 `BytesMut::reserve()` 整數溢位造成的未定義行為（TROVE-2026-001、RUSTSEC-2026-0007）。`keccak` 升到 0.1.6，避開 ARMv8 組譯錯誤可能造成的未定義行為。`time` 升到 0.3.47，清掉 RUSTSEC-2026-0009 的稽核警告。
