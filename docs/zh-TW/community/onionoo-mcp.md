---
title: onionoo MCP：Tor 中繼節點查詢服務
description: 社群自架的 Tor Onionoo MCP / HTTP 代理，讓 AI 代理或一般工具能用語義化、有 OpenAPI 規格的方式查詢全球 Tor 中繼節點資訊。
icon: material/api
---

# :material-api: onionoo MCP：Tor 中繼節點查詢服務

[Onionoo](https://metrics.torproject.org/onionoo.html){target="_blank"} 是 Tor Project 官方維護的中繼節點資料 API：任何人都能透過 HTTP 查詢目前全球 Tor 中繼節點（relay）與橋接（bridge）的詳細資訊，包括指紋、IP、所在國家與 ASN（自治系統編號）、運作旗標（Guard、Exit、HSDir 等）、頻寬與在線時間的歷史時間序列。Tor Project 自己的 [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"} 與多數第三方觀測站，背後資料都來自這個服務。

`onionoo-fastapi` 是社群自架的一個服務，把 Onionoo API 包裝成兩種對工具與 AI 代理（agent）更友善的介面：

- **語義化 HTTP API**（附 OpenAPI / Swagger）：把 Onionoo 的短欄位（`n`、`f`、`a`、`r` 等）轉成可讀的 `nickname`、`fingerprint`、`addresses`、`running`，並補上一份完整的 OpenAPI 規格。
- **[Model Context Protocol（MCP）](https://modelcontextprotocol.io/){target="_blank"} 伺服器**：讓 Claude Desktop、Cursor、Claude Code 等支援 MCP 的客戶端，可以直接用工具呼叫的方式查 Tor 中繼節點，不需要寫 HTTP 程式碼。

服務本身**不儲存**任何 Onionoo 資料，只負責轉發與重新包裝回應。上游資料來自 <https://onionoo.torproject.org>。

- **服務站台**：<https://onionoo.anoni.net>
- **Swagger UI**：<https://onionoo.anoni.net/docs>
- **MCP 端點**：`https://onionoo.anoni.net/mcp`（Streamable HTTP）
- **原始碼**：<https://github.com/anoni-net/onionoo-fastapi>（MIT 授權，目前版本 v1.0.0）

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-swagger.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-swagger.png"
            alt="onionoo.anoni.net 的 Swagger UI，顯示 Onionoo FastAPI Proxy v1.0.0，列出 /healthz、/metrics 與 /v1/summary、/v1/details、/v1/bandwidth、/v1/weights、/v1/clients 等端點"
            title="onionoo.anoni.net 的 Swagger UI"
            class="brand-frame">
    </a>
    <capture><code>onionoo.anoni.net/docs</code> 的 Swagger UI 入口，所有 <code>/v1/*</code> 端點都有完整 schema 與「Try it out」可即時測試。</capture>
</figure>

## 先了解 API 與 MCP

### API：給程式查資料的介面

**API（Application Programming Interface，應用程式介面）** 是一種讓程式互相查詢資料的標準。Onionoo 本身就是一個 API：你發一個 HTTP 請求過去（例如「給我臺灣所有 running 的 relay」），它回一份 JSON。

API 的幾個特性：

- 規格是給工程師讀的，得先知道有哪些端點、每個端點吃哪些參數、回什麼欄位。
- 答案是「原始資料」：拿到的 JSON 通常是大量 relay 的詳細欄位，要看出趨勢或做出結論需要再寫程式處理。
- 適合「已經知道要問什麼」的情境。

### MCP：給 AI 工具的介面層

**MCP（Model Context Protocol，模型上下文協定）** 是 Anthropic 在 2024 年提出的開放協定，定義了 AI 模型如何呼叫外部工具的標準格式：

- 對 AI 客戶端（Claude Desktop、Cursor、Claude Code 等）而言，MCP 把外部服務統一成「工具列表加上呼叫格式」，模型能自己讀懂、決定何時呼叫、呼叫哪一個。
- 對服務提供方而言，把現有 API 包裝成一個 MCP server，所有支援 MCP 的 AI 工具就都能直接接上，不必每出一個新客戶端就重做整合。

### 對資料探勘的差別

當你想盤點一份還不熟悉的資料（例如「臺灣的 Tor 中繼節點現況如何？」），單純有 API 的情況下流程大致是：

1. 翻 Onionoo 文件，找到 `/details`、`/aggregate` 等端點。
2. 寫一支腳本，組合幾個查詢、合併 JSON、計算統計值。
3. 把結果整理成可讀的表格或圖表。

接上 MCP 後變成：

1. 直接一句話問 AI 工具：「臺灣的 Tor 中繼節點現況如何？running 數量、總頻寬、前五大 ASN 是哪些？」
2. AI 會自己挑工具、組合查詢、整理出一份可讀的報告（運氣好還會幫你補上脈絡，例如「TANet 是台灣學術網路」）。

這對前期的資料研究與探勘特別有幫助：你不必先學會這份資料的 schema 才能開始問問題。AI 工具會替你做初步的查詢與整理，你看完報告再決定下一步要鑽哪邊。如果某些查詢之後要重複用、或要進到正式分析，再切回 API 寫腳本即可，兩條路徑可以共存。

## 為什麼做這個服務

Onionoo 的規格本身很完整，但**沒有 OpenAPI 描述**，欄位也偏短碼（為了傳輸效率而設計）。這對「人類工程師讀文件 + 自己寫 client」沒問題，但對 AI 代理或第三方工具就比較吃力：

- 沒有 OpenAPI 就無法被 Swagger UI、Postman、code generator 自動消化。
- 短欄位名稱對語言模型不友善，模型容易誤解 `r` 是 `relay` 還是 `running`。
- 一次查詢往往需要組合好幾個端點（`/details` + `/uptime` + `/bandwidth`），AI 代理重複拼湊容易出錯。

`onionoo-fastapi` 把這些事情做掉：補上 OpenAPI、改成語義化欄位、用 MCP 工具的形式把「常見任務」包成單一呼叫（例如「給我某中繼節點目前的健康狀況」一個工具就完成）。

## 如何使用

### 1. 當作 MCP 伺服器（推薦給 AI 代理使用者）

**Claude Desktop、Cursor 或其他支援 MCP 的客戶端**：在設定檔的 `mcpServers` 區塊加上：

```json
{
  "mcpServers": {
    "onionoo": {
      "type": "http",
      "url": "https://onionoo.anoni.net/mcp"
    }
  }
}
```

存檔、重啟客戶端，工具列表中就會出現 `onionoo` 這組工具，可以直接用自然語言要求代理查詢，例如：

- 「幫我找名字叫 `moria1` 的 Tor 中繼節點，回報它的狀態與所在國家」
- 「列出臺灣（TW）目前 consensus weight 前 10 名的 relay」
- 「比較 `9695DFC35FFEB861329B9F1AB04C46397020CE31` 與 `847B1F850344D7876491A54892F904934E4EB85D` 這兩個指紋的版本與旗標」
- 「幫我盤點臺灣目前 running 的 relay 數量、總頻寬與旗標分佈」

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png"
            alt="Claude Desktop 的 Connectors 設定頁，onionoo 顯示為 CUSTOM connector、連到 https://onionoo.anoni.net/mcp，工具清單列出 aggregate_as、aggregate_countries、aggregate_flags、get_bandwidth、get_clients、get_details、get_summary、get_uptime、get_weights 等 9 個工具"
            title="Claude Desktop 設定 onionoo MCP connector 後的工具清單"
            class="brand-frame">
    </a>
    <capture>Claude Desktop 設定好後在 Connectors 頁可看到 <code>onionoo</code>，工具清單列出 9 個經由 Streamable HTTP transport 提供的低階與彙整端點，可按需求調整每個工具是否需要批准。</capture>
</figure>

如果要在本機跑（不依賴遠端服務），可以改用 stdio transport：

```json
{
  "mcpServers": {
    "onionoo": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/anoni-net/onionoo-fastapi", "onionoo-mcp"]
    }
  }
}
```

需要先安裝 [`uv`](https://docs.astral.sh/uv/){target="_blank"}（macOS 上 `brew install uv`，Linux 上請參考官方文件）。

### 2. 當作 HTTP API（推薦給寫程式直接呼叫）

每個端點都會回傳語義化 JSON，加上 `_meta` 標示快取狀態：

```bash
# 查 moria1 的詳細資訊（限制只回 nickname 與 fingerprint）
curl -s 'https://onionoo.anoni.net/v1/details?search=moria&fields=nickname,fingerprint' | jq .

# 列出臺灣的 relay，依 consensus weight 排序
curl -s 'https://onionoo.anoni.net/v1/details?country=tw&running=true&order=-consensus_weight&limit=5' | jq .

# 按國家彙整目前 running 的 relay 數量
curl -s 'https://onionoo.anoni.net/v1/aggregate/countries?running=true' | jq .
```

完整的端點、查詢參數與回應欄位請見 [Swagger UI](https://onionoo.anoni.net/docs){target="_blank"}。查詢參數沿用 Onionoo 的 [官方規格](https://metrics.torproject.org/onionoo.html){target="_blank"}。

### 3. 自架（Docker）

如果想自己跑一份（例如在 .onion 服務、內網或實驗環境）：

```bash
git clone https://github.com/anoni-net/onionoo-fastapi
cd onionoo-fastapi
docker compose up -d --build
```

預設監聽 `8000` port，OpenAPI 文件在 `http://localhost:8000/docs`，MCP 端點在 `http://localhost:8000/mcp`。

常用設定（環境變數）：

| 變數 | 用途 | 預設 |
|---|---|---|
| `ONIONOO_BASE_URL` | 上游 Onionoo 位址 | `https://onionoo.torproject.org` |
| `CACHE_MAXSIZE` / `CACHE_DEFAULT_TTL_SECONDS` | 記憶體快取大小 / TTL | `1024` / `300` 秒 |
| `RATE_LIMIT_ENABLED` / `RATE_LIMIT_PER_MINUTE` | 是否啟用 IP 限流 | `false` / `120` |
| `CORS_ALLOWED_ORIGINS` | 允許跨來源請求的網域清單 | 空（預設關閉） |
| `LOG_FORMAT` | `json` 或 `console` | `json` |
| `METRICS_ENABLED` | 是否啟用 `/metrics`（Prometheus 格式） | `true` |

完整設定清單見 [README](https://github.com/anoni-net/onionoo-fastapi#configuration){target="_blank"}。

## MCP 工具一覽

### 任務導向（stdio transport 提供，推薦給代理使用）

| 工具 | 用途 |
|---|---|
| `find_relay(query)` | 自由文字查詢，自動判斷輸入是 40 碼指紋、AS 號、IP，或暱稱子字串 |
| `get_relay_health(fingerprint)` | 把 details / uptime / bandwidth 三個端點併成一個健康度快照 |
| `top_relays_by_bandwidth(country?, flag?, limit)` | 依 consensus weight 取前 N 名，可選國家或旗標過濾 |
| `compare_relays(fingerprints)` | 平行抓多個 fingerprint 的 details 做並排比較 |
| `country_summary(country)` | 單一國家的 running 數量、總頻寬、旗標分佈 |
| `aggregate_relays(group_by, running, top)` | 依 country / AS / flag 做伺服器端 group-by |

### 低階透傳（兩種 transport 都提供）

`get_summary` / `get_details` / `get_bandwidth` / `get_weights` / `get_clients` / `get_uptime`：對應 Onionoo 原生端點，吃一個 `params` dict，回傳語義化包裝後的 JSON。

> Streamable HTTP `/mcp` 提供六個低階端點加上三個 aggregate（countries、as、flags）。任務導向工具與整合的 `aggregate_relays` 在 stdio 端提供。兩種 transport 可同時使用。

## 範例：用 AI 代理盤點臺灣 Tor 貢獻

把 onionoo MCP 接上 Claude Desktop 或 Claude Code 後，可以直接問：

> 「幫我整理一份臺灣 Tor 中繼節點現況：總共多少個 running、總頻寬、前五大 ASN，順便挑出 consensus weight 最高的三個 relay，告訴我它們的 nickname 與所在 AS。」

代理會自動把問題拆成幾個 MCP 工具呼叫（HTTP transport 下會是 `aggregate_countries` 加 `get_details`，stdio transport 下則可改用 `country_summary`、`aggregate_relays`、`top_relays_by_bandwidth` 等任務導向工具），把結果彙整成一份報告。這類查詢以往需要手動湊 Onionoo 參數、合併 JSON，現在可以一句話完成。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png"
            alt="Claude Desktop 中 Opus 4.7 對「整理臺灣 Tor 中繼節點現況」這段提問回出的彙整報告，顯示 13 個 running relay、總頻寬約 39.2 MiB/s（約 329 Mbps）、consensus weight 8,570，並列出前 5 大 ASN 表格（AS3462 中華電信 10 個、AS1659 TANet、AS9416 和信超媒體、AS18041 Taiwan Digital Streaming 各 1 個）"
            title="Claude Desktop 整理出的臺灣 Tor 中繼節點現況報告"
            class="brand-frame">
    </a>
    <capture>模型彙整後的最終報告：running 數、總頻寬、consensus weight、ASN 分布一次到位。底層數值來自上游 Onionoo（資料隨時間變動，這只是某一時點的 snapshot）。</capture>
</figure>

如果展開模型側的推理過程，可以看到它先去問 onionoo MCP server 有哪些工具可用、再規劃要如何組合：

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png"
            alt="Claude Opus 4.7 思考過程的截圖：先說「我要找臺灣的 relay 資訊」、列出可能工具、然後決定先呼叫 aggregate_countries 找臺灣那一列、再用 get_details 抓 country=tw 的 AS 資訊、最後依 consensus weight 拉前三名。可以看到 aggregate_countries 這個工具呼叫已展開、回傳 Result"
            title="Claude Opus 4.7 的工具呼叫展開過程"
            class="brand-frame">
    </a>
    <capture>代理一步一步說出要查什麼、選哪個工具、結果回來後下一步要做什麼。文字之間夾著實際的 <code>aggregate_countries</code>、<code>get_details</code> 工具呼叫。把背後的 MCP 互動完整攤開來，方便除錯或微調 prompt。</capture>
</figure>

## 觀測指標與運維

- `/healthz`：靜態存活檢查，不打上游。
- `/healthz/ready`：嘗試打 Onionoo（結果有快取），回 200 表示上游可達、503 表示不可達。
- `/metrics`：Prometheus 格式，含快取命中率（`onionoo_cache_hits_total` 與 `_misses_total`）、上游延遲（`onionoo_upstream_seconds`）與錯誤率。
- 每個請求都有 `X-Request-ID`，可在 log 與回應 header 對應，方便除錯。

## 參與與貢獻

- **回報問題 / 提建議**：<https://github.com/anoni-net/onionoo-fastapi/issues>
- **想自己跑 Tor relay**：見 [如何搭建 Tor Relay](./setup-tor-relay.md)，相關觀測指標在 [Tor Relays 觀測點](../taiwan/tor-relay-watcher.md)。
- **延伸閱讀**：[什麼是 Tor？](../tools/what-is-tor.md)、[ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)。

服務目前以 v1.0.0 釋出，授權為 MIT。歡迎 issue、PR，或在 Matrix 上一起討論之後該補哪些任務導向工具。
