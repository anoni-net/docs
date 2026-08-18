---
title: 浏览器指纹是什么，为什么很难摆脱
description: cookie 删得掉，指纹删不掉。说明指纹由哪些特征组成、为什么结构上难以规避，以及 Tor Browser、Brave、Safari、Firefox、Chrome 现在各自做到哪里。
icon: material/fingerprint
---

<!-- zh-CN：Claude Code 候选稿，待人工校对（词汇差异与政治措辞） -->

# :material-fingerprint: 浏览器指纹是什么，为什么很难摆脱

清空 cookie、开无痕窗口、换一个账号登录，网站仍然认得出来是同一台机器。原因在于辨认的依据没有存在你的电脑里。

浏览器每次载入网页，网页上的 JavaScript 可以问它几十个问题：屏幕多大、时区设在哪、装了哪些字体、显卡是哪一款、支持哪些功能。单独看每个答案，跟你一样的人很多。全部组合起来，跟你完全一样的人可能一个都没有。组合出来的标识符就是浏览器指纹（browser fingerprint）。

本页说明指纹由什么组成、为什么结构上难以规避，以及各家浏览器现在做到哪里。平台侧主动收集的数据属于另一个主题，见 [社群平台怎么收集你的数据](./platform-tracking.md)。

## cookie 删得掉，指纹删不掉

cookie 是网站存在你浏览器里的一小段数据，有文件、有过期时间，你可以删掉它、拒绝它、定期清空。整套同意机制与「清除浏览数据」按钮都建立在用户能管理它的前提上。

指纹没有对应的文件。网站每次载入时当场测量、当场算出来，关掉浏览器再开，答案仍然一样。没有「清除指纹」这个操作可以执行，因为没有东西被存下来。

Google 2019 年的博客文章里写过同一个落差，用户无法清除指纹，因此无法控制自己的信息如何被收集，「我们认为这破坏了用户的选择权，是错的」[^google2019]。同一家公司后来的政策走向见下方〈各家浏览器现在做到哪里〉。

## 指纹由哪些东西组成

- **屏幕与窗口**：分辨率、色彩深度、窗口尺寸、设备像素比
- **系统设置**：时区、语言、操作系统与版本
- **字体清单**：装过的每一套字体都可能被列举，设计工作者与开发者的机器通常特别好认
- **绘图硬件**：显卡厂商与型号、支持的功能清单，经由 WebGL 与 WebGPU 取得
- **canvas 与音频**：请浏览器画一段图形或运算一段音频，不同硬件与驱动算出来的结果有微小差异，把结果 hash 成一组值
- **浏览器本身**：版本、支持哪些 API、安装了哪些扩展程序、字体渲染方式

衡量的单位是熵（entropy），也就是一项特征能把人群切成多少份。时区把整个东八区的用户归到同一格，数以亿计的人落在同一个值上，识别力很低。完整的字体清单常常一次就把范围缩到个位数。

EFF 在 2010 年的 Panopticlick 研究收集了 470,161 个浏览器样本，其中 83.6% 的指纹是唯一的，在装有 Flash 或 Java 的样本里唯一比例升到 94.2%，整体分布至少带有 18.1 bits 的熵[^eckersley]。样本来自主动造访测试站的人，唯一的比例会比真实母体偏高。十六年前的测量已经足以说明问题的规模。

## 为什么结构上难以规避

### 网站本来就要用这些数据

字体清单、屏幕尺寸、绘图能力，网页排版与绘图需要它们决定走哪条路径。全部拒绝回答，会有网站直接无法运作。任何防护都要在可用性与识别力之间取舍，取舍的位置决定了防护能做多深。

### 伪装做不完整反而更好认

Pierre Laperdrix 替 Tor Project 写的指纹介绍文章引用 Eckersley 的说法，把问题称为可指纹化的隐私增强技术悖论（Paradox of Fingerprintable Privacy Enhancing Technologies）。举的例子是某个扩展程序改掉一批数值，却漏改 `navigator.platform`，造出一组现实中不存在的特征组合，用户反而更容易被辨认出来[^tor]。

### 跟踪者用的是模糊比对

