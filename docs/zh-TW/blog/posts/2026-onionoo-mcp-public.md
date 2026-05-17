---
date: 2026-05-19
authors:
    - toomore
categories:
    - 社群
    - 公告
slug: 2026-onionoo-mcp-public
image: "assets/images/post-update.png"
summary: "anoni.net 社群把 Tor Project 的 Onionoo 包成 MCP server 與語義化 HTTP API，公開在 onionoo.anoni.net 上線。接上 Claude Desktop 等 AI 客戶端，用一句中文就能問臺灣 Tor 中繼節點現況。"
description: "anoni.net 社群把 Tor Project 的 Onionoo 包成 MCP server 與語義化 HTTP API，公開在 onionoo.anoni.net 上線。接上 Claude Desktop 等 AI 客戶端，用一句中文就能問臺灣 Tor 中繼節點現況。"
---

# onionoo MCP 上線：用一句中文問 Tor 中繼節點現況

![onionoo MCP 上線](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

匿名網路社群自架的 `onionoo-fastapi` 服務以 v1.0.0 對外公開，站台位於 <https://onionoo.anoni.net>。它把 Tor Project 官方的 [Onionoo](https://metrics.torproject.org/onionoo.html){target="_blank"} API 包成兩種介面，一份是補上 OpenAPI 規格的語義化 HTTP API，一個是 Model Context Protocol（MCP）server。

接上 Claude Desktop、Cursor、Claude Code 等支援 MCP 的客戶端後，用一句中文就能問「臺灣目前有幾個 Tor 中繼節點，總頻寬多少，前五大 ASN 是哪些」。AI 代理會自己拆問題、選工具、查資料、整理出可讀報告，不必先學 Onionoo 的欄位定義才能開始研究。

<!-- more -->

## 為什麼要包這一層

Onionoo 的規格本身完整，但對 AI 代理來說有三個門檻。

- 沒有 OpenAPI 描述，無法被 Swagger UI、Postman、code generator 自動消化。
- 欄位短碼（如 `r`、`f`、`n`、`a`）為了傳輸效率而設計，對語言模型不夠語義化，模型容易誤解 `r` 是 `relay` 還是 `running`。
- 一次查詢常要組合多個端點（details、uptime、bandwidth），AI 代理重複拼湊容易出錯。

`onionoo-fastapi` 把這些事情做掉。短碼還原成 `nickname`、`fingerprint`、`addresses`、`running` 等語義名稱，補上完整 OpenAPI 規格，並把幾個常見任務包成單一 MCP 工具呼叫。想看某中繼節點的健康狀況時，呼叫一次就能拿到併好的 details、uptime、bandwidth 快照，不必自己組三個端點。

服務本身**不儲存**任何 Onionoo 資料，只負責轉發與重新包裝回應。上游資料來自 <https://onionoo.torproject.org>。

## 可以拿來問什麼

接上 MCP 後，下面這幾類問題都可以直接用自然語言丟給 AI 代理處理。

- **盤點某個國家的 Tor 貢獻**：「整理一份臺灣 Tor 中繼節點現況，running 數量、總頻寬、consensus weight、前五大 ASN，再挑出 consensus weight 最高的三個 relay。」
- **某個 ASN 底下的狀況**：「列出 TANet（AS1659）目前所有 running 的 Tor 中繼節點，回報旗標、頻寬與在線時間。」
- **比對指紋**：「比較 `9695DFC35FFEB861329B9F1AB04C46397020CE31` 與 `847B1F850344D7876491A54892F904934E4EB85D` 這兩個 relay 的版本、旗標、所在國家與 AS。」
- **單一中繼節點健康度**：「告訴我 `moria1` 這個 relay 目前的狀態、所在國家、最近一週的頻寬走勢與在線時間。」

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png"
            alt="Claude Desktop 整理出的臺灣 Tor 中繼節點現況報告，顯示 running 數量、總頻寬、consensus weight 與前 5 大 ASN 表格"
            title="Claude Desktop 整理出的臺灣 Tor 中繼節點現況報告"
            class="brand-frame">
    </a>
    <capture>Claude Desktop 接上 onionoo MCP 後，請模型「整理臺灣 Tor 中繼節點現況」回出的彙整報告。底層數值來自上游 Onionoo，這是某一時點的 snapshot。</capture>
</figure>

這類查詢以往要先翻 Onionoo 文件、寫腳本、合併 JSON、再整理表格，現在一句話就能拿到初步結果。盤點完再決定下一步要往哪鑽，研究啟動的成本差很多。

## 怎麼接上去

### 給 AI 客戶端使用者

在 Claude Desktop、Cursor 或其他支援 MCP 的客戶端，在設定檔的 `mcpServers` 區塊加上：

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

存檔、重啟客戶端，工具列表中就會出現 onionoo 這組工具，可以直接用自然語言要求代理查詢。本機 stdio transport 安裝方式、完整工具一覽、權限調整、自架（Docker）等細節，全部收在完整使用文件。

[:material-arrow-right-circle-outline: 閱讀完整 onionoo MCP 使用文件](../../community/onionoo-mcp.md){ .md-button .md-button--primary }

### 給寫程式直接呼叫的使用者

每個端點都會回傳語義化 JSON，可以直接用 `curl` 呼叫。

```bash
# 列出臺灣的 relay，依 consensus weight 排序前 5 名
curl -s 'https://onionoo.anoni.net/v1/details?country=tw&running=true&order=-consensus_weight&limit=5' | jq .

# 按國家彙整目前 running 的中繼節點數量
curl -s 'https://onionoo.anoni.net/v1/aggregate/countries?running=true' | jq .
```

完整端點與參數見 [Swagger UI](https://onionoo.anoni.net/docs){target="_blank"}，查詢參數沿用 Onionoo 的 [官方規格](https://metrics.torproject.org/onionoo.html){target="_blank"}。

## 與既有觀測工具的分工

anoni.net 目前在 Tor 觀測這條線上有三個入口，可以依任務挑。

- **[Tor Relays 觀測點](../../taiwan/tor-relay-watcher.md)**：圖表面板，看臺灣中繼節點的數量與頻寬趨勢，適合想看走勢的場合。
- **[ASN 自治網路觀測資料分析](../../taiwan/ooni-asn-coverage.md)**：OONI 觀測資料的 ASN 涵蓋分析，適合想知道哪些 ASN 的使用者實際在被觀測到。
- **onionoo MCP**（這次新增）：用問句快速做 ad-hoc 查詢，適合想針對某個 relay、某個 ASN、某個國家盤點現況。

三個入口資料來源不同（Pulse 自己抓的歷史時序、OONI 原始觀測資料、Onionoo 即時 snapshot），互相補完，不重複。

## 參與與回饋

- 回報問題或提建議：<https://github.com/anoni-net/onionoo-fastapi/issues>
- 想討論該補哪些任務導向工具、或請社群示範某類查詢，歡迎到 [Matrix 公開 room](../../community/tools.md) 提。
- 想自己跑一份（例如在 .onion 服務、內網或實驗環境），完整文件的「自架（Docker）」段落有 Docker 啟動指令與環境變數列表。

服務以 MIT 授權釋出，原始碼在 <https://github.com/anoni-net/onionoo-fastapi>，任何 issue、PR 都歡迎。

## 相關閱讀

- [onionoo MCP：Tor 中繼節點查詢服務](../../community/onionoo-mcp.md)：完整使用文件
- [Tor Relays 觀測點](../../taiwan/tor-relay-watcher.md)
- [ASN 自治網路觀測資料分析](../../taiwan/ooni-asn-coverage.md)
- [什麼是 Tor？](../../tools/what-is-tor.md)
