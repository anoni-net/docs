---
title: Tails、Whonix、Qubes 的差别
description: 三套常见匿名操作系统的设计目标、适用情境与门槛比较。
icon: material/compare-horizontal
---

# :material-compare-horizontal: Tails、Whonix、Qubes 的差别

!!! info "撰写中（预计 2026 Q2 完成）"
    主题大纲已收齐，正在汇整三套操作系统的安装门槛、硬件需求与适用情境表格。实际撰写预计 2026 Q2，下方段落是目前的方向。如果你长期使用 Tails、Whonix 或 Qubes 任一套，欢迎到 [Matrix 公开 room](../community/tools.md) 分享经验，或在 GitHub 认领这篇撰写，流程见 [如何参与](../community/how-to-contribute.md)。

匿名操作系统有几个常被一起提到的选项，但它们解决的问题不同。Tails 强调即用即丢、低门槛、适合短时间任务。Whonix 采用「Gateway + Workstation」的双虚拟机架构，把 Tor 连线和应用程序分离，适合需要长期维持匿名身份的场景。Qubes OS 则用严格的隔离设计，把每个身份、任务分到不同的 qube 中执行，安全性最高但门槛也最高。这篇文章对照三者的安装门槛、硬件需求、适用情境与限制，搭配 [威胁模型](../basics/threat-model.md) 提供选择的判断依据。
