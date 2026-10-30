---
title: 浏览器安全更新
description: Chrome 与 Firefox 每月安全更新的白话整理，说明这个月有没有已被利用的漏洞、要更新到哪一版，以及两个浏览器的发布节奏。
icon: material/web-check
digest:
  name: 浏览器
  devices: [windows, mac, linux, android]
  tracks: [Chrome, Firefox]
  basis: 按上游是否标注已被利用分级
---

# :material-web-check: 浏览器安全更新

Chrome 与 Firefox 的安全更新整理，按月聚合，两个浏览器分开写。浏览器每天都在处理来自陌生网站的内容，是漏洞被实际利用最频繁的软件之一，2026 年 9 月 Chrome 就有两个已被利用的漏洞。新的月份永远在最上面。

iPhone 与 iPad 上的 Chrome 与 Firefox 用的是 Apple 的 WebKit 引擎，修补跟着系统更新走，整理在 [iOS 安全更新](./ios.md)。Tor Browser 以 Firefox ESR 为基础，Firefox 的修补大多会跟着带进去，逐版内容见 [Tor 更新日志](./tor.md)。

原始数据来自 [Chrome Releases](https://chromereleases.googleblog.com/){target="_blank"} 的桌面稳定版公告与 Mozilla 的[安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>上游标注已被实际利用。Chrome 的写法是「Google is aware that an exploit for … exists in the wild」，Mozilla 会在该项说明里写到 attacks in the wild。被 CISA 收入已知遭利用漏洞目录（KEV）也算。
- <span class="urg-tag urg-tag--soon">尽快</span>有 Critical 或 High 级别的安全修补，上游没有标注已被利用。
- <span class="urg-tag urg-tag--routine">一般</span>只有 Medium 以下的安全修补，或没有安全修补。

这一页的「立刻」需要证据，跟 iOS、Windows 那几页用同一个判断标准。严重程度只作参考，2026 年 9 月被利用的 CVE-2026-87491，Chrome 自己评的严重程度只有 Medium。

Mozilla 的公告里常见「we presume that with enough effort some of these could have been exploited」，那是内存安全错误的固定写法，表示理论上可能被利用，不代表已经有人在利用。判断时看的是有没有写到 in the wild。

## 两个浏览器的发布节奏

Chrome 每周都有带安全修补的小版本，大版本原本约四周一版，2026 年 9 月起的 153 到 156 都只隔两周。Firefox 也从 9 月起改成两周一个大版本，另外维护延长支持版（ESR）153 与 115，115 这条主要给还在用 Windows 7、8.1 与旧版 macOS 的人。ESR 140 在 9 月 29 日的 140.17 之后就没有新版，Mozilla 的版本信息也不再列出这条线。

两个浏览器都会在后台下载更新，但要重新启动浏览器才会生效。长时间不关浏览器的人，可能早就下载了新版却一直在运行旧版。Chrome 在地址栏输入 `chrome://settings/help` 可以查看版本，Firefox 在菜单的「帮助」里点「关于 Firefox」。

## Chrome 2026 年 10 月

> 2026-10-29 · [Chrome Releases](https://chromereleases.googleblog.com/2026/10/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>10 月 29 日的 156.0.8078.79 修复了 21 个安全问题，Critical 1 个、High 19 个、Medium 1 个。10 月的六份桌面稳定版公告，Google 都没有标注任何一项已被实际利用，目前最新的就是 156.0.8078.79。
- Critical 那一项是 MediaStream（网页使用摄像头与麦克风的接口）的内存损坏（CVE-2026-76024）。High 里 FileSystem 有 3 个，Quota、CacheStorage 与 Skia 各 2 个，另有 V8 与 Dawn（WebGPU 的实现）各一个。扩展稳定版（Extended Stable）这一次也换到 156.0.8078.79。Android 版同日发布，公告写明修补内容跟桌面版相同。
- 10 月 27 日的 156.0.8078.73 修复了 52 个安全问题，Critical 4 个、High 46 个。
- 4 个 Critical 落在 FileSystem 的内存损坏（CVE-2026-118306）、FileAPI 与 Skia 的输入验证不足（CVE-2026-118331、CVE-2026-118348），以及 Layout 的 use-after-free（CVE-2026-118344）。High 里 V8 与 Turbolev 合计 6 个，PDF 引擎 PDFium 另有一个 use-after-free（CVE-2026-118345）。Android 版同日发布，公告写明修补内容跟桌面版相同。
- 157 已经在 10 月 22 日与 28 日以抢先稳定版（Early Stable）推给一小部分 Windows 用户，两份公告都没有列出安全修补。
- 10 月 20 日的大版本 156.0.8078.47 修复了 353 个安全问题，Critical 6 个、High 61 个。
- 156 的 6 个 Critical 有 5 个是内存损坏，分别在 Skia（绘图引擎）、Accessibility、CSS、Paint 与 WebRTC（CVE-2026-113341、CVE-2026-113279、CVE-2026-113072、CVE-2026-113280、CVE-2026-113303），另一个是 Accessibility 的 use-after-free（CVE-2026-113271）。High 里 V8 与它的编译器 Turbolev 合计 7 个，另有一个站点隔离的 use-after-free（CVE-2026-113101）与一个 Proxy 的输入验证不足（CVE-2026-113040）。
- 10 月 13 日的 155.0.8059.79 修复了 37 个，Critical 7 个、High 29 个。7 个 Critical 都是内存错误，落在 ANGLE、浏览器本体、PDF、Network、Core、SVG 与 Media，其中 PDF 那一个（CVE-2026-110136）打开 PDF 就会经过。High 里有 Windows 安装程序的提权（CVE-2026-110150）与更新程序的授权错误（CVE-2026-110159）。
- 10 月 15 日的 155.0.8059.84 修复了 10 个，Critical 1 个，是预渲染（Prerender）的 use-after-free（CVE-2026-110922），High 6 个里有 3 个在 V8。
- Android 版跟着桌面版发布，公告写明修补内容相同。扩展稳定版（Extended Stable）152 也在 10 月 13 日与 15 日跟着更新，最新是 152.0.7977.169。
- 10 月 6 日的大版本 155.0.8059.39 修复了 247 个安全问题，Critical 4 个、High 53 个。Google 没有标注任何一项已被实际利用。
- 4 个 Critical 都是 use-after-free（程序把内存释放之后又拿来用），分别在 Chromecast、浏览器本体、页面导航（Navigation）与 Track 组件（CVE-2026-106382、CVE-2026-106197、CVE-2026-106358、CVE-2026-106347）。High 里 ANGLE 有 7 个、V8 有 3 个，另有一个站点隔离（Site Isolation）的授权错误（CVE-2026-102322）。
- 10 月 1 日的 154.0.8037.97 修复了 11 个安全问题，Critical 1 个、High 9 个。Google 没有标注任何一项已被实际利用。
- Critical 那一项是 WebGL（网页调用显卡绘制 3D 图形的接口）的越界写入（CVE-2026-103628）。High 里有一个 V8 的类型混淆（CVE-2026-103625），其余分散在 FileSystem、SVG、Skia、MediaStream 等组件。
- 九月那两个已被利用的 V8 漏洞早在 152.0.7977.82 与 153.0.8010.36 修复，更新到这一版同样覆盖。

## Firefox 2026 年 10 月

> 2026-10-27 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>10 月 27 日的 Firefox 159 修复了 167 个问题，High 108 个、Moderate 52 个、Low 7 个，没有 Critical。Mozilla 没有标注任何一项已被实际利用，公告里也没有出现 in the wild 的字样。桌面版目前最新的就是 159。
- 159 的 High 里有 3 个沙箱逃逸，落在页面导航、表单管理与网络组件（CVE-2026-117861、CVE-2026-117864、CVE-2026-117868），另有 5 个提权、3 个同源策略绕过与 5 个 JIT 编译器的问题。Moderate 里还有 10 个沙箱逃逸，一半在图形与 WebRender。
- ESR 153.6 与 115.44 同日发布，分别修复了 145 个与 80 个。ESR 140 这一轮同样没有对应的版本，Tor Browser 在 10 月 29 日发布的 16.0 直接换到 153.6.0esr 为基础（见 [Tor 更新日志](./tor.md)）。
- iOS 版在 10 月 26 日发布 156.1，修复了 2 个问题。Moderate 等级的是 FaceTime 的协议处理可以被用来伪冒（CVE-2026-116632），Low 等级的是 tel: 链接让地址栏显示伪冒的地址（CVE-2026-116631）。
- 10 月 13 日的 Firefox 158 修复了 77 个问题，High 30 个、Moderate 33 个、Low 14 个，没有 Critical。
- Mozilla 从这一版起改了公告的写法，内部发现的内存安全错误不再合并成一个汇总的 CVE，改成一个错误一个编号。High 的数量因此比过去多，跨月比较数字时要知道这件事。过去每版都有的那句「could have been exploited」固定套话，也跟着汇总条目一起消失了。
- 158 的 High 里有 4 个沙箱逃逸，落在网络与图形组件（CVE-2026-109705、CVE-2026-109707、CVE-2026-109708、CVE-2026-109712），应用程序更新组件有一个提权（CVE-2026-109704），JavaScript 引擎与 JIT 编译器有 7 个。其余多是 DOM、SVG、图形与音视频组件的 use-after-free。
- 158.0.1 修复了 4 个问题，其中 2 个 High。一个跟证书有关，eMudhra 的中间证书遭到滥用，Mozilla 在 10 月 17 日通过 OneCRL（Firefox 的证书吊销列表）封锁了它们。OneCRL 平常靠远程设置自动更新，这一版把更新后的列表直接放进程序里，关掉远程设置的人也会拦下这些证书（CVE-2026-113470）。另一个是 SVG 的边界条件错误（CVE-2026-113399）。
- ESR 153.5 与 115.43 在 10 月 13 日跟着 158 发布，分别修复了 61 个与 17 个，10 月 20 日的 153.5.1 与 115.43.1 再补上 eMudhra 那一项。ESR 140 这一轮没有对应的版本。Android 版在 10 月 21 日另发 158.0.2，同样只补 eMudhra 那一项。Tor Browser 15.0.26 与 GrapheneOS 的对应更新见 [Tor 更新日志](./tor.md)与 [GrapheneOS 月度更新摘要](./grapheneos.md)。
- 10 月 6 日的 157.0.1 只修复了一个 Moderate 等级的问题，文件处理组件的防护机制可以被绕过（CVE-2026-106016）。

## Chrome 2026 年 9 月

> 2026-09-29 · [Chrome Releases](https://chromereleases.googleblog.com/2026/09/){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>两个已被利用的漏洞都在 V8（Chrome 执行 JavaScript 的引擎），Google 在公告里标注已有利用程序在外流传，CISA 也在次日收入 KEV。更新到 153.0.8010.36 以上两个都覆盖，目前最新的是 9 月 29 日的 154.0.8037.92。
- CVE-2026-85046：V8 的类型混淆（type confusion），Google 评为 High，9 月 3 日的 152.0.7977.82 修复。
- CVE-2026-87491：V8 的越界写入（out of bounds write），Google 评为 Medium，9 月 8 日的 153.0.8010.36 修复。
- Edge、Brave 这类基于 Chromium 的浏览器用的也是 V8，要等各自的更新。Tor Browser 基于 Firefox，没有 V8，不受这两个影响。
- 9 月 29 日的 154.0.8037.92 修复了 32 个安全问题，Critical 1 个，是 ANGLE（把网页的图形指令转成各平台绘图接口的转译层）的缓冲区溢出（CVE-2026-102331）。Google 没有标注这一版有已被利用的漏洞。
- 这个月七次稳定版更新共修复了 466 个安全问题，Critical 24 个。9 月 8 日的 153 与 22 日的 154 两个大版本就占了 338 个。

## Firefox 2026 年 9 月

> 2026-09-29 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>三个大版本 155（9 月 1 日）、156（9 月 15 日）与 157（9 月 29 日）都有 High 级别的修补。Mozilla 没有标注任何一项已被实际利用。
- 157 的修补比 156 还多，High 有 38 个，其中 9 个是沙箱逃逸，连同 Moderate 级别共 15 个。沙箱是浏览器隔开网页与操作系统的那道隔离，逃逸类漏洞往往是完整攻击链的最后一步。WebGPU（网页直接调用显卡运算的接口）另有 4 个 High。
- 156 的 High 有 29 个，其中两个是沙箱逃逸（CVE-2026-92035、CVE-2026-92018），8 个是 WebGL 画布组件的权限提升。
- Android 版另有一个权限提升（CVE-2026-92033），同样在 156 修复。
- ESR 用户对应的最新版本是 153.4、140.17 与 115.42，跟 157 同一天发布。Tor Browser 15.0.24 已经跟上 140.17。

## Chrome 2026 年 8 月

> 2026-08-25 · [Chrome Releases](https://chromereleases.googleblog.com/2026/08/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>五次稳定版更新共修复了 395 个安全问题，Critical 19 个。Google 没有标注任何一项已被实际利用。
- 8 月 25 日的 152 是大版本，一次就修复了 327 个。8 月 4 日那一版只修一般错误，没有安全修补。

## Firefox 2026 年 8 月

> 2026-08-18 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>8 月 18 日的 Firefox 154 有 19 个 High 级别的修补，ESR 对应的版本是 153.1、140.14 与 115.39。Mozilla 没有标注任何一项已被实际利用。
- 8 月 4 日 Android 版另外发布了 153.0.3，修复一个信息泄露（CVE-2026-18809），Firefox Focus 也在影响范围内。

## Chrome 2026 年 7 月

> 2026-07-29 · [Chrome Releases](https://chromereleases.googleblog.com/2026/07/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>六次稳定版更新共修复了 436 个安全问题，Critical 14 个。Google 没有标注任何一项已被实际利用。
- 7 月 29 日的 151 是大版本，一次就修复了 371 个。7 月 7 日那一版没有安全修补。

## Firefox 2026 年 7 月

> 2026-07-21 · [Mozilla 安全公告](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>7 月 14 日的 152.0.6 修复两个 Critical，CVE-2026-15718（WebAssembly 的无效指针）与 CVE-2026-15719（页面导航的站点隔离问题）。Mozilla 写明这两个的利用程序已经公开，但没有发现实际攻击。利用程序公开意味着任何人都拿得到，这个月的 Firefox 在「尽快」里要排第一。
- ESR 晚了一周，7 月 21 日的 140.13 才修复这两个，115.38 只覆盖 CVE-2026-15719。
- 同一天的 Firefox 153 另有 20 个 High 级别的修补。
