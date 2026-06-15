---
title: Arti Changelog
description: English summaries of Arti releases, the Rust implementation of Tor under development by the Tor Project, with notes on RPC, relay development, and configuration system progress.
icon: material/code-tags
---

# :material-code-tags: Arti Changelog

Arti is the Tor Project's next-generation Tor implementation written in Rust. Newest at the top. Each entry links back to the full translation.

## c-tor to Rust porting progress

Arti is the Tor Project's effort, started in 2021, to rewrite the original C implementation of Tor (which the community calls c-tor) entirely in Rust, gaining better memory safety, a modular architecture, and embeddability. The plan is to bring the client to parity with c-tor first, then move on to the relay side. The table below is compiled from the upstream [CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"} and release notes, with status reflecting features that have actually shipped.

| Feature area | Status | Landed / in progress |
|---|---|---|
| Client core (SOCKS proxy, `arti-client` embedding library) | ✅ Done, declared stable | 1.0.0 (2022-09) |
| DNS proxy | ✅ Done | 1.0.0 (2022-09) |
| Anti-censorship: bridges and pluggable transports (obfs4, Snowflake, WebTunnel) | ✅ Done | 1.1.0 (2022-11) |
| Connecting to onion services (client) | ✅ Done | 1.1.6 (2023-06) |
| Hosting onion services (service side, incl. full vanguards, restricted discovery, client auth) | ✅ Done | since 1.2.0 (2024-03) |
| RPC control interface (replaces c-tor's control port) | ✅ Done, now stable | 1.4.2 (2025-03) |
| HTTP CONNECT proxy | ✅ Done, enabled by default | 2.2.0 (2026-03) |
| Flow control and congestion control (`flowctl-cc`, paving the way for conflux) | ✅ Done, now stable | 2.4.0 (2026-06) |
| Embedding from non-Rust languages (C FFI) | 🟡 RPC client already has a C-friendly interface; full FFI planned | In progress |
| Relay: circuit reactor, relay channels, handshake responses, TLS server side | 🟡 In development, not usable yet | since 2.0.0 (2026-02) |
| Directory authority: certificate management, directory cache | 🟡 In development, not usable yet | since 2.0.0 (2026-02) |
| control-port protocol compatibility | ⬜ Not reimplemented; replaced by RPC | — |

Legend: ✅ Done　🟡 In development　⬜ Not implemented

On the client side, Arti's capabilities are now largely on par with c-tor: it works as a SOCKS proxy, connects to and hosts onion services, and runs over bridges and pluggable transports. The project's current focus is the relay side. Relay and directory authority support are still under development, so you cannot yet run a Tor relay with Arti, which still requires c-tor. Arti replaces c-tor's control port with the RPC interface, a different design approach.

## Arti 2.4.0

> 2026-06-01 · [Upstream announcement](https://blog.torproject.org/arti_2_4_0_released/){target="_blank"}

- Continued development toward running Arti as a relay and as a directory authority, fixes for several onion service client connectivity bugs, flow control and congestion control (flowctl-cc) now stable, and multiple breaking changes to the `arti-client` `TorClient` APIs.

## Arti 2.2.0

> 2026-03-31 · [Upstream announcement](https://blog.torproject.org/arti_2_2_0_released/){target="_blank"} · [Full translation](../blog/posts/2026-arti-2-2-0-released-http-connect-rpc-and-relay-development.md)

- HTTP CONNECT included in the full build and enabled by default, stronger RPC management capabilities, continued progress toward making Arti usable as a Tor relay.

!!! info "Earlier versions"

    Translations of Arti 2.3.0, 2.1.0, and 1.4.1 are currently available only in [traditional Chinese](https://anoni.net/docs/changelog/arti/){target="_blank"}. English versions will be added as the community translates them.
