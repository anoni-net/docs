---
title: Tails 更新日志
description: Tails 操作系统各版本更新的中文重点整理，从上游 changelog 翻译而成，方便华语读者快速掌握每次发布的关键变更、安全修补与 Tor 连接改善。
icon: material/usb-flash-drive-outline
---

# :material-usb-flash-drive-outline: Tails 更新日志

[Tails](../tools/what-is-tails.md) 操作系统的版本更新整理。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## Tails 7.9

> 2026-06-18 · [上游公告](https://tails.net/news/version_7.9/){target="_blank"}

- 例行排程版本，非紧急安全发布。
- Tor Browser 升至 15.0.16。
- 更新部分 firmware 套件，改善较新硬件的支持，包含显卡、Wi-Fi 等。
- 修正在 Secure Boot 证书其实已是最新的少数情境下，仍误跳「证书过期」通知的问题。
- 未变动 Linux 内核、Thunderbird 与 Debian 底层，沿用 7.8 的软件组合。可从 Tails 7.0 以后版本自动升级。

## Tails 7.8.1

> 2026-06-04 · [上游公告](https://tails.net/news/version_7.8.1/){target="_blank"}

- 紧急安全更新，修补 Linux 内核重大漏洞与 Tor 客户端的多个安全漏洞。
- 修补 Linux 内核漏洞 CVE-2026-43503（内核升至 6.12.90-2），此漏洞可让 Tails 内的应用程序取得管理员权限，配合其他未知漏洞可能被用于完整接管 Tails 并进行去匿名化。目前尚未发现实际被利用案例。
- Tor 客户端升至 0.4.9.9，修补多个安全漏洞。
- 此版为安全专用的紧急发布，未变动 Tor Browser、Thunderbird 与 Debian 底层版本，沿用 7.8 的软件组合。可从 Tails 7.0 以后版本自动升级。

## Tails 7.8

> 2026-05-21 · [上游公告](https://tails.net/news/version_7.8/){target="_blank"}

- Tor Browser 升至 15.0.14（基于 Firefox ESR 140.11）。
- 修补 Linux 内核本地提权漏洞「Fragnesia」（同步缓解「Drity Frag」）。此类漏洞可让 Tails 内的应用程序取得管理员权限，配合其他未知漏洞可能被用于完整接管 Tails 并进行去匿名化。
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

- 自动 Tor 桥接（依用户区域获取）、GNOME Secrets 取代 KeePassXC 作为内置密码管理器、例行组件更新（Tor Browser 15.0.8、Thunderbird 140.8.0、Electrum 4.7.0）。

## Tails 7.1

> 2025-10-15 · [上游公告](https://tails.net/news/version_7.1/){target="_blank"} · [完整翻译文章](../blog/posts/tails-7-1-released.md)

- Tor Browser 首页改为离线版本（移除启动时的 metadata 泄露）、Snowflake 桥接更新方式翻新、例行组件更新（Tor Browser 14.5.8、Tor 客户端 0.4.8.19、Thunderbird 140.3.0）。

## Tails 7.0

> 2025-09-20 · [上游公告](https://tails.net/news/version_7.0/){target="_blank"} · [完整翻译文章](../blog/posts/tails-7-released.md)

- 首个以 Debian 13（Trixie）与 GNOME 48（Bengaluru）为基底的大版本，桌面与系统组件全面升级。

## Tails 7.0~rc2

> 2025-08-29 · [上游公告](https://tails.net/news/test_7.0-rc2/){target="_blank"} · [完整翻译文章](../blog/posts/tails-7-rc.md)

- Tails 7.0 第二个发行候选版（RC2），开放社群协助测试 Debian 13 与 GNOME 48 新基底、自动升级流程、持久存储迁移。

## Tails 6.18

> 2025-07-31 · [上游公告](https://tails.net/news/version_6.18/){target="_blank"} · [完整翻译文章](../blog/posts/tails-6-18-webtunnel.md)

- 新增 WebTunnel 桥接协议支持，把 Tor 流量伪装成 HTTPS，对无法直接连入 Tor 的网络环境多一条进入路径。
