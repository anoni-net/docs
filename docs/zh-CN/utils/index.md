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

<div class="grid cards" markdown>

-   :material-clipboard-check-outline: **[威胁模型清单](threat-model.md)**

    把「要保护什么、要防谁、愿意付出多少」三题答成一份可复制的清单，并标出答案里的错配。答案不存起来，刷新就没了。

-   :material-dice-multiple-outline: **[密语与密码生成器](passphrase.md)**

    用 asian-diceware 的 7776 字词表抽密语，或从你选的字符集抽随机密码。随机数来自浏览器的 `crypto.getRandomValues`，并且会显示生成出来的密码熵有多少。

-   :material-qrcode: **[QR code 生成器](qrcode.md)**

    把 onion 网址、Tor bridge 等很长又容易打错的字符串变成 QR code，让眼前的人用相机读走，中间不经过任何服务器。可以下载成 SVG 印出来。

-   :material-qrcode-scan: **[QR code 读取器](qr-read.md)**

    读出图片里 QR code 的内容，图片不离开设备。解出来是网址时把主机独立标出来，并且不提供打开按钮。

-   :material-animation-play-outline: **[QR code 影格串流](qr-stream.md)**

    手机里的东西要送进旁边那台笔记本，而现场的 Wi-Fi 不是你的。把文件切成一连串 QR code 轮流播放，另一台用摄像头读回来拼成原文件。两台设备之间没有配对、没有共用网络、没有服务器。

-   :material-image-off-outline: **[文件 metadata 清除器](strip-metadata.md)**

    拿掉照片、视频与 PDF 里的 EXIF、GPS、设备型号、制作软件与注释字段，全程在本机处理。照片与视频的压缩数据一个比特都没动，每一段的去留都列给你看。

-   :material-link-variant-off: **[网址清理器](clean-url.md)**

    把网址里的追踪参数挑出来并移除，每一个都说明是谁在追。拆掉 Google 与 Facebook 的转址包装，并把真正的注册域名单独标出来，品牌放在子域名、旁边加字、用长得像的字母冒充都会说明。

-   :material-format-letter-matches: **[隐形字符检测](invisible.md)**

    找出文字里看不见的零宽字符、方向控制、标签字符与同形字，标出位置并说明每一类是什么。文件外流追踪、钓鱼网址，还有藏给 AI 读的指令，都会利用看不见的字符。

-   :material-eye-outline: **[你的浏览器透露了什么](leaks.md)**

    列出任何网站不必问你就拿得到的信息，并标出 Tor Browser 会把哪些统一掉。换个浏览器再看一次，就知道 Tor Browser 实际上防住了什么。

</div>

## 要离线带着走

工具的程序与数据会跟页面一起存下来。在[离线阅读](../offline.md)的清单里勾起小工具区的页面，之后没有网络也打得开。

## 用了谁的程序

小工具区大部分的程序是自己写的，放在 [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"} 底下。有四样东西来自别人，原封不动放进来，不做任何修改：

| 组件 | 用在 | 授权 | 授权文字在哪 |
|---|---|---|---|
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator){target="_blank"} 1.4.4 | [QR code 生成器](qrcode.md)、[影格串流](qr-stream.md) | MIT | [文件开头的标头](vendor/qrcode-generator.js) |
| [jsQR](https://github.com/cozmo/jsQR){target="_blank"} 1.4.0 | [QR code 读取器](qr-read.md)、[影格串流](qr-stream.md) | Apache-2.0 | [jsQR-LICENSE.txt](vendor/jsQR-LICENSE.txt) |
| [pdf-lib](https://github.com/Hopding/pdf-lib){target="_blank"} 1.17.1 | [文件 metadata 清除器](strip-metadata.md)的 PDF 部分 | MIT | [pdf-lib-LICENSE.txt](vendor/pdf-lib-LICENSE.txt) |
| [asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"} 的 7776 字词表 | [密语与密码生成器](passphrase.md) | 词表数据 CC-BY-4.0，程序 MIT | [上游的 repo](https://github.com/anoni-net/asian-diceware){target="_blank"} |

`pdf-lib.min.js` 里面还打包了微软的 tslib（Apache-2.0），它的版权信息跟着留在文件里，没有被压缩工具剥掉。

不做修改是刻意的。改过就失去可对照上游版本的可审性，读者要验的时候只能相信我们的说法。文件都在 `utils/vendor/` 底下，可以自己跟上游的版本比对。

为什么有四样不自己写，各页最后一节都有说明。共通的理由是外部函数库写错不会崩溃，只会产生看起来正常但实际上错的结果，比坏掉更难发现，QR code 生成器那一页就记了一次实际遇到的例子。

## 没有收进来的东西

需要连到外部服务才能运作的功能不会收进小工具区，因为连接本身就违反「离线可用」与「不送出数据」两条规则。网络测量请用 [OONI Probe](../tools/what-is-ooni.md)，它是设计来做网络测量的工具，数据的处理方式也公开。
