---
title: OONI 怎麼判定一個網站被封鎖
description: 網路連線測試（Web Connectivity）的 blocking 欄位怎麼算出來，四種判定各自對應什麼證據，以及為什麼 blocking 有值不等於確認封鎖。用五筆真實測量說明判讀方法與常見誤判來源。
icon: material/shield-search
---

# :material-shield-search: OONI 怎麼判定一個網站被封鎖

[OONI 測量資料結構導覽](./ooni-data-format.md) 說明各欄位的位置，本頁說明判定欄位的計算方式。`blocking: "dns"` 在多數情況下並不足以斷定某個網站在台灣被封鎖。

`blocking` 記錄的是單次測量與對照組不一致，與「確認封鎖」尚有距離。以下拆解判定機制、四種類型各自對應的證據，以及單筆測量推向可信結論所需的補強。

## 判定建立在雙邊對照上

Probe 單獨測一個網站，無法區分「網站遭到干預」與「網站本身無法連線」。`web_connectivity` 的作法是同一個網址測兩次，一次從 Probe 所在的網路，一次請 OONI 的 test helper 從外部網路測，再比對兩邊結果。

test helper 是 OONI 架設在外部網路的測量伺服器，觀測結果收在 `test_keys.control` 底下，包含 DNS 解析結果、TCP 連線狀態與 HTTP 回應。判定欄位全部建立在雙邊差異上：

| 差異出現的位置 | 判定 |
|---|---|
| DNS 解析結果不一致 | `blocking: "dns"` |
| DNS 一致，Probe 連不上但 test helper 連得上 | `blocking: "tcp_ip"` |
| TCP 連得上，HTTP 階段失敗 | `blocking: "http-failure"` |
| HTTP 有回應，內容與 test helper 取得的不同 | `blocking: "http-diff"` |
| 兩邊都正常且內容相符 | `blocking: false`、`accessible: true` |

判定順序由前往後，DNS 階段出問題即不再往下比對。四個 `*_match` 欄位在前三種情況下全為 `null`，原因正是比對已在更早的階段中止。

!!! tip "先看 `control` 再看 `blocking`"

    `blocking` 是雙邊比對的結果，並非 Probe 單方面的觀測。判讀異常測量時，應先確認 `test_keys.control` 中 test helper 的觀測內容，再回頭讀 `blocking`。下一節的 `tcp_ip` 範例即說明，忽略 `control` 會把網站自身的問題誤判成封鎖。

<figure markdown="span">
    <img src="https://assets.anoni.net/diagrams/ooni-blocking-decision.zh-TW.svg"
        alt="判定流程圖。同一個網址由 Probe 端與 test helper 各測一次，兩邊結果逐階段比對。第一階比 DNS 解析結果，不一致就判 dns。第二階比 TCP 連線，Probe 連不上而 test helper 連得上就判 tcp_ip。第三階比 HTTP 階段，失敗就判 http-failure。第四階比回應內容，不同就判 http-diff。四階都通過就是 blocking false、accessible true。判定在任何一階中止之後就不再往下比對。">
    <figcaption>差異出現在哪一階，判定就停在哪一階</figcaption>
</figure>

上面那張表列的是「差異出現在哪裡」對應到哪個判定，畫成流程之後會多看到一件事：判定是有順序的。DNS 階段一出問題就不再往下比對，所以後面那幾個 `*_match` 欄位在前三種情況下全是 `null`。下一節的五筆實際測量，就是這四條路徑各自的例子。

## 四種判定對應的證據

後續章節引用的五筆測量都是 2026-08-04 的公開資料，可在 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 查到原始內容。

### `dns`：解析結果不一致

台灣 `https://ntc.party/` 的測量，Probe 對 A 與 AAAA 的查詢都回報 `dns_nxdomain_error`（網域不存在），test helper 端查得到，因此 `dns_consistency` 標為 `inconsistent`。

```json title="test_keys.queries"
{"query_type": "A", "failure": "dns_nxdomain_error", "answers": []}
{"query_type": "AAAA", "failure": "dns_nxdomain_error", "answers": []}
```

DNS 判定須留意解析器歸屬。該筆的 `resolver_asn` 是 `AS13335`（Cloudflare），`probe_asn` 則是 `AS3462`（中華電信）。測量者將 DNS 指向境外服務時，DNS 階段的異常未必反映本地電信商的行為。

### `tcp_ip`：連不到目標位址

台灣 `http://www.tkec.com.tw/` 的測量判定為 `tcp_ip`，DNS 正常解析到 `210.64.193.1`，Probe 連 `80` 埠逾時。

