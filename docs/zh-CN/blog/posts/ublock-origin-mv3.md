---
date: 2026-09-09
authors:
    - anoni-net
categories:
    - 技术
    - 隐私
slug: ublock-origin-mv3
summary: "Chrome 用户已经装不回完整版的 uBlock Origin。Firefox、LibreWolf 与 Brave 各用不同方式留住它，Google 则在同一年收掉了取代第三方 cookie 的整套计划"
description: "完整版 uBlock Origin 为什么不能在 Chrome 使用，Firefox、Brave 与 LibreWolf 分别用什么方式留住它，以及拦截广告从扩展程序搬进浏览器内核之后，用户失去了什么。"
---

# :material-shield-off-outline: 完整版 uBlock Origin 已经无法在 Chrome 使用

Chrome 用户现在装不回完整版的 uBlock Origin。2026 年 8 月 31 日，Chrome 应用商店移除最后一批 Manifest V2 扩展程序[^chrome-timeline]，uBlock Origin 是其中一个。已经装在旧版 Chrome 上的还留着，但无法再更新，移除之后也装不回来。

Manifest 是 Google 替 Chrome 扩展程序制定的规格，决定扩展程序能做哪些事。第二版让扩展程序在网页加载前逐一检查每个连接请求，当场决定要不要拦。第三版改成事先申报一份规则列表，比对与拦截交给浏览器执行。广告拦截器原本靠第二版的做法运作。

过程走了四年多，从 2022 年初停收新的 MV2 扩展程序开始，到 2025 年 7 月全面停用，再到今年 8 月的下架。每一步都有公开文件与时间表。

2025 年 10 月 17 日，Google 退役十项 Privacy Sandbox 技术[^ps-retire]，原本要用来取代第三方 cookie 的整套计划收在那一天。第三方 cookie 继续留在 Chrome 里。

规则上限与 API 差异整理在文章后半，只想知道该换什么工具的读者可以直接跳过。

<!-- more -->

## 四年的退场过程

| 日期 | 发生什么 |
|------|----------|
| 2022 年 1 月与 6 月 | Chrome 应用商店停收新的 MV2 扩展程序 |
| 2024 年 6 月 3 日 | Beta、Dev、Canary 开始显示警告横幅 |
| 2024 年 10 月 9 日 | Chrome stable 分批停用已安装的 MV2 扩展程序，企业策略可豁免到 2025 年 6 月 |
| 2025 年 3 月 31 日 | 全渠道默认停用，用户仍可手动开回 |
| 2025 年 7 月 24 日 | Chrome 138 起一律停用且无法开回，企业策略在 Chrome 139 移除 |
| 2026 年 8 月 31 日 | Chrome 应用商店移除所有剩余的 MV2 扩展程序 |

## 各家浏览器分成三条路

| 浏览器 | 完整版 uBlock Origin | 靠什么 |
|--------|-----------|--------|
| Chrome | 不能用 | MV2 代码已从 Chromium 移除，只剩 uBlock Origin Lite |
| Edge | 退场中 | 消费者版 2026 年底完成，企业版 2027 年初 |
| Firefox | 可以用 | Gecko 内核保留拦截式的 `webRequest`，MV3 也保留 |
| LibreWolf | 可以用 | Firefox 分支，安装时就内置 uBlock Origin |
| Brave | 可以用 | 自建服务器托管四个 MV2 扩展程序 |
| Safari | 不能用 | WebKit 的 content blocker 是申报式，uBlock Origin 在 Safari 13 之后就没有支持 |

Microsoft 在 2026 年 8 月 7 日的公告写，Edge 的消费者版 MV2 退场「Beginning in August 2026」开始，目标「complete the consumer transition by the end of 2026」，企业版接在 2027 年初[^edge]。公告写的理由是 MV3 在安全与性能上优于 MV2，全文没有提到 uBlock Origin。

Firefox 有自己的内核，MV3 由 Mozilla 自行实现，官方文章写 Firefox「will continue supporting both blockingWebRequest and declarativeNetRequest」[^mozilla]。两个 API 都在，扩展程序作者可以选。

