---
date: 2025-08-29
authors:
    - toomore
categories:
    - 更新
    - Tails
slug: tails-7-rc
image: "assets/images/tails.png"
summary: "Tails 7.0 预计在 9/18 或 10/16 发布，目前已发布第二个最终测试版本（RC），邀请大家协助测试"
description: "Tails 7.0 预计在 9/18 或 10/16 发布，目前已发布第二个最终测试版本（RC），邀请大家协助测试"
---

# Tails 7.0 发布第二个最终测试版本（7.0~rc2）

![Tails](./assets/images/tails.png){style="border-radius: 10px;"}

Tails 7.0~rc2 是即将推出 Tails 7.0 的第二个候选版本。计划在 9 月 18 日或 10 月 16 日正式发布 Tails 7.0。您可以帮助 Tails 团队提前测试这个候选版本。Tails 7.0 将是第一个基于 [Debian 13（Trixie）](https://www.debian.org/releases/trixie/release-notes/){target="_blank"}和 [GNOME 48](https://release.gnome.org/48/){target="_blank"} 的版本，会带来许多应用程序的新版本。

Tails 团队已经用与正式版本一样详尽的自动与手动测试流程检测过 7.0~rc2。但 Tails 7.0~rc2 可能依然存在尚未发现的问题。与其他正式版本一样，Tails 团队会为 Tails 7.0~rc2 提供自动安全升级。

<!-- more -->

## 变更与更新

- 用 [GNOME Console](https://apps.gnome.org/Console/){target="_blank"} 取代 [GNOME Terminal](https://gitlab.gnome.org/GNOME/gnome-terminal){target="_blank"}。（[#20161](https://gitlab.tails.boum.org/tails/tails/-/issues/20161){target="_blank"}）
      - 我们在进行此更改时破坏了 Root 终端。若要开启 Root 终端，请在一般 Console 中执行以下命令。
      - > sudo -i
- 用 [GNOME Loupe](https://apps.gnome.org/Loupe/){target="_blank"} 取代 [GNOME Image Viewer](https://wiki.gnome.org/Apps/EyeOfGnome){target="_blank"}（[#20640](https://gitlab.tails.boum.org/tails/tails/-/issues/20640){target="_blank"}）。
- 从“收藏”菜单中移除 Kleopatra。（[#21072](https://gitlab.tails.boum.org/tails/tails/-/issues/21072){target="_blank"}）
- 若要启动 Kleopatra，请选择****应用程序 ▸ 附件 ▸ Kleopatra****。
- 从欢迎画面中移除过时的网络连接选项。（[#21074](https://gitlab.tails.boum.org/tails/tails/-/issues/21074){target="_blank"}）

### 7.0~rc2 相较 7.0~rc1 的变更

- 将内存需求从 2 GB RAM 提高到 3 GB。（#21114）
      - ![当 RAM 不足时，Tails 7.0~rc2 会显示通知。](https://tails.net/news/test_7.0-rc2/ram.png)
      - 当 RAM 不足时，Tails 7.0~rc2 会显示通知。
      - 我们估计影响不到 2% 的现有用户。
- 移除 **位置**（Places）菜单。（#21086）
- 将 _Root Terminal_ 重命名为 _Root Console_。（#21110）
- 跳过 _Inkscape_ 的导览画面。（#21091）

### 内建软件

- 更新 Tor 客户端至 0.4.8.17。
- 更新 Thunderbird 至 [128.13.0esr](https://www.thunderbird.net/en-US/thunderbird/128.13.0esr/releasenotes/){target="_blank"}。
- 更新 Linux 内核至 6.12.38。
      - 改善对新硬件的支持，包括显卡、Wi-Fi 等等。
- 将 Electrum 从 4.3.4 更新至 4.5.8。
- 将 OnionShare 从 2.6.2 更新至 2.6.3。
- 将 KeePassXC 从 2.7.4 更新至 2.7.10。
- 将 Kleopatra 从 4:22.12 更新至 4:24.12。
- 将 Inkscape 从 1.2.2 更新至 1.4。
- 将 GIMP 从 2.10.34 更新至 3.0.4。
- 将 Audacity 从 3.2.4 更新至 3.7.3。
- 将文字编辑从 43.2 更新至 48.3。
- 将文件扫描从 42.5 更新至 46.0。

### 移除的软体

- 移除 `unar`。（[#20946](https://gitlab.tails.boum.org/tails/tails/-/issues/20946){target="_blank"}）
- 移除 `aircrack-ng`。（[#21044](https://gitlab.tails.boum.org/tails/tails/-/issues/21044){target="_blank"}）
- 移除 `sq`。（[#21042](https://gitlab.tails.boum.org/tails/tails/-/issues/21042){target="_blank"}）

### 问题修正

- 修正选择某些语言时键盘对应错误的问题。（[#12638](https://gitlab.tails.boum.org/tails/tails/-/issues/12638){target="_blank"}）

欲知详情，请参阅 GitLab 上 7.0 里程碑的[已解决问题列表](https://gitlab.tails.boum.org/tails/tails/-/issues/?milestone_title=Tails_7.0&state=closed){target="_blank"}。

### 已知问题

- Tails 7.0~rc2 需要 3 GB 的 RAM 才能顺畅运行，而不是之前的 2 GB。（[#18040](https://gitlab.tails.boum.org/tails/tails/-/issues/18040){target="_blank"}）
      - 我们估计影响不到 2% 的现有用户。
- Tails 7.0~rc2 启动时间较长。
      - 我们计划在 Tails 7.0 最终版中修正这个问题。

欲了解更多详情，请参阅 GitLab 上 7.0 里程碑的[问题列表](https://gitlab.tails.boum.org/groups/tails/-/milestones/144#tab-issues){target="_blank"}。

## 您的意见反馈

如果发现任何新问题，请报告至以下任一渠道：

- <tails-testers@boum.org>（公开邮件群组）
- <support@tails.net>（协助信箱）

## 获取 Tails 7.0~rc2

### 直接下载

- 用于 USB 随身盘（[USB 映像文件](https://download.tails.net/tails/alpha/tails-amd64-7.0~rc2/tails-amd64-7.0~rc2.img){target="_blank"}）[[OpenPGP 签名](https://tails.net/torrents/files/tails-amd64-7.0~rc2.img.sig){target="_blank"}]
- 用于 DVD 和虚拟机（[ISO 映像文件](https://download.tails.net/tails/alpha/tails-amd64-7.0~rc2/tails-amd64-7.0~rc2.iso){target="_blank"}）[[OpenPGP 签名](https://tails.net/torrents/files/tails-amd64-7.0~rc2.iso.sig){target="_blank"}]

### 使用 BitTorrent 下载

- 用于 USB 随身盘（[USB 映像文件](https://tails.net/torrents/files/tails-amd64-7.0~rc2.img.torrent){target="_blank"}）
- 用于 DVD 和虚拟机（[ISO 映像文件](https://tails.net/torrents/files/tails-amd64-7.0~rc2.iso.torrent){target="_blank"}）

## 升级您的 Tails USB 随身盘并保留您的持久存储

您可以[手动升级](https://tails.net/doc/upgrade/index.en.html#manual){target="_blank"}至 Tails 7.0~rc2。Tails 7.0~rc2 不支持自动升级。

## 为新 USB 随身盘安装 Tails 7.0~rc2

请依照我们的安装说明进行操作：

- [从 Windows 安装](https://tails.net/install/windows/index.en.html){target="_blank"}
- [从 macOS 安装](https://tails.net/install/mac/index.en.html){target="_blank"}
- [从 Linux 安装](https://tails.net/install/linux/index.en.html){target="_blank"}
- [使用命令行和 GnuPG 从 Debian 或 Ubuntu 安装](https://tails.net/install/expert/index.en.html){target="_blank"}

!!! warning "请使用额外的随身盘安装测试"

    如果您选择安装而不是升级，USB 随身盘上的持久存储将会丢失。

!!! info "参考资料"

    本篇内容参考 Tails 发布的 [Test 7.0~rc1](https://tails.net/news/test_7.0-rc1/){target="_blank"}、[Test 7.0~rc2](https://tails.net/news/test_7.0-rc2/){target="_blank"}
