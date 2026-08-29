---
title: 沟通与协作工具
description: anoni.net 自架的 Matrix、Cryptpad、Etherpad、SearXNG、Send、Formbricks，以及搭配的外部 Jitsi，给社群讨论、共笔、搜索、传文件、表单等协作场景使用。
icon: material/message-text
---

# :material-message-text: 沟通与协作工具

社群自架 Matrix、Cryptpad、Etherpad、SearXNG、Send、Formbricks 6 个服务，搭配外部 Jitsi 做在线会议。自架的目的是减少对第三方的依赖、保留数据主权，也为社群讨论与敏感协作提供可信任的基础设施。

关于我们为什么自架 Matrix（与背后的隐私取舍），可参考 [从 Discord 年龄验证谈起：我们为什么自架 Matrix](../blog/posts/2026-discord-matrix-statement.md)。

## 即时沟通与长期协作

### Matrix（即时讨论）

- **用途**：日常讨论、表达主题意愿、各主题 room 讨论与活动协调
- **主服务器（homeserver）**：`im.anoni.net`
    - **网页版（Element）**：[https://matrix.anoni.net/](https://matrix.anoni.net/){target="_blank"}
    - **应用程序（Element X）**：[下载应用程序](https://element.io/download)，安装后请将主服务器设置为 `im.anoni.net`。
    !!! note "补充说明"

        如果你已经有 `matrix.org` 的帐号，也可以继续使用自己的帐号登录。无论是网页端还是应用程序，Element 都支持跨联邦，只要主服务器设置正确即可。

- **帐号申请**：目前 `im.anoni.net` 的 Matrix 帐号需要发送邮件至 <whisper@anoni.net> 申请，我们会回复注册方式与注意事项。
- **建议加入**：社区设有 **[Public Space](https://matrix.to/#/#community:im.anoni.net)**，可一次加入社区相关 rooms。
- **如何加入**：注册后在 Element 中打开上述 Space 链接加入，或根据需要加入单独的 rooms。

### Cryptpad（加密协作文档）

- **用途**：共笔、活动共编、敏感内容加密协作
- **入口**：社区 Cryptpad [首页](https://cryptpad.anoni.net/)
- **帐号申请**：目前 Cryptpad 帐号同样需要发送邮件至 <whisper@anoni.net> 申请，默认提供 50 MB 容量，未来可视情况调整。
- **界面语言**：自 CryptPad 2026.5.0 起，「中文（简体）」与「中文（正体）」皆为内建语系，可在右上角设置页切换，或于网址加 `?lang=zh_Hans` / `?lang=zh_Hant`。社区为 zh_Hant 投入两年半上游翻译的历程见 [CryptPad 2026.5.0 上线：正体中文（zh_Hant）正式收进内建语系](../blog/posts/2026-cryptpad-zh-hant.md)。
- **使用方式**：取得帐号后可新建 pad、分享链接、设置权限（仅查看、可编辑），活动用的共笔链接通常会在 Matrix 公布。

### Etherpad（即时共笔）

- **用途**：活动现场共同记录、低门槛临时笔记。内容无加密，有链接即可访问，不适合放敏感信息。
- **入口**：[https://pad.anoni.net/](https://pad.anoni.net/){target="_blank"}
- **帐号申请**：无须帐号，建立 pad 后分享链接即可协作。
- **使用方式**：适合公开、可丢弃的内容。需要长期保存或加密协作时改用 Cryptpad。
- **临时聊天场景**：当下遇到一个人但双方都不想交换 app 帐号时，可开新 pad 把 URL 给对方，使用 pad 内建的 chat sidebar 当作一次性对话空间。聊完关闭标签页、清空 pad 内容即可。注意内容无加密，server 端理论上仍可看到。

## 个人隐私工具

### SearXNG（隐私搜索）

- **用途**：聚合多个搜索引擎，不留记录、无广告、无第三方 cookie。
- **入口**：[https://search.anoni.net/](https://search.anoni.net/){target="_blank"}
- **帐号申请**：无须帐号。
- **使用方式**：可在浏览器设成默认搜索引擎。URL 直接加 `?q=keyword` 也能搜索。

### Send（端到端加密文件分享）

- **用途**：暂时性的加密文件传递，链接可设密码、下载次数与过期时间。
- **入口**：[https://send.anoni.net/](https://send.anoni.net/){target="_blank"}
- **帐号申请**：无须帐号（依设置，登录帐号通常可获得更大配额与更长保留时间）。
- **使用方式**：上传文件、选择有效期、设置下载次数，视需要再加密码，最后分享链接。逾期或达下载次数上限后即删除。

## 社群运作工具

### Formbricks（隐私表单）

- **用途**：订阅表单、活动报名、社群反馈收集。自架可避免被第三方表单服务追踪，目前 newsletter 订阅即通过此服务。
- **入口**：[https://form.anoni.net/](https://form.anoni.net/){target="_blank"}
- **帐号申请**：填表者直接打开链接填写，无须帐号。维运者要建立新表单请来信 <whisper@anoni.net> 申请后台帐号。
- **使用方式**：建立后分享链接即可收集回应，后台可看回应汇总与导出。

## 在线会议（外部）

### Jitsi（在线视频）

- **用途**：线上会议（主题讨论、定期同步）
- **服务**：[https://jitsi.goodmeet.asia/](https://jitsi.goodmeet.asia/){target="_blank"}（免费使用，第三方提供、非社区自架，条款与可用性依对方为准）。
- **使用方式**：打开链接、新建或输入会议室名称、分享会议链接（通常会在 Matrix rooms 中公布）。

---

**延伸阅读**：想了解我们为什么自架 Matrix、以及如何兼顾隐私与社群品质，可参考 [从 Discord 年龄验证谈起：我们为什么自架 Matrix](../blog/posts/2026-discord-matrix-statement.md)。