指纹会随着浏览器更新、换屏幕、安装新字体而改变。跟踪方不需要前后完全一致，用相近程度加上时间连续性就能把两组指纹接成同一台机器。FP-Stalker 研究收集了近十万组指纹、超过 1,900 个浏览器实例，其中 50% 的实例在五天内指纹就变过。即使如此，该方法平均仍能跟踪 54.48 天，部分超过 100 天[^fpstalker]。

只改掉一两项特征，关联不一定会断。

## 三条防护路线

### 一致化

让所有用户在同一个字段回报相同的值，该项特征的识别力直接归零。Tor Browser 走这条路，在所有平台回报同一组操作系统信息、统一时区，并用 letterboxing 在内容周围加上灰边，把可视区域对齐到固定尺寸，避免窗口大小泄漏屏幕尺寸[^tor]。

成立条件是用户群够大且真的长得一样，也就是匿名集（anonymity set）要够厚。代价落在用户身上，自己去改设置、装扩展程序、把窗口拉到最大，都会让你从人群里凸出来。

### 随机化

让同一个人在每个网站、每个会话看到的值都不同。值仍然带有信息，但两个网站取得的值对不起来，破坏掉的是可链接性（linkability）。Brave 的 farbling 与 Safari 的噪声注入走这条路。

这条路线要覆盖所有字段才成立。漏掉的字段会变成稳定的锚点，让随机化过的部分失去意义。

### 直接限制

不回答，或只回答粗略值。Firefox 在 `privacy.resistFingerprinting` 开启时停用 `WEBGL_debug_renderer_info` 扩展，Safari 把回报的屏幕尺寸对齐窗口尺寸、屏幕位置固定为 `(0, 0)`，都属于这一类[^webkit]。

## 各家浏览器现在做到哪里

| 浏览器 | 默认状态 | 主要路线 |
|--------|----------|----------|
| Tor Browser | 一般使用即生效 | 一致化 |
| Brave | 一般窗口即生效 | 随机化为主，部分字段一致化 |
| Safari | 分两层，指纹脚本拦截在一般浏览默认开启，噪声注入默认限无痕窗口 | 脚本拦截加上噪声注入与限制回报 |
| Firefox | 无痕窗口与严格模式默认开启 | 脚本拦截加上限制回报 |
| Chrome | 一般窗口没有内建防护 | 无 |

**Tor Browser** 的一致化做得最彻底，防护对所有用户一律生效。代价是要接受固定的窗口尺寸与较慢的连接，换来的是连接层的匿名，其他浏览器都没有提供。

**Brave** 从 2020 年起用 farbling 对半识别性的 API 输出做轻微随机化，种子每个会话与每个站点各不相同[^farbling]。`1.93` 版把显卡信息纳入，WebGL 厂商与渲染器字符串换成通用值，WebGPU 的硬件描述字段清空，WebGL 扩展清单注入噪声[^brave]。防护默认开启，一般窗口就生效。

**Safari** 的防护分两层。`17.0` 起的进阶指纹防护对 canvas、WebGL 读回与 WebAudio 注入少量噪声，默认只在无痕窗口开启，设置里可以套用到一般浏览[^webkit]。`26.0` 起另外加了一层指纹脚本拦截，挡掉已知的指纹脚本读取屏幕尺寸、处理器核心数、语音清单、Apple Pay 能力、WebAudio 读回与 2D canvas，也挡它们写入长效存储。Apple 工程师说明这一层属于智能防跟踪的一部分，由「防止跨网站跟踪」这个设置控制，而该设置在一般浏览本来就默认开启[^webkit26]。

**Firefox** 在 `145` 版补上第二阶段防护。已知的指纹脚本沿用增强型跟踪保护（Enhanced Tracking Protection）的清单拦截，未列名的则改用限制 API 输出的方式处理，两项都在无痕窗口与增强型跟踪保护的严格模式默认开启。Mozilla 的公告写着被判定为唯一的用户比例因此接近减半，全局默认开启仍在进行中[^mozilla]。另外一个开关 `privacy.resistFingerprinting` 沿用 Tor Browser 的一致化路线，默认关闭，需要自行到 `about:config` 开启。

