---
title: 小工具
description: 在浏览器里直接跑的小工具，全部不送出任何数据，存进设备之后没有网络也能用。
icon: material/tools
---

# :material-tools: 小工具

站上的文章说明怎么保护自己，这一区放的是可以直接按的东西。共同的规则有三条：

- 全部在你的浏览器里运算，不送出任何数据
- 存进设备之后没有网络也能用，断网可用本身就是「没有偷送东西」的证明
- 源代码在 [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"}，看得懂的人可以自己验

## 目前有的

<div class="grid cards" markdown>

-   :material-dice-multiple-outline: **[密语与密码生成器](passphrase.md)**

    用 asian-diceware 的 7776 字词表抽密语，或从你选的字符集抽随机密码。随机数来自浏览器的 `crypto.getRandomValues`，并且会告诉你这组密码的熵有多少。

-   :material-qrcode: **[QR code 生成器](qrcode.md)**

    把 onion 网址、Tor bridge 这类很长又容易打错的字符串变成 QR code，让眼前的人用相机读走，中间不经过任何服务器。可以下载成 SVG 印出来。

-   :material-eye-outline: **[你的浏览器透露了什么](leaks.md)**

    列出任何网站不必问你就拿得到的信息，并标出 Tor Browser 会把哪些统一掉。换个浏览器再看一次，就知道那些防护实际上做了什么。

</div>

## 要离线带着走

这些工具的程序与数据会跟页面一起存下来。在[离线阅读](../offline.md)的清单里勾起这一区的页面，之后没有网络也打得开。

## 没有收进来的东西

需要连到外部服务才能运作的功能不会放在这里，那跟「离线可用」与「不送出数据」两条规则冲突。网络测量请用 [OONI Probe](../tools/what-is-ooni.md)，那是设计来做这件事的工具，数据的处理方式也公开。
