---
title: GrapheneOS Monthly Summary
description: "Plain-language monthly summaries of GrapheneOS releases: how far the Android security patch level has advanced, which everyday features got fixed, and any changes to device support."
icon: material/cellphone-lock
---

# :material-cellphone-lock: GrapheneOS Monthly Summary

Release summaries for [GrapheneOS](../tools/grapheneos.md), aggregated by month. Over the past four months a new release landed every six days on average, and the version number is just the release date (`2026081300`, for example), so going release by release tells you very little. This page groups each month into one entry and answers three questions: how far the Android security patch level advanced, which everyday features got fixed, and whether device support changed. Newest month at the top.

GrapheneOS updates automatically in the background, so ordinary users need to do nothing on account of this page. It is here for people who want to know what is happening underneath, or who need to explain to a team why they chose this OS.

Source data comes from the [official releases page](https://grapheneos.org/releases){target="_blank"}. The official atom feed keeps only the last 20 entries (roughly four months), so anything older has to be looked up on the site.

## September 2026

> Releases `2026090500`, `2026090700`, `2026091000` · [Official releases](https://grapheneos.org/releases){target="_blank"}

- The security patch level advanced to the full 2026-09-01 Pixel level on 10 September. Google's September bulletin, published on 8 September, carries vulnerability details again; that month is covered in [Android Security Patch Levels](./android.md).
- The Dialer gained automatic call recording. The 5 September release shipped it with a per-call opt-out covering both incoming and outgoing calls, and an on-screen notice while recording is active. The 10 September release added an option to record every contact by default with a list of excluded numbers, and declared the microphone and phone foreground service types to fix recording not starting when a call is answered over Bluetooth. Call recording carries legal constraints in many places, so check the rules where you are before enabling it.
- Private Space closed two upstream privacy gaps. App drawer search no longer lists apps inside a locked Private Space, something the Pixel Launcher avoids only because it delegates search to Android System Intelligence. Settings also gained a warning that Android's built-in option for hiding a Private Space is superficial and has several known detection tricks. Anyone treating a Private Space as genuinely hidden should reassess.
- hardened_malloc (the hardened memory allocator GrapheneOS maintains) switched to `MADV_DONTNEED_LOCKED` for better `mlockall` compatibility, and fixed extreme out-of-memory edge cases where a mapping could be unmapped without its replacement being put in place.
- The system file manager (DocumentsUI) no longer strips location metadata from copies and certain moves. That was an upstream bug that left people believing they had kept a complete original.
- Vanadium (the hardened Chromium browser bundled with GrapheneOS) shipped four updates up to the 5 September release, tracking the Chromium 152 series.
- All three kernel lines (6.1, 6.6, 6.12) moved to the latest GKI LTS revisions. The 6.6 and 6.12 lines also work around an upstream arm64 KVM bug that stops devices booting with lockdown in confidentiality mode.
- Device coverage runs from Pixel 6 to Pixel 10a, unchanged this month.

## August 2026

> Releases `2026080500`, `2026081300` · [Official releases](https://grapheneos.org/releases){target="_blank"}

- The security patch level advanced to the full 2026-08-05 Pixel level, alongside August's Pixel driver and firmware code.
- The kernel backported the fix for CVE-2026-64560. Tails shipped an emergency fix for the same Linux kernel flaw in [7.10.1](./tails.md), where it let an attacker inside Tor Browser gain administrator privileges.
- Contact Scopes had compatibility problems with WhatsApp and sandboxed Google Play services on Android 17. A workaround shipped on 5 August, replaced by a proper fix on 13 August that runs the filtered query using the calling app's identity.
- Two vulnerabilities still unfixed upstream were closed on 13 August: both CredentialManager and the Play services FIDO activities were made opaque, so nothing underneath shows through. Fixing upstream issues before Google does is one of the practical differences from stock Android.
- Vanadium (the hardened Chromium browser bundled with GrapheneOS) shipped four updates during August, tracking the Chromium 151 series.
- Device coverage runs from Pixel 6 to Pixel 10a, unchanged this month.
- No release shipped between 13 August and the end of the month, the longest gap in the past four months.

## July 2026

> Releases `2026070500`, `2026071100`, `2026071500`, `2026072900` · [Official releases](https://grapheneos.org/releases){target="_blank"}

- The listed security patch level moved to 2026-07-05 on 11 July, a level for which neither the Android nor the Pixel bulletin lists additional patches. The same release picked up July's Pixel driver and firmware code.
- A location privacy flaw inherited from upstream Android was fixed: apps without precise location permission could still read secondary fields such as altitude and accuracy from the coarse location. GrapheneOS now rebuilds coarse locations from an allowlist of fields.
- Kernel hardware memory tagging caught a double-free in the USB gadget Ethernet driver. Protections GrapheneOS enables by default catching real upstream bugs is a pattern that recurs in later months here.
- The PIN entry interface used outside the lock screen gained the enhanced privacy treatment, and the 128-digit PIN limit now works in the new interface.
- Secure (exec) spawning was reimplemented, with the global toggle replaced by a per-app one and noticeably better app compatibility. A follow-up on 15 July handled anti-tampering libraries, so protection schemes like V-KEY are no longer blocked.
- ContactsProvider and Telephony each got an upstream Android security fix, the latter caused by a missing system permission check for apps targeting API levels below 30.

## June 2026

> Releases `2026060100` through `2026062800` (eight in total) · [Official releases](https://grapheneos.org/releases){target="_blank"}

- The month Android 17 shipped. The full 2026-06-01 level landed on 1 June, followed on 18 June by the full 2026-06-05 Pixel level released alongside Android 17. One CVE in that batch, CVE-2025-48595, was flagged as possibly under limited, targeted exploitation; see [Android security patch levels](./android.md). What Android 17 means for the position GrapheneOS is in is covered in [a separate post](../blog/posts/2026-grapheneos-android-17.md).
- Hardware memory tagging caught three upstream driver bugs this month: a use-after-free (memory handed back and then used again, which can be turned into running attacker code) in the Broadcom Wi-Fi driver, plus two out-of-bounds reads (reading memory it should not, potentially leaking another program's data) in the DisplayPort driver caused by displays that do not follow the DisplayPort specification.
- Network Location now requires TLSv1.3 for the Apple and Apple China location services as well, matching what GrapheneOS already required of its own service.
- Android 17 brought several behaviour changes: the Wi-Fi quick tile now actually disables Wi-Fi rather than merely disconnecting from the current network, and Nearby Devices was split to break out local network access, which stays enabled by default for apps not targeting Android 17.
- Settings again lists the duress password under the screen lock menu, a feature that only gets used if people can find it.
