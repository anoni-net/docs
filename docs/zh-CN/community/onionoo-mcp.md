---
title: onionoo MCP：Tor 中继节点查询服务
description: 社区自架的 Tor 中继节点查询服务。记者、公民团体、事实核查者不必写代码，在 claude.ai 等云端 AI 助手贴上一个网址，就能用中文盘点台湾与各地有多少 Tor 节点、带宽多大、集中在哪些电信网络。
icon: material/api
---

# :material-api: onionoo MCP：Tor 中继节点查询服务

想知道台湾现在有几个还在运行的 Tor 节点、半年来是变多还是变少、这些节点落在哪几家电信运营商底下吗？这些答案都在 Tor Project 的公开数据里，过去要回答得自己写代码去抓、去算。onionoo MCP 把这一步变成一句中文问句。在 AI 助手（像 claude.ai）里接上这个服务，直接打「台湾现在有几个能用的 Tor 节点？」，它就会去查、算好、回一份能读的报告。

这页前半写给想查数据、但不写代码的人（记者、公民团体、事实核查者），照着做就能上手。后半（[给工程师与想自架的人](#给工程师与想自架的人)）写给要用代码调用、或想自己跑一份服务的人。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png"
            alt="Claude Desktop 中对「整理台湾 Tor 中继节点现况」这段提问回出的汇总报告，显示 13 个 running relay、总带宽约 39.2 MiB/s（约 329 Mbps）、consensus weight 8,570，并列出前 5 大 ASN 表格（AS3462 中华电信 10 个、AS1659 TANet、AS9416 和信超媒体、AS18041 Taiwan Digital Streaming 各 1 个）"
            title="AI 助手整理出的台湾 Tor 中继节点现况报告"
            class="brand-frame">
    </a>
    <capture>你会拿到的东西：问一句中文，AI 助手回一份整理好的报告（运行中节点数、总带宽、前五大电信网络）。底层数值来自 Tor Project 官方数据，这是查询当下的快照，会随时间变动。</capture>
</figure>

## 它能帮你回答什么

- **事实核查**：有人说「台湾的 Tor 量能很低」，你可以当场问出「现在有几个运行中节点、总带宽多少、跟某个时间点相比的变化」，拿到能对照、能引用的数字。
- **新闻报道**：写某国网络封锁或翻墙基础建设的题目时，盘点某个国家有多少 Tor 中继、出口节点（流量离开 Tor 连回普通网站的最后一站）集中在哪些网络运营商，做跨国比较。
- **公民团体与倡议**：盘点某地区节点的分散程度（落在几家电信运营商，越分散越不容易被一次切断），当作数字韧性的观察指标。

## 开始使用（不用写代码）

最低门槛的用法是把这个服务接到你平常用的云端 AI 助手。不用安装任何东西、不用编配置文件，在助手的设置里新增一个「自定义连接器（custom connector）」，贴上以下网址就好：

`https://onionoo.anoni.net/mcp`

亚太地区常见的三家云端 AI，目前的接法门槛不太一样：

| 云端 AI | 能在 App 里直接贴网址吗 | 接法 |
|---|---|---|
| **Claude（claude.ai）** | 可以，免费方案也行（限 1 个连接器） | 设置 → Connectors（连接器）→ Add custom connector，贴上网址 |
| **ChatGPT** | 可以，但要付费方案（Plus 以上，免费版不支持） | 设置 → Apps → 高级设置 → 开启「Developer Mode（开发者模式）」→ 新增自定义 connector，贴上网址 |
| **Google Gemini** | 消费版聊天 App 目前还不行 | 要走 Gemini CLI（需要写配置文件）或 Gemini Enterprise（需要 Google Cloud 管理权限），属于工程或企业路径，见[后半给工程师的段落](#给工程师与想自架的人) |

各家的方案门槛与设置位置可能会变动，请以各家官方说明为准（Claude[^connector]、ChatGPT[^chatgpt]、Gemini[^gemini]）。

三家里门槛最低的是 Claude，以它为例的完整步骤：

1. 打开 [claude.ai](https://claude.ai){target="_blank"}（网页版或桌面版都可以），登录。
2. 进设置，找到「Connectors（连接器）」，点「Add custom connector（新增自定义连接器）」。
3. 名称填 `onionoo`，网址贴上 `https://onionoo.anoni.net/mcp`，按「Add」。
4. 回到 AI 助手开一个新对话，直接用中文问（例句见下一节）。

如果你用的是公司或团队账号，通常只有账号管理员（Owner）能新增连接器，请找管理员代加。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png"
            alt="Claude Desktop 的 Connectors 设置页，onionoo 显示为 CUSTOM connector、连到 https://onionoo.anoni.net/mcp，工具清单列出 aggregate_as、aggregate_countries、aggregate_flags、get_bandwidth、get_clients、get_details、get_summary、get_uptime、get_weights 等工具"
            title="在 Connectors 设置页贴上网址后的样子"
            class="brand-frame">
    </a>
    <capture>加好之后，Connectors 页会出现 <code>onionoo</code> 这个自定义连接器，底下是它提供的查询工具。AI 助手会自己挑工具，你只要用中文问就好。</capture>
</figure>

## 可以直接复制的问句

不知道怎么问的话，先复制下面这几句，再依需要换成你想查的国家或地区。

**想要可引用的数字（事实核查）**

> 台湾现在有几个运行中的 Tor 中继节点？总带宽大约多少？帮我整理成一句我能直接引用的话。

**跨国比较（新闻报道）**

> 帮我比较台湾、香港、日本目前运行中的 Tor 中继节点数量与总带宽，做成一个表格。

**看分散程度（公民团体）**

> 台湾的 Tor 中继节点分别由哪些电信运营商（ASN）承载？前五大是哪些、各有几个？

问完觉得有用，可以追问「这些数字是什么时候的？」、「数据来源是哪里？」，让它把出处交代清楚。

??? info "几个会用到的词"

    这页会出现的几个词，第一次看到不用紧张，知道大概是什么就好，要查的时候 AI 助手也会替你解释。

    - **中继节点（relay）**：Tor 网络里帮忙转发流量的志愿服务器，全球有上万个。你连 Tor 时，流量会接力经过好几个中继节点。
    - **桥接（bridge）**：没有公开列出的中继节点，给连不上普通 Tor 节点（例如被封锁）的人绕道用。
    - **出口节点（exit）**：流量离开 Tor 网络、连回普通网站时的最后一个节点。
    - **ASN（自治系统编号）**：一家电信运营商或网络供应商在网络上的编号。看节点落在哪些 ASN，就是看它们由哪些运营商承载。
    - **consensus weight（共识权重）**：Tor 分配流量时给每个节点的分量，大致反映它能承担多少流量，数字越大越吃重。

## 我查到的数字可靠吗、能不能引用

可以。底层数据来自 Tor Project 官方维护的 [Onionoo](https://metrics.torproject.org/onionoo.html){target="_blank"}（Tor 的中继节点公开数据服务），onionoo.anoni.net 只负责把它转成比较好读的格式，本身不另外存储或加工数值。

- **想交叉核对**：同样的节点可以在 Tor Project 官方的 [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"} 查到，数字应该对得起来。
- **注意时效**：服务为了减轻上游负担会把响应缓存约 5 分钟，加上 Onionoo 本身也是定期更新，所以你拿到的是「某个时间点的快照」，不是实时值。要引用时把查询时间一起记下来。
- **引用写法**：可以写成「数据来源：Tor Project Onionoo（经 anoni.net onionoo 服务查询，查询时间 2026-06-09）」。

以上就是一般查数据的用法，看到这里就够了。想用代码直接调用、或自己架一份服务，再往下读。

---

## 给工程师与想自架的人

以下技术性较高，写给要在代码里直接调用、或想自己跑一份服务的人。一般查数据用前半段就够了。

`onionoo-fastapi` 把 Onionoo API 包装成两种对工具与 AI 代理（agent）更友好的接口：

- **语义化 HTTP API**（附 OpenAPI / Swagger）：把 Onionoo 的短字段（`n`、`f`、`a`、`r` 等）转成可读的 `nickname`、`fingerprint`、`addresses`、`running`，并补上一份完整的 OpenAPI 规范。
- **[Model Context Protocol（MCP）](https://modelcontextprotocol.io/){target="_blank"} 服务器**：让 Claude Desktop、Cursor、Claude Code 等支持 MCP 的客户端，直接用工具调用的方式查 Tor 中继节点，不需要写 HTTP 代码。

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

### 为什么做这个服务

Onionoo 的规范本身很完整，但**没有 OpenAPI 描述**，字段也偏短码（为了传输效率而设计）。对「人类工程师读文件加自己写 client」没问题，但对 AI 代理或第三方工具就比较吃力：

- 没有 OpenAPI 就无法被 Swagger UI、Postman、code generator 自动消化。
- 短字段名称对语言模型不友好，模型容易误解 `r` 是 `relay` 还是 `running`。
- 一次查询往往需要组合好几个端点（`/details` 加 `/uptime` 加 `/bandwidth`），AI 代理重复拼凑容易出错。

`onionoo-fastapi` 把这些事情做掉：补上 OpenAPI、改成语义化字段、用 MCP 工具的形式把常见任务包成单一调用（例如「给我某中继节点目前的健康状况」一个工具就完成）。

### API 与 MCP 的差别

**API（Application Programming Interface，应用程序接口）** 是让程序互相查询数据的标准。Onionoo 本身就是一个 API：你发一个 HTTP 请求过去（例如「给我台湾所有 running 的 relay」），它回一份 JSON。规范是给工程师读的，拿到的是原始数据，适合「已经知道要问什么」的情境。

**MCP（Model Context Protocol，模型上下文协议）** 是 Anthropic 在 2024 年提出的开放协议，定义 AI 模型如何调用外部工具的标准格式。把现有 API 包装成一个 MCP server，所有支持 MCP 的 AI 代理或客户端就都能直接接上，模型能自己读懂工具清单、决定何时调用哪一个，不必每次出现新客户端就重做集成。

对前期的数据探勘来说，MCP 特别有帮助：你不必先学会这份数据的 schema 才能开始问问题，AI 助手会替你做初步查询与整理，看完报告再决定下一步。某些查询之后要重复用、或要进到正式分析时，再切回 API 写脚本即可，两条路径可以共存。

### 接成 MCP 服务器（配置文件）

如果你的客户端要用配置文件接（不走前半段的 Connectors UI），在 `mcpServers` 区块加上：

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

存档、重启客户端，工具清单就会出现 `onionoo` 这组工具。

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

Gemini CLI 也是读 `mcpServers` 配置（在它的 settings.json），格式与上面相近，把同一个远端网址填进去即可。消费版的 Gemini 聊天 App 目前还没有贴网址接远端 MCP 的入口，这条路得等官方支持。

### 当作 HTTP API 直接调用

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

### 自架（Docker）

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

### MCP 工具一览

任务导向（stdio transport 提供，推荐给代理使用）：

| 工具 | 用途 |
|---|---|
| `find_relay(query)` | 自由文字查询，自动判断输入是 40 位指纹、AS 号、IP，或昵称子字符串 |
| `get_relay_health(fingerprint)` | 把 details / uptime / bandwidth 三个端点合并成一个健康度快照 |
| `top_relays_by_bandwidth(country?, flag?, limit)` | 依 consensus weight 取前 N 名，可选国家或旗标过滤 |
| `compare_relays(fingerprints)` | 并行抓多个 fingerprint 的 details 做并排比较 |
| `country_summary(country)` | 单一国家的 running 数量、总带宽、旗标分布 |
| `aggregate_relays(group_by, running, top)` | 依 country / AS / flag 做服务器端 group-by |

低阶透传（两种 transport 都提供）：

`get_summary` / `get_details` / `get_bandwidth` / `get_weights` / `get_clients` / `get_uptime`：对应 Onionoo 原生端点，吃一个 `params` dict，返回语义化包装后的 JSON。

> Streamable HTTP `/mcp` 提供六个低阶端点加上三个 aggregate（countries、as、flags），任务导向工具与整合的 `aggregate_relays` 则在 stdio 端提供。两种 transport 可同时使用。

### 范例：用 AI 代理盘点台湾 Tor 贡献

把 onionoo MCP 接上 Claude Desktop 或 Claude Code 后，可以直接问：

> 「帮我整理一份台湾 Tor 中继节点现况：总共多少个 running、总带宽、前五大 ASN，顺便挑出 consensus weight 最高的三个 relay，告诉我它们的 nickname 与所在 AS。」

代理会自动把问题拆成几个 MCP 工具调用，把结果汇总成一份报告（HTTP transport 下会用 `aggregate_countries` 加 `get_details`，stdio transport 下则可改用 `country_summary`、`aggregate_relays`、`top_relays_by_bandwidth` 等任务导向工具）。这类查询以往需要手动凑 Onionoo 参数、合并 JSON，现在一句话就能完成。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png"
            alt="Claude Opus 4.7 思考过程的截图：先说「我要找台湾的 relay 信息」、列出可能工具、然后决定先调用 aggregate_countries 找台湾那一列、再用 get_details 抓 country=tw 的 AS 信息、最后依 consensus weight 拉前三名。可以看到 aggregate_countries 这个工具调用已展开、返回 Result"
            title="Claude Opus 4.7 的工具调用展开过程"
            class="brand-frame">
    </a>
    <capture>展开模型侧的推理，可以看到代理一步一步说出要查什么、选哪个工具、结果回来后下一步要做什么。文字之间夹着实际的 <code>aggregate_countries</code>、<code>get_details</code> 工具调用，方便调试或微调 prompt。</capture>
</figure>

### 观测指标与运维

- `/healthz`：静态存活检查，不打上游。
- `/healthz/ready`：尝试打 Onionoo（结果有缓存），回 200 表示上游可达、503 表示不可达。
- `/metrics`：Prometheus 格式，含缓存命中率（`onionoo_cache_hits_total` 与 `_misses_total`）、上游延迟（`onionoo_upstream_seconds`）与错误率。
- 每个请求都有 `X-Request-ID`，可在 log 与响应 header 对应，方便调试。

## 参与与贡献

- **回报问题 / 提建议**：<https://github.com/anoni-net/onionoo-fastapi/issues>
- **想自己跑 Tor relay**：见 [如何搭建 Tor Relay](./setup-tor-relay.md)，相关观测指标在 [Tor Relays 观测点](../taiwan/tor-relay-watcher.md)。
- **出国前评估**：[出国前数字安全：用 AI 自助生成目的地概况](../scenarios/travel-ai-briefing.md)。记者、NGO 出国前要查目的地的 Tor 可达性时，接上 onionoo MCP 就能让 AI 查到真实、可引用的 Onionoo 数字。
- **延伸阅读**：[什么是 Tor？](../tools/what-is-tor.md)、[ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md)。

服务目前以 v1.0.0 发布，授权为 MIT。欢迎 issue、PR，或在 Matrix 上一起讨论之后该补哪些任务导向工具。

[^connector]: [Get started with custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp){target="_blank"} - Claude Help Center（自定义连接器在免费、Pro、Max、Team、Enterprise 方案皆可使用，免费方案限一个）。

[^chatgpt]: [Developer mode — apps and full MCP connectors in ChatGPT (beta)](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta){target="_blank"} - OpenAI Help Center（自定义 MCP connector 需在 Plus、Pro、Business、Enterprise、Edu 方案开启 Developer Mode，免费版不支持）。

[^gemini]: [Set up your custom MCP server data store](https://docs.cloud.google.com/gemini/enterprise/docs/connectors/custom-mcp-server/set-up-custom-mcp-server){target="_blank"} - Gemini Enterprise（Google Cloud）。消费版 Gemini 聊天 App 尚未提供在界面内贴网址接远端 MCP 的功能，开发端可用 [Gemini CLI](https://geminicli.com/docs/tools/mcp-server/){target="_blank"} 的 `mcpServers` 配置。
