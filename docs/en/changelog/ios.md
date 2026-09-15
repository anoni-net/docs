---
title: iOS Security Updates
description: "Plain-language summaries of iPhone and iPad security updates: what each one fixes, whether you need to install it now, and which older models still get patches."
icon: material/apple-ios
---

# :material-apple-ios: iOS Security Updates

Security update summaries for iPhone and iPad. An Apple update routinely covers a hundred or more CVEs, and reading the list start to finish still leaves you unsure what to do, so this page skips the line-by-line translation and answers three questions instead: do you need to update now, which common attack paths does the fix cover, and do older models still get it. Newest at the top.

Source data comes from Apple's [security releases page](https://support.apple.com/en-us/100100){target="_blank"}. Point updates that never appear on that page do not get their own entry here. Releases that do appear there but which Apple marks as having no published CVE entries get a short entry, so you can tell whether what you are running is still the newest build.

## How we rate urgency

- <span class="urg-tag urg-tag--now">Now</span>Apple notes the issue may have been actively exploited, or the CVE appears in the US CISA Known Exploited Vulnerabilities catalog. Install the same day.
- <span class="urg-tag urg-tag--soon">Soon</span>The fixes cover memory-corruption issues in WebKit or Kernel (the program writes to the wrong place in memory, which an attacker can use to slip in code of their own). The first is reachable by simply visiting a web page, the second decides how much privilege an attacker ends up with, and chained together they make a complete remote attack path. Install within a few days.
- <span class="urg-tag urg-tag--routine">Routine</span>Everything else. Install on your normal schedule.

The colour answers how fast to act. Whether anyone is already exploiting the flaw is a separate question, and every entry states it explicitly. "Now" on this page requires evidence: Apple itself noting possible active exploitation, or the CVE appearing in the CISA catalog. Other pages do not all rest on the same basis, so check each page's own explanation before comparing across them.

These ratings come from community volunteers reading the advisories. Apple does not label releases this way. Where the call is unclear, we round up.

If you are likely to be targeted over the long term (journalists, lawyers, human rights workers, activists), also turn on Lockdown Mode under Settings, Privacy & Security, Lockdown Mode. It disables several features commonly used to deliver attacks, at the cost of some web pages and attachments not rendering properly.

## Which release line is your device on

Apple often ships several release lines on the same day, with very different version numbers and different contents. As of 14 September 2026, when iOS 27 arrived:

| Model | Current release line |
|---|---|
| iPhone 11 and later, iPad Pro 12.9-inch 4th gen and later, iPad Pro 11-inch 2nd gen and later, iPad Air 4 and later, iPad 9 and later, iPad mini 6 and later | 27.x |
| iPad Pro 12.9-inch 3rd gen, iPad Pro 11-inch 1st gen, iPad Air 3, iPad 8, iPad mini 5 | 26.x, hardware cannot run 27 |
| iPhone XS, XS Max, XR, iPad 7 | 18.x |
| iPad Pro 12.9-inch 2nd gen, iPad Pro 10.5-inch, iPad 6 | 17.x |
| iPhone 8, 8 Plus, X, iPad 5, iPad Pro 9.7-inch, iPad Pro 12.9-inch 1st gen | 16.x |
| iPhone 6s, 7, SE 1st gen, iPad Air 2, iPad mini 4, iPod touch 7 | 15.x |

Any iPhone 11 or later can take either line, and 26.7 is there for people who would rather not move to 27 yet. The split is harder on the iPad side: the 12.9-inch 3rd gen, 11-inch 1st gen, Air 3, iPad 8, and mini 5 top out at 26.x.

Older lines get fewer fixes and get them later. The 2026-04-22 entry below has a concrete example. A device that no longer receives updates at all means known vulnerabilities go unpatched, so consider replacing it if you handle sensitive material.

## iOS 27, iPadOS 27 (26.7 shipped the same day)

