---
title: Windows Security Updates
description: "Plain-language summaries of monthly Windows updates: whether anything is being actively exploited, whether it hits desktops or servers, and whether you need to update now."
icon: material/microsoft-windows
---

# :material-microsoft-windows: Windows Security Updates

Summaries of Windows monthly updates. Microsoft ships on the second Tuesday of each month, known as Patch Tuesday, and a single month runs to thousands of entries. August 2026 carried 1,506, of which 359 were Edge vulnerabilities carried over from Chromium. Reading through them is neither possible nor necessary.

This page answers three questions: is anything being actively exploited this month, do those flaws hit desktops or servers, and do you need to update now. Newest at the top.

Source data comes from Microsoft's [MSRC Security Update Guide](https://msrc.microsoft.com/update-guide){target="_blank"}, with the counts derived from its CVRF data.

## How we rate urgency

- <span class="urg-tag urg-tag--now">Now</span>The month includes a flaw flagged as actively exploited whose scope covers desktop Windows.
- <span class="urg-tag urg-tag--soon">Soon</span>Something is flagged as actively exploited, but only in server products or auto-updating components. Desktop users can proceed on their normal schedule; server administrators should prioritise.
- <span class="urg-tag urg-tag--routine">Routine</span>Nothing flagged as exploited that month.

Microsoft publishes an `Exploited:Yes` field of its own. These ratings build on that field, with one added judgement about who is affected.

Note that "Soon" on this page can also mean something is already being exploited, just not against desktop users. Do not read the amber tag as "nobody is using this yet": the evidence behind it is sometimes harder than behind another page's "Now", and the difference is whether it reaches you. Where the call is unclear, we round up.

## Check which kind of product is affected first

A large share of the actively exploited flaws each month land in server products such as SharePoint, Exchange, and Active Directory Federation Services. If you run ordinary desktop Windows, none of those touch you. When a headline says Microsoft patched a critical flaw under active attack, the first thing to establish is which product it was in.

Microsoft Defender is another common misunderstanding. Its fixes ship through automatic antimalware definition updates rather than Patch Tuesday, and require nothing from you.

One more thing worth knowing if you run Tor Browser or other anonymity tools on Windows: once the operating system is compromised, nothing running on top of it can protect you. Privilege escalation fixes matter as much in that scenario as browser flaws do.

## August 2026

> 2026-08-11 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>1,506 entries, 721 rated Critical, one flagged as actively exploited.
- CVE-2026-68820: privilege escalation in the Ancillary Function Driver for WinSock. It affects desktop Windows 10 1809 and later plus Windows Server 2019 and later, so ordinary users are in scope.
- Privilege escalation flaws are typically chained: something else (a browser, a document) gets code running first, and this takes it to system privileges. On its own it needs local execution, but chained it completes the takeover.

## July 2026

> 2026-07-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>2,003 entries, the largest of these five months, with 953 rated Critical and three flagged as actively exploited.
- All three are in server products: Active Directory Federation Services privilege escalation, SharePoint Server privilege escalation, and SharePoint remote code execution.
- Desktop users are unaffected by those three. Anyone running SharePoint or AD FS should prioritise, as the SharePoint remote code execution is the kind that needs no credentials to trigger.

## June 2026

> 2026-06-09 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>1,284 entries, 650 rated Critical, nothing flagged as actively exploited.
- A high Critical count does not mean urgency. Microsoft's severity rates how bad exploitation would be, which is a separate question from whether anyone is exploiting it. This page rates the latter.

## May 2026

> 2026-05-12 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>1,129 entries, 318 rated Critical, three flagged as actively exploited.
- Two are in the Microsoft Defender protection engine (denial of service and privilege escalation) and ship through automatic definition updates, so users need do nothing.
- The third is an Exchange Server spoofing flaw, affecting only organisations running their own Exchange.

## April 2026

> 2026-04-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>682 entries, 216 rated Critical, two flagged as actively exploited.
- CVE-2026-32202: a Windows Shell spoofing flaw affecting desktop Windows 10 1809 and later plus Windows Server 2019 and later. Shell is the layer behind File Explorer and shortcut handling, and spoofing flaws there make a malicious file look like something ordinary on screen.
- The other is a SharePoint Server spoofing flaw, servers only.
