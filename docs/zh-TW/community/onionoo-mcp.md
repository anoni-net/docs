---
title: onionoo MCP：Tor 中繼節點查詢服務
description: 社群自架的 Tor 中繼節點查詢服務。記者、公民團體、事實查核者不必寫程式，在 claude.ai 等雲端 AI 助理貼上一個網址，就能用中文盤點臺灣與各地有多少 Tor 節點、頻寬多大、集中在哪些電信網路。
icon: material/api
---

# :material-api: onionoo MCP：Tor 中繼節點查詢服務

想知道臺灣現在有幾個還在運作的 Tor 節點、半年來是變多還是變少、這些節點落在哪幾家電信業者底下嗎？這些答案都在 Tor Project 的公開資料裡，過去要回答得自己寫程式去抓、去算。onionoo MCP 把這一步變成一句中文問句。在 AI 助理（像 claude.ai）裡接上這個服務，直接打「臺灣現在有幾個能用的 Tor 節點？」，它就會去查、算好、回一份能讀的報告。

這頁前半寫給想查資料、但不寫程式的人（記者、公民團體、事實查核者），照著做就能上手。後半（[給工程師與想自架的人](#給工程師與想自架的人)）寫給要用程式呼叫、或想自己跑一份服務的人。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png"
            alt="Claude Desktop 中對「整理臺灣 Tor 中繼節點現況」這段提問回出的彙整報告，顯示 13 個 running relay、總頻寬約 39.2 MiB/s（約 329 Mbps）、consensus weight 8,570，並列出前 5 大 ASN 表格（AS3462 中華電信 10 個、AS1659 TANet、AS9416 和信超媒體、AS18041 Taiwan Digital Streaming 各 1 個）"
            title="AI 助理整理出的臺灣 Tor 中繼節點現況報告"
            class="brand-frame">
    </a>
    <capture>你會拿到的東西：問一句中文，AI 助理回一份整理好的報告（運作中節點數、總頻寬、前五大電信網路）。底層數值來自 Tor Project 官方資料，這是查詢當下的快照，會隨時間變動。</capture>
</figure>

## 它能幫你回答什麼

- **事實查核**：有人說「臺灣的 Tor 量能很低」，你可以當場問出「現在有幾個運作中節點、總頻寬多少、跟某個時間點相比的變化」，拿到能對照、能引用的數字。
- **新聞報導**：寫某國網路封鎖或翻牆基礎建設的題目時，盤點某個國家有多少 Tor 中繼、出口節點（流量離開 Tor 連回一般網站的最後一站）集中在哪些網路供應商，做跨國比較。
- **公民團體與倡議**：盤點某地區節點的分散程度（落在幾家電信業者，越分散越不容易被一次切斷），當作數位韌性的觀察指標。

## 開始使用（不用寫程式）

最低門檻的用法是把這個服務接到你平常用的雲端 AI 助理。不用安裝任何東西、不用編設定檔，在助理的設定裡新增一個「自訂連接器（custom connector）」，貼上以下網址就好：

`https://onionoo.anoni.net/mcp`

亞太地區常見的三家雲端 AI，目前的接法門檻不太一樣：

| 雲端 AI | 能在 App 裡直接貼網址嗎 | 怎麼接 |
|---|---|---|
| **Claude（claude.ai）** | 可以，免費方案就行 | 設定 → Connectors（連接器）→ Add custom connector，貼上網址 |
| **ChatGPT** | 可以，但要付費方案（Plus 以上，免費版不支援） | 設定 → Apps → 進階設定 → 開啟「Developer Mode（開發者模式）」→ 新增自訂 connector，貼上網址 |
| **Google Gemini** | 消費版聊天 App 目前還不行 | 要走 Gemini CLI（需要寫設定檔）或 Gemini Enterprise（需要 Google Cloud 管理權限），屬於工程或企業路徑，見[後半給工程師的段落](#給工程師與想自架的人) |

各家的方案門檻與設定位置可能會變動，請以各家官方說明為準（Claude[^connector]、ChatGPT[^chatgpt]、Gemini[^gemini]）。

三家裡門檻最低的是 Claude，以它為例的完整步驟：

1. 打開 [claude.ai](https://claude.ai){target="_blank"}（網頁版或桌面版都可以），登入。
2. 進設定，找到「Connectors（連接器）」，點「Add custom connector（新增自訂連接器）」。
3. 名稱填 `onionoo`，網址貼上 `https://onionoo.anoni.net/mcp`，按「Add」。
4. 回到 AI 助理開一個新對話，直接用中文問（例句見下一節）。

如果你用的是公司或團隊帳號，通常只有帳號管理者（Owner）能新增連接器，請找管理者代加。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png"
            alt="Claude Desktop 的 Connectors 設定頁，onionoo 顯示為 CUSTOM connector、連到 https://onionoo.anoni.net/mcp，工具清單列出 aggregate_as、aggregate_countries、aggregate_flags、get_bandwidth、get_clients、get_details、get_summary、get_uptime、get_weights 等工具"
            title="在 Connectors 設定頁貼上網址後的樣子"
            class="brand-frame">
    </a>
    <capture>加好之後，Connectors 頁會出現 <code>onionoo</code> 這個自訂連接器，底下是它提供的查詢工具。AI 助理會自己挑工具，你只要用中文問就好。</capture>
</figure>

## 可以直接複製的問句

不知道怎麼問的話，先複製下面這幾句，再依需要換成你想查的國家或地區。

**想要可引用的數字（事實查核）**

> 臺灣現在有幾個運作中的 Tor 中繼節點？總頻寬大約多少？幫我整理成一句我能直接引用的話。

**跨國比較（新聞報導）**

> 幫我比較臺灣、香港、日本目前運作中的 Tor 中繼節點數量與總頻寬，做成一個表格。

**看分散程度（公民團體）**

> 臺灣的 Tor 中繼節點分別由哪些電信業者（ASN）承載？前五大是哪些、各有幾個？

問完覺得有用，可以追問「這些數字是什麼時候的？」、「資料來源是哪裡？」，讓它把出處交代清楚。

??? info "幾個會用到的詞"

    這頁會出現的幾個詞，第一次看到不用緊張，知道大概是什麼就好，要查的時候 AI 助理也會替你解釋。

    - **中繼節點（relay）**：Tor 網路裡幫忙轉送流量的志願伺服器，全球有上萬個。你連 Tor 時，流量會接力經過好幾個中繼節點。
    - **橋接（bridge）**：沒有公開列出的中繼節點，給連不上一般 Tor 節點（例如被封鎖）的人繞道用。
    - **出口節點（exit）**：流量離開 Tor 網路、連回一般網站時的最後一個節點。
    - **ASN（自治系統編號）**：一家電信業者或網路供應商在網路上的編號。看節點落在哪些 ASN，就是看它們由哪些業者承載。
    - **consensus weight（共識權重）**：Tor 分配流量時給每個節點的分量，大致反映它能承擔多少流量，數字越大越吃重。

## 我查到的數字可靠嗎、能不能引用

可以。底層資料來自 Tor Project 官方維護的 [Onionoo](https://metrics.torproject.org/onionoo.html){target="_blank"}（Tor 的中繼節點公開資料服務），onionoo.anoni.net 只負責把它轉成比較好讀的格式，本身不另外儲存或加工數值。

- **想交叉核對**：同樣的節點可以在 Tor Project 官方的 [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"} 查到，數字應該對得起來。
- **注意時效**：服務為了減輕上游負擔會把回應快取約 5 分鐘，加上 Onionoo 本身也是定期更新，所以你拿到的是「某個時間點的快照」，不是即時值。要引用時把查詢時間一起記下來。
- **引用寫法**：可以寫成「資料來源：Tor Project Onionoo（經 anoni.net onionoo 服務查詢，查詢時間 2026-06-09）」。

以上就是一般查資料的用法，看到這裡就夠了。想用程式直接呼叫、或自己架一份服務，再往下讀。

---

## 給工程師與想自架的人

以下技術性較高，寫給要在程式裡直接呼叫、或想自己跑一份服務的人。一般查資料用前半段就夠了。

`onionoo-fastapi` 把 Onionoo API 包裝成兩種對工具與 AI 代理（agent）更友善的介面：

- **語義化 HTTP API**（附 OpenAPI / Swagger）：把 Onionoo 的短欄位（`n`、`f`、`a`、`r` 等）轉成可讀的 `nickname`、`fingerprint`、`addresses`、`running`，並補上一份完整的 OpenAPI 規格。
- **[Model Context Protocol（MCP）](https://modelcontextprotocol.io/){target="_blank"} 伺服器**：讓 Claude Desktop、Cursor、Claude Code 等支援 MCP 的客戶端，直接用工具呼叫的方式查 Tor 中繼節點，不需要寫 HTTP 程式碼。

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

### 為什麼做這個服務

Onionoo 的規格本身很完整，但**沒有 OpenAPI 描述**，欄位也偏短碼（為了傳輸效率而設計）。對「人類工程師讀文件加自己寫 client」沒問題，但對 AI 代理或第三方工具就比較吃力：

- 沒有 OpenAPI 就無法被 Swagger UI、Postman、code generator 自動消化。
- 短欄位名稱對語言模型不友善，模型容易誤解 `r` 是 `relay` 還是 `running`。
- 一次查詢往往需要組合好幾個端點（`/details` 加 `/uptime` 加 `/bandwidth`），AI 代理重複拼湊容易出錯。

`onionoo-fastapi` 把這些事情做掉：補上 OpenAPI、改成語義化欄位、用 MCP 工具的形式把常見任務包成單一呼叫（例如「給我某中繼節點目前的健康狀況」一個工具就完成）。

### API 與 MCP 的差別

**API（Application Programming Interface，應用程式介面）** 是讓程式互相查詢資料的標準。Onionoo 本身就是一個 API：你發一個 HTTP 請求過去（例如「給我臺灣所有 running 的 relay」），它回一份 JSON。規格是給工程師讀的，拿到的是原始資料，適合「已經知道要問什麼」的情境。

**MCP（Model Context Protocol，模型上下文協定）** 是 Anthropic 在 2024 年提出的開放協定，定義 AI 模型如何呼叫外部工具的標準格式。把現有 API 包裝成一個 MCP server，所有支援 MCP 的 AI 代理或客戶端就都能直接接上，模型能自己讀懂工具清單、決定何時呼叫哪一個，不必每次出現新客戶端就重做整合。

對前期的資料探勘來說，MCP 特別有幫助：你不必先學會這份資料的 schema 才能開始問問題，AI 助理會替你做初步查詢與整理，看完報告再決定下一步。某些查詢之後要重複用、或要進到正式分析時，再切回 API 寫腳本即可，兩條路徑可以共存。

### 接成 MCP 伺服器（設定檔）

如果你的客戶端要用設定檔接（不走前半段的 Connectors UI），在 `mcpServers` 區塊加上：

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

存檔、重啟客戶端，工具清單就會出現 `onionoo` 這組工具。

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

Gemini CLI 也是讀 `mcpServers` 設定（在它的 settings.json），格式與上面相近，把同一個遠端網址填進去即可。消費版的 Gemini 聊天 App 目前還沒有貼網址接遠端 MCP 的入口，這條路得等官方支援。

### 當作 HTTP API 直接呼叫

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

### 自架（Docker）

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

### MCP 工具一覽

任務導向（stdio transport 提供，推薦給代理使用）：

| 工具 | 用途 |
|---|---|
| `find_relay(query)` | 自由文字查詢，自動判斷輸入是 40 碼指紋、AS 號、IP，或暱稱子字串 |
| `get_relay_health(fingerprint)` | 把 details / uptime / bandwidth 三個端點併成一個健康度快照 |
| `top_relays_by_bandwidth(country?, flag?, limit)` | 依 consensus weight 取前 N 名，可選國家或旗標過濾 |
| `compare_relays(fingerprints)` | 平行抓多個 fingerprint 的 details 做並排比較 |
| `country_summary(country)` | 單一國家的 running 數量、總頻寬、旗標分佈 |
| `aggregate_relays(group_by, running, top)` | 依 country / AS / flag 做伺服器端 group-by |

低階透傳（兩種 transport 都提供）：

`get_summary` / `get_details` / `get_bandwidth` / `get_weights` / `get_clients` / `get_uptime`：對應 Onionoo 原生端點，吃一個 `params` dict，回傳語義化包裝後的 JSON。

> Streamable HTTP `/mcp` 提供六個低階端點加上三個 aggregate（countries、as、flags），任務導向工具與整合的 `aggregate_relays` 則在 stdio 端提供。兩種 transport 可同時使用。

### 範例：用 AI 代理盤點臺灣 Tor 貢獻

把 onionoo MCP 接上 Claude Desktop 或 Claude Code 後，可以直接問：

> 「幫我整理一份臺灣 Tor 中繼節點現況：總共多少個 running、總頻寬、前五大 ASN，順便挑出 consensus weight 最高的三個 relay，告訴我它們的 nickname 與所在 AS。」

代理會自動把問題拆成幾個 MCP 工具呼叫，把結果彙整成一份報告（HTTP transport 下會用 `aggregate_countries` 加 `get_details`，stdio transport 下則可改用 `country_summary`、`aggregate_relays`、`top_relays_by_bandwidth` 等任務導向工具）。這類查詢以往需要手動湊 Onionoo 參數、合併 JSON，現在一句話就能完成。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png"
            alt="Claude Opus 4.7 思考過程的截圖：先說「我要找臺灣的 relay 資訊」、列出可能工具、然後決定先呼叫 aggregate_countries 找臺灣那一列、再用 get_details 抓 country=tw 的 AS 資訊、最後依 consensus weight 拉前三名。可以看到 aggregate_countries 這個工具呼叫已展開、回傳 Result"
            title="Claude Opus 4.7 的工具呼叫展開過程"
            class="brand-frame">
    </a>
    <capture>展開模型側的推理，可以看到代理一步一步說出要查什麼、選哪個工具、結果回來後下一步要做什麼。文字之間夾著實際的 <code>aggregate_countries</code>、<code>get_details</code> 工具呼叫，方便除錯或微調 prompt。</capture>
</figure>

### 觀測指標與運維

- `/healthz`：靜態存活檢查，不打上游。
- `/healthz/ready`：嘗試打 Onionoo（結果有快取），回 200 表示上游可達、503 表示不可達。
- `/metrics`：Prometheus 格式，含快取命中率（`onionoo_cache_hits_total` 與 `_misses_total`）、上游延遲（`onionoo_upstream_seconds`）與錯誤率。
- 每個請求都有 `X-Request-ID`，可在 log 與回應 header 對應，方便除錯。

## 參與與貢獻

- **回報問題 / 提建議**：<https://github.com/anoni-net/onionoo-fastapi/issues>
- **想自己跑 Tor relay**：見 [如何搭建 Tor Relay](./setup-tor-relay.md)，相關觀測指標在 [Tor Relays 觀測點](../taiwan/tor-relay-watcher.md)。
- **出國前評估**：[出國前數位安全：用 AI 自助產生目的地概況](../scenarios/travel-ai-briefing.md)。記者、NGO 出國前要查目的地的 Tor 可達性時，接上 onionoo MCP 就能讓 AI 查到真實、可引用的 Onionoo 數字。
- **延伸閱讀**：[什麼是 Tor？](../tools/what-is-tor.md)、[ASN 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)。

服務目前以 v1.0.0 釋出，授權為 MIT。歡迎 issue、PR，或在 Matrix 上一起討論之後該補哪些任務導向工具。

[^connector]: [Get started with custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp){target="_blank"} - Claude Help Center（自訂連接器在免費、Pro、Max、Team、Enterprise 方案皆可使用，免費方案限一個）。

[^chatgpt]: [Developer mode — apps and full MCP connectors in ChatGPT (beta)](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta){target="_blank"} - OpenAI Help Center（自訂 MCP connector 需在 Plus、Pro、Business、Enterprise、Edu 方案開啟 Developer Mode，免費版不支援）。

[^gemini]: [Set up your custom MCP server data store](https://docs.cloud.google.com/gemini/enterprise/docs/connectors/custom-mcp-server/set-up-custom-mcp-server){target="_blank"} - Gemini Enterprise（Google Cloud）。消費版 Gemini 聊天 App 尚未提供在介面內貼網址接遠端 MCP 的功能，開發端可用 [Gemini CLI](https://geminicli.com/docs/tools/mcp-server/){target="_blank"} 的 `mcpServers` 設定。
