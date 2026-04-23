---
date: 2026-04-19
authors:
    - toomore
categories:
    - 更新
    - Tor
    - 翻譯文章
slug: 2026-code-audit-for-tor-vpn-completed-by-cure53
image: "https://forum.torproject.org/uploads/default/original/2X/4/4825413b93e0884f51aed631e4111ded9a117e60.jpeg"
summary: "Cure53 完成 TorVPN Android 版與 Onionmasq 的安全稽核，核心 Tor 整合穩固，並已追蹤各項建議的後續修補進度"
description: "Tor Project 委託 Cure53 完成 TorVPN Android 版的滲透測試與原始碼稽核，涵蓋 Onionmasq 網路層，稽核結果顯示核心路由穩固，並指出輸入驗證、DNS 處理與行動安全等改善方向"
---

# Cure53 完成 Tor VPN 安全稽核

!!! info ""

    以下內容原文翻譯來自以下文章，主詞角色為 Tor Project：

    - [Code audit for Tor VPN completed by Cure53 | April 15, 2026](https://blog.torproject.org/code-audit-tor-vpn/){target="_blank"}

![TorVPN Cure53 Audit](https://forum.torproject.org/uploads/default/original/2X/4/4825413b93e0884f51aed631e4111ded9a117e60.jpeg){style="border-radius: 10px;"}

Tor Project 持續拓展行動隱私防護的工具版圖，TorVPN 是其中一項重要計畫：讓 Tor 的保護能力更容易被一般行動用戶所使用，同時維持強健的安全保障。2025 年 6 月，知名資安公司 Cure53 受委託，對 **TorVPN Android 版**及其底層網路元件進行了滲透測試與原始碼稽核。這份報告於 2026 年 4 月 15 日正式公開。

<!-- more -->

## 稽核範圍

本次稽核涵蓋兩個主要元件：

1. **TorVPN for Android**：負責將裝置流量導向 Tor 網路的行動端應用程式
2. **Onionmasq / Arti 的 Tunnel Interface**：以 Rust 撰寫的網路層，處理 TCP/UDP 解析、DNS 解析及流量路由至 Tor 網路

## 稽核發現

稽核結果指出，「Tor 的核心整合仍然穩固，在通道建立與路由方面沒有根本性問題。」主要問題集中在以下幾個面向：

### 輸入驗證不完整

多處驗證機制存在缺口，可能在邊緣情境下導致非預期行為。

### DNS 處理弱點

特定情況下 DNS 解析邏輯可能觸發拒絕服務（Denial of Service）條件，雖屬罕見情境，但仍需妥善處理。

### 加密與密碼學建議

稽核提出數項加密強化建議，包括：

- 實作**憑證綁定（certificate pinning）**，防範中間人攻擊
- 改善**隨機數生成**的品質與來源

### 行動安全問題

針對 Android 平台，稽核提出兩項常見行動安全缺口：

- **明文存儲配置資料（plaintext configuration storage）**：設定資料若未加密存放，在裝置遭入侵或其他 App 取得讀取權限時存在暴露風險
- **缺乏 root 偵測（root detection）**：未對 root 裝置環境進行警示或防護，影響在受感染裝置上的安全保障

## 後續處理

所有稽核發現均已納入 Tor Project 的持續安全改善計畫，列為優先項目的包括：驗證邏輯補強、資源管理改善，以及採用已有完善安全審查的函式庫。

完整稽核報告可於此下載：[torvpn_cure53_audit.pdf](https://blog.torproject.org/code-audit-tor-vpn/torvpn_cure53_audit.pdf){target="_blank"}

## 台灣脈絡下可關注的三個方向

1. **行動端工具的信任基礎**：台灣 Android 用戶眾多，TorVPN 的獨立稽核讓社群得以從具體的技術報告評估工具的安全程度，而不是憑藉「Tor 很安全」這樣籠統的說法做決策。這份報告正是建立負責任工具使用習慣的關鍵材料。

2. **OONI 數據與 Tor 工具的在地意義**：稽核中揭露的 DNS 處理弱點，在台灣的網路環境下同樣值得關注。OONI 在台灣的觀測數據顯示，DNS 干擾並非遙遠的假設場景，了解 TorVPN 如何應對 DNS 相關威脅，有助於在地社群評估工具的實際防護能力。

3. **個資法與明文配置存儲的對話**：稽核中指出的「明文配置存儲」問題，在台灣《個人資料保護法》的框架下也具有討論意義。App 在裝置上存儲配置的方式，不只是技術問題，也涉及對用戶個資的保護責任。這個角度可作為推廣隱私工具使用時的在地法律脈絡參考。

!!! info "參考資料"

    本篇整理自 Tor Project 官方公告 [Code audit for Tor VPN completed by Cure53](https://blog.torproject.org/code-audit-tor-vpn/){target="_blank"}。
