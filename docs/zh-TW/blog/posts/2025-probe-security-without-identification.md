---
date: 2025-03-16
authors:
    - toomore
categories:
    - 技術
    - OONI
    - 翻譯文章
slug: 2025-probe-security-without-identification
image: "assets/images/ooni-credentials-table.png"
summary: "OONI 預計實作匿名憑證減緩假觀測資料影響觀測資料庫的可信度"
description: "OONI 預計實作匿名憑證減緩假觀測資料影響觀測資料庫的可信度"
---

# 去識別化的觀測資料安全

!!! info ""

    以下內容原文翻譯來自以下文章，主詞角色為 OONI：

    - [Probe Security Without Identification, Michele Orrù 2025-02-20](https://ooni.org/post/2025-probe-security-without-identification/){target="_blank"}

<figure markdown="span">
    <a href="https://ooni.org/post/2025-probe-security-without-identification/images/chaum.png" target="_blank">
        <img src="https://ooni.org/post/2025-probe-security-without-identification/images/chaum.png"
            alt="Security without identification: transaction systems to make big brother obsolete"
            title="Security without identification: transaction systems to make big brother obsolete"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>在他那篇具有開創性的論文《[沒有身份識別的安全性：使老大哥過時的交易系統](https://dl.acm.org/doi/10.1145/4372.4373){target="_blank"}》中，Chaum 構想了一個使用者可以使用單一數位錢包匿名與多個組織互動的未來，即使這些組織互相勾結。 </capture>
</figure>

為了提升 OONI 觀測資料的可信度，並防止故意或無意上傳的錯誤測量結果對 OONI 資料庫的影響，我們正在考慮在 OONI Probe 中設計和實作匿名憑證。在這篇文章中，我們提供了匿名憑證的現有文獻回顧。這是為了讓對密碼學領域不太熟悉但又好奇的讀者，能深入了解其所依據的協議。

## 為什麼要為 OONI 建立匿名憑證系統？

OONI 的運作仰賴於全球志工社群，他們進行測試以偵測和記錄世界各地的網路審查狀況，從而提高關於數位人權侵犯的透明度。隨著 OONI Probe 網路的擴展，部分使用者（無論是自願或非自願）可能會透過向伺服器提供錯誤觀測數據資料來污染測量結果的風險也隨之增加。這可能是來自於刻意攻擊，透過上傳假測量資料來詆毀 OONI 平台，又或者是由於 OONI Probe 安裝錯誤所導致。

<!-- more -->

例如，惡意行為者可能會在相同網路上、對僅僅少數網站、並在短時間內上傳假測量資料，這將使得識別假測量相對容易。一個更高階的行為者可能會從多個網路上傳涉及多個 URL 的少量假資料，並且分散在很長一段時間內進行，這樣更難以偵測到他們的行動。在這些情況下，攻擊者的目標可能是用假資料來污染 OONI 資料庫，使平台的可信度受到質疑。他們也可能有興趣利用 OONI 觀測資料來散布特定國家或地區的審查誤導訊息，例如宣稱某些被封鎖的網站並沒有被封鎖，或反之亦然。

常見的減緩錯誤測量污染風險的方法包括實施基於 IP 的封鎖、使用者帳號（需註冊和登入）以及設備認證。這些解決方案對於 OONI 來說都不太理想，因為它可能會暴露我們的社群（甚至使其處於危險之中）。因此，我們一直在**研究可能的密碼學解決方案，以便在不追蹤使用者或妥協使用者匿名性的情況下建立信任**。

OONI 的基礎設施相當特殊：使用者上傳的隱私在網路層級和應用層級都被優先考量。而且，使用者也可以透過使用繞過或匿名工具（例如 Tor）來上傳測量資料，從而維持著更強的匿名性。此外，OONI 負責接收和維護使用者上傳的資料。主要的資料流結構如 OONI 的後端文件中所示：

![OONI Data Flow](https://ooni.org/post/2025-probe-security-without-identification/images/backend.png)

理想情況下，我們希望能夠導入並建立對上傳觀測資料的信任。我們特別想在 `checkIn(ProbeMeta)` 和 `upload(Measurements)` 流程中建立信任，並能在不增加流程複雜性或對使用者或伺服器造成負擔的情況下，阻止錯誤（或惡意）的觀測結果。

簡單來說，我們正在尋找一個具備以下特性的匿名身份驗證系統：

* 能夠擴充到每秒數百次的驗證
* 不會去識別化使用者
* 允許 OONI 實施政策以緩解潛在攻擊或錯誤資料上傳
* 能夠融入 OONI 的測量資料上傳系統
* 給長期貢獻於系統的使用者分配更高的信任等級
* 懲罰上傳不良資料的使用者

近年來，一些大型 VPN 供應商和內容傳遞網路（CDN）採取了一種方法，我們也一直密切關注：**匿名憑證**。

匿名憑證是一種簽章，但簽章持有者不是直接揭示它，而是在零知識的情況下證明這些屬性滿足某個特定條件。展示憑證可以證明使用者具備特定屬性，但不會揭露過多的資訊。我們稱這個過程為展示憑證。發行憑證的實體稱為「發行者」；接收到憑證的實體稱為「證明者」。驗證憑證的實體稱為「驗證者」。在 OONI 的語境中，[OONI Probe](https://ooni.org/install/){target="_blank"} 是使用者，而 [OONI 後端](https://github.com/ooni/backend){target="_blank"}則同時是發行者和驗證者。

## 文獻回顧：匿名憑證

在匿名憑證的領域中，可以區分兩條研究路線：

1. 鍵控驗證憑證（Keyed-verification credentials, KVAC）：其中發行者和使用者是同一個實體，並且都持有相同的簽章密鑰。這些方案通常依賴于較輕量的密碼學技術，例如，今天的 [Signal](https://signal.org/){target="_blank"} 就採用了這些方案。
2. 公開驗證憑證（Public-verification credentials）：其中發行者和使用者可以是不同的實體。在這種情況下，發行者持有簽章密鑰，而使用者則持有相應的驗證密鑰。如你所料，在此情況下，驗證者無法生成新的憑證。這是大型身份專案，如 [Idemix](https://github.com/IBM/idemix){target="_blank"} 的案例。

!!! info "翻譯補充"

    在臺灣的脈絡下，**鍵控驗證憑證（Keyed-verification credentials, KVAC）**和**公開驗證憑證（Public-verification credentials）**可以聯想到幾個服務與應用：

    - Keyed-verification credentials (KVAC):

        - 金融交易驗證：例如使用手機 APP 進行行動支付時，透過銀行的數位憑證和多重身份驗證機制來確認交易安全性。
        - 企業內部系統：大公司內部使用的驗證系統，如利用企業專屬密鑰來確保只有授權員工可以訪問機敏資料或系統。

    - Public-verification credentials:

        - 自然人憑證：臺灣政府發行的憑證，用於驗證個人在網路上的身份，例如辦理各類政務服務時的線上驗證。
        - SSL 憑證：用於網頁加密，確保使用者瀏覽的網站是安全的，並且網站身份可被公眾驗證，例如政府機構或大型企業的網站通常會使用這種憑證。

憑證還可以從另一個角度來進行觀察：

1. **單次使用憑證**：這類憑證在使用者出示一次後便不可再次使用。它們可以非常快速，甚至可以簡單到只需盲簽章方案（甚至是 80 年代由 David Chaum \[[Chaum82]{target="_blank"}\] 發明的那個！）。單次使用的鍵控驗證憑證（KVAC）有時被稱為「匿名令牌（anonymous tokens）」，通常受到可驗證遺忘偽隨機函數 \[[RFC9497](https://datatracker.ietf.org/doc/rfc9497/){target="_blank"}\] 的啟發，後者內部依賴於由Jareki 等人 \[[JarKiaKra14](https://eprint.iacr.org/2014/650.pdf){target="_blank"}\] 用於 [IETF 隱私通行證](https://datatracker.ietf.org/wg/privacypass/documents/){target="_blank"}標準的 VOPRF，或是 Chaum \[[Chaum82]{target="_blank"}\] 的盲 RSA 簽章方案。此處一些應用例子包括：

[Chaum82]: https://sceweb.sce.uhcl.edu/yang/teaching/csci5234WebSecurityFall2011/Chaum-blind-signatures.PDF

      * Google 的 BoringSSL 實現了匿名令牌 \[[KLOR20](https://eprint.iacr.org/2020/072.pdf){target="_blank"}\]。
      * 盲 RSA 簽章也被 [Apple Cloud Relay](https://www.apple.com/icloud/docs/iCloud_Private_Relay_Overview_Dec2021.pdf){target="_blank"} 和 [Google One 的 VPN 服務](https://one.google.com/about/vpn/howitworks){target="_blank"}所使用。

2. **多次使用憑證**：此類憑證允許使用者多次出示同一憑證。它們由 Anna Lysyanskaya 和 Jan Camenisch 於 2002 年引入（用於公開驗證），由 Melissa Chase、Sarah Meiklejohn 和 Greg Zaverucha 於 2014 年引入 [CMZ14]（用於鍵控驗證）。例子包括：

      * **基於 Camenisch–Lysyanskaya** \[[CamLys01]{target="_blank"}, [CamLys02]{target="_blank"}\]：這包括由 Open Wallet Foundation 贊助的 [Bifold](https://github.com/openwallet-foundation/bifold-wallet){target="_blank"} 和 [Aries RFC](https://hyperledger.github.io/aries-rfcs/latest/){target="_blank"}。
      * **基於 Chase–Meiklejohn–Zaverucha** \[[ChaMeiZav14]{target="_blank"}, [PoiSan16]\]：用於 [Signal](https://signal.org/blog/signal-private-group-system/){target="_blank"} 的私人群組系統 \[[ChaPerZav20]{target="_blank"}\]，[NYM Technologies](https://nymtech.net/docs/coconut.html){target="_blank"}，以及 Tor 用於橋接節點的分發 \[[TulGol23]{target="_blank"}\]。
      * **基於 BBS 簽章** \[[BonBoySha04]{target="_blank"}, [TesZhu23b]{target="_blank"}\]：這種方案是至今為止在公開驗證環境中歷史最悠久且最廣泛使用的。BBS 正在被 W3C 和 IETF 考慮：W3C 在[分散身份](https://decentralized-id.com/web-standards/w3c/verifiable-credentials/data-integrity-bbs+/){target="_blank"}和[可驗證憑證](https://www.w3.org/TR/vc-data-model-2.0/){target="_blank"}方面進行多項努力，並在這些努力中提到 BBS。IETF 目前對 [BBS 憑證](https://datatracker.ietf.org/doc/draft-irtf-cfrg-bbs-signatures/){target="_blank"}有一個正在進行中的提案。此外，BBS 被[建議](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/issues/200){target="_blank"}作為歐洲數位身份的解決方案，並被 [Idemix](https://github.com/hyperledger/fabric/blob/main/docs/source/idemix.rst){target="_blank"} 用於其 DLOG 憑證（Idemix 也由 [IRMA](https://github.com/privacybydesign/irmago){target="_blank"} 實施），以及提供可重複使用數位身份和可驗證憑證的區塊鏈網路 [Dock](https://github.com/docknetwork/crypto){target="_blank"} 所採用。

[CamLys01]: https://www.iacr.org/archive/eurocrypt2001/20450093.pdf
[CamLys02]: https://cs.brown.edu/~alysyans/papers/camlys02b.pdf
[ChaMeiZav14]: https://eprint.iacr.org/2013/516
[PoiSan16]: https://eprint.iacr.org/2017/1197.pdf
[ChaPerZav20]: https://signal.org/blog/pdfs/signal_private_group_system.pdf
[TulGol23]: https://petsymposium.org/popets/2023/popets-2023-0029.pdf
[BonBoySha04]: https://crypto.stanford.edu/~dabo/papers/groupsigs.pdf
[TesZhu23b]: https://eprint.iacr.org/2023/275

為什麼有人需要多次出示一個憑證呢？想想紙本身份文件：它們也會被多次出示（但它們在隱私保護方面也很差！）。在 OONI 中，我們預期使用者會多次上傳觀測報告，雖然我們可以發送一批單次使用的憑證（這在過去被 Cloudflare 用於 [Internet Challenge Bypass Privacy Pass](https://research.cloudflare.com/publications/Davidson2018/){target="_blank"}），但這樣的方式效率不高。

當然，可以想像一個應用程式發放 1,000 個一次令牌，然後每次「燒掉」其中一個來替代多次使用憑證。然而，這樣會在應用層面增加負擔，必須調整憑證發放的數量並確定何時檢查、更新可用令牌的庫存。因此專門為多次使用情境設計的方案就有效得多。

![Credentials Hardness](https://ooni.org/post/2025-probe-security-without-identification/images/credentials-hardness.png)

除了基本的憑證系統中，允許使用者僅表示他們已被系統「信任」之外，還有許多非必要的功能可以匿名地向伺服器證明。這些密碼學擴展功能包括：

* **有效期限：**實施基於時間的憑證有效期限。
* **網路相關身份：**在不同網路中保持使用者不可關聯性，但在相同網路中保持一致的臨時標記。
* **發行門檻：**設置一些受信任的權威機構負責發行憑證，並集體決定誰不應該擁有訪問權。
* **撤銷：**允許移除被破壞或過期的憑證。
* **發行者盲視：**防止發行者了解他們所簽署憑證的內容。
* **範圍證明：**證明數值屬性需位於特定範圍內。
* **憑證對接：**在不同系統間連結憑證，同時保持隱私。

這些功能可以獨立於基礎憑證系統實現 \[[Orru24]{target="_blank"}\]，允許根據特定需求進行靈活佈署。雖然每個功能會帶來其特有的運算和儲存成本，但這些權衡可以與核心憑證協議分開評估。

[Orru24]: https://eprint.iacr.org/2024/1552.pdf

<figure markdown="span">
    <a href="https://ooni.org/post/2025-probe-security-without-identification/images/credentials-table.png" target="_blank">
        <img src="https://ooni.org/post/2025-probe-security-without-identification/images/credentials-table.png"
            alt="匿名憑證在理論密碼學中的全貌，以及 OONI 的定位。"
            title="匿名憑證在理論密碼學中的全貌，以及 OONI 的定位。"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>匿名憑證在理論密碼學中的全貌，以及 OONI 的定位。</capture>
</figure>

在文獻之外，觀察**當前佈署憑證的生態系統**，從成熟的老牌公司到新興的早期區塊鏈專案，可以看到以下三種類型：

1. **基於通用盲簽章的憑證：**這些憑證非常輕量，但在效率和可用性之間進行了取捨，對支持的功能和使用次數加以限制。過去幾年中出現了多種一次性憑證，尤其是在鍵控驗證環境中，Verifiable Oblivious Pseudorandom Functions 已成為領導方案。儘管這些簽章很簡單，但在離散對數環境中發行這些簽章需要**超過**一次的交互。

2. **基於支援零知識的簽名方案和訊息驗證碼的憑證：**這種方法選擇具有優良「代數」屬性的簽名方案。如果這些「代數」屬性與零知識證明系統中的代數運算兼容，就能得到一個匿名憑證，使用者可以證明任何基於底層零知識證明系統所支援的內容。例如，這些簽名不需要仰賴哈希函數，通常是基於離散對數問題難以解決的群。這些資料結構的一個優勢是可以在一次互動中完成：在發行時，使用者可以請求憑證，伺服器會立即回應。

3. **基於零知識證明的憑證：**這一廣泛類別的憑證通常仰賴於 SNARKs 和遞歸 SNARKs，通常集中在為一個標準化的通用簽名方案證明簽名驗證，或完全去除簽名，建立使用者所擁有的秘密金鑰的雜湊樹，然後通過證明成員資格和非成員資格用於身份驗證。這種類別通常缺乏公開的可驗證安全性形式化。在區塊鏈等難以確認有簽名權的單一實體或小群體的情境中，這是常見的情況。但在理論上很難見到這種方法的形式化。以下是兩個例子：

    * [Semaphore 套件庫](https://semaphore.pse.dev/){target="blank"} 和來自 [Privacy Scaling Explorations (PSE) 的 [Anon Aadhaar 協議](https://pse.dev/en/projects/anon-aadhaar){target="_blank"}是一套用於構建在以太坊區塊鏈上使用匿名通訊應用程式的工具，依賴於通用的零知識簡潔論證（zk-SNARKs）。
    * [Zupass](https://github.com/proofcarryingdata/zupass){target="_blank"} 是基於證明資料記載的身份驗證系統。

基於簽章的方案與高效率的協議似乎能夠提供我們所需的一切：一次互動、可靠的安全證明，並具備可擴充的空間——同時保持實時高效和可延展。

匿名憑證似乎是使用者登入和基於位置封鎖的極好替代方案。對我們來說，它們可以在不影響最重要因素的情況下加強我們的測量平台：那些很棒的志工社群的隱私和安全，將使 OONI 的審查觀測成為可能。

我們已經在試驗一個原型，迫不及待想與您分享我們的進展。🚀
