---
title: 2026 Roadmap
description: What the anoni.net community is working on in 2026 — three thematic tracks, the documentation build-out schedule, events, and how to get involved.
icon: material/road-variant
---

# :material-road-variant: 2026 Roadmap

This page sets out the anoni.net community's goals and quarterly deliverables for 2026, written for partners, collaborators, and anyone following our work from outside. Anonymity networks remain the core of what we do. Alongside the continuing local advocacy for Tor, Tails, and OONI, three tracks are new this year: a personal privacy guide, Tor relays on university campuses, and applied work on anonymous payments. We review delivery at the end of each quarter and adjust the next one accordingly.

The 2025 retrospective and the background to how 2026 was scoped are in [From 2025 into 2026](../blog/posts/2025to2026.md).

## Three thematic tracks

### Personal privacy guide

Across a year of advocacy for Tor, Tails, and OONI, the question we hear most often is "what do I actually do next to be safer". What sits behind that question is the absence of a practical guide graded by situation. Over this year we are building out the privacy material in stages, covering tools and steps at three levels of exposure (everyday use, sensitive work, and high-risk situations), landing across the [Concepts](../basics/index.md), [Tools](../tools/index.md), and [Scenarios](../scenarios/index.md) sections.

The research track's entry point, article index, and current status are on [the personal privacy guide track page](./privacy-guide.md).

### Tor relays on university campuses

This track follows from the [Tor University Challenge](https://toruniversity.eff.org/){target="_blank"}, an EFF campaign to get stable relays running at higher education institutions. Taiwan already has one: the Computer Science and Information Engineering department's IT centre at National Taiwan Normal University operates a Tor relay, set up after a community member worked the proposal through faculty and staff. The account of how that went is in [an interview with NZ at NTNU](../blog/posts/ntnu-nz.md).

In 2025 we completed the Traditional Chinese translation of the Tor University Challenge site. In 2026 we are taking the process onto campuses.

The track entry point, the cases we have accumulated, and how to join are on [the campus relay track page](./relay-on-campus.md). The technical how-to is in [Setting up a Tor relay](./setup-tor-relay.md).

### Anonymous payments

Cash is the most mature anonymous payment method, and it runs into clear limits across borders, online, and when an organization needs to receive donations. Within the bounds of the law, the community is exploring what on-chain tools can do here, covering cryptocurrencies, stablecoins, zero-knowledge identity verification, and multi-signature setups. The track is at an early stage. We have not found a systematic body of Chinese-language material on it, which is part of why we are building the implementation guidance ourselves.

The track entry point, article index, and current status are on [the anonymous payments track page](./payments-research.md).

## Documentation build-out

The documentation site is the community's main instrument for both advocacy and accumulated knowledge. The structure has been reorganized into seven top-level sections, with a further five sub-groups under Guides.

The schedule below covers the site as a whole, where Traditional Chinese is the source of truth. The English site is a curated track carrying a subset of it, so several items land in Chinese first and reach English in a later batch. Where a section named here has no English equivalent yet, that is why.

- **Q1 (complete)**: core [concepts](../basics/index.md) first, local regulatory coverage (the 2025 amendment to [the Personal Data Protection Act of Taiwan](../regional/taiwan-pdpa-2025.md), the 2026 [virtual asset service provider regime](../regional/taiwan-vasp-2026.md)), the emergency help page, community governance, and this roadmap
- **Q2 (in progress)**: the tools layer (Tor Browser advanced settings, anonymity OS comparison, messaging tool comparison, password managers, the cryptocurrency privacy spectrum) and end-to-end encryption in the advanced layer, all with first drafts published and revisions ongoing
- **Q3 (not started)**: the scenarios layer (journalists, activists, domestic violence survivors, LGBTQ+ people, election observers, among others), post-quantum cryptography and decentralized publishing in the advanced layer, and coverage of the whistleblower protection act
- **Q4 (not started)**: the governance charter, the contributor handbook, and the annual retrospective

Actual progress depends on volunteer writing capacity.

## Events

### COSCUP 2026

Building on our 2025 experience at COSCUP (the Conference for Open Source Coders, Users, and Promoters, Taiwan's largest annual open source conference), the community ran a track again on 8 and 9 August 2026 at National Taiwan University of Science and Technology. The anonymous payments session, organized jointly with [ETHTaipei](https://ethtaipei.org/){target="_blank"}, ran on the afternoon of 8 August in room `TR-511`. The full program is on the [COSCUP 2026 track page](../activity/coscup-2026.md), and the call for proposals that preceded it is at [COSCUP 2026 open call](../activity/coscup-2026-cfp.md).

### Workshops and meetups

Following the workshop we ran at National Taiwan University of Science and Technology in August 2025, we are scheduling in-person workshops and online meetups through 2026 as topics mature and partners ask for them. The audiences we work with include news organizations, independent journalists, civil society groups, technical communities, and interested members of the public.

## Working with others

### Research and report translation

In the second half of 2025 we completed and published the Chinese translation of [InterSecLab's research on the export of China's censorship technology](../reports/index.md). Through 2026 we continue to select international reports with local relevance for translation and annotation, collected under [Curated Reports](../reports/index.md).

### Showing up at other people's events

Community members turn up at local open source, civic, and privacy events (hackathons, annual conferences, topic meetups, talks). Most of the time this is individuals or community representatives listening in and following context rather than formal inter-organizational collaboration. Concrete collaboration (joint calls for proposals, report translation partnerships, co-organized events) gets announced separately on the [Events](../activity/index.md) page once there is something real to announce.

## Technical projects

Beyond the documentation site, the community maintains several technical sub-projects related to Tor, OONI, and password security:

- **Pulse**: real-time Tor relay monitoring (FastAPI and PostgreSQL), the data source behind the charts on the [Tor relay observatory](../regional/tor-relay-watcher.md) page
- **ASN Coverage**: a batch analysis tool over OONI's public data, feeding the [ASN coverage analysis](../regional/ooni-asn-coverage.md) page
- **Asian Diceware**: an EFF-compatible 7776-word passphrase list that blends in dictionary-attested Asian loanwords, built partly to prepare for a future community-run anonymous service platform along the lines of [AnonTicket](https://anonticket.torproject.org/){target="_blank"}, the Tor Project's anonymous support ticketing service, which would need to generate account codes. See [Asian Diceware](../tools/asian-diceware.md).

Pulse and ASN Coverage live with their issue trackers in [anoni-net/docs on GitHub](https://github.com/anoni-net/docs){target="_blank"}. Asian Diceware has its own repository at [anoni-net/asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"}. How the two observation tools connect to the Tor Project's upstream network-health work is covered on [the Tor Project ecosystem page](./tor-project-ecosystem.md).

## How to get involved

You do not need a technical background. Pick whichever entry point fits:

- **Following the issues and the community**: subscribe to the [newsletter](../contact.md) and join Matrix
- **Translation and writing**: see [Localization and translation](./i18n.md) and [How to contribute](./how-to-contribute.md)
- **Working out how deep you want to go technically**: see the [skill level self-assessment](./skill-level.md)
- **Understanding the collaboration tools**: see [Community services](./tools.md)

Discussion happens mainly on Matrix (homeserver `im.anoni.net`), collaborative writing on CryptPad, and calls on Jitsi. Account requests and setup instructions for all of them are on the [Community services](./tools.md) page.

## Roadmap updates

This roadmap is a living document, reviewed and adjusted at the end of each quarter. Significant changes go through the community proposal process and are announced on Matrix.

**Last updated**: June 2026, when Q2 was in progress. Q3 has been under way since July and the quarterly status above has not been revised since. The next review is at the end of Q3.
