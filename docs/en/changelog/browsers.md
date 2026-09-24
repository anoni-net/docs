---
title: Browser Security Updates
description: Plain-language monthly summaries of Chrome and Firefox security updates, covering whether anything is being exploited, which version to update to, and how often each browser ships.
icon: material/web-check
digest:
  name: Browsers
  devices: [windows, mac, linux, android]
  tracks: [Chrome, Firefox]
  basis: rated by whether upstream flags exploitation
---

# :material-web-check: Browser Security Updates

Security updates for Chrome and Firefox, aggregated by month with each browser written up separately. Browsers handle content from unfamiliar websites all day long and are among the most frequently exploited software there is: Chrome alone had two actively exploited flaws in September 2026. Newest month at the top.

Chrome and Firefox on iPhone and iPad run on Apple's WebKit engine, so their fixes arrive with system updates, covered in [iOS security updates](./ios.md). Tor Browser is built on Firefox ESR and usually picks up Firefox's fixes; release-by-release detail is in the [Tor changelog](./tor.md).

Source data comes from the desktop stable announcements on [Chrome Releases](https://chromereleases.googleblog.com/){target="_blank"} and Mozilla's [security advisories](https://www.mozilla.org/security/advisories/){target="_blank"}.

## How we rate urgency

- <span class="urg-tag urg-tag--now">Now</span>Upstream flags active exploitation. Chrome's wording is "Google is aware that an exploit for … exists in the wild"; Mozilla mentions attacks in the wild in the advisory entry. Inclusion in CISA's Known Exploited Vulnerabilities catalogue (KEV) also counts.
- <span class="urg-tag urg-tag--soon">Soon</span>Critical or High security fixes, with no exploitation flagged upstream.
- <span class="urg-tag urg-tag--routine">Routine</span>Only Medium or lower security fixes, or none at all.

"Now" on this page requires evidence, the same basis as the iOS and Windows pages. Severity is only a guide: CVE-2026-87491, exploited in September 2026, was rated just Medium by Chrome itself.

Mozilla advisories often say "we presume that with enough effort some of these could have been exploited". That is standard wording for memory safety bugs and means exploitation is possible in theory, not that anyone is doing it. What matters is whether the entry mentions the wild.

## How often each browser ships

Chrome ships a minor version with security fixes nearly every week. Major versions used to arrive about every four weeks, but 153 and 154 in September 2026 were only two weeks apart. Firefox also moved to a major version every two weeks from September, and maintains three Extended Support Release (ESR) lines: 153, 140 and 115, the last mainly for people still on Windows 7, 8.1 and older macOS.

Both browsers download updates in the background, but an update only takes effect after the browser restarts. Anyone who keeps their browser open for days may have the new version downloaded while still running the old one. In Chrome, type `chrome://settings/help` into the address bar to see the version; in Firefox, open "Help" in the menu and choose "About Firefox".

## Chrome September 2026

> 2026-09-22 · [Chrome Releases](https://chromereleases.googleblog.com/2026/09/){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>Both exploited flaws are in V8, Chrome's JavaScript engine. Google's announcements state that exploits exist in the wild, and CISA added each to KEV the following day. Version 153.0.8010.36 or later covers both; the latest is 154.0.8037.57 from 22 September.
- CVE-2026-85046: type confusion in V8, rated High by Google, fixed in 152.0.7977.82 on 3 September.
- CVE-2026-87491: out of bounds write in V8, rated Medium by Google, fixed in 153.0.8010.36 on 8 September.
- Chromium-based browsers such as Edge and Brave also use V8 and need their own updates. Tor Browser is built on Firefox, has no V8 and is not affected by either.
- Six stable updates this month fixed 434 security issues in total, 23 of them Critical. The two major versions, 153 on 8 September and 154 on 22 September, account for 338.

## Firefox September 2026

> 2026-09-15 · [Mozilla security advisories](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Both major versions, 155 (1 September) and 156 (15 September), carry High-rated fixes. Mozilla does not flag any item as actively exploited.
- 156 is especially large, with 29 High-rated fixes. Two are sandbox escapes (CVE-2026-92035, CVE-2026-92018) and eight are privilege escalations in the WebGL canvas component. The sandbox is what separates web pages from the operating system, and escaping it is often the final step in a full attack chain.
- The Android version has one more privilege escalation (CVE-2026-92033), also fixed in 156.
- The matching ESR versions are 153.3, 140.16 and 115.41, released the same day as 156. Tor Browser 15.0.23 has already moved to 140.16.

## Chrome August 2026

> 2026-08-25 · [Chrome Releases](https://chromereleases.googleblog.com/2026/08/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Five stable updates fixed 395 security issues in total, 19 of them Critical. Google does not flag any item as actively exploited.
- Version 152 on 25 August was a major release that fixed 327 on its own. The 4 August update fixed ordinary bugs only, with no security fixes.

## Firefox August 2026

> 2026-08-18 · [Mozilla security advisories](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Firefox 154 on 18 August has 19 High-rated fixes; the matching ESR versions are 153.1, 140.14 and 115.39. Mozilla does not flag any item as actively exploited.
- On 4 August the Android version also shipped 153.0.3 to fix an information disclosure (CVE-2026-18809), which affected Firefox Focus as well.

## Chrome July 2026

> 2026-07-29 · [Chrome Releases](https://chromereleases.googleblog.com/2026/07/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Six stable updates fixed 436 security issues in total, 14 of them Critical. Google does not flag any item as actively exploited.
- Version 151 on 29 July was a major release that fixed 371 on its own. The 7 July update had no security fixes.

## Firefox July 2026

> 2026-07-21 · [Mozilla security advisories](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>152.0.6 on 14 July fixed two Critical flaws: CVE-2026-15718 (an invalid pointer in WebAssembly) and CVE-2026-15719 (a site isolation issue in page navigation). Mozilla states that exploit code for both is public, but it is not aware of any attacks in the wild. Public exploit code means anyone can get hold of it, so this month's Firefox update belongs at the top of the "Soon" pile.
- ESR lagged by a week: 140.13 on 21 July was the first to fix both, and 115.38 only covers CVE-2026-15719.
- Firefox 153, released the same day, has another 20 High-rated fixes.
