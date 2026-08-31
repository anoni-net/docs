---
title: iOS Security Updates
description: "Plain-language summaries of iPhone and iPad security updates: what each one fixes, whether you need to install it now, and which older models still get patches."
icon: material/apple-ios
---

# :material-apple-ios: iOS Security Updates

Security update summaries for iPhone and iPad. An Apple update routinely covers a hundred or more CVEs, and reading the list start to finish still leaves you unsure what to do, so this page skips the line-by-line translation and answers three questions instead: do you need to update now, which common attack paths does the fix cover, and do older models still get it. Newest at the top.

Source data comes from Apple's [security releases page](https://support.apple.com/en-us/100100){target="_blank"}. Releases Apple ships without a CVE list (bug-fix-only point updates, for example) do not get their own entry here.

## How we rate urgency

- **Now**: Apple notes the issue may have been actively exploited, or the CVE appears in the US CISA Known Exploited Vulnerabilities catalog. Install the same day.
- **Soon**: the fixes cover memory-corruption issues in WebKit or Kernel. The first is reachable by simply visiting a web page, the second decides how much privilege an attacker ends up with, and chained together they make a complete remote attack path. Install within a few days.
- **Routine**: everything else. Install on your normal schedule.

These ratings come from community volunteers reading the advisories. Apple does not label releases this way. Where the call is unclear, we round up.

If you are likely to be targeted over the long term (journalists, lawyers, human rights workers, activists), also turn on Lockdown Mode under Settings, Privacy & Security, Lockdown Mode. It disables several features commonly used to deliver attacks, at the cost of some web pages and attachments not rendering properly.

## Which release line is your device on

Apple often ships several release lines on the same day, with very different version numbers and different contents. As of August 2026:

| Model | Current release line |
|---|---|
| iPhone 11 and later, iPad Air 3 and later, iPad 8 and later | 26.x |
| iPhone XS, XS Max, XR, iPad 7 | 18.x |
| iPad Pro 12.9-inch 2nd gen, iPad Pro 10.5-inch, iPad 6 | 17.x |
| iPhone 8, 8 Plus, X, iPad 5, iPad Pro 9.7-inch, iPad Pro 12.9-inch 1st gen | 16.x |
| iPhone 6s, 7, SE 1st gen, iPad Air 2, iPad mini 4, iPod touch 7 | 15.x |

Older lines get fewer fixes and get them later. The 2026-04-22 entry below has a concrete example. A device that no longer receives updates at all means known vulnerabilities go unpatched, so consider replacing it if you handle sensitive material.

## iOS 26.6.1, iPadOS 26.6.1 (18.7.10 shipped the same day)

> 2026-08-17 · [26.6.1 advisory](https://support.apple.com/en-us/148282){target="_blank"} · [18.7.10 advisory](https://support.apple.com/en-us/148287){target="_blank"}

- Urgency: soon. Nothing is flagged as actively exploited, but both WebKit and Kernel are in scope.
- The 26.x line fixes 29 issues, 19 of them in WebKit, mostly memory corruption or crashes from processing malicious web content. ImageIO has one "processing an image may lead to arbitrary code execution", the kind of flaw used in attacks that trigger by sending you a picture.
- Telephony fixes an issue where an attacker in a privileged network position could bypass IPSec authentication and intercept traffic.
- The 18.x line shipped 18.7.10 the same day with 122 fixes, 38 in WebKit and 18 in Kernel. The much larger count reflects how fixes for older hardware accumulate before landing in one batch. Worth installing promptly if you are on an iPhone XS, XS Max, XR, or iPad 7.

## iOS 26.6, iPadOS 26.6

> 2026-07-27 · [Upstream advisory](https://support.apple.com/en-us/128066){target="_blank"}

- Urgency: soon. 86 fixes, with 19 in Kernel, 7 in WebKit, and 6 in ImageIO.
- WebKit closes a browsing-history leak where a website could tell whether you had visited a given link. The same group also fixes malicious content violating iframe sandboxing policy, and UI spoofing via framed malicious content.
- Kernel fixes an issue where connecting to a malicious NFS server could corrupt kernel memory, worth noting if you mount network storage you do not control.
- Contacts gets three fixes, including apps adding contacts without authorisation and a maliciously crafted contact leaking sensitive data.

## iOS 26.5.2, iPadOS 26.5.2

> 2026-06-29 · [Upstream advisory](https://support.apple.com/en-us/127594){target="_blank"}

- Urgency: soon. 24 of the 38 fixes are in WebKit and 4 more in WebRTC, so this release is almost entirely browser engine work.
- Several entries cover malicious sites exfiltrating data cross-origin and web content disclosing sensitive user information, which directly affects any service you stay logged into in the browser.
- One entry covers a malicious website processing restricted web content outside the sandbox. The sandbox is the browser's last line of isolation, so breaking it removes a layer of protection.
- A 26.5.1 also shipped on 1 June with no published CVE list, so it gets no entry here.

## iOS 26.5, 18.7.9 (17.7.11, 16.7.16, and 15.8.8 shipped the same day)

> 2026-05-11 · [26.5 advisory](https://support.apple.com/en-us/127110){target="_blank"} · [18.7.9 advisory](https://support.apple.com/en-us/127111){target="_blank"}

- Urgency: soon. The 26.x line fixes 67 issues, 21 in WebKit and 6 in Kernel, including one where an app could gain root privileges.
- The 18.x line fixes 49 issues and includes three notable privacy ones: an app circumventing App Privacy Report logging (the very report you would use to audit what an app connects to), an app enumerating installed applications (usable for profiling a user), and a Wi-Fi issue letting an app execute arbitrary code with kernel privileges.
- The 17.7.11, 16.7.16, and 15.8.8 releases for older hardware carry a single fix each: the notification retention issue described in the 22 April entry below.

## iOS 26.4.2, 18.7.8

> 2026-04-22 · [26.4.2 advisory](https://support.apple.com/en-us/127002){target="_blank"} · [18.7.8 advisory](https://support.apple.com/en-us/127003){target="_blank"}

- Urgency: routine, though the privacy implication is worth knowing. The entire release fixes one issue.
- CVE-2026-28950: notifications marked for deletion could be unexpectedly retained on the device. The cause was a logging issue, addressed with improved data redaction. Notification content you assumed disappeared when you swiped it away was still on the device, readable by anyone who obtained it.
- The same fix did not reach the 17.x, 16.x, and 15.x lines until 11 May, 19 days later. Older hardware gets fewer fixes and gets them later.
