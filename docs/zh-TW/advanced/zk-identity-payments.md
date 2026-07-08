---
title: 零知識身分驗證與支付
description: 從 Monero 環簽名、Zcash zk-SNARKs，到鏈上分析的能與不能。延伸到零知識身分驗證在私密 KYC、合規揭露、捐款匿名情境的應用。
icon: material/shield-key-outline
---

# :material-shield-key-outline: 零知識身分驗證與支付

「鏈上隱私」這個詞容易讓人誤解。比特幣的帳本完全公開，每筆交易、每個地址的餘額都可以查到，這是一種極端。Zcash 的遮蔽交易連金額都看不見，是另一種極端。多數情況介於兩者之間：地址被混淆、金額被遮蔽，但圖譜仍可被推測。這篇文章拆開「鏈上隱私」的可見度光譜，介紹 Monero 與 Zcash 兩種主流路線，討論鏈上分析（chain analysis）的能與不能，最後延伸到零知識身分驗證（zk-identity）在支付情境的可能應用。

## 鏈上隱私的可見度光譜

監控者觀察一條鏈，會看到四個層次：

1. **帳戶**（Account）：誰擁有哪個地址。比特幣公開，Monero 用 stealth address 隱匿。
2. **金額**（Amount）：這筆交易轉了多少。比特幣公開，Monero 用 RingCT 隱匿，Zcash 遮蔽交易完全隱藏。
3. **時間圖譜**（Transaction Graph）：A 跟 B 之間的轉帳路徑。比特幣可重建完整圖譜，Monero 用 ring signatures 製造誘餌混淆，Zcash 遮蔽交易看不到圖譜。
4. **元資料**（Metadata）：交易由哪個 IP、哪個錢包客戶端、什麼時間點送出。所有鏈都仰賴 P2P 網路層的隱私，搭配 Tor，或 Dandelion++ 這類把交易廣播路徑打散、隱藏來源 IP 的協議。

「隱私穩定幣」的設計，多半在這四層中挑某幾層做隱匿，四層全部隱匿的設計實際上很少。Monero 與 Zcash 各自選了不同的組合。

## Monero 如何做到：環簽名 + Stealth Address + RingCT

Monero 的設計來自 2013 年的 CryptoNote 白皮書，三個核心機制：

- **Stealth Address**：每筆交易產生新的一次性收款地址，從鏈上看不到「Alice 的地址收了 100 元」，只看到「某個一次性地址收了 100 元」。Alice 用自己的私鑰能識別出哪些一次性地址是她的。
- **Ring Signatures**：寄件人簽署交易時，把自己的真實簽章混進其他過去交易輸出的「誘餌」（decoys）中。觀察者只能確定「這 16 個輸出之一是真的」，但無法確定哪一個。Monero 目前預設環大小為 16。
- **RingCT**（Ring Confidential Transactions）：用 Pedersen 同態承諾（一種能在不揭露數字的前提下、仍可驗算加總的加密承諾）隱藏金額，再以 Bulletproofs+ 範圍證明確保每筆金額非負，整體證明「輸入總和等於輸出總和」（沒有憑空印錢）。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/monero-ring.drawio.svg" alt="Monero Ring Signature 示意：寄件人的真實簽章混進 15 個誘餌中，環大小 16，觀察者只能驗證「16 個之一是真的」、無法反推哪一個">
</figure>

三者組合下，鏈上看到的是：「某個一次性地址收到一筆隱藏金額，由 16 個可能寄件人之一發送」。沒有 Alice 與 Bob 的概念。對照前面四層，stealth address 蓋掉帳戶層、RingCT 蓋掉金額層、ring signatures 打散圖譜層，第四層元資料仍要靠 Tor 另外處理。

代價是區塊鏈體積較大、交易驗證計算重，且隱匿交易難以滿足 KYC（實名驗證）的合規要求。要求 KYC 的交易所自 2021 年起陸續下架 Monero，2023 至 2024 年下架規模最大（包含 Kraken 歐洲區、Binance、OKX）[^1]。

## Zcash 如何做到：zk-SNARKs 與遮蔽池

Zcash 走的是另一條更激進的路線。遮蔽交易（shielded transaction）用 zk-SNARKs（Zero-Knowledge Succinct Non-Interactive Argument of Knowledge，一種能證明「我知道某個秘密」卻不洩漏秘密內容的密碼學工具）證明：

- 我有花費這個 note 的權限。
- 我創造的新 note 金額總和等於消耗的 note 金額。
- 沒有重複花費。

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/zcash-shielded.drawio.svg" alt="Zcash 遮蔽交易：寄件人與收件人之間透過 zk-SNARK 證明連線。鏈上可見的部分：proof、nullifier、commitment、手續費。鏈上不可見的部分：寄件人地址、收件人地址、金額、圖譜關聯">
</figure>

