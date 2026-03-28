---
date: 2026-03-29
authors:
    - toomore
categories:
    - 更新
slug: updates-202603
image: "assets/images/post-update.png"
summary: "2026/03 社区近况：Tor Project 客座文章、COSCUP 2026 议题轨道确认、g0v Hackath71n 匿名支付讨论、Cryptpad 简繁体中文翻译"
description: "2026/03 社区近况：Tor Project 客座文章、COSCUP 2026 议题轨道确认、g0v Hackath71n 匿名支付讨论、Cryptpad 简繁体中文翻译"
---

# 2026/03 社区近况更新

![2026/03 社区近况更新](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

感谢 Tor Project 的邀约，让我们匿名网络社区有机会分享在学术网络上架设 Tor Relay（中继节点）的经验。

Tor Project 官方网站 Blog 文章 [Setting up a Tor Relay at a university in Taiwan](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"} 中，我们分享了在台湾师范大学架设 Tor Relay 的经验，以及如何与学校沟通、留下可能性的实作经验。

感谢来自 Tor Project 的 Pavel 与 Roger 给予我们的帮助，让我们有这个机会通过客座文章的方式分享我们的经验。

<!-- more -->

## 社区近期动态

匿名网络社区近期正持续筹备 2026/08 的工作坊活动，COSCUP 年会的社区议题轨道已确认申请到，为期两天，将以议题与工作坊混合的形式进行。后续我们会另行公告征稿方式，欢迎持续关注。

去年我们通过参与 COSCUP，将「匿名网络」与「网络自由」的概念带进台湾开源社区年会。今年也会持续参与，聚焦于「隐私」、「校园匿名网络建设」、「匿名支付」等议题，并持续邀请新闻媒体、独立记者、公民团体与科技社区共同参与。由于 COSCUP 本身不需报名或验证身份，因此可在匿名的前提下参加活动。

此外，在「匿名支付」议题上，我们打算与以太坊基金会在台北的本地社区共同合办，并希望通过区块链、去中心化与无需许可的技术，协助我们探索并打通「匿名支付」实践的可能性。

### g0v Hackath71n（高雄）

2026/01 我们参与了 g0v Hackath71n（高雄）活动，并在「匿名支付」主题上先厘清一个核心问题：匿名不只发生在上网行为，支付流程本身也可能暴露个人身份与关系网络。基于这个前提，我们先从真实使用场景出发，梳理哪些支付场景确实有匿名需求，而不是把所有交易都一概视为同一种问题。

讨论过程中，我们也聚焦在合规与技术之间的张力。实务上，许多支付与转账流程会经过中心化交易所，而交易所通常必须遵循 AML/KYC 与跨境监管要求，进而带来个人信息披露与交易可追踪性的风险。这些限制不只影响工具可行性，也会直接改变用户在不同地区的实际选择。

因此，在那次黑客松活动中将「匿名支付」定位为研究与讨论导向的项目。先整理风险、限制与法规疑虑，再逐步形成可持续深化的研究方向。接下来我们也会持续与本地社区协作，将讨论转化为更具体、可验证的实作路线。

活动的协作笔记讨论记录可以参考[这份文件](https://cryptpad.anoni.net/pad/#/2/pad/view/3XxPju-P5tDaPaVclZUwhWvx5uA8CVZv7+8T7uiLqFE/){target="_blank"}。

### 参与我们

如果你对「隐私保护」、「校园 Tor Relay 建设」或「匿名支付」等主题有兴趣，欢迎加入我们一起协作。社区目前整理了 2026 年的主题方向与参与方式，你可以先从[这里了解](../../about/community/participate.md)有哪些议题最想投入。

不需要等到活动现场才参与，平时就能从线上开始。你可以先挑一个感兴趣的主题，接着到对应的讨论空间打声招呼、分享关注点，或认领一个你愿意持续追踪的小题目，让大家知道可以如何互相支持。

我们日常主要通过 Matrix 讨论、用 Cryptpad 进行协作笔记、在需要时以 Jitsi 开线上会议。工具入口、账号申请方式与基本使用说明都整理在[沟通与协作工具](../../about/community/communication-tools.md)页面。

如果你是第一次接触这些工具，也不用担心。可以先从加入 [Public Space](https://matrix.to/#/#community:im.anoni.net){target="_blank"} 开始，看看目前有哪些 room 正在讨论，再选择自己想先旁听或直接参与的主题。通常从阅读近期消息、回复一两个问题开始，就是最好的第一步。

我们很期待更多伙伴一起把讨论变成可落地的行动。无论你想投入研究、文档整理、活动协作，或只是先来了解现状，都非常欢迎加入，一起把匿名网络的实践做得更完整。

### Cryptpad 简繁体中文翻译

我们近期也将 Cryptpad 的繁体中文[翻译完成](https://github.com/cryptpad/cryptpad/issues/2237){target="_blank"}，并进一步提出了 [PR #2254](https://github.com/cryptpad/cryptpad/pull/2254){target="_blank"}，将原本笼统的 `zh` 语系拆分为 `zh_Hant`（繁体中文）与 `zh_Hans`（简体中文）两个明确的语系设定。这份 PR 已被纳入 Spring Release（2026.3.0）的里程碑，预计在该版本正式支持繁简体中文界面。

Cryptpad 可以把它想成「比较重视隐私的 Google Docs」，有文档、表格、演示文稿和看板等常用功能。区别是数据在发送到服务器前就先加密了，服务端也看不到内容。对我们这种重视匿名与隐私的社区来说，用它来协作笔记、讨论和整理项目，能减少不必要的个人信息暴露，也比较放心。

Cryptpad 是一套很好用的线上协作工具，也正在规划如何在台湾推广这个服务。目前社区有自己架设一台，提供 50 MBs 的空间，欢迎申请使用：[cryptpad.anoni.net](https://cryptpad.anoni.net){target="_blank"}
