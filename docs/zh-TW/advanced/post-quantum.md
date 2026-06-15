---
title: 後量子密碼概觀
description: NIST 後量子標準 ML-KEM、ML-DSA、SLH-DSA 的選型結果，Harvest Now Decrypt Later 威脅模型，以及主流瀏覽器、雲端、通訊應用的轉換時程。
icon: material/atom-variant
---

# :material-atom-variant: 後量子密碼概觀

後量子密碼（Post-Quantum Cryptography，PQC）關注三件事：現有密碼學在未來十年內是否會被量子電腦打破、何時發生、現在該優先轉換哪些演算法。可運作的大型量子電腦距離實際攻破 RSA 與橢圓曲線還有距離，但「現在加密、未來解密」的威脅讓轉換不能等到那一天。NIST 在 2024 年確立第一批後量子標準，主流瀏覽器、TLS 函式庫、Signal Protocol 已開始導入。這篇整理三個面向：威脅模型與時程、NIST 標準的選型、實際系統的轉換進度，以及一般人和組織需要關心的時間點。

## Harvest Now, Decrypt Later 威脅模型

「現在加密、未來解密」（Harvest Now, Decrypt Later，HNDL）是後量子轉換的核心動機。攻擊者今天錄下你的加密通訊，存進硬碟，等十年後取得大型量子電腦時，再用 Shor 演算法（量子電腦上能快速分解大數、破解 RSA 與橢圓曲線的演算法，現有電腦做不到）破解當時的金鑰交換，還原所有錄下的密文。

這個威脅對誰實際成立？

- **資料的長期價值高**：政府機密、醫療紀錄、商業情報、長期身分資料（社會安全號、護照）。
- **攻擊者有儲存能力**：國家級情報機構（NSA Bluffdale、中國情報單位）長期被外界推測在做這件事。
- **內容今天無法重新加密**：如果今天傳出去的密文無法回收，未來解密的風險就確定存在。

對個人即時聊天、短期 session token，HNDL 風險低（內容過期、價值降低）。對銀行 KYC 文件、醫療影像、人權工作者的訪談紀錄，風險高。

NIST（IR 8547）把 2030 年定為棄用舊演算法、2035 年定為完全禁止使用的官方時間表，NSA CNSA 2.0 與 ENISA 的路線圖也圍繞這兩個年份[^1]。這個時程意味著新部署從現在起就應該規劃 PQC 路徑。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/pq-timeline.drawio.svg" alt="後量子密碼遷移時程：從 2023 Signal PQXDH、2024 NIST FIPS 與主流瀏覽器啟用、到 2030–2035 主要系統應完成轉換、2040 舊密碼學硬時間表">
</figure>

## NIST 2024 三大標準

NIST 從 2016 年啟動 PQC 競賽，2022 年初步選定算法，2024 年 8 月正式發布 FIPS 標準。

### ML-KEM（FIPS 203）：金鑰封裝

- 全名 Module-Lattice-based Key Encapsulation Mechanism（基於格密碼，一種量子電腦也難以求解的數學結構）。
- 基於 CRYSTALS-Kyber 演算法。
- 用途：取代 RSA-OAEP、ECDH 在 TLS、SSH、加密訊息中的金鑰交換角色。
- 效能：公鑰大小依安全等級而定（ML-KEM-512 為 800 bytes、ML-KEM-768 為 1184 bytes、ML-KEM-1024 為 1568 bytes），都比 X25519 的 32 bytes 大，封包略大但對一般連線速度沒有可感影響，運算速度快、硬體加速友善。

### ML-DSA（FIPS 204）：數位簽章

- 全名 Module-Lattice-based Digital Signature Algorithm。
- 基於 CRYSTALS-Dilithium 演算法。
- 用途：取代 RSA-PSS、ECDSA 在憑證、軟體簽章、區塊鏈中的角色。
- 簽章大小約 2.4–4.6 KB（依安全等級而定，比 ECDSA 的 64 bytes 大）。

### SLH-DSA（FIPS 205）：Hash-based 簽章

- 全名 Stateless Hash-based Digital Signature Algorithm。
- 基於 SPHINCS+。
- 用途：作為 ML-DSA 的備援，安全性只依賴 hash 函數的抗碰撞性，數學基礎最保守。
- 缺點：簽章大（約 8–50 KB，依參數集而定）、速度慢，適合長期憑證、不適合高頻簽章。

NIST 第四輪持續評估 code-based 演算法作為長期備援，2025 年選定 code-based 的 HQC 為第四個標準化 KEM（唯一的 isogeny-based KEM 候選 SIKE 已在 2022 年被破解移除）[^2]。短期內 ML-KEM + ML-DSA 是業界主流。

## 真實系統的轉換時程

業界 2024–2025 的實際進度：

### 瀏覽器與 TLS

- **Chrome 124**（2024-04）：預設啟用 X25519MLKEM768 混合金鑰交換。
- **Firefox 132**（2024-10）：預設啟用同上。
- **Safari**：跟進中。

混合（hybrid）的意思是「同時做傳統 ECDH + ML-KEM 兩次金鑰交換，把結果結合」。萬一 ML-KEM 將來被發現有漏洞，傳統 ECDH 仍提供保護。這是業界普遍採取的保險策略。

