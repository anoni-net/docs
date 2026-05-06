---
title: Tails、Whonix、Qubes 的差別
description: 三套常見匿名作業系統的設計目標、適用情境與門檻比較。
icon: material/compare-horizontal
---

# :material-compare-horizontal: Tails、Whonix、Qubes 的差別

!!! info "撰寫中（預計 2026 Q2 完成）"
    主題大綱已收齊，正在彙整三套作業系統的安裝門檻、硬體需求與適用情境表格。實際撰寫預計 2026 Q2，下方段落是目前的方向。如果你長期使用 Tails、Whonix 或 Qubes 任一套，歡迎到 [Matrix 公開 room](../community/tools.md) 分享經驗，或在 GitHub 認領這篇撰寫，流程見 [如何參與](../community/how-to-contribute.md)。

匿名作業系統有幾個常被一起提到的選項，但它們解決的問題不同。Tails 強調即用即丟、低門檻、適合短時間任務。Whonix 採用「Gateway + Workstation」的雙虛擬機架構，把 Tor 連線和應用程式分離，適合需要長期維持匿名身分的場景。Qubes OS 則用嚴格的隔離設計，把每個身分、任務分到不同的 qube 中執行，安全性最高但門檻也最高。這篇文章對照三者的安裝門檻、硬體需求、適用情境與限制，搭配 [威脅模型](../basics/threat-model.md) 提供選擇的判斷依據。
