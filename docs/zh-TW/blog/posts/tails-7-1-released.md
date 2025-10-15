---
date: 2025-10-15
authors:
    - toomore
categories:
    - 更新
    - Tails
slug: tails-7-1-released
image: "assets/images/tails.png"
summary: "Tails 7.1 更新 Snowflake 連接效率與 OpenSSL 安全性更新"
description: "Tails 7.1 更新 Snowflake 連接效率與 OpenSSL 安全性更新"
---

# Tails 7.1 發佈與說明

![Tails](./assets/images/tails.png){style="border-radius: 10px;"}

## 更新訊息

- 在 Tails 的 Tor 瀏覽器中，將首頁更改為一個離線頁面，這個頁面應該和 Tails 之外的 Tor 瀏覽器首頁非常相似，而不是使用[Tails 網站頁面](https://tails.net/home/){target="_blank"}。
      - ![](https://tails.net/news/version_7.1/about_tor.png)
- 改進顯示的訊息：當需要管理密碼來開啟應用程式，但在歡迎畫面中未設置管理密碼時，。
      - ![](https://tails.net/news/version_7.1/authentication_required.png)
- 更新 Tor 瀏覽器至 [14.5.8](https://blog.torproject.org/new-release-tor-browser-1458){target="_blank"}。
- 更新 Tor 用戶端至 0.4.8.19。
- 更新 Thunderbird 至 [140.3.0](https://www.thunderbird.net/en-US/thunderbird/140.3.0esr/releasenotes/){target="_blank"}。
- 移除 `ifupdown` 套件。

<!-- more -->

## 已修正

- 隱藏 Tor 瀏覽器新分頁中的訊息「您的 Tor 連線不是由 Tor 瀏覽器管理的」。（#21215）
      - ![](https://tails.net/news/version_7.1/not_managed.png)
- 了解更多詳情，請參閱[變更記錄](https://gitlab.tails.boum.org/tails/tails/-/blob/master/debian/changelog){target="_blank"}。

!!! info ""

    以下翻譯自 [Tails 7.1 Drops Browser Home Phoning, Updates Tor Stack](https://www.sambent.com/tails-7-1-drops-browser-home-phoning-updates-tor-stack/), Sam Bent 的文章。

Tails 7.1 於 2025 年 10 月 14 日發佈，搭載 Tor 瀏覽器 14.5.8、Tor 客戶端 0.4.8.19 和 Thunderbird 140.3.0。這款專注於隱私的作業系統也取消了啟動時不必要的網路請求，透過將 Tor 瀏覽器的首頁更換為離線版本來達成。（這個請求存在的原因是什麼呢？）

這項更動非常重要，因為每個遠端連線都會產生後設資料（metadata）。過去，Tails 在啟動 Tor 瀏覽器時會載入遠端首頁，傳輸時間資料並有可能洩露系統狀態的資訊。現在，它開啟的是 `about:tor`，這是一個沒有外部請求的自訂本地頁面，讓瀏覽器啟動時保持安靜。

Tor 瀏覽器 14.5.8 於 2025 年 10 月 7 日推出，帶來了從 Firefox 144、OpenSSL 3.5.4 和 Tor 0.4.8.19 回溯的安全修補程式。這次瀏覽器更新修復了在最安全的安全層級運行時 DuckDuckGo 的顯示問題，並修正了安全設定中的錯字。Mozilla 的瀏覽器核心不斷累積需要回溯的漏洞，必須持續回溯修補至加強版 Tor 瀏覽器 ESR 分支。

![](https://tails.net/news/version_7.1/not_managed.png)

Tor 用戶端更新至 0.4.8.19，更新了 [Snowflake](../../tor-snowflake.md){target="_blank"} 橋接更新方式。Snowflake 允許身處被封鎖地區的 Tor 使用者透過運行在其他人瀏覽器中的短暫代理來進行路由。這次橋接更新讓繞過封鎖的基礎設施保持最新，因為審查機構會封鎖過時的進入點。

Tails 7.1 解決了問題 [#21215](https://gitlab.tails.boum.org/tails/tails/-/issues/21215){target="_blank"}，也就是在新分頁出現的「您的 Tor 連線不是由 Tor 瀏覽器管理的」訊息。這個令人困惑的通知在系統運作正常時會讓人誤以為出現了問題。在 7.1 中，這個訊息被移除，讓使用者不必要的焦慮消失。

Thunderbird 更新至 [140.3.0 ESR](https://www.thunderbird.net/en-US/thunderbird/releases/){target="_blank"}，此版本修正了新增帳號時凍結、Windows 通知失效、IMAP 附件刪除問題、草稿覆寫、從版本 128 至 140 遷移後的隱藏選單列，以及多種崩潰情況。電子郵件仍然是相關性攻擊的主要途徑之一，因此客戶端的穩定性對於操作安全非常重要。如果電子郵件客戶端崩潰，使用者可能會被迫使用瀏覽器型替代方案，而這些方案會洩漏更多的後設資料。

![](https://tails.net/news/version_7.1/authentication_required.png)

2025 年 10 月 13 日的變更記錄中，記載了移除 `ifupdown` 這個舊版網路配置套件，取而代之的是現代化的替代方案。系統也改進了管理密碼說明訊息，解決了另一個使用者經驗的混淆點，讓使用者更容易理解為什麼會突然出現身份驗證的要求。

動態語系切換現在運作正常，可以根據系統設定自動調整語言，而不是需要手動配置或重新啟動。對於在多語言環境中操作的使用者，這減少了切換身份的困擾。雖然語系洩漏仍然是一個進行指紋識別的途徑，但強迫使用者在語言變更時重新啟動，其實會降低操作安全，因為這可能讓他們跳過這項保護。

OpenSSL 3.5.4 修補了這個加密庫中的漏洞，這是 Tails 安全基礎架構的核心部分。即使在使用 Tor 時，若 SSL/TLS 驗證出問題，仍會使中間人攻擊成為可能。這次更新透過 Tor 瀏覽器套件提供，但由於 Tails 遍及各組件共用 OpenSSL，因此影響到系統範圍內的加密操作。

Tor 瀏覽器的建構符合 14.5.8 版的發行說明。

![](https://tails.net/news/version_7.1/about_tor.png)

Tails 7.1 的使用者從版本 7.0 自動升級時，會保留持久儲存區。不過，若手動從 USB 或 ISO 重新安裝，則會刪除現有的資料。該專案提供了針對 Windows、macOS 和 Linux 的安裝指南，但也警告使用者，如果選擇重新安裝而非升級，將會摧毀持久儲存，這依然是讓使用者混淆的一個持續問題，因為他們可能會不小心刪除儲存的數據。

Firefox 144 的安全回溯值得多加注意。Mozilla 不斷修補瀏覽器的漏洞，但 Tor 瀏覽器所基於的 ESR 分支相對於快速發布版有所落後。Tor 瀏覽器 14.5.8 宣稱已經回溯了 Firefox 144 的修補程式，但截至 2025 年 10 月 7 日，Firefox 144 並未正式發布。這要麼是指 Mozilla 內部開發版本的號碼，要麼是文件中存在錯誤。

OpenSSL 更新修正了在 OpenSSL [安全公告](https://www.openssl.org/news/vulnerabilities.html){target="_blank"}中詳細列出的特定 CVE，但 Tails 的發行記錄中並未列出 3.5.4 解決了哪些漏洞。仰賴此作業系統維持生死攸關匿名性的使用者值得知道具體的 CVE 列表，而不是「安全更新」這種可能意味著任何事情的模糊語言，從遠端代碼執行到輕微的訊息泄露都可能囊括其中。

![](https://www.sambent.com/content/images/2025/10/image-95.png)

[Snowflake](../../tor-snowflake.md){target="_blank"} 橋接更新的重要性超過大多數使用者的認識。當審查基礎設施封鎖 Tor 入口節點時，Snowflake 透過不斷輪換的瀏覽器代理提供替代入口。然而，Snowflake 的效能取決於更新的橋接資訊。過時的橋接清單意味著受審查地區的使用者無法順利連接。Tor 0.4.8.19 的更新保持了這套基礎設施的運作。

被移除的 `ifupdown` 套件代表著舊的 Debian 網路工具，這些工具大部分已被 `NetworkManager` 和 `systemd-networkd` 取代。它的存在可能會產生衝突及增加攻擊面，且多數使用者不需要這些功能。Tails 遷移到現代化的網路管理系統可降低程式碼的複雜度，並消除已知有安全問題的舊工具。

Tails 繼續採用逐步的安全更新模式，而不是革命性的變革。版本 7.1 修補漏洞，更新組件，並修正了使用者體驗上的令人困擾之處。離線瀏覽器首頁突顯了唯一能減少後設資料洩漏的更動。其他的則是在不斷變化的威脅環境中維持基本的安全性。

Tor 瀏覽器 14.5.8 於 10 月 7 日釋出，而 Tails 7.1 於 10 月 14 日發布，顯示出一個七天的整合與測試緩衝期。這個延遲是合理的，因為 Tails 必須確認瀏覽器的更動不會破壞遺忘功能或洩露身份訊息。但這也意味著 Tails 使用者在 Tor 瀏覽器的安全性修補上落後一週。

使用者應立即從 Tails 7.0 升級，透過自動更新器來保留持久儲存區並獲得安全修補。手動安裝只適合於新部署或系統損壞的情況。發布公告中包含了下載映像的驗證指引，包括 GPG 簽名和校驗碼。

這次更新著重於維護，而非創新（這並不是壞事）。離線首頁確實很重要，而其他更動則保持系統的現代化。若你現在使用 Tails 7.0，請立即更新。若使用更舊的版本，自動更新功能只適用於從 7.0 開始，這需要手動安裝，並將摧毀持久性資料。請先備份你的持久儲存區。
