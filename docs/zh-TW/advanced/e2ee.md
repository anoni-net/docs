---
title: 端對端加密如何運作
description: 從 Diffie-Hellman 金鑰交換、前向保密、Double Ratchet，到群組與多裝置同步的工程取捨。對照 Signal、MLS、SimpleX、Session 四個協議的設計差異。
icon: material/key-chain-variant
---

# :material-key-chain-variant: 端對端加密如何運作

端對端加密（End-to-End Encryption，E2EE）的核心在金鑰：誰產生、誰保管、什麼時候更新。同樣的演算法，在不同協議裡對抗的攻擊者完全不同。這篇文章從一對一通訊的 Diffie-Hellman 金鑰交換出發，解釋前向保密、Double Ratchet、群組通訊的兩種路線、多裝置同步的取捨，最後對照 Signal、MLS、SimpleX、Session 四個主要協議。

## 一對一通訊：Diffie-Hellman 金鑰交換

兩個從沒見過面、只能透過監聽者轉送訊息的人，能不能協商出一把只有他們知道的金鑰？1976 年提出的 Diffie-Hellman 金鑰交換（DH）給出了肯定的答案。

直觀的比喻是混色。Alice 與 Bob 都從一個公開的「基底色」出發，各自加入只有自己知道的「秘密色」混合，再把混合後的顏色透過公開管道交給對方。雙方再把對方送來的混合色加上自己的秘密色。最後兩人手上的顏色相同，但監聽者只看到中間的混合色，沒辦法在合理時間內反推出秘密色。在數學上，這個「合理時間內無法反推」依賴於離散對數問題的困難度。

實作上，現代協議普遍使用基於橢圓曲線的 X25519，比早期的有限體版本更小、更快，且抗側通道攻擊。Signal、Tor、TLS 1.3、SSH 預設都是 X25519。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/dh-exchange.drawio.svg" alt="Diffie-Hellman 金鑰交換流程：Alice 與 Bob 各自挑秘密 a、b，交換 G^a、G^b，雙方各自算出共同金鑰 G^ab，Eve 即使看到中間訊息也無法在合理時間內反推">
</figure>

DH 解決了「協商出共同金鑰」這件事。但只有 DH 不夠：金鑰一旦長期存在，只要有一天被偷走，過去與未來的所有訊息都會被解密。下一步要解決的就是這個。

## 前向保密：今天金鑰被偷，過去訊息為何仍安全

前向保密（Forward Secrecy，FS）的目標是：即使長期金鑰將來被攻擊者拿到，過去已經傳出去、被攻擊者錄下的密文，仍然無法解密。

做法是每次連線（或每段時間）都用一把臨時金鑰（ephemeral key）交換出當下的工作金鑰，工作金鑰用完即丟。攻擊者拿到的長期金鑰只能驗證身分（這個人是不是真的 Alice），不能還原過去的工作金鑰。

TLS 1.3 預設啟用前向保密，舊的 RSA 金鑰交換（不具前向保密性）已被淘汰。E2EE 通訊協議更積極：不只「每次連線」一把臨時金鑰，連「每則訊息」都換一把，這就是 Double Ratchet。

## Double Ratchet：每則訊息一把獨立金鑰

Double Ratchet 是 Signal Protocol 的核心，名稱來自兩種同時運作的金鑰更新機制（兩種「棘輪」）：

- **DH ratchet**：每收到對方一則訊息，雙方就執行一次新的 DH 金鑰交換，更新主金鑰。
- **Symmetric ratchet**：在兩次 DH 交換之間，每送出一則訊息就用對稱金鑰演算法導出下一把鑰，舊的鑰立即丟掉。

這個設計帶來幾個直接的安全特性：

1. **完整前向保密**：每則訊息有獨立的對稱鑰，攻擊者拿到當下的金鑰，過去與未來的訊息仍然安全。
2. **後向保密**（Post-Compromise Security，PCS）：即使裝置一度被入侵、金鑰被竊，只要在下一次 DH 交換時攻擊者沒有攔下訊息，安全狀態就會自我恢復。
3. **離線訊息**：對方不在線時可以累積訊息，等對方上線再批次同步，每則仍有獨立鑰。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/double-ratchet.drawio.svg" alt="Double Ratchet 的兩種金鑰更新機制：對稱 ratchet 每送一則訊息推進一格、DH ratchet 收到對方訊息時整段重置，每則訊息有獨立金鑰">
</figure>

Double Ratchet 在 2014 年被 Open Whisper Systems（後來的 Signal Foundation）整合進 Signal Protocol，後續被 WhatsApp、Facebook Messenger Secret Conversations、Skype Private Conversations 採用。

## 群組通訊的兩條路：Sender Keys 與 MLS

一對一通訊的解法成熟了，群組的成本卻完全不同。100 人的群組、每則訊息要不要做 100 次 DH？業界目前有兩條主流路線。

### Sender Keys（Signal 群組）

每個發送者持有一把「Sender Key」，加入群組時透過一對一加密通道把 Sender Key 分享給每個成員。發送訊息時用自己的 Sender Key 加密一次，所有成員用各自收到的副本解密。

