---
date: 2025-04-08
authors:
    - toomore
categories:
    - 技术
    - OONI
    - 翻译文章
slug: 2025-ooni-explorer-thematic-censorship-pages
image: "assets/images/ooni-explorer-thematic-censorship-pages.png"
summary: "发布全新 OONI Explorer 专题审查页面！全球社交媒体、新闻媒体和翻墙工具封锁情况的图表和报告"
description: "发布全新 OONI Explorer 专题审查页面！全球社交媒体、新闻媒体和翻墙工具封锁情况的图表和报告"
---

# 发布：新 OONI Explorer 专题审查页面

!!! info ""

    以下内容原文翻译来自以下文章，主词角色为 OONI：

    - [Launch: New OONI Explorer thematic censorship pages, Maria Xynou 2025-04-02](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/){target="_blank"}

<figure markdown="span">
  ![New OONI Explorer thematic censorship pages](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/images/image-1.png){style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);"}
  <figcaption>图片来源：<a target="_blank" href="https://explorer.ooni.org/social-media">OONI Explorer thematic censorship pages</a></figcaption>
</figure>

我们很高兴地宣布，全新的 OONI Explorer 专题审查页面于 2025 年 4 月 2 日发布！这些新页面提供了基于 OONI 观测数据的全球[社交媒体](https://explorer.ooni.org/social-media)、[新闻媒体](https://explorer.ooni.org/news-media)和[翻墙工具](https://explorer.ooni.org/circumvention)封锁情况的图表和报告。在这篇博客文章中，我们分享了关于新 OONI Explorer 专题审查页面的信息。

- 关于 OONI Explorer
      - 为什么要有新的专题审查页面？
- 新的 OONI Explorer 专题审查页面
      - 社交媒体和即时通讯应用程序的封锁
      - 新闻媒体的封锁
      - 翻墙工具的可达性
- 感谢

<!-- more -->

## 关于 OONI Explorer

[OONI Explorer](https://explorer.ooni.org/) 是全球最大的**互联网审查开放数据库**。这些观测数据由全球 [OONI Probe](https://ooni.org/install/) 的用户贡献，他们在所在网络上进行审查测试，并将测试结果实时上传到开放数据库中。自 2012 年以来，OONI Probe 的用户已经贡献了来自 [242 个国家和地区、28000 个网络，以及超过 20 亿笔测量数据](https://explorer.ooni.org/)，所有这些数据都可以在 OONI Explorer 上公开获取。随着 OONI Probe 用户持续进行测试，每天都有新的测量数据实时发布。您也可以通过协助[运行 OONI Probe](https://ooni.org/install/) 来贡献 OONI 的观测数据。

为了让研究人员和人权捍卫者能够监测和响应全球的审查事件，我们建立了 OONI Explorer：一个网络平台，其中包含一个测量数据的[搜索工具](https://explorer.ooni.org/search)，以及一个[测量数据汇整工具包](https://explorer.ooni.org/chart/mat)，用于根据 OONI 观测数据生成可视化的图表。OONI Explorer 还包括[以域名为中心的页面](https://explorer.ooni.org/domains)，让您查看与 OONI Probe 测试特定域名相关的数据；以网络为中心的页面，通过这些页面您可以了解特定自治网络（AS）上的 OONI Probe 测试，以及提供每个国家 OONI 测量覆盖详情的[国家专属页面](https://explorer.ooni.org/countries)。我们还在 OONI Explorer 的「审查发现」页面上发布简短报告，记录[新出现的审查事件](https://explorer.ooni.org/findings)。

### 为什么要有新的专题审查页面？

在很大程度上，使用 OONI Explorer 需要深入研究 OONI 测量数据以发现审查事件，而探索和[解释 OONI 测量数据](https://ooni.org/support/interpreting-ooni-data/) 对于不熟悉 OONI 工具和方法的用户可能是一项挑战。因此，我们建立了新的 OONI Explorer 页面，来展示专题式的审查结果，以便网络自由社区能够更轻松地发现并响应影响公共利益（如新闻媒体）平台的新审查事件，而不必深入挖掘 OONI 测量数据。多年来，这项需求在社区反馈中多次被提及。

为了确定在 OONI Explorer 上呈现哪些审查结果最有用，我们通过一项调查和与网络自由社区成员的访谈进行了广泛的用户研究。该用户研究的目标是更好地了解网络自由社区如何使用 OONI Explorer，以及他们在通过该平台发现审查结果时遇到的挑战。

根据该用户研究中收集的社区建议反馈，我们得出结论：OONI Explorer 上的新专题审查结果页面将聚焦于以下主题：社交媒体、新闻媒体和翻墙工具。社区的意见反馈也帮助我们确定了在这些专题页面上呈现信息的方式。

## 新的 OONI Explorer 专题审查页面

为了让网络自由社区更容易地发现和反应审查事件，我们建立了新的 OONI Explorer 页面，提供以下主题的 OONI 数据和观测：

- [社交媒体和即时通讯应用程序的封锁](https://explorer.ooni.org/social-media)
- [新闻媒体的封锁](https://explorer.ooni.org/news-media)
- [翻墙工具的可达性](https://explorer.ooni.org/circumvention)

每个新的 OONI Explorer 专题页面均包括：

- 基于 OONI 观测数据记录相关封锁的[简短报告](https://explorer.ooni.org/findings)
- 基于 OONI 观测数据记录相关封锁的[长篇研究报告](https://ooni.org/reports/)
- 覆盖每个主题（社交媒体、新闻媒体、翻墙工具）的**最新 OONI 数据图表**

这些图表默认是根据三个国家筛选的：中国、伊朗和俄罗斯。我们选择这些国家是因为它们拥有稳定的 OONI 测量覆盖和高水平的网络审查，相较于其他国家提供了呈现更具意义图表的机会。大多数国家都有 OONI 测量覆盖，您可以通过更改国家和日期范围（默认设置为过去一个月）来调整这些页面上的图表。若要更好地理解这些图表，请参阅我们的 [OONI 观测数据解读文件](https://ooni.org/support/interpreting-ooni-data/)。

这三个主题（社交媒体、新闻媒体、翻墙工具）是根据用户研究中收集的社区反馈，以及社交媒体、新闻媒体和翻墙工具在全球经常被封锁的事实所决定的，这也影响到人权。因此我们希望这些新页面能呼应全球的 [#KeepItOn 运动](https://www.accessnow.org/campaign/keepiton/) 和其他全球倡议。

### 社交媒体和即时通讯应用程序的封锁

<figure markdown="span">
  ![OONI Explorer Social Media page](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/images/image-2.png){style="border: 1px #ababab solid;"}
  <figcaption>图片来源：<a target="_blank" href="https://explorer.ooni.org/social-media">OONI Explorer Social Media page</a></figcaption>
</figure>

社交媒体平台在全球各地[经常被封锁](https://ooni.org/documents/2022-ooni-submission-ohchr-report-internet-shutdowns.pdf)，特别是在选举期间和大型抗议活动中。通过新的 OONI Explorer 社交媒体页面，我们根据 OONI 观测数据分享全球社交媒体和即时通讯应用程序封锁的**（[短篇](https://explorer.ooni.org/findings?theme=social_media)和[长篇](https://ooni.org/reports/social-media-im)）报告**。我们还分享包含最新 OONI 观测数据的**图表**，这些数据与受测的热门社交网站及以下即时通讯应用程序有关：[WhatsApp](https://ooni.org/nettest/whatsapp/)、[Facebook Messenger](https://ooni.org/nettest/facebook-messenger/)、[Telegram](https://ooni.org/nettest/telegram/) 和 [Signal](https://ooni.org/nettest/signal/)（这些是我们唯一特别进行的 [OONI Probe 实验](https://ooni.org/nettest/)即时通讯应用程序）。

我们选择特定社交媒体域名是基于其全球相关性、使用情况、全球 OONI 测量覆盖，以及它们是否被封锁（或可能被封锁）。我们避免在新的社交媒体页面中包括所有被测社交媒体域名的图表，以提高其易用性。如果您有兴趣查看社交媒体页面上未列出的[其他社交媒体域名](https://explorer.ooni.org/social-media)的 OONI 观测数据，您可以通过 OONI Explorer [搜索工具](https://explorer.ooni.org/search)或[测量数据汇整工具包（MAT）](https://explorer.ooni.org/chart/mat)来进行。

我们鼓励您了解全球 [#KeepItOn 运动](https://www.accessnow.org/campaign/keepiton/)的倡议工作，该运动正在对抗全球社交媒体封锁。

### 新闻媒体的封锁

<figure markdown="span">
  ![OONI Explorer Social Media page](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/images/image-3.png){style="border: 1px #ababab solid;"}
  <figcaption>图片来源：<a target="_blank" href="https://explorer.ooni.org/social-media">OONI Explorer Social Media page</a></figcaption>
</figure>

新闻自由在全球各地面临越来越大的威胁，因为许多国家的新闻媒体网站遭到封锁。通过新的 OONI Explorer [新闻媒体页面](https://explorer.ooni.org/news-media)，我们根据 OONI 观测数据分享全球新闻媒体网站封锁的（[短篇](https://explorer.ooni.org/findings?theme=news_media)和[长篇](https://ooni.org/reports/news-media)）报告。我们还分享含有最新 OONI 观测数据的图表，这些数据与受测的多个新闻媒体网站有关。我们选择特定的新闻媒体域名是基于其全球相关性、全球 OONI 测量覆盖，以及它们是否被封锁（或可能被封锁）。

我们避免在新的[新闻媒体页面中](https://explorer.ooni.org/news-media)包括所有被测新闻媒体域名的图表，以提高易用性。如果您有兴趣查看新闻媒体页面上未列出的其他新闻媒体域名的 OONI 数据，您可以通过 OONI Explorer [搜索工具](https://explorer.ooni.org/search)或[测量数据汇整工具包（MAT）](https://explorer.ooni.org/chart/mat)来进行。不过请注意，[OONI 观测数据](https://ooni.org/data/)的可用性取决于那些域名是否已被该国的 OONI Probe 用户测试。您可以通过我们的[测试列表编辑器上传网站](https://ooni.org/support/test-lists-editor)以供[测试](https://test-lists.ooni.org/login)。

### 翻墙工具的可达性

<figure markdown="span">
  ![OONI Explorer Circumvention Tools page](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/images/image-4.png){style="border: 1px #ababab solid;"}
  <figcaption>图片来源：<a target="_blank" href="https://explorer.ooni.org/circumvention">OONI Explorer Circumvention Tools page</a></figcaption>
</figure>

由于翻墙工具（如 VPN）能够让用户绕过互联网审查，一些政府封锁了这些工具的使用。事实上，OONI 观测数据多年来[显示](https://ooni.org/reports/)，翻墙工具的封锁经常与社交媒体的封锁有关联。

通过 OONI Explorer [翻墙工具页面](https://explorer.ooni.org/circumvention)，我们分享根据 OONI 观测数据记录的全球翻墙工具网站封锁的（[短篇](https://explorer.ooni.org/findings?theme=circumvention)和[长篇](https://ooni.org/reports/circumvention)）报告。我们还分享含有最新 OONI 观测数据的图表，这些数据与 [Tor](https://ooni.org/nettest/tor/)、[Tor Snowflake](https://ooni.org/nettest/tor-snowflake/) 和 [Psiphon](https://ooni.org/nettest/psiphon/)（目前我们以特定的 OONI Probe 实验功能来检测主要翻墙工具）的可达性测试，以及多个翻墙工具网站的测试相关。

我们选择这些特定翻墙工具域名是基于其全球相关性、使用情况、全球 OONI 测量覆盖，以及它们是否被封锁（或可能被封锁）。我们避免在[新的翻墙工具页面中](https://explorer.ooni.org/circumvention)包括所有被测翻墙工具域名的图表，以提高易用性。如果您有兴趣查看翻墙工具页面上未列出的其他翻墙工具网站的 OONI 观测数据，您可以通过 OONI Explorer [搜索工具](https://explorer.ooni.org/search)或[测量数据汇整工具包（MAT）](https://explorer.ooni.org/chart/mat)来进行。

检视图表时，请注意[异常测量](https://ooni.org/support/interpreting-ooni-data/#anomalous-measurements)的存在**并不**总是意味着封锁，因为可能会出现[误判](https://ooni.org/support/interpreting-ooni-data/#false-positives)。此外，翻墙工具通常内建规避审查的技术。因此，我们建议参考 [Tor Metrics](https://metrics.torproject.org/) 和 [Psiphon Data Engine](https://psix.ca/) 以查看使用情况统计资料，并更全面地了解这些工具在各国的有效性。

## 感谢

感谢每一位自 2012 年以来贡献测量数据的 [OONI Probe](https://ooni.org/install/) 用户，使得网络自由社区能够监测和响应全球的审查事件。
