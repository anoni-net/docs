---
date: 2025-05-16
authors:
    - toomore
categories:
    - 技术
    - Tor
    - 翻译文章
slug: oniux-kernel-level-tor
image: "assets/images/oniux-kernel-level-tor.webp"
summary: "oniux：针对任何 Linux 应用程序的内核级别 Tor 隔离技术"
description: "oniux：针对任何 Linux 应用程序的内核级别 Tor 隔离技术"
---

# 介绍 oniux：针对任何 Linux 应用程序的内核级别 Tor 隔离技术

!!! info ""

    以下内容原文翻译来自以下文章，主词角色为 Tor：

    - [Introducing oniux: Kernel-level Tor isolation for any Linux app, cve 2025-05-14](https://blog.torproject.org/introducing-oniux-tor-isolation-using-linux-namespaces/){target="_blank"}

![介绍 oniux：针对任何 Linux 应用程序的内核级别 Tor 隔离技术](https://blog.torproject.org/introducing-oniux-tor-isolation-using-linux-namespaces/lead.webp){style="border-radius: 10px;"}

当启动对隐私极为重要的应用程序和服务时，开发者希望确保每一个数据包都确实通过 Tor 传送。一个错误的代理配置，或一次不小心在 SOCKS 外的系统调用，可能会让你的数据处于风险之中。

正因如此，今天我们很高兴地介绍 oniux：这是一款小型的命令行工具，它利用 Linux 命名空间为第三方应用程序提供 Tor 网络隔离。oniux 构建于 Arti 和 onionmasq 之上，可以将任何 Linux 程序分隔到其专属的网络命名空间中，通过 Tor 路由，并消除数据泄露的可能性。如果你的工作、活动或研究需要坚如磐石的流量隔离，oniux 就能满足这个需求。

<!-- more -->

## 什么是 Linux 命名空间？🐧

命名空间是 Linux 内核中的一项隔离功能，大约在 2000 年左右引入。它们提供了一种安全的方法，将应用程序的特定部分与系统的其余部分隔离。命名空间有多种形式，例如网络命名空间、挂载命名空间、进程命名空间等，每一种都把应用程序的某些系统资源隔离开来。

我们所说的「**系统资源**」指的是什么呢？在 Linux 中，系统资源是由系统上的所有应用程序共享的。最显著的例子可能是你的操作系统时钟，但还有其他许多方面，例如所有进程的列表、文件系统，以及用户列表。

命名空间会将应用程序的某个部分与操作系统的其余部分「容器化」；这也正是 Docker 用来提供其隔离机制的方法。

## Tor + 命名空间 = ❤️

如上所述，命名空间是一项强大的功能，它可以让我们隔离任意应用程序的 Tor 网络访问。我们将每个应用程序放到一个不具系统范围网络接口访问权的网络命名空间（例如 `eth0`），而是提供一个自定义的网络接口 `onion0`。

这样我们就能够在软件层面上以最安全的方式通过 Tor 隔离任意应用程序，这主要是依赖于操作系统内核提供的安全基础。不同于 SOCKS，在这种方式下，应用程序不会因为开发者的一时错误，导致未通过配置的 SOCKS 来建立某些连接而意外泄露数据。

## oniux vs. torsocks

你可能也听说过一个具有类似目标的工具，称为 `torsocks`，其运作方式是通过覆盖所有与网络相关的 libc 函数，将流量导向由 Tor 提供的 SOCKS 代理。虽然这种方法在跨平台上稍具优势，但其显著的缺点是，如果应用程序以非动态链接的 libc 方式进行系统调用，无论是恶意或者无意，将会导致数据泄露。这尤其将纯静态二进制文件和 Zig 生态系统中的应用程序排除在外。

以下是 _oniux_ 与 _torsocks_ 的基本比较：

| oniux                | torsocks                                           |
| -------------------- | -------------------------------------------------- |
| 独立应用程序         | 需要运行 Tor 常驻程序                              |
| 使用 Linux 命名空间  | 使用 ld.so 预载入技术                              |
| 适用于所有应用程序   | 仅适用于通过 libc 进行系统调用的应用程序           |
| 恶意应用程序无法泄漏 | 恶意应用程序可以通过直接的汇编语言系统调用泄漏数据 |
| 仅限 Linux           | 跨平台                                             |
| 新项目且属于实验性质 | 经过超过 15 年的实施验证                           |
| 使用 Arti 作为其引擎 | 使用 CTor 作为其引擎                               |
| 以 Rust 实现         | 以 C 实现                                          |

## 如何使用 oniux？🧅

首先，你需要一个已安装 Rust 的 Linux 系统。之后，你可以通过以下指令来安装 oniux：

```bash
$ cargo install --git https://gitlab.torproject.org/tpo/core/oniux oniux@0.4.0
```

完成后，你就可以开始使用 oniux 了！🙂

使用 oniux 非常简单：

```bash
# 使用 oniux 进行简单的 HTTPS 查询！
$ oniux curl https://icanhazip.com
<A TOR EXIT NODE IP ADDRESS>

# oniux 当然也支持 IPv6！
$ oniux curl -6 https://ipv6.icanhazip.com
<A TOR EXIT NODE IPv6 ADDRESS>

# 没有洋葱服务的 Tor 就像一辆没有引擎的车……
$ oniux curl http://2gzyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid.onion/index.html

# 如果你是技术控，也可以启用日志记录功能。🤓
$ RUST_LOG=debug oniux curl https://icanhazip.com

# 如果你愿意，你可以「Tor 化」整个 shell，将所有进程隔离在其中！
$ oniux bash

# 如果你在桌面环境中，你也可以隔离图形应用程序！
$ oniux hexchat
```

## 这是如何在内部运作的呢？⚙️

_oniux_ 的运作方式是通过 `clone(2)` 系统调用立即产生一个子进程，该进程被隔离在其自己的网络、挂载、PID 和用户命名空间中。然后，此进程会挂载其自己的 `/proc` 副本，接着按照父进程的 UID 和 GID 设置对应的 UID 和 GID 映射。

接着，该进程会建立一个临时文件，包含名称服务器（nameserver）项目，然后将这个文件绑定挂载到 `/etc/resolv.conf` 上，使得在该空间运行的应用程序会使用支持经由 Tor 解析的自定义名称解析器。

然后，子进程利用 onionmasq 建立一个名为 `onion0` 的 TUN 接口，接着通过一些必要的 `rtnetlink(7)` 操作来设置该接口，比如分配 IP 地址。

接下来，子进程会使用 Unix Domain socket 将 TUN 接口的文件描述子（File descriptor）发送给一直在等待此消息的父进程，自从执行最初的 `clone(2)` 后，父进程便在等待这个消息。

完成这些步骤后，子进程会放弃因为身处用户命名空间中的 root 进程而取得的所有特权。

最后，用户提供的指令会通过 Rust 标准库所提供的功能来执行。

## oniux 是实验性质的工具 ⚠️

尽管这一部分不应该让你对使用 _oniux_ 感到却步，但你应该记住，这是一项相对较新的功能，使用了新的 Tor 软件，例如 _Arti_ 和 _onionmasq_。目前，虽然功能如预期运作，但像 _torsocks_ 这类工具已经存在了超过 15 年，因此在实战经验上更为丰富。然而，我们希望 _oniux_ 能够达到类似的稳定状态，因此欢迎你前去尝试看看！

## 致谢

非常感谢 `smoltcp` 的开发者，这是一款用 Rust 实现完整 IP 协议的 Rust crate，我们大量使用它来实现功能。还要感谢 `7ppKb5bW`，他教导我们如何在不使用 `capabilities(7)` 的情况下，正确地使用 `user_namespaces(7)` 来实现功能。

最后但同样重要的是，感谢所有财务上支持 Tor 的人和组织。The Tor Project, Inc. 是一个 501(c)(3) 非营利组织，致力于通过自由软件和开放网络推动人权和保护线上隐私。oniux 的发布由支持者的社区提供动力。请考虑今天[捐款](https://torproject.org/donate/donate-bp2-sc2025){target="_blank"}，继续推进我们使隐私成为可能的工作。