整個證明在鏈上只有幾百 bytes，驗證者不需要知道金額、地址、來源。從鏈上能看到的只有「有一筆遮蔽交易發生」這個事實。對照四層，遮蔽交易一次蓋掉帳戶、金額、圖譜三層，第四層元資料同樣留給網路層處理。

Zcash 經歷過幾代 zk-SNARKs：

- **Sprout**（2016）：用 BCTV14（PGHR13 的改良變體），需要可信設定（trusted setup）[^2]。
- **Sapling**（2018）：升級到 Groth16，可信設定範圍更小，效能大幅改善。
- **Halo 2**（2022 年 5 月隨 NU5 升級啟動）：完全去除可信設定的需要，是密碼學工程上的重大進展。

Zcash 的問題長期在使用率：遮蔽池（shielded pool）的使用人數一度遠少於透明池（transparent pool），多數交易仍是透明的（2025 年起遮蔽池占比明顯上升，但完整遮蔽交易仍非全部）。隱私的密碼學保證再好，沒有足夠的遮蔽流量做混淆，被分析的風險仍在。

## 鏈上分析的能與不能

鏈上分析是一個專門替政府與金融機構追蹤加密貨幣金流的產業。Chainalysis、Elliptic、TRM Labs 這類公司把鏈上資料轉成可訴訟、可凍結、可追溯的情報。它們公開揭露的能力與限制：

**能做的**：

- 比特幣的完整圖譜重建：跨多筆交易、多個地址，把屬於同一個實體的地址分群（clustering）。
- 已知交易所、混幣服務、暗網市場的標籤匹配。
- Zcash 透明池與遮蔽池的「進出邊界」分析：遮蔽池內部不可見，但進入遮蔽池的金額與時間可看到。
- Monero 早期低環大小時代的部分還原。環大小提升到 11、再到 16 之後，已知機率分析方法的追蹤難度大幅上升[^3]。

**做不到的**：

- Monero 當前環大小（16）下的真實寄件人辨識，目前學術界尚無已發表的有效還原方法。
- Zcash 完全遮蔽交易（shielded-to-shielded）的還原。
- 不公開的鏈上活動（如 P2P 直接交易、未上鏈的閃電網路通道內部）。

混淆的有效性取決於使用人數。當所有人都用遮蔽池，匿名集（anonymity set）夠大，分析難度極高。當只有少數人用，反而被標記為「可疑活動」。

鏈上分析的能力有邊界，但合規要求不會消失。把「證明自己合規」與「揭露自己是誰」拆開，正是零知識證明在身分領域能著力的地方。

## 零知識身分驗證：證明屬性而不洩漏屬性

zk-SNARKs 的應用不限於支付。把它套到「身分驗證」會出現一個全新的能力：證明你具備某個屬性，而不洩漏屬性的具體值。

例如：

- **proof-of-age**：證明「我超過 18 歲」，不洩漏出生年月日。
- **proof-of-citizenship**：證明「我是台灣公民」，不洩漏身分證字號。
- **proof-of-uniqueness**：證明「我是個獨特的人，不是 bot」，不洩漏是誰。

幾個正在發展的系統：

- **World ID**（所屬專案 Worldcoin 已於 2024 年更名為 World）：用 iris scan 產生獨特性憑證，使用者用 zk proof 證明「我是獨特的人」，不洩漏 iris 資料。
- **Polygon ID**：基於 Iden3 框架，把政府、銀行、醫療等機構發出的可驗證憑證（Verifiable Credential）轉成 zk proof。
- **Anon Aadhaar**：印度國民身分系統的 zk 包裝，使用者可證明「我有有效的 Aadhaar」，不洩漏號碼。

三者成熟度差距大：Polygon ID 生態最完整，但需要 DID 基礎設施。Anon Aadhaar 只服務印度身分系統。World ID 最通用，但 iris scan 的爭議也最大。台灣目前沒有對應的本地服務。

這些系統共同的設計目標是把「我證明 X」與「我把 X 揭露給誰」徹底分離。傳統 KYC 流程是「我把護照影本交給你，你判斷是否信任」。零知識身分驗證是「我給你一個證明，你能驗證但無法取得原始資料」。

## 支付情境的應用

零知識證明套到支付情境，能解的問題包括：

