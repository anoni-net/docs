---
date: 2026-03-31
authors:
    - toomore
categories:
    - 更新
    - Tor
    - 翻譯文章
slug: arti-2-2-0-released-http-connect-rpc-and-relay-development
image: "assets/images/tor.webp"
summary: "Arti 2.2.0 將 HTTP CONNECT 納入完整建置並預設啟用、強化 RPC 管理能力，並持續推進 relay 開發"
description: "Arti 2.2.0 釋出重點包含 HTTP CONNECT 支援、RPC 非阻塞請求與 superuser 管理功能，以及 relay 與目錄服務開發進展"
---

# Arti 2.2.0 釋出：HTTP CONNECT、RPC 與 relay 開發進展

!!! info ""

    以下內容原文翻譯來自以下文章，主詞角色為 Tor Project：

    - [Arti 2.2.0 released: HTTP CONNECT, RPC, and Relay development. | March 31, 2026](https://blog.torproject.org/arti_2_2_0_released/){target="_blank"}

![Tor](./assets/images/tor.webp)

Arti 是 Tor Project 正在以 Rust 開發的新一代 Tor 實作。2.2.0 版的核心重點，是把先前偏實驗性的連線方式推向更可實用的狀態：**HTTP CONNECT 現在在完整建置中可用，並預設啟用**。此外，RPC 客戶端與管理能力也有明顯升級，並同步修補一項低嚴重度安全議題。

對在企業網路、校園網路或公共網路中使用 Tor 的人來說，HTTP CONNECT 的可用性提升很關鍵；對整合 Arti 到既有服務的開發者來說，RPC 的非阻塞與事件迴圈整合也能降低實作成本。整體來看，這是一個把「可部署性」與「可維運性」一起往前推的版本。

<!-- more -->

## 本版重點

### HTTP CONNECT 正式納入完整建置，並預設啟用

Arti 2.2.0 新增（並推進）透過 **HTTP CONNECT** 連上 Tor 網路的能力。這項功能過去屬於實驗性質，現在已包含於完整建置並預設啟用，且與 SOCKS 共用同一個連接埠。

這代表在某些 SOCKS 部署不便、但 HTTP 代理路徑較常見的環境中，Arti 的落地門檻可望下降。對需要在受限網路情境下維持匿名連線能力的使用者與團隊，這是實際可感的改進。

### RPC：非阻塞請求、事件迴圈整合與 superuser 管理能力

`arti-rpc-client-core` 現在支援非阻塞請求（non-blocking requests），並能更好地整合應用程式事件迴圈。這讓 Arti 更容易嵌入到既有服務架構，例如需要高併發或長連線管理的場景。

同時，RPC 系統新增了透過 **superuser** 進行 Arti 實例管理的能力。對自動化部署、觀測與維運流程而言，這為更精細的管理控制打開了空間。

### 安全修補：TROVE-2026-005

本版修正了低嚴重度安全議題 [TROVE-2026-005](https://gitlab.torproject.org/tpo/core/arti/-/issues/2418){target="_blank"}。官方描述指出，在特定且不常見的嵌入式建置配置中，該問題會削弱部分抗 DoS 能力。

雖然影響條件較侷限，但能在同一版釋出中完成修補，仍反映 Arti 團隊在功能推進與安全維護之間的平衡。

## 幕後進展：relay、circuits 與目錄服務

官方也提到持續投入 relay 支援，包括 relay channels、circuits，以及目錄伺服器功能（mirrors 與 authorities）。這些工作多屬中長期基礎建設，短期可能不如前端功能顯眼，但對 Arti 未來能否承擔更完整的 Tor 角色十分關鍵。

也就是說，2.2.0 除了帶來可見的新功能外，也同步把 Arti 的長期架構藍圖往前推進了一步。

## 台灣脈絡下可關注的三個方向

1. **受限網路可用性**：在校園、企業與公共網路情境，HTTP CONNECT 可能降低初始接入難度，但仍需評估代理政策、流量特徵與在地網路阻擋模型。
2. **在地工具鏈整合**：RPC 非阻塞能力讓 Arti 更容易接入常見服務框架（如 Python/Node.js 的事件驅動服務），可用於健康檢查、告警與策略控制。
3. **安全與治理節奏**：從 [TROVE-2026-005](https://gitlab.torproject.org/tpo/core/arti/-/issues/2418){target="_blank"} 修補到 relay 基礎建設推進，可觀察 Arti 在「快速演進」與「風險控制」之間如何維持節奏，這對數位人權與資安社群都具有參考價值。

## 延伸閱讀

- [Arti 2.2.0 官方 changelog 條目](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md#arti-220--30-march-2026){target="_blank"}
- [Arti 專案 README](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/README.md){target="_blank"}
- [`arti` binary 文件](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/crates/arti/README.md){target="_blank"}

!!! info "關於 Arti 專案"

    Arti 是 Tor Project 正在開發的新一代 Tor 實作（implementation），以 Rust 撰寫。其目標是在維持 Tor 網路匿名性與隱私保護特性的前提下，提供一個更現代化、更易於維護與整合的程式庫與工具組。相較於以 C 語言實作、已經服役多年的傳統 Tor（常被稱為「C Tor」或 Tor daemon），Arti 採用模組化與較新穎的設計，讓我們可以更安全、也更有彈性地演進 Tor 的功能。

    Arti 目前仍在積極開發中：在用戶端場景，它已經可以支援相當多的實際使用情境；而在中繼（relay）與洋蔥服務（onion services）等領域，也持續投入資源、循序漸進地擴展能力。如果你想進一步了解 Arti 的設計目標與最新進度，建議可以參考 Arti 的官方網站與原始碼儲存庫：

    - [Arti 官方網站與總覽](https://arti.torproject.org/){target="_blank"}
    - [Arti 原始碼儲存庫（GitLab）](https://gitlab.torproject.org/tpo/core/arti/){target="_blank"}

!!! info "參考資料"

    本篇整理自 Tor Project 官方公告 [Arti 2.2.0 released: HTTP CONNECT, RPC, and Relay development.](https://blog.torproject.org/arti_2_2_0_released/){target="_blank"}。
