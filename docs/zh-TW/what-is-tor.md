---
title: 什麼是 Tor？
description: Tor（The Onion Router）是一個開源的匿名通訊網絡，旨在保護用戶的隱私和自由。Tor 通過多層加密和路由技術使使用者的網路活動匿名化，從而防止網絡監控和流量分析。
icon: material/chat-question

---

# 什麼是 Tor？

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/tor_diagram.original.webp">
        <img src="../assets/images/tor_diagram.original.webp"
            alt="Tor Relay 運作流程"
            title="Tor Relay 運作流程"
        >
    </a>
    <caption>Tor Relay 運作流程</caption>
</figure>

[Tor（The Onion Router）](https://www.torproject.org/){target="_blank"}是一個開源的匿名通訊網絡，旨在保護用戶的隱私和自由。Tor 通過多層加密和路由技術使使用者的網路活動匿名化，從而防止網絡監控和流量分析。

- **多層加密（Onion Routing）：**每次使用者發送請求時，Tor 客戶端會選擇一條隨機路徑，通過多個中繼節點（relays）傳送資料。封包資料在每個節點都進行一次加密和解密，就像剝洋蔥一樣，直到到達目標位置。每個節點只知道前一個和下一個節點，這樣可以防止任何單一節點知道完整的資料傳輸路徑。
- **匿名性：**使用者的 IP 位址和網路活動被隱藏，從而提高了匿名性。Tor 網路使得追踪使用者的網絡行為變得非常困難。
- **隱私保護：**Tor 保護使用者免受 ISP（網路服務提供商）、政府和其他監控機構的監控。它還可以幫助使用者規避網絡審查和訪問被限制的網站。
- **暗網（Dark Web）：**Tor 支援訪問 .onion 域名，這些域名只在 Tor 網路內部可被連結，提供了額外的匿名層級。暗網上有一些合法用途，如保護言論自由和隱私，但也存在非法活動。
- **使用方式：**使用者可以下載並安裝 Tor 瀏覽器，這是一個基於 Firefox 修改的瀏覽器，預設設定了 Tor 網路。許多使用者使用 Tor 瀏覽器來匿名瀏覽網路，保護個人隱私。

## 中繼節點、橋接點

### 什麼是中繼點（Relay）？

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/tor_relays.svg">
        <img src="../assets/images/tor_relays.svg"
            alt="Tor Relay 類型"
            title="Tor Relay 類型"
        >
    </a>
    <caption>Tor Relay 類型</caption>
</figure>

在 Tor 網路中，中繼點（Relay）是由志工運行的伺服器，用於轉發使用者的流量，以實現匿名網路通訊。這些中繼點是 Tor 網路的核心組成部分，它們共同工作以隱藏用戶的 IP 位址和網路活動。中繼點可以分為三種類型：入口節點（Guard Relay）、中間節點（Middle Relay）和出口節點（Exit Relay）。每種類型的中繼點在 Tor 網路中扮演不同的角色：

- **入口節點（Guard Relay）：**入口節點是用戶連接到 Tor 網絡的第一個節點。它知道使用者的真實 IP 位址，但不知道用戶的最終目標。通常，Tor 客戶端會選擇一組信任的入口節點，並在一段時間內重複使用，以減少攻擊面。
- **中間節點（Middle Relay）：**中間節點處於入口節點和出口節點之間，用於轉發流量。它只知道前一個節點和下一個節點，無法知道使用者的真實 IP 位址或最終目標。這種設計確保即使中間節點被攻擊或監控，攻擊者也無法追踪整個網路傳遞訊息路徑。
- **出口節點（Exit Relay）：**出口節點是使用者流量離開 Tor 網路並進入公開網路的最後一個節點。它知道使用者的最終目標，但不知道使用者的真實 IP 位址。出口節點伺服器的志工需要承擔一定的風險，因為從它們流出的流量可能包含敏感或非法內容。

### 什麼是橋接點（Bridge）？

除了中繼點（Relay），Tor 網路中還有一種重要的節點叫做橋接節點（Bridge）。Bridge 是專門設計用來繞過網路審查或阻止 Tor 使用的節點。它們在 Tor 網路中扮演特殊角色，主要目的是幫助那些生活在限制嚴格的國家或地區的人們使用 Tor 網路。以下是有關 Bridge 的一些關鍵點：

特點和用途：

- 隱藏性：與普通的中繼點不同，Bridge 的 IP 位址不會被公開列在 Tor 網路的公開索引中。這使得審查機構難以識別和封鎖它們，因為這些機構通常會根據公開的中繼點列表來進行封鎖。
- 繞過審查：在某些國家和地區，政府或 ISP 會阻擋對 Tor 網路的訪問，這時候用戶可以使用 Bridge 來繞過這些封鎖。Bridge 是一個隱秘入口，幫助使用者建立初始連接，之後他們的流量會被轉發到普通的 Tor 中繼點。
- 分發方式：由於 Bridge 的 IP 位址是非公開的，使用者需要通過特定的方式來獲取這些地址。使用者可以通過 Tor 官網、發送電子郵件或使用其他渠道（如橋接分發工具）來獲取 Bridge 位址。

Pluggable Transports：

- 為了進一步躲避審查，Bridge 經常使用 Pluggable Transports，這些協議可以改變 Tor 流量的特徵，使其看起來像普通的 HTTPS 流量或其他類型的流量。這些技術包括 Obfs4、meek、[Snowflake](https://snowflake.torproject.org/zh-TW/){target="_blank"} 等，它們可以混淆 Tor 流量，使得檢測和封鎖變得更加困難。

## 如何參與 Relay 建立

如何建立 Tor Relay 提供 Tor 網路節點與頻寬，可以參考「[如何搭建 Tor Relay](./setup-tor-relay.md)」

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 網路自由為什麼重要](./internet-freedom-matter.md)
- [:material-chat-question: 如何搭建 Tor Relay](./setup-tor-relay.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-access-point-network: ASNs 自治網路觀測資料分析](./ooni-asns-coverage.md)
- [:material-list-status: OONI 網站檢測清單](./ooni-weblists.md)
- [:material-translate-variant: 中文化與文件翻譯](./ooni-i18n.md)

</div>