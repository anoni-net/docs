---
title: 密碼管理器入門
description: 為什麼需要密碼管理器、如何選擇，以及 Bitwarden、KeePassXC、1Password 的取捨。
icon: material/key-variant
---

# :material-key-variant: 密碼管理器入門

!!! info "撰寫中（2026 Q2）"
    這篇文章還在準備中，下方段落是主題大綱。歡迎到 [Matrix 社群](../community/tools.md) 表達想看的角度，或參與撰寫，見 [如何參與](../community/how-to-contribute.md)。

重複密碼、簡單密碼、寫在便條紙上的密碼，是被攻擊時最常見的破口。密碼管理器讓你只需要記一組主密碼，其他密碼可以又長又隨機，並在不同裝置之間同步。這篇文章說明密碼管理器的核心威脅模型（離線金庫 vs 雲端同步、誰能讀到主密碼）、雙因子驗證的搭配方式，以及 Bitwarden、KeePassXC、1Password 三套常見工具的取捨。設定完密碼管理器後，建議延伸閱讀 [威脅模型怎麼想](../basics/threat-model.md)，思考遺失主密碼或裝置時的備援流程。
