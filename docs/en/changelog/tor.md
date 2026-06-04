---
title: Tor Changelog
description: English summaries of Tor Browser, Tor daemon, and Onion service releases translated from upstream changelogs, with notes on security fixes and censorship circumvention improvements.
icon: simple/torbrowser
---

# :simple-torbrowser: Tor Changelog

Tor Browser, Tor daemon, and Onion service release summaries. Newest at the top. Each entry links back to the full translation.

## Tor Browser 15.0.15

> 2026-06-03 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15015/){target="_blank"}

- Important security update to the tor daemon, plus fixes for some censorship circumvention problems.
- tor client updated to 0.4.9.9, NoScript updated to 13.6.20.1984.
- Moat module now supports multiple configured (front, reflector) domain fronting pairs (tor-browser#42436).
- Fixed a captcha failure on desktop (tor-browser#44997) and notified Linux i686 users that updates have ended (tor-browser#44886).

## Tor Browser 16.0a7 (alpha)

> 2026-06-03 · [dist directory](https://dist.torproject.org/torbrowser/16.0a7/){target="_blank"}

- The alpha channel is for testing only; regular users should stay on the stable channel (15.x). Binaries are published on dist, but the upstream blog has not posted an announcement yet. Now based on Firefox 151.0a1 (the previous alpha 16.0a6 was on 150.0a1).

!!! info "Earlier Tor Browser versions"

    Tor Browser 15.0.14, 15.0.13, 16.0a6 (alpha), 15.0.12, 15.0.11, and earlier entries are currently available only in [traditional Chinese](https://anoni.net/docs/changelog/tor/){target="_blank"}. English versions will be added as the community translates them.

    Past Tor-related translations also live in [Updates](../blog/index.md), including [Cure53 completes Tor VPN code audit](../blog/posts/2026-code-audit-for-tor-vpn-completed-by-cure53.md).
