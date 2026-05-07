---
title: 什么是 Tails？
description: Tails，全名为「The Amnesic Incognito Live System」（无记忆的匿踪系统），是一个以提升用户隐私与网络匿名性为目标的操作系统。
icon: material/chat-question

---
# :material-chat-question: 什么是 Tails？

<figure markdown="span">
    <a href="https://upload.wikimedia.org/wikipedia/commons/9/99/Tails-logo-flat-inverted.svg" target="_blank">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Tails-logo-flat-inverted.svg"
            alt="Tails 是一个可携带的操作系统，能够抵御网络监控与审查。"
            title="Tails 是一个可携带的操作系统，能够抵御网络监控与审查。"
        >
    </a>
    <capture>Tails 是一个可携带的操作系统，能够抵御网络监控与审查。[^1]</capture>
</figure>

[Tails](https://tails.net/){target="_blank"}，全名为「The Amnesic Incognito Live System」（无记忆的匿踪系统），是一个以提升用户隐私与网络匿名性为目标的操作系统。基于 [Debian Linux](https://zh.wikipedia.org/zh-cn/Debian){target="_blank"}，Tails 可以从 USB 随身碟或外接硬盘启动，无需安装在电脑硬盘上，并在关闭后不留下任何用户痕迹。这样的设计使其成为追求隐私和对抗监控的用户的理想选择。

Tails 的核心功能是通过预先安装好的 Tor 网络来匿名化网络流量。Tor 能够隐藏用户的 IP 地址，并加密传输数据，使其难以被追踪或监控。Tails 也内建多种隐私保护工具，包括加密的电子邮件软件、用于安全地删除文件的工具以及使文件匿名化的应用软件。

<figure markdown="span">
    <a href="https://tails.net/index/laptop.svg" target="_blank">
        <img src="https://tails.net/index/laptop.svg"
            alt="Tails 可以运行在 USB 随身碟或外接硬盘中。"
            title="Tails 可以运行在 USB 随身碟或外接硬盘中。"
            style="width: 80%;"
        >
    </a>
    <capture>Tails 可以运行在 USB 随身碟或外接硬盘中[^1]</capture>
</figure>

Tails 也注重用户的便利性，提供一套完整且熟悉的桌面环境，让用户能够在安全的情况下使用日常的应用软件。为了应对不断变化的网络威胁，Tails 定期更新（通常四周为一个更新周期[^2]），以持续提升其安全性。

在现今注重网络自由与隐私的时代，Tails 成为那些面临网络审查、新闻媒体、独立记者、公民团体以及任何重视个人隐私的用户的重要工具。通过与 Tor 和 OONI 等组织的合作，Tails 努力保障每一个人都能在网络世界中自由自在地交流与表达意见。

!!! info "工作坊活动"
    我们曾经在 2025/02/23 与 Tor/Tails 团队举办过一场[工作坊活动](../blog/posts/rightscon25-pre-event.md)，活动对象针对在台湾的新闻媒体、独立记者、公民团体的日常使用情境推广使用。预计规划在台湾举办更多的工作坊活动，可以通过这里持续关注我们。

## 如何运作

### 何处都是你的电脑

Tails 的下载大小为 1.6 GB，安装时间约为半小时。Tails 可以安装在任何至少 8 GB 的 USB 随身碟上，并可在大多数不超过 10 年的电脑上运行。关闭 Tails 后，即可重新启动该电脑上原本的操作系统。

您不必担心电脑中有病毒，因为 Tails 是独立于其他操作系统运行的，并且从不使用该电脑的硬盘（因为是运行在内存中）。但是，如果您从有病毒的电脑上初次安装 Tails，或者在具有恶意硬件（例如键盘记录器）的电脑上使用 Tails，它不一定能够始终保护您。

### 自动遗忘

<figure markdown="span">
    <a href="https://tails.net/about/amnesia.svg" target="_blank">
        <img src="https://tails.net/about/amnesia.svg"
            alt="Tails 关闭后会自动遗忘，重启后如同全新的环境不留下踪迹"
            title="Tails 关闭后会自动遗忘，重启后如同全新的环境不留下踪迹"
            style="width: 80%;"
        >
    </a>
    <capture>Tails 关闭后会自动遗忘，重启后如同全新的环境不留下踪迹[^1]</capture>
</figure>

Tails 总是从原始干净状态开始，当您关闭 Tails 时，您所做的一切都会自动消失。在没有使用 Tails 的情况下，几乎您做的每件事情都可能在电脑上留下痕迹：

- 您曾造访的网站，即使是在隐私模式下
- 您打开过的文件，即使您已删除它们
- 密码，即使您使用密码管理器
- 您使用过的所有设备和 Wi-Fi 网络

相反地，Tails 从不将任何数据写入硬盘，而是仅从电脑的内存中运行。当您关闭 Tails 时，内存会被完全删除，抹去所有可能的痕迹。

### 数字安全工具包

Tails 包含了一系列开源应用软件，用于处理敏感文件和保证安全的通信。所有应用程序均为即时可用，并设置为安全的默认值以防止后续调整错误。

Tails 包含：

- **Tor 浏览器**搭配 **uBlock**，一款安全的浏览器和广告拦截器
- **Thunderbird**，用于加密电子邮件
- **KeePassXC**，用于创建和存储强密码
- **LibreOffice**，一套办公软件套件
- **OnionShare**，用于通过 Tor 共享文件、网站和聊天室
- **Metadata Cleaner**，用于移除文件中的元数据
- ... 以及[其他更多的软件](https://tails.net/doc/about/features/index.en.html){target="_blank"}。

为了防止错误：

- 应用程序若试图不通过 Tor 连接到互联网，则会自动被断线。
- 永久存储中的所有内容都会自动加密。
- Tails 不会将任何内容写入硬盘，关机时内存会被完全删除。

### 在互联网上不留下痕迹

<figure markdown="span">
    <a href="https://tails.net/about/footprints.svg" target="_blank">
        <img src="https://tails.net/about/footprints.svg"
            alt="Tails 不留下踪迹"
            title="Tails 不留下踪迹"
            style="height: 350px;"
        >
    </a>
    <capture>Tails 不留下踪迹[^1]</capture>
</figure>

- Tails 的网络活动都会经过 Tor 网络，Tor 通过三个中继节点来加密和匿名化您的连接。每个中继节点都由世界各地的不同个人或组织运营。单个中继节点永远不会同时知道加密连接的来源和目的地，即使某些节点具有恶意，Tor 通过其设计确保安全。Tor 网络拥有超过 6,000 个中继节点，运营这些节点的组织多样，包括 MIT 等大学、Riseup 等科技社群、Derechos Digitales 等非营利组织，以及 Private Internet Access 等互联网托管公司。运营 Tor 节点的多样性增加了其安全性和可持续性。
- Tails 可以防止他人监视您的网络连接，从而得知您在网络上的活动。因为审查者无法知道您正在访问哪些网站，因此可以规避网络审查。如果您所在的地区无法连接 Tor 或连接 Tor 具有危险性（例如在某些审查严格的国家），您可以使用 "桥接（bridge）" 来隐藏您已连接到 Tor 网络的事实。
- Tails 可以防止您访问的网站知道您的所在位置和身份，同时可以匿名浏览网站或更改身份。追踪者和广告商将无法追踪您的网络活动。您可以使用 Tails 完全匿名地浏览或管理社交媒体，只要您仅在 Tails 上访问它，这些活动就无法与您关联。您可以在永久存储中存放与此不同身份相关的文件和图片，使用 KeePassXC 保管密码，并在 Thunderbird 里使用专门的电子邮件等。

## 如何安装

Tails 可以从 Windows、macOS、Ubuntu/Linux 操作系统中制作 USB 启动盘，详细的安装过程与步骤可以[参考网站上的介绍](https://tails.net/install/index.en.html){target="_blank"}。

??? warning "硬件系统要求"

    Tails 可以运行在：

    - 大部分不超过 10 年的电脑。
    - 一些使用 Intel 处理器的旧电脑上。

    Tails 不能运行在：

    - 新的苹果电脑，如 M 系列芯片上（M1 ~ M4）。
    - 智能手机与平板。
    - Raspberry Pi。

    Tails 或许不能运行在：

    - 内存不足 2 GB 的旧电脑上。
    - 某些较新的电脑，例如，如果其显卡与 Linux 不兼容，可能会有问题。Nvidia 或 AMD Radeon 显卡在 Tails 中常常无法正常运作。

    了解更多目前已知的[硬件问题](https://tails.net/support/known_issues/index.en.html){target="_blank"}。

??? info "建议的硬件需求"

    - 至少 8 GB 大小的 USB 随身碟。（安装时 USB 上的数据会全部清空）
    - 可以从 USB 启动的设备。
    - 64 位元 [x86-64](https://zh.wikipedia.org/zh-cn/X86-64){target="_blank"} 或 [IBM PC 兼容](https://zh.wikipedia.org/zh-cn/IBM_PC%E5%85%BC%E5%AE%B9%E6%9C%BA){target="_blank"} 的处理器。
        - Tails 无法在 [ARM](https://zh.wikipedia.org/zh-cn/ARM%E6%9E%B6%E6%A7%8B){target="_blank"}、[PowerPC](https://zh.wikipedia.org/zh-cn/PowerPC){target="_blank"} 或 32 位元的处理器上执行。
    - 至少 2 GB 的内存大小在该计算机设备上，以避免使用时卡顿或系统崩溃。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 网络自由为什么重要？](../basics/internet-freedom.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-access-point-network: ASNs 自治网络观测数据分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 网站检测列表](../taiwan/ooni-checklist.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>

[^1]: [图片来源自 tails.net](https://tails.net/)
[^2]: [Should I update Tails using apt upgrade or Synaptic?](https://tails.net/support/faq/index.en.html#upgrade)
