---
title: 开源科技开发者
description: 给开源社群开发者的参与路径。依照你手上有的资源分成四条线，架设节点、观测数据分析、文档与翻译、校园研究，各自列出可以认领的工作。
icon: material/console
---

# :material-console: 开发者从这里开始

其他身分的入口页说明怎么保护自己，这一页说明你的技能能接到哪里。匿名网络的多数基础设施由志愿者维运，中继节点、桥接、观测数据、镜像站，每一项都缺人。

先看你手上有什么，再决定走哪一条线。四条线互相独立，挑一条开始就好。

## 二十分钟：先确认方向

1. [2026 年度路线图](../community/roadmap-2026.md)：社群今年投入的三个主题与各自的进度，先看有没有你想接的
2. [如何参与与认领主题](../community/how-to-contribute.md)：怎么选题、怎么在 Matrix 表达意愿、平时的参与方式
3. [自我技能评估表](../community/skill-level.md)：Tor、Tails、OONI 三个工具的分级自评，每一级下面都列了补齐用的文章

## 四条可以认领的线

### 有一台长期开机的机器与稳定带宽

最直接的贡献。从中继节点开始，带宽不足或 IP 会变动的话改做桥接。

- [如何搭建 Tor Relay](../community/setup-tor-relay.md)：中继节点的完整设置
- [如何搭建 Tor WebTunnel 桥接](../community/setup-tor-webtunnel.md)：桥接对带宽的要求低很多，在审查环境下的价值也更高
- [Tor Snowflake](../tools/tor-snowflake.md)：门槛最低的一种，开着那一页就在帮忙，要常驻再装扩展
- [如何搭建 .onion 服务](../community/setup-onion-service.md)：把手上的服务多开一个 onion 入口
- [帮忙 pin 文件站的 IPFS 镜像](../community/pin-ipfs-mirror.md)：目前是单点，多一个 pin 就多一份备援
- [Tor Relays 观测点](../taiwan/tor-relay-watcher.md)：先看台湾现在有多少节点、分布在哪些 ASN

### 会写程序，会处理数据

观测数据这条线缺的是能把原始测量读懂、写成分析的人。

- [OONI 测量数据结构导览](../community/ooni-data-format.md)：原始测量的字段长什么样
- [OONI 怎么判定一个网站被封锁](../community/ooni-blocking-determination.md)：判定逻辑先弄懂才不会误读数据
- [OONI 测项速查表](../community/ooni-nettests-map.md)：各测项测的是什么
- [ASN 观测数据提取与分析](../community/asn-coverage-howto.md)：社群自己那支提取程序怎么设置与使用，含 S3 公开数据集的路径结构
- [ASNs 自治网络观测数据分析](../taiwan/ooni-asn-coverage.md)：台湾目前的涵盖状况，缺口就是题目
- [onionoo MCP](../community/onionoo-mcp.md)：社群自架的 Tor 中继查询服务，也是一个可以延伸的接口
- [OONI 网站检测清单](../taiwan/ooni-checklist.md)：检测清单怎么维护，分类与更新都需要人

### 会写文档，会翻译

简体中文版由志愿者维护，缺口比正体中文版大，这条线的进入门槛最低。

- [贡献者百科](../community/contributor-handbook.md)：写作风格规范的单一来源，动笔前先读
- [中文化与文件翻译](../community/i18n.md)：三语系的翻译流程
- [项目研究预先准备](../community/setup-repo.md)：开始一个新主题之前的准备工作

### 在学校内部有影响力

- [Tor Relay 校园建立研究专题](../community/relay-on-campus.md)：校园中继节点需要的是能跟行政与法务沟通的人，技术反而是简单的部分。这个专题整理了目前的进展与可以接手的部分

## 你自己也需要一份基线

技术能力跟个人的操作习惯是两件事。手上有 root 权限与一堆 API 密钥的人，被盯上的价值比一般用户高。

- [一般人平常该做到什么](../scenarios/everyday-baseline.md)：依实际效果排序的做法，二十分钟读完
- [常被误认为匿名的网络](../advanced/mistaken-for-anonymity.md)：区块链、隐私浏览窗口、VPN 这几项常被高估到什么程度

## 带得走的东西

- [Matrix 公开 room](../community/tools.md)：认领主题前先在这里说一声，避免两个人做同一件事
- [GitHub 的 anoni-net/docs](https://github.com/anoni-net/docs)：文件站的源码与 issue，每个 issue 都写了预期内容
- 社群自架的 CryptPad 与 Etherpad 可以直接用来写提案草稿，见[沟通与协作工具](../community/tools.md)

## 这条路径没有处理的

- **中继节点的法律风险评估**：出口节点与中继节点的差别很大，各地的法律环境也不同，架设前请依所在地的法规评估
- **Tor 本身的协议细节**：站上写到工具层与观测层为止，协议规格请直接看 Tor Project 的文件
