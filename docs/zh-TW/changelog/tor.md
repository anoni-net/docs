---
title: Tor 更新日誌
description: Tor Browser、Tor daemon、Onion 服務與 Tor Project 周邊工具版本與重大發布的中文重點整理，從上游 release notes 翻譯而成，方便台灣讀者掌握關鍵變更與安全修補。
icon: simple/torbrowser
---

# :simple-torbrowser: Tor 更新日誌

[Tor Browser](../tools/what-is-tor.md)、Tor daemon、Onion 服務的版本發布整理，從上游 release notes 條列摘譯。新版本永遠在最上面。本頁同時收錄穩定版與 Alpha 測試通道，Alpha 條目會在標題標注。

## Tor Browser 15.0.13

> 2026-05-08 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15013/){target="_blank"}

- tor 用戶端升至 0.4.9.8。
- NoScript 升至 13.6.19.1984。

## Tor Browser 16.0a6（Alpha 測試通道）

> 2026-05-07 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a6/){target="_blank"}

- Alpha 通道僅供測試，可能含影響可用性、安全與隱私的錯誤，一般使用者請繼續用穩定版（15.x）。
- 自此版起，Tor Browser Alpha 改以 Firefox beta 通道（150.0a1）為基底，過去是以 Firefox ESR 為基底。
- tor 用戶端升至 0.4.9.7。
- NoScript 升至 13.6.18.90101984。
- OpenSSL 升至 3.5.6。
- 預設橋接設定中的 Snowflake STUN 伺服器清單更新至 2026 版。
- Linux i686 使用者會收到「不再提供更新」的通知。
- Android 版 GeckoView 同步升至 150.0a1。

## Tor Browser 15.0.12

> 2026-05-07 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15012/){target="_blank"}

- 重要 Firefox 安全更新（rebase 至 Firefox 140.10.2esr）。
- tor 用戶端升至 0.4.9.7。
- Android 版 GeckoView 同步升至 140.10.2esr。
- 桌面與 Android 版加入 Funding the Commons 整合（tor-browser#44746、#44747）。

## Tor Browser 15.0.11

> 2026-04-28 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15011/){target="_blank"}

- 重要 Firefox 安全更新（rebase 至 Firefox 140.10.1esr）。
- NoScript 升至 13.6.18.1984。
- Android 版 GeckoView 同步升至 140.10.1esr。
