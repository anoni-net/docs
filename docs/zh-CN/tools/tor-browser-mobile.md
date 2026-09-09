---
title: 手机上的 Tor
description: Android 有 Tor Project 官方的 Tor Browser，iOS 没有官方版本，只能用社群维护的 Onion Browser。这一页说明两边各自的安装方式、第一次启动要处理什么、如何确认自己真的走在 Tor 上，以及什么时候应该放下手机改用电脑。
icon: material/cellphone-lock
---

# :material-cellphone-lock: 手机上的 Tor

看到一个 `.onion` 地址，用平常的浏览器打不开，需要的是 Tor。手机上要装什么，Android 与 iOS 的答案不一样，两边能做到的事也不一样。

先读过 [什么是 Tor](./what-is-tor.md) 会比较好理解底下的取舍。桥接与安全等级的细节在 [Tor Browser 进阶设置](./tor-browser-advanced.md)，这一页只说明手机上不同的部分。

## 两个平台的差别

Android 上有 Tor Project 自己发布的 Tor Browser，跟桌面版同一个 Tor 引擎，多数设置齐备。

iOS 上没有官方版本。Apple 要求 iOS 上所有浏览器都用 WebKit 渲染，而 Tor Browser 的指纹抗性建立在对浏览器引擎的修改上，那些修改在 WebKit 上做不出来。限制来自 Apple 的平台政策，跟版本新旧无关。Tor Project 因此把 iOS 读者指向 Onion Browser。[^1]

| | Android | iOS |
|---|---|---|
| 官方版本 | 有，Tor Project 发布 | 没有 |
| App 名称 | Tor Browser for Android | Onion Browser |
| 流量走 Tor | 是 | 是 |
| 指纹抗性 | 接近桌面版 | 做不到，受 WebKit 限制 |
| 系统需求 | Android 5.0 以上 | 依 App Store 标示 |

两边的共同点是流量都真的走 Tor，所以要打开一个 `.onion` 地址，Android 与 iOS 都做得到。差别在你能不能同时抵抗指纹追踪。

## Android 有四个获取渠道

Tor Project 列出的渠道是 Google Play、F-Droid、官方网站与 GetTor。[^2]

**Google Play** 最直接，更新由系统处理。需要 Google 账号，而且下载记录会留在账号上。

**F-Droid** 不需要 Google 账号。步骤是先装 F-Droid，在 **My Apps** 底下的 **Repositories** 加入 Guardian Project 的官方仓库，再搜索 Tor Browser for Android 安装。[^3]

**官方网站**直接给 APK 文件，前面两个渠道连不上时用它。

**GetTor** 是连官网都被封锁时的最后手段，透过电子邮件或其他渠道取得下载链接。

选哪一个取决于你的处境。想避开 Google 账号就用 F-Droid。所在地封锁较严重时，Google Play 与 F-Droid 可能都连不上，往官方网站与 GetTor 找。

Tor Project 的签名验证说明只涵盖 Windows、macOS 与 Linux，没有 Android 的步骤，[^4] 你取得 APK 之后很难用官方文件教的方式确认它没被动过。能用 F-Droid 或 Google Play 就用，那两个渠道的完整性由商店负责，直接下载 APK 是它们都连不上时的备案。

## 第一次启动要处理的事

打开 Tor Browser for Android 之后会先连线。连不上的话，通常是网络端挡掉了 Tor。App 里有 Connection Assist，也可以手动选桥接。哪一种桥接适合哪一种封锁，写在 [Tor Browser 进阶设置](./tor-browser-advanced.md#连线Connection-Assist-与桥接)。

安全等级预设是 **Standard**。要提高到 **Safer** 或 **Safest** 之前，先看 [安全等级的说明](./tor-browser-advanced.md#安全等级Security-Level)，等级愈高，愈多网站会显示不正常，值不值得取决于你在抗谁。

## iOS 只有 Onion Browser

Onion Browser 在 App Store 上架，开源，贡献者包含 Mike Tigas、Benjamin Erhart 与 Guardian Project。它不是 Tor Project 的官方产品。

- 流量走 Tor，`.onion` 地址打得开，你的网络运营商看不到你连了哪个站
- 指纹抗性做不到桌面版的程度。同一个网站在不同时间把你的浏览器指纹比对成同一人的概率，比在桌面版 Tor Browser 上高
- 更新节奏跟 Tor Project 的桌面版与 Android 版各自独立

在 iOS 上只想读一个 `.onion` 页面，Onion Browser 够用。想在手机上维持一个不被关联的身分，iOS 给不了那个保证。

## 怎么确认真的走在 Tor 上

装好之后开 [check.torproject.org](https://check.torproject.org/){target="_blank"}。不是走 Tor 的时候，那一页会直接写着 Sorry. You are not using Tor.，并列出你的 IP。

读本站的 onion 版本时，把地址栏的地址跟页尾印的完整地址逐字比对。`.onion` 地址没有证书颁发机构背书，核对地址本身就是唯一的验证手段，而用相似地址架设钓鱼站是真实存在的手法。三种阅读方式的差别写在 [你正在用哪一种方式阅读](../about/how-you-are-reading.md)。

## 什么时候该换成电脑

手机上的 Tor 适合临时查阅与日常浏览。威胁模型落在记者或行动者那一端的时候，指纹抗性与操作系统层级的隔离都重要，需要桌面版的 Tor Browser 或 [Tails](./what-is-tails.md)。

## 用手机帮别人连上 Tor 是另一回事

自己读 Tor 跟帮审查地区的人连上 Tor 是两件事，后者手机做得到。浏览器标签页版的 [Snowflake](./tor-snowflake.md) 在手机上效果有限，标签页进到后台之后 Android 经常直接中断 WebRTC 连线。Tor Project 另外推出独立的 Snowflake Volunteer App，用的是后台服务，可以设置只在 Wi-Fi 或只在充电时运作，那才是手机长期贡献的做法。

## 接下来

装好之后，设置的细节看 [Tor Browser 进阶设置](./tor-browser-advanced.md)。想知道自己需要调到什么程度，先回头建立 [威胁模型](../basics/threat-model.md)。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 什么是 Tor](./what-is-tor.md)
- [:material-cog-outline: Tor Browser 进阶设置](./tor-browser-advanced.md)
- [:material-routes: 你正在用哪一种方式阅读](../about/how-you-are-reading.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-snowflake: Tor Snowflake 桥接点](./tor-snowflake.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>

[^1]: [Can I run Tor Browser on an iOS device?](https://support.torproject.org/tormobile/tormobile-3/){target="_blank"} - Tor Project Support。原文写着 Apple requires browsers on iOS to use something called Webkit, which prevents Onion Browser from having the same privacy protections as Tor Browser。
[^2]: [Tor Browser for Android](https://support.torproject.org/mobile-tor/){target="_blank"} - Tor Project Support。原文列出 the Play Store, F-Droid, the Tor Project website and GetTor，系统需求是 Android 5.0 以上。
[^3]: [How do I install Tor Browser for Android from F-Droid?](https://support.torproject.org/tormobile/tormobile-7/){target="_blank"} - Tor Project Support，含加入 Guardian Project 仓库的完整流程。
[^4]: [How can I verify Tor Browser's signature?](https://support.torproject.org/tbb/how-to-verify-signature/){target="_blank"} - Tor Project Support，该页只涵盖 Windows、macOS 与 GNU/Linux。
