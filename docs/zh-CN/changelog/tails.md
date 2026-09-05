---
title: Tails 更新日志
description: Tails 操作系统各版本更新的中文重点整理，从上游 changelog 翻译而成，方便华语读者快速掌握每次发布的关键变更、安全修补与 Tor 连接改善。
icon: material/usb-flash-drive-outline
---

# :material-usb-flash-drive-outline: Tails 更新日志

[Tails](../tools/what-is-tails.md) 操作系统的版本更新整理。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>Tails 官方发出的紧急安全发布，版本号带第三码（例如 7.10.1）。上游判断不能等到下次排程，代表漏洞后果严重。
- <span class="urg-tag urg-tag--soon">尽快</span>例行排程版本，但修补涵盖内核提权（程序取得系统最高权限）、沙盒逃逸（程序突破隔离环境，碰到系统其他部分）或 Tor Browser 的重要安全更新。
- <span class="urg-tag urg-tag--routine">一般</span>其余例行版本，以功能与硬件支持为主。

Tails 上的漏洞后果跟一般操作系统不同。取得管理员权限等于失去匿名保护，攻击者看得到你在 Tails 里做的每一件事，所以这一页的「立刻」比其他页更值得当真。

这一页的「立刻」依据的是官方的发布形式，不是已经有人在攻击。多数条目会写明「目前尚未发现实际被利用案例」，那不代表可以拖：官方判断严重到不能等下次排程，才会单独发一个紧急版本。iOS 与 Windows 那几页的「立刻」需要实际被利用的证据，门槛的基础跟这里不同。

Tails 官方只区分紧急发布与排程发布，中间那一层是社群志愿者读完公告后补的判断。判断不确定时以较高一级为准。

## Tails 7.12

