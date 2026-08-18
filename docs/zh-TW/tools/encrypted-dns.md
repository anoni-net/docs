---
title: 加密 DNS 怎麼選、怎麼確認真的生效
description: DoH、DoT、DoQ 的差別，resolver 業者的挑選準則，各平台的欄位收什麼、失敗時會不會靜默退回明文，以及設完之後怎麼實測。
icon: material/dns
---

# :material-dns: 加密 DNS 怎麼選、怎麼確認真的生效

在手機的 Wi-Fi 設定裡把 DNS 那一欄填成 `1.1.1.1`，是很多人做過的第一個隱私設定。換掉的只有回答你的那台伺服器，查詢本身仍然以明文送出去，路徑上的設備照樣讀得到你問過哪些網域。

要不要換，看你想解決什麼，想讓電信商看不到你查詢過哪些網域，加密 DNS 有效，代價是換一家業者保管這批紀錄。想繞過封鎖，需先確認封鎖在哪一層。想匿名，加密 DNS 做不到，理由寫在 [常被誤認為匿名的網路](../advanced/mistaken-for-anonymity.md)。

這頁不寫各平台的逐步設定畫面，那類步驟隨系統版本改變，網路上的轉貼往往沒跟著更新。給的是不管在哪個平台都用得上的東西：各家欄位收什麼形狀、失敗時會不會靜默退回明文，以及設完之後怎麼實測。

!!! tip "時間有限的話，先看這幾點"

    - 加密 DNS 要指定一個主機名稱或網址。多數平台的一般 DNS 欄位只收 IP，填進去就是明文。Windows 是例外，它用 IP 對照內建的已知清單
    - 加密之後，看得到你查詢的人從電信商換成 resolver 業者，人數變少，沒有歸零
    - 挑 resolver 就是挑一個你願意信任的紀錄保管者，看司法管轄、記錄政策、有沒有獨立稽核、過不過濾
    - **設定顯示已開啟不代表正在加密。** Windows、Firefox、Chrome 的預設模式都會在失敗時退回明文，而且不通知你
    - 系統層與瀏覽器層是兩份設定，只改一邊，另一邊維持原狀
    - 設完一定要實測，看你自己填了什麼是檢查不出靜默退回的

## 沒有加密時，路徑上的人看得到什麼、能改什麼

DNS 查詢預設走第 53 埠的明文，你的裝置每問一次「這個網域的 IP 是多少」，從家用路由器、電信商到中間任何一段線路上的設備，都讀得到完整的網域名稱。累積下來的查詢紀錄就足以還原你在什麼時間造訪過哪些站，跟連線內容有沒有加密無關。網域查詢屬於哪一類暴露，寫在 [Metadata 是什麼，為什麼重要](../basics/metadata.md)。

路徑上的人除了讀得到查詢，也能改掉回應。常見的 DNS 層封鎖就是對特定網域回一個錯的位址，連線直接失敗。後面談的過濾型 resolver、量測污染，全部建立在這個機制上。

## DoH、DoT、DoQ 的差別

三種都是把查詢加密，差別在外面包了什麼協定，直接影響它在受限網路裡會不會被擋掉。

| 協定 | 規格 | 走哪裡 | 在網路上的樣子 |
|---|---|---|---|
| **DoH**（DNS over HTTPS） | `RFC 8484` | HTTPS，通常第 443 埠 | 跟一般網頁流量共用連接埠，按埠號全面封鎖擋不掉 |
| **DoT**（DNS over TLS） | `RFC 7858` | 第 853 埠上的 TLS | 專用埠，一眼可辨識，管理者容易允許或封鎖 |
| **DoQ**（DNS over QUIC） | `RFC 9250` | QUIC，第 853 埠 | 與 QUIC 流量共用，可按埠號辨識 |

DoQ 是 2022 年才定稿的規格，支援的作業系統與 resolver 還不普及。

DoH 常被說成抗封鎖能力最好，這句話要限縮。它擋住的只有按埠號全面封鎖這一種手法，DoH 連線自己的 TLS 握手裡帶著 resolver 的網域名稱，按 SNI 或按 IP 封鎖特定 resolver 一樣做得到。在會針對加密 DNS 進行封鎖的網路裡，不要假設 DoH 一定連得上。

