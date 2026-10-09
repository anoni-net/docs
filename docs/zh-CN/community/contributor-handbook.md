---
title: 贡献者百科
description: 文档站的文件命名、链接规则、PR 流程、Issue 分类与翻译流程，以及新贡献者第一周会碰到的疑问。写作风格规范在社群首页。
icon: material/book-open-variant
---

# :material-book-open-variant: 贡献者百科

社群协作久了会累积许多不成文规定：文件名如何命名、PR 描述要写什么、Issue 如何分类、新贡献者第一周会碰到的疑问。这份贡献者百科把这些散落在 README、Issue 留言、Matrix 对话里的内容整合成一页，方便新成员一次看完，也让资深成员有共同对话的依据。

如果你是第一次参与，建议先看 [如何参与与认领主题](https://anoni.net/zh-cn/join/) 决定方向，再回来这页查具体做法。完整的工具入口与账号申请见 [社群自架服务](https://anoni.net/zh-cn/services/)。

## 第一周的入门路径

依「我想做什么」分流：

- **想试水温，先看看内容**：先读 [基础概念](../basics/index.md) 任一篇，再用 [自我技能评估表](./skill-level.md) 评估自己对 Tor、Tails、OONI 的熟悉度
- **想开始写作或翻译**：申请 Matrix 账号（见 [社群自架服务](https://anoni.net/zh-cn/services/)）→ 加入 Public Space → 表达意愿 → 认领一个 Issue
- **想参与技术维运**：申请 GitHub 对 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 的协作权限 → 看 [项目研究预先准备](./setup-repo.md) 建好开发环境
- **想加入活动筹备**：到 Matrix 对应 room 询问近期活动（COSCUP、工作坊、小聚），协助文宣、现场、报名等任务

每条路径的第一步都是「进到 Matrix 表达意愿」。社群运作偏向 async，留消息后等一两天回复是正常节奏。

## 写作风格规范

写作风格是 anoni.net 三个网站共用的规范，全文在社群首页的[写作风格规范](https://anoni.net/zh-cn/join/writing-style/)，规则以[正体中文版](https://anoni.net/join/writing-style/)为准，英文照它的[英文版](https://anoni.net/en/join/writing-style/)。这一节只写文档站执行 linter 的方式。

### 执行 linter

CI 的 `docs-style-lint` 只在 `docs/zh-TW`、`docs/zh-CN`、`docs/en` 的 Markdown 变更时触发。根目录的 `README.md`、`CONTRIBUTING.md` 这类说明文件改完，需要自己执行一次：

```bash
python3 tools/docs_style_lint.py README.md CONTRIBUTING.md
```

`NOTICE` 没有 `.md` 扩展名，linter 只收 `.md` 与 `.js`，那一份要人工看。

有一组规则明文豁免既有内容，目前只有写作风格规范「标题句构」的 `title-colon`。CI 传 `--changed-since <base>`，让这组规则只在这个 PR 真的动过的行上报。本机想看整个文件的全貌就不要带那个旗标：

```bash
python3 tools/docs_style_lint.py --changed-since origin/main docs/en/tools/vpn-guide.md
```

没有这个机制的话，改一行图片引用就会带出整篇旧标题的 annotation，跟作者的改动无关，而真正该修的那几条会被淹在里面。

规则文件本身逐条写出被禁用的标点与句型，扫自己的规则描述必然全红。社群首页的写作风格规范、这份百科与工作区的投影文件靠 linter 的 `RULE_DOCS` 依文件名豁免，`tools/README.md` 的规则表与已知边界两段用 `<!-- docs-style-lint: disable -->` 与 `enable` 包住。写规则说明时照同一个做法，引用的例子要保持原样。

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
| `community/` | 架设与运营的教程、读懂观测数据的方法、贡献与翻译规范 |

社群本身的页面与公告不放在文档站。关于我们、参与方式、自架服务、活动与社群动态在 [anoni.net](https://anoni.net/zh-cn/)，源代码是 [`anoni-net/www`](https://github.com/anoni-net/www)，活动公告、项目上线、工作进度这类社群公告发在该 repo 的 `updates/`。文档站的 `blog/` 放外部文章的翻译、技术分析、观测报告与文档站自己的更新回顾。

如果你的新文章不确定该放哪一类，先在 Matrix 上问一声，避免直接 PR 后又要搬。

### 搬档、改名、删页要补 redirect

移动、改名或删除已上线的页面时，在同一个 PR 补上 redirect，让旧网址不会变成 404。旧网址会长期活在搜索引擎、书签与外部链接里，少了 redirect 就流失既有读者与累积的 SEO 权重。

- redirect 写在三支 mkdocs 设定的 `plugins.redirects.redirect_maps`：`mkdocs.yml` 对应 zh-TW（`/docs/`）、`mkdocs_en.yml` 对应 en、`mkdocs_cn.yml` 对应 zh-cn。
- 格式是「旧路径: 新路径」，路径相对各语系的 docs 目录，不含 `docs/<lang>/` 前缀。例：`'tools/what-is-ooni.md': 'tools/index.md'`。
- 找不到一对一的新页时，导向所属分类的 index 页（`community/index.md`、`tools/index.md` 等）。
- 既有 redirect 保留不删，旧网址会一直有人点进来。唯一要回头改的情况：某条的目标页自己也被移掉，redirect 变成断链。

### 拆页或搬走段落要回头检查入口链接

redirect 管不到内容搬移。页面留着、只有其中一段被拆到新页时，旧网址仍然回 200，没有任何工具会报错，但指向旧页的按钮与链接承诺的东西已经在别处。

- 拆页或把段落搬到别页时，在同一个 PR 内搜索站内指向来源页的链接，把文案提到搬走内容的那几条重新指向新页。
- strict build 与 `docs-style-lint` 都抓不到这种错。两个目标文件都存在，错的是链接语意而非能不能连，只有读按钮文案对照目的地才找得到。
- 已发布的 blog 文也算在内。按钮是功能性入口，读者点它是要找那份内容，重新指向不等于改写文章当时的记述。

实例：2025-05 把工作坊页拆成两页时，`event-workshop-2025.md` 留下活动资讯，招募与筹备内容搬到 `event-workshop-2025-prepare.md`。两篇 2025-04 的贴文有「查看工作坊招募页面说明」与「了解筹备事项」两个按钮仍指向活动页，到 2026-08 才被发现。

## 图片与资源

截图与示意图走不同的路径。

截图（操作画面、网站画面）放在 `docs/<lang>/assets/images/`：

- 在 markdown 引用：对于 `basics/`、`tools/` 等深度 1 的目录，用 `../../assets/images/文件名`
- 对于 `reports/interseclab-network-coup/` 等深度 2 的目录，用 `../../assets/images/文件名`（刚好一样）
- 优先使用 webp 或最佳化过的 png，不直接放手机原始大档
- 有 lightbox（点击放大）时，HTML 用 `<figure>` + `<a href>` 包 `<img>`，两个的相对路径都要对齐
- 三个语系的 `assets/images/` 各自独立，补了一个语系记得补另外两个。漏掉的话构建不会报错，站上就是一页破图，执行 `python3 tools/check_image_refs.py` 扫得出来

示意图（流程图、架构图、对照矩阵、时间轴）的原始文件放 `docs/diagrams/`，发布到 assets.anoni.net，三个语系引用同一个网址。制作、命名与发布流程见[文档站的视觉规范](visual-guide.md)的「贡献技术图示」一节。

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

常用 type：`docs`、`feat`、`fix`、`chore`、`refactor`。scope 用语系或子项目名称（`zh-TW`、`zh-CN`、`en`、`tools`）。

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

Issue 标签沿用 GitHub 默认的那一组，另外加上 `l10n`。用 Issue 模板开单时，类型标签会自动带上：

| 标签 | 用途 |
|---|---|
| `documentation` | 新增或修改文章内容 |
| `enhancement` | 改进建议、小工具提案、技术评估 |
| `bug` | 网站或工具的行为错误 |
| `l10n` | 翻译与本地化 |
| `question` | 问题讨论 |
| `good first issue` | 范围明确，不必先熟悉整个仓库就能接手 |
| `help wanted` | 需要更多人手 |
| `duplicate`、`invalid`、`wontfix` | 结案时注明原因 |

语系与分类不另设标签，写在 Issue 的标题或正文。第一次参与可以从 [good first issue 列表](https://github.com/anoni-net/docs/labels/good%20first%20issue){target="_blank"}挑一张，在 Issue 下留言认领，避免两个人做同一件事。

开 Issue 前可以先在 GitHub 搜索既有 Issue，避免重复。

## 翻译流程

zh-TW 是 single source of truth，zh-CN 与 en 从 zh-TW 同步。详细流程见 [中文化与文件翻译](./i18n.md)：

- 新文章默认先写 zh-TW
- zh-CN 用 AI 协作工具直接翻译为候选稿（包含台式→中式词汇、政治措辞调适），再由社群成员校对词汇与政治措辞差异
- 既有 zh-CN 档已有人类校对版本，结构搬迁时只 git mv，不重翻覆盖
- en 需要更多人工，因为文化脉络转换比语系翻译费时
- zh-CN 与 en 的翻译不必同步上线，依社群人力滚动处理
- 校对时要抓「翻漏」，也就是 zh-TW 具名的国家、公司、机构、法条、数字在译文被换成上位词。判准与检查方式见 [校对时要抓的是翻漏](./i18n.md#校对时要抓的是翻漏)

## 提问前先看哪里

新贡献者最常问的问题与对应出处：

| 问题 | 看这里 |
|---|---|
| 如何选择主题开始？ | [如何参与与认领主题](https://anoni.net/zh-cn/join/) |
| 如何申请 Matrix 账号？ | [社群自架服务](https://anoni.net/zh-cn/services/) |
| 我的程度适合做什么？ | [自我技能评估表](./skill-level.md) |
| 如何设定开发环境？ | [项目研究预先准备](./setup-repo.md) |
| 翻译有什么规范？ | [中文化与文件翻译](./i18n.md) |
| 紧急情况的对外资源？ | [紧急求救](../help/index.md) |

如果上述都没答案，到 Matrix 询问。询问前尽量提供：你想做什么、你已经试过什么、你卡在哪。

## 行为准则摘要

社群以开放、互助、合法为原则。以下是快速摘要，完整版（含角色定义、决策流程、争议处理）见 [治理章程](https://anoni.net/zh-cn/about/governance/)，两者不一致时以治理章程为准。重点：

- **互相尊重**：不同背景、不同熟悉度的成员一视同仁
- **讨论议题不攻击个人**：对事不对人
- **合法前提**：所有讨论与协作以合法用途为前提，不协助洗钱、规避税务、骚扰、跟踪、未授权入侵等行为
- **信息披露**：涉及个人数据、机敏信息的处理走 [上传机敏信息流程](https://anoni.net/zh-cn/join/upload-sensitive/)
- **争议处理**：先在 Matrix 讨论，没有共识可提案到下一次社群同步讨论

违反原则的行为会由核心成员依治理章程处理。

## 这份百科是活文件

新贡献者遇到不在这页的问题、发现某个流程其实没写清楚，欢迎提案改这页。改 contributor-handbook 本身就是一个 good first issue 的好题目。
