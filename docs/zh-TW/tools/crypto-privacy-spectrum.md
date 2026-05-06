---
title: 加密貨幣的隱私光譜
description: 比特幣、以太坊、Monero、Zcash 與穩定幣的隱私差異，以及自管錢包與多重簽署。
icon: material/currency-btc
---

# :material-currency-btc: 加密貨幣的隱私光譜

!!! info "撰寫中（預計 2026 Q2 完成）"
    主題大綱已收齊，正在比對主流幣種與穩定幣的隱私差異與工具對應。實際撰寫預計 2026 Q2，會與 [匿名支付研究專題](../community/payments-research.md) 同步推進。如果你熟悉 Monero、Zcash 的實作或自管錢包流程，歡迎到 [Matrix 公開 room](../community/tools.md) 分享經驗，或在 GitHub 認領這篇撰寫，流程見 [如何參與](../community/how-to-contribute.md)。

「加密貨幣是匿名的」這個說法太粗糙。比特幣的交易公開可查，以太坊的金額透明到地址層級，Monero 預設把寄件人、收件人、金額都隱藏，Zcash 讓使用者選擇要不要走隱私模式，穩定幣（USDT、USDC、DAI）則跟著它們所在的鏈而呈現不同的可追蹤性。這篇文章排出一條從半透明到預設隱私的光譜，對照每個幣種的設計取捨，並補上自管錢包與託管錢包的差別、多重簽署（multisig）的基本概念。如果想理解背後的密碼學原理，可延伸到 [零知識身分驗證與支付](../advanced/zk-identity-payments.md)。
