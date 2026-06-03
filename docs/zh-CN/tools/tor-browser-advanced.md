---
title: Tor Browser 进阶设定
description: 桥接、安全等级、Onion 站点、身份隔离与常见错误排解。
icon: material/cog-outline
---

# :material-cog-outline: Tor Browser 进阶设定

Tor Browser 的默认值已能涵盖大部分日常情境，但在被封锁的网络、进阶威胁模型、需要切换多个身份时，默认值不够用。这篇文章逐项看 Tor Browser 的进阶设定：连线（Connection Assist 与桥接）、安全等级、身份隔离、电路检视、Onion 站点偏好、指纹抗性、移动版，最后列出在台湾常见的错误消息与排解步骤。动设定之前可以先回头看 [威胁模型如何建立](../basics/threat-model.md)，知道自己在抗谁。

如果还没读过 Tor 的基本原理，可以先看 [什么是 Tor](./what-is-tor.md)。本文默认读者已知道 Guard、Middle、Exit 三层中继。

## 连线：Connection Assist 与桥接

Tor Browser 11.5 之后内建 **Connection Assist**[^1]：侦测你的地区与连线状况，自动选择合适的桥接（bridge）配置。在台湾多数情境不需要桥接，网络自由度高、ISP 不主动封锁 Tor 入口节点。出国（中国、伊朗、缅甸这类审查地区）才需要手动启用桥接。

可选的桥接类型：

- **obfs4**：流量混淆，老牌 pluggable transport，多数情境可用
- **Snowflake**：短暂配对的 WebRTC 桥接点，IP 流动性高
- **meek-azure**：流量伪装成往 Microsoft Azure 的 HTTPS 请求
- **WebTunnel**：较新的 transport（2024 年后成熟），完全伪装成一般 HTTPS 站点流量

如果 Connection Assist 找到的桥接不通，可以手动取得新桥接：到 [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} 领取、写信给 `bridges@torproject.org`、或使用 Telegram bot `@GetBridgesBot`。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-connection-assist.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-connection-assist.png"
            alt="Tor Browser 的 Connection Assist 与桥接设定"
            title="Tor Browser 的 Connection Assist 与桥接设定"
            class="brand-frame">
    </a>
    <capture>Tor Browser 的 Connection Assist 与桥接设定（详见 <a href="https://support.torproject.org/zh-CN/bridges/" target="_blank">Tor 官方说明：桥接</a>）</capture>
</figure>

## 安全等级（Security Level）

Tor Browser 提供三段安全等级，从网址列旁的盾牌图示点开「Change」可切换：

- **Standard**（默认）：JavaScript 全开，网站运作如常
- **Safer**：HTTPS 站点 JS 开、HTTP 站点关闭 JS，禁用部分字体与符号，媒体不自动播放
- **Safest**：JS 全关，媒体默认不播，部分网站表单可能无法送出

何时降到 Safer 或 Safest：陌生 onion 站点、来路不明的钓鱼链接、不熟悉的域名。日常浏览与需要互动的网站可以保留 Standard。NoScript 仍存在于 Tor Browser 内，但 Tor Project 建议透过 Security Level slider 统一控制，不要直接动 NoScript 设定。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-security-level.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-security-level.png"
            alt="Tor Browser Security Level slider 的三段选项"
            title="Tor Browser Security Level slider 的三段选项"
            class="brand-frame">
    </a>
    <capture>Tor Browser Security Level slider 的三段选项（详见 <a href="https://support.torproject.org/zh-CN/security-settings/" target="_blank">Tor 官方说明：安全性等级</a>）</capture>
</figure>

## 身份隔离：New Identity 与 New Tor Circuit

Tor Browser 提供两种身份切换，效果不同：

- **New Identity**（汉堡选单 → 「New Identity」）：清空 cookies、history、开启页面，重启所有 Tor 连线。等于开一个全新身份。
- **New Tor Circuit for this Site**（网址列旁盾牌 → 「New Tor Circuit」）：保留登录与分页，只更换中间节点与出口节点。

何时用哪个：

- 跨身份操作之前用 **New Identity**。刚逛完 A 账号要切去 B 账号时，必须完整切换，否则 cookies 与浏览器状态会把两个身份连起来。
- 单一网站连不上、CAPTCHA 不停跳、想换出口国家的时候用 **New Circuit**。保留登录，只换中间与出口节点。

Tor Browser 默认启用 First Party Isolation，每个分页的 cookies、cache、storage 都依域名隔离，跨站追踪难度提高。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-new-identity.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-new-identity.png"
            alt="Tor Browser 汉堡选单显示 New Identity 与 New Tor Circuit for this Site"
            title="Tor Browser 汉堡选单显示 New Identity 与 New Tor Circuit for this Site"
            class="brand-frame">
    </a>
    <capture>Tor Browser 汉堡选单显示 New Identity 与 New Tor Circuit for this Site（详见 <a href="https://support.torproject.org/zh-CN/managing-identities/" target="_blank">Tor 官方说明：管理身份</a>）</capture>
</figure>

## Tor Circuit 检视

点网址列旁的盾牌或锁头，展开「Tor Circuit for This Site」，会显示这个分页目前走的三个 hop（Guard、Middle、Exit）与各自的所在国家。

实际用途：

