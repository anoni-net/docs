---
date: 2026-04-10
authors:
    - toomore
categories:
    - 更新
    - Tor
    - Relay
    - 翻译文章
slug: a-server-that-forgets-exploring-stateless-relays
summary: "Tor Project 讨论 Stateless Relay：从扣押风险、TPM、远程证明到 re-sealing 等未解问题，评估无状态中继的安全与运维取舍。"
description: "完整翻译 A Server That Forgets: Exploring Stateless Relays，梳理无状态 Tor Relay 的设计脉络、现有路线与开放问题，文末补充台湾在地视角。"
---

# 一台会遗忘的服务器：探索 Stateless Relays

!!! info ""

    以下内容为原文翻译，主语角色来自 Tor Project 与原作者团队：

    - [A Server That Forgets: Exploring Stateless Relays | April 8, 2026](https://blog.torproject.org/exploring-stateless-relays/){target="_blank"}

    文末另有一节「**中国语境下的延伸讨论**」，整理这篇文章放在中国现实环境里可继续讨论的方向，欢迎直接跳读。

[![A Server That Forgets](https://forum.torproject.org/uploads/default/original/2X/e/ee9375b0ec3906d4a0338bc230d97d0a659d996a.jpeg){style="border-radius: 10px;"}](https://blog.torproject.org/exploring-stateless-relays/){target="_blank"}

运行 Tor relay 需要持续对抗对手，这些对手可能来自私人势力，也可能来自国家级体系，目标是通过攻击节点来削弱整个网络。此外，一些运营者还会面对扣押、搜查，或硬件被直接物理接触。这类情况在[奥地利](https://www.zdnet.com/article/austrian-man-raided-for-operating-tor-exit-node/){target="_blank"}、[德国](https://forum.torproject.org/t/tor-relays-artikel-5-e-v-another-police-raid-in-germany-general-assembly-on-sep-21st-2024/14533){target="_blank"}、[美国](https://www.npr.org/sections/alltechconsidered/2016/04/04/472992023/when-a-dark-web-volunteer-gets-raided-by-the-police){target="_blank"}、[俄罗斯](https://torservers.net/blog/2017-04-14-freebogatov-relaymob/){target="_blank"} 都有先例，而且很可能不止这些地方。在这些案例里，服务器本身就可能变成风险来源。

Tor 存在的原因，是希望保护网络用户免受不必要监控。Tor 网络的设计前提是：任何单一运营者或单一服务器，都不应该能还原“谁在和谁通信”。记者、行动者、吹哨者都依赖这个前提成立。若 relay 被扣押后可以交出内容，就会侵蚀整个系统赖以运作的信任，而这正是我们要解决的问题。

本文将讨论无状态、无磁盘操作系统如何提升 relay 安全，范围从固件到用户空间，重点放在软件完整性与抵抗物理攻击的能力。这项工作来自 [Osservatorio Nessuno](https://osservatorionessuno.org/){target="_blank"} 在意大利运营出口 relay 的实践经验。relay 的管理方式会因地区、技术能力、预算和司法环境而有很大差异。我们希望推动讨论，而不是给出唯一模型。

<!-- more -->

## 什么是无状态

无状态系统不会在重启之间保留任何数据。每次开机都从固定、已知的镜像开始，和 [Tails](https://tails.net/){target="_blank"} 的思路类似。把 Tor relay 全部跑在 RAM 的概念并不新。专门为此设计、基于 uClibc 的微型 Linux 发行版 [Tor-ramdisk](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-talk/2015-July/038493.html){target="_blank"}，至少在 2015 年就已存在。

对 relay 运营者来说，这种设计通过默认机制提高了安全门槛，也让系统更容易形成良好实践：

- **物理攻击抵抗能力**：机器若被扣押或克隆，可能没有可供分析的内容。按具体部署不同，提取 relay 密钥可能变得不可行。
- **声明式配置**：系统通过版本控制管理。无状态系统每次启动都会重新应用声明配置，不会悄悄偏离既定状态。
- **不可变运行环境**：文件系统是只读。即便攻击者拿到代码执行能力，也难以跨重启持久化恶意内容。
- **可复现性**：重启后不变化的系统更容易验证，也更有机会被复现和审计。

## 为什么 Tor relays 很难做到无状态

Tor relay 的信誉是随时间积累的。持续运行数月的 relay 会拿到带宽旗标，从而对网络更有价值。这个信誉绑定在长期加密身份密钥上。若丢失这些密钥，relay 就会失去身份，也等于失去在网络中的信誉，需要从零开始。

因此，relay 身份必须在重启后仍可保留，同时又不能被轻易提取。把密钥放在磁盘上，可能被扣押和复制。把密钥放进 TPM 这类安全芯片，对攻击者来说通常更难下手。

除身份密钥外，relay 还会积累包含带宽历史等临时信息的 state 文件。每次重启都丢弃它会影响性能。若系统完全在 RAM 中运行，操作系统就必须塞进内存，无法使用 swap。进程一旦超过可用内存，内核 OOM killer 会直接终止进程。实践上，把 glibc allocator 换成 jemalloc 或 mimalloc，可显著[降低 Tor 内存占用](https://1aeo.com/blog/tor-memory-optizations-what-actually-works.html){target="_blank"}，在高负载 guard relay 上可由约 5.7 GB 降到低于 1.2 GB，主要因为高 churn 目录缓存对象的碎片减少。

## TPM 作为主要工具

TPM（Trusted Platform Module）是主板上的专用硬件芯片，可保存加密密钥，并在不把私钥暴露给操作系统的情况下完成加密操作。TPM 支持 sealing，也就是把秘密绑定到机器特定测量状态，只有当 TPM 看到和创建密钥时一致的软件栈，密钥才可被使用。

对无状态 relay 来说，这意味着身份密钥可跨重启存活，因为它在硬件中，但即使机器被物理接触，也难以按常规方式导出。TPM 还支持远程证明，芯片可向外部系统证明机器实际启动了什么软件，并由硬件根信任签名背书。这使得节点运行内容可以在不完全信任运营者的前提下被验证。

TPM 也不能解决全部问题。Tor 使用的 ed25519 密钥并不受 TPM 原生支持，所以密钥虽然由 TPM 保护，但仍会以字节串形式存在于非易失存储中，技术上依然可能被导出。

此外，sealing 也要求你提前决定 TPM 信任哪些软件状态。更新 kernel 或 bootloader 后，测量状态会变化，你就得重新 sealing，并预测下一次启动的测量结果。

## 现有路线

不同运营者在“部署简洁度”和“安全深度”之间采用了不同取舍。

### 最小 RAM disk

最简单的做法是把所有东西跑在 RAM，密钥手动管理。从 2015 年开始，[Tor-ramdisk](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-talk/2015-July/038493.html){target="_blank"} 就在这么做。身份密钥通过 SCP 导出和导入，重启前不做就等于重来。没有 TPM、没有远程证明、没有 verified boot，只有“RAM 断电即失”这个保证。即便如此，仍比传统有磁盘状态的部署更进一步。

### VM 型 RAM disk

[Emerald Onion](https://blog.emeraldonion.org/evolving-our-tor-relay-security-architecture){target="_blank"} 在 Proxmox hypervisor 上为每个 relay 运行 Alpine Linux 镜像（每个 66 MB）。VM 全部启动进 RAM，且不挂载持久存储。身份通过 Tor 的 OfflineMasterKey 功能管理，长期 master key 离线生成，并且不接触 relay。更新依赖重建镜像，回滚容易，也不需要特殊硬件。

### 裸机 + TPM 身份绑定

我们的工具 [Patela](https://github.com/osservatorionessuno/patela){target="_blank"} 走更偏硬件信任链的路线。relay 通过 [stboot](https://docs.system-transparency.org/st-1.3.0/docs/reference/stboot-system/){target="_blank"} 启动，这个 bootloader 会拉取并验证已签名 OS 镜像，然后再把控制权交给系统。启动后，节点通过 mTLS 从中心服务器拉取配置。即便中心服务器被攻破，攻击者可以拒绝服务，但不能向节点下发凭据，也不能从节点提取密钥。relay 的身份密钥存在 TPM 非易失区域，并绑定测量启动状态。它可以跨重启存活，同时在物理接触场景下也难以导出。代价是运维复杂度更高，需要裸机环境，而且每次更新后都要重新 sealing。

## 开放问题

有些问题只出现在我们当前部署中，有些则是所有无状态 relay 都会遇到。

### 更新后重新 sealing

当软件栈变化时，TPM 的测量状态也会变化。如何自动化这件事，也就是预测更新后启动测量值，仍是最难的未解问题之一。systemd-pcrlock 这类工具正朝这个方向推进，但还没有到开箱即用。

### 无状态重启与升级冲突

我们目前用标准 unattended upgrades 更新 Tor binary。但重启会回到 OS 镜像，而镜像里可能还是旧版本，结果变成非预期降级。怎样同时兼顾自动安全更新与无状态镜像，目前还没完全解决。

### 内存约束

没有 swap 意味着进程一旦超出可用内存，就可能在没有预警下被杀掉。Tor 运行时的内存用量很难准确预测。前面提到的 allocator 替换帮助很大，但底层约束依然存在。

### 网络稳定性

持久更新只能通过重建镜像并再次启动来应用。relay 如果重启太频繁，可能失去 Stable 旗标，进而影响网络分配给它的流量。

## 未来方向

### 远程证明

Sealing 是把密钥绑定到机器状态。Attestation 则是让节点向外部证明这个状态。验证方，比如配置服务器，甚至未来可能是 Tor directory authorities，都可以发起加密挑战，只有运行在预期软件栈上的节点才能正确应答。这让启动完整性从本地属性变成可远程验证属性，减少对运营者的信任依赖。

### 透明日志

当你有可测量启动链，就可以公开它。relay 运营者提供可复现构建配方，任何人都能重算预期哈希，并检查是否与 TPM 报告一致。只追加型透明日志可以让这些证明公开可审计。Tor 社群可以运行独立监测机制，跨整个 relay fleet 跟踪这些状态。

### 机密计算

VM 路线还可以扩展到 AMD SEV-SNP 这类技术，让 guest VM 内存与 hypervisor 本身隔离。这同样有助于减少对运营者的信任，也能缩小 VM 和裸机路线之间的安全差距。

### 更小型硬件

Walking onions 是一个提议中的 Tor 协议扩展，目标是让节点不必在本地持有整个网络视图。若 arti 及相关工具能在更小型硬件上运行，当前资源条件不足以承载 relay 的设备，也可能进入可行范围。

## 结论

对 Tor 这类系统来说，无状态设计可以带来多重收益，既降低攻击成功概率，也降低运营失误风险。若后续研究和工程继续推进，整体网络可验证性与可信度仍有提升空间。

无状态系统有真实运维成本，也有难度很高的未解问题，即便是资源更充足的团队也一样。但它依然可以作为改进隐私基础设施的基础，相关概念和框架也可应用到技术栈的其他层。

这项工作起始于 [Tor Community Gathering 2025](https://tcg2025.4711.se/sessions/stateless_tor_relay/){target="_blank"}，目前仍在持续。如果你运营 relay、开发 Tor 工具，或对这些开放问题有想法，我们很希望听到你的反馈。

## 参考资料（原文列举）

- [Stateless Tor Relay – Tor Community Gathering 2025](https://tcg2025.4711.se/sessions/stateless_tor_relay/){target="_blank"}
- [Patela v1: A Basement Full of Amnesic Servers](https://osservatorionessuno.org/blog/2025/05/patela-a-basement-full-of-amnesic-servers/){target="_blank"}
- [Patela v2: From Certificates to Hardware](https://osservatorionessuno.org/blog/2025/12/patela-v2-from-certificates-to-hardware/){target="_blank"}
- [stboot System Documentation – System Transparency](https://docs.system-transparency.org/st-1.3.0/docs/reference/stboot-system/){target="_blank"}
- [Tor-ramdisk 20150714 Release Announcement](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-talk/2015-July/038493.html){target="_blank"}
- [Evolving Our Tor Relay Security Architecture – Emerald Onion](https://blog.emeraldonion.org/evolving-our-tor-relay-security-architecture){target="_blank"}
- [Tor Memory Optimizations: What Actually Works – 1AEO](https://1aeo.com/blog/tor-memory-optizations-what-actually-works.html){target="_blank"}

!!! info "中国语境下的延伸讨论"

    放回中国语境，这段讨论聚焦在本地落地条件。中国的网络治理、平台合规要求、IDC 运营规范和跨境连接现实，都在直接影响 relay 方案能否长期稳定运作。

    在顺利情境下，团队可以把无状态镜像、密钥管理、应急流程做成标准化手册，减少“靠个人经验顶住”的压力。  
    在不顺利情境下，即使技术架构本身更安全，仍可能因为合规沟通、托管策略和响应流程不足，导致节点难以持续运营。

    把这篇文章放回中国语境，至少有三个延伸方向值得先推进：

    1. **运营流程与风险边界**  
       若有 relay 或 exit 运营者，建议先把机房通知、投诉受理、设备处置和法律沟通流程写成标准操作。技术上先把可提取数据降到最低，才能在突发事件中降低个人与团队风险。

    2. **硬件选择与托管策略**  
       TPM 主机、小型服务器和托管服务并非不可获得，但成本结构差异很大。好的情况是，社群能沉淀出几种可复现的硬件/镜像组合，让运维和审计成本可控。若情况不理想，各团队各自组一套，最后安全主张难比较，维护成本会持续上升。

    3. **可验证运维与外部信任**  
       可测量启动链、远程证明、透明日志不只属于 Tor 技术圈，也可以连接到开源供应链与基础设施可信度讨论。理想状态下，它们会变成可复核的公共证据。若落地不佳，就可能只停留在少数技术人员内部，外部信任仍主要依赖口碑。

!!! info "原文来源"

    Tor Project, [A Server That Forgets: Exploring Stateless Relays](https://blog.torproject.org/exploring-stateless-relays/){target="_blank"}
