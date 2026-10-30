---
date: 2026-10-30
authors:
    - anoni-net
categories:
    - 更新
slug: interseclab-coup-retranslation
image: "assets/images/post-update.png"
summary: "InterSecLab《The Internet Coup》（网络政变）的正体中文译文八章全部从原报告重新翻译。旧译文漏掉或译错了几处重要的内容，包括 Geedge 是否掌握 Tor 的漏洞、没有加密的连接会被拦截到什么、各国用户的数据有哪些人能访问，以及相关公司如何回复。新译文补上漏译的段落与四个国家的时间轴，公司回复信逐句对照原信重译。"
description: "网络政变八章从原报告重新翻译，补上漏译的段落与时间轴，修正误译与公司回复信。读过旧版的人有四个地方值得回头再看。"
---

# 网络政变报告的全文重译

![The Internet Coup 报告封面](https://assets.anoni.net/the-internet-coup/The-Internet-Coup-InterSecLab-2048x986.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

InterSecLab 报告[网络政变](https://anoni.net/docs/reports/interseclab-network-coup/){target="_blank"}的旧译文有几处把原报告的意思漏掉或译错，包括中国公司 Geedge 是否掌握匿名网络 Tor 的漏洞、没有加密的连接会被拦截到什么、各国用户的数据有哪些人能访问，以及相关公司如何回复。读旧版的人可能以为 Tor 已经被攻破，也不知道没有加密的连接连密码都会被拦截。社区把八章全部从原报告 PDF 重新翻译，网址不变。

<!-- more -->

InterSecLab 在 2025 年 9 月发表《The Internet Coup》，分析中国公司 Geedge Networks（积至公司）超过 10 万份泄漏文件，记录防火长城（中国用来审查与监控网络的系统）的技术如何做成产品，卖给哈萨克斯坦、埃塞俄比亚、巴基斯坦、缅甸等国的政府。社区在 2025 年 10 月发布正体中文译文，旧译文的用语不少不符合台湾的书写习惯，句子也多半照英文语序翻译，读起来不顺。译文只有正体中文版，简体中文的读者可以直接阅读。

## 补上与更正的内容

旧译文的主要发现少了整节「对数据主权的重大影响」，第 7 章「对 Tor 的封锁」一节少了最后一段。原报告在哈萨克斯坦、埃塞俄比亚、巴基斯坦、缅甸四个国家的小节开头各有一张时间轴图，旧译文一张也没有译出。新译文补上了这些段落，也把四张时间轴图中的事件译成条列。

旧译文的深度包检测（逐笔分析连接内容的技术）一节，把封锁 VPN 与篡改网页混成同一句，还漏掉了连接没有加密时可以拦截的项目。附录的公司回复信也有译错的地方，例如 AppLogic Networks 就 Sandvine 回复的那封信，原文是 Sandvine 的产品「过去或现在」都没有解密用户数据的能力，旧译文写成「也未曾或现能够解密使用者资料」，可以读成现在能够解密。回复信是各公司对外的正式说法，新译文逐句对照原信重译，不润饰公司的用语。

原报告在推论处用了 appears、seems 这类推测语气，旧译文有几处写成肯定句。例如 Network Zodiac（Geedge 监控网络设备的系统）「似乎」以 Grafana 为范本，旧译文写成「显然」。新译文照原文的语气翻译。目前公开的原报告 PDF 里，哪吒写成「哪吃」，方滨兴的英文名拼成 Fang Bixing，新译文改用正确的写法，并加上译注说明。

## 读过旧版的人可以回头看的四个地方

### Geedge 对 WebTunnel 的封锁研究

Tor 是隐藏用户位置、让网络运营商无法得知你连去哪里的匿名网络，WebTunnel 是 Tor 的一种连接方式，把 Tor 的流量伪装成一般的 HTTPS 网页连接。在数据泄漏的时间点，Geedge 看来还没有能有效封锁 WebTunnel 的手段，不过 Mesalab（与 Geedge 关系密切的中国科学院实验室）的学生已经在研究封锁的方法。报告作者据此推论，Geedge 知道 WebTunnel 是有效的规避工具。旧译文把这段写成 Mesalab 学生的研究证明 WebTunnel 很有效，没有提到他们在研究如何封锁。

研究团队在同一节的最后一段说明，他们先把发现告知 Tor Project 再对外公开，也没有找到证据显示 Geedge 发现或正在利用 Tor 软件与设计上的未知漏洞。旧译文漏了这一段。详见第 7 章[对 Tor 的封锁](https://anoni.net/docs/reports/interseclab-network-coup/index_7/#封鎖-Tor){target="_blank"}。

### 没有加密的连接

天狗安全网关（TSG）是 Geedge 卖给各国政府的国家级防火墙。原报告写到，连接没有加密（网址不是 https）时，TSG 能拦截密码、电子邮箱地址、附件与邮件内容。旧译文漏了密码与邮件内容，附件也译成只有元数据。浏览器地址栏标示「不安全」的网站，不要在上面登录或输入个人信息。也不要安装来路不明的证书，原报告写到，用户装了自签的根证书，TSG 就能解密 HTTPS 连接。详见第 5 章的[深度包检测](https://anoni.net/docs/reports/interseclab-network-coup/index_5/#深度封包檢測){target="_blank"}。

### 各国数据的访问与分享

系统由 Geedge 在中国的员工远程管理，Geedge 的员工似乎能访问各国网络用户的数据。数据看来也分享给 Mesalab 的学生，用来研究如何阻挡规避审查的工具，保留多久则还不清楚。旧译文的第 5 章有提到这件事，但主要发现漏了整节，只读摘要与主要发现的人无从得知。详见[主要发现](https://anoni.net/docs/reports/interseclab-network-coup/index_2/){target="_blank"}。

### 公司回复信

缅甸电信运营商 ATOM（前身为 Telenor Myanmar）的母公司被问到，是否知道有人以 Geedge 产品替缅甸运输与通讯部实施「大规模监控与审查」。旧译文的提问漏了运输与通讯部，无法得知监控是替谁做的。Sandvine 曾把审查设备卖给巴基斯坦，AppLogic Networks 就 Sandvine 的部分回复。信里写的是 Sandvine「先前并不知道」Geedge Networks，旧译文写成「并不知情」，读起来像到现在仍不知道。详见第 8 章的[附录](https://anoni.net/docs/reports/interseclab-network-coup/index_8/#附錄){target="_blank"}。

## 旧链接与反馈

章节的网址都没有改，小标题改名之后，旧链接指向的段落仍然存在，书签与其他文章里的链接都能用。更动的摘要记在译文首页的[更新纪录](https://anoni.net/docs/reports/interseclab-network-coup/#更新紀錄){target="_blank"}。

读到不通顺或看起来不对的地方，可以用页面右上方的编辑图标直接到 GitHub 提交修正，或到译文首页列出的 Matrix 频道一起讨论。

## 相关阅读

- [研究报告中译](../../reports/index.md)：网络政变与 MADLink 两份 InterSecLab 报告的中译
- [Tor Browser 进阶设定](../../tools/tor-browser-advanced.md)：无法连上 Tor 时如何设定网桥
- [VPN 的风险与选择](../../tools/vpn-guide.md)：选择 VPN 时要考虑的风险
- [Metadata 是什么，为什么重要](../../basics/metadata.md)：连接加密之后，仍会露出连到哪个网站
- [InterSecLab 网络政变报告的正体中文翻译](https://anoni.net/zh-cn/updates/2025/10/report-the-internet-coup/){target="_blank"}：2025 年 10 月译文上线时的公告
