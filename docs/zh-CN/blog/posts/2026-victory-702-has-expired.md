---
date: 2026-06-16
authors:
    - anoni-net
categories:
    - 更新
    - 翻译文章
    - 隐私
slug: 2026-victory-702-has-expired
image: "https://assets.anoni.net/blog/2026-victory-702-has-expired.png"
summary: "FISA Section 702 让美国情报机构不需令状就能收集境外人士的通信，2013 年斯诺登揭露的 PRISM 与 Upstream 都建立在这条授权之上。2026 年 6 月 12 日午夜，它在国会僵局中暂时到期。无论你在台湾、香港、澳门还是其他华语环境，本来就是这套境外监控的合法对象，这篇说清楚这套权力的范围、跟斯诺登事件的关联，以及为什么 EFF 把暂时失效也视为一场胜利。"
description: "FISA Section 702 让美国情报机构不需令状就能收集境外人士通信，2013 年斯诺登揭露的 PRISM 与 Upstream 都建立在它之上。2026 年 6 月 12 日它暂时到期。华语地区使用者本来就是境外监控的合法对象，这篇交代权力范围、斯诺登关联，以及 EFF 视为胜利的理由。"
---

# :material-eye-off-outline: FISA 702 条款到期：美国无令状收集境外通信的授权，2026 年 6 月暂时失效

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-victory-702-has-expired.png" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-victory-702-has-expired.png"
            alt="EFF 的 NSA eagle 图，把 NSA 标志改画成一只老鹰用爪子接上电信线路，象征无令状的大规模监控"
            style="border-radius: 10px;">
    </a>
    <figcaption>图片为 EFF 设计师 Hugh D'Andrade 绘制的「NSA eagle」，把 NSA 标志改画成老鹰用爪子接上电信线路，象征无令状的大规模监控。出自 [EFF 的 NSA 监控专题](https://www.eff.org/nsa-spying){target="_blank"}，授权为 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}[^img]。</figcaption>
</figure>

你寄一封信到 Gmail、用 iMessage 跟在美国的朋友聊天、用 WhatsApp 联络海外的家人，这些通信只要有一端落在美国的服务或网络上，本来就可能被美国情报机构在不需令状的情况下收集。授权这件事的法律叫 FISA Section 702（《外国情报监控法》第 702 条）。2026 年 6 月 12 日午夜，这条授权在美国国会的僵局中到期[^1]。

EFF（电子前线基金会）把这件事称为一场胜利。要理解为什么，得先知道 702 是什么、它跟 2013 年斯诺登（Edward Snowden）揭露的监控计划是什么关系，以及为什么华语地区使用者长期就是这套监控的合法对象，这次「暂时失效」对这个处境又意味着什么。

<!-- more -->

## Section 702 是什么

Section 702 由美国 2008 年的《FISA Amendments Act》（外国情报监控法修正案）设立[^3]。它允许美国情报机构在认定某位境外人士握有外国情报价值时，不经个别令状就收集这个人的通信，包含电子邮件、消息与通话。

关键在「境外人士」这四个字。702 的设计对象是美国境外的所有人，所以美国境外的每一个人，包含华语地区的使用者，在法律上本来就是这套收集的合法目标。美国公民受美国宪法第四修正案保护，需要令状，境外人士没有这层保护。

实务上，702 还会大量「附带收集」（incidental collection）到美国人的通信。只要美国人跟被锁定的境外目标有来往，他的邮件、消息、通话就会一并被收进数据库。这是后面争议的起点。

702 授权之下有两种具体的收集方式，名字许多人其实听过：

- **下游收集（Downstream，旧称 PRISM）**：政府要求 Google、Microsoft、Apple、Facebook、Yahoo 等科技公司，交出符合条件的使用者通信[^2]。
- **上游收集（Upstream）**：NSA（国家安全局）直接从互联网骨干的缆线与交换器上截取流量[^2]。

PRISM 与 Upstream 不是传说中的代号。它们是 702 这条法律授权底下，实际在跑的两个程序。

## 跟斯诺登事件的关联

斯诺登在 2013 年揭露的监控计划，法律基础正是 Section 702。当年 6 月，这位前 NSA 合同人员把一批内部简报交给记者，PRISM 与 Upstream 这两个名字就是从那批文件流入公众视野的[^2]。全世界第一次看到「原来美国可以这样收集全球的网络通信」，看到的就是 702 在运作的样子。

