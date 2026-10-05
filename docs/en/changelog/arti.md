---
title: Arti Changelog
description: English summaries of Arti releases, the Rust implementation of Tor under development by the Tor Project, with notes on RPC, relay development, and configuration system progress.
icon: material/code-tags
digest:
  name: Arti
  devices: [relay]
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
| Flow control and congestion control | ✅ Always on since 2.6.0; the `flowctl-cc` flag is gone | Stable in 2.4.0, on by default in 2.6.0 (2026-09) |
| Counter Galois Onion cryptography (CGO) | ✅ Always on since 2.6.0 | 2.6.0 (2026-09) |
| Embedding from non-Rust languages (C FFI) | 🟡 RPC client already has a C-friendly interface; full FFI planned | In progress |
| Relay | 🟡 In development; upstream says explicitly not to point it at the public network | 2.0.0 (2026-02) through 2.7.0 |
| Directory authority | 🟡 In development; document parsing and microdescriptor generation have early shape | 2.0.0 (2026-02) through 2.7.0 |
| control-port protocol compatibility | ⬜ Not reimplemented; replaced by RPC | — |

Legend: ✅ Done　🟡 In development　⬜ Not implemented

On the client side, Arti's capabilities are now largely on par with c-tor: it works as a SOCKS proxy, connects to and hosts onion services, and runs over bridges and pluggable transports. The project's current focus is the relay side. Relay and directory authority support are still under development, so you cannot yet run a Tor relay with Arti, which still requires c-tor. Arti replaces c-tor's control port with the RPC interface, a different design approach.

## How far the relay side has got

2.6.0 ships a [`README_relay.md`](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/README_relay.md){target="_blank"} listing what relay and directory authority support still needs, with completion marked. It is the closest thing to an official roadmap right now, and its opening line is not to run `arti-relay` on the public Tor network.

Per that list, as of August 2026:

| Area | Done | To do |
|---|---|---|
| Basic operations (channels, circuits, CREATE2, EXTEND2, ORPort) | 9 | 8 |
| Exit support (DNS, BEGIN, RESOLVE, exit policies) | 0 | 5 |
| Directory cache | 0 | 13 |
| Self-testing (ORPort reachability, bandwidth, DNS) | 0 | 3 |
| Onion service support (HsDir, introduction, rendezvous) | 0 | 3 |
| Security features (offline identity keys, memory and socket DoS defences) | 0 | 4 |
| Performance features (buffer tuning, circuit scheduling, conflux) | 0 | 5 |
| Directory authority | 0 | 28 |

The nine finished items sit at the lowest layer: accepting incoming channels, bidirectional channel authentication, processing and delivering relay cells, CREATE2 and CREATE\_FAST, EXTEND2, and listening on ORPort. Circuits can be built, in other words, but almost everything else a relay needs to actually go live is untouched, including key generation and rotation, publishing router descriptors, and bandwidth caps.

