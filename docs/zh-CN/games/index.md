---
title: 互动与呈现
description: 用可以动手玩、或看数据动起来的 3D 小画面理解隐私与匿名技术。目前三件作品都围绕 Tor：走一遍三跳洋葱路由的解谜、连线流量在会合点相遇的动态呈现、全球近万台真实中继的分布现况。
icon: material/cube-outline
---

# :material-cube-outline: 互动与呈现

这一区放可以动手玩、或单纯看着它动的 3D 小画面，把隐私与匿名技术的概念变成看得到、点得到的东西。全部用 three.js（WebGPU/TSL）在浏览器里跑，免安装，桌机和手机都能玩。目前三件作品都围绕 Tor，之后会做到其他隐私主题。

## 为什么做成画面

隐私技术的保护常常藏在流程里。以 Tor 为例，数据包在三个中继之间往前走，每经过一跳剥掉一层加密，两条电路在中间某台中继相遇后才开始交换内容。发生的顺序本身就是重点，文字写得再仔细，读的人脑中仍然要自己补上动起来的那一段。画面把那一段直接演出来。

用对工具往往是一连串取舍，读过和做过差很多。文档里写「三跳要分散在不同 ASN」，读过就过去了。自己挑三台中继送出去，看到三跳挤在同一个 ASN 而失败，下次就会记得为什么要分散。动手做过一次，留下的印象比读过十次深。

数字也传达不出规模感。「近万台中继，高度集中在少数国家」是一句话，把每一台真的标到地球上，北美和西欧亮成一片、其他地方零星几点，集中的程度就成了看得到的东西。

画面没有要取代文档。它们是入口，先把概念变具体，想追细节再跟着链接回去读。

## 作品

作品本身是繁体中文界面，三个语言版本共用同一份程序。

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __Tor 路由解谜__

    ---

    动手玩的解谜。把消息从你送到对岸的收件人，自己挑 3 个中继组成 Tor 的 guard → middle → exit 路径，避开监听、把 3 跳分散到不同 ASN，遇到封锁改走网桥。

    <a href="../../games/onion-routing/index.html" class="md-button md-button--primary">:octicons-arrow-right-24: 开始游戏</a>

-   :material-lan:{ .lg .middle } __Tor 连线流量__

    ---

    看的呈现。用细小发光粒子与残影表现 Tor 流量的两种路径：连 .onion 服务在随机会合点相遇，连明网网站则经 3 跳出口后原路往返。relay 数、电路数、有害节点、流量都可实时调控。

    <a href="../../games/onion-rendezvous/index.html" class="md-button md-button--primary">:octicons-arrow-right-24: 开始观看</a>

-   :material-earth:{ .lg .middle } __Tor 中继地球仪__

    ---

    看真实数据。把全球正在运作的近万台 Tor 中继洒进各自的国界里，颜色分 guard、middle、exit，大小分带宽，陆地依该国中继数调亮。有中继的国家都标了代号与数量，一眼看出网络高度集中在少数国家。数据取自 Onionoo。

    <a href="../../games/tor-network/index.html" class="md-button md-button--primary">:octicons-arrow-right-24: 开始探索</a>

</div>

## 想先读文字版

这三篇对应目前作品里出现的概念。

- 三跳路由与匿名原理：[什么是 Tor](../tools/what-is-tor.md)
- 中继要分散在不同 ASN：[台湾 ASN 观测覆盖](../taiwan/ooni-asn-coverage.md)
- 封锁时的网桥：[Tor Snowflake 网桥](../tools/tor-snowflake.md)

## 接下来

这是互动区的头三个作品，主题集中在 Tor。隐私里值得做成画面的东西还有很多，元数据会泄漏什么、威胁模型怎么随处境改变、匿名支付的资金流长什么样，都在候补名单上。有想法或想一起做，欢迎到[社群](../community/index.md)找我们。
