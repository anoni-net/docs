---
title: 密语与密码生成器
description: 在浏览器里生成 Diceware 密语与随机密码，用的是 asian-diceware 的 7776 字词表与浏览器的密码学随机数。全部在你的设备上完成，没有网络也能用。
icon: material/dice-multiple-outline
offline_assets:
  - utils/asian-diceware-7776.txt
---

# :material-dice-multiple-outline: 密语与密码生成器

<div id="passphrase-tool"></div>

<script src="../../js/passphrase.js"></script>

## 这个工具在做什么

「密语」模式从 [asian-diceware](../tools/asian-diceware.md) 的 7776 字词表里独立抽几个字串起来。那份词表是社群参考 EFF Diceware 做的版本，混进了 `oolong`、`boba`、`tofu` 这类已经进英文字典的亚洲外来语，对在台湾与亚洲各地生活的人更好认、更好记。

「随机密码」模式从你勾选的字符集里逐字抽。适合用密码管理器保管、不需要用手打的场合。

两个模式的随机数都来自 `crypto.getRandomValues`，那是浏览器提供的密码学等级随机数，跟 `Math.random` 不同。取样时把不能整除的尾巴丢掉重抽，让每个字被抽中的概率完全相同。细节与测试见[源代码](https://github.com/anoni-net/docs/blob/main/docs/zh-TW/js/passphrase.js){target="_blank"}。

## 熵那个数字

熵是「要猜多少次才猜得到」的度量，单位是比特。每多一个比特，猜的次数就要多一倍。

七千七百多个字里抽六次，熵大约是 77.5 比特。那代表即使攻击者知道你用的是这份词表、知道你抽了六个字，仍然要在 2^77.5 种组合里找。EFF 建议一般用途至少六个字，主密码或加密磁盘这类长期不换的地方可以用七到八个。

字数少于五个的密语不要拿来保护重要的东西。工具会把它标成偏弱。

## 为什么敢在网页上做这件事

密码生成器最大的疑虑是「这个网站会不会偷偷把生成的密码送出去」。

这一页的答案是：**把网络关掉，它照样能用**。断网的情况下浏览器送不出任何东西，而工具仍然抽得出密语，因为词表与程序都已经存在你的设备上（见[离线阅读](../offline.md)）。这是任何说明文字都给不了的保证。

如果你连这个都不想信，最稳的做法是拿实体骰子照 [asian-diceware](../tools/asian-diceware.md) 那篇的方法查表。那不依赖任何软件，也是 Diceware 原本的设计。这个工具的定位是在你赶时间、或手边没有骰子的时候顶替，不是取代它。

## 复制之后记得清剪贴板

按「复制」会把结果放进系统剪贴板，那里的内容其他程序读得到，有些输入法与同步服务还会把它上传。贴进密码管理器之后，复制一段无关的文字盖掉它。

手机上更要注意，剪贴板常常跨 App 共用。

## 接下来

- 生成好的密语要有地方放，见[密码管理器入门](../tools/password-manager.md)
- 词表怎么做出来的、选字有什么原则，见 [Asian Diceware](../tools/asian-diceware.md)
- 想把这一页带着离线用，见[离线阅读](../offline.md)
