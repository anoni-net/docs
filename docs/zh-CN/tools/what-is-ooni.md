---
title: 什么是 OONI？
description: OONI，全名为「Open Observatory of Network Interference」（网络干扰开放观测），是一项全球性倡议，主要目标是监测和报告网络审查及干扰情况。
icon: material/chat-question

---
# :material-chat-question: 什么是 OONI？

OONI，全名为「Open Observatory of Network Interference」（网络干扰开放观测），是一项全球性倡议，主要目标是监测和报告网络审查及干扰情况。OONI 通过提供开源工具与收集网络测试数据，协助用户识别是否存在互联网封锁、监控或降速等现象，并提供实时和公开的网络审查观测数据分析。

## OONI 计划主要推动事项

1. **测试网络审查：**[OONI Probe](https://ooni.org/install/ "前往下载。"){target="_blank"} 是用于测试网站或网络可访问性的应用程序，用户可以使用它来检查特定网站或在线服务是否被封锁。
2. **开放数据：**OONI 将收集到的检测数据[资料公开](https://ooni.org/data/){target="_blank"}，提供自由开放的[查阅与分析](https://explorer.ooni.org/zh-CN "在线查阅观测资料。"){target="_blank"}，提高对[全球网络](https://explorer.ooni.org/zh-CN/countries "各国家目前观测资料的数量。"){target="_blank"}审查状况的认知。
3. **倡议与研究：**通过分析检测数据资料，OONI 与研究人员和倡议者合作，关注全球及区域性网络干扰的[趋势与影响](https://ooni.org/post/){target="_blank"}。
4. **本地社区合作：**OONI 与[其他组织](https://ooni.org/partners/){target="_blank"}、本地社区与项目合作，以增强检测技术能力，推进网络开放及无障碍访问的目标。

参与 OONI 的检测活动，用户能够帮助提高对全球网络开放性的认识，并支持促进数字信息自由流通的努力。

## 如何运作？

<figure markdown="span">
    <a href="../assets/images/how-ooni-works.svg">
        <img src="../assets/images/how-ooni-works.svg"
            alt="OONI 如何运作，透过比对网页呈现来推测是否内容被干预"
            title="OONI 如何运作，透过比对网页呈现来推测是否内容被干预"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 0%);">
    </a>
</figure>

- **Probe：**为 OONI 检测观察程序。
- **Censor：**为信息传输过程中的监控者，可能为公司 IT 网络、电信公司、国家级别的网络架构。网络干预可通过以下方式进行，但其结果与目的都是阻止查看网站内容。
    1. DNS 篡改（DNS tampering、DNS 异常）
    2. IP 封锁（DNS tampering、TCP/IP 异常）
    3. HTTP 封锁（HTTP blocking、例如：封锁页面）
    4. 基于 TLS 的干扰（例如在 TLS 握手期间的 ClientHello 信息后观察到的连接重置）
- **Tor：**[洋葱路由网络](https://zh.wikipedia.org/zh-cn/%E6%B4%8B%E8%91%B1%E8%B7%AF%E7%94%B1 "前往 Wiki 了解更多！"){target="_blank"}，将连接请求通过三层节点的转介传送取得信息。
- **Helper：**检测目标对象，可能为：网站、通讯软件连接、VPN 连接、连接性能等。

在中国，类似的屏蔽行为和技术包括如中国电信等公司提供的内容过滤服务，或通过 DNS 拦截广告和恶意网站的工具。这类服务常用于限制访问不当内容或保护用户。国家互联网信息办公室（网信办）和相关部门也会通过 DNS 劫持等技术手段，进行网络内容监管，以打击不法行为，确保网络空间的安全和清朗。这些措施都可视为对网页浏览的限制。

!!! question "台湾所处的网络是否真的自由？"

    以上举例通常都是针对恶意网站、网络广告、钓鱼诈骗进行善意阻挡（如：[DNS RPZ](https://blog.twnic.tw/2020/09/23/15311/){target="_blank"}），但如果是刻意阻挡某些内容呢？或者来自某些未被观察记录到的 ASNs 的阻挡行为？**虽然目前观测的数据都无大规模阻挡**，但由于观测数据多样性不足，数据主要集中在中华电信（[AS3462](https://radar.cloudflare.com/zh-cn/as3462){target="_blank"}）的[观测资料](https://explorer.ooni.org/chart/mat?probe_cc=TW&since=2024-10-01&until=2024-12-31&time_grain=month&axis_x=measurement_start_day&axis_y=probe_asn&test_name=web_connectivity){target="_blank"}，因此在「各区域观察数据与 ASNs 覆盖率」研究项目中会比对目前我们还有多少在 TW 的 ASNs 是未被观测到的。

## 如何安装 OONI Probe 观测程序

OONI Probe 观测程序提供[移动设备版本](https://ooni.org/install/){target="_blank"}（Android, iOS）、[桌面版本](https://ooni.org/install/){target="_blank"}（Windows 64bit, macOS）、或是无任何桌面界面的[终端程序版本](https://ooni.org/install/cli){target="_blank"}。

<figure markdown="span">
    <a href="../assets/images/ooni_screen_desktop.png">
        <img src="../assets/images/ooni_screen_desktop.png"
            alt="OONI 桌面程序操作页面"
            title="OONI 桌面程序操作页面"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:75%;">
    </a>
</figure>

终端界面可以使用 `ooniprobe run` 执行所有检测项目。或者设置 `cronjob` 在空闲时间运行观测检测。

``` bash
# 在第 4、10 和 22 小时的第 10 分钟执行。
10 4,10,22 * * * ooniprobe run > /dev/null 2>&1 &
```

!!! warning "自动执行"

    目前 `ooniprobe autorun` 的指令尚未实现完成，因此可先使用 `cronjob` 方式定时检测。

## OONI Explorer 观测资料

<figure markdown="span">
    <a href="../assets/images/ooni_explorer.png">
        <img src="../assets/images/ooni_explorer.png"
            alt="OONI Explore 观测资料网站（延迟一小时）"
            title="OONI Explore 观测资料网站（延迟一小时）"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:75%;">
    </a>
</figure>

检测到的观测资料会即时上传到 OONI 的数据库，可通过 [OONI Explorer](https://explorer.ooni.org/zh-CN/chart/mat?probe_cc=TW&since=2024-10-01&until=2025-01-01&time_grain=day&axis_x=measurement_start_day&test_name=web_connectivity){target="_blank"} 在线分析各个区域的状况及不同检测项目的结果。此外，也可以直接访问 [S3 存储空间（Registry of Open Data on AWS）](https://registry.opendata.aws/ooni/){target="_blank"}，下载延迟一小时的原始观测数据，以便进行更深入的交叉分析。可根据分析议题需求选择实时查阅或下载详细数据进行进一步研究。

!!! info "观察 AS 数据"

    可将「纵轴」项目选择为 ASN，以筛选和分离各 ASN 的观测数据状况。

    <figure markdown="span">
        <a href="../assets/images/ooni_explorer_asn.png">
            <img src="../assets/images/ooni_explorer_asn.png"
                alt="OONI Explore 可将「纵轴」项目选择为 ASN，以筛选和分离各 ASN 的观测数据状况。"
                title="OONI Explore 可将「纵轴」项目选择为 ASN，以筛选和分离各 ASN 的观测数据状况。"
                style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:80%;">
        </a>
    </figure>

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 网络自由为什么重要？](../basics/internet-freedom.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-access-point-network: ASNs 自治网络观测数据分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 网站检测列表](../taiwan/ooni-checklist.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>
