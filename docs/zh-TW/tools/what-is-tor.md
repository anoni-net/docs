---
title: 什麼是 Tor
description: Tor 是讓使用者連線時，能不交出 IP 與行為軌跡的開源匿名網路。使用 Tor 的常見情境、跟 VPN 的差異，以及什麼時候不該用。
icon: simple/torproject
---

# :simple-torproject: 什麼是 Tor？

<figure markdown="span">
    <a target="_blank"
       href="../../assets/images/tor_diagram.original.webp">
        <img src="../../assets/images/tor_diagram.original.webp"
            alt="Tor Relay 運作流程"
            title="Tor Relay 運作流程"
        >
    </a>
    <caption>Tor Relay 運作流程</caption>
</figure>

[Tor（The Onion Router）](https://www.torproject.org/){target="_blank"} 是一個由志工營運、透過多層加密與隨機路徑把網路連線匿名化的開源網路。對正體中文使用者來說，Tor 解決的問題很具體：當你連上一個網站時，預設會把 IP 位址、瀏覽指紋、連線時序留給對方與沿路所有觀察者。Tor 把這條鏈拆成三段，讓沒有任何單一節點同時知道「你是誰」與「你在連什麼」。

跟 VPN 的差別常被混淆。VPN 把你的流量集中到一個信任的服務提供者：你信任 VPN 業者不記錄、不交資料，業者本身就是個單點。Tor 把信任分散，沒有任何節點能同時看到完整路徑，因此不需要信任任一節點就能達成匿名。要看更完整的對照與選擇邏輯，可以接著讀 [什麼是匿名網路](./what-is-anonymity-network.md) 與 [威脅模型如何建立](../basics/threat-model.md)。VPN 本身的具體風險、怎麼挑值得信任的服務、什麼時候 VPN 夠用而不必動用 Tor，見 [VPN 的風險與選擇](./vpn-guide.md)。

## Onion routing 如何運作

每次發送請求時，Tor 客戶端會挑選一條包含三個節點的隨機路徑。資料先用最內層加密，再用中層，再用外層。離開你的電腦後，每經過一個節點剝一層加密，像剝洋蔥一樣，到達出口節點時才看到原始連線。

關鍵設計是「每個節點只看得到前後一站」：

- **入口節點**（Guard Relay）知道你的真實 IP，但只看到「你要連下一個 Tor 節點」。它不知道你最終要連哪個網站。
- **中間節點**（Middle Relay）什麼都不知道。它前後都是 Tor 節點，連你的 IP 都看不到。
- **出口節點**（Exit Relay）看得到你最終要連的網站，但看到的來源 IP 是中間節點，不是你。

要把這三段資訊兜起來才能識別你，必須有人同時控制入口跟出口節點，並做時序分析。Tor 網路全球有超過 8,000 個節點，分散在不同國家、不同運營者手上（大學、非營利組織、託管公司、個人志工），這個攻擊成本本身就是 Tor 的安全來源。即時節點數可查 [Tor Metrics](https://metrics.torproject.org/networksize.html){target="_blank"}。

<figure markdown="span">
    <a target="_blank"
       href="../../assets/images/tor_relays.svg">
        <img src="../../assets/images/tor_relays.svg"
            alt="Tor Relay 類型"
            title="Tor Relay 類型"
        >
    </a>
    <caption>Tor Relay 類型</caption>
</figure>

## 中繼點與橋接點

Tor 的節點分兩類：公開的中繼點（Relay）與隱藏的橋接點（Bridge）。

中繼點清單是公開的，這是 Tor 設計的一部分：任何人都能驗證網路上有哪些節點、誰在跑、跑多久了。公開可查也是 Tor 比起私有匿名網路（例如某些 VPN）多一層信任的原因。

但公開清單也是封鎖的目標。在中國、伊朗、白俄羅斯這類嚴重審查地區，當地 ISP 會直接封鎖所有公開的 Tor 中繼 IP。為了讓這些地區的人仍能連上 Tor，社群另外設計了**橋接點（Bridge）**：IP 不公開、靠官方網頁、Email、Telegram 等管道分發給有需要的人。

橋接點還可以搭配 **Pluggable Transports** 進一步偽裝流量：

- **Obfs4**：把 Tor 流量看起來像隨機亂碼，避免被 DPI 直接特徵識別。
- **meek**：把流量包裝成連到 Microsoft Azure 這類大型雲端服務（早年也用過 Google、Cloudflare，後來這些業者陸續關閉了 domain fronting），審查者要嘛全擋這些服務，要嘛放行。
- **[Snowflake](./tor-snowflake.md)**：把流量包裝成 WebRTC（視訊會議常用協議），由全球志工的瀏覽器分頁臨時當橋接。

在台灣，使用 Tor 不需要橋接（直接用公開中繼就連得上），也可以開 [Snowflake 瀏覽器分頁](./tor-snowflake.md) 變成橋接給審查地區的人用，這是門檻最低的網路自由貢獻方式。香港對外連線同樣不受全面封鎖、技術上可行，但參與前要評估國安監控的風險，見 [Tor Snowflake 橋接點](./tor-snowflake.md) 的香港小節。

## Tor 適合做什麼、不適合做什麼

Tor 不是萬能匿名鈕。把它用在不對的場景，會付出效能代價但拿不到你以為的保護。動手前回頭看 [威脅模型如何建立](../basics/threat-model.md) 對齊預期。

**適合**：

- 敏感議題的瀏覽與研究（醫療、性、政治、金融困境），想避免瀏覽行為被廣告網路或 ISP 收集。
- 跨境連線、規避地區封鎖（含台灣讀者讀某些有地理限制的內容）。
- 跟記者、爆料者、跨境合作對象的初次接觸（搭配 [.onion 服務](./tor-browser-advanced.md) 或 [OnionShare](./onionshare.md)）。
- 需要把連線跟你個人「徹底切開」的單次任務（搭配 [Tails](./what-is-tails.md) 效果更完整）。

**不適合**：

- 登入會綁定你個人身分的服務（網銀、Gmail、健保署）。Tor 不會讓你比較匿名，反而可能觸發風控、要你做額外驗證。
- 需要本地 IP 的金流服務（許多銀行、政府服務只接受台灣 IP）。
- 高頻寬即時應用（4K 影音、線上遊戲、視訊會議）。Tor 的多層加密與多跳路徑會讓延遲明顯。
- 點對點檔案分享（BitTorrent 等）。Tor 出口節點頻寬有限，這類流量會傷害網路給其他人用的容量，也容易暴露你的真實 IP。
- 「我所有上網都走 Tor 就比較安全」的全包式期待。Tor 處理的是連線層匿名，跟瀏覽器指紋、登入身分綁定、檔案 [Metadata](../basics/metadata.md) 是不同層級的問題。

## 常見問題

??? question "Tor 跟 VPN 哪個比較匿名？"

    Tor。VPN 把信任集中到一個業者身上：業者宣稱不記錄不代表不能記錄，且該業者一被司法傳喚就有風險。Tor 把信任分散到三個獨立節點，沒有任何一方同時知道你的真實 IP 與目的網站，不需要假設任何一方誠實。VPN 的優勢在速度與相容性（解地理限制、看串流），Tor 的優勢在「結構性不需要信任」。

??? question "出口節點不是看得到我的明文流量嗎？"

    對，所以 Tor 必定要搭配 HTTPS 用。出口節點看得到你連的目標網站與未加密內容，但看不到你的真實 IP。HTTPS 加密後出口節點只看得到「有人連 example.com」，看不到具體傳輸內容。Tor Browser 內建 HTTPS-Only 模式，沒走 HTTPS 的網站會警告。

??? question "用 Tor 連 Gmail 安全嗎？"

    技術上沒問題，但要想清楚目的。如果你登入既有 Gmail 帳號，Google 會看到「同一個帳號從 Tor 出口節點登入」，可能觸發風控、要你二步驗證。連線本身是安全的，但 Google 已經知道你是誰。匿名郵件可以考慮 [Proton Mail 的 .onion 站](https://proton.me/tor){target="_blank"} 或 [Tuta](https://tuta.com/){target="_blank"}，並用獨立帳號搭配 Tor 開通。

??? question "ISP 看得到我在用 Tor 嗎？"

    不開橋接的情況下，看得到。ISP 看到你的 IP 連到一個公開 Tor 入口節點的 IP（公開列表查得到），它會知道你在用 Tor，但看不到你接下來連什麼。這層「技術可見度」在哪裡都一樣。至於「被看到在用 Tor」有沒有後果，要看所在地區的威脅模型：在台灣，用 Tor 不違法、目前也沒有實質壓力。在香港，2020 年《國安法》後監控與寒蟬效應升高，記者、社運工作者被觀察到使用 Tor 雖不違法，仍可能引來額外關注，判斷方式見 [威脅模型如何建立](../basics/threat-model.md) 與 [VPN 的風險與選擇](./vpn-guide.md) 的香港段。如果你在意這層暴露（例如在敏感工作場所網路，或在監控較強的地區），可以開橋接 + Pluggable Transports 把這層也藏起來。

??? question "用 Tor 速度為什麼這麼慢？"

    三層加密 + 三跳節點 + 出口節點頻寬有限是物理結構，不會大改善。但有兩個簡單的調整能改善體感：在 Tor Browser 設定裡換出口節點地區（避開壅塞國家）、避免高頻寬內容（看 8K 影片不是 Tor 的設計目的）。台灣本地頻寬充足，社群長期推動 [Tor Relay 校園建立](../community/relay-on-campus.md) 也是希望讓本地網路成為全球 Tor 容量的一部分，整體變快。

??? question "Tor 真的不會被破解嗎？"

    沒有絕對安全。已知攻擊面包括：同時控制入口與出口的時序關聯分析（學界研究、極大規模才可能）、瀏覽器指紋（Tor Browser 已強化但不是零）、使用者操作失誤（在 Tor 裡登入帶身分的帳號就破功）。對多數連線層匿名需求，Tor 是目前被廣泛採用的工具，但仍要依自己的威脅模型評估是否足夠。要看更深的攻擊面討論可以從 [威脅模型如何建立](../basics/threat-model.md) 開始。

## 接下來

下載安裝 Tor Browser 是起點，[Tor 官方下載頁](https://www.torproject.org/zh-TW/download/){target="_blank"} 有 Windows、macOS、Linux、Android 版本（iOS 因為平台限制官方推薦 Onion Browser）。裝好後先讀 [Tor Browser 進階設定](./tor-browser-advanced.md) 處理橋接、安全等級、隔離策略，再看 [Tor Snowflake](./tor-snowflake.md) 學習如何貢獻一個分頁的橋接。

更投入的人可以接 [如何搭建 Tor Relay](../community/setup-tor-relay.md) 或 [Tor Relay 校園建立](../community/relay-on-campus.md)，把本地頻寬接進全球網路。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 威脅模型如何建立](../basics/threat-model.md)
- [:material-chat-question: 匿名與隱私不一樣](../basics/anonymity-vs-privacy.md)
- [:material-chat-question: 什麼是匿名網路](./what-is-anonymity-network.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-snowflake: 啟動 Tor Snowflake 橋接](./tor-snowflake.md)
- [:material-school-outline: Tor Relay 校園建立](../community/relay-on-campus.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)

</div>
