---
title: Tor Changelog
description: English summaries of Tor Browser, Tor daemon, and Onion service releases translated from upstream changelogs, with notes on security fixes and censorship circumvention improvements.
icon: simple/torbrowser
---

# :simple-torbrowser: Tor Changelog

Tor Browser, Tor daemon, and Onion service release summaries. Newest at the top. Each entry links back to the full translation.

## Tor Browser 15.0.19

> 2026-07-21 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15019/){target="_blank"}

- A small release focused on Firefox security fixes, carrying important security updates from Firefox.
- Rebased the Firefox base onto 140.13.0esr (tor-browser#45117); desktop and Android GeckoView also moved to 140.13.0esr.
- Backported security fixes from Firefox 153 (tor-browser#45124).
- NoScript updated to 13.6.31.1984.
- Reverted the earlier Funding the Commons implementation changes (tor-browser#44748).

## Tor Browser 15.0.18

> 2026-07-14 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15018/){target="_blank"}

- A small release focused on Firefox security fixes.
- The Firefox base stays at 140.12.0esr; rather than rebasing, later fixes were cherry-picked from the firefox/esr140 branch (tor-browser#45111).
- NoScript updated to 13.6.30.1984, and Go to 1.25.12 in the build toolchain (Windows, Linux, Android).
- Build process updated boklm's GPG subkey (tor-browser-build#41821).

## Tor Browser 16.0a8 (alpha)

> 2026-07-02 · [Upstream announcement](https://blog.torproject.org/new-alpha-release-tor-browser-160a8/){target="_blank"}

- The alpha channel is for testing only and may contain usability, security, and privacy bugs; regular users should stay on the stable channel (15.x).
- Important Firefox security update, rebased onto Firefox 152.0a1 (the previous alpha 16.0a7 was on 151.0a1); Android GeckoView also moved to 152.0a1.
- tor client updated to 0.4.9.11, NoScript to 13.6.25.90301984, OpenSSL to 3.5.7, and Go to 1.26.4 in the build toolchain.
- Fixed a cross-site oracle vulnerability by rejecting worklets in Safer Mode; XSLT disabled for the 16.0 series.
- Desktop: disabled IP Protection and fixed letterboxing background rendering plus several regressions after the Firefox 152 rebase. Android: added frequent regions to Tor connection assist, removed default-browser functionality, and switched omni.ja to xz compression.

## Tor Browser 15.0.17

> 2026-06-28 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15017/){target="_blank"}

- A small release focused on a tor security update, with no change to the Firefox base.
- tor client updated to 0.4.9.11.
- NoScript updated to 13.6.25.1984.
- Build process updated boklm's GPG subkey and renewed morgan's signing key (tor-browser-build#41821, #41827).

## Tor Browser 15.0.16

> 2026-06-17 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15016/){target="_blank"}

- Important security update to Firefox.
- Rebased onto Firefox 140.12.0esr (tor-browser#45046), with security fixes backported from Firefox 152 (tor-browser#45054); Android GeckoView also moved to 140.12.0esr.
- NoScript updated to 13.6.24.1984, fixing a DocStartInjection regression introduced in 13.6.19.902 (tor-browser#45044); OpenSSL updated to 3.5.7.
- Removed the tor daemon requirement for signing (tor-browser-build#41802), and updated Go to 1.25.11 in the build toolchain.

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
