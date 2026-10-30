---
title: iOS Security Updates
description: "Plain-language summaries of iPhone and iPad security updates: what each one fixes, whether you need to install it now, and which older models still get patches."
icon: material/apple-ios
digest:
  name: iOS
  devices: [iphone]
  basis: rated by whether Apple flags exploitation
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

## iOS 27.2, 26.7.2, 18.7.11

> 2026-10-26 · [27.2 advisory](https://support.apple.com/en-us/149230){target="_blank"} · [26.7.2 advisory](https://support.apple.com/en-us/149227){target="_blank"} · [18.7.11 advisory](https://support.apple.com/en-us/149225){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>Devices still on the 18.x line should update today. The iPhone XS, XS Max, XR and iPad 7 receive 18.7.11, which brings the CoreGraphics out-of-bounds write (CVE-2026-86950) fixed in 26.7.1 on 28 September. Apple attaches the same note to this advisory: the issue may have been exploited in an extremely sophisticated attack against specific targeted individuals on versions of iOS before iOS 27. CISA added it to KEV on 29 September.
- 18.7.11 arrives 28 days after 26.7.1, and older devices went without a fix for the same flaw in the meantime. The other two items are a CoreMedia issue letting a malicious app access the camera without permission (CVE-2026-86990) and an Audio issue letting an app leak sensitive user information (CVE-2026-65339). Apple does not flag either as actively exploited.
- Under this page's criteria the 27.x and 26.x lines rate Soon. 27.2 fixes 163 CVEs and 26.7.2 fixes 134, and Apple does not flag any item as actively exploited.
- WebKit is the group to watch. 27.2 has 30 WebKit-related CVEs, 8 of which could lead to arbitrary code execution when processing malicious web content; 26.7.2 has 24, 7 of them of that kind. 27.2 also fixes a WebKit Process Model issue that may let a remote attacker break out of the web content sandbox (CVE-2026-113897). Both lines fix a website being able to use a media format that Lockdown Mode should restrict (CVE-2026-113952), so people relying on Lockdown Mode only get that protection after updating.
- An App Store issue on both lines may let a remote attacker break out of the web content sandbox (CVE-2026-112690). Kernel accounts for 15 CVEs in 27.2 and 14 in 26.7.2, mostly apps causing unexpected system termination or kernel memory corruption; none this round allow code execution with kernel privileges.
- The tracking-related fixes are the same on both lines. MobileGestalt and Power Management each have an issue letting an app fingerprint the user, and Maps has one letting an app identify which other apps you have installed. Privacy preference bypasses number 4 in 27.2 and 3 in 26.7.2, in Accounts, Kernel, Photos Storage and Spotlight; the Spotlight one is only in 27.2.
- Several fixes cover attacks that need physical proximity. A Wi-Fi issue lets an attacker in radio range corrupt process memory (CVE-2026-113909), an AccessorySetupKit issue lets a malicious app access Bluetooth without consent, and an Accounts issue lets an attacker with physical access to a trust-paired device read and write arbitrary files (CVE-2026-112612). 27.2 also fixes a Thread issue (Thread is a network protocol used by smart home devices) that lets a nearby attacker craft malicious traffic to join a Thread network.
- The two lists are still not a simple subset. 15 CVEs in 26.7.2 do not appear in the 27.2 list, and Apple added 13 of them to the September iOS 27 advisory the same day, meaning 27 already had those fixes when it shipped (see the revision note in the 27 entry below).
- On 23 October Apple also released 27.1 for the iPhone Duo only; see the next entry. The macOS releases from the same day are covered in [macOS security updates](./macos.md).

## iOS 27.1

> 2026-10-23 · [Security releases page](https://support.apple.com/en-us/100100){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>For the iPhone Duo only. Apple lists 27.1 on its security releases page with a note that the update has no published CVE entries, and gives no link to security content. No issue is flagged as actively exploited.
- Other models have no 27.1; 27.2 three days later covers the iPhone 11 and later (see the previous entry).

## iOS 26.7.1, iPadOS 26.7.1 (27.0.1 shipped the same day)

> 2026-09-28 · [26.7.1 advisory](https://support.apple.com/en-us/149226){target="_blank"} · [Security releases page](https://support.apple.com/en-us/100100){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>A single fix: an out-of-bounds write in CoreGraphics (CVE-2026-86950), where processing a maliciously crafted file may lead to arbitrary code execution. Apple's advisory states it is aware of a report that the issue may have been exploited in an extremely sophisticated attack against specific targeted individuals on versions of iOS before iOS 27. CISA added it to KEV on 29 September.
- CoreGraphics is the system component that draws graphics and renders PDFs, and many apps pass through it when opening images and documents. The trigger is processing one maliciously crafted file; Apple does not say how that file reaches the device.
- If you are still on 26.x, update to 26.7.1 today. The iPad Pro 12.9-inch 3rd generation, iPad Pro 11-inch 1st generation, iPad Air 3, iPad 8 and iPad mini 5 cannot move to 27, so this release is their only option.
- If you are already on 27, update to 27.0.1 as usual. Apple's releases page notes that 27.0.1 has no published CVE entries, the 14 September advisory for 27 does not list this CVE, and the only thing the 26.7.1 advisory says about 27 is that the attacks targeted earlier versions.
- Apple describes the targets as specific individuals. If you are likely to be targeted over the long term, turn on Lockdown Mode (described at the top of this page) in addition to updating; the advisory does not say whether Lockdown Mode blocks this flaw.
- The 18.x line got no update this round. The advisory's wording, versions of iOS before iOS 27, literally covers 18.x, yet Apple has released no fix for that line and does not say whether it is affected. Devices still on 18.x remain on 18.7.10 from 17 August. 18.7.11 on 26 October brought this fix (see the 27.2 entry above).
- macOS Tahoe 26.7.1 and Sequoia 15.8.1 fix the same flaw on the same day; see [macOS Security Updates](./macos.md).

## iOS 27, iPadOS 27 (26.7 shipped the same day)

> 2026-09-14 · [27 advisory](https://support.apple.com/en-us/149034){target="_blank"} · [26.7 advisory](https://support.apple.com/en-us/149041){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>The annual major release and a security update for the older line shipped the same day, with 126 CVEs in 27 and 82 in 26.7. Apple flags none of them as actively exploited.
- Kernel is the largest group, 20 in 27 and 18 in 26.7. Most are an app causing unexpected system termination or corrupting kernel memory, and each line has one that lets a malicious app gain root. AVEVideoEncoder has one where a sandboxed app can execute arbitrary code with kernel privileges, which is a complete path from inside the sandbox into the kernel.
- The tracking-related fixes are unusually numerous this round and matter more than the CVE total for readers who care about linkability. On the 27 side, App Store, AuthKit, and CloudKit each have one where a local app can read a persistent account identifier, and Photos Storage and Sandbox Profiles each have one where an app can fingerprint the user. On the 26.7 side, AuthKit is the only fix in that category.
- Three appear on both lines: Power Management, where an app can fingerprint the device; Symptom Framework, where a malicious application can determine the user's current location; and NetworkExtension, where an app can identify what other apps you have installed — 27 has a matching Accessibility issue as well. What you have installed is itself an identifying trait: a particular messaging or tooling app in the list is enough to narrow you down to a much smaller group.
- On the browser engine side, 27 carries 3 WebKit fixes plus 1 in WebKit Canvas and 26.7 carries 1 of each, covering sensitive information disclosure from malicious web content, unexpected process termination, and a Safari crash. 26.7 also has 5 ImageIO fixes, more than 27 on that component.
- The two lists are not a simple subset of one another. 7 of the 82 CVEs in 26.7 never appear in the 27 list, and the 51 extra in 27 cluster in CoreUI, Kernel, WebKit, Baseband, and CloudKit. If both lines are available to you, either one is fine; there is no security gap between them.
- macOS Golden Gate 27, Tahoe 26.7, and Sequoia 15.8 shipped the same day and are covered in [macOS security updates](./macos.md). Nothing shipped for the 18.x line this round, so devices there are still on 18.7.10 from 17 August.
- Apple revised both advisories on 19 October: 27 grew from 126 CVEs to 145 and 26.7 from 82 to 91, and the figures above are from the first version. The revised advisories still flag nothing as actively exploited. If you already run 27 or 26.7 or later, there is nothing more to do; these fixes were in the release all along and are only now being published.
- Among the added entries, both lines carry CVE-2026-86919 in Core Bluetooth, where a paired Bluetooth device may be able to execute arbitrary code on the phone, plus one Bluetooth and one Wi-Fi issue where an attacker within radio range can cause unexpected system termination. Only in 27 are a WebKit fix (CVE-2026-86922), where processing malicious web content may lead to arbitrary code execution, a sandbox escape in Foundation, a Telephony issue where an app can place calls or send messages on its own, and an issue where, with iPhone Mirroring on, someone holding a locked phone may be able to bypass digital ID verification.
- The difference between the two lists shifts as well: 8 CVEs in 26.7 do not appear in the 27 list, and 27 now has 62 extra.
- Apple revised both advisories again on 26 October; 27 now lists 163 CVEs and 26.7 lists 95. The revised advisories still flag nothing as actively exploited, and people already on 27 or 26.7 or later again have nothing more to do.
- Among this round of additions, both lines gain a Kernel issue that may let an app execute arbitrary code with kernel privileges (CVE-2026-86916). On the 27 side there are also an ImageIO issue where processing a malicious image may lead to arbitrary code execution (CVE-2026-64759), a sandbox escape in Security (CVE-2026-65363), a Siri issue letting someone holding the phone read contacts from the lock screen (CVE-2026-84614), and an old 2019 identifier in Kernel, CVE-2019-5598, which may let a remote attacker bypass firewall rules. On the 26.7 side there is also a CoreMedia issue where parsing a file may lead to arbitrary code execution (CVE-2026-112688).

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
