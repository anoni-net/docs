---
title: 什么是 Tor？
description: Tor（The Onion Router）是一个开源的匿名通信网络，旨在保护用户的隐私和自由。Tor 通过多层加密和路由技术使用户的网络活动匿名化，从而防止网络监控和流量分析。
icon: material/chat-question

---

# 什么是 Tor？

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/tor_diagram.original.webp">
        <img src="../assets/images/tor_diagram.original.webp"
            alt="Tor Relay 运作流程"
            title="Tor Relay 运作流程"
        >
    </a>
    <caption>Tor Relay 运作流程</caption>
</figure>

[Tor（The Onion Router）](https://www.torproject.org/){target="_blank"}是一个开源的匿名通信网络，旨在保护用户的隐私和自由。Tor通过多层加密和路由技术使用户的网络活动匿名化，从而防止网络监控和流量分析。

- **多层加密（Onion Routing）：**每次用户发送请求时，Tor客户端会选择一条随机路径，通过多个中继节点（relays）传输数据。数据包在每个节点都进行一次加密和解密，就像剥洋葱一样，直到到达目标位置。每个节点只知道前一个和下一个节点，这样可以防止任何单一节点知道完整的数据传输路径。
- **匿名性：**用户的IP地址和网络活动被隐藏，从而提高了匿名性。Tor网络使得追踪用户的网络行为变得非常困难。
- **隐私保护：**Tor保护用户免受ISP（网络服务提供商）、政府和其他监控机构的监控。它还可以帮助用户规避网络审查和访问被限制的网站。
- **暗网（Dark Web）：**Tor支持访问 .onion 域名，这些域名只在Tor网络内部可被连接，提供了额外的匿名层级。暗网上有一些合法用途，如保护言论自由和隐私，但也存在非法活动。
- **使用方式：**用户可以下载并安装Tor浏览器，这是一个基于Firefox修改的浏览器，默认设置为Tor网络。许多用户使用Tor浏览器来匿名浏览网络，保护个人隐私。

## 中继节点、桥接节点

### 什么是中继节点（Relay）？

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/tor_relays.svg">
        <img src="../assets/images/tor_relays.svg"
            alt="Tor Relay 类型"
            title="Tor Relay 类型"
        >
    </a>
    <caption>Tor Relay 类型</caption>
</figure>

在 Tor 网络中，中继点（Relay）是由志愿者运行的服务器，用于转发用户的流量，以实现匿名网络通讯。这些中继点是 Tor 网络的核心组成部分，它们共同工作以隐藏用户的 IP 地址和网络活动。中继点可以分为三种类型：入口节点（Guard Relay）、中间节点（Middle Relay）和出口节点（Exit Relay）。每种类型的中继点在 Tor 网络中扮演不同的角色：

- **入口节点（Guard Relay）：** 入口节点是用户连接到 Tor 网络的第一个节点。它知道用户的真实 IP 地址，但不知道用户的最终目标。通常，Tor 客户端会选择一组信任的入口节点，并在一段时间内重复使用，以减少攻击面。

- **中间节点（Middle Relay）：** 中间节点处于入口节点和出口节点之间，用于转发流量。它只知道前一个节点和下一个节点，无法知道用户的真实 IP 地址或最终目标。这种设计确保即使中间节点被攻击或监控，攻击者也无法追踪整个网络传递信息的路径。

- **出口节点（Exit Relay）：** 出口节点是用户流量离开 Tor 网络并进入公开网络的最后一个节点。它知道用户的最终目标，但不知道用户的真实 IP 地址。出口节点服务器的志愿者需要承担一定的风险，因为从它们流出的流量可能包含敏感或非法内容。

### 什么是桥接节点（Bridge）？

除了中继点（Relay），Tor 网络中还有一种重要的节点叫做桥接节点（Bridge）。Bridge 是专门设计用来绕过网络审查或阻止 Tor 使用的节点。它们在 Tor 网络中扮演特殊角色，主要目的是帮助那些生活在限制严格的国家或地区的人们使用 Tor 网络。以下是有关 Bridge 的一些关键点：

- **隐藏性：** 与普通的中继点不同，Bridge 的 IP 地址不会被公开列在 Tor 网络的公共索引中。这使得审查机构难以识别和封锁它们，因为这些机构通常会根据公开的中继点列表来进行封锁。
- **绕过审查：** 在某些国家和地区，政府或 ISP 会阻挡对 Tor 网络的访问，这时候用户可以使用 Bridge 来绕过这些封锁。Bridge 是一个隐秘入口，帮助用户建立初始连接，之后他们的流量会被转发到普通的 Tor 中继点。
- **分发方式：** 由于 Bridge 的 IP 地址是非公开的，用户需要通过特定的方式来获取这些地址。用户可以通过 Tor 官网、发送电子邮件或使用其他渠道（如桥接分发工具）来获取 Bridge 地址。

**Pluggable Transports：**

- 为了进一步躲避审查，Bridge 经常使用 Pluggable Transports，这些协议可以改变 Tor 流量的特征，使其看起来像普通的 HTTPS 流量或其他类型的流量。这些技术包括 Obfs4、meek、[Snowflake](https://snowflake.torproject.org/zh-CN/) 等，它们可以混淆 Tor 流量，使得检测和封锁变得更加困难。

## 如何参与 Relay 建立

如何建立 Tor Relay 提供 Tor 网络节点与带宽，可以参考「[如何搭建 Tor Relay](./setup-tor-relay.md)」。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 网络自由为什么重要？](./internet-freedom-matter.md)
- [:material-chat-question: 如何搭建 Tor Relay](./setup-tor-relay.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-access-point-network: ASNs 自治网络观测数据分析](./ooni-asns-coverage.md)
- [:material-list-status: OONI 网站检测列表](./ooni-weblists.md)
- [:material-translate-variant: 中文化与文件翻译](./ooni-i18n.md)

</div>
