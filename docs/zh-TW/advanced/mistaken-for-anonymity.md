---
title: 常被誤認為匿名的網路
description: 加密 DNS、IPFS、Yggdrasil、DN42、I2P 各自解決什麼問題、留下哪些暴露面。用官方文件的自述對照它們與 Tor 的差別。
icon: material/incognito-off
---

# :material-incognito-off: 常被誤認為匿名的網路

換掉手機上的 DNS resolver、把網站丟上 IPFS、加入一個志工自組的疊加網路，這幾個動作在中文討論裡常被歸進同一類，也就是讓自己在網路上更難被指認。實際跑起來，它們對「誰看得到什麼」的改動落差很大。有的把觀察者從電信商換成另一家公司，有的一個觀察者都沒少，還額外留下一組長期不變的節點識別碼。

這頁把加密 DNS、IPFS、Yggdrasil、DN42、I2P 五個系統擺在一起，用它們官方文件寫下的設計目標，對照各自留下的暴露面。Yggdrasil 的官方 FAQ 直接列了一題「Is Yggdrasil anonymous?」，回答的第一個字是 No，後面接著說明直接 peer 看得到你的 IP[^ygg-faq]。其餘幾個系統沒有把話說得這麼白，暴露面一樣在那裡。Tor 在表上只當參照的刻度，完整說明留在 [什麼是 Tor](../tools/what-is-tor.md)，需要先釐清加密與匿名的界線時回到 [匿名、隱私、假名、機密性的差別](../basics/anonymity-vs-privacy.md)，判斷自己需要哪一種保護則走一次 [威脅模型如何建立](../basics/threat-model.md)。

## 先把六個系統擺在一起

| 系統 | 它解決的問題 | 隱藏你的 IP | 隱藏你在找什麼 | 匿名是設計目標 | 誰仍然看得到你 |
|---|---|---|---|---|---|
| **加密 DNS**（DoH/DoT） | 讓網路路徑上的第三方讀不到你的網域查詢 | ❌ | 部分（路徑上看不到，resolver 全看得到） | ❌ | 你選的那家 resolver 收下全部查詢，ISP 仍看得到你接著連上的目的 IP |
| **IPFS** | 內容定址、抗刪除、抗單點下架 | ❌ | ❌ | ❌ | 交換資料的 peer 與 DHT 上的節點，看得到哪個 IP 在找哪個 CID |
| **Yggdrasil** | 端對端加密、自己找路的 IPv6 疊加網路 | ❌ | ❌ | ❌（官方 FAQ 明文） | 直接 peer 看得到你的 IP，區域網路的自動 peering 還會露出裝置 MAC 位址 |
| **DN42** | 用真實 BGP、whois、DNS 技術搭起來的實驗網路 | ❌ | ❌ | ❌（官方明文警告） | peer 看得到你的 IP，公開 registry 長期留著你註冊時填的聯絡資訊 |
| **I2P** | 網路內部的匿名通訊層 | ✅（對網路內的通訊對象） | ✅ | ✅ | 你的 ISP 看得到你在跑 I2P，走 outproxy 出網時另有一組風險 |
| **Tor** | 連線匿名與規避審查 | ✅ | ✅ | ✅ | 不開橋接時 ISP 看得到你在用 Tor，出口節點看得到你的目的地 |

表上真正的分界落在第五欄，前四個系統的官方文件都沒有把匿名列進設計目標，後兩個有，而且為此付出了延遲與相容性的代價。把前四個當成匿名工具使用，拿到的保護跟預期的差距就出在這裡。

## 加密 DNS：換掉的是誰看得到

DNS 查詢預設走明文，你的裝置每問一次「這個網域的 IP 是多少」，路徑上的設備都讀得到。DoH（DNS over HTTPS，`RFC 8484`）把查詢包進一般的 HTTPS 連線，DoT（DNS over TLS，`RFC 7858`）走專用連接埠的 TLS。兩者加密的都是你到 resolver 這一段。

resolver 本身收下你的每一筆查詢，而且知道是誰問的。把系統設定從電信商的 resolver 換成 Cloudflare 或 Google，改變的是這批紀錄落在誰手上。查詢加密之後，你接著要連上的目的 IP 仍然出現在封包裡，掌握你這條線路的一方看得到你連去哪台伺服器。TLS 握手裡的 SNI 欄位也還在，這一塊的變化與限制寫在 [Metadata 是什麼，為什麼重要](../basics/metadata.md)。

