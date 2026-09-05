---
title: Tails 更新日誌
description: Tails 作業系統各版本更新的中文重點整理，從上游 release notes 翻譯而成，方便台灣與華語讀者快速掌握每次發布的關鍵變更、安全修補與 Tor 連線改善。
icon: material/usb-flash-drive-outline
---

# :material-usb-flash-drive-outline: Tails 更新日誌

[Tails](../tools/what-is-tails.md) 作業系統的版本發布整理，從上游 release notes 條列摘譯。新版本永遠在最上面。

## 急迫程度怎麼判斷

- <span class="urg-tag urg-tag--now">立刻</span>Tails 官方發出的緊急安全釋出，版本號帶第三碼（例如 7.10.1）。上游判斷不能等到下次排程，代表漏洞後果嚴重。
- <span class="urg-tag urg-tag--soon">儘快</span>例行排程版本，但修補涵蓋核心提權（程式取得系統最高權限）、沙箱逃逸（程式突破隔離環境，碰到系統其他部分）或 Tor Browser 的重要安全更新。
- <span class="urg-tag urg-tag--routine">一般</span>其餘例行版本，以功能與硬體支援為主。

Tails 上的漏洞後果跟一般作業系統不同。取得管理員權限等於失去匿名保護，攻擊者看得到你在 Tails 裡做的每一件事，所以這一頁的「立刻」比其他頁更值得當真。

這一頁的「立刻」依據的是官方的發布形式，不是已經有人在攻擊。多數條目會明寫「目前尚未發現實際被利用案例」，那不代表可以拖：官方判斷嚴重到不能等下次排程，才會單獨發一個緊急版本。iOS 與 Windows 那幾頁的「立刻」需要實際被利用的證據，門檻的基礎跟這裡不同。

Tails 官方只區分緊急釋出與排程釋出，中間那一層是社群志工讀完公告後補的判斷。判斷不確定時以較高一級為準。

## Tails 7.12

