---
date: 2025-09-21
authors:
    - anoni-net
categories:
    - 文章
    - Tor
    - 翻译文章
slug: tor-sambent-onionmasq
image: "assets/images/tor.webp"
summary: "OnionMasq 透过内核级别网络隔离，确保所有应用程序流量都经由 Tor 路由的实验性技术，提供比传统方法更强的隐私与安全性"
description: "OnionMasq 透过内核级别网络隔离，确保所有应用程序流量都经由 Tor 路由的实验性技术，提供比传统方法更强的隐私与安全性"
---

# OnionMasq：Tor 为 VPN 式流量隔离实验修正

_OnionMasq 透过将应用程序置于内核隔离的沙箱中，只存在经由 Tor 路由的网络接口，创造出类似 VPN 的行为，从而消除困扰代理解决方案的绕过漏洞。_

!!! info ""

    以下内容原文翻译来自以下文章：

    - [OnionMasq: Tor's Experimental Fix for VPN-Style Traffic Isolation, Sam Bent, 2025-09-19](https://www.sambent.com/onionmasq-tors-experimental-fix-for-vpn-style-traffic-isolation/){target="_blank"}

![Tor OnionMasq: Hiding in Plain Sight / Tor OnionMasq：隐身于无形之中](https://www.sambent.com/content/images/size/w2000/2025/09/onion-masq-1.jpg){style="border-radius: 10px;"}

[OnionMasq](https://gitlab.torproject.org/tpo/core/onionmasq){target="_blank"} 是 Tor 项目试图解决一个基本问题：让您的应用程序的每个数据封包都无例外地通过 Tor。它是一个实验性隧道接口，针对 [Arti](https://blog.torproject.org/arti_1_4_0_released/){target="_blank"}（以 Rust 实作的 Tor），透过内核级别的网络隔离来创造类似 VPN 的行为。

这项技术透过建立一个只存在于沙箱内的虚拟网络卡来实现。您的应用程序会将这个假网络接口视为正常使用，而 OnionMasq 拦截所有内容并将其经由 Tor 的加密路由。

<!-- more -->

## OnionMasq 解决的问题

传统的 Tor 路由工具仰赖于代理拦截。已有 15 年历史的 [Torsocks](https://gitlab.torproject.org/tpo/core/torsocks){target="_blank"} 使用 `LD_PRELOAD` 技术来拦截网络功能调用，并将它们重新导向至 Tor 的 SOCKS 代理。这种方法在以下三方面会失败：

* **静态二进制完全忽略库接口层的拦截：**如果您的应用程序在编译时就内置了网络程序代码，而不是使用系统库，torsocks 就无法拦截任何东西。
* **原始系统调用绕过用户命名空间技术**：应用程序可以直接进行内核的调用，完全跳过库函数。
* **配置错误会立即发生泄漏**：一个错误的代理设定会让您的流量在明文状态下传输。

OnionMasq 将透过移至 Linux 内核本身来消除这些失败模式。

## 内核层级的运作方式

Linux **命名空间** 是限制进程可见与可访问对象的隔离容器。网络环境的命名空间在 2000 年左右引入，创建了独立的网络环境，让进程只能使用特定的接口。

实作 OnionMasq 的命令列工具 [Oniux](https://blog.torproject.org/introducing-oniux-tor-isolation-using-linux-namespaces/){target="_blank"} 遵循以下步骤：

* **建立隔离环境**：Oniux 使用 `clone(2)` 系统调用将您的应用程序放在网络、挂载、PID 和用户命名空间中，应用程序在一个封闭的容器中运行。
* **移除对真实网络的访问**：在命名空间内，您的应用程序看不到 `eth0`、`wlan0` 或任何实体网络接口，正常的互联网并不存在。
* **安装虚拟网络卡**：OnionMasq 建立一个名为 `onion0` 的 **TUN 网络接口装置**，对应用程序来说，它是一个看似真实却由用户命名空间软件控制的假网络接口。
* **将所有流量路由通过 Tor**：TUN 网络接口装置将所有网络数据封包传送至 OnionMasq，后者使用 [smoltcp](https://github.com/smoltcp-rs/smoltcp){target="_blank"}（用 Rust 编写的用户命名空间网络堆叠）来重组数据流量并交给 Arti 引导至 Tor 路由。

## TUN 网络接口装置说明

一个 **TUN 网络接口装置** 是在内核和用户命名空间应用程序之间建立管道的虚拟网络接口。当您的应用程序将 IP 数据封包发送至 TUN 接口时，内核会将其交给管理该接口的程序，而不是将其放到系统的网络接口上。

OnionMasq 管理 `onion0` TUN 接口。应用程序发送的每个数据封包都被拦截，经过 Tor 的路由处理，返回时就如同来自正常的互联网连接一样，应用程序完全感受不到差异。

这与一般的 VPN 根本不同，因为 VPN 通常会来自整个系统的路由流量。OnionMasq 则是为每个应用程序建立隔离，每个程序都有自己密闭的网络环境。

## 实际使用

安装和使用 Oniux 需要 Rust，只在 Linux 上运行：

```bash linenums="1"
cargo install --git https://gitlab.torproject.org/tpo/core/oniux oniux@0.4.0
```

基本用法包括包装任何指令：

```bash linenums="1"
# 透过 Tor 路由单个指令
oniux curl https://icanhazip.com
# 获取您的 Tor 出口 IP
oniux curl https://ip.me/
# 访问洋葱服务
oniux curl http://duckduckgogg42ts72.onion
# 隔离整个 shell 会话
oniux bash
```

沙箱机制非常广泛。即使您运行恶意软件，企图通过原始系统调用或直接网络访问来绕过 Tor，内核也会阻止它看到除了 `onion0` 接口以外的任何东西。

## DNS 配置细节

在 Tor 环境中，DNS 解析需要特别处理。Oniux 在命名空间内建立了一个自定义的 `/etc/resolv.conf`，指向与 Tor 兼容的名称解析，防止 DNS 查询通过您的正常解析器泄漏。

技术实作使用 `rtnetlink(7)` 操作来配置虚拟接口，分配 IP 地址和设定路由表。OnionMasq 随后使用 Unix 域通讯端（Unix domain socket）在程序之间传递 TUN 接口文件描述符。

在底层，OnionMasq 通过建立的接口与 Arti 进行通讯。Arti 构建 Tor 连线、加密流量并处理匿名路由。OnionMasq 只是提供隧道管道，让这些流程建立对应用程序来说是无须关注的。

## 限制与开发状况

OnionMasq 的**实验性**状态是有原因的。Tor 项目明确表示，这不是一个已准备好可正式使用的软件。[当前限制](./oniux-kernel-level-tor.md){target="_blank"}包括：

* **平台支援有限**：仅适用于 Linux，没有计划支持 Windows 或 macOS。
* **新代码库风险**：虽然 torsocks 已经过 15 年的实战考验，但 OnionMasq 构建在最近的 Rust 元件上，尚未经过真实世界同等级的压力测试。
* **潜在的效能开销**：为每一个应用程序建立隔离命名空间可能消耗比基于代理的方法更多的系统资源。
* **功能集不完整**：与已建立的工具相比，进阶 Tor 功能和极端案例可能无法正常运作。

Tor 项目请求社群测试和臭虫报告，以加速开发达到正式使用的准备。

## OnionMasq 与 Torsocks 的技术比较

![OnionMasq 与 Torsocks 的技术比较](https://www.sambent.com/content/images/2025/09/onion-masq.jpg){style="border-radius: 10px;"}

### 未来发展与规划

Tor 的设计工作包括将 OnionMasq 的功能扩展到目前只支持 TCP 的状态。[提案 348](https://spec.torproject.org/proposals/348-udp-app-support.html){target="_blank"} 描绘了对 UDP 支持的计划，而[提案 352](https://spec.torproject.org/proposals/352-complex-dns-for-vpn.html){target="_blank"} 则针对包含 HTTPS/SVCB 等现代记录类型的复杂 DNS 情境，对 HTTP/3 和 QUIC 协议至关重要。

这些增强功能针对 "VPN 式" 使用模式，用户期望能够全面支持至应用程序的使用，而不仅仅只是网页浏览。

### 操作安全影响

OnionMasq 在以下攻击向量提供了更强的保护：

* **应用程序层级的规避尝试**：失败，因为不论应用程序行为如何，内核都会阻止访问非 Tor 网络。
* **DNS 泄漏防护**：透过命名空间隔离的解析来实现，而不仅依赖于适当的应用程序设定。
* **进程隔离**：意味着即使一个应用程序被攻破，它也无法干扰其他应用程序的 Tor 路由。

不过，实验性状态本身也带来操作风险。需要高可靠性的正式环境应该继续使用 torsocks，直到 OnionMasq 达到稳定状态。

## 总结

OnionMasq 代表了 Tor 使用端技术从应用程序层级 Tor 整合转向内核强制网络隔离的根本转变。这种方法消除了困扰以往解决方案的整个类别的流量泄漏问题。

这个技术透过建立具有看似正常但将所有内容通过 Tor 路由的虚拟接口的每一应用程序网络沙箱来运作。Linux 内核命名空间提供了隔离，而 OnionMasq 则处理虚拟网络与 Tor 路由之间的隧道接驳。

早期测试显示这个概念是可靠的，但达正式环境就绪仍需数月或数年。目前，OnionMasq 作为 Tor 使用端技术发展方向的预览：趋向于更强、内核级别的流量隔离，让其更难以绕过或配置错误。
