---
title: 加密 DNS 怎麼選與怎麼設
description: DoH、DoT、DoQ 的差別，resolver 業者的挑選準則，以及怎麼確認你設的真的是加密 DNS 而不是換了一台伺服器。
icon: material/dns
---

# :material-dns: 加密 DNS 怎麼選與怎麼設

在手機的 Wi-Fi 設定裡把 DNS 那一欄填成 `1.1.1.1`，是很多人做過的第一個隱私設定。這個動作換掉了回答你的那台伺服器，查詢本身仍然以明文送出去，路徑上的設備照樣讀得到你問過哪些網域。要讓查詢加密，填進去的必須是主機名稱或網址，而且系統與瀏覽器往往各有一份設定。

這頁處理三個問題：DoH、DoT、DoQ 各自是什麼、resolver 業者該怎麼挑、怎麼確認你設的真的生效了。加密 DNS 改變了什麼、沒改變什麼，寫在 [常被誤認為匿名的網路](../advanced/mistaken-for-anonymity.md)，這裡不重複那一層的論證。

!!! tip "沒空全部讀完，先抓這幾點"

    - 填 IP 位址不是加密 DNS。加密要填的是主機名稱（如 `dns.quad9.net`）或網址（如 `https://dns.quad9.net/dns-query`）
    - 加密之後，看得到你查詢的人從電信商換成 resolver 業者，人數變少，沒有歸零
    - 挑 resolver 就是挑一個你願意信任的紀錄保管者，看司法管轄、記錄政策、有沒有獨立稽核
    - 系統層與瀏覽器層是兩份設定，只改一邊，另一邊照舊
    - Tor Browser 不受系統 DNS 設定影響，它的網域解析走 Tor 電路

## 沒有加密時，路徑上的人看得到什麼

DNS 查詢預設走第 53 埠的明文，你的裝置每問一次「這個網域的 IP 是多少」，從家用路由器、電信商到中間任何一段線路上的設備，都讀得到完整的網域名稱。這份清單本身就足以還原你在什麼時間造訪過哪些站，內容有沒有加密無關。網域查詢屬於哪一類暴露，寫在 [Metadata 是什麼，為什麼重要](../basics/metadata.md)。

明文查詢還有一個常被忽略的性質，任何在路徑上的人都能竄改回應。DNS 層的封鎖就是用這個做的，對特定網域回一個錯的位址，連線就失敗。

## DoH、DoT、DoQ 的差別

三種都是把查詢加密，差別在包在什麼協定裡，這會直接影響它在受限網路裡能不能活下來。

| 協定 | 規格 | 走哪裡 | 在網路上的樣子 |
|---|---|---|---|
| **DoH**（DNS over HTTPS） | `RFC 8484` | HTTPS，通常第 443 埠 | 跟一般網頁流量混在一起，難以單獨挑出來擋掉 |
| **DoT**（DNS over TLS） | `RFC 7858` | 專用的第 853 埠上的 TLS | 一眼可辨識，網路管理者容易允許或封鎖 |
| **DoQ**（DNS over QUIC） | `RFC 9250`，2022 年發布 | QUIC | 較新，支援的作業系統與 resolver 還不普及 |

要在會封鎖加密 DNS 的網路裡用，DoH 的存活率比較高，因為擋它等於要從一般 HTTPS 流量裡把它分辨出來。反過來說，企業或校園網路要管理內部解析時，DoT 那個獨立連接埠讓雙方都比較清楚現在的狀態。

## resolver 是你新的觀察者

加密之後，你的每一筆查詢完整交給一家業者，它知道是誰在問、問了什麼、什麼時候問。挑選時值得問四件事。

**司法管轄在哪。** 業者能被誰用法律手段要求交出資料，取決於它在哪裡註冊、伺服器放在哪。

**記錄什麼、留多久。** 承諾的細節比「我們不記錄」這句話重要。Cloudflare 對 `1.1.1.1` 的說明是不販售或分享使用者個人資料、不用於投放廣告，使用者的 IP 位址不會存進非揮發性儲存，相關紀錄在 25 小時內刪除[^cf-privacy]。

**有沒有獨立稽核。** 自己說跟第三方查過是兩件事。Cloudflare 表示已委託四大會計師事務所之一稽核並公開報告[^cf-privacy]。

**過不過濾，清單公不公開。** 過濾型 resolver 用回傳假答案的方式擋掉特定網域，跟審查是同一個技術動作，取捨見下一節。

### 三家常被提到的服務

