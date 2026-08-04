---
title: ASN 觀測資料擷取與分析
description: anoni-net/docs 提供的 OONI 資料擷取程式如何設定與使用，包含 S3 公開資料集的路徑結構、三種取用路徑的取捨，以及程式輸出的 CSV 欄位格式。
icon: material/database-search
---

# :material-database-search: ASN 觀測資料擷取與分析

本頁是 [在地脈絡 → ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md) 的技術延伸：當你想自己實際操作抓 OONI 公開資料、計算特定區域 ASN 的觀測覆蓋率時，以下介紹 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 提供的擷取程式如何設定與使用。

開始前建議先讀 [專案研究預先準備](./setup-repo.md) 把開發環境建好。

!!! tip "執行位置"

    下面的指令都在 `anoni-net-docs/asn_coverage/` 目錄下執行。第一次使用先 `cd` 進該目錄、執行 `uv sync` 裝好依賴，接著用 `uv run python ooni.py ...`（或先 `source .venv/bin/activate` 再依下方範例執行）。

## 三種取用路徑

OONI 的觀測資料有三個入口，用途差很多，先選對再動手：

| 入口 | 適合的情境 | 限制 |
|---|---|---|
| [AWS S3 公開資料集](https://registry.opendata.aws/ooni/){target="_blank"} | 批次分析、全量統計、跨時間比對 | 需自行解析，下載量以 GB 計 |
| [OONI API](https://api.ooni.io/api/v1/measurements){target="_blank"} | 依條件篩選、取單筆完整測量 | 單次回傳筆數有上限 |
| [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} | 人工查閱、確認個別測量 | 不適合程式化取用 |

`asn_coverage` 走的是 S3 路徑，目的是統計覆蓋率而非查單筆。想查單筆或做小量篩選，[OONI 測量資料結構導覽](./ooni-data-format.md) 有 API 的用法。

## S3 資料集的擺放方式

Bucket 名稱是 `ooni-data-eu-fra`，位於 `eu-central-1`，公開讀取不需認證憑證。路徑依「日期、小時、國碼、測項」四層分下去：

```text title="路徑結構"
raw/{YYYYMMDD}/{HH}/{國碼}/{測項}/{YYYYMMDDHH}_{國碼}_{測項}.n{編號}.{序號}.jsonl.gz
```

不裝任何工具也能先看一眼裡面有什麼：

```bash title="列出台灣某小時的所有測項"
curl -s "https://ooni-data-eu-fra.s3.eu-central-1.amazonaws.com/?list-type=2&prefix=raw/20260804/00/TW/&delimiter=/"
```

台灣在單一小時內通常會有十幾個測項目錄，`webconnectivity` 只是其中之一，同層還有 `tor`、`telegram`、`signal`、`whatsapp`、`dnscheck`、`echcheck`、`openvpn`、`psiphon`、`ndt`、`dash` 等。

每個測項目錄底下同一批資料有兩種封裝，`.jsonl.gz` 與 `.tar.gz`。`.jsonl.gz` 解開後一行一筆測量，適合逐行解析，程式取的是它。單一檔案的量體以 2026-08-04 台灣的 `webconnectivity` 為例約 10 MB，換算成整月全國資料會相當可觀，實際跑之前先估好磁碟與頻寬。

每一行的欄位怎麼讀，見 [OONI 測量資料結構導覽](./ooni-data-format.md)。判定欄位代表什麼，見 [OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)。

## 擷取與分析指令

### 回看觀察資料

```bash title="回看觀察資料"
python3 ./ooni.py lookback [--units=36] [--loc=TW] [--frame=hours]
```

區間單位為小時，預設為 36 個單位（36 小時），區域為台灣（`TW`）。執行後會依單位儲存以下格式的檔案：

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

### 取得區間資料

```bash title="取得區間資料"
python3 ./ooni.py span --start=YYYY/MM/DD --end=YYYY/MM/DD [--loc=TW] [--chunk=40]
```

帶入開始時間（`start`）與結束時間（`end`），取得台灣該期間各小時區間的資料。`--chunk` 控制同時處理幾個小時，預設 `40`，網路或記憶體吃緊時調小。

### 轉換為試算表資料

```bash title="轉換為試算表資料"
python3 ./ooni.py sheetrow --path={資料路徑}
```

將已擷取的資料展開，方便在試算表中計算，會另存一份開頭為 `rows_` 的資料檔案。

### 計算 ASN 統計

建議使用「取得區間資料」加「轉換為試算表資料」後，可以統計各 ASN 出現的次數與不重複統計計算。再取得目前台灣所有的 ASN 資料：

```bash title="計算統計 ASNs"
python3 ./ripe.py save --loc=TW
```

即可計算占比等統計資料。

## 輸出的 CSV 長什麼樣

`lookback` 與 `span` 產出的檔案有四個欄位，一列代表一個小時：

| 欄位 | 內容 |
|---|---|
| `loc` | 國碼，例如 `TW` |
| `date` | 日期，格式 `YYYY/MM/DD` |
| `hour` | 小時，格式 `HH` |
| `statistics` | 該小時的統計結果，內容是一段 JSON |

`statistics` 內含兩份計數，`counts` 依 ASN 統計測量筆數，`network_type` 依連線類型統計。以 2026-08-04 台灣 `00` 時的實際資料為例，該小時共 551 筆測量：

```json title="statistics 欄位展開"
{"counts": {"AS3462": 300, "AS17716": 100, "AS18419": 100, "AS24158": 51},
 "network_type": {"mobile": 44, "no_internet": 7}}
```

兩份計數的總和對不起來屬於正常現象。`network_type` 由 Probe 自行標記，該小時只有 51 筆帶了標記，程式會跳過沒有標記的測量。

巢狀 JSON 不好在試算表裡計算，`sheetrow` 的作用就是把它攤平成一列一個 ASN：

| `loc` | `date` | `hour` | `asn` | `count` |
|---|---|---|---|---|
| `TW` | `2026/08/04` | `00` | `AS3462` | `300` |
| `TW` | `2026/08/04` | `00` | `AS17716` | `100` |

攤平後即可用樞紐分析計算各 ASN 占比、不重複 ASN 數量，再與 `ripe.py` 取得的全量 ASN 清單比對，算出覆蓋率。

## 程式目前的取用範圍

`ooni.py` 現階段只做覆蓋率統計，取用範圍有三個邊界值得知道：

- **只讀 `webconnectivity` 目錄**。同一小時底下其他十幾個測項沒有納入，`tor`、`telegram`、`signal` 等測項的觀測不會出現在統計裡。各測項分別測什麼見 [OONI 測項速查表](./ooni-nettests-map.md)。
- **每筆測量只取兩個欄位**，`probe_asn` 與 `annotations.network_type`。判定結果所在的 `test_keys` 完全沒有讀取，因此輸出能回答「哪些 ASN 有人在測、測了幾次」，無法回答「測量看到了什麼」。
- **只取 `.jsonl.gz`**，同目錄的 `.tar.gz` 會跳過。

想擴充的話，最小的一步是在逐行解析時多取 `test_keys.blocking`，統計就能從「測量筆數」延伸到「各 ASN 的異常分布」。要注意 `blocking` 有值不等於封鎖，判讀前提見 [OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)。

## 範例試算表

實際分析輸出的試算表範例（2023-09 至 2023-12）：

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }

## 下一步

<div class="grid cards" markdown>

- [:material-code-json: OONI 測量資料結構導覽](./ooni-data-format.md)
- [:material-shield-search: OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)
- [:material-table-search: OONI 測項速查表](./ooni-nettests-map.md)
- [:material-access-point-network: ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:octicons-mark-github-24: 專案研究預先準備](./setup-repo.md)
- [:material-hand-heart: 如何參與與認領主題](./how-to-contribute.md)

</div>
