---
title: OONI 測項速查表
description: ooni/spec 收錄的 41 個網路測項各自測什麼、哪些還在產出資料、台灣實際跑到哪幾個。附上游規格連結，供挑選測項或解讀資料時對照。
icon: material/table-search
---

# :material-table-search: OONI 測項速查表

[ooni/spec](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} 的 `nettests` 目錄收錄 41 份測項規格，其中有相當比例已經停止使用。要挑測項或解讀手上的資料時，先知道哪些還在跑，比逐份讀規格有效率。

本頁把 41 份規格整理成一張對照表，標註上游規格的狀態、實際是否還有公開資料，以及台灣觀測到哪幾個。

!!! info "狀態欄位怎麼讀"

    **spec 狀態**取自各份規格開頭的 `_status_` 標記，分為 `current`、`experimental`、`obsolete` 三種，反映上游對該測項的定位。

    **資料流通**是實測結果，撰稿時（2026-08-04）以 [OONI API](https://api.ooni.io/api/v1/measurements){target="_blank"} 逐一查詢各測項最近的公開測量。兩者可能不一致，後面有專節說明。

    **台灣**欄位來自 S3 公開資料集，抽查 2026-08-03 五個時段台灣底下出現過的測項目錄。

## 仍在產出資料的測項

以下測項在撰稿當日都查得到公開測量，是解讀 OONI 資料時最常遇到的一批。

| 測項 | 測什麼 | spec 狀態 | 台灣 |
|---|---|---|---|
| [`web_connectivity`](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} | 網站可達性與封鎖判定，資料量最大的測項 | current | 有 |
| [`tor`](https://github.com/ooni/spec/blob/master/nettests/ts-023-tor.md){target="_blank"} | Tor 目錄權威節點與橋接的可達性 | current | 有 |
| [`vanilla_tor`](https://github.com/ooni/spec/blob/master/nettests/ts-016-vanilla-tor.md){target="_blank"} | 未經偽裝的 Tor 能否順利啟動連線 | experimental | 有 |
| [`torsf`](https://github.com/ooni/spec/blob/master/nettests/ts-030-torsf.md){target="_blank"} | 透過 Snowflake 傳輸層的 Tor 連線 | experimental | 無 |
| [`telegram`](https://github.com/ooni/spec/blob/master/nettests/ts-020-telegram.md){target="_blank"} | Telegram 網頁版與資料中心端點可達性 | current | 有 |
| [`whatsapp`](https://github.com/ooni/spec/blob/master/nettests/ts-018-whatsapp.md){target="_blank"} | WhatsApp 端點與註冊服務可達性 | current | 有 |
| [`signal`](https://github.com/ooni/spec/blob/master/nettests/ts-029-signal.md){target="_blank"} | Signal 服務端點可達性 | current | 有 |
| [`facebook_messenger`](https://github.com/ooni/spec/blob/master/nettests/ts-019-facebook-messenger.md){target="_blank"} | Facebook Messenger 端點可達性 | current | 有 |
| [`dnscheck`](https://github.com/ooni/spec/blob/master/nettests/ts-028-dnscheck.md){target="_blank"} | 指定 DNS 解析器的行為，涵蓋 DoH 與 DoT | experimental | 有 |
| [`dnsping`](https://github.com/ooni/spec/blob/master/nettests/ts-035-dnsping.md){target="_blank"} | DNS 查詢的延遲與回應行為 | experimental | 無 |
| [`echcheck`](https://github.com/ooni/spec/blob/master/nettests/ts-039-echcheck.md){target="_blank"} | TLS Encrypted Client Hello 的支援與干擾狀況 | experimental | 有 |
| [`http_header_field_manipulation`](https://github.com/ooni/spec/blob/master/nettests/ts-006-header-field-manipulation.md){target="_blank"} | 中間設備是否竄改 HTTP 標頭 | current | 有 |
| [`http_invalid_request_line`](https://github.com/ooni/spec/blob/master/nettests/ts-007-http-invalid-request-line.md){target="_blank"} | 中間設備對異常請求行的反應，用於偵測透明代理 | current | 有 |
| [`openvpn`](https://github.com/ooni/spec/blob/master/nettests/ts-040-openvpn.md){target="_blank"} | OpenVPN 握手能否完成 | experimental | 有 |
| [`psiphon`](https://github.com/ooni/spec/blob/master/nettests/ts-015-psiphon.md){target="_blank"} | Psiphon 規避工具能否建立連線 | current | 有 |
| [`riseupvpn`](https://github.com/ooni/spec/blob/master/nettests/ts-026-riseupvpn.md){target="_blank"} | RiseupVPN 服務可達性 | current | 有 |
| [`stunreachability`](https://github.com/ooni/spec/blob/master/nettests/ts-025-stun-reachability.md){target="_blank"} | STUN 伺服器可達性，牽動 WebRTC 通話 | experimental | 有 |
| [`ndt`](https://github.com/ooni/spec/blob/master/nettests/ts-022-ndt.md){target="_blank"} | 連線速度與效能診斷 | current | 有 |
| [`dash`](https://github.com/ooni/spec/blob/master/nettests/ts-021-dash.md){target="_blank"} | 影音串流播放品質 | current | 有 |
| [`browser_web`](https://github.com/ooni/spec/blob/master/nettests/ts-036-browser_web.md){target="_blank"} | 以真實瀏覽器引擎載入網頁 | experimental | 無 |

## 偶爾才有資料的測項

| 測項 | 測什麼 | spec 狀態 | 最近一筆 |
|---|---|---|---|
| [`quicping`](https://github.com/ooni/spec/blob/master/nettests/ts-031-quicping.md){target="_blank"} | QUIC 協定的可達性 | experimental | 2026-07-30 |
| [`sni_blocking`](https://github.com/ooni/spec/blob/master/nettests/ts-024-sni-blocking.md){target="_blank"} | 針對 TLS SNI 欄位的封鎖偵測 | experimental | 2026-07-20 |

## 查不到公開資料的測項

以下七個測項在 API 查不到公開測量。規格仍在上游倉庫裡，設計新測項或研究方法時可以參考。

| 測項 | 測什麼 | spec 狀態 |
|---|---|---|
| [`tlsmiddlebox`](https://github.com/ooni/spec/blob/master/nettests/ts-037-tlsmiddlebox.md){target="_blank"} | TLS 連線路徑上的中間設備行為 | current |
| [`portfiltering`](https://github.com/ooni/spec/blob/master/nettests/ts-038-port-filtering.md){target="_blank"} | 特定連接埠是否被過濾 | current |
| [`captiveportal`](https://github.com/ooni/spec/blob/master/nettests/ts-010-captive-portal.md){target="_blank"} | 是否處於需要登入的受控網路 | current |
| [`urlgetter`](https://github.com/ooni/spec/blob/master/nettests/ts-027-urlgetter.md){target="_blank"} | 供其他測項複用的通用抓取元件 | experimental |
| [`tcpping`](https://github.com/ooni/spec/blob/master/nettests/ts-032-tcpping.md){target="_blank"} | TCP 層的往返延遲 | experimental |
| [`tlsping`](https://github.com/ooni/spec/blob/master/nettests/ts-033-tlsping.md){target="_blank"} | TLS 握手的往返延遲 | experimental |
| [`simplequicping`](https://github.com/ooni/spec/blob/master/nettests/ts-034-simplequicping.md){target="_blank"} | QUIC 的簡化延遲量測 | experimental |

## 已標記為 obsolete 的歷史測項

上游標為 `obsolete` 的有 12 份，多數功能已被 `web_connectivity` 吸收，或隨著測量方法演進而退場：`bridget`、DNS Consistency、HTTP Requests、HTTP Host、DNS Spoof、TCP Connect、Multi Protocol Traceroute、Bridge Reachability、DNS Injection、Lantern、Meek Fronted Requests，以及舊版的 OpenVPN Client Test。

處理歷史資料時可能會遇到它們的紀錄，規格留在上游倉庫可供查閱。目前規劃新的觀測時沒有採用的理由。

!!! note "編號重複的兩份 OpenVPN 規格"

    上游有兩份規格都編為 `ts-016`，分別是標為 `obsolete` 的 `ts-016-openvpn.md` 與標為 `experimental` 的 `ts-016-vanilla-tor.md`。現行的 OpenVPN 測項規格是 `ts-040-openvpn.md`，引用時留意不要取到舊的那份。

## spec 狀態與實際流通的落差

規格標記與實際資料兩邊對不上的情況確實存在，挑測項時值得先確認：

- **標為 `current` 卻查不到資料**：`tlsmiddlebox`、`portfiltering`、`captiveportal` 三個。
- **標為 `experimental` 卻天天有資料**：`dnscheck`、`echcheck`、`openvpn`、`stunreachability`、`vanilla_tor` 等，資料量與部分 `current` 測項相當。

`experimental` 反映的是規格本身的成熟度，與資料量多寡沒有必然關係。要判斷某個測項適不適合拿來分析，直接查 API 有沒有資料比看狀態標記可靠。

## 台灣觀測到哪些測項

抽查 2026-08-03 五個時段，台灣底下出現過 17 個測項目錄：`web_connectivity`、`tor`、`vanilla_tor`、`telegram`、`whatsapp`、`signal`、`facebook_messenger`、`dnscheck`、`echcheck`、`http_header_field_manipulation`、`http_invalid_request_line`、`openvpn`、`psiphon`、`riseupvpn`、`stunreachability`、`ndt`、`dash`。

S3 上的目錄名與 `test_name` 寫法不同，目錄名沒有底線（`webconnectivity`、`vanillator`、`facebookmessenger`），API 查詢要用底線形式（`web_connectivity`、`vanilla_tor`、`facebook_messenger`）。取用路徑的細節見 [ASN 觀測資料擷取與分析](./asn-coverage-howto.md)。

台灣目前的觀測集中在 `web_connectivity`，其他測項的樣本量偏小。想擴充在地觀測的涵蓋面，`tor` 與 `dnscheck` 是與社群既有主題最接近的兩個方向。

## 延伸閱讀

<div class="grid cards" markdown>

- [:material-code-json: OONI 測量資料結構導覽](./ooni-data-format.md)
- [:material-shield-search: OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)
- [:material-database-search: ASN 觀測資料擷取與分析](./asn-coverage-howto.md)
- [:material-access-point-network: 什麼是 OONI](../tools/what-is-ooni.md)

</div>

各測項的完整演算法定義在上游 [nettests](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} 目錄。測項輸出的共通欄位定義在 [data-formats](https://github.com/ooni/spec/tree/master/data-formats){target="_blank"}。