Vivaldi 与 Opera 属于 Chromium 系。Vivaldi 的内置拦截器接的是 Chromium 内部 API，不受 MV3 影响，2022 年那篇说明文章的措辞是，如果有简单的方法让 `webRequest` 继续运作一段时间会考虑，没有做出承诺[^vivaldi]。上游已经没有 MV2 代码，任何跟随上游的分支要继续支持，都得自己维护修改。

国内常见的 QQ 浏览器、360 浏览器、UC 浏览器同样基于 Chromium，跟随上游版本之后一样会失去 MV2 支持。这些浏览器多半不提供 Brave 那种自建托管，也很少公开说明扩展平台的时间表，判断依据只有实际测试。

## 你现在可以怎么选

### 浏览器层

Firefox 是最直接的选择，完整版 uBlock Origin 在桌面与 Android 都能装，安装之后默认的过滤列表就够用。

Brave 内置的 Shields 安装后就生效，需要进阶控制时再从 `brave://settings/extensions/v2` 装 MV2 版的 uBlock Origin。要注意该项目的说明文件明确写不要同时使用两个内容拦截器，两个一起开可能互相干扰。

留在 Chrome 的人，uBlock Origin Lite 拦得掉大部分广告，动态控制与即时的列表更新没有了。

### LibreWolf 适合什么样的人

LibreWolf 是 Firefox 的社区分支，把隐私设置预先调好再打包发布。官方功能页写的默认值包含内置 uBlock Origin 并配好过滤列表、Tracking Protection 开在 strict 模式、Total Cookie Protection、完全停用遥测，以及启用 RFP（Resist Fingerprinting）这项来自 Tor Uplift 项目的指纹防护[^librewolf-features]。装完直接使用就有一整套设置，省去自行研究 `about:config` 的工夫。

RFP 会让一部分网站显示异常，canvas 访问需要逐站允许，语言统一回报成 en-US，窗口尺寸也被对齐。LibreWolf 也没有自动更新功能，官方 FAQ 写更新「relies on package managers or users to apply them」，跟上 Firefox 稳定版通常在三天内，有时同一天[^librewolf-faq]。安全更新要自己记得装，或交给包管理器。Android 用户则没有这个选项，官方 FAQ 写目前没有人在开发，可改用 IronFox[^librewolf-faq]。

适合的是愿意接受偶尔网站显示异常、也会固定更新的桌面用户。不想处理更新节奏的人留在 Firefox 自行安装，实际防护差距不大。

Mullvad Browser 是另一个选项，由 Mullvad 与 Tor Project 合作开发，等于拿掉 Tor 网络的 Tor Browser，默认内置 uBlock Origin，用 letterboxing 之类的手法让所有用户的指纹看起来相近，支持 Linux、macOS 与 Windows。它走的是一致化路线，网站显示异常的概率比 LibreWolf 更高一些。

LibreWolf 与 Mullvad Browser 都不要拿来连 Tor。LibreWolf 的官方 FAQ 在这一题底下写的是「Please don't」，要匿名就用 Tor Browser[^librewolf-faq]。

### DNS 层

NextDNS、AdGuard DNS、自建的 Pi-hole 都属于这一层。优点是整台设备或整个网络一次生效，手机 app 里的广告也拦得到。界线很清楚，DNS 层依据的只有域名，处理不了同一个域名下的内容，也做不到外观过滤。广告与内容来自同一个域名的情况拦不下来。

在 DNS 查询本身受到干扰的网络环境里，这一层的可靠性还要再打折。加密 DNS 的服务器地址可能连不上，回落到本地 DNS 之后过滤就失效，浏览器层的拦截器不受这个影响，两层一起用比较稳。

### 系统层

AdGuard 桌面版与 iOS 上的 content blocker app 属于这一层。桌面版通常需要安装本地证书来检查加密流量，取舍在于，等于把一个能读取所有 HTTPS 内容的组件装进系统。

### 移动设备

Android 上的 Firefox 支持完整版 uBlock Origin，在手机浏览器里算少见。iOS 因为系统限制没有这个选项，只剩 Safari 的 content blocker app 或 DNS 层方案。

## 用 Tor Browser 的人不要装

Tor Project 的支持文件写得很直接，强烈不建议在 Tor Browser 里安装新的扩展程序，包含 AdBlock Plus 与 uBlock Origin，理由是「Installing new add-ons may affect Tor Browser in unforeseen ways and potentially make your Tor Browser fingerprint unique」[^tor-addons]。

