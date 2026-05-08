---
title: 加密貨幣的隱私光譜
description: 比特幣、以太坊、Monero、Zcash 與穩定幣的隱私差異，以及自管錢包與多重簽署。
icon: material/currency-btc
---

# :material-currency-btc: 加密貨幣的隱私光譜

你想匿名訂閱一份政治敏感的電子報、給海外的調查記者打賞、為準備離開的家暴倖存者備一筆對方看不到的資金。每個情境都有人推薦「用加密貨幣付款」當預設答案，但比特幣與 Monero 的隱私差距，跟現金與信用卡的差距一樣大。

這篇文章把幾個常見幣種排出一條光譜，幫你判斷對手是誰、願意付出多少摩擦、哪一段隱私強度足夠你的需求。不需要懂密碼學，原理連結放在每段，等你需要時再深入。如果想直接讀技術細節，可延伸到 [零知識身分驗證與支付](../advanced/zk-identity-payments.md)。

!!! tip "30 秒結論"

    - **個人匿名訂閱**：Monero（錢包用 Cake Wallet）或 BTC 閃電網路（Phoenix）。
    - **組織跨境收款**：USDC 或 BTC，搭配 2-of-3 multisig。
    - **緊急資金調度**：預付禮物卡 + 現金優先，技術門檻夠才用 BTC。

    展開細節見下方各情境段。

## 一張表先看光譜

公開可查的：BTC、ETH、穩定幣。預設隱藏的：只有 Monero。Zcash 看你怎麼選。

| 幣種 | 帳戶 | 金額 | 圖譜 | 取得難度 | 合規風險 |
|---|---|---|---|---|---|
| 比特幣（BTC） | 公開 | 公開 | 可重建 | 低（多數交易所支援） | 低 |
| 以太坊（ETH） | 公開 | 公開 | 可重建 | 低 | 低 |
| 穩定幣（USDT、USDC、DAI） | 公開 | 公開 | 可重建 | 低 | 中（發行方可凍結） |
| Zcash 透明池（t-addr） | 公開 | 公開 | 可重建 | 中 | 低 |
| Zcash 屏蔽池（z-addr） | 隱藏 | 隱藏 | 屏蔽池內不可見 | 中至高 | 中至高 |
| Monero（XMR） | 隱藏 | 隱藏 | 誘餌混淆 | 中至高（KYC 交易所多已下架） | 中至高 |

「合規風險」一欄反映個人使用者在主流司法管轄下的可能阻力，主要表現在交易所是否願意處理、銀行是否願意對接。實際責任請對照所在地法規。

## 對應你的情境

沒有「最匿名」的單一答案，只有對應你威脅模型的組合。下面三個常見情境作為起點。每段給你「推薦組合 + 一句為什麼」，想知道為什麼這樣搭，往下看對應幣種的段落。

### 個人小額訂閱（每月幾美元）

威脅：訂閱事實本身會定義你（敏感議題的電子報、獨立媒體）。需求：低摩擦、低金額、可重複。

