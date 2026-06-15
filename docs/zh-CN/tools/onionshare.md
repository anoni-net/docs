---
title: OnionShare
description: 透过 Tor 起临时 onion service，匿名传档、收档、架站、聊天。会话结束就消失，不需要第三方 server。
icon: material/share-circle
---
# :material-share-circle: OnionShare 透过 Tor 匿名传输

[OnionShare](https://onionshare.org/){target="_blank"} 是一个开源工具，在你电脑上起一个临时的 Tor onion service，让你跟对方匿名传档、收档、架站、聊天。文件不上云、不注册账号、流量走 Tor 多层加密。会话结束你关掉视窗，那个 onion service 就消失，没有残留。

## 为什么用 OnionShare

- **不必信任第三方平台**。文件直接从你的电脑传到对方的 Tor Browser，中间没有 Google Drive、没有 Dropbox、没有 anoni.net。
- **无账号、无 ID**。对方拿到的只是一个 `.onion` 网址，他不会知道你是谁、你的 IP 是什么。你也不会知道对方是谁。
- **会话即用即丢**。关掉 OnionShare，onion service 同时下线，网址自动失效。没有后台 log、没有 metadata 落地。
- **跨平台桌面工具**。macOS、Windows、Linux、Tails 都有 GUI。也有 CLI 可以架在 server 做长期收件箱。

## 你应该知道的事

开始操作前，先掌握几个使用前提：

- **IP 不会泄漏给对方**。流量走 Tor，对方只看到 `.onion` 网址，看不到你的真实 IP。
- **会话结束就消失**。关闭 OnionShare 视窗，onion service 同时下线，没有残留。Tor 网络也不会留下这个 onion 曾经存在的记录。
- **网址要透过安全管道交给对方**。OnionShare 不负责配送网址。如果你用 LINE 把网址传给对方，那一段就不再匿名。常见做法是 Signal、Cryptpad 或当面口头交换。
- **对方需要 Tor Browser**。如果对方完全不会用 Tor，OnionShare 不适合。改用 [send.anoni.net](https://send.anoni.net/){target="_blank"} 或 PGP 加密邮件。
- **长期 Receive 收件箱建议用独立硬件**。挂在主力电脑 24/7 容易被当作攻击面，建议用 Tails USB 或专用 Linux box。
- **流量会用到你的网络带宽**。对方下载大档时，你的网络上传会被占用，速度也受限于 Tor 网络（速度受 Tor 网路当下壅塞情况影响，可能偏慢）。

## 四种使用模式

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionshare-modes.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionshare-modes.png"
            alt="OnionShare 主视窗的四个模式分页"
            title="OnionShare 主视窗的四个模式分页"
            class="brand-frame">
    </a>
    <capture>OnionShare 主视窗的四个模式分页，从左到右分别是 Share Files、Receive Files、Host a Website、Chat Anonymously。</capture>
</figure>

### Send（送档）

把文件丢进 OnionShare，产生一个 `.onion` 网址。把网址透过安全管道交给对方，对方用 Tor Browser 开启、下载。

- **适用**：把证据传给律师、把访谈材料寄给编辑、行动结束分发记录、给法律顾问送一次性文件。
- **限制**：对方需要 Tor Browser。下载完成后启动者要手动关闭 OnionShare（也可以设置下载完自动停）。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionshare-send-url.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionshare-send-url.png"
            alt="OnionShare Send 模式产生 .onion URL 与 private key"
            title="OnionShare Send 模式产生 .onion URL 与 private key"
            class="brand-frame">
    </a>
    <capture>Send 模式启动分享后，OnionShare 会产生 .onion 网址与 private key。把网址跟 private key 透过不同安全管道交给对方，可避免中间人替换。</capture>
</figure>

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionshare-receiver-view.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionshare-receiver-view.png"
            alt="接收方在 Tor Browser 看到的 OnionShare 下载页"
            title="接收方在 Tor Browser 看到的 OnionShare 下载页"
            class="brand-frame">
    </a>
    <capture>接收方拿到 .onion 网址后，在 Tor Browser 开启看到的是默认的下载页面，外观像一般静态网站，不必额外学习。</capture>
</figure>

### Receive（收档）

开放一个上传接口，产生 `.onion` 网址。投件人用 Tor Browser 开启网址、上传文件，你在本机收到。

- **适用**：记者公开的隐蔽收件箱、组织征集匿名投稿、危机通报窗口。
- **限制**：要长时间挂在线上，建议搭配独立硬件（不是日常电脑）。`scenarios/journalist.md` 提到的「自架收件箱」就是这个模式。

### Host a Website（暂时架站）

把一份 HTML、CSS、JS 丢进去，OnionShare 会起一个 onion 静态站。

- **适用**：临时公布敏感内容、活动期间限定资料、无法上 clearnet 的研究草稿、给特定对象看的 preview 页。
- **限制**：纯静态，没有后端、没有数据库。流量上限受限于你的网络带宽。

### Chat（一次性聊天室）

多人加密聊天室，内存中执行，没有持久记录。启动者关掉，整个聊天室就消失。

- **适用**：行动现场临时协调、敏感会议的会中通讯、不希望事后留下对话记录的小组讨论。
- **限制**：所有人都要 Tor Browser 连入。历史消息不保留，无法事后翻阅。

## 如何安装

- **macOS、Windows、Linux 桌面**：到 [onionshare.org](https://onionshare.org/){target="_blank"} 下载官方 GUI。
- **Flatpak 或 Snap**：对 Linux 用户更方便的封装，套件库名称 `org.onionshare.OnionShare`。
- **Tails**：已预装。Applications 选单找得到，搭配 [什么是 Tails](./what-is-tails.md) 了解整体系统定位。
- **CLI 版**：适合架在 server 做长期 Receive 收件箱，或整合到自动化流程。

## 跟其他工具的取舍

| 工具 | 适用 | 与 OnionShare 的差别 |
|---|---|---|
| [send.anoni.net](https://send.anoni.net/){target="_blank"} | 一次性加密传档，网页浏览器即可使用 | 双方都不需 Tor，门槛低。文件经过 anoni.net server（端对端加密、可设密码、过期自动删除），信任边界比 OnionShare 大 |
| [SecureDrop](https://securedrop.org/){target="_blank"} | 媒体机构的隐蔽收件系统 | 需要专业部署与长期运维，国际大型媒体（纽约时报、卫报、Intercept）使用。OnionShare Receive 是个人记者就能跑的轻量版 |
| Signal 附件 | 已建立信任的双方传档 | Signal 绑手机号码，第一次接触前对方可能不想暴露号码。OnionShare 完全无账号、无 ID，适合首次接触 |

选择逻辑：

- 对方不会用 Tor、文件敏感度中等，选 [send.anoni.net](https://send.anoni.net/){target="_blank"}
- 媒体机构长期收件、需要审计追踪，选 SecureDrop
- 已经在 Signal 对话中、单纯传一份档，用 Signal 附件就够
- 第一次接触、对方不该暴露身份、不想经第三方，用 OnionShare

## 常见问题

??? question "对方完全没用过 Tor，怎么引导？"

    给对方 [Tor Browser 进阶设定](./tor-browser-advanced.md) 的入门段落，请对方先安装 Tor Browser、再开你的 `.onion` 网址。如果对方拒绝安装 Tor，改用 [send.anoni.net](https://send.anoni.net/){target="_blank"} 或 PGP 加密邮件。

??? question "怎么确认对方拿到的是正确网址、没被替换？"

    OnionShare 产生网址的同时会给一个 private key 或 public key 指纹。把网址跟指纹分开两个管道交给对方（例如网址用 Signal、指纹用当面口头），对方在 Tor Browser 开启时验证指纹。OnionShare GUI 也支援「需要对方输入 password 才能下载」，敏感场景建议启用。

??? question "Receive 模式可以收多大的文件？"

    技术上没有文件大小限制，实务上受限于三个因素，你的网络上传带宽、Tor 网络速度（速度受 Tor 网路当下壅塞情况影响，可能偏慢）、你愿意把 OnionShare 开多久。超过 1 GB 的文件建议拆段或改用其他管道。

??? question "Chat 模式跟 Signal、SimpleX 有什么差？"

    Signal、SimpleX 是长期账号加上长期装置的通讯工具，适合日常通讯。OnionShare Chat 是一次性、无账号、无历史记录的会议室，启动者关闭就完全消失。适合一次性协调，不适合日常通讯。可参考 [匿名通讯工具比较](./messaging-comparison.md)。

??? question "手机可以用吗？"

    OnionShare 有官方 Android app（Google Play 与 F-Droid 可装，仍是 beta），iOS app 仍在开发中（截至 2026 年）。手机端较成熟的用法仍是当「接收方」，用 Tor Browser for Android 或 Onion Browser for iOS 开启对方提供的 `.onion` 网址。要当发送方建议用桌面或 Tails。

??? question "OnionShare 跟 Tor Bridge、Snowflake 有关系吗？"

    没有直接关系。Tor Bridge、[Snowflake](./tor-snowflake.md) 是「帮助别人连上 Tor 网络」的入口节点，OnionShare 则是「在 Tor 网络上提供服务」的工具。两者是 Tor 生态里不同位置的角色。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 什么是 Tor](./what-is-tor.md)
- [:material-chat-question: 什么是 Tails](./what-is-tails.md)
- [:material-chat-question: 匿名通讯工具比较](./messaging-comparison.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-newspaper: 记者保护消息来源（场景）](../scenarios/journalist.md)
- [:material-snowflake: Tor Snowflake 桥接点](./tor-snowflake.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>
