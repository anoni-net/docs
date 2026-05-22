---
date: 2026-06-01
authors:
    - toomore
categories:
    - 更新
    - Tor
    - 翻譯文章
slug: keeping-the-doors-open
image: "assets/images/tor.webp"
summary: "Unredacted 用 300+ 台伺服器跑 FreeSocks、Tor bridges、Snowflake 等抗審查服務，並用約 400W 維運 123 個 Tor exit relay。對照台灣目前 13 個 Tor 中繼節點（其中 3 個是 exit）的現況，正體中文社群處在能撐傘的位置。"
description: "Unredacted 用 300+ 台伺服器跑 FreeSocks、Tor bridges、Snowflake 等抗審查服務，並用約 400W 跑 123 個 Tor exit relay。對照台灣 13 個 Tor 中繼節點的現況，我們處在能撐傘的位置。"
---

# 把門開著：Unredacted 如何替審查地區守住一條到開放網路的路

!!! info ""

    以下內容原文翻譯來自以下文章，主詞角色為 Unredacted（Tor Blog 客座撰寫）：

    - [Keeping the doors open, Tor Blog, by Unredacted.org, 2026-05-15](https://blog.torproject.org/keeping-the-doors-open-unredacted/){target="_blank"}

    文末附三段來自 anoni.net 社群的補充（台灣的對照、GreenWare 在台灣的可行性、你能做什麼）。

![Keeping the doors open](assets/images/tor.webp){style="border-radius: 10px;"}

這篇客座文章是「捍衛自由網路的組織」系列報導的一篇。

有位中國使用者曾經這樣描述我們的工作：

> 「你們幫了很多很多人翻過防火長城。如果沒有你們的幫助，我會被困在完全的黑暗裡，被洗腦。」

我們很少聽到使用我們服務的人發聲。他們大多沒有辦法、或不覺得自己能安全地傳訊息出來。每當有一條訊息穿越過來，就提醒我們這件事真正關係到什麼。

<!-- more -->

我們是 Unredacted，一個註冊在美國的 501(c)(3) 非營利組織。我們建造並維運網路基礎設施，協助大家連上開放的網路、捍衛使用網路的隱私權。具體做法是在全球運行一個超過 300 台伺服器的網路。當前門被鎖住時，我們是另一條穿越的路徑。當公共廣場不再安全時，我們是還能說話的地方。大部分的工作都是看不見的，包括資料中心作業、硬體、自動化、開源軟體、頻寬、濫用通報處理、監控警報，以及為了讓這一切持續運作而熬過的深夜。

我們做的事情分成三個方向。**Censorship Evasion**（繞過審查）下面是 Unredacted Door，這是我們所有「設計來繞過封鎖」的服務的總稱。**Secure Infrastructure**（安全基礎設施）跑像是 [XMPP.is](https://xmpp.is/){target="_blank"}、自家的 Matrix 家用伺服器，還有其他以安全與隱私為前提的免費服務。**Unredacted Education** 是寫作與文件這一塊，給想理解這份工作、想自己複製一遍的人讀的指南與說明。在這三塊之外，**Unredacted Labs** 是實驗區，跑還沒到正式上線等級的基礎設施想法。GreenWare 就是其中一項，目的是用不太耗電的硬體扛起真實的網路容量。

## Unredacted Door

名字就是字面的意思。當通往開放網路的入口被牆封起來，人們就需要另一條進入的路徑。

Unredacted Door 把好幾項繞行審查的服務收在一起：FreeSocks、Signal 與 Telegram 的訊息代理、Tor bridges、Snowflake 代理。在最近的 30 天裡，這些服務替數萬名在自己國家繞行審查的使用者承載了將近 300 TiB 的流量，大約相當於播好幾萬小時 4K 影片所需的頻寬。需求沒有減緩，我們得持續架更多。每一條新過濾規則、每一條新法律、每一波打著「為了你的安全」名號的措施，都會把更多人推向尚未被審查者發現的路。

Unredacted Door 裡最大的一塊是 FreeSocks，給審查嚴重地區的使用者用的免費代理。如果你沒接觸過，代理就是一個轉接點。你的應用程式不直接跟被封鎖的服務說話，而是先跟一台伺服器溝通，由它把連線帶過你跟外面網路之間那層過濾。FreeSocks 的設計重點是讓這個轉接點看起來低調無奇，這恰好是一般 VPN 缺乏的特質。VPN 會張揚自己的存在，有清楚的端點、清楚的握手、在線路上看得出來的封包形狀。審查者非常擅長阻擋他們認得出來的東西。

沒有單一工具能涵蓋所有情境。Tor Browser 提供強度足夠的瀏覽隱私與匿名性。Snowflake 在 Tor 網路本身被封時，幫使用者繞回 Tor 上。FreeSocks 代理則把特定流量推上一條較難被察覺的路徑。住在審查環境裡的人通常手邊得備上好幾種工具，因為沒有任何一扇門能一直開著。

這也是我們為什麼把心力投在 FreeSocks 第二版（v2）的開發上。它使用 Xray，一個強大且彈性的流量路由引擎，可以把代理流量做得更像一般網頁流量。

!!! note "什麼是 Xray"

    Xray 是一個流量路由與偽裝工具，源自 V2Ray 專案，被中國、伊朗等審查嚴重地區的使用者廣泛採用。它提供 VLESS、Trojan、Reality 等協定，把代理流量偽裝成一般 HTTPS / TLS 流量，避免被機器特徵識別。傳統 VPN 一眼能認出的握手與封包樣態，Xray 把這些指紋抹平，是抗審查工具圈裡近年的主力選擇。詳細可參考 [Xray-core 專案](https://github.com/XTLS/Xray-core){target="_blank"}。

我們把 Xray 與自家的開源控制平面綁在一起，這樣當審查者找到並封鎖某台伺服器時，系統就能自動輪替端點。使用者已經在壓力底下了，能少花一分力氣去調設定就少一分風險。

## GreenWare：可持續的基礎設施，從字面上來說

Tor 中繼、橋接、代理等等，這些都跑在資料中心的硬體上，而硬體有實際的成本，財務、營運、環境都有。如果我們希望隱私基礎設施能長期撐下去，就得問什麼樣的維運才是真的可持續。

GreenWare 是我們試著縮小這個成本、同時保住承載量的嘗試。前提很單純，大多數 Tor 中繼的流量並不需要一台電力消耗像暖風機的伺服器。一台中繼需要的是穩定的網路、可預測的 CPU，以及足夠存放狀態的記憶體。這種規模的工作量，一台單板電腦就能處理，前提是外殼設計得認真。

我們從 Raspberry Pi 5 主機板開始，透過 PoE（網路供電）讓電與資料都靠一條網路線餵進去。這個想法行得通。資料中心的典型伺服器吃的電大約相當於一台小型暖風機，而一台 Pi 連一顆燈泡都不到。但是第一代有它的天花板，密度不夠，部分配套元件也撐不了我們的長時間使用。

所以我們現在同時跑兩種部署方式。第一種是一個 1U 機箱裡塞 20 個 ComputeBlade 模組，全部 20 個都部署在我們的資料中心，把一部分 Tor exit relays 搬到上面跑。這個機箱在滿載時大約吃 100W 多一點，差不多等於一顆舊式白熾燈泡。第二種是 ComputeBlade 經驗教了我們現場真正需要什麼之後，自己設計的客製化 Raspberry Pi 機箱。兩種都已經上線，截至撰文時，我們全部 123 個 Tor exit relay 都跑在這套合併後的基礎設施上，總耗電大約 400W。隨著時間推進，等專案更成熟，我們會再分享更多機箱設計與整體進展。

Tor 網路靠願意替它維運基礎設施的人與組織撐起。Exit 是這份工作裡最難的一塊，需要頻寬、維護、處理濫用通報、法律上的承擔，還需要錢。如果我們能把跑出有意義的 exit 容量所需的成本與電力都壓低，就有更多人能扛起其中一塊，讓網路的節點更多元、規模更大。

更長遠的目標是繼續推動高效硬體、碳排追蹤，乃至於以再生能源驅動的小型節點。我們很樂意跟想看到這件事長大的組織與公司合作。

開放的網路之所以保持開放，是因為有許多人與組織投入心力、時間與精神。包括測量審查的研究者、提供頻寬的中繼維運者，以及不肯把彼此丟下的社群。Unredacted 負責的這一塊，就是建造與維護那些路徑，在顯而易見的路消失時，給人們另一條可走的。

---

## 來自 anoni.net 社群：台灣的對照

Unredacted 文章裡那位中國使用者的訊息讀起來特別有重量，因為這類聲音在公開報導裡並不常見。對照到正體中文社群，台灣讀者並不在被擋在門外的那一側。台灣的網路環境相對自由，沒有 GFW、沒有強制 VPN 註冊、ISP 也沒有國家審查命令。我們處在能撐傘的位置。

匿名網路社群 anoni.net 一直透過 [Pulse 即時觀測](https://api.anoni.net/api/readme){target="_blank"} 追蹤台灣 Tor 中繼節點的數量與分布。截至 2026-05-19，台灣境內 Onionoo 看得到的 running 中繼節點是 13 個，其中具有 Exit 旗標的只有 3 個（initramfs、GuruKopi、jerryrelay）。對照 Unredacted 一個組織就跑 123 個 exit relay、30 天承載近 300 TiB 流量，台灣的全國 exit 規模還不到他們的 3%。我們在 [Tor Relays 觀測點](../../taiwan/tor-relay-watcher.md) 持續更新這個數字，並在 [ASN 觀測資料分析](../../taiwan/ooni-asn-coverage.md) 補上 OONI 對台灣與鄰近地區的審查觀測。

香港、澳門以及使用中文的東南亞華語使用者，在 2020 年後實際的翻牆需求增加，而正體中文的抗審查資源相對稀缺。anoni.net 的工作之一是把這套中文資源補起來，包括 [什麼是 Tor](../../tools/what-is-tor.md)、[Tor Snowflake 橋接點](../../tools/tor-snowflake.md)、[什麼是 OONI](../../tools/what-is-ooni.md) 等基礎文件，跟 Unredacted 的 Unredacted Education 走在同一條路上。

## 來自 anoni.net 社群：GreenWare 在台灣的可行性

Unredacted 把 123 個 exit relays 跑在 400W 上，這個數字對台灣社群讀起來特別有感。以工業用電費約 NT$ 3.5 至 6 / kWh 估算，400W 全年運轉約 3,500 度電，一年大約 NT$ 12,000 至 21,000，對學校資訊中心或社群協作空間而言是可以負擔的營運成本。

關鍵在硬體規模化的設計。台灣 maker 社群對 Raspberry Pi 5 並不陌生，PoE+ HAT 與 PoE 交換器在台灣的常見零售管道都能買到（如 Cytron、群創、PChome）。ComputeBlade（20 模組 1U 機箱）目前在台灣較少零售管道，可以透過官方海外訂購或社群代購取得。校園機房比家用網路更適合做這件事，原因有三：固定 IP、學術網路頻寬、有人巡檢機器。

Tor Relay 校園建立是 anoni.net 2026 的三大主題之一，社群正在累積把校園架設經驗整理成 SOP 的工作（見 [Tor Relay 校園建立研究專題](../../community/relay-on-campus.md) 與 [在台師大架設 Tor Relay：一段與學校溝通、留下可能性的實作經驗](ntnu-nz.md)）。Unredacted 在 GreenWare 上的工程做法，可以做為下一所學校評估架設方案時的參考點，先用 PoE 餵電的 Raspberry Pi 5 試做一台 middle relay，等運作穩定後再考慮 exit 與機箱密度。

對個人或小空間想參與的人，從 Snowflake proxy 開始（瀏覽器外掛或 Docker）幾乎沒有電費負擔，是進入抗審查基礎建設最低門檻的入口（見 [Tor Snowflake 橋接點](../../tools/tor-snowflake.md)）。

## 你能做什麼

讀完 Unredacted 的工作，如果你也想為「把門開著」貢獻一份力，這裡有幾個入口：

- **了解 Unredacted**：到 [unredacted.org](https://unredacted.org/){target="_blank"} 看他們的服務與透明度資訊，再決定是否透過官方頻道支持伺服器、頻寬與人力成本。
- **自架 Snowflake**：最低門檻的抗審查貢獻，用瀏覽器外掛或 Docker 就能跑（見 [Tor Snowflake 橋接點](../../tools/tor-snowflake.md)）。
- **架設 Tor relay 或 bridge**：需要穩定網路與一點維運心力，社群整理了 [如何搭建 Tor Relay](../../community/setup-tor-relay.md) 的步驟與經驗。
- **校園 Tor Relay**：在大專院校工作或就讀的人，可以從 [Tor Relay 校園建立研究專題](../../community/relay-on-campus.md) 開始評估。
- **加入 anoni.net 社群討論**：透過 Matrix 跟其他社群成員交換經驗，入口在 [社群參與](../../community/index.md)。

## 延伸閱讀

- [什麼是 Tor](../../tools/what-is-tor.md)
- [Tor Snowflake 橋接點](../../tools/tor-snowflake.md)
- [什麼是 OONI](../../tools/what-is-ooni.md)
- [Tor Relay 校園建立研究專題](../../community/relay-on-campus.md)
- [Tor Relays 觀測點](../../taiwan/tor-relay-watcher.md)
- [ASN 觀測資料分析](../../taiwan/ooni-asn-coverage.md)
- 同系列：[Defending the public's right to know（OONI）](https://blog.torproject.org/Defending-the-right-to-know/){target="_blank"}、[Preserving evidence: How OpenArchive fosters accountability and media sovereignty](https://blog.torproject.org/preserving-evidence-openarchive-fosters-accountability-media-sovereignty/){target="_blank"}
