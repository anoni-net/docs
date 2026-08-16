---
title: The Tor Project Ecosystem, and How to Connect to It
description: Where to find the Tor Project's plans, which projects are actually active, the official communication channels, and the easiest ways for a regional community to start contributing upstream.
icon: material/handshake-outline
---
# :material-handshake-outline: The Tor Project Ecosystem, and How to Connect to It

After a year of local advocacy for Tor, Tails, and OONI, the question we hear most from members is whether they can participate in the upstream project rather than only using and promoting it locally. They can, and the barrier is lower than people assume.

Connecting upstream produces concrete results. Regional measurement work can go back to the team maintaining network health. Every additional relay adds a node in the Asia-Pacific and improves the diversity of the network's IP space. The Traditional Chinese translation of Tor's documentation needs people to maintain it against every release. The Tor Project is a non-profit with public governance, and its communication channels, source code, and planning documents are mostly open, so participation can start from translation, running a relay, or organizing an event.

This page covers four things: where the plans are, which projects are moving, the official channels, and where a regional community can most easily start.

!!! tip "The lowest-barrier way in"

    Two things, neither requiring anyone's approval, both doable as an individual without representing a community. First, maintain the Traditional Chinese translation of Tor's support documentation on Weblate. `zh_Hant` is broadly complete and needs people keeping up with source changes and proofreading ([Tor new-support-portal](https://hosted.weblate.org/projects/tor/new-support-portal/){target="_blank"}, process in [localization and translation](./i18n.md)). Second, introduce yourself in the Tor forum and in `#tor-project:matrix.org`. Building a contribution record and some visibility is where every formal collaboration starts.

## Where the plans are

Tor publishes at two levels: strategy for a general audience on the blog, and detailed planning for contributors in a self-hosted GitLab wiki.

The strategy layer is on [blog.torproject.org](https://blog.torproject.org/){target="_blank"}. The annual direction post sets out that year's priorities, with the 2026 edition focused on integrating circumvention into more Tor software, including Tails and Tor VPN, and treating the fragmentation of the internet by states building their own walls as the connecting concern[^1]. The year in review names four long-term areas: performance and security, network health, censorship resistance, and third-party integration compatibility[^2]. Financial reports reveal where the strategic weight sits, with US government funding falling from 53.5% in FY2021-22 to 35.08% in FY2023-24, a deliberate reduction of dependence on a single funder[^3]. State of the Onion, the online assembly, usually runs at the end of the year and is the most concentrated view of annual direction[^4].

The planning layer is at [gitlab.torproject.org/tpo](https://gitlab.torproject.org/tpo){target="_blank"}, where public projects are readable without an account. Each team's `team` meta project wiki holds roadmaps and meeting notes, the organization-wide sponsor list is on the Sponsors overview page in `tpo/team`[^5], the system administration team's annual roadmap is the most concretely readable of them[^6], and Arti's milestones are on issues tagged Roadmap in the group[^7]. Milestone endpoints require a login, and scheduled dates are not readable through the public API, so following the links embedded in each wiki is the way through.

## Current directions and active projects

The technical detail below is not a prerequisite for participating. To skip straight to what you can do, go to [how to start](#how-to-start). This section is for people who want to know where Tor is heading.

### An activity snapshot

Tor's GitLab holds more than two hundred projects with widely varying activity. A public API scan in June 2026 found roughly 252 non-archived projects, of which about 103 had activity within 30 days, with network-health the most active, followed by web, core, tpa, and applications[^8]. That is a snapshot. Sorting GitLab by `last_activity_at` gives the current state, and the numbers move.

### The technical threads

- **Three censorship-resistance projects.** WebTunnel disguises bridge traffic as ordinary HTTPS and was a critical tool in Russia during 2025. Snowflake uses volunteers' browsers as temporary WebRTC proxies and runs stably, covered in [Tor Snowflake](../tools/tor-snowflake.md). Conjure uses unused address space at ISPs to counter censors enumerating and blocking known proxy addresses, with a phased rollout planned from 2026[^9]
- **Arti**, the pure Rust rewrite. The client core, circuits, and onion services are stable, while relay and directory authority support are still in development, with no committed timeline for feature parity with the C implementation
- **Counter-Galois-Onion (CGO)**, new symmetric encryption addressing weaknesses in the old scheme where traffic could be tampered with and used to trace connections. It is marked experimental in Arti and will be enabled by default once testing completes
- **Tor VPN for Android**, built on Arti, in beta since September 2025 and marked experimental by the project, not suited to high-risk situations. iOS remains Orbot
- **Onion service usability and abuse resistance**, and the integration following Tails joining the Tor Project

### Reading the sponsors to see what will continue

Funding is the most reliable indicator of which directions persist. Some of the projects listed on the Sponsors overview[^5]:

| Sponsor | Direction | Relevance to a regional anonymity community |
|---|---|---|
| `S96` | Censorship circumvention for China, Hong Kong, and Tibet: new pluggable transports, harder-to-block bridges, improved bridge distribution | The most relevant, and precisely the regional question |
| `S112` | Countering malicious relays and improving network health: monitoring tools, operator codes of conduct, attack resistance | Corresponds to the measurement work |
| `S119` | Arti, the pure Rust implementation | The next technical foundation |
| `S150` | Retiring BridgeDB and migrating to the RDSys distribution system | Bridge distribution |
| `S101` | Tor VPN client for Android | Consumer product |
| `S131` | Mullvad Browser and Tor Browser refactoring | Browsers |

`S96` and `S112` overlap most with what this community works on: circumvention for readers in the region, and the reachability measurement we run.

## Official channels

Tor bridges IRC on the OFTC network with Matrix in both directions, so joining through Element or through IRC lands in the same channel[^10]. Note that this is Tor's own presence on `matrix.org`, separate from the `im.anoni.net` homeserver this community self-hosts.

| Channel | Purpose |
|---|---|
| `#tor` | User support |
| `#tor-dev` | Development, protocol, and code |
| `#tor-project` | Organizational and community matters, meetups, outreach |
| `#tor-relays` | The relay operator community |
| `#tor-l10n` | Translation and localization |
| `#tor-meeting` | Observing or joining publicly minuted team meetings |

Written discussion and announcements are on the [Tor Forum](https://forum.torproject.org/){target="_blank"}, and mailing lists are at [lists.torproject.org](https://lists.torproject.org/){target="_blank"}. Organizational matters go by email: non-profit business, trademark, and partnership coordination to <frontdesk@torproject.org>, speaker invitations to <speaking@torproject.org>, and security issues to <security@torproject.org>.

Before joining any of these, read Tor's [community policies and code of conduct](https://community.torproject.org/policies/){target="_blank"}.

## How to start

Ordered by how feasible each is for a regional community, with the local how-to noted where one exists:

1. **Localization.** The lowest barrier: no account review, no technical background, and an individual can start on Weblate immediately. It also happens to be where Traditional Chinese quality is decided. The process and Weblate links are in the Tor translation section of [localization and translation](./i18n.md), and first-time contributors should read [becoming a Tor translator](https://community.torproject.org/localization/becoming-tor-translator/){target="_blank"}
2. **Introduce yourself in `#tor-project` and the forum.** This is where meetups, outreach, and community matters happen, and where every formal connection begins
3. **Run a local meetup.** Tor's [outreach programme](https://community.torproject.org/outreach/){target="_blank"} provides a street team kit, slides, and material on running your own Tor meetup. It is explicitly encouraged and needs no approval. For a speaker, write to <speaking@torproject.org>
4. **Run a relay or a bridge.** Members with a machine and bandwidth can add to Asia-Pacific coverage. The technical steps are in [how to run a Tor relay](./setup-tor-relay.md), and for a bridge disguised as HTTPS, [setting up Tor WebTunnel](./setup-tor-webtunnel.md). Support happens in `#tor-relays` and on the tor-relays mailing list
5. **Development and bug reports.** For a GitLab account, [anonticket.torproject.org](https://anonticket.torproject.org/){target="_blank"} handles anonymous requests and reports, after which issues go on the relevant repository. Newcomers can start from issues tagged first-contributors, with technical discussion in `#tor-dev`
6. **Becoming a training partner.** Tor has a [training partners](https://community.torproject.org/training/partners/){target="_blank"} programme, which is the most formal arrangement between the project and an organization. It generally follows a track record built through the steps above, and works as a medium-term goal

## Where this community's work connects

- **Traditional Chinese documentation and terminology.** The community already maintains `zh_Hant` translation and terminology standards, and carrying that into Tor's Weblate is the most natural extension
- **Reachability measurement.** Pulse, the source behind the [Tor relay watcher](../regional/tor-relay-watcher.md), and the ASN coverage tooling behind [ASN observation data analysis](../regional/ooni-asn-coverage.md) correspond to the network-health team's work and to `S112`, and the results can be brought to that team's community sessions
- **Campus relays.** The [Tor relays on campus track](./relay-on-campus.md) follows from the Tor University Challenge, EFF's campaign with Tor Project involvement, and the first running case at National Taiwan Normal University (see [the interview](../blog/posts/ntnu-nz.md)) is a concrete result of connecting local advocacy back to the ecosystem

How these fit the community's annual rhythm is in the [2026 roadmap](./roadmap-2026.md). The community session of State of the Onion has an open call for community updates, which is where results like these get an international audience.

## :fontawesome-solid-diagram-project: Related

<div class="grid cards" markdown>

- [:material-translate-variant: Localization and translation](./i18n.md)
- [:simple-torproject: How to run a Tor relay](./setup-tor-relay.md)
- [:material-tunnel-outline: Setting up Tor WebTunnel](./setup-tor-webtunnel.md)
- [:material-hand-heart: How to contribute](./how-to-contribute.md)

</div>

[^1]: [Advancing digital rights in 2026](https://blog.torproject.org/advancing-digital-rights-in-2026/){target="_blank"}, The Tor Project Blog
[^2]: [The Tor Project's 2024 year in review](https://blog.torproject.org/2024-year-in-review/){target="_blank"}, The Tor Project Blog
[^3]: [The Tor Project financial reports for July 2023 to June 2024](https://blog.torproject.org/financials-blog-post-2023-2024/){target="_blank"}, The Tor Project Blog
[^4]: [State of the Onion 2025](https://blog.torproject.org/state-of-the-onion-2025/){target="_blank"}, The Tor Project Blog
[^5]: [tpo/team wiki: sponsors overview](https://gitlab.torproject.org/tpo/team/-/wikis/Projects/Sponsors-2023){target="_blank"}, Tor Project GitLab
[^6]: [tpo/tpa/team wiki: roadmap/2025](https://gitlab.torproject.org/tpo/tpa/team/-/wikis/roadmap/2025){target="_blank"}, Tor Project GitLab
[^7]: [Roadmap-tagged issues in the tpo group](https://gitlab.torproject.org/groups/tpo/-/issues/?label_name[]=Roadmap&state=opened){target="_blank"}, Tor Project GitLab
[^8]: [Tor Project GitLab public API](https://gitlab.torproject.org/api/v4/groups/tpo/projects?include_subgroups=true){target="_blank"}, activity snapshot of non-archived projects scanned in June 2026
[^9]: [Staying ahead of the censors in 2025](https://blog.torproject.org/staying-ahead-of-censors-2025/){target="_blank"}, The Tor Project Blog
[^10]: [Chat with the Tor community](https://support.torproject.org/get-in-touch/chat-with-us/){target="_blank"}, Tor Project Support
