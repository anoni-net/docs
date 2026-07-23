---
title: Tails 更新日誌
description: Tails 作業系統各版本更新的中文重點整理，從上游 release notes 翻譯而成，方便台灣與華語讀者快速掌握每次發布的關鍵變更、安全修補與 Tor 連線改善。
icon: material/usb-flash-drive-outline
---

# :material-usb-flash-drive-outline: Tails 更新日誌

[Tails](../tools/what-is-tails.md) 作業系統的版本發布整理，從上游 release notes 條列摘譯。新版本永遠在最上面。

## Tails 7.10

> 2026-07-23 · [上游公告](https://tails.net/news/version_7.10/){target="_blank"}

- 例行排程版本，帶來新的關機流程與影片播放器。
- 改用 GNOME 標準關機流程。關機前會提醒尚未儲存的文件與開啟中的應用程式，並在 60 秒後自動關機。速度略慢，換來更好的資料保護。緊急關機選項仍保留，供需要快速斷電時使用。
- 影片播放器改用 Celluloid，更現代也更可靠，且不具網路存取權限。要線上看影片請改用 Tor Browser，或額外安裝 VLC。此播放器不支援 2011 年（含）以前製造的電腦。
- Tor Browser 升至 15.0.19。
- 更新部分 firmware，改善顯示卡、Wi-Fi 等較新硬體的支援。
- 可從 Tails 7.0 以後版本自動升級，若自動升級失敗可改用手動升級。全新安裝會清除既有的 Persistent Storage。

## Tails 7.9.1

> 2026-07-01 · [上游公告](https://tails.net/news/version_7.9.1/){target="_blank"}

- 緊急安全更新，修補 Linux 核心兩個本機提權漏洞。
- 修補 CVE-2026-43503（DirtyClone）與 CVE-2026-46331（PACKET_EDIT_MEME），核心升至 6.12.94。此類漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。目前尚未發現實際被利用案例。
- Tor Browser 升至 15.0.17。
- Tor 用戶端升至 0.4.9.11。
- 此版為安全專用釋出，除 Tor Browser、核心與 Tor 用戶端外沿用 7.9 的軟體組合。可從 Tails 7.0 以後版本自動升級。

## Tails 7.9

> 2026-06-18 · [上游公告](https://tails.net/news/version_7.9/){target="_blank"}

- 例行排程版本，非緊急安全釋出。
- Tor Browser 升至 15.0.16。
- 更新部分 firmware 套件，改善較新硬體的支援，包含顯示卡、Wi-Fi 等。
- 修正在 Secure Boot 憑證其實已是最新的少數情境下，仍誤跳「憑證過期」通知的問題。
- 未變動 Linux 核心、Thunderbird 與 Debian 底層，沿用 7.8 的軟體組合。可從 Tails 7.0 以後版本自動升級。

## Tails 7.8.1

> 2026-06-04 · [上游公告](https://tails.net/news/version_7.8.1/){target="_blank"}

- 緊急安全更新，修補 Linux 核心重大漏洞與 Tor 用戶端的多個安全漏洞。
- 修補 Linux 核心漏洞 CVE-2026-43503（核心升至 6.12.90-2），此漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。目前尚未發現實際被利用案例。
- Tor 用戶端升至 0.4.9.9，修補多個安全漏洞。
- 此版為安全專用的緊急釋出，未變動 Tor Browser、Thunderbird 與 Debian 底層版本，沿用 7.8 的軟體組合。可從 Tails 7.0 以後版本自動升級。

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
