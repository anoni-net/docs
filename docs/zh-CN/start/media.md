---
title: 新闻媒体
description: 给媒体组织的起步路径。从建立公开的安全收件渠道开始，接到素材的保存与清理、查证时不烧掉来源，以及台湾、香港、中国大陆三地的法规脉络。
icon: material/newspaper-variant-outline
---

# :material-newspaper-variant-outline: 新闻媒体从这里开始

适用有编辑台、法务与 IT 的媒体组织。组织能做到的事跟个人不同，收件渠道、素材保存、刊出后的记录清理都需要跨部门对齐，一个记者自己改工具解决不了。

想找个人层级的做法，看[独立记者的起步路径](./independent-journalist.md)。下面每一条连结都指向站上既有的文章。

## 你大概正在处理的三件事

### 官网有联络邮箱，却没有一条来源敢用的通道

一般邮箱会在寄件端与收件端各留一份记录，寄信的人也无从判断风险。愿意提供内部文件的人多半清楚这一点，所以他们选择不寄。

看[公开的安全收件管道](../scenarios/journalist.md#公开的安全收件管道)，里面说明一条可公开的渠道需要哪些条件。

### 素材散在记者的个人设备与各种云端

采访录音、拍到的文件、通讯记录，分别落在个人手机、私人云盘与公司邮箱。真的收到调取要求时，编辑台通常答不出来哪些东西还留着、留在谁手上。

看[媒体侧的记录](../scenarios/journalist.md#媒体侧的记录)，处理的正是组织这一层。

### 收到疑似内部文件，需要在不烧掉来源的前提下查证

查证动作本身会留下痕迹。向第三方求证的问法、报导写出来的细节，都可能把范围缩小到只剩几个人。

看[报导细节的来源指纹](../scenarios/journalist.md#报导细节的来源指纹)。

## 二十分钟：先读这三段

1. [公开的安全收件管道](../scenarios/journalist.md#公开的安全收件管道)：对外要先有一条渠道，其余都建立在上面
2. [威胁模型清单](../utils/threat-model.md)：三题答完会产出一份摘要，适合带进编辑台会议讨论。填的内容留在浏览器分页里，不会存到任何地方
3. [媒体侧的记录](../scenarios/journalist.md#媒体侧的记录)：组织保存了什么、保存多久，决定被调取时交得出什么

## 一周：把制度补起来

### 建立收件渠道

- [OnionShare](../tools/onionshare.md)：来源不需要注册账号就能传文件给你
- [上传机敏信息流程](../community/upload-sensitive.md)：收件端该怎么准备，含 PGP 公钥的做法
- [匿名通讯工具比较](../tools/messaging-comparison.md)：后续联络走哪一套

### 素材的保存与清理

- [Metadata 是什么，为什么重要](../basics/metadata.md)：文件本身以外还带了什么
- [文件 metadata 清除器](../utils/strip-metadata.md)：发布前在浏览器里清干净，文件不会送出去
- [加密储存](../scenarios/journalist.md#加密储存)：素材留在哪里、谁有钥匙

### 查证与刊出

- [隐形字符检测](../utils/invisible.md)：有一节专门说明记者查证时怎么避免烧掉来源，文件里的隐形标记是常见的追人手法
- [报导细节的来源指纹](../scenarios/journalist.md#报导细节的来源指纹)：哪些细节写出去就缩小了范围
- [报导刊出后的整理](../scenarios/journalist.md#报导刊出后的整理)：记者端、来源端、媒体端各自要做的事

### 三地的法规脉络

- [法规与通讯记录](../scenarios/journalist.md#法规与通讯记录)：台湾调取的门槛与实务
- [香港的脉络](../scenarios/journalist.md#香港的脉络)：2020 年《国安法》之后的差异
- [中国大陆的脉络](../scenarios/journalist.md#中国大陆的脉络)：风险最重的一端在境内协作者身上
- [揭弊者保护法的技术观察](../taiwan/whistleblower-law.md)：台湾的内部员工愿意说话时，法律保护到哪里

## 带得走的东西

- 威胁模型清单答完按「复制摘要」，贴进编辑台的共笔，换人接手时不用重问一次
- [隐形字符检测](../utils/invisible.md)与[文件 metadata 清除器](../utils/strip-metadata.md)都在浏览器里执行，不送出任何数据，可以直接推荐给整个编辑台
- 有问题到 [Matrix 公开 room](../community/tools.md) 问，需要传敏感文件寄 [whisper@anoni.net](mailto:whisper@anoni.net)

## 这条路径没有处理的

- **记者个人的设备与账号分层**：见[独立记者的起步路径](./independent-journalist.md)，那一页写的是个人能自己完成的部分
- **出国采访与研讨会**：见[出差与研讨会的数字准备](../scenarios/asia-travel.md)
- **已经发生的安全事件**：先看[紧急求救](../help/index.md)
