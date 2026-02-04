---
date: 2026-02-05
authors:
    - toomore
categories:
    - 技術
    - OONI
summary: "從高層次介紹 OONI 如何為 OONI Probe 設計並打造匿名憑證系統。"
description: "從高層次介紹 OONI 如何為 OONI Probe 設計並打造匿名憑證系統。"
---

# OONI 全新的匿名憑證系統

!!! info ""

    **翻譯備註：**OONI 依賴全球志工上傳網路審查觀測資料，但隨著參與者增加，假資料或錯誤測量也可能混入，影響資料庫的可信度。傳統做法如 IP 封鎖、要求帳號登入或設備認證，會暴露志工身分，與 OONI 保護隱私的承諾相衝突。因此 OONI 轉向**匿名憑證**：用密碼學方式驗證「這筆量測來自符合條件的 OONI Probe」，卻不揭露使用者是誰、身在何處，也不讓不同網路的活動被串起來。以下內容將介紹 OONI 如何打造這套系統。

    以下內容原文翻譯來自以下文章，主詞角色為 OONI：

    - [Announcing OONI's New Anonymous Credential System, OONI Team 2026-01-30](https://ooni.org/post/2025-announcing-ooni-new-anonymous-credential-system/){target="_blank"}

在先前的文章中，我們已說明[為什麼 OONI 需要匿名憑證系統](./2025-probe-security-without-identification.md)，並整理了這類系統必須滿足的[資安與隱私需求](http://ooni.org/post/2025-requirements-for-oonis-anonymous-credentials/){target="_blank"}。核心挑戰在於：OONI 必須在「不建立任何可能暴露使用者身分、或造成跨網路追蹤的識別碼」的前提下，仍能對上傳的量測結果建立可信度[^1]。

匿名憑證（anonymous credentials）提供一種密碼學機制：可以在不暴露使用者是誰、身在何處、也不把其活動在不同網路之間串起來的情況下，驗證 OONI Probe 的某些屬性（例如長期參與程度或量測量）。

<!-- more -->

## OONI 的需求

要符合 OONI 的威脅模型（threat model），憑證系統必須滿足以下限制：

- **防止跨網路可連結性（cross-network linkability）**：僅支援「網路在地（network-local）」的識別方式。
- **驗證中繼資料（metadata）**（probe_age、measurement_count、blocklist/trust status），但不揭露原始數值，也不破壞匿名性。
- **抵抗偽造與女巫攻擊（Sybil attacks）**：確保惡意者不易大量創造或操弄身分。
- **支援頻繁、多次出示（multi-show presentations）**：因為 OONI Probe 會持續不斷上傳量測資料。
- **避免縮小匿名集合（anonymity sets）**[^2]：即使在量測資料中加入更多中繼資料，也不要讓使用者變得更容易被辨識。

既有的憑證生態系（例如以盲簽章為基礎、適合零知識的簽章、或基於 SNARK 的建構）各自能滿足其中一部分需求，但無法一次涵蓋全部。尤其是 OONI 需要 **簽發者在地驗證（issuer-local verification）**、**高效率的範圍證明（range proofs）**、**依網路而定的假名（network-dependent pseudonyms）**，以及 **憑證更新協定（credential update protocols）**。在不做重大妥協的前提下，市面上沒有現成方案能完整符合這些限制[^3]。

## 打造模組化、具表達力的憑證框架

我們與 Ian Goldberg（滑鐵盧大學）、Lindsey Tulloch（Tor Project）、Victor Graf（Risc Zero）合作，打造了一個分層式系統，用來建構零知識憑證與相關協定。這套系統包含三個 Rust crate（*cmz*、*sigma-compiler*、*sigma-proofs*）：實作經充分研究的 sigma-protocols，並把高階敘述（statements）編譯成高效率、以線性代數為核心的證明敘述。
同時，我們也在推動這些協定的 CFRG 草案（[draft-irtf-cfrg-sigma-protocols](https://datatracker.ietf.org/doc/draft-irtf-cfrg-sigma-protocols/)、[draft-irtf-cfrg-fiat-shamir](https://datatracker.ietf.org/doc/draft-irtf-cfrg-fiat-shamir/)）[^4]。

其中一些對 OONI 特別重要的功能包括：

1. **可多次出示（multi-show）且簽發者在地驗證（issuer-local verification）**：OONI 的使用模式類似 KVAC 憑證（簽發者＝驗證者），CMZ 與 μCMZ 方案可直接支援。
2. **高效率的範圍證明（range proofs）**：probe_age 與 measurement_count 需要以「粗略區間」[^5]呈現（例如 >1 週、>1000 筆量測），以避免產生近乎唯一的組合。sigma-rs 的堆疊可用相對精簡的方式支援這些範圍證明。
3. **網路在地假名（network-local pseudonyms）**：OONI Probe 必須做到「每個網路呈現一個身分」，但在不同網路之間仍要保持不可連結。這很自然地映射到 sigma-rs 使用的屬性與約束系統（例如：pseudonym = secret * DOMAIN）。
4. **簽發與更新協定（issuance + update protocols）**：我們的模型需要「出示舊憑證、在不揭露底層數值的情況下取得更新後的新憑證」（例如 measurement_count +1），這正是 UserAuth 範例描述的模式。

## OONI 的憑證長什麼樣子

OONI 的匿名憑證包含以下屬性：

``` rust
CMZ! { UserAuthCredential:
    nym_id, // a stable per-installation secret
    age, // coarse bucket
    measurement_count // measurements submitted
}
```

這些屬性對應到我們在需求文章中描述的額外中繼資料，同時仍遵守匿名性的限制。

### 「提交量測」協定的高階概觀

使用 sigma-rs 的 μCMZ API，「提交新的量測」在概念上大致長得像這樣：

``` rust
muCMZProtocol!(submit<min_age_today, max_age, min_measurement_count, max_measurement_count, @DOMAIN, @NYM>,
    Old: UserAuthCredential { nym_id: H, age: H, measurement_count: H},
    New: UserAuthCredential { nym_id: H, age: H, measurement_count: H},
    // the per-installation secret is the same
    Old.nym_id = New.nym_id,
    // the age is the same
    Old.age = New.age,
    // the new measurement count is increased
    New.measurement_count = Old.measurement_count + 1,
    // the submitted NYM is correct
    NYM = Old.nym_id * DOMAIN,
    // the age and measurement counts are within the desired range
    (min_age_today..=max_age).contains(Old.age),
    (min_measurement_count..=max_measurement_count).contains(Old.measurement_count) );
```

這能確保：

- OONI Probe 維持相同的網路在地假名
- measurement_count 單調遞增（不會倒退或跳號造假）
- 年齡分桶（age bucket）保持正確
- OONI 看不到原始數值——只能驗證「被證明的敘述」
- 惡意客戶端無法偽造可信度中繼資料

*伺服器只會看到證明（proof）*[^6]，看不到底層屬性值。

屬性 `measurement_count` 用於評估使用者在該網路中的參與程度，而不是用來對使用者做速率限制（rate limit）。

## 與 OONI 程式碼庫的整合

OONI Probe 引擎主要以 Go 撰寫，而匿名憑證系統則以 Rust 實作。為了乾淨地整合兩者，我們在 Rust 端提供一個小型、相容 C 的 API，並透過 rust2go 產生 Go 的綁定（bindings）。設計上我們清楚切分職責：Rust 負責所有密碼學（憑證簽發、零知識證明、驗證、更新），而客戶端負責協調流程、持久化（persistence）與狀態機（state machines）。

Rust 函式庫扮演一個自成一體的「加密引擎（crypto engine）」：它接收不透明（opaque）的輸入（目前的憑證與協定參數），產生要送給伺服器的協定訊息，並處理伺服器回應以回傳更新後的憑證。所有狀態管理則刻意交由呼叫端應用程式處理，以讓 API 維持精簡且易於移植[^7]。

- 在行動裝置 App 上，這是 OONI 的跨平台客戶端：[OONI probe-multiplatform](https://github.com/ooni/probe-multiplatform)
- 在 CLI 上，這是 OONI 的 Go CLI 客戶端（miniooni、ooniprobe）：[OONI probe-cli](https://github.com/ooni/probe-cli)

客戶端負責儲存與重新載入：

- 最新的憑證 blob
- 在請求之間需要保留的任何本機狀態（例如 request/response 之間尚未完成的協定狀態）

這能讓邊界維持乾淨：Go 端把憑證與協定訊息都當作不透明的 bytes。Rust 端則在內部強制所有正確性與隱私性屬性。

### 資料交換模型

在 Rust↔Go 的邊界之間，我們只傳遞：

- **不透明（opaque）的序列化協定訊息**：bytes，為了 JSON 傳輸通常會再做 Base64 編碼。
- **公開參數（public parameters）**：例如簽發者公鑰、協定參數。
- **網路情境（network context）**：domain separators、cc/asn 等。

這種做法讓 Go 能整合該系統而不用重新實作密碼學，同時也能讓網路通訊與應用程式邏輯維持與 OONI Probe 其他部分一致。

長期金鑰（long term keys）會依賴作業系統的原生能力來管理與儲存。實務上，Android 會使用 [Android Keystore](https://developer.android.com/privacy-and-security/keystore)，iOS 則使用 [Keychain services](https://developer.apple.com/documentation/security/keychain-services)。

## 接下來會做什麼

OONI 使用者很快就能依下列條件篩選或註記量測資料：

- 長期運行 vs. 新加入的 OONI Probe 
- 高量測量的貢獻者
- 被封鎖（blocklisted）或故障的 OONI Probe 
- 受信任的機構型 OONI Probe 

雖然完整的女巫攻擊（透過建立許多虛假帳號）抵抗仍屬於應用層問題（例如註冊階段的速率限制），但經過驗證的 `measurement_count` 與 `probe_age` 分桶，仍能對潛在攻擊者形成實質阻力。

如果你是密碼學研究者、實作者，或只是好奇，**我們都非常歡迎給予 OONI 團隊回饋**，這項工作希望能以安全、透明的方式服務全球的 OONI 社群。

敬請期待我們接下來更深入的分享：協定設計細節、效能基準測試，以及 sigma-rs 將如何隨著下一個 OONI Probe 主要版本一起發布。

[^1]: 這裡的「可信度」指的是：伺服器需要能分辨量測是否來自「符合某些條件的 OONI Probe」，但同時又不能讓量測內容帶有可長期追蹤的固定身分。「跨網路追蹤」的風險在於：如果同一個使用者在不同網路（例如家用 Wi‑Fi、公司網路、行動網路）都被認出是同一人，就可能被用來推回真實身分或行為軌跡。
[^2]: 「匿名集合」可以理解為「看起來都一樣的一群人」：如果你附帶的中繼資料太細（例如精確年齡、精確筆數），很容易形成近乎唯一的組合，反而把匿名性削弱。OONI 在這裡希望驗證的是「我符合某個範圍、條件」，而不是「我到底是多少」。
[^3]: 「issuer-local verification」在 OONI 的使用情境下，通常意味著「簽發者（issuer）同時也是驗證者（verifier）」：由 OONI 自己簽發與驗證，而不是把驗證交給第三方。「範圍證明」則是用零知識方式證明「某個值落在某個區間內」（例如大於 1 週、超過 1000 筆），但不透露精確數值。
[^4]: CFRG（Crypto Forum Research Group）是 IRTF 底下的密碼學研究論壇，草案通常會朝標準化方向前進。「Fiat–Shamir」是把互動式證明（需要來回挑戰、回應）轉成非互動式證明的常見技巧，常用於讓客戶端可以一次送出「證明」給伺服器驗證。
[^5]: 這裡刻意用「粗略區間」而不是精確數值，是為了避免把使用者的特徵變得過於獨特（例如 17,382 筆量測 + 39 天），導致容易被追蹤。「每網路一個身分」通常會透過「網路相關的 domain separator」把同一個安裝的加密值對應到不同假名，以達成跨網路不可連結。
[^6]: 這段協定同時涵蓋「出示舊憑證」與「取得新憑證（更新）」：伺服器驗證你確實把計數 +1，但不會知道你原本的精確計數。`@DOMAIN` / `NYM` 通常用來做 domain separation（避免跨情境重用導致可連結），讓同一個安裝在不同網路產生不同假名。
[^7]: 這裡的關鍵設計是「邊界清楚」：Go 端不要碰密碼學細節，只把它當成黑盒（opaque bytes）來用。密碼學正確性與隱私性由 Rust 端封裝保證。透過 C ABI 再產生 Go binding，是常見的跨語言整合方式，也能降低在 Go 端重寫密碼學導致出錯的風險。
