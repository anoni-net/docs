---
title: Tor 更新日誌
description: Tor Browser、Tor daemon、Onion 服務與 Tor Project 周邊工具版本與重大發布的中文重點整理，從上游 release notes 翻譯而成，方便台灣讀者掌握關鍵變更與安全修補。
icon: simple/torbrowser
---

# :simple-torbrowser: Tor 更新日誌

[Tor Browser](../tools/what-is-tor.md)、Tor daemon、Onion 服務的版本發布整理，從上游 release notes 條列摘譯。新版本永遠在最上面。本頁同時收錄穩定版與 Alpha 測試通道，Alpha 條目會在標題標注。

## Tor Browser 15.0.17

> 2026-06-28 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15017/){target="_blank"}

- 以 tor 安全更新為主的小版本，未變動 Firefox 基底。
- tor 用戶端升至 0.4.9.11。
- NoScript 升至 13.6.25.1984。
- 建置流程更新 boklm 的 GPG 子金鑰與 morgan 的續期金鑰（tor-browser-build#41821、#41827）。

## Tor Browser 15.0.16

> 2026-06-17 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15016/){target="_blank"}

- 重要的 Firefox 安全更新。
- rebase 至 Firefox 140.12.0esr（tor-browser#45046），並 backport 自 Firefox 152 的安全修補（tor-browser#45054）。
- Android 版 GeckoView 同步升至 140.12.0esr。
- NoScript 升至 13.6.24.1984，修正前一版 13.6.19.902 在 DocStartInjection 上的 regression（tor-browser#45044）。
- OpenSSL 升至 3.5.7。
- 簽章流程移除對 tor daemon 的依賴（tor-browser-build#41802）。
- 建置工具鏈的 Go 升至 1.25.11。

## Tor Browser 15.0.15

> 2026-06-03 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15015/){target="_blank"}

- tor daemon 重要安全更新，並修正部分審查規避問題。
- tor 用戶端升至 0.4.9.9。
- NoScript 升至 13.6.20.1984。
- Moat 模組支援設定多組 (front, reflector) domain fronting 配對（tor-browser#42436）。
- 修正桌面版（Windows、macOS、Linux）Captcha 無法運作的問題（tor-browser#44997）。
- 通知 Linux i686 使用者不再提供更新（tor-browser#44886，backport #44361）。

## Tor Browser 16.0a7（Alpha 測試通道）

> 2026-06-03 · [dist 目錄](https://dist.torproject.org/torbrowser/16.0a7/){target="_blank"}

- Alpha 通道僅供測試，可能含影響可用性、安全與隱私的錯誤，一般使用者請繼續用穩定版（15.x）。
- 已在 dist 釋出二進位檔，官方部落格尚未發布對應公告。
- 改以 Firefox 151.0a1 為基底（前一個 Alpha 16.0a6 為 150.0a1）。

## Tor Browser 15.0.14

> 2026-05-19 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15014/){target="_blank"}

- 重要 Firefox 安全更新，backport 自 Firefox 151 的修補（tor-browser#44958）。
- rebase 至 Firefox 140.11.0esr。
- Android 版 GeckoView 同步升至 140.11.0esr。
- 建置工具鏈的 Go 升至 1.25.10。

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
