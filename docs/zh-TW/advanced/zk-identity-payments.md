---
title: 零知識身分驗證與支付
description: 從 Monero 環簽名、Zcash zk-SNARKs，到鏈上分析的能與不能。延伸到零知識身分驗證在私密 KYC、合規揭露、捐款匿名情境的應用。
icon: material/shield-key-outline
---

# :material-shield-key-outline: 零知識身分驗證與支付

「鏈上隱私」這個詞容易讓人誤解。比特幣的帳本完全公開，每筆交易、每個地址的餘額都可以查到，這是一種極端。Zcash 的屏蔽交易連金額都看不見，是另一種極端。多數情況夾在中間：地址被混淆、金額被遮蔽、但圖譜仍可被推測。這篇文章拆開「鏈上隱私」的可見度光譜，介紹 Monero 與 Zcash 兩種主流路線，討論鏈上分析（chain analysis）的能與不能，最後延伸到零知識身分驗證（zk-identity）在支付情境的可能應用。

## 鏈上隱私的可見度光譜

監控者觀察一條鏈，會看到四個層次：

1. **帳戶**（Account）：誰擁有哪個地址。比特幣公開，Monero 用 stealth address 隱匿。
2. **金額**（Amount）：這筆交易轉了多少。比特幣公開，Monero 用 RingCT 隱匿，Zcash 屏蔽交易完全隱藏。
3. **時間圖譜**（Transaction Graph）：A 跟 B 之間的轉帳路徑。比特幣可重建完整圖譜，Monero 用 ring signatures 製造誘餌混淆，Zcash 屏蔽交易看不到圖譜。
4. **元資料**（Metadata）：交易由哪個 IP、哪個錢包客戶端、什麼時間點送出。所有鏈都仰賴 P2P 網路層的隱私（搭配 Tor、Dandelion++ 等）。

「隱私穩定幣」的設計，多半在這四層中挑某幾層做隱匿。四層全部隱匿的設計實際上很少。理解這四層的差別，比記住「哪個幣最匿名」更有幫助。

## Monero 怎麼做：環簽名 + Stealth Address + RingCT

Monero 的設計來自 2013 年的 CryptoNote 白皮書，三個核心機制：

- **Stealth Address**：每筆交易產生新的一次性收款地址，從鏈上看不到「Alice 的地址收了 100 元」，只看到「某個一次性地址收了 100 元」。Alice 用自己的私鑰能識別出哪些一次性地址是她的。
- **Ring Signatures**：寄件人簽署交易時，把自己的真實簽章混進其他過去交易輸出的「誘餌」（decoys）中。觀察者只能確定「這 16 個輸出之一是真的」，但無法確定哪一個。Monero 目前預設環大小為 16。
- **RingCT**（Ring Confidential Transactions）：用 Bulletproofs+ 同態承諾隱藏金額，同時證明「輸入總和等於輸出總和」（沒有憑空印錢）。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/monero-ring.drawio.svg" alt="Monero Ring Signature 示意：寄件人的真實簽章混進 15 個誘餌中，環大小 16，觀察者只能驗證「16 個之一是真的」、無法反推哪一個">
</figure>

三者組合下，鏈上看到的是：「某個一次性地址收到一筆隱藏金額，由 16 個可能寄件人之一發送」。沒有 Alice 與 Bob 的概念。

代價是區塊鏈體積大、交易驗證計算重、合規挑戰大。多數 KYC 交易所自 2020 年起陸續下架 Monero。

## Zcash 怎麼做：zk-SNARKs 與屏蔽池

Zcash 走的是另一條更激進的路線。屏蔽交易（shielded transaction）用 zk-SNARKs（Zero-Knowledge Succinct Non-Interactive Argument of Knowledge）證明：

- 我有花費這個 note 的權限。
- 我創造的新 note 金額總和等於消耗的 note 金額。
- 沒有重複花費。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/zcash-shielded.drawio.svg" alt="Zcash 屏蔽交易：寄件人與收件人之間透過 zk-SNARK 證明連線。鏈上可見的部分：proof、nullifier、commitment、手續費。鏈上不可見的部分：寄件人地址、收件人地址、金額、圖譜關聯">
</figure>

整個證明在鏈上只有幾百 bytes，驗證者不需要知道金額、地址、來源。從鏈上看到的屏蔽交易只有「有一筆屏蔽交易發生」，看不到金額、寄件人、收件人。

Zcash 經歷過幾代 zk-SNARKs：

- **Sprout**（2016）：用 PGHR13，需要可信設定（trusted setup）。
- **Sapling**（2018）：升級到 Groth16，可信設定範圍更小，效能大幅改善。
- **Halo 2**（2022 起逐步部署）：完全去除可信設定的需要，是密碼學工程上的重大進展。

Zcash 的問題在使用率：屏蔽池（shielded pool）的使用人數遠少於透明池（transparent pool），實際上多數交易仍是透明的。隱私的密碼學保證再好，沒有足夠的屏蔽流量做混淆，被分析的風險仍在。

## 鏈上分析的能與不能

Chainalysis、Elliptic、TRM Labs 這類公司服務政府與金融機構，把鏈上資料轉成可訴訟、可凍結、可追溯的情報。它們公開揭露的能力與限制：