- 對手方接受 Monero：用 Monero（取得管道：原子交換 BTC 轉 XMR），錢包用 Cake Wallet 或 Feather。為什麼選 Monero，看 [§Monero](#monero)。
- 對手方只接受 BTC、USDT：BTC 走閃電網路（Phoenix、Blue Wallet），或用穩定幣搭配每次新建地址。
- 對手方接受預付禮物卡：[為什麼匿名支付重要](../basics/payments-anonymity.md) 討論的低門檻方案可能更省事。

### 組織跨境收款

威脅：捐款人匿名性、組織會計合規、跨境流動性。需求：可規模化、可稽核、合法揭露。

- 主管道用比特幣或 USDC（流動性與會計工具最成熟），搭配 multisig（2-of-3 起跳，至少一把在組織外的會計師或理事手上）。為什麼用 multisig，看 [§multisig](#multisig)。
- 願意承擔合規門檻的組織再加 Monero 或 Zcash 屏蔽池作為額外管道，明確標示「進階匿名」。
- 完整流程與稅務見 [倡議組織的匿名捐款管道](../scenarios/nonprofit-anonymous-donation.md)。

### 緊急資金調度（家暴倖存者準備離開）

威脅：加害者可能監控家庭網銀、共用裝置、共用記事本。需求：自己可立即取用、不留下被監控者可見的痕跡。

- 預付禮物卡或現金優先（取得門檻最低、不需要技術設定）。
- 加密貨幣：用獨立裝置（不是家裡共用電腦）、新的種子片語、不在家中網路操作。錢包選 Bitcoin Core 或 Electrum，搭配硬體錢包（Coldcard、SeedSigner）寄到信任的人手上。
- 場景指引可從 [為什麼匿名支付重要](../basics/payments-anonymity.md) 與 [威脅模型怎麼想](../basics/threat-model.md) 延伸。

## 監控者實際看得到什麼

剛才那張表的欄位是怎麼來的？看一條公開鏈時，外界看得見的東西落在四個維度：

- **帳戶**：誰擁有哪個地址。比特幣、以太坊、穩定幣公開可查，Monero 用 stealth address 隱匿，Zcash 屏蔽交易連地址都看不到。
- **金額**：這筆交易轉了多少。比特幣與多數鏈公開，Monero 用 RingCT 隱藏，Zcash 屏蔽交易完全不可見。
- **圖譜**：A 跟 B 之間的轉帳路徑。比特幣可重建完整圖譜，以太坊類似，Monero 用環簽名製造誘餌，Zcash 屏蔽池內部不可見。
- **Metadata**：交易由哪個 IP、哪個錢包客戶端、什麼時間送出。所有鏈都依賴 P2P 網路層的隱私（搭配 Tor、Dandelion++）。

四個維度的內部機制與鏈上分析的能與不能，在 [零知識身分驗證與支付](../advanced/zk-identity-payments.md) 有完整討論。這頁只用這四個維度當作後續比較的尺。

## 比特幣與以太坊：所有人都查得到

比特幣與以太坊的鏈是公開帳本。只要拿到地址，任何人都能查到收發紀錄、餘額、與哪些地址互動過。隱私落在地址層而非身分層：地址本身沒有名字，只要在某個 KYC 交易所提領過、留下 IP、寄送給已標記過的地址，鏈上分析公司（Chainalysis、TRM Labs）就能把屬於同一個實體的地址分群（clustering）。

取得管道對可追溯性的影響很大：

- **KYC 交易所**：Coinbase、Binance、MaxiCoin 這類本地或跨國交易所要求實名註冊。從交易所提到自管地址的那一筆，會把鏈上身分跟法定身分綁起來。
- **去中心化交易所（DEX）**：Uniswap、Curve 等鏈上交易協議不要求 KYC，但你跟它互動的地址仍公開可查，圖譜上看得到。
- **點對點（P2P）**：Bisq、Hodl Hodl、本地的 OTC 群。能繞開 KYC，但對手方信任、價差、流動性是門檻。

實務上，比特幣與以太坊在四個維度中只有 Metadata 可以靠 Tor 改善，帳戶、金額、圖譜三層都是設計上公開的。要在 BTC 或 ETH 上獲得更多隱私，多半要靠協議外的混淆機制。

## CoinJoin 與 mixers：為什麼社群不再主推

CoinJoin 是比特幣早期的隱私強化路線：多名使用者把交易合併成一筆，外界無法分辨哪個輸入對應哪個輸出。代表性實作有 Wasabi Wallet、Samourai Wallet 的 Whirlpool 服務，以及在以太坊上的 Tornado Cash。

!!! warning "法律風險：2024 年後的三件事"

    - **Tornado Cash**：2022 年被美國 OFAC 列入 SDN 清單，是首次對「智慧合約地址」本身的制裁。
    - **Samourai Wallet**：2024 年開發者被美國司法部起訴並關閉服務。
    - **Wasabi Wallet**：營運方 zkSNACKs 在 2024 年公告停止 CoinJoin 協調服務。

對台灣使用者的判斷重點：技術本身沒有犯罪化，「協調服務」與「混幣輸出」在多數司法管轄會引發合規關切。詳細案例分析見 [倡議組織的匿名捐款管道](../scenarios/nonprofit-anonymous-donation.md) 的 Tornado Cash 段落。社群目前的立場是把這條路線當作背景知識，不再做為主推工具。

## 穩定幣：方便，但會被凍結

穩定幣是法幣連動的鏈上資產，便於跨境支付與保值。隱私特性繼承所在鏈，並帶來幣種特有的反隱私風險：發行方的凍結權。

- **USDT（Tether）、USDC（Circle）**：中心化發行，發行方持續維護黑名單地址，可單方面凍結指定地址的餘額。歷史上已對 OFAC 制裁、駭客地址、執法請求多次執行凍結。
- **DAI（MakerDAO 出身）**：曾以「去中心化、無凍結」為設計目標。其抵押品中的 USDC 比例上升後，間接受 Circle 政策影響。
- **算法穩定幣**：Terra/Luna 在 2022 年崩盤後，主流支付情境的成功案例有限。

從匿名支付角度看，穩定幣的價值來自跨境流動性與低波動。它不擅長隱私。要在穩定幣上獲得隱私，多半要轉到隱私鏈上的包裝資產（如 Zcash 上的橋接資產），代價是流動性大幅下降。

## Monero：強匿名，取得有摩擦 {#monero}

Monero 把帳戶、金額、圖譜這三個維度的隱藏內建成預設行為。stealth address、ring signatures、RingCT 三個機制疊加，鏈上看不到 Alice 與 Bob 的概念，只看到「某個一次性地址收到一筆隱藏金額，由 16 個可能寄件人之一送出」。原理細節見 [零知識身分驗證與支付](../advanced/zk-identity-payments.md)。

- **錢包**：Cake Wallet（行動裝置與桌面）、Feather Wallet（桌面、輕量、開源）、Monero GUI（官方桌面）。
- **合規處境**：在台灣個人持有與點對點交易未受明文禁止，但本地交易所幾乎不提供 XMR 對接。VASP 法 2026 通過後，本地對接可能更受限。

!!! note "怎麼買 Monero（不靠 KYC 交易所）"

    多數 KYC 交易所自 2020 年起陸續下架 Monero。實務上的取得管道：

    - 去中心化交易（Haveno）。
    - P2P 平台（LocalMonero 已關閉，Bisq、RetoSwap 是現存選項）。
    - 先持有 BTC 或 USDT，透過原子交換（atomic swap）轉成 XMR。

Monero 的設計強度高，代價是取得摩擦大、合規空間窄。

## Zcash：可選隱私，弱在使用率 {#zcash}

Zcash 的屏蔽交易（shielded transaction）走 zk-SNARKs 路線，鏈上看不到金額、寄件人、收件人。Zcash 同時保留「透明池」（t-addr，跟比特幣一樣公開）給合規情境用，使用者可以選擇要不要走屏蔽。

**真實弱點落在使用率**：屏蔽池的活躍使用者遠少於透明池，多數鏈上交易仍是透明的。匿名集（anonymity set）小，分析難度其實沒有設計上那麼高。Halo 2 升級後完全去除可信設定的需要，是密碼學工程的重大進展，但沒解決使用率問題。

實務取捨：

- **錢包**：Zashi（行動裝置，Electric Coin Company 出品）、Ywallet（多鏈、支援 Zcash 與其他資產）、Zecwallet Lite（桌面）。
- **取得管道**：部分主流交易所仍上架 Zcash（透明池），shielded-to-shielded 的合規門檻較高，部分交易所只接受透明池進出。
- **建議流程**：取得後立即從 t-addr 轉到 z-addr（屏蔽），完成支付後若要兌回法幣再從 z-addr 轉回 t-addr。中間在屏蔽池內的交易能維持高隱私。

## 誰持有私鑰：託管 vs 自管

不論幣種，託管與自管的差別都是同一個決策：誰持有私鑰。

- **託管錢包**：交易所帳戶（Binance、Coinbase）、第三方託管服務。優點是備份不會遺失、客服可協助。缺點是需要 KYC、可被凍結、存在交易所倒閉與內部盜用風險（FTX 是近年代表性事件）。
- **自管錢包**：私鑰由使用者持有。優點是不依賴第三方、不用 KYC、不可被凍結。缺點是私鑰遺失等於資金消失，責任全在自己。

各幣種常見的自管錢包：

| 幣種 | 桌面 | 行動裝置 | 進階（含硬體） |
|---|---|---|---|
| BTC | Bitcoin Core、Electrum、Sparrow | Blue Wallet、Phoenix（閃電網路） | Coldcard、SeedSigner |
| ETH 與穩定幣 | Frame、Rabby | MetaMask、Rainbow | Ledger、Trezor |
| Monero | Monero GUI、Feather | Cake Wallet | （硬體支援有限） |
| Zcash | Zecwallet Lite、Ywallet | Zashi | （硬體支援有限） |

硬體錢包（Ledger、Trezor、Coldcard、SeedSigner）是自管的進階選項：私鑰存在裝置內，簽署時不離開硬體。Ledger 在 2023 年的 Recover 服務爭議引發信任問題後，部分使用者轉向開源的 Coldcard 或 SeedSigner。

## multisig：把鑰匙拆給多個人 {#multisig}

multisig 把單一私鑰拆成多把鑰匙，需要其中 N 把同意才能花費。常見配置是 2-of-3（三把鑰匙、任兩把可動用）、3-of-5（五把鑰匙、任三把可動用）。

multisig 對隱私與安全的價值：

- **降低圖譜可追溯度**：把單一錢包拆成多個 multisig 地址後，不同用途的資金分散在不同地址，圖譜上難以還原成「同一個人」。
- **降低單點失效**：單一鑰匙遺失或被盜不等於資金消失。對組織尤其重要。
- **權責分離**：組織內可以由不同角色持有不同鑰匙，動用資金需要協作而非個人決定。

各幣種對 multisig 的支援度不同：

- **比特幣**：支援度最完整，Sparrow、Caravan、Specter 提供易用介面，社群成熟。
- **以太坊**：透過智慧合約實作（Safe，前 Gnosis Safe），是 Web3 組織錢包的事實標準。
- **Monero**：協議層支援，錢包軟體支援度與工具成熟度遠低於 BTC、ETH。實務上組織用 Monero 做 multisig 的案例不多。
- **Zcash**：屏蔽池目前不支援 multisig，透明池可用但失去隱私優勢。

multisig 的常見坑：

- **金鑰備份**：N 把鑰匙都要有可靠的備份策略，否則 N-1 把遺失後資金永遠鎖死。
- **社工攻擊**：攻擊者不必拿到所有鑰匙，只要說服 N 個鑰匙持有人簽署一筆惡意交易即可。
- **協作摩擦**：每次動用資金都要 N 個人協調，日常小額支付用不上。

組織端的具體實作建議見 [倡議組織的匿名捐款管道](../scenarios/nonprofit-anonymous-donation.md)。

## 法規與在地

!!! info "在地脈絡：VASP 法 2026"

    台灣 VASP 法 2026 通過後，本地交易所對隱私功能的支援會明顯收緊：Monero 與 Zcash 屏蔽交易在本地對接的可能性降低，使用者要更倚賴 DEX、P2P、原子交換等管道。穩定幣發行進入專章管制，個人在自管錢包持有與移轉自有資產，多數情況不落入「經營虛擬資產服務業」的定義。詳見 [台灣 VASP 法 2026](../taiwan/vasp-2026.md)。

mixers 與 CoinJoin 的法律風險主要在美國司法管轄。對台灣使用者，個人持有不違法，對「協助他人混幣」、「營運混幣協調服務」要謹慎評估。社群長期立場是合法為前提、技術中立、把風險與選擇同時揭露給使用者。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-cash-multiple: 為什麼匿名支付重要](../basics/payments-anonymity.md)
- [:material-shield-key-outline: 零知識身分驗證與支付](../advanced/zk-identity-payments.md)
- [:material-handshake-outline: 倡議組織的匿名捐款](../scenarios/nonprofit-anonymous-donation.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-folder-search-outline: 匿名支付研究專題](../community/payments-research.md)
- [:material-scale-balance: 台灣 VASP 法 2026](../taiwan/vasp-2026.md)

</div>
