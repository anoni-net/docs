---
date: 2026-05-25
authors:
    - toomore
categories:
    - 社区
    - 公告
slug: 2026-cryptpad-zh-hant
image: "assets/images/post-update.png"
summary: "CryptPad 是少数让服务器看不到内容的在线协作工具。2026/05 随 CryptPad 2026.5.0 上线，正体中文（zh_Hant）正式收进内建语系，简体中文（zh_Hans）一并升级，并加入 locale alias 让旧设定（zh_CN、zh_TW）平滑迁移。社区自架的 cryptpad.anoni.net 已同步升级，对中国大陆使用者，搭配 Tor 或 VPN 即可访问。"
description: "CryptPad 是少数让服务器看不到内容的在线协作工具。2026/05 随 CryptPad 2026.5.0 上线，正体中文（zh_Hant）正式收进内建语系，简体中文（zh_Hans）一并升级，并加入 locale alias 让旧设定（zh_CN、zh_TW）平滑迁移。社区自架的 cryptpad.anoni.net 已同步升级，对中国大陆使用者，搭配 Tor 或 VPN 即可访问。"
---

# CryptPad 2026.5.0 上线：正体中文（zh_Hant）正式收进内建语系

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-drive-zh-hant.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-drive-zh-hant.png"
            alt="CryptPad Drive 首页切换为正体中文后的界面，左侧为文件分类、顶端 +新增 按钮可看到 Rich Text、文档、电子表格、演示、看板、白板、绘图、表单、日历等 app"
            title="cryptpad.anoni.net 切换成「中文(正体)」后的 Drive 首页"
            class="brand-frame">
    </a>
    <figcaption>cryptpad.anoni.net 切换成「中文(正体)」后的 Drive 首页，所有文件分类与 app 入口都已本地化</figcaption>
</figure>

中文使用者要找一套真的不会被第三方平台默默收走内容的协作工具，其实没有想像中容易。Google Docs、Notion、Microsoft 365 都很好用，但每一段文字、每一个改动，都会以可被服务商读取的形式存放在他们的服务器上。在这之上，算法、广告、训练语料、政府调取请求，各有各的取用方式。

这层差异对记者写不能曝光的稿、社运工作者协商不能被监听的策略、NGO 整理脆弱使用者的求助记录、学者研究敏感议题这些情境，往往决定一份草稿能不能安全写得出来。