Tor Browser 的防护建立在所有用户长得一样，多装一个扩展程序就是把自己从人群里挑出来。内置的 NoScript 是唯一经过测试的那一个。

在直连 Tor 受阻的地区，接入方式要靠网桥与可插拔传输，那是另一个话题，与要不要装扩展程序无关。无论用哪种方式接入，Tor Browser 的配置都不要改动。

拦广告与抗指纹是两件不同的事。拦掉广告请求不会让你在指纹上变得不显眼，工具装得越多，指纹反而越独特。两者的关系见 [浏览器指纹是什么，为什么很难摆脱](../../basics/browser-fingerprinting.md)。

## Brave 的两层防护

Brave Shields 是浏览器内置的拦截器，用 Rust 写的 `adblock-rust` 引擎，直接修改在 Chromium 上。引擎读取的是 EasyList、EasyPrivacy 那一套 Adblock Plus 语法的列表，支持外观过滤与 scriptlet 注入[^adblock-rust]。Brave 的公告里写 Shields「don't rely on MV2 _or_ MV3」[^brave-mv3]，扩展平台怎么改都影响不到它。

扩展程序是另外一层，Brave 从 `v1.81` 起在自家后端托管 AdGuard、uBlock Origin、uMatrix、NoScript 四个 MV2 扩展程序，用户从 `brave://settings/extensions/v2` 页面安装，这几份与 Chrome 应用商店上的版本各自独立[^brave-mv3]。`v1.92` 新增自动迁移，项目的 issue `56654` 描述的行为是检测已安装的应用商店 MV2 扩展程序、备份设置、换装 Brave 托管的对应版本[^brave-issue]。同一个里程碑把该设置页改成默认启用。Brave 的 stable 版在 2026 年 9 月已经到 `v1.96`，两项变更都在正式版里。

Brave 的公告写的支持期限是「For as long as we're able (and assuming the cooperation of the extension authors)」，同一篇也写，如果扩展程序过时或停止维护，Brave 可能会移除支持，理由是不想提供过时、甚至不安全的版本[^brave-mv3]。

2026 年 6 月有报道写，Brave beta 的 MV2 设置页变成空列表，扩展程序全部消失，同版本的 nightly 正常，stable 没有受影响[^piunika]。Brave 在 8 月的帖子里重申会继续支持。

用户原本从 Chrome 应用商店取得更新，现在从 Brave 的服务器取得。更新来源、版本节奏、要不要继续支持，决定权都在 Brave 手上。Brave 在 2020 年被发现在用户输入的加密货币交易所网址后面自动加上自家的推荐码，首席执行官公开道歉并移除该行为。Brave Rewards、BAT 代币与内置钱包都是可选启用的功能，用自家广告系统取代 Google 广告系统这个商业模式本身，在隐私社区里一直有争论。

## Google 的安全理由与广告生意

Google 在安全上的论点成立，扩展程序能取得并改写每一个网络请求，一旦被入侵或本来就是恶意的，能做的事很多。2025 到 2026 年之间公开的事件包含一波从钓鱼取得 OAuth 授权开始的供应链攻击，波及超过 30 个扩展程序、约 260 万名用户，另有窃取 AI 对话内容的扩展程序影响约 90 万人。

Chrome 在 2026 年握有全球约 65% 的浏览器市占，桌面约 70%。制定扩展平台规则的公司，同时是全球最大的广告公司，2025 年 4 月已经被美国联邦法院认定在发布商广告服务器与广告交易所市场违法垄断，救济措施到现在还没定案。同一家公司同时决定规则与销售广告，以安全为名的限缩就很难被单纯接受。

EFF 的立场是 MV3 的改动会削弱扩展程序开发者因应跟踪技术变化的能力。Vivaldi 那篇文章把规则上限称为 Google 设下的人为限制，那篇文章的结尾写了一句「Perhaps, wise to move away from Chrome?」[^vivaldi]。

## 同一年收掉的另一套计划

