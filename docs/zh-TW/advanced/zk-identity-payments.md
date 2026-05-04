---
title: 零知識身分驗證與支付
description: zk-SNARKs、環簽名、鏈上分析的能與不能，以及零知識身分在支付情境的應用。
icon: material/shield-key-outline
---

# :material-shield-key-outline: 零知識身分驗證與支付

!!! info "撰寫中（2026 Q2–Q3）"
    這篇文章還在準備中，下方段落是主題大綱。歡迎到 [Matrix 社群](../community/tools.md) 表達想看的角度，或參與撰寫，見 [如何參與](../community/how-to-contribute.md)。

Monero 與 Zcash 之所以能做到「預設隱私」或「可選隱私」，關鍵不在演算法名稱，而在金鑰、簽名與證明的設計。這篇文章從三個面向切入：零知識證明（zk-SNARKs）在 Zcash 屏蔽交易裡的角色、環簽名（ring signatures）讓 Monero 把真實寄件人混在一群誘餌中的機制，以及鏈上分析（chain analysis）的能與不能——監控者實際能還原什麼、不能還原什麼。最後延伸到零知識身分驗證（zk-identity）在支付場景的可能應用。與 [端對端加密如何運作](./e2ee.md)、[後量子密碼概觀](./post-quantum.md) 並列為密碼學深度主題。
