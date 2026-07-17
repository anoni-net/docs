---
title: Tor 更新日志
description: Tor Browser、Tor daemon 与 Onion 服务各版本更新的中文重点整理，从上游 changelog 翻译而成，方便华语读者掌握每次发布的关键变更与安全修补。
icon: simple/torbrowser
---

# :simple-torbrowser: Tor 更新日志

[Tor Browser](../tools/what-is-tor.md)、Tor daemon 与 Onion 服务的版本更新整理。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## Tor Browser 15.0.18

> 2026-07-14 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15018/){target="_blank"}

- 以 Firefox 安全修补为主的小版本。
- Firefox 基底维持 140.12.0esr，改以 cherry-pick 带入 firefox/esr140 分支的后续修补（tor-browser#45111），未做 rebase。
- NoScript 升至 13.6.30.1984，构建工具链的 Go 升至 1.25.12（Windows、Linux、Android）。
- 构建流程更新 boklm 的 GPG 子密钥（tor-browser-build#41821）。

## Tor Browser 16.0a8（Alpha 测试通道）

> 2026-07-02 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a8/){target="_blank"}

- Alpha 通道仅供测试，可能含影响可用性、安全与隐私的错误，一般用户请继续用稳定版（15.x）。
- 重要的 Firefox 安全更新，rebase 至 Firefox 152.0a1（前一个 Alpha 16.0a7 为 151.0a1），Android 版 GeckoView 同步升至 152.0a1。
- tor 客户端升至 0.4.9.11、NoScript 升至 13.6.25.90301984、OpenSSL 升至 3.5.7、构建工具链的 Go 升至 1.26.4。
- 修补跨站 oracle 漏洞，Safer Mode 下拒绝 worklet。16.0 系列停用 XSLT。
- 桌面版停用 IP Protection，并修正 letterboxing 背景显示与 Firefox 152 rebase 后的多项 regression。Android 版在 Tor connection assist 加入常用区域、移除默认浏览器功能，omni.ja 改用 xz 压缩。

## Tor Browser 15.0.17

> 2026-06-28 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15017/){target="_blank"}

- 以 tor 安全更新为主的小版本，未变动 Firefox 基底。
- tor 客户端升至 0.4.9.11，NoScript 升至 13.6.25.1984。
- 构建流程更新 boklm 的 GPG 子密钥与 morgan 的续期密钥（tor-browser-build#41821、#41827）。

## Tor Browser 15.0.16

> 2026-06-17 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15016/){target="_blank"}

- 重要的 Firefox 安全更新。
- rebase 至 Firefox 140.12.0esr（tor-browser#45046），backport 自 Firefox 152 的安全修补（tor-browser#45054），Android 版 GeckoView 同步升至 140.12.0esr。
- NoScript 升至 13.6.24.1984，修正前一版 13.6.19.902 在 DocStartInjection 上的 regression（tor-browser#45044），OpenSSL 升至 3.5.7。
- 签章流程移除对 tor daemon 的依赖（tor-browser-build#41802），构建工具链的 Go 升至 1.25.11。

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
