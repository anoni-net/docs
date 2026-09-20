---
date: 2026-09-21
authors:
    - anoni-net
categories:
    - News
    - Community
slug: site-updates-202609
image: "assets/images/post-update.png"
summary: "The first of a recurring look back at the docs site itself, covering 2 to 20 September, the window since the previous release, and 140 pull requests. The Lab went live with a page measuring WebRTC transfer speed with no internet in the room, the utilities grew from 9 tools to 15, nine worked examples string those tools into paths you can follow end to end, and a settings drawer collects controls that used to be scattered. The surveillance page gained a fifth tier, open-source intelligence profiling, against which end-to-end encryption, VPNs and Tor are all irrelevant. Three regional pages went up, one built from forty-nine public sources. The last two sections are for readers who acted on the old guidance: one lists the follow-ups, the other the statements now withdrawn."
description: "The first of a recurring look back at the docs site itself, covering 2 to 20 September, the window since the previous release. The Lab, the utilities growing from 9 tools to 15, nine worked examples, the settings drawer, a fifth surveillance tier, three regional pages, and the follow-ups for anyone who acted on the old guidance."
---

# Docs site update review, September 2026

![Docs site update review](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

The previous release went out on 2 September. Between then and the 20th, the docs site merged 140 pull requests. The Lab went live, the utilities grew from 9 tools to 15, nine worked examples string those tools into paths you can follow end to end, a settings drawer collects controls that used to be scattered, and the surveillance page gained a fifth tier. On the content side, three regional pages went up, one of them taking forty-nine public sources to pull apart identity binding and the data market beside it. The last two sections are for readers who acted on the old guidance.

<!-- more -->

## Scope and cadence

Nobody has run a regular review of how the docs site itself changes. New features ship, new subjects open, old claims get withdrawn, and all of it sits scattered across per-page revision logs and the commit history, invisible to anyone who does not read the repository. This is a first attempt, and we plan to run it every two to three weeks, with each edition covering the window since the previous release.

The scope is the docs site itself: what you can now do, which subjects we have opened, and which of our earlier claims no longer hold. Community events and outside news stay with the existing round-ups, and software versions stay in the [Software Changelog](../../changelog/index.md). For a change-by-change account, [the release notes on GitHub](https://github.com/anoni-net/docs/releases){target="_blank"} go into more detail than this post.

## Offline reading and passkeys in the first half

The main thread from 2 to 8 September was offline reading and passkeys, already covered in full in [Storing the whole docs site and its tools on a device](./2026-offline-first-docs.md), including how the six Service Worker caches divide the work, why the passkeys here need no account and no server, and why age was chosen for encryption. What follows is only the pages that post did not open up.

- [Passkey as your key](../../utils/passkey.md), [My preparation checklist](../../utils/checklist.md) and [Local file encryption](../../utils/age.md) are three landing points for one key. The checklist turns the site's recommendations into tickable items, with the tick state encrypted and stored on your own device.
- [What is a passkey?](../../tools/what-is-passkey.md) and [What is age?](../../tools/what-is-age.md) explain the mechanisms and their limits, so the tool pages do not repeat that layer.
- [File hash comparison](../../utils/hash.md) computes a SHA-256 to check against the string you were given, confirming that a file delivered by hand or pulled off a download matches the original, and it handles files of several gigabytes.
- [Speaking online from Singapore and Malaysia](../../scenarios/singapore-malaysia-speech.md) gained Traditional and Simplified Chinese versions; the English one was already up.
- [Preparing for and responding to a network shutdown](../../scenarios/shutdown.md) filled in how to work during an outage, judgement calls when alone, dividing tasks in a shared household, and the location exposure that comes with reconnecting.
- [Global Gathering 2026](../../activity/gg2026.md) gained an on-site page for finding people, with a photo of the printed wrapper, a globe screenshot and a payment illustration. Six terms of art gained footnotes, placed where attendees on site had trouble reading.

## The Lab and the WebRTC transfer measurement

[Lab](../../lab/index.md) holds work that is still being validated. Each page maps to one issue, and its purpose is to produce a set of numbers that show whether a given approach is viable. Pages there can change at any time or disappear entirely, and anything that finishes validation moves into the utilities and gets rewritten on the way.

The first page is [Device to device transfer](../../lab/webrtc-transfer.md). Offline content on the docs site can currently only be refreshed over the network, and the [QR code frame stream](../../utils/qr-stream.md) moves one to three kilobytes per second, which makes a multi-megabyte offline bundle a non-starter. A direct connection across the same local network is far faster, at the cost of having the two devices first exchange a connection description, a step that normally relies on a server. Compress that description enough and a QR code can carry it, which removes the server from the whole path. This page measures how large the description gets and how fast the transfer actually runs.

Put two devices on the same network; a hotspot you control yourself is the most predictable option. Every page in the Lab has an export button, IP addresses and mDNS names are stripped before the file is written, and the exported file goes back onto that page's issue. A failed attempt is still a result: which kind of network refused to connect, which step it stalled on, and whether the messages made sense are all worth recording.

## A new tool, and face detection in screenshot redaction

[PDF page tidy-up](../../utils/pdf-pages.md) merges several PDFs, pulls out or deletes particular pages, reorders them and rotates them. The output carries none of the original title, author or producer fields, and there is a leak check alongside. Free online PDF services do the same job, at the cost of uploading the entire file first. One provider's privacy policy states that files are deleted within two hours of processing, which is clearly written, and for those two hours the complete file sits on somebody else's server.

[Screenshot redaction](../../utils/redact.md) gained automatic face detection. Faces that are found are outlined in blue first and only get covered once you press the button, so a false positive can simply be removed. Detection sweeps three angles, which catches tilted heads, and the work runs in a worker so that pressing the button produces visible progress straight away. Tuning the parameters went wrong three times, and in every case the sample images had been too forgiving: parameters derived from four large faces missed half the faces in a crowded frame, failed on glasses, and put every distant face in a street scene below the minimum size.

The utilities grew from 9 tools to 15, now organised in the sidebar into five sets: what you are defending against, passwords and encryption, handing something over in person, before you send it out, and after you receive it. The group names are the same strings as the subheadings on the [index page](../../utils/index.md), so the sidebar and the index divide things the same way. All 15 tool pages also gained an explanation shown when JavaScript is off, so readers running Tor Browser on Safest now see a paragraph rather than an empty space.

## Nine worked examples

Each tool is explained clearly enough on its own, and working out how to chain them together was still left to the reader. The nine new pages each start from a concrete situation and run it through to the end.

The everyday set covers [the ads seem to know what you are thinking](../../utils/case-profile.md), [sending out a job application](../../utils/case-resume.md), [selling things on a secondhand marketplace](../../utils/case-secondhand.md) and [a link forwarded into a group chat](../../utils/case-link.md). The work set covers [walking a new colleague through a device review](../../utils/case-onboarding.md), [handing a list to an outside partner](../../utils/case-roster.md), [handing things out at a workshop](../../utils/case-workshop.md), [a file from a source](../../utils/case-source-file.md) and [turning conversation screenshots into a submission](../../utils/case-evidence.md).

These pages also cover which of two similar-looking tools to reach for. The division of labour between screenshot redaction and the metadata stripper is worked through on the secondhand marketplace page using fourteen photos waiting to be listed.

## The settings drawer

Appearance, reading language, connection route, mirror entry points, update checks, the offline reading entry point and the analytics opt-out now sit under a single settings icon. Phone and desktop open the same contents, so there is no need to remember two sets of locations for different devices.

The analytics opt-out used to live in one place only, halfway down the browser fingerprint demonstration page. That page saw 18 visitors in 30 days, so anyone who wanted to turn off statistics could not realistically find it, and the disclosure page listed every kind of event sent without offering a control reachable from every page. The settings drawer is on every page, and it matches the expectation that settings live in settings.

## The fifth surveillance tier

[What surveillance can actually do](../../basics/surveillance-capability.md) was built around four tiers, rising in cost and narrowing in coverage, and the whole section on why most people are not on a list rested on that structure. The activity recorded in Anthropic's September report falls into none of the four: the material comes entirely from public sources and social platforms; the output is individual profiles and daily briefings; the cost sits close to the first tier; and yet the targeting is as selective as the fourth.

The new fifth tier is open-source intelligence profiling. The table of which measure blocks which tier gained a column, and end-to-end encryption, VPNs, Tor and disabling the advertising identifier are all marked irrelevant in it, because what is being collected is what you published yourself. The only effective entry is a newly added row: the pace at which you disclose public information. The reading guidance was rewritten too. It previously described the rightmost column as too expensive to use on most people, and the rightmost column is now the cheap, selectively targeted one.

Pacing that disclosure is covered under "Pre-event venue detail" on [Activists and protest digital safety](../../scenarios/activist.md).

## Three new regional pages

[How many people use Tor in Taiwan](../../regional/taiwan-tor-users.md) reads four years of trend data out of the public Tor Metrics files. The average number of concurrently connected clients is around 9,500, rising gradually from roughly 7,400 over four years. Between September 2025 and the first half of 2026 that figure briefly reached ninety thousand, which was a fault in Tor's own counting code rather than user growth, and the page carries a full breakdown of where the error came from.

[Identity Binding and Taiwan's Data Market](../../regional/taiwan-realname-data-market.md) handles something else. Taiwan has no single law called real-name registration, and it has a whole row of separately legislated requirements to show identity when buying a mobile number, opening an electronic payment account, placing online advertising or using virtual asset services. Once that binding is in place, location, connection and spending records begin to accumulate, drawn on one side by state access requests and sold on the other as a product. The evidence base is forty-nine public sources, five years of official statistics and 150,000 records recalculated from scratch, and the structure both sides share is pulled apart on the page.

[What Taiwan's Digital Credential Wallet Protects](../../regional/taiwan-digital-wallet-privacy.md) rests on the MIT-licensed source code, examining three questions separately: whether the issuer can see where a credential was presented, whether two verifiers can correlate presentations, and who is entitled to demand one. The official account and the civil society criticism both hold, but neither settles the specific technical questions. Because the wallet's code is public, those questions have answers.

## Tor on a phone, and Emergency Help

[Tor on a phone](../../tools/tor-browser-mobile.md) treats Android and iOS separately. Android has Tor Browser published by the Tor Project itself, running the same engine as the desktop build. iOS has no official build: Apple requires every browser on the platform to render with WebKit, and Tor Browser's fingerprinting resistance is built on modifications to the browser engine that cannot be made in WebKit. The constraint comes from platform policy and has nothing to do with version numbers.

[Emergency Help](../../help/index.md) gained a section for being approached, suspecting that a profile has been built on you, or having family contacted.

## Three articles from this period

- **[Four cases in Anthropic's September 2026 threat report involve Taiwan](./2026-anthropic-threat-report-taiwan.md)**: a walk through the parts of the 154-page report that concern Taiwan and the Chinese government, with PDF page numbers on every passage, plus the responses that followed publication and one rumour that has since been denied. The material behind the fifth tier above comes from this piece.
- **[Storing the whole docs site and its tools on a device](./2026-offline-first-docs.md)**: the offline work written up after Global Gathering 2026.
- **[What Tor VPN Beta's first year looks like across seven Asia-Pacific regions](./2026-tor-vpn-beta.md)**: a translation of the official retrospective, covering the isolation design that gives each app its own circuit, the misuse that exit selection produced in usability testing, and congestion control as work still not ported over from C Tor, with regional notes added at the end.

## Follow-ups for readers of the old guidance

- **If you pressed "save everything to this device"**. Open the settings drawer and check for updates once. Before 13 September, "update saved content" was limited to pages already sitting on the device, so articles published afterwards had never been saved and no number of update presses would bring them down. A flag is now recorded per language when you save everything, so newly published pages come down with the next update. Readers who ticked only a few pages keep their original selection, and nothing they left out gets pushed onto them.
- **If you assumed that visiting the site saves it automatically**. What you have is the baseline set only. The utilities post and the help page said for a while that a first visit downloads the core chapters, and that wording was not updated when the behaviour changed. A first visit now stores the offline landing page and the styles it needs, about 1 MB, and the full set comes down only once you pick a reading language on the home page or turn to a second page. Check [Offline reading](../../offline.md) before you travel to see what is actually stored.
- **If you run a relay**. The tor 0.4.8.x line is no longer usable. The software changelog described 0.4.8.x as the long-term support line. As of 0.4.9.12 the directory authorities reject 0.4.8.x at the authority level, so that description no longer holds for relay operators, and the page's premise was corrected.
- **If you read the surveillance page**. The first four measures do nothing against the fifth tier. End-to-end encryption, VPNs, Tor and disabling the advertising identifier do not touch open-source profiling, because what is collected is what you already published. What needs adjusting is the disclosure pace, not another layer of encryption.
- **If you upload images to a South Korean platform**. Since July 2026 images fall under the pre-screening obligation, and uploads are matched against a government database of unlawful imagery, so sensitive material should go through an off-shore platform or an end-to-end encrypted tool instead. [Device minimization and border crossings in Asia](../../scenarios/asia-travel.md) only gained this passage in September, so anyone who read the page earlier will not know about it.

## Withdrawn statements

- The offline landing page size was given as 0.7 MB in all three languages. Running the calculation separately for each gives 0.99, 0.96 and 0.97 MB, all close to 1 MB, and the figure is now 1 MB. Understating it works against the reader: that passage exists so people can decide whether to keep the landing page, and anyone on mobile data would have underestimated the cost.
- The PRF footnote on the Global Gathering page previously described approving with a fingerprint, face or PIN as producing the same fixed result every time, which dropped the input from the premise entirely and contradicted the line of body text directly above it. Each encryption actually carries a fresh random input, so encrypting two files with the same passkey produces different results by design. The same footnote also now notes that not every authenticator your password manager provides can do this.
- The passkey page linked for a while to an experimental page that exists only in Traditional Chinese, which aborted the build for the Simplified Chinese and English editions. All three now point to the preparation checklist.
- The September Windows figures went out of date. At the time of writing on 11 September they were 1,206 CVEs with 119 rated Critical; MSRC revised the document on the 15th and again on the 17th, and by the 17th a recount gave 1,713 and 137. Windows itself moved only from 726 to 729, with nearly all of the increase in other product lines. The two actively exploited entries are unchanged, and their scope and CVSS scores were re-checked. The entry now carries an as-of date, and a note at the top of the page explains that upstream keeps revising these numbers.
- The Android changelog page rested throughout on the claim that bulletins had stopped listing vulnerability detail from July onward. The September bulletin restored the detail, 18 tables and 180 CVEs, so the page now records a two-month gap instead, and severity grading stays off for the moment.
- The iOS inclusion criteria used to exclude releases with no CVE list. They now distinguish between a release absent from the release page and one that appears there with an upstream note saying no CVE entries have been published.
- The threshold for South Korea's image pre-screening obligation had been written as one million users; it is actually a daily average of 100,000 users, or 1 billion won in value-added telecom revenue in the previous year. That figure is the threshold for platform operators, not anything a traveller has to act on, and it is easily confused with the one-million-user threshold in the 7 July false-manipulation-information amendment. The same verification pass corrected three other points: which dates the three advisories from Taiwan's Mainland Affairs Council belong to, the effective dates of Indonesia's PP Tunas and its implementing rules, and the level at which Singapore's Online Safety Commission issues orders.
- "Warrant" has no direct counterpart in Taiwanese law, so the Chinese editions of [What surveillance can actually do](../../basics/surveillance-capability.md) now name the specific instruments rather than one generic term. The English edition keeps "warrant" as the working translation, and the Hong Kong passages use the local term.
- Anthropomorphic phrasing across the site went through an audit and was corrected, covering organisations speaking, documents speaking, software perceiving and abstractions having intent. Colloquial verb-complement constructions were changed to written forms across 41 files.

## Diagrams, the globe tour, and the URL contract

Thirty-two diagrams were redrawn as 400-wide portrait figures. The 940-pixel canvas limit was set with only desktop in mind, and a 940 canvas scales to 0.35 on a 360-pixel phone, rendering 11.5px type at 4.0px, roughly a quarter the size of the body text beside it. A sweep of all 81 files found no exceptions. The new specification is a 400-wide canvas with 13px minimum type, information running downward, scaled back up to 480 on desktop. The scenarios section separately gained 12 hand-drawn diagrams, one set per language.

The [Tor Relay Globe](../../games/tor-network.md) gained a seven-stop workshop tour. Press the space bar to advance, and the seven stops walk through global distribution, the gap between relay count and consensus weight, places where connections are obstructed, user estimates, where Taiwan sits, and the physical infrastructure layers beneath it. The piece itself has long been in the precache and opens with the network off; what was missing was a route you could follow without memorising the controls.

The site also gained a URL contract, recording every page URL, every heading anchor, every redirect and the handful of endpoints that machines read, so that breaking one of them turns CI red. URLs are this site's only promise to the outside world, and everyone who depends on them sits where CI cannot reach: readers' bookmarks, search engine indexes, links in other people's writing, and offline content already saved onto a reader's device. Breaking one used to turn no test red at all, and the person who found out was a reader.

## Next steps

The WebRTC page in the Lab needs real measurements: two devices, one network, and the exported record pasted back onto the issue. Every network environment is useful, whether that is a home router, a phone hotspot or the shared Wi-Fi at a venue, and a failure to connect is just as worth recording.

The cadence, scope and shape of this series are all still being worked out. If a section is too granular, if one deserves more room, or if there are changes you want to see covered, we would like to hear it. Contact details are on [Stay Informed](../../contact.md).

## Further reading

- [Storing the whole docs site and its tools on a device](./2026-offline-first-docs.md): the full account of offline reading and passkeys
- [Utilities](../../utils/index.md): the index of all 15 tools, including the nine worked examples
- [Lab](../../lab/index.md): what is still being validated, and how to report measurements
- [What surveillance can actually do](../../basics/surveillance-capability.md): the five tiers and the table of measures against them
