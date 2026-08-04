---
title: OONI 怎麼判定一個網站被封鎖
description: web_connectivity 的 blocking 欄位怎麼算出來，四種判定各自的證據長什麼樣，以及為什麼 blocking 有值不等於確認封鎖。用六筆真實測量說明判讀方法與常見誤判來源。
icon: material/shield-search
---

# :material-shield-search: OONI 怎麼判定一個網站被封鎖

[OONI 測量資料結構導覽](./ooni-data-format.md) 說明了欄位放在哪裡，接下來的問題是欄位值怎麼算出來。看到 `blocking: "dns"` 時，能不能說某個網站在台灣被封鎖了？

答案多半是不能。`blocking` 記錄的是單次測量與對照組不一致，距離「確認封鎖」還有幾步。以下拆解判定機制、四種類型各自的證據形狀，以及把單筆測量推到可信結論需要補上什麼。

## 判定的基礎：雙邊對照

Probe 單獨測一個網站，無法區分「網站被擋」與「網站本來就掛了」。web_connectivity 的作法是同一個網址測兩次，一次從 Probe 所在的網路，一次請 OONI 的 test helper 從外部網路測，再比對兩邊結果。

test helper 的觀測結果收在 `test_keys.control` 底下，包含它的 DNS 解析結果、TCP 連線狀態與 HTTP 回應。判定欄位全部建立在雙邊差異上：

| 差異出現的位置 | 判定 |
|---|---|
| DNS 解析結果對不上 | `blocking: "dns"` |
| DNS 一致，Probe 連不上但 test helper 連得上 | `blocking: "tcp_ip"` |
| TCP 連得上，HTTP 階段失敗 | `blocking: "http-failure"` |
| HTTP 有回應，內容與 test helper 拿到的不同 | `blocking: "http-diff"` |
| 兩邊都正常且內容相符 | `blocking: false`、`accessible: true` |

判定順序由前往後，DNS 階段就出問題時不會繼續往下比對。四個 `*_match` 欄位在前三種情況下全是 `null`，原因正是比對在更早的階段就停住了。

## 四種判定的證據形狀

以下六筆都是 2026-08-04 的公開測量，可在 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 查到原始內容。

### `dns`：解析結果對不上

台灣 `https://ntc.party/` 的測量，Probe 對 A 與 AAAA 的查詢都回報 `dns_nxdomain_error`（網域不存在），test helper 那邊查得到，因此 `dns_consistency` 標為 `inconsistent`。

```json title="test_keys.queries"
{"query_type": "A", "failure": "dns_nxdomain_error", "answers": []}
{"query_type": "AAAA", "failure": "dns_nxdomain_error", "answers": []}
```

DNS 判定要留意解析器歸屬。該筆的 `resolver_asn` 是 `AS13335`（Cloudflare），`probe_asn` 才是 `AS3462`（中華電信）。測量者把 DNS 指向境外服務時，DNS 階段的異常未必反映本地電信商的行為。

### `tcp_ip`：連不到目標位址

台灣 `http://www.tkec.com.tw/` 的測量判定為 `tcp_ip`，DNS 正常解析到 `210.64.193.1`，Probe 連 `80` 埠逾時。

只看 Probe 端容易誤讀成封鎖，往 `control` 看就會改變結論：

```json title="test_keys.control.tcp_connect"
{"210.64.193.1:443": {"status": true,  "failure": null},
 "210.64.193.1:80":  {"status": false, "failure": "generic_timeout_error"}}
```

test helper 從外部連 `80` 埠同樣逾時，代表該網站的 `80` 埠對全世界都不通，與台灣的網路環境無關。看 `blocking` 之前先看 `control`，是判讀 web_connectivity 最省事的一個習慣。

### `http-failure`：連得上但要不到內容

台灣 `https://bit.ly/` 的測量判定為 `http-failure`。DNS 正常，兩個目標 IP 的 `443` 埠都連得上，`control` 顯示 test helper 也連得上，差異出現在 HTTP 階段的 `generic_timeout_error`。

連線層沒問題而應用層失敗，常見於伺服器端的速率限制、對特定來源的拒絕服務，以及 TLS 層的中斷。要區分成因需要看 `tls_handshakes` 與 `network_events` 的時序。

### `http-diff`：拿到的內容不一樣

四種類型裡只有 `http-diff` 會讓四個 `*_match` 欄位真的派上用場。印尼 `http://www.sportsinteraction.com/` 的測量是典型例子：

| 觀測方 | 狀態碼 | 標題 | 內容長度 |
|---|---|---|---|
| Probe | `200` | `Trustpositif` | 7,044 |
| test helper | `403` | `Maintenance` | 7,067 |

Probe 的請求被重導向到 `http://lamanlabuh.aduankonten.id/`，落在印尼官方的內容申訴網域，頁面標題 `Trustpositif` 是當地網路內容過濾系統的名稱。ISP 在連線途中把使用者導向告示頁，是 `http-diff` 最典型的成因。

該筆同時示範了單一欄位不可靠：