單看 Probe 端容易誤讀成封鎖，對照 `control` 的結果則得出不同結論：

```json title="test_keys.control.tcp_connect"
{"210.64.193.1:443": {"status": true,  "failure": null},
 "210.64.193.1:80":  {"status": false, "failure": "generic_timeout_error"}}
```

test helper 從外部連 `80` 埠同樣逾時，代表該網站的 `80` 埠從外部亦無法連通，與台灣的網路環境無關。同一個 IP 的 `443` 埠兩側皆通，進一步顯示問題出在該埠而非路徑。

### `http-failure`：連線建立後取不到內容

台灣 `https://bit.ly/` 的測量判定為 `http-failure`。DNS 正常，兩個目標 IP 的 `443` 埠皆可連通，`control` 顯示 test helper 端亦同，差異出現在 HTTP 階段的 `generic_timeout_error`。

連線層正常而應用層失敗，常見於伺服器端的速率限制、對特定來源的拒絕服務，以及 TLS 層的中斷。區分成因須查看 `tls_handshakes` 與 `network_events` 的時序。

### `http-diff`：取得的內容不一致

台灣的資料中有 `http-diff`，但樣態與封鎖告示頁不同（見文末台灣現況），以下改用印尼的測量說明典型的告示頁樣態。

四種類型中只有 `http-diff` 會用到四個 `*_match` 欄位。印尼 `http://www.sportsinteraction.com/` 的測量是典型例子：

| 觀測方 | 狀態碼 | 標題 | 內容長度 |
|---|---|---|---|
| Probe | `200` | `Trustpositif` | 7,044 |
| test helper | `403` | `Maintenance` | 7,067 |

Probe 的請求被重導向到 `http://lamanlabuh.aduankonten.id/`，落在印尼官方的內容申訴網域，頁面標題 `Trustpositif` 是當地網路內容過濾系統的名稱。ISP 在連線途中將使用者導向告示頁，是 `http-diff` 最典型的成因。

該筆同時顯示單一欄位不足以作為判準：

```text title="四個 *_match 欄位與 body_proportion"
title_match: false        status_code_match: false
headers_match: true       body_length_match: true
body_proportion: 0.9967
```

`body_length_match` 為 `true`、`body_proportion` 逼近 `1`，起因僅是封鎖告示頁與對照組頁面的長度接近。單看長度會得到錯誤結論，四個欄位須一併判讀，其中 `title_match` 與 `status_code_match` 的鑑別力通常最高。

## 誤判的來源

`blocking` 有值而實際上沒有網路干預，是資料集中的常態。前述 `tkec.com.tw` 的 `80` 埠不通即為一例，以下是一筆更隱蔽的。

埃及 `http://www.newipnow.com/` 的測量判定為 `http-diff`，四個 `*_match` 有三個不符，`body_proportion` 僅 `0.02`，表面上近似被插入封鎖頁。實際內容如下：

| 觀測方 | 狀態碼 | 標題 |
|---|---|---|
| Probe | `520` | `newipnow.com \| 520: Web server is returning an unknown error` |
| test helper | `200` | `Buy Private Proxies: $0.88 per Dedicated Premium IP - NewIPNow` |

`520` 是目標網站前方的 Cloudflare 在來源伺服器異常時回應的錯誤頁，代表該網站當下發生異常，與埃及的網路管制無關。該筆的 `probe_asn` 是 `AS13335`（Cloudflare），測量端本身亦位於 Cloudflare 的網路上，屬於下列第二類的測量環境因素。

常見的誤判來源可分為幾類：

- **來源網站自身狀態**：伺服器錯誤、維護頁、CDN 錯誤頁、地理限制。
- **測量環境**：Probe 啟用 VPN 或 Tor 時，測得的是出口所在地的網路。
- **網站的動態內容**：輪播廣告、個人化內容、A/B 測試會使兩側內容原本即不相同。
- **對照組本身失敗**：`control_failure` 有值時，雙邊比對的前提不成立。

OONI 在資料集層級亦處理同一類問題，作法見 [OONI 如何分辨壞掉的量測資料](../blog/posts/2026-ooni-faulty-measurements.md)，該文整理了 OONI 過濾異常投稿所用的啟發式規則。

## 從單筆測量到可信結論

將觀測推進到「某個網站在某地被封鎖」，單筆資料並不足夠。實務上須補上幾個維度：

