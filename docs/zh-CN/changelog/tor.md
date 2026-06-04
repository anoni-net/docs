---
title: Tor 更新日志
description: Tor Browser、Tor daemon 与 Onion 服务各版本更新的中文重点整理，从上游 changelog 翻译而成，方便华语读者掌握每次发布的关键变更与安全修补。
icon: simple/torbrowser
---

# :simple-torbrowser: Tor 更新日志

[Tor Browser](../tools/what-is-tor.md)、Tor daemon 与 Onion 服务的版本更新整理。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## Tor Browser 15.0.15

> 2026-06-03 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15015/){target="_blank"}

- tor daemon 重要安全更新，修正部分审查规避问题。
- tor 客户端升至 0.4.9.9，NoScript 升至 13.6.20.1984。
- Moat 模块支持设置多组 (front, reflector) domain fronting 配对（tor-browser#42436）。
- 修正桌面版 Captcha 无法运行的问题（tor-browser#44997），并通知 Linux i686 用户不再提供更新（tor-browser#44886）。

## Tor Browser 16.0a7（Alpha 测试通道）

> 2026-06-03 · [dist 目录](https://dist.torproject.org/torbrowser/16.0a7/){target="_blank"}

- Alpha 通道仅供测试，一般用户请继续用稳定版（15.x）。已在 dist 提供二进制文件，官方博客尚未发布对应公告。改以 Firefox 151.0a1 为基础（前一个 Alpha 16.0a6 为 150.0a1）。

!!! info "更早的 Tor Browser 版本"

    Tor Browser 15.0.14、15.0.13、16.0a6（Alpha 测试通道）、15.0.12、15.0.11 等条目目前仅在 [正体中文版](https://anoni.net/docs/changelog/tor/){target="_blank"} 提供，简体中文版会随社群翻译滚动补上。

    更多 Tor 相关翻译保留在 [近期公告](../blog/index.md)，包括：

    - [Onionmasq 流量隔离实验](../blog/posts/tor-sambent-onionmasq.md)
    - [oniux 内核层级 Tor 隔离技术](../blog/posts/oniux-kernel-level-tor.md)
    - [Cure53 完成 Tor VPN 安全审计](../blog/posts/2026-code-audit-for-tor-vpn-completed-by-cure53.md)
