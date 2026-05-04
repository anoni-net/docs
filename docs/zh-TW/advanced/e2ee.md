---
title: 端對端加密如何運作
description: 金鑰交換、前向保密、雙棘輪、群組訊息與多裝置同步的工程取捨。
icon: material/key-chain-variant
---

# :material-key-chain-variant: 端對端加密如何運作

!!! info "撰寫中（2026 Q2）"
    這篇文章還在準備中，下方段落是主題大綱。歡迎到 [Matrix 社群](../community/tools.md) 表達想看的角度，或參與撰寫，見 [如何參與](../community/how-to-contribute.md)。

端對端加密的關鍵不是「加密演算法」這幾個字，而是「金鑰由誰產生、由誰保管、何時更新」。這篇文章從一對一通訊開始，介紹 Diffie-Hellman 金鑰交換、前向保密的概念、雙棘輪（Double Ratchet）演算法如何讓每則訊息使用獨立的金鑰，再延伸到群組通訊（Sender Keys、MLS）與多裝置同步時遇到的工程取捨。我們會用 Signal Protocol、MLS、SimpleX、Session 各自的設計做對照，幫助讀者讀懂後續的 [匿名通訊工具比較](../tools/messaging-comparison.md)。
