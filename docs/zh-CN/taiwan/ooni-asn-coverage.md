---
title: ASNs 自治网络观测数据分析
description: 台湾各 ASN 的 OONI 观测覆盖率分析，从盲点看哪些电信商与网络系统需要更多测试。
icon: material/access-point-network
---

# :material-access-point-network: ASNs 自治网络观测数据分析

## 什么是自治系统 AS？

<figure markdown="span" style="width: 80%;">
    <a target="_blank"
       href="https://www.cloudflare.com/zh-tw/learning/network-layer/what-is-an-autonomous-system/">
        <img src="../assets/images/autonomous-system-diagram.svg"
            alt="ASNs 在实际网络上串联在一起，图示来源： https://www.cloudflare.com/zh-cn/learning/network-layer/what-is-an-autonomous-system/"
            title="ASNs 在实际网络上串联在一起，图示来源：https://www.cloudflare.com/zh-cn/learning/network-layer/what-is-an-autonomous-system/"
        >
    </a>
    <caption>ASNs 在实际网络上串联在一起（[图示来源](https://www.cloudflare.com/zh-cn/learning/network-layer/what-is-an-autonomous-system/){target="_blank"}）。</caption>
</figure>

大家每日使用的网络可以简单地理解为一个由许多互相连接的设备与系统组成的整体，这些设备包括电脑、移动设备、服务器、路由器及交换器等，主要功能是让数据可以在彼此之间进行交换与传输。

当我们讲到更大规模的网络，例如互联网（Internet），它实际上是由许多个小型网络（如：公司网络、家庭网络、电信网络等）所组成的一个全球性网络。在这样的架构里，自治系统（Autonomous System，AS）是一个非常重要的概念。

AS 可以被理解为一个单一的管理实体（例如：一家公司、一所大学或国家）所控制的网络群组，它拥有统一的路由策略（流量进出该往哪里走）。每个 AS 的运作基本上是独立的，但通过全球路由协议与其他 AS 互相连接，形成整个互联网的基础结构。在 AS 之间，使用一种名为 BGP（Border Gateway Protocol，边界网关协议）的路由协议来进行数据交换与路由选择。BGP 可以让不同的 AS 知道该如何将数据包送到目的地，并且决定使用哪一条路径是最有效的。每个 AS 都有一个独一无二的识别号码，称为 AS 号码（AS Number，ASN），用以在 BGP 里标识这个系统。

!!! tip "邮政系统"

    我们常常用邮政系统来比喻 AS 的运作方式。可以想象 AS 就像是各地的邮件处理中心。这些邮件处理中心的责任是将来自同一区域的邮件集结起来，然后根据各自的运输策略（可比拟为 BGP 的路由策略）将这些邮件有效率地传递到正确的目的地。在这个过程中，一旦邮件抵达收件者所在地的邮件处理中心，处理中心会进一步将邮件分配到更精细的位置，如街道、巷弄等。

    这个过程与互联网的 IP 包传递非常相似：当数据包抵达目标 AS 时，该 AS 会依据数据包内的 IP 地址，将数据精确地传送到最终用户的设备上，完成整个数据传递的任务。

    通过这样的现实生活例子，我们可以更容易理解 AS 在互联网中运作的角色与重要性：就像邮件系统依靠处理中心进行运作，互联网也依赖 AS 来管理和进行数据的传递。

## AS 会作坏事吗？

那么你可能会有疑问，AS 听起来是一群非常「自治」的团体组成，会有人或团体想要作坏事吗？是的，AS 有时也会涉及到一些不良行为，这些行为可能是有意的，也可能是由意外或错误造成的。以下是一些 AS「作坏事」的常见案例和情况：

1. **BGP 劫持（BGP Hijacking）：**这是一种常见问题，可能是有意或无意造成的。AS 可能错误地宣告它拥有某些 IP 地址的最佳路由，导致其他 AS 将数据错误地发送到该 AS。这不仅会造成流量中断，还可能被利用来拦截或篡改数据。
2. **BGP 泄漏（BGP Leak）：**这种情况发生在一个 AS 意外地将某些路由对不该收到这些信息流量的其他 AS 进行重新宣告，可能导致广泛的流量重定向和网络拥堵。
3. **不良内容传播或主动攻击：**某些 AS 可能会涉及散布恶意软件、垃圾邮件或组织 DDoS 攻击的活动。这可能是因为 AS 内的服务器遭到攻击者利用，或者有些 AS 故意参与这些活动以获取非法利益。
4. **违反网络中立性规范：**某些 AS，尤其是大型网络供应商（ISP），可能会对某些类型的流量进行限制或优先处理，以此影响网络的公平性。

??? question "自治系统 AS 有哪些组成者？"

    自治系统（AS）是由不同类型的网络管理实体组成的，每个 AS 可能代表一个单独的组织或一群网络实体。

    这些组成者通常包括：

    1. **互联网服务供应商（ISP）：**这些公司提供网络服务给个人、家庭和企业。大型 ISP 通常拥有多个 AS 以便进行不同地理区域或服务的管理。
    2. **学术机构与大学：**许多大学和学术研究机构拥有自己的 AS，以管理其校园网络并直接连接到互联网。
    3. **企业与公司：**大型企业可能拥有自己的 AS，用来管理其全球或区域性办公室间的连接，确保运营和数据的安全性。
    4. **内容交付网络（CDN）服务商：**这些公司专注于提供快速、可靠的内容交付服务，也会拥有自己的 AS 布局以更有效地接触全球用户。
    5. **政府组织：**一些政府机构拥有自己的 AS 来管理内部及与其他政府或公共服务的网络连接。
    6. **非营利组织及其他独立机构：**例如一些研究机构、技术协会或专业团体，可能拥有自己的 AS 以支持其独立运作。

??? question "如何查询目前使用的 ASN？"

    想要知道当前连接网络的 IP 是隶属于哪家电信及其 ASN 编号，可以通过以下服务查询：

    1. [ip.me](https://ip.me/){target="_blank"}：连接到网站后，会提供相关的信息，包括 ASN 编号。
    2. [Is BGP safe yet? No.](https://isbgpsafeyet.com/){target="_blank"}：该网站提供检查和查询当前使用的 ISP 的 BGP 是否有问题。
    3. [Cloudflare Radar（AS3462）](https://radar.cloudflare.com/zh-cn/as3462){target="_blank"}：可以通过 Cloudflare Radar 服务观察 ASN 流量趋势与历史记录。

## OONI Probe 观测分析

[OONI](http://ooni.org/){target="_blank"} 是由全球一群志愿者伙伴通过 [Probe 观测程序](https://ooni.org/install/){target="_blank"} 协助检测所在地是否存在网络封锁、内容审查等问题。通过 OONI Probe 检查后的检测信息会上传到项目的[公开数据库](https://registry.opendata.aws/ooni/){target="_blank"}进行记录，并提供后续分析与利用。

在 2023/11 ~ 2024/03 期间，我们通过[程序抓取](https://github.com/anoni-net/docs/tree/main/asn_coverage){target="_blank"}分析公开数据，并对目前观测数据的情况进行初步检视，以了解是观测数据不足还是存在其他问题。

根据 2023/12 的[报告](https://ocf.tw/p/ooni/report/202312.html){target="_blank"}中的发现，台湾的观察数据在 OONI Explorer 数据库中位列前十，以数量上来说是充足的，但就数据样本而言，大部分的观察数据都集中在 [AS3462](https://radar.cloudflare.com/zh-cn/as3462){target="_blank"} 和 [AS18041](https://radar.cloudflare.com/zh-cn/as18041){target="_blank"} 所贡献的观测数据，占所有观测数据的 78.94%。台湾目前约有 437 组 ASNs，观测数据中不重复的 ASNs 数量仅占 7.32%，多样性的观测显得不足。

此时的数据显示，当前的观察还不够全面与多样，无法反映台湾的网络生态，例如：三大电信业者、有线电视的宽带服务、固网、第二类电信（虚拟移动网络服务）等。

详细内容可以参考以下报告。

[:material-chart-bar: 2023/12 观察报告](https://ocf.tw/p/ooni/report/202312.html){ .md-button .md-button--primary target="_blank" }

## 观测数据分析

!!! info "招募"

    目前我们正在招募志愿者伙伴加入我们的团队。如果您对溯源分析、研究数据、解释数据感兴趣，欢迎加入我们一起讨论与研究。

### 如何分析？

如果您尚未使用过 OONI Probe，请尝试通过以下路径了解其运作过程：

1. 下载 OONI Probe，无论是移动设备版本或桌面版本。
2. 打开 OONI Probe，选择「网站」项目并「执行」检测。
3. 检测完成后前往「测试结果」，找到刚刚完成的「网站」检测结果，查看是否有「！」或「？」的项目。
4. 点击任一有「！」或「？」的检测项目查看可能的检测问题。其中可以看到「数据」、「在 OONI Explorer 中显示」的链接按钮。
5. 点击任一链接即可查看原始数据资料的检测结果。

### 如何检视检测数据？

例如某一項測量資料，其 UID 為：

- [`20241024185921.623617_TW_webconnectivity_578b6d3845fed2e2`](https://explorer.ooni.org/zh-cn/m/20241024185921.623617_TW_webconnectivity_578b6d3845fed2e2){target="_blank"}

以此示例结果呈现为`在 AS3462 上执行检测失败`，失败的信息为 `unknown_failure: dial tcp [scrubbed]: connect: host is down`，可以判断为网站已不再提供服务并断线。而在「DNS 查询」的段落可以看到是 `www.asap.com.tw` 设置了 DNS `A` 记录指向 `60.250.151.72 (AS3462 (Chunghwa Telecom Co., Ltd.)`，其来源于 `162.158.242.36` Cloudflare DNS 的查询结果。

最后可以在「原始测量数据」中看到所有检测项目的原始资料，有些资料不会完整呈现在结果网页上，但可以从「原始测量数据」中找到更多的信息进行收集与分析。

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/ooni_raw_data.png">
        <img src="../assets/images/ooni_raw_data.png"
            alt="OONI Probe 「原始测量资料」的信息。"
            title="OONI Probe 「原始测量资料」的信息。"
            style="border: 1px solid #000000; border-radius: 10px;"
        >
    </a>
    <caption>OONI Probe 「原始测量资料」的信息。</caption>
</figure>

!!! question "检测发现 AS 与 DNS 的差异"

    在这个示例说明过程中，可以发现 OONI Probe 会将检测过程记录下来。例如，我们可以发现即使通过中华电信的网络上网，但是在查询 DNS 服务时使用的是 Cloudflare 的 DNS 查询。

    - 问题：网站受到阻挡无法连接访问，是 AS 问题还是 DNS 问题呢？

### 数据获取

通过 OONI Probe 的检测，观测数据会上传到 OONI 的 [AWS S3 Open Data](https://registry.opendata.aws/ooni/){target="_blank"} 中储存。在 [OONI Docs](https://docs.ooni.org/data){target="_blank"} 中有简单的数据获取教程，或者可以使用我们已经完成的[获取程序](https://github.com/anoni-net/docs/blob/main/asn_coverage/ooni.py){target="_blank"}，数据的字段结构可以参考 [ooni/spec](https://github.com/ooni/spec){target="_blank"}。

以下将通过[获取程序](https://github.com/anoni-net/docs/blob/main/asn_coverage/ooni.py){target="_blank"}来演示如何获取检测观测数据。

??? question "如何设置项目环境？"

    如何设置项目环境与安装所需的套件，请参考「项目研究预先准备」章节，接下来的说明将会省略前置准备过程。

```bash title="回看观测资料"

python3 ./ooni.py lookback [--unit=36] [--loc=TW] [--frame=hours]
```

区间单位为 `小时`，默认设定为 `36` 个单位（36 小时），区域为台湾（`TW`）。执行后将以单位储存以下格式的文件。

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

```bash title="取得区间数据"
python3 ./ooni.py span --start=YYYY/MM/DD --end=YYYY/MM/DD [--loc=TW]
```

区间单位为 `小时`，带入开始时间（`start`）与结束时间（`end`），获取台湾（`TW`）在这一期间的各小时区间的数据。

```bash title="转换为试算表数据"
python3 ./ooni.py sheetrow --path={数据路径}
```

将已获取的数据展开后，为方便在试算表中进行计算操作，另存一份以 `rows_` 开头的数据文件。

建议使用「取得区间数据」加上「转换为试算表数据」后，就可以统计各 ASNs 出现的次数与进行不重复统计计算。再获取目前台湾所有的 ASNs 数据，即可进行占比等统计分析。

```bash title="计算统计 ASNs"
python3 ./ripe.py save --loc=TW
```

详细的计算统计可以参考以下资料：

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }

## :fontawesome-solid-diagram-project: 下一步

<div class="grid cards" markdown>

- [:octicons-mark-github-24: 项目研究预先准备](../community/setup-repo.md)
- [:material-chat-question: 什么是 OONI？](../tools/what-is-ooni.md)

</div>
