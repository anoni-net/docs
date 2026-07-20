---
date: 2026-06-26
authors:
    - anoni-net
categories:
    - Observation
    - OONI
    - Translated Article
slug: 2026-measuring-internet-censorship-challenges-trends-and-impact
summary: "Short companion post to OONI's piece on the challenges, trends, and impact of measuring Internet censorship. We summarise the original briefly and point English readers to it, then add regional context for Chinese-reading audiences in Taiwan, Mainland China, Hong Kong, Macau, Singapore, and Malaysia."
description: "Short companion post to OONI's piece on the challenges, trends, and impact of measuring Internet censorship. We summarise the original briefly and point English readers to it, then add regional context for Chinese-reading audiences in Taiwan, Mainland China, Hong Kong, Macau, Singapore, and Malaysia."
---

# Measuring Internet Censorship: Challenges, Trends, and Impact

!!! info ""

    **Editorial note:** This is a companion post for English-speaking readers. The original article, by Maria Xynou (OONI), was published on the [Internet Society Pulse blog](https://pulse.internetsociety.org/en/blog/2026/05/measuring-internet-censorship-challenges-trends-and-impact/){target="_blank"} and reposted on [OONI's blog](https://ooni.org/post/2026-measuring-internet-censorship-trends-challenges-impact/){target="_blank"}. Please read it there. anoni.net Docs is reposting a short summary here, alongside translations into [Traditional Chinese](https://anoni.net/docs/blog/2026/06/2026-measuring-internet-censorship-challenges-trends-and-impact/){target="_blank"} and [Simplified Chinese](https://anoni.net/docs/zh-cn/blog/2026/06/2026-measuring-internet-censorship-challenges-trends-and-impact/){target="_blank"}, plus a regional context section for readers in Chinese-reading regions.

## What the original article covers

Maria Xynou's post is a concise overview of how Internet censorship is becoming harder to measure, and what OONI's data shows about how it is evolving. The main points:

- **Censorship is rarely binary.** Confirming a block is not just "up" or "down". False positives are common, methods range from DNS manipulation and IP blocking to throttling and forged responses, and the same site may be blocked on one network but reachable on another.
- **OONI's approach.** Open measurement methodologies, control measurements, a probabilistic pipeline (OONI Pipeline v5) that classifies results as "blocked", "down", or "OK" with confidence estimates, and crowdsourced data from volunteers running [OONI Probe](https://ooni.org/install/){target="_blank"} on their local networks.
- **Seven evolving trends.** Globalization and normalization of censorship beyond the usual suspects, short-term targeted blocks around political events, long-term systemic suppression of marginalised communities, less transparent censorship in an encrypted web (TLS interference via DPI, no block pages), throttling and degraded service as subtler control, attacks on privacy technologies (encrypted DNS, ECH), and the rise of national intranets and allowlisting approaches.
- **Measurement enables advocacy.** OONI has been part of the [#KeepItOn campaign](https://www.accessnow.org/keepiton){target="_blank"} since 2016, and OONI data has supported legal and policy interventions in Gabon, Tanzania, Nepal, Togo, Mozambique, Pakistan, Kenya, and others.
- **Scale.** Over 3 billion measurements from 30,000 networks across 245 countries and territories since 2012, with tens of millions of new measurements added every month.

Please read the original for the full argument, all the supporting links, and the country-specific examples:

- [Measuring Internet Censorship: Challenges, Trends, and Impact](https://ooni.org/post/2026-measuring-internet-censorship-trends-challenges-impact/){target="_blank"} (OONI blog)
- [Same post on Internet Society Pulse](https://pulse.internetsociety.org/en/blog/2026/05/measuring-internet-censorship-challenges-trends-and-impact/){target="_blank"} (original publication)

<!-- more -->

## Why we are republishing this for Chinese-reading audiences

The forms of network interference described in OONI's post show up at very different intensities across the regions where our readership lives. The trends are familiar to anyone in Mainland China, but the framing in the original is mostly Western and global. Our two Chinese-language versions translate the full text, and the section below adds regional context that English-only readers may also find useful when interpreting OONI Explorer data for this part of the world.

## Regional Context: Chinese-reading Audiences

### Taiwan: a high-freedom baseline that still needs continuous measurement

Taiwan is generally considered a high-freedom Internet environment, which does not mean there is no network-layer interference at all. Long-term measurement through OONI Probe across Taiwanese fixed-line ISPs and mobile networks is what makes it possible to verify whether TLS interference, DNS manipulation, or selective blocks are present, and to evaluate the country's "digital resilience" claims with evidence rather than assumption. The community has already accumulated some baseline material on [Tor Relays observation](https://anoni.net/docs/taiwan/tor-relay-watcher/){target="_blank"} and [ASN coverage analysis](https://anoni.net/docs/taiwan/ooni-asn-coverage/){target="_blank"}, though the contributor base is still small relative to coverage needs.

Separately, Taiwan in recent years has seen network-layer blocking targeted at overseas scam, gambling, and unauthorised content platforms, typically implemented through cooperation between the police, the NCC, and ISPs. These measures have a plausible public-policy purpose, but the details, the blocklists, the false-positive disputes, and the remedy mechanisms are often not externally verifiable. The TLS interference, throttling, and encrypted-DNS blocking described in OONI's post are also tools adopted in democracies, which means the line between "legitimate enforcement" and "opaque censorship" needs to keep being examined. Independent measurement tools like OONI Probe are the critical infrastructure that makes that line verifiable in the first place.

### Mainland China: most of the phenomena described in the original have been the long-term baseline

The combination of methods catalogued in OONI's post, including DNS manipulation, IP blocking, TLS interference, encrypted DNS and ECH blocking, and movement toward allowlist-style national networks, has been the long-term baseline of network governance in Mainland China. OONI's long-term measurement data from the mainland is an important resource for researchers studying how this system has evolved. For readers based in the mainland, the original article is also a technical backdrop to the everyday experience of "why a tool that used to work just suddenly stops working".

### Hong Kong, Macau, Singapore, Malaysia and other Simplified Chinese reading regions

Network-layer intervention takes very different shapes across the regions where Simplified Chinese is widely read. Hong Kong has seen new network-layer blocks emerge since 2020, which OONI data can track over time. Macau is smaller in scale but shows similar signals. Singapore and Malaysia rely more on statutory takedowns and platform compliance, with comparatively limited network-layer interference. These differences are directly comparable in [OONI Explorer](https://explorer.ooni.org/){target="_blank"}, and the trends in the original article show up at very different intensities depending on jurisdiction.

A common risk assessment applies across all these regions: running OONI Probe generates traffic that can be observed by the network. In environments with heavier network surveillance, please read [OONI's risk page](https://ooni.org/about/risks/){target="_blank"} first. For readers in Mainland China specifically, reading the existing data on [OONI Explorer](https://explorer.ooni.org/){target="_blank"} is often a more proportionate starting point than running active measurements. For readers in lower-risk environments, contributing measurements directly helps fill the data-coverage gap that currently exists for Chinese-reading regions.