- 确认出口国家。某些网站根据 IP 提供不同地区内容，影片可能有地区锁
- 发现连线异常。出口节点若在某网站封锁的国家（例如出口在中国连欧洲新闻媒体），网站可能拒绝服务
- 排解 CAPTCHA 无限循环。看到出口国家后，用 New Circuit 换到别的国家试试

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-circuit-display.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-circuit-display.png"
            alt="Tor Browser 显示当前 Tor Circuit 的三层中继节点与所在国家"
            title="Tor Browser 显示当前 Tor Circuit 的三层中继节点与所在国家"
            class="brand-frame">
    </a>
    <capture>Tor Browser 显示当前 Tor Circuit 的三层中继节点与所在国家（详见 <a href="https://support.torproject.org/zh-CN/managing-identities/" target="_blank">Tor 官方说明：管理身份</a>）</capture>
</figure>

## Onion 站点偏好

许多媒体与服务提供 onion 对应版本（DuckDuckGo、ProPublica、Facebook、Reuters 都有）。网站透过 `.onion-Location` HTTP header 宣告自己的 onion 地址，Tor Browser 会在顶端跳出提示横幅，让你一键跳到 onion 版本。

可以到 `about:preferences#privacy` 开启「Always Prioritize .onion sites」，之后 Tor Browser 侦测到对应的 onion 站点会自动跳转，省下手动切换。

验证 onion 指纹很重要。onion 字串长且不易辨识（v3 onion 是 56 字元 base32），人眼难以逐字验证。从不可信来源拿 onion 链接，社交工程风险高，建议：

- 从官方网站、官方社群账号的链接进入，加进书签
- 第一次造访后即建立书签，之后永远从书签点
- 不要相信第三方文件、论坛贴文里列出的 onion 链接

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/tb-onion-location.png" target="_blank">
        <img src="https://assets.anoni.net/docs/tb-onion-location.png"
            alt="Tor Browser 对 .onion-Location 的提示与 onion 站点偏好设定"
            title="Tor Browser 对 .onion-Location 的提示与 onion 站点偏好设定"
            class="brand-frame">
    </a>
    <capture>Tor Browser 对 .onion-Location 的提示与 onion 站点偏好设定（详见 <a href="https://support.torproject.org/zh-CN/onion-services/" target="_blank">Tor 官方说明：洋葱服务</a>）</capture>
</figure>

## 指纹抗性与视窗大小

Tor Browser 的匿名性靠「全球用户长得一样」维持。几个基本动作都会破坏这个前提：

- **不要最大化视窗**。Tor Browser 内建 letterboxing[^2]，会自动加灰边把可视区域对齐到 200×100 倍数，但仍建议保留默认视窗。最大化等于告诉网站你的屏幕分辨率
- **不要安装其他浏览器扩展**。NoScript 与 HTTPS 相关（已内建）以外的扩展，会让你的 Tor Browser 跟全世界其他人不一样，反而更容易被指纹追踪
- **不要登录会绑真实身份的账号**。Gmail 个人账号、Facebook 真实姓名、银行账号这类，登录瞬间匿名性失效，后面所有 Tor 流量都跟你的真实身份连起来
- HTTPS-only 模式默认开启，无需手动设定

## 移动版

桌面版以外的选择有限：

- **Android**：[Tor Browser for Android](https://www.torproject.org/download/#android){target="_blank"}（Tor Project 官方），跟桌面版同一个 Tor 引擎，多数设定齐备
- **iOS**：[Onion Browser](https://onionbrowser.com/){target="_blank"}（Mike Tigas 维护的社群版本，**非 Tor Project 官方**）。Apple 的 App Store 政策不允许 Tor Project 直接发 iOS 版本，所有 iOS 上的浏览器底层都受限于 WebKit（Safari 内核）

移动装置上的 Tor 体验较弱，跟桌面版有几个差异：

- iOS 因 WebKit 限制，无法做到桌面版完整的指纹抗性
- 移动装置不适合长时间跑 Snowflake 客户端，耗电、发热、进入背景会被系统杀
- 进阶威胁模型（记者、行动者）建议优先用桌面版的 Tor Browser，或直接改用 [Tails](./what-is-tails.md)

## 台湾常见错误排解

| 消息 | 可能原因 | 处理 |
|---|---|---|
| `Tor failed to establish a network connection` | ISP 短暂干扰、防火墙阻挡 | 重试。仍失败则启用桥接 |
| `PT_PROXY_FAILED` | pluggable transport 启动失败 | 换桥接类型，例如 obfs4 换 meek-azure |
| Cloudflare CAPTCHA 无限循环 | 出口节点被该站封锁 | 用 New Tor Circuit for this Site 换出口 |
| 校园或企业网络阻挡 Tor | 网络管理员封锁 entry 节点 | 启用 Connection Assist，自动选 obfs4 或 meek-azure 穿透 |

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 什么是 Tor](./what-is-tor.md)
- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:material-chat-question: 什么是匿名网络](./what-is-anonymity-network.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-snowflake: Tor Snowflake 桥接点](./tor-snowflake.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>

[^1]: [New Release: Tor Browser 11.5](https://blog.torproject.org/new-release-tor-browser-115/){target="_blank"} - The Tor Project Blog
[^2]: [Anti-Fingerprinting / Letterboxing](https://tb-manual.torproject.org/anti-fingerprinting/){target="_blank"} - Tor Browser User Manual
