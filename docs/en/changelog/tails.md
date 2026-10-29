---
title: Tails Changelog
description: English summaries of Tails operating system releases translated from upstream announcements, with notes on what each version means for users in censored regions.
icon: material/usb-flash-drive-outline
digest:
  name: Tails
  devices: [tails]
  basis: rated by how upstream ships the release
---

# :material-usb-flash-drive-outline: Tails Changelog

[Tails](https://tails.net/){target="_blank"} operating system release summaries, condensed from the upstream release notes. Newest at the top.

## How we rate urgency

- <span class="urg-tag urg-tag--now">Now</span>An emergency security release from the Tails project, marked by a third version number (7.10.1, for example). Upstream decided it could not wait for the next scheduled release, which means the flaw is serious.
- <span class="urg-tag urg-tag--soon">Soon</span>A scheduled release whose fixes cover kernel privilege escalation (a program obtaining full system privileges), sandbox escape (a program breaking out of its isolated environment to reach the rest of the system), or an important Tor Browser security update.
- <span class="urg-tag urg-tag--routine">Routine</span>Everything else, mostly features and hardware support.

A compromise on Tails means something different from a compromise on an ordinary OS. Gaining administrator privileges means losing anonymity protection, and the attacker sees everything you do inside Tails, so "Now" on this page deserves to be taken more seriously than elsewhere.

"Now" on this page rests on how upstream shipped the release, not on anyone actively attacking. Most entries state plainly that no real-world exploitation is known, which does not mean it can wait: the Tails project only cuts a standalone emergency release when it judges the issue too serious to hold until the next scheduled one. The "Now" on the iOS and Windows pages requires evidence of active exploitation, so the basis differs from here.

The Tails project only distinguishes emergency from scheduled releases. The middle tier is a judgement community volunteers add after reading each advisory. Where the call is unclear, we round up.

## Tails 7.15.1

> 2026-10-23 · [Upstream announcement](https://tails.net/news/version_7.15.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>An emergency release to remove a compromised certificate authority. Upstream states it is not aware of exit nodes using this attack so far.
- Tor Browser moves to 15.0.26, fixing CVE-2026-113470. Intermediate certificates of the certificate authority eMudhra were compromised; Mozilla blocked its certificates on 17 October, and Tor Browser 15.0.26 blocks all eMudhra certificates as well (see the [Tor changelog](./tor.md)).
- With one of the compromised intermediate certificates, an attacker can impersonate any website, even over HTTPS. The announcement names a Tor exit node, the internet service provider of an exit node, or a government as able to do this. Onion sites are not affected.
- Applications other than Tor Browser rely on Debian's ca-certificates package to decide which certificates to trust, and that package is updated too. This corresponds to Debian's DSA-6572-1 of 20 October, which removes two root certificates, emSign ECC Root CA - G3 and Comodo AAA Services root, so the whole system stops trusting that batch of eMudhra certificates.
- Checking the 7.15.1 package list, the Debian advisories that missed 7.15 are now included. The kernel moves from 6.12.111 to 6.12.113, covering the 16 October kernel security advisory DSA-6568-1, and curl (DSA-6558-1), JPEG XL (DSA-6564-1) and expat (DSA-6566-1) are all at fixed versions. The announcement itself does not mention these packages.
- tor stays at 0.4.9.14; 0.4.9.15 came out on 28 October, after this release (see the [tor daemon changelog](./tor-daemon.md)).
- Automatic upgrades are available from Tails 7.0 or later. A fresh install wipes any existing Persistent Storage.

## Tails 7.15

> 2026-10-13 · [Upstream announcement](https://tails.net/news/version_7.15/){target="_blank"} · [Known vulnerabilities in 7.14](https://tails.net/security/known_security_vulnerabilities_in_7.14/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>A scheduled release that brings in security updates to Tor Browser and tor. Tails also published a known-vulnerabilities notice for 7.14 asking users to upgrade as soon as possible. Upstream does not mention active exploitation.
- Tor Browser moves from 15.0.24 to 15.0.25, with security fixes backported from Firefox 158; see the [Tor changelog](./tor.md). The Tor client moves to 0.4.9.14, a security release carrying three TROVE identifiers, each covered in the [tor daemon changelog](./tor-daemon.md).
- The known-vulnerabilities notice again gives no list. Checking the 7.15 package list against Debian security advisories since 29 September, the four that missed 7.14 are all included: OpenSSL (DSA-6531-1, 13 CVEs), pcre2 (DSA-6530-1), WebKitGTK (DSA-6534-1, together with the 2 October regression fix) and libpng (DSA-6537-1).
- Five advisories issued after 30 September are included. Three can be triggered just by opening a file: LibreOffice (DSA-6543-1, 6 CVEs), Ghostscript (DSA-6550-1) and librsvg for SVG images (DSA-6555-1). The other two are xz-utils (DSA-6549-1) and ntfs-3g (DSA-6557-1), which reads and writes NTFS disks. The latter matters directly for how Tails is used: plug in a Windows USB stick of unknown origin, and ntfs-3g is what handles its file system.
- The kernel stays at 6.12.111; Debian's 16 October kernel security advisory (DSA-6568-1) came after this release. The curl (DSA-6558-1), JPEG XL (DSA-6564-1) and expat (DSA-6566-1) advisories also came after 14 October, and 7.15 still ships the pre-fix versions.
- Some firmware packages are updated, improving graphics and Wi-Fi support on newer hardware.
- Automatic upgrades are available from Tails 7.0 or later. A fresh install wipes any existing Persistent Storage.

## Tails 7.14

> 2026-09-30 · [Upstream announcement](https://tails.net/news/version_7.14/){target="_blank"} · [Known vulnerabilities in 7.13](https://tails.net/security/known_security_vulnerabilities_in_7.13/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>A scheduled release that brings in security updates to Tor Browser and tor. Tails also published a known-vulnerabilities notice for 7.13 asking users to upgrade as soon as possible. Upstream does not mention active exploitation.
- Tor Browser moves from 15.0.23 to 15.0.24, rebased onto 140.17.0esr with security fixes backported from Firefox 157, and its release files are now signed with a new GPG subkey; see the [Tor changelog](./tor.md).
- The Tor client moves to 0.4.9.13, a security release carrying ten TROVE identifiers, one of which could let a malicious onion service break Tor Browser's first-party isolation; see the [tor daemon changelog](./tor-daemon.md).
- The known-vulnerabilities notice again gives no list, only pointing to the Tor Browser release notes and the Debian security advisories since 7.13. Checking the 7.14 package list against Debian advisories published after 16 September, nine besides tor are included. xdg-dbus-proxy (DSA-6510-1) had message filtering that could be bypassed, letting a malicious Flatpak app potentially execute code outside its sandbox. Flatpak itself (DSA-6524-1) has eight more CVEs leading to denial of service or information disclosure.
- Four can be triggered just by opening a file: libheif for HEIF and AVIF images (DSA-6523-1), Ghostscript for PostScript and PDF (DSA-6516-1), LibreOffice (DSA-6512-1) and GIMP (DSA-6509-1), where a malicious file could lead to arbitrary code execution. rsync (DSA-6527-1) moves to 3.5.0 and fixes 33 CVEs whose combined impact includes local privilege escalation. The remaining two are the BIND DNS tools (DSA-6505-1) and the kernel.
- The kernel moves from 6.12.107 to 6.12.111, matching Debian's 29 September kernel advisory DSA-6528-1.
- Debian's 30 September OpenSSL advisory (DSA-6531-1, 13 CVEs) and 29 September pcre2 advisory (DSA-6530-1) missed this release, and 7.14 still ships the pre-fix versions. The WebKitGTK (DSA-6534-1) and libpng (DSA-6537-1) advisories came on 1 October, after 7.14 was released.
- Fixed the default keyboard input method when starting a session in Korean.
- Automatic upgrades are available from Tails 7.0 or later. A fresh install wipes any existing Persistent Storage.

## Tails 7.13

> 2026-09-16 · [Upstream announcement](https://tails.net/news/version_7.13/){target="_blank"} · [Known vulnerabilities in 7.12](https://tails.net/security/known_security_vulnerabilities_in_7.12/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Regular scheduled release carrying Tor Browser and tor security updates. Tails also published a known-vulnerabilities notice for 7.12 asking everyone to upgrade as soon as possible. Upstream does not mention any being exploited.
- Tor Browser moves from 15.0.21 to 15.0.23, picking up the 15.0.22 changes along the way. 15.0.23 fixes two security-level bypasses that let a browser set to Safer still run WebAssembly, and backports security fixes from Firefox 156; details in the [Tor changelog](./tor.md).
- The tor client moves to 0.4.9.12, a security release covering seven TROVE identifiers, each one covered in the [tor daemon changelog](./tor-daemon.md).
- The known-vulnerabilities notice lists nothing itself, pointing only to the Tor Browser release notes and to Debian security advisories published since 7.12. Checking the 7.13 package list against Debian advisories issued after 3 September turns up four fixes that made it in. libevent (DSA-6493-1) carries 8 CVEs: out-of-bounds access in its DNS, RPC and bufferevent code plus a use-after-free in evbuffer, potentially allowing arbitrary code execution. tor itself links against this library.
- The H.265 decoder in libde265 (DSA-6486-1) and the Opus decoder in GStreamer (DSA-6489-1) could potentially execute arbitrary code when processing a malformed video or audio file. jbig2dec (DSA-6488-1), which decodes the JBIG2 images common in PDFs, had an input-validation flaw leading to denial of service.
- The kernel is 6.12.107, matching Debian's latest kernel security advisory, DSA-6477-1. We could not determine which kernel 7.12 shipped, so the kernel is not counted as a change in 7.13.
- Shutting down is simpler. Since 7.10 you had to confirm in a Power Off dialog; Tails now shuts down straight away when no application needs closing and no document needs saving.
- Automatic upgrades are available from Tails 7.0 or later. Fresh installations will erase existing Persistent Storage.

## Tails 7.12

> 2026-09-03 · [Upstream announcement](https://tails.net/news/version_7.12/){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>Regular scheduled release, not an emergency security update. The announcement lists no fixed vulnerabilities, and upstream does not mention any being exploited.
- Firefox moves to a two-week release cadence from September 2026, and Tor Browser and Tails follow. 7.12 is the first release on the new schedule, so updates arrive more often from here on.
- Tor Browser updated to 15.0.21, which carries security fixes backported from Firefox 155.
- Electrum updated from 4.7.2 to 4.8.1.
- Updated some firmware packages, improving support for newer hardware such as graphics and Wi-Fi.
- Automatic upgrades are available from Tails 7.0 or later. Fresh installations will erase existing Persistent Storage.

## Tails 7.11

> 2026-08-19 · [Upstream announcement](https://tails.net/news/version_7.11/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>A scheduled release that also carries a Linux kernel security update.
- Tor Browser updated to 15.0.20 (based on Firefox ESR 140.14).
- The kernel is updated to 6.12.101, covering the 24 flaws in Debian security advisory DSA-6415-1, whose impact ranges over privilege escalation, denial of service, and information leaks.
- Fixes Persistent Storage failing to unlock on some computers. Activation used to wait for `udevadm settle`, so an unrelated hardware problem could make that step time out or fail; the wait has been removed.
- Adds the `proc_mem.force_override=ptrace` kernel parameter, which stops a process from writing directly to its own memory mappings and makes privilege-escalation flaws harder to exploit.
- Circumvention settings now import Moat fronts and reflectors from Tor Browser automatically, so connections fail less often because of stale settings.
- The flatpak package follows the Debian security update and is now based on 1.16.6-1~deb13u2.
- Automatic upgrades are available from Tails 7.0 or later; a manual upgrade is available if the automatic one fails. Fresh installations will erase existing Persistent Storage.

## Tails 7.10.1

> 2026-08-05 · [Upstream announcement](https://tails.net/news/version_7.10.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>Emergency security release fixing critical flaws in the Linux kernel and the expat XML library.
- The kernel is updated to 6.12.100, fixing CVE-2026-64560, which could let Tor Browser inside Tails gain administrator privileges. A malicious website that exploits it could fully compromise Tails and deanonymize the user. The attack is unlikely and would take a strong adversary such as a government or a hacking firm; no active exploitation has been observed.
- The expat XML library is updated to 2.8.2, fixing DSA-6404-1, a set of flaws that could let applications using expat gain administrator privileges. Opening a malicious file in LibreOffice, Audacity, or Git could lead to the same full compromise and deanonymization. No active exploitation has been observed.
- USB images and automatic upgrades are 70 MB smaller after removing unused firmware.
- Automatic upgrades are now compressed with zstd for a faster startup, matching what the USB image has done since Tails 7.0.
- This is a security-only release that keeps 7.10's software set. Automatic upgrades are available from Tails 7.0 or later.

## Tails 7.10

> 2026-07-23 · [Upstream announcement](https://tails.net/news/version_7.10/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>A scheduled release introducing a new shutdown procedure and a new video player.Upstream mentions no real-world attacks involving these.
- Adopts GNOME's standard shutdown procedure. The Power Off dialog now warns about unsaved documents and open applications, and shutdown completes automatically after 60 seconds. It is a bit slower in exchange for better data protection. An emergency shutdown option remains for a faster power-off.
- The video player is now Celluloid, more modern and reliable, and it has no network access. To watch videos online, use Tor Browser or install VLC as additional software. Celluloid does not work on computers manufactured in 2011 or earlier.
- Tor Browser updated to 15.0.19.
- Updated some firmware to improve support for newer hardware such as graphics cards and Wi-Fi.
- Automatic upgrades are available from Tails 7.0 or later; a manual upgrade is available if the automatic one fails. Fresh installations will erase existing Persistent Storage.

## Tails 7.9.1

> 2026-07-01 · [Upstream announcement](https://tails.net/news/version_7.9.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>Emergency security release fixing two local privilege-escalation flaws in the Linux kernel.
- Patches CVE-2026-43503 (DirtyClone) and CVE-2026-46331 (PACKET_EDIT_MEME), with the kernel updated to 6.12.94. Such flaws let an application inside Tails gain administrator privileges; combined with other unknown vulnerabilities they could fully compromise Tails and deanonymize the user. No active exploitation has been observed.
- Tor Browser updated to 15.0.17, and the Tor client to 0.4.9.11.
- This is a security-only release; aside from Tor Browser, the kernel, and the Tor client, it keeps 7.9's software set. Automatic upgrades are available from Tails 7.0 or later.

## Tails 7.9

> 2026-06-18 · [Upstream announcement](https://tails.net/news/version_7.9/){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>Regular scheduled release, not an emergency security update.Upstream mentions no real-world attacks involving these.
- Tor Browser updated to 15.0.16.
- Updated some firmware packages, improving support for newer hardware such as graphics and Wi-Fi.
- Fixed a bug where the "outdated Secure Boot certificate" prompt could appear in the rare case when the certificates were already up to date.
- The Linux kernel, Thunderbird, and the Debian base are unchanged from 7.8. Automatic upgrades are available from Tails 7.0 or later.

## Tails 7.8.1

> 2026-06-04 · [Upstream announcement](https://tails.net/news/version_7.8.1/){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>Emergency security release fixing a serious Linux kernel vulnerability and several Tor client security vulnerabilities.
- Patches the Linux kernel flaw CVE-2026-43503 (kernel updated to 6.12.90-2), a local privilege escalation that lets an application inside Tails gain administrator privileges; combined with other unknown vulnerabilities it could fully compromise Tails and deanonymize the user. No active exploitation has been observed.
- Tor client updated to 0.4.9.9, fixing several security vulnerabilities.
- This is a security-only emergency release; Tor Browser, Thunderbird, and the Debian base version are unchanged from 7.8. Automatic upgrades are available from Tails 7.0 or later.

## Tails 7.8

> 2026-05-21 · [Upstream announcement](https://tails.net/news/version_7.8/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Tor Browser updated to 15.0.14 (based on Firefox ESR 140.11).Upstream mentions no real-world attacks involving these.
- Mitigates the Linux kernel local privilege escalation "Fragnesia" (alongside the earlier "Dirty Frag" mitigation). Such flaws let an application inside Tails gain administrator privileges, which combined with other unknown vulnerabilities could fully compromise Tails and deanonymize the user.
- Mitigates a Flatpak sandbox escape via Yelp; yelp updated to 42.2-4tails1.
- Patches CVE-2026-46529 (evince), CVE-2026-41989 (libgcrypt20), and CVE-2026-41054 (haveged).
- Thunderbird is no longer shipped with the image. It can still be installed automatically through Persistent Storage's additional software, pulling the latest version from Debian on each Tails startup. The previously bundled version was often out of date because Debian's Thunderbird update typically lands shortly after each Tails release, both of which follow Firefox's release cadence.
- Base system upgraded to Debian Trixie 13.5.
- The Secure Boot CA upgrade prompt now only appears when Secure Boot is enabled, avoiding misleading notifications when it is disabled.
- WhisperBack error reports now include installed Flatpak applications and runtimes.

!!! info "Earlier versions"

    Entries for Tails 7.7.3, 7.7.2, and 7.7.1 are currently available only in [traditional Chinese](https://anoni.net/docs/changelog/tails/){target="_blank"}. English versions will be added as the community translates them.

## Tails 7.6

> 2026-03-26 · [Upstream announcement](https://tails.net/news/version_7.6/){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>Regular scheduled release, not an emergency security update. The announcement lists no fixed vulnerabilities, and upstream does not mention any being exploited.
- The Tor Connection assistant can now help you get a [bridge](../tools/tor-browser-advanced.md). Bridges are unlisted Tor relays that serve as a first hop into Tor on networks that block it. If connecting automatically fails, the bridge settings offer a new option to ask for a Tor bridge based on your region.
- Tails downloads bridges likely to work in your region through the Tor Project's Moat API, disguising that connection with domain fronting (a technique that makes it look like a connection to a different website). Tor Browser outside Tails has used the same approach since version 11.5.
- The built-in password manager changes from KeePassXC to GNOME Secrets. Both use the same file format, so Secrets tries to unlock your existing KeePassXC database automatically, and accessibility features such as the on-screen keyboard and cursor size work with it again. If you still need KeePassXC's advanced features, you can install it as additional software in Persistent Storage.
- Tor Browser moves to 15.0.8, Thunderbird to 140.8.0, and Electrum from 4.5.8 to 4.7.0.
- Updated firmware packages improve support for newer hardware, including graphics and Wi-Fi.
- Fixed automatic upgrades in Turkish and the "Learn More" button in the Thunderbird migration notification.
- Automatic upgrades are available from Tails 7.0 or later. A fresh install wipes any existing Persistent Storage.

## Tails 7.1

> 2025-10-14 · [Upstream announcement](https://tails.net/news/version_7.1/){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>Regular scheduled release, not an emergency security update. The announcement lists no fixed vulnerabilities, and upstream does not mention any being exploited.
- The Tor Browser home page in Tails is now an offline page, close to the one in Tor Browser outside Tails, so starting the browser no longer loads an online page from the Tails website.
- Clearer message when an application needs an administration password but none was set in the Welcome Screen.
- Tor Browser moves to 14.5.8, the Tor client to 0.4.8.19, and Thunderbird to 140.3.0.
- Removed the `ifupdown` package.
- New tabs in Tor Browser no longer show the message that your Tor connection is not managed by Tor Browser ([#21215](https://gitlab.tails.boum.org/tails/tails/-/issues/21215){target="_blank"}).
- Automatic upgrades are available from Tails 7.0 or later. A fresh install wipes any existing Persistent Storage.

## Tails 6.18

> 2025-07-25 · [Upstream announcement](https://tails.net/news/version_6.18/){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>Regular scheduled release, not an emergency security update. The announcement lists no fixed vulnerabilities, and upstream does not mention any being exploited.
- You can now connect to Tor with WebTunnel bridges. WebTunnel disguises your connection as ordinary web traffic and may work where obfs4 bridges are blocked. WebTunnel bridges are available from the [Tor Project's bridge distribution site](https://bridges.torproject.org/){target="_blank"}.
- Tor Browser moves to 14.5.5 and Thunderbird to 128.12.0.
- Automatic upgrades are available from Tails 6.0 or later. A fresh install wipes any existing Persistent Storage.