| 服務 | 司法管轄 | 不過濾的位址 | 過濾選項 |
|---|---|---|---|
| **Cloudflare** | 美國 | `1.1.1.1`、`1.0.0.1`（IPv6 `2606:4700:4700::1111`） | `1.1.1.2` 擋惡意軟體、`1.1.1.3` 再加擋成人內容[^cf-ip] |
| **Quad9** | 瑞士（基金會設於蘇黎世） | `9.9.9.10`、`149.112.112.10` | `9.9.9.9` 擋惡意軟體並驗證 DNSSEC、`9.9.9.11` 同上再加 ECS[^quad9] |
| **Mullvad** | 瑞典 | `194.242.2.2`（IPv6 `2a07:e340::2`） | `194.242.2.3` 擋廣告，另有四種層級到 `194.242.2.9` 全開[^mullvad] |

Quad9 的預設位址 `9.9.9.9` 是有過濾的那一組，不想要過濾要改用 `9.9.9.10`，這一點跟 Cloudflare 相反。Mullvad 這項服務不需要有帳號也能用[^mullvad]。

其他營運者還有 AdGuard、NextDNS、dns0.eu、Control D 等等，位址與端點請直接從各家官方文件取得，這類資訊變動時網路上的轉貼往往沒跟著更新。

### 自架有一個反直覺的代價

自己跑一台遞迴 resolver（例如 Unbound 或 dnscrypt-proxy），確實沒有任何業者收下你的查詢。代價是你的查詢直接以你自己的 IP 送到各個權威伺服器，你成為網路上唯一發出這批查詢的那個人。用公共 resolver 時你的查詢混在幾百萬人裡面，自架把這層混雜拿掉了。哪一種比較合適，取決於你在防誰，走一次 [威脅模型如何建立](../basics/threat-model.md) 比較快。

## 過濾型 resolver 的兩面

過濾型 resolver 對被擋的網域回傳一個不通的位址，Cloudflare 的做法是回 `0.0.0.0`[^cf-ip]。這確實擋得住一部分惡意網域，對家庭與小型組織是低成本的防護。

完整的封鎖清單與分類方法通常不公開，你不會事先知道哪些網域被歸進去，遇到誤擋時只能從「這個網站怎麼連不上」開始查。另一個代價落在量測上，跑 OONI Probe 時過濾型 resolver 會讓量測結果出現不是當地網路造成的異常，做法見下面的在地脈絡。

家裡有需要保護的成員時，過濾型 resolver 是合理選擇。要用來判斷網路環境是否遭到干擾時，它會妨礙判斷。

## 怎麼確認你設的是加密 DNS

**看你填進去的是什麼。** IP 位址（`1.1.1.1`、`9.9.9.9`）是明文查詢。加密要填主機名稱或網址，形狀像 `dns.quad9.net`、`dns.mullvad.net`、`security.cloudflare-dns.com`，或 `https://dns.quad9.net/dns-query` 這樣的網址[^quad9][^mullvad][^cf-families]。填的是點分十進位的數字，那就不是加密 DNS。

**看你改的是哪一層。** 系統設定與瀏覽器設定是兩份獨立的東西。瀏覽器開了 DoH，其他 App 的查詢仍然走系統設定。系統設好了，瀏覽器若自己另外指定了一家 resolver，瀏覽器的流量會照它自己那份走。兩層都要看過。

Android 的私人 DNS 是系統層的設定，選項有關閉、自動、以及填入主機名稱三種，填的是主機名稱不是 IP，Android 9 以後支援[^android][^google-dot]。Google 對這個功能的說明寫得很直白：「Private DNS helps secure only DNS questions and answers. It can't protect anything else.」

**確認失敗時會怎麼樣。** 這是最容易被略過的一項。Firefox 的解析模式裡，模式 2 是「先用 TRR，只有在名稱解析失敗時才退回原生解析器」，模式 3 才是「只用 TRR，永不使用原生解析器」[^mozilla-trr]。前者代表加密查詢一失敗就靜默改走明文，你不會收到任何提示。要確保不退回，得選只用加密的那個模式，代價是解析失敗時網站直接打不開。

## 什麼時候會失效

**企業或校園網路。** 內部網域要靠內部 DNS 才解析得到，加密 DNS 把查詢送到外面，內部資源就找不到。這類網路通常也會封鎖外部的加密 DNS。

**登入頁攔截（captive portal）。** 旅館、機場的 Wi-Fi 要先開一個頁面登入，那個頁面靠攔截你的 DNS 回應運作。加密 DNS 開著時常常連登入頁都跳不出來，得先關掉、登入、再開回來。

**加密 DNS 被整段封鎖。** DoT 的第 853 埠很容易被擋掉。DoH 混在 HTTPS 裡比較難擋，但擋得掉特定 resolver 的 IP 與網域。

**靜默退回明文。** 見上一節的解析模式。失效時如果沒有提示，你會以為還在加密狀態。

## 跟 ECH 與 Tor 的關係

加密 DNS 遮住的只有網域查詢那一段，你接著建立 TLS 連線時，握手中的 SNI 欄位仍然帶著目標網域名稱，掌握這條線路的人從那裡一樣讀得到。Encrypted Client Hello（ECH）就是為這一段設計的，站上對它的評估寫在 [Metadata 是什麼，為什麼重要](../basics/metadata.md)，重點是它需要伺服器端支援，也可能被中間設備阻擋，還不能假設每條連線的 SNI 都被保護。就算 ECH 生效，你連上的目的 IP 位址仍然在封包裡。

