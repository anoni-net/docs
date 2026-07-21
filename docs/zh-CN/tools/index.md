---
title: 工具层
description: 匿名网络工具的入门索引，依连线、环境、观测、日常基本功四个层次分群，帮你判断自己这个情境该先读哪几篇。
icon: material/toolbox-outline
---

# :material-toolbox-outline: 工具层

读完[概念层](../basics/index.md)后，这个分类介绍几个在匿名网络讨论中最常被提到的工具。16 篇文章按连线、环境、观测、日常基本功四个层次排列，每个层次解决一类问题，挑跟你情境相关的那一群开始读就好，不必整本看完。动工具之前可以先看 [威胁模型如何建立](../basics/threat-model.md)，确认自己在抗谁，避免「工具当答案」的误区。

## 先看这篇

- [什么是匿名网络](./what-is-anonymity-network.md)：匿名网络解决什么问题、后续工具家族如何分工，第一次来建议先读这篇。

## 连线层：Tor 工具家族

想匿名浏览、传档、或贡献网络自由基础建设的人，从这群开始。最后一篇介绍 VPN，它不属于 Tor 家族，却是多数人最先碰到的连接工具，放这里跟 Tor 对照着读。

- [什么是 Tor](./what-is-tor.md)：Tor 如何使用、跟 VPN 差在哪、什么时候不该用。
- [Tor Browser 进阶设定](./tor-browser-advanced.md)：桥接、安全等级、Onion 站点与身分隔离。
- [Tor Snowflake](./tor-snowflake.md)：开浏览器分页，帮受审查地区的使用者连上 Tor，门槛最低的网络自由贡献方式。
- [OnionShare](./onionshare.md)：透过 Tor 起临时 onion service，匿名传档、收档、架站、聊天。
- [VPN 的风险与选择](./vpn-guide.md)：VPN 的具体风险、怎么挑值得信任的服务、各地能不能用，以及什么时候该改用 Tor。

## 环境层：匿名作业系统

要把整个作业系统一起切开的高敏感任务（采访、处理外来文件、行动现场），从这群开始。

- [什么是 Tails](./what-is-tails.md)：从 USB 启动、预设走 Tor、关机后不留痕迹的可携式系统。
- [Tails、Whonix、Qubes 的差别](./tails-vs-whonix-vs-qubes.md)：三套常见匿名作业系统的取舍，依角色推荐适合的选择。
- [GrapheneOS：高度隐私的行动作业系统](./grapheneos.md)：把 Android 安全强化并去 Google 化的手机系统，以及 Google 收紧 AOSP 后它面临的处境。

## 观测层：网络审查的可验证记录

想把「连不上」、「跑很慢」变成可引用的公开资料，或想做封锁测量活动的人，从这群开始。

- [什么是 OONI](./what-is-ooni.md)：把网络干预变成有时间、地点、ASN 对得上的观测记录。
- [OONI Run v2 操作说明](./ooni-run-v2.md)：建立动态检测名单，协助观察特定网站是否被审查或封锁。
- [onionoo MCP：用中文查 Tor 中继节点现况](../community/onionoo-mcp.md)：社区自架的查询服务，不用写代码，在 claude.ai 接上后盘点某国有多少 Tor 中继、带宽多大、落在哪些电信网络。

## 日常隐私基本功

想从通讯、协作、账号、金流先补齐基础的人，从这群开始。五篇主题各自独立，不必照顺序。

- [匿名通讯工具比较](./messaging-comparison.md)：Signal、SimpleX、Session、Briar、Matrix 的端对端加密、Metadata 与身分模型差异。
- [什么是 CryptPad](./what-is-cryptpad.md)：服务器读不到内容的在线协作办公套件，文档在浏览器端就完成加密，社区自建站点内建简体与正体中文界面。
- [密码管理器入门](./password-manager.md)：Bitwarden、KeePassXC、1Password、Apple Passwords 的取舍，加上 TOTP、Passkey、硬件金钥。
- [Asian Diceware 密语字典](./asian-diceware.md)：社群参考 EFF 做的 7776 字密语词表，混入亚洲外来语，教你怎么用骰子或安全随机数产生好记又够强的密语。
- [加密货币的隐私光谱](./crypto-privacy-spectrum.md)：BTC、Monero、Zcash、稳定币的隐私差异与自管钱包、multisig。
