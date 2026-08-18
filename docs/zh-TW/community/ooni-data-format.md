---
title: OONI 測量資料結構導覽
description: 一筆 OONI 測量資料由哪些欄位組成，怎麼從中讀出「誰在哪裡測的」與「測出什麼結果」。用兩筆台灣的真實測量對照說明，並對應到上游 ooni/spec 的規格文件。
icon: material/code-json
---

# :material-code-json: OONI 測量資料結構導覽

一筆 OONI 測量有二十多個頂層欄位，`test_keys` 底下還有二十幾個。[ASN 觀測資料擷取與分析](./asn-coverage-howto.md) 說明擷取公開資料的方法，本頁接續說明擷取之後如何判讀欄位。

以下以兩筆台灣的真實測量對照，拆解網路連線測試（`web_connectivity`）的組成，並標出各欄位對應上游 [ooni/spec](https://github.com/ooni/spec){target="_blank"} 的哪份規格。

!!! info "範例資料來源"

    兩筆都是 2026-08-04 由台灣的 OONI Probe 產生的公開資料，可在 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 查到原始內容。

    | | 正常通過 | 判定異常 |
    |---|---|---|
    | 測量對象 | `http://presidentlee.tw/` | `https://ntc.party/` |
    | `measurement_uid` | `20260804085935.603513_TW_webconnectivity_4a5fd27dec0b32f6` | `20260804084548.416537_TW_webconnectivity_f4e7b0ab3d0251bf` |

## 一筆測量的三層結構

一筆測量可以拆成三層：

1. **外殼**：誰在哪裡、用什麼軟體、什麼時候測的。所有測項共用同一套欄位，規格是 [df-000-base](https://github.com/ooni/spec/blob/master/data-formats/df-000-base.md){target="_blank"}。
2. **判定**：測量得出的結論。欄位隨測項而異，全部收在 `test_keys` 底下，`web_connectivity` 的定義在 [ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"}。
3. **證據**：支撐結論的原始紀錄，包含每一次 DNS 查詢、TCP 連線、TLS 握手與 HTTP 請求，以及對照組的同類紀錄。同樣放在 `test_keys` 底下，各自對應一份 `df-` 開頭的規格。

判定層給出結論，證據層保留支撐結論的紀錄。

## 取得一筆測量

公開 API 可直接取得單筆測量，不需事先架設環境。先列出符合條件的測量：

```bash title="列出台灣最近的網路連線測試"
curl -s "https://api.ooni.io/api/v1/measurements?probe_cc=TW&test_name=web_connectivity&limit=5" \
  | python3 -m json.tool | head -40
```

回應中的 `measurement_uid` 可以換取完整內容：

```bash title="取得單筆完整測量資料"
curl -s "https://api.ooni.io/api/v1/raw_measurement?measurement_uid=<measurement_uid>" \
  | python3 -m json.tool | head -60
```

原始回應是未斷行的長字串，上面兩段接 `python3 -m json.tool` 排版後才易於閱讀。查詢參數加上 `anomaly=true` 可篩出判定異常的測量，適合用於尋找對照範例。改寫 `probe_cc` 與 `probe_asn` 即可查詢指定地區與網路的觀測紀錄。

批次處理大量資料時，AWS S3 公開資料集的效率較高，作法見 [ASN 觀測資料擷取與分析](./asn-coverage-howto.md)。

## 外殼記錄誰在哪裡測的

外殼層的欄位在所有測項中一致，其中常用者如下：

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

`probe_asn` 與 `resolver_asn` 可能分屬不同網路，上表即為實例。兩筆測量都在中華電信的網路上執行，其中一筆的使用者將 DNS 指向 Cloudflare。ASN 分析須將兩者分開計算，混用會使「特定電信商網路上的觀測結果」失準。

!!! note "`probe_ip` 永遠是 `127.0.0.1`"

    OONI 刻意不收集測量者的真實 IP，`probe_ip` 固定寫入本機位址。回溯測量來源只能仰賴 `probe_asn` 與時間，[OONI Run v2 操作說明](../tools/ooni-run-v2.md) 針對同一條隱私邊界另有提醒。

## 判定是測量得出的結論

判定欄位全部收在 `test_keys` 底下，其計算基礎是雙邊對照。Probe 測完之後，OONI 架設在外部網路的測量伺服器（test helper）會對同一個網址再測一次，兩邊結果的差異即為判定依據。test helper 那一側的紀錄收在 `test_keys.control`，下表的「對照組」即指該側紀錄。

判定結果與內容比對共八個欄位，兩筆並排如下：

| 欄位 | 正常通過 | 判定異常 | 說明 |
|---|---|---|---|
| `blocking` | `false` | `"dns"` | 判定的干預類型，可能值為 `dns`、`tcp_ip`、`http-failure`、`http-diff`，未觀測到干預時為布林值 `false` |
| `accessible` | `true` | `false` | 是否取得了合理的回應 |
| `dns_consistency` | `"consistent"` | `"inconsistent"` | Probe 的 DNS 結果與對照組是否一致 |
| `title_match` | `true` | `null` | 網頁標題是否與對照組相符 |
| `headers_match` | `true` | `null` | 回應標頭是否相符 |
| `status_code_match` | `true` | `null` | HTTP 狀態碼是否相符 |
| `body_length_match` | `true` | `null` | 回應內容長度是否相近 |
| `body_proportion` | `1` | `0` | 內容長度與對照組的比值 |

各階段的失敗原因另有三個欄位，須與上表一併判讀：

| 欄位 | 記錄什麼 |
|---|---|
| `dns_experiment_failure` | DNS 階段的失敗原因，判定異常那筆為 `"dns_nxdomain_error"` |
| `http_experiment_failure` | HTTP 階段的失敗原因，例如 `"generic_timeout_error"` |
| `control_failure` | 對照組本身是否失敗。有值時雙邊比對的前提不成立，判定結果不可信 |

`blocking` 的四種值分別對應不同階段的異常：`dns` 是解析結果與對照組不一致、`tcp_ip` 是封包送不到目標位址、`http-failure` 是連線建立後 HTTP 階段失敗、`http-diff` 是取得的內容與對照組不同（常見於封鎖告示頁）。四種干預手法的概念說明見 [什麼是 OONI](../tools/what-is-ooni.md)。

!!! tip "兩個容易誤判的型別問題"

    `blocking` 未觀測到干預時是布林值 `false`，有干預時是字串。統計前需先統一型別，否則 `false` 與 `"dns"` 會被歸為兩類。

    四種值的命名本身不一致，`tcp_ip` 用底線，`http-failure` 與 `http-diff` 用連字號。上游即如此定義，引用時照原樣寫入，不應自行統一。

四個 `*_match` 欄位在異常那筆全為 `null`，原因是 DNS 階段即失敗，連線未建立，後續無可比對的內容。遇到整排 `null`，應回溯測量流程中第一個有值的 failure 欄位，該處才是問題發生的階段。

!!! warning "異常不等於封鎖"

    `blocking` 有值僅代表該筆測量的結果與對照組不一致，確認是否存在網路干預需要更多佐證。以判定異常那筆為例，Probe 對 `ntc.party` 的 A 與 AAAA 查詢都回報 `dns_nxdomain_error`（網域不存在），但撰稿時以多個公開 DNS 解析器查詢，該網域可解析到 IPv6 位址。單筆測量無法區分網路干預、解析器的暫時狀態與網域自身的設定變動。

    認定封鎖需以跨時間、跨 ASN、跨解析器的多筆測量交叉比對。判定機制的完整拆解與常見誤判來源見 [OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)，資料集層級的品質控制見 [OONI 如何分辨壞掉的量測資料](../blog/posts/2026-ooni-faulty-measurements.md)。

## 證據是支撐結論的原始紀錄

`test_keys` 底下另有數個欄位，記錄測量過程中的每一次網路操作，各對應一份規格：

| 欄位 | 內容 | 規格 |
|---|---|---|
| `queries` | 每一次 DNS 查詢的問題、回應與失敗原因 | [df-002-dnst](https://github.com/ooni/spec/blob/master/data-formats/df-002-dnst.md){target="_blank"} |
| `tcp_connect` | 每一次 TCP 連線嘗試的目標與結果 | [df-005-tcpconnect](https://github.com/ooni/spec/blob/master/data-formats/df-005-tcpconnect.md){target="_blank"} |
| `tls_handshakes` | 每一次 TLS 握手的參數、憑證與結果 | [df-006-tlshandshake](https://github.com/ooni/spec/blob/master/data-formats/df-006-tlshandshake.md){target="_blank"} |
| `requests` | 每一次 HTTP 請求與回應的完整內容 | [df-001-httpt](https://github.com/ooni/spec/blob/master/data-formats/df-001-httpt.md){target="_blank"} |
| `network_events` | 連線過程的時序事件，用於分析延遲與中斷點 | [df-008-netevents](https://github.com/ooni/spec/blob/master/data-formats/df-008-netevents.md){target="_blank"} |
| `control` | 對照組的同類紀錄，結構與 Probe 側對應，判定欄位全部由它與 Probe 端的差異算出 | [ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} |
| 各欄位的 `failure` 字串 | 所有失敗原因的統一命名，例如 `dns_nxdomain_error`、`generic_timeout_error`、`ssl_unknown_authority` | [df-007-errors](https://github.com/ooni/spec/blob/master/data-formats/df-007-errors.md){target="_blank"} |

兩筆的 `queries` 對照如下：

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

判定層的 `dns_consistency` 是結論，`queries` 與 `control` 是其依據。判定是否合理，查驗證據層即可確認。

## 版本與相容性

對照 spec 前需先確認版本：

- **`data_format_version` 目前是 `0.2.0`**。外殼層的欄位定義穩定，[df-000-base](https://github.com/ooni/spec/blob/master/data-formats/df-000-base.md){target="_blank"} 可以直接對照。
- **`web_connectivity` 實際流通的 `test_version` 是 `0.4.3`**。[ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} 的規格內容已更新為描述 v0.5 演算法，但生產環境仍以 v0.4 為主。spec 明訂新版演算法必須使用不同的 test_keys 欄位，v0.4 的欄位定義保持相容，因此上表的欄位讀法對兩個版本都適用。
- **`x_` 開頭的欄位不在 spec 內**。實際資料中會看到 `x_dns_runtime`、`x_status`、`x_th_runtime` 等欄位，屬於實作端的實驗性擴充，隨版本增減，分析程式不應依賴它們。

上游 spec 的 master 分支自 2025-06 起沒有新的合併，但 issue 與 PR 討論持續進行（進行中的提案包含 ICMP 資料格式與 DPI 分片測項）。spec 現階段可作為穩定參考。引用時應連回上游原文，避免複製規格內容後因上游更新而失準。

## 延伸閱讀

判定欄位的計算方式，以及有值為何不等於封鎖，見以下各篇。

<div class="grid cards" markdown>

- [:material-shield-search: OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)
- [:material-table-search: OONI 測項速查表](./ooni-nettests-map.md)
- [:material-access-point-network: 什麼是 OONI](../tools/what-is-ooni.md)
- [:material-database-search: ASN 觀測資料擷取與分析](./asn-coverage-howto.md)
- [:material-access-point-network: ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 網站檢測清單](../taiwan/ooni-checklist.md)

</div>

上游規格的完整目錄在 [ooni/spec](https://github.com/ooni/spec){target="_blank"}，其中 [data-formats](https://github.com/ooni/spec/tree/master/data-formats){target="_blank"} 收錄資料格式、[nettests](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} 收錄各測項的演算法定義。