Privacy Sandbox 从 2019 年开始，对外的说法是要用一批新技术取代第三方 cookie，让广告投放与效果衡量在不跟踪个人的前提下运作。2024 年 7 月，Google 放弃淘汰第三方 cookie 的原定计划。2025 年 4 月，弹出提示让用户自己选的方案也放弃了。

2025 年 10 月 17 日，Google 退役十项技术，包含 Topics、Protected Audience、Attribution Reporting、IP Protection 与 Related Website Sets，公告写的理由是「After evaluating ecosystem feedback about their expected value and in light of their low levels of adoption」[^ps-retire]。留下来的只有 CHIPS、FedCM、Private State Tokens 三项，官方的说明是这几项获得了广泛采用，包含其他浏览器的支持。第三方 cookie 的部分写得很直接，Chrome 维持现行做法。

同一天，英国竞争与市场管理局解除了 Google 的 Privacy Sandbox 承诺。AdExchanger 的报道写，该机关收到的 15 份咨询回复全部反对解除[^adexchanger]。

六年下来，用户这一侧的拦广告工具被限缩到申报式的规则列表，产业那一侧承诺要取代第三方 cookie 的替代方案收摊，第三方 cookie 留在原地。

## 内置拦截器的代价

Brave Shields、Vivaldi 的内置拦截器、Safari 的 content blocker，走的都是同一个方向，把拦截能力收进浏览器内核。内置之后，扩展程序权限过大的问题就不存在，性能通常也更好。

代价落在控制权上，拦不拦、拦到什么程度、列表多久更新一次，全部由浏览器厂商决定。uBlock Origin 那种逐站的动态过滤、点对点的防火墙式控制、随时换一份列表的自由，在内核内置的模型里通常没有对应物。用户从自行挑选工具、自行调整规则，变成挑一家厂商，接受它的默认值。

差别在极端情况才显现，例如某个跟踪手法刚出现而内置列表还没跟上，或者你想拦的东西刚好是厂商不想拦的。可审计性也跟着变化，开源的扩展程序谁都能读规则、谁都能改，内置功能能不能检查、能不能替换，各家程度不同。

对使用简体中文的用户来说还有一层。浏览器厂商所在的司法管辖区决定了它要听谁的，内置拦截器的过滤列表由厂商维护，要加什么、要拿掉什么，外部不一定看得到。开源的扩展程序加上公开维护的过滤列表，至少变更有记录可查。

## 技术上到底改了什么

### 两个 API 差在哪里

MV2 的 `webRequest` 是拦截式的。浏览器在送出请求之前把完整的请求信息交给扩展程序，由扩展程序的逻辑决定要不要拦。扩展程序能即时改写规则，能取得上下文，能依照标签页当下的状态套用不同规则。

MV3 的 `declarativeNetRequest` 是申报式的。扩展程序事先把规则交给浏览器，比对与拦截由浏览器执行，扩展程序取不到每一个请求的内容。Google 公告写的理由是安全与性能，因为扩展程序不再需要取得每一个网络请求的内容。

规则数量有硬上限，官方文件里的常数包含启用中的静态规则集最多 50 组、保证至少 30,000 条静态规则、动态规则 30,000 条（限安全规则）、不安全的动态规则 5,000 条、正则表达式规则 1,000 条[^dnr]。Google 2024 年 5 月的公告写，回应社区意见后把上限提高到「多达 330,000 个静态规则，再加上动态新增 30,000 个」[^google-phaseout]。早年报道常写的 MV3 只剩 30,000 条规则已经过时，总量确实提高了。

### uBlock Origin Lite 少掉的东西

uBlock Origin 的作者 Raymond Hill 没有把完整版搬到 MV3，另外做了一个 uBlock Origin Lite。项目的 FAQ 里逐条写着 MV3 架构下做不到的能力[^ubol-faq]：

- 动态过滤做不到。`declarativeNetRequest` 无法依照地址栏上的顶层域名强制套用规则
- 没有逐站的 no remote fonts 与 no scripting 开关
- 默认模式没有通用的外观过滤（cosmetic filtering），要切到 Complete 模式才有
- 大量在 uBlock Origin 里很有用的 regex 过滤器不被 API 接受
- `redirect-rule=`、regex 版本的 `removeparam=`、`replace=`、`ipaddress=`、CNAME 解除伪装全部无法支持

