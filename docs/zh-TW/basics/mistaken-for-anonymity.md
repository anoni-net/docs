---
title: 常被誤認為匿名的網路
description: 加密 DNS、IPFS、Yggdrasil、DN42、I2P 各自保護了什麼、還有誰能看到你，以及判斷一個工具能否讓你匿名的四個提問。
icon: material/incognito-off
---

# :material-incognito-off: 常被誤認為匿名的網路

換掉手機上的 DNS 設定、把網站放上 IPFS、加入志工自組的網路，這幾件事常被當成同一類，好像做了就能讓自己在網路上更難被認出來。實際上它們改變的東西落差很大，有的只是把能看到你上網紀錄的一方從電信商換成另一家公司，有的一個旁觀者都沒有減少，IPFS 還會多留下一組長期不變、可以用來認出你的識別碼。

加密讓別人讀不到內容，匿名讓別人無法把一段網路活動對應到你這個人，兩者是不同的保護（差別見 [匿名、隱私、假名、機密性的差別](anonymity-vs-privacy.md)）。本頁拿各專案官方文件自己寫下的設計目標來對照。Yggdrasil 的官方 FAQ 有一題就叫「Is Yggdrasil anonymous?」，回答的第一個字是 No[^ygg-faq]，其他幾個系統沒有明說，能看到你的人一樣還在。

## 五個系統與 Tor 的對照表

Tor 放在最後一列當比較的基準（Tor 的運作方式見 [什麼是 Tor](../tools/what-is-tor.md)）。

| 系統 | 用途 | 隱藏你的 IP | 隱藏你在找什麼 | 匿名是設計目標 | 還有誰能看到你 |
|---|---|---|---|---|---|
| **加密 DNS**（DoH/DoT） | 查詢網域時不被路上的人讀到 | ❌ | 部分 | ❌ | 你選的 DNS 業者、你的網路業者 |
| **IPFS** | 依內容取得檔案、不容易被下架 | ❌ | ❌ | ❌ | 跟你交換資料的節點、查詢公開索引的任何人 |
| **Yggdrasil** | 加密的實驗性網路 | ❌ | ❌ | ❌ | 跟你直接相連的節點、同一個區域網路上的裝置 |
| **DN42** | 練習網路路由技術 | ❌ | ❌ | ❌ | 跟你直接相連的節點、讀取公開註冊資料的任何人 |
| **I2P** | 網路內部的匿名通訊 | ✅ | ✅ | ✅ | 你的網路業者能看出你在使用 I2P |
| **Tor** | 匿名連線與繞過封鎖 | ✅ | ✅ | ✅ | 你的網路業者、出口節點 |

分界落在「匿名是設計目標」那一欄，前四個系統的官方文件都沒有把匿名列為設計目標，I2P 與 Tor 有。

VPN 沒有列進來，它的取捨另有專頁（見 [VPN 的風險與選擇](../tools/vpn-guide.md)）。結論跟這張表同一個方向，VPN 換掉的也只是誰能看到你的流量。

## 加密 DNS

每次開啟一個網站，裝置會先向 DNS 伺服器（resolver，負責把網域名稱翻成 IP 位址）查詢網站的位址。查詢預設沒有加密，同一個 Wi-Fi 的管理者、電信商與路上經過的設備，都可以讀到你查過哪些網域。加密 DNS 把裝置與 DNS 伺服器之間的查詢加密，常見的做法有 DoH（DNS over HTTPS）與 DoT（DNS over TLS）兩種。

加密 DNS 要在作業系統或瀏覽器的加密 DNS 設定裡填主機名稱或網址，例如 Cloudflare 的 `security.cloudflare-dns.com`[^cf-families]。只在 Wi-Fi 設定或路由器裡填一個 IP 位址，換掉的只有回答你的伺服器。查詢仍然沒有加密，路上的人照樣可以讀到你查過哪些網域。

加密之後，DNS 業者仍然收下你的每一筆查詢，也知道是誰問的。從電信商換成 Cloudflare 或 Google，改變的是這批紀錄由誰保管。你接著連往的網站 IP 位址也沒有隱藏，提供你網路的業者仍然知道你連去哪台伺服器，連線開頭的 SNI 欄位通常也會露出網站名稱（見 [Metadata 是什麼，為什麼重要](metadata.md)）。要選哪一家、各平台如何設定，見 [加密 DNS 怎麼選、怎麼確認真的生效](../tools/encrypted-dns.md)。

### 過濾型 DNS 服務

Cloudflare 除了不過濾的 `1.1.1.1`，另外提供 `1.1.1.2`（擋惡意軟體）與 `1.1.1.3`（再加擋成人內容）。被判定為惡意的網域會回傳 `0.0.0.0` 取代真實位址[^cf-families]，裝置連不到任何地方，網站看起來就像無法連線。

