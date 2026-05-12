---
title: Why networked freedom matters
description: The East Asia and Southeast Asia regional framing for Internet freedom, anonymity, and surveillance — with anoni.net's three observation axes.
icon: material/chat-question
---

# :material-chat-question: Why networked freedom matters

**Networked freedom** here means whether people can, free of undue interference, reach the information they need, speak in public, and choose tools and connection paths they trust. It overlaps with anonymity, privacy, and circumvention, but the emphasis differs from each.

This page explains how anoni.net thinks about the concept, and why it is worth tracking specifically across the Sinophone Asia-Pacific region.

!!! info "About this site"

    anoni.net is a volunteer community based in Taiwan. We discuss networked freedom as a regional question, with Taiwan as one example among several. The site covers Mainland China, Hong Kong & Macau, Singapore, Malaysia, Taiwan, and the diaspora. Region-specific situations differ — readers should weigh the framing here against local conditions on the ground.

## How we think about it: three layers

Networked freedom is rarely contested at one layer alone. We frame it in three:

**The connection layer.** Whether you can reach the services you want, using tools you trust, without leaving traces that identify you. This is the layer where the Great Firewall, ISP-level filtering, deep packet inspection, and Tor / OONI / Snowflake circumvention work all live. Most measurement on this site is connection-layer measurement.

