---
title: Software Changelog
description: Concise English summaries of Tor, tor daemon, Tails, OONI, Arti, OnionShare, iOS, and GrapheneOS releases translated from upstream changelogs, with Taiwan and China regional context where relevant.
icon: material/history
---

# :material-history: Software Changelog

Release-by-release summaries of the anonymity tools our community follows, plus the operating systems people run them on. Routine point releases accumulate here as compact entries. Major events (security audits, architectural shifts, region-specific implications) get full posts in [Updates](../blog/index.md).

## Where to start

Most people need two pages: the [Tor changelog](./tor.md), plus whichever one matches their device (iOS for iPhone, macOS for Mac, Windows for a PC, Android for an Android phone). The rest serve specific needs, such as running your own relay, switching transports when blocked, or doing censorship measurement.

Pages marked "with urgency ratings" use three-colour tags to answer how fast to act. The basis for those ratings is not identical across pages and is explained at the top of each one. Pages without tags track progress or features, and ask no update decision of you.

Most of our release translations begin life in zh-TW and reach English on a rolling basis, so these English pages carry fewer entries than the Chinese versions. Every entry links back to the upstream announcement.

## Anonymity tools

Condensed release-by-release from upstream changelogs, keeping version numbers and issue references.

- :simple-torbrowser: [Tor changelog](./tor.md) — Tor Browser stable and alpha channels
- :material-server-network: [tor daemon changelog](./tor-daemon.md) — c-tor security releases, for relay and onion service operators (with urgency ratings)
- :material-shield-key-outline: [anti-censorship transports changelog](./anti-censorship.md) — Snowflake, WebTunnel, obfs4: what to switch to when Tor is blocked
- :material-code-tags: [Arti changelog](./arti.md) — Tor Project's Rust implementation, still in development and not yet something general readers use
- :material-access-point-network: [OONI changelog](./ooni.md) — OONI Probe and the measurement engine, for people doing censorship measurement
- :material-share-variant: [OnionShare changelog](./onionshare.md) — OnionShare file sharing and onion sites (with urgency ratings)

## Operating systems

Your device is part of the attack surface. This group skips the line-by-line translation and answers "do you need to update now" instead. Android and GrapheneOS are the exceptions: upstream detail is unavailable for the former and the latter updates automatically, as each page explains.

- :material-usb-flash-drive-outline: [Tails changelog](./tails.md) — Tails operating system (with urgency ratings)
- :material-apple-ios: [iOS security updates](./ios.md) — iPhone and iPad, with urgency ratings and older-model support
- :material-apple: [macOS security updates](./macos.md) — Mac, with urgency ratings and the state of the three maintenance lines
- :material-microsoft-windows: [Windows security updates](./windows.md) — monthly Patch Tuesday with urgency ratings, sorted by desktop versus server impact
- :material-cellphone-lock: [GrapheneOS monthly summary](./grapheneos.md) — hardened Android on Pixel, aggregated by month
- :material-android: [Android security patch levels](./android.md) — monthly patch levels and CVE counts, and how to check how far behind your device is
