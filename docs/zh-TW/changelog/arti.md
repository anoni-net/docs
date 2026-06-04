---
title: Arti 更新日誌
description: Arti（Tor Project 以 Rust 開發的新一代 Tor 實作）各版本更新的中文重點整理，方便台灣與華語讀者掌握 RPC、relay 開發、設定系統等關鍵進展。
icon: material/code-tags
---

# :material-code-tags: Arti 更新日誌

Arti 是 [Tor Project](../tools/what-is-tor.md) 以 Rust 開發的新一代 Tor 實作。本頁從上游 release notes 條列摘譯，新版本永遠在最上面。

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
