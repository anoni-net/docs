---
date: 2026-03-19
authors:
    - toomore
categories:
    - 更新
    - Tor
slug: tpa-adr
image: "assets/images/tor.webp"
summary: "Tor 系统管理团队 TPA 改用 ADR 记录决策：更短的模板、更清楚的决策者、以及把决策记录与对外沟通分开。"
description: "TPA 从 RFC 改为 ADR 的缘由与做法，以及为何「先决定谁做决定」很重要；文末整理其他开源项目的提案与决策流程。"
---

# 用 ADR 记录决策：Tor 系统管理团队的新做法

!!! info ""

    以下内容原文翻译来自以下文章，主词角色为 Tor Project TPA 团队：

    - [Keeping track of decisions using the ADR model, by anarcat | February 16, 2026](https://blog.torproject.org/tpa-adr/){target="_blank"}

    文末另有一节「**台湾项目与社群的现状**」，整理台湾在地脉络与为什么值得引进 ADR，欢迎直接跳读。

![Tor](./assets/images/tor.webp)

在 Tor Project 的系统管理员团队（俗称 TPA）里，我们最近改变了做决策的方式，这代表你会从我们这边收到更清楚的沟通：无论是即将进行的变更，或是针对某项提案的具体问题。

请注意，这项变更只影响 TPA 团队。在 Tor 内部，每个团队都有自己协调与决策的方式，目前这套流程只在 TPA 使用。我们鼓励 Tor 内外其他团队评估这套做法，看看是否能改善你们的流程与文件。

<!-- more -->

## 新流程

我们过去一直使用「RFC」（Request For Comments，请求意见）流程，最近已改为「ADR」（Architecture Decision Record，架构决策记录）。

对我们来说，ADR 流程相当简单，包含三件事：

1. 更精简的模板
2. 更精简的流程
3. 与决策记录分开的沟通准则

### 模板

作为团队负责人，我做的第一件事是提出新模板（见 [ADR-100](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/0100-adr-template){target="_blank"}），这是 [Nygard 模板](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md){target="_blank"}的变体。[TPA 的模板版本](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/template){target="_blank"}同样简洁，只有 5 个标题，值得完整引用：

- **Context（背景）**：我们看到什么问题，促使我们做这项决策或变更？
- **Decision（决策）**：我们提议和（或）正在做的变更是什么？
- **Consequences（后果）**：因为这项变更，哪些事会变得更容易或更困难？
- **More Information（更多信息，选填）**：还有什么我们该知道的？对较大的项目，可考虑纳入时程与成本估计、对受影响用户的冲击（或许包含既有 Personas）。一般来说，这里会包含对所考量替代方案的简短评估。
- **Metadata（元数据）**：状态、决策日期、决策者、被咨询者、需被告知的用户，以及讨论论坛链接。

[先前的 RFC 模板](https://gitlab.torproject.org/tpo/tpa/wiki-replica/-/blob/d52de1828d3ee406996345704d12663dd30f5513/policy/template.md){target="_blank"}有 **17**（十七个！）标题，容易催生出很长的文件。现在，决策记录更容易一眼读完、消化。

一个立竿见影的效果是，我开始更常把比较与脑力激荡放在 GitLab 的 issue 里。像是定价或深入替代方案比较这类细节，我们改在讨论 issue 里记录，让文件保持精简。

### 流程

整个流程简单到也值得完整引用：

> 重大决策在会议中向利益相关方说明，较小的决策则用电子邮件。一段延迟时间让人可以在采纳前提出最后意见。

当然，魔鬼藏在细节里（见 [ADR-101](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/0101-adr-process){target="_blank"}），但重点是保持简单。

这项提案的关键之一，也就是 Jacob Kaplan-Moss 所说的 [one weird trick](https://jacobian.org/2023/dec/5/how-to-decide/){target="_blank"}，就是「先决定谁做决定」。我们过去的流程对「谁来做决策」很模糊，新模板（与流程）则在每项决策上都厘清决策者。

反过来说，有些决策会沦为在琐碎议题上没完没了的讨论，因为被咨询的利益相关方太多：这就是所谓的 [琐碎法则](https://en.wikipedia.org/wiki/Bike_shedding){target="_blank"}（Law of triviality），也叫「自行车棚效应」（Bike Shed syndrome）。

新流程更清楚区分利益相关方：

- **「决策者」**（decision maker）（取代模糊的「核准」）
- **「被咨询者」**（consulted）（以前没有定义！）
- **「需被告知者」**（informed）用户（以前叫「受影响用户」）

要挑出这些利益相关方仍然不简单，但我们的定义更明确，也与经典的 [RACI 矩阵](https://en.wikipedia.org/wiki/Responsibility_assignment_matrix){target="_blank"}（Responsible, Accountable, Consulted, Informed）对齐。

### 沟通准则

最后，流程中很重要的一环（[ADR-102](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/0102-adr-communications){target="_blank"}）是：把「做决策与记录决策」和「对外沟通决策」拆开。这是两个截然不同的问题。我们发现，一份文件无法同时满足两者。

因为 ADR 可能影响的范围很广，我们没有为沟通订死一个模板。我们建议用 [五何法](https://en.wikipedia.org/wiki/Five_Ws){target="_blank"}（Five Ws）（谁？什么？何时？哪里？为什么？），再次强调：保持简单。

## 为何走到这一步

[ADR 流程](https://adr.github.io/){target="_blank"}不是我发明的。我最早是在 [Thunderbird Android 项目](https://github.com/thunderbird/thunderbird-android/blob/be2af5c6a0bce08385fc3f654c1185ccf9db3859/docs/architecture/adr/README.md){target="_blank"}里看到的。接着，在检讨 RFC 流程的同时（见 [讨论 issue](https://gitlab.torproject.org/tpo/tpa/team/-/issues/41428){target="_blank"}），我读了 Jacob Kaplan-Moss 对 [RFC 流程的批评](https://jacobian.org/2023/dec/1/against-rfcs/){target="_blank"}。他大致认为：

1. RFC 流程「没有包含任何决策框架」
2. 「RFC 流程容易导致无止境的讨论」
3. 流程「奖励写到精疲力竭的人」
4. 「这些流程对专业不敏感」、对「权力动态与权力结构」也不敏感

说实话，上述问题我很多都犯过。身为一个啰唆的作者，我写过 [极长的提案](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy/tpa-rfc-33-monitoring){target="_blank"}，我怀疑从来没有人从头读完。有些提案是靠大家累到放弃才通过的，有些则因为没找对利益相关方而被忽略。

我们在 [讨论 issue](https://gitlab.torproject.org/tpo/tpa/team/-/issues/41428){target="_blank"} 里有更多关于我们 RFC 流程问题的细节。但要公平地说，旧流程在当时还是有用的：有总比没有好，而且让我们在 6 年间记录了数量可观的变更与决策（[95 份 RFC](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/policy){target="_blank"}！）。

## 接下来呢？

我们仍在实验「决策周边的沟通」该怎么做，这篇文章本身或许就是例子。因为沟通是独立一步，我们也容易忘记或拖延，例如这篇贴文就晚了好几个月。

以前我们会直接把 RFC 副本寄给大家，又快又简单，但对多数人来说难以理解。现在我们得另外写一份沟通稿，工作变多了，但希望结果更容易消化，值得这份付出。

我们很期待听到你对新流程的想法、以及它对你的效果、可以在这里回复，或到 [讨论 issue](https://gitlab.torproject.org/tpo/tpa/team/-/issues/41428){target="_blank"}。我们特别感兴趣的是：已经在用类似流程的人，或是读完这篇后打算采用的人。

!!! question "这篇在说什么？为什么 Tor 做这样的改变？"

    若你刚读完上面的翻译，这里是整篇的重点整理。
    
    **问题在哪里？**  
    TPA 过去用 RFC 记录决策，但 RFC 流程有几个根本问题：缺乏明确的决策框架、讨论容易拖成冗长战、变相奖励「写很多」的人、对专业与权力结构不敏感。虽然 6 年来 95 份 RFC 仍有贡献，但文件难读、谁有权做决定也不清楚。
    
    **他们做了什么？**  
    改采 ADR，并聚焦三件事：
    
    1. **更短的模板**：从 17 个标题缩成 5 个（背景、决策、后果、更多信息、元数据），细节改放到 GitLab issue 讨论。
    2. **更简单的流程**：重大决策在会议说明、小决策用 email；并**先决定谁做决定**——明确区分「决策者」「被咨询者」「需被告知者」，对齐 RACI，避免人人可发言、没人拍板，或太多人卷入琐事（自行车棚效应）。
    3. **决策与沟通分开**：ADR 只负责「记录决策」；对外公告、说明另写一份（例如用五何法），让决策记录与沟通各司其职。
    
    **效果**：决策文件更好读、权责清楚、减少无止境讨论与自行车棚效应；对外沟通虽然多一步，但更易消化。

!!! info "其他开源项目的提案与决策流程"

    不同项目用不同方式做「提案」与「记录决策」，以下简要整理几个常见做法，供对照与参考。
    
    - **GOV.UK Design System**：用 **RFC** 讨论提案、用 **ADR** 记录最终决策；proposals 放在公开仓库，例如 [001-use-rfcs-and-adrs-to-discuss-proposals-and-record-decisions](https://github.com/alphagov/govuk-design-system-architecture/blob/main/proposals/001-use-rfcs-and-adrs-to-discuss-proposals-and-record-decisions.md){target="_blank"}，等于「讨论用 RFC、定案用 ADR」并行。
    
    - **Bitwarden**：有专用的 [ADR 文档与索引](https://contributing.bitwarden.com/architecture/adr/){target="_blank"}，提供模板与浏览界面，以 ADR 为主记录架构决策。
    
    - **GitLab**：部分子项目（例如 GitLab Chart）逐步把架构文件改写成 ADR 格式，属于「既有文件 ADR 化」的实践。
    
    - **ADR 社群、MADR**：[adr.github.io](https://adr.github.io/){target="_blank"} 提供 MADR（Markdown Architectural Decision Records）模板与工具，许多项目采用，通用且轻量。
    
    - **Rust**：通过 [rust-lang/rfcs](https://github.com/rust-lang/rfcs){target="_blank"} 的 **RFC** 流程，编号提案、社群讨论、最终决策记录，推动语言与标准库变更。
    
    - **Python**：使用 **PEP**（Python Enhancement Proposal）作为语言与标准库变更的正式提案与编号制度。
    
    - **Kubernetes**：使用 **KEP**（Kubernetes Enhancement Proposal）处理功能与架构变更的提案与讨论流程。
    
    整体来说：有的项目「RFC 讨论 + ADR 记录」并行（如 GOV.UK），有的以 ADR 为主（如 Bitwarden、TPA），大型生态则常用编号提案（RFC、PEP、KEP）。Tor TPA 的特别之处在于明确「先决定谁做决定」、以及把「决策记录」与「对外沟通」分开处理。

!!! info "台湾项目与社群的现状"

    在台湾，多数项目或社群其实已经有「提案、讨论、共识」的流程，只是**不一定用 ADR 这个名字**，也较少把决策文件以 `adr/` 目录或 MADR 模板的形式公开出来。
    
    - **公民科技与社群（例如 g0v 生态）**：  
      常见作法是「提案文件、[HackMD 协作文档](https://g0v.hackmd.io/@jothon/intro){target="_blank"}、黑客松或线上会议讨论」（可参考 [g0v 开源协作手册](https://g0v.hackmd.io/@jothon/g0v-cowork-guideline/){target="_blank"}），项目讨论与决策多散落在协作文档、issue 或大松提案中，架构层级的关键决策往往分散在 issue、PR、简报或协作文档里，过一段时间就不容易追溯「当初为什么这样决定」。
    
    - **政府与公共部门合作案**：  
      项目通常会有规格书、系统设计文件或项目报告，形式上比较接近「一次性的大文件」，而不是随着时间累积的 ADR log，而且多半不完全公开，外部贡献者很难看到背后的取舍。
    
    - **企业开源项目（台湾团队）**：  
      某些团队在公司内部其实有用「决策记录」或「设计文件」的方式管理架构变更，但经常只在内部运维知识库中存在，开源出去的只有代码本身，看不到决策历史。
    
    目前的状况，台湾社群不是没有决策的流程，主要是少一种「稳定、好追溯、又对外面友善」的记录方式。这也是为什么 Tor TPA 用的 ADR 模型，或许也可能适合台湾的项目参考：

    - 每个重要决定都可以写成一份小文件，把「为什么要这样决定」记清楚。
    - 不用大家硬写一大本规格书，又比只丢在 issue 里容易长久维护。
    - 新手或外来的人看 ADR，就能很快懂「**原来系统是因为这样才变成这样**」，也比较不会一直重复这些讨论。
