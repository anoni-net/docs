---
title: Arti 更新日志
description: Arti（Tor Project 以 Rust 开发的新一代 Tor 实现）各版本更新的中文重点整理，方便华语读者掌握 RPC、relay 开发、配置系统等关键进展。
icon: material/code-tags
---

# :material-code-tags: Arti 更新日志

Arti 是 [Tor Project](../tools/what-is-tor.md) 以 Rust 开发的新一代 Tor 实现。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## Arti 2.2.0

> 2026-03-31 · [上游公告](https://blog.torproject.org/arti_2_2_0_released/){target="_blank"} · [完整翻译文章](../blog/posts/2026-arti-2-2-0-released-http-connect-rpc-and-relay-development.md)

- HTTP CONNECT 纳入完整构建并默认启用、RPC 管理能力增强、持续推进 relay 开发朝「Arti 可作为 Tor 中继」迈进。

## Arti 2.1.0

> 2026-03-18 · [上游公告](https://blog.torproject.org/arti_2_1_0_released/){target="_blank"} · [完整翻译文章](../blog/posts/arti-210.md)

- 中继支持的内部建设、配置系统改用 `derive-deftly` 架构降低新增配置类型成本、RPC 接口持续打磨、MSRV 提升至 Rust 1.89.0。

## Arti 1.4.1

> 2025-03-16 · [上游公告](https://blog.torproject.org/arti_1_4_1_released/){target="_blank"} · [完整翻译文章](../blog/posts/arti-141.md)

- Arti 客户端例行更新，包含错误修正与稳定性改善，为后续中继支持与 RPC 工作铺路。