### Cloudflare、AWS、Google Cloud

- Cloudflare 自 2022 年起對所有客戶的 server 端連線預設啟用 PQ 金鑰協議，2024 年完成從 Kyber 草案版本遷移到正式 ML-KEM 標準[^3]，是全球部署最積極的 CDN 之一。
- AWS 2025-04 在 KMS、ACM、Secrets Manager 的 TLS 連線啟用 ML-KEM[^4]。
- Google Cloud 對企業客戶提供 PQC 選項。

### Signal Protocol

- Signal 2023 年發布 PQXDH（Post-Quantum Extended Diffie-Hellman），把後量子金鑰封裝（初期 CRYSTALS-Kyber，後升級至 ML-KEM）加入金鑰交換流程。
- 對前向保密與 PCS 的設計沒影響，僅在初次握手加上 PQC 層。
- 這是對 HNDL 威脅最直接的回應。

### SSH 與 PGP

- OpenSSH 9.0（2022）加入 sntrup761x25519 hybrid，9.9（2024）支援 ML-KEM hybrid。
- age、Sequoia PGP 等較新工具開始實驗 PQC，傳統 GnuPG 進度較慢。

### 區塊鏈與加密貨幣

- 比特幣的 ECDSA 與 Schnorr 簽章在大型量子電腦下不安全，但實際威脅取決於量子電腦的時程。
- 以太坊已有提案討論 PQ 簽章選項，但短期內優先序低。
- Zcash、Monero 等隱私幣的零知識證明系統也面臨 PQ 轉換挑戰。

## 個人與組織的時間表

使用者端不必額外處理的項目：

- 即時通訊（Signal、Matrix）已自動處理，使用者端無感。
- 一般網頁瀏覽（Chrome、Firefox 已啟用），使用者端無感。

需要主動規劃的項目：

- **企業 PKI 與憑證**：用於簽章、認證、長期存證的憑證需要規劃 ML-DSA 或 SLH-DSA 路徑。CA/B Forum 已開始討論 PQC 憑證標準。
- **VPN 與 IPSec**：商用 VPN 對 PQC 的支援不一致，公司網路規劃時要納入評估。
- **長期文件加密**：法務文件、醫療紀錄、研究資料需要評估「這份文件十年後仍要保密嗎」，是的話要選 PQC 加密。
- **硬體安全模組**（HSM）：金融、醫療領域的 HSM 需要供應商提供 PQC 演算法支援，更新週期長。

## 在地脈絡：政府、金融、醫療的合規時程

台灣的合規時程目前還在跟隨 NIST 與 ENISA 的步調：

- **政府機密通訊**：台灣各主管機關尚未公布明確的 PQC 轉換時程，預期跟隨 NIST 與 ENISA 的步調推動。
- **金融**：金融監督管理委員會預計 2026 年發布金融業 PQC 遷移參考指引，目前已成立先導小組建立技術清單，正式監理要求的時程尚未公布[^5]。
- **醫療**：醫療影像與電子病歷需長期保存（台灣《醫療法》規定病歷至少保存 7 年，部分影像與追蹤資料更久），對 HNDL 風險高，可能是國內最早需要主動規劃 PQC 的領域。

對個人與一般組織，現在不需要急著手動部署 PQC，有幾件事可以優先做：

- 採用會自動更新到 PQC 的工具（Chrome、Firefox、Signal、Cloudflare）。
- 評估自家的「長期保密資料」清單，把 HNDL 風險高的資料優先處理。
- 採購硬體與 SaaS 服務時把 PQC 路線圖納入評估。

關於密碼學基礎概念的延伸閱讀，見 [端對端加密如何運作](./e2ee.md) 與 [零知識身分驗證與支付](./zk-identity-payments.md)。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-key-chain-variant: 端對端加密如何運作](./e2ee.md)
- [:material-shield-key-outline: 零知識身分驗證與支付](./zk-identity-payments.md)
- [:material-web-box: 去中心化網站發布](./dweb-ipfs-onion.md)
- [:material-shield-account-outline: 威脅模型如何建立](../basics/threat-model.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)
- [:material-newspaper-variant-outline: 記者保護消息來源](../scenarios/journalist.md)
- [:material-account-edit-outline: 社運行動者的數位準備](../scenarios/activist.md)

</div>

[^1]: [NIST IR 8547: Transition to Post-Quantum Cryptography Standards](https://nvlpubs.nist.gov/nistpubs/ir/2024/NIST.IR.8547.ipd.pdf){target="_blank"} - NIST
[^2]: [NIST IR 8545: Status Report on the Fourth Round of the PQC Standardization Process](https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8545.pdf){target="_blank"} - NIST
[^3]: [Post-quantum cryptography for all](https://blog.cloudflare.com/post-quantum-for-all/){target="_blank"} - Cloudflare
[^4]: [ML-KEM post-quantum TLS now supported in AWS KMS, ACM, and Secrets Manager](https://aws.amazon.com/blogs/security/ml-kem-post-quantum-tls-now-supported-in-aws-kms-acm-and-secrets-manager/){target="_blank"} - AWS
[^5]: [金管會 2026 年六大資安重點](https://www.ithome.com.tw/news/173594){target="_blank"} - iThome
