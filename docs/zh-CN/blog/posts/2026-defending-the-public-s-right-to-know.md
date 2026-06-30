---
date: 2026-06-12
authors:
    - anoni-net
categories:
    - 翻译文章
    - OONI
    - Tor
slug: 2026-defending-the-public-s-right-to-know
image: "https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png"
summary: "Tor Project 博客上的一篇文章整理了 OONI 观测数据在实际情境中如何被引用：肯尼亚高等法院的网络关闭诉讼、坦桑尼亚挑战 Twitter/X 封锁，以及俄罗斯流亡媒体 Meduza 写文章邀请读者试用 OONI 工具，并从中看到公民团体、新闻工作者、技术研究者、律师如何从同一份数据集出发，把网络中断推升为公共利益议题。"
description: "Tor Project 博客上的一篇文章，整理 OONI 观测数据如何进到肯尼亚高等法院、坦桑尼亚 Twitter/X 封锁诉讼，俄罗斯流亡媒体 Meduza 也写文章邀请读者试用 OONI 工具。文末补上华语六地区的 ASN 观测现况与在地倡议的接续方向。"
---

# 从肯尼亚高院到华语六地区：OONI 开放数据如何进到法庭、新闻室与公共纪录

!!! info ""

    这篇文章是 Tor Project 博客「守护自由互联网」系列的其中一篇，介绍 OONI 在实际情境中如何运作。原文翻译如下：

    - [Defending the public's right to know, pavel 2026-05-12](https://blog.torproject.org/Defending-the-right-to-know/){target="_blank"}

    在原文之外，文末另外补一段华语六地区（中国大陆、香港、澳门、新加坡、马来西亚、台湾）的脉络，谈各地的 OONI 观测现况、可以对照肯尼亚案件的法律倡议切入点，以及一般读者可以如何把家用网络、移动网络接进这份公共纪录。

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png"
            alt="Tor Project 文章「守护自由互联网」系列的视觉主图，主题为 OONI"
            style="border-radius: 10px;">
    </a>
    <figcaption>图片来源：<a target="_blank" href="https://blog.torproject.org/Defending-the-right-to-know/">Tor Project Blog</a>。</figcaption>
</figure>

网络自由已经[连续 15 年下滑](https://freedomhouse.org/article/new-report-persistent-authoritarian-repression-and-backsliding-democracies-drive-15th){target="_blank"}。除了监控、隐私与匿名性遭到侵蚀、各种信息操弄之外，各国政府也针对特定网站与服务实施封锁或限制，甚至直接攻击网络基础设施本身，造成网络关闭（shutdown）与蓄意中断。我们要怎么知道网络在什么时候被审查、又用了什么方式？

[OONI](https://ooni.org/){target="_blank"}（Open Observatory for Network Interference，网络干扰开放观测站）是 Tor Project 衍生出来的计划，提供[自由及开源工具](https://ooni.org/install/){target="_blank"}与[开放数据](https://ooni.org/data/){target="_blank"}。使用者用这些工具测量网络审查事件，把观测结果上传成可验证的纪录，后续也可以引用到报道、研究或法律行动。以下是几个实际的案例。

<!-- more -->

## 守护公共纪录

OONI 的观测数据是[全球最大的网络审查开放数据集](https://explorer.ooni.org/){target="_blank"}，自 2012 年以来已累积数十亿笔测量，涵盖 245 个国家与地区、数万个网络。这些数据能存在，是因为全球各地有人在使用 [OONI Probe](https://ooni.org/install/){target="_blank"}（一款免费的网络测量工具，桌面版与手机版都有，按一下就对你所在的网络跑一轮连线测试），把自己连线的网络状况回报上来。每一笔新的测量，都会加进这份公共纪录。

这份数据集之所以受到引用，原因同时来自规模与方法论。网络审查常常以「让干扰看不出来」的方式进行，被封锁的网站看起来像坏掉了、被限速的应用看起来不稳定、整段网络关闭看起来像是技术故障。在 OONI 采用的[公开测量方法论](https://github.com/ooni/spec/tree/master/nettests){target="_blank"}、同行评审、专家反馈与对照组测量的基础上，这些手段可以在数据层面被识别出来，「网络被审查了」这类主张因此可以被检验、被挑战、被验证。

为了降低查数据的门槛，OONI Explorer 上线了[主题式页面](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/){target="_blank"}，聚焦在最常被审查的几个领域，包括社交媒体与即时通讯应用、新闻媒体、翻墙工具。每个页面都收录短篇报告、长篇研究报告，以及带最新 OONI 数据的图表。

2025 年新增的「[新闻媒体封锁](https://explorer.ooni.org/news-media){target="_blank"}」页面就是一个例子，读者不必翻数十亿笔原始测量，就能直接看到这些发现。包括埃及封锁独立媒体 [Zawia3](https://explorer.ooni.org/findings/99431807200){target="_blank"}、约旦封锁 [12 个新闻媒体网站](https://explorer.ooni.org/findings/101531332700){target="_blank"}、印度在与巴基斯坦军事冲突期间封锁 [The Wire](https://explorer.ooni.org/findings/667455800){target="_blank"}。

[网络审查事件通常发生的时间点](https://ooni.org/reports/){target="_blank"}，往往是选举、抗议、武装冲突、全国性大考、政局动荡期间，正是民众最需要取得信息的时候。在这些关键时刻，受影响的社群可以从 OONI 观测数据取得共同的事实基础，后续才有机会究责。

## 新闻工作者与媒体组织如何运用 OONI

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/0/034a6f0033d426dfc46e0fcfefb03e858f04b155.jpeg" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/0/034a6f0033d426dfc46e0fcfefb03e858f04b155.jpeg"
            alt="OONI Explorer 上的 dw.com 测量截图，显示俄罗斯、中国、伊朗对 dw.com 的封锁"
            style="border-radius: 10px;">
    </a>
    <figcaption>OONI Explorer 的截图，显示 dw.com 在俄罗斯、中国、伊朗被封锁的情形。图片来源：<a target="_blank" href="https://blog.torproject.org/Defending-the-right-to-know/">Tor Project Blog</a>。</figcaption>
</figure>

2025 年，俄罗斯流亡媒体中相当知名的 [Meduza](https://meduza.io/en){target="_blank"} [发表了一篇文章介绍 OONI 工具](https://meduza.io/cards/tsenzury-v-runete-vse-bolshe-kak-mozhno-otslezhivat-blokirovki){target="_blank"}，邀请读者实际试用。从 Meduza 这个案例可以看到，新闻编辑室除了用网络审查测量来写报道，也可以把它当作公共教育的一环，让读者理解网络干扰是如何运作的、可以如何被记录下来、自己又能如何贡献到这份证据基础里。

新闻网站被封锁，影响从来不只是技术层面，代表的是大众失去取得报道的管道、社群失去即时信息、记者失去他们的读者。只有当这件事被记录成可以被引用、可以被分析的数据，后续行动才有立足点。

最具体的串接案例发生在肯尼亚。OONI 观测数据被当作证据，用在一场挑战「非法切断网络连线」的公益诉讼。[这场诉讼由一个联盟提出](https://blog.bake.co.ke/2025/05/14/bake-6-other-organizations-challenge-internet-shutdowns-in-kenya-in-landmark-public-interest-case/){target="_blank"}，成员包括 BAKE、ICJ Kenya、Paradigm Initiative、肯尼亚记者工会（Kenya Union of Journalists）、Katiba Institute、肯尼亚律师协会（Law Society of Kenya）和 CIPESA。为了支援这份提交给肯尼亚高等法院（High Court of Kenya）的声请，OONI 以专家意见的形式产出了一份[详细的研究报告](https://blog.bake.co.ke/wp-content/uploads/2025/05/HCCHRPET.276.2025-ICJ-v-CA-Internet-Shutdown-Case.pdf){target="_blank"}，记录 Telegram 在肯尼亚 2023 与 2024 年 KCSE 全国性大考（肯尼亚的中学毕业会考，当局以防堵考题外泄为由，在考试期间限制社交与通讯软件）期间被封锁的情形。

在这个案子里，记者工会、数字人权组织、法律倡导者与技术研究者从同一份数据集出发，把「网络被中断」推升为公共利益议题。这也是区域上重要的先例，坦桑尼亚的律师后来主动联系 OONI 索取数据，用来支持当地挑战封锁 Twitter/X 的法律行动，OONI 也因此发表了一份[记录这次封锁的研究报告](https://ooni.org/post/2025-tanzania-blocked-twitter/){target="_blank"}。

## 为共同的互联网集体行动

从肯尼亚延伸到坦桑尼亚的这个涟漪效应里，可以看到网络审查如何跨地域运作，也可以看到大家可以如何回应。封锁一个即时通讯应用，从来不是一件孤立的事。记者可能失去与消息来源的联系管道，社运行动者可能失去组织动员的通道，[翻墙工具开发者可能要重新调整](https://blog.torproject.org/fighting-censorship-with-webtunnel/){target="_blank"}，研究者可能要验证实际情况，律师可能需要证据。所有人都需要文件纪录。

OONI 的[开放数据](https://ooni.org/data/){target="_blank"}模型，正好对应这些关键时刻的需求。守护自由的互联网，需要把审查记录下来、把证据分享出去，并且一起累积回应这些事件的集体量能。

## 在地脉络：华语六地区如何接上这个工作流程

OONI 在肯尼亚、坦桑尼亚、约旦、印度、埃及的故事，地理位置上看起来离我们很远，但运作逻辑跟华语六地区（中国大陆、香港、澳门、新加坡、马来西亚、台湾）是同一套，靠的都是公开的测量数据和跨领域的协作。要把这套工作流程用起来，从观测覆盖、倡议路径到一般人的参与，有三件事可以往下看。

### 华语六地区的 OONI 观测覆盖现况

中国大陆有 OONI Probe 使用者持续上传测量数据，能看到防火长城对常见社交媒体、即时通讯应用、新闻媒体与翻墙工具的封锁情况。香港、澳门、新加坡、马来西亚与台湾的 ASN（自治系统编号，可粗略理解成每家 ISP 的网络编号）也都有不同程度的覆盖，但每个地区都存在没人在跑 OONI 的网络。其中，台湾的匿名网络社群长期维护一份 [ASNs 自治网络观测数据分析](../../taiwan/ooni-asn-coverage.md)，可以当作各华语地区检视自家 ASN 覆盖状况的参考做法。

OONI 全球数据集再庞大，每个地区仍然要靠在地使用者持续[运行 OONI Probe](https://ooni.org/install/){target="_blank"} 才能补上盲点。哪个 ASN 没人在跑 OONI，未来如果在那条路径上发生封锁或中断，就缺少能引用的证据。

### 从肯尼亚诉讼看华语六地区的倡议切入点

肯尼亚高等法院的诉讼示范了公民团体、媒体工会、法律倡导者、技术研究者如何从同一份开放数据出发，把网络中断的争议推到制度层级的问责程序。

报道中国大陆、香港、缅甸、越南等地的封锁事件时，华语地区的媒体与公民团体已经能引用 OONI 公开数据作为佐证。下一步值得思考的是，当华语地区某地自己遇到网络中断或服务阻断事件时，如何在法律倡议、人权报告、议会监督或国际仲裁层面，建立类似的证据链。

### 把家用网络、移动网络接进这份公共纪录

OONI Probe 桌面版与移动版都能在家用网络、移动网络、公共 Wi-Fi 上运行，每换一个连线环境就能多留下一笔纪录。对社群与民间组织来说，可以把它放进既有的工作节奏，例如在不同据点、活动现场、成员的移动网络上轮流测量，让覆盖从少数几家网络扩散到更多日常情境。这跟前面讲的盲点是同一件事的两面，一边是看出哪里还没被测到，一边是把那些网络一笔一笔补上来。

## 你可以做的事

不论你是想补观测、做研究，还是要把数据用在报道或倡议，都有可以着手的起点。

- **一般读者**：[安装 OONI Probe](https://ooni.org/install/){target="_blank"} 跑一轮，让你这条网络出现在公共纪录里（运行前可先看 OONI 对[潜在风险的说明](https://ooni.org/about/risks/){target="_blank"}）。如果有你常用、想纳入定期测量的网站，可以到 OONI 的[测试列表编辑器](https://test-lists.ooni.org/login){target="_blank"}提交，之后全球的 OONI Probe 就会把它排进测试。
- **研究者与技术社群**：参考 [ASNs 自治网络观测数据分析](../../taiwan/ooni-asn-coverage.md) 上的盲点分布做法，再评估自己这条网络或实验环境可以补上哪些测量，并把数据整理成可重复比对的图表。
- **记者、媒体编辑、人权律师**：下次处理中国大陆、香港、缅甸等地封锁事件的报道时，[OONI Explorer](https://explorer.ooni.org/){target="_blank"} 上的测量截图、调查发现（findings）短篇报告、长篇研究报告都可以引用做公开佐证。要走到公益诉讼层级的案件，肯尼亚案示范了向 OONI 申请专家意见报告的流程。

## 相关阅读

- [发布：新 OONI Explorer 专题审查页面](./2025-ooni-explorer-thematic-censorship-pages.md)
- [OONI 全新的匿名凭证系统](./2026-ooni-anonymous-credentials.md)
- [ASNs 自治网络观测数据分析](../../taiwan/ooni-asn-coverage.md)
- [OONI 网站检测清单](../../taiwan/ooni-checklist.md)