[CryptPad](https://cryptpad.org/){target="_blank"} 是少数真的让服务器看不到内容的在线协作工具。内容在你浏览器端就完成加密，服务器收到的是密文，但功能完整到一个界面就能取代 Google Docs、Sheets、Slides、看板、白板、表单与日历。

这套工具过去有一个明显的门槛，界面只有英文与简体中文，正体中文是缺的。从 2023 年底在 CryptPad 上游开的第一个 PR 起算，到 2026 年 5 月 13 日 [CryptPad 2026.5.0「🌷 Spring release」](https://github.com/cryptpad/cryptpad/releases/tag/2026.5.0){target="_blank"} 正式把正体中文（zh_Hant）收进内建语系，前后花了两年半。社区自架的 [cryptpad.anoni.net](https://cryptpad.anoni.net/){target="_blank"} 升级完成。**现在打开 cryptpad.anoni.net，从 Drive 界面、文档编辑器到分享权限对话框，整套界面在简体与正体之间都能切换。中港澳台与海外华语使用者可以在同一个工具里无障碍协作。**

<!-- more -->

## CryptPad 是什么

CryptPad 由法国 [XWiki SAS](https://xwiki.com/){target="_blank"} 开发，使用 [AGPLv3](https://github.com/cryptpad/cryptpad/blob/main/LICENSE){target="_blank"} 授权，定位是**端对端加密（E2EE）的在线协作办公套件**。一个帐号可以使用以下应用：

- **Rich Text 文档**：类似 Google Docs 的所见即所得编辑器
- **Document**：整合 OnlyOffice 的进阶文档处理（.docx 兼容）
- **Sheets**：电子表格，整合 OnlyOffice（.xlsx 兼容）
- **Presentation**：演示，含 Markdown Slides 与 OnlyOffice 两种模式
- **Kanban**：看板，做项目管理用
- **Whiteboard**：白板
- **Diagram**：绘图，整合 [Drawio](https://www.drawio.com/){target="_blank"}（2026.5.0 升级到 Drawio 29.6.7）
- **Forms**：表单，可做问卷与数据收集
- **Calendar**：日历
- **Code/Markdown**：代码与 Markdown 编辑器
- **Drive**：云端硬盘，整合上述所有文件类型

关键在于**所有内容都在你浏览器端就完成加密**，服务器收到的是密文，CryptPad 的运营者、anoni.net 的维护者，都没有解开内容的钥匙。这套架构称为 zero-knowledge（零知识），意思是「即便我们想看，也看不到」。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-richtext-collab.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-richtext-collab.png"
            alt="CryptPad Rich Text 编辑器多人协作画面，右上角显示协作者头像与即时 cursor，右侧为格式化工具栏"
            title="Rich Text app 的多人即时协作界面"
            class="brand-frame">
    </a>
    <figcaption>Rich Text app 的多人即时协作界面。所有编辑内容在浏览器端就完成加密，服务器只看得到密文</figcaption>
</figure>

## 为什么社区选择 CryptPad 作为自架的协作平台

社区自架的服务不只 CryptPad，也有 [Etherpad](https://pad.anoni.net/){target="_blank"} 做即时共笔、Matrix 做即时讨论（三者分工见 [沟通与协作工具](../../community/tools.md)）。CryptPad 在我们的选择顺位里，承担的是「需要长期保存、需要加密、需要多人协作完整文档」的场景。愿意花两年半把界面翻成正体中文，理由有几个。

**E2EE 与 zero-knowledge 架构**：社区讨论的内容很常涉及威胁模型、揭弊者保护、Tor Relay 校园推动的协商记录，这些东西放在 Google Docs 或 Notion 上，等于把所有未公开的策略摊在第三方平台与其广告合作对象面前。CryptPad 从架构上把「运营者能看到内容」这件事拿掉，技术保证远强于 SLA 承诺。

**功能完整、可取代主流云端套件**：Etherpad 适合临时共笔，但没办法做表格、演示、看板。CryptPad 一个界面涵盖 Google Workspace 大部分常用情境，而且每个文档都继承同一套加密与权限模型，不必为了「这份要保密、那份不用」在多套工具间切换。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-share-permission.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-share-permission.png"
            alt="CryptPad 分享对话框，可选仅查看、可编辑、嵌入三种权限模式，并可加密码、设定过期时间"
            title="CryptPad 每份 pad 的分享权限对话框"
            class="brand-frame">
    </a>
    <figcaption>每份 pad 都继承同一套加密与权限模型，分享时可选仅查看、可编辑或嵌入，并可加密码与过期时间</figcaption>
</figure>

**AGPLv3 授权，加密协议公开可审视**：衍生服务都必须开源，我们自架时可以完整检查代码。加密协议与数据结构也对外公开，跟 Tor、Tails、OONI 一样，是可被验证的隐私。

**由维护者与社区决定如何治理**：自架的好处跟 [自架 Matrix](2026-discord-matrix-statement.md) 的理由一致，记录保存策略、注册政策、频道规则由我们决定，可预期、可问责、可随社区需求调整。

**有欧洲公部门与民间组织的真实部署经验**：CryptPad 在欧洲多个公部门项目、NGO 与研究单位内被采用，合规、可靠性、长期维护三方面都有实际使用记录，把它推给更多中文使用者时不必担心是 demo 漂亮的玩具。

## 正体中文（zh_Hant）翻译：两年半的时间线

CryptPad 主应用、Accounts plugin 与 User Guide 加起来上千条字串，每一条都要对齐它在界面上会出现的情境、顾及上下文、避免在「保存」、「另存为」这类词之间混用。CryptPad 还在持续开发，新功能会带来新字串，每个版本上线前都得回头再校一轮。

**2023/12/05**：在 CryptPad 开 [PR #1329](https://github.com/cryptpad/cryptpad/pull/1329){target="_blank"}，修正当时界面语言选单的用词，把 `zh-Hans` 标签改为「中文(简体)」、`zh-Hant` 改为「中文(正体)」。当时 CryptPad 还只有 `zh_Hans` 的翻译内容，`zh_Hant` 是空的，所以 PR 内也顺便询问 CryptPad 团队「想新增 zh-Hant 语言要走哪个流程」。

**2024–2025**：CryptPad 团队在 [Weblate](https://weblate.cryptpad.org/){target="_blank"} 上为 zh_Hant 开了多个子项目的翻译空间，包含 CryptPad 主应用（[App](https://weblate.cryptpad.org/projects/cryptpad/app/zh_Hant/){target="_blank"}）、[Accounts plugin](https://weblate.cryptpad.org/projects/cryptpad/accounts-plugin/zh_Hant/){target="_blank"}，以及 User Guide 的 Drive、FAQ、Application Document、Application General、Application Presentation、Share and Access、Collaboration 等子段。

**2026/03/13**：所有上述项目的 zh_Hant 字串翻译完成，社区在 CryptPad 仓库开 [Issue #2237](https://github.com/cryptpad/cryptpad/issues/2237){target="_blank"} 回报进度，请 CryptPad 团队评估在下一个 release 启用 `zh_Hant` 为内建可选语系。

**2026/05/13**：CryptPad [2026.5.0「🌷 Spring release」](https://github.com/cryptpad/cryptpad/releases/tag/2026.5.0){target="_blank"} 发布，release notes 在 Improvements 段落明列：

> Enable zh-Hant/zh-Hans locales (#2237) and add alias system for locales [#2254](https://github.com/cryptpad/cryptpad/pull/2254){target="_blank"} by @toomore

这次合并除了把 `zh_Hant` 与 `zh_Hans` 打开为正式语系，也加上了 locale alias 机制，让旧有以 `zh_CN`、`zh_TW` 为设定值的帐号可以自动 fallback 对应到新的 `zh_Hans`、`zh_Hant`，不会在升级后跑回英文。简体中文使用者升级后界面照常显示中文，不需要手动重设语系。

## 关于「正体中文」与「繁体中文」的用字

CryptPad 界面选单最早写的是「中文(繁体)」。我们在 PR #1329 提的修改是改成「中文(正体)」。改字面看起来是小事，背后是社区比较倾向「正体」这个用词。「繁」字暗示「相对于简体比较复杂」，但这套字系在台湾、香港、澳门的使用脉络，本来就是延续汉字源流而来的正统写法，没有「繁」与「简」的对比关系。OS 与多数软件仍写「繁体中文」，我们不要求所有人都改，但在自己贡献的翻译里能改就改。用什么字称呼一个族群使用的字系，是普及工作的一部分。

## 中国大陆使用者如何访问 cryptpad.anoni.net

`cryptpad.anoni.net` 与 `cryptpad.org` 都没有针对中国大陆使用者做特别托管，在大陆网络环境下访问可能会有连线不稳或被阻断的情况。建议方式：

- **使用 [Tor Browser](https://www.torproject.org/zh-CN/download/){target="_blank"}**：透过 Tor 网络访问 cryptpad.anoni.net，预设走 HTTPS。如果直接连不上 Tor 网络，可使用 [Snowflake](../../tools/tor-snowflake.md) 或 [obfs4 桥接](https://bridges.torproject.org/){target="_blank"}。
- **使用任何你信任的 VPN**：注意 VPN 服务商本身能看到你的连线 metadata，但 CryptPad 端对端加密的特性确保内容不会被任何中间方读取。
- **使用 [Tails](../../tools/what-is-tails.md)**：把整个操作环境放进 Tails，所有流量预设走 Tor，关机后不留痕迹。适合敏感度较高的协作场景。

CryptPad 本身是 E2EE 的，无论你的连线管道是 Tor、VPN 或直连，服务器都看不到你的内容。但**能不能稳定连上** cryptpad.anoni.net 与你所处的网络环境有关。如果常态在中国大陆使用，建议优先以 Tor + Snowflake 或 Tails 为基础。

## 如何开始使用 cryptpad.anoni.net

上手方式：

- **入口**：[https://cryptpad.anoni.net/](https://cryptpad.anoni.net/){target="_blank"}
- **帐号申请**：写信到 <whisper@anoni.net> 申请注册码。预设容量 50 MB，后续可调整。注册时不要求邮箱、不绑定实名，跟 Matrix 的申请流程一致。
- **切换语系**：升级后右上角设定页可选「中文(正体)」或「中文(简体)」。网址加 `?lang=zh_Hant` 或 `?lang=zh_Hans` 也能切换。
- **完整工具清单**：见 [沟通与协作工具](../../community/tools.md)。

如果你发现翻译有错字、用词不顺、或是有新版字串还没翻完，欢迎到 Weblate 上的 [zh_Hant](https://weblate.cryptpad.org/projects/cryptpad/-/zh_Hant/){target="_blank"} 或 [zh_Hans](https://weblate.cryptpad.org/projects/cryptpad/-/zh_Hans/){target="_blank"} 项目直接提交修改，或来信 <whisper@anoni.net> 告诉我们。

## 相关阅读

- [从 Discord 年龄验证谈起：我们为什么自架 Matrix](2026-discord-matrix-statement.md)
- [沟通与协作工具](../../community/tools.md)
- [中文化与文件翻译](../../community/i18n.md)
