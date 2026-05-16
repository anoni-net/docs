---
title: onionoo MCP：Tor 中继节点查询服务
description: 社区自架的 Tor Onionoo MCP / HTTP 代理，让 AI 代理或一般工具能用语义化、有 OpenAPI 规范的方式查询全球 Tor 中继节点信息。
icon: material/api
---

# :material-api: onionoo MCP：Tor 中继节点查询服务

[Onionoo](https://metrics.torproject.org/onionoo.html){target="_blank"} 是 Tor Project 官方维护的中继节点数据 API：任何人都能通过 HTTP 查询目前全球 Tor 中继节点（relay）与桥接（bridge）的详细信息，包括指纹、IP、所在国家与 ASN（自治系统编号）、运行旗标（Guard、Exit、HSDir 等）、带宽与在线时间的历史时间序列。Tor Project 自家的 [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"} 与多数第三方观测站，底层数据都来自这个服务。

`onionoo-fastapi` 是社区自架的一个服务，把 Onionoo API 包装成两种对工具与 AI 代理（agent）更友好的接口：

- **语义化 HTTP API**（附 OpenAPI / Swagger）：把 Onionoo 的短字段（`n`、`f`、`a`、`r` 等）转成可读的 `nickname`、`fingerprint`、`addresses`、`running`，并补上一份完整的 OpenAPI 规范。
- **[Model Context Protocol（MCP）](https://modelcontextprotocol.io/){target="_blank"} 服务器**：让 Claude Desktop、Cursor、Claude Code 等支持 MCP 的客户端，可以直接用工具调用的方式查 Tor 中继节点，不需要写 HTTP 代码。

服务本身**不存储**任何 Onionoo 数据，只负责转发与重新包装响应。上游数据来自 <https://onionoo.torproject.org>。

- **服务站点**：<https://onionoo.anoni.net>
- **Swagger UI**：<https://onionoo.anoni.net/docs>
- **MCP 端点**：`https://onionoo.anoni.net/mcp`（Streamable HTTP）
- **源码**：<https://github.com/anoni-net/onionoo-fastapi>（MIT 授权，当前版本 v1.0.0）

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-swagger.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-swagger.png"
            alt="onionoo.anoni.net 的 Swagger UI，显示 Onionoo FastAPI Proxy v1.0.0，列出 /healthz、/metrics 与 /v1/summary、/v1/details、/v1/bandwidth、/v1/weights、/v1/clients 等端点"
            title="onionoo.anoni.net 的 Swagger UI"
            class="brand-frame">
    </a>
    <capture><code>onionoo.anoni.net/docs</code> 的 Swagger UI 入口，所有 <code>/v1/*</code> 端点都有完整 schema 与「Try it out」可即时测试。</capture>
</figure>

## 先了解 API 与 MCP

### API：给程序查数据的接口

**API（Application Programming Interface，应用程序接口）** 是一种让程序互相查询数据的标准。Onionoo 本身就是一个 API：你发一个 HTTP 请求过去（例如「给我台湾所有 running 的 relay」），它回一份 JSON。

API 的几个特性：

- 规范是给工程师读的，得先知道有哪些端点、每个端点吃哪些参数、回什么字段。
- 答案是「原始数据」：拿到的 JSON 通常是大量 relay 的详细字段，要看出趋势或得出结论需要再写代码处理。
- 适合「已经知道要问什么」的情境。

### MCP：给 AI 工具的接口层

**MCP（Model Context Protocol，模型上下文协议）** 是 Anthropic 在 2024 年提出的开放协议，定义了 AI 模型如何调用外部工具的标准格式：

- 对 AI 客户端（Claude Desktop、Cursor、Claude Code 等）而言，MCP 把外部服务统一成「工具列表加上调用格式」，模型能自己读懂、决定何时调用、调用哪一个。
- 对服务提供方而言，把现有 API 包装成一个 MCP server，所有支持 MCP 的 AI 工具就都能直接接上，不必每出一个新客户端就重做集成。

### 对数据探勘的差别

当你想盘点一份还不熟悉的数据（例如「台湾的 Tor 中继节点现况如何？」），单纯有 API 的情况下流程大致是：

1. 翻 Onionoo 文档，找到 `/details`、`/aggregate` 等端点。
2. 写一支脚本，组合几个查询、合并 JSON、计算统计值。
3. 把结果整理成可读的表格或图表。

接上 MCP 后变成：

1. 直接一句话问 AI 工具：「台湾的 Tor 中继节点现况如何？running 数量、总带宽、前五大 ASN 是哪些？」
2. AI 会自己挑工具、组合查询、整理出一份可读的报告（运气好还会帮你补上脉络，例如「TANet 是台湾学术网络」）。

这对前期的数据研究与探勘特别有帮助：你不必先学会这份数据的 schema 才能开始问问题。AI 工具会替你做初步的查询与整理，你看完报告再决定下一步要钻哪边。如果某些查询之后要重复用、或要进到正式分析，再切回 API 写代码即可，两条路径可以共存。

## 为什么做这个服务

Onionoo 的规范本身很完整，但**没有 OpenAPI 描述**，字段也偏短码（为了传输效率而设计）。这对「人类工程师读文件 + 自己写 client」没问题，但对 AI 代理或第三方工具就比较吃力：

- 没有 OpenAPI 就无法被 Swagger UI、Postman、code generator 自动消化。
- 短字段名称对语言模型不友好，模型容易误解 `r` 是 `relay` 还是 `running`。
- 一次查询往往需要组合好几个端点（`/details` + `/uptime` + `/bandwidth`），AI 代理重复拼凑容易出错。

`onionoo-fastapi` 把这些事情做掉：补上 OpenAPI、改成语义化字段、用 MCP 工具的形式把「常见任务」包成单一调用（例如「给我某中继节点目前的健康状况」一个工具就完成）。

## 怎么用

### 1. 当作 MCP 服务器（推荐给 AI 代理使用者）

**Claude Desktop、Cursor 或其他支持 MCP 的客户端**：在配置文件的 `mcpServers` 区块加上：

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

存档、重启客户端，工具列表中就会出现 `onionoo` 这组工具，可以直接用自然语言让代理查询，例如：

- 「帮我找名字叫 `moria1` 的 Tor 中继节点，回报它的状态与所在国家」
- 「列出台湾（TW）目前 consensus weight 前 10 名的 relay」
- 「比较 `9695DFC35FFEB861329B9F1AB04C46397020CE31` 与 `847B1F850344D7876491A54892F904934E4EB85D` 这两个指纹的版本与旗标」
- 「帮我盘点台湾目前 running 的 relay 数量、总带宽与旗标分布」

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png"
            alt="Claude Desktop 的 Connectors 设置页，onionoo 显示为 CUSTOM connector、连到 https://onionoo.anoni.net/mcp，工具清单列出 aggregate_as、aggregate_countries、aggregate_flags、get_bandwidth、get_clients、get_details、get_summary、get_uptime、get_weights 等 9 个工具"
            title="Claude Desktop 设置 onionoo MCP connector 后的工具清单"
            class="brand-frame">
    </a>
    <capture>Claude Desktop 设置好后在 Connectors 页可看到 <code>onionoo</code>，工具清单列出 9 个经由 Streamable HTTP transport 提供的低阶与汇总端点，可按需求调整每个工具是否需要批准。</capture>
</figure>

如果要在本机跑（不依赖远端服务），可以改用 stdio transport：

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

需要先安装 [`uv`](https://docs.astral.sh/uv/){target="_blank"}（macOS 上 `brew install uv`，Linux 上请参考官方文档）。

### 2. 当作 HTTP API（推荐给写代码直接调用）

每个端点都会返回语义化 JSON，加上 `_meta` 标示缓存状态：

```bash
# 查 moria1 的详细信息（限制只回 nickname 与 fingerprint）
curl -s 'https://onionoo.anoni.net/v1/details?search=moria&fields=nickname,fingerprint' | jq .

# 列出台湾的 relay，依 consensus weight 排序
curl -s 'https://onionoo.anoni.net/v1/details?country=tw&running=true&order=-consensus_weight&limit=5' | jq .

# 按国家汇总目前 running 的 relay 数量
curl -s 'https://onionoo.anoni.net/v1/aggregate/countries?running=true' | jq .
```

完整的端点、查询参数与响应字段请见 [Swagger UI](https://onionoo.anoni.net/docs){target="_blank"}。查询参数沿用 Onionoo 的 [官方规范](https://metrics.torproject.org/onionoo.html){target="_blank"}。

### 3. 自架（Docker）

如果想自己跑一份（例如在 .onion 服务、内网或实验环境）：

```bash
git clone https://github.com/anoni-net/onionoo-fastapi
cd onionoo-fastapi
docker compose up -d --build
```

默认监听 `8000` 端口，OpenAPI 文档在 `http://localhost:8000/docs`，MCP 端点在 `http://localhost:8000/mcp`。

常用配置（环境变量）：

| 变量 | 用途 | 默认 |
|---|---|---|
| `ONIONOO_BASE_URL` | 上游 Onionoo 地址 | `https://onionoo.torproject.org` |
| `CACHE_MAXSIZE` / `CACHE_DEFAULT_TTL_SECONDS` | 内存缓存大小 / TTL | `1024` / `300` 秒 |
| `RATE_LIMIT_ENABLED` / `RATE_LIMIT_PER_MINUTE` | 是否启用 IP 限流 | `false` / `120` |
| `CORS_ALLOWED_ORIGINS` | 允许跨来源请求的域名列表 | 空（默认关闭） |
| `LOG_FORMAT` | `json` 或 `console` | `json` |
| `METRICS_ENABLED` | 是否启用 `/metrics`（Prometheus 格式） | `true` |

完整配置清单见 [README](https://github.com/anoni-net/onionoo-fastapi#configuration){target="_blank"}。

## MCP 工具一览

### 任务导向（stdio transport 提供，推荐给代理使用）

| 工具 | 用途 |
|---|---|
| `find_relay(query)` | 自由文字查询，自动判断输入是 40 位指纹、AS 号、IP，或昵称子字串 |
| `get_relay_health(fingerprint)` | 把 details / uptime / bandwidth 三个端点合并成一个健康度快照 |
| `top_relays_by_bandwidth(country?, flag?, limit)` | 依 consensus weight 取前 N 名，可选国家或旗标过滤 |
| `compare_relays(fingerprints)` | 并行抓多个 fingerprint 的 details 做并排比较 |
| `country_summary(country)` | 单一国家的 running 数量、总带宽、旗标分布 |
| `aggregate_relays(group_by, running, top)` | 依 country / AS / flag 做服务器端 group-by |

### 低阶透传（两种 transport 都提供）

`get_summary` / `get_details` / `get_bandwidth` / `get_weights` / `get_clients` / `get_uptime`：对应 Onionoo 原生端点，吃一个 `params` dict，返回语义化包装后的 JSON。

> Streamable HTTP `/mcp` 提供六个低阶端点加上三个 aggregate（countries、as、flags）。任务导向工具与整合的 `aggregate_relays` 在 stdio 端提供。两种 transport 可同时使用。

## 范例：用 AI 代理盘点台湾 Tor 贡献

把 onionoo MCP 接上 Claude Desktop 或 Claude Code 后，可以直接问：

> 「帮我整理一份台湾 Tor 中继节点现况：总共多少个 running、总带宽、前五大 ASN，顺便挑出 consensus weight 最高的三个 relay，告诉我它们的 nickname 与所在 AS。」

代理会自动把问题拆成几个 MCP 工具调用（HTTP transport 下会是 `aggregate_countries` 加 `get_details`，stdio transport 下则可改用 `country_summary`、`aggregate_relays`、`top_relays_by_bandwidth` 等任务导向工具），把结果汇总成一份报告。这类查询以往需要手动凑 Onionoo 参数、合并 JSON，现在可以一句话完成。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png"
            alt="Claude Desktop 中 Opus 4.7 对「整理台湾 Tor 中继节点现况」这段提问回出的汇总报告，显示 13 个 running relay、总带宽约 39.2 MiB/s（约 329 Mbps）、consensus weight 8,570，并列出前 5 大 ASN 表格（AS3462 中华电信 10 个、AS1659 TANet、AS9416 和信超媒体、AS18041 Taiwan Digital Streaming 各 1 个）"
            title="Claude Desktop 整理出的台湾 Tor 中继节点现况报告"
            class="brand-frame">
    </a>
    <capture>模型汇总后的最终报告：running 数、总带宽、consensus weight、ASN 分布一次到位。底层数值来自上游 Onionoo（数据随时间变动，这只是某一时点的 snapshot）。</capture>
</figure>

如果展开模型侧的推理过程，可以看到它先去问 onionoo MCP server 有哪些工具可用、再规划要怎么组合：

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png"
            alt="Claude Opus 4.7 思考过程的截图：先说「我要找台湾的 relay 信息」、列出可能工具、然后决定先调用 aggregate_countries 找台湾那一列、再用 get_details 抓 country=tw 的 AS 信息、最后依 consensus weight 拉前三名。可以看到 aggregate_countries 这个工具调用已展开、返回 Result"
            title="Claude Opus 4.7 的工具调用展开过程"
            class="brand-frame">
    </a>
    <capture>代理一步一步说出要查什么、选哪个工具、结果回来后下一步要做什么。文字之间夹着实际的 <code>aggregate_countries</code>、<code>get_details</code> 工具调用。把背后的 MCP 互动完整摊开来，方便调试或微调 prompt。</capture>
</figure>

## 观测指标与运维

- `/healthz`：静态存活检查，不打上游。
- `/healthz/ready`：尝试打 Onionoo（结果有缓存），回 200 表示上游可达、503 表示不可达。
- `/metrics`：Prometheus 格式，含缓存命中率（`onionoo_cache_hits_total` 与 `_misses_total`）、上游延迟（`onionoo_upstream_seconds`）与错误率。
- 每个请求都有 `X-Request-ID`，可在 log 与响应 header 对应，方便调试。

## 参与与贡献

- **回报问题 / 提建议**：<https://github.com/anoni-net/onionoo-fastapi/issues>
- **想自己跑 Tor relay**：见 [如何搭建 Tor Relay](./setup-tor-relay.md)，相关观测指标在 [Tor Relays 观测点](../taiwan/tor-relay-watcher.md)。
- **延伸阅读**：[什么是 Tor？](../tools/what-is-tor.md)、[ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md)。

服务目前以 v1.0.0 发布，授权为 MIT。欢迎 issue、PR，或在 Matrix 上一起讨论之后该补哪些任务导向工具。