> 2026-09-14 · [27 advisory](https://support.apple.com/en-us/149034){target="_blank"} · [26.7 advisory](https://support.apple.com/en-us/149041){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>The annual major release and a security update for the older line shipped the same day, with 126 CVEs in 27 and 82 in 26.7. Apple flags none of them as actively exploited.
- Kernel is the largest group, 20 in 27 and 18 in 26.7. Most are an app causing unexpected system termination or corrupting kernel memory, and each line has one that lets a malicious app gain root. AVEVideoEncoder has one where a sandboxed app can execute arbitrary code with kernel privileges, which is a complete path from inside the sandbox into the kernel.
- The tracking-related fixes are unusually numerous this round and matter more than the CVE total for readers who care about linkability. On the 27 side, App Store, AuthKit, and CloudKit each have one where a local app can read a persistent account identifier, and Photos Storage and Sandbox Profiles each have one where an app can fingerprint the user. On the 26.7 side, AuthKit is the only fix in that category.
- Three appear on both lines: Power Management, where an app can fingerprint the device; Symptom Framework, where a malicious application can determine the user's current location; and NetworkExtension, where an app can identify what other apps you have installed — 27 has a matching Accessibility issue as well. What you have installed is itself an identifying trait: a particular messaging or tooling app in the list is enough to narrow you down to a much smaller group.
- On the browser engine side, 27 carries 3 WebKit fixes plus 1 in WebKit Canvas and 26.7 carries 1 of each, covering sensitive information disclosure from malicious web content, unexpected process termination, and a Safari crash. 26.7 also has 5 ImageIO fixes, more than 27 on that component.
- The two lists are not a simple subset of one another. 7 of the 82 CVEs in 26.7 never appear in the 27 list, and the 51 extra in 27 cluster in CoreUI, Kernel, WebKit, Baseband, and CloudKit. If both lines are available to you, either one is fine; there is no security gap between them.
- macOS Golden Gate 27, Tahoe 26.7, and Sequoia 15.8 shipped the same day and are covered in [macOS security updates](./macos.md). Nothing shipped for the 18.x line this round, so devices there are still on 18.7.10 from 17 August.

## iOS 26.6.2, iPadOS 26.6.2

> 2026-09-08 · [Security releases page](https://support.apple.com/en-us/100100){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>Apple lists this release on its security releases page, with the note that the update has no published CVE entries and no link to a security content article. Nothing is flagged as actively exploited.
- With no details there is no way to see what was fixed, so install it on your normal schedule. This entry will be rewritten if Apple publishes security content for it later.
- No macOS or 18.x release shipped the same day. Devices on the 18.x line are still on 18.7.10 from 17 August.

## iOS 26.6.1, iPadOS 26.6.1 (18.7.10 shipped the same day)

> 2026-08-17 · [26.6.1 advisory](https://support.apple.com/en-us/148282){target="_blank"} · [18.7.10 advisory](https://support.apple.com/en-us/148287){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Nothing is flagged as actively exploited, but both WebKit and Kernel are in scope.
- The 26.x line fixes 29 issues, 19 of them in WebKit, mostly memory corruption or crashes from processing malicious web content. ImageIO has one "processing an image may lead to arbitrary code execution", the kind of flaw used in attacks that trigger by sending you a picture.
- Telephony fixes an issue where an attacker in a privileged network position could bypass IPSec authentication and intercept traffic.
- The 18.x line shipped 18.7.10 the same day with 122 fixes, 38 in WebKit and 18 in Kernel. The much larger count reflects how fixes for older hardware accumulate before landing in one batch. Worth installing promptly if you are on an iPhone XS, XS Max, XR, or iPad 7.

## iOS 26.6, iPadOS 26.6

> 2026-07-27 · [Upstream advisory](https://support.apple.com/en-us/128066){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>86 fixes, with 19 in Kernel, 7 in WebKit, and 6 in ImageIO.Apple flags none of these as actively exploited.
- WebKit closes a browsing-history leak where a website could tell whether you had visited a given link. The same group also fixes malicious content violating iframe sandboxing policy (the sandbox keeps embedded pages in an isolated environment; break it and they reach things they should not), and UI spoofing via framed malicious content.
- Kernel fixes an issue where connecting to a malicious NFS server could corrupt kernel memory, worth noting if you mount network storage you do not control.
- Contacts gets three fixes, including apps adding contacts without authorisation and a maliciously crafted contact leaking sensitive data.

## iOS 26.5.2, iPadOS 26.5.2

> 2026-06-29 · [Upstream advisory](https://support.apple.com/en-us/127594){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>24 of the 38 fixes are in WebKit and 4 more in WebRTC, so this release is almost entirely browser engine work.Apple flags none of these as actively exploited.
- Several entries cover malicious sites exfiltrating data cross-origin and web content disclosing sensitive user information, which directly affects any service you stay logged into in the browser.
- One entry covers a malicious website processing restricted web content outside the sandbox. The sandbox is the browser's last line of isolation, so breaking it removes a layer of protection.
- A 26.5.1 also shipped on 1 June with no published CVE list, so it gets no entry here.

## iOS 26.5, 18.7.9 (17.7.11, 16.7.16, and 15.8.8 shipped the same day)

> 2026-05-11 · [26.5 advisory](https://support.apple.com/en-us/127110){target="_blank"} · [18.7.9 advisory](https://support.apple.com/en-us/127111){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>The 26.x line fixes 67 issues, 21 in WebKit and 6 in Kernel, including one where an app could gain root privileges (full control of the system, equivalent to owning the device).Apple flags none of these as actively exploited.
- The 18.x line fixes 49 issues, two of them notable privacy ones: an app circumventing App Privacy Report logging (the very report you would use to audit what an app connects to), and an app enumerating installed applications (usable for profiling a user). A separate Wi-Fi issue lets an app execute arbitrary code with kernel privileges, which carries heavier consequences than a privacy leak.
- The 17.7.11, 16.7.16, and 15.8.8 releases for older hardware carry a single fix each: the notification retention issue described in the 22 April entry below.

## iOS 26.4.2, 18.7.8

> 2026-04-22 · [26.4.2 advisory](https://support.apple.com/en-us/127002){target="_blank"} · [18.7.8 advisory](https://support.apple.com/en-us/127003){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>The privacy implication is worth knowing. The entire release fixes one issue.Apple flags none of these as actively exploited.
- CVE-2026-28950: notifications marked for deletion could be unexpectedly retained on the device. The cause was a logging issue, addressed with improved data redaction. Notification content you assumed disappeared when you swiped it away was still on the device, readable by anyone who obtained it.
- The same fix did not reach the 17.x, 16.x, and 15.x lines until 11 May, 19 days later. Older hardware gets fewer fixes and gets them later.