> 2026-09-03 · [上游公告](https://tails.net/news/version_7.12/){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>例行排程版本，非紧急安全发布。公告没有列出这一版修掉的漏洞，上游也没有提到已被实际利用。
- Firefox 从 2026 年 9 月起改为两周发布一次，Tor Browser 与 Tails 跟着改，7.12 是新节奏的第一版。往后的版本会来得更密，自动升级的提示也会更常出现。
- Tor Browser 升至 15.0.21，该版带有从 Firefox 155 backport 的安全修补。
- Electrum 从 4.7.2 升至 4.8.1。
- 更新部分 firmware 套件，改善较新硬件的支持，包含显卡、Wi-Fi 等。
- 可从 Tails 7.0 以后版本自动升级。全新安装会清除既有的 Persistent Storage。

## Tails 7.11

> 2026-08-19 · [上游公告](https://tails.net/news/version_7.11/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>例行排程版本，同时带入 Linux 内核的安全更新。上游没有提到这些漏洞有实际攻击案例。
- Tor Browser 升至 15.0.20（基于 Firefox ESR 140.14）。
- 内核升至 6.12.101，涵盖 Debian 安全公告 DSA-6415-1 的 28 个漏洞，影响包含提权、拒绝服务与信息泄露。这一则以下的细节取自 Debian 的安全公告与 Tails 的源码仓库，Tails 官方公告本身只写了 Tor Browser 升级与 Persistent Storage 修正两项。
- 修正部分电脑上 Persistent Storage 无法解锁的问题。启用流程原本会等待 `udevadm settle`，无关的硬件问题会让这一步超时或失败，现已不再等待。
- 新增内核参数 `proc_mem.force_override=ptrace`，阻挡进程直接改写自己的内存映射，提高提权漏洞的利用难度。
- 抗审查连接设置改为自动从 Tor Browser 导入 Moat fronts 与 reflectors，减少因设置过期而连不上的情况。
- flatpak 软件包跟进 Debian 安全更新，改以 1.16.6-1~deb13u2 为基础。
- 可从 Tails 7.0 以后版本自动升级，若自动升级失败可改用手动升级。全新安装会清除既有的 Persistent Storage。

## Tails 7.10.1

> 2026-08-05 · [上游公告](https://tails.net/news/version_7.10.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>紧急安全更新，修补 Linux 内核与 expat XML 库的重大漏洞。
- 内核升至 6.12.100，修补 CVE-2026-64560。此漏洞可让 Tails 内的 Tor Browser 取得管理员权限，访问的恶意网站若成功利用，可能完整接管 Tails 并进行去匿名化。攻击难度高，具备政府或商业黑客团队等级的资源才办得到，目前尚未发现实际被利用案例。
- expat XML 库升至 2.8.2，修补 DSA-6404-1 这组漏洞。使用 expat 的应用程序（LibreOffice、Audacity、Git 等）被诱导开启恶意文件时，可能被用来取得管理员权限，后续同样可能导致接管与去匿名化。目前尚未发现实际被利用案例。
- 移除未使用的 firmware，USB image 与自动升级文件各缩小 70 MB。
- 自动升级改用 zstd 压缩加快启动，与 Tails 7.0 起 USB image 的做法一致。
- 此版为安全专用发布，沿用 7.10 的软件组合。可从 Tails 7.0 以后版本自动升级。

## Tails 7.10

> 2026-07-23 · [上游公告](https://tails.net/news/version_7.10/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>例行排程版本，带来新的关机流程与视频播放器。上游没有提到这些漏洞有实际攻击案例。
- 改用 GNOME 标准关机流程。关机前会提醒尚未保存的文档与开启中的应用程序，并在 60 秒后自动关机。速度略慢，换来更好的数据保护。紧急关机选项仍保留，供需要快速断电时使用。
- 视频播放器改用 Celluloid，更现代也更可靠，且不具网络访问权限。要在线看视频请改用 Tor Browser，或额外安装 VLC。此播放器不支持 2011 年（含）以前制造的电脑。
- Tor Browser 升至 15.0.19。
- 更新部分 firmware，改善显卡、Wi-Fi 等较新硬件的支持。
- 可从 Tails 7.0 以后版本自动升级，若自动升级失败可改用手动升级。全新安装会清除既有的 Persistent Storage。

## Tails 7.9.1

> 2026-07-01 · [上游公告](https://tails.net/news/version_7.9.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>紧急安全更新，修补 Linux 内核两个本地提权漏洞。
- 修补 CVE-2026-43503（DirtyClone）与 CVE-2026-46331（PACKET_EDIT_MEME），内核升至 6.12.94。此类漏洞可让 Tails 内的应用程序取得管理员权限，配合其他未知漏洞可能被用于完整接管 Tails 并进行去匿名化。目前尚未发现实际被利用案例。
- Tor Browser 升至 15.0.17，Tor 客户端升至 0.4.9.11。
- 此版为安全专用发布，除 Tor Browser、内核与 Tor 客户端外沿用 7.9 的软件组合。可从 Tails 7.0 以后版本自动升级。

## Tails 7.9

> 2026-06-18 · [上游公告](https://tails.net/news/version_7.9/){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>例行排程版本，非紧急安全发布。上游没有提到这些漏洞有实际攻击案例。
- Tor Browser 升至 15.0.16。
- 更新部分 firmware 套件，改善较新硬件的支持，包含显卡、Wi-Fi 等。
- 修正在 Secure Boot 证书已是最新的少数情境下，仍误跳「证书过期」通知的问题。
- 未变动 Linux 内核、Thunderbird 与 Debian 底层，沿用 7.8 的软件组合。可从 Tails 7.0 以后版本自动升级。

## Tails 7.8.1

> 2026-06-04 · [上游公告](https://tails.net/news/version_7.8.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>紧急安全更新，修补 Linux 内核重大漏洞与 Tor 客户端的多个安全漏洞。
- 修补 Linux 内核漏洞 CVE-2026-43503（内核升至 6.12.90-2），此漏洞可让 Tails 内的应用程序取得管理员权限，配合其他未知漏洞可能被用于完整接管 Tails 并进行去匿名化。目前尚未发现实际被利用案例。
- Tor 客户端升至 0.4.9.9，修补多个安全漏洞。
- 此版为安全专用的紧急发布，未变动 Tor Browser、Thunderbird 与 Debian 底层版本，沿用 7.8 的软件组合。可从 Tails 7.0 以后版本自动升级。

## Tails 7.8

> 2026-05-21 · [上游公告](https://tails.net/news/version_7.8/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>Tor Browser 升至 15.0.14（基于 Firefox ESR 140.11）。上游没有提到这些漏洞有实际攻击案例。
- 修补 Linux 内核本地提权漏洞「Fragnesia」（同步缓解「Dirty Frag」）。此类漏洞可让 Tails 内的应用程序取得管理员权限，配合其他未知漏洞可能被用于完整接管 Tails 并进行去匿名化。
- 修补 Flatpak 通过 Yelp 逃逸沙箱的问题，yelp 升至 42.2-4tails1。
- 修补 CVE-2026-46529（evince）、CVE-2026-41989（libgcrypt20）、CVE-2026-41054（haveged）。
- 移除内置 Thunderbird。仍可通过持久存储的 additional software 自动安装，每次启动 Tails 时从 Debian 仓库拉取最新版本。原因是 Tails 发布节奏跟着 Firefox，Debian 的 Thunderbird 新版通常稍晚才到，过去导致 Tails 内置版本常带已知漏洞。
- 底层升级至 Debian Trixie 13.5。
- Secure Boot CA 升级通知改为只在 Secure Boot 已启用时才显示，避免在停用情境下出现混淆信息。
- WhisperBack 错误回报加入已安装的 Flatpak 应用程序与 runtimes 清单。

!!! info "Tails 7.7.x 系列"

    Tails 7.7.3、7.7.2、7.7.1、7.7 等条目目前仅在 [正体中文版](https://anoni.net/docs/changelog/tails/){target="_blank"} 提供，简体中文版会随社群翻译滚动补上。

## Tails 7.6

> 2026-03-26 · [上游公告](https://tails.net/news/version_7.6/){target="_blank"} · [完整翻译文章](../blog/posts/2026-tails-7-6.md)

- <span class="urg-tag urg-tag--routine">一般</span>自动 Tor 桥接（依用户区域获取）、GNOME Secrets 取代 KeePassXC 作为内置密码管理器、例行组件更新（Tor Browser 15.0.8、Thunderbird 140.8.0、Electrum 4.7.0）。上游没有提到这些漏洞有实际攻击案例。

## Tails 7.1

> 2025-10-15 · [上游公告](https://tails.net/news/version_7.1/){target="_blank"} · [完整翻译文章](../blog/posts/tails-7-1-released.md)

- <span class="urg-tag urg-tag--routine">一般</span>Tor Browser 首页改为离线版本（移除启动时的 metadata 泄露）、Snowflake 桥接更新方式翻新、例行组件更新（Tor Browser 14.5.8、Tor 客户端 0.4.8.19、Thunderbird 140.3.0）。上游没有提到这些漏洞有实际攻击案例。

## Tails 7.0

> 2025-09-20 · [上游公告](https://tails.net/news/version_7.0/){target="_blank"} · [完整翻译文章](../blog/posts/tails-7-released.md)

- <span class="urg-tag urg-tag--routine">一般</span>首个以 Debian 13（Trixie）与 GNOME 48（Bengaluru）为基底的大版本，桌面与系统组件全面升级。上游没有提到这些漏洞有实际攻击案例。

## Tails 7.0~rc2

> 2025-08-29 · [上游公告](https://tails.net/news/test_7.0-rc2/){target="_blank"} · [完整翻译文章](../blog/posts/tails-7-rc.md)

- <span class="chan-tag chan-tag--alpha">RC 测试版</span>Tails 7.0 第二个发行候选版（RC2），开放社群协助测试 Debian 13 与 GNOME 48 新基底、自动升级流程、持久存储迁移。上游没有提到这些漏洞有实际攻击案例。

## Tails 6.18

> 2025-07-31 · [上游公告](https://tails.net/news/version_6.18/){target="_blank"} · [完整翻译文章](../blog/posts/tails-6-18-webtunnel.md)

- <span class="urg-tag urg-tag--routine">一般</span>新增 WebTunnel 桥接协议支持，把 Tor 流量伪装成 HTTPS，对无法直接连入 Tor 的网络环境多一条进入路径。上游没有提到这些漏洞有实际攻击案例。
