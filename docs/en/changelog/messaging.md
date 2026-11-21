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

## July to November 2026 { #July-to-September-2026 }

After May, WhatsApp did not publish again until three CVEs on 20 November, covered in the entry below. As of 21 November Signal has published no new security advisory, and CISA's KEV catalogue has added no entries for either app. Signal shipped 41 stable releases across its three platforms from July to September, 20 more from 1 October to 10 November (6 for Android, 8 for iOS and 6 for desktop), and another 5 from 11 to 21 November (1 for Android, 2 for iOS and 2 for desktop), and none of the release notes mention a security fix.

Keep automatic updates on even when there are no advisories. Every Signal version has an expiry date, and an outdated one stops working until it is updated. WhatsApp for Windows updates through the Microsoft Store, so check that automatic updates in the Store have not been switched off.

## WhatsApp November 2026

> 2026-11-20 · [WhatsApp security advisories](https://www.whatsapp.com/security/advisories/2026/){target="_blank"} · [CVE-2026-23871](https://www.facebook.com/security/advisories/cve-2026-23871){target="_blank"} · [CVE-2026-102769](https://www.facebook.com/security/advisories/cve-2026-102769){target="_blank"} · [CVE-2026-44908](https://www.facebook.com/security/advisories/cve-2026-44908){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>Three flaws were disclosed on the same day, and the advisory for CVE-2026-23871 states it "may have been abused in conjunction with specific spam messages", so under this page's criteria the entry is rated Now. The fixes for all three have been out for some time, and anyone with automatic updates on is most likely covered already. Make sure the Android app is 2.26.35.74 or later (which covers all three), the iOS app 2.26.24.72 or later, and the Mac app 2.26.23.72 or later.
- CVE-2026-23871: WhatsApp and WhatsApp Business for Android did not fully validate external URLs in replies to "Click to WhatsApp" ads. An attacker sending a crafted ad-reply message could make the device fetch media from an attacker-controlled URL when the message was displayed in the chat, revealing its IP address. Fixed in 2.26.17.4, CVSS 3.5. As of 21 November it is not in KEV.
- CVE-2026-102769: an SQL injection in WhatsApp for Android. Tapping a specially crafted "order details" message sent from an unofficial client could delete locally stored WhatsApp files, and if the user was online when it arrived, the attacker could learn one bit of information about the chat database through a delivery-receipt timing side channel. Fixed in 2.26.35.74, CVSS 6.8; Meta states it has seen no evidence of exploitation in the wild.
- CVE-2026-44908: the remote-attestation check WhatsApp uses to trust Meta AI's confidential computing backend did not properly follow the certificate chain. Someone inside Meta's infrastructure could have bypassed the hardware root of trust, but such a certificate would first have to be published to the third-party transparency ledger used by WhatsApp Private Processing, and Meta says every certificate in the ledger chains to the hardware root of trust, confirming no exploitation. Affects iOS before 2.26.24.72, Mac before 2.26.23.72 and Android before 2.26.23.74, CVSS 4.8.
- CVE-2026-23871 is the same kind of flaw as May's CVE-2026-23866 and CVE-2025-55177, exploited in August 2025: each gets the device to process a URL chosen by the attacker.

## WhatsApp May 2026

> 2026-05-01 · [WhatsApp security advisories](https://www.whatsapp.com/security/advisories/2026/){target="_blank"} · [CVE-2026-23863](https://www.facebook.com/security/advisories/cve-2026-23863){target="_blank"} · [CVE-2026-23866](https://www.facebook.com/security/advisories/cve-2026-23866){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Two flaws; upstream states that it has not seen evidence of exploitation in the wild.
- CVE-2026-23863: attachment spoofing in WhatsApp for Windows. A document with NUL bytes embedded in its filename could appear in WhatsApp as one type of file but run as an executable when opened. Versions before v2.3000.1032164386.258709 are affected.
- CVE-2026-23866: incomplete validation of AI rich response messages for Instagram Reels in WhatsApp for iOS and Android, which could let another user make your device process media from an arbitrary URL and even trigger OS custom URL scheme handlers. Affects iOS versions 2.25.8.0 to 2.26.15.72 and Android versions 2.25.8.0 to 2.26.7.10.
- The second works much like CVE-2025-55177, exploited in August 2025: both get the device to process a URL chosen by the attacker.
