---
title: Messaging App Security Updates
description: WhatsApp and Signal security advisories in plain language, covering whether anything is being exploited, which platforms are affected and which version to update to.
icon: material/message-lock-outline
digest:
  name: Messaging apps
  devices: [iphone, android, windows, mac, linux]
  tracks: [WhatsApp, Signal]
  basis: rated by whether upstream flags exploitation
---

# :material-message-lock-outline: Messaging App Security Updates

Security advisories for WhatsApp and Signal, newest at the top. Messaging apps automatically process messages, images and links sent by strangers, and some flaws trigger without the user opening anything, which is why attacks on specific targets such as journalists and advocates often start here. In August 2025, Meta assessed that WhatsApp's CVE-2025-55177 had been chained with an Apple OS flaw, CVE-2025-43300, to attack specific users, and CISA added it to its Known Exploited Vulnerabilities catalogue (KEV).

The two apps publish differently. WhatsApp's are issued by Meta as CVEs and collected by year on the [WhatsApp security advisories](https://www.whatsapp.com/security/advisories){target="_blank"} page. Signal rarely publishes standalone advisories and usually folds fixes into regular releases, so this page adds a Signal entry only when a security issue is made public.

## How we rate urgency

- <span class="urg-tag urg-tag--now">Now</span>Upstream flags active exploitation, or CISA has added it to KEV.
- <span class="urg-tag urg-tag--soon">Soon</span>A security advisory has been published, with no exploitation flagged upstream. Messaging app flaws often need no user interaction to trigger, so any advisory counts as Soon.

Releases without a security advisory are not listed, so "Routine" never appears here. "Now" requires evidence, the same basis as the iOS and Windows pages.

## July to September 2026

Neither WhatsApp nor Signal published a new security advisory in these three months. WhatsApp's most recent were two CVEs in May, listed below. Signal shipped 41 stable releases across its three platforms over the same period, and none of the release notes mention a security fix.

Keep automatic updates on even when there are no advisories. Every Signal version has an expiry date, and an outdated one stops working until it is updated. WhatsApp for Windows updates through the Microsoft Store, so check that automatic updates in the Store have not been switched off.

## WhatsApp May 2026

> 2026-05-01 · [WhatsApp security advisories](https://www.whatsapp.com/security/advisories/2026/){target="_blank"} · [CVE-2026-23863](https://www.facebook.com/security/advisories/cve-2026-23863){target="_blank"} · [CVE-2026-23866](https://www.facebook.com/security/advisories/cve-2026-23866){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Two flaws; upstream states that it has not seen evidence of exploitation in the wild.
- CVE-2026-23863: attachment spoofing in WhatsApp for Windows. A document with NUL bytes embedded in its filename could appear in WhatsApp as one type of file but run as an executable when opened. Versions before v2.3000.1032164386.258709 are affected.
- CVE-2026-23866: incomplete validation of AI rich response messages for Instagram Reels in WhatsApp for iOS and Android, which could let another user make your device process media from an arbitrary URL and even trigger OS custom URL scheme handlers. Affects iOS versions 2.25.8.0 to 2.26.15.72 and Android versions 2.25.8.0 to 2.26.7.10.
- The second works much like CVE-2025-55177, exploited in August 2025: both get the device to process a URL chosen by the attacker.