還有一種 ODoH（Oblivious DoH，`RFC 9230`）針對的正是下一節的問題，它用一個代理把兩件事拆開，讓「知道你是誰」跟「知道你問了什麼」落在不同的伺服器上，規格的說法是不讓任何單一伺服器同時掌握客戶端 IP 位址與查詢內容[^odoh]。目前部署的業者少，可以當成一個發展方向留意。

## resolver 是你新的觀察者

加密之後，你的每一筆查詢完整交給一家業者，它知道是誰在問、問了什麼、什麼時候問。

### 司法管轄在哪

業者能被誰用法律手段要求交出資料或配合封鎖，取決於它在哪裡註冊、伺服器放在哪。Quad9 是有真實案例可看的一家，這幾年在歐洲面對過兩次要求它封鎖網域的訴訟，德國 Sony Music 那件打到 2023 年 12 月有了對它有利的結果，2024 年 12 月又被法國的 Canal+ 提告[^quad9-press]。註冊在瑞士並不等於免疫於其他國家的法院命令。

### 記錄什麼、留多久

承諾的細節比「我們不記錄」這句話重要，Cloudflare 對 `1.1.1.1` 的承諾包含不販售或分享使用者個人資料、不用於投放廣告，使用者的 IP 位址不會寫進長期儲存（non-volatile storage），相關紀錄在 25 小時內刪除[^cf-privacy]。

### 有沒有獨立稽核

自己說跟第三方查過是兩件事，Cloudflare 表示已委託四大會計師事務所之一稽核並公開報告[^cf-privacy]。這類報告查核的是某個時點宣稱的做法，不是持續保證。

### 過不過濾

見下一節。

### 過濾型 resolver 的兩面

過濾型 resolver 對被擋的網域回傳一個不通的位址，Cloudflare 會回 `0.0.0.0`[^cf-ip]。這確實擋得住一部分惡意網域，對家庭與小型組織是低成本的防護。它跟 DNS 層審查是同一個技術動作，差別只在由誰決定，姊妹頁 [常被誤認為匿名的網路](../advanced/mistaken-for-anonymity.md) 對這一層有完整討論。

完整的封鎖清單與分類方法通常不公開，你不會事先知道哪些網域被歸進去，遇到誤擋時只能從「這個網站怎麼連不上」開始查。另一個代價落在量測上，執行 OONI Probe 時被過濾掉的網域會被記成異常，來源是你自己的 resolver，跟當地網路無關。

家裡有需要保護的成員時，過濾型 resolver 是合理選擇，同一台裝置若還要拿來判斷網路有沒有被封鎖，量測前需先關閉。

### 逐一對過官方文件的四家

只收四家，因為這四家的位址、加密端點與政策逐一對過它們自己的文件。查證日 `2026-07`。

| 服務 | 司法管轄 | 記錄政策 | 獨立稽核 | 不過濾的位址與端點 | 過濾選項 |
|---|---|---|---|---|---|
| **Cloudflare** | 美國 | 不寫進長期儲存，25 小時內刪除[^cf-privacy] | 有，四大之一[^cf-privacy] | `1.1.1.1`、`1.0.0.1`、`2606:4700:4700::1111` | `1.1.1.2` 擋惡意軟體、`1.1.1.3` 再加擋成人內容。加密端點 `security.cloudflare-dns.com`、`family.cloudflare-dns.com`[^cf-families] |
| **Quad9** | 瑞士，基金會設於蘇黎世。曾在德國、法國被訴要求封鎖網域[^quad9-press] | 官方文件未於本次查證的頁面載明 | 未於本次查證的頁面載明 | `9.9.9.10`、`149.112.112.10`、`dns10.quad9.net`、`https://dns10.quad9.net/dns-query` | `9.9.9.9`（預設位址）擋惡意軟體並驗證 DNSSEC、`9.9.9.11` 再加 ECS[^quad9] |
| **Mullvad** | 瑞典。不需帳號即可使用 | 官方文件未於本次查證的頁面載明 | 未於本次查證的頁面載明 | `194.242.2.2`、`2a07:e340::2`、`dns.mullvad.net`、`https://dns.mullvad.net/dns-query` | `194.242.2.3` 擋廣告，另有四種層級，`194.242.2.9` 把全部清單都打開[^mullvad] |
| **Quad101** | 臺灣，由 TWNIC 營運 | 暫時性紀錄最長保留 30 天，內容含來源與目的 IP、查詢網域與時間[^quad101-privacy] | 未於本次查證的頁面載明 | 沒有不過濾的選項。`101.101.101.101`、`101.102.103.104`、`2001:de4::101`、`2001:de4::102`，官網說明支援 DoH 與 DoT 但未公布端點[^quad101] | 預設過濾釣魚、惡意軟體、殭屍網路 C&C，以及「違反適用法令之內容網域」[^quad101-terms] |

