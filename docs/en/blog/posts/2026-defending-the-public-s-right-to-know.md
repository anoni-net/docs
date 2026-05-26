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

    This post sits alongside Tor Project's spotlight series article on OONI. The body below summarises what the original covers and then maps the same workflow onto Sinophone Asia-Pacific — the section the original does not cover, and the main contribution of this post.

    **For the full narrative on Kenya's High Court case, Tanzania's follow-up litigation, Meduza's public-education framing, and the supporting cases from Egypt, Jordan, and India, please read the original:**

    - [Defending the public's right to know, by pavel, 2026-05-12](https://blog.torproject.org/Defending-the-right-to-know/){target="_blank"}

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/3/3c647fc332a9f5c49e81d7660d9d91f5e39e8b0b.png"
            alt="Visual header for the Tor Project 'Defending the free internet' spotlight series, featuring OONI"
            style="border-radius: 10px;">
    </a>
    <figcaption>Image source: <a target="_blank" href="https://blog.torproject.org/Defending-the-right-to-know/">Tor Project Blog</a>.</figcaption>
</figure>

<!-- more -->

## What the original post covers

[OONI](https://ooni.org/){target="_blank"} — the Open Observatory for Network Interference, born out of the Tor Project — turns internet censorship into a measurable, verifiable, and actionable public record. Since 2012 the dataset has accumulated billions of measurements across 245 countries and territories, contributed by anyone running [OONI Probe](https://ooni.org/install/){target="_blank"} on their networks. The methodology combines [open measurement specifications](https://github.com/ooni/spec/tree/master/nettests){target="_blank"}, peer review, expert feedback, and comparison against control measurements, so that "this is censored" claims can be tested rather than asserted.

Tor Project's post highlights three concrete patterns of use:

- **Newsrooms as public educators.** Russian exile outlet [Meduza](https://meduza.io/en){target="_blank"} [published an article in 2025 introducing OONI tools](https://meduza.io/cards/tsenzury-v-runete-vse-bolshe-kak-mozhno-otslezhivat-blokirovki){target="_blank"} and inviting readers to try them — censorship measurement as public education, not just reportable subject matter.
- **Expert-opinion evidence in public-interest litigation.** At the High Court of Kenya, OONI produced [a detailed research report](https://blog.bake.co.ke/wp-content/uploads/2025/05/HCCHRPET.276.2025-ICJ-v-CA-Internet-Shutdown-Case.pdf){target="_blank"} documenting Telegram blocking during the 2023 and 2024 KCSE national exams. [The petition was filed by a coalition](https://blog.bake.co.ke/2025/05/14/bake-6-other-organizations-challenge-internet-shutdowns-in-kenya-in-landmark-public-interest-case/){target="_blank"} including BAKE, ICJ Kenya, Paradigm Initiative, the Kenya Union of Journalists, Katiba Institute, the Law Society of Kenya, and CIPESA.
- **Regional precedent that travels.** Following the Kenya case, lawyers in Tanzania reached out to OONI for data on the local blocking of Twitter/X, prompting [a research report](https://ooni.org/post/2025-tanzania-blocked-twitter/){target="_blank"} that supported their legal challenge.

The post also walks through OONI Explorer's [thematic pages](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/){target="_blank"} and individual findings — [Zawia3 in Egypt](https://explorer.ooni.org/findings/99431807200){target="_blank"}, [12 news websites in Jordan](https://explorer.ooni.org/findings/101531332700){target="_blank"}, [The Wire in India](https://explorer.ooni.org/findings/667455800){target="_blank"} during the conflict with Pakistan — and frames open documentation as the basis for collective response. The full narrative is in [the original post](https://blog.torproject.org/Defending-the-right-to-know/){target="_blank"}; the rest of this article focuses on regional context the original does not cover.

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