斯诺登揭露的是「如何收集」，Section 702 则是「凭什么能收集」的法律授权。

从立法到暂时失效，这套授权的几个主要时间点：

- `2008` 年：《FISA Amendments Act》通过，设立 Section 702，让原本游走在灰色地带的无令状收集有了明文授权。
- `2013` 年：斯诺登揭露 PRISM 与 Upstream，702 第一次成为全球公共议题，各国才意识到自己是这套收集的对象。
- 之后十多年：702 经 `2012`、`2017`、`2024` 多次重新授权，每一次都伴随改革派与情报机构的拉锯，EFF 等团体持续要求加上令状门槛。`2024` 年的 RISAA 把授权延到 `2026` 年 4 月，之后再靠临时延长撑到 6 月。
- `2026` 年 6 月 12 日：在一场国会僵局中暂时到期。

斯诺登当年揭露的计划，过了十三年，它的法律授权第一次出现空窗。

## 后门搜索（backdoor searches）为什么是争议核心

702 名义上锁定境外人士，真正在美国国内引发宪法争议的是后门搜索（backdoor searches），官方称为「美国人查询」（US person queries）。

702 收集进来的庞大通信数据库里，因为附带收集而塞满了美国人的通信。FBI（美国联邦调查局）、CIA（中央情报局）、NSA 之后可以用美国人的姓名、电子邮件、电话这类识别码去查询这个数据库，不需要另外申请令状。等于绕过了第四修正案对美国人的保护，从后门拿到数据。

规模不小，违规也不少：

- FBI 在 `2019` 到 `2022` 年间，对美国人做了将近 `500` 万次查询，这些查询程序上多属合法，争议在于大多缺乏个案的合理说明[^4]。
- 政府在 `2022` 年 3 月通报，光是对 Section 702 数据库的搜索，就有超过 `278,000` 次不符规定[^4]。
- 2024 年国会通过《Reforming Intelligence and Securing America Act》（RISAA，情报改革与保障美国法），加了一些改革，但没有解决无令状查询这个根本问题。到 `2024` 年 8 月，已经有报道指出 FBI 用了一个查询工具绕过 RISAA 的限制[^4]。

EFF 长期主张，FBI 要查询美国人在 702 之下被收集的通信，应该先取得令状。如果做不到这个门槛，那就让整个方案到期，不要再续[^1]。

## 2026 年 6 月发生什么

702 这次到期，导火线跟一桩人事任命有关。特朗普提名 Bill Pulte（时任联邦住房金融局局长）暂代国家情报总监（DNI），接替宣布请辞的 Tulsi Gabbard[^1][^5]。DNI 监督的正是执行 702 的情报机构，把这个位子交给一位没有情报资历、又曾以房贷诈欺名义追查特朗普政敌的人选，让参议院民主党不愿在这个时间点放行。他们以 Pulte 缺乏情报、军事与国会经历为由，拒绝推进自家版本的重新授权法案，众议院则否决了短期续延[^1][^5]。国会几次靠临时延长把期限往后推，最后在 6 月 12 日午夜停在到期[^1]。

到期不等于监控当天就停。依现有报道，外国情报监控法院（FISC）对既有方案的重新认证效力延续到 2027 年 3 月，为这段期间的收集留下法律依据。有法律专家直言「702 不会就此停摆（go dark），那是迷思」[^5]。这次到期更接近一个法律与政治上的转折点，而非开关被立刻关掉。

## 为什么 EFF 把暂时失效也当成胜利

EFF 点出，这套权力的滥用风险从来不系于某一个人或某一届政府。如果国会担心的是「某个人可能拿到美国人的敏感信息」，负责任的做法是去强化制度层面的透明、究责与监督机制，而不是把希望寄托在换掉某个人选[^1]。

2026 年一整年，国会两党对改革的胃口都在变大，愈来愈多人反对在没有令状门槛的前提下重新授权 702[^1]。一条运作了十多年、斯诺登揭露过、改革多次卡关的监控授权，能走到暂时失效这一步，本身就说明持续倡议是有用的。

## 回到华语地区：你本来就是境外监控的合法对象