優點是發送端只加密一次，效能對 100 人或 1000 人差不多。缺點是：

- 新成員加入時要重新分發 Sender Keys。
- 成員退出時要全部換鑰才能達到「退出後看不到新訊息」的保證（PCS）。
- 群組越大，分發成本越高。

### MLS（Messaging Layer Security，IETF RFC 9420）

MLS 用樹狀金鑰結構（TreeKEM）讓加入、退出、訊息加密的成本都壓在 O(log n)，理論上可支援上萬人群組仍維持 PCS。設計目標是把 E2EE 從「兩三百人就吃力」推到「企業級群組」。

2023 年 IETF 正式發布 RFC 9420。Webex、Cisco、Discord 已採用或宣布採用，Signal 自己 2024 年開始實驗 MLS-based 1:1 與群組設計。

兩條路的取捨：Sender Keys 簡單、實作成熟、適合 Signal 規模。MLS 複雜、規模上更乾淨、適合需要管理大型工作群組的場景。

## 多裝置同步的取捨

E2EE 一個常被忽略的痛點是「多裝置」。手機、平板、筆電要同時看到同一段對話，金鑰怎麼辦？

主要有三種策略：

- **Device linking**（Signal、WhatsApp）：每個裝置獨立金鑰，新增裝置時透過 QR code 把訊息歷史從主裝置同步過去。隱私強但同步成本高，新裝置看不到舊訊息（除非主裝置授權重發）。
- **加密雲端備份**（WhatsApp、Telegram Secret Chats、iMessage）：把訊息歷史用使用者設定的密碼加密後存到雲端。優點是換手機方便，缺點是強度取決於密碼，且雲端服務商若被攻擊，密文集中受影響。
- **共用根金鑰跨裝置**（iMessage 早期、部分企業 IM）：所有裝置共用同一把長期金鑰，同步問題簡單但任何裝置被偷都全盤皆輸。

Signal 在 2024 年加入加密訊息備份，採取「使用者輸入長 passphrase + 服務商不知道」的設計，試圖在便利與隱私之間找平衡點。

## 四個協議對照

| 協議 | 一對一 | 群組 | 多裝置 | metadata 揭露 | 開源 |
|---|---|---|---|---|---|
| **Signal** | Double Ratchet | Sender Keys | Device linking + 加密備份 | Sealed Sender 隱藏寄件人 | ✅ |
| **MLS** | TreeKEM | TreeKEM（核心優勢） | 視實作 | 視實作 | ✅（IETF 標準） |
| **SimpleX** | Double Ratchet 變體 | 雙層 ratchet | 無中央帳號，憑卡聯繫 | 無 user identifier | ✅ |
| **Session** | Onion routing + 對等加密 | 半中心化 | 24 字 mnemonic 跨裝置 | 走 Tor-like 網路降低 metadata | ✅ |

各自的設計取捨：

- **Signal**：成熟、生態廣、UX 接近主流 IM。但需要手機號碼註冊（Sealed Sender 只隱藏單則訊息的寄件人，不隱藏帳號本身的 metadata）。
- **MLS**：協議層標準化，業界正在採用，但完整的 MLS 客戶端不多。比較適合企業或機構場景。
- **SimpleX**：無 user identifier 是設計差異最大的點，metadata 抗監控強。代價是生態小、UX 仍在演進。
- **Session**：流量走類 Tor 網路降低 metadata，跨裝置只靠一段 mnemonic 門檻低。代價是訊息延遲較高、無前向保密的舊版設計仍在轉換中。

## 在地脈絡：台灣社群為何用 Signal 與 Matrix

台灣最普及的訊息工具 Line 預設不是 E2EE。Letter Sealing 功能（2015 年推出）只在雙方都啟用、且使用最新版時才生效，群組訊息不在範圍內。對話內容仍經過 Line 伺服器，伺服器端可在司法協助請求下提供內容。

anoni.net 社群與多數關注隱私的台灣使用者偏好兩條路：

- **Signal**：一對一與小群組首選，UX 接近 Line，門檻低。
- **Matrix**（如 anoni.net 自建的伺服器）：開源、聯邦化、可自架，群組與社群討論為主。

在敏感工作情境（記者保護消息來源、社運行動現場、家暴受害者尋求協助）下，這兩條路的差異會繼續展開到 [scenarios/journalist.md](../scenarios/journalist.md)、[scenarios/activist.md](../scenarios/activist.md) 與 [scenarios/domestic-violence.md](../scenarios/domestic-violence.md)。

E2EE 的概念到工具實作之間還隔著一段「該選哪個」的決策，[匿名通訊比較](../tools/messaging-comparison.md) 會接著做這層比較。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 什麼是匿名網路](../tools/what-is-anonymity-network.md)
- [:material-message-lock-outline: 匿名通訊比較](../tools/messaging-comparison.md)
- [:material-atom-variant: 後量子密碼概觀](./post-quantum.md)
- [:material-shield-key-outline: 零知識身分驗證與支付](./zk-identity-payments.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-newspaper-variant-outline: 記者保護消息來源](../scenarios/journalist.md)
- [:material-account-edit-outline: 社運行動者的數位準備](../scenarios/activist.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>
