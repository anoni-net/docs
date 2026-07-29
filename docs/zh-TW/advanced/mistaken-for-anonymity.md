---
title: 常被誤認為匿名的網路
description: 加密 DNS、IPFS、Yggdrasil、DN42、I2P 各自解決什麼問題、留下哪些暴露面。用官方文件的自述對照它們與 Tor 的差別。
icon: material/incognito-off
---

# :material-incognito-off: 常被誤認為匿名的網路

換掉手機上的 DNS resolver（負責把網域名稱翻成 IP 位址的伺服器）、把網站丟上 IPFS、加入一個志工自組的疊加網路（overlay network，架在現有網際網路之上、自成一套定址與路由的網路），這幾個動作在中文討論裡常被歸進同一類，也就是讓自己在網路上更難被指認。實際跑起來，它們對「誰看得到什麼」的改動落差很大，有的把觀察者從電信商換成另一家公司，有的一個觀察者都沒少，IPFS 那種還額外留下一組長期不變的節點識別碼。

Yggdrasil 的官方 FAQ 裡有一題就叫「Is Yggdrasil anonymous?」，回答的第一個字是 No[^ygg-faq]。其餘幾個系統沒有把話說得這麼白，暴露面一樣在那裡。這頁用各專案自己寫下的設計目標，對照它們留下的暴露面，讀完會有四個可以套在任何工具上的提問。

Tor 只在表上當對照組，完整說明見 [什麼是 Tor](../tools/what-is-tor.md)。要先釐清加密與匿名的界線，看 [匿名、隱私、假名、機密性的差別](../basics/anonymity-vs-privacy.md)。

## 五個系統加上 Tor 這把尺

| 系統 | 它解決的問題 | 隱藏你的 IP | 隱藏你在找什麼 | 匿名是設計目標 | 誰仍然看得到你 |
|---|---|---|---|---|---|
| **加密 DNS**（DoH/DoT） | 網域查詢不被路徑上的人讀到 | ❌ | 部分 | ❌ | 你選的 resolver 業者、你的 ISP |
| **IPFS** | 內容定址、抗下架 | ❌ | ❌ | ❌ | 跟你交換資料的 peer、DHT 上的任何人 |
| **Yggdrasil** | 加密的 IPv6 疊加網路 | ❌ | ❌ | ❌ | 直接 peer、同一個區域網路上的裝置 |
| **DN42** | 用真實路由技術做實驗 | ❌ | ❌ | ❌ | 直接 peer、registry 的任何讀者 |
| **I2P** | 網路內部的匿名通訊 | ✅ | ✅ | ✅ | 你的 ISP 看得到你在跑 I2P |
| **Tor** | 連線匿名與規避審查 | ✅ | ✅ | ✅ | 你的 ISP、出口節點 |

表上真正的分界落在第五欄，前四個系統的官方文件都沒有把匿名列進設計目標，後兩個有。

VPN 沒有列進來，它的取捨另有專頁處理，見 [VPN 的風險與選擇](../tools/vpn-guide.md)。那頁的結論跟這張表同一個方向，VPN 換掉的也是誰看得到你的流量。

## 加密 DNS：換掉的只是誰收下你的查詢

DNS 查詢預設走明文，你的裝置每問一次「這個網域的 IP 是多少」，路徑上的設備都讀得到。DoH（DNS over HTTPS，`RFC 8484`）把查詢包進一般的 HTTPS 連線，DoT（DNS over TLS，`RFC 7858`）走專用連接埠的 TLS。兩者加密的都是你到 resolver 這一段。

加密查詢要指定的是一個主機名稱或網址，例如 Cloudflare 的 DoT 主機名稱 `security.cloudflare-dns.com` 與 DoH 網址 `https://security.cloudflare-dns.com/dns-query`[^cf-families]，這一點很容易搞錯。在 Wi-Fi 設定或路由器裡填一個 IP 位址，換掉的只有回答你的那台伺服器，查詢仍然走明文的第 53 埠，路徑上的人照樣讀得到你問過哪些網域。要真的加密，得用作業系統或瀏覽器的加密 DNS 設定填入主機名稱，各平台的設定方式差異不小。

resolver 本身收下你的每一筆查詢，也知道是誰問的，把系統設定從電信商的 resolver 換成 Cloudflare 或 Google，改變的只是這批紀錄落在誰手上。查詢加密之後，你接著要連上的目的 IP 仍然出現在封包裡，掌握你這條線路的一方看得到你連去哪台伺服器。TLS 握手裡的 SNI 欄位也還在，SNI 的變化與限制寫在 [Metadata 是什麼，為什麼重要](../basics/metadata.md)。具體要選哪一家、各平台的欄位收什麼，見 [加密 DNS 怎麼選、怎麼確認真的生效](../tools/encrypted-dns.md)。

