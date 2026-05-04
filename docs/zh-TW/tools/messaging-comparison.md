---
title: 匿名通訊工具比較
description: Signal、SimpleX、Session、Briar 等通訊工具的端對端加密、Metadata 與身分模型差異。
icon: material/message-text-outline
---

# :material-message-text-outline: 匿名通訊工具比較

!!! info "撰寫中（2026 Q2）"
    這篇文章還在準備中，下方段落是主題大綱。歡迎到 [Matrix 社群](../community/tools.md) 表達想看的角度，或參與撰寫，見 [如何參與](../community/how-to-contribute.md)。

「端對端加密」這幾個字在 LINE、Telegram、WhatsApp、Signal、SimpleX、Session、Briar 上面意義差很多。差別涵蓋多個面向：演算法、誰持有金鑰、Metadata 留在哪裡、註冊時要不要綁手機號碼或郵件、伺服器掉線後還能不能通訊。這篇文章從幾個面向比較常見的匿名通訊工具：身分綁定方式、Metadata 暴露、群組功能、跨裝置同步、離線可用性，並對應到不同的威脅模型給出建議。需要先理解端對端加密的原理可參考 [端對端加密如何運作](../advanced/e2ee.md)。
