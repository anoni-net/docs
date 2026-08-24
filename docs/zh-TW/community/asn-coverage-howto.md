---
title: ASN 觀測資料擷取與分析
description: anoni-net/docs 提供的 OONI 資料擷取程式如何設定與使用，包含 S3 公開資料集的路徑結構、三種取用路徑的取捨、程式輸出的 CSV 欄位格式，以及覆蓋率的計算方式。
icon: material/database-search
---

# :material-database-search: ASN 觀測資料擷取與分析

本頁是 [ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md) 的技術延伸，說明 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 提供的擷取程式如何設定與使用，用於擷取 OONI 公開資料並計算特定區域 ASN 的觀測覆蓋率。

開始前建議先讀 [專案研究預先準備](./setup-repo.md) 建置開發環境。

!!! tip "執行位置"

    以下指令均在 `anoni-net-docs/asn_coverage/` 目錄下執行。初次使用先 `cd` 進該目錄，執行 `uv sync` 安裝依賴，再依下方範例以 `uv run python ooni.py ...` 執行。

## 三種取用路徑

OONI 的觀測資料有三個入口，用途差異很大，著手前需先選定：

| 入口 | 適合的情境 | 限制 |
|---|---|---|
| [AWS S3 公開資料集](https://registry.opendata.aws/ooni/){target="_blank"} | 批次分析、全量統計、跨時間比對 | 需自行解析，下載量以 GB 計 |
| [OONI API](https://api.ooni.org/api/v1/measurements){target="_blank"} | 依條件篩選、取單筆完整測量 | 單次回傳筆數有上限 |
| [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} | 人工查閱、確認個別測量 | 不適合程式化取用 |

`asn_coverage` 採用 S3 路徑，目的是統計覆蓋率而非查詢單筆。單筆查詢與小量篩選的 API 用法見 [OONI 測量資料結構導覽](./ooni-data-format.md)。

## 程式能回答什麼

`ooni.py` 現階段做覆蓋率與判定分布統計，取用範圍有三個限制：

- **只讀 `webconnectivity` 目錄**。同一小時底下其他十幾個測項未納入，`tor`、`telegram`、`signal` 等測項的觀測不會出現在統計中。各測項的量測對象見 [OONI 測項速查表](./ooni-nettests-map.md)。
- **每筆測量只取三個欄位**，`probe_asn`、`annotations.network_type` 與 `test_keys.blocking`。證據層的 `queries`、`tcp_connect`、`requests` 未讀取，因此輸出可回答「哪些 ASN 有人在測、測了幾次、判定結果的分布」，無法回答「單筆測量的證據內容」。
- **只取 `.jsonl.gz`**，同目錄的 `.tar.gz` 會跳過。

`blocking` 未觀測到干預時是布林值 `false`、有干預時是字串，程式在計數前已統一為同一組鍵，沒有判定結果的測量記為 `none`，因此每個 ASN 的判定分布加總必然等於測量筆數。判讀前提見 [OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)。

再往下一層須取證據層的欄位逐筆比對，該作法需要另行設計儲存方式，單純的計數統計無法容納。

## S3 資料集的擺放方式

Bucket 名稱是 `ooni-data-eu-fra`，位於 `eu-central-1`，公開讀取不需認證憑證。路徑依「日期、小時、國碼、測項」分成四層：

```text title="路徑結構"
raw/{YYYYMMDD}/{HH}/{國碼}/{測項}/{YYYYMMDDHH}_{國碼}_{測項}.n{編號}.{序號}.jsonl.gz
```

!!! warning "日期與小時都是 UTC"

    路徑中的 `{YYYYMMDD}` 與 `{HH}`，以及後續 CSV 輸出的 `date` 與 `hour` 欄位，全部使用 UTC。程式內部一律以 `arrow.Arrow.utcnow()` 取時間。分析「台灣某個時段的觀測分布」時須加 8 小時換算，否則圖表會整體偏移。

檔名尾端的 `.n{編號}.{序號}` 是 OONI 內部的批次編號，解析時可忽略。

確認目錄內容不需安裝任何工具：

```bash title="列出台灣某小時的所有測項"
curl -s "https://ooni-data-eu-fra.s3.eu-central-1.amazonaws.com/?list-type=2&prefix=raw/20260804/00/TW/&delimiter=/" \
  | grep -oE '<Prefix>raw/[^<]+</Prefix>'
```

回應是未斷行的 XML，上例接 `grep` 只取出目錄名稱。台灣在單一小時內通常有十幾個測項目錄，`webconnectivity` 僅為其中之一，同層還有 `tor`、`telegram`、`signal`、`whatsapp`、`dnscheck`、`echcheck`、`openvpn`、`psiphon`、`ndt`、`dash` 等。

每個測項目錄底下同一批資料有兩種封裝，`.jsonl.gz` 與 `.tar.gz`。`.jsonl.gz` 解開後一行一筆測量，適合逐行解析，程式取用的即為 `.jsonl.gz`。以 2026-08-04 台灣的 `webconnectivity` 為例，單一檔案約 10 MB，換算成整月全國資料相當可觀，執行前應先估算頻寬與執行時間。程式採串流處理，原始檔不會落地保存，最終只輸出 CSV。

各欄位的判讀方式見 [OONI 測量資料結構導覽](./ooni-data-format.md)，判定欄位的含義見 [OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)。

## 擷取與分析指令

### 回看觀察資料

```bash title="回看最近 36 小時"
uv run python ooni.py lookback --units=36 --loc=TW --frame=hours
```

三個參數均可省略，預設值即為上例。`--frame` 決定回溯總長度的單位，可填 `hours`、`days`、`weeks` 等，無論何者，資料一律按小時切分。輸出檔名格式：

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

檔名中的 `{YYYYMMDD}` 是執行當日的 UTC 日期，並非資料涵蓋的區間，實際範圍須查看檔案內容。檔案寫入當前的工作目錄。

### 取得區間資料

```bash title="取得指定區間"
uv run python ooni.py span --start=2026/08/01 --end=2026/08/03 --loc=TW --chunk=40
```

帶入開始時間（`start`）與結束時間（`end`），取得該期間各小時區間的資料。`--chunk` 控制同時處理的小時數，預設 `40`，網路或記憶體不足時應調小。輸出檔名格式：

- `span_{loc}_{開始YYYYMMDD}_{結束YYYYMMDD}.csv`

### 轉換為試算表資料

```bash title="展開為試算表格式"
uv run python ooni.py sheetrow --path=./span_TW_20260801_20260803.csv
```

將已擷取的資料展開，便於在試算表中計算。輸出檔名為原檔名前加上 `rows_`，上例即 `rows_span_TW_20260801_20260803.csv`。

## 輸出的 CSV 欄位格式

`lookback` 與 `span` 產出的檔案有四個欄位，一列代表一個小時：

| 欄位 | 內容 |
|---|---|
| `loc` | 國碼，例如 `TW` |
| `date` | 日期，格式 `YYYY/MM/DD`，UTC |
| `hour` | 小時，格式 `HH`，UTC |
| `statistics` | 該小時的統計結果，內容是一段 JSON |

`statistics` 內含三份計數，`counts` 依 ASN 統計測量筆數，`network_type` 依連線類型統計，`blocking` 依 ASN 統計判定結果的分布。以 2026-08-04 台灣 `00` 時的實際資料為例，該小時共 551 筆測量：

```json title="statistics 欄位展開"
{"counts": {"AS3462": 300, "AS17716": 100, "AS18419": 100, "AS24158": 51},
 "network_type": {"mobile": 44, "no_internet": 7},
 "blocking": {"AS3462": {"false": 294, "dns": 1, "tcp_ip": 1, "none": 4},
              "AS17716": {"false": 94, "none": 6},
              "AS18419": {"false": 99, "none": 1},
              "AS24158": {"false": 51}}}
```

`counts` 與 `blocking` 的加總逐 ASN 相等，`network_type` 則不會對上。`network_type` 由 Probe 自行標記，行動版 App 通常會寫入，CLI 與桌面版多半不會，上例 551 筆中僅 51 筆帶標記，程式會跳過未標記的測量。其中 `no_internet` 代表 Probe 在測量當下判定自身沒有連線。標記涵蓋率不到一成，適合觀察趨勢，不適合作為行動與固網的比例依據。

`blocking` 中的 `none` 代表該筆沒有判定結果，缺 `test_keys` 或 `blocking` 為 `null` 均計入此類。上例 551 筆中有 11 筆屬之，佔比不高但每個 ASN 都出現，計算異常率前須決定是否納入分母。

巢狀 JSON 不易在試算表中計算，`sheetrow` 的作用即是將其攤平為一列一個 ASN：

| `loc` | `date` | `hour` | `asn` | `count` | `anomaly` | `blocking_false` | `blocking_dns` | `blocking_tcp_ip` |
|---|---|---|---|---|---|---|---|---|
| `TW` | `2026/08/04` | `00` | `AS3462` | `300` | `2` | `294` | `1` | `1` |
| `TW` | `2026/08/04` | `00` | `AS17716` | `100` | `0` | `94` | `0` | `0` |

完整欄位還有 `blocking_http_failure`、`blocking_http_diff`、`blocking_none` 與 `blocking_other`，上表受限於版面僅列前幾欄。`anomaly` 是四種干預類型的加總，可直接在試算表中作為分子。`blocking_other` 收 ts-017 尚未定義的值，正常情況下應為 `0`，出現非零即代表上游新增了判定類型。

實際分析輸出的試算表範例（2023-09 至 2023-12）：

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }

## 計算 ASN 覆蓋率

覆蓋率需要兩份數字，觀測資料中出現過的不重複 ASN 數，以及該區域登記在案的 ASN 總數。前者由上一節攤平後的 CSV 以樞紐分析取得，後者以 `ripe.py` 向 RIPE NCC 索取：

```bash title="取得該區域的全量 ASN 清單"
uv run python ripe.py save --loc=TW
```

輸出檔名為 `asns_{YYYYMMDDTHH}.csv`，六個欄位分別是 `no`、`location`、`org_id`、`registrar`、`reserved`、`name`。

!!! warning "兩邊的 ASN 格式不同，比對前須先統一"

    `ripe.py` 輸出的 `no` 欄位是純數字（`3462`），OONI 資料的 `probe_asn` 帶 `AS` 前綴（`AS3462`）。逕以 VLOOKUP 比對會全部落空，須先為其中一邊補上或去除 `AS`。

兩份數字備齊後即可計算：

```text title="覆蓋率算式"
覆蓋率 = 觀測資料中出現的不重複 ASN 數 ÷ 該區域登記的 ASN 總數
```

以 [ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md) 引用的 2023-12 報告為例，台灣當時約有 437 組 ASN，觀測資料涵蓋的不重複 ASN 佔 7.32%。同一算式可用於重算近期區間，對照覆蓋率是否改善。

## 下一步

取得資料之後，接續判讀各欄位的內容。

<div class="grid cards" markdown>

- [:material-code-json: OONI 測量資料結構導覽](./ooni-data-format.md)
- [:material-shield-search: OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)
- [:material-table-search: OONI 測項速查表](./ooni-nettests-map.md)
- [:material-access-point-network: ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:octicons-mark-github-24: 專案研究預先準備](./setup-repo.md)
- [:material-hand-heart: 如何參與與認領主題](./how-to-contribute.md)

</div>
