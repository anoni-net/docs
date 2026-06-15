---
title: 后量子密码概观
description: NIST 后量子标准 ML-KEM、ML-DSA、SLH-DSA 的选型结果，Harvest Now Decrypt Later 威胁模型，以及主流浏览器、云端、通讯应用的转换时程。
icon: material/atom-variant
---

# :material-atom-variant: 后量子密码概观

后量子密码（Post-Quantum Cryptography，PQC）关注三件事：现有密码学在未来十年内是否会被量子电脑打破、何时发生、现在该优先转换哪些算法。可运作的大型量子电脑距离实际攻破 RSA 与椭圆曲线还有距离，但「现在加密、未来解密」的威胁让转换不能等到那一天。NIST 在 2024 年确立第一批后量子标准，主流浏览器、TLS 库、Signal Protocol 已开始导入。这篇整理三个面向：威胁模型与时程、NIST 标准的选型、实际系统的转换进度，以及一般人和组织需要关心的时间点。

## Harvest Now, Decrypt Later 威胁模型

「现在加密、未来解密」（Harvest Now, Decrypt Later，HNDL）是后量子转换的核心动机。攻击者今天录下你的加密通讯，存进硬盘，等十年后取得大型量子电脑时，再用 Shor 算法（量子电脑上能快速分解大数、破解 RSA 与椭圆曲线的算法，现有电脑做不到）破解当时的密钥交换，还原所有录下的密文。

这个威胁对谁实际成立？

- **资料的长期价值高**：政府机密、医疗记录、商业情报、长期身份资料（社会安全号、护照）。
- **攻击者有储存能力**：国家级情报机构（NSA Bluffdale、中国情报单位）长期被外界推测在做这件事。
- **内容今天无法重新加密**：如果今天传出去的密文无法回收，未来解密的风险就确定存在。

对个人即时聊天、短期 session token，HNDL 风险低（内容过期、价值降低）。对银行 KYC 文件、医疗影像、人权工作者的访谈记录，风险高。

NIST（IR 8547）把 2030 年定为弃用旧算法、2035 年定为完全禁止使用的官方时间表，NSA CNSA 2.0 与 ENISA 的路线图也围绕这两个年份[^1]。这个时程意味着新部署从现在起就应该规划 PQC 路径。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/pq-timeline.drawio.svg" alt="后量子密码迁移时程：从 2023 Signal PQXDH、2024 NIST FIPS 与主流浏览器启用、到 2030–2035 主要系统应完成转换、2040 旧密码学硬时间表">
</figure>

## NIST 2024 三大标准

NIST 从 2016 年启动 PQC 竞赛，2022 年初步选定算法，2024 年 8 月正式发布 FIPS 标准。

### ML-KEM（FIPS 203）：密钥封装

- 全名 Module-Lattice-based Key Encapsulation Mechanism。
- 基于 CRYSTALS-Kyber 算法。
- 用途：取代 RSA-OAEP、ECDH 在 TLS、SSH、加密消息中的密钥交换角色。
- 效能：公钥大小依安全等级而定（ML-KEM-512 为 800 bytes、ML-KEM-768 为 1184 bytes、ML-KEM-1024 为 1568 bytes），都比 X25519 的 32 bytes 大，封包略大但对一般连线速度没有可感影响，运算速度快、硬件加速友善。

### ML-DSA（FIPS 204）：数位签章

- 全名 Module-Lattice-based Digital Signature Algorithm。
- 基于 CRYSTALS-Dilithium 算法。
- 用途：取代 RSA-PSS、ECDSA 在凭证、软件签章、区块链中的角色。
- 签章大小约 2.4–4.6 KB（依安全等级而定，比 ECDSA 的 64 bytes 大）。

### SLH-DSA（FIPS 205）：Hash-based 签章

- 全名 Stateless Hash-based Digital Signature Algorithm。
- 基于 SPHINCS+。
- 用途：作为 ML-DSA 的备援，安全性只依赖 hash 函数的抗碰撞性，数学基础最保守。
- 缺点：签章大（约 8–50 KB，依参数集而定）、速度慢，适合长期凭证、不适合高频签章。

NIST 第四轮持续评估 code-based 算法作为长期备援，2025 年选定 code-based 的 HQC 为第四个标准化 KEM（唯一的 isogeny-based KEM 候选 SIKE 已在 2022 年被破解移除）[^2]。短期内 ML-KEM + ML-DSA 是业界主流。

## 真实系统的转换时程

业界 2024–2025 的实际进度：

### 浏览器与 TLS

- **Chrome 124**（2024-04）：默认启用 X25519MLKEM768 混合密钥交换。
- **Firefox 132**（2024-10）：默认启用同上。
- **Safari**：跟进中。

混合（hybrid）的意思是「同时做传统 ECDH + ML-KEM 两次密钥交换，把结果结合」。万一 ML-KEM 将来被发现有漏洞，传统 ECDH 仍提供保护。这是业界普遍采取的保险策略。

### Cloudflare、AWS、Google Cloud

