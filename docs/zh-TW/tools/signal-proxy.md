---
title: Signal Proxy
description: Signal 在伊朗、中國、俄羅斯這些地區被封鎖，proxy 讓當地使用者把連線繞回 Signal 伺服器。說明運作方式、使用者怎麼套用、營運者看得到什麼，以及在台灣架一台的門檻與風險。
icon: material/transit-connection-variant
---
# :material-transit-connection-variant: Signal Proxy

Signal Proxy 是一台架在沒有封鎖地區的轉接伺服器。被封鎖地區的使用者把它填進 Signal App，App 的連線先送到這台伺服器，再由它轉給 Signal 的正式伺服器。在當地網路上看起來，使用者只是連上一個普通的 HTTPS 網站。

以下分兩個部分。前半給需要用 proxy 連線的人，後半給想架一台提供出來的人。

## Signal 為什麼在有些地方連不上

Signal 的伺服器位址固定，封鎖起來相當直接。常見手法是把 Signal 的網域從 DNS 回應裡移除、把伺服器 IP 放進黑名單，或在 TLS 握手時讀 SNI 欄位認出目的地再切斷連線。App 的表現就是一直停在「連線中」，訊息送不出去。

幾個已知的封鎖時間點：

- **伊朗**：2021 年 2 月起大規模封鎖，Signal 為此在官方部落格[向社群徵求 proxy 志工](https://signal.org/blog/help-iran-reconnect/){target="_blank"}。
- **中國**：2021 年 3 月起需要 proxy 或其他繞行工具才能使用。2024 年 4 月 App Store 中國區也應主管機關要求下架 Signal。
- **俄羅斯**：2024 年 8 月起受到主管機關限制。

Proxy 處理的是連線這一段。註冊需要的簡訊驗證碼走電信網路，proxy 幫不上忙，主要場景是已經有帳號的人在封鎖環境裡重新連上服務。

## Proxy 怎麼運作

Signal 官方的做法叫做 TLS proxy，跟一般的 HTTP proxy 有明顯差別。連上一般 HTTP proxy 時，客戶端會先送出一段明文的 `CONNECT` 請求說明要連去哪裡，審查系統看到這段就知道有人在用 proxy。Signal TLS Proxy 沒有這個步驟，整段連線從第一個封包開始就是加密的 HTTPS 流量，每台 proxy 都配有效的 TLS 憑證，在線路上跟一般網站瀏覽難以區分。

伺服器端只把流量轉給 Signal 的伺服器，非 Signal 的流量會被擋掉。它不是一個通用的翻牆代理，做不到用它去連其他被封鎖的網站。

端對端加密在這個過程中完全不受影響。訊息在你的裝置上加密、在對方裝置上解密，proxy 中間看到的是一段它讀不了的 TLS 流量。

### 擋得住哪一種封鎖

TLS proxy 對付的是「Signal 的伺服器位址被封」這一類手法。審查系統靠 DNS、IP 黑名單、SNI 過濾認出目的地時，把連線導向一台還沒被列管的伺服器就繞得過去。

審查強度更高的環境要另外評估。中國的防火長城會做主動探測（active probing，主動連向可疑的伺服器測試它是不是 proxy），DPI 的辨識能力也比多數地區強，Signal Proxy 在這種環境不保證能用。當地使用者手邊需要有備援方案，可以看 [WebTunnel 橋接](../community/setup-tor-webtunnel.md)、[Tor Snowflake](./tor-snowflake.md)，以及 [VPN 的風險與選擇](./vpn-guide.md) 裡的混淆協議一節。

## 使用者怎麼套用 proxy

### 用分享連結一鍵設定

Signal 的 Android 與 iOS App 都註冊處理 `signal.tube` 這個網域的連結。營運者提供的分享連結長這樣：

```
https://signal.tube/#proxy.example.com
```

在手機上點這個連結，Signal App 會接手並自動把 `#` 後面的主機名稱填進 proxy 設定。這是最不容易出錯的方式，也不需要記選單在哪裡。

### 手動填入

取得的是主機名稱而非連結時，在 Signal 設定裡找到代理伺服器（Proxy）欄位填入。Android 在「資料與儲存空間」底下，iOS 在「隱私權」的「進階」底下。App 版本改版時選單位置可能調整，找不到的話以官方的 [Proxy Support 說明](https://support.signal.org/hc/en-us/articles/360056052052-Proxy-Support){target="_blank"} 為準。

填的內容只有主機名稱（`proxy.example.com`），不要加 `https://` 或連線埠。存檔後 App 會嘗試連線，接上以後主畫面上方會出現連線標示。

### 取得連結之後

一台 proxy 的 IP 被審查者發現就會進黑名單，所以手邊最好有兩三個不同來源的位址備用。營運者換 IP 或重建服務時，舊的連結會失效，需要重新索取一份。

## 使用前要知道的事

- **proxy 營運者看得到你的 IP 與連線時間**。看不到訊息內容、對象、群組成員，這些都在端對端加密裡面。用誰的 proxy，等於把「某個 IP 在某個時間連了 Signal」的紀錄交給誰保管。
- **proxy 不隱藏「你在用 Signal」這件事**。對你的網路供應商而言，流量看起來是連到某個普通網站，不過使用 Signal 本身在當地已構成風險時，proxy 解決不了這個問題。需要連使用行為都藏起來，要看 [Tor Browser 進階設定](./tor-browser-advanced.md) 或行動裝置上的 Orbot 這類方案。
- **公開張貼的連結壽命較短**。Signal 官方建議公開宣布自己架了 proxy，位址則透過私訊給需要的人。一個位址在社群平台被大量轉貼，通常很快就會被封。
- **來源可信度要能追溯**。任何人都能架一台 proxy，位址最好來自你認得的組織或個人，而非來路不明的清單。

!!! info "台灣讀者用不到，但可以提供"

    台灣的網路環境沒有針對 Signal 的封鎖，本地使用不需要 proxy。這頁對台灣讀者的意義在後半段，架一台提供給被封鎖地區的人，跟 [Tor Snowflake](./tor-snowflake.md)、[WebTunnel 橋接](../community/setup-tor-webtunnel.md) 是同一類的貢獻。

## anoni.net 社群的 proxy

!!! warning "規劃中，尚未上線"

    社群正在評估架設一台公開的 Signal Proxy。服務上線後，這一節會補上分享連結、取得位址的管道，以及更換位址時的通知方式。在此之前這頁只是說明文件，沒有可用的位址可以取得。

## 自己架一台

Signal 官方維護 [Signal-TLS-Proxy](https://github.com/signalapp/Signal-TLS-Proxy){target="_blank"}，用 Docker Compose 包好，架設門檻在抗審查基礎建設裡屬於偏低的一類。

### 需要準備的東西

- 一台 VPS，`80` 與 `443` 兩個連線埠都要能對外開放。
- 一個網域或子網域，A record 指到這台 VPS 的 IP。
- 主機上裝好 Docker。

規格需求不高。Signal 在 2021 年的說明中提到，一台便宜的小型 VPS 就能負擔數百個同時連線的使用者。

### 架設步驟

```bash
git clone https://github.com/signalapp/Signal-TLS-Proxy.git
cd Signal-TLS-Proxy
./init-certificate.sh
docker compose up --detach
```

`init-certificate.sh` 會用 Let's Encrypt 取得 TLS 憑證，執行前要先確認 DNS 已經生效，否則憑證申請會失敗。執行完之後 proxy 就在運作了，分享連結是 `https://signal.tube/#<你的網域>`。

### 維運紀律

官方對這個 repo 有一份穩定性政策，Signal 服務端的相容性變更會盡量提前 30 天推上 repo。營運者要至少每 30 天檢查一次更新，超過太久沒更新，proxy 可能突然無法連上 Signal 服務。

更新方式：

```bash
git pull
docker compose down
docker compose build
docker compose up --detach
```

建議搭配一個外部監控，定期從 proxy 以外的網路確認 `443` 還通，服務中斷時才不會等到使用者回報。

### 分發策略

位址暴露得越廣，被封鎖得越快。實務上的做法是公開表明「我有一台 Signal proxy」，位址走私訊、加密郵件或小群組給出去。同一台伺服器如果服務對象太集中在一個地區，也會加速被當地審查系統盯上。

社群層級的做法是多備幾台、分散在不同的網路供應商，一台被封就換下一台，這跟 Tor 橋接分發的邏輯相同。

### 在台灣架的風險評估

Signal Proxy 只把流量轉給 Signal 的伺服器，不是任意目的地的通用出口。從法律風險看，它跟 [Tor Exit Relay](../community/setup-tor-relay.md) 差距很大，Exit 會有任意使用者的任意流量以你的 IP 出去，Signal Proxy 的目的地固定且單一，濫用空間小得多。

就目前掌握的資訊，台灣沒有限制個人或組織提供這類轉接服務的規定，這段是社群的整理，不構成法律意見。實際要留意的是主機商的服務條款，以及頻寬用量是否超出方案限制。租用前可以先看主機商對 proxy 與 VPN 類服務的政策說明。

## 常見問題

??? question "跟 VPN 差在哪？"

    VPN 把整台裝置的流量都導過去，Signal Proxy 只服務 Signal 一個 App 的連線。範圍小帶來兩個好處，一是設定在 App 內完成，不影響其他網路使用，二是流量特徵單純，比 VPN 難被辨識。需要繞行的是整體網路存取而非單一 App 時，[VPN 的風險與選擇](./vpn-guide.md) 那篇比較適合。

??? question "架一台要多少頻寬？"

    文字訊息的流量很小，語音與視訊通話才是頻寬的主要來源。一般 VPS 方案附的流量額度通常足夠，服務量大到需要擔心時，會先在主機商的月流量帳單上看出來。

??? question "proxy 營運者會被要求交出使用者資料嗎？"

    伺服器上能留下的是連線 IP 與時間，訊息內容與通訊對象都在端對端加密內，技術上無法取得。降低風險的做法是不開額外的連線紀錄、不長期保存 log。

??? question "我可以只給特定幾個人用嗎？"

    可以。不公開位址、只私下給指定對象，是 Signal 官方建議的分發方式。小規模的私人 proxy 反而比公開清單上的位址活得久。

??? question "跟 Tor Snowflake 比，哪個貢獻比較大？"

    兩者服務的對象不同。Snowflake 幫的是連不上 Tor 網路的人，涵蓋整體網路瀏覽的匿名需求。Signal Proxy 只處理 Signal 的通訊需求，範圍窄但直接對應「聯絡不上家人朋友」這個具體處境。架設門檻上，Snowflake 開分頁就能運作，Signal Proxy 需要 VPS 與網域，跟 [WebTunnel 橋接](../community/setup-tor-webtunnel.md) 接近。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 匿名通訊工具比較](./messaging-comparison.md)
- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)
- [:material-chat-question: 端對端加密如何運作](../advanced/e2ee.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-snowflake: Tor Snowflake 橋接點](./tor-snowflake.md)
- [:material-tunnel-outline: 如何搭建 Tor WebTunnel 橋接](../community/setup-tor-webtunnel.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)

</div>
