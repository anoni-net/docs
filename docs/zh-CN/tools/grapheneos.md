---
title: GrapheneOS：高度隐私的行动作业系统
description: GrapheneOS 把 Android 大幅安全强化并去 Google 化，是目前 hardening 最彻底的行动作业系统。当 Google 收紧 AOSP、app 厂商用 attestation 锁定非官方系统，它为重视隐私的用户保留一台自己能掌握的手机。
icon: material/cellphone-lock
---

# :material-cellphone-lock: GrapheneOS：高度隐私的行动作业系统

手机是我们身上最贴身的一台装置，随身携带、长时间连网，里面有定位、通讯录、讯息、相簿、健康记录。原厂 Android 预设绑一个 Google 账号，在背景持续回传遥测资料（装置状态与使用情形），多数应用程式又各自蒐集可识别你的资讯。想重新掌握这台手机，自行决定它连接哪些服务、向外送出哪些资料，[GrapheneOS](https://grapheneos.org/){target="_blank"} 是目前社区最常推荐的选择。

GrapheneOS 是一套以 AOSP（Android Open Source Project，Android 的开源核心）为基底、把安全防护大幅强化并移除 Google 绑定的行动作业系统，由非营利的 GrapheneOS Foundation 维护、开源开发。它缩小一台 Android 手机的攻击面、补强容易外泄资料的环节，同时把是否使用 Google 服务、以及使用方式的选择权交还给你。它的重点是安全与隐私，不在于让桌面更好看。

!!! tip "30 秒结论"

    - **它是什么**：把 Android 安全强化、移除 Google 绑定的手机作业系统，非营利、开源。
    - **它保护**：缩小手机被入侵的攻击面、把 Google 服务关进沙箱、给你逐 app 的网络与传感器开关。
    - **它不保护**：GrapheneOS 不是匿名工具，无法阻挡电信商的基地台定位，要匿名仍要搭配 [Tor](./what-is-tor.md)。
    - **硬件**：目前几乎只跑在 Google Pixel，因为只有它同时提供可重新锁回的 bootloader、安全晶片与长期更新。

    展开细节见下方各节。

## 它保护什么：核心设计

GrapheneOS 的功能可以分成三组：缩减攻击面、减少对 Google 的依赖、纳入实体与胁迫风险。以下描述以官方 [Features](https://grapheneos.org/features){target="_blank"} 页为准。

### 缩减攻击面

- **hardened_malloc**：GrapheneOS 自制的内存分配器，针对最常见的一类漏洞（内存破坏）做防御，从底层降低被攻破的机会。
- **MTE（Memory Tagging Extension，内存标记）**：ARM 的硬件功能，能在程式误用内存时当场拦截，把可能的入侵挡在造成伤害之前。需要 Pixel 8 系列之后的 ARMv9 晶片才支援。在支援的机型上，系统层预设启用。含原生代码（native code）的第三方 app 则预设不开，使用者可自行到 Settings 开启。
- **Vanadium 浏览器**：强化版的 Chromium，预设关闭 JavaScript JIT（一种把网页程式即时编译加速的机制，也是常见的攻击入口），可逐站打开。少数互动密集的网页速度会略慢，可针对该网站单独开启。
- **verified boot 与重锁 bootloader**：安装完成后，GrapheneOS 会引导你把 bootloader 重新锁回并关掉 OEM 解锁，完整启用 verified boot（开机时逐层验证系统没被窜改）。
- **Auditor app**：用手机的安全晶片，对韧体与系统的真伪和完整性做硬件层级的验证，确认没被动过手脚。

### 减少对 Google 的依赖

- **预设完全不含 Google 服务**：开机就是一套不向 Google 报到的系统（俗称 degoogled）。
- **sandboxed Google Play**：需要用到 Google app 时，GrapheneOS 把整套 Google Play 服务（Google Play 服务、Play 商店、服务框架）当成一般、无特权的应用程式，关进标准的应用程式沙箱执行。官方说明 Google Play 在 GrapheneOS 上「完全无法取得任何特殊存取或权限」。
- **逐 app 的 Network 权限**：可以对单一 app 整个断网。关闭后系统对它回报「网络不通」，连间接的网络存取也一并阻挡。
- **逐 app 的 Sensors 权限**：关闭后，该 app 无法存取加速度计、陀螺仪、指南针、气压计、温度计这些 Android 原本没有独立权限控管的传感器。
- **Storage Scopes 与 Contact Scopes**：不必把整个储存空间或整本通讯录交给一个 app，可以只授权它看你指定的档案或联络人。Contact Scopes 预设让 app 读到的通讯录是空的。

### 纳入实体与胁迫风险

- **duress PIN/password（胁迫密码）**：选择性功能，预设不启用，不设定就不会误触。启用后你会多一组密码，在任何要求解锁的画面输入它，会不可逆地抹除整台装置（连已安装的 eSIM 一起），用在被迫交出手机的情境。
- **auto-reboot（自动重开机）**：预设 18 小时没有解锁就自动重开机，回到开机后尚未首次解锁的加密状态（BFU，Before First Unlock）。资料在这个状态下更难被鉴识工具取出。时间可在 10 分钟到 72 小时之间调整或关闭。
- **USB-C 控制**：预设「锁定时只充电、不传资料」，缩小用 USB 连接埠攻击的缝隙。

## 它不解决什么：与匿名的界线

隐私与匿名的界线对 anoni.net 的读者特别重要。GrapheneOS 把重点放在 privacy（隐私）与 security（安全），它让别人更难入侵你的手机、更难从你的 app 蒐集资料，但它不宣称让你匿名。

只要连上电信商的行动网络，你就必然要向电信商表明身分，GrapheneOS 无法改变这一点，唯一能避免基地台层级定位的方式是开飞航模式。要在网络层匿名（不泄漏真实 IP、不被绑定浏览身分），仍要靠 [Tor](./what-is-tor.md)。GrapheneOS 官方也把内建的 DNS-over-TLS 明讲成「不是 Tor 或 VPN 的替代品」。

操作前先读 [匿名与隐私的差别](../basics/anonymity-vs-privacy.md)，确认你要的是哪一种保护，再用 [威胁模型如何建立](../basics/threat-model.md) 厘清自己在抗谁。桌面端的整机隔离方案见 [Tails、Whonix、Qubes 的差别](./tails-vs-whonix-vs-qubes.md)，行动端的 OS 强化跟桌面端的匿名作业系统处理的是不同层次的问题，依威胁模型搭配使用。

## 为什么几乎只支援 Pixel

GrapheneOS 对硬件的要求很严格，列在官方 [FAQ](https://grapheneos.org/faq){target="_blank"}：bootloader 要能解锁、刷完客制系统后还能重新锁回（重锁才能完整启用 verified boot）、要有安全晶片提供的 StrongBox keystore 与硬件金钥验证、韧体与作业系统都要 A/B 双槽更新加上防回滚保护、原厂还要给够长的安全更新（GrapheneOS 要求至少 5 年，Pixel 目前提供 7 年）。

目前同时满足这些条件的消费级手机几乎只有 Google Pixel。Pixel 从第 6 代起搭载 Titan M2 安全晶片（第 3 到 5 代是第一代 Titan M），这颗晶片是金钥保护与硬件验证的信任根。

GrapheneOS 目前只能跑在 Google 自家的 Pixel 上，但它要对付的，正是 Google 服务对手机的渗透。Google 对 Pixel 与 Android 的每一个政策调整，都会直接影响 GrapheneOS 的处境，而 Android 17 之后，Google 收紧的力道越来越强。

## Android 17 之后：Google 收紧 AOSP 与 Pixel 资料的开放程度

2025 年起，Google 连续两步垫高了第三方系统的开发成本。先是在 2025 年 3 月把 Android 开发移进内部分支，只在版本发布时才把原始码推上 AOSP，开发过程不再公开可追（仍是开源，但外部看不到中间的演进）。接着在 2025 年 6 月发布 Android 16 时，不再把 Pixel 的 device tree（描述机型硬件、让系统能驱动它的设定档）放进 AOSP，第三方开发者只能靠反推补回这些资料。

即使如此，GrapheneOS 在 2026 年 6 月 16 日 Android 17 发布当天就完成移植，韧性还在。它同时开始替 Pixel 找替代出路，2026 年 3 月与 Motorola 宣布长期合作，第一次把硬件选项铺到 Pixel 以外（具体机型与时间官方尚未公布）。

另一条压力来自 attestation（装置认证，由 app 在背景检查你的手机是不是「原厂认可」的状态）。Google 的 Play Integrity 把非官方系统判为不合格，连带让部分银行、企业 app 拒绝在 GrapheneOS 上执行，即使它比原厂更安全。

Google 收紧 AOSP、attestation 锁定非官方系统的完整时间轴与分析（两步收紧、Motorola 合作、Microsoft 与欧盟的动向），整理在 [Android 17 上线后的 GrapheneOS（blog）](../blog/posts/2026-grapheneos-android-17.md)。

## 实务补充与地区差异

- **取得管道**：Pixel 在不少地区没有官方销售（中国大陆、台湾、港澳等都买不到行货），多数人透过水货、海外代购或出国时自行购入。买之前先到官方 [FAQ](https://grapheneos.org/faq){target="_blank"} 确认那台是 GrapheneOS 支援的型号，二手机要特别确认 bootloader 没有被锁死（电信商绑约机常锁住 bootloader，一旦锁住就无法解锁刷机）。
- **app 锁定的实际冲击**：银行、政府、企业验证类 app 越来越常用 attestation 检查装置，GrapheneOS 使用者可能遇到某些 app 拒绝执行。对把手机当主要上网装置的人，转用前要先确认每天必用的 app 有哪些可能受影响、自己能否接受，再决定是否转移。
- **在中国大陆的情境不同**：Google 服务在中国大陆本就难以使用，degoogle 与 sandboxed Google Play 的意义跟海外不一样，但「装什么系统、装什么 app 由谁决定」的问题一样存在，甚至更尖锐；同时本地大量 app 走自家的装置认证与实名要求，非官方系统一样容易被挡。
- **侧载限制正在逼近**：Android 17 新增的应用程式侧载「开发者验证」流程，2026 年先在巴西、印尼、新加坡、泰国试行，2027 年扩大。APAC 是第一批试验场，华语地区多数不在首批，但这类政策通常会逐步扩大。
- 取得管道、app 锁定、侧载限制，指向的都是同一件事，谁有权决定你买来的手机上能跑什么系统、能装什么 app。GrapheneOS 让使用者在原厂系统之外仍然有得选。

## 常见问题

??? question "我一定要买 Pixel 吗？"

    目前实务上几乎是。只有 Pixel 同时满足 GrapheneOS 要求的可重锁 bootloader、安全晶片、完整 verified boot 与长期更新。2026 年 3 月宣布的 Motorola 合作可能在未来提供 Pixel 以外的选项，但具体机型与上市时间还没公布，现在要用 GrapheneOS 仍要准备一台支援的 Pixel。

??? question "安装 GrapheneOS 后，还能使用 Google 地图、Gmail 吗？"

    可以。透过 sandboxed Google Play，你能安装官方的 Google app，差别在于整套 Google Play 服务是以无特权的一般 app 身分被关进沙箱，没有系统层权限。你可以完全不装，也可以只在需要的设定档里安装，是否使用全由你决定。

??? question "GrapheneOS 能让我匿名吗？"

    不能，也不该这样期待。GrapheneOS 做的是 hardening 与去 Google 化，连上电信网络就会向电信商表明身分，这不是 GrapheneOS 能解决的范围。要匿名请搭配 [Tor](./what-is-tor.md)，并先读 [匿名与隐私的差别](../basics/anonymity-vs-privacy.md) 厘清需求。

??? question "银行 app、政府 app 能正常使用吗？"

    视 app 类别而定。通讯、浏览与多数一般 app 透过 sandboxed Google Play 大多正常运作。最容易被挡下的是用 Play Integrity 之类 attestation 检查装置的银行、政府、支付 app，它们可能把 GrapheneOS 判为不合格而拒绝执行。各地常用 app 的社区回报还不齐，最稳的做法是先列出自己「不能没有」的 app 清单，到 [GrapheneOS 官方论坛](https://discuss.grapheneos.org/){target="_blank"} 搜寻有没有人回报过，或先保留一支旧手机备用，确认关键 app 均可正常运作后再全面转移。

??? question "与 LineageOS、CalyxOS、/e/OS 有什么不同？"

    四套的取舍不同。GrapheneOS 是 hardening 最彻底的一套，要求在 Pixel 上重锁 bootloader 以维持完整的安全模型。CalyxOS 走 microG（一套开源的 Google 服务替代实作）加上重锁 bootloader 的实用中间路线。LineageOS 支援的机型最广，但不提供同等的安全强化，而且在很多机型上解锁 bootloader 后就削弱了 Android 预设的安全保护。/e/OS 以延续旧硬件可用为主，漏洞缓解的等级最低。要最高的安全与隐私选 GrapheneOS，要照顾更多旧机型或想更省事，可以看其他几套。

## 接下来

GrapheneOS 的安装是在电脑上用官方 [Web Installer](https://grapheneos.org/install/web){target="_blank"} 对 Pixel 刷机，整个流程在浏览器里有步骤导引、中途失败可以重来，按步骤操作不会让手机无法开机（俗称「变砖」），过程会引导你重锁 bootloader。操作前先厘清自己的威胁模型，再决定是否以及如何使用 sandboxed Google Play。

行动端的 OS 强化只是整体隐私实践的一块。连线层的 [Tor](./what-is-tor.md)、通讯层的 [匿名通讯工具比较](./messaging-comparison.md)、账号层的 [密码管理器入门](./password-manager.md)，依你的威胁模型整体搭配。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:material-incognito: 匿名与隐私的差别](../basics/anonymity-vs-privacy.md)
- [:material-compare-horizontal: Tails、Whonix、Qubes 的差别](./tails-vs-whonix-vs-qubes.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-message-lock-outline: 匿名通讯工具比较](./messaging-comparison.md)
- [:material-key-outline: 密码管理器入门](./password-manager.md)
- [:material-newspaper-variant-outline: Android 17 上线后的 GrapheneOS](../blog/posts/2026-grapheneos-android-17.md)

</div>