這張表有兩個容易誤解的地方。第一，Quad9 對外主打的 `9.9.9.9` 是**有過濾**的那一組，不想要過濾需改用 `9.9.9.10`，預設值跟 Cloudflare 剛好相反。第二，Quad9 的 `9.9.9.11` 多出來的 ECS（EDNS Client Subnet）會把你 IP 位址的一段前綴附在查詢裡送給權威伺服器，用途是讓 CDN 選近一點的節點，代價是原本只有 resolver 知道的來源資訊，上游也拿得到一部分，以隱私而言那是減項。

Quad101 是表中唯一的臺灣在地選項，細節見下面的在地脈絡。其他營運者還有 AdGuard、NextDNS、dns0.eu、Control D 等，位址與端點請直接從各家官方文件取得，這類資訊變動時網路上的轉貼往往沒跟著更新。Google 的 `8.8.8.8` 在台灣使用率很高，它同樣提供 DoH 與 DoT[^google-dot]，沒有列進上表是因為這次沒有逐一核對它的政策，不是因為判定它不合格。

## 自架不等於沒有代價

自行架設一台遞迴 resolver（自己一路向根伺服器、頂級網域伺服器、權威伺服器問到底的那種，例如 Unbound、Knot Resolver），確實沒有任何業者收下你的查詢。這個選項有兩個代價，第二個常被忽略而且更嚴重。

你的查詢直接以自己的 IP 送到各家權威伺服器，你成為網路上唯一發出這批查詢的來源。用公共 resolver 時你的查詢混在幾百萬人裡面，自架把這層混雜拿掉了。

更關鍵的是，**遞迴解析對外送出的查詢絕大多數仍然走明文第 53 埠**。權威伺服器普遍不支援加密傳輸，所以自架之後，你的電信商重新看得到你要查的每一個網域，只是對象從一台 resolver 換成眾多權威伺服器。如果你的威脅模型裡最在意的是電信商，自架遞迴 resolver 的暴露反而比用一家可信業者的 DoH 更差。

要判斷哪一種合適，先看 [威脅模型如何建立](../basics/threat-model.md)。想要不信任單一業者又不讓電信商看到，該找的方向是上面提過的 ODoH 這類設計，不是自架遞迴解析。

（dnscrypt-proxy 常跟 Unbound 一起被提到，但它是本機的轉送代理，把查詢加密後交給上游的公共 resolver，仍然有業者收下你的查詢，跟這一節談的自架是兩回事。）

## 加密 DNS 遮不到什麼

加密 DNS 遮住的只有網域查詢那一段。你接著建立 TLS 連線時，握手中的 SNI（Server Name Indication，在 TLS 握手裡以明文帶出目標網域的欄位）仍然帶著網域名稱，路徑上的人從那裡一樣讀得到。就算 SNI 被解決，你連上的目的 IP 位址仍然在封包裡。

Encrypted Client Hello（ECH）是為 SNI 這一段設計的。站上對它的評估寫在 [Metadata 是什麼，為什麼重要](../basics/metadata.md)，它需要伺服器端支援，也可能被中間設備阻擋，還不能假設每條連線的 SNI 都被保護。反過來說，ECH 要生效需要先取得伺服器公布的設定，而那份設定是透過 DNS 取得的，所以加密 DNS 是 ECH 的前提之一，兩者是搭配關係。