列表更新的方式也跟着改变，FAQ 里写「uBOL never makes network requests to any remote servers」，过滤规则只在扩展程序改版时一并更新。原本一天可以更新好几次、追着广告商的域名变动调整的列表，现在要跟着版本走 Chrome 应用商店的审核流程。Google 在 2024 年推出过针对规则变更的加速审核，公告写这类更新可以在数分钟内通过[^google-phaseout]。

### 绕道的开关逐一被移除

Chromium 的 code review 平台上查得到四笔已合并的变更，移除的都是能让 MV2 重新生效的开关：2025 年 6 月 10 日的 MV2 可用性策略（`6617410`）、2025 年 11 月 4 日的 `allow-legacy-mv2-extensions` 开发者标志（`7113458`）、2026 年 5 月 22 日的 `kExtensionManifestV2Disabled` 功能开关（`7813942`）、2026 年 6 月 4 日的策略处理代码（`7890750`）[^gerrit]。第三笔的 commit message 写的是移除该功能「and the effectively-dead code」。

## 接下来会怎么走

Brave 的 MV2 托管能维持多久，取决于维护成本。Chromium 上游已经没有相关代码，每跟一次上游版本，要自己补的东西就多一点。

Google 广告技术反垄断案的救济措施还没定案，分拆与行为面补救对广告生态的影响差距很大。第三方 cookie 留下来之后，指纹识别与服务器端的识别手法也还在原地。

工具的选择会一直变，判断的方式比较稳定。先确认自己在防谁，再看手上的工具实际拦得到什么，以及这个能力握在谁手上。

## 延伸阅读

- [浏览器指纹是什么，为什么很难摆脱](../../basics/browser-fingerprinting.md)：cookie 删得掉，指纹删不掉，以及各家浏览器的默认状态
- [Brave 用两种相反的手法抹平 GPU 指纹](./brave-gpu-fingerprinting.md)：内置防护怎么运作，以及它处理不了什么
- [社群平台怎么收集你的数据](../../basics/platform-tracking.md)：广告跟踪在整套生态里的位置
- [威胁模型如何建立](../../basics/threat-model.md)：先确认在防谁，再选工具
- [你的浏览器透露了什么](../../utils/leaks.md)：当场看一次自己的浏览器回报了哪些信息

