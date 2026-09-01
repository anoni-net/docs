---
title: Windows Security Updates
description: "Plain-language summaries of monthly Windows updates: whether anything is being actively exploited, whether it hits desktops or servers, and whether you need to update now."
icon: material/microsoft-windows
---

# :material-microsoft-windows: Windows Security Updates

Summaries of Windows monthly updates. Microsoft ships on the second Tuesday of each month, known as Patch Tuesday, and a single month runs to thousands of CVEs. August 2026 carried 1,506.

That number spans Microsoft's entire product line, and only a fraction of it touches desktop Windows. Of August's 1,506, Windows itself accounts for 248, Azure Linux (Mariner, which runs in the cloud and in containers) for 698, and Edge vulnerabilities carried over from Chromium for 362, with the rest spread across other Microsoft products. Worth knowing before you read "over a thousand vulnerabilities a month" anywhere.

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

One more thing worth knowing if you run Tor Browser or other anonymity tools on Windows: once the operating system is compromised, nothing running on top of it can protect you. Privilege escalation (a program obtaining higher system privileges than it started with) fixes matter as much in that scenario as browser flaws do.

## August 2026

> 2026-08-11 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>1,506 CVEs (248 in Windows itself), 134 rated Critical, one flagged as actively exploited.
- CVE-2026-68820: privilege escalation in the Ancillary Function Driver for WinSock. It affects desktop Windows 10 1607 and later plus Windows Server 2012 and later, right through to current releases, so do not assume an older machine is out of scope.
- Privilege escalation flaws are typically chained: something else (a browser, a document) gets code running first, and this takes it to system privileges. On its own it needs local execution, but chained it completes the takeover.

## July 2026

> 2026-07-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>2,003 CVEs (439 in Windows itself), the largest of these five months, with 106 rated Critical and three flagged as actively exploited. Ordinary desktop users are unaffected by all three; server administrators should prioritise.
- All three are in server products: Active Directory Federation Services privilege escalation, SharePoint Server privilege escalation, and SharePoint remote code execution. Microsoft's affected list for the AD FS one also names desktop builds, because they ship the same file, but the AD FS role only exists on Server, so there is no reachable path on desktop.
- Desktop users are unaffected by those three. Anyone running SharePoint or AD FS should prioritise, as the SharePoint remote code execution is the kind that needs no credentials to trigger.

## June 2026

> 2026-06-09 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--routine">Routine</span>1,284 CVEs (123 in Windows itself), 82 rated Critical, nothing flagged as actively exploited.
- A high Critical count does not mean urgency. Microsoft's severity rates how bad exploitation would be, which is a separate question from whether anyone is exploiting it. This page rates the latter. The Critical counts here are per distinct CVE; Microsoft's raw data records one entry per affected product, so counting it directly inflates the figure several times over.

## May 2026

> 2026-05-12 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>1,129 CVEs (74 in Windows itself), 58 rated Critical, three flagged as actively exploited. For ordinary desktop users this month is a normal-schedule month: none of the three reach you.
- Two are in the Microsoft Defender protection engine (denial of service and privilege escalation) and ship through automatic definition updates, so users need do nothing.
- The third is an Exchange Server spoofing flaw, affecting only organisations running their own Exchange.

## April 2026

> 2026-04-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>682 CVEs (139 in Windows itself), 32 rated Critical, two flagged as actively exploited.
- CVE-2026-32202: a Windows Shell spoofing flaw affecting desktop Windows 10 1607 and later plus Windows Server 2012 and later. Shell is the layer behind File Explorer and shortcut handling, and spoofing flaws there make a malicious file look like something ordinary on screen.
- The other is a SharePoint Server spoofing flaw, servers only.