```
title_match: false        status_code_match: false
headers_match: true       body_length_match: true
body_proportion: 0.9967
```

`body_length_match` 為 `true`、`body_proportion` 逼近 `1`，純粹因為封鎖告示頁與對照組頁面的長度剛好接近。只看長度會得到錯誤結論，四個欄位要一起讀，其中 `title_match` 與 `status_code_match` 的鑑別力通常最高。

## 誤判從哪裡來

`blocking` 有值而實際上沒有網路干預，是資料集裡的常態。前面 `tkec.com.tw` 的 `80` 埠不通已經是一例，再看一筆更隱蔽的。

埃及 `http://www.newipnow.com/` 的測量判定為 `http-diff`，四個 `*_match` 有三個不符，`body_proportion` 只有 `0.02`。看起來像被塞了封鎖頁，實際內容是：

| 觀測方 | 狀態碼 | 標題 |
|---|---|---|
| Probe | `520` | `newipnow.com \| 520: Web server is returning an unknown error` |
| test helper | `200` | `Buy Private Proxies: $0.88 per Dedicated Premium IP - NewIPNow` |

`520` 是 Cloudflare 在來源伺服器異常時回的錯誤頁，該筆的 `probe_asn` 正是 `AS13335`（Cloudflare）。來源網站當下出狀況，與埃及的網路管制無關。

常見的誤判來源可以歸成幾類：

- **來源網站自身狀態**：伺服器錯誤、維護頁、CDN 錯誤頁、地理限制。
- **測量環境**：Probe 開著 VPN 或 Tor 時，測到的是出口所在地的網路。
- **網站的動態內容**：輪播廣告、個人化內容、A/B 測試會讓兩邊的內容天然不同。
- **對照組本身失敗**：`control_failure` 有值時，雙邊比對的前提就不成立。

OONI 在資料集層級也處理同一類問題，作法可參考 [OONI 如何分辨壞掉的量測資料](../blog/posts/2026-ooni-faulty-measurements.md)，該文整理了他們用哪些啟發式規則過濾異常投稿。

## 從單筆測量到可信結論

要把觀測推進到「某個網站在某地被封鎖」，單筆資料不夠。實務上補上幾個維度：

1. **跨時間**：同一個網址在數天到數週內反覆出現同樣的判定，才能排除偶發故障。
2. **跨 ASN**：多家電信商都測到相同結果，指向網路層的普遍行為。只在單一 ASN 出現，比較像該業者的個別設定。
3. **跨解析器**：換不同 DNS 解析器仍然異常，才能排除解析器自身問題。
4. **看 `confirmed` 欄位**：OONI 後端會用已知的封鎖告示頁指紋比對測量，命中時把 `confirmed` 標為 `true`。該欄位在 [measurements API](https://api.ooni.io/api/v1/measurements){target="_blank"} 的回應中，屬於後端分析結果，不在 Probe 產生的原始資料裡。

想自己跑跨時間或跨 ASN 的比對，[ASN 觀測資料擷取與分析](./asn-coverage-howto.md) 有批次取用的作法。

!!! warning "`confirmed` 為 `true` 不等於 `http-diff`"

    兩者容易混淆。`confirmed` 標記的依據是封鎖指紋比對，DNS 被導向已知的封鎖用 IP 也會標記為 `confirmed`，判定類型仍是 `dns`。撰稿時抽查伊朗、俄羅斯、土耳其、中國各五筆 `confirmed` 測量，四地的樣本全部落在 `blocking: "dns"`。

## 台灣現況

撰稿時抽樣觀察台灣的 web_connectivity 資料，有兩個現象值得記錄：

- **抽查 100 筆異常測量，`confirmed` 為 `true` 的有 0 筆**，與 [ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md) 長期以來的描述一致。
- **抽查 40 筆異常測量的判定分布，`dns` 31 筆、`tcp_ip` 6 筆、`http-failure` 3 筆，`http-diff` 0 筆**。台灣目前的公開觀測資料裡沒有出現重導向到封鎖告示頁的樣態，前面的 `http-diff` 範例才需要引用印尼與埃及的資料。

以上是特定時間點的抽樣，樣本量小，僅供理解資料樣態，不足以當作長期趨勢的結論。要做有代表性的統計，需要涵蓋更長時間與更多 ASN，而台灣的觀測本身就存在 [ASN 集中度過高](../taiwan/ooni-asn-coverage.md) 的限制。

## 延伸閱讀

<div class="grid cards" markdown>

- [:material-code-json: OONI 測量資料結構導覽](./ooni-data-format.md)
- [:material-table-search: OONI 測項速查表](./ooni-nettests-map.md)
- [:material-database-search: ASN 觀測資料擷取與分析](./asn-coverage-howto.md)
- [:material-access-point-network: ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 網站檢測清單](../taiwan/ooni-checklist.md)

</div>

判定演算法的完整定義在上游 [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"}，失敗字串的統一命名在 [df-007-errors](https://github.com/ooni/spec/blob/master/data-formats/df-007-errors.md){target="_blank"}。
