---
date: 2026-06-01
authors:
    - toomore
categories:
    - 更新
    - Tor
    - 翻译文章
slug: keeping-the-doors-open
image: "assets/images/tor.webp"
summary: "Unredacted 用 300+ 台服务器跑 FreeSocks、Tor bridges、Snowflake 等抗审查服务，并用约 400W 运维 123 个 Tor exit relay。对照 anoni.net 这个台湾社群目前观测到的 12 个 Tor 中继节点（其中 3 个是 exit），对外连接自由的地区有条件替被封锁地区架设更多中继节点。"
description: "Unredacted 用 300+ 台服务器跑 FreeSocks、Tor bridges、Snowflake 等抗审查服务，并用约 400W 跑 123 个 Tor exit relay。对照台湾 12 个 Tor 中继节点的现况，对外连接自由的地区有条件替被封锁地区架设更多 Tor 中继节点。"
---

# 把门开着：Unredacted 如何替审查地区守住一条通往开放网络的路

!!! info ""

    以下内容原文翻译自下面这篇文章，主语视角为 Unredacted（Tor Blog 客座撰写）：

    - [Keeping the doors open, Tor Blog, by Unredacted.org, 2026-05-15](https://blog.torproject.org/keeping-the-doors-open-unredacted/){target="_blank"}

    文末附三段来自 anoni.net 社群的补充（台湾的对照、GreenWare 在自由连接地区的可行性、你能做什么）。

![Keeping the doors open](assets/images/tor.webp){style="border-radius: 10px;"}

这篇客座文章是「捍卫自由网络的组织」系列报导的一篇。

有位中国用户曾经这样描述我们的工作：

> 「你们帮了很多很多人翻过防火长城。如果没有你们的帮助，我会被困在完全的黑暗里，被洗脑。」

我们很少听到使用我们服务的人发声。他们大多没有办法、或不觉得自己能安全地传讯息出来。每当有一条讯息穿越过来，就提醒我们这件事真正关系到什么。

<!-- more -->

我们是 Unredacted，一个注册在美国的 501(c)(3) 非营利组织。我们建造并运维网络基础设施，协助大家连上开放的网络、捍卫使用网络的隐私权。具体做法是在全球运行一个超过 300 台服务器的网络。当前门被锁住时，我们是另一条穿越的路径。当公共广场不再安全时，我们是还能说话的地方。大部分的工作都是看不见的，包括数据中心作业、硬件、自动化、开源软件、带宽、滥用通报处理、监控警报，以及为了让这一切持续运作而熬过的深夜。

我们做的事情分成三个方向。**Censorship Evasion**（绕过审查）下面是 Unredacted Door，这是我们所有「设计来绕过封锁」的服务的总称。**Secure Infrastructure**（安全基础设施）跑像是 [XMPP.is](https://xmpp.is/){target="_blank"}、自家的 Matrix 家用服务器，还有其他以安全与隐私为前提的免费服务。**Unredacted Education** 是写作与文件这一块，给想理解这份工作、想自己复制一遍的人读的指南与说明。在这三块之外，**Unredacted Labs** 是实验区，跑还没到正式上线等级的基础设施想法。GreenWare 就是其中一项，目的是用不太耗电的硬件扛起真实的网络容量。

## Unredacted Door

名字就是字面的意思。当通往开放网络的入口被墙封起来，人们就需要另一条进入的路径。

Unredacted Door 把好几项绕行审查的服务收在一起：FreeSocks、Signal 与 Telegram 的讯息代理、Tor bridges、Snowflake 代理。在最近的 30 天里，这些服务替数万名在自己国家绕行审查的用户承载了将近 300 TiB 的流量，大约相当于播好几万小时 4K 视频所需的带宽。需求没有减缓，我们得持续架更多。每一条新过滤规则、每一条新法律、每一波打着「为了你的安全」名号的措施，都会把更多人推向尚未被审查者发现的路。

Unredacted Door 里最大的一块是 FreeSocks，给审查严重地区的用户用的免费代理。如果你没接触过，代理就是一个转接点。你的应用程序不直接跟被封锁的服务说话，而是先跟一台服务器沟通，由它把连接带过你跟外面网络之间那层过滤。FreeSocks 的设计重点是让这个转接点看起来低调无奇，这恰好是一般 VPN 缺乏的特质。VPN 会张扬自己的存在，有清楚的端点、清楚的握手、在线路上看得出来的数据包形状。审查者非常擅长阻挡他们认得出来的东西。

没有单一工具能涵盖所有情境。Tor Browser 提供强度足够的浏览隐私与匿名性。Snowflake 在 Tor 网络本身被封时，帮用户绕回 Tor 上。FreeSocks 代理则把特定流量推上一条较难被察觉的路径。住在审查环境里的人通常手边得备上好几种工具，因为没有任何一扇门能一直开着。

这也是我们为什么把心力投在 FreeSocks 第二版（v2）的开发上。它使用 Xray，一个强大且弹性的流量路由引擎，可以把代理流量做得更像一般网页流量。

!!! note "什么是 Xray"

    Xray 是一个流量路由与伪装工具，源自 V2Ray 项目，被中国、伊朗等审查严重地区的用户广泛采用。它提供 VLESS、Trojan、Reality 等协议，把代理流量伪装成一般 HTTPS / TLS 流量，避免被机器特征识别。传统 VPN 一眼能认出的握手与数据包样态，Xray 把这些指纹抹平，是抗审查工具圈里近年的主力选择。详细可参考 [Xray-core 项目](https://github.com/XTLS/Xray-core){target="_blank"}。

我们把 Xray 与自家的开源控制平面绑在一起，这样当审查者找到并封锁某台服务器时，系统就能自动轮替端点。用户已经在压力底下了，能少花一分力气去调设置就少一分风险。

## GreenWare：可持续的基础设施，从字面上来说

Tor 中继、桥接、代理等等，这些都跑在数据中心的硬件上，而硬件有实际的成本，财务、运营、环境都有。如果我们希望隐私基础设施能长期撑下去，就得问什么样的运维才是真的可持续。

GreenWare 是我们试着缩小这个成本、同时保住承载量的尝试。前提很单纯，大多数 Tor 中继的流量并不需要一台电力消耗像暖风机的服务器。一台中继需要的是稳定的网络、可预测的 CPU，以及足够存放状态的内存。这种规模的工作量，一台单板电脑就能处理，前提是外壳设计得认真。

我们从 Raspberry Pi 5 主板开始，通过 PoE（网络供电）让电与数据都靠一条网线喂进去。这个想法行得通。数据中心的典型服务器吃的电大约相当于一台小型暖风机，而一台 Pi 连一颗灯泡都不到。但是第一代有它的天花板，密度不够，部分配套元件也撑不了我们的长时间使用。

所以我们现在同时跑两种部署方式。第一种是一个 1U 机箱里塞 20 个 ComputeBlade 模组，全部 20 个都部署在我们的数据中心，把一部分 Tor exit relays 搬到上面跑。这个机箱在满载时大约吃 100W 多一点，差不多等于一颗旧式白炽灯泡。第二种是 ComputeBlade 经验教了我们现场真正需要什么之后，自己设计的定制 Raspberry Pi 机箱。两种都已经上线，截至撰文时，我们全部 123 个 Tor exit relay 都跑在这套合并后的基础设施上，总耗电大约 400W。随着时间推进，等项目更成熟，我们会再分享更多机箱设计与整体进展。

Tor 网络靠愿意替它运维基础设施的人与组织撑起。Exit 是这份工作里最难的一块，需要带宽、维护、处理滥用通报、法律上的承担，还需要钱。如果我们能把跑出有意义的 exit 容量所需的成本与电力都压低，就有更多人能扛起其中一块，让网络的节点更多元、规模更大。

更长远的目标是继续推动高效硬件、碳排追踪，乃至于以再生能源驱动的小型节点。我们很乐意跟想看到这件事长大的组织与公司合作。

开放的网络之所以保持开放，是因为有许多人与组织投入心力、时间与精神。包括测量审查的研究者、提供带宽的中继运维者，以及不肯把彼此丢下的社群。Unredacted 负责的这一块，就是建造与维护那些路径，在显而易见的路消失时，给人们另一条可走的。

---

## 来自 anoni.net 社群：台湾的对照

Unredacted 文章里那位中国用户的话格外少见，因为身处审查环境的人多半没有管道、也难以安全地对外发声。anoni.net 是一个台湾的匿名网络社群，写这篇补充的视角来自这里。台湾的网络环境相对自由，没有 GFW、没有强制 VPN 注册、ISP 也没有国家审查命令。也因为如此，台湾这类对外连接自由的地区，有条件替被封锁地区架设 Tor 中继与桥接，分担一部分抗审查基础建设的工作。在中国大陆、伊朗这类重度审查地区的人，正是这些基础设施服务的对象。在新加坡、马来西亚、海外华人所在地这些对外连接同样自由的地方，也都适合成为架设来源地。

匿名网络社群 anoni.net 一直通过 [Pulse 即时观测](https://api.anoni.net/api/readme){target="_blank"} 追踪台湾 Tor 中继节点的数量与分布。截至 2026-05-31，台湾境内 Onionoo 看得到的 running 中继节点是 12 个，其中具有 Exit 旗标的只有 3 个（initramfs、GuruKopi、jerryrelay）。对照 Unredacted 一个组织就跑 123 个 exit relay、30 天承载近 300 TiB 流量，台湾的全国 exit 规模还不到他们的 3%。我们在 [Tor Relays 观测点](../../taiwan/tor-relay-watcher.md) 持续更新这个数字，并在 [ASN 观测资料分析](../../taiwan/ooni-asn-coverage.md) 补上 OONI 对台湾与邻近地区的审查观测。

香港、澳门以及使用中文的东南亚华语用户，在 2020 年后实际的翻墙需求增加，而简体与正体中文的抗审查资源相对稀缺。anoni.net 的工作之一是把这套中文资源补起来，包括 [什么是 Tor](../../tools/what-is-tor.md)、[Tor Snowflake 桥接点](../../tools/tor-snowflake.md)、[什么是 OONI](../../tools/what-is-ooni.md) 等基础文件，跟 Unredacted 的 Unredacted Education 走在同一条路上。

## 来自 anoni.net 社群：GreenWare 在自由连接地区的可行性

Unredacted 把 123 个 exit relays 跑在 400W 上，这个数字换算成运营成本相当友好。以台湾工业用电费约 NT$ 3.5 至 6 / kWh（约人民币 0.8 至 1.4 元 / kWh）估算，400W 全年运转约 3,500 度电，一年大约 NT$ 12,000 至 21,000，对学校信息中心或社群协作空间而言是可以负担的运营成本。读者在其他地区可以换算当地电价，量级通常落在同一个区间。

关键在硬件规模化的设计。Raspberry Pi 5 对各地 maker 社群都不陌生，PoE+ HAT 与 PoE 交换机在常见零售管道都能买到（台湾如 Cytron、群创、PChome，其他地区可循当地电子零售管道）。ComputeBlade（20 模组 1U 机箱）目前零售管道较少，可以通过官方海外订购或社群代购取得。机构机房比家用网络更适合做这件事，原因有三：固定 IP、机构网络带宽、有人巡检机器。

Tor Relay 校园建立是 anoni.net 2026 的三大主题之一，社群正在累积把校园架设经验整理成 SOP 的工作（见 [Tor Relay 校园建立研究专题](../../community/relay-on-campus.md) 与 [在台师大架设 Tor Relay：一段与学校沟通、留下可能性的实作经验](ntnu-nz.md)）。Unredacted 在 GreenWare 上的工程做法，可以做为下一所学校评估架设方案时的参考点，先用 PoE 喂电的 Raspberry Pi 5 试做一台 middle relay，等运作稳定后再考虑 exit 与机箱密度。

对个人或小空间想参与的人，从 Snowflake proxy 开始（浏览器扩展或 Docker）几乎没有电费负担，是进入抗审查基础建设最低门槛的入口（见 [Tor Snowflake 桥接点](../../tools/tor-snowflake.md)）。

## 你能做什么

读完 Unredacted 的工作，如果你也想为「把门开着」贡献一份力，这里有几个入口：

- **了解 Unredacted**：到 [unredacted.org](https://unredacted.org/){target="_blank"} 看他们的服务与透明度信息，再决定是否通过官方管道支持服务器、带宽与人力成本。
- **自架 Snowflake**：最低门槛的抗审查贡献，用浏览器扩展或 Docker 就能跑（见 [Tor Snowflake 桥接点](../../tools/tor-snowflake.md)）。
- **架设 Tor relay 或 bridge**：需要稳定网络与一点运维心力，社群整理了 [如何搭建 Tor Relay](../../community/setup-tor-relay.md) 的步骤与经验。
- **校园 Tor Relay**：在大专院校工作或就读的人，可以从 [Tor Relay 校园建立研究专题](../../community/relay-on-campus.md) 开始评估。
- **加入 anoni.net 社群讨论**：通过 Matrix 跟其他社群成员交换经验，入口在 [社群参与](../../community/index.md)。

## 延伸阅读

- [什么是 Tor](../../tools/what-is-tor.md)
- [Tor Snowflake 桥接点](../../tools/tor-snowflake.md)
- [什么是 OONI](../../tools/what-is-ooni.md)
- [Tor Relay 校园建立研究专题](../../community/relay-on-campus.md)
- [Tor Relays 观测点](../../taiwan/tor-relay-watcher.md)
- [ASN 观测资料分析](../../taiwan/ooni-asn-coverage.md)
- 同系列：[Defending the public's right to know（OONI）](https://blog.torproject.org/Defending-the-right-to-know/){target="_blank"}、[Preserving evidence: How OpenArchive fosters accountability and media sovereignty](https://blog.torproject.org/preserving-evidence-openarchive-fosters-accountability-media-sovereignty/){target="_blank"}
