---
date: 2026-08-19
authors:
    - anoni-net
categories:
    - 技术
    - 隐私
slug: brave-gpu-fingerprinting
summary: "Brave 从 1.93 版起默认抹平 WebGL 与 WebGPU 泄漏的显卡信息。同一次更新里同时用了一致化与随机化两种相反手法，分工的界线落在改动哪一项数据会弄坏网站功能"
description: "Brave 1.93 起默认抹平 WebGL 与 WebGPU 泄漏的显卡信息。本文拆解三项防护的技术细节，说明一致化与随机化为什么在同一次更新里分工，并对照 Tor Browser 与 Firefox 的做法。"
---

# :material-fingerprint: Brave 用两种相反的手法抹平 GPU 指纹

打开一个网页，网页上的 JavaScript 就能取得你的显卡型号、驱动信息，以及硬件支持哪些功能。答案在同一台电脑上几乎不会变，跟踪公司把它们跟其他设备特征组合起来，就是一组不需要 cookie、不需要你同意、跨网站跟着你走的标识符。

显卡是浏览器指纹的其中一项来源，字体清单、屏幕尺寸、时区、音频运算结果同样算在里面。整套机制怎么运作、为什么清 cookie 没有作用、各家浏览器的默认状态差在哪，见 [浏览器指纹是什么，为什么很难摆脱](../../basics/browser-fingerprinting.md)。本文只处理显卡这一块。

Brave 从 `1.93` 版起处理这组信号，桌面版与 Android 版都默认开启，分批推送[^brave]。做法有三项，WebGL 的厂商与渲染器字符串换成所有 Brave 用户一致的通用字符串、WebGPU 的硬件描述字段清空、WebGL 支持的扩展清单注入噪声。

前两项让所有用户看起来一样，第三项让同一个用户在每个网站看起来都不一样。两种方向相反的手法出现在同一次更新里，各自负责不同的 API。分工的界线落在哪里，也是 Brave 与 Tor Browser 在指纹抗性上分歧的起点。

<!-- more -->

## 显卡为什么是一组好用的指纹

WebGL 与 WebGPU 让网站使用硬件加速绘图，地图、游戏、数据可视化都靠它们。为了让网站能针对硬件调整绘图方式，两组 API 也把底层的硬件细节开放给 JavaScript 查询。

网站能取得的信息有三类[^brave]：

- **厂商与渲染器字符串**：透过 `WEBGL_debug_renderer_info` 扩展提供的 `UNMASKED_VENDOR_WEBGL` 与 `UNMASKED_RENDERER_WEBGL` 两个参数[^mdn]，网站会取得类似 `ANGLE (Apple, ANGLE Metal Renderer: Apple M5 Max)` 的字符串，精确到芯片型号。调试用的扩展最早是 Chrome 为了 Google Maps 开放，后来变成所有网站都能调用。
- **支持的扩展清单**：同一个 WebGL context 会回报它支持的完整扩展清单，内容随 GPU 与驱动而异，跟踪者把整份清单 hash 成一组精简的标识符。
- **WebGPU 的硬件描述**：较新的 WebGPU API 会返回 adapter 的 `vendor`、`architecture` 与 `device` 字段，例如 `{vendor: 'apple', architecture: 'metal-3'}`。

显卡不会天天更换，所以这些值长期稳定，比 cookie 更难清除。用户换账号、开无痕窗口、清空浏览记录，API 回报的硬件特征仍是同一组。

Brave 执行了一次小规模的网络爬取，分析每次调用前的调用堆栈（stack trace），观察排行前段的网站怎么使用这些 API，结论是多数网站调用它们的唯一用途就是浏览器指纹识别[^brave]。爬取规模与比例没有写在公告里。

## 一致化与随机化，各自处理哪一种数据

| 信号 | Brave 的处理 | 手法性质 |
|------|--------------|----------|
| WebGL 厂商与渲染器字符串 | 换成单一通用字符串，所有 Brave 用户取得相同的值 | 一致化 |
| WebGPU 的 adapter 描述 | 清空 `vendor`、`architecture`、`device` | 一致化 |
| WebGL 扩展清单 | 注入噪声，每个 session、每个站点（eTLD+1）、每个存储区看到的值都不同 | 随机化 |

