---
title: OONI 更新日誌
description: OONI Probe 跨平台應用各版本更新的中文重點整理，從上游 release notes 翻譯而成，方便台灣讀者掌握網路審查觀測工具的關鍵變更與新功能。
icon: material/access-point-network
---

# :material-access-point-network: OONI 更新日誌

[OONI Probe](../tools/what-is-ooni.md) 跨平台應用（Windows、macOS、Linux、Android、iOS）與底層量測引擎的版本發布整理，從上游 release notes 條列摘譯。新版本永遠在最上面。

App 與引擎的版本號各走各的。跨平台應用是 6.x，量測引擎與命令列工具（OONI Probe CLI）是 3.x，app 內建的就是某一版引擎。做資料分析或自己排量測的人看引擎那幾則，量測行為的變動寫在那裡。

## OONI Probe 6.2.0

> 2026-08-13 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.2.0){target="_blank"}

- 量測引擎升至 OONI Probe CLI v3.30.0，是 6.x 系列首次更動引擎版本，先前各版皆停在 v3.29.0。
- Android 版新增 app 內語言切換，與桌面版在 6.1.1 已有的功能對齊。
- 強化離線處理與重試機制。量測提交遇到無法解析的報告會妥善處理，寫檔改為原子操作。
- 匿名憑證（anonymous credentials）新增管理介面與重設功能。匿名憑證讓提交端證明自己有權提交量測結果，同時不揭露身分。
- Passport 升至 0.1.5，支援 proxy 與逾時設定。
- macOS 與 iOS 的 secure storage 補上錯誤處理與重試機制。
- 新增未讀完成結果的計數查詢索引。
- 依賴項目更新，Kotlin 升至 2.4.10，Android Gradle Plugin 升至 9.1.1。
- 翻譯更新。

## OONI Probe CLI v3.30.0

> 2026-07-27 · [上游發布頁](https://github.com/ooni/probe-cli/releases/tag/v3.30.0){target="_blank"}

- 量測引擎與命令列工具共用同一個版本號，跨平台應用從 6.2.0 起帶的就是這一版。
- 命令列版新增匿名憑證（anonymous credentials）的提交路徑，跟 app 端在 6.1.0 引入的機制對應。
- 移除 `GetFeatureFlag` 裡誤留的除錯輸出。
- Android、iOS 與桌面版的 `pom.xml` 拆開，各平台的發布不再互相牽動。
- 建置工具鏈更新：Go 升至 1.25.3、Android NDK 升到最新穩定版，內建資產升至 probe-assets v0.31。

## OONI Probe 6.1.1

> 2026-07-07 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.1.1){target="_blank"}

- 量測引擎維持使用 OONI Probe CLI v3.29.0。
- 桌面版新增 app 內語言切換，不必再跟著系統語系走。
- Android 版遷移至 AGP 9，並補上 JNA 與 UniFFI 綁定所需的 ProGuard 規則。
- 資料庫改為過濾後才寫入，並為 `Measurement.is_done` 加上索引。
- 修正用量數值在 GB 級距顯示錯誤的問題。
- 翻譯更新：德文、巴西葡萄牙文、歐洲葡萄牙文、土耳其文。

## OONI Probe 6.1.0

> 2026-06-25 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.1.0){target="_blank"}

- 量測引擎維持使用 OONI Probe CLI v3.29.0。
- 新增匿名憑證（anonymous credentials）支援，整合 passport 機制。
- 桌面版新增「開機時啟動」偏好設定。
- macOS 桌面版打包並簽署 JavaFX 原生函式庫，JavaFX 改為桌面發行版的可選元件。
- 桌面版資料庫存取固定在單一專用執行緒，提升穩定性。
- descriptors 畫面新增手動重新整理按鈕。
- 翻譯更新，並升級 Kotlin、Compose 等依賴項目。
- 多項 bug 修正與穩定性提升。

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

## OONI Probe CLI v3.29.1

> 2026-05-12 · [上游發布頁](https://github.com/ooni/probe-cli/releases/tag/v3.29.1){target="_blank"}

- 維護性釋出，上游沒有列出變更項目。跨平台應用 6.0.x 與 6.1.x 帶的都是 v3.29.x 這條線。

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

## OONI Probe CLI v3.29.0

> 2026-02-10 · [上游發布頁](https://github.com/ooni/probe-cli/releases/tag/v3.29.0){target="_blank"}

- 停止支援 psiphon。依照上游的規劃（issue 1761），2026 年 1 月 1 日起 psiphon 通道與 psiphon 實驗都不再運作。做審查觀測資料分析的人要留意，那個測項從此不會有新資料。
- 新增 `userauth` 內部套件，是匿名憑證機制的基礎。匿名憑證讓提交端證明自己有權提交，同時不揭露身分。
- HTTP 回應本文加上讀取上限，避免異常或惡意的回應把記憶體吃光。
- 更新內建憑證與 C 相依。

## OONI Probe 5.3.0

> 2025-11-25 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v5.3.0){target="_blank"}

- 量測引擎更新至 OONI Probe CLI v3.28.0。
- OONI Run Links 的可用性改善。
- 各項小幅 bug 修正與優化。