### 過濾型 resolver：跟審查用同一個動作，也會污染量測

Cloudflare 除了不過濾的 `1.1.1.1`，另外提供 `1.1.1.2`（擋惡意軟體）與 `1.1.1.3`（再加擋成人內容）。官方文件說明被判定為惡意的網域會回傳 `0.0.0.0`，取代真實位址[^cf-families]。裝置拿到這個位址就連不到任何地方，網站看起來就像掛了。

回傳一個假答案讓連線失敗，正是 DNS 層審查的做法，技術動作一樣，差別在這個動作由誰決定。過濾是你自己選的，隨時可以換回 `1.1.1.1`，Cloudflare 也提供匿名回報誤判的管道。完整封鎖清單與分類方法並未公開，你無法事先知道哪些網域會被擋掉。

跑 OONI Probe 的人會直接踩到這個差別。過濾型 resolver 對被擋的網域回 `0.0.0.0`，量測資料看起來像當地網路出了狀況，來源是這台裝置自己的設定。比對機制與量測前該怎麼調整，見 [加密 DNS 怎麼選、怎麼確認真的生效](../tools/encrypted-dns.md)。

## IPFS：去中心化，每次查詢仍帶著你的 IP

IPFS 的內容定址與 DHT（Distributed Hash Table，分散式雜湊表）怎麼運作，寫在給發布者挑架站方式的 [去中心化網站發布](./dweb-ipfs-onion.md)。

自己跑一個 IPFS 節點時，暴露面來自它必須對外宣告的東西。節點發布到 DHT 的必要 metadata，包含節點識別碼（PeerID）與它正在提供的內容識別碼（CID），官方文件寫明都是公開的，這些 DHT 查詢也是在公開網路上進行的，因此第三方有可能監看這些流量，判斷哪些 CID 在什麼時候被誰請求[^ipfs-privacy]。同一份文件還提到，對你的 PeerID 做一次 DHT 查詢就可能找出你的 IP 位址，節點若長期從同一個地點運作（例如家裡）更是如此。

多數說自己在用 IPFS 的人沒有跑節點，只是開 `ipfs.io` 這類公開網關的網址來讀。這個情境的暴露面是另外一組，DHT 上看不到你，網關業者則是一次看到你的 IP 與你要的每一個 CID，你在網路上的樣子就是一個普通的 HTTPS 客戶端，去中心化的那一部分換回了單一業者。

加密的範圍是另一層落差，IPFS 加密的是傳輸過程，內容本身維持原樣，任何人拿到 CID 都能下載並讀取那份資料。官方給的緩解做法是關掉 reproviding（節點定期向 DHT 重新宣告自己有哪些內容的機制）、自行加密敏感內容，或者跑一個私有的 IPFS 網路。要留意關掉 reproviding 只讓你不再宣告自己提供什麼，你去抓資料時發出的 DHT 查詢與 peer 連線照樣帶著你的 IP。需要匿名把檔案交給別人，[OnionShare](../tools/onionshare.md) 是為這件事設計的工具，比在 IPFS 上自己拼一套安全得多。

## Yggdrasil：官方 FAQ 自己回答了不匿名

Yggdrasil 是一個端對端加密的 IPv6 疊加網路，跑在現有的網際網路之上，節點之間用 `tcp://` 或 `tls://` 建立 peering（兩個節點互相對接、交換路由與流量的關係）。位址落在 `0200::/7` 這個 IETF 已經廢棄的範圍，選它是為了避開與既有位址的衝突。節點自己產生一組金鑰對，穩定的 IPv6 位址由這把金鑰推導出來，不需要中央機構配發[^ygg-about]。這個定址方式跟 Tor 的 v3 洋蔥位址是同一種思路，位址本身帶著驗證資訊。

社群拿它來串接分散各地的私有網路、跑社群內部服務、做 mesh 網路實驗，用途偏向連通性。

匿名性上走的方向不同，FAQ 那一題的回答是「不，提供匿名並非 Yggdrasil 專案的目標。網際網路上的直接 peer 看得到你的 IP 位址，並可能用這項資訊判斷你的位置或身分」，後面還補上一句，同一個區域網路內經由 multicast（一台裝置同時對區網上多台裝置廣播的傳送方式）自動建立的 peering，通常會暴露你的裝置 MAC 位址[^ygg-faq]。專案同時把自己標為 alpha 階段的軟體。