1. **跨時間**：同一個網址在數天到數週內反覆出現同樣的判定，方能排除偶發故障。
2. **跨 ASN**：多家電信商測得相同結果，指向網路層的普遍行為。僅在單一 ASN 出現者，較可能是該業者的個別設定。
3. **跨解析器**：更換 DNS 解析器後仍然異常，方能排除解析器自身問題。
4. **`confirmed` 欄位**：OONI 後端以已知的封鎖告示頁指紋比對測量，命中時將 `confirmed` 標為 `true`。該欄位位於 [measurements API](https://api.ooni.org/api/v1/measurements){target="_blank"} 的回應中，屬於後端分析結果，不在 Probe 產生的原始資料內。

跨時間與跨 ASN 比對的批次取用作法，見 [ASN 觀測資料擷取與分析](./asn-coverage-howto.md)。

!!! warning "`confirmed` 為 `true` 不等於 `http-diff`"

    兩者易於混淆。`confirmed` 標記的依據是封鎖指紋比對，DNS 被導向已知的封鎖用 IP 同樣會標記為 `confirmed`，判定類型仍是 `dns`。撰稿時抽查伊朗、俄羅斯、土耳其、中國各 5 筆 `confirmed` 測量，樣本全部落在 `blocking: "dns"`。樣本數少，僅能說明兩者並非同一件事，不足以推論一般規律。

## 台灣現況

以下數字取自 2026-08-05 往前 24 小時的台灣 `web_connectivity` 全量資料，共 22,105 筆測量。統計方式是把該區間 S3 上的每一筆逐行解析，取 `test_keys.blocking` 依 ASN 累計：

| 判定 | 筆數 | 佔比 |
|---|---|---|
| `false`（未觀測到干預） | 21,029 | 95.13% |
| `none`（沒有判定結果） | 512 | 2.32% |
| `tcp_ip` | 312 | 1.41% |
| `dns` | 150 | 0.68% |
| `http-failure` | 67 | 0.30% |
| `http-diff` | 35 | 0.16% |

四種干預類型合計 564 筆，佔全部測量的 2.55%。`none` 是缺 `test_keys` 或 `blocking` 為 `null` 的測量，計算異常率前須先決定是否納入分母。

另外抽查 100 筆異常測量，`confirmed` 為 `true` 的有 0 筆，與 [ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md) 長期以來的描述一致。

!!! warning "小樣本會給出錯誤的分布"

    本頁初稿曾以 measurements API 異常清單的 40 筆抽樣估計判定分布，得到 `dns` 最多、`http-diff` 為零的結論。改用全量統計後兩點皆不成立：`tcp_ip` 為 `dns` 的兩倍以上，`http-diff` 亦確實存在。API 的異常清單另有排序邏輯，逕自視為隨機樣本會失準。判定分布應以全量統計取得，作法見 [ASN 觀測資料擷取與分析](./asn-coverage-howto.md)。

台灣的 `http-diff` 與前述印尼的例子屬於不同現象。抽查 4 小時區間內的 15 筆，`body_proportion` 全部落在 `0.004` 到 `0.21`，Probe 取得的內容遠短於對照組，與封鎖告示頁逼近 `1` 的樣態相反。內容極短通常指向錯誤頁或空回應，成因須逐筆查驗證據層方能判斷，本頁不下結論。

重新執行上述統計的指令：

```bash title="取得判定分布"
uv run python ooni.py lookback --units=24 --loc=TW --frame=hours
```

該指令會印出 `blocking` 的合計，並將逐 ASN 的分布寫入 CSV。單筆查驗仍使用 API：

```bash title="列出台灣的異常測量"
curl -s "https://api.ooni.org/api/v1/measurements?probe_cc=TW&test_name=web_connectivity&anomaly=true&limit=100" \
  | python3 -m json.tool | head -40
```

以上是單一 24 小時區間的快照，反映當日樣態，不足以作為長期趨勢的結論。趨勢分析須涵蓋更長時間，而台灣的觀測本身即存在 ASN 集中度過高的限制，細節見前述 [ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)。

## 延伸閱讀

跨時間、跨 ASN 的比對從擷取指南開始。

<div class="grid cards" markdown>

- [:material-database-search: ASN 觀測資料擷取與分析](./asn-coverage-howto.md)
- [:material-code-json: OONI 測量資料結構導覽](./ooni-data-format.md)
- [:material-table-search: OONI 測項速查表](./ooni-nettests-map.md)
- [:material-access-point-network: ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 網站檢測清單](../taiwan/ooni-checklist.md)

</div>

判定演算法的完整定義在上游 [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"}，失敗字串的統一命名在 [df-007-errors](https://github.com/ooni/spec/blob/master/data-formats/df-007-errors.md){target="_blank"}。
