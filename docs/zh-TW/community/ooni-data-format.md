---
title: OONI 測量資料結構導覽
description: 一筆 OONI 測量資料由哪些欄位組成，怎麼從中讀出「誰在哪裡測的」與「測出什麼結果」。用兩筆台灣的真實測量對照說明，並對應到上游 ooni/spec 的規格文件。
icon: material/code-json
---

# :material-code-json: OONI 測量資料結構導覽

[ASN 觀測資料擷取與分析](./asn-coverage-howto.md) 說明了怎麼把 OONI 公開資料抓下來，抓下來之後會遇到下一個問題：一筆測量有二十多個頂層欄位，`test_keys` 裡還有二十幾個，該看哪一個。

以下用兩筆台灣的真實測量對照，說明一筆 web_connectivity 測量的組成，以及每個欄位對應到上游 [ooni/spec](https://github.com/ooni/spec){target="_blank"} 的哪份規格。看懂之後，你可以自己判斷一筆測量說了什麼，也能決定分析程式該取哪些欄位。

!!! info "範例資料來源"

    兩筆都是 2026-08-04 由台灣的 OONI Probe 產生的公開資料，可在 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 查到原始內容。

    | | 正常通過 | 判定異常 |
    |---|---|---|
    | 測量對象 | `http://presidentlee.tw/` | `https://ntc.party/` |
    | `measurement_uid` | `20260804085935.603513_TW_webconnectivity_4a5fd27dec0b32f6` | `20260804084548.416537_TW_webconnectivity_f4e7b0ab3d0251bf` |

## 一筆測量的三層結構

不用一開始就記住所有欄位。一筆測量可以拆成三層來讀：

1. **外殼**：誰在哪裡、用什麼軟體、什麼時候測的。所有測項共用同一套欄位，規格是 [df-000-base](https://github.com/ooni/spec/blob/master/data-formats/df-000-base.md){target="_blank"}。
2. **判定**：測量得出的結論。欄位隨測項而異，全部收在 `test_keys` 底下，web_connectivity 的定義在 [ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"}。
3. **證據**：支撐結論的原始紀錄，包含每一次 DNS 查詢、TCP 連線、TLS 握手與 HTTP 請求。同樣放在 `test_keys` 底下，各自對應一份 `df-` 開頭的規格。

判定層告訴你結論，證據層讓你驗證結論。兩者分開看，資料就不會亂。

## 外殼：誰在哪裡測的

外殼層的欄位在所有測項中都一樣，實務上最常用到的欄位如下：

| 欄位 | 正常通過那筆 | 判定異常那筆 | 說明 |
|---|---|---|---|
| `probe_cc` | `TW` | `TW` | 測量發生的國家代碼 |
| `probe_asn` | `AS3462` | `AS3462` | 執行測量的網路所屬 ASN |
| `probe_network_name` | `Chunghwa Telecom Co., Ltd.` | `Chunghwa Telecom Co., Ltd.` | 該 ASN 的組織名稱 |
| `resolver_asn` | `AS3462` | `AS13335` | 測量時實際使用的 DNS 解析器所屬 ASN |
| `resolver_network_name` | `Chunghwa Telecom Co., Ltd.` | `Cloudflare Inc` | 解析器的組織名稱 |
| `input` | `http://presidentlee.tw/` | `https://ntc.party/` | 測量對象的網址 |
| `test_name` | `web_connectivity` | `web_connectivity` | 測項名稱 |
| `software_name` | `ooniprobe-cli` | `ooniprobe-desktop-unattended` | 產生資料的 Probe 種類 |
| `software_version` | `3.29.1` | `3.26.0` | Probe 版本 |
| `measurement_start_time` | `2026-08-04 08:59:30` | `2026-08-04 08:45:45` | 測量開始時間（UTC）|
| `report_id` | `20260804T062033Z_webconnectivity_TW_3462_n4_uEH5rGoD07cN2oYQ` | `20260804T084446Z_webconnectivity_TW_3462_n4_dFfWCDrwouM0TsT2` | 同一次執行產生的多筆測量共用此值 |

`probe_asn` 與 `resolver_asn` 可能不同，上表就是實例。兩筆都在中華電信的網路上執行，但其中一筆的使用者把 DNS 指向了 Cloudflare。做 ASN 分析時兩個欄位要分開看，混用會讓「哪家電信商的網路上看到什麼」失準。

!!! note "`probe_ip` 永遠是 `127.0.0.1`"

    OONI 刻意不收集測量者的真實 IP，`probe_ip` 固定寫入本機位址。想追測量來源只能靠 `probe_asn` 加時間，[OONI Run v2 操作說明](../tools/ooni-run-v2.md) 也提醒協助者注意同樣的隱私邊界。

## 判定：測量得出的結論

`test_keys` 底下有八個欄位負責 web_connectivity 的判定。把兩筆並排，差異一眼可見：

| 欄位 | 正常通過 | 判定異常 | 說明 |
|---|---|---|---|
| `blocking` | `false` | `"dns"` | 判定的干預類型，可能值為 `dns`、`tcp_ip`、`http-failure`、`http-diff`，未觀測到干預時為 `false` |
| `accessible` | `true` | `false` | 是否取得了合理的回應 |
| `dns_consistency` | `"consistent"` | `"inconsistent"` | Probe 的 DNS 結果與 test helper 對照後是否一致 |
| `dns_experiment_failure` | `null` | `"dns_nxdomain_error"` | DNS 階段的失敗原因 |
| `title_match` | `true` | `null` | 網頁標題是否與對照組相符 |
| `headers_match` | `true` | `null` | 回應標頭是否相符 |
| `status_code_match` | `true` | `null` | HTTP 狀態碼是否相符 |
| `body_length_match` | `true` | `null` | 回應內容長度是否相近 |
| `body_proportion` | `1` | `0` | 內容長度與對照組的比值 |

`blocking` 的四種值，對應 [什麼是 OONI](../tools/what-is-ooni.md) 介紹過的四種干預手法：`dns` 是解析被導向錯誤結果、`tcp_ip` 是封包送不到目標位址、`http-failure` 是連線層被中斷、`http-diff` 是拿到的內容與對照組不同（常見於封鎖告示頁）。

四個 `*_match` 欄位在異常那筆全是 `null`，原因是 DNS 階段就失敗了，連線根本沒建立，後續沒有東西可以比對。看到一整排 `null` 時，往前找第一個非 `null` 的 failure 欄位，那裡才是問題發生的地方。

!!! warning "異常不等於封鎖"

    `blocking` 有值只代表該筆測量觀測到與對照組不一致，判斷是否真的存在網路干預需要更多佐證。以上表那筆為例，Probe 對 `ntc.party` 的 A 與 AAAA 查詢都回報 `dns_nxdomain_error`（網域不存在），但撰稿時從多個公開 DNS 解析器查詢，該網域可解析到 IPv6 位址。單筆測量無法區分網路干預、解析器當下的暫時狀態，以及網域本身的設定變動。

    要下封鎖結論，需要跨時間、跨 ASN、跨解析器的多筆測量交叉比對。判定機制的完整拆解與常見誤判來源見 [OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)，資料集層級的品質控制則可參考 [OONI 談測量結果失準](../blog/posts/2026-ooni-faulty-measurements.md)。

## 證據：支撐結論的原始紀錄

`test_keys` 底下另有幾個陣列欄位，記錄測量過程中每一次網路操作。每個欄位各有一份規格：

| 欄位 | 內容 | 規格 |
|---|---|---|
| `queries` | 每一次 DNS 查詢的問題、回應與失敗原因 | [df-002-dnst](https://github.com/ooni/spec/blob/master/data-formats/df-002-dnst.md){target="_blank"} |
| `tcp_connect` | 每一次 TCP 連線嘗試的目標與結果 | [df-005-tcpconnect](https://github.com/ooni/spec/blob/master/data-formats/df-005-tcpconnect.md){target="_blank"} |
| `tls_handshakes` | 每一次 TLS 握手的參數、憑證與結果 | [df-006-tlshandshake](https://github.com/ooni/spec/blob/master/data-formats/df-006-tlshandshake.md){target="_blank"} |
| `requests` | 每一次 HTTP 請求與回應的完整內容 | [df-001-httpt](https://github.com/ooni/spec/blob/master/data-formats/df-001-httpt.md){target="_blank"} |
| `network_events` | 連線過程的時序事件，用於分析延遲與中斷點 | [df-008-netevents](https://github.com/ooni/spec/blob/master/data-formats/df-008-netevents.md){target="_blank"} |
| 各欄位的 `failure` 字串 | 所有失敗原因的統一命名，例如 `dns_nxdomain_error`、`generic_timeout_error`、`ssl_unknown_authority` | [df-007-errors](https://github.com/ooni/spec/blob/master/data-formats/df-007-errors.md){target="_blank"} |

把兩筆的 `queries` 攤開對照，就能看到判定的依據：

```json title="正常通過：查到位址"
{
  "hostname": "presidentlee.tw",
  "query_type": "A",
  "failure": null,
  "answers": [{"answer_type": "A", "ipv4": "43.254.17.201"}]
}
```

```json title="判定異常：查詢落空"
{
  "hostname": "ntc.party",
  "query_type": "A",
  "failure": "dns_nxdomain_error",
  "answers": []
}
```

判定層的 `dns_consistency` 是結論，`queries` 是它的依據。想確認一筆測量的判定是否合理，往證據層看就對了。

## 版本與相容性

讀 spec 之前先確認版本，能省下不少困惑：

- **`data_format_version` 目前是 `0.2.0`**。外殼層的欄位定義穩定，[df-000-base](https://github.com/ooni/spec/blob/master/data-formats/df-000-base.md){target="_blank"} 可以直接對照。
- **web_connectivity 實際流通的 `test_version` 是 `0.4.3`**。[ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} 的規格內容已更新為描述 v0.5 演算法，但生產環境仍以 v0.4 為主。spec 明訂新版演算法必須使用不同的 test_keys 欄位，v0.4 的欄位定義保持相容，因此上表的欄位讀法對兩個版本都適用。
- **`x_` 開頭的欄位不在 spec 內**。實際資料中會看到 `x_dns_runtime`、`x_status`、`x_th_runtime` 等欄位，屬於實作端的實驗性擴充，隨版本增減，分析程式不應依賴它們。

上游 spec 的 master 分支自 2025-06 起沒有新的合併，但 issue 與 PR 討論持續進行（進行中的提案包含 ICMP 資料格式與 DPI 分片測項）。目前的狀態適合當作穩定參考，引用時建議連回上游原文，避免自行複製規格內容而在上游更新後失準。

## 自己取一筆來看

不必先架好環境，用公開 API 就能取得單筆資料。先列出符合條件的測量：

```bash title="列出台灣最近的 web_connectivity 測量"
curl -s "https://api.ooni.io/api/v1/measurements?probe_cc=TW&test_name=web_connectivity&limit=5"
```

回應中的 `measurement_uid` 可以換取完整內容：

```bash title="取得單筆完整測量資料"
curl -s "https://api.ooni.io/api/v1/raw_measurement?measurement_uid=<measurement_uid>"
```

加上 `anomaly=true` 可以只列出被判定異常的測量，適合用來找對照範例。把 `probe_cc` 換成自己所在地區、`probe_asn` 換成自己的 ASN，就能看到自己網路上的觀測紀錄。

需要批次處理大量資料時，改走 AWS S3 公開資料集會更有效率，作法見 [ASN 觀測資料擷取與分析](./asn-coverage-howto.md)。

## 延伸閱讀

<div class="grid cards" markdown>

- [:material-shield-search: OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)
- [:material-table-search: OONI 測項速查表](./ooni-nettests-map.md)
- [:material-access-point-network: 什麼是 OONI](../tools/what-is-ooni.md)
- [:material-database-search: ASN 觀測資料擷取與分析](./asn-coverage-howto.md)
- [:material-access-point-network: ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 網站檢測清單](../taiwan/ooni-checklist.md)

</div>

上游規格的完整目錄在 [ooni/spec](https://github.com/ooni/spec){target="_blank"}，其中 [data-formats](https://github.com/ooni/spec/tree/master/data-formats){target="_blank"} 收錄資料格式、[nettests](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} 收錄各測項的演算法定義。
