---
date: 2025-08-29
authors:
    - toomore
categories:
    - 更新
    - Tails
slug: tails-7-rc
image: "assets/images/tails.png"
summary: "Tails 7.0 預計在 9/18 或 10/16 釋出，目前已發布第二個最終測試版本（RC）邀請大家協助測試"
description: "Tails 7.0 預計在 9/18 或 10/16 釋出，目前已發布第二個最終測試版本（RC）邀請大家協助測試"
---

# Tails 7.0 發佈第二個最終測試版本（7.0~rc2）

![Tails](./assets/images/tails.png){style="border-radius: 10px;"}

Tails 7.0~rc2 是即將推出 Tails 7.0 的第二個候選版本。計畫在 9 月 18 日或 10 月 16 日正式發布 Tails 7.0。您可以幫助 Tails 團隊提前測試這個候選版本。Tails 7.0 將是第一個基於 [Debian 13（Trixie）](https://www.debian.org/releases/trixie/release-notes/){target="_blank"}和 [GNOME 48](https://release.gnome.org/48/){target="_blank"} 的版本，會帶來許多應用程式的新版本。

Tails 團隊已經用與正式版本一樣詳盡的自動與手動測試流程檢測過 7.0~rc2。但 Tails 7.0~rc2 可能依然存在尚未發現的問題。與其他正式版本一樣，Tails 團隊會為 Tails 7.0~rc2 提供自動安全升級。

## 變更與更新

- 用 [GNOME Console](https://apps.gnome.org/Console/){target="_blank"} 取代 [GNOME Terminal](https://gitlab.gnome.org/GNOME/gnome-terminal){target="_blank"}。（[#20161](https://gitlab.tails.boum.org/tails/tails/-/issues/20161){target="_blank"}）
      - 我們在進行此更改時破壞了 Root 終端。若要開啟 Root 終端，請在一般 Console 中執行以下命令。
      - > sudo -i
- 用 [GNOME Loupe](https://apps.gnome.org/Loupe/){target="_blank"} 取代 [GNOME Image Viewer](https://wiki.gnome.org/Apps/EyeOfGnome){target="_blank"}（[#20640](https://gitlab.tails.boum.org/tails/tails/-/issues/20640){target="_blank"}）。
- 從「收藏」選單中移除 Kleopatra。（[#21072](https://gitlab.tails.boum.org/tails/tails/-/issues/21072){target="_blank"}）
- 若要啟動 Kleopatra，請選擇**應用程式 ▸ 附件 ▸ Kleopatra**。
- 從歡迎畫面中移除過時的網路連線選項。（[#21074](https://gitlab.tails.boum.org/tails/tails/-/issues/21074){target="_blank"}）

### 7.0~rc2 相較 7.0~rc1 的變更

- 將記憶體需求從 2 GB RAM 提高到 3 GB。（#21114）
      - ![當 RAM 不足時，Tails 7.0~rc2 會顯示通知。](https://tails.net/news/test_7.0-rc2/ram.png)
      - 當 RAM 不足時，Tails 7.0~rc2 會顯示通知。
      - 我們估計影響不到 2% 的現有使用者。
- 移除 **位置**（Places）選單。（#21086）
- 將 _Root Terminal_ 改名為 _Root Console_。（#21110）
- 跳過 _Inkscape_ 的導覽畫面。（#21091）

### 內建軟體

- 更新 Tor 用戶端至 0.4.8.17。
- 更新 Thunderbird 至 [128.13.0esr](https://www.thunderbird.net/en-US/thunderbird/128.13.0esr/releasenotes/){target="_blank"}。
- 更新 Linux 核心至 6.12.38。
      - 改善對新硬體的支援，包括顯示卡、Wi-Fi 等等。
- 將 Electrum 從 4.3.4 更新至 4.5.8。
- 將 OnionShare 從 2.6.2 更新至 2.6.3。
- 將 KeePassXC 從 2.7.4 更新至 2.7.10。
- 將 Kleopatra 從 4:22.12 更新至 4:24.12。
- 將 Inkscape 從 1.2.2 更新至 1.4。
- 將 GIMP 從 2.10.34 更新至 3.0.4。
- 將 Audacity 從 3.2.4 更新至 3.7.3。
- 將文字編輯從 43.2 更新至 48.3。
- 將文件掃描從 42.5 更新至 46.0。

### 移除的軟體

- 移除 `unar`。（[#20946](https://gitlab.tails.boum.org/tails/tails/-/issues/20946){target="_blank"}）
- 移除 `aircrack-ng`。（[#21044](https://gitlab.tails.boum.org/tails/tails/-/issues/21044){target="_blank"}）
- 移除 `sq`。（[#21042](https://gitlab.tails.boum.org/tails/tails/-/issues/21042){target="_blank"}）

### 問題修正

- 修正選擇某些語言時鍵盤對應錯誤的問題。（[#12638](https://gitlab.tails.boum.org/tails/tails/-/issues/12638){target="_blank"}）

欲知詳情，請參閱 GitLab 上 7.0 里程碑的[已解決問題列表](https://gitlab.tails.boum.org/tails/tails/-/issues/?milestone_title=Tails_7.0&state=closed){target="_blank"}。

### 已知問題

- Tails 7.0~rc2 需要 3 GB 的 RAM 才能順暢運行，而不是之前的 2 GB。（[#18040](https://gitlab.tails.boum.org/tails/tails/-/issues/18040){target="_blank"}）
      - 我們估計影響不到 2% 的現有使用者。
- Tails 7.0~rc2 啟動時間較長。
      - 我們計劃在 Tails 7.0 最終版中修正這個問題。

欲了解更多詳情，請參閱 GitLab 上 7.0 里程碑的[問題列表](https://gitlab.tails.boum.org/groups/tails/-/milestones/144#tab-issues){target="_blank"}。

## 您的意見回饋

如果發現任何新問題，請報告至以下任一管道：

- <tails-testers@boum.org>（公開郵件群組）
- <support@tails.net>（協助信箱）

## 取得 Tails 7.0~rc2

### 直接下載

- 用於 USB 隨身碟（[USB 映像檔](https://download.tails.net/tails/alpha/tails-amd64-7.0~rc2/tails-amd64-7.0~rc2.img){target="_blank"}）[[OpenPGP 簽名](https://tails.net/torrents/files/tails-amd64-7.0~rc2.img.sig){target="_blank"}]
- 用於 DVD 和虛擬機器（[ISO 映像檔](https://download.tails.net/tails/alpha/tails-amd64-7.0~rc2/tails-amd64-7.0~rc2.iso){target="_blank"}）[[OpenPGP 簽名](https://tails.net/torrents/files/tails-amd64-7.0~rc2.iso.sig){target="_blank"}]

### 使用 BitTorrent 下載

- 用於 USB 隨身碟（[USB 映像檔](https://tails.net/torrents/files/tails-amd64-7.0~rc2.img.torrent){target="_blank"}）
- 用於 DVD 和虛擬機器（[ISO 映像檔](https://tails.net/torrents/files/tails-amd64-7.0~rc2.iso.torrent){target="_blank"}）

## 升級您的 Tails USB 隨身碟並保留您的持久儲存

您可以[手動升級](https://tails.net/doc/upgrade/index.en.html#manual){target="_blank"}至 Tails 7.0~rc2。Tails 7.0~rc2 不支援自動升級。

## 為新 USB 隨身碟安裝 Tails 7.0~rc2

請依照我們的安裝說明進行操作：

- [從 Windows 安裝](https://tails.net/install/windows/index.en.html){target="_blank"}
- [從 macOS 安裝](https://tails.net/install/mac/index.en.html){target="_blank"}
- [從 Linux 安裝](https://tails.net/install/linux/index.en.html){target="_blank"}
- [使用命令列和 GnuPG 從 Debian 或 Ubuntu 安裝](https://tails.net/install/expert/index.en.html){target="_blank"}

!!! warning "請使用額外的隨身碟安裝測試"

    如果您選擇安裝而不是升級，USB 隨身碟上的持久儲存將會遺失。

!!! info "參考資料"

    本篇內容參考 Tails 發佈的 [Test 7.0~rc1](https://tails.net/news/test_7.0-rc1/){target="_blank"}、[Test 7.0~rc2](https://tails.net/news/test_7.0-rc2/){target="_blank"}