第三项沿用 Brave 既有的 farbling 机制，2020 年的更新里写下的定义是「对半识别性的浏览器功能输出做轻微随机化，让网站难以侦测，又不破坏良性、以用户为本的网站」[^farbling]。

## farbling 的种子怎么运作

farbling 的行为由种子的产生方式决定，浏览器启动时产生一组随机的 session token，与造访的每个第一方顶层框架域名经 HMAC256 混合，得出每个域名一组、寿命与 session 相同的 token[^farbling]。同一个网站在同一个 session 内重复测量会取得完全相同的值，换一个网站取得不同的值，下一个 session 再全部换过。第三方 frame 与 script 沿用顶层 eTLD+1 的种子[^farbling]，嵌入第三方内容不会成为绕道。

指纹器会把大量半识别特征 hash 成单一标识符，只要其中一项被随机化，整组 hash 就被污染。技术源头是 PriVaricator（Nikiforakis 等人，WWW 2015）与 FPRandom（Laperdrix 等人，ESSoS 2017）两项研究[^farbling]。

## 为什么不全部一致化

扩展清单为什么走随机化，公告里没有写。从 API 的用途推测，改动两种数据对网站功能的冲击差距很大。

厂商与渲染器字符串主要用于性能调校与硬件黑名单。网站取得的字符串不在既有清单里，最坏的结果是走一般绘图路径。把值收敛成一个常数，该字段对指纹的贡献直接归零，代价有限。

扩展清单用于功能协商。网站会依照清单里有没有某个扩展，决定要不要启用某条绘图路径，或改走哪一种后备方案。给一份与硬件实况不符的统一清单，网站可能选到硬件无法支持的路径，也可能放弃本来可用的加速。可行的做法只剩在保留可用性的前提下加入噪声，让 hash 出来的值不稳定。

两种手法的防护目标也不同，一致化降低的是熵（entropy），让某一项特征失去区辨力，理想状态是全世界的 Brave 用户在该字段完全相同。注入噪声破坏的是可链接性（linkability），值仍然带有信息，但每站每次都不一样，跟踪者无法把两个网站上的你接成同一个人。

## Tor Browser 把一致化做到底

Pierre Laperdrix 2019 年替 Tor Project 写的指纹介绍文章，开宗明义写着「所有 Tor 用户应该有完全相同的指纹」。当时的具体做法包含在所有平台回报同一组操作系统信息、统一时区与屏幕分辨率，以及 letterboxing 在内容周围加上灰边，把可视区域对齐到固定尺寸，避免最大化窗口泄漏屏幕大小[^tor]。

Laperdrix 也点出随机化的风险，引用 Eckersley 提出的「可指纹化的隐私增强技术悖论」（Paradox of Fingerprintable Privacy Enhancing Technologies）。举的例子是某个扩展程序改掉一批数值，却漏改 `navigator.platform`，于是造出一组现实中不存在的特征组合，用户反而更容易被辨认出来[^tor]。随机化要做对，覆盖范围必须够完整，Brave 持续扩充 farbling 的端点清单也是同一个原因。

Firefox 系的处理方式又是另一种。`privacy.resistFingerprinting` 开启时，`WEBGL_debug_renderer_info` 这个扩展直接停用，网站调用不到[^mdn]。该开关默认关闭，需要用户自行到 `about:config` 开启，各家浏览器默认做到哪里的完整对照见 [浏览器指纹是什么，为什么很难摆脱](../../basics/browser-fingerprinting.md)。停用与返回通用值各有代价，停用之后网站取不到值，需要自行处理空值的情况，返回通用值则让网站收到的数据与真实硬件无异，照常运作。Brave 选后者，一贯把功能损坏的风险压到最低。公告里另一项主张是防护要默认开启，不藏在特殊模式或旗标后面[^brave]。

界线在 Brave 的文档里也写得清楚。2020 年说明 farbling 的更新里有一句建议，需要对抗定向攻击的用户应该改用 Tor Browser[^farbling]。随机化挡得住被广泛部署的商业跟踪，不提供匿名集（anonymity set）。

## 读者可以怎么选

日常浏览的层面，默认开启是这次更新最实际的价值。多数人不会为了隐私去改 `about:config`、切换特殊模式或安装扩展程序，公告里也写了扩展程序本身带有安全与隐私问题[^brave]。防护在安装完就生效，门槛接近零。

