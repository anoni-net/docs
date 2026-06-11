---
title: 端对端加密如何运作
description: 从 Diffie-Hellman 密钥交换、前向保密、Double Ratchet，到群组与多装置同步的工程取舍。对照 Signal、MLS、SimpleX、Session 四个协议的设计差异。
icon: material/key-chain-variant
---

# :material-key-chain-variant: 端对端加密如何运作

端对端加密（End-to-End Encryption，E2EE）的核心在密钥：谁产生、谁保管、什么时候更新。同样的算法，在不同协议里对抗的攻击者完全不同。这篇文章从一对一通讯的 Diffie-Hellman 密钥交换出发，解释前向保密、Double Ratchet、群组通讯的两种路线、多装置同步的取舍，最后对照 Signal、MLS、SimpleX、Session 四个主要协议。

## 一对一通讯：Diffie-Hellman 密钥交换

两个从没见过面、只能透过监听者转送消息的人，能不能协商出一把只有他们知道的密钥？1976 年提出的 Diffie-Hellman 密钥交换（DH）给出了肯定的答案。

直观的比喻是混色。Alice 与 Bob 都从一个公开的「基底色」出发，各自加入只有自己知道的「秘密色」混合，再把混合后的颜色透过公开管道交给对方。双方再把对方送来的混合色加上自己的秘密色。最后两人手上的颜色相同，但监听者只看到中间的混合色，没办法在合理时间内反推出秘密色。在数学上，这个「合理时间内无法反推」依赖于离散对数问题的困难度。

实作上，现代协议普遍使用 X25519（一套基于椭圆曲线的密钥交换算法），比早期的有限体版本更小、更快，设计上也降低了侧信道攻击的风险（side channel，从运算时间、功耗等物理迹象侧面反推密钥）。Signal、Tor、TLS 1.3、大多数现代 SSH 实作（如 OpenSSH）默认或优先使用 X25519。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/dh-exchange.drawio.svg" alt="Diffie-Hellman 密钥交换流程：Alice 与 Bob 各自挑秘密 a、b，交换 G^a、G^b，双方各自算出共同密钥 G^ab，Eve 即使看到中间消息也无法在合理时间内反推">
</figure>

DH 解决了「协商出共同密钥」这件事。但只有 DH 不够：密钥一旦长期存在，只要有一天被偷走，过去与未来的所有消息都会被解密。下一步要解决的就是这个。

## 前向保密：今天密钥被偷，过去消息为何仍安全

前向保密（Forward Secrecy，FS）确保即使长期密钥将来被攻击者取得，过去已传出去、被录下的密文仍无法解密。

做法是每次连线（或每段时间）都用一把临时密钥（ephemeral key）交换出当下的工作密钥，工作密钥用完即丢。攻击者取得的长期密钥只能验证身份（这个人是不是真的 Alice），无法还原过去的工作密钥。

TLS 1.3 默认启用前向保密，旧的 RSA 密钥交换（不具前向保密性）已被淘汰。E2EE 通讯协议更积极：不只「每次连线」一把临时密钥，连「每则消息」都换一把，这就是 Double Ratchet。

## Double Ratchet：每则消息一把独立密钥

Double Ratchet 是 Signal Protocol 的核心，名称来自两种同时运作的密钥更新机制（棘轮意指像棘轮一样只能单向推进、无法倒转，旧密钥回不来）：

- **DH ratchet**：每收到对方一则消息，双方就执行一次新的 DH 密钥交换，更新主密钥。
- **Symmetric ratchet**：在两次 DH 交换之间，每送出一则消息就用对称密钥算法导出下一把密钥，旧的密钥立即丢掉。

这个设计带来几个直接的安全特性：

1. **完整前向保密**：每则消息有独立的对称密钥，攻击者拿到当下的密钥，过去与未来的消息仍然安全。
2. **后向保密**（Post-Compromise Security，PCS）：前向保密保护被攻破之前的消息，后向保密保护之后的消息。即使装置一度被入侵、密钥被窃，只要在下一次 DH 交换时攻击者没有拦下消息，安全状态就会自我恢复（攻击者手上的旧密钥失效，之后的消息再也解不开）。
3. **离线消息**：对方不在线时可以累积消息，等对方上线再批次同步，每则仍有独立密钥。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/double-ratchet.drawio.svg" alt="Double Ratchet 的两种密钥更新机制：对称 ratchet 每送一则消息推进一格、DH ratchet 收到对方消息时整段重置，每则消息有独立密钥">
</figure>

Double Ratchet 在 2014 年被 Open Whisper Systems 整合进 Signal Protocol[^1]，后续被 WhatsApp、Facebook Messenger 的 Secret Conversations（选择性开启）、Skype Private Conversations 采用。

## 群组通讯的两条路：Sender Keys 与 MLS

一对一通讯的解法成熟了，群组的问题却完全不同。100 人的群组里，每则消息都要做 100 次 DH 吗？这个成本不切实际，业界目前有两条主流路线。

### Sender Keys（Signal 群组）

每个发送者持有一把「Sender Key」，加入群组时透过一对一加密通道把 Sender Key 分享给每个成员。发送消息时用自己的 Sender Key 加密一次，所有成员用各自收到的副本解密。

优点是发送端只加密一次，效能对 100 人或 1000 人差不多。缺点是：

- 新成员加入时要重新分发 Sender Keys。
- 成员退出时要全部换密钥才能达到「退出后看不到新消息」的保证（PCS）。
- 群组越大，分发成本越高。

### MLS（Messaging Layer Security，IETF RFC 9420）

