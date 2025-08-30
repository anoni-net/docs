---
date: 2025-08-30
authors:
    - toomore
categories:
    - 更新
    - Tor
    - Tails
slug: tor-corruption-control
image: "assets/images/tor.webp"
summary: "自从互联网在土库曼斯坦开始普及以来，就一直受到严格的限制和审查。整个国家的电信产业要么由政府直接掌控，要么由与统治家族有关联的人士持有"
description: "自从互联网在土库曼斯坦开始普及以来，就一直受到严格的限制和审查。整个国家的电信产业要么由政府直接掌控，要么由与统治家族有关联的人士持有"
---

# 腐败与监管：土库曼斯坦如何将网络审查变成一门生意

!!! info ""

    以下内容为翻译自本文，主语角色是 Tor：

    - [Corruption and Control: How Turkmenistan turned internet censorship into a business, Tor Blog, by gus, nina, 2025-08-27](https://blog.torproject.org/Corruption-Control-Turkmenistan-internet-censorship-business/){target="_blank"}

![](https://forum.torproject.org/uploads/default/original/2X/f/f0a900173e408d4d9f15f346fa3b5b7750efce96.png)

2021 年 7 月，关于 Tor 使用量在土库曼斯坦骤降的现象[引起了我们的注意](https://archive.is/5Kp4s){target="_blank"}。Tor 后来了解到，这标志着这个后苏联国家进入了审查与限制的新时代。不过让我们回到事件的起源看看整件事情的发展...

Tor 社区长期以来致力于捍卫网络自由，运营中继节点并[提供桥接服务以对抗网络审查](https://blog.torproject.org/2024-defend-internet-freedom-during-elections/){target="_blank"}。多年来，Tor 项目呼吁更多人加入[架设桥接](https://forum.torproject.org/t/tor-relays-help-turkmens-to-bypass-internet-censorship-run-an-obfs4-bridge/7002){target="_blank"}、使用 Snowflake 代理，同时我们也调查并调整我们的反审查策略，并分享有关土库曼网络审查的信息。

现代的网络审查规避系统通常建立在「[附带损害](https://www.bamsoftware.com/papers/fronting/){target="_blank"}」的概念上，即审查者如果要封锁某些内容，就必须封锁整个互联网或某些热门的在线服务。然而，在土库曼斯坦，审查者的行为却出奇地不同。他们毫不避讳地封锁了互联网的大部分内容，对于可能造成的附带损害不以为意，这引发了人们的好奇：为什么土库曼斯坦的审查者似乎对其行为产生的附带损害无动于衷呢？

<!-- more -->

## 土库曼背景

土库曼斯坦由专制的别尔德穆哈梅多夫家族执政。该国在全球自由和透明度指数中始终排名靠后。在 2025 年无国界记者组织（RSF）的新闻自由指数中，土库曼斯坦在 180 个国家中[排名第 174](https://rsf.org/en/country/turkmenistan){target="_blank"}。自由之家（Freedom House）给予该国的总体自由度评分只有 1/100。首都阿什哈巴德，常被称为「白色大理石之城」，既是极权奢华的展示，也是[市民依赖翻墙工具来突破审查的地方](https://theurbanactivist.com/governance/protecting-internet-freedom-in-the-city-of-white-marble/){target="_blank"}。

土库曼斯坦的官方人口约为 600 万，但根据[一些估计](https://www.rferl.org/a/turkmenistan-population-decline-exodus/31355045.html){target="_blank"}，实际人数可能不到 300 万。过去十年间，数百万人离开了这个国家，主要流向土耳其、俄罗斯及[其他国家](https://eurasianet.org/turkmen-labor-migrants-turning-elsewhere-as-turkey-is-less-welcoming){target="_blank"}。为了减少人口外流，土库曼斯坦政府要求土耳其对土库曼公民实行签证政策，而该要求已被满足。

土库曼斯坦的**腐败是系统性的**。有多个[调查报道](https://www.occrp.org/en/investigation/how-a-51-million-state-built-beauty-clinic-in-turkmenistan-ended-up-in-the-hands-of-the-presidents-family-at-a-massive-discount){target="_blank"}和纪录片，例如《[圣书之影](https://archive.org/details/shadow-of-the-holy-book-19353633-163997017){target="_blank"}》，都聚焦于此。该国的网络渗透率是全球最低之一，网速也位居[全球最慢之列](https://bestbroadbanddeals.co.uk/broadband/speed/worldwide-speed-league/#speed){target="_blank"}。

强迫劳动（包括童工）在[棉花田普遍存在](https://www.cottoncampaign.org/turkmenistan){target="_blank"}，人权侵犯系统性地发生。女性是特别脆弱的群体，她们薪资较低，必须遵守[着装规定](https://www.rferl.org/a/turkmenistan-color-clothing-women-rules-repression/33349460.html){target="_blank"}，还面临非正式限制，例如禁用某些美容程序或[取得驾照](https://turkmen.news/vlasti-turkmenistana-obyasnili-pochemu-ne-vydavali-voditelskie-prava-zhenshchinam/){target="_blank"}的极大困难。

极少数的活动人士愿意谈论国内情况。即使他们离开国家，仍面临被遣返回土库曼斯坦的风险，例如住在土耳其的[博主阿里舍尔·萨特夫（Alisher Sahtov）和阿卜杜拉·奥鲁索夫（Abdulla Orusov）](https://www.hrw.org/news/2025/07/30/turkiye-turkmen-risking-deportation-reported-missing){target="_blank"}，他们今年似乎[被遣返回国](https://turkmen.news/istochnik-blogerov-sahatova-i-orusova-estradirovali-v-turkmenistan/){target="_blank"}。

许多土库曼斯坦公民不敢公开发声，担心留在土库曼斯坦的亲友的安全和福祉。国内的压制手段可以从 75 岁记者索尔坦·阿奇洛娃（Soltan Achilova）的例子看出。她原本计划前往瑞士领取马丁·恩纳尔斯人权捍卫者奖。为了[阻止她](https://rsf.org/en/turkmenistan-rsf-denounces-poisoning-attempt-soltan-achilova){target="_blank"}前往，土库曼斯坦当局试图毒害她，当企图失败时，[强行将她住院](https://cpj.org/2024/11/turkmen-journalist-soltan-achilova-forcibly-hospitalized-prevented-from-traveling-abroad/){target="_blank"}。

尽管有数百万土库曼斯坦公民旅居海外，但他们的政府无所不用其极地割断本国居民与海外移民之间的家庭联系，而严厉的网络审查正是其工具之一。

## 网络审查与对抗互联网

自从互联网在土库曼斯坦开始普及以来，就一直受到严格的限制和审查。整个国家的电信产业要么由政府直接掌控，要么由与统治家族有关联的人士持有。尽管前总统在 2013 年通过了一项[法律禁止新闻审查](https://cpj.org/2013/02/turkmenistan-opens-up-media-in-name-only/){target="_blank"}，但这部法律仅存在于文件上。在实际运作中，几乎所有的社交网站和消息应用程序都被封锁。像 YouTube、Facebook、Instagram、WhatsApp、TikTok、Discord、Signal、[IMO](https://www.rferl.org/a/turkmenistan-last-messaging-app-internet/32535618.html){target="_blank"} 和 Telegram 这样的热门服务在该国都是无法访问的。根据 Progres 基金会的报告，这样的网络封锁可能使土库曼斯坦的年度 [GDP 损失高达 8%](https://progres.online/reports/internet-freedom/what-does-internet-shutdown-cost-the-turkmen-economy){target="_blank"}。

2021 年，公民甚至被强迫[对着古兰经发誓不使用 VPN](https://www.rferl.org/a/turkmenistan-vpn-koran-ban/31402718.html){target="_blank"}。如果被抓到使用 VPN，罚款为 1,500 马纳特（按市场汇率约 80 美元），这大约相当于一个月的平均薪水。然而，数年内并没有官方的封锁网站列表。

由于封锁的程度和规模，从土库曼斯坦内部衡量网络审查几乎是不可能的，但 [OONI Explorer](https://explorer.ooni.org/chart/mat?probe_cc=TM&test_name=web_connectivity&since=2024-07-23&until=2025-07-24&axis_x=measurement_start_day&time_grain=day){target="_blank"} 上偶尔会出现一些测试结果。2022 年，[一个研究团队](https://tmc.np-tokumei.net/){target="_blank"}使用一种创新的[测量技术](https://arxiv.org/pdf/2304.04835){target="_blank"}成功地绘制了该政权的审查地图，而这种技术不依赖于当地测试或观测点。他们的发现显示超过 183,000 条封锁规则和[超过 122,000 个域名被封锁](https://advox.globalvoices.org/2023/04/12/new-study-finds-internet-censorship-in-turkmenistan-reaches-over-122000-domains/){target="_blank"}。

## 土库曼的网络审查产业

真相在一篇由 [Turkmen.news](https://en.turkmen.news/news/internet-access-a-money-spinner-for-turkmenistan-s-cyber-security-service/){target="_blank"} 的调查报道中被揭露。负责土库曼斯坦网络审查的机构——网络安全部门，不仅负责封锁如 Tor 这类翻墙工具，还在暗中出售网络接入。正如报道所言：「**一旦行贿，土库曼公民就能获得完整的高速网络自由接入。**」

到 2023 年，这种网络审查商业模式已无法忽视。Turkmen.news 的新报告揭示，网络安全部门的代理正在销售付费 VPN 服务，并提供 IP 白名单服务，而这些服务正是他们自己对公众限制的。

他们不仅从网络压制中赚取收益，还创造了需求。在一种仿佛出自《1984》的情节转折中，那些封锁网络的人，正是秘密将网络卖回去的人，以土库曼人大多无法负担的价格出售。报道曝光后，土库曼官员甚至[试图付钱让文章下架](https://en.turkmen.news/news/turkmen-official-behind-internet-restrictions-offers-to-pay-for-removal-of-expose/){target="_blank"}。

换句话说，封锁 Tor 并不仅仅关乎国家安全或意识形态，而是为「网络安全」部门自身创造了一个可盈利的市场空间。那些阻止接入的人，正是把接入卖回去的人。Tor 是免费且有效的突破审查工具，这对其灰色市场 VPN 服务的盈利能力构成威胁。

## 2025 的「网络大赦」与审查制度

在 2024 年年中，土库曼斯坦的网络状况短暂出现了一些变化。几个个月间，网络审查似乎有所放松，大量 IP 封锁被解除，包括翻墙工具也可以使用。甚至 Tor 项目的网站在土库曼斯坦境内也可以短暂访问。

这段短暂的时期被称为「[网络大赦](https://turkmen.news/internet-amnistiya-v-turkmenistane-razblokirovany-3-milliarda-ip-adresov-hostingi-i-cdn/){target="_blank"}」。然而，到 12 月时，网络审查又回归，并且掀起了新一波的审查浪潮，瞄准整个IP范围和在线服务进行封锁。

到 2025 年 4 月，报告证实灰色市场的 VPN 业务已经恢复。VPN 的使用权以每月 1,000 马纳特（约 50 美元）的价格出售，还有更便宜的每周「方案」，但经常排除音乐和影音串流等在线服务。而每月支付 2,000 美元即可移除所有连接过滤。正如 Turkmen.news 的[分析所言](https://turkmen.news/v-turkmenistane-vnov-blokiruyut-internet-krupnymi-podsetyami-politicheskogo-smysla-v-etom-nikakogo/){target="_blank"}：

> 「最近一波的大规模封锁是网络安全官员的一种营销活动。他们故意恶化网络环境以增加对其服务的需求。」

在其他地方被称为「网络安全」的，在土库曼斯坦却变成了相反的现象：故意干扰网络接入以维持一场盈利的骗局。

这个故事不仅关乎审查，更涉及到国家支持的敲诈勒索，当审查者成为了供应者。网络安全部门的官员正运行一个腐败计划，利用监控与控制的工具，从已经受到严格统治的民众中榨取金钱。

## 审查无国界，请分享这个故事

这是一个报道不足，但其影响远超一国范围的故事。了解更多关于《[土库曼斯坦网络安全部门人员公然在线销售 VPN 服务](https://turkmen.news/dilery-upravleniya-kiberbezopasnosti-turkmenistana-otkryto-torguyut-vpn-servisami-online/){target="_blank"}》的信息，并分享这篇文章，支持那些追究权力责任的记者。扩大他们的报道能帮助增加公众压力，确保这些重要的故事不被默默消失。
