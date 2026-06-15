---
title: 贡献者百科
description: 写作风格、命名规则、PR 流程、Issue 模板与常见问题的整合指引。
icon: material/book-open-variant
---

# :material-book-open-variant: 贡献者百科

社群协作久了会累积许多不成文规定：标题该如何下、文件名如何命名、PR 描述要写什么、Issue 如何分类、新贡献者第一周会碰到的疑问。这份贡献者百科把这些散落在 README、Issue 留言、Matrix 对话里的内容整合成一页，方便新成员一次看完，也让资深成员有共同对话的依据。

如果你是第一次参与，建议先看 [如何参与与认领主题](./how-to-contribute.md) 决定方向，再回来这页查具体做法。完整的工具入口与账号申请见 [社群自架服务](./tools.md)。

## 第一周的入门路径

依「我想做什么」分流：

- **想试水温，先看看内容**：先读 [基础概念](../basics/index.md) 任一篇，再用 [自我技能评估表](./skill-level.md) 评估自己对 Tor、Tails、OONI 的熟悉度
- **想开始写作或翻译**：申请 Matrix 账号（见 [社群自架服务](./tools.md)）→ 加入 Public Space → 表达意愿 → 认领一个 Issue
- **想参与技术维运**：申请 GitHub 对 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 的协作权限 → 看 [项目研究预先准备](./setup-repo.md) 建好开发环境
- **想加入活动筹备**：到 Matrix 对应 room 询问近期活动（COSCUP、工作坊、小聚），协助文宣、现场、报名等任务

每条路径的第一步都是「进到 Matrix 表达意愿」。社群运作偏向 async，留消息后等一两天回复是正常节奏。

## 写作风格规范

### 禁用句型与标点

- 不使用 `——`（双破折号）作为句中插入语。需要补充说明时，改用冒号、逗号，或拆成两句
- 不使用「不是...而是...」句型。改用正向直述
- 避免用「；」断句，优先用「。」或拆句
- 并列词语或短语请用「、」，不要用全形「／」当列举符号（半形 `/` 用在路径、URL、技术惯用写法）

### 并列引号的标点

连续的「」引号之间要加「、」。错误与正确对照：

- :material-close: `「决策者」「被咨询者」「需被告知者」`
- :material-check: `「决策者」、「被咨询者」、「需被告知者」`

### 段落语气

- 像一位了解主题的社群成员在解释，而非教科书或百科条目
- 不在每段末尾加总结句，让段落自然收尾
- 避免「值得注意的是」、「总的来说」、「综上所述」、「谈的是」、「指的是」、「涵盖的是」这类开头

### 标点集合

正文主要使用：「、」、「，」、「。」、「：」、「「」」、「（）」。技术术语（Tor、OONI、IP、USB 等）保持英文原文，不加引号。

## 文件命名与目录

### 文件名

- 全部小写，使用连字号分隔（`tor-browser-advanced.md`、`anonymity-vs-privacy.md`）
- slug 以英文为主，避免中文文件名
- 缩写保持小写（`vasp-2026.md` 而非 `VASP-2026.md`）

### 目录结构

文件站的目录结构维持扁平，不再加深层子目录。新文章放进现有的 7 大分类：

| 分类 | 内容性质 |
|---|---|
| `basics/` | 概念层，匿名与隐私的核心思考工具 |
| `tools/` | 工具层，具体的工具介绍与比较 |
| `scenarios/` | 场景层，特定角色或情境的应用 |
| `advanced/` | 进阶层，技术深度的延伸阅读 |
| `taiwan/` | 在地脉络，台湾的法规、观测、研究 |
| `reports/` | 严选报告，外部研究的中译 |
| `community/` | 社群文件，治理、流程、入口页 |

如果你的新文章不确定该放哪一类，先在 Matrix 上问一声，避免直接 PR 后又要搬。

## 图片与资源

- 图片放在 `docs/zh-TW/assets/images/`
- 在 markdown 引用：对于 `basics/`、`tools/` 等深度 1 的目录，用 `../../assets/images/文件名`
- 对于 `reports/interseclab-network-coup/` 等深度 2 的目录，用 `../../assets/images/文件名`（刚好一样）
- 截图优先使用 webp 或最佳化过的 png，不直接放手机原始大档
- 图片如果有 lightbox（点击放大），HTML 用 `<figure>` + `<a href>` 包 `<img>`，两个的相对路径都要对齐

## 跨档链接规则