**能做的**：

- 比特幣的完整圖譜重建：跨多筆交易、多個地址，把屬於同一個實體的地址分群（clustering）。
- 已知交易所、混幣服務、暗網市場的標籤匹配。
- Zcash 透明池與屏蔽池的「進出邊界」分析：屏蔽池內部不可見，但進入屏蔽池的金額與時間可看到。
- Monero 早期低環大小時代的部分還原。環大小提升到 11 之後大幅降低，到 16 後幾乎不可行。

**做不到的**：

- Monero 當前環大小（16）下的真實寄件人辨識，計算上不可行。
- Zcash 完全屏蔽交易（shielded-to-shielded）的還原。
- 不公開的鏈上活動（如 P2P 直接交易、未上鏈的閃電網路通道內部）。

關鍵洞察是「混淆的有效性取決於使用人數」。當所有人都用屏蔽池，匿名集（anonymity set）夠大，分析難度極高。當只有少數人用，反而被標記為「可疑活動」。

## 零知識身分驗證：證明屬性而不洩漏屬性

zk-SNARKs 的應用不限於支付。把它套到「身分驗證」會出現一個全新的能力：證明你具備某個屬性，而不洩漏屬性的具體值。

例如：

- **proof-of-age**：證明「我超過 18 歲」，不洩漏出生年月日。
- **proof-of-citizenship**：證明「我是台灣公民」，不洩漏身分證字號。
- **proof-of-uniqueness**：證明「我是個獨特的人，不是 bot」，不洩漏是誰。

幾個正在發展的系統：

- **World ID**（前 Worldcoin）：用 iris scan 產生獨特性憑證，使用者用 zk proof 證明「我是獨特的人」，不洩漏 iris 資料。
- **Polygon ID**：基於 Iden3 框架，把政府、銀行、醫療等機構發出的可驗證憑證（Verifiable Credential）轉成 zk proof。
- **Anon Aadhaar**：印度國民身分系統的 zk 包裝，使用者可證明「我有有效的 Aadhaar」，不洩漏號碼。

這些系統共同的設計目標是：把「我證明 X」與「我把 X 揭露給誰」徹底分離。傳統 KYC 流程是「我把護照影本給你，你決定信不信」。zk 身分驗證是「我給你一個證明，你能驗證但拿不到原始資料」。

## 支付情境的應用

零知識證明套到支付情境，能解的問題包括：

- **私密 KYC**：證明「這筆交易來自合規 KYC 過的個人」，不洩漏個人身分。對交易所是合規滿足，對使用者是身分保護。
- **合規揭露**：監管機構需要稽查時，使用者可以選擇性揭露特定屬性（例如「這筆超過 100 萬的交易，我是合規的個人」），其他資訊維持隱私。
- **捐款匿名**：捐款人可證明「我已捐贈合法可抵稅金額」，不洩漏個人。對倡議組織保護金主，對主管機關仍可稽核總額。
- **薪資隱私**：員工證明「我有資格接收這個 NGO 的薪資補助」，不洩漏個人薪資水準。

理論上很乾淨，實作上最大的瓶頸是「驗證者要相信底層的 zk 系統」。可信設定、軟體實作 bug、量子電腦對橢圓曲線的長期威脅，都是要管理的風險。

## 在地脈絡：VASP 法 2026 對隱私支付的影響

台灣 VASP 法 2026（虛擬資產服務業專法）將 KYC、Travel Rule 落實到加密幣交易所層級。這對隱私支付的影響有三層：

1. **交易所端**：本地交易所提供 Monero、Zcash 屏蔽交易等隱私功能會面臨明確監管壓力，可能下架或限制。
2. **使用者端**：使用者透過去中心化交易所（DEX）或 P2P 持有隱私幣的途徑仍開放，但匯入匯出本地法幣的接口受限。
3. **倡議組織端**：接受加密幣捐款的 NGO 必須在「捐款人匿名性」與「會計合規揭露」之間找平衡。零知識身分驗證可能成為新的選項，但生態還不成熟。

關於 VASP 法的詳細條文與技術影響，見 [台灣 VASP 法 2026](../taiwan/vasp-2026.md)。對「為什麼匿名支付對社運倡議重要」的整體脈絡，見 [為什麼匿名支付重要](../basics/payments-anonymity.md)。社群在 [匿名支付研究專題](../community/payments-research.md) 持續追蹤這個方向。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-cash-multiple: 為什麼匿名支付重要](../basics/payments-anonymity.md)
- [:material-currency-btc: 加密貨幣隱私光譜](../tools/crypto-privacy-spectrum.md)
- [:material-key-chain-variant: 端對端加密如何運作](./e2ee.md)
- [:material-atom-variant: 後量子密碼概觀](./post-quantum.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-cash-multiple: 匿名支付研究專題](../community/payments-research.md)
- [:material-scale-balance: 台灣 VASP 法 2026](../taiwan/vasp-2026.md)
- [:material-handshake-outline: 倡議組織的匿名捐款](../scenarios/nonprofit-anonymous-donation.md)

</div>
