---
title: Software Changelog
description: Concise English summaries of Tor, tor daemon, Tails, OONI, Arti, OnionShare, iOS, and GrapheneOS releases translated from upstream changelogs, with Taiwan and China regional context where relevant.
icon: material/history
changelog_digest:
  days: 45
  date_format: "{y}-{m}-{d}"
  asof: Data as of {date}, refreshed each time the site is rebuilt
  filter_label: Filter by device and role
  all: All
  latest: "Latest: {title} · {date}"
  empty_now: Nothing rated Now or Soon in the past 45 days.
  empty_recent: No new entries in the past 45 days.
  empty_filtered: No entries for this option in this period.
  subscribe: Subscribe to "{label}"
  subscribe_urgent: Subscribe to Now and Soon only
  feed_label: "RSS: "
  feed_title: "anoni.net Software Changelog: {label}"
  feed_description: Release and security updates for anonymity tools and operating systems, summarised from upstream announcements. Each item links to the explanation on the anoni.net docs site.
  feed_urgent: Now and Soon
  filters:
    - id: iphone
      label: iPhone and iPad
    - id: mac
      label: Mac
    - id: windows
      label: Windows
    - id: linux
      label: Linux
    - id: android
      label: Android
    - id: tails
      label: Tails
    - id: relay
      label: Running relays or onion services
    - id: ooni
      label: Censorship measurement
---

# :material-history: Software Changelog

Release-by-release summaries of the anonymity tools our community follows, plus the operating systems people run them on. Routine point releases accumulate here as compact entries. Major events (security audits, architectural shifts, region-specific implications) get full posts in [Updates](../blog/index.md).

## Recent updates

<!-- changelog-digest:filter -->

### Needs action

The latest entry from each of the six pages with urgency ratings, listing only Now and Soon. Each page rates urgency on a different basis, noted after the date on every item.

<!-- changelog-digest:now -->

### Last 45 days

Every entry from all twelve pages in this period, newest first.

<!-- changelog-digest:recent -->

## Where to start

Most people need two pages: the [Tor changelog](./tor.md), plus whichever one matches their device (iOS for iPhone, macOS for Mac, Windows for a PC, Android for an Android phone). The rest serve specific needs, such as running your own relay, switching transports when blocked, or doing censorship measurement.

Pages marked "with urgency ratings" use three-colour tags to answer how fast to act. The basis for those ratings is not identical across pages and is explained at the top of each one. Pages without tags track progress or features, and ask no update decision of you.

Most of our release translations begin life in zh-TW and reach English on a rolling basis, so these English pages carry fewer entries than the Chinese versions. Every entry links back to the upstream announcement.

## Security contacts in organisations

In NGOs, newsrooms, community groups and small teams, one person often ends up reminding everyone to update. Upstream announcements are scattered across a dozen places, each with its own vocabulary. This page puts them on one rating scale, so that person can turn them into reminders the team understands in a few minutes a month.

Start by listing the devices and tools your team actually uses. Find the matching options under [Recent updates](#Recent-updates), subscribe to those :material-rss-box:{ .rss-icon } RSS feeds, and add "Subscribe to Now and Soon only". A feed reader or a subscription bot in your team chat will both work, and new entries arrive as soon as they are published. The inventory only needs device types and system versions. Do not record who uses Tor or other anonymity tools; a leak of that list does more harm than a missed reminder.

When something is rated Now, pass it on to the people affected the same day. Say which devices and versions are affected, which version to update to and where to check the installed version, and include the link to the entry (every entry heading has its own URL). Linking beats restating numbers: Microsoft and Apple keep revising their advisories after release, and the entries here are updated to match. Before forwarding, check the basis and audience after each item. A Now on tor daemon, for example, only concerns people running relays and onion services, and sending it to the whole team will make everyone think their own computer has a problem.

Soon ratings and untagged updates can wait for a regular slot, such as a weekly meeting or a monthly internal newsletter. Tor Browser stable now ships roughly every two weeks, so asking people to accept the update prompt whenever it appears works better than relaying each release.

To confirm updates are done, ask members to check their own version numbers rather than report to a central spreadsheet. Where to look is covered in [Which release line is your device on](./ios.md#Which-release-line-is-your-device-on) for iOS, [Three maintenance lines](./macos.md#Three-maintenance-lines) for macOS and [First, check how far behind your device is](./android.md#First-check-how-far-behind-your-device-is) for Android. Flag devices that no longer receive security updates during the inventory and plan to replace them, as no future Now update will cover them.

When briefing managers or partner organisations, cite the upstream announcement each entry links to. The content here is a summary, and upstream numbers take precedence.

## Anonymity tools

Condensed release-by-release from upstream changelogs, keeping version numbers and issue references.

- :simple-torbrowser: [Tor changelog](./tor.md) — Tor Browser stable and alpha channels <!-- changelog-latest:tor -->
- :material-server-network: [tor daemon changelog](./tor-daemon.md) — c-tor security releases, for relay and onion service operators (with urgency ratings) <!-- changelog-latest:tor-daemon -->
- :material-shield-key-outline: [anti-censorship transports changelog](./anti-censorship.md) — Snowflake, WebTunnel, obfs4: what to switch to when Tor is blocked <!-- changelog-latest:anti-censorship -->
- :material-code-tags: [Arti changelog](./arti.md) — Tor Project's Rust implementation, still in development and not yet something general readers use <!-- changelog-latest:arti -->
- :material-access-point-network: [OONI changelog](./ooni.md) — OONI Probe and the measurement engine, for people doing censorship measurement <!-- changelog-latest:ooni -->
- :material-share-variant: [OnionShare changelog](./onionshare.md) — OnionShare file sharing and onion sites (with urgency ratings) <!-- changelog-latest:onionshare -->

## Operating systems

Your device is part of the attack surface. This group skips the line-by-line translation and answers "do you need to update now" instead. Android and GrapheneOS are the exceptions: upstream detail is unavailable for the former and the latter updates automatically, as each page explains.

- :material-usb-flash-drive-outline: [Tails changelog](./tails.md) — Tails operating system (with urgency ratings) <!-- changelog-latest:tails -->
- :material-apple-ios: [iOS security updates](./ios.md) — iPhone and iPad, with urgency ratings and older-model support <!-- changelog-latest:ios -->
- :material-apple: [macOS security updates](./macos.md) — Mac, with urgency ratings and the state of the three maintenance lines <!-- changelog-latest:macos -->
- :material-microsoft-windows: [Windows security updates](./windows.md) — monthly Patch Tuesday with urgency ratings, sorted by desktop versus server impact <!-- changelog-latest:windows -->
- :material-cellphone-lock: [GrapheneOS monthly summary](./grapheneos.md) — hardened Android on Pixel, aggregated by month <!-- changelog-latest:grapheneos -->
- :material-android: [Android security patch levels](./android.md) — monthly patch levels and CVE counts, and how to check how far behind your device is <!-- changelog-latest:android -->
