---
date: 2025-10-18
authors:
    - toomore
categories:
    - 活动
slug: internetfreedom-oct2025
image: "assets/images/post-update.png"
summary: "快速回顾，国家级的监控，我们还可以采取怎样的行动"
description: "快速回顾，国家级的监控，我们还可以采取怎样的行动"
---

# 网络自由小聚 2025/10：数字威权主义商品化 - 网络政变报告分享会

<figure markdown="span">
  ![网络自由小聚 2025/10](https://assets.kktix.io/upload_images/244247/%E7%B6%B2%E8%B7%AF%E8%87%AA%E7%94%B1%E5%B0%8F%E8%81%9A_large.png){ style="border-radius: 10px;" }
  <figcaption>图片引用自网络自由小聚 10 月：https://ocftw.kktix.cc/events/internetfreedom-oct2025 活动。</figcaption>
</figure>

在「[网络自由小聚](https://ocftw.kktix.cc/events/internetfreedom-oct2025){target="_blank"}」上，分享了 [InterSecLab](https://interseclab.org/){target="_blank"} 针对中国防火长城数据泄露的[报告](https://anoni.net/docs/report/interseclab-the-internet-coup/){target=\"_blank\"}后，活动当天后半段展开了许多讨论。大家关注的问题主要是，当我们面对国家级的监控手段与能力时，还有什么是我们可以做的？过往提供的网络安全防护建议是否也需要重新检视与调整。

以下是我们根据当天讨论的内容为大家进行的文字回顾，同时建议大家花时间阅读这份报告，它将更清晰地勾勒出我们所面临的风险与挑战。

<!-- more -->

## 开源软件的滥用

在报告中[发现](https://anoni.net/docs/report/interseclab-the-internet-coup/index_2/){target="_blank"}，防火长城的一系列软件部分是基于现有的开源软件建立或修改而成，这带来一个问题：许多工程师对其专业领域的开源贡献被某些组织滥用，**完全忽视开源授权的规范**。或许这些规范本身没有实质的强制约束力，但当开源贡献的成果被用于隐私监控领域时，我们目前缺乏相应的抵制措施和应对策略。当开源软件的滥用升级到国家规模时，我们有什么办法可以制衡与问责呢？

这个问题在当晚的讨论中没有得到答案。当追求**网络自由、民主自由**的时候，我们可能只能暂时归因于工具的中立性，这或许与 Tor、洋葱网络的使用也存在类似的情况。

## 防火长城验证难以有效阻挡的 WebTunnel

报告中[提到](https://anoni.net/docs/report/interseclab-the-internet-coup/index_7/){target="_blank"}，目前常见的 VPN 协议都可以被识别和阻挡，但 Tor 桥接类型中的 WebTunnel 目前尚无法有效阻挡。由于数据泄露的时间在 2024 年 12 月左右，经过 10 个月后，不确定防火长城的技术是否仍然无法阻挡。此外，与 WebTunnel 类似通过流量伪装 Tor 连接的 Snowflake 也可以规避封包检测。

在当晚的活动中，我们快速向大家介绍了 [Snowflake](../../tor-snowflake.md){target="_blank"}。只需通过浏览器插件，开启后建立一个类似视频会议流的连接，就可以通过浏览器搭建一个 Tor 桥接点，帮助无法使用 Tor 的地区通过你的桥接中继点连接到洋葱网络。对于有技术能力的参与者，我们建议可以通过 Tor 官方打包的 [WebTunnel](https://community.torproject.org/relay/setup/webtunnel/docker/){target="_blank"}（Docker），建立一个类似浏览网页的行为，提供一个[桥接中继点](../../what-is-tor.md){target="_blank"}。

## 采取行动

在当晚的讨论中，我们探讨是否要采取 **“主动”** 的行动。既然已知一些极端政府对人民进行监控和压制，我们是否应直接采取主动姿态来改变现状。当然，情绪激昂过后，我们也意识到所面临的问题可能不是像代码部署错误重新上传、主机故障重启那么简单。当捍卫人权纳入考虑，我们可能需要面对现实世界中的真实危险甚至生命问题。此时我们稍作停顿，现场的参与者也在思考面对这种风险，我们还有多少决心愿意采取行动。

为了缓解一下沉重的氛围，我们传达了 InterSecLab 的下一个计划，他们希望招募对代码分析和研究感兴趣的伙伴。报告中提到，目前泄露的数据中有一大部分尚未被挖掘和分析，而在防火长城技术输出的国家中，一个代号为 A24 的项目尚未被识别。或许不同专业领域的努力都可以成为对抗极端政权的有力反击！

---

以上是 “网络自由小聚” 当晚的快速回顾，也感谢[开放文化基金会](https://ocf.tw/){target="_blank"}的邀请，给予 “[匿名网络社群](../../about/index.md)” 一个分享的机会。如果您还未阅读我们已翻译的报告，请通过[这里阅读](https://anoni.net/docs/report/interseclab-the-internet-coup/)！我们也计划针对报告中的发现，尝试建立一套大众可以掌握的抵御能力，或许会先从**隐私保护**开始。有兴趣的伙伴可以通过[这个频道](https://matrix.to/#/#interseclab-the-internet-coup:im.anoni.net){target="_blank"}来讨论。

当然，也可以直接给[我们](../../about/index.md)发邮件！