### 過濾型 resolver 與 DNS 審查是同一個動作

Cloudflare 除了不過濾的 `1.1.1.1`，另外提供 `1.1.1.2`（擋惡意軟體）與 `1.1.1.3`（再加擋成人內容）。官方文件說明被判定為惡意的網域會回傳 `0.0.0.0`，取代真實位址[^cf-families]。

回傳一個假答案讓連線失敗，這正是 DNS 層審查的做法。技術動作一樣，差別在使用者這一端的位置：過濾是你自己選的，隨時可以換回 `1.1.1.1`，Cloudflare 也提供匿名回報誤判的管道。要留意的是完整封鎖清單與分類方法並未公開，你無法事先知道哪些網域會被擋掉。

這件事對跑 OONI Probe 的人有實際影響。網路連線測試（Web Connectivity）的判斷方式是用系統 resolver 解析網域，再跟測試輔助伺服器解出來的結果比對，位址或 ASN 對得上才算一致[^ooni-wc]。過濾型 resolver 對被擋的網域回 `0.0.0.0`，這個結果跟輔助伺服器對不上。量測資料看起來像當地網路出了狀況，來源其實是這台裝置自己的設定。

## IPFS：去中心化，每次查詢仍帶著你的 IP

IPFS 的內容定址與 DHT 怎麼運作，寫在 [去中心化網站發布](./dweb-ipfs-onion.md)，那頁處理的是發布者要怎麼選架站方式。這裡只看它留下的暴露面。

官方文件把話說得相當清楚：節點發布到 DHT 的必要 metadata，包含節點識別碼（PeerID）與它正在提供的 CID，都是公開的，而且「那些 DHT 查詢在公開場合發生」，因此第三方有可能監看這些流量，判斷哪些 CID 在什麼時候被誰請求[^ipfs-privacy]。同一份文件還提到，對你的 PeerID 做一次 DHT 查詢就可能找出你的 IP 位址，節點若長期從同一個地點運作（例如家裡）更是如此。

加密的範圍是另一層落差，IPFS 加密的是傳輸過程，內容本身維持原樣，任何人拿到 CID 都能下載並讀取那份資料。官方給的緩解做法是關掉 reproviding、自行加密敏感內容，或者乾脆跑一個私有的 IPFS 網路。

## Yggdrasil：把 IPv6 疊在現有網路上

Yggdrasil 是一個端對端加密的 IPv6 疊加網路，跑在現有的網際網路之上，節點之間用 `tcp://` 或 `tls://` 建立 peering。位址落在 `0200::/7` 這個 IETF 已經廢棄的範圍，選它是為了避開與既有 ULA 位址的衝突。節點自己產生一組密碼學身分，穩定的 IPv6 位址由這把金鑰推導出來，不需要中央機構配發[^ygg-about]。這個定址方式跟 Tor 的 v3 洋蔥位址是同一種思路，位址本身帶著驗證資訊。

匿名性上它走的方向不同，而且官方寫得毫不含糊。FAQ 那一題的回答是「不，提供匿名並非 Yggdrasil 專案的目標。網際網路上的直接 peer 看得到你的 IP 位址，並可能用這項資訊判斷你的位置或身分」，後面還補上一句：同一個區域網路內經由 multicast 自動建立的 peering，通常會暴露你的裝置 MAC 位址[^ygg-faq]。專案同時把自己標為 alpha 階段的軟體，附帶相應的警語。

## DN42：去中心化到極致，也公開到極致

DN42 的自述是一個大型的動態 VPN，使用 BGP、whois 資料庫、DNS 這些網際網路技術，用途放在學習路由技術、串接私有網路，以及做實驗，因為在裡面弄壞東西不會有大型網路營運商找上門[^dn42-home]。

它用的資源全部取自私有範圍，IPv4 是 `172.20.0.0/14`、IPv6 是 `fd00::/8`、ASN 落在 `4242420000` 到 `4242423999`，所以整套跟真實網際網路的位址空間是隔開的。加入方式是 fork 官方的 git registry，建立維護者、聯絡人、ASN、網段這些物件，簽名後送出 PR[^dn42-start]。

