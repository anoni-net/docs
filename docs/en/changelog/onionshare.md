---
title: OnionShare Changelog
description: English summaries of OnionShare releases translated from upstream changelogs and security advisories, with notes on security fixes and new features.
icon: material/share-variant
---

# :material-share-variant: OnionShare Changelog

Release summaries for [OnionShare](../tools/onionshare.md), condensed from upstream changelogs and security advisories. Newest at the top.

OnionShare ships far less often than Tor Browser or Tails: fifteen months passed between 2.6.3 and 2.6.4. A long gap between releases is normal here, so the thing to watch is whether a given release fixes something that affects how you use it.

## How we rate urgency

- <span class="urg-tag urg-tag--soon">Soon</span>The release contains security fixes. An OnionShare service is reachable from outside while it runs, so its fixes usually govern who can read what you share.
- <span class="urg-tag urg-tag--routine">Routine</span>Features, dependencies, and packaging.

"Soon" on this page covers every security fix regardless of category or severity, a wider net than the iOS pages cast. When you see it, read the entry itself to judge how much weight it carries.

Releases are infrequent and none so far has warranted same-day installation, so this page has no "Now" entries yet.

## OnionShare 2.6.5

> 2026-07-28 · [Upstream release](https://github.com/onionshare/onionshare/releases/tag/v2.6.5){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>Dependency updates covering the bundled tor, Python packages, and web-side dependencies. This rating is for people already on 2.6.4.The advisories mention no active exploitation.
- No new features or behaviour changes. If you are still on 2.6.3 or earlier, treat this as "Soon": moving up brings the two security fixes from 2.6.4 with it, and you can install 2.6.5 directly.

## OnionShare 2.6.4

> 2026-06-09 · [Upstream release](https://github.com/onionshare/onionshare/releases/tag/v2.6.4){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Fixes two security issues affecting 2.6.3 and earlier. Both the desktop app and `onionshare-cli` are affected, since they share the same web module.
- CVE-2026-54706 ([GHSA-22p9-r2f5-22mf](https://github.com/onionshare/onionshare/security/advisories/GHSA-22p9-r2f5-22mf){target="_blank"}): Share mode and Website mode followed symlinks inside the selected directory and served the link target instead of restricting access to files physically inside that directory. If the shared directory contains attacker-supplied or otherwise untrusted symlinks, whoever has the onion address can read other local files readable by the OnionShare process. Rated medium severity — exploiting it requires getting a symlink into the directory you share.
- CVE-2026-54707 ([GHSA-v833-3823-cmhp](https://github.com/onionshare/onionshare/security/advisories/GHSA-v833-3823-cmhp){target="_blank"}): With "Disable uploading files" enabled in Receive mode, the restriction was not enforced at the write sink. A crafted multipart request still wrote the uploaded bytes to disk; the route handler merely skipped the upload accounting. A service configured as a text-message-only endpoint could therefore be made to write unexpected files. The same release also stops an empty POST payload from creating an empty folder.
- Dependency updates, including the bundled tor and the flatpak runtime.
- Tor connection now shows indeterminate progress and warns the user while it waits, instead of looking unresponsive.

## OnionShare 2.6.3

> 2025-02-25 · [Upstream release](https://github.com/onionshare/onionshare/releases/tag/v2.6.3){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>The CLI gained `--log-filenames`, showing which URLs are visited in Share and Website mode.This release contains no security fixes.
- A saved persistent onion tab can now start automatically once OnionShare launches and Tor connects.
- Fixed bridge requests and meek as a pluggable transport, plus a fatal error when censorship circumvention returned no bridges.
- Fixed a thread race segfault on CLI shutdown, and the auto-stop timer failing in Share mode after someone had visited the share.
- Added Irish, Slovak, and Tamil interface translations, with improvements across existing languages.
- Documentation now covers every config file parameter, and includes a systemd unit example for persistent onions.
- Packaging: the snap builds for Ubuntu 24.04 and later, ARM64 flatpak packaging was fixed, and armhf support was dropped for now because PySide6 packages are unavailable for that architecture.

## OnionShare 2.6.2

> 2024-03-21 · [Upstream release](https://github.com/onionshare/onionshare/releases/tag/v2.6.2){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>An all-security release, concentrated on input handling in Receive mode and Chat mode.The advisories mention no active exploitation.
- Newlines are stripped from History item paths.
- Text messages in Receive mode are capped at 524288 characters.
- Usernames are restricted to specific ASCII characters with control characters removed, and username validation exceptions are handled so users can no longer join silently.
- Users are forcefully disconnected from chat on a `disconnect` event.