**Chrome** 的一般窗口没有针对指纹的内建防护。无痕窗口有 IP Protection，2025 年 7 月起推送，遮蔽的是第三方情境下的 IP 地址，处理范围不含设备指纹[^ipprotection]。2019 年启动的 Privacy Sandbox 把指纹识别列为要解决的问题，到 2025 年 4 月计划收束为止，没有推出针对指纹的防护措施[^register]。

同一家公司的广告政策走向相反。Google 在 2024 年 12 月 18 日公告修改广告平台政策，移除禁止使用设备指纹的条款，2025 年 2 月 16 日生效[^policy]。英国信息专员办公室（Information Commissioner's Office, ICO）隔日发布的回应写着该决定不负责任，使用指纹识别的业者仍须证明符合数据保护法在透明、同意与可删除等方面的要求[^ico]。

## 自己测一次

EFF 的 [Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} 会列出浏览器回报的各项特征，并标出每一项的识别力。[AmIUnique](https://amiunique.org/){target="_blank"} 提供另一组样本可以对照。

测试站的样本来自主动造访的人，判定为唯一的比例会偏高。逐项看哪几个字段识别力最高比较有用，那些字段是你调整之后收益最大的地方。

在 Tor Browser 上测出「跟其他人一样」才是预期结果，测出唯一反而代表设置被改动过。

## 你能做什么

依成本分三级，每一级后面标出挡不掉什么。

### 低成本

- **换一个默认就处理指纹的浏览器**：Brave 安装完即生效，Firefox 把增强型跟踪保护切到严格模式，Safari 在设置里把 `17.0` 那层进阶防护也套用到一般浏览
- **不要为了隐私安装一堆改指纹的扩展程序**：覆盖不完整的伪装会制造出独特的组合，效果与目标相反

你主动登录的账号挡不掉，指纹防护处理的是不具名的跨站关联，登录行为本身直接告诉网站你是谁。

### 中成本

- **用途分开，用不同的浏览器**：同一个浏览器开不同 profile 对指纹没有帮助，硬件与系统特征在 profile 之间完全相同
- **拦截第三方脚本**：uBlock Origin 之类的工具能减少有机会测量你的对象
- **减少可列举的特征**：非必要的字体与扩展程序移除掉

这一级处理掉一部分跨站关联，挡不掉的是第一方网站自己执行的测量。

### 高成本

- **用 Tor Browser 并且不改设置**：见 [Tor Browser 进阶设置](../tools/tor-browser-advanced.md)
- **敏感用途换一台设备**

换设备与换工具改变的是关联，你在单一网站上留下的内容没有因此减少，自愿交出去的信息也一样。

这三级假设你所在的法域不限制这些工具。境内 Tor 直连无法使用，需要网桥或其他接入方式，使用规避工具本身也有风险，取舍见 [威胁模型如何建立](./threat-model.md)。

## 几个没有帮助的做法

- **无痕窗口**：清掉的是本机记录、cookie 与登录状态，指纹照样算得出来。Safari 与 Firefox 的无痕窗口确实带有额外防护，效果来自那些防护本身
- **VPN**：换掉的是 IP 地址，指纹完全不变，见 [VPN 的风险与选择](../tools/vpn-guide.md)
- **手动改 User-Agent**：多半让你更好认，理由见上方〈伪装做不完整反而更好认〉
- **定期清 cookie**：对指纹没有作用

## 本页会过期

浏览器每几个月改版一次，默认值与功能名称都会变动。本页写的是机制与判断方式，实际状态请以各浏览器当下的官方说明为准。发现描述与现况不符，欢迎到 [社群 Matrix 公开 room](../community/tools.md) 回报。

## 接下来

- [社群平台怎么收集你的数据](./platform-tracking.md)：指纹在整套跟踪生态里的位置
- [威胁模型如何建立](./threat-model.md)：先确认在防谁，再决定要付出多少成本
- [怎么维持多个网络身分](./multiple-identities.md)：账号分层碰上指纹时的限制
- [Tor Browser 进阶设置](../tools/tor-browser-advanced.md)：一致化路线的实际操作
- [监控现在做得到什么](./surveillance-capability.md)：把指纹放进四层能力对照

[^google2019]: [Building a more private web](https://blog.google/products-and-platforms/products/chrome/building-a-more-private-web/){target="_blank"} - Justin Schuh，Google，2019 年 8 月 22 日。原文为「Unlike cookies, users cannot clear their fingerprint, and therefore cannot control how their information is collected. We think this subverts user choice and is wrong.」查证日 2026-08-18。
[^eckersley]: [How Unique Is Your Web Browser?](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf){target="_blank"} - Peter Eckersley，Electronic Frontier Foundation，PETS 2010。470,161 个样本、83.6% 唯一、18.1 bits 熵的数字出自此文。
[^tor]: [Browser Fingerprinting: An Introduction and the Challenges Ahead](https://blog.torproject.org/browser-fingerprinting-introduction-and-challenges-ahead/){target="_blank"} - Pierre Laperdrix，The Tor Project，2019 年 9 月 4 日。一致化路线与 letterboxing 出自此文，该悖论一词由此文引自 Eckersley 的 PETS 2010 论文。文中的具体做法对应撰文当时的 Tor Browser 版本。
[^fpstalker]: [FP-STALKER: Tracking Browser Fingerprint Evolutions](https://inria.hal.science/hal-01652021v1){target="_blank"} - Vastel、Laperdrix、Rudametkin、Rouvoy，IEEE S&P 2018。近十万组指纹、1,900 个浏览器实例、平均跟踪 54.48 天的数字出自此文。
[^farbling]: [Fingerprinting Defenses 2.0](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/){target="_blank"} - Brave 隐私更新第 4 篇，2020 年。farbling 的定义与种子机制出自此文。
[^brave]: [Brave improves protections against GPU fingerprinting](https://brave.com/privacy-updates/38-webgl-webgpu-fingerprinting-protections/){target="_blank"} - Brave 隐私更新第 38 篇。`1.93` 版的三项防护出自此文。
[^webkit]: [Private Browsing 2.0](https://webkit.org/blog/15697/private-browsing-2-0/){target="_blank"} - WebKit Blog，2024 年 7 月 16 日。Safari `17.0` 起的进阶指纹防护、噪声注入范围与屏幕尺寸对齐的说明出自此文。
[^webkit26]: [WebKit Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/){target="_blank"} - WebKit Blog，2025 年 9 月 15 日。指纹脚本拦截挡下的 API 清单出自此文，该层属于智能防跟踪、由「防止跨网站跟踪」控制的说明来自 Apple 工程师的公开回复，见 [Safari 26 advanced fingerprinting protection](https://lapcatsoftware.com/articles/2025/9/4.html){target="_blank"} 的追查记录。查证日 2026-08-18。
[^mozilla]: [Firefox expands fingerprint protections: advancing towards a more private web](https://blog.mozilla.org/en/firefox/fingerprinting-protections/){target="_blank"} - The Mozilla Blog，2025 年 11 月 10 日。Firefox `145` 的两层防护、默认开启的范围与唯一比例接近减半的数字出自此文。
[^ipprotection]: [IP Protection](https://github.com/GoogleChrome/ip-protection/blob/main/README.md){target="_blank"} - GoogleChrome/ip-protection，说明文件。适用范围限无痕窗口、遮蔽第三方情境下的 IP 地址，不处理设备指纹。查证日 2026-08-18。
[^register]: [Google Chrome lacks browser fingerprinting defenses](https://www.theregister.com/security/2026/04/16/google-chrome-lacks-browser-fingerprinting-defenses/5229136){target="_blank"} - The Register，2026 年 4 月 16 日。Privacy Sandbox 未推出指纹防护的说法引自隐私顾问 Alexander Hanff，Google 未对报道回应。
[^policy]: [Google to lift fingerprinting restrictions amid privacy concerns](https://ppc.land/google-to-lift-fingerprinting-restrictions-amid-privacy-concerns/){target="_blank"} - PPC Land，2024 年 12 月。政策公告日 2024-12-18、生效日 2025-02-16，原政策中「Google doesn't allow fingerprinting」条款被移除的分析另见 [Lukasz Olejnik 的说明](https://blog.lukaszolejnik.com/biggest-privacy-erosion-in-10-years-on-googles-policy-change-towards-fingerprinting/){target="_blank"}。
[^ico]: [Our response to Google's policy change on fingerprinting](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/12/our-response-to-google-s-policy-change-on-fingerprinting/){target="_blank"} - Information Commissioner's Office，2024 年 12 月 19 日。