匿名性在這裡是反方向的要求，註冊時必須公開聯絡人物件，裡面有名字或代號與 email，官方文件在資料隱私那一節寫著：「請同時注意，DN42 registry 是公開資源，你必須假設所提供的任何細節都會被公開，而且無法被完全移除」[^dn42-start]。之後還要跟具名的人一對一協商 peering，並維持一台長時間開機的路由器。任何人若是從隱私角度靠近它，這幾件事應該在動手之前就知道。

### 為什麼它反而是學 ASN 與 BGP 的好地方

站上的 [互動與呈現](../games/index.md) 區有一件 Tor 路由解謎，玩法就是把三跳分散到不同 ASN，[台灣 ASN 涵蓋率](../taiwan/ooni-asn-coverage.md) 整套分析同樣建立在 AS 這個單位上，但讀者多半只能從外面理解這個概念。DN42 提供的是從裡面看的機會，你可以自己領一個 ASN、宣告路由、跟別人建立 peering，然後看著路由決策實際發生，弄錯了也不會波及真實網路。它不提供匿名，這件事不影響它作為練習場的價值。

## I2P：同樣以匿名為設計目標

I2P 自述是一個可擴充、自我組織、有韌性的封包交換匿名網路層，各種注重匿名或安全的應用可以架在上面[^i2p-intro]。它跟 Tor 的分工差別，官方寫得很直接：「I2P 本身不是一個 outproxy 網路」，因為把資料送進送出混合網路本身帶有匿名與安全上的疑慮，所以設計重心放在讓使用者不必依賴外部資源就能滿足需求。I2PTunnel 仍提供選用的 outproxy 功能，但預設沒有人擔任 outproxy。

tunnel 在 I2P 是單向的，outbound tunnel 把訊息送出去、inbound tunnel 把訊息收進來，每個參與者只看得到通訊流程的一半。訊息採用 garlic routing，一個加密訊息裡可以包進多個完整的訊息與各自的投遞指示，中間的節點無法判斷裡面有幾則訊息、要送去哪裡。網路資料庫由稱為 floodfill 的路由器以 Kademlia 演算法儲存與散布。

即使如此，你的 ISP 仍然看得到你在跑 I2P。這一點跟 Tor 相同，兩者處理的是連線內容與對應關係的匿名，並未隱藏「你在使用這個網路」這個事實。

### 跟 Tor 的取捨差在哪裡

依 I2P 自己的比較，它最佳化的對象是網路內部的隱藏服務與 P2P 應用，Tor 最佳化的是經由出口節點連上一般網站，I2P 對外連出的能力有限而且不被鼓勵[^i2p-comparison]。單向 tunnel 讓時序關聯分析更困難，代價是一次往返經過的節點數比 Tor 的隱藏服務電路多。匿名集的規模差距也在那份比較裡，I2P 列出的是數萬個活躍路由器，Tor 則是每日數百萬使用者，人數本身就是匿名保護的一部分。

需要瀏覽一般網站，Tor 是成熟得多的選擇，細節見 [什麼是 Tor](../tools/what-is-tor.md)。

## 回到威脅模型：表上那幾欄各自對應什麼提問

拿到一個號稱能保護隱私的工具時，上面那張表的欄位可以直接翻成四個提問。

1. 我的 IP 對通訊對象還看不看得到（對應第三欄）
2. 別人看不看得出我在找什麼、在連誰（對應第四欄）
3. 這個專案自己有沒有把匿名列進設計目標（對應第五欄）
4. 換過之後，剩下哪些人還看得到我（對應第六欄）

第三個提問最省力也最容易被跳過，專案的 FAQ 或設計文件通常會直說，Yggdrasil 與 DN42 都主動寫了警告。把這四題帶進 [威脅模型如何建立](../basics/threat-model.md) 的流程，就能判斷手上的工具擋不擋得住你真正在意的那個對手。

## 在地脈絡：台灣讀者會碰到的版本

台灣讀者換掉 DNS 設定的常見動機是解析比較快，或者某些網域在電信商的 resolver 上連不到。這兩個動機都合理，得到的結果是查詢紀錄換一個對象保管，連線本身的可見度沒有變化。

