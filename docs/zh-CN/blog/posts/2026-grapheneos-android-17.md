---
date: 2026-07-20
authors:
    - anoni-net
categories:
    - 更新
    - 隐私
slug: 2026-grapheneos-android-17
image: "https://assets.anoni.net/blog/2026-grapheneos-android-17.jpg"
summary: "Android 17 在 2026 年 6 月 16 日上线，GrapheneOS 当天完成移植。真正的故事是 Google 从 2025 年起连续两步收紧 AOSP，加上 Play Integrity、Microsoft Authenticator、欧盟 Unified Attestation 一路把更安全的系统挡在门外。这些动作指向同一件事，你买的手机，到底谁决定它能跑什么系统。"
description: "Android 17 上线后 GrapheneOS 的处境：Google 收紧 AOSP、attestation 锁定非官方系统，以及这对华语区与重视隐私的用户代表什么。"
---

# Android 17 上线后的 GrapheneOS：谁决定手机上能跑什么系统

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-grapheneos-android-17.jpg" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-grapheneos-android-17.jpg"
            alt="Android 17 上线后的 GrapheneOS：谁决定手机上能跑什么系统"
            style="border-radius: 5px;">
    </a>
    <figcaption>图片：智能手机被锁链缠绕，象征装置被外部规则锁住。摄影 Towfiqu barbhuiya，来源 [Pexels](https://www.pexels.com/photo/close-up-of-a-smart-phone-with-a-lock-11391947/){target="_blank"}（Pexels License）。</figcaption>
</figure>

手机是你花钱买的，但它能装什么、能执行什么系统，越来越不是你能决定的。这个问题平常不会浮上台面，直到你想换一套更保护隐私的系统，却发现某些 app 因为「侦测到非原厂系统」而拒绝执行，或是你信任的开源系统因为得不到硬件资料而越来越难维护。Android 17 在 2026 年 6 月 16 日上线[^1]，把这个问题又往前推了一步。

对隐私使用者来说，首当其冲的是 [GrapheneOS](https://grapheneos.org/){target="_blank"}，一套把 Android 安全强化、移除 Google 绑定的行动作业系统。它几乎只能跑在 Google Pixel 上，而 Google 正一步步调整 Android 与 Pixel 的开放程度，维持一套干净、由使用者掌握的手机系统，成本也随之升高。

<!-- more -->

## Google 两步收紧：开发移入内部分支、Pixel device tree 移出 AOSP

GrapheneOS 这类系统，必须仰赖 Google 公开的 Android 原始码与 Pixel 硬件资料才能开发。Google 接下来的两个动作，收紧的正是这两项来源。

第一步在 2025 年 3 月。Google 把 Android 的主线开发移进内部分支，只在版本正式发布时才把原始码一次推上 AOSP（Android Open Source Project，Android 的开源核心），开发过程不再公开可追[^2]。Android 仍然是开源项目，外部开发者能取得最终的代码，但看不到中间的演进，也更难即时跟上。

第二步在 2025 年 6 月，冲击更直接。Google 发布 Android 16 时，不再把 Pixel 的 device tree 放进 AOSP[^3]。device tree 是描述某款手机硬件配置、让系统能正确驱动它的一组设定档，对要把系统移植到该机型的人来说是地基。Google 同时把 AOSP 的官方参考装置，从实体的 Pixel 换成虚拟机 Cuttlefish。少了 Pixel 的 device tree 与驱动原始码，第三方系统开发者只能从 Pixel 出厂的成品档案回头猜它每个月的硬件改动，费时又容易出错。

这两步加起来，把第三方系统的开发成本垫高了一截。LineageOS（另一套知名的第三方 Android 系统）的贡献者形容，现在等于要「盲猜，从预编译的二进位档逆向工程 Pixel 每月的变更」[^3]。

## GrapheneOS 如期完成移植，但开发成本持续升高

即使如此，GrapheneOS 在 Android 17 发布当天（2026 年 6 月 16 日）就完成移植[^4]。过程中遇到 Android 17 本身一个影响 recovery 侧载的上游 bug，第一版 build 因此没有直接推送，修正后的版本 `2026061800` 在 6 月 18 日进入 Alpha 测试通道[^4]。

移植速度没有变慢，这是 GrapheneOS 工程能力的展示。但每一代要付出的逆向工程成本都在增加，而这个成本是 Google 的政策单方面加上去的。一个原本可以靠公开资料顺畅进行的工作，现在得靠逆向工程填补缺口。GrapheneOS 能维持这样的移植速度多久，取决于 Google 后续是否继续缩减公开资料的范围。

## 另一种压力：attestation 将非官方系统判为不合格

除了开发端，GrapheneOS 还面对使用端的压力，来源是 attestation（装置认证，由 app 在背景检查你的手机是不是「原厂认可」的状态）。

Google 的 Play Integrity API 会把非 Google 认证的系统判为不合格。GrapheneOS 在安全上比原厂 Android 更严格，却因为不是 GMS（Google 行动服务）授权的系统，常被当成被 root（取得最高权限、绕过系统限制）的手机一并拒绝执行。越安全的系统，反而越容易被这套机制排除在外。

attestation 的压力在 2026 年明显增强，下面三件事几乎同时推进：

- **Microsoft Authenticator**：2026 年 2 月底起，开始对 Android 装置做 root 侦测，GrapheneOS 因为被 Play Integrity 标记而受影响。Microsoft 分三阶段推行（先警告、再挡新增账号、最后清除既有凭证），计画在 2026 年 7 月完成最后阶段，清除受影响账号的 Entra 凭证[^5]。截至本文撰写的 6 月，这个期限还没到、是否如期执行未知。Microsoft 也公开表示不支援 GrapheneOS。
- **欧盟 Unified Attestation**：欧盟版的统一装置认证提案，GrapheneOS 认为这是 Play Integrity 的欧洲翻版，会把非授权系统一样挡在 app 生态圈外，已公开呼吁隐私导向的 app 开发者抵制[^6]。
- **Android 17 的侧载限制**：Android 17 新增应用程式侧载的「开发者验证」流程，2026 年先在巴西、印尼、新加坡、泰国试行，2027 年扩大到更多地区[^7]。

这些机制各有各的理由（防诈骗、防滥用、青少年保护），但效果相互叠加，使未获官方认可的系统越来越难用于日常。

## Motorola 合作与 Pixel 的不确定未来

面对 Pixel 的不确定，GrapheneOS 开始找替代硬件。2026 年 3 月 1 日的 MWC 2026，GrapheneOS 与 Motorola 宣布长期合作，计画推出预载 GrapheneOS、支援 bootloader 解锁与重锁的机型[^8]。这是 GrapheneOS 第一次把硬件出路铺到 Pixel 以外，具体机型与上市时间官方都还没公布。

回头看这次合作的起因，GrapheneOS 表示，正是 Google 停止公开 Pixel 共用的驱动程式原始码，才促成 Motorola 主动找上门[^9]。Google 想把 Android 收得更紧，反而把一个原本绑在自家硬件上的项目推向了竞争对手。

至于 Pixel 本身，GrapheneOS 的说法是「不确定之后还会不会替新推出的 Pixel 加上支援」[^10]。媒体据此推测 Pixel 11 可能是最后一款受官方支援的新 Pixel，但这是媒体的推论，GrapheneOS 官方并没有做出这个承诺，Pixel 11 之后的机型是否支援仍在未定之天。

## 谁决定手机上能跑什么系统

Google 收紧 AOSP、用 Play Integrity 决定哪些系统合格，Microsoft 跟着把不合格的系统排除，欧盟研议自己的认证框架，Android 17 要求侧载先过验证。这些机制累加下来，你手机上能跑什么系统、能装什么 app，能自己决定的部分越来越少。

这跟我们在 [从 Discord 年龄验证谈起：我们为什么自架 Matrix](./2026-discord-matrix-statement.md) 与 [金融公司当起审查者](./2026-financial-companies-as-censors.md) 谈过的是同一类问题。当关键的基础设施掌握在少数平台手中，规则由它们单方面决定，一般使用者难以参与，也难以脱离。手机作业系统是其中最贴身的一层，定位、通讯、相簿与身分都存在这一层上。

GrapheneOS 的价值，就在于它让使用者在原厂系统之外仍然有得选。它不完美，依赖 Pixel、可能被部分 app 拒绝执行、需要一定的学习成本，但它证明了这件事在技术上可行。

## 对华语区读者的意义

上述变化看似都在美国的 Google 与欧盟法规层面，但离华语区读者并不远。

Android 17 的侧载验证，2026 年第一批试验场就包含印尼、新加坡、泰国，APAC 是最早被纳入的地区之一[^7]，这类政策后续往邻近地区扩大并不意外。另一个更切身的压力是 attestation。各地的网银、行动支付、政府服务 app 越来越常检查装置是不是原厂状态。在中国大陆，本地 app 早已普遍要求装置认证与实名，非官方系统一样容易被挡。对把手机当主要上网工具的人，选用 GrapheneOS 这类系统前，要先确认自己每天必用的 app 是否仍能正常执行。

如果你关心能不能拥有一台真正由自己掌握的手机，GrapheneOS 是现在最成熟的选项，也是观察 Google 后续动向最直接的视角。Google 接下来的每一步，都会影响 GrapheneOS 作为可行选项还能维持多久。

## 进一步了解 GrapheneOS

这篇谈的是处境与脉络。GrapheneOS 本身是什么、有哪些隐私与安全设计、为什么只支援 Pixel、跟匿名工具的界线在哪，整理在 [GrapheneOS：高度隐私的行动作业系统](../../tools/grapheneos.md)。操作前也建议先读 [威胁模型如何建立](../../basics/threat-model.md) 与 [匿名与隐私的差别](../../basics/anonymity-vs-privacy.md)，厘清自己真正的需求，再评估 GrapheneOS 是否适合自己。

[^1]: [Android 17 release | Android Open Source Project](https://source.android.com/docs/whatsnew/android-17-release){target="_blank"} - Android Open Source Project
[^2]: [Google will develop the Android OS fully in private going forward](https://9to5google.com/2025/03/26/google-android-aosp-developement-private/){target="_blank"} - 9to5Google
[^3]: [AOSP isn't dead, but Google just landed a huge blow to custom ROM developers](https://www.androidauthority.com/google-not-killing-aosp-3566882/){target="_blank"} - Android Authority
[^4]: [GrapheneOS has been ported to Android 17 and official releases are coming soon](https://discuss.grapheneos.org/d/36469-grapheneos-has-been-ported-to-android-17-and-official-releases-are-coming-soon){target="_blank"} - GrapheneOS Discussion Forum
[^5]: [Microsoft tightens Authenticator checks on Android and iOS](https://www.theregister.com/on-prem/2026/03/10/microsoft_tightens_authenticator_checks_on/){target="_blank"} - The Register
[^6]: [GrapheneOS calls on privacy-focused app developers to boycott European Unified Attestation](https://piunikaweb.com/2026/03/10/grapheneos-calls-on-privacy-focused-app-developers-to-boycott-european-unified-attestation/){target="_blank"} - PiunikaWeb
[^7]: [Android sideloading changes: here's the full timeline](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/){target="_blank"} - Android Authority
[^8]: [Motorola confirms GrapheneOS partnership for a future smartphone](https://9to5google.com/2026/03/01/motorola-confirms-grapheneos-partnership-for-a-future-smartphone-porting-features/){target="_blank"} - 9to5Google
[^9]: [GrapheneOS explains Motorola partnership origin & the uncertain future of Pixels](https://piunikaweb.com/2026/03/12/grapheneos-explains-motorola-partnership-origin-the-uncertain-future-of-pixels/){target="_blank"} - PiunikaWeb
[^10]: [Pixel 11 could be the last new Pixel to gain GrapheneOS support](https://piunikaweb.com/2026/01/26/pixel-11-could-be-the-last-new-pixel-to-gain-grapheneos-support/){target="_blank"} - PiunikaWeb
