---
date: 2026-03-31
authors:
    - toomore
categories:
    - Update
    - Tor
slug: arti-2-2-0-released-http-connect-rpc-and-relay-development
image: "assets/images/tor.webp"
summary: "Arti 2.2.0 makes HTTP CONNECT a default-ready path, upgrades RPC integration and admin control, and continues relay groundwork"
description: "Arti 2.2.0 brings HTTP CONNECT support into full builds, adds non-blocking RPC capabilities with superuser administration, and advances relay infrastructure"
---

# Arti 2.2.0: better network fit now, stronger Tor plumbing later

!!! info ""

    This post is based on the Tor Project announcement:

    - [Arti 2.2.0 released: HTTP CONNECT, RPC, and Relay development. | March 31, 2026](https://blog.torproject.org/arti_2_2_0_released/){target="_blank"}

![Tor](./assets/images/tor.webp)

Arti is Tor’s next-generation Rust implementation. The 2.2.0 release is notable because it pushes a previously experimental access path into day-to-day usability: **HTTP CONNECT is now included in full builds and enabled by default**, sharing the same port as SOCKS.

For teams operating in filtered enterprise, campus, or public networks, that matters immediately. For developers embedding Arti, this release also expands RPC ergonomics with non-blocking requests, event-loop integration, and a new superuser administration path. In one version, Arti improves both **network practicality** and **operational controllability**.

<!-- more -->

## What changed in 2.2.0

### HTTP CONNECT moves from experimental to default-ready

Arti can now connect to Tor through **HTTP CONNECT** in the standard full build, and this behavior is enabled by default. Keeping HTTP CONNECT and SOCKS on the same port lowers integration friction for applications that need flexibility across different proxy environments.

This is especially relevant where SOCKS deployment is awkward but HTTP proxy infrastructure already exists. In those environments, anonymous connectivity often fails not because users reject privacy tools, but because the network path is brittle. Arti 2.2.0 reduces that brittleness.

### RPC becomes easier to integrate into real services

`arti-rpc-client-core` now supports **non-blocking requests** and integration with application event loops. That directly helps service-oriented deployments where Arti is one component in a larger asynchronous system.

The RPC system also adds a **superuser** capability for administrative access to the Arti instance. This gives maintainers a cleaner foundation for automated operations, observability hooks, and policy-aware control planes.

### A low-severity security fix ships in the same release

The team fixed [TROVE-2026-005](https://gitlab.torproject.org/tpo/core/arti/-/issues/2418){target="_blank"}, a low-severity issue that could weaken DoS resistance in certain uncommon embedded build configurations.

Even with limited scope, fixing it here is still important: it signals that Arti’s release cadence is not only feature-driven, but also attentive to resilience under edge deployments.

## Relay groundwork continues behind the scenes

The release notes also highlight continued relay work: relay channels, circuits, and directory server functionality (mirrors and authorities). These are foundational pieces that may be less visible to end users today but are essential for Arti’s long-term role in the Tor ecosystem.

In other words, 2.2.0 does more than ship visible feature improvements; it also moves Arti’s long-term architecture roadmap one step forward.

## Why this translation matters in Taiwan context

1. **Constrained-network reality:** HTTP CONNECT default support is practical for schools, workplaces, and managed networks where SOCKS is difficult to deploy consistently.
2. **Local dev and ops fit:** non-blocking RPC plus event-loop compatibility makes Arti easier to connect with common service stacks used by local teams (for health checks, alerts, policy enforcement, and automation).
3. **Infra governance signal:** the combination of [TROVE-2026-005](https://gitlab.torproject.org/tpo/core/arti/-/issues/2418){target="_blank"} remediation and steady relay progress is useful for civic tech and digital-rights communities tracking whether privacy infrastructure is evolving responsibly.

## Further reading

- [Arti 2.2.0 changelog entry](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/CHANGELOG.md#arti-220--30-march-2026){target="_blank"}
- [Arti project README](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/README.md){target="_blank"}
- [`arti` binary documentation](https://gitlab.torproject.org/tpo/core/arti/-/blob/main/crates/arti/README.md){target="_blank"}

!!! info "Source"

    Based on the official Tor Project post [Arti 2.2.0 released: HTTP CONNECT, RPC, and Relay development.](https://blog.torproject.org/arti_2_2_0_released/){target="_blank"}.
