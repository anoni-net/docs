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

Chrome ships a minor version with security fixes nearly every week. Major versions used to arrive about every four weeks, but since September 2026 versions 153 through 156 have each come two weeks apart. Firefox also moved to a major version every two weeks from September, and maintains Extended Support Release (ESR) lines 153 and 115, the latter mainly for people still on Windows 7, 8.1 and older macOS. ESR 140 has had no new release since 140.17 on 29 September, and Mozilla's release notes no longer list that line.

Both browsers download updates in the background, but an update only takes effect after the browser restarts. Anyone who keeps their browser open for days may have the new version downloaded while still running the old one. In Chrome, type `chrome://settings/help` into the address bar to see the version; in Firefox, open "Help" in the menu and choose "About Firefox".

## Chrome October 2026

> 2026-10-29 · [Chrome Releases](https://chromereleases.googleblog.com/2026/10/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>156.0.8078.79 on 29 October fixed 21 security issues, 1 Critical, 19 High and 1 Medium. Across October's six desktop stable announcements, Google does not flag any item as actively exploited, and 156.0.8078.79 is the latest.
- The Critical issue is memory corruption in MediaStream, the interface web pages use to reach the camera and microphone (CVE-2026-76024). Among the High issues, FileSystem has 3, Quota, CacheStorage and Skia have 2 each, and V8 and Dawn (the WebGPU implementation) have one each. Extended Stable also moves to 156.0.8078.79 this time. The Android release shipped the same day, and its announcement states it carries the same security fixes as desktop.
- 156.0.8078.73 on 27 October fixed 52 security issues, 4 Critical and 46 High.
- The 4 Critical issues are memory corruption in FileSystem (CVE-2026-118306), insufficient input validation in FileAPI and Skia (CVE-2026-118331, CVE-2026-118348), and a use-after-free in Layout (CVE-2026-118344). Among the High issues, V8 and Turbolev account for 6, and the PDFium PDF engine has another use-after-free (CVE-2026-118345). The Android release shipped the same day, and its announcement states it carries the same security fixes as desktop.
- 157 went out as an Early Stable release to a small share of Windows users on 22 and 28 October; neither announcement lists security fixes.
- Major version 156.0.8078.47 on 20 October fixed 353 security issues, 6 Critical and 61 High.
- Five of the six Critical issues in 156 are memory corruption, in Skia (the graphics engine), Accessibility, CSS, Paint and WebRTC (CVE-2026-113341, CVE-2026-113279, CVE-2026-113072, CVE-2026-113280, CVE-2026-113303); the sixth is a use-after-free in Accessibility (CVE-2026-113271). Among the High ones, V8 and its Turbolev compiler account for seven, plus a use-after-free in Site Isolation (CVE-2026-113101) and insufficient input validation in Proxy (CVE-2026-113040).
- 155.0.8059.79 on 13 October fixed 37, 7 Critical and 29 High. All seven Critical issues are memory errors, in ANGLE, the browser process, PDF, Network, Core, SVG and Media; the PDF one (CVE-2026-110136) is reached simply by opening a PDF. The High ones include a privilege escalation in the Windows installer (CVE-2026-110150) and an incorrect authorization in the updater (CVE-2026-110159).
- 155.0.8059.84 on 15 October fixed 10, one Critical, a use-after-free in Prerender (CVE-2026-110922); three of the six High ones are in V8.
- The Android version ships alongside desktop, and its announcements state that it carries the same fixes. Extended Stable 152 was also updated on 13 and 15 October; the latest is 152.0.7977.169.
- Major version 155.0.8059.39 on 6 October fixed 247 security issues, 4 Critical and 53 High. Google does not flag any of them as actively exploited.
- All four Critical issues are use-after-free bugs (memory used again after being released), in Chromecast, the browser process, Navigation and Track (CVE-2026-106382, CVE-2026-106197, CVE-2026-106358, CVE-2026-106347). Among the High ones, seven are in ANGLE and three in V8, plus an incorrect authorization in Site Isolation (CVE-2026-102322).
- 154.0.8037.97 on 1 October fixed 11 security issues, one Critical and nine High. Google does not flag any of them as actively exploited.
- The Critical one is an out of bounds write in WebGL (CVE-2026-103628), the interface web pages use to draw 3D graphics on the graphics card. The High ones include a type confusion in V8 (CVE-2026-103625); the rest are spread across FileSystem, SVG, Skia, MediaStream and other components.
- The two exploited V8 flaws from September were already fixed in 152.0.7977.82 and 153.0.8010.36, so this release covers them too.

## Firefox October 2026

> 2026-10-27 · [Mozilla security advisories](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>Firefox 159 on 27 October fixed 167 issues, 108 High, 52 Moderate and 7 Low, with none Critical. Mozilla does not flag any item as actively exploited, and the phrase "in the wild" does not appear in the advisory. 159 is the latest desktop release.
- Among 159's High issues are 3 sandbox escapes, in navigation, form management and networking (CVE-2026-117861, CVE-2026-117864, CVE-2026-117868), plus 5 privilege escalations, 3 same-origin policy bypasses and 5 JIT compiler issues. The Moderate issues include another 10 sandbox escapes, half of them in graphics and WebRender.
- ESR 153.6 and 115.44 shipped the same day, fixing 145 and 80 issues respectively. ESR 140 again had no matching release; Tor Browser 16.0, released on 29 October, moves straight to a 153.6.0esr base (see the [Tor changelog](./tor.md)).
- The iOS app shipped 156.1 on 26 October, fixing 2 issues. The Moderate one lets the FaceTime protocol handler be used for spoofing (CVE-2026-116632), and the Low one lets a tel: link spoof the address shown in the address bar (CVE-2026-116631).
- Firefox 158 on 13 October fixed 77 issues, 30 High, 33 Moderate and 14 Low, with none Critical.
- Starting with this release Mozilla changed how it writes advisories: memory safety bugs found internally are no longer rolled into a single aggregate CVE, and each bug now gets its own number. That inflates the High count compared with earlier releases, which is worth knowing when comparing figures across months. The stock "could have been exploited" sentence that appeared in every release went away together with the aggregate entries.
- The High fixes in 158 include four sandbox escapes in networking and graphics components (CVE-2026-109705, CVE-2026-109707, CVE-2026-109708, CVE-2026-109712), a privilege escalation in the application update component (CVE-2026-109704), and seven in the JavaScript engine and JIT compiler. Most of the rest are use-after-free bugs in DOM, SVG, graphics and media components.
- 158.0.1 fixed four issues, two of them High. One concerns certificates: intermediate certificates from eMudhra were misused, and Mozilla blocked them through OneCRL (Firefox's certificate revocation list) on 17 October. OneCRL normally updates automatically through remote settings; this release ships the updated list inside the program, so people who have turned remote settings off are protected too (CVE-2026-113470). The other is a boundary condition error in SVG (CVE-2026-113399).
- ESR 153.5 and 115.43 shipped with 158 on 13 October, fixing 61 and 17 respectively, and 153.5.1 and 115.43.1 on 20 October added the eMudhra fix. ESR 140 had no matching release this round. On Android, 158.0.2 followed on 21 October with only the eMudhra fix. For the matching Tor Browser 15.0.26 and GrapheneOS updates, see the [Tor changelog](./tor.md) and the [GrapheneOS monthly summary](./grapheneos.md).
- 157.0.1 on 6 October fixed a single Moderate issue, a mitigation bypass in the File Handling component (CVE-2026-106016).

## Chrome September 2026

> 2026-09-29 · [Chrome Releases](https://chromereleases.googleblog.com/2026/09/){target="_blank"}

- <span class="urg-tag urg-tag--now">Now</span>Both exploited flaws are in V8, Chrome's JavaScript engine. Google's announcements state that exploits exist in the wild, and CISA added each to KEV the following day. Version 153.0.8010.36 or later covers both; the latest is 154.0.8037.92 from 29 September.
- CVE-2026-85046: type confusion in V8, rated High by Google, fixed in 152.0.7977.82 on 3 September.
- CVE-2026-87491: out of bounds write in V8, rated Medium by Google, fixed in 153.0.8010.36 on 8 September.
- Chromium-based browsers such as Edge and Brave also use V8 and need their own updates. Tor Browser is built on Firefox, has no V8 and is not affected by either.
- 154.0.8037.92 on 29 September fixed 32 security issues, one of them Critical: a buffer overflow in ANGLE (CVE-2026-102331), the layer that translates web graphics calls into each platform's native graphics API. Google does not flag anything in this release as exploited.
- Seven stable updates this month fixed 466 security issues in total, 24 of them Critical. The two major versions, 153 on 8 September and 154 on 22 September, account for 338.

## Firefox September 2026

> 2026-09-29 · [Mozilla security advisories](https://www.mozilla.org/security/advisories/){target="_blank"}

- <span class="urg-tag urg-tag--soon">Soon</span>All three major versions, 155 (1 September), 156 (15 September) and 157 (29 September), carry High-rated fixes. Mozilla does not flag any item as actively exploited.
- 157 is larger still, with 38 High-rated fixes, nine of them sandbox escapes (15 once Moderate ones are counted). The sandbox is what separates web pages from the operating system, and escaping it is often the final step in a full attack chain. WebGPU, the interface that lets web pages run computations on the graphics card, accounts for four more High-rated fixes.
- 156 has 29 High-rated fixes. Two are sandbox escapes (CVE-2026-92035, CVE-2026-92018) and eight are privilege escalations in the WebGL canvas component.
- The Android version has one more privilege escalation (CVE-2026-92033), also fixed in 156.
- The latest matching ESR versions are 153.4, 140.17 and 115.42, released the same day as 157. Tor Browser 15.0.24 has already moved to 140.17.

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