Tor Browser 不使用系統的 DNS 設定。Tor 的 SOCKS 介面直接收主機名稱，由 Tor 網路內部完成解析，規格給的理由是客戶端自己查 DNS 的話，DNS 伺服器就會知道它想連到哪些位址[^tor-socks]。為了 Tor 調整系統 DNS 沒有效果，Tor Browser 的流量本來就不經過那份設定，同一台裝置上其他 App 才受影響。這句話只對 Tor Browser 成立，Orbot 的 VPN 模式、Tails、Whonix 的解析路徑各不相同，要照各自的文件確認。

## 各平台填什麼、失敗時會如何

欄位收什麼形狀，決定你設出來的是加密還是明文。失敗時會不會退回，決定你能不能相信那個「已開啟」的顯示。

| 平台 | 加密 DNS 填什麼 | 失敗時 |
|---|---|---|
| **Android 私人 DNS**（指定主機名稱） | 主機名稱，走 DoT，Android 9 起支援[^android][^google-dot] | 連不到就把網路標記為無法上網，不退回明文[^android-dot] |
| **Android 私人 DNS**（自動） | 不必填 | 網路的 resolver 支援時才升級為加密，不支援則維持明文[^android-dot] |
| **iOS** | 內建 Wi-Fi 設定的 DNS 欄位只收 IP，也套用不到行動網路。要加密得裝業者的 App 或設定描述檔[^cf-ios] | 依所裝的 App 而定 |
| **macOS** | 網路設定的 DNS 欄位同樣填 IP，加密要另外處理[^cf-macos] | 依做法而定 |
| **Windows** | 填 IP，但那個 IP 必須在系統內建的已知 DoH 伺服器清單裡，加密與否另有下拉選單[^ms-doh] | 選「加密優先，允許未加密」時會退回明文，微軟文件明白寫著不會給你任何通知[^ms-doh] |
| **Firefox** | 選 resolver 並設定解析模式 | 模式 `2` 解析失敗時退回系統原生的解析器，模式 `3` 只用加密不退回[^mozilla-trr] |
| **Chrome** | 選現有供應商或自訂供應商 | 自動模式遇到問題會改用未加密，選了自訂供應商就不會退回[^chrome-dns] |

**Windows 是「填 IP 就不是加密」這條通則的例外**，它靠內建對照表把 IP 換成加密端點。**iOS 沒有內建的加密 DNS 欄位**，只在 Wi-Fi 設定裡填 `1.1.1.1` 得到的是純明文，而且行動網路完全沒被涵蓋。**多數平台的預設模式會靜默退回明文**，Windows、Firefox 模式 `2`、Chrome 自動模式都是，Android 指定主機名稱的嚴格模式反而是少數失敗就直接斷掉的做法。

Firefox 另外有一個機制，網路可以透過一個特定的查詢回應讓它自行停用加密 DNS，官方的診斷代碼裡稱為 canary heuristic[^firefox-trr-skip]。企業網路用得到它，代價是你的瀏覽器可能在你不知情的狀況下退回明文。

## 怎麼確認你設對了

### 看你填進去的是什麼形狀

對照上一張表，你填的欄位收的是主機名稱、網址、還是 IP，決定了它是不是加密。Windows 是例外，看的是加密下拉選單的狀態。

### 看你改的是哪一層

系統設定與瀏覽器設定各自獨立，瀏覽器開了 DoH，其他 App 的查詢仍然走系統設定。家用路由器與 DHCP 是第三層，在路由器上填 `9.9.9.9` 得到的是零加密，因為多數消費級路由器不會替你做 DoT 或 DoH，而且內網到路由器那一段本來就是明文。要涵蓋整個家或整間辦公室，得確認那台設備自己支援加密上游。

### 實測一次

