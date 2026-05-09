---
date: 2025-10-15
authors:
    - toomore
categories:
    - 更新
    - Tails
    - 翻译文章
slug: tails-7-1-released
image: "assets/images/tails.png"
summary: "Tails 7.1 更新 Snowflake 连接效率与 OpenSSL 安全性更新"
description: "Tails 7.1 更新 Snowflake 连接效率与 OpenSSL 安全性更新"
---

# Tails 7.1 发布与说明

![Tails](./assets/images/tails.png){style="border-radius: 10px;"}

## 更新消息

- 在 Tails 的 Tor 浏览器中，将首页更改为一个离线页面，这个页面应该和 Tails 之外的 Tor 浏览器首页非常相似，而不是使用[Tails 网站页面](https://tails.net/home/){target="_blank"}。
      - ![](https://tails.net/news/version_7.1/about_tor.png)
- 改进显示的消息：当需要管理密码来开启应用程序，但在欢迎画面中未设置管理密码时。
      - ![](https://tails.net/news/version_7.1/authentication_required.png)
- 更新 Tor 浏览器至 [14.5.8](https://blog.torproject.org/new-release-tor-browser-1458){target="_blank"}。
- 更新 Tor 客户端至 0.4.8.19。
- 更新 Thunderbird 至 [140.3.0](https://www.thunderbird.net/en-US/thunderbird/140.3.0esr/releasenotes/){target="_blank"}。
- 移除 `ifupdown` 套件。

<!-- more -->

## 已修正

- 隐藏 Tor 浏览器新分页中的消息「您的 Tor 连线不是由 Tor 浏览器管理的」。（#21215）
      - ![](https://tails.net/news/version_7.1/not_managed.png)
- 了解更多详情，请参阅[变更记录](https://gitlab.tails.boum.org/tails/tails/-/blob/master/debian/changelog){target="_blank"}。

!!! info ""

    以下翻译自 [Tails 7.1 Drops Browser Home Phoning, Updates Tor Stack](https://www.sambent.com/tails-7-1-drops-browser-home-phoning-updates-tor-stack/), Sam Bent 的文章。

Tails 7.1 于 2025 年 10 月 14 日发布，搭载 Tor 浏览器 14.5.8、Tor 客户端 0.4.8.19 和 Thunderbird 140.3.0。这款专注于隐私的操作系统也取消了启动时不必要的网络请求，透过将 Tor 浏览器的首页更换为离线版本来达成。（这个请求存在的原因是什么呢？）

这项更动非常重要，因为每个远端连线都会产生元数据（metadata）。过去，Tails 在启动 Tor 浏览器时会载入远端首页，传输时间数据并有可能泄露系统状态的资讯。现在，它开启的是 `about:tor`，这是一个没有外部请求的自定义本地页面，让浏览器启动时保持安静。

Tor 浏览器 14.5.8 于 2025 年 10 月 7 日推出，带来了从 Firefox 144、OpenSSL 3.5.4 和 Tor 0.4.8.19 回溯的安全修补程序。这次浏览器更新修复了在最安全的安全层级运行时 DuckDuckGo 的显示问题，并修正了安全设定中的错字。Mozilla 的浏览器核心不断累积需要回溯的漏洞，必须持续回溯修补至加强版 Tor 浏览器 ESR 分支。

![](https://tails.net/news/version_7.1/not_managed.png)

Tor 客户端更新至 0.4.8.19，更新了 [Snowflake](../../tools/tor-snowflake.md){target="_blank"} 桥接更新方式。Snowflake 允许身处被封锁地区的 Tor 用户透过运行在其他人浏览器中的短暂代理来进行路由。这次桥接更新让绕过封锁的基础设施保持最新，因为审查机构会封锁过时的进入点。

Tails 7.1 解决了问题 [#21215](https://gitlab.tails.boum.org/tails/tails/-/issues/21215){target="_blank"}，也就是在新分页出现的「您的 Tor 连线不是由 Tor 浏览器管理的」消息。这个令人困惑的通知在系统运作正常时会让人误以为出现了问题。在 7.1 中，这个消息被移除，让用户不必要的焦虑消失。

Thunderbird 更新至 [140.3.0 ESR](https://www.thunderbird.net/en-US/thunderbird/releases/){target="_blank"}，此版本修正了新增账号时冻结、Windows 通知失效、IMAP 附件删除问题、草稿覆写、从版本 128 至 140 迁移后的隐藏选单列，以及多种崩溃情况。电子邮件仍然是相关性攻击的主要途径之一，因此客户端的稳定性对于操作安全非常重要。如果电子邮件客户端崩溃，用户可能会被迫使用浏览器型替代方案，而这些方案会泄漏更多的元数据。

![](https://tails.net/news/version_7.1/authentication_required.png)

2025 年 10 月 13 日的变更记录中，记载了移除 `ifupdown` 这个旧版网络配置套件，取而代之的是现代化的替代方案。系统也改进了管理密码说明消息，解决了另一个用户经验的混淆点，让用户更容易理解为什么会突然出现身份验证的要求。

动态语系切换现在运作正常，可以根据系统设定自动调整语言，而不是需要手动配置或重新启动。对于在多语言环境中操作的用户，这减少了切换身份的困扰。虽然语系泄漏仍然是一个进行指纹识别的途径，但强迫用户在语言变更时重新启动，其实会降低操作安全，因为这可能让他们跳过这项保护。

OpenSSL 3.5.4 修补了这个加密库中的漏洞，这是 Tails 安全基础架构的核心部分。即使在使用 Tor 时，若 SSL/TLS 验证出问题，仍会使中间人攻击成为可能。这次更新透过 Tor 浏览器套件提供，但由于 Tails 遍及各组件共用 OpenSSL，因此影响到系统范围内的加密操作。

Tor 浏览器的建构符合 14.5.8 版的发行说明。

![](https://tails.net/news/version_7.1/about_tor.png)

Tails 7.1 的用户从版本 7.0 自动升级时，会保留持久储存区。不过，若手动从 USB 或 ISO 重新安装，则会删除现有的资料。该项目提供了针对 Windows、macOS 和 Linux 的安装指南，但也警告用户，如果选择重新安装而非升级，将会摧毁持久储存，这依然是让用户混淆的一个持续问题，因为他们可能会不小心删除储存的数据。

Firefox 144 的安全回溯值得多加注意。Mozilla 不断修补浏览器的漏洞，但 Tor 浏览器所基于的 ESR 分支相对于快速发布版有所落后。Tor 浏览器 14.5.8 宣称已经回溯了 Firefox 144 的修补程序，但截至 2025 年 10 月 7 日，Firefox 144 并未正式发布。这要么是指 Mozilla 内部开发版本的号码，要么是文件中存在错误。

OpenSSL 更新修正了在 OpenSSL [安全公告](https://www.openssl.org/news/vulnerabilities.html){target="_blank"}中详细列出的特定 CVE，但 Tails 的发行记录中并未列出 3.5.4 解决了哪些漏洞。仰赖此操作系统维持生死攸关匿名性的用户值得知道具体的 CVE 列表，而不是「安全更新」这种可能意味着任何事情的模糊语言，从远端代码执行到轻微的消息泄露都可能囊括其中。

![](https://www.sambent.com/content/images/2025/10/image-95.png)

[Snowflake](../../tools/tor-snowflake.md){target="_blank"} 桥接更新的重要性超过大多数用户的认识。当审查基础设施封锁 Tor 入口节点时，Snowflake 透过不断轮换的浏览器代理提供替代入口。然而，Snowflake 的效能取决于更新的桥接信息。过时的桥接清单意味着受审查地区的用户无法顺利连接。Tor 0.4.8.19 的更新保持了这套基础设施的运作。

被移除的 `ifupdown` 套件代表着旧的 Debian 网络工具，这些工具大部分已被 `NetworkManager` 和 `systemd-networkd` 取代。它的存在可能会产生冲突及增加攻击面，且多数用户不需要这些功能。Tails 迁移到现代化的网络管理系统可降低程序代码的复杂度，并消除已知有安全问题的旧工具。

Tails 继续采用逐步的安全更新模式，而不是革命性的变革。版本 7.1 修补漏洞，更新组件，并修正了用户体验上的令人困扰之处。离线浏览器首页突显了唯一能减少元数据泄漏的更动。其他的则是在不断变化的威胁环境中维持基本的安全性。

Tor 浏览器 14.5.8 于 10 月 7 日释出，而 Tails 7.1 于 10 月 14 日发布，显示出一个七天的整合与测试缓冲期。这个延迟是合理的，因为 Tails 必须确认浏览器的更动不会破坏遗忘功能或泄露身份消息。但这也意味着 Tails 用户在 Tor 浏览器的安全性修补上落后一周。

用户应立即从 Tails 7.0 升级，透过自动更新器来保留持久储存区并获得安全修补。手动安装只适合于新部署或系统损坏的情况。发布公告中包含了下载映像的验证指引，包括 GPG 签名和校验码。

这次更新着重于维护，而非创新（这并不是坏事）。离线首页确实很重要，而其他更动则保持系统的现代化。若你现在使用 Tails 7.0，请立即更新。若使用更旧的版本，自动更新功能只适用于从 7.0 开始，这需要手动安装，并将摧毁持久性数据。请先备份你的持久储存区。
