---
title: Tails、Whonix、Qubes 的差别
description: 三套常见匿名操作系统的设计目标、适用情境与门槛比较。记者、社运参与者、IT 从业者如何挑选，跟单纯用 Tor Browser 差在哪。
icon: material/compare-horizontal
---

# :material-compare-horizontal: Tails、Whonix、Qubes 的差别

多数匿名浏览需求，装 [Tor Browser](./what-is-tor.md) 就够用。但有些工作会把整台电脑的安全前提一起拖下水：审阅外来机敏档案、长期维持一个跟你日常身分切开的工作流、要在不信任的硬件上做敏感任务。这时要连操作系统一起切。

社群最常被一起提到的三套匿名操作系统是 [Tails](https://tails.net/){target="_blank"}、[Whonix](https://www.whonix.org/){target="_blank"}、[Qubes OS](https://www.qubes-os.org/){target="_blank"}。它们的设计目标不同，适合的情境也不同。动手前先回头看 [威胁模型如何建立](../basics/threat-model.md)，把「我在抗谁、能投入多少」厘清，比直接挑工具更重要。

!!! tip "30 秒结论"

    - **短期高敏任务、不信任手边电脑**：Tails。U 盘开机、关机遗忘，1 小时上手。
    - **长期需要 Tor 工作流、希望保留设定与档案**：Whonix。双虚拟机跑在你日常操作系统里，跨平台。
    - **愿意付学习成本、要做严格 compartmentalization**：Qubes OS。整台电脑切成多个隔离 qube，IT 阵营与高敏感长期任务首选。

    展开细节见下方各节。

## 三套要解决的问题不一样

整机隔离跟浏览器隔离的差别在攻击面的大小。Tor Browser 处理的是网页连线跟身分绑定那一层，但你电脑上其他应用程序（Email 客户端、云端硬盘、IDE、输入法、剪贴板、字体缓存）都还在主机上，跟 Tor 流量并行，留下交叉识别的机会。

Tails、Whonix、Qubes 各自处理这个问题的方向不同。Tails 走抛弃式路线，整次工作阶段在 USB 上跑，关机就消失。Whonix 换另一条路：在你日常操作系统里架两台虚拟机，一台 Gateway 锁住所有对外流量强制走 Tor，一台 Workstation 给你做事，整套设定可以持久保留。Qubes 则拉到更上层，用 Xen hypervisor 把电脑切成多个 qube，每个任务在自己的 qube 里跑，硬件层的攻击更难跨界。

## 五个比较轴

读每一套时可以对照这五个轴：

1. **隔离模型**：如何切「敏感任务」与「其他东西」的界线。
2. **持久性**：关机后是清空、还是保留你的工作。
3. **硬件需求**：能不能用你手边的电脑。
4. **学习曲线**：第一次用要花多久才顺手。
5. **Tor 整合方式**：流量强制走 Tor，还是要手动处理。

## 轴度速查表

| 轴度 | Tails | Whonix | Qubes OS |
|------|-------|--------|----------|
| 隔离模型 | 整机重置（amnesic） | 双 VM：Gateway + Workstation | 多 VM compartmentalization |
| 持久性 | 默认遗忘，可选 Persistent Storage | 持久（VM 状态保留） | 持久（template + qubes） |
| 硬件需求 | Intel x86-64，10 年内机种多数可 | 跨平台（Windows、macOS、Linux），有 VirtualBox 或 KVM 即可 | 对硬件挑剔，要 VT-x、VT-d、16 GB+ RAM、SSD |
| 学习曲线 | 1 小时上手 | 半天到一天理解双 VM | 一周适应 qube 操作流程 |
| Tor 整合 | 强制全流量走 Tor | Gateway 强制 Workstation 走 Tor，主机 OS 不必走 | 默认不强制，需安装 Whonix 模板才有 Tor |
| 对应角色 | 记者、社运短期任务、家暴幸存者准备离开 | 长期 Tor 工作流、IT 从业者、跨平台需求 | IT 阵营、高敏感长期任务、严格 compartmentalization |

## Tails

[Tails](./what-is-tails.md) 从 USB 随身碟启动，跑在电脑的内存里，不写硬盘。所有流量强制走 Tor。关机时内存清空，没有任何使用纪录。完整介绍见 [什么是 Tails](./what-is-tails.md)。

**适合**：

- 记者采访敏感议题，要保护消息来源、处理外来机敏档案。
- 社运参与者在行动现场使用陌生网络、共用空间电脑。
- 家暴幸存者准备离开时，需要在加害者看不到的环境中联系支援机构。
- 跟记者、爆料者初次接触与档案交换（搭配 [OnionShare](./onionshare.md)）。
- 不信任手边电脑的单次任务（合作夥伴的笔电、出差住宿提供的工作站）。

**限制**：

- 不适合当日常操作系统。每次开机重置，要重设 Wi-Fi、重装书签、重做设定。
- 不支持 Apple Silicon（M1 到 M4），要找 Intel 时代的旧 Mac 或 PC。
- 默认无持久状态，要做长期工作必须开 Persistent Storage（加密区），密码遗失就资料全失。
- 对固件层攻击（BIOS、Intel ME）跟硬件键盘侧录器无防御。

## Whonix

[Whonix](https://www.whonix.org/){target="_blank"} 把匿名操作系统拆成两台虚拟机跑在你日常电脑上：

- **Gateway**：唯一连网的 VM。所有外向流量强制走 Tor。
- **Workstation**：你实际做事的 VM。它的网络只能透过 Gateway 出去，没有其他出口。

这个双 VM 架构保证 Workstation 上任何应用程序（即使是恶意软件）都无法绕过 Tor 直接连网。Gateway 与 Workstation 都是 Debian 基底，跟 Tails 系出同源。可以跑在 [VirtualBox](https://www.whonix.org/wiki/VirtualBox){target="_blank"}、[KVM](https://www.whonix.org/wiki/KVM){target="_blank"}，或是后面会提到的 Qubes OS 上。

**适合**：

- 长期需要维持一个跟主机切开的 Tor 工作流（每天开机就有同样的书签、设定、档案）。
- 已经会 VirtualBox 或 KVM 的 IT 从业者、开发者，导入成本低。
- 跨平台需求：Windows、macOS、Linux 主机都能跑。
- 不方便找 Intel x86-64 PC、但手边有现成笔电的使用者，Whonix 是切进整机隔离的折衷选项。

**限制**：

- 安全前提依赖主机 OS。主机被入侵了，Whonix VM 内的工作也保护不到（Qubes 解这层）。
- VM 跑两台会吃掉 4 GB+ 内存，旧机跑起来会明显卡顿。
- 不像 Tails 关机就清空，Whonix 是持久环境，使用纪录会累积在 VM 内。
- macOS 上 Apple Silicon 机型要用 [UTM](https://mac.getutm.app/){target="_blank"} 或 QEMU 跑 ARM64 版本，部分功能尚未完整支持，社群仍在追进度。

## Qubes OS

[Qubes OS](https://www.qubes-os.org/){target="_blank"} 处理的是更前面的问题：整台电脑的隔离。Tails、Whonix 主要围绕 Tor 流量设计，Qubes 不默认走 Tor，要解决的是同一台电脑上工作、个人、银行、敏感任务如何互不影响。它用 Xen hypervisor 把操作系统切成多个 qube，每个 qube 是一个独立的 VM，有自己的颜色标示（红 = 高敏感、黄 = 工作、绿 = 个人、蓝 = 银行等）。

设计重点：

- **Template VM**：一个基底（例如 Debian、Fedora），所有衍生 qube 共享这个 template 的应用程序，但各自有独立的 home。修补一次 template，所有衍生 qube 一起更新。
- **Disposable VM**（dispVM）：开启可疑档案、浏览不信任网站时，建立一次性 qube，关闭时自动销毁。
- **颜色 + 视窗边框**：不同信任等级的 qube 视觉上分明，避免「我以为这是工作 qube 结果是个人 qube」的混淆。
- **sys-net、sys-firewall、sys-usb**：网络、防火墙、USB 三个系统 qube 各自隔离，恶意 USB 进来只能影响 sys-usb，没办法跨到工作 qube。

**Qubes 与 Whonix 的组合**：Qubes 默认不强制流量走 Tor，但官方支持 [安装 Whonix template](https://www.whonix.org/wiki/Qubes){target="_blank"}，把 Whonix Gateway 与 Workstation 包进 Qubes 的 qube 框架。这是技术上「最强隔离 + Tor 整合」的组合，多数需要这层保护的人会走这条路。

**适合**：

- IT 阵营、安全研究员、长期高敏感任务工作者。
- 愿意付学习成本，把 work / personal / banking / 高敏 / 一次性 五类任务严格分到不同 qube 的进阶使用者。
- 已经有支持硬件（VT-d 必要、16 GB+ RAM、SSD），不用再为 Qubes 换机器。

**限制**：

- 对硬件挑剔。CPU 必须支持 VT-x 与 VT-d，内存建议 16 GB 以上，需要 SSD。买机前一定要查 [Hardware Compatibility List](https://www.qubes-os.org/hcl/){target="_blank"}。
- 学习曲线陡。第一周会在「我这个档案要在哪个 qube 开」、「这个 USB 要怎么跨 qube 传档」这类操作上摸索。
- 默认无 Tor 整合，要 Tor 必须额外装 Whonix template。
- 不支持 Apple Silicon。

## 对应角色做选择

依 [威胁模型](../basics/threat-model.md) 的角色思考：

- **一般使用者**（没有特别敏感工作）：通常不需要这三套任何一套，[Tor Browser](./what-is-tor.md) + [密码管理器](./password-manager.md) 已经涵盖多数场景。
- **记者**（保护消息来源）：默认 Tails。详细工作流见 [记者保护消息来源](../scenarios/journalist.md)。长期跑很多采访、累积大量档案，可考虑升级到 Whonix（搭配 [上传机敏资讯流程](../community/upload-sensitive.md)）。
- **社运参与者**：行动现场 Tails（U 盘带着走，被临检时抽出来），长期协作回家用一般笔电 + Signal。详细场景见 [社运行动者的数位准备](../scenarios/activist.md)。
- **家暴幸存者**（准备离开）：Tails 在加害者看不到的环境（图书馆、咖啡店）使用，避免家庭网络与共用装置上留下任何痕迹。
- **IT 从业者、安全研究员**：依硬件与时间投入挑 Whonix（低门槛）或 Qubes（高隔离）。需要把 work / personal / banking 严格分开的选 Qubes。
- **跨平台 macOS 使用者**：Apple Silicon 机型实际可选的只有 Whonix on UTM（仍实验性）。要做严肃的整机隔离工作，多数人会准备一台 Intel PC。

!!! info "anoni.net 是台湾的社群"

    下面这段反映 anoni.net 在台湾的社群实践与硬件取得脉络，其他简中读者可以对照当地情境参考。

    - **取得管道**：Tails、Whonix、Qubes 三套官网在台湾都直连无问题，下载速度可考虑 [Tails 镜像清单](https://tails.net/install/index.en.html){target="_blank"}。Tor Browser 不必桥接就能下载，这层门槛比审查地区低得多。
    - **硬件取得**：台湾常见的 Intel-based ThinkPad（X、T、P 系列）多数在 Qubes HCL 上有相容纪录。Apple Silicon 在 Tails 与 Qubes 上不可用，买机前一定先查 [HCL 官方页](https://www.qubes-os.org/hcl/){target="_blank"}。Whonix 跨平台灵活，现有笔电多半能跑。
    - **社群实践**：anoni.net 社群长期推 Tails 工作坊，2025 年 2 月跟 Tails、Tor 团队在台北办过一场 [Pre-RightsCon 工作坊](../blog/posts/rightscon25-pre-event.md)。Whonix、Qubes 在台湾社群既有经验较少，如果你长期使用任一套，欢迎到 [Matrix 公开 room](../community/tools.md) 分享经验。

## 常见问题

??? question "我只是想匿名浏览，需要这么复杂吗？"

    多数情境不需要。[Tor Browser](./what-is-tor.md) 在你日常电脑上装起来，就能解决「不洩漏 IP、不洩漏浏览身分」这层需求。会走到整机隔离这套讨论，通常是因为「我电脑上其他应用、其他档案会跟敏感任务交叉」、「我不信任手边这台电脑」、「我长期维持一个跟日常身分切开的工作流」。如果你的需求是单次匿名浏览，不必动到 Tails、Whonix、Qubes 任何一套。

??? question "Tails 上能不能也跑 Whonix？"

    技术上可，实务上不建议。Tails 设计就是整台机器强制走 Tor、关机遗忘，再叠一层 Whonix 双 VM 架构是把已经够强的隔离又包一层。两套设计目标不重叠。短期任务 Tails 自己就够，长期 Tor 工作流改用 Whonix（直接装在主机 OS 上）会比较顺，要做严格 compartmentalization 应该整套换 Qubes（搭配 Whonix template）。混用没有显著好处且增加维运负担。

??? question "Qubes 真的需要这么好的硬件吗？"

    要。Xen hypervisor 与多 qube 平行跑要 CPU 支持 VT-d（很多消费级 CPU 没有，买前必查）、内存建议 16 GB 起跳（每个 qube 自己佔 1-2 GB）、SSD 必要（HDD 跑多 qube 会卡到崩溃）。没有支持硬件就直接跑不起来，这是 Qubes 的硬性门槛。预算有限的话，从 Whonix 开始累积经验，硬件升级后再转 Qubes 是合理路径。

??? question "Mac M 系列能跑哪一套？"

    - **Tails**：完全不能。Tails 不支持 Apple Silicon。
    - **Whonix**：可以透过 [UTM](https://mac.getutm.app/){target="_blank"} 跑 ARM64 版本，仍在社群实验阶段。日常可用但要追进度。
    - **Qubes**：完全不能。Qubes 需要 x86-64 + VT-d，Apple Silicon 是 ARM 架构，没有计画支持。

    多数 Apple Silicon 使用者要做整机隔离，会准备一台 Intel PC（二手 ThinkPad 是常见选择）。

??? question "我已经会 Linux，能跳过 Tails 直接学 Qubes 吗？"

    可以，但要评估三件事：硬件成本（Qubes-相容机可能要新买）、学习投入（一周内无法上手）、实际使用频率（装起来放着不用会浪费）。如果你的需求是「短期高敏任务」，跳过 Tails 直接 Qubes 过头。如果你的需求是「长期严格 compartmentalization」，跳 Tails 直接 Qubes 是合理的。中间地带可以从 Whonix 过渡。

## 接下来

Tails 的完整介绍与安装步骤在 [什么是 Tails](./what-is-tails.md)。Whonix 从 [官方下载页](https://www.whonix.org/wiki/Download){target="_blank"} 起步，VirtualBox 路径最简单。Qubes 的硬件门槛高，建议先到 [Hardware Compatibility List](https://www.qubes-os.org/hcl/){target="_blank"} 确认手边机器能不能跑，再去抓 [安装镜像](https://www.qubes-os.org/downloads/){target="_blank"}。

整机隔离只是匿名实践的一块。连线层的 [Tor](./what-is-tor.md)、浏览器层的 [Tor Browser 进阶设定](./tor-browser-advanced.md)、档案传输的 [OnionShare](./onionshare.md) 都是配套，要看自己的威胁模型整体配。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:simple-tails: 什么是 Tails](./what-is-tails.md)
- [:material-share-variant-outline: OnionShare](./onionshare.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-newspaper-variant-outline: 记者保护消息来源](../scenarios/journalist.md)
- [:material-upload-outline: 上传机敏资讯流程](../community/upload-sensitive.md)
- [:material-account-group-outline: 社运行动者的数位准备](../scenarios/activist.md)

</div>
