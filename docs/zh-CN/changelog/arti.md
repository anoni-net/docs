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
| 流量控制与拥塞控制 | ✅ 2.6.0 起永远启用，`flowctl-cc` 这个开关已移除 | 2.4.0 转 stable、2.6.0（2026-09）默认化 |
| Counter Galois Onion 加密（CGO） | ✅ 2.6.0 起永远启用 | 2.6.0（2026-09） |
| 嵌入非 Rust 语言（C FFI） | 🟡 RPC client 已有 C 友好接口，完整 FFI 规划中 | 进行中 |
| 中继（relay） | 🟡 开发中，官方明说不要拿去接公开网络 | 2.0.0（2026-02）到 2.6.0 持续推进 |
| 目录权威（directory authority） | 🟡 开发中，文档解析与 microdescriptor 计算已有雏形 | 2.0.0（2026-02）到 2.6.0 持续推进 |
| control-port 协议兼容 | ⬜ 不另行实现，改以 RPC 取代 | — |

图例：✅ 已完成　🟡 开发中　⬜ 不实现

客户端这一侧的能力已大致对齐 c-tor，能当 SOCKS 代理、连接与架设 onion 服务、走桥接与 pluggable transports。计划现在的主力放在中继端，还无法用 Arti 架设 Tor 中继，这部分目前只能用 c-tor。c-tor 的 control port 在 Arti 改以 RPC 接口取代，设计取向不同。

## 中继端做到哪里

2.6.0 随版附上一份 [`README_relay.md`](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/README_relay.md){target="_blank"}，把中继与目录权威要做的事列成清单并标出完成状态。这是目前最接近官方路线图的东西，开头第一句就是不要在公开 Tor 网络上运行 `arti-relay`。

依 2026 年 8 月那份清单，中继端的完成度：

| 区块 | 已完成 | 待办 |
|---|---|---|
| 基本运作（通道、电路、CREATE2、EXTEND2、ORPort） | 9 | 8 |
| 出口支持（DNS、BEGIN、RESOLVE、出口策略） | 0 | 5 |
| 目录缓存 | 0 | 13 |
| 自我检测（ORPort 可达性、带宽、DNS） | 0 | 3 |
| onion 服务支持（HsDir、引介、会合） | 0 | 3 |
| 安全功能（离线身份密钥、内存与 socket 层 DoS 防御） | 0 | 4 |
| 性能功能（缓冲区调校、电路调度、conflux） | 0 | 5 |
| 目录权威 | 0 | 28 |

已完成的九项集中在最底层：接受连入通道、双向通道认证、处理与递送 relay cell、CREATE2 与 CREATE\_FAST、EXTEND2、监听 ORPort。也就是说电路建得起来，但一个中继要能真的上线所需的其他东西几乎都还没开始，密钥生成与轮换、发布 router descriptor、带宽上限这些都还在待办。

那份清单自己注明 2026 年 8 月 11 日之后团队还没回头勾选，所以实际进度可能比表上更前面，2.6.0 就补上了 `ntor-v3` 的 CREATE2 握手与中继 DNS 解析器的初步设计。要追精确状态得看 [issue tracker](https://gitlab.torproject.org/tpo/core/arti/-/issues/){target="_blank"}。

## Arti 2.6.0

> 2026-09-01 · [CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"}

- 拥塞控制与 Counter Galois Onion 加密（CGO）改为永远启用，`flowctl-cc` 与 `counter-galois-onion` 两个 cargo feature 开关一并移除。用 `arti-client` 或 `tor-proto` 的项目升上来时要拿掉那两个开关。
- 中继端进展：支持 `ntor-v3` 的 CREATE2 握手、不再把认不得的电路 ID 当成通道协议违规、收到 DESTROY 的通道不再回送 DESTROY，另有中继 DNS 解析器与缓存的初步设计。
- 目录权威端进展：可以计算 microdescriptor、初步支持 Extra Info 文档、`DirMgr` 暂时可以当 `DirServer` 的后端。
- 随版附上 `README_relay.md`，列出中继与目录权威还要做哪些事，见上面的「中继端做到哪里」。
- 上游没有提到已被实际利用。这一版没有列出安全修补。

## Arti 2.5.1

> 2026-08-03 · [官方 CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"}

- 修补一个影响性能的重要错误：`XON` 消息原本把「每秒字节」误判为「每秒位」，导致允许传输的数据量少了 8 倍，现已修正。
- Onion 服务新增可配置连到 `AF_UNIX` 地址。
- 客户端与 onion 服务之间，在启用实验性 feature（`hsc-negotiate-extensions`、`hss-negotiate-extensions`）时，可协商拥塞控制与 Counter Galois Onion（CGO）加密。
- 持续往「Arti 作为 Tor 中继」开发，新增验证与处理传入中继消息的基础设施。

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
- 安全修补：一个低危问题。嵌入 arti 的应用程序如果也用了 `weak-table` 且开启 `ahash`，在没有硬件 AES 支持的机器上，抗拒绝服务的能力会变差（TROVE-2026-005）。

## Arti 2.1.0

> 2026-03-03 · [上游公告](https://blog.torproject.org/arti_2_1_0_released/){target="_blank"} · [完整翻译文章](../blog/posts/arti-210.md)

- 中继支持的内部建设、配置系统改用 `derive-deftly` 架构降低新增配置类型成本、RPC 接口持续打磨、MSRV 提升至 Rust 1.89.0。
- 安全修补三项，都是依赖包升级：`bytes` 升到 0.11.1，避开 `BytesMut::reserve()` 整数溢出造成的未定义行为（TROVE-2026-001、RUSTSEC-2026-0007）。`keccak` 升到 0.1.6，避开 ARMv8 汇编错误可能造成的未定义行为。`time` 升到 0.3.47，清掉 RUSTSEC-2026-0009 的审计警告。

## Arti 1.4.1

> 2025-03-16 · [上游公告](https://blog.torproject.org/arti_1_4_1_released/){target="_blank"} · [完整翻译文章](../blog/posts/arti-141.md)

- Arti 客户端例行更新，包含错误修正与稳定性改善，为后续中继支持与 RPC 工作铺路。

!!! info "更早的 Arti 版本"

    Arti 2.3.0 的完整摘要目前仅在 [正体中文版](https://anoni.net/docs/changelog/arti/){target="_blank"} 提供，简体中文版会随社群翻译滚动补上。