需要匿名的情境仍然要用 Tor Browser。Brave 的随机化只处理跨站串接，IP 地址仍然直接暴露给网站，网络路径上的观察者也看得到你连了哪里。记者、行动者、处理敏感题材的工作者，威胁模型不同，工具选择也跟着不同，可以回头看 [威胁模型如何建立](../../basics/threat-model.md)。

境内的 Tor 直连无法使用，需要网桥或其他接入方式，使用规避工具本身也有风险，这一层取舍需先纳入考量。相对地，Brave 的指纹防护属于浏览器内建功能，不涉及接入方式，装完就生效。

用 Tor Browser 的人要记得一致化路线靠整体一致性维持。安装扩展程序、最大化窗口、改动字体设置，都会让你从人群里凸出来，细节见 [Tor Browser 进阶设置](../../tools/tor-browser-advanced.md)。同一个动作在 Brave 上影响有限，在 Tor Browser 上会直接破坏防护的前提。

想确认自己的浏览器泄漏了什么，EFF 的 [Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} 会列出浏览器回报的 WebGL 厂商与渲染器字符串，以及各项特征的识别力。Brave 的更新完整推送到你的设备之后，两个字段会塌成通用值[^brave]。

## 还没做完的部分

WebGPU 支持的扩展清单目前还没纳入随机化，公告里写了之后会补上[^brave]。图形 API 仍是指纹研究的活跃领域，新的泄漏管道会持续出现。

网站功能受损的情况还在观察期。Brave 保留了逐站调整防护的能力，遇到确实无法正常运作的网站，用户可以单站关闭图形防护、关闭指纹防护，或整个关掉 Shields[^brave]。保留这些开关代表取舍仍在，一致化与注入噪声都无法保证所有网站维持原本的行为。

指纹识别不会因为一次浏览器更新而结束。显卡这一项被处理掉之后，字体清单、canvas 绘图结果、音频运算特征仍在原地。能安全收敛成常数的信号就收敛，牵涉功能协商的信号就注入噪声，这条分工线也适用于检视其他标榜指纹抗性的工具。

## 延伸阅读

- [浏览器指纹是什么，为什么很难摆脱](../../basics/browser-fingerprinting.md)：指纹由哪些特征组成、为什么结构上难以规避，以及各家浏览器的默认状态
- [平台知道你多少事](../../basics/platform-tracking.md)：设备指纹在整套跟踪生态里的位置
- [Tor Browser 进阶设置](../../tools/tor-browser-advanced.md)：指纹抗性与窗口大小的实际操作
- [威胁模型如何建立](../../basics/threat-model.md)：先确认在抗谁，再选工具

[^brave]: [Brave improves protections against GPU fingerprinting](https://brave.com/privacy-updates/38-webgl-webgpu-fingerprinting-protections/){target="_blank"} - Brave 隐私更新第 38 篇。本文引用的三项防护、爬取观察、兼容处理与后续规划皆出自此文。查证日 2026-08-14。
[^farbling]: [Fingerprinting Defenses 2.0](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/){target="_blank"} - Brave 隐私更新第 4 篇，2020 年。farbling 的定义、HMAC256 种子机制与研究出处出自此文，第三方 frame 沿用顶层种子的说明另见 Brave 的 [Fingerprinting Protections wiki](https://github.com/brave/brave-browser/wiki/Fingerprinting-Protections){target="_blank"}。wiki 页面会被持续编辑，查证日 2026-08-18。
[^tor]: [Browser Fingerprinting: An Introduction and the Challenges Ahead](https://blog.torproject.org/browser-fingerprinting-introduction-and-challenges-ahead/){target="_blank"} - Pierre Laperdrix，The Tor Project 博客，2019 年 9 月 4 日。一致化路线、letterboxing 与可指纹化隐私增强技术悖论的说明出自此文，文中的具体做法对应撰文当时的 Tor Browser 版本，该悖论一词出自 Eckersley 的 PETS 2010 论文，由本文引用。查证日 2026-08-18。
[^mdn]: [WEBGL_debug_renderer_info](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info){target="_blank"} - MDN Web Docs。两个常数的定义，以及 Firefox 在 `privacy.resistFingerprinting` 为 true 时停用此扩展的说明。查证日 2026-08-18。
