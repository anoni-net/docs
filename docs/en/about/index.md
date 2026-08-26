---
title: About anoni.net
description: A volunteer community based in Taiwan working on networked freedom across the Sinophone Asia-Pacific, covering Mainland China, Hong Kong and Macau, Singapore, Malaysia, Taiwan, and the diaspora. The 2026 tracks, governance, partnerships, publications, and how to verify what we do.
icon: material/account-box-outline
---

# :material-account-box-outline: About anoni.net

anoni.net is a small volunteer community based in Taiwan, working on networked freedom across the Sinophone (Chinese-speaking) Asia-Pacific. The community formed around 2023 with a focus on OONI measurement coverage in Taiwan, and has since broadened its scope toward regional observation, regulatory tracking, and selective translation of regional research.

The region we cover is Mainland China, Hong Kong and Macau, Singapore, Malaysia, Taiwan, and the diaspora moving between them. Taiwan is the only jurisdiction we can speak to first-hand. Everything else we follow through public sources and through contacts in those places, and we say so on pages that rest on second-hand material.

What we add is the regional layer that global English-language privacy resources are not set up to produce: how a tool behaves in Mainland China versus Taiwan, what a local statute changes about the threat model, and measurement taken from inside the region.

This page is written for international peer organizations, journalists, researchers, and funders who need to know who is behind the work before citing it, partnering, or recommending it onward.

## What we are

- **A volunteer community**: No salaried staff. The site, the Pulse measurement system, the ASN (Autonomous System Number) coverage tooling, and the regional translations are produced by community contributors on their own time, sometimes under pseudonyms.
- **Based in Taipei**: The active core is in Taipei. We hope to bring in contributors from elsewhere in the region over time, and for now our exchange with collaborators outside Taiwan is occasional and informal.
- **Anchored in self-hosted infrastructure**: We run our own Matrix homeserver (`im.anoni.net`), a Cryptpad instance, an Etherpad, a Send instance, a SearXNG instance, and a Formbricks instance. Internal coordination happens on these tools rather than on third-party platforms.
- **Originally a Chinese-language community**: The Traditional Chinese (zh-TW) edition is the source of truth. A re-localized Simplified Chinese (zh-CN) edition exists. This English edition is being rebuilt as a regional observatory for international readers, not as a one-to-one translation.

## What we are working on in 2026

Three tracks carry most of the community's output this year. The full plan, the quarterly deliverables, and current status are on the [2026 roadmap](../community/roadmap-2026.md).

- **Personal privacy guidance** — practical guidance graded by exposure level (everyday use, sensitive work, high-risk situations), landing across the concepts, tools, and scenarios sections of the site. Track page: [personal privacy guide](../community/privacy-guide.md).
- **Tor relays on university campuses** — a relay runs at National Taiwan Normal University, set up by a community member who worked the proposal through faculty and staff. We turned that case into a template kit: a [proposal template](../community/campus-tor-relay-proposal.md), a [deployment SOP](../community/campus-tor-relay-sop.md), and an [FAQ for university administrators and legal counsel](../community/campus-relay-faq.md). Each marks its Taiwan-specific material in a separate regional note, so another jurisdiction can swap those parts and keep the proposal structure, the outreach emails, and the technical steps as they are. Track page: [Tor relay on campus](../community/relay-on-campus.md).
- **Anonymous payments** — at the research stage, collecting real situations: who needs an anonymous money trail and under what circumstances, where current practice breaks down, and what limits regulation and compliance impose. It is also the topic of our booth at [Global Gathering 2026](../blog/posts/2026-anoni-net-global-gathering.md) in Estoril, on 6 September 2026. Track page: [anonymous payments](../community/payments-research.md).

## What we publish

