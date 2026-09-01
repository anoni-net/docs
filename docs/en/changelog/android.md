---
title: Android Security Patch Levels
description: "Monthly Android security patch levels: how to check how far behind your device is, and what changed when Google stopped publishing vulnerability details in July 2026."
icon: material/android
---

# :material-android: Android Security Patch Levels

Summaries of Android's monthly security updates. This page works differently from the [iOS](./ios.md), [macOS](./macos.md), and [Windows](./windows.md) pages, for the reason given below. Newest month at the top.

## Why this page has no urgency ratings

Google's Android Security Bulletin changed in July 2026: the public pages no longer list vulnerability details. The June 2026 bulletin still carried 119 CVEs, split across Framework, System, Kernel, and the various chipset vendors, each tagged with a type and severity. The July and August pages contain nothing but explanatory text, right down to the boilerplate describing what the Type column of the details table means, while the table itself is absent. Rendering the page in a full browser gives the same result, so what is missing is the content itself.

Without the details there is no way to tell whether anything is under active exploitation in a given month, and that is exactly what the iOS and Windows pages rate. Rather than force a rating on uncertain data, this page tracks three things that can be established: how far the patch level advanced, how many CVEs it covers and at what severity, and how far behind your own device is.

CVE counts and severities come from the [GrapheneOS release notes](https://grapheneos.org/releases){target="_blank"}, which list the CVEs applied in each release. The numbers differ slightly from Google's bulletins because the counting scope is not identical.

## First, check how far behind your device is

The patch level a device actually runs is decided by its manufacturer, which is a separate matter from the date on Google's bulletin. Look under Settings, About phone, Android security update. Names vary between vendors, and what you see is a date like `2026-08-05`.

How to read that date:

- Within one month is normal. Every vendor needs time to integrate and test.
- Three months or more behind means the vulnerabilities disclosed in that window are still unpatched on your device. Android vulnerability details land in AOSP once disclosed, so attackers and defenders read the same material.
- A device that has stopped receiving updates will not get fixes for known vulnerabilities at all. If you handle sensitive contacts or reporting work, consider replacing it or installing a system that is still maintained.

Vendor support periods vary widely. Checking a model's committed support window before buying costs less than discovering it afterwards.

## August 2026

> Patch level 2026-08-05 · [Google bulletin](https://source.android.com/docs/security/bulletin/2026/2026-08-01){target="_blank"} · [GrapheneOS releases](https://grapheneos.org/releases){target="_blank"}

- Covers 196 CVEs: 34 Critical and 161 High.
- Google's public bulletin carries no details, so there is no way to see which components these fixes land in, or whether anything is under active exploitation.
- GrapheneOS separately closed two issues still unfixed upstream that month, making CredentialManager and the Play services FIDO activities opaque. See the [GrapheneOS monthly summary](./grapheneos.md).

## July 2026

> Patch level 2026-07-05 · [Google bulletin](https://source.android.com/docs/security/bulletin/2026/2026-07-01){target="_blank"} · [GrapheneOS releases](https://grapheneos.org/releases){target="_blank"}

- Covers 165 CVEs: 30 Critical and 131 High.
- This is the month the details disappeared. One month earlier there were complete sections with type annotations; from here on there is only a summary.
- Neither the Android nor the Pixel bulletin lists additional patches at this level, making it a routine advance.

## June 2026

> Patch levels 2026-06-01 and 2026-06-05 · [Google bulletin](https://source.android.com/docs/security/bulletin/2026/2026-06-01){target="_blank"} · [GrapheneOS releases](https://grapheneos.org/releases){target="_blank"}

- The last month with complete public details. Google's bulletin lists 119 CVEs; GrapheneOS counts 105 on their side.
- **CVE-2025-48595** was flagged as possibly under limited, targeted exploitation. It sits in the Framework component, is an elevation of privilege (a program obtaining higher system privileges than it started with), rated High, affecting Android 14, 15, 16, and 16-qpr2. When Google uses the phrase "limited, targeted", what usually sits behind it is commercial spyware aimed at specific individuals, and journalists and human rights workers are common targets. **If your work falls into that category, treat this entry as a "Now" in the sense the other pages use**: confirm your device is on patch level 2026-06-05 or later, and until it is, avoid handling sensitive contacts on it.
- Component split: System 37, Framework 30, Qualcomm closed-source 19, Unisoc 16, MediaTek 11.
- Type split: 41 elevation of privilege, 22 denial of service, 7 information disclosure, 2 remote code execution. Elevation of privilege dominating is normal for Android: an attack chain usually gets code running first, then uses privilege escalation to reach system level.
- The 2026-06-05 level shipped on 18 June alongside Android 17.

## May 2026

> Patch level 2026-05-05 · [Google bulletin](https://source.android.com/docs/security/bulletin/2026/2026-05-01){target="_blank"} · [GrapheneOS releases](https://grapheneos.org/releases){target="_blank"}

- Covers 111 CVEs: 18 Critical and 92 High.
- GrapheneOS hardware memory tagging caught a use-after-free (memory handed back and then used again, which can be turned into running attacker code) in the Broadcom Wi-Fi driver and an out-of-bounds read (reading memory it should not, potentially leaking another program's data) in the DisplayPort driver that month, neither of which upstream had found.

## April 2026

> [GrapheneOS releases](https://grapheneos.org/releases){target="_blank"}

- Covers 61 CVEs: 13 Critical and 48 High.
- GrapheneOS did not advance the listed patch level this month, and the releases were mostly functional fixes.