## DN42：註冊資料從一開始就是公開的

DN42 的自述是一個大型的動態 VPN，使用 BGP（網路之間互相通報「我這邊能連到哪些位址」的協定）、whois 資料庫、DNS 這些網際網路技術，用途放在學習路由技術、串接私有網路，以及做實驗，因為在裡面弄壞東西不會有大型網路營運商找上門[^dn42-home]。

它用的資源全部取自私有範圍，IPv4 是 `172.20.0.0/14`、IPv6 是 `fd00::/8`、ASN（Autonomous System Number，每個獨立管理網路的身分編號）落在 `4242420000` 到 `4242423999`。加入方式是 fork 官方的 git registry，建立維護者、聯絡人、ASN、網段這些物件，簽名後送出 PR[^dn42-start]。

匿名性在這裡是反方向的要求，註冊時必須公開聯絡人物件，裡面有名字或代號與 email，官方文件在資料隱私那一節寫著：「請同時注意，DN42 registry 是公開資源，你必須假設所提供的任何細節都會被公開，而且無法被完全移除」[^dn42-start]。之後還要跟具名的人一對一協商 peering，並維持一台長時間開機的路由器。

不提供匿名這件事，不妨礙它成為理解 AS 與 BGP 的地方。站上的 [互動與呈現](../games/index.md) 區有一個 Tor 路由解謎的主題就是把三跳分散到不同 ASN，[台灣 ASN 涵蓋率](../taiwan/ooni-asn-coverage.md) 整套分析同樣建立在 AS 這個單位上，而 DN42 是少數能讓人自己領一個 ASN、宣告路由、看著路由決策實際發生的地方，弄錯了也不會波及真實網路。

## I2P：把匿名列進設計目標的那一個

前面四個系統的官方文件都沒有把匿名寫進設計目標，這一個有。I2P 自稱是一層匿名的封包交換網路，能擴充、也能自我組織，各種注重匿名或安全的應用可以架在上面[^i2p-intro]。它跟 Tor 的分工差別，官方寫得很直接：「I2P 本身不是一個 outproxy 網路」，資料進出混合網路這個動作本身帶有匿名與安全上的疑慮，所以設計重心放在讓使用者不必離開 I2P 就能把事情做完。I2PTunnel 仍提供選用的 outproxy（相當於 Tor 的出口節點，把流量送回一般網際網路），但預設沒有人擔任這個角色。

tunnel 在 I2P 是單向的，outbound 送出去、inbound 收進來，每個參與者只看得到通訊流程的一半。訊息採用 garlic routing，一個加密訊息裡可以包進多個完整的訊息與各自的投遞指示，中間的節點無法判斷裡面有幾則訊息、要送去哪裡。網路資料庫交給稱為 floodfill 的路由器保管，它們看得到的是誰在查詢哪個目的地，看不到訊息內容。

即使如此，你的 ISP 仍然看得到你在跑 I2P，Tor 也一樣，兩者做的是連線內容與對應關係的匿名，沒有隱藏你正在使用這個網路。差別在於 Tor 另外發展了橋接與可插拔傳輸來處理這件事，要在封鎖環境使用 I2P，得先確認目前有哪些做法可行。

### 跟 Tor 的取捨差在哪裡

依 I2P 自己的比較，它最佳化的對象是網路內部的隱藏服務與 P2P 應用，Tor 最佳化的是經由出口節點連上一般網站，I2P 對外連出的能力有限，官方也不鼓勵[^i2p-comparison]。單向 tunnel 讓時序關聯分析更困難，代價是一次往返經過的節點數比 Tor 的洋蔥服務電路多。匿名集（anonymity set，同一批可能是你的人有多少）的規模差距也在那份比較裡，I2P 列出的是數萬個活躍路由器，Tor 則是每日數百萬使用者，人數本身就是匿名保護的一部分。

這頁不談安裝，要動手試的話從各專案的官方文件開始。

## 在地脈絡：台灣

台灣讀者換掉 DNS 設定的常見動機是解析比較快，或者某些網域在電信商的 resolver 上連不到，兩個動機都合理，但換 resolver 只對 DNS 層的封鎖有用，如果封鎖發生在 IP 或 SNI 那一層，換誰回答你都連不上。

換掉之後會一併失去哪些既有的 DNS 層防護、跑 OONI Probe 時裝置該怎麼設定，都寫在 [加密 DNS 怎麼選、怎麼確認真的生效](../tools/encrypted-dns.md)。社群長期在整理的 [台灣 ASN 涵蓋率](../taiwan/ooni-asn-coverage.md) 就靠這些量測。

