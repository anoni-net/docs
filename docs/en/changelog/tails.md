---
title: Tails Changelog
description: English summaries of Tails operating system releases translated from upstream announcements, with notes on what each version means for users in censored regions.
icon: material/usb-flash-drive-outline
---

# :material-usb-flash-drive-outline: Tails Changelog

[Tails](https://tails.net/){target="_blank"} operating system release summaries. Newest at the top. Each entry links back to the full translation.

## Tails 7.8

> 2026-05-21 · [Upstream announcement](https://tails.net/news/version_7.8/){target="_blank"}

- Tor Browser updated to 15.0.14 (based on Firefox ESR 140.11).
- Mitigates the Linux kernel local privilege escalation "Fragnesia" (alongside the earlier "Drity Frag" mitigation). Such flaws let an application inside Tails gain administrator privileges, which combined with other unknown vulnerabilities could fully compromise Tails and deanonymize the user.
- Mitigates a Flatpak sandbox escape via Yelp; yelp updated to 42.2-4tails1.
- Patches CVE-2026-46529 (evince), CVE-2026-41989 (libgcrypt20), and CVE-2026-41054 (haveged).
- Thunderbird is no longer shipped with the image. It can still be installed automatically through Persistent Storage's additional software, pulling the latest version from Debian on each Tails startup. The previously bundled version was often out of date because Debian's Thunderbird update typically lands shortly after each Tails release, both of which follow Firefox's release cadence.
- Base system upgraded to Debian Trixie 13.5.
- The Secure Boot CA upgrade prompt now only appears when Secure Boot is enabled, avoiding misleading notifications when it is disabled.
- WhisperBack error reports now include installed Flatpak applications and runtimes.

## Tails 7.6

> 2026-03-26 · [Upstream announcement](https://tails.net/news/version_7.6/){target="_blank"} · [Full translation](../blog/posts/2026-tails-7-6.md)

- Automatic Tor bridges (region-aware via Moat API), GNOME Secrets replaces KeePassXC as the built-in password manager, routine component bumps (Tor Browser 15.0.8, Thunderbird 140.8.0, Electrum 4.7.0).

!!! info "Earlier versions"

    Translations of Tails 7.7.3, 7.7.2, 7.7.1, 7.7, 7.1, 7.0, 7.0~rc2, and 6.18 are currently available only in [traditional Chinese](https://anoni.net/docs/zh-tw/changelog/tails/){target="_blank"}. English versions will be added as the community translates them.