Tor Browser 是另一回事，它不使用系統的 DNS 設定。Tor 的 SOCKS 介面直接收主機名稱，由 Tor 網路內部完成解析，官方規格對這個設計的理由寫得很清楚：「if clients do their own DNS lookup, the DNS server can learn which addresses the client wants to reach」[^tor-socks]。所以為了 Tor 而去調整系統 DNS 沒有效果，Tor Browser 的流量本來就不經過它。這也表示同一台裝置上，Tor Browser 與其他 App 走的是兩條完全不同的解析路徑。

## 在地脈絡：台灣

台灣讀者換掉 DNS 的常見動機是解析比較快，或者某些網域在電信商的 resolver 上連不到。第二個動機要看阻擋發生在哪一層，DNS 層的阻擋換 resolver 有用，IP 或 SNI 層的阻擋換誰回答你都連不上。

跑 OONI Probe 的人要特別留意。網路連線測試（Web Connectivity）先用系統 resolver 解析網域，再跟測試輔助伺服器解出來的結果比對，位址或 ASN 對得上才算一致[^ooni-wc]。裝置上開著過濾型 resolver 時，被擋的網域會解到 `0.0.0.0`，跟輔助伺服器對不上，資料看起來像當地網路遭到干擾。社群長期在整理 [台灣 ASN 涵蓋率](../taiwan/ooni-asn-coverage.md)，量測的目標正是這個網路本身的 DNS 行為，所以這裡不建議統一改用境外 resolver，那會把真正的電信商層阻擋一起蓋掉。要做的是移除自己額外加上的過濾型 resolver，讓裝置回到該網路原本的設定。

## 常見問題

??? question "我到底該不該換 DNS"

    看你想解決什麼。想讓電信商看不到你查詢過哪些網域，換到加密 DNS 有效，代價是換一家業者保管這批紀錄。想繞過封鎖，得先確認封鎖在哪一層。想匿名，這件事加密 DNS 做不到，見 [常被誤認為匿名的網路](../advanced/mistaken-for-anonymity.md)。

??? question "用電信商的 DNS 是不是最糟的選項"

    不一定。電信商本來就看得到你連上的每一個目的 IP，換掉 DNS 並不會讓它看不到你去了哪裡，只是少看到網域名稱這一份。相對地，換到境外 resolver 等於多一個原本看不到你的對象開始看得到。哪一邊比較好，取決於你比較不希望被誰掌握。

??? question "免費的 resolver 為什麼免費"

    各家理由不同，有的是基礎設施業者順帶提供並藉此改善自家網路的量測，有的由非營利組織或基金會營運並接受捐款。這一題沒有通則，該做的是去看它的記錄政策與資金來源，而不是預設免費就有問題或免費就沒問題。

??? question "設了加密 DNS，公司的內部網站連不上"

    這是預期行為。內部網域只有公司的 DNS 解析得到，查詢送到外面自然找不到。多數作業系統允許針對特定網路關閉加密 DNS，或設定讓特定網域走內部解析。在公司網路上先關掉是最單純的做法。

??? question "DNSSEC 跟加密 DNS 是同一件事嗎"

    兩件事。加密 DNS 處理的是傳輸過程有沒有被讀取，DNSSEC 處理的是回應有沒有被竄改，用簽章讓你驗證這筆回應確實來自該網域的權威伺服器。兩者互補，Quad9 的 `9.9.9.9` 就同時做了加密傳輸與 DNSSEC 驗證[^quad9]。

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
[^quad9]: [Service Addresses and Features](https://quad9.net/service/service-addresses-and-features/){target="_blank"} - Quad9 官方站。
[^mullvad]: [Mullvad DNS over HTTPS and DNS over TLS](https://mullvad.net/en/help/dns-over-https-and-dns-over-tls){target="_blank"} - Mullvad 官方說明。
[^android]: [Change your Android device's Private DNS settings](https://support.google.com/android/answer/9089903){target="_blank"} - Google 支援文件。
[^google-dot]: [DNS-over-TLS](https://developers.google.com/speed/public-dns/docs/dns-over-tls){target="_blank"} - Google Public DNS 文件，Android 9 起支援 DoT 的說明在此頁。
[^mozilla-trr]: [Trusted Recursive Resolver](https://wiki.mozilla.org/Trusted_Recursive_Resolver){target="_blank"} - Mozilla Wiki，解析模式的定義在此頁。
[^tor-socks]: [SOCKS extensions](https://spec.torproject.org/socks-extensions.html){target="_blank"} - Tor 規格文件。
[^ooni-wc]: [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} - OONI 測試規格。
