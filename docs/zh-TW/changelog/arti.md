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
| 流量控制與壅塞控制（`flowctl-cc`，為 conflux 鋪路） | ✅ 已完成，轉 stable | 2.4.0（2026-06） |
| 嵌入非 Rust 語言（C FFI） | 🟡 RPC client 已有 C 友善介面，完整 FFI 規畫中 | 進行中 |
| 中繼（relay）：circuit reactor、relay channel、握手回應、TLS server 端 | 🟡 開發中，尚不可用 | 2.0.0（2026-02）起 |
| 目錄權威（directory authority）：憑證管理、目錄快取 | 🟡 開發中，尚不可用 | 2.0.0（2026-02）起 |
| control-port 協定相容 | ⬜ 不另實作，改以 RPC 取代 | — |

圖例：✅ 已完成　🟡 開發中　⬜ 不實作

用戶端這一側的能力已大致對齊 c-tor，能當 SOCKS 代理、連線與架設 onion 服務、走橋接與 pluggable transports。計畫現在的主力放在中繼端，relay 與 directory authority 仍在開發，還無法用 Arti 架設 Tor 中繼，這部分目前只能用 c-tor。c-tor 的 control port 在 Arti 改以 RPC 介面取代，設計取向不同。

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

## Arti 2.1.0

> 2026-03-18 · [上游公告](https://blog.torproject.org/arti_2_1_0_released/){target="_blank"}

- 中繼支援的底層建設大幅補完，為 2.2.0 開始對外開放 relay 功能鋪路。
- 設定系統改用 `derive-deftly` 巨集架構，新增設定型別的成本顯著降低。
- RPC 介面持續打磨，加入更多管理用 API。
- MSRV（最低支援 Rust 版本）提升至 Rust 1.89.0。