## 回到威脅模型：表上那幾欄各自對應什麼提問

拿到一個號稱能保護隱私的工具時，上面那張表的欄位可以直接翻成四個提問。

1. 通訊對象還看不看得到我的 IP（對應第三欄）
2. 別人看不看得出我在找什麼、在連誰（對應第四欄）
3. 這個專案自己有沒有把匿名列進設計目標（對應第五欄）
4. 換上這個工具之後，剩下哪些人還看得到我（對應第六欄）

第三個提問最省力也最容易被跳過，專案的 FAQ 或設計文件通常會直說，Yggdrasil 與 DN42 都主動寫了警告。前兩題的答案若是「看得到」，代表這個工具處理的是內容或效能，跟身分無關。第四題最容易被忽略的答案是「換了一個，沒有變少」。把這四題帶進 [威脅模型如何建立](../basics/threat-model.md) 的流程走一次，答案就出來了。

## 常見問題

??? question "我怎麼知道自己的 DNS 查詢真的加密了"

    看你填進去的是主機名稱還是 IP 位址。多數平台的一般 DNS 欄位只收 IP，填進去就是明文，Windows 是例外。各平台的欄位形狀、失敗時會不會靜默退回明文，以及設完怎麼實測，見 [加密 DNS 怎麼選、怎麼確認真的生效](../tools/encrypted-dns.md)。

??? question "VPN 為什麼不在這張表上"

    因為它值得一整頁。VPN 在中文討論裡被誤認得最嚴重，這頁的論證對它完全成立，換掉的一樣是誰看得到你的流量，從電信商換成 VPN 業者。完整的取捨、怎麼挑一家值得信任的、什麼情況下它不夠用，見 [VPN 的風險與選擇](../tools/vpn-guide.md)。

??? question "我只用公開網關讀 IPFS，暴露面一樣嗎"

    不一樣，但也沒有比較好。開 `ipfs.io` 的網址時你沒有加入 DHT，所以 DHT 上看不到你，代價是網關業者一次看到你的 IP 與你要的每一個 CID。自己跑節點是把資訊攤給網路上的很多人，用網關是把資訊集中交給一家業者。

??? question "把兩個疊起來用會更安全嗎，例如在 Tor 上跑 IPFS"

    不要預設可行。這類組合的困難在於底層協定會不會繞過你以為的那條通道，IPFS 的傳輸與 DHT 就有這個問題，看起來包好了，實際上仍有流量走原路。需要匿名傳檔案，用 [OnionShare](../tools/onionshare.md) 這種為此設計的工具，比自己拼一套可靠。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-incognito-circle: 匿名、隱私、假名、機密性的差別](../basics/anonymity-vs-privacy.md)
- [:material-file-tree: Metadata 是什麼，為什麼重要](../basics/metadata.md)
- [:material-vpn: VPN 的風險與選擇](../tools/vpn-guide.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-share-variant-outline: OnionShare](../tools/onionshare.md)
- [:material-chart-bar: 台灣 ASN 涵蓋率](../taiwan/ooni-asn-coverage.md)
- [:material-shield-account-outline: 個人隱私指引](../community/privacy-guide.md)

</div>

[^ygg-faq]: [Yggdrasil Network FAQ](https://yggdrasil-network.github.io/faq.html){target="_blank"} - Yggdrasil Network 官方站，「Is Yggdrasil anonymous?」一題。
[^ygg-about]: [About Yggdrasil](https://yggdrasil-network.github.io/about.html){target="_blank"} - Yggdrasil Network 官方站。
[^dn42-home]: [DN42 Home](https://dn42.dev/Home){target="_blank"} - DN42 官方 wiki。
[^dn42-start]: [DN42 Getting Started](https://dn42.dev/howto/Getting-Started){target="_blank"} - DN42 官方 wiki，registry 的公開性警告在 Create person objects 的 Data Privacy 一節。
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 開發者文件，`0.0.0.0` 的說明與 DoH/DoT 端點都在此頁。
[^ipfs-privacy]: [Privacy and Encryption](https://docs.ipfs.tech/concepts/privacy-and-encryption/){target="_blank"} - IPFS 官方文件。
[^i2p-intro]: [Intro to I2P](https://i2p.net/en/docs/overview/intro){target="_blank"} - I2P 官方站。舊網域 `geti2p.net` 現已轉向此站。
[^i2p-comparison]: [I2P Compared to Tor](https://i2p.net/en/docs/overview/comparison){target="_blank"} - I2P 官方站，人數與路由器規模為該頁列出的數字。
