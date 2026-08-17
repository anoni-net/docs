---
title: Tor 中继地球仪：近万台中继与十余份公开数据放在同一颗球上
description: 以真实数据构成的地球仪。将全球正在运作的近万台 Tor 中继落在各自的国界之内，另外整合连线受阻观测、用户估计、断网事件、海底电缆与上网人口，放大到台湾还有县市界、海缆登陆点、变电站、发电厂与电网。
icon: material/earth
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/tor-network.png
  image_width: 2993
  image_height: 1713
---

# :material-earth: Tor 中继地球仪

![Tor 中继地球仪的画面，地球转到亚洲一侧，中继以彩色点分布在各国界内，左侧面板列出各国中继数与托管商排行](https://assets.anoni.net/games/tor-network-globe.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

三件作品之中数据最多的一件。它把散落在不同机构的公开数据放到同一颗球上，让「哪里架得起中继」与「哪里连得上 Tor」两件事得以并置对照。放大到台湾之后还多出一层，那些连线实际上依赖哪些实体设施。

<a href="../../games/tor-network/play/index.html?lang=zh-cn" class="md-button md-button--primary">:octicons-arrow-right-24: 开始探索</a>

## 球面上有什么

每台中继在球面上是一个点，落在自己所属的国界之内，颜色区分四种角色（guard、middle、exit、guard 兼 exit），大小对应带宽。陆地的亮度另外代表一项指标，默认是中继台数。

拖曳可以旋转地球，滚轮或双指放大会浮出更多国家标签。网址加上 `#tw` 会在载入时直接飞到台湾，换成别的国码（例如 `#jp`）同样有效，分享连结时可以指定对方一开启先看哪一块。

### 陆地亮度可以换四种指标

![陆地亮度切换到共识权重之后的画面，国家标签改成显示百分比，德国 29.1%、瑞典 6.1%](https://assets.anoni.net/games/tor-network-weight.webp){style="border-radius: 10px;"}

- **中继台数**：该国托管的中继数量
- **共识权重**：该国在 Tor 网络中实际承担的流量比重，与台数常有明显落差
- **单一服务商集中度**：最大一家托管商占该国的比例，用以观察对单一服务商的依赖程度
- **用户估计**：该国使用 Tor 的人数估计，属于需求端指标

台数与权重的落差值得切过去看一次。美国的中继台数最多，换成共识权重，德国会排到前面，德国那批中继单台扛的流量比较大。

### 点国家标签展开信息卡

![点开德国的信息卡，列出 1706 台、占全网 16.8%、权重 29.1%、角色组成、托管商与 OONI 测试结果](https://assets.anoni.net/games/tor-network-country.webp){style="border-radius: 10px;"}

卡片内容包含角色组成、带宽占比、运行官方建议版本的比例、主要托管商，以及该国在其他几份数据中的状况：用户估计、OONI 的异常率、网桥绕道的 pluggable transport 分布。

## 整合了哪些数据

### 中继分布（Onionoo，CC0 1.0）

画面主体来自 Onionoo 的中继快照，经蒸馏后只保留国家层级的聚合，内容不含 fingerprint、nickname、IP 或联络信息。目前收录近万台运作中的中继，分布于约八十个国家、九百多家托管商，其中美国、德国、荷兰三国即占去超过六成。这些数字取自最近一次快照，画面上会标示该份快照的产出时间。

按下画面上的「实时更新」后，数据改由你的浏览器直接向 onionoo.anoni.net 取得并重新计算，不再读取站上的快照。这个动作会让该服务器看见你的 IP，因此默认不启用，要不要开启由你决定。

### 连线受阻的地区（OONI，CC BY-NC-SA 4.0）

取自 OONI 的 tor 测试结果，统计近 30 天各国未依预期完成的比率，OONI 称之为 anomaly。异常的成因包含连线被阻挡、网络不稳与 ISP 故障，仅凭比率无法区分，因此画面只标示异常率达 `85%` 以上且样本数足够的少数国家，中段数值一律不上色。门槛订在这个高度，是因为瑞士、加拿大这类没有审查疑虑的国家，异常率也经常落在两成上下，把中段画出来等于用噪声指控特定国家。受标示的国家以国界向内的红色渐层呈现，相邻但未受标示的国家不会被误读成同样异常。

### 用户与网桥（Tor Metrics，CC0 1.0）

包含两份数字。一份是各国使用 Tor 的人数估计，另一份是网桥用户数，并依 pluggable transport 分列 obfs4、snowflake、webtunnel 等项目，涵盖两百多个国家。两者对照常出现有意义的落差：直连受阻的地区，网桥的数字明显偏高。

### 断网事件（Access Now #KeepItOn，CC BY 4.0）

`2009` 年至 `2025` 年间经人工汇整并逐笔查证的断网事件，涵盖五十余国。这份数据与 OONI 的性质不同，每一笔都有查证过的成因，因此可以明确说明「此处发生过人为断网」。武装冲突与族群冲突造成的中断未必出自政府决策，可能是战事破坏基础设施所致，画面上与信息管制类分开说明。

### 海底电缆与地理底图（OpenStreetMap ODbL、Natural Earth public domain）

海面上较细的线条是海底电缆，取自 OpenStreetMap 贡献者标注的两百余段路径，收录以欧洲、地中海与大西洋较为完整。最淡的一层是主要跨洋走廊的示意，取两端公开的登陆地点拉出大圆弧，仅走向可信，实际路由请参考专门的海缆地图。国界与海岸线来自 Natural Earth。

### 上网人口比例（World Bank CC BY 4.0、数字发展部 政府数据开放授权条款）

国家卡片上的上网人口比例是拿来当分母的。「这一国有几人用 Tor」很大一部分是在比人口大小，知道该国有多少比例的人上网，才判断得出两国的落差来自需求还是来自基数。World Bank 那份的 208 个经济体里没有台湾，台湾那一笔改用数字发展部的国家数字近用调查，两份的方法论不同，一份是 ITU 汇整各国通报，一份是对 12 岁以上人口的电话抽样，卡片上会标示出来，不宜直接比较。

## 放大到台湾

![地球仪放大到台湾，县市界线与 345kV 输电线叠在岛上，中继以彩色点集中在西半部](https://assets.anoni.net/games/tor-network-taiwan.webp){style="border-radius: 10px;"}

台湾是这颗地球仪唯一做到县市尺度的地区，贴近之后会多出五层。左侧面板把台湾相关的信息独立成一区，按「关注台湾」会直接飞过去。

- **县市界线**：内政部国土测绘中心的直辖市、县市界线，22 个县市、84 条环线。它同时也是台湾的海岸线，全球那份的比例尺在这个尺度下不够用，所以贴近之后粗轮廓会换成它。
- **海缆登陆点**：14 处，自建数据集。登陆点坐标是 TeleGeography 商品的一部分，OpenStreetMap 没有收录这份数据，所以以数字发展部公开的海缆清单为骨干，逐点交叉查证坐标，每一笔标记精度分级与各自的来源。这份 v1 并不完整，缺口写在原始文件的文件头。
- **变电站**：台电的二次变电所主变压器装置容量及负载，280 座，画得出坐标的 201 座。卡片上的容量计把 N-1 画成看得到的几何，可靠容量刻度到装机容量之间那段斜纹，宽度正好是最大的一台主变压器，故障时消失的就是那一段。全台有 64 座的尖峰负荷超过可靠容量，那代表尖峰时掉一台就撑不住，跟现在有没有过载是两回事。
- **发电厂与 345kV 骨干**：105 座电厂与 242 段输电线。只有 17 座对得到坐标，但那 17 座已经占了装机容量的七成一，对不到的多半是离岸风场与小水力。161kV 以下的配电网完全没有画，那不是完整电网。
- **用电与可再生能源**：93 处台电自建的可再生能源场址、124 个月的各县市用电，以及今年 212 天的每日尖峰备转容量率。

电厂、变电站、可再生能源场址、登陆点与输电线都点得开看细节。

### 用电那段可以换两种看法

![左侧面板切到工业用电占比，新竹县以 80.4% 排在第一，台南市 78.5%、苗栗县 77.9% 跟在后面](https://assets.anoni.net/games/tor-network-industry.webp){style="border-radius: 10px;"}

看售电量的话六都排在前面，换成工业用电占比，新竹县会跳到第一，科学园区的形状就出来了。园区横跨新竹市东区与新竹县宝山乡，行政上是分开的两列，看总量会被切成两半，看占比则不受影响。

下方那排细条是今年每日的尖峰备转容量率，低于 `10%` 的换成橘色，那是台电自己的供电吃紧门槛。

## 球上的动态

除了上面那几份数据，画面上还有几层效果，这些是渲染出来的，不是外部数据。

地球的日夜分界由 UTC 时间换算出的太阳直射点决定，随真实时间推移，四季昼长差异也会自动对应，过程不需对外连线。此外还有极光、大气边缘辉光与星空。

不定时出现的 Tor 三跳路径动画算是两者之间：端点取自真实中继位置，因此哪个国家较常被选中，会自然反映真实的分布，但三点的组合本身属于示意，并未模拟 Tor 实际的选路规则。

## 数据来源与授权

每份数据文件都带有 `source`、`sourceUrl`、`license`、`licenseUrl` 字段，画面下方也列有对应的来源声明。完整的授权清单见项目根目录的 `NOTICE`，其中 OONI 那一份是 CC BY-NC-SA 4.0，禁止商业使用。

## 延伸阅读

- 这颗地球仪的数据怎么来的：[地球仪的数据从哪来](../blog/posts/games-globe-open-data.md)
- 三跳路由与匿名原理：[什么是 Tor](../tools/what-is-tor.md)
- 台湾的观测覆盖：[台湾 ASN 观测覆盖](../taiwan/ooni-asn-coverage.md)
- 其他两件作品：[互动与呈现](index.md)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://anoni.net/docs/games/tor-network/#work",
      "name": "Tor 中继地球仪",
      "alternateName": ["Tor Relay Globe", "Tor 中繼地球儀"],
      "url": "https://anoni.net/docs/games/tor-network/play/?lang=zh-cn",
      "mainEntityOfPage": "https://anoni.net/docs/zh-cn/games/tor-network/",
      "description": "以真实数据构成的地球仪。将全球正在运作的近万台 Tor 中继落在各自的国界之内，另外整合连线受阻观测、用户估计、断网事件、海底电缆与上网人口，放大到台湾还有县市界、海缆登陆点、变电站、发电厂与电网。",
      "image": "https://assets.anoni.net/games/tor-network.png",
      "inLanguage": ["zh-Hans", "zh-Hant", "en"],
      "applicationCategory": "EducationalApplication",
      "browserRequirements": "需要支持 WebGPU 或 WebGL2 的浏览器，免安装",
      "isAccessibleForFree": true,
      "license": "https://github.com/anoni-net/docs/blob/main/LICENSE",
      "author": { "@id": "https://anoni.net/#organization" },
      "publisher": { "@id": "https://anoni.net/#organization" },
      "isPartOf": { "@id": "https://anoni.net/docs/games/#collection" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "文档", "item": "https://anoni.net/docs/zh-cn/" },
        { "@type": "ListItem", "position": 2, "name": "互动与呈现", "item": "https://anoni.net/docs/zh-cn/games/" },
        { "@type": "ListItem", "position": 3, "name": "Tor 中继地球仪" }
      ]
    }
  ]
}
</script>
