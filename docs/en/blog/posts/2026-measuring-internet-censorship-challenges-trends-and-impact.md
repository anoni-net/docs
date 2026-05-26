---
date: 2026-06-26
authors:
    - toomore
categories:
    - Observation
    - OONI
    - Translated Article
slug: 2026-measuring-internet-censorship-challenges-trends-and-impact
summary: "OONI summarises several key trends in how Internet censorship is evolving globally: HTTPS encryption ironically making blocks less transparent, TLS interference and DPI spreading worldwide, throttling, national intranets, and how this measurement data supports digital rights advocacy. Republished here with added perspectives for readers in Taiwan, Mainland China, and other Simplified Chinese reading regions."
description: "OONI summarises several key trends in how Internet censorship is evolving globally: HTTPS encryption ironically making blocks less transparent, TLS interference and DPI spreading worldwide, throttling, national intranets, and how this measurement data supports digital rights advocacy. Republished here with added perspectives for readers in Taiwan, Mainland China, and other Simplified Chinese reading regions."
---

# Measuring Internet Censorship: Challenges, Trends, and Impact

!!! info ""

    **Editorial note:** This post is reproduced from [OONI's blog](https://ooni.org/post/2026-measuring-internet-censorship-trends-challenges-impact/){target="_blank"}, originally published by Maria Xynou on the [Internet Society Pulse blog](https://pulse.internetsociety.org/en/blog/2026/05/measuring-internet-censorship-challenges-trends-and-impact/){target="_blank"}. We are republishing it on anoni.net Docs because OONI's longitudinal data and the trends described here are highly relevant to readers in Chinese-reading regions, where network-layer interference takes very different forms across Mainland China, Hong Kong, Macau, Taiwan, Singapore, and Malaysia. We have also produced [Traditional Chinese](https://anoni.net/docs/zh-tw/blog/2026/06/2026-measuring-internet-censorship-challenges-trends-and-impact/){target="_blank"} and [Simplified Chinese](https://anoni.net/docs/zh-cn/blog/2026/06/2026-measuring-internet-censorship-challenges-trends-and-impact/){target="_blank"} versions, and added a regional context section at the end of this English version.

In short:

- Internet censorship is becoming more sophisticated, targeted, and harder to detect.
- OONI crowdsourced network measurement data enables research and supports advocacy and rapid response to Internet censorship events.
- OONI's longitudinal data reveals several key trends in how Internet censorship is evolving globally, including targeted, intermittent blocks for short-term control, and long-term blocks for systemic suppression.

<!-- more -->

Internet censorship is becoming more sophisticated and harder to detect, making transparency more urgent than ever.

Countries like [Russia](https://ooni.org/post/2024-russia-report/){target="_blank"} and [Kazakhstan](https://ooni.org/post/2024-kazakhstan-report/){target="_blank"} are blocking access to many independent news media, while [social media restrictions during elections and protests](https://ooni.org/reports/social-media-im/){target="_blank"} are increasingly common worldwide. Even democratic countries are expanding their censorship practices. For example, [Albania blocked TikTok](https://explorer.ooni.org/findings/274282914400){target="_blank"} last year, while [Spain has intermittently blocked parts of the web](https://www.techradar.com/vpn/vpn-privacy-security/la-ligas-war-on-piracy-is-breaking-the-internet-in-spain-and-your-vpn-could-be-the-next-target){target="_blank"} by targeting Cloudflare infrastructure used by LaLiga streaming sites.

Such cases are documented by the [Open Observatory of Network Interference (OONI)](https://ooni.org/){target="_blank"}, a nonprofit that hosts the [world's largest open dataset on Internet censorship](https://ooni.org/data/){target="_blank"}, compiled from crowdsourced measurements. This blog post briefly discusses the challenges of measuring Internet censorship, emerging censorship trends, and how Internet measurement powers advocacy for human rights.

## Challenges in Measuring Internet Censorship

Confirming Internet censorship is [rarely as simple](https://ramakrishnansr.com/assets/censorship-data-analysis.pdf){target="_blank"} as "up" or "down", blocked or not.

Many factors can make a service appear inaccessible even when it isn't intentionally restricted. A website on an unreliable server may be temporarily unavailable without any government interference, and users on unstable networks may struggle to access websites or apps. Even [DNS misconfigurations](https://ooni.org/post/not-quite-network-censorship/){target="_blank"} can prevent access, though they are unrelated to censorship.

[False positives](https://ooni.org/support/faq/#what-are-false-positives){target="_blank"} are common, and the challenge is compounded by the many ways censorship can be implemented, from Domain Name System (DNS) manipulation and IP blocking to subtler methods like throttling or injecting forged responses. A website may be accessible on one network but blocked on another, making widespread, decentralized testing essential for reliable conclusions.

[OONI](https://ooni.org/){target="_blank"} addresses these challenges by developing [open measurement methodologies](https://github.com/ooni/spec/tree/master/nettests){target="_blank"}, encouraging peer review and expert feedback, and by using control measurements for comparison. We also use a [probabilistic metric](https://docs.ooni.org/data/pipeline-design/){target="_blank"} to estimate the likelihood that a given resource is restricted within a specific network and time period. Implemented in the [OONI Pipeline v5](https://github.com/ooni/data){target="_blank"}, this approach compares measurements and applies heuristics to classify results as "blocked," "down," or "OK" with certain confidence estimates.

Measurements collected directly from local networks, rather than through remote testing, are especially valuable because they reflect how users actually experience censorship. When volunteers run tests based on content they encounter as blocked and within their local context, the data is more likely to capture sudden, context-specific censorship events.

This is how OONI works: people around the world run [OONI Probe](https://ooni.org/install/){target="_blank"} and contribute measurements from the networks they're connected to. [Data](https://ooni.org/data){target="_blank"} availability depends on what they choose to test, when, and where, so coverage varies widely across countries and even between networks within the same country. Uneven measurement coverage presents an important challenge, as detecting and confirming censorship reliably requires continuous data to increase confidence.

Censorship events often occur in high-risk situations, such as during anti-government protests, where testing carries real [risks](https://ooni.org/about/risks/){target="_blank"} for contributors, creating additional challenges for measurement and censorship detection. At OONI, we prioritize user safety and ensure that anyone contributing measurements provides [informed consent](https://ooni.org/support/ooni-probe-desktop#onboarding-informed-consent){target="_blank"}, which we obtain through a quiz in our [OONI Probe apps](https://ooni.org/install/){target="_blank"}.

## Emerging Trends in Internet Censorship

OONI's [longitudinal data](https://ooni.org/data){target="_blank"} reveals several key trends in how Internet censorship is evolving globally:

### Globalization and Normalization of Internet Censorship

Network-level censorship is no longer limited to countries like China or Iran. Today, nearly every country implements some form of censorship, though what is blocked, and the impact of those blocks, varies widely. Most countries now have both the technical infrastructure and legal frameworks to enforce network-level restrictions.

### Targeted, Intermittent Blocks for Short-term Control

Many governments deploy [temporary censorship during politically sensitive events](https://ooni.org/reports/social-media-im/){target="_blank"}, such as elections, protests, or conflicts. These blocks often target specific websites or apps, for example, [WhatsApp and Facebook were recently blocked in Uganda](https://explorer.ooni.org/findings/352623460000#social-media-blocks-following-ugandas-2026-general-election){target="_blank"} following the 2026 general election. Typically lasting from a few hours to several weeks, these short-term measures limit political and economic costs while allowing authorities to control public discourse and restrict information flow when it matters most.

### Long-term Blocks for Systemic Suppression

Lasting for years, long-term blocks are designed to enforce ideologies, policies, and laws on the Internet. Unlike short-term blocks that target specific sites or apps, these measures often restrict entire categories of content deemed legally or socially unacceptable. Such censorship frequently silences marginalized communities and reinforces the status quo. Examples include the [blocking of websites related to LGBTQI rights](https://ooni.org/post/2021-no-access-lgbtiq-website-censorship-six-countries/){target="_blank"}, [ethnic or religious minority groups](https://ooni.org/post/iran-internet-censorship/#human-rights-issues){target="_blank"}, and [reproductive rights](https://ooni.org/post/2019-blocking-abortion-rights-websites-women-on-waves-web/){target="_blank"}. In Tanzania, for example, [extensive blocks targeting LGBTQI-related content](https://ooni.org/post/2024-tanzania-lgbtiq-censorship-and-other-targeted-blocks/){target="_blank"} have been implemented following years of crackdowns on LGBTQI communities.

### Less Transparent Censorship in an Increasingly Encrypted Web

As more websites adopt HTTPS and encryption standards, censorship has become less visible. Traditional [block pages](https://ooni.org/support/glossary/#block-page){target="_blank"}, which inform users when access is intentionally restricted, are now less common. Instead, governments increasingly interfere with the Transport Layer Protocol (TLS) itself, often using advanced equipment such as Deep Packet Inspection (DPI) technology. OONI data [shows](https://ooni.org/reports/){target="_blank"} that TLS-based interference is being documented in many countries, reflecting the growing reach of the global censorship technology industry. With TLS interference, users typically encounter a generic connection error rather than a block page, making it difficult to distinguish intentional censorship from network failures or other technical issues. In this way, ironically, a more encrypted web can make censorship less transparent.

### Throttling and Degraded Service

Governments are increasingly using bandwidth throttling as a subtler form of control, limiting access to certain services without outright blocking them. This can slow messaging apps or other platforms, discouraging their use while leaving the connection technically intact. To investigate such cases, OONI developed a [methodology for measuring targeted throttling](https://github.com/ooni/probe-cli/blob/master/docs/design/dd-007-throttling.md){target="_blank"}, which was applied and validated through real-world investigations on cases in [Kazakhstan](https://ooni.org/post/2023-throttling-kz-elections/){target="_blank"}, [Russia](https://ooni.org/post/2022-russia-blocks-amid-ru-ua-conflict/#twitter-throttled){target="_blank"}, and [Türkiye](https://ooni.org/post/2025-turkiye-throttling-social-media/){target="_blank"}.

### Censorship Versus Privacy Technologies

Authorities are also targeting emerging privacy technologies. Iran, for example, has [blocked encrypted DNS](https://ooni.org/post/2022-iran-blocks-social-media-mahsa-amini-protests/#blocking-of-dns-over-https-doh){target="_blank"} since at least 2020, while [Russia blocked Encrypted Client Hello (ECH)](https://theins.ru/news/275980){target="_blank"} in November 2024. These measures make it harder for users to circumvent censorship while also reducing online privacy. In response, OONI developed new experiments to [measure ECH](https://github.com/ooni/spec/blob/master/nettests/ts-039-echcheck.md){target="_blank"} and [encrypted DNS](https://github.com/ooni/spec/blob/master/nettests/ts-028-dnscheck.md){target="_blank"}. These are integrated into [OONI Probe](https://ooni.org/install){target="_blank"}, with measurements published as [open data](https://ooni.org/data){target="_blank"} in real-time from around the world.

### Rise of National Intranets and Allowlisting Approaches

Some governments are moving toward highly controlled national networks. In countries like [Iran](https://www.kentik.com/blog/from-stealth-blackout-to-whitelisting-inside-the-iranian-shutdown/){target="_blank"}, [Russia](https://habr.com/ru/articles/997088/){target="_blank"}, and [Myanmar](https://www.article19.org/resources/unplugged-in-myanmar-internet-restrictions-following-the-military-coup/){target="_blank"}, authorities are experimenting with "allowlisting", limiting access to approved services or websites, and effectively creating walled-off portions of the Internet.

These trends demonstrate that Internet censorship is becoming more sophisticated, targeted, and harder to detect, highlighting the importance of continuous measurement and advocacy to safeguard online access and digital rights.

## From Measurement to Advocacy

Measuring networks enables us to observe how Internet traffic is handled in practice. Because censorship is often implemented at the network level, such measurements can reveal *what* is blocked, *how* it is blocked, *when* it occurs, and which network is responsible. This level of insight can provide evidence of censorship, making network measurement a powerful tool for advocacy aimed at defending an open Internet.

For this reason, OONI has been an active member of the [global #KeepItOn campaign](https://www.accessnow.org/keepiton){target="_blank"} since 2016, supporting hundreds of human rights organizations worldwide in using [OONI data](https://ooni.org/data/){target="_blank"} to advocate against Internet shutdowns. As a result, OONI data has supported advocacy efforts challenging social media blocks in numerous countries, including [Gabon](https://www.accessnow.org/press-release/keepiton-social-media-restore-access-in-gabon/){target="_blank"}, [Tanzania](https://www.accessnow.org/press-release/keepiton-tanzanian-authorities-and-meta-must-reverse-course-and-respect-human-rights/){target="_blank"}, [Nepal](https://www.accessnow.org/press-release/access-nows-statement-on-nepals-escalating-digital-repression-and-deadly-crackdown/){target="_blank"}, [Togo](https://www.accessnow.org/press-release/keepiton-togolese-authorities-must-uphold-human-rights-online-and-off-during-protests/){target="_blank"}, and [Mozambique](https://www.hrw.org/news/2024/11/06/mozambique-post-election-internet-restrictions-hinder-rights){target="_blank"}, as well as policy and legal interventions, such as High Court petitions in [Pakistan](https://web.archive.org/web/20190322194634/pakistantoday.com.pk/2019/03/21/submit-reply-or-face-contempt-ihc-tells-pta-chairman/){target="_blank"} and [Kenya](https://blog.bake.co.ke/wp-content/uploads/2025/05/HCCHRPET.276.2025-ICJ-v-CA-Internet-Shutdown-Case.pdf){target="_blank"}.

At the same time, the scale of OONI's dataset strengthens its value for advocacy. With [more than 3 billion measurements](https://explorer.ooni.org/){target="_blank"} collected from 30,000 networks across 245 countries and territories since 2012, [OONI data](https://ooni.org/data){target="_blank"} is the world's largest open dataset on Internet censorship of its kind. Every month, tens of millions of new measurements are collected from around 180 countries. Every day, new measurements from around the world are published in real-time.

OONI data is a [rich dataset](https://ooni.org/data){target="_blank"} waiting to be explored. Its breadth and depth enable research, while the real-time publication of measurements supports advocacy and rapid response efforts. It is regularly featured in [ISOC's Pulse Shutdown project](https://pulse.internetsociety.org/en/shutdowns/){target="_blank"} to document social media blocks worldwide, and you can use it too. [Get involved](https://ooni.org/get-involved/){target="_blank"} and help defend a free and open Internet.

## Regional Context: Chinese-reading Audiences

The forms of network interference described in this post show up very differently across the regions where our readership lives. Three short notes for context.

### Taiwan: a high-freedom baseline that still needs continuous measurement

Taiwan is generally considered a high-freedom Internet environment, which does not mean there is no network-layer interference at all. Long-term measurement through OONI Probe across Taiwanese fixed-line ISPs and mobile networks is what makes it possible to verify whether TLS interference, DNS manipulation, or selective blocks are present, and to evaluate the country's "digital resilience" claims with evidence rather than assumption. The community has already accumulated some baseline material on [Tor Relays observation](https://anoni.net/docs/zh-tw/taiwan/tor-relay-watcher/){target="_blank"} and [ASN coverage analysis](https://anoni.net/docs/zh-tw/taiwan/ooni-asn-coverage/){target="_blank"}, though the contributor base is still small relative to coverage needs.

Separately, Taiwan in recent years has seen network-layer blocking targeted at overseas scam, gambling, and unauthorised content platforms, typically implemented through cooperation between the police, the NCC, and ISPs. These measures have a plausible public-policy purpose, but the details, the blocklists, the false-positive disputes, and the remedy mechanisms are often not externally verifiable. The TLS interference, throttling, and encrypted-DNS blocking described in this post are also tools adopted in democracies, which means the line between "legitimate enforcement" and "opaque censorship" needs to keep being examined. Independent measurement tools like OONI Probe are the critical infrastructure that makes that line verifiable in the first place.

### Mainland China: most of the phenomena described here have been the long-term baseline

The combination of methods catalogued in this post, including DNS manipulation, IP blocking, TLS interference, encrypted DNS and ECH blocking, and movement toward allowlist-style national networks, has been the long-term baseline of network governance in Mainland China. OONI's long-term measurement data from the mainland is an important resource for researchers studying how this system has evolved. For readers based in the mainland, this post is also the technical backdrop to the everyday experience of "why a tool that used to work just suddenly stops working".

### Hong Kong, Macau, Singapore, Malaysia and other Simplified Chinese reading regions

Network-layer intervention takes very different shapes across the regions where Simplified Chinese is widely read. Hong Kong has seen new network-layer blocks emerge since 2020, which OONI data can track over time. Macau is smaller in scale but shows similar signals. Singapore and Malaysia rely more on statutory takedowns and platform compliance, with comparatively limited network-layer interference. These differences are directly comparable in [OONI Explorer](https://explorer.ooni.org/){target="_blank"}, and the trends described in this post show up at very different intensities depending on jurisdiction.

A common risk assessment applies across all these regions: running OONI Probe generates traffic that can be observed by the network. In environments with heavier network surveillance, please read [OONI's risk page](https://ooni.org/about/risks/){target="_blank"} first. For readers in Mainland China specifically, reading the existing data on [OONI Explorer](https://explorer.ooni.org/){target="_blank"} is often a more proportionate starting point than running active measurements. For readers in lower-risk environments, contributing measurements directly helps fill the data-coverage gap that currently exists for Chinese-reading regions.
