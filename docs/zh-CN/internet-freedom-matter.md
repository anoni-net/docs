---
title: 网络自由为什么重要？
description: 从亚洲语境理解网络审查、监控与平台压力，以及 OONI 观测与 Tor 匿名连线能扮演的角色。
icon: material/chat-question
---

# :material-chat-question: 网络自由为什么重要？

在这里，**网络自由**指的是：人们能否在免于不当干预的情况下取得信息、表达意见，以及选择自己信任的工具与连线方式。它与「匿名、隐私、规避审查」常一起出现，但侧重点不同，可先对照阅读[什么是匿名网络？](./what-is-anonymous-network.md)。

除了政府封锁与大规模监控，跨境平台规则、账号处置、算法可见度与数据留存，也会塑造谁能说话、谁能被看见。多地的诽谤、国安或信息治理相关法规争议，则带来制度性的寒蝉效应。在中国的情境下，网络连线与内容可见度常受到多层过滤与平台治理的影响，账号处置与数据留存也会让表达与获取信息面临更高的不确定性。对想要参与公共讨论的人而言，这些因素会直接影响「网络自由是否稳固」。

以下先以东亚、东南亚为例，说明几种常见的压力模式。细节与新闻案例会随时间改变，建议搭配 [Freedom on the Net](https://freedomhouse.org/explore-the-map){target="_blank"} 国别页与本地报导交叉阅读。

## 东亚

中国的「长城防火墙[^1]」长期过滤大量国际网站与服务，并对境内平台内容进行政治、宗教与社会议题上的审查。朝鲜则将一般民众与全球互联网几乎隔绝，仅能使用国家管控下的内部网络「光明网[^2]」。

台湾在区域内多被评为相对开放，仍面对跨境平台治理、信息安全与政治性操纵的讨论，以及对新闻与倡议工作者的法律与舆论压力。分数与叙事会随调查年度更新，可参考 Freedom House 台湾条目[^10]。

<figure markdown="span">
    <a href="https://freedomhouse.org/explore-the-map" target="_blank">
        <img src="../assets/images/freedom_house_explore_the_map.png"
            alt="Freedom House Freedom on the Net 互动地图"
            title="Freedom House Freedom on the Net 互动地图"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>Freedom House「Freedom on the Net」互动地图（各国分数随年度报告更新，画面为站内示意截图）</capture>
</figure>

## 东南亚

越南政府曾要求国际平台配合下架政治性批评内容[^3]。印尼对特定类别网站采取封锁或限制[^4]。马来西亚曾出现针对调查报导媒体与博客的封锁[^5]。菲律宾在选举等高压时期，新闻与社群内容常成为监控与干预焦点[^6]。泰国对皇室相关言论的刑事追诉，长期影响线上表意空间[^7]。

缅甸在 2021 年政变后反复断网、封锁社群与镇压独立媒体[^8][^9]，是「冲突与戒严情境下网络成为战场」的极端例子。

## 观测与匿名连线

亚太地区的封锁与干预，需要可被验证的公开纪录。[OONI](https://ooni.org/){target="_blank"} 透过志工与探测数据，让特定网络与规避工具的可及性以图表与开放数据呈现。下方截图为历史区间范例，实际曲线与国家筛选请以 [OONI Explorer](https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW){target="_blank"} 为准。

<figure markdown="span">
    <a href="https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW" target="_blank">
        <img src="../assets/images/ooni_chart_circumvention.png"
            alt="OONI Explorer：规避工具观测（CN, HK, TW 范例）"
            title="OONI Explorer：规避工具观测（CN, HK, TW 范例）"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>OONI Explorer：规避工具观测（画面为站内保留之示意截图，区间与数据以网站为准）</capture>
</figure>

[Tor](https://www.torproject.org/){target="_blank"} 则透过多层路由与中继网络，协助使用者在高风险环境下维持匿名与连线，并可贡献中继节点强化整体网络韧性。台湾目前已有公开可见的中继与守护节点分布，可从 Tor Metrics 查询。

<figure markdown="span">
    <a href="https://metrics.torproject.org/rs.html#search/country:tw" target="_blank">
        <img src="../assets/images/tor_relay_tw.png"
            alt="Tor Metrics：台湾地区 Tor 中继与守护节点"
            title="Tor Metrics：台湾地区 Tor 中继与守护节点"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 0%);">
    </a>
    <capture>Tor Metrics：台湾地区中继与守护节点（画面随网络状态变动）</capture>
</figure>

无论是跑 OONI 测试、架设 Tor 中继，或协助翻译与教学，都是在具体支撑网络自由。你可以从下方项目列表挑一项开始。

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-chat-question: 什么是匿名网络？](./what-is-anonymous-network.md)
- [:material-access-point-network: ASNs 自治网络观测数据分析](./ooni-asns-coverage.md)
- [:material-list-status: OONI 网站检测列表](./ooni-weblists.md)
- [:material-translate-variant: 中文化与文件翻译](./ooni-i18n.md)

</div>

[^1]: [4所大学团队每日测试4亿个网域研究「防火长城」，发现有31万个网域被挡下、部分的封锁只是「意外」](https://www.thenewslens.com/article/153597){target="_blank"} - TNL The News Lens 关键评论网
[^2]: [金正恩无所不在：北韩监视器数量增加，强化全方位监控](https://global.udn.com/global_vision/story/8663/7970562){target="_blank"} - 转角国际 udn Global
[^3]: [【人权焦点】让我们呼吸! 越南政府的网络审查 与科技巨头的共谋](https://www.amnesty.tw/news/3805){target="_blank"} - 国际特赦组织台湾分会
[^4]: [印尼预计6月落实网络新规定，恐剥夺社交平台言论自由](https://www.thenewslens.com/article/164619){target="_blank"} - TNL The News Lens 关键评论网（法规细节请以印尼官方与最新报导为准）
[^5]: [马来西亚局内人](https://zh.wikipedia.org/zh-tw/%E9%A9%AC%E6%9D%A5%E8%A5%BF%E4%BA%9A%E5%B1%80%E5%86%85%E4%BA%BA){target="_blank"} - 维基百科，自由的百科全书
[^6]: [菲律宾「Rappler」撤照风波：杜特蒂杀向记者的复仇印记？](https://global.udn.com/global_vision/story/8663/6435){target="_blank"} - 转角国际 udn Global
[^7]: [泰国王室骂不得！男子脸书PO文惹祸 遭判刑50年破纪录](https://udn.com/news/story/6812/7721452){target="_blank"} - 联合新闻网
[^8]: [缅甸被彻底剥夺的新闻自由：报导飓风灾害的记者遭军政府判刑20年监禁](https://feja.org.tw/72219/){target="_blank"} - 卓越新闻奖基金会
[^9]: [封锁、断网、审查：从缅甸政变看「网络中立权」的重要性](https://lab.ocf.tw/2022/02/12/mymmar-block/){target="_blank"} - OCF Lab 开放实验室
[^10]: [Freedom House：Taiwan（Freedom on the Net 国别条目）](https://freedomhouse.org/country/taiwan/freedom-net/2024){target="_blank"}（年度与网址随报告更新，若链接失效请改从[互动地图](https://freedomhouse.org/explore-the-map)进入）
