---
title: Arti 更新日志
description: Arti（Tor Project 以 Rust 开发的新一代 Tor 实现）各版本更新的中文重点整理，方便华语读者掌握 RPC、relay 开发、配置系统等关键进展。
icon: material/code-tags
---

# :material-code-tags: Arti 更新日志

Arti 是 [Tor Project](../tools/what-is-tor.md) 以 Rust 开发的新一代 Tor 实现。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## c-tor 移植到 Rust 的进度

Arti 是 Tor Project 从 2021 年开始的计划，把原本用 C 写成的 Tor（社群惯称 c-tor）整套以 Rust 重写，换取更好的内存安全、模块化架构与可嵌入性。开发顺序先把客户端补到足以取代 c-tor，再往中继端推进。下表依据官方 [CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"} 与 release notes 整理，状态以实际发布的功能为准。

| 功能领域 | 进度 | 完成 / 进行的版本 |
|---|---|---|
| 客户端核心（SOCKS 代理、`arti-client` 嵌入库） | ✅ 已完成，宣告 stable | 1.0.0（2022-09） |
| DNS 代理 | ✅ 已完成 | 1.0.0（2022-09） |
| 抗审查：桥接与 pluggable transports（obfs4、Snowflake、WebTunnel） | ✅ 已完成 | 1.1.0（2022-11） |
| 连接 onion 服务（客户端） | ✅ 已完成 | 1.1.6（2023-06） |
| 架设 onion 服务（服务端，含 full vanguards、限制性发现、客户端授权） | ✅ 已完成 | 1.2.0（2024-03）起 |
| RPC 控制接口（取代 c-tor 的 control port） | ✅ 已完成，转 stable | 1.4.2（2025-03） |
| HTTP CONNECT 代理 | ✅ 已完成，默认启用 | 2.2.0（2026-03） |
| 流量控制与拥塞控制（`flowctl-cc`，为 conflux 铺路） | ✅ 已完成，转 stable | 2.4.0（2026-06） |
| 嵌入非 Rust 语言（C FFI） | 🟡 RPC client 已有 C 友好接口，完整 FFI 规划中 | 进行中 |
| 中继（relay）：circuit reactor、relay channel、握手响应、TLS server 端 | 🟡 开发中，尚不可用 | 2.0.0（2026-02）起 |
| 目录权威（directory authority）：证书管理、目录缓存 | 🟡 开发中，尚不可用 | 2.0.0（2026-02）起 |
| control-port 协议兼容 | ⬜ 不另行实现，改以 RPC 取代 | — |

图例：✅ 已完成　🟡 开发中　⬜ 不实现

客户端这一侧的能力已大致对齐 c-tor，能当 SOCKS 代理、连接与架设 onion 服务、走桥接与 pluggable transports。计划现在的主力放在中继端，relay 与 directory authority 仍在开发，还无法用 Arti 架设 Tor 中继，这部分目前只能用 c-tor。c-tor 的 control port 在 Arti 改以 RPC 接口取代，设计取向不同。

## Arti 2.5.0

> 2026-06-30 · [上游公告](https://blog.torproject.org/arti_2_5_0_released/){target="_blank"}

- Counter Galois Onion（CGO）加密正式列为稳定（启用 `counter-galois-onion` feature 或 `full`）、拥塞控制（`flowctl-cc`）改为默认启用、持续推进 relay 与 directory authority 开发（新增 router descriptor、microdescriptor 与 consensus 编解码）、MSRV 提升至 Rust 1.91。
- 修补两个中危拒绝服务（DoS）漏洞：TROVE-2026-24（恶意目录镜像可触发 `tor-netdoc` parser crash，最终停掉 `tor-dirmgr` 任务）、TROVE-2026-27（低效算法可被利用拖垮 CPU），两者皆未发现实际被利用。

## Arti 2.4.0

> 2026-06-01 · [上游公告](https://blog.torproject.org/arti_2_4_0_released/){target="_blank"}

- 持续推进「Arti 作为 Tor 中继」与「Arti 作为 directory authority」开发、修补多个影响 onion 服务客户端连接的错误、流量控制与拥塞控制（flowctl-cc）正式列为稳定、`arti-client` 的 `TorClient` API 出现多项破坏性变更。

## Arti 2.2.0

> 2026-03-31 · [上游公告](https://blog.torproject.org/arti_2_2_0_released/){target="_blank"} · [完整翻译文章](../blog/posts/2026-arti-2-2-0-released-http-connect-rpc-and-relay-development.md)

- HTTP CONNECT 纳入完整构建并默认启用、RPC 管理能力增强、持续推进 relay 开发朝「Arti 可作为 Tor 中继」迈进。

## Arti 2.1.0

> 2026-03-18 · [上游公告](https://blog.torproject.org/arti_2_1_0_released/){target="_blank"} · [完整翻译文章](../blog/posts/arti-210.md)

- 中继支持的内部建设、配置系统改用 `derive-deftly` 架构降低新增配置类型成本、RPC 接口持续打磨、MSRV 提升至 Rust 1.89.0。

## Arti 1.4.1

> 2025-03-16 · [上游公告](https://blog.torproject.org/arti_1_4_1_released/){target="_blank"} · [完整翻译文章](../blog/posts/arti-141.md)

- Arti 客户端例行更新，包含错误修正与稳定性改善，为后续中继支持与 RPC 工作铺路。

!!! info "更早的 Arti 版本"

    Arti 2.3.0 的完整摘要目前仅在 [正体中文版](https://anoni.net/docs/changelog/arti/){target="_blank"} 提供，简体中文版会随社群翻译滚动补上。
