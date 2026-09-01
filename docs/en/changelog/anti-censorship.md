---
title: Anti-Censorship Transports Changelog
description: "English summaries of Snowflake, WebTunnel, and lyrebird releases: what each update means for getting past blocking, and which transport suits which situation."
icon: material/shield-key-outline
---

# :material-shield-key-outline: Anti-Censorship Transports Changelog

Release summaries for the pluggable transports you switch to when you cannot reach the Tor network directly. Most updates here adjust how traffic disguises itself, which is an ongoing back-and-forth with whoever is doing the blocking, so the thing to watch is whether the disguise keeps up rather than whether a security hole got patched. For how to use them, see [Tor Browser advanced settings](../tools/tor-browser-advanced.md) and [Snowflake](../tools/tor-snowflake.md).

Newest at the top.

## Which transport suits which situation

- **Snowflake**: needs no bridge address in advance. Pick it in Tor Browser and it works, relaying through volunteers' browsers around the world. Good where blocking is not especially thorough, or when you need a connection right now. Unstable speed is normal for it.
- **WebTunnel**: wraps Tor traffic to look like ordinary HTTPS web traffic, which gives it the best odds on networks that only allow port 443 and run deep packet inspection. Requires a bridge address in advance.
- **obfs4**: the long-standing option, turning traffic into featureless random bytes. Success rates drop in regions that have built up signatures for it. The program that runs it is now lyrebird.

All three are in Tor Browser's connection settings, with nothing extra to install. Bridge addresses come from [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} or automatically via Moat.

## WebTunnel 0.0.6

> 2026-07-23 · [Project page](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel){target="_blank"}

- Only affects people running their own WebTunnel bridge; ordinary users are unaffected. Adds Debian packages, so bridge operators no longer have to build it themselves.
- WebTunnel does not maintain a separate changelog. Entries here are assembled from version tags and commit messages, so they carry less detail than the other two projects.

## WebTunnel 0.0.5

> 2026-07-02 · [Project page](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel){target="_blank"}

- Only affects people running their own bridge: adds a Trusted Proxy Hops setting. When a bridge sits behind a CDN or reverse proxy, this decides how many layers of forwarding headers to trust, which determines whether the client address you record is the real one.

## Snowflake 2.14.1

> 2026-06-25 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- Checks type assertions and validates incoming WebRTC offers and answers (issue 40546). That input arrives from the peer, and processing it unvalidated gave a path to crashing the proxy. Reported by Bogdan Barchuk and Alexander Kucher.
- Probetest gains a SOCKS5-based interactive connectivity test for diagnosing proxies that cannot connect.

## Snowflake 2.14.0

> 2026-06-09 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- Updates covert-dtls and tidies its public API. covert-dtls makes the DTLS handshake look like an ordinary WebRTC application, which is central to how Snowflake avoids signature detection.
- covert-dtls configuration gains a `none` option so a proxy can turn the disguise off.
- Broker poll intervals can now be loaded from a file and are expressed in milliseconds, so proxies no longer need rebuilding to change how often they report.
- Fixes a potential nil-pointer dereference in the broker, and a missing listen-error report when metrics fail to start.

## Snowflake 2.13.0

> 2026-04-08 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- Proxy covert-dtls now defaults to `randomizemimic` (issue 40530), so the DTLS handshake looks different every time. That is harder to build a signature against than consistently imitating one implementation.
- The broker gains a poll interval field and a `NextPoll` message, telling proxies when to report next.

## Snowflake 2.13.1, 2.12.1

> 2026-03-10 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- Both releases only update the Go version used by the release pipeline (1.24 and 1.23 respectively). No functional changes.

## lyrebird 0.8.1

> 2026-01-14 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/lyrebird/-/blob/main/ChangeLog){target="_blank"}

- Fixes the chrome120 imitation profile. lyrebird uses uTLS to imitate a specific browser's TLS fingerprint, and once the profile drifts from what real Chrome sends, it becomes a distinguishing feature instead of cover.
- lyrebird is the single binary behind obfs4, meek, WebTunnel, and Snowflake, and is what ships inside Tor Browser. 0.7.0 added certificate hash chain pinning, multiple server names, and an SNI imitation option for WebTunnel; 0.8.0 let meek use multiple url/front pairs.
