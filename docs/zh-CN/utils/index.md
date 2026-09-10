---
title: 小工具
subtitle: 离线可用的工具与 3D 互动
description: 在浏览器里直接执行的小工具，全部不送出任何数据，存进设备之后没有网络也能用。
icon: material/tools
---

# :material-tools: 小工具

站上的文章说明怎么保护自己，小工具区放的是可以直接按的东西。共同的规则有四条：

- 全部在你的浏览器里运算，不送出任何数据
- 存进设备之后没有网络也能用，断网可用本身就是「没有偷送东西」的证明
- 源代码在 [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"}，看得懂的人可以自己验
- 都需要浏览器开着 JavaScript，因为运算是在你的设备上做的

## 用 Tor Browser 的话有一个冲突要知道

[Tor Browser 的安全等级](../tools/tor-browser-advanced.md)调到 Safest 会把 JavaScript 全部关掉，小工具区的工具就整页不动。

冲突在于，安全等级页的指引写的是在「来路不明的钓鱼链接、不熟悉的域名」时把等级调高，而收到可疑链接正是最需要用[隐形字符检测](invisible.md)或 [QR code 读取器](qr-read.md)查一下的时候。

处理方式是把两件事分开。可疑的网站用高安全等级去开，把要查的文字或图片复制出来之后切回 Standard，查完再调回去。小工具区的工具不连外，在 Standard 等级下打开它们不会增加你在该可疑网站上的暴露。

## 目前有的

### 要防什么

<div class="grid cards" markdown>

-   :material-clipboard-check-outline: **[威胁模型清单](threat-model.md)**

    把「要保护什么、要防谁、愿意付出多少」三题答成一份可复制的清单，并标出答案里的错配。答案预设不存，要留的话用 passkey 加密存在你的设备上。

-   :material-checkbox-marked-outline: **[我的准备清单](checklist.md)**

    把站上的行动建议收成一份可勾的清单，勾了用 passkey 加密存在你的设备上，下次按一次指纹就看得到进度。没有账号、没有服务器，站上什么都不存。

</div>

### 密码与加密

<div class="grid cards" markdown>

-   :material-dice-multiple-outline: **[密语与密码生成器](passphrase.md)**

    用 asian-diceware 的 7776 字词表抽密语，或从你选的字符集抽随机密码。随机数来自浏览器的 `crypto.getRandomValues`，并且会显示生成出来的密码熵有多少。

-   :material-lock-outline: **[本机文件加密](age.md)**

    选一个文件或贴一段文字，用密语、passkey 或收件人的 age 公钥在浏览器里加密成 age 格式，或把 age 文件解回来。密文可以输出成文字，跟密语一起存进你的密码管理器就能跨设备。加密完先用同一组密语解回来比对才给下载。输出是公开格式，任何装了 age 命令行工具的电脑都能解开，不需要这个网站。

-   :material-fingerprint: **[passkey 钥匙](passkey.md)**

    创建一把这个网站的 passkey，存进你的密码管理器或钥匙串。只用清单的话按一次「创建 passkey」就够，要用文件加密才需要再试一次解锁、生成备援密钥。之后本机文件加密可以用它当钥匙，不用记密语，准备清单、威胁模型的存档与收件人簿也用它加密存在你的设备上。没有账号、没有服务器，站上什么都不存。

</div>

### 当面传东西

<div class="grid cards" markdown>

-   :material-qrcode: **[QR code 生成器](qrcode.md)**

    把 onion 网址、Tor bridge 等很长又容易打错的字符串变成 QR code，让眼前的人用相机读走，中间不经过任何服务器。可以下载成 SVG 印出来。

-   :material-qrcode-scan: **[QR code 读取器](qr-read.md)**

    读出图片里 QR code 的内容，图片不离开设备。解出来是网址时把主机独立标出来，并且不提供打开按钮。

-   :material-animation-play-outline: **[QR code 影格串流](qr-stream.md)**

    手机里的东西要送进旁边那台笔记本，而现场的 Wi-Fi 不是你的。把文件切成一连串 QR code 轮流播放，另一台用摄像头读回来拼成原文件。两台设备之间没有配对、没有共用网络、没有服务器。

-   :material-file-compare: **[文件哈希比对](hash.md)**

    算出文件的 SHA-256，跟对方给的那一串比对。U 盘带过去、托人带过去、下载回来的安装包，都靠这一步确认取得的跟原本那份一样。几 GB 的文件也算得动，过程中显示进度。

</div>

### 发出去之前

<div class="grid cards" markdown>

-   :material-file-document-multiple-outline: **[PDF 页面整理](pdf-pages.md)**

    合并好几份 PDF、抽出或删掉某几页、换顺序、转方向。输出是新建的文件，来源的标题、作者、制作软件与创建时间都不会跟过来，交给你之前会重新读一次确认页数与方向都对。


-   :material-image-off-outline: **[文件 metadata 清除器](strip-metadata.md)**

    拿掉照片、视频、录音、Office 文档与 PDF 里的 EXIF、GPS、设备型号、制作软件、作者与注释字段，全程在本机处理。照片、视频与录音的压缩数据一个比特都没动，每一段的去留都列给你看。

-   :material-selection-remove: **[截图遮蔽](redact.md)**

    在截图或照片上拉方框，把不该外流的名字、头像与对话填成实心黑色，全程在本机处理。输出重新编码，原文件的 metadata 与文件名都不会带过去，交给你之前会逐像素确认每一处都是纯黑。

</div>

### 收到之后

<div class="grid cards" markdown>

-   :material-link-variant-off: **[网址清理器](clean-url.md)**

    把网址里的追踪参数挑出来并移除，每一个都说明是谁在追。拆掉 Google 与 Facebook 的转址包装，并把真正的注册域名单独标出来，品牌放在子域名、旁边加字、用长得像的字母冒充都会说明。

-   :material-format-letter-matches: **[隐形字符检测](invisible.md)**

    找出文字里看不见的零宽字符、方向控制、标签字符与同形字，标出位置并说明每一类是什么。文件外流追踪、钓鱼网址，还有藏给 AI 读的指令，都会利用看不见的字符。

-   :material-eye-outline: **[你的浏览器透露了什么](leaks.md)**

    列出任何网站不必问你就拿得到的信息，并标出 Tor Browser 会把哪些统一掉。换个浏览器再看一次，就知道 Tor Browser 实际上防住了什么。

</div>

## 要离线带着走

工具的程序与数据会跟页面一起存下来。[QR code 生成器](qrcode.md)、[读取器](qr-read.md)、[影格串流](qr-stream.md)与[密语生成器](passphrase.md)四页跟核心章节一起自动存进设备，理由是它们在断网现场会用到，见[网络中断时的准备与应对](../scenarios/shutdown.md)。其余几页在[离线阅读](../offline.md)的清单里勾起来，之后没有网络也可以打开。

## 用了谁的程序

小工具区大部分的程序是自己写的，放在 [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"} 底下。有几样东西来自别人，原封不动放进来，不做任何修改：

| 组件 | 用在 | 授权 | 授权文字在哪 |
|---|---|---|---|
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator){target="_blank"} 1.4.4 | [QR code 生成器](qrcode.md)、[影格串流](qr-stream.md) | MIT | [文件开头的标头](vendor/qrcode-generator.js) |
| [jsQR](https://github.com/cozmo/jsQR){target="_blank"} 1.4.0 | [QR code 读取器](qr-read.md)、[影格串流](qr-stream.md) | Apache-2.0 | [jsQR-LICENSE.txt](vendor/jsQR-LICENSE.txt) |
| [pdf-lib](https://github.com/Hopding/pdf-lib){target="_blank"} 1.17.1 | [文件 metadata 清除器](strip-metadata.md)的 PDF 部分 | MIT | [pdf-lib-LICENSE.txt](vendor/pdf-lib-LICENSE.txt) |
| [asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"} 的 7776 字词表 | [密语与密码生成器](passphrase.md) | 词表数据 CC-BY-4.0，程序 MIT | [上游的 repo](https://github.com/anoni-net/asian-diceware){target="_blank"} |
| [typage](https://github.com/FiloSottile/typage){target="_blank"}（npm 的 age-encryption）0.3.1 | [本机文件加密](age.md) | BSD-3-Clause | [LICENSE](vendor/age/age-encryption/LICENSE) |
| typage 相依的 [noble-ciphers](https://github.com/paulmillr/noble-ciphers){target="_blank"} 2.1.1、[noble-curves](https://github.com/paulmillr/noble-curves){target="_blank"} 2.0.1、[noble-hashes](https://github.com/paulmillr/noble-hashes){target="_blank"} 2.0.1、[noble-post-quantum](https://github.com/paulmillr/noble-post-quantum){target="_blank"} 0.5.3、[scure-base](https://github.com/paulmillr/scure-base){target="_blank"} 2.0.0 | [本机文件加密](age.md) | MIT | [noble-ciphers](vendor/age/noble-ciphers/LICENSE)、[noble-curves](vendor/age/noble-curves/LICENSE)、[noble-hashes](vendor/age/noble-hashes/LICENSE)、[noble-post-quantum](vendor/age/noble-post-quantum/LICENSE)、[scure-base](vendor/age/scure-base/LICENSE) |

`pdf-lib.min.js` 里面还打包了微软的 tslib（Apache-2.0），它的版权信息跟着留在文件里，没有被压缩工具剥掉。

不做修改是刻意的。改过就失去可对照上游版本的可审性，读者要验的时候只能相信我们的说法。文件都在 `utils/vendor/` 底下，可以自己跟上游的版本比对。typage 与它的相依是 ES module，没有单一文件的发行版，所以连同 `package.json` 与授权原封不动放进 `vendor/age/`，页面用 import map 接起来，每一个文件都能跟 npm 上同版本的 tarball 逐字节比对，哈希记在 `vendor/README.md`。

为什么不自己写，各页最后一节都有说明。共通的理由是外部函数库写错不会崩溃，只会产生看起来正常但实际上错的结果，比坏掉更难发现，QR code 生成器那一页就记了一次实际遇到的例子。

## 没有收进来的东西

需要连到外部服务才能运作的功能不会收进小工具区，因为连接本身就违反「离线可用」与「不送出数据」两条规则。网络测量请用 [OONI Probe](../tools/what-is-ooni.md)，它是设计来做网络测量的工具，数据的处理方式也公开。

分享链接也不会有。把结果存起来给别人看，听起来只是方便，实际上是把内容送到服务器，而工具本体仍然在浏览器里运算，画面上看不出差别。JSONFormatter 与 CodeBeautify 这两个粘贴型工具站就是这样，政策里写着九成九的工具在浏览器里处理，那句话是真的，但同时有一颗存档按钮，存下来的内容默认公开，搜索引擎索引得到。安全团队 watchTowr Labs 在 2025 年[从那里取得八万多份提交、超过 5 GB](https://labs.watchtowr.com/stop-putting-your-passwords-into-random-websites-yes-seriously-you-are-the-problem/){target="_blank"}，涵盖五年份的内容，里面有数据库密码、云端密钥与企业内部账号。两站的政策都写着不要拿它存机密数据，看到的人不多。

所以这一区的规则没有为了方便开的侧门。要把结果给别人，自己存档再用你信得过的渠道传。
