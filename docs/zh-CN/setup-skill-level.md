---
title: 自我技能评估表
icon: octicons/paste-24
---

# :octicons-paste-24: 自我技能评估表

这里提供一份自我评估的量表，方便快速定位对于 Tor、Tails、OONI 了解的程度。如果不知道从哪里开始学习，可以把评估表当作学习的指引参考。

!!! info "如何使用评估表"

    | 层级 | 你能做到的事 | 适合对象 |
    |------|------------|---------|
    | **了解** | 阅读文件、理解概念 | 任何想了解网络自由议题的人 |
    | **实践** | 动手安装、日常操作工具 | 记者、公民社会工作者、任何需要保护通讯安全的人 |
    | **贡献** | 技术建置、数据分析、社群参与 | 具备基本命令行操作或数据分析能力的开源社群成员 |

## Tor 技能分级

=== ":material-checkbox-marked-circle-outline: 了解"

    **自我评估**（勾选你已能做到的项目）：

    - [ ] 我能够说明 Tor 的运作原理（洋葱路由、三层中继节点）。
    - [ ] 我能够解释网络自由为何重要，以及匿名网络的用途。
    - [ ] 我能够描述自己所在地区的网络自由现况。
    - [ ] 我能够说明不同地区在网络自由上的差异，并举出具体事例。

    ??? tip "还没到这个程度？从这里开始"
        1. 阅读「[什么是 Tor？](./what-is-tor.md){target="_blank"}」（约 5–10 分钟）
        2. 阅读「[什么是匿名网络？](./what-is-anonymous-network.md){target="_blank"}」
        3. 阅读「[网络自由为什么重要？](./internet-freedom-matter.md){target="_blank"}」
        4. 完成后回来勾选清单，确认自己的理解。

    !!! abstract "参考说明"

        ??? question "Tor 的运作原理。"

            可以先从「[什么是 Tor？](./what-is-tor.md){target="_blank"}」章节开始了解。

            Tor 通常指「洋葱路由（The Onion Router）」，通过三层节点将网络连接随机转送到三台主机进出。「Tor 浏览器」是 Tor 团队利用开源浏览器 Firefox ESR 针对洋葱网络所设计的，方便连接 `.onion` 结尾的网站。

            :octicons-question-24: **补充说明**

            1. **Tor 的背景**：Tor 最初由美国海军研究实验室开发，目的是保护政府的信息传递，后来开放给大众使用，以支持言论自由和隐私保护。
            2. **运作方式**：Tor 将你的网络流量加密并随机转送多个中继节点，使流量难以被追踪。
            3. **隐私与安全**：Tor 能防止网络监控和流量分析，也能绕过地理封锁和网络审查。
            4. **限制**：速度通常比一般连接慢，且若用户主动泄露身份信息（如登录账号），仍可能被识别。
            5. **法律考量**：在部分国家或地区，使用 Tor 可能受到法律限制，使用前应了解当地规定。

        ??? question "网络自由为何重要？匿名网络是什么？"

            可以先从「[网络自由为什么重要？](./internet-freedom-matter.md){target="_blank"}」章节开始了解。

            :octicons-question-24: **补充说明**

            1. **网络自由的重要性**：网络自由涉及言论自由、信息流通和隐私权。自由的网络让人们可以不受拘束地交流思想、获取信息，对民主和创新的发展至关重要。在部分国家，政府可能封锁网站、限制社交媒体，甚至监控个人流量。
            2. **匿名网络是什么**：匿名网络让用户能在隐藏身份的情况下浏览网络，保护用户的隐私及安全。这些网络依赖多层加密及路由技术（例如 Tor 洋葱路由），让用户的流量难以被追踪。
            3. **优点与风险**：匿名网络可以保护隐私，帮助用户绕过网络审查。但也被部分非法活动利用，用户在获得匿名性的同时，必须理解由此带来的风险。

        ??? question "你所在地区的网络自由现况如何？"

            网络自由的现况因地而异，可以从以下几个角度来理解自己所在地区的状况：

            :octicons-question-24: **补充说明**

            1. **国际排名与报告**：「自由之家」（Freedom House）每年发布《网络自由》年度报告，评估各国在网络访问开放性、言论自由及用户权利保障方面的表现，是一个很好的参考起点。
            2. **台湾的状况**：根据多份国际评估，台湾的网络自由度名列前茅，民众可自由浏览大多数国际网站，也能公开表达不同的政治观点。但假消息和网络霸凌是现存挑战。
            3. **香港、马来西亚的参照**：香港在《国家安全法》实施后，网络自由度受到影响。马来西亚在政治敏感时期也曾出现部分内容的封锁。这些例子说明，网络自由的状况可能在短时间内出现明显变化。

        ??? question "网络自由在不同地区的差异。"

            这是一个开放的议题，建议自行搜索、了解不同地区的网络自由状况。以下提供几个起点：

            **关键字**

            1. **网络自由报告**：搜索「Freedom House Internet Freedom Report」了解各国排名。
            2. **防火长城（Great Firewall）**：中国大陆的网络审查机制。
            3. **国家安全法（National Security Law）**：香港影响网络自由的法律。
            4. **网络中断（Internet Shutdowns）**：与缅甸、伊朗等地相关的事件。
            5. **网络监控法规（Internet Surveillance Laws）**：各国的监控措施与影响。

            **值得关注的事件**

            1. **2021 年缅甸军事政变**：对该国网络自由的冲击。
            2. **新加坡防止网络谣言法案（POFMA）**：假讯息法案的实施效果。
            3. **泰国街头示威与王室批评**：政府对网络言论的压制。
            4. **越南的内容封锁措施**：具体的网络使用控制案例。

