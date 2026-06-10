---
title: 什么是 CryptPad
description: CryptPad 是少数让服务器看不到内容的在线协作办公套件，所有文档在浏览器端就完成加密。一个界面涵盖 Google Docs、Sheets、Slides、看板、白板、表单与日历。社区自建 cryptpad.anoni.net，界面内建简体（zh_Hans）与正体（zh_Hant）中文。
icon: material/file-lock-outline
---

# :material-file-lock-outline: 什么是 CryptPad？

写一份不能曝光的文档，最直接的选择是什么？Google Docs 写起来最顺，但每一段文字、每一次修订都以可被服务商读取的形式存在他们的服务器上。Notion、Microsoft 365 也是同样的结构。对记者写不能曝光的稿件、社会运动者协商不愿被监听的策略、NGO 整理弱势群体的求助记录、学者研究敏感议题这些情境，工具的选择直接决定一份草稿能不能安全写得出来。

[CryptPad](https://cryptpad.org/){target="_blank"} 是少数真正让服务器看不到内容的在线协作办公套件。由法国 [XWiki SAS](https://xwiki.com/){target="_blank"} 开发，采用 [AGPLv3](https://github.com/cryptpad/cryptpad/blob/main/LICENSE){target="_blank"} 授权。内容在你浏览器端就完成加密，服务器收到的是密文，但功能完整到一个界面就能涵盖大部分 Google Workspace 的常用情境。

社区自建的 [cryptpad.anoni.net](https://cryptpad.anoni.net/){target="_blank"} 自 CryptPad 2026.5.0（2026/05/13）起，界面内建简体（zh_Hans）与正体（zh_Hant）中文，简体与正体中文用户打开界面即可上手，不必先学英文菜单。详细的翻译历程见 [CryptPad 2026.5.0 上线：正体中文（zh_Hant）正式收进内建语系](../blog/posts/2026-cryptpad-zh-hant.md)。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-drive-zh-hant.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-drive-zh-hant.png"
            alt="CryptPad Drive 首页切换为中文后的界面，左侧为文档分类、顶端 +新增 按钮可看到 Rich Text、文档、电子表格、演示文稿、看板、白板、绘图、表单、日历等 app"
            title="cryptpad.anoni.net 切换成中文后的 Drive 首页"
            class="brand-frame">
    </a>
    <figcaption>cryptpad.anoni.net 切换成中文界面后的 Drive 首页（图为正体中文）</figcaption>
</figure>

## Zero-knowledge 是什么意思

CryptPad 采用 zero-knowledge（零知识）架构。具体地说：

- **加密发生在浏览器**：你输入的文字、粘贴的图片、协作编辑的每一个改动，在离开你的电脑前就先被加密。
- **服务器只看到密文**：CryptPad 的运营者、anoni.net 的维护者、你连接经过的任何中间方，看到的都是无法解读的密文流。
- **密钥在 URL 的 fragment**：解密 pad 所需的密钥写在 URL 的 `#` 之后（fragment），这段不会送到服务器。分享 pad 的链接就等于分享密钥，密钥是否外泄取决于你如何传这条 URL。
- **多人协作编辑也维持加密**：当其他人通过你的分享链接加入时，他们在浏览器端拿到同一把密钥，在自己的浏览器解密与重新加密所有改动。

换句话说：**即便我们想看，也看不到**。

这层保证的代价是两个现实限制。第一，**密码或密钥丢失就无法恢复内容**。CryptPad 不能帮你 reset。第二，**全文搜索、内容索引、AI 摘要这类需要服务器读内容的功能不存在**。对于需要长期保密的工作来说，这通常是可以接受的取舍。

技术细节可参考 [CryptPad Whitepaper](https://blog.cryptpad.org/2023/02/02/CryptPad-Whitepaper/){target="_blank"} 与 [How CryptPad's encryption works](https://cryptpad.org/what-is-cryptpad/){target="_blank"}。

## 一个界面，多个 app

CryptPad 的 Drive 就是云端硬盘入口，一个帐号可以开以下 app：

- **Rich Text 文档**：类似 Google Docs 的所见即所得编辑器，最常用。
- **Document**：整合 [OnlyOffice](https://www.onlyoffice.com/){target="_blank"} 的进阶文档处理（.docx 兼容）。
- **Sheets**：电子表格，整合 OnlyOffice（.xlsx 兼容）。
- **Presentation**：演示文稿，含 Markdown Slides 与 OnlyOffice 两种模式。
- **Kanban**：看板，做项目管理用，类似 Trello。
- **Whiteboard**：白板，自由手绘、便利贴。
- **Diagram**：绘图，整合 [Drawio](https://www.drawio.com/){target="_blank"}。
- **Forms**：表单，可做问卷与数据收集。
- **Calendar**：日历。
- **Code/Markdown**：代码与 Markdown 编辑器。

每个 app 的编辑都继承同一套加密与权限模型。也就是说，没有「这个 app 比较安全、那个 app 比较不安全」的差别，全部都是 zero-knowledge。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-richtext-collab.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-richtext-collab.png"
            alt="CryptPad Rich Text 编辑器多人协作画面，右上角显示协作者头像与实时 cursor"
            title="Rich Text app 的多人实时协作界面"
            class="brand-frame">
    </a>
    <figcaption>Rich Text app 的多人实时协作，所有改动在浏览器端就完成加密</figcaption>
</figure>

## 分享与权限模型

每份 pad 都继承同一套分享机制。打开 pad 后点右上角的「分享」会看到：

- **仅查看**：对方可读但不能编辑。
- **可编辑**：对方可实时协作编辑。
- **嵌入**：产生可以放在其他网页的 iframe 链接（仅查看）。
- **加密码**：在分享链接之外再加一层密码，没密码者连链接都打不开。
- **设置过期时间**：到期后自动失效。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-share-permission.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-share-permission.png"
            alt="CryptPad 分享对话框，可选仅查看、可编辑、嵌入三种权限模式，并可加密码、设置过期时间"
            title="CryptPad 每份 pad 的分享权限对话框"
            class="brand-frame">
    </a>
    <figcaption>每份 pad 都继承同一套加密与权限模型</figcaption>
</figure>

实务上的取舍：**分享链接就是密钥**。把链接贴进不安全的渠道（明文 email、Discord、未验证的消息应用）等于同时把密钥交出去。敏感协作的标准做法是通过 Matrix 或其他 E2EE 消息工具传递 pad 链接，并视情况开「加密码 + 过期时间」的双层保护。

## 本地化与多语系

CryptPad 自 2026.5.0 起内建以下中文界面：

- **中文(简体)**：对应 `zh_Hans` 语系码，覆盖中国大陆、新马等使用脉络。
- **中文(正体)**：对应 `zh_Hant` 语系码，覆盖台湾、香港、澳门使用脉络。

切换方式：登录后右上角设置页可选语言，或于 URL 加 `?lang=zh_Hans`、`?lang=zh_Hant`。旧有以 `zh_CN`、`zh_TW` 为设置值的帐号会自动 fallback 到对应的新语系码，不会在升级后跑回英文。

社区为 zh_Hant 投入两年半的上游翻译历程，从第一个 PR 到内建语系的细节见 [CryptPad 2026.5.0 上线：正体中文（zh_Hant）正式收进内建语系](../blog/posts/2026-cryptpad-zh-hant.md)。要协助补新版本字符串或修错字，到 [Weblate 上的 zh_Hant 项目](https://weblate.cryptpad.org/projects/cryptpad/-/zh_Hant/){target="_blank"} 即可。

## CryptPad vs 其他协作工具

| 维度 | CryptPad | Google Docs | Notion | Etherpad |
|---|---|---|---|---|
| 内容对服务器加密 | E2EE / zero-knowledge | 否 | 否 | 否 |
| 多人实时协作编辑 | 是 | 是 | 是 | 是 |
| 电子表格、演示文稿、表单 | 内建（OnlyOffice） | 内建 | 内建 | 无 |
| 注册门槛 | 注册码制（cryptpad.anoni.net）、普通注册（cryptpad.org） | Google 帐号 | 邮箱 + 密码 | 多为无帐号 |
| 自建成本 | AGPLv3，可完整自建 | 不可 | 不可 | 开源，可自建 |
| 适用情境 | 长期、敏感、加密协作 | 一般办公 | 知识库、项目管理 | 临时共笔、活动现场 |

延伸阅读：[端对端加密如何运作](../advanced/e2ee.md) 解释 E2EE 的密码学基础。

## 什么时候用 CryptPad，什么时候不用

**适合**：

- 需要长期保存且不能让平台读取的协作文档（会议记录、调查笔记、吹哨人陈述、敏感策略草稿）
- 跨组织协作但又不想把数据统一托管在某一方云端的场景
- 想要替代 Google Workspace 同时保留多种文档类型的小团队或社区
- 一份文档同时要做表格、文字、看板，但又必须加密

**不适合**：

- 一次性公开协作（用 [Etherpad](https://pad.anoni.net/){target="_blank"} 就够了，加密不是必要条件）
- 大规模实时聊天（用 [Matrix 或其他 IM](../community/tools.md)）
- 需要 AI 自动摘要、全文检索整个数据库的场景（Notion 系生态）
- 视频会议（CryptPad 不做视频）

## 如何开始使用

主要有三种选择：

**1. 使用社区自建的 cryptpad.anoni.net**

- **入口**：[https://cryptpad.anoni.net/](https://cryptpad.anoni.net/){target="_blank"}
- **帐号申请**：写信到 <whisper@anoni.net> 申请注册码。默认容量 50 MB，后续可调整。注册时不要求邮箱、不绑定实名，跟 Matrix 流程一致。
- **适合对象**：信任社区运维、希望帐号管理轻量、想优先支持社区 instance 的用户。

**2. 使用上游 cryptpad.org**

- **入口**：[https://cryptpad.fr/](https://cryptpad.fr/){target="_blank"}（XWiki 官方 instance）。
- **帐号申请**：普通注册（邮箱即可）。
- **适合对象**：偏好直接连 XWiki 运维的官方服务、单纯试用、不需要社区入口。

**3. 自建**

- AGPLv3 授权，源代码公开在 [GitHub](https://github.com/cryptpad/cryptpad){target="_blank"}。
- 部署指引见 [CryptPad Admin Documentation](https://docs.cryptpad.org/en/admin_guide/index.html){target="_blank"}。
- 适合对象：组织内部协作、有专属合规需求、想完全掌握数据保存策略。

## 常见问题

??? question "密钥丢了怎么办？"

    无法恢复。CryptPad 的运营者也没有你的密钥。这是 zero-knowledge 架构的代价。建议使用 [密码管理器](./password-manager.md) 保存登录密码与重要 pad 的分享链接。

??? question "分享链接被别人转贴出去怎么办？"

    pad 的密文加密强度没变，但只要有人拿到原始链接（含 `#` 后的密钥）就能解开。预防方式：建立 pad 时开「需要密码」、设置过期时间、用 Matrix 等 E2EE 渠道传链接。若已确认链接外泄，建立新的 pad 把内容复制过去并废弃旧链接。

??? question "在中国大陆能用吗？"

    `cryptpad.anoni.net` 与 `cryptpad.org` 都没有针对中国大陆的特别托管，在大陆网络环境下可能会连接不稳或被阻断。建议搭配 [Tor Browser](https://www.torproject.org/zh-CN/download/){target="_blank"} 与 [Snowflake 网桥](./tor-snowflake.md)，或在 [Tails](./what-is-tails.md) 环境内使用。CryptPad 内容是 E2EE 的，无论你的连接渠道是 Tor、VPN 或直连，服务器都看不到你的内容，差别只在于能不能连上。

??? question "CryptPad 跟 Etherpad 该选哪个？"

    看用途。**Etherpad 适合临时、可丢弃、无加密的共笔**（活动现场记录、提案 brainstorm），无须帐号、有链接就能进。**CryptPad 适合长期、敏感、加密协作**，需要帐号但内容对服务器不可见。社区两个都有自建，分工见 [社区自建服务](../community/tools.md)。

??? question "可以做 AI 摘要、自动翻译吗？"

    无法。Zero-knowledge 架构意味着服务器看不到内容，所以服务器端的 AI 服务（OpenAI、Claude 等）也读不到你的 pad。如果要用 AI 处理 CryptPad 内容，你必须先在浏览器端把内容复制出来，自己决定要交给哪个 AI 服务（并承担该服务的隐私风险）。

??? question "免费吗？容量会不会被收费？"

    [cryptpad.anoni.net](https://cryptpad.anoni.net/){target="_blank"} 由社区运维，目前无收费规划。默认配额 50 MB，要更多容量可来信讨论。上游 [cryptpad.fr](https://cryptpad.fr/){target="_blank"} 有免费与付费 plan，依需求选择。AGPLv3 授权的代码则永远免费可自建。

??? question "怎么把旧的 Google Docs 搬过来？"

    Drive 支持导入 .docx、.xlsx、.pptx 等格式。从 Google Docs 导出后直接上传即可。注意 OnlyOffice 在格式兼容性上比 Google Docs 严格，复杂表格或嵌套格式可能需要手动调整。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 端对端加密如何运作](../advanced/e2ee.md)
- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:material-chat-question: 什么是匿名网络](./what-is-anonymity-network.md)

</div>

## :fontawesome-solid-diagram-project: 下一步

<div class="grid cards" markdown>

- [:material-account-group: 社区自建服务](../community/tools.md)
- [:material-translate-variant: 中文化与文档翻译](../community/i18n.md)
- [:material-file-document: CryptPad 2026.5.0 上线：正体中文（zh_Hant）正式收进内建语系](../blog/posts/2026-cryptpad-zh-hant.md)

</div>
