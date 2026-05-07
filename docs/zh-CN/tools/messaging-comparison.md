---
title: 匿名通讯工具比较
description: Signal、SimpleX、Session、Briar 等通讯工具的端对端加密、Metadata 与身份模型差异。
icon: material/message-text-outline
---

# :material-message-text-outline: 匿名通讯工具比较

!!! info "撰写中（预计 2026 Q2 完成）"
    主题大纲已收齐，正在规划比较基准与筛选工具范围。实际撰写预计 2026 Q2，下方段落是目前的方向。如果你正在比较这些工具、或是某个工具的长期用户，欢迎到 [Matrix 公开 room](../community/tools.md) 表达想看的角度，或在 GitHub 认领这篇撰写，流程见 [如何参与](../community/how-to-contribute.md)。

「端对端加密」这几个字在 LINE、Telegram、WhatsApp、Signal、SimpleX、Session、Briar 上面意义差很多。差别涵盖多个面向：算法、谁持有密钥、Metadata 留在哪里、注册时要不要绑手机号码或邮件、服务器掉线后还能不能通讯。这篇文章从几个面向比较常见的匿名通讯工具：身份绑定方式、Metadata 暴露、群组功能、跨装置同步、离线可用性，并对应到不同的威胁模型给出建议。需要先理解端对端加密的原理可参考 [端对端加密如何运作](../advanced/e2ee.md)。
