---
title: tor daemon Changelog
description: "English summaries of tor daemon releases: what each security release fixes and whether relay and onion service operators need to upgrade immediately."
icon: material/server-network
---

# :material-server-network: tor daemon Changelog

The tor daemon (commonly called c-tor) is the C implementation of [Tor](../tools/what-is-tor.md), and relays, bridges, and onion services all run on it. This page covers what each release fixes and whether you need to upgrade right away. It is aimed at people running their own relay or onion service. If you just browse with Tor Browser, you do not need this page: the browser ships its own bundled version and those changes are covered in the [Tor changelog](./tor.md).

Newest at the top. Source data comes from the official [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/main/ChangeLog){target="_blank"}.

## How we rate urgency

- <span class="urg-tag urg-tag--now">Now</span>Marked by upstream as a security release, usually carrying TROVE identifiers (the numbering the Tor Project uses when disclosing security issues). Relays and onion services are long-lived targets, and issues at this level are usually remotely reachable.
- <span class="urg-tag urg-tag--soon">Soon</span>Affects connection quality or network health without a remotely exploitable security issue.
- <span class="urg-tag urg-tag--routine">Routine</span>Everything else.

"Now" on this page rests on how upstream shipped the release (marked a security release, carrying TROVE identifiers), not on anyone actively attacking. Relays and onion services stay online continuously and get scanned far more than a personal device, so the bar sits lower here than on the iOS pages. Where the call is unclear, we round up.

Nearly every release in the first half of 2026 lands on "Now". Security scrutiny of Tor intensified during this period and produced a run of remotely reachable fixes, so the ratings reflect what actually happened. Relay operators genuinely did need to follow every release this half-year.

## Two maintenance lines

`0.4.9.x` is the current line and `0.4.8.x` is long-term support, with security fixes backported to both. Distribution packages often sit on 0.4.8.x, so seeing two versions ship the same day is normal. Which one you install depends on your package source.

## What conflux is

Several entries below fix conflux. It lets a client send one connection's data over two circuits at once for extra speed, landed in Tor in 2023, and is the common source of multiple security issues this half-year. New code paths bring new ways to get things wrong, so the concentration of fixes there is not surprising.

## tor 0.4.9.11

> 2026-06-25 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.11/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>A security release two days after the previous one. Upstream cited further high-priority issues, one of them affecting onion services.
- Fixes a race condition where, under the right circumstances, a rendezvous point could impersonate the onion service a client was trying to reach, putting itself in the middle. Anyone running an onion service should take this one (bug 41297, present since 0.3.5.3-alpha).
- Clients no longer assert and exit when an onion service encodes an all-zero public key for one of its introduction points (bug 41295).
- Directory authorities no longer accept port 0 in exit policy lines. A secondary check parsed `0` as the range `1-0`, which tripped an assert while generating a networkstatus vote.

## tor 0.4.9.10

> 2026-06-23 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.10/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>A security release upstream strongly recommends installing promptly.
- TROVE-2026-025: rejects a `CONFLUX_LINK` cell arriving on a circuit that already has attached streams. A malicious client could send `RELAY_COMMAND_BEGIN` before `CONFLUX_LINK`, leaving the attached exit stream orphaned with a dangling circuit back-pointer, and a use-after-free when the circuit is freed, meaning memory handed back and then used again, which crashes the relay (bug 41258).
- Restores the warning about unsafe SOCKS protocols (socks4, or socks5 without a hostname) when `SafeSocks` is unset. The warning had been silently missing, and what it guards against is leaking the name you are resolving beyond your own machine (bug 41290).
- Entry guards expire consistently at 48 to 60 days again.

## tor 0.4.9.9

> 2026-06-01 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.9/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>A security release covering three major issues at once.
- TROVE-2026-022: the compression bomb check could be bypassed. An attacker concatenates many gzip or zlib sub-streams, each just under the per-stream detection threshold, and the whole payload slips past (bug 41275, present since 0.3.1.1-alpha).
- TROVE-2026-021: an infinite loop when decompressing a truncated zlib/gzip stream. A truncated stream never reaches `Z_STREAM_END`, and the `Z_BUF_ERROR` zlib returns was mistaken for a full output buffer, so the code retried forever (bug 41274).
- TROVE-2026-017: a NULL write after free when sending a `CONFLUX_SWITCH` cell fails. The failure closes the circuit and removes the leg, but the return value was ignored, so the caller went on to write into freed memory and crashed (bug 41263).

## tor 0.4.9.8

> 2026-05-07 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.8/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>An emergency follow-up to the previous release, after a silent error in the CI build emptied the entire fallback directory list.
- The impact falls on fresh installs: with no fallback directories available, new clients bootstrap directly against the directory authorities, which hurts both the load on those machines and how observable that traffic is.
- Regenerates the fallback directory list as of 7 May 2026.

## tor 0.4.9.7, 0.4.8.24

> 2026-05-06 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.7/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>A security release shipped on both maintenance lines.
- TROVE-2026-011: an out-of-bounds read handling END, TRUNCATE, and TRUNCATED cells whose payload carries no reason field, meaning it reads memory it should not, which can crash the relay or leak memory contents. The bug had been present since 0.1.1.1-alpha (bug 41254).
- TROVE-2026-008: no longer attempts or accepts `BEGIN_DIR` over conflux legs (bug 41243).
- TROVE-2026-010: corrects accounting when clearing the conflux out-of-order queue (bug 41251).

## tor 0.4.9.6, 0.4.8.23

> 2026-03-25 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.6/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>A security release covering two issues that could crash a relay remotely.
- TROVE-2026-003: a malicious `CREATED2` causes an 11-byte stack overflow, resulting in a remote crash (bug 41231).
- TROVE-2026-004: a memory comparison in the conflux subsystem used the wrong length, another path to a remote crash (bug 41232).
- Also fixes a batch of defence-in-depth issues and the polyval implementation on big-endian platforms.