The list notes that the team had not revisited the checkboxes since 11 August 2026, so real progress may run ahead of it: 2.6.0 alone added `ntor-v3` CREATE2 handshakes and an initial design for the relay DNS resolver. For exact status, the [issue tracker](https://gitlab.torproject.org/tpo/core/arti/-/issues/){target="_blank"} is authoritative.

## Arti 2.7.0

> 2026-10-01 · [Upstream announcement](https://blog.torproject.org/arti_2_7_0_released/){target="_blank"} · [CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"}

- Twelve security fixes in one release: one High, five Medium and six Low, affecting `arti`, `arti-client`, `arti-ureq` and other crates. Upstream does not mention active exploitation.
- The High one is in the handling of half-streams (streams one side has closed while the other may still be sending). They could be used to exhaust memory and to mount what upstream calls a "dropped cells" side-channel attack (TROVE-2026-047).
- Most of the five Medium fixes concern directory data. Parsing and decompressing the consensus (the document listing every relay in the Tor network) and its diffs could use excessive memory (TROVE-2026-028, 029). The parser was stricter than the directory authorities' and could fail to read the consensus (TROVE-2026-048). A directory mirror could stall Arti on the HTTP headers and keep it from updating the consensus and descriptors (TROVE-2026-046). The last one filters local addresses out of RESOLVED responses (TROVE-2026-044).
- Upstream updated its security policy: it no longer requests CVE identifiers for Arti security issues and uses identifiers such as TROVE and RUSTSEC instead. Anyone packaging Arti for a distribution needs to track those.
- The minimum supported Rust version rises to 1.92. RPC gains support for inspecting and modifying the configuration.
- Relay progress: the temporary `DirMgr`-based directory server backend is enabled, relay circuits can send and receive stream-level SENDMEs (the acknowledgements used for flow control), the relay DNS resolver has an initial implementation (handling RESOLVE for now), and a bandwidth pool utility lays groundwork for future rate limiting.
- Directory authority progress: groundwork for the consensus-from-votes algorithm, and the directory server can now store a consensus in its database.
- On the client side, the pathbias-lite thresholds (the mechanism that flags unusual circuit failures and suspects the guard) for triggering guard restrictions are relaxed, and the fallback relay list is refreshed to a version generated on 8 September.
- `README_relay.md` was not updated in this release, so the table under "How far the relay side has got" still reflects the August list.

## Arti 2.6.0

> 2026-09-01 · [CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"}

- Congestion control and Counter Galois Onion (CGO) cryptography are now always on, and the `flowctl-cc` and `counter-galois-onion` cargo features have been removed. Projects using `arti-client` or `tor-proto` need to drop those flags when upgrading.
- Relay progress: CREATE2 with `ntor-v3` handshakes, unrecognised circuit IDs no longer treated as a channel protocol violation, no more DESTROY sent back on channels that received one, plus an initial design for the relay DNS resolver and cache.
- Directory authority progress: microdescriptors can now be computed, Extra Info documents have initial support, and `DirMgr` can serve as a `DirServer` backend for now.
- Ships `README_relay.md`, listing what relay and directory authority support still needs. See "How far the relay side has got" above.
- Upstream does not mention active exploitation. This release lists no security fixes.

## Arti 2.5.1

> 2026-08-03 · [Official CHANGELOG](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md){target="_blank"}

- Fixed an important performance bug: `XON` messages were interpreting bytes-per-second as bits-per-second, causing Arti to send 8x less data than allowed. This is now corrected.
- Onion services can now be configured to connect to `AF_UNIX` addresses.
- Clients and onion services can negotiate congestion control and Counter Galois Onion (CGO) encryption with each other when the experimental `hsc-negotiate-extensions` and `hss-negotiate-extensions` features are enabled.
- Continued progress toward "Arti as a Tor relay," adding infrastructure for validating and handling incoming relay messages.

## Arti 2.5.0

> 2026-06-30 · [Upstream announcement](https://blog.torproject.org/arti_2_5_0_released/){target="_blank"}

- Counter Galois Onion (CGO) cryptography is now stable (enable the `counter-galois-onion` feature, or `full`), congestion control (`flowctl-cc`) is now on by default, relay and directory-authority development continues (added encoding/decoding for router descriptors, microdescriptors, and consensuses), and the MSRV moves to Rust 1.91.
- Fixes two medium-severity denial-of-service issues: TROVE-2026-24 (a malicious directory mirror could trigger a `tor-netdoc` parser crash that eventually stalls the `tor-dirmgr` task) and TROVE-2026-27 (an inefficient algorithm could be exploited to stall the CPU); neither has been observed in the wild.

## Arti 2.4.0

> 2026-06-01 · [Upstream announcement](https://blog.torproject.org/arti_2_4_0_released/){target="_blank"}

- Continued development toward running Arti as a relay and as a directory authority, fixes for several onion service client connectivity bugs, flow control and congestion control (flowctl-cc) now stable, and multiple breaking changes to the `arti-client` `TorClient` APIs.

## Arti 2.2.0

> 2026-03-31 · [Upstream announcement](https://blog.torproject.org/arti_2_2_0_released/){target="_blank"} · [Full translation](../blog/posts/2026-arti-2-2-0-released-http-connect-rpc-and-relay-development.md)

- HTTP CONNECT included in the full build and enabled by default, stronger RPC management capabilities, continued progress toward making Arti usable as a Tor relay.
- Security fix: one low-severity issue. An application embedding arti that also pulls in `weak-table` with `ahash` enabled becomes somewhat less DoS-resistant on machines without hardware AES support (TROVE-2026-005).

!!! info "Earlier versions"

    Translations of Arti 2.3.0, 2.1.0, and 1.4.1 are currently available only in [traditional Chinese](https://anoni.net/docs/changelog/arti/){target="_blank"}. English versions will be added as the community translates them.