前兩項查的是你填了什麼，查不出靜默退回、瀏覽器另有一份正在運作、或某個 App 硬寫死了 resolver。三家都有檢測頁：Cloudflare 的 [1.1.1.1/help](https://1.1.1.1/help){target="_blank"}、Quad9 的 [on.quad9.net](https://on.quad9.net/){target="_blank"}、Mullvad 的 [連線檢查](https://mullvad.net/en/check){target="_blank"}。要看的是它回報的 resolver 跟加密狀態，是否等於你設的那一家。在你平常用的瀏覽器與其他 App 環境下各測一次，兩邊結果可能不同。

## 什麼時候會失效

### 企業或校園網路

內部網域要靠內部 DNS 才解析得到，加密 DNS 把查詢送到外面，內部資源就找不到。多數作業系統允許針對特定網路關閉加密 DNS，或設定讓特定網域走內部解析，組織規模的正解是條件轉送或分割解析，不是叫所有人自己關掉。

### 登入頁攔截（captive portal）

旅館、機場的 Wi-Fi 要先開啟一個頁面登入，登入前網路多半擋掉往外的連線，加密 DNS 因此解析不出來，登入頁也就無法出現。現在多數作業系統會自己偵測並處理，真的需要手動關掉時要記得兩件事：關掉期間你的查詢對這個網路完全可讀，不要在那段時間做敏感操作。登入完立刻確認已經開回來，這一步很容易忘記。

### 加密 DNS 本身被封鎖

DoT 的第 853 埠很容易被擋掉。DoH 混在 HTTPS 裡比較難用埠號擋，網路管理者仍可以直接封鎖特定 resolver 的 IP 與網域。

## 台灣的在地脈絡

台灣讀者換掉 DNS 的常見動機是解析比較快，或者某些網域在電信商的 resolver 上連不到。第二個動機要看封鎖發生在哪一層，DNS 層的封鎖換 resolver 有用，IP 或 SNI 層的封鎖換誰回答你都連不上。

換掉之前值得知道你會一併失去什麼，中華電信的色情守門員、數位發展部與 TWNIC 的打詐網域封鎖，都是在 DNS 這一層運作的，站上 [什麼是 OONI](./what-is-ooni.md) 對相關機制與它們在觀測資料裡的樣子有完整說明。換到境外 resolver 之後，上述封鎖會一起失效，換來的是查詢不被電信商看到，失去的是那些封鎖原本擋下的釣魚與詐騙網域。家裡有長輩或小孩的話，這個取捨要自己衡量，過濾型 resolver 是一個折衷。

想留在臺灣境內的話，TWNIC 營運的 Quad101 是目前唯一的公共選項，位址 `101.101.101.101` 與 `101.102.103.104`，啟用 DNSSEC 驗證[^quad101]。用這頁的四項準則看它，有三件事應先了解。

它沒有不過濾的版本，官網列出的過濾範圍除了釣魚、惡意軟體、殭屍網路 C&C 三類，還有一類是「違反適用法令之內容網域」[^quad101-terms]，最後這一類比前三類寬得多，而且跟其他家一樣沒有公布清單，你無法事先知道涵蓋哪些網域。要拿它來判斷網路有沒有被干擾，或者要執行 OONI Probe，這個性質會直接影響結果。

紀錄保留期間也長於境外那三家，官方說明是僅保留最低限度的查詢資料，暫時性紀錄最長 30 天，內容包含來源與目的 IP、連接埠、查詢類型、網域名稱、時間戳與回應資料，長期保留的則是排除個人資訊的抽樣[^quad101-privacy]。對照 Cloudflare 對 `1.1.1.1` 承諾的 25 小時內刪除，差距在這裡。

加密端點則沒有公布，官網說明支援 DoH 與 DoT，卻沒有給出主機名稱或網址[^quad101-terms]。照前面說過的邏輯，只填 `101.101.101.101` 這個 IP 得到的是明文查詢，要用加密就需先向 TWNIC 取得端點。

選 Quad101 等於把資料留在臺灣、交給本地機構保管，代價是接受一組包含法令遵循在內的過濾，以及長於境外那三家的紀錄保留期間。這個取捨沒有標準答案，但它跟表上另外三家不是同一種產品，選之前先知道差在哪裡。

執行 OONI Probe 的人要特別留意。依 `ts-017` 規格，網路連線測試（Web Connectivity）先用系統 resolver 解析網域，再跟測試輔助伺服器解出來的結果比對，位址或 ASN 對得上才算一致[^ooni-wc]。

裝置上任何第三方 resolver 都會影響結果，而且方向不同。過濾型 resolver 讓被擋的網域解到 `0.0.0.0`，量測看起來像當地網路遭到干擾，那是假陽性，至少會有人去查。不過濾的境外加密 resolver 更麻煩，它會直接繞過電信商層真正的封鎖，量測顯示一切正常，沒有人會發現漏掉了什麼。社群長期在整理 [台灣 ASN 涵蓋率](../taiwan/ooni-asn-coverage.md)，量測的目標就是台灣本地網路的 DNS 行為，所以量測時請使用該網路 DHCP 發下來的 resolver，關掉所有第三方加密 DNS，不分過不過濾。

三個容易漏掉的地方：手機的 Android 私人 DNS 是全系統設定，跨 Wi-Fi 與行動網路都生效。家裡的 Pi-hole 或 AdGuard Home 會讓裝置上明明沒設定卻已經被過濾。筆電整理乾淨了不代表手機也是。

## 帶走的檢查清單

設定完成後依這三題確認一遍，三題都答得出來才算設好。

1. 我填的欄位收的是主機名稱或網址嗎（Windows 例外，看加密下拉選單）
2. 系統、瀏覽器、路由器這三層我都確認過了嗎
3. 檢測頁回報的 resolver 與加密狀態，跟我設的那一家對得上嗎

執行 OONI Probe 之前，把上面三題反過來做一次，關掉所有第三方 resolver，手機與筆電各一份，並確認家裡的路由器沒有另外掛過濾。

## 常見問題

??? question "用電信商的 DNS 是不是最糟的選項"

    不一定。電信商本來就看得到你連上的每一個目的 IP，換掉 DNS 並不會讓它看不到你去了哪裡，只是少看到網域名稱這一份。換到境外 resolver 等於多一個原本看不到你的對象開始看得到，先想清楚你比較不希望被誰掌握。

??? question "加密 DNS 與 VPN 同時啟用會如何"

    通常由 VPN 決定。多數 VPN 客戶端會接管整台裝置的 DNS，把查詢送進隧道交給它自己的 resolver，你另外設的加密 DNS 可能完全不生效。這本身不算壞事，因為查詢已經在隧道裡，但你信任的對象變成 VPN 業者。要確認實際狀況，用上面那幾個檢測頁在 VPN 開啟時測一次，看它回報的是誰。VPN 的取捨見 [VPN 的風險與選擇](./vpn-guide.md)。

??? question "設了會不會變慢"

    加密會多一次握手，第一次查詢通常慢一點，之後連線重用則相近。實際感受更取決於那家 resolver 在你這條線路上的距離，境外業者不一定比電信商快。想追求速度的話自己實測比看評測可靠，同一條線路不同時段的差異就不小。

??? question "組織要統一換，該怎麼部署"

    先決定改在哪一層，改在每台裝置上最可靠但要逐台管，用行動裝置管理（MDM）推設定描述檔可以解掉這個問題。改在路由器最為簡便，前提是那台設備自己支援加密上游，否則對外那段仍是明文。另外要處理內部網域的解析，正解是條件轉送或分割解析，讓內部網域走內部 DNS、其餘走加密上游。備援也要想清楚，填第二家等於把查詢分給兩家業者，隱私承諾直接打折。

??? question "免費的 resolver 為什麼免費"

    各家的位置不同，Cloudflare 是基礎設施業者，順帶取得網路效能的量測資料。Quad9 是瑞士的非營利基金會，靠捐款與贊助營運。Mullvad 是付費 VPN 業者，把 resolver 當成附帶服務公開提供。直接看它的記錄政策與資金來源，不要以收不收費作為判斷依據。

??? question "DNSSEC 跟加密 DNS 是同一件事嗎"

    兩件事。加密 DNS 讓傳輸過程不被讀取，DNSSEC 用簽章證明回應沒有被竄改。要注意兩個前提：驗證通常發生在 resolver 那一端，你的裝置取得的只是一個「已驗證」的標記，沒有加密傳輸的話那個標記本身也可能被路徑上的人偽造。DNSSEC 只保護有簽章的網域，很多常見網域並沒有簽，對那些網域它不提供任何保護。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-incognito-off: 常被誤認為匿名的網路](../advanced/mistaken-for-anonymity.md)
