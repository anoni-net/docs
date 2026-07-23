---
title: Tails Changelog
description: English summaries of Tails operating system releases translated from upstream announcements, with notes on what each version means for users in censored regions.
icon: material/usb-flash-drive-outline
---

# :material-usb-flash-drive-outline: Tails Changelog

[Tails](https://tails.net/){target="_blank"} operating system release summaries. Newest at the top. Each entry links back to the full translation.

## Tails 7.10

> 2026-07-23 · [Upstream announcement](https://tails.net/news/version_7.10/){target="_blank"}

- A scheduled release introducing a new shutdown procedure and a new video player.
- Adopts GNOME's standard shutdown procedure. The Power Off dialog now warns about unsaved documents and open applications, and shutdown completes automatically after 60 seconds. It is a bit slower in exchange for better data protection. An emergency shutdown option remains for a faster power-off.
- The video player is now Celluloid, more modern and reliable, and it has no network access. To watch videos online, use Tor Browser or install VLC as additional software. Celluloid does not work on computers manufactured in 2011 or earlier.
- Tor Browser updated to 15.0.19.
- Updated some firmware to improve support for newer hardware such as graphics cards and Wi-Fi.
- Automatic upgrades are available from Tails 7.0 or later; a manual upgrade is available if the automatic one fails. Fresh installations will erase existing Persistent Storage.

## Tails 7.9.1

> 2026-07-01 · [Upstream announcement](https://tails.net/news/version_7.9.1/){target="_blank"}

- Emergency security release fixing two local privilege-escalation flaws in the Linux kernel.
- Patches CVE-2026-43503 (DirtyClone) and CVE-2026-46331 (PACKET_EDIT_MEME), with the kernel updated to 6.12.94. Such flaws let an application inside Tails gain administrator privileges; combined with other unknown vulnerabilities they could fully compromise Tails and deanonymize the user. No active exploitation has been observed.
- Tor Browser updated to 15.0.17, and the Tor client to 0.4.9.11.
- This is a security-only release; aside from Tor Browser, the kernel, and the Tor client, it keeps 7.9's software set. Automatic upgrades are available from Tails 7.0 or later.

## Tails 7.9

> 2026-06-18 · [Upstream announcement](https://tails.net/news/version_7.9/){target="_blank"}

- Regular scheduled release, not an emergency security update.
- Tor Browser updated to 15.0.16.
- Updated some firmware packages, improving support for newer hardware such as graphics and Wi-Fi.
- Fixed a bug where the "outdated Secure Boot certificate" prompt could appear in the rare case when the certificates were already up to date.
- The Linux kernel, Thunderbird, and the Debian base are unchanged from 7.8. Automatic upgrades are available from Tails 7.0 or later.

## Tails 7.8.1

> 2026-06-04 · [Upstream announcement](https://tails.net/news/version_7.8.1/){target="_blank"}

- Emergency security release fixing a serious Linux kernel vulnerability and several Tor client security vulnerabilities.
- Patches the Linux kernel flaw CVE-2026-43503 (kernel updated to 6.12.90-2), a local privilege escalation that lets an application inside Tails gain administrator privileges; combined with other unknown vulnerabilities it could fully compromise Tails and deanonymize the user. No active exploitation has been observed.
- Tor client updated to 0.4.9.9, fixing several security vulnerabilities.
- This is a security-only emergency release; Tor Browser, Thunderbird, and the Debian base version are unchanged from 7.8. Automatic upgrades are available from Tails 7.0 or later.

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

    Translations of Tails 7.7.3, 7.7.2, 7.7.1, 7.7, 7.1, 7.0, 7.0~rc2, and 6.18 are currently available only in [traditional Chinese](https://anoni.net/docs/changelog/tails/){target="_blank"}. English versions will be added as the community translates them.