内部链接用相对路径，不要写成 `/docs/zh-TW/...` 绝对路径：

- 同一目录：`./other-file.md` 或直接 `other-file.md`
- 跨目录：`../basics/anonymity-vs-privacy.md`
- 跨深度：`../../blog/posts/2025to2026.md`

文章末尾建议放「接下来」、「相关阅读」之类的小节，链接到 2–4 篇相关文章。基础、工具、场景、进阶之间的横向链接比单向引用更有用。

## PR 流程

### Branch 命名

- `docs/<short-slug>` 处理文件变动（例：`docs/vasp-2026-rewrite`）
- `feat/<short-slug>` 处理新功能或新分类（例：`feat/payments-stubs`）
- `fix/<short-slug>` 处理 bug 修正

### Commit 消息格式

采用 conventional commits：

```
<type>(<scope>): <subject>

<body>
```

常用 type：`docs`、`feat`、`fix`、`chore`、`refactor`。scope 用语系或子项目名称（`zh-TW`、`zh-CN`、`en`、`pulse`、`asn_coverage`）。

### PR 描述

PR 描述至少包含：

- 改动的「为什么」（链接 Issue 或社群讨论）
- 改动的范围（哪些文件、哪几个段落）
- 对读者的影响（链接是否会坏、URL 是否变更、有没有相依的文件要一起改）

### Review

- 翻译、文字校对：请求至少一位非作者 review
- 结构性变动（搬档、改 nav）：先在 Matrix 提案讨论，再开 PR
- 图片、资源：自我检查 alt 文字、文件名、版权标示

## Issue 分类

Issue 标签体系（持续调整中）：

- `type:docs` 文件相关
- `type:bug` 行为错误
- `type:enhancement` 改进建议
- `type:question` 问题讨论
- `area:zh-TW` / `area:zh-CN` / `area:en` 语系区分
- `area:tools` / `area:scenarios` 等对应分类
- `good first issue` 给新贡献者的入门 Issue
- `help wanted` 需要更多协助的 Issue

开 Issue 前可以先在 GitHub 搜寻既有 Issue，避免重复。

## 翻译流程

zh-TW 是 single source of truth，zh-CN 与 en 从 zh-TW 同步。详细流程见 [中文化与文件翻译](./i18n.md)：

- 新文章默认先写 zh-TW
- zh-CN 用 Claude Code 直接翻译为候选稿（包含台式→中式词汇、政治措辞调适），再由社群成员校对词汇与政治措辞差异
- 既有 zh-CN 档已有人类校对版本，结构搬迁时只 git mv，不重翻覆盖
- en 需要更多人工，因为文化脉络转换比语系翻译费时
- zh-CN 与 en 的翻译不必同步上线，依社群人力滚动处理

## 提问前先看哪里

新贡献者最常问的问题与对应出处：

| 问题 | 看这里 |
|---|---|
| 如何选择主题开始？ | [如何参与与认领主题](./how-to-contribute.md) |
| 如何申请 Matrix 账号？ | [社群自架服务](./tools.md) |
| 我的程度适合做什么？ | [自我技能评估表](./skill-level.md) |
| 如何设定开发环境？ | [项目研究预先准备](./setup-repo.md) |
| 翻译有什么规范？ | [中文化与文件翻译](./i18n.md) |
| 紧急情况的对外资源？ | [紧急求救](../help/index.md) |

如果上述都没答案，到 Matrix 询问。询问前尽量提供：你想做什么、你已经试过什么、你卡在哪。

## 行为准则摘要

社群以开放、互助、合法为原则。以下是快速摘要，完整版（含角色定义、决策流程、争议处理）见 [治理章程](./governance.md)，两者不一致时以治理章程为准。重点：

- **互相尊重**：不同背景、不同熟悉度的成员一视同仁
- **讨论议题不攻击个人**：对事不对人
- **合法前提**：所有讨论与协作以合法用途为前提，不协助洗钱、规避税务、骚扰、跟踪、未授权入侵等行为
- **信息披露**：涉及个人资料、机敏信息的处理走 [上传机敏信息流程](./upload-sensitive.md)
- **争议处理**：先在 Matrix 讨论，没有共识可提案到下一次社群同步讨论

违反原则的行为会由核心成员依治理章程处理。

## 这份百科是活文件

新贡献者遇到不在这页的问题、发现某个流程其实没写清楚，欢迎提案改这页。改 contributor-handbook 本身就是一个 good first issue 的好题目。
