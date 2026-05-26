---
date: 2026-05-23
authors:
    - toomore
categories:
    - News
    - Translated Article
slug: report-madlink
image: "https://interseclab.org/wp-content/uploads/2026/04/MADLink-A-Taiwanese-Vestige-in-the-Geedge-Suply-Chain.jpg"
summary: "InterSecLab's MADLink report (April 2026) traces 1,708 CSA-7400 appliances from Taiwan-listed ADLINK Technologies through Geedge Networks to a national-grade censorship system in Kazakhstan. The anoni.net community has finished the Mandarin (zh-TW) translation and, unlike the previous Internet Coup release, added an editorial observation page mapping how Taiwan's media, government, and legislators have received the report (English summary included)."
description: "MADLink's Mandarin (zh-TW) translation is live. New this round: an editorial observation page documenting Taiwan's largely silent response to a report that named a publicly listed Taiwanese company — with an English summary for international readers."
---

# MADLink (Mandarin Translation) is Live, with an Editorial Observation Page on Taiwan's Response

![MADLink report cover](https://interseclab.org/wp-content/uploads/2026/04/MADLink-A-Taiwanese-Vestige-in-the-Geedge-Suply-Chain.jpg){style="border-radius:10px;"}

A publicly listed Taipei-traded company shipped 1,708 CSA-7400 high-density network platforms to a Chinese customer between 2019 and 2020. Those appliances ended up in Kazakhstan running a national-grade internet censorship and surveillance system. The supplier was ADLINK Technologies (TWSE: 6166), the customer was Geedge Networks, and the system they ran was the flagship Tiangou Secure Gateway (TSG), an offering whose capabilities rival China's Great Firewall.

That is the central finding of [MADLink: A Taiwanese Vestige in the Geedge Supply Chain](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"}, InterSecLab's April 2026 report and the first follow-up to their September 2025 [The Internet Coup](https://interseclab.org/research/the-internet-coup/){target="_blank"}. The anoni.net community has completed the Mandarin (Taiwan terminology, zh-TW) translation. Unlike the previous Internet Coup release, this round also ships an **editorial observation page** mapping how Taiwan's media, government, and legislators have received the report — with an English summary written for international readers.

<!-- more -->

## What the report found

Between 2019 and 2020, ADLINK shipped 1,708 CSA-7400 appliances to Geedge. They formed the hardware foundation of Geedge's first-generation firewall platform, deployed in Kazakhstan to enable national-scale internet censorship and surveillance. CSA-7400 is a 4U high-density platform that ADLINK itself markets for deep packet inspection (DPI) and firewall workloads.

ADLINK hardware also turned up inside EtherFabric — a custom-built network packet broker (NPB) that Geedge deploys in Myanmar to load-balance traffic across multiple TSG nodes. A MAC address recovered from leaked documents traces back to ADLINK, showing ADLINK's footprint in Geedge's product line goes beyond the single CSA-7400 transaction.

Geedge's current-generation TSG hardware (deployed in Ethiopia, Pakistan, and Myanmar) is built on Nettrix servers (a subsidiary of US-sanctioned Sugon) with Inspur storage. These are commodity x86 components, sourceable on the grey market even where direct procurement is restricted. The report's argument: purpose-built surveillance hardware like the CSA-7400 and the ADLINK components inside EtherFabric is exactly where export controls have the most leverage, in contrast to commodity servers.

## The Mandarin translation: reading path

The full translation lives here: [MADLink / A Taiwanese Vestige in the Geedge Supply Chain (zh-TW)](https://anoni.net/docs/reports/interseclab-madlink/){target="_blank"} (Mandarin translation maintained in zh-TW only).

The original report is a single long web page. The translation team split it into 5 chapters so that Matrix discussions can map to specific sections:

* Chapter 1/5: Executive Summary, What We Found, Why It Matters
* Chapter 2/5: Geedge supply chain deep dive (three generations of TSG hardware)
* Chapter 3/5: EtherFabric and ADLINK's role and response
* Chapter 4/5: Conclusion
* Chapter 5/5: Appendix (ADLINK and MOEA full statements)

ADLINK's full reply to InterSecLab is preserved verbatim in the appendix so readers can compare both sides directly.

## What's new this round: the editorial observation page

For The Internet Coup, our work ended with a faithful translation. MADLink names a publicly listed Taiwanese company, which would normally trigger the expected loop of local press follow-up, legislative questioning, and a regulator response. As of 2026-05-20, Taiwan's Chinese-language public sphere has stayed noticeably quiet. That silence is itself observation material, so we added a separate page: [Editorial observation: Taiwan's response to MADLink](https://anoni.net/docs/reports/interseclab-madlink/index_6/#English-summary-for-international-readers){target="_blank"}.

This page is explicitly an anoni.net editorial work, not part of the InterSecLab report. It has five sections:

**Independent verification:** Before recording the local reception, we ran reproducible verification on the report's key claims — the IEEE OUI `00:30:64` resolving to ADLINK on two independent lookup services (macvendors / macvendorlookup), ADLINK's own product page marketing the CSA-7400 for DPI / IDS/IPS / NGFW, Geedge (Hainan) Information Technology Co., Ltd. being founded by Fang Binxing in 2018 (cross-confirmed by Chinese Wikipedia, Epoch Times, and NTD), and the New Bloom Magazine April 2026 article's existence and date.

**Coverage map:** International / English coverage is present (InterSecLab original, New Bloom Magazine, cybernews, and others). Taiwan Chinese-language coverage is substantively absent — major outlets (UDN, Liberty Times, CNA, TVBS, TechNews, iThome) had no direct reporting on this angle as of 2026-05-16. Legislator Puma Shen, quoted in the original report, has not followed up publicly.

**Why Taiwan has been quiet:** Five observed factors, offered as hypotheses rather than verdicts — high technical barrier for general-audience journalists, domestic infosec media focusing on enterprise security rather than human-rights export controls, the September 2025 leak news cycle having cooled by April 2026, neither political camp having upside in amplifying the story, and Taiwan's civil-society attention focusing elsewhere.

**Indicators to watch:** Grouped by government / media / civil society, with concrete entry points (URLs for the MOEA strategic high-tech export entity list, Legislative Yuan IVOD and proceedings systems, the Market Observation Post System under stock code 6166, and Control Yuan corrective measures) plus a four-tier execution table (Google Alerts, manual checks, RSS / HTML diff bots, scheduled scrapers) so contributors of different technical means can pick a level that fits.

**English summary for international readers:** The complete English version, so readers connecting from outside Taiwan can follow the local reception context without going through the Chinese sections.

## Why we wrote this page

MADLink's central question — whether Taiwan's export control framework can prevent local companies from supplying surveillance and censorship technology to vendors serving authoritarian governments — does not get answered by an English report alone. It needs local journalism, legislative questioning, and civil-society advocacy to follow up before regulators face real pressure to update the framework.

When that loop has not started, documenting the current state of reception is itself a form of relay. As substantive developments arrive (media starting to follow the thread, legislators raising the issue publicly, ADLINK filing a material announcement, or the MOEA updating the framework), the editorial observation page will be updated inline with date stamps and synced through Matrix.

## Acknowledgements and how to join

Thanks to InterSecLab for continuing this investigative series, and to community members who contributed to translation and the editorial observation write-up.

Both reports (The Internet Coup and MADLink) share the same Matrix discussion channel:

* :material-chat-processing-outline: <https://matrix.to/#/#interseclab-the-internet-coup:im.anoni.net>{target="_blank"}

If you spot reporting, government documents, or public statements not yet captured on the editorial observation page, please open a pull request via the edit icon at the top of that page or share in the Matrix channel.

## Further reading

* [MADLink translation index (zh-TW)](https://anoni.net/docs/reports/interseclab-madlink/){target="_blank"}: report translation entry point (Mandarin maintained in zh-TW only)
* [Editorial observation: Taiwan's response to MADLink (English summary)](https://anoni.net/docs/reports/interseclab-madlink/index_6/#English-summary-for-international-readers){target="_blank"}: our reception snapshot, English version
* [The Internet Coup — InterSecLab](https://interseclab.org/research/the-internet-coup/){target="_blank"}: the original first report in this investigative series
* [Report: The Internet Coup (anoni.net blog)](./report-the-internet-coup.md){target="_blank"}: our previous report-translation announcement
