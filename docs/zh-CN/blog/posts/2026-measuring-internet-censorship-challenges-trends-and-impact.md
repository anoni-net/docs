---
date: 2026-06-26
authors:
    - toomore
categories:
    - 观察
    - OONI
    - 翻译文章
slug: 2026-measuring-internet-censorship-challenges-trends-and-impact
summary: "OONI 整理出全球网络审查正在变得更精细、更难检测的几项关键趋势，包括 HTTPS 加密化反而让封锁更不透明、TLS 干扰与 DPI 的扩散、流量限速、国家内网等现象，并说明这些观察如何支持数字人权倡议。"
description: "OONI 整理出全球网络审查正在变得更精细、更难检测的几项关键趋势，包括 HTTPS 加密化反而让封锁更不透明、TLS 干扰与 DPI 的扩散、流量限速、国家内网等现象，并说明这些观察如何支持数字人权倡议。"
---

# 测量网络审查：挑战、趋势与影响

!!! info ""

    **翻译说明：**这篇文章由 OONI 的 Maria Xynou 撰写，原刊于 Internet Society 的 Pulse blog，后由 OONI 转贴。OONI 是目前全球规模最大的网络审查观测公开数据集，本文整理了测量网络审查的方法挑战、近年观察到的审查趋势，以及这些数据如何被用在数字人权的倡议行动。对简体中文使用者来说，这份脉络有助于理解为什么「网络看起来能用」不等于「没有被审查」，也有助于评估自己所在地区的网络层介入形态。

    以下内容原文翻译来自：

    - [Measuring Internet Censorship: Challenges, Trends, and Impact, Maria Xynou 2026-05-05](https://ooni.org/post/2026-measuring-internet-censorship-trends-challenges-impact/){target="_blank"}
    - 原始版本刊载于 [Internet Society Pulse blog](https://pulse.internetsociety.org/en/blog/2026/05/measuring-internet-censorship-challenges-trends-and-impact/){target="_blank"}

重点摘要：

- 网络审查正在变得更精细、更具针对性，也更难被检测。
- OONI 以众包方式收集的网络观测数据，能支持研究、倡议行动，以及对网络审查事件的快速响应。
- OONI 的长期数据揭示了几项全球网络审查的关键走向，包括短期针对性的间歇封锁，以及长期、系统性的压制。

<!-- more -->

网络审查正在变得更精细、更难被检测，「透明度」这件事比以往更迫切。

[俄罗斯](https://ooni.org/post/2024-russia-report/){target="_blank"}、[哈萨克斯坦](https://ooni.org/post/2024-kazakhstan-report/){target="_blank"}等国家正在封锁大量独立新闻媒体，[选举与抗议期间针对社交媒体的限制](https://ooni.org/reports/social-media-im/){target="_blank"}在全球各地也越来越常见。连民主国家也在扩张审查做法。举例来说，[阿尔巴尼亚去年封锁了 TikTok](https://explorer.ooni.org/findings/274282914400){target="_blank"}，西班牙则[间歇性封锁了部分网络](https://www.techradar.com/vpn/vpn-privacy-security/la-ligas-war-on-piracy-is-breaking-the-internet-in-spain-and-your-vpn-could-be-the-next-target){target="_blank"}，做法是针对 LaLiga 直播站点所使用的 Cloudflare 基础设施下手。

这些案例都由 [Open Observatory of Network Interference（OONI）](https://ooni.org/){target="_blank"}记录下来。OONI 是一个非营利组织，维护[全球最大的网络审查公开数据集](https://ooni.org/data/){target="_blank"}，数据来自众包测量。本文简要讨论测量网络审查的挑战、正在浮现的审查趋势，以及网络观测如何推动人权倡议。

## 测量网络审查的挑战

要判断一件事算不算网络审查，[很少能用](https://ramakrishnansr.com/assets/censorship-data-analysis.pdf){target="_blank"}「能不能连」、「有没有被封锁」这种二分结果就讲清楚。

许多因素都可能让服务看起来无法访问，即使没有任何人刻意限制。架在不稳定服务器上的网站可能短暂失效，跟政府毫无关系。网络质量不佳时，用户也可能难以打开网站或 App。连[ DNS 设置错误](https://ooni.org/post/not-quite-network-censorship/){target="_blank"}都可能造成访问失败，但跟审查无关。

[误报（false positives）](https://ooni.org/support/faq/#what-are-false-positives){target="_blank"}很常见。挑战更进一步来自审查做法的多样性，从 DNS 操纵、IP 封锁，到更隐蔽的流量限速或注入伪造响应都有。同一个网站可能在某个网络能用、在另一个网络被挡，因此需要广泛、去中心化的测试才有机会做出可靠判断。

[OONI](https://ooni.org/){target="_blank"} 用几个方式来面对这些挑战。一是开发[公开的测量方法论](https://github.com/ooni/spec/tree/master/nettests){target="_blank"}并鼓励同行评议与专家反馈，并利用对照测量（control measurements）作为基准。OONI 也使用一套[概率式指标](https://docs.ooni.org/data/pipeline-design/){target="_blank"}估计某个资源在特定网络与时间区间内被限制的可能性。这套方法在 [OONI Pipeline v5](https://github.com/ooni/data){target="_blank"} 上实作，会比对测量结果并套用启发式规则，把结果分类为「blocked」、「down」或「OK」，并附上一定信心度的估计。

直接从本地网络收集到的测量，比远程测试更有价值，因为它反映了用户真实的审查体验。当志愿者根据他们实际遇到的封锁内容、在自己所在的脉络下执行测试时，这些数据比较有机会捕捉到突发、情境特定的审查事件。

OONI 正是依此运作。世界各地的人们运行 [OONI Probe](https://ooni.org/install/){target="_blank"}，从他们所连的网络上贡献测量。[数据](https://ooni.org/data){target="_blank"}的取得仰赖志愿者选择测什么、何时、何地，因此各国的覆盖率差异很大，同一个国家的不同网络之间也会有落差。覆盖率不均是一项重要挑战，要可靠地检测（并确认）审查，需要持续的数据来累积信心。

审查事件常发生在高风险情境，例如反政府抗议期间。在这些时刻进行测试，会让贡献者承担实际的[风险](https://ooni.org/about/risks/){target="_blank"}，这也让测量与审查检测变得更困难。在 OONI，用户安全是优先事项，所有贡献测量的人都会经过[知情同意](https://ooni.org/support/ooni-probe-desktop#onboarding-informed-consent){target="_blank"}的程序，在 [OONI Probe App](https://ooni.org/install/){target="_blank"} 中以小测验的形式确认。

## 浮现中的网络审查趋势

OONI 的[长期数据](https://ooni.org/data){target="_blank"}揭示了几项全球网络审查正在演变的关键趋势：

### 网络审查的全球化与常态化

网络层级的审查已经不只发生在中国或伊朗这类国家。今日几乎每个国家都有某种形式的审查，封锁的内容与影响范围差异很大。多数国家现在同时具备技术基础设施与法律框架，能执行网络层的限制。

### 短期控制的针对性、间歇性封锁

许多政府会在[政治敏感事件期间部署临时性审查](https://ooni.org/reports/social-media-im/){target="_blank"}，例如选举、抗议或冲突。这类封锁通常针对特定网站或 App，举例来说，[乌干达在 2026 年大选后封锁了 WhatsApp 与 Facebook](https://explorer.ooni.org/findings/352623460000#social-media-blocks-following-ugandas-2026-general-election){target="_blank"}。短期封锁通常持续几小时到几周，这种做法能降低政治与经济成本，又能让当局在关键时刻控制公共讨论、限制信息流通。

### 系统性压制的长期封锁

长期封锁会持续数年，目的是在网络上强制执行某种意识形态、政策或法律。相较于针对特定站点或 App 的短期封锁，长期封锁往往限制整个被视为「在法律或社会上不可接受」的内容类别。这类审查经常压抑边缘群体、强化既有体制。例子包括[封锁 LGBTQI 权益相关网站](https://ooni.org/post/2021-no-access-lgbtiq-website-censorship-six-countries/){target="_blank"}、[族群或宗教少数团体相关内容](https://ooni.org/post/iran-internet-censorship/#human-rights-issues){target="_blank"}，以及[生育权相关网站](https://ooni.org/post/2019-blocking-abortion-rights-websites-women-on-waves-web/){target="_blank"}。以坦桑尼亚为例，在多年针对 LGBTQI 社群的打压之后，[针对 LGBTQI 相关内容的大规模封锁](https://ooni.org/post/2024-tanzania-lgbtiq-censorship-and-other-targeted-blocks/){target="_blank"}陆续被观察到。

### 加密化网络中越来越不透明的审查

随着越来越多网站采用 HTTPS 与加密标准，审查反而变得更不可见。传统的[封锁页面（block page）](https://ooni.org/support/glossary/#block-page){target="_blank"}会告知用户「这个站点被刻意限制」，但这类页面如今已经少见。政府改采直接干扰 TLS（Transport Layer Security）协议本身的手段，通常使用 DPI（Deep Packet Inspection，深度包检测）这类进阶设备。OONI 的[数据显示](https://ooni.org/reports/){target="_blank"}，TLS 层级的干扰在许多国家被记录下来，这也反映出全球审查技术产业正在扩张。遇到 TLS 干扰时，用户通常只会看到一般的连接错误，而非封锁页面，因此很难分辨这是刻意的审查、还是网络故障或其他技术问题。加密化原本是要保护用户，反过来却让审查变得更不透明。

### 流量限速与服务劣化

各国政府越来越常用带宽限速作为一种较隐蔽的控制手段，限制特定服务的可用性而不直接封锁。这会让通讯 App 或其他平台变慢，让人不想再使用，但连接在技术上仍然「成立」。为了调查这类案例，OONI 开发了一套[针对性流量限速的测量方法论](https://github.com/ooni/probe-cli/blob/master/docs/design/dd-007-throttling.md){target="_blank"}，并在[哈萨克斯坦](https://ooni.org/post/2023-throttling-kz-elections/){target="_blank"}、[俄罗斯](https://ooni.org/post/2022-russia-blocks-amid-ru-ua-conflict/#twitter-throttled){target="_blank"}与[土耳其](https://ooni.org/post/2025-turkiye-throttling-social-media/){target="_blank"}的真实案例中应用与验证。

### 审查与隐私技术的拉锯

当局也把目标放在新兴的隐私技术上。例如伊朗从至少 2020 年起就[封锁加密 DNS](https://ooni.org/post/2022-iran-blocks-social-media-mahsa-amini-protests/#blocking-of-dns-over-https-doh){target="_blank"}，而[俄罗斯在 2024 年 11 月封锁了 ECH（Encrypted Client Hello）](https://theins.ru/news/275980){target="_blank"}。这些手段让用户更难绕过审查，同时也压缩了在线隐私的空间。对此，OONI 开发了新的实验来[测量 ECH](https://github.com/ooni/spec/blob/master/nettests/ts-039-echcheck.md){target="_blank"} 与[加密 DNS](https://github.com/ooni/spec/blob/master/nettests/ts-028-dnscheck.md){target="_blank"}。这些测试已整合进 [OONI Probe](https://ooni.org/install){target="_blank"}，世界各地的测量数据以[公开数据](https://ooni.org/data){target="_blank"}形式即时发布。

### 国家内网与「允许清单」做法的兴起

部分政府正朝向高度管控的国家网络演进。在[伊朗](https://www.kentik.com/blog/from-stealth-blackout-to-whitelisting-inside-the-iranian-shutdown/){target="_blank"}、[俄罗斯](https://habr.com/ru/articles/997088/){target="_blank"}、[缅甸](https://www.article19.org/resources/unplugged-in-myanmar-internet-restrictions-following-the-military-coup/){target="_blank"}等国家，当局正在实验「允许清单（allowlisting）」做法，把可访问的范围限缩在被核准的服务或网站，实质上建立出互联网的围墙区。

这些趋势都显示审查手法越来越精细、针对性越来越强，也越来越难被检测。要守护在线访问权与数字人权，持续的测量与倡议因此格外重要。

## 从测量到倡议

对网络进行测量，能让我们观察到网络流量在实务上是如何被处理的。审查经常在网络层被实作，这类测量可以揭示「什么」被封锁、「如何」被封锁、「何时」被封锁，以及是「哪一个网络」执行的。这个层级的洞察可以提供审查的证据，使得网络测量成为捍卫开放网络的有力倡议工具。

也因为这个理由，OONI 从 2016 年起就是全球 [#KeepItOn 行动](https://www.accessnow.org/keepiton){target="_blank"}的活跃成员，协助全世界数百个人权组织用 [OONI 数据](https://ooni.org/data/){target="_blank"}去倡议反对网络关闭。OONI 数据因此支援了多国挑战社交媒体封锁的倡议行动，包括[加蓬](https://www.accessnow.org/press-release/keepiton-social-media-restore-access-in-gabon/){target="_blank"}、[坦桑尼亚](https://www.accessnow.org/press-release/keepiton-tanzanian-authorities-and-meta-must-reverse-course-and-respect-human-rights/){target="_blank"}、[尼泊尔](https://www.accessnow.org/press-release/access-nows-statement-on-nepals-escalating-digital-repression-and-deadly-crackdown/){target="_blank"}、[多哥](https://www.accessnow.org/press-release/keepiton-togolese-authorities-must-uphold-human-rights-online-and-off-during-protests/){target="_blank"}与[莫桑比克](https://www.hrw.org/news/2024/11/06/mozambique-post-election-internet-restrictions-hinder-rights){target="_blank"}，也用在政策与法律介入上，例如[巴基斯坦](https://web.archive.org/web/20190322194634/pakistantoday.com.pk/2019/03/21/submit-reply-or-face-contempt-ihc-tells-pta-chairman/){target="_blank"}与[肯尼亚](https://blog.bake.co.ke/wp-content/uploads/2025/05/HCCHRPET.276.2025-ICJ-v-CA-Internet-Shutdown-Case.pdf){target="_blank"}的高等法院申请案。

OONI 数据集的规模也强化了倡议价值。自 2012 年起，已从 245 个国家与地区、30,000 个网络收集到[超过 30 亿笔测量](https://explorer.ooni.org/){target="_blank"}，[OONI 数据](https://ooni.org/data){target="_blank"}是同类型中全球最大的网络审查公开数据集。每个月都有数千万笔新的测量从约 180 个国家收进来，每天则持续以即时方式发布来自世界各地的新测量。

OONI 数据是一份等待被探索的[丰富数据集](https://ooni.org/data){target="_blank"}。它的广度与深度能支持研究，即时发布的特性则能支持倡议与快速响应行动。它也定期被收进 [ISOC 的 Pulse Shutdown 项目](https://pulse.internetsociety.org/en/shutdowns/){target="_blank"}用来记录全球的社交媒体封锁。你也可以使用这份数据，[加入这个社群](https://ooni.org/get-involved/){target="_blank"}，一起捍卫自由开放的网络。

## 简体中文使用者地区的观察

### 文章描述的多数现象在中国大陆是长期常态

本文整理的多项手段，包括 DNS 操纵、IP 封锁、TLS 干扰、加密 DNS 与 ECH 封锁，以及走向白名单式国家内网的做法，在中国大陆是长期存在的网络治理实践。OONI 在大陆的长期测量数据，是研究人员理解这套体系如何演变的重要资料。对身在大陆的读者，本文也是「为什么常见的工具会突然失效」这件事的技术背景。

### 港澳、新马等地区的网络层介入呈现不同形态

简体中文使用者所在的不同地区，网络层介入的形态差异很大。香港在 2020 年之后开始出现新的网络层封锁案例，OONI 数据可以追踪相关变化。澳门规模较小但有类似迹象。新加坡、马来西亚则以法定下架与平台合规为主，网络层干扰相对少见。这些差异可以透过 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 直接比对，本文描述的趋势在不同地区呈现出不同强度。

### 使用 OONI Probe 时的风险评估

OONI Probe 的测量本身会产生可被网络侧观察到的流量。在网络监控较严格的环境下运行 OONI Probe，请务必先阅读 [OONI 的风险说明](https://ooni.org/about/risks/){target="_blank"}，理解可能的后果。对身在中国大陆的读者，建议优先以阅读 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 上的现有数据为主，再评估是否进一步参与测量贡献。对身在网络较开放地区的读者，参与测量可以帮助补上简体中文使用者地区的数据覆盖率。

## 延伸阅读

- [什么是 OONI](../../tools/what-is-ooni.md)
- [OONI 网站检测清单](../../taiwan/ooni-checklist.md)
- [Tor Relays 观测点](../../taiwan/tor-relay-watcher.md)
- [ASNs 自治网络观测数据分析](../../taiwan/ooni-asn-coverage.md)
- [OONI Run v2 操作说明](../../tools/ooni-run-v2.md)
