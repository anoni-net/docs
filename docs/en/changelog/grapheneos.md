---
title: GrapheneOS Monthly Summary
description: "Plain-language monthly summaries of GrapheneOS releases: how far the Android security patch level has advanced, which everyday features got fixed, and any changes to device support."
icon: material/cellphone-lock
digest:
  name: GrapheneOS
  devices: [android]
---

# :material-cellphone-lock: GrapheneOS Monthly Summary

Release summaries for [GrapheneOS](../tools/grapheneos.md), aggregated by month. Over the past four months a new release landed every six days on average, and the version number is just the release date (`2026081300`, for example), so going release by release tells you very little. This page groups each month into one entry and answers three questions: how far the Android security patch level advanced, which everyday features got fixed, and whether device support changed. Newest month at the top.

GrapheneOS updates automatically in the background, so ordinary users need to do nothing on account of this page. It is here for people who want to know what is happening underneath, or who need to explain to a team why they chose this OS.

Source data comes from the [official releases page](https://grapheneos.org/releases){target="_blank"}. The official atom feed keeps only the last 20 entries (roughly four months), so anything older has to be looked up on the site.

## November 2026

> Releases `2026110100`, `2026110200`, `2026110700`, `2026110800`, `2026111300` · [Official releases](https://grapheneos.org/releases){target="_blank"}

- `2026111300` on 13 November removes the last eMudhra root certificate, the RSA root left in place by the 21 October release (see [October 2026](#October-2026)). GrapheneOS notes that this root has no known compromised keys, but that Chrome, Firefox and Vanadium will block new certificates issued under it from 16 November, Microsoft will remove it on the same date and Apple on 30 November, so it is being removed ahead of them. The release also removes 26 obsolete root certificates that the stock Pixel OS has already dropped but AOSP still carries.
- Vanadium moves to 157.0.8103.50.0 and then 157.0.8103.78.0, bringing in CVE-2026-125350, the actively exploited flaw Chrome fixed on 9 November, and the 83 fixes from 11 November (see [Browser security updates](./browsers.md)).
- The 6.1 and 6.18 kernels follow the latest GKI LTS revisions, reaching 6.1.182 and 6.18.39. 6.18 again allows SHA-1 to be requested explicitly, which some carriers' IMS tunnels (the encrypted links used by services such as Wi-Fi calling) still need for legacy ciphers; it was disabled by accident in the port to 6.18. On 10th generation Pixels the release also fixes GNSS initialisation failure handling, memory leaks on early initialisation failure in the pKVM SMMU driver, and unnecessary polling with some USB PD chargers.
- Fixes an upstream bug that made WebView exit abnormally, caused by external service metadata not being kept when app information is updated.
- The security preview release (`2026111301`) still covers December 2026 to May 2027, and its list of additional fixed CVEs has 118 entries (13 Critical, 105 High).
- `2026110800` on 8 November ships only to the four 10th generation Pixel models (Pixel 10, 10 Pro, 10 Pro XL and 10 Pro Fold), backporting from the Android 17 QPR2 Beta a fix for an upstream bug in how sleep time is calculated. The stock OS has the same bug, which became more frequent after the GKI update in the previous release.
- `2026110700` on 7 November adds an API for requesting coarse location from the OS, for use by Vanadium and Sandboxed Google Play. Sandboxed Google Play previously carried its own reimplementation of the upstream location obfuscation code (LocationFudger); with the new API it no longer has to maintain that copy.
- Emergency number handling is rewritten, now pulling the correct data from Safety Hub in place of upstream AOSP's outdated and buggy implementation.
- The launcher's search filtering, previously applied only to the private space, now extends to work profiles that are locked or paused, so apps inside them no longer appear in search results.
- Native zygote processes launched through secure spawning once again set supplementary groups and NoNewPrivs (a flag that stops a process from gaining new privileges). This path is mainly used by Vanadium, Chrome and some Chromium-based browsers to run renderers in a more memory-efficient way.
- The 6.18 kernel moves to the latest GKI LTS revision and backports an upstream fix for a use-after-free in FUSE (memory used again after being released, which can be abused to slip in malicious code). On 10th generation Pixels, it fixes an audio offload compatibility problem from the move to 6.18, the handling of zram initialisation failures, and an upstream bug where PCIe rescans lacked synchronisation.
- Time zone data is updated to 2026f, and Vanadium moves to 157.0.8103.38.0.
- The security preview release (`2026110701`) now extends to patches Google has scheduled for its December 2026 to May 2027 bulletins; the list of additional fixed CVEs has 107 entries (12 Critical, 95 High).
- `2026110200` on 2 November brings the full 2026-11-01 security patch level; the November bulletin is summarised in [Android Security Patch Levels](./android.md). Through the 13 November release, no release notes mention moving to 2026-11-05. Google published its Pixel Update Bulletin on 10 November, summarised in [Android Security Patch Levels](./android.md).
- The 6.1 kernel picks up a batch of regression fixes from the Android GKI branch and upstream Linux, including a null pointer dereference in MGLRU, an infinite loop in page migration, and use-after-free bugs in USB HID, MIDI and block encryption.
- On 10th generation Pixels it fixes two charging problems from the move to 6.18: chargers supporting AVS could not PPS fast charge, and the charging log code made an invalid memory access (caught by UBSan).
- The security preview release (`2026110201`) now covers December 2026 to April 2027. The November batch has been published officially and dropped off the list, which is down to 94 entries (8 Critical, 86 High).
- `2026110100` on 1 November ports all of the 10th generation Pixel drivers to the 6.18 kernel and switches over to it, fixing a batch of upstream driver bugs along the way, covering DMA mapping in pKVM and the SMMU, memory lifetimes, and handling of initialisation failures.
- The 6.18 kernel switches to the Rust implementation of Binder (the mechanism Android processes use to communicate with each other), replacing the old C implementation. Lockdown moves from confidentiality mode to integrity mode because DMA-BUF accounting now uses a BPF program that is incompatible with confidentiality mode; the microdroid kernel stays in confidentiality mode.
- All four kernel lines get a backported fix for CVE-2026-98432, a flaw in MPTCP. GrapheneOS states that its kernels already had MPTCP disabled, with MTE and other protections on top. 6.1, 6.12 and 6.18 move to 6.1.182, 6.12.97 and 6.18.38 respectively.
- A remotely triggerable denial-of-service flaw from the November bulletin had been fixed in the security preview release since July 2026; this release brings the fix into the regular release.
- Adds working satellite cellular support that no longer partially breaks Android Auto the way earlier attempts did. GrapheneOS has confirmed it works with T-Mobile's T-Satellite.
- The two protections added in the 13 August release are reverted because of app compatibility issues: the Credential Manager selection screen (CredentialSelectorActivity) and Sandboxed Google Play's FIDO screens are no longer marked opaque (see the August 2026 entry).
- Fixed an upstream use-after-free in SystemUI's picture-in-picture touch handling (PipTouchHandler), and an upstream bug that broke accessibility actions on the launcher home screen.
- Vanadium moves through 156.0.8078.73.0 and 156.0.8078.79.0, the Messaging app moves to version 18, and TalkBack moves to version 23.
- The security preview release (`2026110101`) applies early the patches Google has scheduled for its November 2026 to April 2027 bulletins; the list of additional fixed CVEs has 152 entries (11 Critical, 141 High), up from 139 in the 21 October release.
- None of GrapheneOS's five release notes this month mention any actively exploited vulnerability, and Google does not flag any item in its November Android Security Bulletin or Pixel Update Bulletin either.
- Device coverage runs from Pixel 6 to Pixel 10a, unchanged.

## October 2026

> Releases `2026100200`, `2026100600`, `2026101600`, `2026102100` · [Official releases](https://grapheneos.org/releases){target="_blank"}

- `2026102100` on 21 October removes eMudhra's ECDSA root certificate because intermediate certificates under it were compromised. Vanadium already received this removal through GrapheneOS's servers as an out-of-band component update when it shipped for Chrome; this release removes the copy built into the system. Both legacy eMudhra roots go too, leaving only the heavily used RSA root, which GrapheneOS says it is considering removing or disabling by default even though other platforms are not removing it at this time. The matching Firefox fix is in [browser security updates](./browsers.md).
- Auditor gets a built-in exemption from app hibernation. After 90 days without being opened, hibernation removed Auditor's scheduled remote attestation job, which then produced alerts until the user opened the app again.
- Sandboxed Google Play fixes two compatibility problems: some services crashing with new versions of Play services and the Play Store, and the Google Search app failing to install.
- The hardening for apps with lockscreen activities added in the previous release is reverted because of compatibility issues. The release notes do not say whether this is the same item as the lockscreen weakness fixed in that release.
- All four kernel branches (6.1, 6.6, 6.12, 6.18) get additional upstream security patches not yet in the GKI LTS branches, and 6.12 and 6.18 move to the latest GKI LTS revision. 6.18 brings back linear map randomization, which makes kernel memory addresses harder to predict.
- `2026101600` on 16 October moves the Pixel kernel drivers to the October 2026 versions. GrapheneOS states the update was delayed because Google had not released the source code as required by GPLv2, and also states that none of the security fixes listed in Google's October Pixel Update Bulletin fall in the kernel drivers for 6th through 10th generation Pixels, so the delay did not hold those fixes back.
- The same release fixes two upstream Android vulnerabilities: WindowManagerService mixing up the PID and UID parameters, and an activity that had been covered by the lock screen being shown again after another activity finished.
- The Sensors permission now extends to device-specific sensor types, which on Pixels adds the temperature, pressure and proximity sensors. Apps without the permission cannot read them.
- Sandboxed Google Play switches to a new way of communicating with the OS to support newer Play services releases, and the Play Store's install confirmation dialog is improved. A firmware update problem with NFC, eSE and eSIM on 9th generation Pixels, introduced with the October update, is fixed.
- The security preview release still covers patches Google has scheduled for its November 2026 to April 2027 bulletins; the list of additional fixed CVEs grows from 122 to 136 entries (7 Critical, 129 High).
- The 6.12 kernel moves to 6.12.96, and 6.1 and 6.18 follow the latest GKI LTS revisions. Vanadium moves through 155.0.8059.39.0, 155.0.8059.79.0 and 155.0.8059.84.0, matching Chrome's stable releases of 6, 13 and 15 October. Time zone data is updated to 2026e, and the boot animation is replaced with GrapheneOS's own.
- `2026100600` on 6 October brings the full 2026-10-05 security patch level and the October Pixel firmware, the same day as Google's Pixel Update Bulletin. The October bulletin is summarised in [Android Security Patch Levels](./android.md).
- The security preview release (`2026100601`) now covers patches Google has scheduled for its November 2026 to April 2027 bulletins. The list of additional fixed CVEs has 122 entries (8 Critical, 114 High); the October batch has been published officially and dropped off the list.
- Fixed an upstream integer overflow in `ZipFileRO.cpp` that caused memory corruption with a ZIP entry name of 65,535 bytes.
- system_server JARs and non-APEX APKs are now always compiled ahead of time with the speed compiler filter, instead of speed-profile when a profile exists; GrapheneOS says this improves core OS performance.
- Seedvault (the system backup tool) moves to the latest upstream Android 17 branch in place of GrapheneOS's own port, along with fixes for a batch of bugs and interface problems.
- The 2 October release disabled unprivileged hardware keepalives (keepalive packets the network chip sends on an app's behalf). GrapheneOS states they create a VPN leak, so they are turned off.
- The listed security patch level rises to 2026-09-05. The release notes say the 2026-09-05 patches had already been in place for a while, and the previous release brought in all the Pixel firmware and driver updates from Android 17 QPR1, so the listed level now reflects that. The cellular modem flaw CVE-2026-58704 from the September entry sits in the 2026-09-05 level; the notes still do not name it.
- The Pixel kernel restores the Android 17 (CP2A) mmap read-ahead behaviour, fixing stutter under memory pressure caused by an upstream change in QPR1.
- Fixed an upstream Android bug that set the last-modified time of files restored from Android backups to January 1970, because seconds were passed to an API expecting milliseconds.
- All four kernel lines (6.1, 6.6, 6.12, 6.18) moved to the latest GKI LTS revisions, with 6.18 reaching 6.18.33 on 2 October and 6.12 reaching 6.12.94 on 6 October.
- Vanadium moved to 154.0.8037.92.0 on 2 October, matching Chrome's 29 September stable release, then to 154.0.8037.126.0 on 6 October.
- Device coverage runs from Pixel 6 to Pixel 10a, unchanged.

## September 2026

> Releases `2026090500`, `2026090700`, `2026091000`, `2026091700`, `2026091900`, `2026092500` · [Official releases](https://grapheneos.org/releases){target="_blank"}

- The security patch level advanced to the full 2026-09-01 Pixel level on 10 September. Google's September bulletin, published on 8 September, carries vulnerability details again; that month is covered in [Android Security Patch Levels](./android.md).
- The Pixel Update Bulletin of 15 September says the cellular modem flaw CVE-2026-58704 may be under targeted exploitation (details in [Android Security Patch Levels](./android.md)), with Google's fix in the 2026-09-05 patch level. GrapheneOS release notes up to the 25 September release mention neither 2026-09-05 nor this CVE. The 17 September release backported cellular modem firmware from Android 17 QPR1 and the 25 September release moved the whole hardware support stack to QPR1, but the notes do not say whether either covers this fix. The 2 October release raised the listed patch level to 2026-09-05 (see October 2026).
- The Dialer gained automatic call recording. The 5 September release shipped it with a per-call opt-out covering both incoming and outgoing calls, and an on-screen notice while recording is active. The 10 September release added an option to record every contact by default with a list of excluded numbers, and declared the microphone and phone foreground service types to fix recording not starting when a call is answered over Bluetooth. From 17 September, anyone turning on automatic recording for the first time gets this exclusion-list mode by default instead of adding contacts one by one. Call recording carries legal constraints in many places, so check the rules where you are before enabling it.
- Private Space closed two upstream privacy gaps. App drawer search no longer lists apps inside a locked Private Space, something the Pixel Launcher avoids only because it delegates search to Android System Intelligence. Settings also gained a warning that Android's built-in option for hiding a Private Space is superficial and has several known detection tricks. Anyone treating a Private Space as genuinely hidden should reassess.
- The 17 September release added clipboard read restrictions, set per app or as a global default. With it on, an app cannot read the clipboard by itself; pasting goes through the system selection toolbar, the keyboard, keyboard shortcuts or accessibility services, so the user always initiates it. Clipboards often hold passwords and one-time codes, and this keeps background apps away from them. Blocked reads trigger a notice, and on 19 September the minimum interval between repeats of that notice dropped from one minute to six seconds; anyone who finds it noisy can switch the notice off per app. The 25 September release improved the settings interface for this feature. The bundled keyboard also gained a paste chip that offers recently copied content.
- hardened_malloc (the hardened memory allocator GrapheneOS maintains) switched to `MADV_DONTNEED_LOCKED` for better `mlockall` compatibility, and fixed extreme out-of-memory edge cases where a mapping could be unmapped without its replacement being put in place. The 25 September release added several allocation performance optimisations.
- The system file manager (DocumentsUI) no longer strips location metadata from copies and certain moves. That was an upstream bug that left people believing they had kept a complete original.
- Vanadium (the hardened Chromium browser bundled with GrapheneOS) shipped four updates up to the 5 September release, tracking the Chromium 152 series. It moved to the 153 series on 17 September and to the 154 series (154.0.8037.57.1) on 25 September.
- All three kernel lines (6.1, 6.6, 6.12) moved to the latest GKI LTS revisions. The 6.6 and 6.12 lines also work around an upstream arm64 KVM bug that stops devices booting with lockdown in confidentiality mode. The 17 September release brought the three lines to 6.1.177, 6.6.143 and 6.12.93, and added a 6.18 kernel branch.
- Pixel cellular modem firmware was backported from Android 17 QPR1 on 17 September, which caused compatibility problems with some carriers. The 19 September release backported the matching CarrierSettings to fix them, and fixed a crash in the Wi-Fi calling component (wfc-pkt-router). The 25 September release added infrastructure for Android 17 to use QPR1 hardware support directly, moving kernel drivers, firmware and userspace hardware support code wholesale to QPR1, and restored the modem carrier override for 6th-generation Pixels that Google had left out.
- The 25 September release restored the SIM PIN scrambling toggle on the new Protect SIM card screen. With it on, the digits move to different positions each time, so someone watching your fingers cannot read the PIN.
- On 10th-generation and later Pixels, the 25 September release reclaimed the storage the stock OS reserves for preloaded AI models and gave it back to the user.
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
