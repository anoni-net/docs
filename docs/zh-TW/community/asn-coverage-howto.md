---
title: ASN 觀測資料擷取與分析
description: anoni-net/docs 提供的 OONI 資料擷取程式怎麼設定與使用，是 ASN 觀測分析的延伸操作指南。
icon: material/database-search
---

# :material-database-search: ASN 觀測資料擷取與分析

這頁是 [在地脈絡 → ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md) 的技術延伸：當你想自己動手抓 OONI 公開資料、計算特定區域 ASN 的觀測覆蓋率時，這篇介紹 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 提供的擷取程式怎麼設定與使用。

開始前建議先讀 [專案研究預先準備](./setup-repo.md) 把開發環境建好。

## 資料來源

OONI Probe 的觀測資料會回傳到 OONI 的 [AWS S3 Open Data](https://registry.opendata.aws/ooni/){target="_blank"} 中儲存。你可以：

- 直接讀 [OONI Docs](https://docs.ooni.org/data){target="_blank"} 介紹的擷取方式
- 或透過 [anoni-net/docs 的 asn_coverage 程式](https://github.com/anoni-net/docs/tree/main/asn_coverage){target="_blank"} 來操作

資料欄位結構參考 [ooni/spec](https://github.com/ooni/spec){target="_blank"}。

## 擷取與分析指令

### 回看觀察資料

```bash title="回看觀察資料"
python3 ./ooni.py lookback [--unit=36] [--loc=TW] [--frame=hours]
```

區間單位為小時，預設為 36 個單位（36 小時），區域為台灣（`TW`）。執行後會依單位儲存以下格式的檔案：

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

### 取得區間資料

```bash title="取得區間資料"
python3 ./ooni.py span --start=YYYY/MM/DD --end=YYYY/MM/DD [--loc=TW]
```

帶入開始時間（`start`）與結束時間（`end`），取得台灣這期間各小時區間的資料。

### 轉換為試算表資料

```bash title="轉換為試算表資料"
python3 ./ooni.py sheetrow --path={資料路徑}
```

將已擷取的資料展開後、方便在試算表中進行計算使用，將另存一份開頭為 `rows_` 的資料檔案。

### 計算 ASN 統計

建議使用「取得區間資料」加「轉換為試算表資料」後，可以統計各 ASN 出現的次數與不重複統計計算。再取得目前台灣所有的 ASN 資料：

```bash title="計算統計 ASNs"
python3 ./ripe.py save --loc=TW
```

即可計算占比等統計資料。

## 範例試算表

實際分析輸出的試算表範例（2023-09 至 2023-12）：

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }

## 下一步

<div class="grid cards" markdown>

- [:material-access-point-network: ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:octicons-mark-github-24: 專案研究預先準備](./setup-repo.md)
- [:material-hand-heart: 如何參與與認領主題](./how-to-contribute.md)

</div>
