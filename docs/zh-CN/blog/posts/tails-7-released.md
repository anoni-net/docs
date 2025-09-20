---
date: 2025-09-20
authors:
    - toomore
categories:
    - 更新
    - Tails
slug: tails-7-released
image: "assets/images/tails.png"
summary: "Tails 7.0 已发布，是首个基于 Debian 13（代号 Trixie）和 GNOME 48（代号 Bengaluru）的版本"
description: "Tails 7.0 已发布，是首个基于 Debian 13（代号 Trixie）和 GNOME 48（代号 Bengaluru）的版本"
---

# Tails 7.0 发布

![Tails](./assets/images/tails.png){style="border-radius: 10px;"}

我们非常高兴地向您介绍 Tails 7.0，这是首个基于 Debian 13（代号 Trixie）和 GNOME 48（代号 Bengaluru）的 Tails 版本。Tails 7.0 带来了许多内建应用程序的新版本。

## 追忆

Tails 7.0 献给 Lunar（1982–2024）的追忆。Lunar 是 Tails 的贡献者、Tor 的志愿者、自由软件黑客以及社区组织者。

在 Tails 的发展历程中，Lunar 始终与我们并肩作战。从最初的项目萌芽到最终与 Tor 的合并，他提供了明智的技术建议、富有创意的产品设计点子、外展支持以及关怀的组织建议。

