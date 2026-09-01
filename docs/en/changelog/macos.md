---
title: macOS Security Updates
description: "Plain-language summaries of Mac security updates: what each one fixes, whether you need to install it now, and where the three maintenance lines stand."
icon: material/apple
---

# :material-apple: macOS Security Updates

Security update summaries for the Mac. An Apple update routinely covers a hundred or more CVEs, and reading the list start to finish still leaves you unsure what to do, so this page skips the line-by-line translation and answers three questions instead: do you need to update now, which common attack paths does the fix cover, and do older systems still get it. Newest at the top.

Source data comes from Apple's [security releases page](https://support.apple.com/en-us/100100){target="_blank"}. The rating method matches the [iOS security updates](./ios.md) page.

## How we rate urgency

- <span class="urg-tag urg-tag--now">Now</span>Apple notes the issue may have been actively exploited, or the CVE appears in the US CISA Known Exploited Vulnerabilities catalog. Install the same day.
- <span class="urg-tag urg-tag--soon">Soon</span>The fixes cover memory corruption in WebKit or Kernel (the program writes to the wrong place in memory, which an attacker can use to slip in code of their own), or include gaining root (full control of the system), bypassing Gatekeeper, or bypassing privacy preferences. Install within a few days.
- <span class="urg-tag urg-tag--routine">Routine</span>Everything else. Install on your normal schedule.

The colour answers how fast to act. Whether anyone is already exploiting the flaw is a separate question, and every entry states it explicitly. "Now" on this page requires evidence: Apple itself noting possible active exploitation, or the CVE appearing in the CISA catalog.

These ratings come from community volunteers reading the advisories. Apple does not label releases this way. Where the call is unclear, we round up.

The bypass category deserves particular attention on macOS. Gatekeeper is what stops unsigned software running, and privacy preferences (the access permissions in System Settings) are what stop an app reading your screen, microphone, and files. When either layer is bypassed, nothing looks wrong on screen.

## Three maintenance lines

Apple maintains the current release plus the two before it. Security fixes ship to all three, but only the current line gets new features and the complete set of fixes.

| Line | Version | Status |
|---|---|---|
| Tahoe | 26.x | Current, most complete fixes |
| Sequoia | 15.x | Previous, security fixes keep pace |
| Sonoma | 14.x | Two back, receives the fewest fixes |

All three shipping the same day is normal, and so is the gap in fix counts. See the 2026-07-27 entry below for the comparison. If your hardware cannot run Tahoe, staying on Sequoia or Sonoma still gets you security fixes, but note that the Sonoma line drops out of support after roughly one more cycle.

## macOS Tahoe 26.6.2

> 2026-08-17 · [Upstream advisory](https://support.apple.com/en-us/148281){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>28 fixes, 19 of them in WebKit, mostly memory corruption or crashes from processing malicious web content.
- ImageIO has one "processing an image may lead to arbitrary code execution", the kind of flaw used in attacks that trigger by sending you a picture.
- Kernel accounts for 3 and IOGPUFamily for 1. This round shipped for Tahoe only, with no matching Sequoia or Sonoma release.

## macOS Tahoe 26.6.1, Sequoia 15.7.9, Sonoma 14.8.9

> 2026-08-06 · [26.6.1](https://support.apple.com/en-us/148170){target="_blank"} · [15.7.9](https://support.apple.com/en-us/148171){target="_blank"} · [14.8.9](https://support.apple.com/en-us/148172){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>All three lines shipped the same day with a single fix each. Spending three releases on one issue means Apple decided it could not wait for the next scheduled update.
- CVE-2026-65400: an attacker on your network could authenticate to Screen Sharing without valid credentials. The cause was a state management flaw in the authentication flow.
- Prioritise this if you have Screen Sharing enabled. System Settings, General, Sharing shows whether it is on, and turning it off when you do not use it is the most direct fix available.

## macOS Tahoe 26.6, Sequoia 15.7.8, Sonoma 14.8.8

> 2026-07-27 · [26.6](https://support.apple.com/en-us/128067){target="_blank"} · [15.7.8](https://support.apple.com/en-us/128071){target="_blank"} · [14.8.8](https://support.apple.com/en-us/128072){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>The largest round of the year: 153 fixes for Tahoe, 138 for Sequoia, 127 for Sonoma. That spread is the concrete evidence that older lines receive fewer fixes.
- Kernel dominates, with 27 for Tahoe, 21 for Sequoia, and 20 for Sonoma.
- Accounts has one where an app could gain root privileges. Assets has one where a malicious application could bypass privacy preferences, meaning it takes permissions you never granted.
- AppleDouble can terminate an app unexpectedly when processing a malicious file. Model I/O and HFS each carry several file-parsing issues, the kind you trigger by opening a file someone sent you.

## macOS Tahoe 26.5.2

> 2026-06-29 · [Upstream advisory](https://support.apple.com/en-us/127595){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>24 of the 38 fixes are in WebKit and 4 more in WebRTC, so this release is almost entirely browser engine work.
- The impact reaches beyond Safari. Every app that renders web content through a WebView uses the same engine, including mail previews and the in-app browsers in many chat clients.

## macOS Tahoe 26.5

> 2026-05-11 · [Upstream advisory](https://support.apple.com/en-us/127115){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>87 fixes, 22 in WebKit and 9 in Kernel.
- CUPS has one where an app could gain root privileges. CUPS is the printing system, easy to forget about, and it runs by default.
- BOM has one where a maliciously crafted ZIP archive bypasses Gatekeeper checks. Unpacking an archive someone sent you is an everyday action, which makes this one worth knowing.
- Accounts has an issue bypassing certain privacy preferences, and mDNSResponder accounts for 4.