[^chrome-timeline]: [Manifest V2 support timeline](https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline){target="_blank"} - Chrome for Developers。本文时间线表格的所有日期、Chrome 138 与 139 的角色、2026 年 8 月 31 日的下架说明皆出自此页。查证日 2026-09-01。
[^gerrit]: Chromium code review，四笔变更依序为 [`6617410`](https://chromium-review.googlesource.com/c/chromium/src/+/6617410){target="_blank"}、[`7113458`](https://chromium-review.googlesource.com/c/chromium/src/+/7113458){target="_blank"}、[`7813942`](https://chromium-review.googlesource.com/c/chromium/src/+/7813942){target="_blank"}、[`7890750`](https://chromium-review.googlesource.com/c/chromium/src/+/7890750){target="_blank"}。合并日期与 commit message 取自 Gerrit API。查证日 2026-09-01。
[^dnr]: [chrome.declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest){target="_blank"} - Chrome for Developers。规则数量上限的常数定义出自此页。查证日 2026-09-01。
[^google-phaseout]: [Manifest V2 phase-out begins](https://blog.google/chromium/manifest-v2-phase-out-begins/){target="_blank"} - Chromium 官方博客，2024 年 5 月。330,000 静态规则、30,000 动态规则与加速审核的说明出自此文。查证日 2026-09-01。
[^ubol-faq]: [uBlock Origin Lite FAQ](https://github.com/uBlockOrigin/uBOL-home/wiki/Frequently-asked-questions-(FAQ)){target="_blank"} - uBlock Origin Lite 项目 wiki。MV3 底下无法支持的能力清单与列表更新方式出自此页。uBlock Origin 的官方入口是 [gorhill/uBlock](https://github.com/gorhill/uBlock){target="_blank"}。查证日 2026-09-01。
[^edge]: [Moving the Microsoft Edge extensions ecosystem forward with Manifest Version 3](https://blogs.windows.com/msedgedev/2026/08/07/moving-the-microsoft-edge-extensions-ecosystem-forward-with-manifest-version-3/){target="_blank"} - Microsoft Edge 博客，2026 年 8 月 7 日。消费者版与企业版的时间表出自此文。查证日 2026-09-01。
[^mozilla]: [Mozilla's approach to Manifest V3](https://blog.mozilla.org/en/firefox/firefox-manifest-v3-adblockers/){target="_blank"} - The Mozilla Blog，2025 年 2 月 25 日。Firefox 同时保留两个 API 的说明出自此文。查证日 2026-09-01。
[^vivaldi]: [Manifest V3, webRequest, and ad blockers](https://vivaldi.com/blog/manifest-v3-webrequest-and-ad-blockers/){target="_blank"} - Vivaldi 博客，2022 年 9 月 23 日，2024 年 6 月更新。内置拦截器的实现方式与对规则上限的批评出自此文。查证日 2026-09-01。
[^adblock-rust]: [Brave Improves Its Ad-Blocker Performance by 69x with New Engine Implementation in Rust](https://brave.com/blog/improved-ad-blocker-performance/){target="_blank"} 与 [brave/adblock-rust](https://github.com/brave/adblock-rust){target="_blank"}。引擎的实现与支持的过滤语法出自这两处。查证日 2026-09-01。
[^brave-mv3]: [What Manifest V3 means for Brave Shields and the use of extensions in the Brave browser](https://brave.com/blog/brave-shields-manifest-v3/){target="_blank"} - Brave 官方博客。Shields 与扩展平台无关的说明、四个托管的扩展程序、`v1.81` 的时点与支持期限的措辞皆出自此文。查证日 2026-09-01。
[^brave-issue]: [Auto-replace known Web Store MV2 extensions with Brave-hosted equivalents](https://github.com/brave/brave-browser/issues/56654){target="_blank"} - brave-browser issue `56654`，里程碑 `1.92.x`。自动迁移的行为描述出自此 issue，设置页默认启用另见 issue [`56799`](https://github.com/brave/brave-browser/issues/56799){target="_blank"}。查证日 2026-09-01。
[^piunika]: [Latest Brave Beta hints at Manifest V2 support drop](https://piunikaweb.com/2026/06/26/latest-brave-beta-manifest-support-drop/){target="_blank"} - PiunikaWeb，2026 年 6 月 26 日。beta 版设置页变空的描述出自此篇报道，Brave 官方未就该次变动发表说明。查证日 2026-09-01。
[^ps-retire]: [Update on plans for Privacy Sandbox technologies](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies){target="_blank"} - Privacy Sandbox 官方公告，2025 年 10 月 17 日。退役的十项技术、保留的三项与第三方 cookie 的处置出自此文。查证日 2026-09-01。
[^adexchanger]: [Google Pulls The Plug On Topics, PAAPI And Other Major Privacy Sandbox APIs (As The CMA Says 'Cheerio')](https://www.adexchanger.com/privacy/google-pulls-the-plug-on-topics-paapi-and-other-major-privacy-sandbox-apis-as-the-cma-says-cheerio/){target="_blank"} - AdExchanger，2025 年 10 月。英国 CMA 解除承诺与 15 份反对回复的数字出自此篇报道。查证日 2026-09-01。
[^tor-addons]: [Should I install a new add-on or extension in Tor Browser, like AdBlock Plus or uBlock Origin?](https://support.torproject.org/tbb/tbb-14/){target="_blank"} - Tor Project 支持文件。不建议安装扩展程序的理由出自此页。查证日 2026-09-01。
[^librewolf-features]: [LibreWolf Features](https://librewolf.net/docs/features/){target="_blank"} - LibreWolf 官方文件。内置 uBlock Origin 与过滤列表、Tracking Protection strict 模式、Total Cookie Protection、停用遥测、启用 RFP 的说明皆出自此页。查证日 2026-09-02。
[^librewolf-faq]: [LibreWolf FAQ](https://librewolf.net/docs/faq/){target="_blank"} - LibreWolf 官方文件。更新节奏与无自动更新、无 Android 版与 IronFox 的建议、不建议搭配 Tor 使用的说明皆出自此页。查证日 2026-09-02。