> 2026-09-03 · [上游公告](https://tails.net/news/version_7.12/){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>例行排程版本，非緊急安全釋出。公告沒有列出這一版修掉的漏洞，上游也沒有提到已被實際利用。
- Firefox 從 2026 年 9 月起改為兩週發布一次，Tor Browser 與 Tails 跟著改，7.12 是新節奏的第一版。往後的版本會來得更密，自動升級的提示也會更常出現。
- Tor Browser 升至 15.0.21，該版帶有從 Firefox 155 backport 的安全修補。
- Electrum 從 4.7.2 升至 4.8.1。
- 更新部分 firmware 套件，改善較新硬體的支援，包含顯示卡、Wi-Fi 等。
- 可從 Tails 7.0 以後版本自動升級。全新安裝會清除既有的 Persistent Storage。

## Tails 7.11

> 2026-08-19 · [上游公告](https://tails.net/news/version_7.11/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>例行排程版本，同時帶入 Linux 核心的安全更新。上游沒有提到這些漏洞有實際攻擊案例。
- Tor Browser 升至 15.0.20（基於 Firefox ESR 140.14）。
- 核心升至 6.12.101，涵蓋 Debian 安全公告 DSA-6415-1 的 28 個漏洞，影響包含提權、阻斷服務與資訊外洩。這一則以下的細節取自 Debian 的安全公告與 Tails 的原始碼倉庫，Tails 官方公告本身只寫了 Tor Browser 升級與 Persistent Storage 修正兩項。
- 修正部分電腦上 Persistent Storage 無法解鎖的問題。啟用流程原本會等待 `udevadm settle`，無關的硬體問題會讓這一步逾時或失敗，現已不再等待。
- 新增核心參數 `proc_mem.force_override=ptrace`，阻擋行程直接改寫自己的記憶體映射，提高提權漏洞的利用難度。
- 抗審查連線設定改為自動從 Tor Browser 匯入 Moat fronts 與 reflectors，減少因設定過期而連不上的情況。
- flatpak 套件跟進 Debian 安全更新，改以 1.16.6-1~deb13u2 為基礎。
- 可從 Tails 7.0 以後版本自動升級，若自動升級失敗可改用手動升級。全新安裝會清除既有的 Persistent Storage。

## Tails 7.10.1

> 2026-08-05 · [上游公告](https://tails.net/news/version_7.10.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>緊急安全更新，修補 Linux 核心與 expat XML 函式庫的重大漏洞。
- 核心升至 6.12.100，修補 CVE-2026-64560。此漏洞可讓 Tails 內的 Tor Browser 取得管理員權限，造訪的惡意網站若成功利用，可能完整接管 Tails 並進行去匿名化。攻擊難度高，具備政府或商業駭客團隊等級的資源才辦得到，目前尚未發現實際被利用案例。
- expat XML 函式庫升至 2.8.2，修補 DSA-6404-1 這組漏洞。使用 expat 的應用程式（LibreOffice、Audacity、Git 等）被誘導開啟惡意檔案時，可能被用來取得管理員權限，後續同樣可能導致接管與去匿名化。目前尚未發現實際被利用案例。
- 移除未使用的 firmware，USB image 與自動升級檔各縮小 70 MB。
- 自動升級改用 zstd 壓縮加快啟動，與 Tails 7.0 起 USB image 的做法一致。
- 此版為安全專用釋出，沿用 7.10 的軟體組合。可從 Tails 7.0 以後版本自動升級。

## Tails 7.10

> 2026-07-23 · [上游公告](https://tails.net/news/version_7.10/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>例行排程版本，帶來新的關機流程與影片播放器。上游沒有提到這些變更牽涉實際攻擊案例。
- 改用 GNOME 標準關機流程。關機前會提醒尚未儲存的文件與開啟中的應用程式，並在 60 秒後自動關機。速度略慢，換來更好的資料保護。緊急關機選項仍保留，供需要快速斷電時使用。
- 影片播放器改用 Celluloid，更現代也更可靠，且不具網路存取權限。要線上看影片請改用 Tor Browser，或額外安裝 VLC。此播放器不支援 2011 年（含）以前製造的電腦。
- Tor Browser 升至 15.0.19。
- 更新部分 firmware，改善顯示卡、Wi-Fi 等較新硬體的支援。
- 可從 Tails 7.0 以後版本自動升級，若自動升級失敗可改用手動升級。全新安裝會清除既有的 Persistent Storage。

## Tails 7.9.1

> 2026-07-01 · [上游公告](https://tails.net/news/version_7.9.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>緊急安全更新，修補 Linux 核心兩個本機提權漏洞。
- 修補 CVE-2026-43503（DirtyClone）與 CVE-2026-46331（PACKET_EDIT_MEME），核心升至 6.12.94。此類漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。目前尚未發現實際被利用案例。
- Tor Browser 升至 15.0.17。
- Tor 用戶端升至 0.4.9.11。
- 此版為安全專用釋出，除 Tor Browser、核心與 Tor 用戶端外沿用 7.9 的軟體組合。可從 Tails 7.0 以後版本自動升級。

## Tails 7.9

> 2026-06-18 · [上游公告](https://tails.net/news/version_7.9/){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>例行排程版本，非緊急安全釋出。上游沒有提到有實際攻擊案例，這一版本身也不是安全釋出。
- Tor Browser 升至 15.0.16。
- 更新部分 firmware 套件，改善較新硬體的支援，包含顯示卡、Wi-Fi 等。
- 修正在 Secure Boot 憑證已是最新的少數情境下，仍誤跳「憑證過期」通知的問題。
- 未變動 Linux 核心、Thunderbird 與 Debian 底層，沿用 7.8 的軟體組合。可從 Tails 7.0 以後版本自動升級。

## Tails 7.8.1

> 2026-06-04 · [上游公告](https://tails.net/news/version_7.8.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>緊急安全更新，修補 Linux 核心重大漏洞與 Tor 用戶端的多個安全漏洞。
- 修補 Linux 核心漏洞 CVE-2026-43503（核心升至 6.12.90-2），此漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。目前尚未發現實際被利用案例。
- Tor 用戶端升至 0.4.9.9，修補多個安全漏洞。
- 此版為安全專用的緊急釋出，未變動 Tor Browser、Thunderbird 與 Debian 底層版本，沿用 7.8 的軟體組合。可從 Tails 7.0 以後版本自動升級。

## Tails 7.8

> 2026-05-21 · [上游公告](https://tails.net/news/version_7.8/){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>Tor Browser 升至 15.0.14（基於 Firefox ESR 140.11）。上游沒有提到這些漏洞有實際攻擊案例。
- 修補 Linux 核心本機提權漏洞「Fragnesia」（同步緩解「Dirty Frag」）。此類漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。
- 修補 Flatpak 透過 Yelp 逃逸沙箱的問題，yelp 升至 42.2-4tails1。
- 修補 CVE-2026-46529（evince）、CVE-2026-41989（libgcrypt20）、CVE-2026-41054（haveged）。
- 移除內建 Thunderbird。仍可透過 Persistent Storage 的 additional software 自動安裝，每次啟動 Tails 時拉取 Debian 倉庫的最新版本。原因是 Tails 釋出節奏跟著 Firefox，Debian 的 Thunderbird 新版通常稍晚才到，過去導致 Tails 內建版本常帶已知漏洞。
- 底層升級至 Debian Trixie 13.5。
- Secure Boot CA 升級通知改為只在 Secure Boot 已啟用時才顯示，避免在停用情境下出現混淆訊息。
- WhisperBack 錯誤回報加入已安裝的 Flatpak 應用程式與 runtimes 清單。

## Tails 7.7.3

> 2026-05-12 · [上游公告](https://tails.net/news/version_7.7.3/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>緊急安全更新，修補 Linux 核心與 Tor 相關元件的重大漏洞。
- 修補 Linux 核心漏洞「Dirty Frag」（核心升至 6.12.86），此漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。目前尚未發現實際被利用案例。
- Tor Browser 升至 15.0.12。
- Tor 用戶端升至 0.4.9.8。
- Thunderbird 升至 140.10.1。

## Tails 7.7.2

> 2026-05-04 · [上游公告](https://tails.net/news/version_7.7.2/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>緊急安全更新，修補 Linux 核心漏洞「Copy Fail」（核心升至 6.12.85）。
- 此漏洞可讓 Tails 內的應用程式取得管理員權限，配合其他未知漏洞可能被用於完整接管 Tails 並進行去匿名化。目前尚未發現實際被利用案例。

## Tails 7.7.1

> 2026-04-30 · [上游公告](https://tails.net/news/version_7.7.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>緊急安全更新，修補 Tor Browser 多個漏洞。上游明說目前尚未發現這些漏洞被實際利用。
- Tor Browser 升至 15.0.11，修補 Firefox 140.10.1 多個漏洞。
- Thunderbird 升至 140.10.0。
- 停止支援以 ISO 映像從 USB 隨身碟開機，ISO 映像僅供 DVD 與虛擬機使用，USB 隨身碟請改用 USB image（自 2019 年起為推薦做法）。