除了在 Tor 的贡献之外，Lunar 还致力于多个非常成功的自由软件项目，如 [Debian](https://www.debian.org/){target="_blank"} 项目——Tails 所基于的 Linux 发行版，以及协助我们验证 [Tails 版本完整性](https://tails.net/contribute/build/reproducible/){target="_blank"} 的 [Reproducible Builds](https://reproducible-builds.org/){target="_blank"} 项目。

Lunar 的离去，对于我们的社区以及他所参与的其他许多社区都是莫大的损失。

另见其他项目写给 Lunar 的[纪念文章](https://lunar.anargeek.net/liens/#autres-sites){target="_blank"}。

<!-- more -->

## 变更与更新

### 更快的启动速度

在大多数电脑上，Tails 7.0 的启动速度提升了 10 到 15 秒。

我们通过将 Tails USB 和 ISO 映像文件的压缩算法从 `xz` 改为 `zstd` 来达成这一目标。这样的改变使映像文件的大小比以前增加了 10%。

在测试这项改变时，我们注意到，使用质量较差的 USB 闪存盘时，Tails 的启动速度可能比使用质量较好的 USB 闪存盘慢上 20 秒。

若您处于假冒电子产品普遍存在的地区，我们建议您在国际性的超市连锁购买 USB 闪存盘，这样的供应链应较具可靠性。

### 内建软件

* 将 _[GNOME Terminal](https://gitlab.gnome.org/GNOME/gnome-terminal){target="blank"}_ 替换为 _[GNOME Console](https://apps.gnome.org/Console/){target="blank"}_。
* 将 _[GNOME Image Viewer](https://wiki.gnome.org/Apps/EyeOfGnome){target="blank"}_ 替换为 _[GNOME Loupe](https://apps.gnome.org/Loupe/){target="blank"}_。
* 将 _Tor 浏览器_ 更新至 [14.5.7](https://blog.torproject.org/new-release-tor-browser-1457){target="_blank"}。
* 将 _Tor_ 客户端更新至 0.4.8.17。
* 将 _Thunderbird_ 更新至 [128.14.0esr](https://www.thunderbird.net/en-US/thunderbird/128.14.0esr/releasenotes/){target="_blank"}。
* 将 _Electrum_ 从 4.3.4 更新至 [4.5.8](https://github.com/spesmilo/electrum/blob/master/RELEASE-NOTES){target="_blank"}。
* 将 _OnionShare_ 从 2.6.2 更新至 [2.6.3](https://github.com/onionshare/onionshare/blob/main/CHANGELOG.md){target="_blank"}。
* 将 _KeePassXC_ 从 2.7.4 更新至 [2.7.10](https://github.com/keepassxreboot/keepassxc/blob/develop/CHANGELOG.md){target="_blank"}。
* 将 _Kleopatra_ 从 4:22.12 更新至 4:24.12。
* 将 _Inkscape_ 从 1.2.2 更新至 1.4。
* 将 _GIMP_ 从 2.10.34 更新至 [3.0.4](https://www.gimp.org/release-notes/gimp-3.0.html){target="_blank"}。
* 将 _Audacity_ 从 3.2.4 更新至 3.7.3。
* 将 _文字编辑器_ 从 43.2 更新至 48.3。
* 将 _文件扫描器_ 从 42.5 更新至 46.0。

### GNOME 的变更

* 许多 _设置_ 工具中的部分已重新设计，例如 [GNOME 44](https://release.gnome.org/44/){target="_blank"} 中的无障碍功能、音效和鼠标与键盘设置。无障碍设置还包括了新的功能，例如过度放大和始终显示滚动条。
* 在 [GNOME 45](https://release.gnome.org/45/){target="_blank"} 中，活动按钮被动态工作区指示器取代。
* ![活动按钮被动态工作区指示器取代](https://tails.net/doc/first_steps/desktop/upper-left.png)
* 屏幕阅读器在多方面得到改进，例如在 [GNOME 46](https://release.gnome.org/46/){target="_blank"} 中提供更佳的表格导航和睡眠模式。
* 在 [GNOME 48](https://release.gnome.org/48/){target="_blank"} 中，电源设置提供了一个新的选项来保持电池健康。

### 移除项目

* _移除_ **Places** 菜单。您可以从 _文件_ 浏览器的侧边栏中访问相同的快捷方式。
* 从 Favorites 中移除 Kleopatra。要启动 Kleopatra，请选择_ **Apps ▸ Accessories ▸ Kleopatra**。
* 移除 `unar`。_文件解压缩器_ 工具仍可打开大部分的 RAR 文件。
* 移除 `aircrack-ng` 软件包。您仍可使用[附加软件功能](https://tails.net/doc/persistent_storage/additional_software/index.en.html){target="_blank"}安装 `aircrack-ng`。
* 移除 _电源统计_ 工具。
* 移除 `sq` 软件包。
* 从欢迎画面中移除已过时的网络连接选项。

### 硬件支持

* 将 _Linux_ 内核更新至 6.12.43。这提升了对新硬件的支持，包括图形、Wi-Fi 等。
* 内存需求从 2 GB 提高到 3 GB。（[#21114](https://gitlab.tails.boum.org/tails/tails/-/issues/21114){target="_blank"}）若未达到内存需求，Tails 7.0 会显示通知。我们估计受影响的用户不到 2%。
      * ![](https://tails.net/news/test_7.0-rc2/ram.png)

## 问题修正

* 修正某些语言选择正确键盘的问题。（[#12638](https://gitlab.tails.boum.org/tails/tails/-/issues/12638){target="_blank"}）

如需更多详细信息，请阅读我们的[更新日志](https://gitlab.tails.boum.org/tails/tails/-/blob/master/debian/changelog){target="_blank"}。

## 下载 Tails 7.0

### 升级您的 Tails USB 并保留您的持久存储空间

* 自动升级仅适用于从 Tails 7.0~rc1 和 7.0~rc2 升级到 7.0。
* 所有其他用户必须进行[手动升级](https://tails.net/doc/upgrade/index.en.html#manual){target="_blank"}。

### 为新 USB 闪存盘安装 Tails 7.0

请依照我们的安装说明进行操作：

* [从 Windows 安装](https://tails.net/install/windows/index.en.html){target="_blank"}
* [从 macOS 安装](https://tails.net/install/mac/index.en.html){target="_blank"}
* [从 Linux 安装](https://tails.net/install/linux/index.en.html){target="_blank"}
* [使用命令行和 GnuPG 从 Debian 或 Ubuntu 安装](https://tails.net/install/expert/index.en.html){target="_blank"}

!!! warning "请使用额外的闪存盘进行安装测试"

    如果您选择安装而不是升级，USB 闪存盘上的持久存储将会丢失。

!!! info "参考资料"

    本篇内容参考 Tails 发布的 [Tails 7.0](https://tails.net/news/version_7.0/){target="_blank"}、[New Release: Tails 7.0](https://blog.torproject.org/new-release-tails-7_0/){target="_blank"}