跑 OONI Probe 的人另外要留意設定。社群長期在整理 [台灣 ASN 涵蓋率](../taiwan/ooni-asn-coverage.md)，資料來自各地志工的量測，一台裝置若同時開著過濾型 resolver，它回報的異常有機會來自自己的設定而非當地網路。要做觀測時把系統 resolver 換回不過濾的那一組，資料會乾淨得多。[什麼是 OONI](../tools/what-is-ooni.md) 說明了這些量測怎麼被使用。

## 常見問題

??? question "換成 `1.1.1.1` 之後，ISP 就看不到我在連哪裡了嗎"

    看得到。加密的是網域查詢那一段，你接著要跟目的伺服器建立連線，那個 IP 位址就在封包裡。ISP 不需要看你的 DNS 查詢，看你連去哪台機器一樣能推出你在造訪什麼。要讓 ISP 看不到目的地，需要的是 Tor 或 VPN 這類會把流量整段轉走的工具，取捨見 [VPN 的風險與選擇](../tools/vpn-guide.md)。

??? question "Yggdrasil 或 DN42 能拿來取代 VPN 嗎"

    兩者都不適合。Yggdrasil 的官方 FAQ 直接說明匿名不是專案目標，直接 peer 看得到你的 IP。DN42 更進一步，加入時就要把聯絡資訊登記在公開的 registry 上，而且官方寫明無法完全移除。它們解決的是連通性與學習需求，跟 VPN 想解決的問題不同。

??? question "我把檔案放上 IPFS，別人查得到是我放的嗎"

    有機會。官方文件說明節點提供的 CID 與 PeerID 都會公開發布到 DHT，對 PeerID 做查詢可能找出對應的 IP，節點長期在同一個地點時更容易對上。內容本身也沒有加密，拿到 CID 的人都讀得到。需要匿名發布時，IPFS 要另外搭配能隱藏連線的工具。

??? question "I2P 跟 Tor 我該選哪個"

    看你要連的東西在哪裡。目標是一般網站，Tor 的出口生態成熟得多，I2P 對外連出的能力有限而且官方不鼓勵。目標是網路內部的服務或 P2P 應用，I2P 就是為此設計的。兩者都以匿名為設計目標，差別在最佳化的方向。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-incognito-circle: 匿名、隱私、假名、機密性的差別](../basics/anonymity-vs-privacy.md)
- [:material-file-tree: Metadata 是什麼，為什麼重要](../basics/metadata.md)
- [:material-web-box: 去中心化網站發布](./dweb-ipfs-onion.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-access-point-network: 什麼是 OONI](../tools/what-is-ooni.md)
- [:material-chart-bar: 台灣 ASN 涵蓋率](../taiwan/ooni-asn-coverage.md)
- [:material-shield-account-outline: 個人隱私指引](../community/privacy-guide.md)

</div>

[^ygg-faq]: [Yggdrasil Network FAQ](https://yggdrasil-network.github.io/faq.html){target="_blank"} - Yggdrasil Network 官方站，「Is Yggdrasil anonymous?」一題。
[^ygg-about]: [About Yggdrasil](https://yggdrasil-network.github.io/about.html){target="_blank"} - Yggdrasil Network 官方站。
[^dn42-home]: [DN42 Home](https://dn42.dev/Home){target="_blank"} - DN42 官方 wiki。
[^dn42-start]: [DN42 Getting Started](https://dn42.dev/howto/Getting-Started){target="_blank"} - DN42 官方 wiki，registry 的公開性警告在 Create person objects 的 Data Privacy 一節。
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 開發者文件。
[^ipfs-privacy]: [Privacy and Encryption](https://docs.ipfs.tech/concepts/privacy-and-encryption/){target="_blank"} - IPFS 官方文件。
[^i2p-intro]: [Intro to I2P](https://i2p.net/en/docs/overview/intro){target="_blank"} - I2P 官方站。舊網域 `geti2p.net` 現已轉向此站。
[^i2p-comparison]: [I2P Compared to Tor](https://i2p.net/en/docs/overview/comparison){target="_blank"} - I2P 官方站，人數與路由器規模為該頁列出的數字。
[^ooni-wc]: [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} - OONI 測試規格。