回傳假答案讓連線失敗正是 DNS 層審查的做法，技術上相同，差別在由誰決定。過濾是你自己選的，隨時可以換回 `1.1.1.1`。完整的封鎖清單與分類方法則沒有公開，你無法事先知道哪些網域會被擋。

執行 OONI Probe（量測網路審查的 App）時要特別留意，過濾型 DNS 擋掉的網域在量測資料裡看起來像當地網路的封鎖，實際上來自你自己裝置的設定。量測前該如何調整，同樣寫在 [加密 DNS 怎麼選、怎麼確認真的生效](../tools/encrypted-dns.md)。

## IPFS

IPFS 用檔案內容算出一個識別碼（CID）來找檔案。手上有這份檔案的任何節點（參與網路的電腦）都可以提供，不必依賴單一伺服器，所以比較不容易被下架。要找出誰有某個 CID，節點會到一份公開的分散式索引（DHT，Distributed Hash Table）查詢與宣告。發布者如何挑選架站方式，見主網站的 [去中心化網站發布](https://anoni.net/articles/dweb-ipfs-onion/){target="_blank"}。

自己架一個 IPFS 節點時，節點會在 DHT 上公開自己的識別碼（PeerID）與正在提供的 CID，查詢也在公開網路上進行。官方文件寫明這些資訊都是公開的，第三方可以監看，判斷哪些 CID 在什麼時候被誰請求[^ipfs-privacy]。同一份文件裡也寫到，用 PeerID 查一次 DHT 就可能找出你的 IP 位址，節點長期在同一個地點（例如家裡）執行時更是如此。

多數人沒有架設節點，只是開啟公開閘道（gateway，把 IPFS 內容轉成一般網頁的服務）的網址來讀。DHT 上不會出現你的資訊，閘道業者則一次看到你的 IP 與你要的每一個 CID，去中心化的部分又回到單一業者手上。

IPFS 只加密傳輸過程，檔案內容本身沒有加密，任何人取得 CID 都能下載並讀取。官方建議的做法包括自行加密敏感內容，或建立私有的 IPFS 網路，但你下載資料時發出的查詢與連線仍然帶著你的 IP。需要匿名把檔案交給別人，[OnionShare](../tools/onionshare.md) 是為此設計的工具，比在 IPFS 上自行組合安全得多。

## Yggdrasil

Yggdrasil 是架在現有網際網路上的加密實驗網路，每個節點用自己產生的金鑰推導出固定的 IPv6 位址，用途偏向把分散各地的網路串在一起[^ygg-about]。官方 FAQ 寫明提供匿名不是專案的目標，跟你直接相連的節點可以看到你的 IP 位址，並可能藉此判斷你的位置或身分。同一個區域網路內自動建立的連線，通常還會暴露裝置的 MAC 位址（網路卡的硬體編號）[^ygg-faq]。

## DN42

DN42 是一群人用來練習網路路由技術（例如 BGP，網路之間互相通報路線的協定）的實驗網路，在裡面設定出錯也不會波及真實的網際網路[^dn42-home]。加入時要在公開的註冊資料庫填寫名字或代號與 email，官方文件裡寫著必須假設填寫的任何資料都會公開，而且無法完全移除[^dn42-start]。參與者還要跟其他具名的成員一對一協商連線，匿名與它的設計方向相反。

## I2P

I2P 是表上唯一跟 Tor 一樣把匿名列為設計目標的系統，官方自稱是一層匿名網路，應用程式可以架在上面通訊[^i2p-intro]。流量經過多個節點層層加密，每個節點只看到傳遞過程的一部分，中間的節點無法得知訊息從誰送給誰。設計重心放在 I2P 網路內部的服務，要連上一般網站需透過另外有人提供的出口（outproxy），預設沒有設定。

即使如此，你的網路業者仍然能看出你在使用 I2P。Tor 一樣會被看出來，差別在 Tor 另外發展了橋接（bridge）等方式來隱藏這件事。要在會封鎖的環境裡使用 I2P，需先確認目前有哪些做法可行。

### I2P 與 Tor 的取捨

依 I2P 官方的比較，I2P 適合網路內部的服務與 P2P 應用，Tor 適合經由出口節點連上一般網站。I2P 對外連線的能力有限，官方也不鼓勵[^i2p-comparison]。使用人數的差距也寫在同一份比較裡，I2P 列出的是數萬個活躍路由器，Tor 則是每日數百萬使用者。一起使用的人越多，你越不容易從人群裡被挑出來，人數本身就是匿名保護的一部分。

本頁不包含安裝步驟，想嘗試的話從各專案的官方文件開始。

## 台灣的在地脈絡

在台灣，換 DNS 常見的理由是解析比較快，或某些網域在電信商的 DNS 上連不到。兩個理由都合理，但換 DNS 只對發生在 DNS 層的封鎖有用。封鎖發生在 IP 或 SNI 那一層時，換誰回答都一樣連不上。

換掉之後會一併失去哪些原有的 DNS 防護、執行 OONI Probe 前裝置該如何設定，都寫在 [加密 DNS 怎麼選、怎麼確認真的生效](../tools/encrypted-dns.md)。社群長期整理的 [ASN 多樣性與台灣的觀測缺口](https://anoni.net/projects/asn-coverage/asn-diversity/){target="_blank"} 就靠這些量測。

## 判斷工具的四個提問

遇到號稱能保護隱私的工具時，上面那張表的欄位可以換成四個提問：

1. 跟我通訊的對象還能不能看到我的 IP（對應「隱藏你的 IP」）
2. 別人能不能看出我在找什麼、連去哪裡（對應「隱藏你在找什麼」）
3. 這個專案自己有沒有把匿名列為設計目標（對應「匿名是設計目標」）
4. 用了這個工具之後，還有誰能看到我（對應「還有誰能看到你」）

第三題最容易回答，卻最常被跳過。專案的 FAQ 或設計文件通常會直接寫明，Yggdrasil 與 DN42 都主動寫了警告。前兩題的答案如果是「能」，代表工具保護的是內容或速度，跟你的身分無關。第四題最常被忽略的答案是觀察者換了一個，數量沒有變少。把這四題帶進 [威脅模型如何建立](threat-model.md) 的流程走一次，就能判斷工具適不適合你。

## 常見問題

??? question "我怎麼知道自己的 DNS 查詢真的加密了"

    看你填進去的是主機名稱還是 IP 位址。多數平台的一般 DNS 欄位只收 IP，填進去仍是明文，Windows 是例外。各平台的設定欄位、加密失敗時會不會自動退回明文，以及設定完如何實測，見 [加密 DNS 怎麼選、怎麼確認真的生效](../tools/encrypted-dns.md)。

??? question "VPN 為什麼不在這張表上"

    VPN 另有專頁討論，本頁的判斷方式對它完全適用。用了 VPN 之後，能看到你流量的一方從電信商換成 VPN 業者。如何挑選值得信任的服務、什麼情況下它不夠用，見 [VPN 的風險與選擇](../tools/vpn-guide.md)。

??? question "我只用公開閘道讀 IPFS，暴露的程度一樣嗎"

    開公開閘道的網址時你沒有加入 DHT，DHT 上不會出現你的資訊，代價是閘道業者一次看到你的 IP 與你要的每一個 CID。自己架節點是把資訊公開給網路上的許多人，用閘道是把資訊集中交給一家業者，兩種都無法讓你匿名。

??? question "把兩個疊起來用會更安全嗎，例如在 Tor 上執行 IPFS"

    疊加使用不一定比較安全，因為底層協定可能繞過你以為的那條通道。IPFS 的傳輸與 DHT 就有這個問題，看起來都經過 Tor，實際上仍有流量直接連出去。需要匿名傳檔案，用 [OnionShare](../tools/onionshare.md) 等專門設計的工具，比自行組合可靠。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-incognito-circle: 匿名、隱私、假名、機密性的差別](anonymity-vs-privacy.md)
- [:material-file-tree: Metadata 是什麼，為什麼重要](metadata.md)
- [:material-radar: 社群平台怎麼收集你的資料](platform-tracking.md)
- [:material-vpn: VPN 的風險與選擇](../tools/vpn-guide.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-share-variant-outline: OnionShare](../tools/onionshare.md)
- [:material-chart-bar: 台灣 ASN 涵蓋率](https://anoni.net/projects/asn-coverage/asn-diversity/){target="_blank"}
- [:material-shield-account-outline: 個人隱私指引](https://anoni.net/join/privacy-guide/){target="_blank"}

</div>

[^ygg-faq]: [Yggdrasil Network FAQ](https://yggdrasil-network.github.io/faq.html){target="_blank"} - Yggdrasil Network 官方站，「Is Yggdrasil anonymous?」一題。
[^ygg-about]: [About Yggdrasil](https://yggdrasil-network.github.io/about.html){target="_blank"} - Yggdrasil Network 官方站。
[^dn42-home]: [DN42 Home](https://dn42.dev/Home){target="_blank"} - DN42 官方 wiki。
[^dn42-start]: [DN42 Getting Started](https://dn42.dev/howto/Getting-Started){target="_blank"} - DN42 官方 wiki，註冊資料的公開性警告在 Create person objects 的 Data Privacy 一節。
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 開發者文件，`0.0.0.0` 的說明與 DoH/DoT 端點都在此頁。
[^ipfs-privacy]: [Privacy and Encryption](https://docs.ipfs.tech/concepts/privacy-and-encryption/){target="_blank"} - IPFS 官方文件。
[^i2p-intro]: [Intro to I2P](https://i2p.net/en/docs/overview/intro){target="_blank"} - I2P 官方站。舊網域 `geti2p.net` 現已轉向此站。
[^i2p-comparison]: [I2P Compared to Tor](https://i2p.net/en/docs/overview/comparison){target="_blank"} - I2P 官方站，人數與路由器規模為該頁列出的數字。
