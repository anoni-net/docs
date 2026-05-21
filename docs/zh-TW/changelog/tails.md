---
title: Tails 更新日誌
description: Tails 作業系統各版本更新的中文重點整理，從上游 release notes 翻譯而成，方便台灣與華語讀者快速掌握每次發布的關鍵變更、安全修補與 Tor 連線改善。
icon: material/usb-flash-drive-outline
---

# :material-usb-flash-drive-outline: Tails 更新日誌

[Tails](../tools/what-is-tails.md) 作業系統的版本發布整理，從上游 release notes 條列摘譯。新版本永遠在最上面。

## Tails 7.8

> 2026-05-21 · [上游公告](https://tails.net/news/version_7.8/){target="_blank"}

- Tor Browser 升至 15.0.14（基於 Firefox ESR 140.11）。
- 修補 Linux 核心本機提權漏洞「Fragnesia」（同步緩解「Drity Frag」）。此類漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。
- 修補 Flatpak 透過 Yelp 逃逸 sandbox 的問題，yelp 升至 42.2-4tails1。
- 修補 CVE-2026-46529（evince）、CVE-2026-41989（libgcrypt20）、CVE-2026-41054（haveged）。
- 移除內建 Thunderbird。仍可透過 Persistent Storage 的 additional software 自動安裝，每次啟動 Tails 時拉取 Debian 倉庫的最新版本。原因是 Tails 釋出節奏跟著 Firefox，Debian 的 Thunderbird 新版通常稍晚才到，過去導致 Tails 內建版本常帶已知漏洞。
- 底層升級至 Debian Trixie 13.5。
- Secure Boot CA 升級通知改為只在 Secure Boot 已啟用時才顯示，避免在停用情境下出現混淆訊息。
- WhisperBack 錯誤回報加入已安裝的 Flatpak 應用程式與 runtimes 清單。

## Tails 7.7.3

> 2026-05-12 · [上游公告](https://tails.net/news/version_7.7.3/){target="_blank"}

- 緊急安全更新，修補 Linux 核心與 Tor 相關元件的重大漏洞。
- 修補 Linux 核心漏洞「Dirty Frag」（核心升至 6.12.86），此漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。目前尚未發現實際被利用案例。
- Tor Browser 升至 15.0.12。
- Tor 用戶端升至 0.4.9.8。
- Thunderbird 升至 140.10.1。

## Tails 7.7.2

> 2026-05-04 · [上游公告](https://tails.net/news/version_7.7.2/){target="_blank"}

- 緊急安全更新，修補 Linux 核心漏洞「Copy Fail」（核心升至 6.12.85）。
- 此漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。目前尚未發現實際被利用案例。

## Tails 7.7.1

> 2026-04-30 · [上游公告](https://tails.net/news/version_7.7.1/){target="_blank"}

- 緊急安全更新，修補 Tor Browser 多個漏洞。
- Tor Browser 升至 15.0.11，修補 Firefox 140.10.1 多個漏洞。
- Thunderbird 升至 140.10.0。
- 停止支援以 ISO 映像從 USB 隨身碟開機，ISO 映像僅供 DVD 與虛擬機使用，USB 隨身碟請改用 USB image（自 2019 年起為推薦做法）。
