---
title: ASN 觀測資料擷取與分析
description: anoni-net/docs 提供的 OONI 資料擷取程式如何設定與使用，包含 S3 公開資料集的路徑結構、三種取用路徑的取捨、程式輸出的 CSV 欄位格式，以及覆蓋率的計算方式。
icon: material/database-search
---

# :material-database-search: ASN 觀測資料擷取與分析

本頁是 [ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md) 的技術延伸：當你想自己擷取 OONI 公開資料、計算特定區域 ASN 的觀測覆蓋率時，以下介紹 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 提供的擷取程式如何設定與使用。

開始前建議先讀 [專案研究預先準備](./setup-repo.md) 把開發環境建好。

!!! tip "執行位置"

    下面的指令都在 `anoni-net-docs/asn_coverage/` 目錄下執行。第一次使用先 `cd` 進該目錄，執行 `uv sync` 安裝依賴，接著依下方範例以 `uv run python ooni.py ...` 執行。

## 三種取用路徑

OONI 的觀測資料有三個入口，用途差異很大，先選對再著手：

| 入口 | 適合的情境 | 限制 |
|---|---|---|
| [AWS S3 公開資料集](https://registry.opendata.aws/ooni/){target="_blank"} | 批次分析、全量統計、跨時間比對 | 需自行解析，下載量以 GB 計 |
| [OONI API](https://api.ooni.io/api/v1/measurements){target="_blank"} | 依條件篩選、取單筆完整測量 | 單次回傳筆數有上限 |
| [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} | 人工查閱、確認個別測量 | 不適合程式化取用 |

`asn_coverage` 採用 S3 路徑，目的是統計覆蓋率而非查單筆。想查單筆或做小量篩選，[OONI 測量資料結構導覽](./ooni-data-format.md) 有 API 的用法。

## 程式能回答什麼

著手之前先確認工具的邊界，`ooni.py` 現階段只做覆蓋率統計，取用範圍有三個限制：

- **只讀 `webconnectivity` 目錄**。同一小時底下其他十幾個測項沒有納入，`tor`、`telegram`、`signal` 等測項的觀測不會出現在統計裡。各測項分別測什麼見 [OONI 測項速查表](./ooni-nettests-map.md)。
- **每筆測量只取兩個欄位**，`probe_asn` 與 `annotations.network_type`。判定結果所在的 `test_keys` 沒有讀取，因此輸出能回答「哪些 ASN 有人在測、測了幾次」，無法回答「測量看到了什麼」。
- **只取 `.jsonl.gz`**，同目錄的 `.tar.gz` 會跳過。

若要擴充，最小的一步是在逐行解析時多取 `test_keys.blocking`，統計就能從「測量筆數」延伸到「各 ASN 的異常分布」。`blocking` 未觀測到干預時是布林值 `false`、有干預時是字串，統計前要先統一型別。判讀前提見 [OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)。

## S3 資料集的擺放方式

Bucket 名稱是 `ooni-data-eu-fra`，位於 `eu-central-1`，公開讀取不需認證憑證。路徑依「日期、小時、國碼、測項」分成四層：

```text title="路徑結構"
raw/{YYYYMMDD}/{HH}/{國碼}/{測項}/{YYYYMMDDHH}_{國碼}_{測項}.n{編號}.{序號}.jsonl.gz
```

!!! warning "日期與小時都是 UTC"

    路徑中的 `{YYYYMMDD}` 與 `{HH}`、以及後面 CSV 輸出的 `date` 與 `hour` 欄位，全部使用 UTC。程式內部一律以 `arrow.Arrow.utcnow()` 取時間。要分析「台灣某個時段的觀測分布」時記得加 8 小時換算，否則圖表會整體偏移。

檔名尾端的 `.n{編號}.{序號}` 是 OONI 內部的批次編號，解析時可以忽略。

不必安裝任何工具，也能先確認裡面有什麼：

```bash title="列出台灣某小時的所有測項"
curl -s "https://ooni-data-eu-fra.s3.eu-central-1.amazonaws.com/?list-type=2&prefix=raw/20260804/00/TW/&delimiter=/" \
  | grep -oE '<Prefix>raw/[^<]+</Prefix>'
```

回應是未斷行的 XML，上面接了 `grep` 只取出目錄名稱。台灣在單一小時內通常會有十幾個測項目錄，`webconnectivity` 只是其中之一，同層還有 `tor`、`telegram`、`signal`、`whatsapp`、`dnscheck`、`echcheck`、`openvpn`、`psiphon`、`ndt`、`dash` 等。

每個測項目錄底下同一批資料有兩種封裝，`.jsonl.gz` 與 `.tar.gz`。`.jsonl.gz` 解開後一行一筆測量，適合逐行解析，程式取用的正是 `.jsonl.gz`。以 2026-08-04 台灣的 `webconnectivity` 為例，單一檔案約 10 MB，換算成整月全國資料會相當可觀，實際執行前先估算頻寬與執行時間。程式採串流處理，原始檔不會落地保存，最後只輸出 CSV。

每一行的欄位怎麼讀，見 [OONI 測量資料結構導覽](./ooni-data-format.md)。判定欄位代表什麼，見 [OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)。

## 擷取與分析指令

### 回看觀察資料

```bash title="回看最近 36 小時"
uv run python ooni.py lookback --units=36 --loc=TW --frame=hours
```

三個參數都可省略，預設值即為上例。`--frame` 決定回溯總長度的單位，可填 `hours`、`days`、`weeks` 等，無論填什麼，資料一律按小時切分。輸出檔名格式：

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

檔名中的 `{YYYYMMDD}` 是執行當日的 UTC 日期，並非資料涵蓋的區間，資料範圍要看檔案內容。檔案寫在目前的工作目錄。

### 取得區間資料

```bash title="取得指定區間"
uv run python ooni.py span --start=2026/08/01 --end=2026/08/03 --loc=TW --chunk=40
```

帶入開始時間（`start`）與結束時間（`end`），取得該期間各小時區間的資料。`--chunk` 控制同時處理的小時數，預設 `40`，網路或記憶體不足時調小。輸出檔名格式：

- `span_{loc}_{開始YYYYMMDD}_{結束YYYYMMDD}.csv`

### 轉換為試算表資料

```bash title="展開為試算表格式"
uv run python ooni.py sheetrow --path=./span_TW_20260801_20260803.csv
```

將已擷取的資料展開，方便在試算表中計算。輸出檔名是原檔名前面加上 `rows_`，以上例而言是 `rows_span_TW_20260801_20260803.csv`。

## 輸出的 CSV 欄位格式

`lookback` 與 `span` 產出的檔案有四個欄位，一列代表一個小時：

| 欄位 | 內容 |
|---|---|
| `loc` | 國碼，例如 `TW` |
| `date` | 日期，格式 `YYYY/MM/DD`，UTC |
| `hour` | 小時，格式 `HH`，UTC |
| `statistics` | 該小時的統計結果，內容是一段 JSON |

`statistics` 內含兩份計數，`counts` 依 ASN 統計測量筆數，`network_type` 依連線類型統計。以 2026-08-04 台灣 `00` 時的實際資料為例，該小時共 551 筆測量：

```json title="statistics 欄位展開"
{"counts": {"AS3462": 300, "AS17716": 100, "AS18419": 100, "AS24158": 51},
 "network_type": {"mobile": 44, "no_internet": 7}}
```

兩份計數的總和不一致屬於正常現象。`network_type` 由 Probe 自行標記，行動版 App 通常會寫入，CLI 與桌面版多半不會，上例 551 筆中只有 51 筆帶標記，程式會跳過沒有標記的測量。其中 `no_internet` 代表 Probe 在測量當下判定自身沒有連線。標記涵蓋率不到一成，適合看趨勢，不適合當作行動與固網的比例依據。

巢狀 JSON 不易在試算表裡計算，`sheetrow` 的作用就是把它攤平成一列一個 ASN：

| `loc` | `date` | `hour` | `asn` | `count` |
|---|---|---|---|---|
| `TW` | `2026/08/04` | `00` | `AS3462` | `300` |
| `TW` | `2026/08/04` | `00` | `AS17716` | `100` |

實際分析輸出的試算表範例（2023-09 至 2023-12）：

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }

## 計算 ASN 覆蓋率

覆蓋率需要兩份數字，觀測資料中出現過的不重複 ASN 數，以及該區域登記在案的 ASN 總數。前者從上一節攤平後的 CSV 用樞紐分析取得，後者用 `ripe.py` 向 RIPE NCC 索取：

```bash title="取得該區域的全量 ASN 清單"
uv run python ripe.py save --loc=TW
```

輸出檔名為 `asns_{YYYYMMDDTHH}.csv`，六個欄位分別是 `no`、`location`、`org_id`、`registrar`、`reserved`、`name`。

!!! warning "兩邊的 ASN 格式不同，比對前要先統一"

    `ripe.py` 輸出的 `no` 欄位是純數字（`3462`），OONI 資料的 `probe_asn` 帶 `AS` 前綴（`AS3462`）。直接用 VLOOKUP 比對會全部落空，比對前要先替其中一邊補上或去掉 `AS`。

兩份數字備齊後即可計算：

```text title="覆蓋率算式"
覆蓋率 = 觀測資料中出現的不重複 ASN 數 ÷ 該區域登記的 ASN 總數
```

以 [ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md) 引用的 2023-12 報告為例，台灣當時約有 437 組 ASN，觀測資料涵蓋的不重複 ASN 佔 7.32%。你可以用同樣的算式重算近期區間，對照覆蓋率是否改善。

## 下一步

抓到資料之後，接著看每一行的欄位怎麼讀。

<div class="grid cards" markdown>

- [:material-code-json: OONI 測量資料結構導覽](./ooni-data-format.md)
- [:material-shield-search: OONI 怎麼判定一個網站被封鎖](./ooni-blocking-determination.md)
- [:material-table-search: OONI 測項速查表](./ooni-nettests-map.md)
- [:material-access-point-network: ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:octicons-mark-github-24: 專案研究預先準備](./setup-repo.md)
- [:material-hand-heart: 如何參與與認領主題](./how-to-contribute.md)

</div>