**The personal-data and identity layer.** Whether you can know where data about you flows, who holds it, on what timeline it can be deleted, and to what extent you can influence those answers. Real-name infrastructure (Singpass, iAMSmart, mainland Chinese phone-ID binding), platform takedown rules, electronic-identity expansion, and data-protection law (Taiwan's PDPA 2025, comparable frameworks regionally) all sit here.

**The financial-flow layer.** Whether a payment can be made without unnecessarily binding the transaction to a real-name identity, a long retention window, and cross-institution correlation. Card payments leak more behavioral metadata than messages do; regulating that metadata is increasingly contested. Taiwan's [VASP Act 2026](../regional/index.md) is one regional case; Singapore's banking-Singpass integration is another shape.

These three layers are how the site is organized, and how the [Regional Observatory](../regional/index.md) is structured.

## East Asia

Mainland China's Great Firewall has, for two decades, filtered international websites and services and shaped a domestic platform environment under political, religious, and social-issue content controls[^1]. The technical export of these systems is a regional story, not a single-country story. The 2025 InterSecLab leak of Geedge Networks and MESA Lab materials documents this most clearly[^2]. North Korea operates at a more extreme position: the general public is largely cut off from the global Internet, with access mostly limited to the domestic Kwangmyong intranet[^3].

Hong Kong's environment changed substantially after the 2020 National Security Law. Civic-space contraction, expansion of electronic identity (iAMSmart) and its integration with HKID, and a string of cases against journalists and platform users continue to shape the local picture[^4]. Macau follows a parallel-but-quieter trajectory.

Conditions across the region vary widely. Even in jurisdictions counted as relatively open (Taiwan being one Sinophone example[^10]), practitioners still face cross-border platform governance, information-security and political-influence operations, and legal and reputational pressure on journalism and advocacy. The Freedom House [Freedom on the Net](https://freedomhouse.org/explore-the-map){target="_blank"} country chapters are useful for year-on-year comparison.

<figure markdown="span">
    <a href="https://freedomhouse.org/explore-the-map" target="_blank">
        <img src="../../assets/images/freedom_house_explore_the_map.png"
            alt="Freedom House — Freedom on the Net interactive map"
            title="Freedom House — Freedom on the Net interactive map"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>Freedom House — Freedom on the Net interactive map (illustrative snapshot; live data and country chapters on freedomhouse.org)</capture>
</figure>

## Southeast Asia

Vietnam has, over the past decade, escalated demands on international platforms to remove politically critical content, with parallel domestic enforcement against bloggers and journalists[^5]. Indonesia uses Permenkominfo 5/2020 and related rules to compel platform registration and content takedown, with periodic blocking of categories such as gaming, payment, and adult-content services[^6]. Malaysia has both blocked investigative reporting outlets and brought charges against bloggers; the regulatory regime around online content is in active flux[^7]. The Philippines, particularly during election periods, has seen sustained pressure on independent media and online speech, including the prolonged legal pursuit of Rappler[^8]. Thailand continues to enforce Section 112 of the criminal code (lèse-majesté), with very long sentences for online speech about the monarchy[^9].

Myanmar after the February 2021 coup is the regional extreme: repeated nationwide and rolling Internet shutdowns, social-platform blocks, prosecutions of independent journalists, and use of Internet outages as a tool of suppression[^11].

These are not equivalent regimes. They sit on a spectrum, and movement on the spectrum can be rapid. The point of tracking them together is that the Sinophone diaspora moves between them, the platforms operating in them are largely the same, and the technical infrastructures (DPI vendors, real-name systems, payment networks) increasingly cross borders.

## What we measure and how

Open, verifiable measurement makes regional framing concrete. [OONI](https://ooni.org/){target="_blank"} runs volunteer-driven probes that expose website and circumvention-tool reachability as charts and open data. The chart below is illustrative; current data and country selections are on [OONI Explorer](https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW){target="_blank"}.

<figure markdown="span">
    <a href="https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW" target="_blank">
        <img src="../../assets/images/ooni_chart_circumvention.png"
            alt="OONI Explorer — circumvention tools (CN, HK, TW illustrative)"
            title="OONI Explorer — circumvention tools (CN, HK, TW illustrative)"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>OONI Explorer — circumvention-tool reachability across CN, HK, TW (illustrative; live data on the OONI site)</capture>
</figure>

[Tor](https://www.torproject.org/){target="_blank"} provides anonymous, multi-hop routing and a relay-and-bridge network that helps users maintain connection in high-pressure environments. The relay network is a decentralized volunteer infrastructure, and Tor Metrics exposes per-country relay and guard counts.

<figure markdown="span">
    <a href="https://metrics.torproject.org/rs.html#search/country:tw" target="_blank">
        <img src="../../assets/images/tor_relay_tw.png"
            alt="Tor Metrics — Taiwan-region relays and guard nodes"
            title="Tor Metrics — Taiwan-region relays and guard nodes"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>Tor Metrics — Taiwan-region relays and guard nodes (the Sinophone-region anchor where this community works; illustrative snapshot)</capture>
</figure>

Beyond consuming this data, anoni.net runs the [Pulse](https://github.com/anoni-net/docs/tree/main/pulse){target="_blank"} system to track Tor relay distribution across Taiwan, Hong Kong, Japan, and South Korea, and the [ASN coverage](https://github.com/anoni-net/docs/tree/main/asn_coverage){target="_blank"} tooling to map OONI observation completeness across regional autonomous systems. Both are intended to feed the cross-region comparisons being assembled on the [Regional Observatory](../regional/index.md), which is in active drafting.

## Where to go from here

- [Regional observatory](../regional/index.md) — the empirical work and country-by-country observations
- [LGBTQ+ scenarios](../scenarios/lgbtq.md) — a worked-through showcase of how regional framing applies to one population
- [About anoni.net](../about/index.md) — how the community works and how to collaborate
- [OONI Explorer](https://explorer.ooni.org/){target="_blank"} and [Tor Metrics](https://metrics.torproject.org/){target="_blank"} — go directly to the upstream measurement portals

[^1]: [Great Firewall — Wikipedia](https://en.wikipedia.org/wiki/Great_Firewall){target="_blank"}, with extensive sourced citations to academic and journalistic accounts.
[^2]: [Inside China's Surveillance Industry: Leaked Files Show How Beijing's Internet Crackdown Tools Are Built and Sold Abroad](https://www.amnesty.org/en/latest/news/2025/09/the-great-firewall-comes-to-life-in-leaked-document/){target="_blank"} — Amnesty International coverage of the InterSecLab Geedge / MESA leak (September 2025).
[^3]: [North Korea's Kwangmyong intranet](https://en.wikipedia.org/wiki/Kwangmyong_(network)){target="_blank"} — Wikipedia overview with sourced references; see also [38 North](https://www.38north.org/){target="_blank"} for ongoing analysis.
[^4]: [Hong Kong: World Report 2024 — Human Rights Watch](https://www.hrw.org/world-report/2024/country-chapters/china/hong-kong){target="_blank"}.
[^5]: [Vietnam: World Report 2024 — Human Rights Watch](https://www.hrw.org/world-report/2024/country-chapters/vietnam){target="_blank"}.
[^6]: [Indonesia's Online Crackdown — Article 19 analysis of Permenkominfo 5/2020](https://www.article19.org/resources/indonesia-the-impacts-of-permenkominfo-5-2020/){target="_blank"}.
[^7]: [Malaysia: World Report 2024 — Human Rights Watch](https://www.hrw.org/world-report/2024/country-chapters/malaysia){target="_blank"}.
[^8]: [Philippines: Press freedom and the prosecution of Rappler — Reporters Without Borders](https://rsf.org/en/country/philippines){target="_blank"}.
[^9]: [Thailand: Lèse-majesté prosecutions — Human Rights Watch](https://www.hrw.org/asia/thailand){target="_blank"}.
[^10]: [Freedom House — Taiwan country page (Freedom on the Net)](https://freedomhouse.org/country/taiwan/freedom-net/2024){target="_blank"}; year and URL change with each edition.
[^11]: [Myanmar: Internet shutdowns and crackdown on independent media after the 2021 coup — Human Rights Watch](https://www.hrw.org/world-report/2024/country-chapters/myanmar){target="_blank"}.