- **私密 KYC**：證明「這筆交易來自合規 KYC 過的個人」，不洩漏個人身分。對交易所是合規滿足，對使用者是身分保護。
- **合規揭露**：監管機構需要稽查時，使用者可以選擇性揭露特定屬性（例如「這筆超過 100 萬的交易，我是合規的個人」），其他資訊維持隱私。
- **捐款匿名**：捐款人可證明「我已捐贈合法可抵稅金額」，不洩漏個人。對倡議組織保護金主，對主管機關仍可稽核總額。
- **薪資隱私**：員工證明「我有資格接收這個 NGO 的薪資補助」，不洩漏個人薪資水準。

理論上很乾淨，實作上最大的瓶頸是「驗證者要相信底層的 zk 系統」。可信設定、軟體實作 bug、量子電腦對橢圓曲線的長期威脅，都是要管理的風險。

## 在地脈絡：虛擬資產服務法（VASP 專法）對隱私支付的影響

台灣《虛擬資產服務法》（2026 年草案，俗稱 VASP 專法）擬把 KYC、Travel Rule 落實到加密幣交易所層級。草案 2026 年 4 月經行政院通過送立法院，6 月完成委員會初審，尚未三讀立法[^4]。若通過，對隱私支付的影響有三層：

1. **交易所端**：本地交易所提供 Monero、Zcash 遮蔽交易等隱私功能會面臨明確監管壓力，可能下架或限制。
2. **使用者端**：使用者透過去中心化交易所（DEX）或 P2P 持有隱私幣的途徑仍開放，但匯入匯出本地法幣的管道受限。
3. **倡議組織端**：接受加密幣捐款的 NGO 必須在「捐款人匿名性」與「會計合規揭露」之間找平衡。舉例來說，台灣的倡議團體若想收 Monero 捐款保護金主，本地交易所多半已下架 Monero，得透過海外平台或 P2P 換成法幣，會計上要對主管機關交代捐款總額並不容易。零知識身分驗證可能成為新的選項（捐款人證明「我捐了合法可抵稅的金額」，組織仍能對主管機關揭露總額），但生態還不成熟。

香港的框架與風險層級不同。當地自 2023 年 6 月起實施 VATP（虛擬資產交易平台）發牌制度，由證監會（SFC）依《證券及期貨條例》監理，散戶只能在持牌平台交易符合資格的代幣，Monero、Zcash 這類隱私幣因與 AML（洗錢防制）、KYC 要求衝突，實務上幾乎無法在持牌平台上架[^hk]。香港倡議捐款要擔心的核心風險，是資金用途本身可能被定性為危害國家安全。在為 2019 年反送中運動被捕者提供人道援助的「612 人道支援基金」案裡，基金遭調查停運，五名信託人一度以《國安法》第 29 條被捕，最終改以《社團條例》未註冊定罪。零知識身分驗證在這裡的意義，是讓捐款人不必把身分留在可能被國安調查回溯的紀錄裡，但它擋不掉「資金流向本身被定性為危害國安」這一層，技術做得再乾淨也無法取代法律風險評估。

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

[^1]: [Monero, Zcash and other privacy coins face delisting wave](https://www.coinspeaker.com/monero-xmr-zcash-zec-privacy-coins-delisting/){target="_blank"} - Coinspeaker
[^2]: [Zcash Counterfeiting Vulnerability Successfully Remediated](https://electriccoin.co/blog/zcash-counterfeiting-vulnerability-successfully-remediated/){target="_blank"} - Electric Coin Company
[^3]: [The rise of Monero: traceability challenges and research review](https://www.trmlabs.com/resources/blog/the-rise-of-monero-traceability-challenges-and-research-review){target="_blank"} - TRM Labs
[^4]: [行政院會通過「虛擬資產服務法」草案](https://www.ey.gov.tw/Page/9277F759E41CCD91/bfd446a7-ce23-4308-9347-9ce6e6c44196){target="_blank"} - 行政院
[^hk]: 香港 VATP 發牌制度自 2023 年 6 月生效見 [New Hong Kong Regulatory Requirements and Licensing Regime for Virtual Asset Trading Platforms](https://www.gibsondunn.com/wp-content/uploads/2023/06/new-hong-kong-regulatory-requirements-and-licensing-regime-for-virtual-asset-trading-platforms-finalised-as-legislation-takes-effect.pdf){target="_blank"} - Gibson Dunn、[持牌 VATP 名單](https://www.sfc.hk/en/Welcome-to-the-Fintech-Contact-Point/Virtual-assets/Virtual-asset-trading-platforms-operators/Lists-of-virtual-asset-trading-platforms){target="_blank"} - SFC。「612 人道支援基金」案見 [Cardinal Zen and 4 others appeal against conviction over failing to register protester relief fund as society](https://hongkongfp.com/2022/12/14/cardinal-zen-and-4-others-appeal-against-conviction-over-failing-to-register-protester-relief-fund-as-society/){target="_blank"} - Hong Kong Free Press。
