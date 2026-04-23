---
date: 2026-04-19
authors:
    - toomore
categories:
    - 更新
    - Tor
    - 翻译文章
slug: 2026-code-audit-for-tor-vpn-completed-by-cure53
image: "https://forum.torproject.org/uploads/default/original/2X/4/4825413b93e0884f51aed631e4111ded9a117e60.jpeg"
summary: "Cure53 完成 TorVPN Android 版与 Onionmasq 的安全审计，核心 Tor 整合稳固，已追踪各项建议的后续修复进度"
description: "Tor Project 委托 Cure53 完成 TorVPN Android 版的渗透测试与源码审计，涵盖 Onionmasq 网络层，审计结果显示核心路由稳固，并指出输入验证、DNS 处理与移动安全等改进方向"
---

# Cure53 完成 Tor VPN 安全审计

!!! info ""

    以下内容的原文翻译来自这篇文章，叙述主语为 Tor Project：

    - [Code audit for Tor VPN completed by Cure53 | April 15, 2026](https://blog.torproject.org/code-audit-tor-vpn/){target="_blank"}

![TorVPN Cure53 Audit](https://forum.torproject.org/uploads/default/original/2X/4/4825413b93e0884f51aed631e4111ded9a117e60.jpeg){style="border-radius: 10px;"}

Tor Project 持续扩展移动隐私防护的工具布局，TorVPN 是其中一项重要计划：让 Tor 的保护能力更容易被普通移动用户所使用，同时维持强健的安全保障。2025 年 6 月，知名安全公司 Cure53 受托对 **TorVPN Android 版**及其底层网络组件进行了渗透测试与源码审计。这份报告于 2026 年 4 月 15 日正式公开。

<!-- more -->

## 审计范围

本次审计涵盖两个主要组件：

1. **TorVPN for Android**：负责将设备流量路由至 Tor 网络的移动端应用程序
2. **Onionmasq / Arti 的 Tunnel Interface**：以 Rust 编写的网络层，处理 TCP/UDP 解析、DNS 解析及流量路由至 Tor 网络

## 审计发现

审计结果指出，「Tor 的核心集成仍然稳固，在通道建立与路由方面没有根本性问题。」主要问题集中在以下几个方面：

### 输入验证不完整

多处验证机制存在缺口，可能在边缘场景下导致非预期行为。

### DNS 处理弱点

特定情况下 DNS 解析逻辑可能触发拒绝服务（Denial of Service）条件，虽属罕见场景，但仍需妥善处理。

### 加密与密码学建议

审计提出数项加密强化建议，包括：

- 实现**证书绑定（certificate pinning）**，防范中间人攻击
- 改善**随机数生成**的质量与来源

### 移动安全问题

针对 Android 平台，审计提出两项常见移动安全缺口：

- **明文存储配置数据（plaintext configuration storage）**：配置数据若未加密存放，在设备被入侵或其他 App 获得读取权限时存在泄露风险
- **缺乏 root 检测（root detection）**：未对 root 设备环境进行警示或防护，影响在受感染设备上的安全保障

## 后续处理

所有审计发现均已纳入 Tor Project 的持续安全改进计划，列为优先项目的包括：验证逻辑补强、资源管理改进，以及采用已经过完善安全审查的函数库。

完整审计报告可在此下载：[torvpn_cure53_audit.pdf](https://blog.torproject.org/code-audit-tor-vpn/torvpn_cure53_audit.pdf){target="_blank"}

## 在中国使用 TorVPN 需要关注的三个方向

1. **DNS 污染让弱点不再「罕见」**：审计中指出的 DNS 处理弱点，在防火长城（GFW）环境下重要性截然不同。GFW 对 DNS 的系统性污染是常态，而非边缘情境，这意味着 TorVPN 在 DNS 层面的稳健性直接影响工具能否连上 Tor 网络。在评估工具可靠性时，这项发现值得优先参考。

2. **明文配置存储在设备被查扣时风险更高**：审计指出配置数据以明文存储于设备，在台湾可能是合规讨论，在中国则涉及更直接的安全风险——一旦设备被没收或检查，未加密的配置内容可能暴露使用记录与工具痕迹。对于高风险使用者来说，这是选择工具前必须评估的因素。

3. **独立审计是信任的前提，而不是保证**：在中国，宣称「安全」的工具很多，但经过独立第三方审计并公开报告的极少。Cure53 的这份报告展示了透明审计的样本——既指出问题、也说明修复路径。了解如何阅读和判断安全审计报告，是在高风险网络环境中做出负责任工具选择的基本能力。

!!! info "参考资料"

    本文整理自 Tor Project 官方公告 [Code audit for Tor VPN completed by Cure53](https://blog.torproject.org/code-audit-tor-vpn/){target="_blank"}。
