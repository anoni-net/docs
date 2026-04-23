---
date: 2025-01-06
authors:
    - toomore
categories:
    - 公告
    - 社区
image: "assets/images/post-update.png"
---

# 项目重启 2025

嗨，各位，Anoni.net Docs 将在 2025 重新启动项目，目前规划三个子项目作为 2025 研究的方向与目标。如果对这些议题有兴趣，可以考虑加入我们，一起研究、讨论与「[网络自由](../../internet-freedom-matter.md){target="_blank"}」相关的议题。这个文档网站也将是未来持续更新进度、活动预告、研究结果发布的平台。建议可以先订阅[邮件群组](../../contact.md){target="_blank"}，后续有任何新的信息更新，我们也会使用邮件群组发送通知。

<!-- more -->

## 项目计划

Anoni.net Docs 计划目前包含三个子项目，涵盖数据分析、检测网站清单本地协助维护更新、中文化与文档翻译推广，无论您来自哪个背景、地区，只要对以下子项目有兴趣，都可以一起参与！接下来将对子项目作简单介绍与未来预计要完成的目标作说明。

### ASNs 自治网络观测数据分析

延续 2023、2024 所研究的「[ASNs 自治网络观察数据涵盖率](https://ocf.tw/p/ooni/report/202312.html){target="_blank"}」，报告将持续针对 ASNs 自治网络系统与网络审查、干预等因素寻找其关联性。另外也持续研究其他区域的 ASNs 覆盖状况，是否会因为数据的多样性不足而影响 OONI 观测数据的解释能力。预计也将建立数据流程基础架构（data pipeline architecture），在研究过程中的数据收集与整理，通过程序自动化完成，能够与 OONI Data 实现即时呈现结果的可能。

[:material-arrow-right-circle-outline: 了解更多此项目的说明](../../ooni-asns-coverage.md){ .md-button target="_blank" }

??? note "数据流程基础架构（Data Pipeline Architecture）"

    可能的做法，但不限于：

    1. 构建 Airflow 让流程可视化的方式完成数据整理与合并输出报表的方向进行。
    2. 但也可能使用简单的 API 架构方式提供给前端呈现图表或后端其他应用。

### OONI 网站检测清单

OONI Probe 网站检测来自于各地区提供的名单，而台湾（`tw.csv`）的部分自从最后一次更新（2017）后，已有很长一段时间没有调整与检视，名单上的网站会影响到观测程序的结果，因此需要花时间修正调整目前的名单，后续再进行 2025 可以收录观察的网站项目。

[:material-arrow-right-circle-outline: 了解更多此项目的说明](../../ooni-weblists.md){ .md-button target="_blank" }

??? note "检测名单目前的状况"

    1. 2017 年后没有检视与更新，许多网站不存在或网址已更换。
    2. 许多 `http` 开头的网址未修正成 `https`。

### 中文化与文档翻译

目前 OONI 的服务与工具也越来越多，中文化也将持续协助进行，保持本地化的词汇与用语。另外我们也打算翻译重要的公告与技术文件，进一步降低理解与参与的门槛，吸引更多人加入研究与贡献。

[:material-arrow-right-circle-outline: 了解更多此项目的说明](../../ooni-i18n.md){ .md-button target="_blank" }

## 参与方式

这个文档网站的建立是希望吸引更多对「网络自由」、「内容审查」议题感兴趣的伙伴加入，也希望在迈出参与的第一步后，能有详细的文档作为先行阅读或补足项目进度。文档网站将是项目的入口，订阅[邮件群组](../../contact.md){target="_blank"}可以持续保持进度更新，未来也会使用 [GitHub](https://github.com/anoni-net/docs){target="_blank"} 作为工作任务分派，朝着能够多人协作与共享知识的方式进行。

## 活动预告

由于 [RightsCon 2025](https://rightscon.summit.tc/catalog/rightscon-2025){target="_blank"} 将在台北举办，许多国际项目团队与社区也将在二月底来到台北参与活动，我们有幸将在会议前与 Tor、OONI 的团队举办一场工作坊与讲座活动，目前时间预定在 2025/02/23 下午与晚上。如果有兴趣亲临现场了解 Tor、OONI 项目或与项目团队成员交流，也请把握这次机会哦！

??? question "如何报名？"

    由于活动报名流程还在筹备中，可以先订阅[邮件群组](../../contact.md){target="_blank"}，当活动地点与报名方式确定后，将通过项目邮件群组发送提醒通知，不要错过了！