- **anoni.net Docs** — a multilingual documentation site in three editions (zh-TW, zh-CN, en) hosted at [anoni.net/docs](https://anoni.net/docs/){target="_blank"}, with Tor onion mirror at [docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion](http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/){target="_blank"}. Site source: [github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}.
- **Pulse** — a Tor relay monitoring system tracking running, version, ASN, node-type, and flag distributions for relays in Taiwan, Hong Kong, Japan, and South Korea. Pulse is an open-source FastAPI + PostgreSQL service exposing a REST and Vega-Lite chart API at [anoni.net/api](https://anoni.net/api/readme){target="_blank"}.
- **ASN coverage analysis tooling** — a Python CLI for batch-processing OONI public S3 data to map per-ASN observation completeness across regions. Used internally to identify under-observed networks and produce regional comparisons.
- **Regional measurement write-ups** — observation records built from public data and published so others can recheck them. The most recent covers [30 minutes of mobile throttling across seven northern counties in Taiwan on 13 August 2026](../blog/posts/ooni-mobile-throttle-drill-results.md), part of an announced national resilience exercise where the date, the window, the counties, and the carriers were all public before it ran, a condition studies of throttling rarely get. Taiwan recorded 238 connection speed tests from 47 devices that day, and during the window one Chunghwa Telecom Mobile handset measured 788 to 1,709 kbit/s, an order Taiwan's public data had never shown, though 6 records from a single device are not enough to draw a national conclusion from. Every query in the write-up runs without an API key, so the whole chain is open to recheck.
- **Two translated regional reports so far** — full Traditional Chinese translations of the 2025 InterSecLab Geedge Networks / MESA Lab leak report and the MADLink report on the Taiwanese link in the Geedge supply chain, both on the zh-TW edition. Future translations get added case by case, when a regional report fills a Chinese-language gap. The English [curated index](../reports/index.md) points to InterSecLab's originals alongside our translations.
- **Blog posts and community updates** — public reporting on community work, conference participation (RightsCon, COSCUP, ETHTaipei), and translated upstream announcements from Tor Project, OONI, and Tails.

## Governance

The community runs on a low-formalism consensus model. A draft governance charter is going through community review and is documented in full in the [governance charter](../community/governance.md). Headlines:

- **Roles** — *Core members* (long-term maintainers with self-host operations and PR-merge authority), *contributors* (anyone with active output), *observers* (newsletter / Public Space participants), *visitors* (anyone reading and corresponding via `whisper@anoni.net`).
- **Decisions** — consensus by default with a 3-day window for objections; voting only when consensus is blocked or under time pressure. Major decisions (charter changes, core-member additions) require 2/3 majority of active contributors.
- **Disputes** — substantive disputes follow the proposal process; interpersonal disputes go through core members, with severe cases (harassment, threats) resulting in immediate access removal and case-by-case support for affected parties.
- **Code of conduct** — mutual respect across backgrounds, technical levels, and politics. Discussion focused on ideas, not identities. Transparency in public rooms. Explicit refusal to assist illegal activity (money laundering, harassment, CSAM, foreign-state intelligence operations).

Decision history and significant changes are visible in the [GitHub repository](https://github.com/anoni-net/docs){target="_blank"} commit log and the project's blog.

## Partnerships and collaborations

A short list of organizations we have worked with directly. The bar is bidirectional collaboration — joint work, not just citing or attending.

- **[Tor Project](https://torproject.org/){target="_blank"}** — translation contributions, [Snowflake](https://snowflake.torproject.org/){target="_blank"} bridge support, and ongoing campus-relay deployment work in Taiwan. The [National Taiwan Normal University (NTNU) relay](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"} was the subject of a Tor Project blog guest post in March 2026.
- **[OONI](https://ooni.org/){target="_blank"}** — running OONI Probe locally, contributing to the regional websites test list, and translating OONI's methodology and announcements into Chinese for the community.
- **[Electronic Frontier Foundation](https://www.eff.org/){target="_blank"}** — collaboration on the Tor Relay on Campus initiative; contributing the Traditional Chinese translation of the [Tor University Challenge](https://toruniversity.eff.org/zh-tw/){target="_blank"} (a joint EFF and Tor Project initiative).
- **University hosts** — National Taiwan Normal University (Tor relay deployment) and National Taiwan University of Science and Technology (host venue for the 2025 Anonymous Network Workshop).

Working principle: collaborators are credited explicitly; we don't claim work that isn't ours.

## Other engagement and contributions

Activity that doesn't rise to the level of partnership but is nonetheless part of the community's public footprint:

- **[InterSecLab](https://www.interseclab.org/){target="_blank"} — independent translation work**: We produced a full Traditional Chinese translation of the 2025 Geedge Networks / MESA Lab leak report, published with attribution. This is unilateral translation of a public report, not a formal collaboration with InterSecLab.
- **[g0v](https://g0v.tw/){target="_blank"} — community participation**: Members participate in g0v's recurring hackathons in Taipei, presenting and discussing anoni.net work. Attendance and informal coordination, not an organizational partnership.
- **Conferences and convenings**: anoni.net members have participated in RightsCon, COSCUP, and ETHTaipei in 2025–2026. Recaps and any recordings are linked from the [Updates](../blog/index.md) section.

## Funding and resources

The community is currently volunteer-run and not externally funded. Operating costs (domain registration, server hosting for Matrix and the docs site, conference travel) are covered by core members. We are not currently set up to receive grants or donations and would like to discuss that with potential funders before doing so.

If you represent a funder interested in regional Sinophone Asia-Pacific network-freedom work and would like to talk, we'd welcome a conversation via the channels on the [Community](../community/index.md) page.

## Licensing

Different parts of the project are licensed for different uses:

- **Documentation site content** ([github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}) — [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"} — share and adapt with attribution
- **Pulse code** — [MIT License](https://github.com/anoni-net/docs/blob/main/pulse/LICENSE){target="_blank"}
- **ASN coverage tooling** — [GPL-3.0](https://github.com/anoni-net/docs/blob/main/asn_coverage/LICENSE){target="_blank"}

Proper attribution for documentation reuse: "anoni.net Docs Project, [URL of the specific page], CC-BY 4.0."

## How to verify what we do

Independent of any claim on this page, the following are checkable:

- The full source of the documentation site, Pulse, and ASN coverage tooling is at [github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}, including commit history and contributor list
- Pulse data is publicly readable at [anoni.net/api](https://anoni.net/api/readme){target="_blank"}
- The Tor onion mirror at [the docs onion address](http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/){target="_blank"} reflects the same content as the clearnet site
- An IPFS mirror of the same content is reachable at [ipfs.anoni.net](https://ipfs.anoni.net/){target="_blank"}, which is worth knowing if the clearnet site is unreachable from where you are. The DNSLink record `_dnslink.anoni.net` points at the same IPNS name, so any DNSLink-capable gateway serves the same mirror
- Recent community work and external participation are documented in the [Updates / blog](../blog/index.md), with photos and recordings where applicable

## Reaching us

- **Matrix** (preferred for ongoing collaboration) — Public Space at [`#community:im.anoni.net`](https://matrix.to/#/#community:im.anoni.net){target="_blank"}; account requests to `whisper@anoni.net` (we run our own homeserver, accounts are individually approved)
- **Encrypted email** — `whisper@anoni.net`; PGP key on the [contact page](../contact.md)
- **Newsletter** — sign up via the [contact page](../contact.md)
- **GitHub** — issues and PRs at [github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}

For introductions, partnership conversations, or research collaboration, the [Community page](../community/index.md) lists which channels are most appropriate for which use.
