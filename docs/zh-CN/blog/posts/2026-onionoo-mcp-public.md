---
date: 2026-05-19
authors:
    - toomore
categories:
    - 社区
    - 公告
slug: 2026-onionoo-mcp-public
image: "assets/images/post-update.png"
summary: "anoni.net 社区把 Tor Project 的 Onionoo 包成 MCP server 与语义化 HTTP API，公开在 onionoo.anoni.net 上线。接上 Claude Desktop 等 AI 客户端，用一句中文就能问台湾 Tor 中继节点现况。"
description: "anoni.net 社区把 Tor Project 的 Onionoo 包成 MCP server 与语义化 HTTP API，公开在 onionoo.anoni.net 上线。接上 Claude Desktop 等 AI 客户端，用一句中文就能问台湾 Tor 中继节点现况。"
---

# onionoo MCP 上线：用一句中文问 Tor 中继节点现况

![onionoo MCP 上线](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

匿名网络社区自架的 `onionoo-fastapi` 服务以 v1.0.0 对外公开，站点位于 <https://onionoo.anoni.net>。它把 Tor Project 官方的 [Onionoo](https://metrics.torproject.org/onionoo.html){target="_blank"} API 包成两种接口，一个是补上 OpenAPI 规范的语义化 HTTP API，一个是 Model Context Protocol（MCP）server。

接上 Claude Desktop、Cursor、Claude Code 等支持 MCP 的客户端后，用一句中文就能问「台湾目前有几个 Tor 中继节点，总带宽多少，前五大 ASN 是哪些」。AI 代理会自己拆问题、选工具、查资料、整理出可读报告，不必先学 Onionoo 的字段定义才能开始研究。

<!-- more -->

## 为什么要包这一层

Onionoo 的规范本身完整，但对 AI 代理来说有三个门槛。

- 没有 OpenAPI 描述，无法被 Swagger UI、Postman、code generator 自动消化。
- 字段短码（如 `r`、`f`、`n`、`a`）为了传输效率而设计，对语言模型不够语义化，模型容易误解 `r` 是 `relay` 还是 `running`。
- 一次查询常要组合多个端点（details、uptime、bandwidth），AI 代理重复拼凑容易出错。

`onionoo-fastapi` 把这些事情做掉。短码还原成 `nickname`、`fingerprint`、`addresses`、`running` 等语义名称，补上完整 OpenAPI 规范，并把几个常见任务包成单一 MCP 工具调用。想看某中继节点的健康状况时，调用一次就能拿到合并好的 details、uptime、bandwidth 快照，不必自己组三个端点。

服务本身**不储存**任何 Onionoo 数据，只负责转发与重新包装回应。上游数据来自 <https://onionoo.torproject.org>。

## 可以拿来问什么

接上 MCP 后，下面这几类问题都可以直接用自然语言丢给 AI 代理处理。

- **盘点某个国家的 Tor 贡献**：「整理一份台湾 Tor 中继节点现况，running 数量、总带宽、consensus weight、前五大 ASN，再挑出 consensus weight 最高的三个 relay。」
- **某个 ASN 底下的状况**：「列出 TANet（AS1659）目前所有 running 的 Tor 中继节点，回报旗标、带宽与在线时间。」
- **比对指纹**：「比较 `9695DFC35FFEB861329B9F1AB04C46397020CE31` 与 `847B1F850344D7876491A54892F904934E4EB85D` 这两个 relay 的版本、旗标、所在国家与 AS。」
- **单一中继节点健康度**：「告诉我 `moria1` 这个 relay 目前的状态、所在国家、最近一周的带宽走势与在线时间。」

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionoo-mcp-tw-summary-result.png"
            alt="Claude Desktop 整理出的台湾 Tor 中继节点现况报告，显示 running 数量、总带宽、consensus weight 与前 5 大 ASN 表格"
            title="Claude Desktop 整理出的台湾 Tor 中继节点现况报告"
            class="brand-frame">
    </a>
    <capture>Claude Desktop 接上 onionoo MCP 后，请模型「整理台湾 Tor 中继节点现况」回出的汇整报告。底层数值来自上游 Onionoo，这是某一时点的 snapshot。</capture>
</figure>

这类查询以往要先翻 Onionoo 文件、写脚本、合并 JSON、再整理表格，现在一句话就能拿到初步结果。盘点完再决定下一步要往哪钻，研究启动的成本差很多。

## 如何接上

### 给 AI 客户端用户

在 Claude Desktop、Cursor 或其他支持 MCP 的客户端，在配置文件的 `mcpServers` 区块加上：

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

存档、重启客户端，工具列表中就会出现 onionoo 这组工具，可以直接用自然语言要求代理查询。本机 stdio transport 安装方式、完整工具一览、权限调整、自架（Docker）等细节，完整使用文件都有写。

[:material-arrow-right-circle-outline: 阅读完整 onionoo MCP 使用文件](../../community/onionoo-mcp.md){ .md-button .md-button--primary }

### 给写程序直接调用的用户

每个端点都会回传语义化 JSON，可以直接用 `curl` 调用。

```bash
# 列出台湾的 relay，依 consensus weight 排序前 5 名
curl -s 'https://onionoo.anoni.net/v1/details?country=tw&running=true&order=-consensus_weight&limit=5' | jq .

# 按国家汇整目前 running 的中继节点数量
curl -s 'https://onionoo.anoni.net/v1/aggregate/countries?running=true' | jq .
```

完整端点与参数见 [Swagger UI](https://onionoo.anoni.net/docs){target="_blank"}，查询参数沿用 Onionoo 的 [官方规范](https://metrics.torproject.org/onionoo.html){target="_blank"}。

## 与既有观测工具的分工

anoni.net 目前在 Tor 观测这条线上有三个入口，可以依任务挑。

- **[Tor Relays 观测点](../../taiwan/tor-relay-watcher.md)**：图表面板，看台湾中继节点的数量与带宽趋势，适合想看走势的场合。
- **[ASNs 自治网络观测数据分析](../../taiwan/ooni-asn-coverage.md)**：OONI 观测数据的 ASN 涵盖分析，适合想知道哪些 ASN 的用户实际在被观测到。
- **onionoo MCP**（这次新增）：用问句快速做 ad-hoc 查询，适合想针对某个 relay、某个 ASN、某个国家盘点现况。

三个入口数据来源不同（Pulse 自己抓的历史时序、OONI 原始观测数据、Onionoo 即时 snapshot），互相补完，不重复。

## 参与与反馈

- 回报问题或提建议：<https://github.com/anoni-net/onionoo-fastapi/issues>
- 想讨论该补哪些任务导向工具、或请社区示范某类查询，欢迎到 [Matrix 公开 room](../../community/tools.md) 提出来。
- 想自己跑一份（例如在 .onion 服务、内网或实验环境），完整文件的「自架（Docker）」段落有 Docker 启动指令与环境变数列表。

服务以 MIT 授权释出，源代码在 <https://github.com/anoni-net/onionoo-fastapi>，任何 issue、PR 都欢迎。

## 相关阅读

- [onionoo MCP：Tor 中继节点查询服务](../../community/onionoo-mcp.md)：完整使用文件
- [Tor Relays 观测点](../../taiwan/tor-relay-watcher.md)
- [ASNs 自治网络观测数据分析](../../taiwan/ooni-asn-coverage.md)
- [什么是 Tor？](../../tools/what-is-tor.md)
