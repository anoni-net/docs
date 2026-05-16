---
title: onionoo MCP — a query service for Tor relays
description: A community-hosted Onionoo proxy that exposes the Tor relay metadata API as both an OpenAPI-described HTTP service and an MCP server, so AI agents and tooling can query Tor relays without wrangling raw Onionoo.
icon: material/api
---

# :material-api: onionoo MCP — a query service for Tor relays

[Onionoo](https://metrics.torproject.org/onionoo.html){target="_blank"} is the Tor Project's metadata API for Tor relays and bridges. Anyone can query it over HTTP for the current state of the network: fingerprints, IPs, country and ASN, consensus flags (Guard, Exit, HSDir, and so on), bandwidth history, and uptime time series. The Tor Project's own [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"} and most third-party Tor dashboards are powered by it.

`onionoo-fastapi` is a community-hosted wrapper around Onionoo. It exposes the same data through two interfaces that are easier for tooling and AI agents to consume:

- **Semantic HTTP API with OpenAPI / Swagger**. Onionoo's compact field names (`n`, `f`, `a`, `r`, and friends) are remapped to readable ones (`nickname`, `fingerprint`, `addresses`, `running`), and the whole surface is described with a real OpenAPI document.
- **[Model Context Protocol (MCP)](https://modelcontextprotocol.io/){target="_blank"} server**. Claude Desktop, Cursor, Claude Code, and other MCP clients can query relays through tool calls instead of hand-rolling HTTP requests.

The service does **not** store any Onionoo data. It only forwards requests and reshapes responses. The upstream is <https://onionoo.torproject.org>.

- **Hosted instance**: <https://onionoo.anoni.net>
- **Swagger UI**: <https://onionoo.anoni.net/docs>
- **MCP endpoint**: `https://onionoo.anoni.net/mcp` (Streamable HTTP)
- **Source code**: <https://github.com/anoni-net/onionoo-fastapi> (MIT, currently v1.0.0)

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-swagger.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-swagger.png"
            alt="Swagger UI for onionoo.anoni.net showing Onionoo FastAPI Proxy v1.0.0 with endpoints /healthz, /metrics, /v1/summary, /v1/details, /v1/bandwidth, /v1/weights, /v1/clients"
            title="Swagger UI for onionoo.anoni.net"
            class="brand-frame">
    </a>
    <capture>The Swagger UI at <code>onionoo.anoni.net/docs</code>. Every <code>/v1/*</code> endpoint has a full schema and a Try-it-out button for ad-hoc testing.</capture>
</figure>

## Why this service

Onionoo's specification is solid, but it ships **without an OpenAPI description**, and its field names are short (optimized for transfer size). That works for a human writing a client by hand. It is less friendly to AI agents and third-party tooling:

- No OpenAPI means tools like Swagger UI, Postman, or code generators can't introspect it.
- The short field names confuse language models — is `r` a relay or just `running`?
- A single user question often needs several endpoints stitched together (`/details` + `/uptime` + `/bandwidth`). Agents that re-derive that orchestration from scratch each time make mistakes.

`onionoo-fastapi` fixes all three: it ships an OpenAPI spec, exposes readable field names, and bundles common multi-endpoint tasks into single MCP tools (for example, "give me the health of this relay" is one call).

## How to use it

### 1. As an MCP server (recommended for AI-agent users)

In **Claude Desktop, Cursor, or any MCP-capable client**, add this to the `mcpServers` block of your config:

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

Save, restart the client, and an `onionoo` tool group appears in the tool list. From there you can ask the agent things like:

- "Find the Tor relay named `moria1` and report its status and country."
- "List the top 10 Taiwanese (TW) relays by consensus weight."
- "Compare the two fingerprints `9695DFC35FFEB861329B9F1AB04C46397020CE31` and `847B1F850344D7876491A54892F904934E4EB85D` — versions and flags."
- "Give me Taiwan's current Tor footprint: running relay count, total bandwidth, flag distribution."

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-claude-desktop.png"
            alt="Claude Desktop Connectors panel showing onionoo as a CUSTOM connector pointed at https://onionoo.anoni.net/mcp, with nine tools listed: aggregate_as, aggregate_countries, aggregate_flags, get_bandwidth, get_clients, get_details, get_summary, get_uptime, get_weights"
            title="Claude Desktop Connectors panel with the onionoo MCP connector configured"
            class="brand-frame">
    </a>
    <capture>After configuration, Claude Desktop's Connectors panel shows <code>onionoo</code> with nine tools — the six low-level endpoints plus three aggregates — all exposed through the Streamable HTTP transport. Each tool's approval requirement can be tuned per use case.</capture>
</figure>

To run it locally without depending on the hosted instance, use the stdio transport:

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

You will need [`uv`](https://docs.astral.sh/uv/){target="_blank"} installed (`brew install uv` on macOS; see the official docs for Linux).

### 2. As an HTTP API (recommended for programmatic clients)

Every endpoint returns semantic JSON with a `_meta` envelope indicating cache state:

```bash
# Details for moria1 — only return nickname and fingerprint
curl -s 'https://onionoo.anoni.net/v1/details?search=moria&fields=nickname,fingerprint' | jq .

# Taiwan's relays, sorted by consensus weight
curl -s 'https://onionoo.anoni.net/v1/details?country=tw&running=true&order=-consensus_weight&limit=5' | jq .

# Per-country aggregation of currently running relays
curl -s 'https://onionoo.anoni.net/v1/aggregate/countries?running=true' | jq .
```

For the full list of endpoints, parameters, and response fields, see the [Swagger UI](https://onionoo.anoni.net/docs){target="_blank"}. Query parameters mirror Onionoo's [protocol specification](https://metrics.torproject.org/onionoo.html){target="_blank"}.

### 3. Self-host with Docker

If you want to run your own copy (for a `.onion` service, an internal network, or experimentation):

```bash
git clone https://github.com/anoni-net/onionoo-fastapi
cd onionoo-fastapi
docker compose up -d --build
```

It listens on port `8000` by default. OpenAPI docs are at `http://localhost:8000/docs`, the MCP endpoint at `http://localhost:8000/mcp`.

Common settings (via environment variables):

| Variable | Purpose | Default |
|---|---|---|
| `ONIONOO_BASE_URL` | Upstream Onionoo URL | `https://onionoo.torproject.org` |
| `CACHE_MAXSIZE` / `CACHE_DEFAULT_TTL_SECONDS` | In-memory cache size and TTL | `1024` / `300` s |
| `RATE_LIMIT_ENABLED` / `RATE_LIMIT_PER_MINUTE` | Per-IP rate limiting | `false` / `120` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | empty (CORS off) |
| `LOG_FORMAT` | `json` or `console` | `json` |
| `METRICS_ENABLED` | Expose `/metrics` in Prometheus format | `true` |

For the full list, see the [README](https://github.com/anoni-net/onionoo-fastapi#configuration){target="_blank"}.

## MCP tools at a glance

### Task-oriented tools (stdio transport, recommended for agents)

| Tool | Purpose |
|---|---|
| `find_relay(query)` | Free-form lookup; auto-detects whether the query is a 40-character fingerprint, an AS number, an IP, or a nickname substring |
| `get_relay_health(fingerprint)` | A composite health snapshot — details + uptime + bandwidth in one call |
| `top_relays_by_bandwidth(country?, flag?, limit)` | Top-N relays by consensus weight, optionally filtered by country or flag |
| `compare_relays(fingerprints)` | Fetches details for several fingerprints in parallel for side-by-side comparison |
| `country_summary(country)` | Running count, total bandwidth, and flag distribution for one country |
| `aggregate_relays(group_by, running, top)` | Server-side group-by over country / AS / flag |

### Low-level pass-through (both transports)

`get_summary` / `get_details` / `get_bandwidth` / `get_weights` / `get_clients` / `get_uptime`: thin wrappers over the corresponding Onionoo endpoints. Each takes a `params` dict and returns the semantically renamed JSON.

> The Streamable HTTP endpoint at `/mcp` exposes the six low-level wrappers plus three aggregate tools (countries, as, flags). The task-oriented tools and the unified `aggregate_relays` live on the stdio transport. The two transports can run side by side.

## Example: surveying Taiwan's Tor footprint with an agent

Once `onionoo` MCP is wired into Claude Desktop or Claude Code, you can ask:

> "Give me a summary of Taiwan's current Tor relays: how many are running, total bandwidth, top 5 ASNs, and pick out the three relays with the highest consensus weight — tell me their nicknames and which AS they're in."

The agent breaks the question into a handful of MCP tool calls (over the HTTP transport, that's typically `aggregate_countries` plus `get_details`; over stdio, the task-oriented tools `country_summary`, `aggregate_relays`, and `top_relays_by_bandwidth` are available too) and assembles a single report. Queries like this previously meant manually composing Onionoo parameters and merging JSON. Now they are a single sentence.

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png"
            alt="Claude Desktop response from Opus 4.7 summarizing Taiwan's Tor relays: 13 running relays, total bandwidth ~39.2 MiB/s (~329 Mbps), consensus weight 8,570, with a top-5 ASN table (AS3462 Chunghwa Telecom 10 relays, AS1659 TANet, AS9416 Hoshin Multimedia, AS18041 Taiwan Digital Streaming each 1 relay)"
            title="Claude Desktop's summary of Taiwan's current Tor footprint"
            class="brand-frame">
    </a>
    <capture>The model's final summary — running count, total bandwidth, consensus weight, and ASN distribution in one place. Numbers come from upstream Onionoo and are a point-in-time snapshot; values shift as the network evolves.</capture>
</figure>

Expanding the model's reasoning shows it asking the MCP server which tools are available, then planning which ones to combine:

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tool-use-detail.png"
            alt="Claude Opus 4.7 thinking trace: stating it needs Taiwan relay info, listing candidate tools, deciding to call aggregate_countries to find Taiwan's row, then get_details with country=tw to pull AS information, and finally to fetch the top three by consensus weight. The aggregate_countries tool call is shown expanded with a Result chip"
            title="Claude Opus 4.7's expanded tool-use trace"
            class="brand-frame">
    </a>
    <capture>The agent narrates its plan — what to query, which tool to pick, what to do with the response — with the actual <code>aggregate_countries</code> and <code>get_details</code> tool calls inlined. The full MCP interaction is visible, which makes debugging and prompt tuning much easier.</capture>
</figure>

## Observability and operations

- `/healthz`: static liveness check, never hits upstream.
- `/healthz/ready`: pings Onionoo (cached) — 200 if reachable, 503 otherwise.
- `/metrics`: Prometheus format. Includes cache hit/miss counters (`onionoo_cache_hits_total` and `_misses_total`), upstream latency (`onionoo_upstream_seconds`), and error rates.
- Every request gets an `X-Request-ID` echoed in the response header and bound into log records — handy for correlating issues.

## Get involved

- **Report bugs or suggest tools**: <https://github.com/anoni-net/onionoo-fastapi/issues>
- **Want to run your own Tor relay?** See the [Tor Relays Observatory](../regional/tor-relay-watcher.md) for the data we publish on relays in the region.
- **Background reading**: the [About page](../about/index.md) covers governance and how the wider site fits together; the [Regional Observatory](../regional/index.md) is where this service's outputs feed back into public analysis.

Released as v1.0.0 under MIT. Issues, PRs, and Matrix discussion on which task-oriented tools to add next are all welcome.
