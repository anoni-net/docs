---
title: Tor Changelog
description: English summaries of Tor Browser, Tor daemon, and Onion service releases translated from upstream changelogs, with notes on security fixes and censorship circumvention improvements.
icon: simple/torbrowser
---

# :simple-torbrowser: Tor Changelog

Tor Browser, Tor daemon, and Onion service release summaries. Newest at the top. Each entry links back to the full translation.

## Two release channels

- <span class="chan-tag chan-tag--stable">Stable</span>What regular users should run, versioned like 15.0.20.
- <span class="chan-tag chan-tag--alpha">Alpha</span>Testing only. It may contain bugs affecting usability, security, and privacy, and is versioned with an a (16.0a10, for example). Do not use it if you need strong anonymity.

Since 16.0a9 the alpha channel tracks Firefox betas and rebases incrementally, so versions move faster than they used to. Stable releases almost always carry Firefox or tor daemon security fixes, so install them as they appear.

## Tor Browser 16.0a10 (alpha)

> 2026-08-27 · [Upstream announcement](https://blog.torproject.org/new-alpha-release-tor-browser-160a10/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>The alpha channel is for testing only; regular users should stay on the stable channel (15.x).
- New opt-in "Use generic window titles" setting, under Privacy and security → Advanced settings → Protections from third-party applications. With it enabled, every window title simply reads Tor Browser Alpha. Window titles normally track the page's `<title>` element, and other applications or the OS can read those changes without special permissions, which makes them a side channel for recording browsing history. The feature has been upstreamed, so vanilla Firefox users can set `privacy.exposeContentTitleInWindow` and `privacy.exposeContentTitleInWindow.pbm` to false in `about:config`. The Tor Project had hoped to enable it by default in 16.0, but held off over possible breakage with accessibility software and non-standard desktop environments.
- The desktop built-in manual has been replaced with the Tor Project's updated support content, baked into the browser. Open it directly at `about:manual`, or through the "Learn more" links in the UI.
- The settings page now uses Mozilla's redesigned `about:preferences` by default, with Tor Browser's own settings (connection, letterboxing, security level) migrated to the new design language.
- Rebased the Firefox base onto 153.1.0esr (tor-browser#45205) and backported security fixes from Firefox 154 (tor-browser#45219).
- Disabled locale-based font rules as defence in depth against fingerprinting (tor-browser#44257).
- Updated NoScript to 13.6.31.90301984 and OpenSSL to 3.5.8.
- `about:torconnect` now reports an error when the tor daemon crashes (tor-browser#43570), and bridge settings update when a connection fails (tor-browser#43939).

## Tor Browser 15.0.20

> 2026-08-18 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15020/){target="_blank"}

- <span class="chan-tag chan-tag--stable">Stable</span>A small release focused on Firefox security fixes.
- Rebased the Firefox base onto 140.14.0esr (tor-browser#45204); desktop and Android GeckoView also moved to 140.14.0esr.
- Backported security fixes from Firefox 154 (tor-browser#45219).
- Updated libevent to 2.1.13 in the build toolchain (tor-browser-build#41839).
- Updated Go to 1.25.13 for Windows, Linux, and Android builds.
- Updated the torbrowser.gpg keyring with a new subkey and a revised expiration date for the main key (tor-browser-build#41850).

## Tor Browser 16.0a9 (alpha)

> 2026-07-23 · [Upstream announcement](https://blog.torproject.org/new-alpha-release-tor-browser-160a9/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>The alpha channel is for testing only; regular users should stay on the stable channel (15.x).
- Major rebase of the Firefox base onto 153.0esr (up from 140.0esr); Android GeckoView also moved to 153.0esr (tor-browser#45101).
- The Tor Project announced the alpha channel will now track Firefox beta releases and rebase incrementally, instead of jumping a full year of Firefox versions at once, aiming to ship Tor Browser 16.0 stable a month early in September.
- NoScript updated to 13.6.30.90201984, Go to 1.26.5, and libevent to 2.1.13 in the build toolchain.
- Android's omni.ja now uses xz compression, saving about 3 MB; only one tracking-related dependency remains, Mozilla Telemetry (disabled by default).
- Known issues: Firefox branding still appears in some places, and the Android address bar icon currently always shows "insecure" — tap it to verify the certificate manually.

## Tor Browser 15.0.19

> 2026-07-21 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15019/){target="_blank"}

- <span class="chan-tag chan-tag--stable">Stable</span>A small release focused on Firefox security fixes, carrying important security updates from Firefox.
- Rebased the Firefox base onto 140.13.0esr (tor-browser#45117); desktop and Android GeckoView also moved to 140.13.0esr.
- Backported security fixes from Firefox 153 (tor-browser#45124).
- NoScript updated to 13.6.31.1984.
- Reverted the earlier Funding the Commons implementation changes (tor-browser#44748).

## Tor Browser 15.0.18

> 2026-07-14 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15018/){target="_blank"}

- <span class="chan-tag chan-tag--stable">Stable</span>A small release focused on Firefox security fixes.
- The Firefox base stays at 140.12.0esr; rather than rebasing, later fixes were cherry-picked from the firefox/esr140 branch (tor-browser#45111).
- NoScript updated to 13.6.30.1984, and Go to 1.25.12 in the build toolchain (Windows, Linux, Android).
- Build process updated boklm's GPG subkey (tor-browser-build#41821).

## Tor Browser 16.0a8 (alpha)

> 2026-07-02 · [Upstream announcement](https://blog.torproject.org/new-alpha-release-tor-browser-160a8/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>The alpha channel is for testing only and may contain usability, security, and privacy bugs; regular users should stay on the stable channel (15.x).
- Important Firefox security update, rebased onto Firefox 152.0a1 (the previous alpha 16.0a7 was on 151.0a1); Android GeckoView also moved to 152.0a1.
- tor client updated to 0.4.9.11, NoScript to 13.6.25.90301984, OpenSSL to 3.5.7, and Go to 1.26.4 in the build toolchain.
- Fixed a cross-site oracle vulnerability by rejecting worklets in Safer Mode; XSLT disabled for the 16.0 series.
- Desktop: disabled IP Protection and fixed letterboxing background rendering plus several regressions after the Firefox 152 rebase. Android: added frequent regions to Tor connection assist, removed default-browser functionality, and switched omni.ja to xz compression.

## Tor Browser 15.0.17

> 2026-06-28 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15017/){target="_blank"}

- <span class="chan-tag chan-tag--stable">Stable</span>A small release focused on a tor security update, with no change to the Firefox base.
- tor client updated to 0.4.9.11.
- NoScript updated to 13.6.25.1984.
- Build process updated boklm's GPG subkey and renewed morgan's signing key (tor-browser-build#41821, #41827).

## Tor Browser 15.0.16

> 2026-06-17 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15016/){target="_blank"}

- <span class="chan-tag chan-tag--stable">Stable</span>Important security update to Firefox.
- Rebased onto Firefox 140.12.0esr (tor-browser#45046), with security fixes backported from Firefox 152 (tor-browser#45054); Android GeckoView also moved to 140.12.0esr.
- NoScript updated to 13.6.24.1984, fixing a DocStartInjection regression introduced in 13.6.19.902 (tor-browser#45044); OpenSSL updated to 3.5.7.
- Removed the tor daemon requirement for signing (tor-browser-build#41802), and updated Go to 1.25.11 in the build toolchain.

## Tor Browser 15.0.15

> 2026-06-03 · [Upstream announcement](https://blog.torproject.org/new-release-tor-browser-15015/){target="_blank"}

- <span class="chan-tag chan-tag--stable">Stable</span>Important security update to the tor daemon, plus fixes for some censorship circumvention problems.
- tor client updated to 0.4.9.9, NoScript updated to 13.6.20.1984.
- Moat module now supports multiple configured (front, reflector) domain fronting pairs (tor-browser#42436).
- Fixed a captcha failure on desktop (tor-browser#44997) and notified Linux i686 users that updates have ended (tor-browser#44886).

## Tor Browser 16.0a7 (alpha)

> 2026-06-03 · [dist directory](https://dist.torproject.org/torbrowser/16.0a7/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>The alpha channel is for testing only; regular users should stay on the stable channel (15.x). Binaries are published on dist, but the upstream blog has not posted an announcement yet. Now based on Firefox 151.0a1 (the previous alpha 16.0a6 was on 150.0a1).

!!! info "Earlier Tor Browser versions"

    Tor Browser 15.0.14, 15.0.13, 16.0a6 (alpha), 15.0.12, 15.0.11, and earlier entries are currently available only in [traditional Chinese](https://anoni.net/docs/changelog/tor/){target="_blank"}. English versions will be added as the community translates them.

    Past Tor-related translations also live in [Updates](../blog/index.md), including [Cure53 completes Tor VPN code audit](../blog/posts/2026-code-audit-for-tor-vpn-completed-by-cure53.md).