702 的失效对美国的倡议者是一场胜利，对华语地区的使用者能保护到的范围却很有限。702 这几年的争议重点是保护美国人，后门搜索争的是美国人受第四修正案保护、却被绕过去查。无论你在台湾、香港、澳门、新马还是其他华语环境，本来就不在第四修正案的保护范围内，要查询你在 702 之下被收集的通信，对美国政府而言连后门都算不上，是正门。

### 你仍然是合法收集对象

有些人觉得反正自己不是美国政府针对的目标，因此对 702 无感。隐私防护设防的对象是能力，不是当下的善意或意图。一个机构今天没盯上你，不代表它握有的收集能力会跟着缩手，收集的对象与用途也会随政治情势改变。把任何握有大规模收集能力的行为者放进同一套[威胁模型](../../basics/threat-model.md)，比依赖「现在应该查不到我」可靠。

就算 702 真的消失，收集境外人士的手段也不只这一条。NSA 海外信号情报的主要法源是第 12333 号行政命令（Executive Order 12333，EO 12333，1981 年签署），它没有 FISC 的司法监督，国会监督也有限，而且完全不受这次 702 到期影响[^6]。对华语地区使用者这种境外人士的收集，702 在不在都能继续。这也是为什么这场胜利对华语读者该庆祝的成分有限，隐私还是得靠自己用加密守住，不能寄望某一条法律。

### 真正的防线是端对端加密

华语地区大量依赖美国的云端与通信服务，Google Workspace、Microsoft 365、iCloud、AWS、Meta 旗下的 WhatsApp 与 Instagram 都在其中（其中部分在中国大陆需要绕过封锁才能使用，但在港澳、新马与海外华人社群是日常工具）。很多人以为数据放在本地机房就安全，但只要服务商总部在美国，美国的 CLOUD Act（2018 年通过）就能要求它交出所掌控的数据，服务器放哪里不影响[^7]。欧盟为了同样的问题跟美国周旋多年、打过好几轮官司，华语地区连对等的数据保护协定都没有，处境更被动。真正有效的防线是端对端加密（E2EE），密钥不在服务商手上，就算数据被交出、或在传输途中被截取，没有密钥也读不到内容，对附带收集与后门搜索都挡得住。

端对端加密保护的是通信内容，Tor 进一步遮住连接本身。Upstream 从网络骨干截取流量，拿到的是你连去哪、跟谁往来这类连接信息。台湾、香港这类地方对外连接高度依赖国际海缆[^8]，通往美西、美东的跨太平洋缆线是重要干道之一，连接只要目的地或路由经过美国骨干，封包就落在 Upstream 的截取范围内。Tor 把流量加密后经多个中继转送，骨干上只看得到一段加密的 Tor 流量，服务商那边也对不出真正的使用者，等于打断 PRISM 与 Upstream 所仰赖的连接对应关系。Tor 挡得住这种大规模被动收集，但挡不了针对个人的主动入侵，例如利用浏览器漏洞去匿名化，斯诺登文件里 NSA 的 Tor Stinks 简报就坦承，只能去匿名化一小部分使用者[^9]。运作原理见 [什么是 Tor](../../tools/what-is-tor.md)。

### 谁的风险更高，社群能一起做什么

需要跟海外编辑室、国际组织、消息来源往来的记者与公民团体，跨境通信本来就多，附带收集碰到他们的机率比一般人高，这些角色值得把防护等级拉高，敏感协作走 Tor、不要把消息来源名单放在美国企业的云端，延伸的角色指南见 [记者如何保护消息来源](../../scenarios/journalist.md) 与 [社运行动者的数位准备](../../scenarios/activist.md)。匿名网络社群 anoni.net 把力气放在去中心、自架与加密这些靠自己的能力上，而不是等哪条法律来保障，正是因为 702 到期当天收集照旧、EO 12333 不受影响这个现实。对许多华语地区使用者来说，本地的监控往往是更切身的威胁，从中国大陆的网络审查与实名制，到各地不同的通信监察制度，加密与 Tor 对这些同样是防线。台湾的个资法、揭弊者保护法是其中一组本地脉络的例子，相关讨论见 [台湾个资法 2025 修法](../../taiwan/pdpa-2025.md) 与 [揭弊者保护法的技术观察](../../taiwan/whistleblower-law.md)。

