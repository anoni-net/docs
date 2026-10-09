---
title: 关于文档站
description: anoni.net 文档站写什么、怎么写成、三个语言版本的关系、写错了怎么更正，以及内容的授权。社群本身的介绍在 anoni.net。
icon: material/book-information-variant
---

# :material-book-information-variant: 关于文档站

文档站整理匿名网络与隐私的知识，从概念、工具到不同处境的准备，也追踪台湾的网络观测与相关法规。内容由匿名网络社群 anoni.net 的成员撰写与维护，源文件与修改记录都公开在 [GitHub](https://github.com/anoni-net/docs){target="_blank"}。

社群的介绍、参与方式与自架服务在 [anoni.net](https://anoni.net/zh-cn/about/)，这一页只谈文档站本身。

## 内容范围

| 分类 | 内容 |
|---|---|
| [开始](../start/index.md) | 按身份整理的起步路径，从公民团体、媒体到一般读者 |
| [指南](../guides/index.md) | 概念、工具、场景、进阶、报告五个层次，由浅到深 |
| [在地脉络](../taiwan/index.md) | 台湾的连线观测、法规与制度，以及读懂观测数据的方法 |
| [小工具](../utils/index.md) | 在浏览器里运行的工具，数据不会上传 |
| [信息更新](../blog/index.md) | 社群公告、外部文章的翻译与软件更新日志 |
| [架设与运营](../community/setup-tor-relay.md) | 架设 Tor 中继节点、网桥、onion 服务与镜像 |

关注的范围是华语六地区（中国大陆、香港、澳门、新加坡、马来西亚、台湾），以及在各地之间移动的华语使用者。台湾是社群唯一能以第一手经验发言的地方，其他地区依据公开资料与当地联系人的说法撰写，用到二手材料的段落会在页面上标明。

## 写作与审稿

写作风格、文件格式与 PR 流程写在[贡献者百科](../community/contributor-handbook.md)。每一个修改都经过 PR，提交时先由 linter 检查标点与句型，合并前经过维护者审阅。

社群不限制贡献者使用哪一家的 AI 工具协助写作与翻译，AI 的产出跟人工撰写走同一套流程。文章里的数字、引文与来源链接，提交 PR 的人要实际点开核对，并为内容负责。

内容不提供可被滥用的操作配方，引用他人的观测时不揭露个人账号，涉及受害者与未公开研究的资料走[上传敏感信息流程](https://anoni.net/zh-cn/join/upload-sensitive/)。

## 三个语言版本

- **正体中文**是正本，新文章先写正体中文
- **简体中文**从正体中文同步，词汇与政治措辞调整成简体中文读者惯用的说法
- **英文**是另外整理的版本，不逐页对应。英文世界已经有人写得更完整的主题，英文版直接链接过去

翻译的做法与分工见[中文化与文档翻译](../community/i18n.md)。三个语言版本不一定同时上线，简体中文与英文按人力陆续补上。

## 更正

写错的地方直接修改原文，影响读者做法的更正另外写成公告，说明改了什么、依据在哪里，以及照着旧版做过准备的人要补上什么，例如 [2026/08 的更正回顾](../blog/posts/docs-corrections-202608.md)与 [2026/09 的文档站更新回顾](../blog/posts/site-updates-202609.md)。

发现错误或过时的内容，可以到 [GitHub 开 Issue](https://github.com/anoni-net/docs/issues){target="_blank"}，或写信到 <whisper@anoni.net>（PGP 公钥见[联系页](https://anoni.net/zh-cn/contact/#pgp)）。

## 阅读方式

文档站同时发布成标准网站、Tor onion 与 IPFS 镜像三份，内容相同，差别在过程中谁看得到什么，见[你正在用哪一种方式阅读](./how-you-are-reading.md)。标准网站另外可以存进设备，没有网络时照样能读，见[离线阅读](../offline.md)。

## 授权

内容以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans){target="_blank"} 授权，转载或改作时注明出处即可，写法是「anoni.net 文档站，页面网址，CC BY 4.0」。

少数外部资料沿用原始的授权，例如互动作品用到的 OONI 资料是 CC BY-NC-SA 4.0，清单见 repo 根目录的 [`NOTICE`](https://github.com/anoni-net/docs/blob/main/NOTICE){target="_blank"}。程序代码的授权另外标示，Pulse 是 MIT，ASN Coverage 是 GPL-3.0。

## 相关阅读

- [贡献者百科](../community/contributor-handbook.md)
- [中文化与文档翻译](../community/i18n.md)
- [品牌素材](../community/brand-assets.md)
- [社群首页 anoni.net](https://anoni.net/zh-cn/)
