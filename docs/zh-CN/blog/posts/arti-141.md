---
date: 2025-03-16
authors:
    - toomore
categories:
    - 更新
    - Tor
    - 翻译文章
slug: arti_1_4_1_released
image: "assets/images/tor.webp"
summary: "Arti 是 Tor Project 正在进行的项目，使用 Rust 开发新一代的 Tor 用户端"
description: "Arti 是 Tor Project 正在进行的项目，使用 Rust 开发新一代的 Tor 用户端"
---

# Arti 1.4.1 更新发布

!!! info ""

    以下内容原文翻译自以下文章，主词角色为 Tor Project：

    - [Arti 1.4.1 is released: Family improvements, groundwork for Conflux, by nickm | March 3, 2025](https://blog.torproject.org/arti_1_4_1_released/){target="_blank"}
    - [Arti 1.4.0 is released: onion services, RPC, relay development, and more, by Diziet | February 7, 2025 ](https://blog.torproject.org/arti_1_4_0_released/){target="_blank"}

![Tor](./assets/images/tor.webp)

Arti 是我们正在进行的项目，用于使用 Rust 开发新一代的 Tor 用户端。我们现在宣布最新版本 Arti 1.4.1 的发布。

此版本新增了用户端对 [Family IDs](https://spec.torproject.org/proposals/321-happy-families.html){target="_blank"}（也称为「Happy Families」）的实现功能，当此功能被全面采用时，将可节省中继节点管理员的时间与带宽。此外，此版本也开始为全面实现 [Conflux](https://spec.torproject.org/proposals/329-traffic-splitting.html){target="_blank"} 打好基础，通过多路径传输流量来提升性能。

若想了解我们完成的所有细节，以及许多较小且不那么显眼的更动信息，请参阅 [CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md#arti-141--3-march-2025){target="_blank"}。感谢所有对此版本做出贡献的人，包括 kpcyrd 和 Neel Chauhan。

同时，也特别感谢我们的各位[赞助者](https://www.torproject.org/about/sponsors/){target="_blank"}对 Arti 开发的支持与资助！

<!-- more -->

## 补充 1.4.0 更新

此版本提供了一个全新的 [RPC 接口](https://gitlab.torproject.org/tpo/core/arti/-/tree/main/doc/dev/rpc-book/src){target="_blank"}，是 Arti 取代 C Tor [控制端口](https://spec.torproject.org/control-spec/index.html){target="_blank"}的替代方案，并带来了许多改进。此外，还进行了大量关于支持中继节点的准备工作、错误修复，以及针对服务端洋葱服务的抗拒绝服务攻击的相关开发。

若想了解我们完成的所有细节，以及许多较小且不那么显眼的更动信息，请参阅 [CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md#arti-140--7-february-2025){target="_blank"}。

随着此版本的发布，我们很高兴地宣布 [Arti 的官方网站](https://arti.torproject.org/){target="_blank"}已进行了全面的大改版。这个网站将用来提供关于 Arti 项目的一般信息，例如示例代码、文档等。感谢 DocumentWrite 的伙伴们协助我们完成新网站的设计与实现！

### 缅怀与致谢

Arti 1.4.0 的发布献给 Jérémy Bobbio (1982-2024) 的纪念，他在我们的社区中被称为 Lunar。Lunar 是一位 Tor 的志愿者、自由软件开发者以及社区组织者。

在 Tor 社区内，Lunar 因带领 Tor 旧版《每周新闻》电子报的努力，以及他对组织和组织周边人的深切关怀而被记住。

在 Tor 社区外，Lunar 参与了许多成功的自由软件项目，例如 Debian 项目。他也致力于建构 Reproducible Builds（可重现构建）项目的基础设施与工具化，这项项目至今持续造福整体生态系。

Lunar 的离去对我们的社区以及他所参与的众多其他社区都带来了深刻的怀念与不舍。

另请参阅其他项目对 Lunar 的纪念与赞誉：

- [The Debian Project](https://www.debian.org/News/2024/20241119){target="_blank"}
- [lunar.anargeek.net](https://lunar.anargeek.net/){target="_blank"}
- [Linux Weekly News](https://lwn.net/Articles/997775/){target="_blank"}
- [The Reproducible Builds Project](https://reproducible-builds.org/news/2024/11/14/reproducible-builds-mourns-the-passing-of-lunar/){target="_blank"}

### 全新 RPC 接口

随着此版本的发布，Arti 的 [RPC 接口](https://gitlab.torproject.org/tpo/core/arti/-/tree/main/doc/dev/rpc-book/src){target="_blank"}现已可供使用。

Arti 的 RPC 接口取代了 C Tor 的[控制端口（control port）](https://spec.torproject.org/control-spec/index.html){target="_blank"}，并带来以下多项改进：

- 协议基于 JSON，减少了开发人员对自定义解析器（parser）和编码器（encoder）的需求。
- 协议采用以能力（capabilities）为基础的设计，以避免应用程序彼此之间无意间影响对 Arti 的使用。
- 协议更明确地支持扩展，并清楚规范了用户端与 Arti 如何处理非预期的信息、参数与数据。
- 提供一个[发现机制](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/doc/dev/rpc-book/src/rpc-connect-spec.md){target="_blank"}，让应用程序更容易找到并配置 RPC 端口的使用。
- 协议支持在单一连接上处理多个同时进行的请求。
- 我们提供了一个默认的用户端函数库，并附有 [C](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/crates/arti-rpc-client-core/arti-rpc-client-core.h?ref_type=heads){target="_blank"} 和 [Python](https://gitlab.torproject.org/tpo/core/arti/-/tree/main/python/arti_rpc?ref_type=heads){target="_blank"} 包装器，以免应用程序开发人员需要自行实现相关逻辑。

目前所支持的功能有限：应用程序可以使用 RPC API 来连接至 Arti，检查启动过程，并开启数据流（data streams）。未来的版本将依照开发人员的需求增加更多功能。我们已经收到来自 [Tails](https://forum.torproject.org/t/defining-an-interface-to-arti/6432/7){target="_blank"} 和 [Tor Browser](https://gitlab.torproject.org/tpo/core/arti/-/issues/1303){target="_blank"} 的愿望清单。

我们希望开发人员可以尝试使用此 API 和客户端函数库，并反馈意见，以协助我们确定接下来的开发重点。

这标志着一个重要的里程碑，使开发人员能更轻松地将 Arti 整合到他们的应用程序与服务中，而无需直接嵌入 Arti 的 Rust 函数库。我们希望这将为外部开发人员带来更多的发展机会，并让越来越多重视隐私的用户享受到 Tor 提供的强大线上保护。

我们预期不会在 RPC API 或客户端函数库中进行重大更动，但会在获得更多开发者的实际经验后，才正式宣布其稳定性。

感谢所有对此版本做出贡献的人，包括 Dimitris Apostolou、hhamud、Neel Chauhan 和 tidely。

同时，一如既往地感谢 [Zcash Community Grants](https://zcashcommunitygrants.org/){target="_blank"}、[Bureau of Democracy](https://www.state.gov/bureaus-offices/under-secretary-for-civilian-security-democracy-and-human-rights/bureau-of-democracy-human-rights-and-labor/){target="_blank"}、[Human Rights and Labor](https://www.state.gov/bureaus-offices/under-secretary-for-civilian-security-democracy-and-human-rights/bureau-of-democracy-human-rights-and-labor/){target="_blank"}，以及其他赞助者对 Arti 开发的支持与资助！