702 暂时失效不会让监控立刻消失，跨境通信的隐私风险也不会因此归零。对每一个身在美国境外的人，真正要盯紧的是授权监控的法律结构，先确认自己在这套结构里的位置。今天就能做的第一步，是把日常联络换成默认端对端加密的工具，敏感的对外连接走 Tor。

## 相关阅读

- [端对端加密如何运作](../../advanced/e2ee.md)：为什么加密过的内容就算被截取也读不到
- [什么是 Tor](../../tools/what-is-tor.md)：多重中继转送如何打断大规模被动收集靠的连接对应
- [匿名通信工具比较](../../tools/messaging-comparison.md)：哪些通信工具默认端对端加密、各自的取舍
- [为什么 Metadata 比你想的更暴露](../../basics/metadata.md)：就算读不到内容，「谁跟谁、何时何地」本身就足以下决定
- [威胁模型：先想清楚你在防谁](../../basics/threat-model.md)：把国家级监控放进自己的威胁模型
- [台湾个资法 2025 修法](../../taiwan/pdpa-2025.md)：一个华语地区的数据保护制度案例

---

> 本文编译自 EFF Deeplinks 文章 [Victory! 702 has Expired!](https://www.eff.org/deeplinks/2026/06/victory-702-has-expired){target="_blank"}（作者 India McKinney，2026-06-12），并补上 Section 702 的背景、跟斯诺登事件的关联，以及华语地区观点。

[^1]: [Victory! 702 has Expired!](https://www.eff.org/deeplinks/2026/06/victory-702-has-expired){target="_blank"} - EFF Deeplinks（作者 India McKinney，2026-06-12）
[^2]: [Upstream vs. PRISM](https://www.eff.org/pages/upstream-prism){target="_blank"} - EFF（说明 702 之下 Upstream 与 PRISM 两种收集方式，及其与 2013 年斯诺登揭露的关系）
[^3]: [The 702 Ultimatum: Warrant Requirement or Bust](https://www.eff.org/deeplinks/2026/06/702-ultimatum-warrant-requirement-or-bust){target="_blank"} - EFF Deeplinks（EFF 对本次到期前的主张：加上令状门槛，否则就让它到期）
[^4]: [Section 702 of the Foreign Intelligence Surveillance Act, Explained](https://www.brennancenter.org/our-work/research-reports/section-702-foreign-intelligence-surveillance-act){target="_blank"} - Brennan Center for Justice（backdoor searches 次数、违规通报、RISAA 2024 背景）
[^5]: [A key spy authority, Section 702, expired due to inaction in Congress. Here's what happens next.](https://www.cbsnews.com/news/fisa-section-702-expiring-congress-what-that-means/){target="_blank"} - CBS News（到期时间线、Pulte 任命、既有认证延续至 2027 年 3 月）
[^6]: [Foreign Intelligence Surveillance (FISA Section 702, Executive Order 12333, and Section 215 of the Patriot Act)：A Resource Page](https://www.brennancenter.org/our-work/research-reports/foreign-intelligence-surveillance-fisa-section-702-executive-order-12333){target="_blank"} - Brennan Center for Justice（EO 12333 为 NSA 海外监控的主要法源，无 FISC 司法监督，不受 702 到期影响）
[^7]: [Cross-Border Data Sharing Under the CLOUD Act](https://www.congress.gov/crs-product/R45173){target="_blank"} - Congressional Research Service（CLOUD Act 可要求美国服务商交出其掌控的数据，与服务器所在地无关）
[^8]: [海底电缆：藏在台湾深海的网络护国神山](https://www.bnext.com.tw/article/60585/taiwan-submarine-cable){target="_blank"} - 数位时代（台湾国际海缆主干道走向）
[^9]: [NSA and GCHQ target Tor network that protects anonymity of web users](https://www.schneier.com/essays/archives/2013/10/nsa_and_gchq_target.html){target="_blank"} - Bruce Schneier（原载 The Guardian，说明 Tor Stinks 与 EgotisticalGiraffe 文件内容）
[^img]: 题图 [NSA-eagle-2_0.png](https://www.eff.org/files/banner_library/NSA-eagle-2_0.png){target="_blank"}，出自 [EFF 的 NSA 监控专题](https://www.eff.org/nsa-spying){target="_blank"}，作者为 EFF 设计师 Hugh D'Andrade，授权 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}。
