---
date: 2026-06-12
authors:
    - toomore
categories:
    - Perspective
    - OONI
    - Tor
    - Translated Article
slug: 2026-defending-the-public-s-right-to-know
image: "https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png"
summary: "Tor Project's spotlight series profiles OONI's public record of internet censorship: billions of measurements from 245 countries since 2012, used as expert-opinion evidence at the High Court of Kenya, followed by lawyers in Tanzania, and surfaced to readers by Russian exile outlet Meduza. The anoni.net community appends a Sinophone Asia-Pacific reading, mapping the same documentation logic onto mainland China, Hong Kong, Taiwan, Singapore, Malaysia, Macau, and overseas Sinophone users."
description: "A Sinophone Asia-Pacific reading of Tor Project's OONI spotlight: how the same open-measurement workflow that worked in Kenya and Tanzania maps onto mainland China, Hong Kong, Taiwan, Singapore, Malaysia, Macau, and diaspora communities."
---

# Defending the Public's Right to Know: A Sinophone Asia-Pacific Reading of OONI in Practice

!!! info ""

    This article reprints the Tor Project blog post in its "Defending the free internet" spotlight series, then appends a Sinophone Asia-Pacific reading from the anoni.net community.

    - Original: [Defending the public's right to know, by pavel, 2026-05-12](https://blog.torproject.org/Defending-the-right-to-know/){target="_blank"}

    The original post describes how OONI's public dataset is used by journalists, courts, and human rights coalitions globally. The Sinophone Asia-Pacific section below maps the same workflow onto regional cases mainland China, Hong Kong, Taiwan, Singapore, Malaysia, Macau, and overseas Sinophone users — material the original post does not cover.

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png"
            alt="Visual header for the Tor Project 'Defending the free internet' spotlight series, featuring OONI"
            style="border-radius: 10px;">
    </a>
    <figcaption>Image source: <a target="_blank" href="https://blog.torproject.org/Defending-the-right-to-know/">Tor Project Blog</a>.</figcaption>
</figure>

This post is part of a spotlight series on the organizations defending the free internet.

Internet freedom has declined for [15 consecutive years](https://freedomhouse.org/article/new-report-persistent-authoritarian-repression-and-backsliding-democracies-drive-15th){target="_blank"}. Beyond surveillance, the erosion of privacy and anonymity, and information manipulation, governments are targeting specific sites and services, or attacking infrastructure itself, causing shutdowns and deliberate disruptions for internet users. But how do we know when the internet is censored and how?

[OONI](https://ooni.org/){target="_blank"}, the Open Observatory for Network Interference, born out of the Tor Project, exists to answer that question. Through [free software tools](https://ooni.org/install/){target="_blank"} and [open data](https://ooni.org/data/){target="_blank"} OONI makes censorship measurable, verifiable, and actionable. This post is about what that looks like in practice.

<!-- more -->

## Protecting the public record

OONI data is the [world's largest open dataset on internet censorship](https://explorer.ooni.org/){target="_blank"}: billions of measurements collected across tens of thousands of networks from 245 countries and territories since 2012. OONI's data exists because people around the world run [OONI Probe](https://ooni.org/install/){target="_blank"} and contribute measurements from the networks that they are connected to. Every new measurement adds to a shared public record.

Both its scale and methodology contribute to OONI's impact. Internet censorship often works by making interference hard to see. It can make a blocked website look broken, a throttled app look unreliable, or a shutdown look like a technical failure. OONI helps expose these tactics through [open measurement methodologies](https://github.com/ooni/spec/tree/master/nettests){target="_blank"}, peer review, expert feedback, and comparison against control measurements, so that censorship claims can be tested, challenged, and verified.

To make this dataset user-friendly, OONI launched [thematic pages in OONI Explorer](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/){target="_blank"} focusing on the areas most frequently targeted: social media and messaging apps, news media, and circumvention tools. Each page includes short reports, longer research reports, and charts with the latest OONI data.

In 2025, a dedicated "[Blocking of News Media](https://explorer.ooni.org/news-media){target="_blank"}" page helped surface findings that would otherwise require sifting through billions of raw measurements: the [blocking of the independent media outlet Zawia3](https://explorer.ooni.org/findings/99431807200){target="_blank"} in Egypt, the [blocking of 12 news media websites](https://explorer.ooni.org/findings/101531332700){target="_blank"} in Jordan, and the [blocking of The Wire in India](https://explorer.ooni.org/findings/667455800){target="_blank"} during the military conflict with Pakistan.

Think about [when censorship events tend to happen](https://ooni.org/reports/){target="_blank"}: elections, protests, armed conflict, national exams, and periods of political unrest. The moment when access to information matters most. OONI gives affected communities a shared factual basis at those moments to make accountability possible.

## How journalists and media organizations use OONI

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/0/034a6f0033d426dfc46e0fcfefb03e858f04b155.jpeg" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/0/034a6f0033d426dfc46e0fcfefb03e858f04b155.jpeg"
            alt="OONI Explorer screenshot showing blocking of news site dw.com in Russia, China, and Iran"
            style="border-radius: 10px;">
    </a>
    <figcaption>OONI Explorer screenshot showing the blocking of dw.com in Russia, China, and Iran. Image source: <a target="_blank" href="https://blog.torproject.org/Defending-the-right-to-know/">Tor Project Blog</a>.</figcaption>
</figure>

In 2025, [Meduza](https://meduza.io/en){target="_blank"}, one of the most prominent Russian media outlets in exile, [published an article introducing OONI tools](https://meduza.io/cards/tsenzury-v-runete-vse-bolshe-kak-mozhno-otslezhivat-blokirovki){target="_blank"} and encouraging readers to use them. It's just one example of how a newsroom can effectively use censorship measurement not just to report a story, but as an act of public education: helping audiences understand how network interference works, how it can be documented, and how they can contribute to that evidence base themselves.

When a news website is blocked, that's not just a technical event. It's the public losing access to reporting, communities losing access to timely information, and journalists losing access to their audiences. Documentation that can be cited and analyzed is what turns that event into something actionable.

The most concrete example of that chain in action is Kenya. OONI data served as evidence in a public-interest case challenging the unlawful disruption of internet access. [The case was filed by a coalition](https://blog.bake.co.ke/2025/05/14/bake-6-other-organizations-challenge-internet-shutdowns-in-kenya-in-landmark-public-interest-case/){target="_blank"} that included BAKE, ICJ Kenya, Paradigm Initiative, the Kenya Union of Journalists, Katiba Institute, the Law Society of Kenya, and CIPESA. To support the petition before the High Court of Kenya, OONI produced [a detailed research report, in the form of an expert opinion](https://blog.bake.co.ke/wp-content/uploads/2025/05/HCCHRPET.276.2025-ICJ-v-CA-Internet-Shutdown-Case.pdf){target="_blank"}, documenting the blocking of Telegram during Kenya's 2023 and 2024 KCSE national exams.

This is a case where a journalists' union, digital rights organizations, legal advocates, and technical researchers were able to work from the same datasets to elevate internet disruption to a public-interest issue. The case also helped set an important regional precedent: lawyers in Tanzania subsequently reached out to OONI for data to support legal efforts challenging the blocking of Twitter/X there, prompting OONI to publish [a research report documenting the block](https://ooni.org/post/2025-tanzania-blocked-twitter/){target="_blank"}.

## Collective action for a collective internet

The Kenya-to-Tanzania ripple effect illustrates how internet censorship works across geographies, and how it can be fought back. A block on messaging apps isn't a standalone event. Journalists may lose access to sources. Activists may lose organizing channels. [Circumvention tool developers may need to adapt](https://blog.torproject.org/fighting-censorship-with-webtunnel/){target="_blank"}. Researchers may need to verify what happened. Lawyers may need evidence. But everyone needs documentation.

OONI's [open data](https://ooni.org/data/){target="_blank"} model is built for exactly these moments. Protecting the free internet requires documenting censorship, sharing evidence, and building the collective capacity to respond.

## Sinophone Asia-Pacific: the same workflow, six regional readings

Tor Project's post focuses on Kenya, Tanzania, Egypt, Jordan, India, and Russian exile media. The same documentation logic — open measurement, peer-reviewed methodology, public dataset, expert-opinion reporting — applies across Sinophone Asia-Pacific, but the legal-advocacy environments diverge sharply.

- **Mainland China**: OONI Probe users continuously upload measurements from Chinese networks, producing one of the most consistent public records of Great Firewall behavior — blocks of social media, news outlets, messaging apps, and circumvention tools. The legal path Kenya demonstrates is largely unavailable inside mainland China itself. The documentation matters as evidence in international forums, academic research, and reporting by overseas media. Running OONI Probe in mainland China carries political risk for individuals, which is part of why coverage is uneven across ASNs.
- **Hong Kong**: Since 2020, blocks of overseas Hong Kong–related news sites, civic-organization sites, and circumvention infrastructure have surfaced repeatedly. OONI measurements provide third-party verifiable records, useful for international advocacy reports, human rights documentation, and journalism by exile media.
- **Taiwan**: The anoni.net community maintains an [ASN coverage analysis for OONI data in Taiwan](https://anoni.net/docs/zh-tw/taiwan/ooni-asn-coverage/){target="_blank"} (zh-TW page, en version pending), surfacing which Taiwanese ISPs and mobile carriers have measurement coverage and which remain blind spots. Taiwan does not face Great Firewall–style blocking, but ISP-level disruptions, undersea cable incidents, and election-period anomalies all benefit from continuous independent measurement. The Kenya expert-opinion workflow is also directly applicable to public-interest litigation in Taiwan's functioning court system.
- **Singapore and Malaysia**: Targeted blocks of specific news sites and political content periodically appear and are documented by OONI's regional measurements. Local press-freedom and digital-rights organizations have used these measurements in advocacy reports.
- **Macau**: Less independently studied than Hong Kong, but the regulatory environment increasingly mirrors mainland practice. Independent measurement matters as a benchmark for tracking change over time.
- **Overseas Sinophone users**: Cross-border circumvention work, anti-censorship reporting, and human rights documentation rely on OONI's data when sourcing claims about specific blocks. Kenya's expert-opinion model offers a template for how technical research organizations can serve legal proceedings in jurisdictions with functioning courts.

The reach of OONI's open data is uneven across the Sinophone region. Closing that gap depends on more users — across more ASNs — running OONI Probe, and on more cross-disciplinary collaboration between journalists, researchers, lawyers, and civil society organizations.

## What you can do

- **General readers**: [Install OONI Probe](https://ooni.org/install/){target="_blank"} and run a measurement to put your network on the public record. If you notice a website you visit hasn't been tested, submit it through OONI's [test list editor](https://test-lists.ooni.org/login){target="_blank"}.
- **Researchers and technical communities**: Compare your network or testbed against existing ASN coverage gaps, evaluate which measurements you can add, and package the results as minimal, repeatable artifacts that others can cite.
- **Journalists, editors, and human rights lawyers**: When reporting on or litigating blocks in mainland China, Hong Kong, Myanmar, Vietnam, or other Sinophone-adjacent jurisdictions, [OONI Explorer](https://explorer.ooni.org/){target="_blank"} measurement charts, findings reports, and full research reports are publicly citable evidence. For public-interest litigation, Kenya's case shows the workflow for requesting an expert opinion report from OONI.

## Related reading

- [Internet Freedom](../../basics/internet-freedom.md): why the broader internet freedom frame matters for measurement infrastructure
- [onionoo MCP: Tor relay query service](../../community/onionoo-mcp.md): a related tool the anoni.net community runs for Tor network observation
- [Financial Companies as Censors: A Sinophone Asia-Pacific Reading](./2026-financial-companies-as-censors.md): the same "global anchor + Sinophone Asia-Pacific reading" format applied to financial censorship
