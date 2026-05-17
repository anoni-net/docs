---
date: 2026-05-19
authors:
    - toomore
categories:
    - Community
    - News
slug: 2026-onionoo-mcp-public
image: "assets/images/post-update.png"
summary: "The community's onionoo-fastapi service is now public at onionoo.anoni.net. Connect any MCP-capable AI client and ask about the live Tor relay network in plain language."
description: "The community's onionoo-fastapi service is now public at onionoo.anoni.net. Connect any MCP-capable AI client and ask about the live Tor relay network in plain language."
---

# onionoo MCP is now public: query the Tor relay network in plain language

![onionoo MCP launch](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

The community-hosted `onionoo-fastapi` service is now public at <https://onionoo.anoni.net>, released as v1.0.0. It wraps the Tor Project's official [Onionoo](https://metrics.torproject.org/onionoo.html){target="_blank"} API in two interfaces: a semantic HTTP API with a full OpenAPI document, and a Model Context Protocol (MCP) server.

Connect it to Claude Desktop, Cursor, Claude Code, or any MCP-capable client and you can ask a single question like "how many running Tor relays does Taiwan have right now, what is the total bandwidth, and what are the top five ASNs?" The agent breaks the question down, picks tools, fetches the data, and returns a readable summary. You do not need to learn Onionoo's field schema before starting research.

<!-- more -->

## Why wrap Onionoo at all

Onionoo's specification is complete, but it has three hurdles for AI agents.

- It has no OpenAPI description, so Swagger UI, Postman, and code generators cannot consume it directly.
- Its compact field names (`r`, `f`, `n`, `a`, and so on) are designed for transport efficiency, not semantic clarity. Language models routinely confuse `r` with `relay` or `running`.
- A single useful query often spans multiple endpoints (`details` plus `uptime` plus `bandwidth`). Agents that hand-roll that composition tend to make mistakes.

`onionoo-fastapi` takes care of those problems. Compact codes are renamed to `nickname`, `fingerprint`, `addresses`, `running`, and so on. A full OpenAPI document is published. Common multi-endpoint tasks are exposed as single MCP tool calls. One call returns the merged `details`, `uptime`, and `bandwidth` snapshot for a relay, instead of you stitching three endpoints together.

The service does **not** store any Onionoo data. It only forwards requests and reshapes responses. The upstream is <https://onionoo.torproject.org>.

## What you can ask

Once connected, you can hand the following sorts of questions to the agent in plain language.

- **Audit a country's Tor footprint**: "Summarize Taiwan's running Tor relays. Count, total bandwidth, consensus weight, top five ASNs, and pick the three relays with the highest consensus weight."
- **Inspect a specific ASN**: "List all running Tor relays under TANet (AS1659), including their flags, bandwidth, and uptime."
- **Compare fingerprints**: "Compare `9695DFC35FFEB861329B9F1AB04C46397020CE31` and `847B1F850344D7876491A54892F904934E4EB85D`. Versions, flags, country, and AS."
- **Single-relay health check**: "Tell me the current status of relay `moria1`. Country, last week's bandwidth trend, and uptime."

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result-en.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result-en.png"
            alt="Claude Desktop's summary report for Taiwan's Tor relays: running count, total bandwidth, consensus weight, and a top-5 ASN table"
            title="Claude Desktop's Taiwan Tor relay summary"
            class="brand-frame">
    </a>
    <capture>Claude Desktop connected to onionoo MCP, replying to "Summarize Taiwan's Tor relays" with a structured report. The numbers come from upstream Onionoo and represent a point-in-time snapshot.</capture>
</figure>

The pre-MCP version of this workflow meant skimming the Onionoo docs, writing a script, merging JSON, and formatting a table. A single sentence now gets you to a first-cut answer, and the cost of starting a piece of research drops sharply.

## How to connect

### For AI client users

In Claude Desktop, Cursor, or any other MCP-capable client, add this to the `mcpServers` section of the config:

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

Save the config, restart the client, and the `onionoo` tool set will appear in the tool list. The full guide covers local stdio transport setup, all available tools, permission options, and self-hosted (Docker) instructions.

[:material-arrow-right-circle-outline: Read the full onionoo MCP guide](../../community/onionoo-mcp.md){ .md-button .md-button--primary }

### For direct API users

Each endpoint returns semantic JSON and can be called with `curl`:

```bash
# Taiwan relays, top 5 by consensus weight
curl -s 'https://onionoo.anoni.net/v1/details?country=tw&running=true&order=-consensus_weight&limit=5' | jq .

# Running relay counts aggregated by country
curl -s 'https://onionoo.anoni.net/v1/aggregate/countries?running=true' | jq .
```

The full endpoint list and parameters are in the [Swagger UI](https://onionoo.anoni.net/docs){target="_blank"}. Query parameters follow Onionoo's [official specification](https://metrics.torproject.org/onionoo.html){target="_blank"}.

## Where this fits alongside our other observation tools

anoni.net now has three entry points for Tor network observation, each suited to a different task.

- **[Tor Relays watcher](https://anoni.net/docs/zh-tw/taiwan/tor-relay-watcher/){target="_blank"}** (Mandarin): chart dashboards for Taiwan's relay counts and bandwidth trends. Good when you want to see how something has moved over time.
- **[ASN observation coverage analysis](https://anoni.net/docs/zh-tw/taiwan/ooni-asn-coverage/){target="_blank"}** (Mandarin): OONI observation data broken down by ASN. Good when you want to know which ASNs are actually being measured.
- **onionoo MCP** (new): ask ad-hoc questions in plain language. Good when you want to scope out a specific relay, ASN, or country.

The three rely on different data sources (Pulse's own historical time series, OONI's raw observation data, and Onionoo's live snapshots) and complement each other rather than duplicate.

## Contribute or report back

- File issues or feature requests: <https://github.com/anoni-net/onionoo-fastapi/issues>
- To discuss which task-oriented tools we should add next, or to ask the community to demonstrate a particular query, drop by our [Matrix room](https://anoni.net/docs/zh-tw/community/tools/){target="_blank"} (the landing page is in Mandarin, English is welcome in the room).
- To run your own instance (for a .onion service, internal network, or experimentation), the "Self-hosting (Docker)" section of the full guide has Docker commands and the full environment variable list.

The service is released under the MIT license. Source code: <https://github.com/anoni-net/onionoo-fastapi>. Issues and PRs welcome.

## Related reading

- [onionoo MCP: a query service for Tor relays](../../community/onionoo-mcp.md) — full usage guide
- [Tor Relays watcher](https://anoni.net/docs/zh-tw/taiwan/tor-relay-watcher/){target="_blank"} (Mandarin)
- [ASN observation coverage analysis](https://anoni.net/docs/zh-tw/taiwan/ooni-asn-coverage/){target="_blank"} (Mandarin)
- [What is Tor?](https://anoni.net/docs/zh-tw/tools/what-is-tor/){target="_blank"} (Mandarin)