- [:material-file-tree: Metadata 是什麼，為什麼重要](../basics/metadata.md)
- [:material-vpn: VPN 的風險與選擇](./vpn-guide.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-access-point-network: 什麼是 OONI](./what-is-ooni.md)
- [:material-chart-bar: 台灣 ASN 涵蓋率](../taiwan/ooni-asn-coverage.md)
- [:material-shield-account-outline: 個人隱私指引](../community/privacy-guide.md)

</div>

[^cf-ip]: [1.1.1.1 IP addresses](https://developers.cloudflare.com/1.1.1.1/ip-addresses/){target="_blank"} 與 [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 開發者文件，`0.0.0.0` 的說明在後者。
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare 開發者文件，for Families 的 DoH 與 DoT 端點在此頁。
[^cf-privacy]: [1.1.1.1 Public DNS Resolver privacy](https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/){target="_blank"} - Cloudflare 開發者文件。
[^cf-ios]: [Set up 1.1.1.1 on iOS](https://developers.cloudflare.com/1.1.1.1/setup/ios/){target="_blank"} - Cloudflare 開發者文件，手動設定只提供 IP 位址，加密需另裝 App。
[^cf-macos]: [Set up 1.1.1.1 on macOS](https://developers.cloudflare.com/1.1.1.1/setup/macos/){target="_blank"} - Cloudflare 開發者文件。
[^quad9]: [Service Addresses and Features](https://quad9.net/service/service-addresses-and-features/){target="_blank"} - Quad9 官方站。
[^quad9-press]: [Quad9 Press](https://quad9.net/news/press/){target="_blank"} - Quad9 官方新聞稿，其中提到德國 Sony Music 案於 2023 年 12 月取得有利結果，以及 2024 年 12 月來自法國 Canal+ 的新訴訟。
[^mullvad]: [Mullvad DNS over HTTPS and DNS over TLS](https://mullvad.net/en/help/dns-over-https-and-dns-over-tls){target="_blank"} - Mullvad 官方說明。
[^android]: [Change your Android device's Private DNS settings](https://support.google.com/android/answer/9089903){target="_blank"} - Google 支援文件。
[^android-dot]: [DNS over TLS support in Android P](https://android-developers.googleblog.com/2018/04/dns-over-tls-support-in-android-p.html){target="_blank"} - Android Developers Blog，自動升級與指定主機名稱兩種模式的差別在此頁。
[^google-dot]: [DNS-over-TLS](https://developers.google.com/speed/public-dns/docs/dns-over-tls){target="_blank"} - Google Public DNS 文件，Android 9 起支援 DoT 的說明在此頁。
[^ms-doh]: [Secure DNS Client over HTTPS (DoH)](https://learn.microsoft.com/en-us/windows-server/networking/dns/doh-client-support){target="_blank"} - Microsoft Learn，已知 DoH 伺服器清單與三種加密設定的說明在此頁。
[^mozilla-trr]: [Trusted Recursive Resolver](https://wiki.mozilla.org/Trusted_Recursive_Resolver){target="_blank"} - Mozilla Wiki，解析模式的定義在此頁。
[^firefox-trr-skip]: [TRR Skip Reasons](https://firefox-source-docs.mozilla.org/networking/dns/trr-skip-reasons.html){target="_blank"} - Firefox 原始碼文件，canary heuristic 的診斷代碼在此頁。
[^chrome-dns]: [Use secure DNS in Chrome](https://support.google.com/chrome/answer/10468685){target="_blank"} - Google Chrome 說明，自動模式與自訂供應商的退回行為差別在此頁。
[^tor-socks]: [SOCKS extensions](https://spec.torproject.org/socks-extensions.html){target="_blank"} - Tor 規格文件。
[^odoh]: [RFC 9230: Oblivious DNS over HTTPS](https://www.rfc-editor.org/rfc/rfc9230.html){target="_blank"} - IETF。
[^quad101]: [Quad101](https://101.101.101.101/){target="_blank"} - TWNIC 營運的公共 DNS 服務。
[^quad101-terms]: [Quad101 服務條款](https://101.101.101.101/ann1.html){target="_blank"} - TWNIC，過濾範圍四類的列舉在此頁。
[^quad101-privacy]: [Quad101 隱私權政策](https://101.101.101.101/ann2.html){target="_blank"} - TWNIC，紀錄保留期間與 DNSSEC 驗證的說明在此頁。
[^ooni-wc]: [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} - OONI 測試規格。
