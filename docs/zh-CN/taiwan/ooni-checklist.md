---
title: OONI 网站检测清单
description: OONI Probe 在台湾使用的网站检测清单怎么维护，以及社群如何协助分类与更新。
icon: material/list-status
---
# :material-list-status: OONI 网站检测清单

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/ooni_asn.svg">
        <img src="../assets/images/ooni_asn.svg"
            alt="OONI Probe 检测流程"
            title="OONI Probe 检测流程"
        >
    </a>
    <caption>OONI Probe 检测流程</caption>
</figure>

在使用 OONI Probe 进行「网站」检测时，检测程序会根据事先列举的「网站清单」逐一检测。而这里提及的「网站清单」实际上是通过 [Citizen Lab](https://citizenlab.ca/){target="_blank"} 所维护的 [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 项目，分别收录本地（local）、全球（global）热门的网站网址。

全球（global）名单上的大多数网站以英语呈现。而本地名单则由地区提供，内容涵盖当地和地区层级的多种分类，并使用当地语言。在有互联网审查的国家，本地清单还包括了许多已被封锁的网站。

名单收录标准大致上可广泛分为四大类：

1. **政治：**主要关注于那些表达与现任政府持不同立场的网站。与人权、言论自由、少数族裔权利和宗教运动更广泛相关的内容也被纳入考虑。
2. **社会：**包括与性别、赌博、非法药物和酒精相关，以及其他可能在社会上被视为敏感或具冒犯性的话题。
3. **冲突、安全：**包括与武装冲突、边界争议、分裂运动和激进团体相关的内容。
4. **互联网工具：**提供电子邮件、云端空间、搜索、翻译、网络电话（VoIP）服务和规避审查方法的网站被归类在这一类别中。

## 台湾观察名单现况

目前台湾的名单 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} 大部分是在2017年新增建立的，但由于后续没有持续维护，目前名单上有很多网站已经关闭或更换品牌网址、旧网址无效或以 `http://` 开头等问题，因此需要先整理目前的名单内容。

!!! note "http:// → https://"

    有些网站不会自动将以 `http://` 开头的传输协议通过重定向方式（如：[`301 Moved Permanently`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/301){target="_blank"}、[`308 Permanent Redirect`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/308){target="_blank"}）转换到 `https://`，这可能导致检测错误。而目前在申请 TLS/SSL 证书门槛降低和加密传输过程成为基本网站建设条件的情况下，`https://` 应为默认的输入网址格式。

## 名单更新

如同现况的问题，第一步我们需要逐一检查目前在 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} 上列举的网站状况，标记：需更新或可弃用。然后提交一份 [Pull Request](https://gitbook.tw/chapters/github/pull-request){target="_blank"} 到 [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 请求更新。

!!! info "PR #1444"

    在 2023/09/28 [已提交](https://github.com/citizenlab/test-lists/pull/1444){target="_blank"}过一份检测名单修正，但因为后续没有持续更新进度，预计在 2025 年将重新提交一份修正与正确的调整方式。

## 名单新增

由于名单是在 2017 年建立的，已有约 8 年未进行修正与调整，因此需要重新审视当前需要加入检测的网站清单。

!!! warning "后续规划"

    如何新增与募集挑选这部分还需要规划后进行，预计在 2025/Q2 待名单初步修正后再来规划「新增」的项目。

## :fontawesome-solid-diagram-project: 下一步

<div class="grid cards" markdown>

- [:material-chat-question: 什么是 OONI？](../tools/what-is-ooni.md)
- [:material-chat-question: 网络自由为什么重要？](../basics/internet-freedom.md)
- [:octicons-mark-github-24: 项目研究预先准备](../community/setup-repo.md)

</div>