MLS 用树状密钥结构（TreeKEM）让加入、退出、密钥更新的成本在没有大量并发更新时压在 O(log n)，理论上可支援上万人群组仍维持 PCS。设计目标是把 E2EE 从「两三百人就吃力」推到「企业级群组」。

2023 年 IETF 正式发布 RFC 9420[^2]。Cisco Webex、Discord（DAVE 协议）已采用或宣布采用 MLS 做群组密钥交换[^3]。

两条路的取舍：Sender Keys 简单、实作成熟、适合 Signal 规模。MLS 复杂、规模上更乾净、适合需要管理大型工作群组的场景。

## 多装置同步的取舍

E2EE 一个常被忽略的痛点是「多装置」。手机、平板、笔电要同时看到同一段对话，密钥如何处理？

主要有三种策略：

- **Device linking**（Signal、WhatsApp）：每个装置独立密钥，新增装置时透过 QR code 把消息历史从主装置同步过去。隐私强但同步成本高，新装置看不到旧消息（除非主装置授权重发）。
- **加密云端备份**（WhatsApp、Telegram Secret Chats、iMessage）：把消息历史用用户设定的密码加密后存到云端。优点是换手机方便，缺点是强度取决于密码，且云端服务商若被攻击，密文集中受影响。
- **共用根密钥跨装置**（iMessage 早期、部分企业 IM）：所有装置共用同一把长期密钥，同步问题简单但任何装置被偷都全盘皆输。

Signal 在 2025 年加入加密消息备份（Secure Backups）[^4]，采取「用户输入长 passphrase + 服务商不知道」的设计，试图在便利与隐私之间找平衡点。

## 四个协议对照

| 协议 | 一对一 | 群组 | 多装置 | metadata 揭露 | 开源 |
|---|---|---|---|---|---|
| **Signal** | Double Ratchet | Sender Keys | Device linking + 加密备份 | Sealed Sender 隐藏寄件人 | ✅ |
| **MLS** | TreeKEM | TreeKEM（核心优势） | 视实作 | 视实作 | ✅（IETF 标准） |
| **SimpleX** | Double Ratchet 变体 | 双层 ratchet | 无中央账号，凭卡联系 | 无 user identifier | ✅ |
| **Session** | Onion routing + 对等加密 | 半中心化 | 13 字 mnemonic 跨装置 | 走 Tor-like 网络降低 metadata | ✅ |

各自的设计取舍：

- **Signal**：成熟、生态广、UX 接近主流 IM。但需要手机号码注册（Sealed Sender 只隐藏单则消息的寄件人，不隐藏账号本身的 metadata）。
- **MLS**：协议层标准化，业界正在采用，但完整的 MLS 客户端不多。比较适合企业或机构场景。
- **SimpleX**：无 user identifier 是设计差异最大的点，metadata 抗监控强。代价是生态小、UX 仍在演进。
- **Session**：流量走类 Tor 网络降低 metadata，跨装置只靠一段 mnemonic 门槛低。代价是消息延迟较高，旧版协议缺乏前向保密，目前仍在向新版本迁移。

## 在地脉络：台湾社群为何用 Signal 与 Matrix

台湾最普及的消息工具 Line 自 2021 年起默认启用端对端加密 Letter Sealing（2015 年推出一对一、2016 年扩及群组）[^5]。一对一与一般群组在 Letter Sealing 生效时，Line 服务器理论上看不到明文。限制在于超过人数上限的大型群组、或有官方账号（bot）加入的聊天室会退回只有传输层加密，服务器在司法协助请求下可提供这些内容。Line 客户端不开源、密钥管理无法独立稽核，metadata 也仍经过服务器。

对照前面四个协议，Line 的落差集中在群组加密与 metadata 这两层。anoni.net 社群与多数关注隐私的台湾用户偏好两条路：

- **Signal**：一对一与小群组首选，UX 接近 Line，门槛低。
- **Matrix**（如 anoni.net 自建的服务器）：开源、联邦化、可自架，群组与社群讨论为主。

在敏感工作情境（记者保护消息来源、社运行动现场、家暴受害者寻求协助）下，这两条路的差异会继续展开到 [scenarios/journalist.md](../scenarios/journalist.md)、[scenarios/activist.md](../scenarios/activist.md) 与 [scenarios/domestic-violence.md](../scenarios/domestic-violence.md)。

E2EE 的概念到工具实作之间还隔着一段「该选哪个」的决策，[匿名通讯比较](../tools/messaging-comparison.md) 会接着做这层比较。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 什么是匿名网络](../tools/what-is-anonymity-network.md)
- [:material-message-lock-outline: 匿名通讯比较](../tools/messaging-comparison.md)
- [:material-atom-variant: 后量子密码概观](./post-quantum.md)
- [:material-shield-key-outline: 零知识身份验证与支付](./zk-identity-payments.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-newspaper-variant-outline: 记者保护消息来源](../scenarios/journalist.md)
- [:material-account-edit-outline: 社运行动者的数位准备](../scenarios/activist.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>

[^1]: [Double Ratchet Algorithm](https://en.wikipedia.org/wiki/Double_Ratchet_Algorithm){target="_blank"} - Wikipedia
[^2]: [RFC 9420: The Messaging Layer Security (MLS) Protocol](https://www.rfc-editor.org/info/rfc9420/){target="_blank"} - IETF / RFC Editor
[^3]: [Bringing DAVE to all Discord platforms](https://discord.com/blog/bringing-dave-to-all-discord-platforms){target="_blank"} - Discord
[^4]: [Introducing Signal Secure Backups](https://signal.org/blog/introducing-secure-backups/){target="_blank"} - Signal
[^5]: [LINE Encryption Report](https://www.lycorp.co.jp/en/privacy-security/security/transparency/encryption-report/2025/){target="_blank"} - LY Corporation
