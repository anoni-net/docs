---
title: Tor 更新日志
description: Tor Browser、Tor daemon 与 Onion 服务各版本更新的中文重点整理，从上游 changelog 翻译而成，方便华语读者掌握每次发布的关键变更与安全修补。
icon: simple/torbrowser
---

# :simple-torbrowser: Tor 更新日志

[Tor Browser](../tools/what-is-tor.md)、Tor daemon 与 Onion 服务的版本更新整理。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## Tor Browser 15.0.14

> 2026-05-19 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15014/){target="_blank"}

- 重要 Firefox 安全更新，backport 自 Firefox 151 的修补（tor-browser#44958）。
- rebase 至 Firefox 140.11.0esr。
- Android 版 GeckoView 同步升至 140.11.0esr。
- 构建工具链的 Go 升至 1.25.10。

!!! info "更早的 Tor Browser 版本"

    Tor Browser 15.0.13、16.0a6（Alpha 测试通道）、15.0.12、15.0.11 等条目目前仅在 [正体中文版](https://anoni.net/docs/changelog/tor/){target="_blank"} 提供，简体中文版会随社群翻译滚动补上。

    更多 Tor 相关翻译保留在 [近期公告](../blog/index.md)，包括：

    - [Onionmasq 流量隔离实验](../blog/posts/tor-sambent-onionmasq.md)
    - [oniux 内核层级 Tor 隔离技术](../blog/posts/oniux-kernel-level-tor.md)
    - [Cure53 完成 Tor VPN 安全审计](../blog/posts/2026-code-audit-for-tor-vpn-completed-by-cure53.md)