=== ":material-checkbox-marked-circle-outline: 实践"

    **自我评估**（勾选你已能做到的项目）：

    - [ ] 我能够下载并安装 Tor 浏览器。
    - [ ] 我能够说明 Bridge、Snowflake、WebTunnel 各自的使用场景。
    - [ ] 我能够判断是否应搭配 VPN 使用 Tor，以及两者的差异。
    - [ ] 我能够通过直接连接与桥接方式连接 Tor 网络，并已实际使用至少一周。
    - [ ] 我能够操作切换目前的连接路径（New Tor Circuit）。
    - [ ] 我能够连接到 `.onion` 网域。

    ??? tip "还没到这个程度？从这里开始"
        1. 前往 [Tor Project 官方网站](https://www.torproject.org/zh-TW/download/){target="_blank"} 下载 Tor 浏览器。
        2. 安装后，用 Tor 浏览器进行日常浏览，持续至少一周，熟悉其界面与特性。
        3. 尝试连接到本项目的 `.onion` 网站，确认桥接连接方式也能运作。

    !!! abstract "参考说明"

        ??? question "Tor 浏览器的连接方式。"

            「[Tor 浏览器](https://www.torproject.org/zh-TW/download/){target="_blank"}」是 Tor 团队利用开源浏览器 [Firefox ESR](https://www.mozilla.org/zh-TW/firefox/enterprise/){target="_blank"} 长期支持版本针对洋葱网络所设计的，方便连接 `.onion` 结尾的网站。目前 [Brave](https://brave.com/zh-tw/){target="_blank"}、[Mullvad](https://mullvad.net/zh-hant/browser){target="_blank"} 浏览器也支持连接 `.onion` 网站。

            Tor 浏览器与一般浏览器相似，但特别强调隐私保护，并能有效阻挡广告追踪。连接到一般网站时，数据会随机经过三台 Tor 中继传输。连接到 `.onion` 网站时，则在第三台中继之后进入 `.onion` 网络。

            :octicons-question-24: **补充说明**

            1. **匿名浏览**：流量经过随机选择的中继服务器，进行多层加密和路由，使追踪来源的难度大幅提高。
            2. **规避审查**：流量被转送至多个国家的中继服务器，使监控和过滤机制难以辨识和阻止连接请求。
            3. **临时使用设计**：关闭 Tor 浏览器后，浏览历史、Cookies、登录信息等临时数据会自动清除。
            4. **开放源代码**：Tor 的源代码公开，允许开发人员和安全专家进行检视与修正。

        ??? question "Tor 桥接（Bridge）类型：Bridge、Snowflake、WebTunnel。"

            桥接（Bridge）服务器的存在，是为了帮助受到网络审查或封锁的用户连上 Tor。以下是几种不同类型的 Tor 桥接：

            1. **Bridge**：最基本的 Tor 桥接类型。桥接是一种不列于公开 Tor 网络中的秘密入口点，因此不易被封锁。用户可手动取得桥接来连接 Tor 网络。（可参考如何取得 [Tor Bridge](https://bridges.torproject.org/){target="_blank"}）
            2. **Snowflake**：通过 WebRTC 协议让志工使用浏览器成为临时的 Tor 入口点。因为动态且去中心化，封锁难度较高。（可参考如何安装 [Snowflake](https://snowflake.torproject.org/){target="_blank"}）
            3. **WebTunnel**：使用 HTTPS 服务器作为入口点，流量难以与一般 HTTPS 流量区分，适合应对更复杂的封锁策略。（可参考如何建立 [WebTunnel](https://community.torproject.org/relay/setup/webtunnel/){target="_blank"}）

        ??? question "各桥接类型的使用场景与时机。"

            1. **Bridge**：适合在对 Tor 有基本封锁的环境（如某些学校、职场），足以解决大多数基于 IP 的封锁。
            2. **Snowflake**：面临类似中国、伊朗等使用深层封包检测（DPI）的强力封锁时，Snowflake 是更好的选择。
            3. **WebTunnel**：当其他桥接类型均失效，且面临极端封锁策略时尝试使用。其 HTTPS 伪装能更有效地隐藏 Tor 流量。

        ??? question "是否可以通过 VPN 连接 Tor？"

            通过 VPN 连接 Tor 是常见做法，常见有两种方向：

            1. **Tor-over-VPN**：先连接到 VPN，再从 VPN 连接到 Tor。这是较常使用的方式。原始 IP 被隐藏在 VPN 服务器后，ISP 无法看到你正在使用 Tor。VPN 也能帮助绕过对 Tor 入口的封锁。
            2. **VPN-over-Tor**：先连接到 Tor，再通过 Tor 使用 VPN。这种配置较少见，需要 VPN 提供商支持通过 Tor 连接，且不一定能对 IP 提供额外保护。

        ??? question "安装 Tor 浏览器并实际使用至少一周。"

            1. 前往 [Tor Project 官方网站](https://www.torproject.org/zh-TW/){target="_blank"}，下载适用于你的操作系统的 Tor 浏览器。
            2. 完成下载后，按照指示安装并启动 Tor 浏览器。
            3. 在整个使用的一周内，用 Tor 浏览器进行日常的网络浏览，熟悉界面和特性，注意使用时的匿名性与安全性，也留意可能造成的不便之处。

        ??? question "通过直接连接与桥接方式连接到 Tor 网络。"

            1. 启动 Tor 浏览器时，通常会看到浏览器正在建立连接。
            2. 输入网址即直接通过 Tor 网络浏览，此途径最适合未封锁 Tor 网络的地区。
            3. 可通过网址列左侧第一个图示（Tor Circuit，类似 :material-map-marker-path: 的图示）点击查看目前的路线与连接方式。
            4. 假设你的网络封锁了 Tor，请选择「设置（Settings）」、「连接（Connection）」、「桥接（Bridges）」，从内建桥接服务器类型中选择，或输入你从其他途径取得的桥接连接信息。

        ??? question "操作切换目前的连接路径。"

            1. 通过网址列左侧第一个图示（Tor Circuit）点击查看目前的路线与连接方式。
            2. 点击最后一行「New Tor circuit for this site」，让 Tor 浏览器重新建立连接路径。这在出口节点刚好被网站阻挡时，可以尝试切换不同国家的方式连接。

        ??? question "连接至 .onion 网域。"

            1. 连接到[项目网站](https://anoni.net/docs/){target="_blank"}，注意网址列后方出现紫色按钮「.onion available」，按下后即可跳转到 `.onion` 网域。当出现这个按钮，表示该网站有主动提供指引连接到 `.onion` 网域。
            2. DuckDuckGo 也提供了 `.onion` 服务：<https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/>{target="_blank"}

=== ":material-checkbox-marked-circle-auto-outline: 贡献"

    **自我评估**（勾选你已能做到的项目）：

    - [ ] 我能够清楚区分 Tor（洋葱路由协议）、Onion 网络、Tor 浏览器三者各自所指的技术。
    - [ ] 我能够使用 Snowflake 浏览器扩展套件建立 Tor 桥接。
    - [ ] 我能够启动 Tor 服务并通过 SOCKS v5 方式让其他程序使用。
    - [ ] 我能够在 [metrics.torproject.org](https://metrics.torproject.org){target="_blank"} 查询特定地区的中继点状态。
    - [ ] 我能够建立并维护 Tor Relay 中继点。
    - [ ] 我能够建立 Tor Bridge 桥接点或 WebTunnel 中继点。
    - [ ] 我能够建立 `.onion` 网站。

    ??? tip "还没到这个程度？从这里开始"
        1. 先完成「实践」层的所有项目。
        2. 阅读「[如何搭建 Tor Relay](./setup-tor-relay.md){target="_blank"}」，了解中继站的安装与设置流程。
        3. 参考「[Tor Relays 观测点](./watcher-tor-relays.md){target="_blank"}」，了解如何观察中继站的运作状况。
        4. 参考「[Tor Snowflake](./tor-snowflake.md){target="_blank"}」，了解如何通过浏览器或独立程序提供 Snowflake 桥接。

    !!! abstract "参考说明"

        ??? question "Tor、Onion 网络、Tor 浏览器的区别。"

            - **Tor（洋葱路由协议）**：指底层的匿名路由技术，通过多层加密与中继节点传递流量，使流量来源难以被追踪。
            - **Onion 网络**：指以 `.onion` 结尾的隐藏服务网络，只能通过 Tor 协议访问。
            - **Tor 浏览器**：以 Firefox ESR 为基础，整合 Tor 协议的浏览器，让一般用户能方便地连接 Tor 网络与 `.onion` 网站。

        ??? question "使用 Snowflake 浏览器扩展套件建立桥接。"

            Snowflake 让你用浏览器成为一个临时的 Tor 桥接，协助受审查地区的用户连接。

            1. 在 Chrome 或 Firefox 安装 [Snowflake 扩展套件](https://snowflake.torproject.org/){target="_blank"}。
            2. 安装后会自动运作。你可以在扩展套件图示上查看目前转发的连接数量。
            3. 可参考项目页面「[Tor Snowflake](./tor-snowflake.md){target="_blank"}」的详细说明。

        ??? question "启动 Tor 服务并通过 SOCKS v5 方式连接。"

            除了 Tor 浏览器之外，也可以在系统中直接安装并启动 Tor 服务，让其他程序通过 SOCKS v5 使用 Tor 网络。

            1. 在 Debian/Ubuntu 安装：`apt install tor`
            2. 默认 SOCKS v5 端口号为 `9050`。
            3. 在支持 SOCKS v5 代理的程序中，设置代理服务器为 `127.0.0.1:9050` 即可使用 Tor 网络。
            4. 可用 `curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org/api/ip` 确认是否已通过 Tor 连接。

        ??? question "在 metrics.torproject.org 查询中继点状态。"

            [Tor Metrics](https://metrics.torproject.org){target="_blank"} 提供 Tor 网络的各种统计数据，包括中继点数量、带宽使用、地区分布等。

            1. 前往 [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"}，可依国家、名称或 Fingerprint 搜索中继点。
            2. 以台湾（TW）为例，可在「Advanced options」中选择 Country: TW，查看目前运作中的中继站清单。
            3. 也可以在「[Tor Relays 观测点](./watcher-tor-relays.md){target="_blank"}」页面查看本项目整理的可视化观测数据。

        ??? question "建立并维护 Tor Relay 中继点。"

            建立 Tor Relay 需要具备 Linux 基本操作能力，以及一台具有固定 IP 和稳定带宽的服务器。

            完整的安装与设置步骤请参考「[如何搭建 Tor Relay](./setup-tor-relay.md){target="_blank"}」，其中涵盖：

            - Middle Relay 的安装与设置（`/etc/tor/torrc`）
            - Bridge 桥接点的建立
            - WebTunnel 中继点的建立
            - 安装后的维护注意事项

        ??? question "建立 .onion 网站。"

            `.onion` 网站是只能通过 Tor 网络访问的隐藏服务。建立时需要在服务器端设置 Tor 服务，并指定隐藏服务的本地监听端口号。

            官方文件请参考 [Tor Project | Set up Your Onion Service](https://community.torproject.org/onion-services/setup/){target="_blank"}。

## Tails 技能分级

=== ":material-checkbox-marked-circle-outline: 了解"

    **自我评估**（勾选你已能做到的项目）：

    - [ ] 我能够说明 Tails 是什么，以及它与一般操作系统的主要差异。
    - [ ] 我能够说明 Tails 适合在什么情境下使用，以及它的主要限制。
    - [ ] 我能够解释网络自由为何重要，以及匿名网络的用途。（与 Tor 了解层相同）
    - [ ] 我能够描述自己所在地区的网络自由现况。（与 Tor 了解层相同）

    ??? tip "还没到这个程度？从这里开始"
        1. 阅读「[什么是 Tails？](./what-is-tails.md){target="_blank"}」（约 5–10 分钟）
        2. 「网络自由」与「匿名网络」的背景知识与 Tor 了解层相同，可先完成「[Tor 了解](#Tor-技能分级)」再回来继续。
        3. 完成后回来勾选清单，确认自己的理解。

    !!! abstract "参考说明"

        ??? question "Tails 是什么，以及它的运作原理。"

            可以先从「[什么是 Tails？](./what-is-tails.md){target="_blank"}」章节开始了解。

            Tails 是一个以安全为核心设计的可携式操作系统，从 USB 随身碟开机后运行于内存中，不在你使用的电脑上留下任何痕迹。所有对外的网络连接默认通过 Tor 网络传输。

        ??? question "网络自由为何重要？匿名网络是什么？"

            这部分的背景知识与 Tor 了解层相同，请参考「[Tor 了解](#Tor-技能分级)」中的对应说明，以及「[网络自由为什么重要？](./internet-freedom-matter.md){target="_blank"}」章节。

        ??? question "你所在地区的网络自由现况如何？"

            这部分的背景知识与 Tor 了解层相同，请参考「[Tor 了解](#Tor-技能分级)」中的对应说明。

=== ":material-checkbox-marked-circle-outline: 实践"

    **自我评估**（勾选你已能做到的项目）：

    - [ ] 我能够制作 Tails 开机随身碟，并从 USB 开机进入 Tails。
    - [ ] 我知道哪些 Mac 机型无法使用 Tails，原因为何。
    - [ ] 我了解 Tails 的主要使用情境与限制。
    - [ ] 我能够建立持久性加密磁区（Persistent Storage）。
    - [ ] 我能够设置 Bridge 桥接，调整 Tails 的 Tor 连接方式。
    - [ ] 我能够使用 OnionShare 通过 Tor 网络分享文件，并已实际使用 Tails 至少一周。

    ??? tip "还没到这个程度？从这里开始"
        1. 前往 [Tails 官方网站](https://tails.net/){target="_blank"} 下载 Tails 镜像文件。
        2. 准备一个至少 8GB 的 USB 随身碟，使用 [Balena Etcher](https://etcher.balena.io/){target="_blank"} 制作开机碟。
        3. 参考 [Tails 官方安装指南](https://tails.net/install/index.en.html){target="_blank"} 完成制作并从 USB 开机。
        4. 使用 Tails 进行一周的日常操作，熟悉其功能与设置。

    !!! abstract "参考说明"

        ??? question "如何制作 Tails 开机随身碟。"

            - **下载 Tails**：前往 [Tails 官方网站](https://tails.net/){target="_blank"}，下载 Tails ISO 镜像文件。
            - **准备工具**：需要一个至少 8GB 的 USB 随身碟，以及 [Balena Etcher](https://etcher.balena.io/){target="_blank"} 或 [Rufus](https://rufus.ie/zh_TW/){target="_blank"} 等工具来制作开机碟。
            - **安装与制作**：参阅[官网提供的制作流程](https://tails.net/install/index.en.html){target="_blank"}，选择合适的操作系统执行。

        ??? question "设置电脑从 USB 随身碟开机。"

            - **进入 BIOS/UEFI 设置**：重新启动电脑后，按下对应的按键（如 F2、F12、Delete）进入 BIOS 或 UEFI 设置。
            - **调整开机顺序**：在开机菜单中，调整设置使 USB 随身碟成为主要开机装置。保存变更后重新启动，系统将自动从 USB 开机。

        ??? question "哪些 Mac 机型无法使用 Tails？"

            - **不支持的类型**：使用 Apple T2 芯片或 Apple Silicon（M 系列芯片）的 Mac，由于启动安全机制，可能无法顺利从非苹果认证的 USB 装置启动。

        ??? question "Tails 的使用情境与限制。"

            - **使用情境**：Tails 主要针对需要高隐私保护的人士，例如记者、人权工作者，或任何希望匿名浏览的人。它运行于内存中，关闭后不会在电脑上留下数据。
            - **限制**：
                1. **硬件兼容性**：对某些新型无线网卡的驱动程序支持有限。
                2. **操作习惯**：Tails 基于 Linux（Debian）和 GNOME 桌面环境，对不熟悉 Linux 的人有一定的学习曲线。
                3. **永久储存**：虽然可建立持久性加密磁区保留部分数据，但 Tails 的设计初衷是不留痕迹。
                4. **频繁更新**：为确保安全性，Tails 更新频繁，需持续保持更新。

        ??? question "建立持久性加密磁区（Persistent Storage）。"

            - 开启 Tails 后，在桌面上找到「Applications」菜单，选择「Tails」、「Configure persistent volume」。
            - 依照指示设置持久性加密磁区，这个区域让你可以保存设置文件、电子邮件等个人数据，并通过加密保护数据安全。
            - 完成后，当你重启 Tails 时，可在登录页面选择是否启用这个加密磁区。

        ??? question "使用 Bridge 设置 Tails 的 Tor 连接。"

            - 登录 Tails 后，会出现连接到 Tor 的网络设置画面。
            - 若你的地区封锁了直接连接至 Tor，选择设置桥接（Bridge）方式。
            - 可选择内建的桥接，或手动输入已取得的桥接信息以绕过封锁。

        ??? question "使用 OnionShare 分享文件。"

            - OnionShare 是一个可以通过 Tor 网络安全分享文件的工具。
            - 在 Tails 的「Applications」菜单中找到并启动 OnionShare。
            - 通过拖放或选取文件的方式，将想分享的文件载入 OnionShare。
            - 启动分享后，OnionShare 会生成一个 `.onion` 网址，将这网址提供给信任的人，他们即可使用 Tor 浏览器下载。

=== ":material-checkbox-marked-circle-auto-outline: 贡献"

    **自我评估**（勾选你已能做到的项目）：

    - [ ] 我能够通过 Thunderbird 设置 Gmail 信箱的接收与传送（IMAP 协议）。
    - [ ] 我能够将 Tails 更新到下一个最新版本。
    - [ ] 我理解 MAC 地址匿名化（MAC Address Anonymization）的作用。
    - [ ] 我能够备份持久性加密磁区（Persistent Storage）到另一个 USB。
    - [ ] 我能够使用 GNOME Secrets 管理密码。
    - [ ] 我能够使用 GnuPG 与 Kleopatra 建立加密密钥并加密文件。
    - [ ] 我能够通过 Thunderbird 寄送加密邮件。

    ??? tip "还没到这个程度？从这里开始"
        1. 先完成「实践」层的所有项目。
        2. 在 Tails 中启动 Thunderbird，依照提示设置 IMAP 账号。
        3. 参考 [Tails 官方文件](https://tails.net/doc/index.en.html){target="_blank"} 中关于 GNOME Secrets 和 GnuPG 的操作说明。

    !!! abstract "参考说明"

        ??? question "通过 Thunderbird 设置 Gmail（IMAP 协议）。"

            1. 在 Tails 中开启 Thunderbird。
            2. 依照设置向导，输入 Gmail 账号，选择 IMAP 协议。
            3. Gmail 目前需要使用「应用程序密码（App Password）」才能在 Thunderbird 中验证，需先在 Google 账号安全设置中开启两步骤验证，再产生应用程序密码。
            4. 完成设置后，电子邮件将通过 Tor 网络传输。

        ??? question "更新 Tails 到最新版本。"

            - Tails 内建自动侦测更新的功能。启动 Tails 后，如果有新版本可用，系统会在桌面通知你。
            - 依照提示执行更新，更新过程需要另一个 USB 随身碟来完成（从旧版克隆到新版）。
            - 详细步骤可参考 [Tails 官方更新说明](https://tails.net/doc/upgrade/index.en.html){target="_blank"}。

        ??? question "MAC 地址匿名化（MAC Address Anonymization）。"

            - MAC 地址是网卡的唯一识别码，在同一个局域网内可被其他装置看到。
            - Tails 默认启用 MAC 地址匿名化，启动时会随机产生一个虚假的 MAC 地址，避免你的设备在同一个 Wi-Fi 环境中被识别。
            - 如果你的网络需要固定 MAC 地址才能连接（如企业网络），可在 Tails 启动菜单中暂时停用此功能。

        ??? question "备份持久性加密磁区。"

            - 在 Tails 中，可以将持久性加密磁区复制到另一个 Tails USB 随身碟作为备份。
            - 前往「Applications」、「Tails」、「Clone Tails」，依照步骤复制，选择是否一并复制持久性磁区。
            - 建议定期备份，以防 USB 随身碟损坏导致数据丢失。

        ??? question "使用 GNOME Secrets 管理密码。"

            - GNOME Secrets 是 Tails 7.6 起取代 KeePassXC 的内建密码管理工具，与 GNOME 桌面环境整合更紧密。
            - 启动后，建立一个新的密码数据库，并设置一组主密码。
            - 将所有账号的密码储存在数据库中，下次使用时只需记住主密码即可。
            - GNOME Secrets 使用与 KeePassXC 相同的数据库格式，原有的 KeePassXC 密码数据库可直接在 GNOME Secrets 开启。
            - 数据库文件可储存在持久性加密磁区中，以便下次使用 Tails 时取用。

        ??? question "使用 GnuPG 与 Kleopatra 建立加密密钥并加密文件。"

            1. 在 Tails 中开启 Kleopatra（位于「Applications」、「Accessories」）。
            2. 建立一组新的 OpenPGP 密钥对（包含公钥与私钥）。
            3. 公钥可分享给他人，让对方用来加密传送给你的文件或邮件。
            4. 私钥保存在持久性加密磁区中。
            5. 可通过 Kleopatra 加密或解密文件，也可通过 Thunderbird 寄送加密邮件。

        ??? question "通过 Thunderbird 寄送加密邮件。"

            - 完成 GnuPG 密钥建立与 Thunderbird 设置后，可以尝试向本项目的加密邮件地址 `whisper@anoni.net` 寄送加密邮件。
            - 取得 `whisper@anoni.net` 的公开密钥，请参考「[持续关注](./contact.md){target="_blank"}」页面。
            - 在 Thunderbird 撰写邮件，选择加密后寄出，收件方会使用其私钥解密。

## OONI 技能分级

=== ":material-checkbox-marked-circle-outline: 了解"

    **自我评估**（勾选你已能做到的项目）：

    - [ ] 我能够说明 OONI 是什么，以及它的目的。
    - [ ] 我能够区分网络监视（surveillance）与网络审查（censorship）的差异。
    - [ ] 我能够说明 OONI 的检测运作方式。
    - [ ] 我能够描述不同地区在网络监视与审查上的差异。

    ??? tip "还没到这个程度？从这里开始"
        1. 阅读「[什么是 OONI？](./what-is-ooni.md){target="_blank"}」（约 5–10 分钟）
        2. 阅读「[网络自由为什么重要？](./internet-freedom-matter.md){target="_blank"}」
        3. 完成后回来勾选清单，确认自己的理解。

    !!! abstract "参考说明"

        ??? question "OONI 是什么。"

            可以先从「[什么是 OONI？](./what-is-ooni.md){target="_blank"}」章节开始了解。

        ??? question "网络监视（surveillance）与网络审查（censorship）的差异。"

            - **网络监视（surveillance）**：指政府、组织或个人监看和记录用户的网络活动，如电子邮件、搜索历史、网站浏览及通话。监视通常涉及深层封包检测等技术，以获取特定的流量信息。
            - **网络审查（censorship）**：指限制或控制用户对互联网上某些信息的访问，包括封锁网站、过滤内容或禁止某些关键字搜索。审查往往由政府实施，也可能由企业或其他机构施行。

        ??? question "OONI 的检测运作方式。"

            - OONI 提供免费的开源工具 OONI Probe，用户可在自己的网络环境执行测试，检测网络是否被审查。
            - OONI Probe 会定期发送请求至多个网站和服务，确认[名单上](./ooni-weblists.md){target="_blank"}的网站是否可以正常访问。
            - 测试结果会匿名上传到 OONI 的数据服务器，并在 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 上公开，供研究者和公众使用。

        ??? question "不同地区在网络监视与审查上的差异。"

            - **台湾**：网络环境相对自由，政府并未大规模实施网络审查或监控，对个人隐私权的保护也相对重视。
            - **中国大陆**：执行严格的网络封锁和审查政策，通称「防火长城（Great Firewall）」，限制访问许多外国网站和服务。
            - **北韩**：对网络访问进行极端限制，仅允许极少数精选内容。
            - **俄罗斯、伊朗**：进行不同程度的网络监控和网站封锁。
            - 可参考「[网络自由为什么重要？](./internet-freedom-matter.md){target="_blank"}」章节。

=== ":material-checkbox-marked-circle-outline: 实践"

    **自我评估**（勾选你已能做到的项目）：

    - [ ] 我能够安装并使用 OONI Probe 产生检测报告。
    - [ ] 我能够说明为何不建议在 VPN 下使用 OONI Probe 进行检测。
    - [ ] 我了解 OONI Probe 在网络审查严格地区使用时的风险。
    - [ ] 我能够说明 ASN 自治网络的运作方式。
    - [ ] 我能够在 OONI Explorer 整理特定国家近期的观测数据。
    - [ ] 我能够通过 OONI Explorer 比较不同国家的观测数据。
    - [ ] 我能够建立 OONI Run 检测链接，并找到该链接的线上报告。

    ??? tip "还没到这个程度？从这里开始"
        1. 前往 [OONI 官方网站](https://ooni.org/install/){target="_blank"} 下载并安装 OONI Probe 应用程序。
        2. 启动后执行一次完整的网站检测，查看结果。
        3. 前往 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 查看你的测试结果出现在哪里。

    !!! abstract "参考说明"

        ??? question "安装并使用 OONI Probe 产生检测报告。"

            - **安装 OONI Probe**：通过 [OONI 官方网站](https://ooni.org/install/){target="_blank"} 下载 OONI Probe 应用程序。
            - **使用 OONI Probe**：
                - 启动后，选择要进行的测试类型，例如测试网站封锁、即时通讯应用程序的连接性，或中间盒（middleboxes）干扰。
                - 点选开始测试后，OONI Probe 会自动执行检测并产生结果。
                - 结果会上传至 OONI 的服务器，也可在 OONI Explorer 查看更详细的报告。

        ??? question "为何不建议在 VPN 下使用 OONI Probe？"

            - VPN 会改变你的流量路径和 IP 地址，可能导致 OONI Probe 测试到改变后的网络环境，而非你实际所在地的审查状况。
            - OONI Probe 的目的是测试本地网络的审查情形，应在不使用 VPN 的情况下进行，才能反映真实的网络状况。

        ??? question "使用 OONI Probe 时的风险。"

            - 在网络审查较严格的地区，使用 OONI Probe 进行检测可能引起网络管理员的注意，应了解所在区域的网络政策，衡量使用可能带来的风险。
            - OONI Probe 在测试时会访问不同的网站和服务，可能触发网络监控系统的记录。

        ??? question "ASN 自治网络的运作。"

            - ASN 是用于识别自治网络（AS）的唯一识别码。
            - 自治网络是由一个或多个网络服务提供者（ISP）或大型企业管理的一组 IP 地址区块。每个 AS 通过 ASN 在互联网上互相通讯，交换路由信息。
            - 可参考「[ASNs 自治网络观测数据分析](./ooni-asns-coverage.md){target="_blank"}」中的介绍。

        ??? question "通过 OONI Explorer 整理特定国家近期的观测数据。"

            - 前往 [OONI Explorer](https://explorer.ooni.org/zh-Hant/){target="_blank"} 网站。
            - 在国家栏中选择要查看的地区。
            - 使用日期范围选择功能，设置要查看的时间范围。
            - 查看不同类型的测试结果，例如网站封锁、即时通讯应用程序的连接状况等。
            - 可下载或记录这段期间出现的相关数据和事件，进行进一步分析。

        ??? question "通过 OONI Explorer 比较不同国家的观测数据。"

            - 在 OONI Explorer 页面上，纵轴（Rows）选择「国家」，使用筛选器（Filters）分别选择要比较的国家。（[参考设置](https://explorer.ooni.org/zh-Hant/chart/mat?test_name=web_connectivity&axis_x=measurement_start_day&since=2025-05-01&until=2025-05-30&time_grain=day&axis_y=probe_cc){target="_blank"}）
            - 查看这些国家在不同测试中的结果差异，包括网站封锁、中间人攻击检测等。
            - 可导出 CSV 数据进行进一步比较。

        ??? question "检视目前网络封锁的报告。"

            - 在 OONI Explorer 主页中，可查看关于全球网络审查和封锁的最新报告和趋势。
            - 浏览「[搜索](https://explorer.ooni.org/zh-Hant/search){target="_blank"}」，或搜索特定服务和网站查看连接性状况。
            - 也可查看「[网络审查](https://explorer.ooni.org/zh-Hant/social-media){target="_blank"}」底下不同的测试类型，例如社群网站、新闻媒体等。

        ??? question "建立 OONI Run 检测链接并找到线上报告。"

            - 在 [OONI Run](https://run.ooni.org/){target="_blank"} 页面提供电子邮件取得登录链接。
            - 通过链接登录后，依表单必填项目完成填写。
            - 在「Add URL+」项目新增要检测的网站网址。完成后按下「Create Link」完成建立。
            - 分享网址或点击网址后，依引导开启 OONI Probe 开始检测。（[参考检测](https://run.ooni.org/v2/10182){target="_blank"}）
            - 网址后方的数字（如 `https://run.ooni.org/v2/10182` 中的 `10182`）即为 OONI Run Link ID，可在 OONI Explorer 直接输入 ID 查找检测结果。（[参考结果](https://explorer.ooni.org/search?since=2025-04-29&until=2026-07-01&failure=false&ooni_run_link_id=10182){target="_blank"}）

=== ":material-checkbox-marked-circle-auto-outline: 贡献"

    **自我评估**（勾选你已能做到的项目）：

    - [ ] 我能够使用命令行的方式启动 OONI Probe 并执行指定测试。
    - [ ] 我理解网站观测名单（test lists）的收录方式与分类标准。
    - [ ] 我能够检查现有名单中的网址状况，标记需要更新或弃用的项目。
    - [ ] 我能够提交 Pull Request 更新 Citizen Lab 的网站观测名单。
    - [ ] 我能够通过原始观测数据（Raw Data）进行数据整理与分析。

    ??? tip "还没到这个程度？从这里开始"
        1. 先完成「实践」层的所有项目。
        2. 阅读「[OONI 网站检测清单](./ooni-weblists.md){target="_blank"}」，了解名单的收录方式与现况。
        3. 阅读「[ASNs 自治网络观测数据分析](./ooni-asns-coverage.md){target="_blank"}」，了解原始数据的分析方式。
        4. 前往 [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} GitHub 项目，浏览各国的名单格式。

    !!! abstract "参考说明"

        ??? question "使用命令行启动 OONI Probe。"

            OONI Probe 除了图形界面版本之外，也提供命令行工具（OONI Probe CLI）：

            1. 前往 [OONI Probe CLI 说明页面](https://ooni.org/install/cli){target="_blank"} 下载适用版本。
            2. 安装后，可使用 `ooniprobe run` 执行全部测试，或用 `ooniprobe run websites` 只执行网站检测。
            3. 命令行版本适合在服务器或定期排程环境下运行，方便持续观测特定地区的网络状况。

        ??? question "网站观测名单的收录方式。"

            OONI Probe 在进行「网站」检测时，会根据 [Citizen Lab](https://citizenlab.ca/){target="_blank"} 维护的 [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 项目，逐一检测名单上的网址。

            名单分为：
            - **全球（global）名单**：涵盖全球热门网站，以英语网站为主。
            - **本地（local）名单**：各地区提供，包含当地语言的分类内容，在有网络审查的国家也会收录已遭封锁的网站。

            名单的收录分为四大类别：政治、社会、冲突与安全、互联网工具。

            可参考「[OONI 网站检测清单](./ooni-weblists.md){target="_blank"}」了解更多。

        ??? question "如何协助整理与更新名单。"

            贡献的步骤如下：

            1. 前往 [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 找到对应地区的 CSV 文件（如 `lists/tw.csv`）。
            2. 逐一检查名单中的网址，标记需更新（网址失效、已更换域名）或可弃用（网站已停止营运）的项目。
            3. 修改完成后，提交 Pull Request 请求更新。
            4. 详细流程可参考「[OONI 网站检测清单](./ooni-weblists.md){target="_blank"}」中的说明。

        ??? question "通过原始观测数据进行分析。"

            OONI 在 AWS S3 提供公开的原始观测数据，可用于更深入的数据分析：

            1. 数据存放于 S3 bucket `ooni-data-eu-fra`（eu-central-1 区域）。
            2. 格式为 `raw/{date}/{hour}/{country}/webconnectivity/*.jsonl.gz`。
            3. 本项目的 [ASN 涵盖分析工具](./ooni-asns-coverage.md){target="_blank"} 提供了下载与分析的范例，可参考 `asn_coverage/ooni.py` 的实作方式。
            4. 原始数据可用于分析特定 ASN 的观测涵盖率、追踪特定网站在不同时间点的封锁状态，以及进行跨地区比较。
