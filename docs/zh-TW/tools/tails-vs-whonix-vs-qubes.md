---
title: Tails、Whonix、Qubes 的差別
description: 三套常見匿名作業系統的設計目標、適用情境與門檻比較。
icon: material/compare-horizontal
---

# :material-compare-horizontal: Tails、Whonix、Qubes 的差別

!!! info "撰寫中（2026 Q2）"
    這篇文章還在準備中，下方段落是主題大綱。歡迎到 [Matrix 社群](../community/tools.md) 表達想看的角度，或參與撰寫，見 [如何參與](../community/how-to-contribute.md)。

匿名作業系統有幾個常被一起提到的選項，但它們解決的問題不同。Tails 強調即用即丟、低門檻、適合短時間任務；Whonix 採用「Gateway + Workstation」的雙虛擬機架構，把 Tor 連線和應用程式分離，適合需要長期維持匿名身分的場景；Qubes OS 則用嚴格的隔離設計，把每個身分、任務分到不同的 qube 中執行，安全性最高但門檻也最高。這篇文章對照三者的安裝門檻、硬體需求、適用情境與限制，搭配 [威脅模型](../basics/threat-model.md) 提供選擇的判斷依據。
