---
date: 2025-09-20
authors:
    - toomore
categories:
    - 更新
    - Tails
slug: tails-7-released
image: "assets/images/tails.png"
summary: "Tails 7.0 已發佈是首個基於 Debian 13（代號 Trixie）和 GNOME 48（代號 Bengaluru）的版本"
description: "Tails 7.0 已發佈是首個基於 Debian 13（代號 Trixie）和 GNOME 48（代號 Bengaluru）的版本"
---

# Tails 7.0 發佈

![Tails](./assets/images/tails.png){style="border-radius: 10px;"}

我們非常高興地向您介紹 Tails 7.0，這是首個基於 Debian 13（代號 Trixie）和 GNOME 48（代號 Bengaluru）的 Tails 版本。Tails 7.0 帶來了許多內建應用程式的新版本。

## 追憶

Tails 7.0 獻給 Lunar（1982–2024）的追憶。Lunar 是 Tails 的貢獻者、Tor 的志工、自由軟體黑客以及社群組織者。

在 Tails 的發展歷程中，Lunar 始終與我們並肩作戰。從最初的項目萌芽到最終與 Tor 的合併，他提供了明智的技術建議、富有創意的產品設計點子、外展支持和關懷的組織建議。

除了在 Tor 的貢獻之外，Lunar 還致力於多個非常成功的自由軟體項目，如 [Debian](https://www.debian.org/){target="_blank"} 項目——Tails 所基於的 Linux 發行版，以及協助我們驗證 [Tails 版本完整性](https://tails.net/contribute/build/reproducible/){target="_blank"}的 [Reproducible Builds](https://reproducible-builds.org/){target="_blank"} 項目。

Lunar 的離去，對於我們的社群以及他所參與的其他許多社群都是莫大的損失。

另見其他項目寫給 Lunar 的[紀念文章](https://lunar.anargeek.net/liens/#autres-sites){target="_blank"}。

<!-- more -->

## 變更與更新

### 更快的啟動速度

在大多數電腦上，Tails 7.0 的啟動速度提升了 10 到 15 秒。

我們透過將 Tails USB 和 ISO 映像檔的壓縮算法從 `xz` 改為 `zstd` 來達成這一目標。這樣的改變使映像檔的大小比以前增加了 10%。

在測試這項改變時，我們注意到，使用品質較差的 USB 隨身碟時，Tails 的啟動速度可能比使用品質較好的 USB 隨身碟慢上 20 秒。

若您處於仿冒電子產品普遍存在的地區，我們建議您在國際性的超市連鎖購買 USB 隨身碟，這樣的供應鏈應較具可靠性。

### 內建軟體

* 將 _[GNOME Terminal](https://gitlab.gnome.org/GNOME/gnome-terminal){target="_blank"}_ 替換為 _[GNOME Console](https://apps.gnome.org/Console/){target="_blank"}_。
* 將 _[GNOME Image Viewer](https://wiki.gnome.org/Apps/EyeOfGnome){target="_blank"}_ 替換為 _[GNOME Loupe](https://apps.gnome.org/Loupe/){target="_blank"}_。
* 將 _Tor 瀏覽器_ 更新至 [14.5.7](https://blog.torproject.org/new-release-tor-browser-1457){target="_blank"}。
* 將 _Tor_ 使用端更新至 0.4.8.17。
* 將 _Thunderbird_ 更新至 [128.14.0esr](https://www.thunderbird.net/en-US/thunderbird/128.14.0esr/releasenotes/){target="_blank"}。
* 將 _Electrum_ 從 4.3.4 更新至 [4.5.8](https://github.com/spesmilo/electrum/blob/master/RELEASE-NOTES){target="_blank"}。
* 將 _OnionShare_ 從 2.6.2 更新至 [2.6.3](https://github.com/onionshare/onionshare/blob/main/CHANGELOG.md){target="_blank"}。
* 將 _KeePassXC_ 從 2.7.4 更新至 [2.7.10](https://github.com/keepassxreboot/keepassxc/blob/develop/CHANGELOG.md){target="_blank"}。
* 將 _Kleopatra_ 從 4:22.12 更新至 4:24.12。
* 將 _Inkscape_ 從 1.2.2 更新至 1.4。
* 將 _GIMP_ 從 2.10.34 更新至 [3.0.4](https://www.gimp.org/release-notes/gimp-3.0.html){target="_blank"}。
* 將 _Audacity_ 從 3.2.4 更新至 3.7.3。
* 將 _文字編輯器_ 從 43.2 更新至 48.3。
* 將 _文件掃描器_ 從 42.5 更新至 46.0。

### GNOME 的變更

* 許多 _設定_ 工具中的部分已重新設計，例如 [GNOME 44](https://release.gnome.org/44/){target="_blank"} 中的無障礙功能、音效和滑鼠與鍵盤設定。無障礙設定還包括了新的功能，例如過度放大和始終顯示捲動條。
* 在 [GNOME 45](https://release.gnome.org/45/){target="_blank"} 中，活動按鈕被動態工作區指示器取代。
      * ![活動按鈕被動態工作區指示器取代](https://tails.net/doc/first_steps/desktop/upper-left.png)
* 螢幕閱讀器在多方面得到改進，例如在 [GNOME 46](https://release.gnome.org/46/){target="_blank"} 中提供更佳的表格導航和睡眠模式。
* 在 [GNOME 48](https://release.gnome.org/48/){target="_blank"} 中，電源設定提供了一個新的選項來保持電池健康。

### 移除項目

* 移除 **Places** 選單。您可以從 _檔案_ 瀏覽器的側邊欄中訪問相同的捷徑。
* 從 Favorites 中移除 _Kleopatra_。要啟動 _Kleopatra_，請選擇 **Apps ▸ Accessories ▸ Kleopatra**。
* 移除 `unar`。_檔案解壓縮器_ 工具仍可開啟大部分的 RAR 檔案。
* 移除 `aircrack-ng` 軟體包。您仍可使用[附加軟體功能](https://tails.net/doc/persistent_storage/additional_software/index.en.html){target="_blank"}安裝 `aircrack-ng`。
* 移除 _電源統計_ 工具。
* 移除 `sq` 軟體包。
* 從歡迎畫面中移除已過時的網路連線選項。

### 硬體支援

* 將 _Linux_ 核心更新至 6.12.43。這提升了對新硬體的支援，包括圖形、Wi-Fi 等。
* 記憶體需求從 2 GB 提高到 3 GB。（[#21114](https://gitlab.tails.boum.org/tails/tails/-/issues/21114){target="_blank"}）若未達到記憶體需求，Tails 7.0 會顯示通知。我們估計受影響的使用者不到 2%。
      * ![](https://tails.net/news/test_7.0-rc2/ram.png)

## 問題修正

* 修正某些語言選擇正確鍵盤的問題。（[#12638](https://gitlab.tails.boum.org/tails/tails/-/issues/12638){target="_blank"}）

如需更多詳細資訊，請閱讀我們的[更新日誌](https://gitlab.tails.boum.org/tails/tails/-/blob/master/debian/changelog){target="_blank"}。

## 下載 Tails 7.0

### 升級您的 Tails USB 並保留您的持久儲存空間

* 自動升級僅適用於從 Tails 7.0~rc1 和 7.0~rc2 升級到 7.0。
* 所有其他使用者必須進行[手動升級](https://tails.net/doc/upgrade/index.en.html#manual){target="_blank"}。

### 為新 USB 隨身碟安裝 Tails 7.0

請依照我們的安裝說明進行操作：

- [從 Windows 安裝](https://tails.net/install/windows/index.en.html){target="_blank"}
- [從 macOS 安裝](https://tails.net/install/mac/index.en.html){target="_blank"}
- [從 Linux 安裝](https://tails.net/install/linux/index.en.html){target="_blank"}
- [使用命令列和 GnuPG 從 Debian 或 Ubuntu 安裝](https://tails.net/install/expert/index.en.html){target="_blank"}

!!! warning "請使用額外的隨身碟安裝測試"

    如果您選擇安裝而不是升級，USB 隨身碟上的持久儲存將會遺失。

!!! info "參考資料"

    本篇內容參考 Tails 發佈的 [Tails 7.0](https://tails.net/news/version_7.0/){target="_blank"}、[New Release: Tails 7.0](https://blog.torproject.org/new-release-tails-7_0/){target="_blank"}
