---
title: Tor Browser 進階設定
description: 橋接、安全等級、Onion 站點、身分隔離與常見錯誤排解。
icon: material/cog-outline
---

# :material-cog-outline: Tor Browser 進階設定

!!! info "撰寫中（2026 Q2）"
    這篇文章還在準備中，下方段落是主題大綱。歡迎到 [Matrix 社群](../community/tools.md) 表達想看的角度，或參與撰寫，見 [如何參與](../community/how-to-contribute.md)。

Tor Browser 的預設值已經能涵蓋大部分使用情境，但在被封鎖的網路、進階威脅模型、或需要切換多個身分時，預設值不夠用。這篇文章帶你逐項看 Tor Browser 的進階設定：在連線無法成功時切換內建橋接（obfs4、Snowflake、meek-azure），在指紋追蹤風險較高時調整 Security Level，使用 New Identity 與 New Tor Circuit 切換流量，以及如何驗證 Onion 站點的指紋與書籤。也會列出幾個在台灣常見的錯誤訊息與排解步驟。對應威脅模型的取捨可回頭參考 [威脅模型怎麼想](../basics/threat-model.md)。
