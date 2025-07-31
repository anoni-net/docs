---
date: 2025-07-31
authors:
    - toomore
categories:
    - 更新
    - Tails
slug: tails-6-18-webtunnel
image: "assets/images/tails.png"
summary: "Tails 支援 WebTunnel 橋接類型，幫助更多無法直接連入 Tor 洋蔥路由，透過此方式連入"
description: "Tails 支援 WebTunnel 橋接類型，幫助更多無法直接連入 Tor 洋蔥路由，透過此方式連入"
---

# Tails 6.18 支持 WebTunnel 桥接协议

!!! info ""

    以下内容翻译自文章，主语角色为 Tor/Tails：

    - [New Release: Tails 6.18 , Tor Blog 2025-07-25](https://blog.torproject.org/new-release-tails-6_18/){target="_blank"}

![Tails](./assets/images/tails.png){style="border-radius: 10px;"}

## 新功能

### WebTunnel 桥接方式

你现在可以使用 **WebTunnel 桥接**从 Tails 连接到 Tor 网络。

[WebTunnel](https://blog.torproject.org/introducing-webtunnel-evading-censorship-by-hiding-in-plain-sight/){target="_blank"} 是一种桥接技术，特别擅长绕过审查，在 obfs4 桥接器被封锁的地方能有效运作。WebTunnel 将你的连接伪装成普通的网页流量。

获取 WebTunnel 桥接节点，请参考 [https://bridges.torproject.org/](https://bridges.torproject.org/){target="_blank"}。

![Tails 6.18 Tor 链接设置界面](https://tails.net/news/version_6.18/webtunnel.png){style="border-radius: 10px;"}

!!! note "翻译说明"

    我们目前还没有针对“**Bridge 桥接类型**”做专门介绍，桥接节点主要是协助无法直接连接到 Tor 的洋葱路由中，通过桥接节点接入。目前有一种最快的方式建立桥接点，是通过伪装成**在线视频**的连接方式来进行转接，仅使用**浏览器**就可以帮助建立。详细信息或试用可以参考「[Tor Snowflake 桥接点建立（网页版）](../../tor-snowflake.md){target="_blank"}」。

## 其他更新

- Tor 浏览器更新到 [14.5.5](https://blog.torproject.org/new-release-tor-browser-1455){target="_blank"} 版本。
- Thunderbird 邮件软件更新到 [128.12.0](https://www.thunderbird.net/en-US/thunderbird/128.12.0esr/releasenotes/){target="_blank"} 版本。

更多更新信息可以参考[更新日志](https://gitlab.tails.boum.org/tails/tails/-/blob/master/debian/changelog){target="_blank"}。
