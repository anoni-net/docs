---
title: 加密货币的隐私光谱
description: 比特币、以太坊、Monero、Zcash 与稳定币的隐私差异，以及自管钱包与多重签署。
icon: material/currency-btc
---

# :material-currency-btc: 加密货币的隐私光谱

!!! info "撰写中（预计 2026 Q2 完成）"
    主题大纲已收齐，正在比对主流币种与稳定币的隐私差异与工具对应。实际撰写预计 2026 Q2，会与 [匿名支付研究专题](../community/payments-research.md) 同步推进。如果你熟悉 Monero、Zcash 的实作或自管钱包流程，欢迎到 [Matrix 公开 room](../community/tools.md) 分享经验，或在 GitHub 认领这篇撰写，流程见 [如何参与](../community/how-to-contribute.md)。

「加密货币是匿名的」这个说法太粗糙。比特币的交易公开可查，以太坊的金额透明到地址层级，Monero 默认把寄件人、收件人、金额都隐藏，Zcash 让用户选择要不要走隐私模式，稳定币（USDT、USDC、DAI）则跟着它们所在的链而呈现不同的可追踪性。这篇文章排出一条从半透明到默认隐私的光谱，对照每个币种的设计取舍，并补上自管钱包与托管钱包的差别、多重签署（multisig）的基本概念。如果想理解背后的密码学原理，可延伸到 [零知识身份验证与支付](../advanced/zk-identity-payments.md)。