- Cloudflare 自 2022 年起对所有客户的 server 端连线默认启用 PQ 密钥协议，2024 年完成从 Kyber 草案版本迁移到正式 ML-KEM 标准[^3]，是全球部署最积极的 CDN 之一。
- AWS 2025-04 在 KMS、ACM、Secrets Manager 的 TLS 连线启用 ML-KEM[^4]。
- Google Cloud 对企业客户提供 PQC 选项。

### Signal Protocol

- Signal 2023 年发布 PQXDH（Post-Quantum Extended Diffie-Hellman），把后量子密钥封装（初期 CRYSTALS-Kyber，后升级至 ML-KEM）加入密钥交换流程。
- 对前向保密与 PCS 的设计没影响，仅在初次握手加上 PQC 层。
- 这是对 HNDL 威胁最直接的回应。

### SSH 与 PGP

- OpenSSH 9.0（2022）加入 sntrup761x25519 hybrid，9.9（2024）支援 ML-KEM hybrid。
- age、Sequoia PGP 等较新工具开始实验 PQC，传统 GnuPG 进度较慢。

### 区块链与加密货币

- 比特币的 ECDSA 与 Schnorr 签章在大型量子电脑下不安全，但实际威胁取决于量子电脑的时程。
- 以太坊已有提案讨论 PQ 签章选项，但短期内优先序低。
- Zcash、Monero 等隐私币的零知识证明系统也面临 PQ 转换挑战。

## 个人与组织的时间表

不需要明天就动的事：

- 即时通讯（Signal、Matrix）已自动处理，用户端无感。
- 一般网页浏览（Chrome、Firefox 已启用），用户端无感。

需要规划的事：

- **企业 PKI 与凭证**：用于签章、认证、长期存证的凭证需要规划 ML-DSA 或 SLH-DSA 路径。CA/B Forum 已开始讨论 PQC 凭证标准。
- **VPN 与 IPSec**：商用 VPN 对 PQC 的支援不一致，公司网络规划时要纳入评估。
- **长期文件加密**：法务文件、医疗记录、研究资料需要评估「这份文件十年后仍要保密吗」，是的话要选 PQC 加密。
- **硬件安全模组**（HSM）：金融、医疗领域的 HSM 需要供应商提供 PQC 算法支援，更新周期长。

## 在地脉络：政府、金融、医疗的合规时程

台湾的合规时程目前还在跟随 NIST 与 ENISA 的步调：

- **政府机密通讯**：台湾各主管机关尚未公布明确的 PQC 转换时程，预期跟随 NIST 与 ENISA 的步调推动。
- **金融**：金融监督管理委员会预计 2026 年发布金融业 PQC 迁移参考指引，目前已成立先导小组建立技术清单，正式监理要求的时程尚未公布[^5]。
- **医疗**：医疗影像与电子病历需长期保存（台湾《医疗法》规定病历至少保存 7 年，部分影像与追踪资料更久），对 HNDL 风险高，可能是国内最早需要主动规划 PQC 的领域。

对个人与一般组织，现在不需要急着手动部署 PQC。优先动作是：

- 采用会自动更新到 PQC 的工具（Chrome、Firefox、Signal、Cloudflare）。
- 评估自家的「长期保密资料」清单，把 HNDL 风险高的资料优先处理。
- 采购硬件与 SaaS 服务时把 PQC 路线图纳入评估。

关于密码学基础概念的延伸阅读，见 [端对端加密如何运作](./e2ee.md) 与 [零知识身份验证与支付](./zk-identity-payments.md)。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-key-chain-variant: 端对端加密如何运作](./e2ee.md)
- [:material-shield-key-outline: 零知识身份验证与支付](./zk-identity-payments.md)
- [:material-web-box: 去中心化网站发布](./dweb-ipfs-onion.md)
- [:material-shield-account-outline: 威胁模型如何建立](../basics/threat-model.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)
- [:material-newspaper-variant-outline: 记者保护消息来源](../scenarios/journalist.md)
- [:material-account-edit-outline: 社运行动者的数位准备](../scenarios/activist.md)

</div>

[^1]: [NIST IR 8547: Transition to Post-Quantum Cryptography Standards](https://nvlpubs.nist.gov/nistpubs/ir/2024/NIST.IR.8547.ipd.pdf){target="_blank"} - NIST
[^2]: [NIST IR 8545: Status Report on the Fourth Round of the PQC Standardization Process](https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8545.pdf){target="_blank"} - NIST
[^3]: [Post-quantum cryptography for all](https://blog.cloudflare.com/post-quantum-for-all/){target="_blank"} - Cloudflare
[^4]: [ML-KEM post-quantum TLS now supported in AWS KMS, ACM, and Secrets Manager](https://aws.amazon.com/blogs/security/ml-kem-post-quantum-tls-now-supported-in-aws-kms-acm-and-secrets-manager/){target="_blank"} - AWS
[^5]: [金管会 2026 年六大资安重点](https://www.ithome.com.tw/news/173594){target="_blank"} - iThome
