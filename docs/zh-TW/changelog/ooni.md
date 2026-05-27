---
title: OONI 更新日誌
description: OONI Probe 跨平台應用各版本更新的中文重點整理，從上游 release notes 翻譯而成，方便台灣讀者掌握網路審查觀測工具的關鍵變更與新功能。
icon: material/access-point-network
---

# :material-access-point-network: OONI 更新日誌

[OONI Probe](../tools/what-is-ooni.md) 跨平台應用（Windows、macOS、Linux、Android、iOS）的版本發布整理，從上游 release notes 條列摘譯。新版本永遠在最上面。

## OONI Probe 6.0.2

> 2026-05-25 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.0.2){target="_blank"}

- 量測引擎維持使用 OONI Probe CLI v3.29.0。
- 錯誤量測結果頁面 UI 改版，閱讀更順。
- 翻譯更新：日文、希臘文、葡萄牙文、德文、中文。
- Android、桌面（macOS、Linux、Windows）與 iOS 平台導入 secure storage 機制。
- 桌面版新增 Windows Store 發行通道，並重構桌面發行通道架構。
- 桌面版 tray menu 新增 Force Quit 選項（按住 Alt 顯示）。
- 桌面資料庫啟用 WAL 模式，I/O 表現更穩定。
- Java 升級至 25，依賴項目（Kotlin、Ktor、Sentry SDK、Compose）同步更新。
- 多項 bug 修正與穩定性提升。

## OONI Probe 6.0.1

> 2026-03-10 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.0.1){target="_blank"}

- 量測引擎使用 OONI Probe CLI v3.29.0。
- 修正 auto-run 失效導致 OONI 測試無法自動執行的問題。

## OONI Probe 6.0.0

> 2026-03-09 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.0.0){target="_blank"}

- 新一代跨平台 OONI Probe 正式版，同一個 codebase 涵蓋 Windows、macOS、Linux、Android、iOS。
- 量測引擎更新至 OONI Probe CLI v3.29.0。
- 全新儀表板：顯示量測統計與 OONI 公告。
- 測試畫面新增搜尋功能。
- 量測結果可依「執行批次」聚合檢視。
- IP geolocation 資料庫支援自動更新。

## OONI Probe 5.3.0

> 2025-11-25 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v5.3.0){target="_blank"}

- 量測引擎更新至 OONI Probe CLI v3.28.0。
- OONI Run Links 的可用性改善。
- 各項小幅 bug 修正與優化。
