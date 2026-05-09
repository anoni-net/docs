---
title: About anoni.net
description: A volunteer community based in Taipei tracking networked freedom across the Sinophone Asia-Pacific. Governance, partnerships, publications, and how to verify what we do.
icon: material/account-box-outline
---

# :material-account-box-outline: About anoni.net

anoni.net is a small volunteer community based in Taipei, working on networked freedom across the Sinophone Asia-Pacific. The community formed around 2023 with a focus on OONI measurement coverage in Taiwan, and has since broadened its scope toward regional observation, regulatory tracking, and selective translation of regional research.

This page is written for international peer organizations, journalists, researchers, and funders who need to know who is behind the work before citing it, partnering, or recommending it onward.

## What we are

- **A volunteer community.** No salaried staff. The site, the Pulse measurement system, the ASN coverage tooling, and the regional translations are produced by community contributors on their own time, sometimes under pseudonyms.
- **Based in Taipei.** The active core is in Taiwan. We hope to bring in regional contributors over time but currently have only occasional informal exchange with collaborators elsewhere in the region.
- **Anchored in self-hosted infrastructure.** We run our own Matrix homeserver (`im.anoni.net`), a Cryptpad instance, an Etherpad, a Send instance, a SearXNG instance, and a Formbricks instance. Internal coordination happens on these tools rather than on third-party platforms.
- **Originally a Chinese-language community.** The Traditional Chinese (zh-TW) edition is the source of truth. A re-localized Simplified Chinese (zh-CN) edition exists. This English edition is being rebuilt as a regional observatory for international readers, not as a one-to-one translation.

## What we publish

- **anoni.net Docs** — a multilingual documentation site in three editions (zh-TW, zh-CN, en) hosted at [anoni.net/docs](https://anoni.net/docs/){target="_blank"}, with Tor onion mirror at [docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion](http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/){target="_blank"}. Site source: [github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}.
- **Pulse** — a Tor relay monitoring system tracking running, version, ASN, node-type, and flag distributions for relays in Taiwan, Hong Kong, Japan, and South Korea. Pulse is an open-source FastAPI + PostgreSQL service exposing a REST and Vega-Lite chart API at [api.anoni.net](https://api.anoni.net/api/readme){target="_blank"}.
- **ASN coverage analysis tooling** — a Python CLI for batch-processing OONI public S3 data to map per-ASN observation completeness across regions. Used internally to identify under-observed networks and produce regional comparisons.
- **One translated regional report so far** — a full Traditional Chinese translation of the 2025 InterSecLab Geedge Networks / MESA Lab leak report on the zh-TW edition. Future translations will be added case-by-case when a regional report fills a Chinese-language gap. An English curated index pointing back to the original is in drafting.
- **Blog posts and community updates** — public reporting on community work, conference participation (RightsCon, COSCUP, ETHTaipei), and translated upstream announcements from Tor Project, OONI, and Tails.

## Governance

The community runs on a low-formalism consensus model. A draft governance charter is going through community review and is documented in detail on the Chinese editions ([zh-TW governance charter](https://anoni.net/docs/zh-tw/community/governance/){target="_blank"}). Headlines:

- **Roles** — *Core members* (long-term maintainers with self-host operations and PR-merge authority), *contributors* (anyone with active output), *observers* (newsletter / Public Space participants), *visitors* (anyone reading and corresponding via `whisper@anoni.net`).
- **Decisions** — consensus by default with a 3-day window for objections; voting only when consensus is blocked or under time pressure. Major decisions (charter changes, core-member additions) require 2/3 majority of active contributors.
- **Disputes** — substantive disputes follow the proposal process; interpersonal disputes go through core members, with severe cases (harassment, threats) resulting in immediate access removal and case-by-case support for affected parties.
- **Code of conduct** — mutual respect across backgrounds, technical levels, and politics. Discussion focused on ideas, not identities. Transparency in public rooms. Explicit refusal to assist illegal activity (money laundering, harassment, CSAM, foreign-state intelligence operations).

Decision history and significant changes are visible in the [GitHub repository](https://github.com/anoni-net/docs){target="_blank"} commit log and the project's blog.

## Partnerships and collaborations

A short list of organizations we have worked with directly. The bar is bidirectional collaboration — joint work, not just citing or attending.

- **[Tor Project](https://torproject.org/){target="_blank"}** — translation contributions, [Snowflake](https://snowflake.torproject.org/){target="_blank"} bridge support, and ongoing campus-relay deployment work in Taiwan. The [NTNU relay](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"} was the subject of a Tor Project blog guest post in March 2026.
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
- Pulse data is publicly readable at [api.anoni.net](https://api.anoni.net/api/readme){target="_blank"}
- The Tor onion mirror at [the docs onion address](http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/){target="_blank"} reflects the same content as the clearnet site
- Recent community work and external participation are documented in the [Updates / blog](../blog/index.md), with photos and recordings where applicable

## Reaching us

- **Matrix** (preferred for ongoing collaboration) — Public Space at [`#community:im.anoni.net`](https://matrix.to/#/#community:im.anoni.net){target="_blank"}; account requests to `whisper@anoni.net` (we run our own homeserver, accounts are individually approved)
- **Encrypted email** — `whisper@anoni.net`; PGP key on the [contact page](../contact.md)
- **Newsletter** — sign up via the [contact page](../contact.md)
- **GitHub** — issues and PRs at [github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}

For introductions, partnership conversations, or research collaboration, the [Community page](../community/index.md) lists which channels are most appropriate for which use.
